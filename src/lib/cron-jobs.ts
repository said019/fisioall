import { prisma } from "@/lib/prisma";
import { getEvolutionClient, formatPhone, isConfigured } from "@/lib/evolution";

// ─── Recordatorios 24h antes ──────────────────────────────────────────────────
// Manda WhatsApp a citas de mañana cuyo recordatorio aún no se envió.
export async function runRecordatorios() {
  if (!isConfigured()) {
    return { skipped: true, reason: "Evolution API no configurado" } as const;
  }

  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const inicioManana = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0);
  const finManana = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59);

  const citas = await prisma.cita.findMany({
    where: {
      fechaHoraInicio: { gte: inicioManana, lte: finManana },
      estado: { in: ["confirmada", "agendada"] },
      recordatorioEnviado: { not: true },
    },
    include: {
      paciente: { select: { nombre: true, telefono: true } },
      fisioterapeuta: { select: { nombre: true, apellido: true } },
    },
  });

  const client = getEvolutionClient();
  let enviados = 0;
  let errores = 0;

  for (const cita of citas) {
    if (!cita.paciente.telefono) continue;

    const fecha = cita.fechaHoraInicio.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Mexico_City",
    });
    const hora = cita.fechaHoraInicio.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Mexico_City",
    });
    const hoyLabel = new Date().toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Mexico_City",
    });

    const mensaje = [
      `Hola ${cita.paciente.nombre} 👋`,
      ``,
      `Te recordamos tu cita de *mañana* en *Kaya Kalp*:`,
      `📅 ${fecha}`,
      `🕐 ${hora} hrs`,
      `👩‍⚕️ ${cita.fisioterapeuta.nombre} ${cita.fisioterapeuta.apellido}`,
      cita.tipoSesion ? `📋 ${cita.tipoSesion}` : null,
      cita.sala ? `🏠 ${cita.sala}` : null,
      ``,
      `*Responde con:*`,
      `1️⃣ *1* — Confirmar mi cita ✅`,
      `2️⃣ *2* — Cancelar mi cita ❌`,
      `3️⃣ *3* — Reagendar mi cita 🔄`,
      ``,
      `⏰ Puedes cancelar o reagendar *sin perder tu anticipo* antes de las *8:00 PM de hoy (${hoyLabel})*.`,
      `Después de esa hora, el anticipo de $200 no es reembolsable.`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await client.sendText(formatPhone(cita.paciente.telefono), mensaje);
      await prisma.cita.update({
        where: { id: cita.id },
        data: { recordatorioEnviado: true, recordatorioAt: new Date() },
      });
      enviados++;
    } catch (err) {
      console.error(`[Recordatorio] Error cita ${cita.id}:`, err);
      errores++;
    }
  }

  return { enviados, errores, total: citas.length } as const;
}

// ─── Anticipos vencidos + recordatorio de 12h ────────────────────────────────
export async function runAnticipos() {
  // 1. Liberar citas vencidas (anticipo no pagado en 24h)
  const vencidas = await prisma.cita.findMany({
    where: {
      estado: "pendiente_anticipo",
      anticipoVenceAt: { lte: new Date() },
    },
    select: {
      id: true,
      anticipoPagoId: true,
      paciente: { select: { nombre: true, telefono: true } },
      fechaHoraInicio: true,
    },
  });

  let liberadas = 0;

  for (const cita of vencidas) {
    await prisma.$transaction([
      prisma.cita.update({ where: { id: cita.id }, data: { estado: "cancelada" } }),
      ...(cita.anticipoPagoId
        ? [prisma.pago.update({ where: { id: cita.anticipoPagoId }, data: { estado: "reembolsado" } })]
        : []),
    ]);
    liberadas++;

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

  // 2. Recordatorio a citas con 12h+ sin pagar anticipo
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
        timeZone: "America/Mexico_City",
      });
      const hora = cita.fechaHoraInicio.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Mexico_City",
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

  return {
    liberadas,
    recordatoriosEnviados,
    totalVencidas: vencidas.length,
    totalPorVencer: porVencer.length,
  } as const;
}
