"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const TENANT_SLUG = "kaya-kalp";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
export interface HorarioDiaData {
  diaKey: string;
  activo: boolean;
  inicio: string;
  fin: string;
}

export interface ConfigComidaData {
  activo: boolean;
  inicio: string;
  fin: string;
}

export interface ConfigClinicaData {
  nombre: string;
  slogan: string;
  telefono: string;
  whatsapp: string;
  email: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  googleMapsUrl: string;
  facebook: string;
  instagram: string;
  sitioWeb: string;
  duracionDefault: number;
  intervaloSlots: number;
}

export interface DiaBloqueadoData {
  fecha: string; // YYYY-MM-DD
  motivo: string;
  fisioIds?: string[]; // si vacío/undefined → aplica a todos
  horaInicio?: string; // HH:MM, si undefined → todo el día
  horaFin?: string;    // HH:MM
}

export interface ConfigCompleta {
  clinica: ConfigClinicaData;
  horarios: HorarioDiaData[];
  comida: ConfigComidaData;
  diasBloqueados: DiaBloqueadoData[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEER CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────
export async function getConfiguracion(): Promise<ConfigCompleta> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
  });

  if (!tenant) throw new Error("Tenant not found");

  // El campo `configuracion` es JSON — ahí guardamos horarios, comida, extras
  const cfg = (tenant.configuracion ?? {}) as Record<string, unknown>;

  const clinica: ConfigClinicaData = {
    nombre: tenant.nombre ?? "Kaya Kalp",
    slogan: (cfg.slogan as string) ?? "Dando vida a tu cuerpo",
    telefono: tenant.telefono ?? "",
    whatsapp: (cfg.whatsapp as string) ?? "",
    email: tenant.emailContacto ?? "",
    direccion: tenant.direccion ?? "",
    ciudad: tenant.ciudad ?? "",
    estado: tenant.estado ?? "",
    codigoPostal: (cfg.codigoPostal as string) ?? "",
    googleMapsUrl: (cfg.googleMapsUrl as string) ?? "",
    facebook: (cfg.facebook as string) ?? "",
    instagram: (cfg.instagram as string) ?? "",
    sitioWeb: (cfg.sitioWeb as string) ?? "",
    duracionDefault: (cfg.duracionDefault as number) ?? 60,
    intervaloSlots: (cfg.intervaloSlots as number) ?? 60,
  };

  const horarios: HorarioDiaData[] = (cfg.horarios as HorarioDiaData[]) ?? [
    { diaKey: "lunes",     activo: true,  inicio: "09:00", fin: "19:00" },
    { diaKey: "martes",    activo: true,  inicio: "09:00", fin: "19:00" },
    { diaKey: "miercoles", activo: true,  inicio: "09:00", fin: "19:00" },
    { diaKey: "jueves",    activo: true,  inicio: "09:00", fin: "19:00" },
    { diaKey: "viernes",   activo: true,  inicio: "09:00", fin: "19:00" },
    { diaKey: "sabado",    activo: true,  inicio: "09:00", fin: "14:00" },
    { diaKey: "domingo",   activo: false, inicio: "09:00", fin: "14:00" },
  ];

  const comida: ConfigComidaData = (cfg.comida as ConfigComidaData) ?? {
    activo: true,
    inicio: "14:00",
    fin: "15:00",
  };

  const diasBloqueados: DiaBloqueadoData[] = (cfg.diasBloqueados as DiaBloqueadoData[]) ?? [];

  return { clinica, horarios, comida, diasBloqueados };
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDAR CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────
export async function guardarConfiguracion(data: ConfigCompleta) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
  });

  if (!tenant) return { error: "Tenant no encontrado" };

  // Campos directos del Tenant
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      nombre: data.clinica.nombre,
      telefono: data.clinica.telefono,
      emailContacto: data.clinica.email,
      direccion: data.clinica.direccion,
      ciudad: data.clinica.ciudad,
      estado: data.clinica.estado,
      // JSON flexible para todo lo demás
      configuracion: JSON.parse(JSON.stringify({
        slogan: data.clinica.slogan,
        whatsapp: data.clinica.whatsapp,
        codigoPostal: data.clinica.codigoPostal,
        googleMapsUrl: data.clinica.googleMapsUrl,
        facebook: data.clinica.facebook,
        instagram: data.clinica.instagram,
        sitioWeb: data.clinica.sitioWeb,
        duracionDefault: data.clinica.duracionDefault,
        intervaloSlots: data.clinica.intervaloSlots,
        horarios: data.horarios,
        comida: data.comida,
        diasBloqueados: data.diasBloqueados,
      })),
    },
  });

  // Revalidar todas las páginas que usan estos datos
  revalidatePath("/");
  revalidatePath("/agendar");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/configuracion");
  revalidatePath("/dashboard/agenda");

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE CALENDAR STATUS
// ─────────────────────────────────────────────────────────────────────────────
export async function getGoogleCalendarStatus(): Promise<{
  connected: boolean;
  email: string | null;
}> {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return { connected: false, email: null };

  const token = await prisma.googleCalendarToken.findUnique({
    where: { tenantId: tenant.id },
    select: { email: true },
  });

  return { connected: !!token, email: token?.email ?? null };
}

