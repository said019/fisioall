"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export type Periodo = "este_mes" | "mes_anterior" | "3_meses" | "anio";

function getRangoPeriodo(periodo: Periodo): { desde: Date; hasta: Date; label: string } {
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = ahora.getMonth();

  switch (periodo) {
    case "mes_anterior": {
      const pm = m === 0 ? 11 : m - 1;
      const py = m === 0 ? y - 1 : y;
      const desde = new Date(py, pm, 1);
      const hasta = new Date(y, m, 1);
      return {
        desde,
        hasta,
        label: desde.toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
      };
    }
    case "3_meses": {
      const desde = new Date(y, m - 2, 1);
      const hasta = new Date(y, m + 1, 1);
      return { desde, hasta, label: "Últimos 3 meses" };
    }
    case "anio": {
      const desde = new Date(y, 0, 1);
      const hasta = new Date(y + 1, 0, 1);
      return { desde, hasta, label: String(y) };
    }
    default: {
      const desde = new Date(y, m, 1);
      const hasta = new Date(y, m + 1, 1);
      return {
        desde,
        hasta,
        label: desde.toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
      };
    }
  }
}

export async function getReportesData(periodo: Periodo = "este_mes") {
  const { tenantId } = await requireAuth();
  const { desde, hasta, label } = getRangoPeriodo(periodo);

  // Rango mes anterior para comparación (solo para "este_mes")
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = ahora.getMonth();
  const inicioMesAnterior = new Date(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, 1);
  const finMesAnterior = new Date(y, m, 1);

  const [
    ingresosAgg,
    ingresosMesAnteriorAgg,
    pacientesDistintos,
    pacientesDistintosPrev,
    citasCompletadas,
    citasTotalesPeriodo,
    npsAgg,
    npsPrevAgg,
    pagosPorMetodo,
    ingresosUltimos6,
    topPacientes,
    progresoDolor,
  ] = await Promise.all([
    // Ingresos totales (pagos "pagado" en el periodo)
    prisma.pago.aggregate({
      where: { tenantId, estado: "pagado", fechaPago: { gte: desde, lt: hasta } },
      _sum: { monto: true },
    }),

    // Ingresos mes anterior (para % comparación)
    prisma.pago.aggregate({
      where: {
        tenantId,
        estado: "pagado",
        fechaPago: { gte: inicioMesAnterior, lt: finMesAnterior },
      },
      _sum: { monto: true },
    }),

    // Pacientes atendidos (distintos con cita completada en el periodo)
    prisma.cita.findMany({
      where: {
        tenantId,
        estado: "completada",
        fechaHoraInicio: { gte: desde, lt: hasta },
      },
      select: { pacienteId: true },
      distinct: ["pacienteId"],
    }),

    // Pacientes atendidos mes anterior (para %)
    prisma.cita.findMany({
      where: {
        tenantId,
        estado: "completada",
        fechaHoraInicio: { gte: inicioMesAnterior, lt: finMesAnterior },
      },
      select: { pacienteId: true },
      distinct: ["pacienteId"],
    }),

    // Sesiones completadas
    prisma.cita.count({
      where: {
        tenantId,
        estado: "completada",
        fechaHoraInicio: { gte: desde, lt: hasta },
      },
    }),

    // Total de citas del periodo (no canceladas)
    prisma.cita.count({
      where: {
        tenantId,
        estado: { notIn: ["cancelada", "no_show"] },
        fechaHoraInicio: { gte: desde, lt: hasta },
      },
    }),

    // NPS promedio (encuestas respondidas en el periodo)
    prisma.encuestaSesion.aggregate({
      where: {
        paciente: { tenantId },
        respondidaAt: { gte: desde, lt: hasta },
        npsScore: { not: null },
      },
      _avg: { npsScore: true },
      _count: true,
    }),

    // NPS mes anterior
    prisma.encuestaSesion.aggregate({
      where: {
        paciente: { tenantId },
        respondidaAt: { gte: inicioMesAnterior, lt: finMesAnterior },
        npsScore: { not: null },
      },
      _avg: { npsScore: true },
    }),

    // Distribución por método de pago (pagado, en el periodo)
    prisma.pago.groupBy({
      by: ["metodo"],
      where: { tenantId, estado: "pagado", fechaPago: { gte: desde, lt: hasta } },
      _sum: { monto: true },
      _count: true,
    }),

    // Ingresos últimos 6 meses (para gráfica de barras)
    prisma.pago.findMany({
      where: {
        tenantId,
        estado: "pagado",
        fechaPago: { gte: new Date(y, m - 5, 1) },
      },
      select: { monto: true, fechaPago: true },
    }),

    // Top pacientes: más sesiones completadas en el periodo
    prisma.cita.groupBy({
      by: ["pacienteId"],
      where: {
        tenantId,
        estado: "completada",
        fechaHoraInicio: { gte: desde, lt: hasta },
      },
      _count: { _all: true },
      _max: { fechaHoraInicio: true },
      orderBy: { _count: { pacienteId: "desc" } },
      take: 5,
    }),

    // Evolución de dolor: pacientes con progreso registrado
    prisma.progresoDolor.findMany({
      where: {
        paciente: { tenantId },
        fecha: { gte: desde, lt: hasta },
        dolorFin: { not: null },
      },
      select: {
        pacienteId: true,
        fecha: true,
        dolorInicio: true,
        dolorFin: true,
        paciente: { select: { nombre: true, apellido: true } },
      },
      orderBy: { fecha: "asc" },
      take: 30,
    }),
  ]);

  // Ingresos por mes (últimos 6)
  const meses: { mes: string; valor: number; ym: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    meses.push({
      mes: d.toLocaleDateString("es-MX", { month: "short" }).replace(".", ""),
      valor: 0,
      ym,
    });
  }
  for (const p of ingresosUltimos6) {
    if (!p.fechaPago) continue;
    const d = p.fechaPago;
    const ym = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const bucket = meses.find((b) => b.ym === ym);
    if (bucket) bucket.valor += Number(p.monto);
  }

  // Top pacientes: resolver nombres + ingresos del paciente en el periodo
  const topIds = topPacientes.map((t) => t.pacienteId);
  const [pacientesTop, pagosTop] = await Promise.all([
    prisma.paciente.findMany({
      where: { id: { in: topIds } },
      select: { id: true, nombre: true, apellido: true },
    }),
    prisma.pago.groupBy({
      by: ["pacienteId"],
      where: {
        tenantId,
        estado: "pagado",
        pacienteId: { in: topIds },
        fechaPago: { gte: desde, lt: hasta },
      },
      _sum: { monto: true },
    }),
  ]);
  const pacienteMap = new Map(pacientesTop.map((p) => [p.id, p]));
  const pagosMap = new Map(pagosTop.map((p) => [p.pacienteId, Number(p._sum.monto ?? 0)]));

  const topPacientesResuelto = topPacientes.map((t) => {
    const pac = pacienteMap.get(t.pacienteId);
    const nombre = pac ? `${pac.nombre} ${pac.apellido}` : "—";
    const iniciales = pac
      ? `${pac.nombre[0] ?? ""}${pac.apellido[0] ?? ""}`.toUpperCase()
      : "—";
    return {
      nombre,
      iniciales,
      sesiones: t._count._all,
      ingresos: pagosMap.get(t.pacienteId) ?? 0,
      nps: null as number | null,
      ultimaVisita:
        t._max.fechaHoraInicio?.toLocaleDateString("es-MX", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) ?? "—",
    };
  });

  // Distribución de pagos
  const totalPagos = pagosPorMetodo.reduce((s, g) => s + Number(g._sum.monto ?? 0), 0);
  const METODO_LABEL: Record<string, { label: string; color: string }> = {
    efectivo: { label: "Efectivo", color: "bg-emerald-500" },
    transferencia: { label: "Transferencia", color: "bg-[#4a7fa5]" },
    tarjeta_debito: { label: "Tarjeta débito", color: "bg-violet-500" },
    tarjeta_credito: { label: "Tarjeta crédito", color: "bg-orange-500" },
    otro: { label: "Otro", color: "bg-slate-400" },
  };
  const distribucionPagos = pagosPorMetodo
    .map((g) => {
      const monto = Number(g._sum.monto ?? 0);
      const meta = METODO_LABEL[g.metodo] ?? { label: g.metodo, color: "bg-slate-400" };
      return {
        metodo: meta.label,
        color: meta.color,
        monto,
        porcentaje: totalPagos > 0 ? Math.round((monto / totalPagos) * 100) : 0,
      };
    })
    .sort((a, b) => b.monto - a.monto);

  // Evolución de dolor: agrupar por paciente (tomar hasta 3 con más puntos)
  const porPaciente = new Map<
    string,
    { nombre: string; puntos: number[] }
  >();
  for (const p of progresoDolor) {
    const key = p.pacienteId;
    const nombre = `${p.paciente.nombre} ${p.paciente.apellido}`;
    if (!porPaciente.has(key)) porPaciente.set(key, { nombre, puntos: [] });
    porPaciente.get(key)!.puntos.push(p.dolorFin ?? 0);
  }
  const coloresDolor = ["#4a7fa5", "#8B5CF6", "#F59E0B"];
  const dolorPacientes = [...porPaciente.values()]
    .filter((p) => p.puntos.length >= 2)
    .sort((a, b) => b.puntos.length - a.puntos.length)
    .slice(0, 3)
    .map((p, i) => ({
      nombre: p.nombre,
      color: coloresDolor[i],
      puntos: p.puntos.slice(-7),
    }));

  // Cálculos comparativos (%)
  const ingresos = Number(ingresosAgg._sum.monto ?? 0);
  const ingresosPrev = Number(ingresosMesAnteriorAgg._sum.monto ?? 0);
  const ingresosDelta =
    ingresosPrev > 0 ? Math.round(((ingresos - ingresosPrev) / ingresosPrev) * 100) : null;

  const pacientesCount = pacientesDistintos.length;
  const pacientesPrev = pacientesDistintosPrev.length;
  const pacientesDelta =
    pacientesPrev > 0
      ? Math.round(((pacientesCount - pacientesPrev) / pacientesPrev) * 100)
      : null;

  const npsAvg = npsAgg._avg.npsScore;
  const npsPrev = npsPrevAgg._avg.npsScore;
  const npsDelta = npsAvg != null && npsPrev != null ? Number((npsAvg - npsPrev).toFixed(1)) : null;

  return {
    periodoLabel: label,
    kpis: {
      ingresos,
      ingresosDelta,
      pacientesAtendidos: pacientesCount,
      pacientesDelta,
      npsPromedio: npsAvg != null ? Number(npsAvg.toFixed(1)) : null,
      npsDelta,
      sesionesCompletadas: citasCompletadas,
      sesionesTotales: citasTotalesPeriodo,
    },
    ingresosMensuales: meses.map((m) => ({ mes: m.mes, valor: m.valor })),
    topPacientes: topPacientesResuelto,
    distribucionPagos,
    dolorPacientes,
  };
}

export type ReportesData = Awaited<ReturnType<typeof getReportesData>>;
