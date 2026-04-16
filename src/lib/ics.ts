// Utilidades para generar archivos .ics (iCalendar).
// Formato estándar soportado por Apple Calendar, Google Calendar, Outlook, etc.

const MX_TZ = "America/Mexico_City";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Convierte una fecha a formato local México (TZID=America/Mexico_City). */
function toICSDateLocal(date: Date): string {
  const mx = new Date(date.toLocaleString("en-US", { timeZone: MX_TZ }));
  return `${mx.getFullYear()}${pad2(mx.getMonth() + 1)}${pad2(mx.getDate())}T${pad2(mx.getHours())}${pad2(mx.getMinutes())}00`;
}

/** Escapa caracteres reservados en iCalendar (RFC 5545). */
function esc(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Doblado de líneas RFC 5545: max 75 octets por línea. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length) {
    parts.push(" " + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return parts.join("\r\n");
}

export type ICSEvent = {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  organizerName?: string;
  organizerEmail?: string;
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
};

function buildVTimezone(): string[] {
  return [
    "BEGIN:VTIMEZONE",
    `TZID:${MX_TZ}`,
    "BEGIN:STANDARD",
    "DTSTART:19701101T020000",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0600",
    "TZNAME:CST",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
}

function buildVEvent(event: ICSEvent): string[] {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toICSDateLocal(new Date())}`,
    `DTSTART;TZID=${MX_TZ}:${toICSDateLocal(event.start)}`,
    `DTEND;TZID=${MX_TZ}:${toICSDateLocal(event.end)}`,
    `SUMMARY:${esc(event.summary)}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${esc(event.description)}`);
  if (event.location) lines.push(`LOCATION:${esc(event.location)}`);
  if (event.organizerName && event.organizerEmail) {
    lines.push(`ORGANIZER;CN=${esc(event.organizerName)}:mailto:${event.organizerEmail}`);
  }
  lines.push(`STATUS:${event.status ?? "CONFIRMED"}`);
  // Recordatorios
  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Cita en 1 hora",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Cita mañana",
    "END:VALARM",
  );
  lines.push("END:VEVENT");
  return lines;
}

/** Genera un VCALENDAR con 1 o más eventos. */
export function buildICS(events: ICSEvent[], calendarName?: string): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kaya Kalp//FisioAll//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  if (calendarName) {
    lines.push(`X-WR-CALNAME:${esc(calendarName)}`);
    lines.push(`X-WR-TIMEZONE:${MX_TZ}`);
  }
  lines.push(...buildVTimezone());
  for (const ev of events) lines.push(...buildVEvent(ev));
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
