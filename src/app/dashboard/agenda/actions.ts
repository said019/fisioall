"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── FETCH CITAS FOR A WEEK ─────────────────────────────────────────────────
export async function getCitasSemana(fechaInicio: string, fechaFin: string) {
  const { tenantId } = await requireAuth();

  const citas = await prisma.cita.findMany({
    where: {
      tenantId,
      fechaHoraInicio: {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      },
    },
    include: {
      paciente: {
        select: { nombre: true, apellido: true, telefono: true },
      },
      fisioterapeuta: {
        select: { nombre: true, apellido: true },
      },
      membresia: {
        select: { sesionesUsadas: true, sesionesTotal: true },
      },
    },
    orderBy: { fechaHoraInicio: "asc" },
  });

  return citas.map((c) => ({
    id: c.id,
    paciente: `${c.paciente.nombre} ${c.paciente.apellido}`,
    iniciales: `${c.paciente.nombre[0]}${c.paciente.apellido[0]}`.toUpperCase(),
    telefono: c.paciente.telefono,
    fisioterapeuta: `${c.fisioterapeuta.nombre} ${c.fisioterapeuta.apellido}`,
    motivo: c.tipoSesion ?? "Sesión",
    fechaHoraInicio: c.fechaHoraInicio.toISOString(),
    fechaHoraFin: c.fechaHoraFin.toISOString(),
    estado: c.estado,
    sala: c.sala,
    numeroSesion: c.numeroSesion,
    sesion: c.membresia
      ? `${(c.membresia.sesionesUsadas ?? 0)}/${c.membresia.sesionesTotal}`
      : null,
  }));
}

// ─── FETCH CITAS FOR TODAY ───────────────────────────────────────────────────
export async function getCitasHoy() {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  return getCitasSemana(inicio.toISOString(), fin.toISOString());
}

// ─── CREATE CITA ─────────────────────────────────────────────────────────────
export async function crearCita(prevState: unknown, formData: FormData) {
  const { tenantId, userId } = await requireAuth();

  const pacienteId = formData.get("pacienteId") as string;
  const fisioterapeutaId = (formData.get("fisioterapeutaId") as string) || userId;
  const fecha = formData.get("fecha") as string;
  const horaInicio = formData.get("horaInicio") as string;
  const duracion = Number(formData.get("duracion") || 45);
  const tipoSesion = formData.get("tipoSesion") as string;
  const sala = formData.get("sala") as string;

  if (!pacienteId || !fecha || !horaInicio) {
    return { error: "Paciente, fecha y hora son obligatorios" };
  }

  try {
    const fechaHoraInicio = new Date(`${fecha}T${horaInicio}:00`);
    const fechaHoraFin = new Date(fechaHoraInicio.getTime() + duracion * 60 * 1000);

    await prisma.cita.create({
      data: {
        tenantId,
        fisioterapeutaId,
        pacienteId,
        fechaHoraInicio,
        fechaHoraFin,
        tipoSesion: tipoSesion || "Sesión de fisioterapia",
        sala: sala || null,
        createdBy: userId,
      },
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { error: "Error al crear la cita. Intenta de nuevo." };
  }
}

// ─── UPDATE CITA STATUS ──────────────────────────────────────────────────────
export async function actualizarEstadoCita(
  citaId: string,
  estado: "agendada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_show"
) {
  const { tenantId } = await requireAuth();

  try {
    await prisma.cita.update({
      where: { id: citaId, tenantId },
      data: { estado },
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return { error: "Error al actualizar la cita." };
  }
}

// ─── GET FISIOTERAPEUTAS (for selectors) ─────────────────────────────────────
export async function getFisioterapeutas() {
  const { tenantId } = await requireAuth();

  const fisios = await prisma.usuario.findMany({
    where: { tenantId, activo: true },
    select: { id: true, nombre: true, apellido: true, rol: true },
    orderBy: { nombre: "asc" },
  });

  return fisios.map((f) => ({
    id: f.id,
    nombre: `${f.nombre} ${f.apellido}`,
    iniciales: `${f.nombre[0]}${f.apellido[0]}`.toUpperCase(),
    rol: f.rol,
  }));
}

// ─── GET PACIENTES LITE (for selectors) ──────────────────────────────────
export async function getPacientesLite() {
  const { tenantId } = await requireAuth();

  const pacientes = await prisma.paciente.findMany({
    where: { tenantId, activo: true },
    select: { id: true, nombre: true, apellido: true, telefono: true },
    orderBy: { nombre: "asc" },
  });

  return pacientes.map((p) => ({
    id: p.id,
    nombre: `${p.nombre} ${p.apellido}`,
    iniciales: `${p.nombre[0]}${p.apellido[0]}`.toUpperCase(),
    telefono: p.telefono,
  }));
}
