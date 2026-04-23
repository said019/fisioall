"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── FETCH ENCUESTAS NPS ────────────────────────────────────────────────────
export async function getEncuestas() {
  const { tenantId } = await requireAuth();

  const encuestas = await prisma.encuestaSesion.findMany({
    where: {
      cita: { tenantId },
    },
    include: {
      paciente: {
        select: { nombre: true, apellido: true },
      },
      cita: {
        select: {
          tipoSesion: true,
          fisioterapeuta: { select: { nombre: true, apellido: true } },
        },
      },
    },
    orderBy: { enviadaAt: "desc" },
  });

  return encuestas.map((e) => ({
    id: e.id,
    pacienteNombre: `${e.paciente.nombre} ${e.paciente.apellido}`,
    pacienteIniciales: `${e.paciente.nombre[0]}${e.paciente.apellido[0]}`.toUpperCase(),
    npsScore: e.npsScore,
    dolorPost: e.dolorPost,
    satisfaccion: e.satisfaccion,
    mejoriaPercibida: e.mejoriaPercibida,
    comentarios: e.comentarios,
    enviadaAt: e.enviadaAt?.toISOString() ?? null,
    respondidaAt: e.respondidaAt?.toISOString() ?? null,
    respondida: e.respondida ?? false,
    fisioterapeuta: e.cita.fisioterapeuta
      ? `${e.cita.fisioterapeuta.nombre} ${e.cita.fisioterapeuta.apellido}`
      : null,
    tipoSesion: e.cita.tipoSesion,
  }));
}

// ─── NPS KPIs ────────────────────────────────────────────────────────────────
export async function getEncuestasKPIs() {
  const { tenantId } = await requireAuth();

  const respondidas = await prisma.encuestaSesion.findMany({
    where: {
      cita: { tenantId },
      respondida: true,
      npsScore: { not: null },
    },
    select: {
      npsScore: true,
      satisfaccion: true,
      mejoriaPercibida: true,
    },
  });

  const total = await prisma.encuestaSesion.count({
    where: { cita: { tenantId } },
  });

  const promotores = respondidas.filter((e) => (e.npsScore ?? 0) >= 9).length;
  const detractores = respondidas.filter((e) => (e.npsScore ?? 0) <= 6).length;
  const npsScore =
    respondidas.length > 0
      ? Math.round(((promotores - detractores) / respondidas.length) * 100)
      : 0;

  const satisfechos = respondidas.filter(
    (e) => (e.satisfaccion ?? 0) >= 4
  ).length;
  const mejoraron = respondidas.filter(
    (e) => e.mejoriaPercibida === "si"
  ).length;

  return {
    npsScore,
    promotores,
    detractores,
    pasivos: respondidas.length - promotores - detractores,
    totalEncuestas: total,
    respondidas: respondidas.length,
    tasaRespuesta: total > 0 ? Math.round((respondidas.length / total) * 100) : 0,
    tasaSatisfaccion:
      respondidas.length > 0
        ? Math.round((satisfechos / respondidas.length) * 100)
        : 0,
    tasaMejoria:
      respondidas.length > 0
        ? Math.round((mejoraron / respondidas.length) * 100)
        : 0,
  };
}

