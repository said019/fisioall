"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { pacienteSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getTipoExpediente, type TipoExpediente } from "@/types/expedientes";

// ─── FETCH ALL PATIENTS ──────────────────────────────────────────────────────
export async function getPacientes() {
  const { tenantId } = await requireAuth();

  const now = new Date();

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
      citas: {
        orderBy: { fechaHoraInicio: "desc" },
        take: 20,
        include: {
          fisioterapeuta: { select: { nombre: true, apellido: true } },
        },
      },
      fisioterapeuta: {
        select: { nombre: true, apellido: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const COLORES = ["bg-[#4a7fa5]", "bg-violet-500", "bg-orange-500", "bg-emerald-500", "bg-pink-500", "bg-amber-500", "bg-cyan-500"];

  return pacientes.map((p, idx) => {
    const mem = p.membresias[0];
    const sesionesTotal = mem?.sesionesTotal ?? p.totalSesiones ?? 0;
    const sesionesUsadas = mem?.sesionesUsadas ?? 0;
    const sesionesRestantes = Math.max(0, sesionesTotal - sesionesUsadas);

    const ultimaCitaObj = p.citas.find((c) => c.fechaHoraInicio <= now && c.estado !== "cancelada");
    const proximaCitaObj = p.citas.find((c) => c.fechaHoraInicio > now && c.estado !== "cancelada");

    const formatFecha = (d: Date) =>
      d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Mexico_City" });

    let edad: number | null = null;
    if (p.fechaNacimiento) {
      edad = Math.floor((now.getTime() - p.fechaNacimiento.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Derive expediente types from citas' tipoSesion
    const tiposSet = new Set<TipoExpediente>();
    for (const c of p.citas) {
      if (c.tipoSesion) tiposSet.add(getTipoExpediente(c.tipoSesion));
    }
    const tiposExpediente = Array.from(tiposSet);

    return {
      id: p.id,
      nombre: p.nombre,
      apellido: p.apellido,
      iniciales: `${p.nombre[0]}${p.apellido[0]}`.toUpperCase(),
      email: p.email ?? "",
      telefono: p.telefono ?? "",
      edad,
      diagnostico: p.diagnosticos[0]?.diagnosticoPrincipal ?? null,
      cie10: p.diagnosticos[0]?.diagnosticoCie10 ?? null,
      sesionesRestantes,
      sesionesTotal,
      ultimaCita: ultimaCitaObj ? formatFecha(ultimaCitaObj.fechaHoraInicio) : null,
      proximaCita: proximaCitaObj ? formatFecha(proximaCitaObj.fechaHoraInicio) : null,
      dolor: null as number | null,
      activo: p.activo ?? true,
      color: COLORES[idx % COLORES.length],
      ciudad: p.ocupacion ?? null,
      totalSesiones: p.totalSesiones ?? 0,
      tiposExpediente,
      citas: p.citas.map((c) => ({
        id: c.id,
        tipoSesion: c.tipoSesion ?? "Sesión",
        fecha: formatFecha(c.fechaHoraInicio),
        hora: c.fechaHoraInicio.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" }),
        estado: c.estado ?? "agendada",
        fisioterapeuta: `${c.fisioterapeuta.nombre} ${c.fisioterapeuta.apellido}`,
        esFutura: c.fechaHoraInicio > now,
      })),
    };
  });
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

  const telefonoRaw = (formData.get("telefono") as string) ?? "";
  const telefonoClean = telefonoRaw.replace(/\D/g, "").slice(-10);

  const telefonoContactoRaw = (formData.get("telefonoContacto") as string) ?? "";
  const telefonoContactoClean = telefonoContactoRaw.replace(/\D/g, "").slice(-10);

  // Al menos uno de los dos debe ser válido
  const telefonoParaWA = telefonoContactoClean.length === 10 ? telefonoContactoClean : telefonoClean;
  if (!telefonoParaWA || telefonoParaWA.length !== 10) {
    return { error: "Ingresa un teléfono del paciente o un teléfono de contacto válido (10 dígitos)" };
  }

  const raw = {
    nombre: formData.get("nombre") as string,
    apellido: formData.get("apellido") as string,
    email: (formData.get("email") as string) || undefined,
    telefono: telefonoClean || telefonoParaWA,
    edad: Number(formData.get("edad")),
    diagnostico: formData.get("diagnostico") as string,
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
        telefono: telefonoClean || null,
        telefonoContacto: telefonoContactoClean || null,
        whatsapp: telefonoParaWA,
        fechaPrimeraCita: new Date(),
      },
    });

    // Create initial diagnosis if provided
    if (parsed.data.diagnostico && parsed.data.diagnostico !== "Sin diagnóstico") {
      await prisma.diagnostico.create({
        data: {
          pacienteId: paciente.id,
          fisioterapeutaId: userId,
          motivoConsulta: parsed.data.diagnostico,
          diagnosticoPrincipal: parsed.data.diagnostico,
        },
      });
    }

    revalidatePath("/dashboard/pacientes");
    revalidatePath("/agendar");
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
