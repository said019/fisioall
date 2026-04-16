"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── FETCH SERVICIOS ────────────────────────────────────────────────────────
export async function getServicios() {
  const { tenantId } = await requireAuth();

  const servicios = await prisma.servicio.findMany({
    where: { tenantId },
    orderBy: [{ categoria: "asc" }, { orden: "asc" }, { nombre: "asc" }],
  });

  return servicios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion ?? "",
    categoria: s.categoria,
    categoriaLabel: s.categoriaLabel ?? s.categoria,
    categoriaColor: s.categoriaColor ?? "#4a7fa5",
    especialidad: s.especialidad ?? "",
    duracion: s.duracion,
    precio: Number(s.precio),
    precioDescuento: s.precioDescuento ? Number(s.precioDescuento) : null,
    sesiones: s.sesiones,
    popular: s.popular,
    activo: s.activo,
    orden: s.orden,
  }));
}

export type ServicioRow = Awaited<ReturnType<typeof getServicios>>[number];

// ─── FETCH SERVICIOS PÚBLICOS (sin auth) ─────────────────────────────────────
const DEFAULT_TENANT_SLUG = "kaya-kalp";

export async function getServiciosPublicos(tenantSlug: string = DEFAULT_TENANT_SLUG) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });

  if (!tenant) return [];

  const servicios = await prisma.servicio.findMany({
    where: { tenantId: tenant.id, activo: true },
    orderBy: [{ categoria: "asc" }, { orden: "asc" }, { nombre: "asc" }],
  });

  return servicios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion ?? "",
    categoria: s.categoria,
    categoriaLabel: s.categoriaLabel ?? s.categoria,
    categoriaColor: s.categoriaColor ?? "#4a7fa5",
    especialidad: s.especialidad ?? "",
    duracion: s.duracion,
    precio: Number(s.precio),
    precioDescuento: s.precioDescuento ? Number(s.precioDescuento) : null,
    sesiones: s.sesiones,
    popular: s.popular,
  }));
}

export type ServicioPublico = Awaited<ReturnType<typeof getServiciosPublicos>>[number];

// ─── CREAR SERVICIO ─────────────────────────────────────────────────────────
export async function crearServicio(data: {
  nombre: string;
  descripcion?: string;
  categoria: string;
  categoriaLabel?: string;
  categoriaColor?: string;
  especialidad?: string;
  duracion: number;
  precio: number;
  precioDescuento?: number | null;
  sesiones?: number | null;
  popular?: boolean;
}) {
  const { tenantId } = await requireAuth();

  // Orden: último de la categoría + 1
  const last = await prisma.servicio.findFirst({
    where: { tenantId, categoria: data.categoria },
    orderBy: { orden: "desc" },
    select: { orden: true },
  });

  await prisma.servicio.create({
    data: {
      tenantId,
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      categoria: data.categoria,
      categoriaLabel: data.categoriaLabel || null,
      categoriaColor: data.categoriaColor || null,
      especialidad: data.especialidad || null,
      duracion: data.duracion,
      precio: data.precio,
      precioDescuento: data.precioDescuento ?? null,
      sesiones: data.sesiones ?? null,
      popular: data.popular ?? false,
      orden: (last?.orden ?? 0) + 1,
    },
  });

  revalidatePath("/dashboard/servicios");
  revalidatePath("/agendar");
  revalidatePath("/");
  return { success: true };
}

// ─── ACTUALIZAR SERVICIO ────────────────────────────────────────────────────
export async function actualizarServicio(
  id: string,
  data: {
    nombre?: string;
    descripcion?: string;
    categoria?: string;
    categoriaLabel?: string;
    categoriaColor?: string;
    especialidad?: string;
    duracion?: number;
    precio?: number;
    precioDescuento?: number | null;
    sesiones?: number | null;
    popular?: boolean;
    activo?: boolean;
  }
) {
  const { tenantId } = await requireAuth();

  await prisma.servicio.updateMany({
    where: { id, tenantId },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion || null }),
      ...(data.categoria !== undefined && { categoria: data.categoria }),
      ...(data.categoriaLabel !== undefined && { categoriaLabel: data.categoriaLabel || null }),
      ...(data.categoriaColor !== undefined && { categoriaColor: data.categoriaColor || null }),
      ...(data.especialidad !== undefined && { especialidad: data.especialidad || null }),
      ...(data.duracion !== undefined && { duracion: data.duracion }),
      ...(data.precio !== undefined && { precio: data.precio }),
      ...(data.precioDescuento !== undefined && { precioDescuento: data.precioDescuento }),
      ...(data.sesiones !== undefined && { sesiones: data.sesiones }),
      ...(data.popular !== undefined && { popular: data.popular }),
      ...(data.activo !== undefined && { activo: data.activo }),
    },
  });

  revalidatePath("/dashboard/servicios");
  revalidatePath("/agendar");
  revalidatePath("/");
  return { success: true };
}

// ─── TOGGLE ACTIVO ──────────────────────────────────────────────────────────
export async function toggleServicio(id: string) {
  const { tenantId } = await requireAuth();

  const servicio = await prisma.servicio.findFirst({
    where: { id, tenantId },
    select: { activo: true },
  });
  if (!servicio) return { error: "No encontrado" };

  await prisma.servicio.updateMany({
    where: { id, tenantId },
    data: { activo: !servicio.activo },
  });

  revalidatePath("/dashboard/servicios");
  revalidatePath("/agendar");
  revalidatePath("/");
  return { success: true };
}

// ─── ELIMINAR SERVICIO ──────────────────────────────────────────────────────
export async function eliminarServicio(id: string) {
  const { tenantId } = await requireAuth();

  await prisma.servicio.deleteMany({
    where: { id, tenantId },
  });

  revalidatePath("/dashboard/servicios");
  revalidatePath("/agendar");
  revalidatePath("/");
  return { success: true };
}
