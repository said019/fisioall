import { prisma } from "@/lib/prisma";
import { getEvolutionClient, formatPhone, isConfigured } from "@/lib/evolution";

function waPhone(p: { telefono: string | null; telefonoContacto?: string | null }): string | null {
  return p.telefonoContacto || p.telefono || null;
}

// ─── HORARIO HÁBIL CDMX (9 AM – 9 PM) ────────────────────────────────────────
// Ningún mensaje automático sale fuera de este rango.
const HORA_INICIO_CDMX = 9;   // 9 AM
const HORA_FIN_CDMX = 21;     // 21:00 = 9 PM (no envía a partir de las 21:00)

function horaActualCDMX(): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = partes.find((p) => p.type === "hour")?.value ?? "0";
  const n = Number(h);
  return n === 24 ? 0 : n;
}

export function dentroDeHorarioHabil(): boolean {
  const h = horaActualCDMX();
  return h >= HORA_INICIO_CDMX && h < HORA_FIN_CDMX;
}

// ─── Recordatorios 24h antes ──────────────────────────────────────────────────
// Manda WhatsApp a citas de mañana (en CDMX) cuyo recordatorio aún no se envió.
export async function runRecordatorios() {
  if (!isConfigured()) {
    return { skipped: true, reason: "Evolution API no configurado" } as const;
  }

  if (!dentroDeHorarioHabil()) {
    return {
      skipped: true,
      reason: `fuera de horario hábil (${horaActualCDMX()}h CDMX)`,
    } as const;
  }

  // Rango "mañana en CDMX" (UTC-6): [mañana 06:00 UTC, día siguiente 06:00 UTC)
  const inicioManana = new Date();
  inicioManana.setUTCDate(inicioManana.getUTCDate() + 1);
  inicioManana.setUTCHours(6, 0, 0, 0);
  const finManana = new Date(inicioManana);
  finManana.setUTCDate(finManana.getUTCDate() + 1);

  const citas = await prisma.cita.findMany({
    where: {
      fechaHoraInicio: { gte: inicioManana, lt: finManana },
      estado: { in: ["confirmada", "agendada"] },
      recordatorioEnviado: { not: true },
    },
    include: {
      paciente: { select: { nombre: true, telefono: true, telefonoContacto: true } },
      fisioterapeuta: { select: { nombre: true, apellido: true } },
    },
  });

  const client = getEvolutionClient();
  let enviados = 0;
  let errores = 0;

  for (const cita of citas) {
    const telefono = waPhone(cita.paciente);
    if (!telefono) continue;

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
      await client.sendText(formatPhone(telefono), mensaje);
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

// ─── Recordatorios de anticipo pendiente ─────────────────────────────────────
// Política:
//   - 1er recordatorio: 12h después de creada la cita (si sigue sin pagar).
//   - Recordatorios subsiguientes: cada 6h después del último.
//   - Solo se envían dentro del horario hábil (9 AM – 9 PM CDMX).
//   - No se auto-cancela la cita por anticipo vencido. Sigue mandando hasta
//     que el admin apruebe el pago o cancele manualmente.
export async function runAnticipos() {
  if (!isConfigured()) {
    return { recordatoriosEnviados: 0, total: 0, skipped: true } as const;
  }

  if (!dentroDeHorarioHabil()) {
    return {
      recordatoriosEnviados: 0,
      total: 0,
      skipped: true,
      reason: `fuera de horario hábil (${horaActualCDMX()}h CDMX)`,
    } as const;
  }

  const ahora = new Date();
  const HACE_12H = new Date(ahora.getTime() - 12 * 60 * 60 * 1000);
  const HACE_6H  = new Date(ahora.getTime() - 6  * 60 * 60 * 1000);

  // Citas pendientes de anticipo que califican para un recordatorio:
  //   a) Nunca se les envió y la cita lleva ≥12h creada, O
  //   b) Ya se les envió uno y han pasado ≥6h desde el último.
  const candidatas = await prisma.cita.findMany({
    where: {
      estado: "pendiente_anticipo",
      OR: [
        { recordatorioEnviado: { not: true }, createdAt: { lte: HACE_12H } },
        { recordatorioEnviado: true, recordatorioAt: { lte: HACE_6H } },
      ],
    },
    select: {
      id: true,
      paciente: { select: { nombre: true, telefono: true, telefonoContacto: true } },
      fechaHoraInicio: true,
      recordatorioEnviado: true,
    },
  });

  const client = getEvolutionClient();
  let recordatoriosEnviados = 0;

  for (const cita of candidatas) {
    const tel = waPhone(cita.paciente);
    if (!tel) continue;

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
      `Tu cita del *${fecha}* a las *${hora}* en *Kaya Kalp* sigue con el anticipo pendiente de *$200 MXN*.`,
      ``,
      `Para confirmar tu lugar, realiza el pago y envíanos el comprobante por aquí.`,
      ``,
      `¿Necesitas ayuda? Escríbenos. 💙`,
    ].join("\n");

    try {
      await client.sendText(formatPhone(tel), mensaje);
      await prisma.cita.update({
        where: { id: cita.id },
        data: { recordatorioEnviado: true, recordatorioAt: ahora },
      });
      recordatoriosEnviados++;
    } catch (err) {
      console.error(`[Anticipo Cron] Recordatorio error cita ${cita.id}:`, err);
    }
  }

  return { recordatoriosEnviados, total: candidatas.length } as const;
}

// ─── Auto-completar citas pasadas + enviar encuesta NPS ──────────────────────
// Marca como "completada" citas cuyo fechaHoraFin pasó hace >=15 min,
// y dispara el envío de encuesta de satisfacción por WhatsApp.
export async function runAutoCompletar() {
  const quinceMinAtras = new Date(Date.now() - 15 * 60 * 1000);

  const pendientes = await prisma.cita.findMany({
    where: {
      estado: { in: ["confirmada", "agendada", "en_curso"] },
      fechaHoraFin: { lte: quinceMinAtras },
    },
    include: {
      paciente: { select: { id: true, nombre: true, apellido: true, email: true, telefono: true, telefonoContacto: true } },
      fisioterapeuta: { select: { nombre: true, apellido: true } },
    },
  });

  let completadas = 0;
  let encuestasEnviadas = 0;

  for (const cita of pendientes) {
    try {
      await prisma.cita.update({
        where: { id: cita.id },
        data: { estado: "completada" },
      });
      completadas++;

      // Crear encuesta — si estamos fuera de horario hábil, crearEncuesta
      // crea el registro pero pospone el envío de WhatsApp hasta el sweep.
      try {
        const { crearEncuesta } = await import("@/app/dashboard/encuestas/actions");
        const result = await crearEncuesta(cita.id, { fromCron: true });
        if (result && "ok" in result && result.ok && !("deferida" in result)) {
          encuestasEnviadas++;
        }
      } catch (encErr) {
        console.error(`[AutoCompletar] Encuesta error cita ${cita.id}:`, encErr);
      }
    } catch (err) {
      console.error(`[AutoCompletar] Error cita ${cita.id}:`, err);
    }
  }

  return { completadas, encuestasEnviadas, total: pendientes.length } as const;
}

// ─── Sweep de encuestas diferidas (creadas con enviadaAt: null) ──────────────
// Envía el WhatsApp de las encuestas que se crearon fuera de horario hábil.
// Solo actúa dentro del horario hábil (9 AM – 9 PM CDMX).
export async function runEncuestasPendientes() {
  if (!isConfigured()) {
    return { enviadas: 0, total: 0, skipped: true } as const;
  }
  if (!dentroDeHorarioHabil()) {
    return {
      enviadas: 0,
      total: 0,
      skipped: true,
      reason: `fuera de horario hábil (${horaActualCDMX()}h CDMX)`,
    } as const;
  }

  const pendientes = await prisma.encuestaSesion.findMany({
    where: { enviadaAt: null, respondida: { not: true } },
    select: {
      id: true,
      token: true,
      paciente: { select: { nombre: true, telefono: true, telefonoContacto: true } },
      cita: {
        select: {
          fechaHoraInicio: true,
          tenant: { select: { nombre: true } },
        },
      },
    },
  });

  let enviadas = 0;
  const client = getEvolutionClient();
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.kayakalp.com.mx");

  for (const e of pendientes) {
    const tel = waPhone(e.paciente);
    if (!tel) continue;
    const fecha = e.cita.fechaHoraInicio.toLocaleDateString("es-MX", {
      weekday: "long", day: "numeric", month: "long",
      timeZone: "America/Mexico_City",
    });
    const hora = e.cita.fechaHoraInicio.toLocaleTimeString("es-MX", {
      hour: "2-digit", minute: "2-digit",
      timeZone: "America/Mexico_City",
    });
    const surveyUrl = `${baseUrl}/encuesta/${e.token}`;
    const msg =
      `¡Hola ${e.paciente.nombre}! 😊\n\n` +
      `Gracias por tu sesión del *${fecha}* a las *${hora}* en *${e.cita.tenant?.nombre ?? "Kaya Kalp"}*. ` +
      `Nos importa saber cómo te sientes.\n\n` +
      `Por favor, tómate 1 minuto para responder nuestra breve encuesta:\n` +
      `👉 ${surveyUrl}\n\n` +
      `Tu opinión nos ayuda a mejorar. ¡Muchas gracias!`;
    try {
      await client.sendText(formatPhone(tel), msg);
      await prisma.encuestaSesion.update({
        where: { id: e.id },
        data: { enviadaAt: new Date() },
      });
      enviadas++;
    } catch (err) {
      console.error(`[EncuestasPendientes] error encuesta ${e.id}:`, err);
    }
  }

  return { enviadas, total: pendientes.length } as const;
}
