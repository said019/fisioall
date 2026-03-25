"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── FETCH TARJETAS DE LEALTAD (membresías como loyalty cards) ───────────────
export async function getTarjetasLealtad() {
  const { tenantId } = await requireAuth();

  const membresias = await prisma.membresia.findMany({
    where: { tenantId },
    include: {
      paciente: {
        select: { nombre: true, apellido: true, telefono: true },
      },
      paquete: {
        select: { nombre: true, descripcion: true, color: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return membresias.map((m) => ({
    id: m.id,
    pacienteNombre: `${m.paciente.nombre} ${m.paciente.apellido}`,
    pacienteIniciales: `${m.paciente.nombre[0]}${m.paciente.apellido[0]}`.toUpperCase(),
    telefono: m.paciente.telefono,
    plan: m.paquete.nombre,
    sesionesTotales: m.sesionesTotal,
    sesionesUsadas: m.sesionesUsadas ?? 0,
    estado: m.estado,
    fechaCreacion: m.fechaCompra.toISOString(),
    fechaExpiracion: m.fechaVencimiento?.toISOString() ?? null,
    fechaActivacion: m.fechaActivacion?.toISOString() ?? null,
    precioPagado: Number(m.precioPagado),
  }));
}

// ─── REGISTER STAMP (increment session) ──────────────────────────────────────
export async function registrarSello(membresiaId: string) {
  const { tenantId } = await requireAuth();

  try {
    const membresia = await prisma.membresia.findFirst({
      where: { id: membresiaId, tenantId },
    });

    if (!membresia) {
      return { error: "Tarjeta no encontrada" };
    }

    if ((membresia.sesionesUsadas ?? 0) >= membresia.sesionesTotal) {
      return { error: "Todas las sesiones ya fueron completadas" };
    }

    await prisma.membresia.update({
      where: { id: membresiaId },
      data: {
        sesionesUsadas: { increment: 1 },
        estado:
          (membresia.sesionesUsadas ?? 0) + 1 >= membresia.sesionesTotal
            ? "vencida"
            : "activa",
      },
    });

    revalidatePath("/dashboard/ejercicios");
    return { success: true };
  } catch (error) {
    console.error("Error registering stamp:", error);
    return { error: "Error al registrar el sello." };
  }
}

// ─── KPIs ────────────────────────────────────────────────────────────────────
export async function getTarjetasKPIs() {
  const { tenantId } = await requireAuth();

  const [activas, completadas, todas] = await Promise.all([
    prisma.membresia.count({
      where: { tenantId, estado: "activa" },
    }),
    prisma.membresia.count({
      where: { tenantId, estado: "vencida" },
    }),
    prisma.membresia.count({
      where: { tenantId },
    }),
  ]);

  return { activas, completadas, total: todas };
}
