// ---------------------------------------------------------------------------
// Webhook endpoint for Evolution API events
// POST /api/webhook/evolution
// Public – no auth required. Must always return 200.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEvolutionClient, formatPhone, isConfigured } from "@/lib/evolution";
import { randomBytes } from "crypto";

const TENANT_SLUG = "kaya-kalp";

// ── Types ──────────────────────────────────────────────────────────────────

interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface MessageData {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message?: {
    conversation?: string;
    extendedTextMessage?: { text: string };
    pollUpdateMessage?: Record<string, unknown>;
  };
  pushName?: string;
  messageTimestamp?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Extract phone digits from a WhatsApp JID like 521234567890@s.whatsapp.net */
function jidToPhone(jid: string): string {
  return jid.replace("@s.whatsapp.net", "").replace("@c.us", "");
}

/** Check if cancellation is within the free window (before 8pm the day before) */
function dentroDeVentana(fechaCita: Date): boolean {
  const ahora = new Date();
  // 8pm del día anterior a la cita
  const limite = new Date(fechaCita);
  limite.setDate(limite.getDate() - 1);
  limite.setHours(20, 0, 0, 0);
  return ahora < limite;
}

/** Normaliza un texto: lowercase, sin acentos, sin signos de puntuación, sin espacios extra. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^\w\s]/g, " ") // quita puntuación
    .replace(/\s+/g, " ")
    .trim();
}

/** Identifica la intención del paciente: "confirmar" | "cancelar" | "reagendar" | null */
function detectarIntencion(texto: string): "confirmar" | "cancelar" | "reagendar" | null {
  const t = normalizar(texto);

  // Detecciones por emoji o número solo (sin normalizar, en texto original)
  if (/3\u20e3/.test(texto) || /\ud83d\udd04/.test(texto) /* 🔄 */) return "reagendar";
  if (/2\u20e3/.test(texto) || /\u274c/.test(texto) /* ❌ */) return "cancelar";
  if (/1\u20e3/.test(texto) || /\u2705/.test(texto) /* ✅ */) return "confirmar";

  if (!t) return null;

  // Match de palabras completas (regex \b) para evitar falsos positivos
  const has = (palabras: string[]) =>
    palabras.some((p) => new RegExp(`\\b${p}\\b`, "i").test(t));

  // ── REAGENDAR ──
  const reagendarKw = [
    "3", "tres",
    "reagendar", "reagendo", "reagenda", "reagende", "reagendarme", "reagendarla",
    "cambiar", "cambio", "cambiarla", "cambiarme", "cambiarlo",
    "mover", "muevo", "moverla", "moverlo",
    "posponer", "pospongo", "pospondre",
    "diferente", "distinto",
    "reprogramar", "reprogramo",
  ];
  if (has(reagendarKw) || /\botra\s+(fecha|hora|d[ií]a|cita)\b/i.test(t) || /\bnuev[oa]\s+(fecha|hora|d[ií]a|cita)\b/i.test(t)) {
    return "reagendar";
  }

  // ── CANCELAR ──
  const cancelarKw = [
    "2", "dos",
    "cancelar", "cancela", "cancelo", "cancele", "cancelarla", "cancelarme", "cancelarlo",
    "anular", "anulo", "anularla",
    "no", "nop", "nope", "nel",
    "quitar", "quitarla", "quitarme", "quitarlo",
    "borrar", "borrarla", "borrarlo",
    "eliminar",
  ];
  if (
    has(cancelarKw) ||
    /\bn[oó]+\b/i.test(t) /* "no", "nooo" */ ||
    /\bya\s+no\b/i.test(t) ||
    /\bno\s+(puedo|podre|voy|ire|asistir[ée])\b/i.test(t)
  ) {
    return "cancelar";
  }

  // ── CONFIRMAR ──
  const confirmarKw = [
    "1", "uno",
    "yes", "yep", "yeah", "yup",
    "ok", "okay", "oki", "okey",
    "vale", "va", "dale", "perfecto", "listo", "claro",
    "asisto", "asistire", "asistir", "voy", "ire", "ahi",
    "confirmar", "confirmo", "confirma", "confirme",
    "confirmarla", "confirmarlo", "confirmada", "confirmado",
    "seguro", "seguros",
  ];
  if (
    has(confirmarKw) ||
    /\bs[ií]+\b/i.test(t) /* "si", "sii", "siiii", "sí" */ ||
    /\bclaro\s+que\s+s[ií]\b/i.test(t)
  ) {
    return "confirmar";
  }

  return null;
}

// ── Patient response handler ──────────────────────────────────────────────

async function handlePatientResponse(phone: string, text: string, pushName?: string) {
  if (!isConfigured()) return;

  const digits = phone.replace(/\D/g, "");
  const last10 = digits.slice(-10);

  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return;

  // Find patient by phone
  const paciente = await prisma.paciente.findFirst({
    where: {
      tenantId: tenant.id,
      OR: [
        { telefono: { contains: last10 } },
        { whatsapp: { contains: last10 } },
      ],
    },
  });

  if (!paciente) {
    console.log(`[Webhook] No patient found for phone ${last10}`);
    return;
  }

  // Find the next upcoming cita (any active state, not just reminders)
  const cita = await prisma.cita.findFirst({
    where: {
      pacienteId: paciente.id,
      tenantId: tenant.id,
      estado: { in: ["agendada", "confirmada", "pendiente_anticipo"] },
      fechaHoraInicio: { gte: new Date() },
    },
    orderBy: { fechaHoraInicio: "asc" },
    include: {
      fisioterapeuta: { select: { nombre: true, apellido: true } },
    },
  });

  if (!cita) {
    console.log(`[Webhook] No pending cita for patient ${paciente.id}`);
    return;
  }

  const intencion = detectarIntencion(text);
  const client = getEvolutionClient();
  const jid = formatPhone(phone);

  // ── CONFIRMAR (1, sí, ok, confirmo, ✅, etc) ──
  if (intencion === "confirmar") {
    // Update estado to confirmada + mark patient confirmed
    const updateData: Record<string, unknown> = { confirmadaPaciente: true };
    if (cita.estado === "agendada" || cita.estado === "pendiente_anticipo") {
      updateData.estado = "confirmada";
    }

    await prisma.cita.update({
      where: { id: cita.id },
      data: updateData,
    });

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

    await client.sendText(
      jid,
      [
        `✅ ¡Perfecto, ${paciente.nombre}!`,
        ``,
        `Tu cita queda *confirmada*:`,
        `📋 *${cita.tipoSesion ?? "Sesión"}*`,
        `📅 ${fecha}`,
        `🕐 ${hora} hrs`,
        `👩‍⚕️ ${cita.fisioterapeuta.nombre} ${cita.fisioterapeuta.apellido}`,
        ``,
        `📍 Av. María No. 25, San Juan del Río, Qro.`,
        ``,
        `*Recuerda:*`,
        `• Llega 5 min antes de tu cita`,
        `• Puedes cancelar sin cargo antes de las 8:00 PM del día anterior`,
        ``,
        `¡Te esperamos en *Kaya Kalp*! 💆‍♀️`,
      ].join("\n"),
    );

    // Update Google Calendar color to green (confirmada)
    if (cita.googleEventId) {
      try {
        const { updateCalendarEvent } = await import("@/lib/google-calendar");
        await updateCalendarEvent(tenant.id, cita.googleEventId, { estado: "confirmada" });
      } catch (gcalErr) {
        console.error("[GCal] Color update on confirm:", gcalErr);
      }
    }

    console.log(`[Webhook] Cita ${cita.id} confirmada por paciente vía WhatsApp`);
    return;
  }

  // ── CANCELAR (2, no, cancelar, anular, etc) ──
  if (intencion === "cancelar") {
    const enVentana = dentroDeVentana(cita.fechaHoraInicio);
    const tienAnticipo = cita.anticipoPagado === true;

    if (enVentana && tienAnticipo) {
      // Cancelar dentro de ventana con anticipo pagado → devolver saldo
      await prisma.$transaction([
        prisma.cita.update({
          where: { id: cita.id },
          data: { estado: "cancelada" },
        }),
        prisma.paciente.update({
          where: { id: paciente.id },
          data: { anticipoSaldo: { increment: 200 } },
        }),
      ]);

      await client.sendText(
        jid,
        [
          `❌ Tu cita ha sido *cancelada*, ${paciente.nombre}.`,
          ``,
          `Tu anticipo de *$200 MXN* se conserva como saldo a favor para tu próxima cita.`,
          ``,
          `Para agendar de nuevo, comunícate con nosotros 🙌`,
          `📞 427 165 92 04`,
        ].join("\n"),
      );

      console.log(`[Webhook] Cita ${cita.id} cancelada EN ventana — anticipo a saldo`);
    } else if (!enVentana && tienAnticipo) {
      // Cancelar fuera de ventana con anticipo → anticipo perdido
      await prisma.cita.update({
        where: { id: cita.id },
        data: { estado: "cancelada" },
      });

      await client.sendText(
        jid,
        [
          `❌ Tu cita ha sido *cancelada*, ${paciente.nombre}.`,
          ``,
          `⚠️ Lamentablemente, el anticipo de *$200 MXN* no es reembolsable ya que la cancelación fue después de las 8:00 PM del día anterior.`,
          ``,
          `Para futuras citas, recuerda cancelar antes de las 8:00 PM del día previo para conservar tu anticipo.`,
        ].join("\n"),
      );

      console.log(`[Webhook] Cita ${cita.id} cancelada FUERA de ventana — anticipo perdido`);
    } else {
      // Cancelar sin anticipo pagado (pendiente_anticipo)
      await prisma.cita.update({
        where: { id: cita.id },
        data: { estado: "cancelada" },
      });

      await client.sendText(
        jid,
        [
          `❌ Tu cita ha sido *cancelada*, ${paciente.nombre}.`,
          ``,
          `Para agendar de nuevo, comunícate con nosotros:`,
          `📞 427 165 92 04`,
        ].join("\n"),
      );

      console.log(`[Webhook] Cita ${cita.id} cancelada — sin anticipo`);
    }

    // Delete Google Calendar event if exists
    if (cita.googleEventId) {
      try {
        const { deleteCalendarEvent } = await import("@/lib/google-calendar");
        await deleteCalendarEvent(cita.tenantId, cita.googleEventId);
      } catch (gcalErr) {
        console.error("[GCal] Delete on WhatsApp cancel:", gcalErr);
      }
    }

    return;
  }

  // ── REAGENDAR (3, cambiar, mover, posponer, etc) ──
  if (intencion === "reagendar") {
    const enVentana = dentroDeVentana(cita.fechaHoraInicio);

    if (!enVentana) {
      await client.sendText(
        jid,
        [
          `⚠️ Lo sentimos, ${paciente.nombre}.`,
          ``,
          `El plazo para reagendar sin cargo ya pasó (8:00 PM del día anterior).`,
          ``,
          `Si deseas cancelar y agendar una nueva cita, responde *2*. Ten en cuenta que el anticipo de $200 no será reembolsable.`,
        ].join("\n"),
      );
      return;
    }

    // Generate token for reagendar page
    const token = randomBytes(32).toString("hex");

    await prisma.cita.update({
      where: { id: cita.id },
      data: {
        reagendarToken: token,
        reagendarTokenAt: new Date(),
        sinCargoReagendar: true,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const reagendarUrl = `${baseUrl}/reagendar?token=${token}`;

    await client.sendText(
      jid,
      [
        `🔄 ¡Claro, ${paciente.nombre}!`,
        ``,
        `Usa este enlace para elegir tu nuevo horario:`,
        `👉 ${reagendarUrl}`,
        ``,
        `⏰ El enlace es válido por *2 horas*.`,
        `Tu anticipo de $200 se conserva para la nueva fecha.`,
      ].join("\n"),
    );

    console.log(`[Webhook] Cita ${cita.id} — token reagendar generado`);
    return;
  }

  // Mensaje no reconocido — enviamos ayuda solo si parece relacionado con la cita
  // (para no spamear al paciente cada vez que escribe algo no relacionado).
  const t = normalizar(text);
  const parecaCita = /\b(cita|hora|horario|fecha|agenda|sesion|sesi[oó]n|kaya|comprobante|pago|anticipo)\b/i.test(t);
  if (parecaCita) {
    await client.sendText(
      jid,
      [
        `Hola ${paciente.nombre} 👋`,
        ``,
        `Para gestionar tu cita responde con:`,
        `1️⃣ *1* — Confirmar`,
        `2️⃣ *2* — Cancelar`,
        `3️⃣ *3* — Reagendar`,
        ``,
        `(También funcionan palabras como *sí*, *no*, *cambiar*, etc.)`,
      ].join("\n"),
    );
  }
}

// ── Handlers ───────────────────────────────────────────────────────────────

function handleConnectionUpdate(instance: string, data: Record<string, unknown>) {
  const state = data.state ?? data.status;
  console.log(`[Evolution][${instance}] connection.update → ${state}`);
}

function handleQRCodeUpdated(instance: string, data: Record<string, unknown>) {
  console.log(
    `[Evolution][${instance}] qrcode.updated → count: ${data.count ?? "?"}`,
  );
}

async function handleMessagesUpsert(instance: string, data: Record<string, unknown>) {
  const messages = (data.messages ?? data) as MessageData[] | MessageData;
  const list = Array.isArray(messages) ? messages : [messages];

  for (const msg of list) {
    const from = msg.key?.remoteJid ?? "unknown";
    const fromMe = msg.key?.fromMe ?? false;

    // Skip our own outgoing messages
    if (fromMe) continue;

    // Skip group messages
    if (from.includes("@g.us")) continue;

    // -- Poll response detection --
    if (msg.message?.pollUpdateMessage) {
      console.log(
        `[Evolution][${instance}] poll response from ${from}:`,
        JSON.stringify(msg.message.pollUpdateMessage),
      );
      continue;
    }

    // -- Text message --
    const text =
      msg.message?.conversation ??
      msg.message?.extendedTextMessage?.text;

    if (text) {
      console.log(
        `[Evolution][${instance}] text from ${from} (${msg.pushName ?? "?"}): ${text}`,
      );

      // Process patient response (1, 2, 3)
      const phone = jidToPhone(from);
      try {
        await handlePatientResponse(phone, text, msg.pushName ?? undefined);
      } catch (err) {
        console.error(`[Webhook] Error handling response from ${phone}:`, err);
      }
    }
  }
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EvolutionWebhookPayload;
    const { event, instance, data } = body;

    switch (event) {
      case "connection.update":
        handleConnectionUpdate(instance, data);
        break;
      case "qrcode.updated":
        handleQRCodeUpdated(instance, data);
        break;
      case "messages.upsert":
        await handleMessagesUpsert(instance, data);
        break;
      default:
        console.log(`[Evolution][${instance}] unhandled event: ${event}`);
    }
  } catch (err) {
    // Log but never fail – webhooks must return 200
    console.error("[Evolution] webhook error:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
