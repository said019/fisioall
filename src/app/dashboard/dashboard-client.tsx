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
  Receipt,
  ExternalLink,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmarAnticipo, rechazarComprobante } from "./agenda/actions";

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
// MOCK DATA (fallback cuando no hay DB)
// ─────────────────────────────────────────────────────────────────────────────
const actividadReciente: ActividadItem[] = [
  { id: "1", icono: CheckCircle2, iconoBg: "bg-emerald-50", iconoColor: "text-emerald-500", texto: "Sesión completada con Ana Flores", detalle: "Fisio deportiva · Rodilla derecha", tiempo: "hace 5 min" },
  { id: "2", icono: UserPlus, iconoBg: "bg-[#e4ecf2]", iconoColor: "text-[#4a7fa5]", texto: "Nuevo paciente registrado", detalle: "Sebastián Cruz Medina · Evaluación inicial", tiempo: "hace 42 min" },
  { id: "3", icono: CreditCard, iconoBg: "bg-violet-50", iconoColor: "text-violet-500", texto: "Tarjeta de lealtad sellada", detalle: "Patricia Morales · 8/10 sellos completados", tiempo: "hace 1 h" },
  { id: "4", icono: FileEdit, iconoBg: "bg-amber-50", iconoColor: "text-amber-500", texto: "Nota SOAP actualizada", detalle: "Carlos Mendoza · Terapia manual C3-C5", tiempo: "hace 2 h" },
  { id: "5", icono: CalendarCheck, iconoBg: "bg-[#4a7fa5]/10", iconoColor: "text-[#4a7fa5]", texto: "Cita confirmada por WhatsApp", detalle: "Roberto Sánchez · 11:30 hrs", tiempo: "hace 3 h" },
];

