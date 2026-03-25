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

  function deriveCategoria(paqueteNombre: string): string {
    const lower = paqueteNombre.toLowerCase();
    if (lower.includes("facial")) return "facial";
    if (lower.includes("masaje")) return "masaje";
    if (lower.includes("corporal")) return "corporal";
    return "fisioterapia";
  }

  function mapEstado(dbEstado: string, usadas: number, total: number): string {
    if (dbEstado === "activa" && usadas >= total) return "completada";
    if (dbEstado === "activa") return "activa";
    if (dbEstado === "vencida") return "completada";
    if (dbEstado === "canjeada") return "canjeada";
    return "activa";
  }

  return membresias.map((m) => {
    const usadas = m.sesionesUsadas ?? 0;
    const totales = m.sesionesTotal;
    const categoria = deriveCategoria(m.paquete.nombre);
    const estado = mapEstado(m.estado ?? "activa", usadas, totales);
    const sellos = Array.from({ length: totales }, (_, i) => i < usadas);

    return {
      id: m.id,
      pacienteNombre: `${m.paciente.nombre} ${m.paciente.apellido}`,
      pacienteIniciales: `${m.paciente.nombre[0]}${m.paciente.apellido[0]}`.toUpperCase(),
      telefono: m.paciente.telefono,
      categoria,
      plan: m.paquete.nombre,
      sesionesTotales: totales,
      sesionesUsadas: usadas,
      estado,
      sellos,
      recompensa: estado === "completada" ? "1 sesión GRATIS" : `Completa ${totales} sesiones`,
      fechaCreacion: m.fechaCompra.toISOString().split("T")[0],
      fechaExpiracion: m.fechaVencimiento?.toISOString().split("T")[0] ?? "Sin fecha",
      ultimaVisita: (m.updatedAt ?? m.fechaCompra).toISOString().split("T")[0],
    };
  });
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

    revalidatePath("/dashboard/tarjetas");
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