// ─── CREAR ENCUESTA (triggered on cita completada) ──────────────────────────
export async function crearEncuesta(citaId: string, opts?: { fromCron?: boolean }) {
  // Fetch cita + paciente (no auth check – called internally)
  const cita = await prisma.cita.findUnique({
    where: { id: citaId },
    include: {
      paciente: { select: { id: true, nombre: true, telefono: true, telefonoContacto: true } },
      tenant: { select: { nombre: true } },
    },
  });
  if (!cita) return { error: "Cita no encontrada" };

  // Avoid duplicates
  const existing = await prisma.encuestaSesion.findFirst({
    where: { citaId },
    select: { id: true, token: true },
  });
  if (existing) return { ok: true, encuestaId: existing.id, token: existing.token };

  // Si es del cron y estamos fuera de horario hábil, creamos el registro
  // pero NO mandamos WhatsApp todavía. Un sweep posterior lo enviará.
  let puedeEnviarAhora = true;
  if (opts?.fromCron) {
    const { dentroDeHorarioHabil } = await import("@/lib/cron-jobs");
    puedeEnviarAhora = dentroDeHorarioHabil();
  }

  const encuesta = await prisma.encuestaSesion.create({
    data: {
      citaId,
      pacienteId: cita.paciente.id,
      enviadaAt: puedeEnviarAhora ? new Date() : null,
      respondida: false,
    },
    select: { id: true, token: true },
  });

  if (!puedeEnviarAhora) {
    revalidatePath("/dashboard/encuestas");
    return { ok: true, encuestaId: encuesta.id, token: encuesta.token, deferida: true };
  }

  // Send WhatsApp link (best-effort) — usa telefonoContacto si existe
  const telefonoWA = cita.paciente.telefonoContacto || cita.paciente.telefono;
  if (telefonoWA) {
    try {
      const { isConfigured, getEvolutionClient, formatPhone } = await import("@/lib/evolution");
      if (isConfigured()) {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.kayakalp.com.mx");
        const surveyUrl = `${baseUrl}/encuesta/${encuesta.token}`;
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
        const msg =
          `¡Hola ${cita.paciente.nombre}! 😊\n\n` +
          `Gracias por tu sesión del *${fecha}* a las *${hora}* en *${cita.tenant?.nombre ?? "Kaya Kalp"}*. ` +
          `Nos importa saber cómo te sientes.\n\n` +
          `Por favor, tómate 1 minuto para responder nuestra breve encuesta:\n` +
          `👉 ${surveyUrl}\n\n` +
          `Tu opinión nos ayuda a mejorar. ¡Muchas gracias!`;
        await getEvolutionClient().sendText(formatPhone(telefonoWA), msg);
      }
    } catch (err) {
      console.error("[Encuesta] WhatsApp send failed:", err);
    }
  }

  revalidatePath("/dashboard/encuestas");
  return { ok: true, encuestaId: encuesta.id, token: encuesta.token };
}

// ─── DOLOR MAPPING ──────────────────────────────────────────────────────────
const DOLOR_TO_ENUM: Record<string, "N0" | "N2" | "N5" | "N7" | "N10"> = {
  sin_dolor: "N0",
  leve: "N2",
  moderado: "N5",
  severo: "N7",
  muy_severo: "N10",
};

// ─── GUARDAR RESPUESTA NPS (public, no auth) ─────────────────────────────────
export async function guardarRespuestaNPS(
  token: string,
  data: {
    npsScore: number;
    satisfaccion: number;
    mejoriaPercibida: "si" | "no";
    dolorPost?: string;
    comentarios?: string;
  }
) {
  const encuesta = await prisma.encuestaSesion.findUnique({ where: { token } });
  if (!encuesta) return { error: "Encuesta no encontrada" };
  if (encuesta.respondida) return { error: "Esta encuesta ya fue respondida" };

  const dolorEnum = data.dolorPost ? DOLOR_TO_ENUM[data.dolorPost] ?? null : null;

  await prisma.encuestaSesion.update({
    where: { token },
    data: {
      npsScore: data.npsScore,
      satisfaccion: data.satisfaccion,
      mejoriaPercibida: data.mejoriaPercibida,
      dolorPost: dolorEnum,
      comentarios: data.comentarios ?? null,
      respondida: true,
      respondidaAt: new Date(),
    },
  });

  return { ok: true };
}

// ─── REENVIAR ENCUESTA ────────────────────────────────────────────────────────
export async function reenviarEncuesta(encuestaId: string) {
  const { tenantId } = await requireAuth();

  const encuesta = await prisma.encuestaSesion.findFirst({
    where: { id: encuestaId, cita: { tenantId } },
    select: {
      id: true,
      token: true,
      paciente: { select: { nombre: true, telefono: true, telefonoContacto: true } },
      cita: { select: { tenant: { select: { nombre: true } } } },
    },
  });
  if (!encuesta) return { error: "Encuesta no encontrada" };

  const telefonoWA = encuesta.paciente.telefonoContacto || encuesta.paciente.telefono;
  if (telefonoWA) {
    try {
      const { isConfigured, getEvolutionClient, formatPhone } = await import("@/lib/evolution");
      if (isConfigured()) {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.kayakalp.com.mx");
        const surveyUrl = `${baseUrl}/encuesta/${encuesta.token}`;
        const msg =
          `¡Hola ${encuesta.paciente.nombre}! 😊\n\n` +
          `Te reenviamos el link de nuestra encuesta de satisfacción:\n` +
          `👉 ${surveyUrl}\n\n` +
          `¡Gracias por tu tiempo!`;
        await getEvolutionClient().sendText(formatPhone(telefonoWA), msg);
      }
    } catch (err) {
      console.error("[Encuesta] Reenvío WhatsApp failed:", err);
    }
  }

  // Update enviadaAt
  await prisma.encuestaSesion.update({
    where: { id: encuestaId },
    data: { enviadaAt: new Date() },
  });

  revalidatePath("/dashboard/encuestas");
  return { ok: true };
}