const accesosRapidos = [
  { label: "Nueva Cita", href: "/dashboard/agenda", icono: CalendarDays },
  { label: "Nuevo Paciente", href: "/dashboard/pacientes", icono: UserPlus },
  { label: "Nota SOAP", href: "/dashboard/pacientes", icono: ClipboardList },
  { label: "Ver Agenda", href: "/dashboard/agenda", icono: CalendarCheck },
  { label: "Servicios", href: "/dashboard/servicios", icono: CreditCard },
  { label: "Tarjetas", href: "/dashboard/tarjetas", icono: Dumbbell },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function EstadoBadge({ estado, anticipoPagado }: { estado: string; anticipoPagado?: boolean }) {
  // Caso especial: agendada con anticipo validado pero paciente aún no confirma
  if (estado === "agendada" && anticipoPagado) {
    return (
      <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5 shrink-0 bg-[#e4ecf2] text-[#4a7fa5] border-[#a8cfe0]">
        Anticipo OK
      </Badge>
    );
  }

  const config: Record<string, { label: string; className: string }> = {
    pendiente_anticipo: { label: "Pendiente anticipo", className: "bg-amber-50 text-amber-700 border-amber-200" },
    agendada:   { label: "Agendada",   className: "bg-slate-100 text-slate-600 border-slate-200" },
    confirmada: { label: "Confirmada", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    en_curso:   { label: "En curso",   className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    completada: { label: "Completada", className: "bg-green-50 text-green-700 border-green-200" },
    cancelada:  { label: "Cancelada",  className: "bg-red-50 text-red-600 border-red-200" },
    no_show:    { label: "No asistió", className: "bg-red-50 text-red-600 border-red-200" },
  };
  const { label, className } = config[estado] ?? { label: estado, className: "bg-slate-100 text-slate-600 border-slate-200" };
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
              className={`w-full rounded-t-sm transition-all duration-300 ${isLast ? "bg-[#4a7fa5]" : "bg-[#4a7fa5]/20"}`}
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-[9px] text-[#1e2d3a]/40 leading-none">{d.mes}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FECHA DE HOY (derivada en runtime)
// ─────────────────────────────────────────────────────────────────────────────
function getFechaHoy(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  const label = d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export interface DashboardData {
  fechaHoy?: string;
  kpis?: {
    citasHoy: number;
    citasDelta?: number;
    pacientesActivos: number;
    pacientesDelta?: number;
    membresiasActivas: number;
    membresiasPorVencer?: number;
    sesionesCompletadas: number;
    sesionesDelta?: number;
  };
  citasHoy?: {
    id: string;
    hora: string;
    paciente: string;
    iniciales: string;
    motivo: string;
    estado: string;
    anticipoPagado?: boolean;
    sala: string | null;
  }[];
  sesionesPorMes?: { mes: string; valor: number }[];
  membresiasPorVencer?: {
    id: string;
    nombre: string;
    iniciales: string;
    plan: string;
    sesionesUsadas: number;
    sesionesTotales: number;
    sesionesRestantes: number;
  }[];
  equipo?: {
    id: string;
    nombre: string;
    iniciales: string;
    rol: string;
    citasHoy: number;
  }[];
  anticiposPendientes?: {
    id: string;
    paciente: string;
    telefono: string | null;
    monto: number;
    comprobanteUrl: string | null;
    fechaPago: string;
    cita: {
      id: string;
      fecha: string;
      hora: string;
      tipoSesion: string;
      estado: string;
    } | null;
  }[];
}

export default function DashboardClient({ data }: { data?: DashboardData }) {
  const [anticipoPending, startAnticipoTransition] = useTransition();

  // Datos derivados (real DB → fallback a vacío)
  const fechaCapitalized = getFechaHoy(data?.fechaHoy);
  const citasAgenda = data?.citasHoy ?? [];
  const membresiasAlerta = data?.membresiasPorVencer ?? [];
  const sesionesData = data?.sesionesPorMes ?? [];
  const sesionesMesActual = data?.kpis?.sesionesCompletadas ?? 0;
  const sesionesMesAnterior = sesionesData.length >= 2 ? sesionesData[sesionesData.length - 2].valor : 0;
  const sesionesDelta = sesionesMesActual - sesionesMesAnterior;
  const mesActualLabel = sesionesData.length > 0
    ? sesionesData[sesionesData.length - 1].mes.replace(/^./, (c) => c.toUpperCase()) + " " + new Date().getFullYear()
    : new Date().toLocaleDateString("es-MX", { month: "short", year: "numeric" });
  const mesAnteriorLabel = sesionesData.length >= 2
    ? sesionesData[sesionesData.length - 2].mes
    : "";
  const router = useRouter();

  const handleValidar = (citaId: string) => {
    startAnticipoTransition(async () => {
      await confirmarAnticipo(citaId, "transferencia");
      router.refresh();
    });
  };

  const handleRechazar = (citaId: string) => {
    const motivo = window.prompt("Motivo del rechazo (opcional):") ?? undefined;
    startAnticipoTransition(async () => {
      await rechazarComprobante(citaId, motivo || undefined);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#f0f4f7] min-h-full">

      {/* ── 1. BARRA SUPERIOR ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Fecha + conteo */}
        <div>
          <p className="text-sm font-semibold text-[#1e2d3a]">{fechaCapitalized}</p>
          <p className="text-xs text-[#1e2d3a]/50 mt-0.5">
            {citasAgenda.length} cita{citasAgenda.length !== 1 ? "s" : ""} programada{citasAgenda.length !== 1 ? "s" : ""}
          </p>
        </div>
        {/* Botones de acción */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard/agenda">
            <Button size="sm" variant="outline" className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] transition-all duration-200 gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Nueva Cita
            </Button>
          </Link>
          <Link href="/dashboard/pacientes">
            <Button size="sm" variant="outline" className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] transition-all duration-200 gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Nuevo Paciente
            </Button>
          </Link>
          <Link href="/dashboard/pacientes">
            <Button size="sm" className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white transition-all duration-200 gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              Nota SOAP
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Citas de Hoy */}
        <Card className="border-[#c8dce8] bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-[#e4ecf2] flex items-center justify-center shrink-0">
                <CalendarDays className="h-5 w-5 text-[#4a7fa5]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">{data?.kpis?.citasHoy ?? 0}</p>
            <p className="text-xs text-[#1e2d3a]/50 mt-0.5">Citas de Hoy</p>
            {data?.kpis?.citasDelta !== undefined && (
              <p className={`text-[11px] font-medium mt-1.5 flex items-center gap-1 ${data.kpis.citasDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                <TrendingUp className="h-3 w-3" /> {data.kpis.citasDelta >= 0 ? "+" : ""}{data.kpis.citasDelta} desde ayer
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pacientes Activos */}
        <Card className="border-[#c8dce8] bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-violet-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">{data?.kpis?.pacientesActivos ?? 0}</p>
            <p className="text-xs text-[#1e2d3a]/50 mt-0.5">Pacientes Activos</p>
            {data?.kpis?.pacientesDelta !== undefined && data.kpis.pacientesDelta !== 0 && (
              <p className={`text-[11px] font-medium mt-1.5 flex items-center gap-1 ${data.kpis.pacientesDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                <TrendingUp className="h-3 w-3" /> {data.kpis.pacientesDelta >= 0 ? "+" : ""}{data.kpis.pacientesDelta} este mes
              </p>
            )}
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
            <p className="text-2xl font-bold text-orange-600">{data?.kpis?.membresiasActivas ?? 0}</p>
            <p className="text-xs text-[#1e2d3a]/50 mt-0.5">Tarjetas Activas</p>
            <p className="text-[11px] text-orange-500 font-medium mt-1.5">
              {data?.kpis?.membresiasPorVencer ? `${data.kpis.membresiasPorVencer} requiere${data.kpis.membresiasPorVencer !== 1 ? "n" : ""} atención` : "Sin alertas"}
            </p>
          </CardContent>
        </Card>

        {/* Sesiones Completadas */}
        <Card className="border-[#c8dce8] bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1e2d3a]">{data?.kpis?.sesionesCompletadas ?? 0}</p>
            <p className="text-xs text-[#1e2d3a]/50 mt-0.5">Sesiones del Mes</p>
            {data?.kpis?.sesionesDelta !== undefined && data.kpis.sesionesDelta !== 0 && (
              <p className={`text-[11px] font-medium mt-1.5 flex items-center gap-1 ${data.kpis.sesionesDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                <TrendingUp className="h-3 w-3" /> {data.kpis.sesionesDelta >= 0 ? "+" : ""}{data.kpis.sesionesDelta} vs mes anterior
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 2.5 ANTICIPOS POR VERIFICAR ───────────────────────────────── */}
      {data?.anticiposPendientes && data.anticiposPendientes.length > 0 && (
        <Card className="border-[#e89b3f]/30 bg-[#e89b3f]/5">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#e89b3f]/15 flex items-center justify-center">
                <Receipt className="h-3.5 w-3.5 text-[#e89b3f]" />
              </div>
              Anticipos por Verificar
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-[#e89b3f]/10 text-[#e89b3f] border-[#e89b3f]/30">
              {data.anticiposPendientes.length} pendiente{data.anticiposPendientes.length !== 1 ? "s" : ""}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.anticiposPendientes.map((a) => {
              const canValidate = a.cita?.estado === "pendiente_anticipo" && a.cita?.id;
              const hasValidUrl = !!a.comprobanteUrl && !a.comprobanteUrl.startsWith("/uploads/");
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white border border-[#e89b3f]/20 hover:border-[#e89b3f]/40 transition-all duration-200"
                >
                  <div className="h-9 w-9 rounded-lg bg-[#e89b3f]/10 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4 text-[#e89b3f]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1e2d3a] truncate">{a.paciente}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {a.cita && (
                        <span className="text-[10px] text-[#1e2d3a]/50 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {a.cita.fecha} · {a.cita.hora} · {a.cita.tipoSesion}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#e89b3f] shrink-0">${a.monto}</p>
                  {hasValidUrl && (
                    <a
                      href={a.comprobanteUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 h-8 w-8 rounded-lg bg-[#4a7fa5]/10 flex items-center justify-center hover:bg-[#4a7fa5]/20 transition-colors"
                      title="Ver comprobante"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#4a7fa5]" />
                    </a>
                  )}
                  {canValidate && (
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        onClick={() => handleValidar(a.cita!.id)}
                        disabled={anticipoPending}
                        className="h-8 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer text-xs px-2.5"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Validar
                      </Button>
                      <Button
                        onClick={() => handleRechazar(a.cita!.id)}
                        disabled={anticipoPending}
                        variant="outline"
                        className="h-8 border-[#d9534f]/30 text-[#d9534f] hover:bg-[#d9534f]/5 cursor-pointer text-xs px-2.5"
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── 3. GRID PRINCIPAL ──────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-4">

        {/* Agenda de Hoy — col 7 */}
        <Card className="lg:col-span-7 border-[#c8dce8] bg-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#4a7fa5]" />
              Agenda de Hoy
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-[#e4ecf2] text-[#4a7fa5] border-[#a8cfe0]">
              {citasAgenda.length} cita{citasAgenda.length !== 1 ? "s" : ""}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {citasAgenda.length === 0 ? (
              <p className="text-xs text-[#1e2d3a]/40 text-center py-8">No hay citas programadas para hoy</p>
            ) : citasAgenda.map((cita) => (
              <div
                key={cita.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  cita.estado === "en_curso"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-[#f0f4f7]/40 border-[#c8dce8] hover:bg-[#f0f4f7]"
                }`}
              >
                <div className="min-w-[48px] text-right shrink-0">
                  <p className="text-xs font-bold text-[#1e2d3a]">{cita.hora}</p>
                  {cita.sala && <p className="text-[10px] text-[#1e2d3a]/40">{cita.sala}</p>}
                </div>
                <div
                  className={`w-0.5 h-10 rounded-full shrink-0 ${
                    cita.estado === "en_curso"
                      ? "bg-emerald-400"
                      : cita.estado === "completada"
                      ? "bg-green-300"
                      : "bg-[#a8cfe0]"
                  }`}
                />
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-[#4a7fa5]/10 text-[#4a7fa5] text-[10px] font-bold">
                    {cita.iniciales}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1e2d3a] truncate">{cita.paciente}</p>
                  <p className="text-[10px] text-[#1e2d3a]/50 truncate">{cita.motivo}</p>
                </div>
                <EstadoBadge estado={cita.estado} anticipoPagado={cita.anticipoPagado} />
              </div>
            ))}

            <Link href="/dashboard/agenda">
              <div className="flex items-center justify-center gap-1 pt-2 text-xs font-medium text-[#4a7fa5] hover:text-[#4a7fa5]/80 cursor-pointer transition-colors duration-200">
                Ver agenda completa
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Columna derecha — col 5 (3 cards apiladas) */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* Sesiones por Vencer */}
          <Card className="border-orange-200 bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Bell className="h-3.5 w-3.5 text-orange-500" />
                </div>
                Sesiones por Vencer
              </CardTitle>
              <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200">
                {membresiasAlerta.length} alerta{membresiasAlerta.length !== 1 ? "s" : ""}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {membresiasAlerta.length === 0 ? (
                <p className="text-xs text-[#1e2d3a]/40 text-center py-6">Ninguna membresía por vencer</p>
              ) : membresiasAlerta.map((m) => {
                const restantes = m.sesionesRestantes;
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
                        <p className="text-xs font-semibold text-[#1e2d3a] truncate">{m.nombre}</p>
                        <p className="text-[10px] font-bold text-orange-600 shrink-0 ml-2">
                          {restantes === 0 ? "Sin sesiones" : `${restantes} restante${restantes !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <Progress
                        value={pct}
                        className="h-1.5 bg-orange-100 [&>div]:bg-orange-400"
                      />
                      <p className="text-[9px] text-[#1e2d3a]/40 mt-0.5">{m.plan}</p>
                    </div>
                  </div>
                );
              })}

              <Link href="/dashboard/servicios">
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

          {/* Sesiones Mensuales */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#1e2d3a]">Sesiones Mensuales</CardTitle>
                <Badge variant="outline" className="text-[10px] bg-[#e4ecf2] text-[#4a7fa5] border-[#a8cfe0] capitalize">
                  {mesActualLabel}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-[#1e2d3a]">{sesionesMesActual}</p>
              {sesionesData.length >= 2 && (
                <p className={`text-[11px] font-medium flex items-center gap-1 ${sesionesDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  <TrendingUp className="h-3 w-3" />
                  {sesionesDelta >= 0 ? "+" : ""}{sesionesDelta} vs {mesAnteriorLabel} · {sesionesMesAnterior}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-2">
              {sesionesData.length === 0 ? (
                <div className="h-20 flex items-center justify-center text-[10px] text-[#1e2d3a]/40">Sin datos</div>
              ) : (
                <MiniBarChart data={sesionesData} />
              )}
            </CardContent>
          </Card>

          {/* Accesos Rápidos */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a]">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {accesosRapidos.map((a) => (
                  <Link key={a.label} href={a.href}>
                    <Button
                      variant="outline"
                      className="w-full h-9 cursor-pointer border-[#c8dce8] text-[#1e2d3a]/70 hover:border-[#4a7fa5] hover:text-[#4a7fa5] hover:bg-[#e4ecf2] transition-all duration-200 text-xs gap-1.5 justify-start"
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

      {/* ── 4. ACTIVIDAD RECIENTE (full width) ───────────────────────────── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-[#4a7fa5]" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {actividadReciente.map((a) => (
              <div key={a.id} className="flex items-start gap-3 group p-3 rounded-xl bg-[#f0f4f7]/40 border border-[#e4ecf2] hover:bg-[#f0f4f7] transition-all duration-200">
                <div
                  className={`h-8 w-8 rounded-lg ${a.iconoBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
                >
                  <a.icono className={`h-4 w-4 ${a.iconoColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1e2d3a]">{a.texto}</p>
                  <p className="text-[10px] text-[#1e2d3a]/50 truncate">{a.detalle}</p>
                  <span className="text-[10px] text-[#1e2d3a]/40">{a.tiempo}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
