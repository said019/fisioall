"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * Fetches all KPIs and data for the main Dashboard page.
 */
export async function getDashboardData() {
  const { tenantId } = await requireAuth();

  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const finHoy = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000);
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [
    citasHoy,
    pacientesActivos,
    membresiasActivas,
    ingresosMes,
    citasHoyData,
    equipoData,
    anticiposPendientesData,
  ] = await Promise.all([
    // Count today's appointments
    prisma.cita.count({
      where: {
        tenantId,
        fechaHoraInicio: { gte: inicioHoy, lt: finHoy },
      },
    }),

    // Count active patients
    prisma.paciente.count({
      where: { tenantId, activo: true },
    }),

    // Count active memberships
    prisma.membresia.count({
      where: { tenantId, estado: "activa" },
    }),

    // Sum income this month
    prisma.pago.aggregate({
      where: {
        tenantId,
        estado: "pagado",
        fechaPago: { gte: inicioMes },
      },
      _sum: { monto: true },
    }),

    // Today's appointments with details
    prisma.cita.findMany({
      where: {
        tenantId,
        fechaHoraInicio: { gte: inicioHoy, lt: finHoy },
      },
      include: {
        paciente: { select: { nombre: true, apellido: true } },
        fisioterapeuta: { select: { nombre: true, apellido: true } },
      },
      orderBy: { fechaHoraInicio: "asc" },
    }),

    // Team members
    prisma.usuario.findMany({
      where: { tenantId, activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        rol: true,
        ultimoLogin: true,
        _count: {
          select: {
            citasAtendidas: {
              where: {
                fechaHoraInicio: { gte: inicioHoy, lt: finHoy },
              },
            },
          },
        },
      },
    }),

    // Pending anticipos to verify
    prisma.pago.findMany({
      where: {
        tenantId,
        concepto: "Anticipo obligatorio",
        comprobanteUrl: { not: null },
        cita: { estado: "pendiente_anticipo" },
      },
      include: {
        paciente: { select: { nombre: true, apellido: true, telefono: true } },
        cita: { select: { id: true, fechaHoraInicio: true, tipoSesion: true, estado: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    kpis: {
      citasHoy,
      pacientesActivos,
      membresiasActivas,
      ingresosMes: Number(ingresosMes._sum.monto ?? 0),
    },
    citasHoy: citasHoyData.map((c) => ({
      id: c.id,
      hora: c.fechaHoraInicio.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      paciente: `${c.paciente.nombre} ${c.paciente.apellido}`,
      iniciales: `${c.paciente.nombre[0]}${c.paciente.apellido[0]}`.toUpperCase(),
      fisioterapeuta: `${c.fisioterapeuta.nombre} ${c.fisioterapeuta.apellido}`,
      motivo: c.tipoSesion ?? "Sesión",
      estado: c.estado,
      sala: c.sala,
    })),
    equipo: equipoData.map((u) => ({
      id: u.id,
      nombre: `${u.nombre} ${u.apellido}`,
      iniciales: `${u.nombre[0]}${u.apellido[0]}`.toUpperCase(),
      rol: u.rol,
      citasHoy: u._count.citasAtendidas,
      ultimoLogin: u.ultimoLogin?.toISOString() ?? null,
    })),
    anticiposPendientes: anticiposPendientesData.map((a) => ({
      id: a.id,
      paciente: `${a.paciente.nombre} ${a.paciente.apellido}`,
      telefono: a.paciente.telefono,
      monto: Number(a.monto),
      comprobanteUrl: a.comprobanteUrl,
      fechaPago: a.fechaPago?.toISOString() ?? a.createdAt?.toISOString() ?? new Date().toISOString(),
      cita: a.cita
        ? {
            id: a.cita.id,
            fecha: a.cita.fechaHoraInicio.toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "short",
            }),
            hora: a.cita.fechaHoraInicio.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            tipoSesion: a.cita.tipoSesion ?? "Sesión",
            estado: a.cita.estado,
          }
        : null,
    })),
  };
}

/**
 * Fetches reportes/analytics data.
 */
export async function getReportesData(periodo?: string) {
  const { tenantId } = await requireAuth();

  const ahora = new Date();
  let mesesAtras = 6;
  if (periodo === "3_meses") mesesAtras = 3;
  if (periodo === "anio") mesesAtras = 12;

  const fechaDesde = new Date(ahora.getFullYear(), ahora.getMonth() - mesesAtras, 1);
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const [
    pacientesAtendidos,
    sesionesCompletadas,
    sesionesTotales,
    ,
    topPacientes,
    npsPromedio,
  ] = await Promise.all([
    prisma.paciente.count({
      where: {
        tenantId,
        citas: { some: { fechaHoraInicio: { gte: inicioMes } } },
      },
    }),

    prisma.cita.count({
      where: { tenantId, estado: "completada", fechaHoraInicio: { gte: inicioMes } },
    }),

    prisma.cita.count({
      where: { tenantId, fechaHoraInicio: { gte: inicioMes } },
    }),

    // Monthly income for chart
    prisma.pago.groupBy({
      by: ["fechaPago"],
      where: {
        tenantId,
        estado: "pagado",
        fechaPago: { gte: fechaDesde },
      },
      _sum: { monto: true },
    }),

    // Top patients by sessions
    prisma.paciente.findMany({
      where: { tenantId, activo: true },
      select: {
        nombre: true,
        apellido: true,
        totalSesiones: true,
        _count: { select: { pagos: true } },
      },
      orderBy: { totalSesiones: "desc" },
      take: 5,
    }),

    // Average NPS
    prisma.encuestaSesion.aggregate({
      where: {
        cita: { tenantId },
        respondida: true,
        npsScore: { not: null },
      },
      _avg: { npsScore: true },
    }),
  ]);

  return {
    pacientesAtendidos,
    sesionesCompletadas,
    sesionesTotales,
    npsPromedio: npsPromedio._avg.npsScore ?? 0,
    topPacientes: topPacientes.map((p) => ({
      nombre: `${p.nombre} ${p.apellido}`,
      iniciales: `${p.nombre[0]}${p.apellido[0]}`.toUpperCase(),
      sesiones: p.totalSesiones ?? 0,
    })),
  };
}
