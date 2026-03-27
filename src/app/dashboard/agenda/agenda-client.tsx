"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  CalendarDays,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Loader2,
} from "lucide-react";
import { crearCita, actualizarEstadoCita } from "./actions";

// ── TIPOS ───────────────────────────────────────────────────────────────────
type Cita = {
  id: string;
  paciente: string;
  initials: string;
  motivo: string;
  hora: string;
  duracion: number;
  estado: "confirmada" | "en-curso" | "pendiente" | "cancelada" | "completada";
  dayIndex: number;
  sesion: string;
  sala: string;
};

type PacienteOption = {
  id: string;
  nombre: string;
  iniciales: string;
  telefono: string;
};

type FisioOption = {
  id: string;
  nombre: string;
  iniciales: string;
};

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const diasSemana = [
  { label: "Lun", fecha: "23 Mar", dayIndex: 0, isoDate: "2026-03-23" },
  { label: "Mar", fecha: "24 Mar", dayIndex: 1, isoDate: "2026-03-24" },
  { label: "Mié", fecha: "25 Mar", dayIndex: 2, isoDate: "2026-03-25" },
  { label: "Jue", fecha: "26 Mar", dayIndex: 3, isoDate: "2026-03-26" },
  { label: "Vie", fecha: "27 Mar", dayIndex: 4, isoDate: "2026-03-27" },
  { label: "Sáb", fecha: "28 Mar", dayIndex: 5, isoDate: "2026-03-28" },
];

const mockCitas: Cita[] = [
  { id: "1", paciente: "Fernanda Castillo", initials: "FC", motivo: "Fisioterapia — Lumbalgia", hora: "09:00", duracion: 60, estado: "confirmada", dayIndex: 0, sesion: "6/10", sala: "Sala A" },
  { id: "2", paciente: "Diego Ochoa", initials: "DO", motivo: "Masaje Terapéutico", hora: "11:00", duracion: 45, estado: "confirmada", dayIndex: 0, sesion: "3/8", sala: "Sala B" },
  { id: "3", paciente: "Ana Sofía Morales", initials: "AM", motivo: "Tratamiento Facial", hora: "13:30", duracion: 60, estado: "confirmada", dayIndex: 0, sesion: "2/6", sala: "Sala A" },
  { id: "4", paciente: "María González Ríos", initials: "MG", motivo: "Rehab. Rodilla Post-Op", hora: "09:00", duracion: 60, estado: "completada", dayIndex: 1, sesion: "8/10", sala: "Sala A" },
  { id: "5", paciente: "Roberto Hernández", initials: "RH", motivo: "Fisioterapia — Cervicalgia", hora: "10:30", duracion: 60, estado: "en-curso", dayIndex: 1, sesion: "3/5", sala: "Sala B" },
  { id: "6", paciente: "Valeria Soto Pérez", initials: "VS", motivo: "Drenaje Linfático", hora: "12:00", duracion: 45, estado: "confirmada", dayIndex: 1, sesion: "1/8", sala: "Sala A" },
  { id: "7", paciente: "Jorge Ramírez Luna", initials: "JR", motivo: "Suelo Pélvico", hora: "13:00", duracion: 45, estado: "pendiente", dayIndex: 1, sesion: "5/5", sala: "Sala B" },
  { id: "8", paciente: "Ana Sofía Morales", initials: "AM", motivo: "Tratamiento Corporal", hora: "15:30", duracion: 60, estado: "confirmada", dayIndex: 1, sesion: "2/6", sala: "Sala A" },
  { id: "9", paciente: "Luis Alberto Torres", initials: "LT", motivo: "Fisioterapia — Esguince", hora: "17:00", duracion: 45, estado: "cancelada", dayIndex: 1, sesion: "4/5", sala: "Sala B" },
  { id: "10", paciente: "Fernanda Castillo", initials: "FC", motivo: "Fisioterapia — Lumbalgia", hora: "09:30", duracion: 60, estado: "confirmada", dayIndex: 2, sesion: "7/10", sala: "Sala A" },
  { id: "11", paciente: "Diego Ochoa", initials: "DO", motivo: "Masaje Descontracturante", hora: "11:30", duracion: 45, estado: "confirmada", dayIndex: 2, sesion: "4/8", sala: "Sala B" },
  { id: "12", paciente: "Roberto Hernández", initials: "RH", motivo: "Fisioterapia — Cervicalgia", hora: "10:00", duracion: 60, estado: "confirmada", dayIndex: 3, sesion: "4/5", sala: "Sala A" },
  { id: "13", paciente: "Valeria Soto Pérez", initials: "VS", motivo: "Drenaje Linfático", hora: "12:00", duracion: 45, estado: "pendiente", dayIndex: 3, sesion: "2/8", sala: "Sala B" },
  { id: "14", paciente: "María González Ríos", initials: "MG", motivo: "Rehab. Rodilla Post-Op", hora: "14:00", duracion: 60, estado: "confirmada", dayIndex: 3, sesion: "9/10", sala: "Sala A" },
  { id: "15", paciente: "Ana Sofía Morales", initials: "AM", motivo: "Tratamiento Facial", hora: "09:00", duracion: 60, estado: "confirmada", dayIndex: 4, sesion: "3/6", sala: "Sala A" },
  { id: "16", paciente: "Jorge Ramírez Luna", initials: "JR", motivo: "Suelo Pélvico", hora: "11:00", duracion: 45, estado: "pendiente", dayIndex: 4, sesion: "1/5", sala: "Sala B" },
  { id: "17", paciente: "Diego Ochoa", initials: "DO", motivo: "Masaje Relajante", hora: "10:00", duracion: 45, estado: "confirmada", dayIndex: 5, sesion: "5/8", sala: "Sala A" },
];

