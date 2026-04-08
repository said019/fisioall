"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Admin confirma que recibió el anticipo (transferencia o efectivo).
 */
export async function confirmarPagoAnticipo(
  pagoId: string,
  metodo: "transferencia" | "efectivo"
) {
  const { tenantId } = await requireAuth();

  const pago = await prisma.pago.findFirst({
    where: { id: pagoId, tenantId },
    select: { citaId: true },
  });

  if (!pago) return { error: "Pago no encontrado" };

  await prisma.$transaction([
    prisma.pago.update({
      where: { id: pagoId },
      data: { estado: "pagado", metodo },
    }),
    ...(pago.citaId
      ? [
          prisma.cita.update({
            where: { id: pago.citaId },
            data: { estado: "confirmada", anticipoPagado: true },
          }),
        ]
      : []),
  ]);

  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/pagos");
  return { success: true };
}

/**
 * Cobro final de sesión desde panel "Cobrar".
 * Si aplicarAnticipo=true Y el paciente tiene saldo, se descuenta.
 */
export async function cobrarSesion(params: {
  pacienteId: string;
  citaId: string;
  montoTotal: number;
  metodo: string;
  aplicarAnticipo: boolean;
}) {
  const { tenantId, userId } = await requireAuth();

  const paciente = await prisma.paciente.findFirst({
    where: { id: params.pacienteId, tenantId },
    select: { anticipoSaldo: true },
  });

  const saldoDisponible = Number(paciente?.anticipoSaldo ?? 0);
  const montoAnticipo =
    params.aplicarAnticipo && saldoDisponible > 0
      ? Math.min(saldoDisponible, params.montoTotal)
      : 0;
  const montoFinal = params.montoTotal - montoAnticipo;

  await prisma.$transaction([
    prisma.pago.create({
      data: {
        tenantId,
        pacienteId: params.pacienteId,
        citaId: params.citaId,
        monto: montoFinal,
        metodo: params.metodo as "efectivo" | "transferencia" | "tarjeta_debito" | "tarjeta_credito" | "otro",
        concepto:
          montoAnticipo > 0
            ? `Sesión — anticipo aplicado $${montoAnticipo}`
            : "Sesión — precio completo",
        estado: "pagado",
        registradoPor: userId,
        fechaPago: new Date(),
        aplicaAnticipo: montoAnticipo > 0,
        montoAnticipo: montoAnticipo > 0 ? montoAnticipo : undefined,
      },
    }),
    ...(montoAnticipo > 0
      ? [
          prisma.paciente.update({
            where: { id: params.pacienteId },
            data: { anticipoSaldo: { decrement: montoAnticipo } },
          }),
        ]
      : []),
    prisma.cita.update({
      where: { id: params.citaId },
      data: { estado: "completada" },
    }),
  ]);

  revalidatePath("/dashboard/pagos");
  revalidatePath("/dashboard/agenda");
  return { success: true, montoFinal, montoAnticipo };
}

/**
 * Obtiene saldo de anticipo del paciente para mostrarlo en el panel de cobro.
 */
export async function getSaldoAnticipo(pacienteId: string) {
  const { tenantId } = await requireAuth();
  const paciente = await prisma.paciente.findFirst({
    where: { id: pacienteId, tenantId },
    select: { anticipoSaldo: true, nombre: true, apellido: true },
  });
  return {
    saldo: Number(paciente?.anticipoSaldo ?? 0),
    nombre: `${paciente?.nombre ?? ""} ${paciente?.apellido ?? ""}`.trim(),
  };
}
