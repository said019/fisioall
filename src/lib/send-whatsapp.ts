"use server";

import { getEvolutionClient, isConfigured, formatPhone } from "@/lib/evolution";

// ── Types ──────────────────────────────────────────────────────────────────

interface CitaWhatsAppData {
  pacienteNombre: string;
  pacienteTelefono: string;
  tipoSesion: string;
  fisioterapeuta: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  sala?: string | null;
  citaId: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFecha(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatHora(date: Date): string {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });
}

// ── SEND: CITA AGENDADA ──────────────────────────────────────────────────

export async function sendCitaAgendadaWhatsApp(data: CitaWhatsAppData) {
  if (!isConfigured() || !data.pacienteTelefono) return;

  const mensaje = [
    `Hola ${data.pacienteNombre} 👋`,
    ``,
    `Tu cita en *Kaya Kalp* ha sido agendada:`,
    ``,
    `📋 *${data.tipoSesion}*`,
    `📅 ${formatFecha(data.fechaHoraInicio)}`,
    `🕐 ${formatHora(data.fechaHoraInicio)} hrs`,
    `👩‍⚕️ ${data.fisioterapeuta}`,
    data.sala ? `🏠 ${data.sala}` : null,
    ``,
    `💰 *Anticipo requerido: $200 MXN*`,
    `Para confirmar tu cita, realiza tu anticipo por transferencia en las próximas 24 horas.`,
    ``,
    `📍 Av. María No. 25, San Juan del Río, Qro.`,
    ``,
    `¿Dudas? Escríbenos aquí mismo 💬`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getEvolutionClient();
    await client.sendText(formatPhone(data.pacienteTelefono), mensaje);
  } catch (err) {
    console.error("[WhatsApp] Cita agendada failed:", err);
  }
}

// ── SEND: ANTICIPO CONFIRMADO ────────────────────────────────────────────

export async function sendAnticipoConfirmadoWhatsApp(data: CitaWhatsAppData) {
  if (!isConfigured() || !data.pacienteTelefono) return;

  const mensaje = [
    `✅ *¡Anticipo confirmado, ${data.pacienteNombre}!*`,
    ``,
    `Tu cita queda confirmada:`,
    `📋 *${data.tipoSesion}*`,
    `📅 ${formatFecha(data.fechaHoraInicio)}`,
    `🕐 ${formatHora(data.fechaHoraInicio)} hrs`,
    `👩‍⚕️ ${data.fisioterapeuta}`,
    data.sala ? `🏠 ${data.sala}` : null,
    ``,
    `📍 Av. María No. 25, San Juan del Río, Qro.`,
    ``,
    `*Recuerda:*`,
    `• Llega 5 min antes de tu cita`,
    `• Puedes cancelar sin cargo antes de las 8:00 PM del día anterior`,
    ``,
    `¡Te esperamos! 💆‍♀️`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getEvolutionClient();
    await client.sendText(formatPhone(data.pacienteTelefono), mensaje);
  } catch (err) {
    console.error("[WhatsApp] Anticipo confirmado failed:", err);
  }
}

// ── SEND: CITA COMPLETADA + ENCUESTA ─────────────────────────────────────

export async function sendCitaCompletadaWhatsApp(
  data: CitaWhatsAppData & { encuestaToken?: string },
) {
  if (!isConfigured() || !data.pacienteTelefono) return;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const lines = [
    `Hola ${data.pacienteNombre} 💆‍♀️`,
    ``,
    `¡Gracias por tu visita a *Kaya Kalp*!`,
    ``,
    `Esperamos que tu sesión de *${data.tipoSesion}* con ${data.fisioterapeuta} haya sido de tu agrado.`,
  ];

  if (data.encuestaToken) {
    lines.push(
      ``,
      `📝 Nos encantaría conocer tu opinión (1 min):`,
      `👉 ${baseUrl}/encuesta/${data.encuestaToken}`,
    );
  }

  lines.push(
    ``,
    `¡Esperamos verte pronto! ✨`,
  );

  try {
    const client = getEvolutionClient();
    await client.sendText(formatPhone(data.pacienteTelefono), lines.join("\n"));
  } catch (err) {
    console.error("[WhatsApp] Cita completada failed:", err);
  }
}

// ── SEND: RECORDATORIO 24h ───────────────────────────────────────────────

export async function sendRecordatorioWhatsApp(data: CitaWhatsAppData) {
  if (!isConfigured() || !data.pacienteTelefono) return;

  const mensaje = [
    `Hola ${data.pacienteNombre} 👋`,
    ``,
    `Te recordamos tu cita *mañana* en *Kaya Kalp*:`,
    ``,
    `📋 *${data.tipoSesion}*`,
    `📅 ${formatFecha(data.fechaHoraInicio)}`,
    `🕐 ${formatHora(data.fechaHoraInicio)} hrs`,
    `👩‍⚕️ ${data.fisioterapeuta}`,
    data.sala ? `🏠 ${data.sala}` : null,
    ``,
    `📍 Av. María No. 25, San Juan del Río, Qro.`,
    ``,
    `Responde:`,
    `1️⃣ *1* — Confirmar asistencia`,
    `2️⃣ *2* — Cancelar`,
    `3️⃣ *3* — Reagendar`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getEvolutionClient();
    await client.sendText(formatPhone(data.pacienteTelefono), mensaje);
  } catch (err) {
    console.error("[WhatsApp] Recordatorio failed:", err);
  }
}
