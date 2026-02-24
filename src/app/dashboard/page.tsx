"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  Users,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Bell,
  CheckCircle2,
  UserPlus,
  CreditCard,
  FileEdit,
  CalendarCheck,
  Stethoscope,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type EstadoCita = "agendada" | "confirmada" | "en_curso" | "completada" | "cancelada";

interface Cita {
  id: string;
  hora: string;
  duracion: number;
  nombre: string;
  tipo: string;
  estado: EstadoCita;
  iniciales: string;
}

interface MembresiasAlerta {
  id: string;
  nombre: string;
  iniciales: string;
  plan: string;
  sesionesUsadas: number;
  sesionesTotales: number;
}

interface ActividadItem {
  id: string;
  icono: React.ElementType;
  iconoBg: string;
  iconoColor: string;
  texto: string;
  detalle: string;
  tiempo: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const citasHoy: Cita[] = [
  { id: "1", hora: "08:00", duracion: 45, nombre: "María González Ruiz", tipo: "Rehabilitación columna", estado: "completada", iniciales: "MG" },
  { id: "2", hora: "09:00", duracion: 60, nombre: "Carlos Mendoza López", tipo: "Terapia manual cervical", estado: "completada", iniciales: "CM" },
  { id: "3", hora: "10:15", duracion: 45, nombre: "Ana Flores Torres", tipo: "Fisio deportiva rodilla", estado: "en_curso", iniciales: "AF" },
  { id: "4", hora: "11:30", duracion: 30, nombre: "Roberto Sánchez Vega", tipo: "Evaluación inicial", estado: "confirmada", iniciales: "RS" },
  { id: "5", hora: "13:00", duracion: 45, nombre: "Daniela Martínez Cruz", tipo: "Ejercicio terapéutico", estado: "agendada", iniciales: "DM" },
  { id: "6", hora: "15:00", duracion: 60, nombre: "José Hernández Paz", tipo: "Rehabilitación post-op", estado: "agendada", iniciales: "JH" },
  { id: "7", hora: "16:30", duracion: 45, nombre: "Sofía Reyes Castillo", tipo: "Neuro-rehabilitación", estado: "agendada", iniciales: "SR" },
];

const membresiasAlerta: MembresiasAlerta[] = [
  { id: "1", nombre: "Patricia Morales", iniciales: "PM", plan: "Plan 10 sesiones", sesionesUsadas: 9, sesionesTotales: 10 },
  { id: "2", nombre: "Luis Ángel Ramos", iniciales: "LR", plan: "Plan 12 sesiones", sesionesUsadas: 11, sesionesTotales: 12 },
  { id: "3", nombre: "Valentina Ortega", iniciales: "VO", plan: "Plan 8 sesiones", sesionesUsadas: 7, sesionesTotales: 8 },
  { id: "4", nombre: "Fernando Díaz", iniciales: "FD", plan: "Plan 10 sesiones", sesionesUsadas: 9, sesionesTotales: 10 },
  { id: "5", nombre: "Camila Jiménez", iniciales: "CJ", plan: "Plan 6 sesiones", sesionesUsadas: 6, sesionesTotales: 6 },
];

const actividadReciente: ActividadItem[] = [
  { id: "1", icono: CheckCircle2, iconoBg: "bg-emerald-50", iconoColor: "text-emerald-500", texto: "Sesión completada con Ana Flores", detalle: "Fisio deportiva · Rodilla derecha", tiempo: "hace 5 min" },
  { id: "2", icono: UserPlus, iconoBg: "bg-cyan-50", iconoColor: "text-[#0891B2]", texto: "Nuevo paciente registrado", detalle: "Sebastián Cruz Medina · Evaluación inicial", tiempo: "hace 42 min" },
  { id: "3", icono: CreditCard, iconoBg: "bg-violet-50", iconoColor: "text-violet-500", texto: "Pago recibido $600 MXN", detalle: "Patricia Morales · Renovación membresía", tiempo: "hace 1 h" },
  { id: "4", icono: FileEdit, iconoBg: "bg-amber-50", iconoColor: "text-amber-500", texto: "Nota SOAP actualizada", detalle: "Carlos Mendoza · Terapia manual C3-C5", tiempo: "hace 2 h" },
  { id: "5", icono: CalendarCheck, iconoBg: "bg-[#0891B2]/10", iconoColor: "text-[#0891B2]", texto: "Cita confirmada por WhatsApp", detalle: "Roberto Sánchez · 11:30 hrs", tiempo: "hace 3 h" },
];

const ingresosData = [
  { mes: "Ago", valor: 8200 },
  { mes: "Sep", valor: 9100 },
  { mes: "Oct", valor: 8750 },
  { mes: "Nov", valor: 10400 },
  { mes: "Dic", valor: 7900 },
  { mes: "Ene", valor: 10300 },
  { mes: "Feb", valor: 12234 },
];

const dolorData = [7, 6, 5, 5, 4, 3, 2]; // escala 0-10, sesiones 1-7

const accesosRapidos = [
  { label: "Nueva Cita", href: "/dashboard/agenda", icono: CalendarDays },
  { label: "Nuevo Paciente", href: "/dashboard/pacientes", icono: UserPlus },
  { label: "Nota SOAP", href: "/dashboard/pacientes", icono: ClipboardList },
  { label: "Ver Agenda", href: "/dashboard/agenda", icono: CalendarCheck },
  { label: "Membresías", href: "/dashboard/membresias", icono: CreditCard },
  { label: "Ejercicios", href: "/dashboard/pacientes", icono: Dumbbell },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function EstadoBadge({ estado }: { estado: EstadoCita }) {
  const config: Record<EstadoCita, { label: string; className: string }> = {
    agendada:   { label: "Agendada",   className: "bg-slate-100 text-slate-600 border-slate-200" },
    confirmada: { label: "Confirmada", className: "bg-cyan-50 text-[#0891B2] border-cyan-200" },
    en_curso:   { label: "En curso",   className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    completada: { label: "Completada", className: "bg-green-50 text-green-700 border-green-200" },
    cancelada:  { label: "Cancelada",  className: "bg-red-50 text-red-600 border-red-200" },
  };
  const { label, className } = config[estado];
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold px-1.5 py-0.5 shrink-0 ${className}`}>
      {label}
    </Badge>
  );
}

function MiniBarChart({ data }: { data: { mes: string; valor: number }[] }) {
  const max = Math.max(...data.map((d) => d.valor));
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const heightPct = Math.round((d.valor / max) * 100);
        return (
          <div key={d.mes} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-t-sm transition-all duration-300 ${isLast ? "bg-[#0891B2]" : "bg-[#0891B2]/20"}`}
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-[9px] text-[#164E63]/40 leading-none">{d.mes}</span>
          </div>
        );
      })}
    </div>
  );
}

