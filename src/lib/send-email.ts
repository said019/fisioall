"use server";

import { getResend } from "@/lib/resend";
import {
  buildCitaAgendadaEmail,
  buildCitaConfirmadaEmail,
  buildCitaCompletadaEmail,
  buildRecordatorioEmail,
  type CitaEmailData,
} from "@/lib/emails";

const FROM = "Kaya Kalp <citas@kayakalp.mx>";

// ─── SEND: CITA AGENDADA (with .ics calendar attachment) ─────────────────────
export async function sendCitaAgendadaEmail(data: CitaEmailData) {
  const resend = getResend();
  if (!resend || !data.pacienteEmail) return;

  const { subject, html, ics } = buildCitaAgendadaEmail(data);

  try {
    await resend.emails.send({
      from: FROM,
      to: data.pacienteEmail,
      subject,
      html,
      headers: {
        "Content-Type": "multipart/mixed",
      },
      attachments: [
        {
          filename: "invite.ics",
          content: Buffer.from(ics),
          contentType: "text/calendar; charset=utf-8; method=REQUEST",
        },
      ],
    });
  } catch (err) {
    console.error("[Email] Cita agendada failed:", err);
  }
}

// ─── SEND: CITA CONFIRMADA ──────────────────────────────────────────────────
export async function sendCitaConfirmadaEmail(data: CitaEmailData) {
  const resend = getResend();
  if (!resend || !data.pacienteEmail) return;

  const { subject, html } = buildCitaConfirmadaEmail(data);

  try {
    await resend.emails.send({ from: FROM, to: data.pacienteEmail, subject, html });
  } catch (err) {
    console.error("[Email] Cita confirmada failed:", err);
  }
}

// ─── SEND: CITA COMPLETADA + ENCUESTA ────────────────────────────────────────
export async function sendCitaCompletadaEmail(data: CitaEmailData & { encuestaToken?: string }) {
  const resend = getResend();
  if (!resend || !data.pacienteEmail) return;

  const { subject, html } = buildCitaCompletadaEmail(data);

  try {
    await resend.emails.send({ from: FROM, to: data.pacienteEmail, subject, html });
  } catch (err) {
    console.error("[Email] Cita completada failed:", err);
  }
}

// ─── SEND: RECORDATORIO 24h ─────────────────────────────────────────────────
export async function sendRecordatorioEmail(data: CitaEmailData) {
  const resend = getResend();
  if (!resend || !data.pacienteEmail) return;

  const { subject, html } = buildRecordatorioEmail(data);

  try {
    await resend.emails.send({ from: FROM, to: data.pacienteEmail, subject, html });
  } catch (err) {
    console.error("[Email] Recordatorio failed:", err);
  }
}
