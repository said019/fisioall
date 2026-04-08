"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── FETCH PAGOS ─────────────────────────────────────────────────────────────
export async function getPagos(periodo?: string) {
  const { tenantId } = await requireAuth();

  const ahora = new Date();
  let fechaDesde: Date;

  switch (periodo) {
    case "mes_anterior": {
      const mes = ahora.getMonth() === 0 ? 11 : ahora.getMonth() - 1;
      const anio = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear();
      fechaDesde = new Date(anio, mes, 1);
      break;
    }
    case "3_meses":
      fechaDesde = new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1);
      break;
    case "anio":
      fechaDesde = new Date(ahora.getFullYear(), 0, 1);
      break;
    default: // este_mes
      fechaDesde = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  }

  const pagos = await prisma.pago.findMany({
    where: {
      tenantId,
      fechaPago: { gte: fechaDesde },
    },
    include: {
      paciente: {
        select: { nombre: true, apellido: true },
      },
      membresia: {
        select: { paquete: { select: { nombre: true } } },
      },
      registrador: {
        select: { nombre: true, apellido: true },
      },
    },
    orderBy: { fechaPago: "desc" },
  });

  return pagos.map((p) => ({
    id: p.id,
    pacienteNombre: `${p.paciente.nombre} ${p.paciente.apellido}`,
    pacienteIniciales: `${p.paciente.nombre[0]}${p.paciente.apellido[0]}`.toUpperCase(),
    monto: Number(p.monto),
    metodo: p.metodo,
    estado: p.estado,
    concepto: p.concepto,
    referenciaExterna: p.referenciaExterna,
    notas: p.notas,
    registradoPor: p.registrador
      ? `${p.registrador.nombre} ${p.registrador.apellido}`
      : null,
    fechaPago: p.fechaPago?.toISOString() ?? null,
    comprobanteUrl: p.comprobanteUrl ?? null,
    membresiaNombre: p.membresia?.paquete.nombre ?? null,
  }));
}

// ─── CREATE PAGO ─────────────────────────────────────────────────────────────
export async function registrarPago(prevState: unknown, formData: FormData) {
  const { tenantId, userId } = await requireAuth();

  const pacienteId = formData.get("pacienteId") as string;
  const monto = Number(formData.get("monto"));
  const metodo = formData.get("metodo") as string;
  const concepto = formData.get("concepto") as string;
  const referenciaExterna = (formData.get("referenciaExterna") as string) || null;
  const fechaPago = formData.get("fechaPago") as string;
  const notas = (formData.get("notas") as string) || null;

  if (!pacienteId || !monto || !concepto) {
    return { error: "Paciente, monto y concepto son obligatorios" };
  }

  try {
    await prisma.pago.create({
      data: {
        tenantId,
        pacienteId,
        monto,
        metodo: metodo as "efectivo" | "transferencia" | "tarjeta_debito" | "tarjeta_credito" | "otro",
        concepto,
        referenciaExterna,
        notas,
        registradoPor: userId,
        fechaPago: fechaPago ? new Date(fechaPago) : new Date(),
      },
    });

    revalidatePath("/dashboard/pagos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { error: "Error al registrar el pago. Intenta de nuevo." };
  }
}

// ─── KPIs ────────────────────────────────────────────────────────────────────
export async function getPagosKPIs() {
  const { tenantId } = await requireAuth();

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [ingresos, pendientes, reembolsos, total] = await Promise.all([
    prisma.pago.aggregate({
      where: { tenantId, estado: "pagado", fechaPago: { gte: inicioMes } },
      _sum: { monto: true },
      _count: true,
    }),
    prisma.pago.aggregate({
      where: { tenantId, estado: { in: ["pendiente", "parcial"] }, fechaPago: { gte: inicioMes } },
      _sum: { monto: true },
      _count: true,
    }),
    prisma.pago.aggregate({
      where: { tenantId, estado: "reembolsado", fechaPago: { gte: inicioMes } },
      _sum: { monto: true },
      _count: true,
    }),
    prisma.pago.count({
      where: { tenantId, fechaPago: { gte: inicioMes } },
    }),
  ]);

  return {
    ingresosMes: Number(ingresos._sum.monto ?? 0),
    ingresosCount: ingresos._count,
    pendientesMes: Number(pendientes._sum.monto ?? 0),
    pendientesCount: pendientes._count,
    reembolsosMes: Number(reembolsos._sum.monto ?? 0),
    reembolsosCount: reembolsos._count,
    totalTransacciones: total,
  };
}