const estadoConfig: Record<string, { label: string; bg: string; border: string; text: string }> = {
  confirmada:  { label: "Confirmada",  bg: "bg-[#3fa87c]/10",  border: "border-[#3fa87c]/30", text: "text-[#3fa87c]" },
  "en-curso":  { label: "En curso",    bg: "bg-[#4a7fa5]/15",  border: "border-[#4a7fa5]/40", text: "text-[#4a7fa5]" },
  pendiente:   { label: "Pendiente",   bg: "bg-[#F59E0B]/10",  border: "border-[#F59E0B]/30", text: "text-[#F59E0B]" },
  cancelada:   { label: "Cancelada",   bg: "bg-[#d9534f]/5",   border: "border-[#d9534f]/20", text: "text-[#d9534f]" },
  completada:  { label: "Completada",  bg: "bg-[#1e2d3a]/5",   border: "border-[#1e2d3a]/15", text: "text-[#1e2d3a]/50" },
};

const TIPOS_SESION = [
  "Fisioterapia",
  "Masaje Terapéutico",
  "Masaje Relajante",
  "Masaje Descontracturante",
  "Drenaje Linfático",
  "Tratamiento Facial",
  "Tratamiento Corporal",
  "Suelo Pélvico",
  "Rehabilitación",
  "Epilación",
];

const HORAS_DISPONIBLES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00",
];

