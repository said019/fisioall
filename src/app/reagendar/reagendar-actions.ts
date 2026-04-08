"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const TENANT_SLUG = "kaya-kalp";
const TOKEN_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface CitaReagendar {
  id: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  tipoSesion: string | null;
  fisioterapeuta: { id: string; nombre: string; apellido: string };
  paciente: { nombre: string };
  duracion: number; // minutes
}

export async function validarTokenReagendar(
  token: string,
): Promise<{ ok: true; cita: CitaReagendar } | { ok: false; error: string }> {
  const cita = await prisma.cita.findFirst({
    where: { reagendarToken: token },
    include: {
      fisioterapeuta: { select: { id: true, nombre: true, apellido: true } },
      paciente: { select: { nombre: true } },
    },
  });

  if (!cita) return { ok: false, error: "Enlace inválido o ya utilizado." };

  // Check expiry
  if (!cita.reagendarTokenAt) return { ok: false, error: "Token inválido." };

  const elapsed = Date.now() - cita.reagendarTokenAt.getTime();
  if (elapsed > TOKEN_EXPIRY_MS) {
    return { ok: false, error: "El enlace ha expirado. Solicita uno nuevo respondiendo *3* al recordatorio." };
  }

  // Check cita is still active
  if (!cita.estado || !["confirmada", "agendada"].includes(cita.estado)) {
    return { ok: false, error: "Esta cita ya no está activa." };
  }

  const duracion =
    (cita.fechaHoraFin.getTime() - cita.fechaHoraInicio.getTime()) / 60000;

  return {
    ok: true,
    cita: {
      id: cita.id,
      fechaHoraInicio: cita.fechaHoraInicio.toISOString(),
      fechaHoraFin: cita.fechaHoraFin.toISOString(),
      tipoSesion: cita.tipoSesion,
      fisioterapeuta: cita.fisioterapeuta,
      paciente: cita.paciente,
      duracion,
    },
  };
}

export async function getSlotsReagendar(
  fisioterapeutaId: string,
  fecha: string, // YYYY-MM-DD
  duracion: number,
) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return [];

  const cfg = (tenant.configuracion ?? {}) as Record<string, unknown>;
  const diasBloqueados = (cfg.diasBloqueados as { fecha: string }[]) ?? [];

  // Check if date is blocked
  if (diasBloqueados.some((d) => d.fecha === fecha)) return [];

  const dateObj = new Date(fecha + "T12:00:00");
  const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const diaKey = diasSemana[dateObj.getDay()];

  // Get therapist schedule for this day
  const horario = await prisma.horarioUsuario.findFirst({
    where: {
      tenantId: tenant.id,
      usuarioId: fisioterapeutaId,
      diaKey,
      activo: true,
    },
  });

  if (!horario) return [];

  const franjas = (horario.franjas as { inicio: string; fin: string }[]) ?? [];

  // Get existing citas for the day
  const inicio = new Date(fecha + "T00:00:00");
  const fin = new Date(fecha + "T23:59:59");

  const citasExistentes = await prisma.cita.findMany({
    where: {
      tenantId: tenant.id,
      fisioterapeutaId,
      fechaHoraInicio: { gte: inicio, lte: fin },
      estado: { notIn: ["cancelada", "no_show"] },
    },
    select: { fechaHoraInicio: true, fechaHoraFin: true },
  });

  // Comida break
  const comida = (cfg.comida as { activo: boolean; inicio: string; fin: string }) ?? {
    activo: false,
    inicio: "14:00",
    fin: "15:00",
  };

  // Generate slots
  const intervalo = (cfg.intervaloSlots as number) ?? 30;
  const slots: { hora: string; disponible: boolean }[] = [];

  for (const franja of franjas) {
    const [hI, mI] = franja.inicio.split(":").map(Number);
    const [hF, mF] = franja.fin.split(":").map(Number);

    let cursor = hI * 60 + mI;
    const franjaFin = hF * 60 + mF;

    while (cursor + duracion <= franjaFin) {
      const hh = String(Math.floor(cursor / 60)).padStart(2, "0");
      const mm = String(cursor % 60).padStart(2, "0");
      const hora = `${hh}:${mm}`;

      // Check comida overlap
      if (comida.activo) {
        const [cI, cIm] = comida.inicio.split(":").map(Number);
        const [cF, cFm] = comida.fin.split(":").map(Number);
        const comidaInicio = cI * 60 + cIm;
        const comidaFin = cF * 60 + cFm;
        if (cursor < comidaFin && cursor + duracion > comidaInicio) {
          cursor += intervalo;
          continue;
        }
      }

      // Check existing cita overlap
      const slotStart = new Date(`${fecha}T${hora}:00`);
      const slotEnd = new Date(slotStart.getTime() + duracion * 60000);

      const ocupado = citasExistentes.some((c) => {
        return slotStart < c.fechaHoraFin && slotEnd > c.fechaHoraInicio;
      });

      slots.push({ hora, disponible: !ocupado });

      cursor += intervalo;
    }
  }

  return slots;
}

export async function confirmarReagendar(
  token: string,
  nuevaFecha: string, // YYYY-MM-DD
  nuevaHora: string, // HH:MM
) {
  const cita = await prisma.cita.findFirst({
    where: { reagendarToken: token },
    include: { paciente: { select: { id: true, nombre: true } } },
  });

  if (!cita) return { error: "Token inválido." };

  // Verify token not expired
  if (!cita.reagendarTokenAt) return { error: "Token inválido." };
  const elapsed = Date.now() - cita.reagendarTokenAt.getTime();
  if (elapsed > TOKEN_EXPIRY_MS) return { error: "El enlace ha expirado." };

  if (!cita.estado || !["confirmada", "agendada"].includes(cita.estado)) {
    return { error: "Esta cita ya no está activa." };
  }

  const duracion =
    (cita.fechaHoraFin.getTime() - cita.fechaHoraInicio.getTime()) / 60000;

  const nuevaInicio = new Date(`${nuevaFecha}T${nuevaHora}:00`);
  const nuevaFin = new Date(nuevaInicio.getTime() + duracion * 60000);

  await prisma.cita.update({
    where: { id: cita.id },
    data: {
      fechaHoraInicio: nuevaInicio,
      fechaHoraFin: nuevaFin,
      reagendarToken: null,
      reagendarTokenAt: null,
      sinCargoReagendar: true,
      confirmadaPaciente: false,
      recordatorioEnviado: false,
    },
  });

  revalidatePath("/dashboard/agenda");

  return {
    ok: true,
    mensaje: `Cita reagendada para ${nuevaInicio.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })} a las ${nuevaHora} hrs.`,
  };
}
