"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

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
