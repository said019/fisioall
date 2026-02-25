"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { BodyMapSnapshot, NuevaMarcaForm, SnapshotTipo } from "@/types/bodymap";
import { TIPO_COLORS } from "@/types/bodymap";

// Prisma client cast — needed until TS server picks up freshly generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// ─────────────────────────────────────────────────────────────────────────────
// GET: snapshot más reciente del paciente
// ─────────────────────────────────────────────────────────────────────────────
export async function getSnapshotActual(
  pacienteId: string
): Promise<BodyMapSnapshot | null> {
  const session = await getSession();
  if (!session?.tenantId) return null;

  const snapshot = await db.bodyMapSnapshot.findFirst({
    where: { pacienteId, tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
    include: { marcas: true },
  });

  return snapshot as BodyMapSnapshot | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: historial completo (todos los snapshots, orden cronológico)
// ─────────────────────────────────────────────────────────────────────────────
export async function getHistorialSnapshots(
  pacienteId: string
): Promise<BodyMapSnapshot[]> {
  const session = await getSession();
  if (!session?.tenantId) return [];

  const snapshots = await db.bodyMapSnapshot.findMany({
    where: { pacienteId, tenantId: session.tenantId },
    orderBy: { createdAt: "asc" },
    include: { marcas: true },
  });

  return snapshots as BodyMapSnapshot[];
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: guardar nuevo snapshot con sus marcas
// ─────────────────────────────────────────────────────────────────────────────
export async function guardarSnapshot(params: {
  pacienteId: string;
  citaId?: string;
  tipo: SnapshotTipo;
  marcas: NuevaMarcaForm[];
  notas?: string;
}): Promise<{ ok: boolean; snapshot?: BodyMapSnapshot; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.tenantId) return { ok: false, error: "No autorizado" };

    const totalPrevio = await db.bodyMapSnapshot.count({
      where: { pacienteId: params.pacienteId, tenantId: session.tenantId },
    });

    const snapshot = await db.bodyMapSnapshot.create({
      data: {
        pacienteId: params.pacienteId,
        tenantId: session.tenantId,
        citaId: params.citaId ?? null,
        tipo: params.tipo,
        sesionNum: totalPrevio,
        notas: params.notas ?? null,
        marcas: {
          create: params.marcas.map((m) => ({
            zonaId: m.zonaId,
            zonaLabel: m.zonaLabel,
            vista: m.vista,
            tipo: m.tipo,
            intensidad: m.intensidad,
            lateralidad: m.lateralidad,
            notas: m.notas || null,
            colorHex: m.colorHex ?? TIPO_COLORS[m.tipo] ?? "#EF4444",
          })),
        },
      },
      include: { marcas: true },
    });

    revalidatePath("/dashboard/pacientes");
    revalidatePath("/dashboard/expediente");

    return { ok: true, snapshot: snapshot as BodyMapSnapshot };
  } catch (err) {
    console.error("[guardarSnapshot]", err);
    return { ok: false, error: "Error al guardar el snapshot" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK: ¿el paciente tiene al menos un snapshot?
// ─────────────────────────────────────────────────────────────────────────────
export async function tieneMapa(pacienteId: string): Promise<boolean> {
  const session = await getSession();
  if (!session?.tenantId) return false;

  const count = await db.bodyMapSnapshot.count({
    where: { pacienteId, tenantId: session.tenantId },
  });

  return count > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK: ¿el body map lleva N+ sesiones sin actualizarse?
// ─────────────────────────────────────────────────────────────────────────────
export async function bodyMapNecesitaActualizacion(
  pacienteId: string,
  limite = 4
): Promise<boolean> {
  const session = await getSession();
  if (!session?.tenantId) return false;

  const [ultimoSnapshot, totalCitas] = await Promise.all([
    db.bodyMapSnapshot.findFirst({
      where: { pacienteId, tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
      select: { sesionNum: true },
    }),
    prisma.cita.count({
      where: { pacienteId, tenantId: session.tenantId, estado: "completada" },
    }),
  ]);

  if (!ultimoSnapshot) return true;
  return totalCitas - ultimoSnapshot.sesionNum >= limite;
}