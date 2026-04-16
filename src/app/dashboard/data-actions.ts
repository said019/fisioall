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
  const inicioAyer = new Date(inicioHoy.getTime() - 24 * 60 * 60 * 1000);
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const inicio6Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);

  const [
    citasHoy,
    citasAyer,
    pacientesActivos,
    pacientesActivosMesAnterior,
    membresiasActivas,
    ingresosMes,
    sesionesCompletadasMes,
    sesionesCompletadasMesAnterior,
    citasHoyData,
    equipoData,
    anticiposPendientesData,
    membresiasPorVencerData,
    sesionesUltimos6Raw,
  ] = await Promise.all([
    // Count today's appointments
    prisma.cita.count({
      where: {
        tenantId,
        fechaHoraInicio: { gte: inicioHoy, lt: finHoy },
      },
    }),

    // Count yesterday's appointments (delta)
    prisma.cita.count({
      where: {
        tenantId,
        fechaHoraInicio: { gte: inicioAyer, lt: inicioHoy },
      },
    }),

    // Count active patients
    prisma.paciente.count({
      where: { tenantId, activo: true },
    }),

    // Pacientes activos al cierre del mes anterior
    prisma.paciente.count({
      where: { tenantId, activo: true, createdAt: { lt: inicioMes } },
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

    // Sesiones completadas este mes
    prisma.cita.count({
      where: {
        tenantId,
        estado: "completada",
        fechaHoraInicio: { gte: inicioMes },
      },
    }),

    // Sesiones completadas mes anterior (delta)
    prisma.cita.count({
      where: {
        tenantId,
        estado: "completada",
        fechaHoraInicio: { gte: inicioMesAnterior, lt: inicioMes },
      },
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

    // Membresías por vencer (sesiones restantes <= 2 y activas)
    prisma.membresia.findMany({
      where: {
        tenantId,
        estado: "activa",
      },
      select: {
        id: true,
        sesionesTotal: true,
        sesionesUsadas: true,
        paciente: { select: { nombre: true, apellido: true } },
        paquete: { select: { nombre: true } },
      },
      take: 30,
    }),

    // Sesiones completadas — últimos 6 meses (para mini chart)
    prisma.cita.findMany({
      where: {
        tenantId,
        estado: "completada",
        fechaHoraInicio: { gte: inicio6Meses },
      },
      select: { fechaHoraInicio: true },
    }),
  ]);

  // Derivar sesiones por mes (últimos 6)
  const sesionesPorMes: { mes: string; valor: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    sesionesPorMes.push({
      mes: d.toLocaleDateString("es-MX", { month: "short" }).replace(".", ""),
      valor: 0,
    });
  }
  for (const s of sesionesUltimos6Raw) {
    const d = s.fechaHoraInicio;
    const diffMonths = (hoy.getFullYear() - d.getFullYear()) * 12 + (hoy.getMonth() - d.getMonth());
    const idx = 5 - diffMonths;
    if (idx >= 0 && idx < sesionesPorMes.length) sesionesPorMes[idx].valor++;
  }

  // Membresías por vencer (restantes <= 2, ordenadas por restantes asc)
  const membresiasPorVencer = membresiasPorVencerData
    .map((m) => ({
      id: m.id,
      nombre: `${m.paciente.nombre} ${m.paciente.apellido}`,
      iniciales: `${m.paciente.nombre[0]}${m.paciente.apellido[0]}`.toUpperCase(),
      plan: m.paquete.nombre,
      sesionesUsadas: m.sesionesUsadas ?? 0,
      sesionesTotales: m.sesionesTotal,
      sesionesRestantes: m.sesionesTotal - (m.sesionesUsadas ?? 0),
    }))
    .filter((m) => m.sesionesRestantes <= 2)
    .sort((a, b) => a.sesionesRestantes - b.sesionesRestantes)
    .slice(0, 5);

  const citasDelta = citasHoy - citasAyer;
  const pacientesDelta = pacientesActivos - pacientesActivosMesAnterior;
  const sesionesDelta = sesionesCompletadasMes - sesionesCompletadasMesAnterior;

  return {
    fechaHoy: hoy.toISOString(),
    kpis: {
      citasHoy,
      citasDelta,
      pacientesActivos,
      pacientesDelta,
      membresiasActivas,
      membresiasPorVencer: membresiasPorVencer.length,
      ingresosMes: Number(ingresosMes._sum.monto ?? 0),
      sesionesCompletadas: sesionesCompletadasMes,
      sesionesDelta,
    },
    sesionesPorMes,
    membresiasPorVencer,
    citasHoy: citasHoyData.map((c) => ({
      id: c.id,
      hora: c.fechaHoraInicio.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Mexico_City",
      }),
      paciente: `${c.paciente.nombre} ${c.paciente.apellido}`,
      iniciales: `${c.paciente.nombre[0]}${c.paciente.apellido[0]}`.toUpperCase(),
      fisioterapeuta: `${c.fisioterapeuta.nombre} ${c.fisioterapeuta.apellido}`,
      motivo: c.tipoSesion ?? "Sesión",
      estado: c.estado,
      anticipoPagado: c.anticipoPagado ?? false,
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
              timeZone: "America/Mexico_City",
            }),
            hora: a.cita.fechaHoraInicio.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Mexico_City",
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
