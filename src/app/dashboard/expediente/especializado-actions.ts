"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function guardarExpedienteEspecializado(params: {
  pacienteId: string;
  tipo: "fisioterapia" | "suelo_pelvico" | "cosme";
  esInicial: boolean;
  datosJson: Record<string, unknown>;
  citaId?: string;
}) {
  const { tenantId, userId } = await requireAuth();

  // Inicial: una sola fila por paciente+tipo (evaluación de onboarding).
  // Seguimiento: una sola fila por cita+tipo.
  const existing = await prisma.expedienteEspecializado.findFirst({
    where: {
      tenantId,
      pacienteId: params.pacienteId,
      tipo: params.tipo,
      esInicial: params.esInicial,
      ...(params.esInicial ? {} : { citaId: params.citaId ?? null }),
    },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    await prisma.expedienteEspecializado.update({
      where: { id: existing.id },
      data: {
        datosJson: params.datosJson as Prisma.InputJsonValue,
        ...(params.esInicial ? {} : { citaId: params.citaId ?? null }),
      },
    });
  } else {
    await prisma.expedienteEspecializado.create({
      data: {
        tenantId,
        pacienteId: params.pacienteId,
        tipo: params.tipo,
        esInicial: params.esInicial,
        datosJson: params.datosJson as Prisma.InputJsonValue,
        citaId: params.citaId ?? null,
        creadoPor: userId,
      },
    });
  }

  revalidatePath("/dashboard/expediente");
  revalidatePath("/dashboard/pacientes");
  return { success: true };
}

export async function getExpedientesEspecializados(pacienteId: string) {
  const { tenantId } = await requireAuth();

  const expedientes = await prisma.expedienteEspecializado.findMany({
    where: { tenantId, pacienteId },
    orderBy: { createdAt: "desc" },
  });

  return expedientes;
}

export async function getTipoSesionDeCita(citaId: string) {
  const { tenantId } = await requireAuth();

  const cita = await prisma.cita.findFirst({
    where: { id: citaId, tenantId },
    select: { tipoSesion: true },
  });

  return cita?.tipoSesion ?? "fisioterapia";
}
