/**
 * Kaya Kalp — Branded email templates + ICS calendar event generation
 * Sent via Resend after cita creation, confirmation, completion, etc.
 */

// ─── BRAND CONSTANTS ─────────────────────────────────────────────────────────
const BRAND = {
  name: "Kaya Kalp",
  slogan: "Dando vida a tu cuerpo",
  color: "#1e3a4f",       // dark teal from Kaya Kalp branding
  colorLight: "#4a7fa5",  // lighter accent
  colorBg: "#e8f0f6",     // soft background
  phone: "427 165 92 04",
  instagram: "@kaya_kalp21",
  facebook: "Kaya Kalp",
  address: "Av. María No. 25, Fracc. Las Huertas, Centro, San Juan del Río, Qro.",
};

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

function logoUrl(): string {
  return `${getBaseUrl()}/images/logo-kaya-kalp.webp`;
}

// ─── SHARED LAYOUT ───────────────────────────────────────────────────────────
function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.colorBg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.colorBg};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,79,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:${BRAND.color};padding:32px 40px;text-align:center;">
            <img src="${logoUrl()}" alt="Kaya Kalp" width="180" style="max-width:180px;height:auto;" />
            <p style="color:rgba(255,255,255,0.7);font-size:13px;font-style:italic;margin:8px 0 0;">${BRAND.slogan}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:${BRAND.color};padding:24px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.85);font-size:12px;margin:0 0 4px;">
              📍 ${BRAND.address}
            </p>
            <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0 0 4px;">
              📱 ${BRAND.phone} &nbsp;|&nbsp; 📸 ${BRAND.instagram} &nbsp;|&nbsp; 👍 ${BRAND.facebook}
            </p>
            <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:8px 0 0;">
              © ${new Date().getFullYear()} ${BRAND.name}. Todos los derechos reservados.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const MX_TZ = "America/Mexico_City";
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTH_NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function formatDateMX(date: Date): string {
  const d = new Date(date.toLocaleString("en-US", { timeZone: MX_TZ }));
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTimeMX(date: Date): string {
  return date.toLocaleTimeString("es-MX", { timeZone: MX_TZ, hour: "2-digit", minute: "2-digit", hour12: true });
}

function pad2(n: number): string { return n.toString().padStart(2, "0"); }

function toICSDate(date: Date): string {
  // Convert to Mexico City time then format as TZID date
  const mx = new Date(date.toLocaleString("en-US", { timeZone: MX_TZ }));
  return `${mx.getFullYear()}${pad2(mx.getMonth() + 1)}${pad2(mx.getDate())}T${pad2(mx.getHours())}${pad2(mx.getMinutes())}00`;
}

// ─── ICS CALENDAR EVENT ──────────────────────────────────────────────────────
export function generateICS(params: {
  uid: string;
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  organizerName: string;
  organizerEmail: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kaya Kalp//FisioAll//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VTIMEZONE",
    "TZID:America/Mexico_City",
    "BEGIN:STANDARD",
    "DTSTART:19701101T020000",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0600",
    "TZNAME:CST",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTART;TZID=America/Mexico_City:${toICSDate(params.start)}`,
    `DTEND;TZID=America/Mexico_City:${toICSDate(params.end)}`,
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${params.location}`,
    `ORGANIZER;CN=${params.organizerName}:mailto:${params.organizerEmail}`,
    "STATUS:CONFIRMED",
    `DTSTAMP:${toICSDate(new Date())}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Tu cita en Kaya Kalp es en 1 hora",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Recuerda tu cita mañana en Kaya Kalp",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

// ─── EMAIL: CITA AGENDADA (con evento de calendario) ─────────────────────────
export type CitaEmailData = {
  pacienteNombre: string;
  pacienteEmail: string;
  tipoSesion: string;
  fisioterapeuta: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  sala?: string | null;
  citaId: string;
  tenantNombre?: string;
};

export function buildCitaAgendadaEmail(data: CitaEmailData) {
  const fecha = formatDateMX(data.fechaHoraInicio);
  const horaInicio = formatTimeMX(data.fechaHoraInicio);
  const horaFin = formatTimeMX(data.fechaHoraFin);

  const subject = `🗓️ Tu cita en ${BRAND.name} — ${fecha}`;

  const body = `
    <h2 style="color:${BRAND.color};font-size:22px;margin:0 0 8px;">¡Hola ${data.pacienteNombre}!</h2>
    <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Tu cita ha sido agendada exitosamente. Aquí están los detalles:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.colorBg};border-radius:12px;padding:24px;margin:0 0 24px;">
      <tr><td>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color:${BRAND.colorLight};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Servicio</td>
            <td style="color:${BRAND.color};font-size:15px;font-weight:600;padding:4px 8px;">${data.tipoSesion}</td>
          </tr>
          <tr>
            <td style="color:${BRAND.colorLight};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Fecha</td>
            <td style="color:${BRAND.color};font-size:15px;font-weight:600;padding:4px 8px;">${fecha}</td>
          </tr>
          <tr>
            <td style="color:${BRAND.colorLight};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Horario</td>
            <td style="color:${BRAND.color};font-size:15px;font-weight:600;padding:4px 8px;">${horaInicio} – ${horaFin}</td>
          </tr>
          <tr>
            <td style="color:${BRAND.colorLight};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Terapeuta</td>
            <td style="color:${BRAND.color};font-size:15px;font-weight:600;padding:4px 8px;">${data.fisioterapeuta}</td>
          </tr>
          ${data.sala ? `<tr>
            <td style="color:${BRAND.colorLight};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Cubículo</td>
            <td style="color:${BRAND.color};font-size:15px;font-weight:600;padding:4px 8px;">${data.sala}</td>
          </tr>` : ""}
        </table>
      </td></tr>
    </table>

    <div style="background:#fff8e7;border-left:4px solid #e89b3f;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="color:#92400e;font-size:14px;font-weight:600;margin:0 0 4px;">💰 Anticipo requerido</p>
      <p style="color:#78350f;font-size:13px;margin:0;line-height:1.5;">
        Para confirmar tu cita, realiza una transferencia de <strong>$200 MXN</strong> dentro de las próximas 24 horas. De lo contrario, tu cita será cancelada automáticamente.
      </p>
    </div>

    <div style="background:${BRAND.colorBg};border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="color:${BRAND.color};font-size:14px;font-weight:600;margin:0 0 4px;">📋 Recuerda</p>
      <ul style="color:#4a5568;font-size:13px;margin:4px 0 0;padding-left:20px;line-height:1.8;">
        <li>Presentar tu INE</li>
        <li>Portar ropa cómoda</li>
        <li>Llegar puntual — no se recuperan tiempos perdidos</li>
        <li>Cancelación mínimo 24 hrs antes</li>
      </ul>
    </div>

    <p style="color:#4a5568;font-size:13px;text-align:center;margin:0;">
      📎 <strong>Adjuntamos un evento de calendario</strong> para que no olvides tu cita.
    </p>
  `;

  const html = emailLayout(`Cita Agendada — ${BRAND.name}`, body);

  const ics = generateICS({
    uid: `cita-${data.citaId}@kayakalp.mx`,
    summary: `${data.tipoSesion} — ${BRAND.name}`,
    description: `Cita con ${data.fisioterapeuta}\\nServicio: ${data.tipoSesion}\\n\\nRecuerda llevar tu INE y ropa cómoda.\\n\\n${BRAND.name} — ${BRAND.slogan}`,
    location: BRAND.address,
    start: data.fechaHoraInicio,
    end: data.fechaHoraFin,
    organizerName: BRAND.name,
    organizerEmail: "citas@kayakalp.mx",
  });

  return { subject, html, ics };
}

// ─── EMAIL: CITA CONFIRMADA ──────────────────────────────────────────────────
export function buildCitaConfirmadaEmail(data: CitaEmailData) {
  const fecha = formatDateMX(data.fechaHoraInicio);
  const horaInicio = formatTimeMX(data.fechaHoraInicio);

  const subject = `✅ Cita confirmada — ${fecha} a las ${horaInicio}`;

  const body = `
    <h2 style="color:${BRAND.color};font-size:22px;margin:0 0 8px;">¡Cita confirmada, ${data.pacienteNombre}!</h2>
    <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Tu anticipo ha sido recibido y tu cita está confirmada. ¡Te esperamos!
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-radius:12px;padding:24px;margin:0 0 24px;">
      <tr><td>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color:#065f46;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Servicio</td>
            <td style="color:#064e3b;font-size:15px;font-weight:600;padding:4px 8px;">${data.tipoSesion}</td>
          </tr>
          <tr>
            <td style="color:#065f46;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Fecha</td>
            <td style="color:#064e3b;font-size:15px;font-weight:600;padding:4px 8px;">${fecha}</td>
          </tr>
          <tr>
            <td style="color:#065f46;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Horario</td>
            <td style="color:#064e3b;font-size:15px;font-weight:600;padding:4px 8px;">${horaInicio}</td>
          </tr>
          <tr>
            <td style="color:#065f46;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Terapeuta</td>
            <td style="color:#064e3b;font-size:15px;font-weight:600;padding:4px 8px;">${data.fisioterapeuta}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="color:#4a5568;font-size:14px;text-align:center;">
      ¡Nos vemos pronto! 💆‍♀️
    </p>
  `;

  return { subject, html: emailLayout(`Cita Confirmada — ${BRAND.name}`, body) };
}

// ─── EMAIL: CITA COMPLETADA + ENCUESTA ──────────────────────────────────────
export function buildCitaCompletadaEmail(data: CitaEmailData & { encuestaToken?: string }) {
  const fecha = formatDateMX(data.fechaHoraInicio);
  const encuestaUrl = data.encuestaToken ? `${getBaseUrl()}/encuesta/${data.encuestaToken}` : null;

  const subject = `💚 ¡Gracias por tu visita, ${data.pacienteNombre}!`;

  const body = `
    <h2 style="color:${BRAND.color};font-size:22px;margin:0 0 8px;">¡Gracias por visitarnos, ${data.pacienteNombre}!</h2>
    <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Esperamos que tu sesión de <strong>${data.tipoSesion}</strong> del ${fecha} con ${data.fisioterapeuta} haya sido una gran experiencia.
    </p>

    ${encuestaUrl ? `
    <div style="text-align:center;margin:0 0 24px;">
      <p style="color:#4a5568;font-size:14px;margin:0 0 16px;">
        Tu opinión es muy importante para nosotras. ¿Podrías tomarte 1 minuto para decirnos cómo te fue?
      </p>
      <a href="${encuestaUrl}" style="display:inline-block;background:${BRAND.color};color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
        📝 Responder encuesta
      </a>
    </div>
    ` : ""}

    <p style="color:#4a5568;font-size:14px;text-align:center;line-height:1.6;">
      Si necesitas agendar tu próxima sesión, no dudes en contactarnos por WhatsApp al <strong>${BRAND.phone}</strong>.
    </p>
  `;

  return { subject, html: emailLayout(`Gracias por tu visita — ${BRAND.name}`, body) };
}

// ─── EMAIL: RECORDATORIO (24h antes) ─────────────────────────────────────────
export function buildRecordatorioEmail(data: CitaEmailData) {
  const fecha = formatDateMX(data.fechaHoraInicio);
  const horaInicio = formatTimeMX(data.fechaHoraInicio);

  const subject = `⏰ Recordatorio: Tu cita mañana en ${BRAND.name}`;

  const body = `
    <h2 style="color:${BRAND.color};font-size:22px;margin:0 0 8px;">¡Hola ${data.pacienteNombre}!</h2>
    <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Te recordamos que tienes una cita <strong>mañana</strong>:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.colorBg};border-radius:12px;padding:24px;margin:0 0 24px;">
      <tr><td>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="color:${BRAND.colorLight};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Servicio</td>
            <td style="color:${BRAND.color};font-size:15px;font-weight:600;padding:4px 8px;">${data.tipoSesion}</td>
          </tr>
          <tr>
            <td style="color:${BRAND.colorLight};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Fecha</td>
            <td style="color:${BRAND.color};font-size:15px;font-weight:600;padding:4px 8px;">${fecha}</td>
          </tr>
          <tr>
            <td style="color:${BRAND.colorLight};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Hora</td>
            <td style="color:${BRAND.color};font-size:15px;font-weight:600;padding:4px 8px;">${horaInicio}</td>
          </tr>
          <tr>
            <td style="color:${BRAND.colorLight};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;">Terapeuta</td>
            <td style="color:${BRAND.color};font-size:15px;font-weight:600;padding:4px 8px;">${data.fisioterapeuta}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <div style="background:${BRAND.colorBg};border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <ul style="color:#4a5568;font-size:13px;margin:0;padding-left:20px;line-height:1.8;">
        <li>Presenta tu INE</li>
        <li>Porta ropa cómoda</li>
        <li>Llega puntual</li>
      </ul>
    </div>

    <p style="color:#4a5568;font-size:14px;text-align:center;">
      ¡Te esperamos! 💆‍♀️
    </p>
  `;

  return { subject, html: emailLayout(`Recordatorio de Cita — ${BRAND.name}`, body) };
}
