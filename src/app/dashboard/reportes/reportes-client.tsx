"use client";

import { useState, useTransition, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Star,
  CheckCircle2,
  Download,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getReportesData, type ReportesData, type Periodo } from "./actions";

// ─────────────────────────────────────────────────────────────────────────────
// SVG DOLOR CHART
// ─────────────────────────────────────────────────────────────────────────────
function DolorChart({ data }: { data: ReportesData["dolorPacientes"] }) {
  const W = 360;
  const H = 180;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 25;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const toX = (i: number, total: number) => (total <= 1 ? padL : padL + (i / (total - 1)) * chartW);
  const toY = (v: number) => padT + chartH - (v / 10) * chartH;

  if (!data.length) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-[#1e2d3a]/40">
        Sin registros de dolor en este período
      </div>
    );
  }

  const maxPuntos = Math.max(...data.map((p) => p.puntos.length), 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <g key={v}>
          <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke="#A5F3FC" strokeWidth="0.5" />
          <text x={padL - 6} y={toY(v) + 3} textAnchor="end" className="text-[8px] fill-[#1e2d3a]/30">{v}</text>
        </g>
      ))}
      {Array.from({ length: maxPuntos }).map((_, i) => (
        <text key={i} x={toX(i, maxPuntos)} y={H - 5} textAnchor="middle" className="text-[8px] fill-[#1e2d3a]/30">S{i + 1}</text>
      ))}
      {data.map((p) => {
        const points = p.puntos.map((v, i) => `${toX(i, p.puntos.length)},${toY(v)}`).join(" ");
        return (
          <g key={p.nombre}>
            <polyline points={points} fill="none" stroke={p.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {p.puntos.map((v, i) => (
              <circle key={i} cx={toX(i, p.puntos.length)} cy={toY(v)} r="3" fill={p.color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ReportesClient({ initialData }: { initialData: ReportesData }) {
  const [periodo, setPeriodo] = useState<Periodo>("este_mes");
  const [data, setData] = useState<ReportesData>(initialData);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (periodo === "este_mes") return;
    startTransition(async () => {
      const fresh = await getReportesData(periodo);
      setData(fresh);
    });
  }, [periodo]);

  const maxIngreso = Math.max(...data.ingresosMensuales.map((i) => i.valor), 1);
  const porcentajeSesiones =
    data.kpis.sesionesTotales > 0
      ? Math.round((data.kpis.sesionesCompletadas / data.kpis.sesionesTotales) * 100)
      : 0;

  const formatDelta = (d: number | null, suffix = "%") =>
    d == null ? "—" : `${d >= 0 ? "+" : ""}${d}${suffix}`;

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#f0f4f7] min-h-full">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1e2d3a]">Reportes y Analytics</h1>
          <p className="text-xs text-[#1e2d3a]/50 mt-0.5 capitalize">
            {data.periodoLabel}
            {isPending && <span className="ml-2 text-[#4a7fa5]">actualizando…</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
            <SelectTrigger className="w-40 border-[#a8cfe0] text-sm bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="este_mes">Este mes</SelectItem>
              <SelectItem value="mes_anterior">Mes anterior</SelectItem>
              <SelectItem value="3_meses">Últimos 3 meses</SelectItem>
              <SelectItem value="anio">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] transition-all duration-200 text-sm gap-1.5"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos */}
        <Card className="border-[#c8dce8] bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                {formatDelta(data.kpis.ingresosDelta)}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">
              ${data.kpis.ingresos.toLocaleString("es-MX")}
            </p>
            <p className="text-[10px] text-[#1e2d3a]/50 mt-0.5">Ingresos Totales</p>
          </CardContent>
        </Card>
        {/* Pacientes */}
        <Card className="border-[#c8dce8] bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-xl bg-[#e4ecf2] flex items-center justify-center">
                <Users className="h-4.5 w-4.5 text-[#4a7fa5]" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-[#e4ecf2] text-cyan-600 border-[#a8cfe0]">
                {formatDelta(data.kpis.pacientesDelta)}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">{data.kpis.pacientesAtendidos}</p>
            <p className="text-[10px] text-[#1e2d3a]/50 mt-0.5">Pacientes Atendidos</p>
          </CardContent>
        </Card>
        {/* NPS */}
        <Card className="border-[#c8dce8] bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Star className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                {formatDelta(data.kpis.npsDelta, "")}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">
              {data.kpis.npsPromedio != null ? data.kpis.npsPromedio : "—"}
              <span className="text-sm font-normal text-[#1e2d3a]/40">/10</span>
            </p>
            <p className="text-[10px] text-[#1e2d3a]/50 mt-0.5">NPS Promedio</p>
          </CardContent>
        </Card>
        {/* Sesiones */}
        <Card className="border-[#c8dce8] bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-xl bg-[#e4ecf2] flex items-center justify-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-[#4a7fa5]" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-[#e4ecf2] text-cyan-600 border-[#a8cfe0]">
                {porcentajeSesiones}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">
              {data.kpis.sesionesCompletadas}
              <span className="text-sm font-normal text-[#1e2d3a]/40">/{data.kpis.sesionesTotales}</span>
            </p>
            <p className="text-[10px] text-[#1e2d3a]/50 mt-0.5">Sesiones Completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* ── GRÁFICA INGRESOS (barras) ── */}
      <Card className="border-[#c8dce8] bg-white col-span-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#1e2d3a]">Ingresos Mensuales</CardTitle>
              <CardDescription className="text-xs text-[#1e2d3a]/50">Últimos 6 meses · cifras en MXN</CardDescription>
            </div>
            <BarChart3 className="h-4 w-4 text-[#1e2d3a]/20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3 h-44">
            {data.ingresosMensuales.map((m, i) => {
              const pct = (m.valor / maxIngreso) * 100;
              const isActual = i === data.ingresosMensuales.length - 1;
              return (
                <div key={m.mes + i} className="flex-1 flex flex-col items-center gap-1">
                  <p className={`text-[10px] font-semibold ${isActual ? "text-[#4a7fa5]" : "text-[#1e2d3a]/40"}`}>
                    ${(m.valor / 1000).toFixed(1)}k
                  </p>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isActual ? "bg-[#4a7fa5]" : "bg-[#4a7fa5]/30"
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                  <p className={`text-[10px] capitalize ${isActual ? "font-bold text-[#1e2d3a]" : "text-[#1e2d3a]/40"}`}>
                    {m.mes}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-7">
        {/* ── GRÁFICA DOLOR (SVG) ── */}
        <Card className="border-[#c8dce8] bg-white lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#1e2d3a]">Evolución del Dolor (EVA)</CardTitle>
            <CardDescription className="text-xs text-[#1e2d3a]/50">Progreso por sesión · Escala 0-10</CardDescription>
          </CardHeader>
          <CardContent>
            <DolorChart data={data.dolorPacientes} />
            {data.dolorPacientes.length > 0 && (
              <div className="flex items-center gap-4 mt-3 justify-center flex-wrap">
                {data.dolorPacientes.map((p) => (
                  <div key={p.nombre} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-[10px] text-[#1e2d3a]/60">{p.nombre}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── DISTRIBUCIÓN PAGOS ── */}
        <Card className="border-[#c8dce8] bg-white lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#1e2d3a]">Distribución de Pagos</CardTitle>
            <CardDescription className="text-xs text-[#1e2d3a]/50">Por método de pago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.distribucionPagos.length === 0 ? (
              <p className="text-xs text-[#1e2d3a]/40 text-center py-6">Sin pagos en este período</p>
            ) : (
              data.distribucionPagos.map((d) => (
                <div key={d.metodo} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#1e2d3a]/70">{d.metodo}</span>
                    <span className="text-xs font-bold text-[#1e2d3a]">
                      ${d.monto.toLocaleString("es-MX")} <span className="text-[10px] font-normal text-[#1e2d3a]/40">({d.porcentaje}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.color} transition-all duration-300`} style={{ width: `${d.porcentaje}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── TOP PACIENTES ── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">Top Pacientes</CardTitle>
          <CardDescription className="text-xs text-[#1e2d3a]/50">Pacientes con más sesiones este período</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {data.topPacientes.length === 0 ? (
            <p className="text-xs text-[#1e2d3a]/40 text-center py-8">Sin sesiones completadas en este período</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#c8dce8] bg-[#f0f4f7]/50">
                  <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase">Paciente</TableHead>
                  <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase">Sesiones</TableHead>
                  <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase hidden sm:table-cell">Ingresos</TableHead>
                  <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase text-right">Última Visita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topPacientes.map((p, i) => (
                  <TableRow key={p.nombre + i} className="border-[#c8dce8] hover:bg-[#f0f4f7]/30 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-[#4a7fa5]/10 flex items-center justify-center text-[9px] font-bold text-[#4a7fa5] shrink-0">
                          {i + 1}
                        </div>
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-[#4a7fa5]/10 text-[#4a7fa5] text-[9px] font-bold">{p.iniciales}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-[#1e2d3a]">{p.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs font-bold text-[#1e2d3a]">{p.sesiones}</span>
                    </TableCell>
                    <TableCell className="py-3 hidden sm:table-cell">
                      <span className="text-xs font-semibold text-[#1e2d3a]">${p.ingresos.toLocaleString("es-MX")}</span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <span className="text-xs text-[#1e2d3a]/50">{p.ultimaVisita}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
