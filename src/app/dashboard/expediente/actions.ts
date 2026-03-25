"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

// ─── FETCH PACIENTE PARA EXPEDIENTE PAGE ─────────────────────────────────────
export async function getExpedientePaciente(pacienteId: string) {
  const { tenantId } = await requireAuth();

  const paciente = await prisma.paciente.findFirst({
    where: { id: pacienteId, tenantId },
    include: {
      membresias: {
        where: { estado: "activa" },
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          paquete: { select: { nombre: true } },
        },
      },
      citas: {
        orderBy: { fechaHoraInicio: "desc" },
        take: 1,
        select: { id: true, estado: true, tipoSesion: true, numeroSesion: true },
      },
      notasSesion: {
        orderBy: { fecha: "desc" },
        take: 10,
        include: {
          fisioterapeuta: { select: { nombre: true, apellido: true } },
        },
      },
      progresosDolor: {
        orderBy: { fecha: "asc" },
      },
    },
  });

  if (!paciente) return null;

  const membresia = paciente.membresias[0] ?? null;
  const ultimaCita = paciente.citas[0] ?? null;

  return {
    paciente: {
      id: paciente.id,
      nombre: `${paciente.nombre} ${paciente.apellido}`,
      iniciales: `${paciente.nombre[0]}${paciente.apellido[0]}`.toUpperCase(),
    },
    sesion: {
      citaId: ultimaCita?.id ?? null,
      tipoSesion: ultimaCita?.tipoSesion ?? membresia?.paquete.nombre ?? "Sesión",
      estado: ultimaCita?.estado ?? "agendada",
      numeroSesion: ultimaCita?.numeroSesion ?? (membresia ? (membresia.sesionesUsadas ?? 0) + 1 : 1),
      sesionesTotal: membresia?.sesionesTotal ?? null,
    },
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

// ─── CREATE NOTA SOAP ────────────────────────────────────────────────────────
export async function crearNotaSesion(prevState: unknown, formData: FormData) {
  const { userId } = await requireAuth();

  const citaId = formData.get("citaId") as string;
  const pacienteId = formData.get("pacienteId") as string;
  const subjetivo = formData.get("subjetivo") as string;
  const objetivo = formData.get("objetivo") as string;
  const analisis = formData.get("analisis") as string;
  const plan = formData.get("plan") as string;
  const dolorInicio = formData.get("dolorInicio") as string;
  const dolorFin = formData.get("dolorFin") as string;

  if (!citaId || !pacienteId) {
    return { error: "Cita y paciente son obligatorios" };
  }

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
        dolorInicio: dolorInicio ? (dolorInicio as any) : null,
        dolorFin: dolorFin ? (dolorFin as any) : null,
      },
    });

    revalidatePath("/dashboard/expediente");
    return { success: true };
  } catch (error) {
    console.error("Error creating SOAP note:", error);
    return { error: "Error al crear la nota SOAP." };
  }
}
