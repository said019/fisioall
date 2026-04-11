"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyPassUpdateWithAlert, notifyPassUpdate } from "@/lib/apple-push";

// ─── FETCH TARJETAS DE LEALTAD ──────────────────────────────────────────────
export async function getTarjetasLealtad() {
  const { tenantId } = await requireAuth();

  const tarjetas = await prisma.tarjetaLealtad.findMany({
    where: { tenantId },
    include: {
      paciente: {
        select: { nombre: true, apellido: true, telefono: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return tarjetas.map((t) => {
    const usados = t.sellosUsados;
    const totales = t.sellosTotal;
    const sellos = Array.from({ length: totales }, (_, i) => i < usados);

    let estado: string = t.estado;
    if (estado === "activa" && usados >= totales) estado = "completada";

    return {
      id: t.id,
      pacienteNombre: `${t.paciente.nombre} ${t.paciente.apellido}`,
      pacienteIniciales: `${t.paciente.nombre[0]}${t.paciente.apellido[0]}`.toUpperCase(),
      telefono: t.paciente.telefono,
      sellosTotal: totales,
      sellosUsados: usados,
      estado,
      sellos,
      recompensa: t.recompensa,
      fechaCreacion: t.fechaCreacion.toISOString().split("T")[0],
      fechaExpiracion: t.fechaExpiracion?.toISOString().split("T")[0] ?? "Sin fecha",
      ultimaVisita: (t.updatedAt ?? t.fechaCreacion).toISOString().split("T")[0],
    };
  });
}

// ─── FETCH PACIENTES (for create modal) ──────────────────────────────────────
export async function getPacientesTarjetas() {
  const { tenantId } = await requireAuth();

  const pacientes = await prisma.paciente.findMany({
    where: { tenantId, activo: true },
    select: { id: true, nombre: true, apellido: true, telefono: true },
    orderBy: { nombre: "asc" },
  });

  return pacientes.map((p) => ({
    id: p.id,
    nombre: `${p.nombre} ${p.apellido}`,
    telefono: p.telefono,
  }));
}

// ─── CREAR TARJETA DE LEALTAD ────────────────────────────────────────────────
export async function crearTarjeta(data: {
  pacienteId: string;
  sellosTotal: number;
  recompensa: string;
  fechaExpiracion?: string;
}) {
  const { tenantId } = await requireAuth();

  if (data.sellosTotal < 1 || data.sellosTotal > 50) {
    return { error: "El número de sellos debe ser entre 1 y 50." };
  }

  try {
    await prisma.tarjetaLealtad.create({
      data: {
        tenantId,
        pacienteId: data.pacienteId,
        sellosTotal: data.sellosTotal,
        recompensa: data.recompensa,
        fechaExpiracion: data.fechaExpiracion
          ? new Date(data.fechaExpiracion)
          : null,
      },
    });

    revalidatePath("/dashboard/tarjetas");
    return { success: true };
  } catch (error) {
    console.error("Error creating tarjeta:", error);
    return { error: "Error al crear la tarjeta." };
  }
}

// ─── REGISTRAR SELLO ─────────────────────────────────────────────────────────
export async function registrarSello(tarjetaId: string) {
  const { tenantId } = await requireAuth();

  try {
    const tarjeta = await prisma.tarjetaLealtad.findFirst({
      where: { id: tarjetaId, tenantId },
    });

    if (!tarjeta) {
      return { error: "Tarjeta no encontrada" };
    }

    if (tarjeta.sellosUsados >= tarjeta.sellosTotal) {
      return { error: "Todos los sellos ya fueron completados" };
    }

    const nuevoTotal = tarjeta.sellosUsados + 1;
    const completada = nuevoTotal >= tarjeta.sellosTotal;

    await prisma.tarjetaLealtad.update({
      where: { id: tarjetaId },
      data: {
        sellosUsados: nuevoTotal,
        estado: completada ? "completada" : "activa",
      },
    });

    // Notify Apple Wallet devices
    const message = completada
      ? `¡Felicidades! Completaste tus ${tarjeta.sellosTotal} sellos. Tu recompensa te espera.`
      : `Sello registrado. Llevas ${nuevoTotal} de ${tarjeta.sellosTotal}.`;
    notifyPassUpdateWithAlert(tarjetaId, message).catch(console.error);

    revalidatePath("/dashboard/tarjetas");
    return { success: true };
  } catch (error) {
    console.error("Error registering stamp:", error);
    return { error: "Error al registrar el sello." };
  }
}

// ─── CANJEAR RECOMPENSA ──────────────────────────────────────────────────────
export async function canjearRecompensa(tarjetaId: string) {
  const { tenantId } = await requireAuth();

  try {
    const tarjeta = await prisma.tarjetaLealtad.findFirst({
      where: { id: tarjetaId, tenantId, estado: "completada" },
    });

    if (!tarjeta) {
      return { error: "Tarjeta no encontrada o no está completada" };
    }

    await prisma.tarjetaLealtad.update({
      where: { id: tarjetaId },
      data: { estado: "canjeada" },
    });

    // Notify Apple Wallet devices
    notifyPassUpdate(tarjetaId).catch(console.error);

    revalidatePath("/dashboard/tarjetas");
    return { success: true };
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return { error: "Error al canjear la recompensa." };
  }
}
