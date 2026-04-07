"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function guardarExpedienteEspecializado(params: {
  pacienteId: string;
  tipo: "fisioterapia" | "suelo_pelvico" | "cosme";
  esInicial: boolean;
  datosJson: Record<string, unknown>;
  citaId?: string;
}) {
  const { tenantId, userId } = await requireAuth();

  await prisma.expedienteEspecializado.create({
    data: {
      tenantId,
      pacienteId: params.pacienteId,
      tipo: params.tipo,
      esInicial: params.esInicial,
      datosJson: params.datosJson,
      citaId: params.citaId ?? null,
      creadoPor: userId,
    },
  });

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
