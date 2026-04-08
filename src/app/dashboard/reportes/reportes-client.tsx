"use client";

import { useState } from "react";
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

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const INGRESOS_MENSUALES = [
  { mes: "Sep", valor: 8200 },
  { mes: "Oct", valor: 9400 },
  { mes: "Nov", valor: 7800 },
  { mes: "Dic", valor: 11200 },
  { mes: "Ene", valor: 10500 },
  { mes: "Feb", valor: 12234 },
];
const MAX_INGRESO = Math.max(...INGRESOS_MENSUALES.map((i) => i.valor));

const DOLOR_PACIENTES = [
  { nombre: "Ana Flores",      color: "#4a7fa5", puntos: [8, 7, 6, 5, 5, 4, 3] },
  { nombre: "Carlos Mendoza",  color: "#8B5CF6", puntos: [6, 6, 5, 5, 4, 4, 3] },
  { nombre: "Patricia Morales", color: "#F59E0B", puntos: [9, 8, 7, 7, 6, 5, 5] },
];

const TOP_PACIENTES = [
  { nombre: "Ana Flores",       iniciales: "AF", sesiones: 18, ingresos: 8100,  nps: 9.2, ultimaVisita: "22 Feb 2026" },
  { nombre: "Carlos Mendoza",   iniciales: "CM", sesiones: 15, ingresos: 6750,  nps: 8.8, ultimaVisita: "23 Feb 2026" },
  { nombre: "Patricia Morales", iniciales: "PM", sesiones: 14, ingresos: 6300,  nps: 9.5, ultimaVisita: "21 Feb 2026" },
  { nombre: "Roberto Sánchez",  iniciales: "RS", sesiones: 12, ingresos: 5400,  nps: 8.1, ultimaVisita: "20 Feb 2026" },
  { nombre: "Daniela Martínez", iniciales: "DM", sesiones: 11, ingresos: 4950,  nps: 9.0, ultimaVisita: "24 Feb 2026" },
];

const DISTRIBUCION_PAGOS = [
  { metodo: "Transferencia",   porcentaje: 40, monto: 4894, color: "bg-[#4a7fa5]" },
  { metodo: "Efectivo",        porcentaje: 35, monto: 4282, color: "bg-emerald-500" },
  { metodo: "Tarjeta débito",  porcentaje: 15, monto: 1835, color: "bg-violet-500" },
  { metodo: "Tarjeta crédito", porcentaje: 10, monto: 1223, color: "bg-orange-500" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SVG DOLOR CHART
// ─────────────────────────────────────────────────────────────────────────────
function DolorChart() {
  const W = 360;
  const H = 180;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 25;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const toX = (i: number, total: number) => padL + (i / (total - 1)) * chartW;
  const toY = (v: number) => padT + chartH - (v / 10) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid lines */}
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <g key={v}>
          <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke="#A5F3FC" strokeWidth="0.5" />
          <text x={padL - 6} y={toY(v) + 3} textAnchor="end" className="text-[8px] fill-[#1e2d3a]/30">{v}</text>
        </g>
      ))}
      {/* X labels */}
      {[1, 2, 3, 4, 5, 6, 7].map((s, i) => (
        <text key={s} x={toX(i, 7)} y={H - 5} textAnchor="middle" className="text-[8px] fill-[#1e2d3a]/30">S{s}</text>
      ))}
      {/* Lines */}
      {DOLOR_PACIENTES.map((p) => {
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
export default function ReportesClient() {
  const [periodo, setPeriodo] = useState("este_mes");

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#f0f4f7] min-h-full">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1e2d3a]">Reportes y Analytics</h1>
          <p className="text-xs text-[#1e2d3a]/50 mt-0.5">Datos de Febrero 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
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
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">+19%</Badge>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">$12,234</p>
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
              <Badge variant="outline" className="text-[10px] bg-[#e4ecf2] text-cyan-600 border-[#a8cfe0]">+12%</Badge>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">78</p>
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
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">+0.3</Badge>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">8.7<span className="text-sm font-normal text-[#1e2d3a]/40">/10</span></p>
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
              <Badge variant="outline" className="text-[10px] bg-[#e4ecf2] text-cyan-600 border-[#a8cfe0]">95.4%</Badge>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">124<span className="text-sm font-normal text-[#1e2d3a]/40">/130</span></p>
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
            {INGRESOS_MENSUALES.map((m, i) => {
              const pct = (m.valor / MAX_INGRESO) * 100;
              const isActual = i === INGRESOS_MENSUALES.length - 1;
              return (
                <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
                  <p className={`text-[10px] font-semibold ${isActual ? "text-[#4a7fa5]" : "text-[#1e2d3a]/40"}`}>
                    ${(m.valor / 1000).toFixed(1)}k
                  </p>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isActual ? "bg-[#4a7fa5]" : "bg-[#4a7fa5]/30"
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                  <p className={`text-[10px] ${isActual ? "font-bold text-[#1e2d3a]" : "text-[#1e2d3a]/40"}`}>
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
            <DolorChart />
            {/* Leyenda */}
            <div className="flex items-center gap-4 mt-3 justify-center">
              {DOLOR_PACIENTES.map((p) => (
                <div key={p.nombre} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px] text-[#1e2d3a]/60">{p.nombre}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── DISTRIBUCIÓN PAGOS ── */}
        <Card className="border-[#c8dce8] bg-white lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#1e2d3a]">Distribución de Pagos</CardTitle>
            <CardDescription className="text-xs text-[#1e2d3a]/50">Por método de pago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DISTRIBUCION_PAGOS.map((d) => (
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
            ))}
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
          <Table>
            <TableHeader>
              <TableRow className="border-[#c8dce8] bg-[#f0f4f7]/50">
                <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase">Paciente</TableHead>
                <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase">Sesiones</TableHead>
                <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase hidden sm:table-cell">Ingresos</TableHead>
                <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase hidden sm:table-cell">NPS</TableHead>
                <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase text-right">Última Visita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_PACIENTES.map((p, i) => (
                <TableRow key={p.nombre} className="border-[#c8dce8] hover:bg-[#f0f4f7]/30 transition-colors">
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
                  <TableCell className="py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-[#1e2d3a]">{p.nps}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <span className="text-xs text-[#1e2d3a]/50">{p.ultimaVisita}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── RETENCIÓN ── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-[#1e2d3a]">Tasa de Retención</p>
              <p className="text-[10px] text-[#1e2d3a]/50 mt-0.5">
                Pacientes que regresan después de completar su plan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-emerald-600">87%</p>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                ¡Excelente retención!
              </Badge>
            </div>
          </div>
          <Progress value={87} className="h-4 [&>div]:bg-emerald-500" />
          <div className="flex justify-between text-[10px] text-[#1e2d3a]/30 mt-1.5">
            <span>0%</span>
            <span>50%</span>
            <span>85% — Meta</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
