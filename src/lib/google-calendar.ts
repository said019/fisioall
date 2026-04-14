import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// ─────────────────────────────────────────────────────────────────────────────
// OAuth2 Client
// ─────────────────────────────────────────────────────────────────────────────

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth URL — generates the Google consent URL
// ─────────────────────────────────────────────────────────────────────────────

export function getAuthUrl(tenantId: string): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: tenantId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Handle OAuth Callback — exchange code for tokens and store them
// ─────────────────────────────────────────────────────────────────────────────

export async function handleCallback(code: string, tenantId: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error("No se recibió refresh_token. Revoca el acceso en tu cuenta de Google e intenta de nuevo.");
  }

  client.setCredentials(tokens);

  // Get user email
  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const { data } = await oauth2.userinfo.get();

  await prisma.googleCalendarToken.upsert({
    where: { tenantId },
    create: {
      tenantId,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      tokenExpiry: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
      email: data.email ?? null,
    },
    update: {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      tokenExpiry: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
      email: data.email ?? null,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Get authenticated client (auto-refreshes expired tokens)
// ─────────────────────────────────────────────────────────────────────────────

async function getAuthenticatedClient(tenantId: string) {
  const token = await prisma.googleCalendarToken.findUnique({
    where: { tenantId },
  });

  if (!token) return null;

  const client = getOAuth2Client();
  client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.tokenExpiry.getTime(),
  });

  // Auto-refresh if expired
  if (token.tokenExpiry.getTime() < Date.now() + 60_000) {
    try {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);

      await prisma.googleCalendarToken.update({
        where: { tenantId },
        data: {
          accessToken: credentials.access_token!,
          tokenExpiry: new Date(credentials.expiry_date ?? Date.now() + 3600 * 1000),
        },
      });
    } catch (error) {
      console.error("[GCal] Error refreshing token:", error);
      return null;
    }
  }

  return client;
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Calendar Event
// ─────────────────────────────────────────────────────────────────────────────

interface CitaForCalendar {
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  pacienteNombre: string;
  pacienteTelefono: string;
  tipoSesion: string;
}

export async function createCalendarEvent(
  tenantId: string,
  cita: CitaForCalendar
): Promise<string | null> {
  try {
    const auth = await getAuthenticatedClient(tenantId);
    if (!auth) return null;

    const calendar = google.calendar({ version: "v3", auth });

    const token = await prisma.googleCalendarToken.findUnique({
      where: { tenantId },
      select: { calendarId: true },
    });

    const event = await calendar.events.insert({
      calendarId: token?.calendarId ?? "primary",
      requestBody: {
        summary: `${cita.tipoSesion} — ${cita.pacienteNombre}`,
        description: [
          `Paciente: ${cita.pacienteNombre}`,
          `Tel: ${cita.pacienteTelefono}`,
          `Tipo: ${cita.tipoSesion}`,
          "",
          "Creado desde FisioAll",
        ].join("\n"),
        start: {
          dateTime: cita.fechaHoraInicio.toISOString(),
          timeZone: "America/Mexico_City",
        },
        end: {
          dateTime: cita.fechaHoraFin.toISOString(),
          timeZone: "America/Mexico_City",
        },
        colorId: "5", // Banana (amarillo) — pendiente anticipo
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 30 }],
        },
      },
    });

    return event.data.id ?? null;
  } catch (error) {
    console.error("[GCal] Error creating event:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Calendar Event (color, title, time)
// ─────────────────────────────────────────────────────────────────────────────

// Google Calendar color IDs:
// 1=Lavender 2=Sage 3=Grape 4=Flamingo 5=Banana
// 6=Tangerine 7=Peacock 8=Graphite 9=Blueberry 10=Basil 11=Tomato
const ESTADO_COLOR: Record<string, string> = {
  pendiente_anticipo: "5",  // Banana (amarillo) — pendiente
  agendada:           "7",  // Peacock (azul) — agendada
  confirmada:         "10", // Basil (verde) — confirmada
  en_curso:           "9",  // Blueberry (azul oscuro) — en curso
  completada:         "2",  // Sage (verde suave) — completada
  cancelada:          "11", // Tomato (rojo) — cancelada
  no_show:            "8",  // Graphite (gris) — no show
};

export async function updateCalendarEvent(
  tenantId: string,
  googleEventId: string,
  updates: {
    estado?: string;
    fechaHoraInicio?: Date;
    fechaHoraFin?: Date;
    summary?: string;
  },
): Promise<void> {
  try {
    const auth = await getAuthenticatedClient(tenantId);
    if (!auth) return;

    const calendar = google.calendar({ version: "v3", auth });

    const token = await prisma.googleCalendarToken.findUnique({
      where: { tenantId },
      select: { calendarId: true },
    });

    const calendarId = token?.calendarId ?? "primary";

    const requestBody: Record<string, unknown> = {};

    if (updates.estado && ESTADO_COLOR[updates.estado]) {
      requestBody.colorId = ESTADO_COLOR[updates.estado];
    }

    if (updates.summary) {
      requestBody.summary = updates.summary;
    }

    if (updates.fechaHoraInicio && updates.fechaHoraFin) {
      requestBody.start = {
        dateTime: updates.fechaHoraInicio.toISOString(),
        timeZone: "America/Mexico_City",
      };
      requestBody.end = {
        dateTime: updates.fechaHoraFin.toISOString(),
        timeZone: "America/Mexico_City",
      };
    }

    await calendar.events.patch({
      calendarId,
      eventId: googleEventId,
      requestBody,
    });
  } catch (error) {
    console.error("[GCal] Error updating event:", error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Calendar Event
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteCalendarEvent(
  tenantId: string,
  googleEventId: string
): Promise<void> {
  try {
    const auth = await getAuthenticatedClient(tenantId);
    if (!auth) return;

    const calendar = google.calendar({ version: "v3", auth });

    const token = await prisma.googleCalendarToken.findUnique({
      where: { tenantId },
      select: { calendarId: true },
    });

    await calendar.events.delete({
      calendarId: token?.calendarId ?? "primary",
      eventId: googleEventId,
    });
  } catch (error) {
    console.error("[GCal] Error deleting event:", error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// List Calendar Events (for blocking slots)
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  start: Date;
  end: Date;
  summary: string;
}

export async function listCalendarEvents(
  tenantId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  try {
    const auth = await getAuthenticatedClient(tenantId);
    if (!auth) return [];

    const calendar = google.calendar({ version: "v3", auth });

    const token = await prisma.googleCalendarToken.findUnique({
      where: { tenantId },
      select: { calendarId: true },
    });

    const res = await calendar.events.list({
      calendarId: token?.calendarId ?? "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return (res.data.items ?? [])
      .filter((e) => e.start?.dateTime && e.end?.dateTime)
      .map((e) => ({
        start: new Date(e.start!.dateTime!),
        end: new Date(e.end!.dateTime!),
        summary: e.summary ?? "Evento",
      }));
  } catch (error) {
    console.error("[GCal] Error listing events:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync — push all future citas without googleEventId to Google Calendar
// ─────────────────────────────────────────────────────────────────────────────

export async function syncCitasToGoogle(tenantId: string): Promise<{ synced: number; errors: number }> {
  const auth = await getAuthenticatedClient(tenantId);
  if (!auth) return { synced: 0, errors: 0 };

  const now = new Date();

  // Get all future citas that don't have a Google Calendar event yet
  const citas = await prisma.cita.findMany({
    where: {
      tenantId,
      fechaHoraInicio: { gte: now },
      estado: { notIn: ["cancelada", "no_show"] },
      googleEventId: null,
    },
    include: {
      paciente: { select: { nombre: true, apellido: true, telefono: true } },
    },
    orderBy: { fechaHoraInicio: "asc" },
  });

  let synced = 0;
  let errors = 0;

  for (const cita of citas) {
    try {
      const eventId = await createCalendarEvent(tenantId, {
        fechaHoraInicio: cita.fechaHoraInicio,
        fechaHoraFin: cita.fechaHoraFin,
        pacienteNombre: `${cita.paciente.nombre} ${cita.paciente.apellido}`.trim(),
        pacienteTelefono: cita.paciente.telefono,
        tipoSesion: cita.tipoSesion ?? "Sesión",
      });

      if (eventId) {
        await prisma.cita.update({
          where: { id: cita.id },
          data: { googleEventId: eventId },
        });
        synced++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  return { synced, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// Disconnect — revoke token and delete from DB
// ─────────────────────────────────────────────────────────────────────────────

export async function disconnectCalendar(tenantId: string): Promise<void> {
  try {
    const token = await prisma.googleCalendarToken.findUnique({
      where: { tenantId },
    });

    if (!token) return;

    // Try to revoke the token with Google
    const client = getOAuth2Client();
    try {
      await client.revokeToken(token.accessToken);
    } catch {
      // Revoke might fail if token is already expired, that's ok
    }

    await prisma.googleCalendarToken.delete({
      where: { tenantId },
    });
  } catch (error) {
    console.error("[GCal] Error disconnecting:", error);
  }
}