export async function syncGoogleCalendar(): Promise<{ synced: number; errors: number } | { error: string }> {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return { error: "Tenant no encontrado" };

  const { syncCitasToGoogle } = await import("@/lib/google-calendar");
  const result = await syncCitasToGoogle(tenant.id);

  revalidatePath("/dashboard/agenda");
  return result;
}

export async function disconnectGoogleCalendar() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return { error: "Tenant no encontrado" };

  const { disconnectCalendar } = await import("@/lib/google-calendar");
  await disconnectCalendar(tenant.id);

  revalidatePath("/dashboard/configuracion");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// LECTURA PÚBLICA — para landing y agendar
// ─────────────────────────────────────────────────────────────────────────────
export async function getConfigPublica() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
  });

  if (!tenant) return null;

  const cfg = (tenant.configuracion ?? {}) as Record<string, unknown>;

  return {
    nombre: tenant.nombre,
    slogan: (cfg.slogan as string) ?? "Dando vida a tu cuerpo",
    telefono: tenant.telefono ?? "",
    whatsapp: (cfg.whatsapp as string) ?? "",
    email: tenant.emailContacto ?? "",
    direccion: tenant.direccion ?? "",
    ciudad: tenant.ciudad ?? "",
    estado: tenant.estado ?? "",
    facebook: (cfg.facebook as string) ?? "",
    instagram: (cfg.instagram as string) ?? "",
    sitioWeb: (cfg.sitioWeb as string) ?? "",
    googleMapsUrl: (cfg.googleMapsUrl as string) ?? "",
    duracionDefault: (cfg.duracionDefault as number) ?? 60,
    intervaloSlots: (cfg.intervaloSlots as number) ?? 60,
    horarios: (cfg.horarios as HorarioDiaData[]) ?? [],
    comida: (cfg.comida as ConfigComidaData) ?? { activo: false, inicio: "14:00", fin: "15:00" },
    diasBloqueados: (cfg.diasBloqueados as DiaBloqueadoData[]) ?? [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HORARIOS POR TERAPEUTA (Feature 5 — Kaya Kalp)
// ─────────────────────────────────────────────────────────────────────────────
export async function getHorariosTerapeutas() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return [];

  const [horarios, cubiculos, usuarios] = await Promise.all([
    prisma.horarioUsuario.findMany({ where: { tenantId: tenant.id } }),
    prisma.cubiculoUsuario.findMany({ where: { tenantId: tenant.id } }),
    prisma.usuario.findMany({
      where: { tenantId: tenant.id, activo: true },
      select: { id: true, nombre: true, apellido: true, rol: true, colorAgenda: true },
    }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return usuarios.map((u: any) => ({
    ...u,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    horarios: horarios.filter((h: any) => h.usuarioId === u.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cubiculos: cubiculos.filter((c: any) => c.usuarioId === u.id),
  }));
}

export async function guardarHorariosTerapeutas(data: {
  usuarioId: string;
  horarios: { diaKey: string; activo: boolean; franjas: { inicio: string; fin: string }[] }[];
  cubiculos: { tipoSesion: string; cubiculoPref: number[] }[];
}) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return { error: "Tenant no encontrado" };

  await prisma.$transaction([
    // Borrar horarios existentes del usuario y recrear
    prisma.horarioUsuario.deleteMany({
      where: { tenantId: tenant.id, usuarioId: data.usuarioId },
    }),
    ...data.horarios
      .filter((h) => h.activo)
      .map((h) =>
        prisma.horarioUsuario.create({
          data: {
            tenantId: tenant.id,
            usuarioId: data.usuarioId,
            diaKey: h.diaKey,
            franjas: h.franjas,
            activo: true,
          },
        })
      ),
    // Borrar cubículos existentes y recrear
    prisma.cubiculoUsuario.deleteMany({
      where: { tenantId: tenant.id, usuarioId: data.usuarioId },
    }),
    ...data.cubiculos.map((c) =>
      prisma.cubiculoUsuario.create({
        data: {
          tenantId: tenant.id,
          usuarioId: data.usuarioId,
          tipoSesion: c.tipoSesion,
          cubiculoPref: c.cubiculoPref,
        },
      })
    ),
  ]);

  revalidatePath("/dashboard/configuracion");
  revalidatePath("/dashboard/agenda");
  return { ok: true };
}

export async function actualizarColorUsuario(usuarioId: string, color: string) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  if (!tenant) return { error: "Tenant no encontrado" };

  await prisma.usuario.update({
    where: { id: usuarioId, tenantId: tenant.id },
    data: { colorAgenda: color },
  });

  revalidatePath("/dashboard/agenda");
  revalidatePath("/dashboard/configuracion");
  return { ok: true };
}
