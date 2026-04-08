import { prisma } from "@/lib/prisma";
import { getEvolutionClient, formatPhone, isConfigured } from "@/lib/evolution";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isConfigured()) {
    return Response.json({ skipped: true, reason: "Evolution API no configurado" });
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
    });
    const hora = cita.fechaHoraInicio.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const hoyLabel = new Date().toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
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

  return Response.json({ enviados, errores, total: citas.length });
}
