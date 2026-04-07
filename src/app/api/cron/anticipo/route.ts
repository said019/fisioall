import { prisma } from "@/lib/prisma";
import { getEvolutionClient, formatPhone, isConfigured } from "@/lib/evolution";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 1. Liberar citas vencidas (anticipo no pagado en 24h)
  const vencidas = await prisma.cita.findMany({
    where: {
      estado: "pendiente_anticipo",
      anticipoVenceAt: { lte: new Date() },
    },
    select: {
      id: true,
      anticipoPagoId: true,
      pacienteId: true,
      tenantId: true,
      paciente: { select: { nombre: true, telefono: true } },
      fechaHoraInicio: true,
      fisioterapeuta: { select: { nombre: true, apellido: true } },
      tipoSesion: true,
      sala: true,
    },
  });

  let liberadas = 0;

  for (const cita of vencidas) {
    await prisma.$transaction([
      prisma.cita.update({
        where: { id: cita.id },
        data: { estado: "cancelada" },
      }),
      ...(cita.anticipoPagoId
        ? [
            prisma.pago.update({
              where: { id: cita.anticipoPagoId },
              data: { estado: "reembolsado" },
            }),
          ]
        : []),
    ]);
    liberadas++;

    // Best-effort WhatsApp notification
    if (isConfigured() && cita.paciente.telefono) {
      try {
        const client = getEvolutionClient();
        const mensaje = [
          `Hola ${cita.paciente.nombre} 👋`,
          ``,
          `Tu cita en *Kaya Kalp* fue cancelada porque no recibimos el anticipo de *$200 MXN* a tiempo.`,
          ``,
          `Si deseas reagendar, contáctanos. ¡Con gusto te ayudamos! 💙`,
        ].join("\n");
        await client.sendText(formatPhone(cita.paciente.telefono), mensaje);
      } catch (err) {
        console.error(`[Anticipo Cron] WhatsApp error cita ${cita.id}:`, err);
      }
    }
  }

  // 2. Enviar recordatorio a citas con 12h+ sin confirmar
  const doceHorasAtras = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const porVencer = await prisma.cita.findMany({
    where: {
      estado: "pendiente_anticipo",
      anticipoVenceAt: { gt: new Date() },
      createdAt: { lte: doceHorasAtras },
      recordatorioEnviado: { not: true },
    },
    select: {
      id: true,
      paciente: { select: { nombre: true, telefono: true } },
      fechaHoraInicio: true,
    },
  });

  let recordatoriosEnviados = 0;

  if (isConfigured()) {
    const client = getEvolutionClient();
    for (const cita of porVencer) {
      if (!cita.paciente.telefono) continue;

      const fecha = cita.fechaHoraInicio.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const hora = cita.fechaHoraInicio.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const mensaje = [
        `Hola ${cita.paciente.nombre} 👋`,
        ``,
        `Notamos que tu cita del *${fecha}* a las *${hora}* aún tiene el anticipo pendiente de *$200 MXN*.`,
        ``,
        `Para confirmar tu lugar, realiza el pago y envíanos el comprobante.`,
        `Si no recibimos el anticipo en las próximas *12 horas*, el slot se liberará automáticamente.`,
        ``,
        `¿Necesitas ayuda? Escríbenos aquí mismo. 💙`,
      ].join("\n");

      try {
        await client.sendText(formatPhone(cita.paciente.telefono), mensaje);
        recordatoriosEnviados++;
      } catch (err) {
        console.error(`[Anticipo Cron] Recordatorio error cita ${cita.id}:`, err);
      }
    }
  }

  return Response.json({
    liberadas,
    recordatoriosEnviados,
    totalVencidas: vencidas.length,
    totalPorVencer: porVencer.length,
  });
}
