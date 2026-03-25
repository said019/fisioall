"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { pacienteSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ─── FETCH ALL PATIENTS ──────────────────────────────────────────────────────
export async function getPacientes() {
  const { tenantId } = await requireAuth();

  const pacientes = await prisma.paciente.findMany({
    where: { tenantId, activo: true },
    include: {
      diagnosticos: {
        where: { activo: true },
        orderBy: { fecha: "desc" },
        take: 1,
      },
      membresias: {
        where: { estado: { in: ["activa", "pendiente_activacion"] } },
        include: { paquete: true },
        take: 1,
      },
      fisioterapeuta: {
        select: { nombre: true, apellido: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return pacientes.map((p) => ({
    id: p.id,
    nombre: `${p.nombre} ${p.apellido}`,
    iniciales: `${p.nombre[0]}${p.apellido[0]}`.toUpperCase(),
    email: p.email,
    telefono: p.telefono,
    genero: p.genero,
    fechaNacimiento: p.fechaNacimiento?.toISOString() ?? null,
    ocupacion: p.ocupacion,
    activo: p.activo,
    totalSesiones: p.totalSesiones ?? 0,
    diagnostico: p.diagnosticos[0]?.diagnosticoPrincipal ?? null,
    cie10: p.diagnosticos[0]?.diagnosticoCie10 ?? null,
    membresia: p.membresias[0]
      ? {
          nombre: p.membresias[0].paquete.nombre,
          sesionesUsadas: p.membresias[0].sesionesUsadas ?? 0,
          sesionesTotales: p.membresias[0].sesionesTotal,
          estado: p.membresias[0].estado,
        }
      : null,
    fisioterapeuta: p.fisioterapeuta
      ? `${p.fisioterapeuta.nombre} ${p.fisioterapeuta.apellido}`
      : null,
    createdAt: p.createdAt?.toISOString() ?? null,
  }));
}

// ─── FETCH SINGLE PATIENT ────────────────────────────────────────────────────
export async function getPaciente(id: string) {
  const { tenantId } = await requireAuth();

  const p = await prisma.paciente.findFirst({
    where: { id, tenantId },
    include: {
      diagnosticos: { orderBy: { fecha: "desc" } },
      membresias: {
        include: { paquete: true },
        orderBy: { fechaCompra: "desc" },
      },
      citas: {
        orderBy: { fechaHoraInicio: "desc" },
        take: 10,
        include: {
          fisioterapeuta: { select: { nombre: true, apellido: true } },
        },
      },
      pagos: {
        orderBy: { fechaPago: "desc" },
        take: 10,
      },
      fisioterapeuta: {
        select: { nombre: true, apellido: true },
      },
    },
  });

  return p;
}

// ─── CREATE PATIENT ──────────────────────────────────────────────────────────
export async function crearPaciente(prevState: unknown, formData: FormData) {
  const { tenantId, userId } = await requireAuth();

  const raw = {
    nombre: formData.get("nombre") as string,
    apellido: formData.get("apellido") as string,
    email: (formData.get("email") as string) || undefined,
    telefono: formData.get("telefono") as string,
    edad: Number(formData.get("edad")),
    diagnostico: formData.get("diagnostico") as string,
    cie10: (formData.get("cie10") as string) || undefined,
    ciudad: (formData.get("ciudad") as string) || undefined,
  };

  const parsed = pacienteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const paciente = await prisma.paciente.create({
      data: {
        tenantId,
        fisioterapeutaId: userId,
        nombre: parsed.data.nombre,
        apellido: parsed.data.apellido,
        email: parsed.data.email || null,
        telefono: parsed.data.telefono || "",
        ocupacion: parsed.data.ciudad || null,
        fechaPrimeraCita: new Date(),
      },
    });

    // Create initial diagnosis if provided
    if (parsed.data.diagnostico) {
      await prisma.diagnostico.create({
        data: {
          pacienteId: paciente.id,
          fisioterapeutaId: userId,
          motivoConsulta: parsed.data.diagnostico,
          diagnosticoPrincipal: parsed.data.diagnostico,
          diagnosticoCie10: parsed.data.cie10 || null,
        },
      });
    }

    revalidatePath("/dashboard/pacientes");
    return { success: true, pacienteId: paciente.id };
  } catch (error) {
    console.error("Error creating patient:", error);
    return { error: "Error al crear el paciente. Intenta de nuevo." };
  }
}

// ─── UPDATE PATIENT ──────────────────────────────────────────────────────────
export async function actualizarPaciente(id: string, formData: FormData) {
  const { tenantId } = await requireAuth();

  try {
    await prisma.paciente.update({
      where: { id, tenantId },
      data: {
        nombre: formData.get("nombre") as string,
        apellido: formData.get("apellido") as string,
        email: (formData.get("email") as string) || null,
        telefono: formData.get("telefono") as string,
        ocupacion: (formData.get("ocupacion") as string) || null,
      },
    });

    revalidatePath("/dashboard/pacientes");
    return { success: true };
  } catch (error) {
    console.error("Error updating patient:", error);
    return { error: "Error al actualizar el paciente." };
  }
}