const HOY_INDEX = 1;

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function AgendaClient({
  initialCitas,
  pacientes,
  fisioterapeutas,
}: {
  initialCitas?: Cita[];
  pacientes?: PacienteOption[];
  fisioterapeutas?: FisioOption[];
}) {
  const citasData = initialCitas && initialCitas.length > 0 ? initialCitas : mockCitas;

  const [diaActivo, setDiaActivo] = useState(HOY_INDEX);
  const [vistaCalendario, setVistaCalendario] = useState<"mes" | "semana" | "dia">("semana");
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [modalNuevaCita, setModalNuevaCita] = useState(false);

  // ── Form state for nueva cita ──
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteOption | null>(null);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [duracion, setDuracion] = useState("45");
  const [tipoSesion, setTipoSesion] = useState("");
  const [fisioId, setFisioId] = useState("");
  const [sala, setSala] = useState("");
  const [fechaCita, setFechaCita] = useState(diasSemana[diaActivo]?.isoDate || "2026-03-24");

  // Server action state
  const [formState, formAction, isPending] = useActionState(crearCita, null);
  const [statusPending, startStatusTransition] = useTransition();

  // When day changes, update the form date
  useEffect(() => {
    if (diasSemana[diaActivo]) {
      setFechaCita(diasSemana[diaActivo].isoDate);
    }
  }, [diaActivo]);

  // When form succeeds, close modal and reset
  useEffect(() => {
    if (formState?.success) {
      setModalNuevaCita(false);
      resetForm();
    }
  }, [formState]);

  function resetForm() {
    setBusquedaPaciente("");
    setPacienteSeleccionado(null);
    setHoraInicio("09:00");
    setDuracion("45");
    setTipoSesion("");
    setFisioId("");
    setSala("");
  }

  function openNuevaCita() {
    resetForm();
    setFechaCita(diasSemana[diaActivo]?.isoDate || "2026-03-24");
    setModalNuevaCita(true);
  }

  // Filter pacientes for search
  const pacientesFiltrados = (pacientes || []).filter((p) =>
    p.nombre.toLowerCase().includes(busquedaPaciente.toLowerCase()) ||
    p.telefono.includes(busquedaPaciente)
  );

  const citasDia = citasData
    .filter((c) => c.dayIndex === diaActivo)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const totalSemana = citasData.filter(c => c.estado !== "cancelada").length;
  const confirmadas = citasData.filter(c => c.estado === "confirmada").length;
  const completadas = citasData.filter(c => c.estado === "completada").length;
  const canceladas = citasData.filter(c => c.estado === "cancelada").length;

  function handleStatusChange(citaId: string, estado: "completada" | "cancelada") {
    startStatusTransition(async () => {
      await actualizarEstadoCita(citaId, estado);
      setCitaSeleccionada(null);
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1e2d3a]">Semana del 23 – 28 Mar 2026</h2>
          <p className="text-sm text-[#1e2d3a]/50">{totalSemana} citas programadas esta semana</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#c8dce8] overflow-hidden">
            {(["mes", "semana", "dia"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVistaCalendario(v)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  vistaCalendario === v
                    ? "bg-[#4a7fa5] text-white"
                    : "bg-white text-[#5a7080] hover:bg-[#e4ecf2]"
                }`}
              >
                {v === "mes" ? "Mes" : v === "semana" ? "Semana" : "Día"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer h-9 w-9">
            <ChevronLeft className="h-4 w-4 text-[#1e2d3a]" />
          </Button>
          <Button variant="outline" className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer text-xs text-[#1e2d3a] h-9">
            <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-[#4a7fa5]" />
            Esta semana
          </Button>
          <Button variant="outline" size="icon" className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer h-9 w-9">
            <ChevronRight className="h-4 w-4 text-[#1e2d3a]" />
          </Button>
          <Button
            onClick={openNuevaCita}
            className="bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer transition-all duration-200 text-sm h-9"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Stats semana */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Semana", value: totalSemana, color: "text-[#1e2d3a]", bg: "bg-[#1e2d3a]/5" },
          { label: "Confirmadas", value: confirmadas, color: "text-[#3fa87c]", bg: "bg-[#3fa87c]/10" },
          { label: "Completadas", value: completadas, color: "text-[#4a7fa5]", bg: "bg-[#4a7fa5]/10" },
          { label: "Canceladas", value: canceladas, color: "text-[#d9534f]", bg: "bg-[#d9534f]/10" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-lg p-3 flex items-center justify-between`}>
            <span className="text-xs font-medium text-[#1e2d3a]/60">{s.label}</span>
            <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── MONTH VIEW ── */}
      {vistaCalendario === "mes" && (
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Mini calendar */}
          <Card className="border-[#c8dce8] bg-white lg:col-span-3">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-bold text-[#1e2d3a]">Marzo 2026</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-7 mb-1">
                {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-[#8fa8ba] py-1.5">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const dayIdx = diasSemana.findIndex(d => parseInt(d.fecha.split(" ")[0]) === day);
                  const citasCount = dayIdx >= 0 ? citasData.filter(c => c.dayIndex === dayIdx && c.estado !== "cancelada").length : 0;
                  const isToday = day === 24;
                  const isSelected = dayIdx === diaActivo && dayIdx >= 0;
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        const idx = diasSemana.findIndex(d => parseInt(d.fecha.split(" ")[0]) === day);
                        if (idx >= 0) setDiaActivo(idx);
                      }}
                      className={`relative h-9 rounded-md flex items-center justify-center text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#4a7fa5] text-white font-bold"
                          : isToday
                          ? "bg-[#4a7fa5]/10 text-[#4a7fa5] font-bold ring-1 ring-[#4a7fa5]/30"
                          : dayIdx >= 0
                          ? "hover:bg-[#e4ecf2] text-[#1e2d3a] font-medium"
                          : "text-[#1e2d3a]/25"
                      }`}
                      style={day === 1 ? { gridColumnStart: 7 } : undefined}
                    >
                      {day}
                      {citasCount > 0 && (
                        <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                          isSelected ? "bg-white" : "bg-[#4a7fa5]"
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Day detail panel */}
          <Card className="border-[#c8dce8] bg-white lg:col-span-4">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#1e2d3a]">
                    {diasSemana[diaActivo]?.label} {diasSemana[diaActivo]?.fecha}
                    {diaActivo === HOY_INDEX && (
                      <Badge className="ml-2 text-[10px] bg-[#4a7fa5] text-white border-0 h-5">HOY</Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-[#1e2d3a]/50 mt-0.5">
                    {citasDia.length === 0 ? "Sin citas" : `${citasDia.length} citas programadas`}
                  </p>
                </div>
                <Button
                  onClick={() => { setVistaCalendario("dia"); }}
                  variant="outline"
                  className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer text-[10px] h-7 px-2 text-[#4a7fa5]"
                >
                  Ver día completo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {citasDia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="h-8 w-8 text-[#1e2d3a]/15 mb-2" />
                  <p className="text-xs font-medium text-[#1e2d3a]/40">Sin citas este día</p>
                  <Button
                    onClick={openNuevaCita}
                    className="mt-3 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer text-xs h-7 px-3"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Agendar
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[#e4ecf2]">
                  {citasDia.map((cita) => {
                    const conf = estadoConfig[cita.estado];
                    return (
                      <div
                        key={cita.id}
                        onClick={() => setCitaSeleccionada(cita)}
                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#e4ecf2]/50 transition-all ${
                          cita.estado === "cancelada" ? "opacity-40" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center w-10 shrink-0">
                          <span className="text-xs font-bold text-[#1e2d3a]">{cita.hora}</span>
                          <span className="text-[10px] text-[#1e2d3a]/30">{cita.duracion}min</span>
                        </div>
                        <div className={`w-0.5 h-8 rounded-full shrink-0 ${conf.border} border-l-2`} />
                        <Avatar className="h-8 w-8 border border-[#c8dce8] shrink-0">
                          <AvatarFallback className="bg-[#4a7fa5]/10 text-[#4a7fa5] text-[10px] font-bold">
                            {cita.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1e2d3a] truncate">{cita.paciente}</p>
                          <p className="text-[11px] text-[#1e2d3a]/50 truncate">{cita.motivo}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${conf.bg} ${conf.text} ${conf.border} shrink-0`}>
                          {conf.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {vistaCalendario !== "mes" && (
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Selector días */}
        {vistaCalendario === "semana" && (
        <Card className="border-[#c8dce8] bg-white lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#1e2d3a]">Días de la Semana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-3 pt-0">
            {diasSemana.map((dia) => {
              const citasDiaCount = citasData.filter(c => c.dayIndex === dia.dayIndex && c.estado !== "cancelada").length;
              const isHoy = dia.dayIndex === HOY_INDEX;
              const isActivo = dia.dayIndex === diaActivo;
              return (
                <button
                  key={dia.dayIndex}
                  onClick={() => setDiaActivo(dia.dayIndex)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActivo
                      ? "bg-[#4a7fa5] text-white"
                      : "hover:bg-[#e4ecf2] text-[#1e2d3a]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div>
                      <p className={`text-sm font-bold leading-none ${isActivo ? "text-white" : "text-[#1e2d3a]"}`}>
                        {dia.label}
                        {isHoy && !isActivo && <span className="ml-1 text-[9px] font-bold text-[#4a7fa5] uppercase tracking-wide">HOY</span>}
                        {isHoy && isActivo && <span className="ml-1 text-[9px] font-bold text-white/70 uppercase tracking-wide">HOY</span>}
                      </p>
                      <p className={`text-[10px] leading-none mt-0.5 ${isActivo ? "text-white/70" : "text-[#1e2d3a]/40"}`}>{dia.fecha}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 px-1.5 ${
                      isActivo
                        ? "bg-white/20 text-white border-white/30"
                        : citasDiaCount > 0
                        ? "bg-[#4a7fa5]/10 text-[#4a7fa5] border-[#4a7fa5]/20"
                        : "text-[#1e2d3a]/30 border-[#1e2d3a]/10"
                    }`}
                  >
                    {citasDiaCount}
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>
        )}

        {/* Lista de citas del día */}
        <Card className={`border-[#c8dce8] bg-white ${vistaCalendario === "semana" ? "lg:col-span-5" : "lg:col-span-7"}`}>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#1e2d3a]">
                {diasSemana[diaActivo].label} {diasSemana[diaActivo].fecha}
                {diaActivo === HOY_INDEX && (
                  <Badge className="ml-2 text-[10px] bg-[#4a7fa5] text-white border-0 h-5">HOY</Badge>
                )}
              </CardTitle>
              <p className="text-xs text-[#1e2d3a]/50 mt-0.5">
                {citasDia.length === 0 ? "Sin citas" : `${citasDia.length} citas programadas`}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {citasDia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-10 w-10 text-[#1e2d3a]/20 mb-3" />
                <p className="text-sm font-medium text-[#1e2d3a]/50">Sin citas este día</p>
                <Button
                  onClick={openNuevaCita}
                  className="mt-4 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer text-xs h-8"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Agendar Cita
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#e4ecf2]">
                {citasDia.map((cita) => {
                  const conf = estadoConfig[cita.estado];
                  return (
                    <div
                      key={cita.id}
                      onClick={() => setCitaSeleccionada(cita)}
                      className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[#e4ecf2]/50 transition-all duration-200 ${
                        cita.estado === "cancelada" ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center w-10 shrink-0">
                        <span className="text-xs font-bold text-[#1e2d3a]">{cita.hora}</span>
                        <span className="text-[10px] text-[#1e2d3a]/30">{cita.duracion}min</span>
                      </div>
                      <div className={`w-1 h-10 rounded-full shrink-0 ${conf.bg.replace("/10","").replace("/5","").replace("/15","")} border-l-4 ${conf.border}`} />
                      <Avatar className="h-9 w-9 border border-[#c8dce8] shrink-0">
                        <AvatarFallback className="bg-[#4a7fa5]/10 text-[#4a7fa5] text-xs font-bold">
                          {cita.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1e2d3a] truncate">{cita.paciente}</p>
                        <p className="text-xs text-[#1e2d3a]/50 truncate">{cita.motivo} · {cita.sala}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${conf.bg} ${conf.text} ${conf.border}`}>
                          {conf.label}
                        </Badge>
                        <span className="text-[10px] text-[#1e2d3a]/40">Ses. {cita.sesion}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* ── MODAL: DETALLE CITA ── */}
      <Dialog open={!!citaSeleccionada} onOpenChange={() => setCitaSeleccionada(null)}>
        {citaSeleccionada && (
          <DialogContent className="max-w-sm border-[#c8dce8]">
            <DialogHeader>
              <DialogTitle className="text-[#1e2d3a] font-bold">Detalle de Cita</DialogTitle>
              <DialogDescription className="text-[#1e2d3a]/50 text-xs">
                {diasSemana[citaSeleccionada.dayIndex].label} {diasSemana[citaSeleccionada.dayIndex].fecha} · {citaSeleccionada.hora}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-[#a8cfe0]">
                  <AvatarFallback className="bg-[#4a7fa5]/20 text-[#4a7fa5] font-bold">
                    {citaSeleccionada.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#1e2d3a]">{citaSeleccionada.paciente}</p>
                  <p className="text-xs text-[#1e2d3a]/50">{citaSeleccionada.motivo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#e4ecf2]/50 rounded-lg p-3">
                  <p className="text-[10px] text-[#1e2d3a]/50 uppercase tracking-wide">Horario</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3.5 w-3.5 text-[#4a7fa5]" />
                    <span className="text-sm font-bold text-[#1e2d3a]">{citaSeleccionada.hora}</span>
                  </div>
                  <p className="text-xs text-[#1e2d3a]/40">{citaSeleccionada.duracion} minutos</p>
                </div>
                <div className="bg-[#e4ecf2]/50 rounded-lg p-3">
                  <p className="text-[10px] text-[#1e2d3a]/50 uppercase tracking-wide">Sesión</p>
                  <p className="text-sm font-bold text-[#1e2d3a] mt-1">{citaSeleccionada.sesion}</p>
                  <p className="text-xs text-[#1e2d3a]/40">{citaSeleccionada.sala}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${estadoConfig[citaSeleccionada.estado].bg} ${estadoConfig[citaSeleccionada.estado].text} ${estadoConfig[citaSeleccionada.estado].border} text-xs`}
                >
                  {estadoConfig[citaSeleccionada.estado].label}
                </Badge>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => handleStatusChange(citaSeleccionada.id, "completada")}
                  disabled={statusPending || citaSeleccionada.estado === "completada"}
                  className="flex-1 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer transition-all duration-200 text-xs h-9"
                >
                  {statusPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
                  Completar
                </Button>
                <Button variant="outline" className="flex-1 border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer text-xs h-9">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[#4a7fa5]" />
                  Reagendar
                </Button>
                <Button
                  onClick={() => handleStatusChange(citaSeleccionada.id, "cancelada")}
                  disabled={statusPending || citaSeleccionada.estado === "cancelada"}
                  variant="outline"
                  className="border-[#d9534f]/20 text-[#d9534f] hover:bg-[#d9534f]/5 cursor-pointer text-xs h-9 px-2.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ── MODAL: NUEVA CITA ── */}
      <Dialog open={modalNuevaCita} onOpenChange={setModalNuevaCita}>
        <DialogContent className="max-w-md border-[#c8dce8]">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a] font-bold">Agendar Nueva Cita</DialogTitle>
            <DialogDescription className="text-[#1e2d3a]/50 text-xs">
              {diasSemana[diaActivo].label} {diasSemana[diaActivo].fecha} — Completa los datos para agendar
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="space-y-4 pt-1">
            {/* Hidden fields */}
            <input type="hidden" name="fecha" value={fechaCita} />
            <input type="hidden" name="pacienteId" value={pacienteSeleccionado?.id || ""} />

            {/* Paciente selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70">Paciente *</Label>
              {pacienteSeleccionado ? (
                <div className="flex items-center gap-3 bg-[#e4ecf2]/50 rounded-lg p-3">
                  <Avatar className="h-9 w-9 border border-[#a8cfe0]">
                    <AvatarFallback className="bg-[#4a7fa5]/15 text-[#4a7fa5] text-xs font-bold">
                      {pacienteSeleccionado.iniciales}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1e2d3a] truncate">{pacienteSeleccionado.nombre}</p>
                    <p className="text-xs text-[#1e2d3a]/40">{pacienteSeleccionado.telefono}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setPacienteSeleccionado(null); setBusquedaPaciente(""); }}
                    className="text-xs border-[#a8cfe0] cursor-pointer h-7 px-2"
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/40" />
                    <Input
                      placeholder="Buscar por nombre o teléfono..."
                      value={busquedaPaciente}
                      onChange={(e) => setBusquedaPaciente(e.target.value)}
                      className="pl-9 h-9 text-sm border-[#a8cfe0] focus:border-[#4a7fa5]"
                    />
                  </div>
                  {busquedaPaciente.length >= 2 && (
                    <div className="border border-[#c8dce8] rounded-lg max-h-36 overflow-y-auto">
                      {pacientesFiltrados.length === 0 ? (
                        <p className="text-xs text-[#1e2d3a]/40 p-3 text-center">No se encontraron pacientes</p>
                      ) : (
                        pacientesFiltrados.slice(0, 5).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => { setPacienteSeleccionado(p); setBusquedaPaciente(""); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#e4ecf2]/50 transition-colors cursor-pointer text-left"
                          >
                            <Avatar className="h-7 w-7 border border-[#c8dce8]">
                              <AvatarFallback className="bg-[#4a7fa5]/10 text-[#4a7fa5] text-[10px] font-bold">
                                {p.iniciales}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#1e2d3a] truncate">{p.nombre}</p>
                              <p className="text-[10px] text-[#1e2d3a]/40">{p.telefono}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hora + Duración */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]/70">Hora *</Label>
                <Select value={horaInicio} onValueChange={setHoraInicio} name="horaInicio">
                  <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HORAS_DISPONIBLES.map((h) => (
                      <SelectItem key={h} value={h} className="cursor-pointer">{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="horaInicio" value={horaInicio} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]/70">Duración</Label>
                <Select value={duracion} onValueChange={setDuracion} name="duracion">
                  <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30" className="cursor-pointer">30 min</SelectItem>
                    <SelectItem value="45" className="cursor-pointer">45 min</SelectItem>
                    <SelectItem value="60" className="cursor-pointer">60 min</SelectItem>
                    <SelectItem value="90" className="cursor-pointer">90 min</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="duracion" value={duracion} />
              </div>
            </div>

            {/* Tipo de sesión */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70">Tipo de Sesión</Label>
              <Select value={tipoSesion} onValueChange={setTipoSesion}>
                <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SESION.map((t) => (
                    <SelectItem key={t} value={t} className="cursor-pointer">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="tipoSesion" value={tipoSesion} />
            </div>

            {/* Fisioterapeuta + Sala */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]/70">Fisioterapeuta</Label>
                {fisioterapeutas && fisioterapeutas.length > 0 ? (
                  <>
                    <Select value={fisioId} onValueChange={setFisioId}>
                      <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
                        <SelectValue placeholder="Asignar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {fisioterapeutas.map((f) => (
                          <SelectItem key={f.id} value={f.id} className="cursor-pointer">{f.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="fisioterapeutaId" value={fisioId} />
                  </>
                ) : (
                  <p className="text-xs text-[#1e2d3a]/40 pt-2">Asignación automática</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]/70">Sala</Label>
                <Select value={sala} onValueChange={setSala}>
                  <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
                    <SelectValue placeholder="Sala..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sala A" className="cursor-pointer">Sala A</SelectItem>
                    <SelectItem value="Sala B" className="cursor-pointer">Sala B</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="sala" value={sala} />
              </div>
            </div>

            {/* Error message */}
            {formState?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600 font-medium">{formState.error}</p>
              </div>
            )}

            {/* Success message */}
            {formState?.success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs text-emerald-600 font-medium">Cita agendada correctamente</p>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalNuevaCita(false)}
                className="border-[#a8cfe0] cursor-pointer text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !pacienteSeleccionado}
                className="bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer transition-all duration-200 text-xs"
              >
                {isPending ? (
                  <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Agendando...</>
                ) : (
                  <><CalendarDays className="mr-1.5 h-3.5 w-3.5" /> Agendar Cita</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