function DolorSVG({ data }: { data: number[] }) {
  const W = 200;
  const H = 48;
  const maxVal = 10;
  const stepX = W / (data.length - 1);

  const points = data.map((v, i) => ({
    x: Math.round(i * stepX),
    y: Math.round(H - (v / maxVal) * H),
  }));

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Evolución del dolor" role="img">
      <path d={pathD} stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#059669" />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FECHA DE HOY
// ─────────────────────────────────────────────────────────────────────────────
const HOY = new Date(2026, 1, 24); // martes 24 feb 2026
const fechaLabel = HOY.toLocaleDateString("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const fechaCapitalized = fechaLabel.charAt(0).toUpperCase() + fechaLabel.slice(1);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#ECFEFF] min-h-full">

      {/* ── 1. BARRA SUPERIOR ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Fecha + conteo */}
        <div>
          <p className="text-sm font-semibold text-[#164E63]">{fechaCapitalized}</p>
          <p className="text-xs text-[#164E63]/50 mt-0.5">
            {citasHoy.length} citas programadas · 10:15 hrs
          </p>
        </div>
        {/* Botones de acción */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard/agenda">
            <Button size="sm" variant="outline" className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 transition-all duration-200 gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Nueva Cita
            </Button>
          </Link>
          <Link href="/dashboard/pacientes">
            <Button size="sm" variant="outline" className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 transition-all duration-200 gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Nuevo Paciente
            </Button>
          </Link>
          <Link href="/dashboard/pacientes">
            <Button size="sm" className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              Nota SOAP
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Citas de Hoy */}
        <Card className="border-cyan-100 bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                <CalendarDays className="h-5 w-5 text-[#0891B2]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#164E63]">12</p>
            <p className="text-xs text-[#164E63]/50 mt-0.5">Citas de Hoy</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +3 desde ayer
            </p>
          </CardContent>
        </Card>

        {/* Pacientes Activos */}
        <Card className="border-cyan-100 bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-violet-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#164E63]">234</p>
            <p className="text-xs text-[#164E63]/50 mt-0.5">Pacientes Activos</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +18 este mes
            </p>
          </CardContent>
        </Card>

        {/* Membresías por Vencer */}
        <Card className="border-orange-200 bg-orange-50/30 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600">8</p>
            <p className="text-xs text-[#164E63]/50 mt-0.5">Membresías por Vencer</p>
            <p className="text-[11px] text-orange-500 font-medium mt-1.5">
              Requieren atención pronto
            </p>
          </CardContent>
        </Card>

        {/* Ingresos Feb */}
        <Card className="border-cyan-100 bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#164E63]">$12,234</p>
            <p className="text-xs text-[#164E63]/50 mt-0.5">Ingresos Feb</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +19% vs enero
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. GRID PRINCIPAL (7 cols) ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-7 gap-4">

        {/* Agenda de Hoy — col-span-4 */}
        <Card className="lg:col-span-4 border-cyan-100 bg-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#164E63] flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#0891B2]" />
              Agenda de Hoy
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-cyan-50 text-[#0891B2] border-cyan-200">
              {citasHoy.length} citas
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {citasHoy.map((cita) => (
              <div
                key={cita.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  cita.estado === "en_curso"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-[#ECFEFF]/40 border-cyan-100 hover:bg-[#ECFEFF]"
                }`}
              >
                {/* Hora + duración */}
                <div className="min-w-[48px] text-right shrink-0">
                  <p className="text-xs font-bold text-[#164E63]">{cita.hora}</p>
                  <p className="text-[10px] text-[#164E63]/40">{cita.duracion} min</p>
                </div>

                {/* Línea vertical */}
                <div
                  className={`w-0.5 h-10 rounded-full shrink-0 ${
                    cita.estado === "en_curso"
                      ? "bg-emerald-400"
                      : cita.estado === "completada"
                      ? "bg-green-300"
                      : "bg-cyan-200"
                  }`}
                />

                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-[#0891B2]/10 text-[#0891B2] text-[10px] font-bold">
                    {cita.iniciales}
                  </AvatarFallback>
                </Avatar>

                {/* Nombre + tipo */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#164E63] truncate">{cita.nombre}</p>
                  <p className="text-[10px] text-[#164E63]/50 truncate">{cita.tipo}</p>
                </div>

                {/* Estado badge */}
                <EstadoBadge estado={cita.estado} />
              </div>
            ))}

            {/* Ver agenda completa */}
            <Link href="/dashboard/agenda">
              <div className="flex items-center justify-center gap-1 pt-2 text-xs font-medium text-[#0891B2] hover:text-[#0891B2]/80 cursor-pointer transition-colors duration-200">
                Ver agenda completa
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Sesiones por Vencer — col-span-3 */}
        <Card className="lg:col-span-3 border-orange-200 bg-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#164E63] flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center">
                <Bell className="h-3.5 w-3.5 text-orange-500" />
              </div>
              Sesiones por Vencer
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200">
              {membresiasAlerta.length} alertas
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {membresiasAlerta.map((m) => {
              const restantes = m.sesionesTotales - m.sesionesUsadas;
              const pct = Math.round((m.sesionesUsadas / m.sesionesTotales) * 100);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px] font-bold">
                      {m.iniciales}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-[#164E63] truncate">{m.nombre}</p>
                      <p className="text-[10px] font-bold text-orange-600 shrink-0 ml-2">
                        {restantes === 0 ? "Sin sesiones" : `${restantes} restante${restantes !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <Progress
                      value={pct}
                      className="h-1.5 bg-orange-100 [&>div]:bg-orange-400"
                    />
                    <p className="text-[9px] text-[#164E63]/40 mt-0.5">{m.plan}</p>
                  </div>
                </div>
              );
            })}

            <Link href="/dashboard/membresias">
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1 cursor-pointer border-orange-200 text-orange-600 hover:bg-orange-50 transition-all duration-200 text-xs"
              >
                Ver todas las membresías
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Ingresos Mensuales — col-span-3 (pero visualmente alineado) */}
        <Card className="lg:col-span-3 border-cyan-100 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#164E63]">Ingresos Mensuales</CardTitle>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                Feb 2026
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#164E63]">$12,234</p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +19% vs enero · $10,300
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <MiniBarChart data={ingresosData} />
          </CardContent>
        </Card>
      </div>

      {/* ── 4. GRID INFERIOR (7 cols) ────────────────────────────────────── */}
      <div className="grid lg:grid-cols-7 gap-4">

        {/* Actividad Reciente — col-span-4 */}
        <Card className="lg:col-span-4 border-cyan-100 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#164E63] flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-[#0891B2]" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actividadReciente.map((a) => (
              <div key={a.id} className="flex items-start gap-3 group">
                <div
                  className={`h-8 w-8 rounded-lg ${a.iconoBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
                >
                  <a.icono className={`h-4 w-4 ${a.iconoColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#164E63]">{a.texto}</p>
                  <p className="text-[10px] text-[#164E63]/50 truncate">{a.detalle}</p>
                </div>
                <span className="text-[10px] text-[#164E63]/40 shrink-0 mt-0.5">{a.tiempo}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Evolución del Dolor — col-span-3 */}
        <Card className="lg:col-span-3 border-cyan-100 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#164E63]">Evolución del Dolor</CardTitle>
            <p className="text-[11px] text-[#164E63]/50">Ana Flores Torres · Fisio deportiva rodilla</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#164E63]/40">EVA 10</span>
              <span className="text-[10px] text-emerald-600 font-bold">↓ Mejora: 71%</span>
            </div>
            <DolorSVG data={dolorData} />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-[#164E63]/40">Sesión 1</span>
              <span className="text-[10px] text-[#164E63]/40">Sesión 7</span>
            </div>
            <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-[10px] text-emerald-700 font-medium">Dolor reducido de 7/10 a 2/10 en 7 sesiones</p>
            </div>
          </CardContent>
        </Card>

        {/* Accesos Rápidos — col-span-3 */}
        <Card className="lg:col-span-3 border-cyan-100 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#164E63]">Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {accesosRapidos.map((a) => (
                <Link key={a.label} href={a.href}>
                  <Button
                    variant="outline"
                    className="w-full h-9 cursor-pointer border-cyan-100 text-[#164E63]/70 hover:border-[#0891B2] hover:text-[#0891B2] hover:bg-cyan-50 transition-all duration-200 text-xs gap-1.5 justify-start"
                  >
                    <a.icono className="h-3.5 w-3.5 shrink-0" />
                    {a.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
