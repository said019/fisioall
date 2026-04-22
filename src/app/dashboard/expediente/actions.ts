"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { DolorEscala } from "@prisma/client";

// ─── FETCH EXPEDIENTE (diagnostico + notas SOAP) ────────────────────────────
export async function getExpediente(pacienteId: string) {
  const { tenantId } = await requireAuth();

  const paciente = await prisma.paciente.findFirst({
    where: { id: pacienteId, tenantId },
    include: {
      diagnosticos: {
        orderBy: { fecha: "desc" },
        include: {
          marcasBodyMap: true,
          fisioterapeuta: { select: { nombre: true, apellido: true } },
        },
      },
      notasSesion: {
        orderBy: { fecha: "desc" },
        take: 20,
        include: {
          fisioterapeuta: { select: { nombre: true, apellido: true } },
          fotos: true,
        },
      },
      progresosDolor: {
        orderBy: { fecha: "asc" },
      },
      adjuntosExpediente: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!paciente) return null;

  return {
    paciente: {
      id: paciente.id,
      nombre: `${paciente.nombre} ${paciente.apellido}`,
      telefono: paciente.telefono,
      email: paciente.email,
      fechaNacimiento: paciente.fechaNacimiento?.toISOString() ?? null,
      genero: paciente.genero,
      pesoKg: paciente.pesoKg ? Number(paciente.pesoKg) : null,
      alturaCm: paciente.alturaCm ? Number(paciente.alturaCm) : null,
      tipoSangre: paciente.tipoSangre,
      alergias: paciente.alergias,
      medicamentosActuales: paciente.medicamentosActuales,
      enfermedadesCronicas: paciente.enfermedadesCronicas,
      cirugiasPrevias: paciente.cirugiasPrevias,
      notasMedicas: paciente.notasMedicas,
    },
    diagnosticos: paciente.diagnosticos.map((d) => ({
      id: d.id,
      fecha: d.fecha.toISOString(),
      motivoConsulta: d.motivoConsulta,
      diagnosticoPrincipal: d.diagnosticoPrincipal,
      diagnosticoCie10: d.diagnosticoCie10,
      zonaLesion: d.zonaLesion,
      ladoLesion: d.ladoLesion,
      objetivosTratamiento: d.objetivosTratamiento,
      planTratamiento: d.planTratamiento,
      sesionesEstimadas: d.numeroSesionesEstimadas,
      fisioterapeuta: `${d.fisioterapeuta.nombre} ${d.fisioterapeuta.apellido}`,
      marcasBodyMap: d.marcasBodyMap.map((m) => ({
        id: m.id,
        coordX: m.coordX,
        coordY: m.coordY,
        vista: m.vista,
        tipo: m.tipo,
        intensidad: m.intensidad,
        zonaNombre: m.zonaNombre,
        notas: m.notas,
      })),
    })),
    notasSesion: paciente.notasSesion.map((n) => ({
      id: n.id,
      fecha: n.fecha.toISOString(),
      subjetivo: n.subjetivo,
      objetivo: n.objetivo,
      analisis: n.analisis,
      plan: n.plan,
      dolorInicio: n.dolorInicio,
      dolorFin: n.dolorFin,
      tecnicasUtilizadas: n.tecnicasUtilizadas,
      evolucion: n.evolucion,
      porcentajeObjetivo: n.porcentajeObjetivo,
      fisioterapeuta: `${n.fisioterapeuta.nombre} ${n.fisioterapeuta.apellido}`,
    })),
    progresosDolor: paciente.progresosDolor.map((p) => ({
      fecha: p.fecha.toISOString(),
      dolorInicio: p.dolorInicio,
      dolorFin: p.dolorFin,
      evolucion: p.evolucion,
      numeroSesion: p.numeroSesion,
    })),
  };
}

// ─── FETCH PACIENTE PARA EXPEDIENTE PAGE (from pacienteId) ───────────────────
export async function getExpedientePaciente(pacienteId: string) {
  const { tenantId } = await requireAuth();

  // Find the most recent cita for this patient and redirect through it
  const ultimaCita = await prisma.cita.findFirst({
    where: { pacienteId, tenantId },
    orderBy: { fechaHoraInicio: "desc" },
    select: { id: true },
  });

  if (ultimaCita) {
    return getExpedientePorCita(ultimaCita.id);
  }

  // If no cita exists, return minimal data
  const paciente = await prisma.paciente.findFirst({
    where: { id: pacienteId, tenantId },
    select: { id: true, nombre: true, apellido: true },
  });

  if (!paciente) return null;

  return {
    paciente: {
      id: paciente.id,
      nombre: `${paciente.nombre} ${paciente.apellido}`,
      iniciales: `${paciente.nombre[0]}${paciente.apellido[0]}`.toUpperCase(),
    },
    sesion: {
      citaId: null,
      tipoSesion: "Sesión",
      estado: "agendada",
      numeroSesion: 1,
      sesionesTotal: null,
      fechaHoraInicio: null,
    },
    notaExistente: null,
    historialCitas: [],
    notasSesion: [],
    progresosDolor: [],
  };
}

// ─── GET EXPEDIENTE BY CITA ID ───────────────────────────────────────────────
export async function getExpedientePorCita(citaId: string) {
  const { tenantId } = await requireAuth();

  const cita = await prisma.cita.findFirst({
    where: { id: citaId, tenantId },
    include: {
      paciente: {
        select: { id: true, nombre: true, apellido: true },
      },
      membresia: {
        select: { sesionesUsadas: true, sesionesTotal: true, paquete: { select: { nombre: true } } },
      },
      notasSesion: {
        orderBy: { fecha: "desc" },
        include: { fisioterapeuta: { select: { nombre: true, apellido: true } } },
      },
    },
  });

  if (!cita) return null;

  // Fetch ALL citas for this patient (historial)
  const historialCitas = await prisma.cita.findMany({
    where: { pacienteId: cita.pacienteId, tenantId },
    orderBy: { fechaHoraInicio: "desc" },
    select: {
      id: true,
      tipoSesion: true,
      estado: true,
      numeroSesion: true,
      fechaHoraInicio: true,
      sala: true,
      notasSesion: { select: { id: true } },
    },
  });

  // Fetch all dolor progress for this patient
  const progresosDolor = await prisma.progresoDolor.findMany({
    where: { pacienteId: cita.pacienteId },
    orderBy: { fecha: "asc" },
  });

  // Existing nota for this cita (if any — for pre-fill on revisit)
  const notaExistente = cita.notasSesion[0] ?? null;

  return {
    paciente: {
      id: cita.paciente.id,
      nombre: `${cita.paciente.nombre} ${cita.paciente.apellido}`,
      iniciales: `${cita.paciente.nombre[0]}${cita.paciente.apellido[0]}`.toUpperCase(),
    },
    sesion: {
      citaId: cita.id,
      tipoSesion: cita.tipoSesion ?? cita.membresia?.paquete.nombre ?? "Sesión",
      estado: cita.estado ?? "agendada",
      numeroSesion: cita.numeroSesion ?? 1,
      sesionesTotal: cita.membresia?.sesionesTotal ?? null,
      fechaHoraInicio: cita.fechaHoraInicio.toISOString(),
    },
    notaExistente: notaExistente
      ? {
          id: notaExistente.id,
          subjetivo: notaExistente.subjetivo,
          objetivo: notaExistente.objetivo,
          analisis: notaExistente.analisis,
          plan: notaExistente.plan,
          dolorInicio: notaExistente.dolorInicio,
          dolorFin: notaExistente.dolorFin,
          tecnicasUtilizadas: notaExistente.tecnicasUtilizadas,
          evolucion: notaExistente.evolucion,
          porcentajeObjetivo: notaExistente.porcentajeObjetivo,
          notasAdicionales: notaExistente.notasAdicionales,
        }
      : null,
    historialCitas: historialCitas.map((h) => ({
      id: h.id,
      tipoSesion: h.tipoSesion ?? "Sesión",
      estado: h.estado ?? "agendada",
      numeroSesion: h.numeroSesion,
      fechaHoraInicio: h.fechaHoraInicio.toISOString(),
      sala: h.sala,
      tieneNota: h.notasSesion.length > 0,
      esActual: h.id === citaId,
    })),
    notasSesion: cita.notasSesion.map((n) => ({
      id: n.id,
      fecha: n.fecha.toISOString(),
      subjetivo: n.subjetivo,
      objetivo: n.objetivo,
      analisis: n.analisis,
      plan: n.plan,
      dolorInicio: n.dolorInicio,
      dolorFin: n.dolorFin,
      tecnicasUtilizadas: n.tecnicasUtilizadas,
      evolucion: n.evolucion,
      porcentajeObjetivo: n.porcentajeObjetivo,
      fisioterapeuta: `${n.fisioterapeuta.nombre} ${n.fisioterapeuta.apellido}`,
    })),
    progresosDolor: progresosDolor.map((p) => ({
      fecha: p.fecha.toISOString(),
      dolorInicio: p.dolorInicio,
      dolorFin: p.dolorFin,
      evolucion: p.evolucion,
      numeroSesion: p.numeroSesion,
    })),
  };
}

// ─── CREATE NOTA SOAP ────────────────────────────────────────────────────────
export async function crearNotaSesion(prevState: unknown, formData: FormData) {
  const { userId, tenantId } = await requireAuth();

  const citaId = formData.get("citaId") as string;
  const pacienteId = formData.get("pacienteId") as string;
  const subjetivo = formData.get("subjetivo") as string;
  const objetivo = formData.get("objetivo") as string;
  const analisis = formData.get("analisis") as string;
  const plan = formData.get("plan") as string;
  const dolorInicioRaw = formData.get("dolorInicio") as string;
  const dolorFinRaw = formData.get("dolorFin") as string;
  const tecnicasRaw = formData.get("tecnicas") as string;
  const evolucion = formData.get("evolucion") as string;
  const porcentajeRaw = formData.get("porcentajeObjetivo") as string;
  const notasAdicionales = formData.get("notasAdicionales") as string;

  if (!citaId || !pacienteId) {
    return { error: "Cita y paciente son obligatorios" };
  }

  // Validar UUIDs y existencia
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(citaId) || !UUID_RE.test(pacienteId)) {
    return { error: "Identificadores inválidos." };
  }

  const cita = await prisma.cita.findFirst({
    where: { id: citaId, tenantId },
    select: { id: true, numeroSesion: true, pacienteId: true },
  });
  if (!cita) {
    return { error: "La cita no existe o no pertenece a tu clínica." };
  }
  if (cita.pacienteId !== pacienteId) {
    return { error: "Paciente no coincide con la cita." };
  }

  const toDolorEnum = (val: string | null): DolorEscala | null => {
    if (!val) return null;
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0 || n > 10) return null;
    return `N${n}` as DolorEscala;
  };

  const dolorInicio = toDolorEnum(dolorInicioRaw);
  const dolorFin = toDolorEnum(dolorFinRaw);
  let tecnicas: string[] = [];
  try {
    tecnicas = tecnicasRaw ? JSON.parse(tecnicasRaw) : [];
    if (!Array.isArray(tecnicas)) tecnicas = [];
  } catch {
    tecnicas = [];
  }
  const porcentajeObjetivo = porcentajeRaw ? parseInt(porcentajeRaw, 10) : null;
  // Truncar evolucion a 30 chars (varchar(30) en BD)
  const evolucionSafe = (evolucion || "sin_cambios").slice(0, 30);

  try {
    await prisma.notaSesion.create({
      data: {
        citaId,
        fisioterapeutaId: userId,
        pacienteId,
        subjetivo: subjetivo || null,
        objetivo: objetivo || null,
        analisis: analisis || null,
        plan: plan || null,
        dolorInicio,
        dolorFin,
        tecnicasUtilizadas: tecnicas,
        evolucion: evolucionSafe,
        porcentajeObjetivo,
        notasAdicionales: notasAdicionales || null,
      },
    });

    // Create ProgresoDolor entry for tracking
    if (dolorInicio !== null || dolorFin !== null) {
      const dolorInicioNum = dolorInicioRaw ? parseInt(dolorInicioRaw, 10) : null;
      const dolorFinNum = dolorFinRaw ? parseInt(dolorFinRaw, 10) : null;
      await prisma.progresoDolor.create({
        data: {
          pacienteId,
          citaId,
          fecha: new Date(),
          dolorInicio: dolorInicioNum,
          dolorFin: dolorFinNum,
          evolucion: evolucionSafe,
          numeroSesion: cita.numeroSesion ?? null,
        },
      });
    }

    revalidatePath("/dashboard/expediente");
    return { success: true };
  } catch (error) {
    console.error("[SOAP] Error creating nota:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return { error: `No se pudo guardar la nota: ${msg}` };
  }
}
