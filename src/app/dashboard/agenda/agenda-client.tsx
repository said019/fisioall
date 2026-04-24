"use client";

import { useState, useActionState, useEffect, useTransition, useCallback, useMemo } from "react";
import Link from "next/link";
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
  CalendarDays,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Loader2,
  AlertCircle,
  DollarSign,
  CreditCard,
  Banknote,
  ClipboardList,
} from "lucide-react";
import {
  crearCita,
  actualizarEstadoCita,
  confirmarAnticipo,
  rechazarComprobante,
  getSlotsDisponibles,
  getCitasSemana,
} from "./actions";
import CobrarPanel from "../pagos/cobrar-panel";

// ── TYPES ──────────────────────────────────────────────────────────────────
type Cita = {
  id: string;
  pacienteId?: string;
  paciente: string;
  initials: string;
  motivo: string;
  hora: string;
  duracion: number;
  estado: string;
  dayIndex: number;
  sesion: string;
  sala: string;
  colorFisio: string;
  anticipoComprobanteUrl?: string | null;
  anticipoPagado?: boolean;
};

type PacienteOption = {
  id: string;
  nombre: string;
  iniciales: string;
  telefono: string | null;
};

type FisioOption = {
  id: string;
  nombre: string;
  iniciales: string;
  colorAgenda?: string;
  rol?: string;
  especialidades?: string[];
};

type DBCita = {
  id: string;
  pacienteId: string;
  paciente: string;
  iniciales: string;
  telefono: string | null;
  fisioterapeuta: string;
  colorFisio: string;
  motivo: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estado: string | null;
  sala: string | null;
  numeroSesion: number | null;
  sesion: string | null;
  anticipoComprobanteUrl?: string | null;
  anticipoPagoId?: string | null;
  anticipoPagado?: boolean | null;
};

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const estadoConfig: Record<string, { label: string; bg: string; border: string; text: string }> = {
  agendada:            { label: "Agendada",           bg: "bg-slate-100",     border: "border-slate-300",    text: "text-slate-600" },
  anticipo_ok:         { label: "Anticipo OK",        bg: "bg-[#4a7fa5]/10",  border: "border-[#4a7fa5]/30", text: "text-[#4a7fa5]" },
  confirmada:          { label: "Confirmada",         bg: "bg-[#3fa87c]/10",  border: "border-[#3fa87c]/30", text: "text-[#3fa87c]" },
  en_curso:            { label: "En curso",           bg: "bg-[#4a7fa5]/15",  border: "border-[#4a7fa5]/40", text: "text-[#4a7fa5]" },
  pendiente:           { label: "Pendiente",          bg: "bg-[#F59E0B]/10",  border: "border-[#F59E0B]/30", text: "text-[#F59E0B]" },
  pendiente_anticipo:  { label: "Anticipo pendiente", bg: "bg-[#e89b3f]/10",  border: "border-[#e89b3f]/30", text: "text-[#e89b3f]" },
  cancelada:           { label: "Cancelada",          bg: "bg-[#d9534f]/5",   border: "border-[#d9534f]/20", text: "text-[#d9534f]" },
  completada:          { label: "Completada",         bg: "bg-[#1e2d3a]/5",   border: "border-[#1e2d3a]/15", text: "text-[#1e2d3a]/50" },
  no_show:             { label: "No show",            bg: "bg-[#d9534f]/5",   border: "border-[#d9534f]/20", text: "text-[#d9534f]" },
};

const TIPOS_SESION = [
  // Fisioterapia
  "Fisioterapia", "Fisioterapia Antiestrés", "Descarga Muscular",
  "Drenaje Linfático", "Presoterapia", "Ejercicio Terapéutico",
  "Valoración Fisioterapéutica", "Suelo Pélvico", "Rehabilitación",
  // Masajes
  "Masaje Terapéutico", "Masaje Relajante", "Masaje Descontracturante",
  // Faciales (Gaby)
  "Masaje Revitalizante Facial", "Limpieza Facial Básica", "Limpieza Facial Profunda",
  "Hidratación Profunda", "Rejuvenecimiento Facial", "Hilos de Colágeno",
  // Corporales (Gaby)
  "Tratamiento Corporal",
  // Epilación (Gaby)
  "Epilación Media Pierna Inf", "Epilación Media Pierna Sup", "Epilación Piernas Completas",
  "Epilación Axila", "Epilación Bigote/Barbilla", "Epilación Barba", "Epilación Bikini",
];


// Maps tipoSesion name → required especialidad tag on Usuario.especialidades
const SERVICIO_ESPECIALIDAD: Record<string, string> = {
  // Fisioterapia general (Paola + Jenni)
  "Fisioterapia": "Fisioterapia",
  "Fisioterapia Antiestrés": "Fisioterapia",
  "Descarga Muscular": "Fisioterapia",
  "Drenaje Linfático": "Fisioterapia",
  "Presoterapia": "Fisioterapia",
  "Ejercicio Terapéutico": "Fisioterapia",
  "Valoración Fisioterapéutica": "Fisioterapia",
  "Rehabilitación": "Fisioterapia",
  "Masaje Terapéutico": "Masajes Terapéuticos",
  "Masaje Relajante": "Masajes Terapéuticos",
  "Masaje Descontracturante": "Masajes Terapéuticos",
  // Suelo Pélvico — solo Paola
  "Suelo Pélvico": "Suelo Pélvico",
  "Sesión Suelo Pélvico": "Suelo Pélvico",
  // Faciales — Gaby
  "Masaje Revitalizante Facial": "Tratamientos Faciales",
  "Masaje Facial Revitalizante": "Tratamientos Faciales",
  "Limpieza Facial Básica": "Tratamientos Faciales",
  "Limpieza Facial Profunda": "Tratamientos Faciales",
  "Hidratación Profunda": "Tratamientos Faciales",
  "Rejuvenecimiento Facial": "Tratamientos Faciales",
  "Hilos de Colágeno": "Tratamientos Faciales",
  // Corporales/Epilación — Gaby
  "Tratamiento Corporal": "Tratamientos Corporales",
  "Epilación Media Pierna Inf": "Tratamientos Corporales",
  "Epilación Media Pierna Sup": "Tratamientos Corporales",
  "Epilación Piernas Completas": "Tratamientos Corporales",
  "Epilación Axila": "Tratamientos Corporales",
  "Epilación Bigote/Barbilla": "Tratamientos Corporales",
  "Epilación Barba": "Tratamientos Corporales",
  "Epilación Bikini": "Tratamientos Corporales",
  "Media Pierna Inferior": "Tratamientos Corporales",
  "Media Pierna Superior": "Tratamientos Corporales",
  "Piernas Completas": "Tratamientos Corporales",
  "Axila": "Tratamientos Corporales",
  "Bigote": "Tratamientos Corporales",
  "Bozo": "Tratamientos Corporales",
  "Barbilla": "Tratamientos Corporales",
  "Mentón": "Tratamientos Corporales",
  "Barba Completa": "Tratamientos Corporales",
  "Área de Bikini": "Tratamientos Corporales",
};

function filterFisiosByServicio(fisios: FisioOption[], servicio: string): FisioOption[] {
  if (!servicio) return fisios;
  const required = SERVICIO_ESPECIALIDAD[servicio];
  if (!required) return fisios;
  const filtered = fisios.filter((f) => f.especialidades?.includes(required));
  return filtered.length > 0 ? filtered : fisios; // fallback: show all if no match
}

const HORAS_DISPONIBLES = [
  "09:00","10:00","11:00","12:00","13:00",
  "14:00","15:00","16:00","17:00","18:00","19:00",
];

const DAY_LABELS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MONTH_NAMES_FULL = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ── HELPERS ────────────────────────────────────────────────────────────────
function buildWeekDays(monday: Date) {
  // Tomamos las partes del lunes EN CDMX, luego construimos los siguientes
  // 5 días aritméticamente (sin depender de getDate/getDay locales que
  // varían entre SSR en UTC y cliente en CDMX).
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(monday);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  const baseY = Number(m.year);
  const baseM = Number(m.month);
  const baseD = Number(m.day);

  const days = [];
  for (let i = 0; i < 6; i++) {
    // Date.UTC normaliza overflow de día (ej. 30 + 3 → mes siguiente)
    const utc = new Date(Date.UTC(baseY, baseM - 1, baseD + i, 12, 0, 0));
    const yy = utc.getUTCFullYear();
    const mm = utc.getUTCMonth();
    const dd = utc.getUTCDate();
    const dayOfWeek = (1 + i) % 7; // lunes(1) → sábado(6)
    days.push({
      label: DAY_LABELS[dayOfWeek],
      fecha: `${dd} ${MONTH_NAMES[mm]}`,
      dayIndex: i,
      isoDate: `${yy}-${String(mm + 1).padStart(2, "0")}-${String(dd).padStart(2, "0")}`,
      dateObj: utc,
    });
  }
  return days;
}

// Extrae partes de fecha en CDMX, deterministicamente en SSR y en cliente.
function partsInMx(d: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour) === 24 ? 0 : Number(map.hour),
    minute: Number(map.minute),
  };
}

function mapDBCitas(dbCitas: DBCita[], monday: Date): Cita[] {
  const mp = partsInMx(monday);
  const mondayStartMs = Date.UTC(mp.year, mp.month - 1, mp.day);
  return dbCitas.map((c) => {
    const inicio = new Date(c.fechaHoraInicio);
    const fin    = new Date(c.fechaHoraFin);
    const ip     = partsInMx(inicio);
    const hora   = `${String(ip.hour).padStart(2, "0")}:${String(ip.minute).padStart(2, "0")}`;
    const dur    = Math.round((fin.getTime() - inicio.getTime()) / 60000);
    const citaDayMs = Date.UTC(ip.year, ip.month - 1, ip.day);
    const dayIdx  = Math.round((citaDayMs - mondayStartMs) / 86400000);
    return {
      id: c.id,
      pacienteId: c.pacienteId,
      paciente: c.paciente,
      initials: c.iniciales,
      motivo: c.motivo,
      hora,
      duracion: dur,
      estado: c.estado ?? "agendada",
      dayIndex: dayIdx,
      sesion: c.sesion ?? "—",
      sala: c.sala ?? "—",
      colorFisio: c.colorFisio ?? "#4a7fa5",
      anticipoComprobanteUrl: c.anticipoComprobanteUrl ?? null,
      anticipoPagado: c.anticipoPagado ?? false,
    };
  });
}

function weekLabel(monday: Date) {
  const sat = new Date(monday);
  sat.setDate(monday.getDate() + 5);
  if (monday.getMonth() === sat.getMonth()) {
    return `Semana del ${monday.getDate()} – ${sat.getDate()} ${MONTH_NAMES[sat.getMonth()]} ${sat.getFullYear()}`;
  }
  return `${monday.getDate()} ${MONTH_NAMES[monday.getMonth()]} – ${sat.getDate()} ${MONTH_NAMES[sat.getMonth()]} ${sat.getFullYear()}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthGrid(firstOfMonth: Date) {
  const year = firstOfMonth.getFullYear();
  const month = firstOfMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 0=Sun → adjust so Mon=0
  let startDay = new Date(year, month, 1).getDay() - 1;
  if (startDay < 0) startDay = 6;

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(startDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function getMondayFromISO(iso: string) {
  // Extraer las partes en CDMX para no depender de la zona horaria local
  // del runtime (Railway = UTC, navegador = CDMX). Devolvemos un Date que
  // representa mediodía CDMX (18:00 UTC) del lunes.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(iso));
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  return new Date(Date.UTC(Number(m.year), Number(m.month) - 1, Number(m.day), 18, 0, 0));
}

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function AgendaClient({
  initialCitas,
  pacientes,
  fisioterapeutas,
  weekStartISO,
  todayISO,
  preselectedPacienteId,
}: {
  initialCitas?: DBCita[];
  pacientes?: PacienteOption[];
  fisioterapeutas?: FisioOption[];
  weekStartISO: string;
  todayISO: string;
  preselectedPacienteId?: string | null;
}) {
  const today = useMemo(() => new Date(todayISO), [todayISO]);
  const [monday, setMonday] = useState(() => getMondayFromISO(weekStartISO));
  const diasSemana = useMemo(() => buildWeekDays(monday), [monday]);

  // Determine today's index in the current week (or default 0)
  const todayIndex = diasSemana.findIndex((d) => sameDay(d.dateObj, today));

  const [citasData, setCitasData] = useState<Cita[]>(() =>
    initialCitas ? mapDBCitas(initialCitas, monday) : []
  );
  const [diaActivo, setDiaActivo] = useState(todayIndex >= 0 ? todayIndex : 0);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [modalCobrar, setModalCobrar] = useState(false);
  const [modalNuevaCita, setModalNuevaCita] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [vista, setVista] = useState<"semana" | "mes">("semana");
  const [mesActual, setMesActual] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [citasMes, setCitasMes] = useState<DBCita[]>([]);

  // ── Form state for nueva cita ──
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteOption | null>(null);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [duracion, setDuracion] = useState("60");
  const [tipoSesion, setTipoSesion] = useState("");
  const [fisioId, setFisioId] = useState(fisioterapeutas?.[0]?.id ?? "");
  const [sala, setSala] = useState("");
  const [fechaCita, setFechaCita] = useState(diasSemana[diaActivo]?.isoDate ?? "");

  // Dynamic slot state
  const [slotsDisponibles, setSlotsDisponibles] = useState<{ hora: string; cubiculo: number }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Server action state
  const [formState, formAction, isPending] = useActionState(crearCita, null);
  const [statusPending, startStatusTransition] = useTransition();

  // ── Week navigation ──
  const navigateWeek = useCallback(async (offset: number) => {
    const newMonday = new Date(monday);
    newMonday.setDate(monday.getDate() + offset * 7);
    const sat = new Date(newMonday);
    sat.setDate(newMonday.getDate() + 5);
    sat.setHours(23, 59, 59, 999);

    setLoadingWeek(true);
    try {
      const dbCitas = await getCitasSemana(newMonday.toISOString(), sat.toISOString());
      setMonday(newMonday);
      setCitasData(mapDBCitas(dbCitas ?? [], newMonday));
      const newDays = buildWeekDays(newMonday);
      const ti = newDays.findIndex((d) => sameDay(d.dateObj, today));
      setDiaActivo(ti >= 0 ? ti : 0);
    } catch {
      setMonday(newMonday);
      setCitasData([]);
      setDiaActivo(0);
    } finally {
      setLoadingWeek(false);
    }
  }, [monday, today]);

  const goToThisWeek = useCallback(async () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const thisMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
    if (sameDay(thisMon, monday)) return;

    const sat = new Date(thisMon);
    sat.setDate(thisMon.getDate() + 5);
    sat.setHours(23, 59, 59, 999);

    setLoadingWeek(true);
    try {
      const dbCitas = await getCitasSemana(thisMon.toISOString(), sat.toISOString());
      setMonday(thisMon);
      setCitasData(mapDBCitas(dbCitas ?? [], thisMon));
      const newDays = buildWeekDays(thisMon);
      const ti = newDays.findIndex((d) => sameDay(d.dateObj, today));
      setDiaActivo(ti >= 0 ? ti : 0);
    } catch {
      setMonday(thisMon);
      setCitasData([]);
    } finally {
      setLoadingWeek(false);
    }
  }, [monday, today]);

  // Ensure therapist is auto-selected when fisioterapeutas load
  useEffect(() => {
    if (fisioterapeutas && fisioterapeutas.length > 0 && !fisioId) {
      setFisioId(fisioterapeutas[0].id);
    }
  }, [fisioterapeutas, fisioId]);

  // Auto-open modal with preselected patient
  useEffect(() => {
    if (preselectedPacienteId && pacientes) {
      const found = pacientes.find((p) => p.id === preselectedPacienteId);
      if (found) {
        setPacienteSeleccionado(found);
        setFechaCita(diasSemana[diaActivo]?.isoDate ?? "");
        setModalNuevaCita(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch month citas when switching to month view or changing month
  useEffect(() => {
    if (vista !== "mes") return;
    const start = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const end = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0, 23, 59, 59, 999);
    getCitasSemana(start.toISOString(), end.toISOString()).then((db) => {
      setCitasMes(db ?? []);
    });
  }, [vista, mesActual]);

  // When day changes, update the form date
  useEffect(() => {
    if (diasSemana[diaActivo]) {
      setFechaCita(diasSemana[diaActivo].isoDate);
    }
  }, [diaActivo, diasSemana]);

  // When form succeeds, close modal and reset
  useEffect(() => {
    if (formState?.success) {
      setModalNuevaCita(false);
      resetForm();
      // Refresh citas for current week
      const sat = new Date(monday);
      sat.setDate(monday.getDate() + 5);
      sat.setHours(23, 59, 59, 999);
      getCitasSemana(monday.toISOString(), sat.toISOString()).then((db) => {
        if (db) setCitasData(mapDBCitas(db, monday));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  // Fetch dynamic slots when dependencies change
  useEffect(() => {
    if (!fechaCita || !fisioId) return;
    setLoadingSlots(true);
    getSlotsDisponibles({
      fecha: fechaCita,
      fisioterapeutaId: fisioId,
      tipoSesion: tipoSesion || "fisioterapia",
      duracionMin: Number(duracion),
    }).then((s) => {
      setSlotsDisponibles(s);
      setLoadingSlots(false);
    });
  }, [fechaCita, fisioId, tipoSesion, duracion]);

  function resetForm() {
    setBusquedaPaciente("");
    setPacienteSeleccionado(null);
    setHoraInicio("09:00");
    setDuracion("60");
    setTipoSesion("");
    setFisioId(fisioterapeutas?.[0]?.id ?? "");
    setSala("");
  }

  function openNuevaCita() {
    resetForm();
    setFechaCita(diasSemana[diaActivo]?.isoDate ?? "");
    setModalNuevaCita(true);
  }

  const pacientesFiltrados = (pacientes ?? []).filter((p) =>
    p.nombre.toLowerCase().includes(busquedaPaciente.toLowerCase()) ||
    (p.telefono ?? "").includes(busquedaPaciente)
  );

  const citasDia = citasData
    .filter((c) => c.dayIndex === diaActivo)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const totalSemana = citasData.filter(c => c.estado !== "cancelada").length;
  // "Confirmadas" = paciente confirmó por WhatsApp (estado: confirmada).
  // Las que tienen anticipo pagado pero aún no confirma paciente quedan como "agendada" + anticipoPagado.
  const confirmadas = citasData.filter(c => c.estado === "confirmada").length;
  const completadas = citasData.filter(c => c.estado === "completada").length;
  const canceladas = citasData.filter(c => c.estado === "cancelada").length;

  function handleReagendar(cita: Cita) {
    // Find the patient object to pre-fill
    const pac = (pacientes ?? []).find((p) => p.id === cita.pacienteId);
    // Cancel old cita
    startStatusTransition(async () => {
      await actualizarEstadoCita(cita.id, "cancelada");
      setCitaSeleccionada(null);
      // Refresh week data
      const sat = new Date(monday);
      sat.setDate(monday.getDate() + 5);
      sat.setHours(23, 59, 59, 999);
      const db = await getCitasSemana(monday.toISOString(), sat.toISOString());
      if (db) setCitasData(mapDBCitas(db, monday));
      // Pre-fill patient and open new cita modal
      resetForm();
      if (pac) setPacienteSeleccionado(pac);
      setFechaCita(diasSemana[diaActivo]?.isoDate ?? "");
      setModalNuevaCita(true);
    });
  }

  function handleStatusChange(
    citaId: string,
    estado: "agendada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_show"
  ) {
    startStatusTransition(async () => {
      await actualizarEstadoCita(citaId, estado);
      setCitaSeleccionada(null);
      // Refresh
      const sat = new Date(monday);
      sat.setDate(monday.getDate() + 5);
      sat.setHours(23, 59, 59, 999);
      const db = await getCitasSemana(monday.toISOString(), sat.toISOString());
      if (db) setCitasData(mapDBCitas(db, monday));
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1e2d3a]">
            {vista === "semana"
              ? weekLabel(monday)
              : `${MONTH_NAMES_FULL[mesActual.getMonth()]} ${mesActual.getFullYear()}`}
          </h2>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-[#1e2d3a]/50">{totalSemana} citas esta semana</p>
            {fisioterapeutas && fisioterapeutas.length > 0 && (
              <div className="flex items-center gap-3">
                {fisioterapeutas.map((f) => (
                  <div key={f.id} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: f.colorAgenda ?? "#4a7fa5" }}
                    />
                    <span className="text-xs text-[#1e2d3a]/50">
                      {f.nombre.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-[#e4ecf2] rounded-lg border border-[#c8dce8] p-0.5">
            <button
              onClick={() => setVista("semana")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                vista === "semana" ? "bg-[#4a7fa5] text-white shadow-sm" : "text-[#1e2d3a]/60 hover:text-[#1e2d3a]"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setVista("mes")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                vista === "mes" ? "bg-[#4a7fa5] text-white shadow-sm" : "text-[#1e2d3a]/60 hover:text-[#1e2d3a]"
              }`}
            >
              Mes
            </button>
          </div>

          {/* Navigation */}
          {vista === "semana" ? (
            <>
              <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)} disabled={loadingWeek} className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer h-9 w-9">
                <ChevronLeft className="h-4 w-4 text-[#1e2d3a]" />
              </Button>
              <Button variant="outline" onClick={goToThisWeek} disabled={loadingWeek} className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer text-xs text-[#1e2d3a] h-9">
                {loadingWeek ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-[#4a7fa5]" />}
                Esta semana
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeek(1)} disabled={loadingWeek} className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer h-9 w-9">
                <ChevronRight className="h-4 w-4 text-[#1e2d3a]" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="icon" onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))} className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer h-9 w-9">
                <ChevronLeft className="h-4 w-4 text-[#1e2d3a]" />
              </Button>
              <Button variant="outline" onClick={() => setMesActual(new Date(today.getFullYear(), today.getMonth(), 1))} className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer text-xs text-[#1e2d3a] h-9">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-[#4a7fa5]" />
                Este mes
              </Button>
              <Button variant="outline" size="icon" onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))} className="border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer h-9 w-9">
                <ChevronRight className="h-4 w-4 text-[#1e2d3a]" />
              </Button>
            </>
          )}

          <Button onClick={openNuevaCita} className="bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer transition-all text-sm h-9">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {vista === "semana" ? (
      <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total Semana", value: totalSemana, color: "text-[#1e2d3a]", bg: "bg-[#1e2d3a]/5" },
          { label: "Confirmadas", value: confirmadas, color: "text-[#3fa87c]", bg: "bg-[#3fa87c]/10" },
          { label: "Completadas", value: completadas, color: "text-[#4a7fa5]", bg: "bg-[#4a7fa5]/10" },
          { label: "Canceladas", value: canceladas, color: "text-[#d9534f]", bg: "bg-[#d9534f]/10" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-lg px-3 py-2 flex items-center justify-between`}>
            <span className="text-[11px] font-medium text-[#1e2d3a]/60">{s.label}</span>
            <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Week view */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Day selector */}
        <Card className="border-[#c8dce8] bg-white lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#1e2d3a]">Días de la Semana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0">
            {diasSemana.map((dia) => {
              const citasDiaCount = citasData.filter(c => c.dayIndex === dia.dayIndex && c.estado !== "cancelada").length;
              const isHoy = sameDay(dia.dateObj, today);
              const isActivo = dia.dayIndex === diaActivo;
              return (
                <button
                  key={dia.dayIndex}
                  onClick={() => setDiaActivo(dia.dayIndex)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    isActivo
                      ? "bg-[#4a7fa5] text-white"
                      : "hover:bg-[#e4ecf2] text-[#1e2d3a]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <p className={`text-sm font-bold leading-none ${isActivo ? "text-white" : "text-[#1e2d3a]"}`}>
                        {dia.label}
                        {isHoy && (
                          <span className={`ml-1.5 text-[9px] font-bold uppercase tracking-wide ${isActivo ? "text-white/70" : "text-[#4a7fa5]"}`}>
                            HOY
                          </span>
                        )}
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

        {/* Day appointments */}
        <Card className="border-[#c8dce8] bg-white lg:col-span-5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#1e2d3a]">
                {diasSemana[diaActivo]?.label} {diasSemana[diaActivo]?.fecha}
                {todayIndex === diaActivo && todayIndex >= 0 && (
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="h-8 w-8 text-[#1e2d3a]/15 mb-2" />
                <p className="text-sm font-medium text-[#1e2d3a]/40">Sin citas este día</p>
                <Button
                  onClick={openNuevaCita}
                  className="mt-3 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer text-xs h-8"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Agendar Cita
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#e4ecf2]">
                {citasDia.map((cita) => {
                  const estadoEfectivo = (cita.estado === "agendada" && cita.anticipoPagado) ? "anticipo_ok" : cita.estado;
                  const conf = estadoConfig[estadoEfectivo] ?? estadoConfig.agendada;
                  return (
                    <div
                      key={cita.id}
                      onClick={() => setCitaSeleccionada(cita)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#e4ecf2]/50 transition-all ${
                        cita.estado === "cancelada" ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center w-10 shrink-0">
                        <span className="text-xs font-bold text-[#1e2d3a]">{cita.hora}</span>
                        <span className="text-[10px] text-[#1e2d3a]/30">{cita.duracion}min</span>
                      </div>
                      <div
                        className="w-1 h-9 rounded-full shrink-0"
                        style={{ backgroundColor: cita.colorFisio, opacity: 0.8 }}
                      />
                      <Avatar className="h-8 w-8 border border-[#c8dce8] shrink-0">
                        <AvatarFallback
                          style={{ backgroundColor: `${cita.colorFisio}25`, color: cita.colorFisio }}
                          className="text-[10px] font-bold"
                        >
                          {cita.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1e2d3a] truncate">{cita.paciente}</p>
                        <p className="text-[11px] text-[#1e2d3a]/50 truncate">{cita.motivo} · {cita.sala}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
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
      </>
      ) : (
      /* ── MONTH VIEW ── */
      <Card className="border-[#c8dce8] bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-px">
            {/* Header */}
            {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
              <div key={d} className="text-center py-2">
                <span className="text-[11px] font-bold text-[#1e2d3a]/50 uppercase">{d}</span>
              </div>
            ))}
            {/* Days */}
            {buildMonthGrid(mesActual).flat().map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="p-1 min-h-[70px]" />;
              const dateObj = new Date(mesActual.getFullYear(), mesActual.getMonth(), day);
              const isToday = sameDay(dateObj, today);
              const citasDelDia = citasMes.filter((c) => {
                const citaDate = new Date(c.fechaHoraInicio);
                return sameDay(citaDate, dateObj) && c.estado !== "cancelada";
              });
              return (
                <button
                  key={day}
                  onClick={() => {
                    // Navigate to that week and select the day
                    const dayOfWeek = dateObj.getDay();
                    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                    const targetMonday = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + diffToMon);
                    const targetSat = new Date(targetMonday);
                    targetSat.setDate(targetMonday.getDate() + 5);
                    targetSat.setHours(23, 59, 59, 999);
                    setLoadingWeek(true);
                    getCitasSemana(targetMonday.toISOString(), targetSat.toISOString()).then((db) => {
                      setMonday(targetMonday);
                      setCitasData(mapDBCitas(db ?? [], targetMonday));
                      const newDays = buildWeekDays(targetMonday);
                      const ti = newDays.findIndex((d) => sameDay(d.dateObj, dateObj));
                      setDiaActivo(ti >= 0 ? ti : 0);
                      setVista("semana");
                      setLoadingWeek(false);
                    });
                  }}
                  className={`p-1.5 min-h-[70px] rounded-lg text-left transition-all cursor-pointer hover:bg-[#e4ecf2]/50 ${
                    isToday ? "bg-[#4a7fa5]/10 ring-2 ring-[#4a7fa5]/30" : "bg-white"
                  }`}
                >
                  <span className={`text-xs font-bold block ${isToday ? "text-[#4a7fa5]" : "text-[#1e2d3a]"}`}>
                    {day}
                  </span>
                  {citasDelDia.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {citasDelDia.slice(0, 3).map((c) => (
                        <div
                          key={c.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: c.colorFisio }}
                        />
                      ))}
                      {citasDelDia.length > 3 && (
                        <span className="text-[8px] text-[#1e2d3a]/40 leading-none">+{citasDelDia.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      )}

      {/* ── MODAL: DETALLE CITA ── */}
      <Dialog open={!!citaSeleccionada} onOpenChange={() => { setCitaSeleccionada(null); setModalCobrar(false); }}>
        {citaSeleccionada && (() => {
          const diaInfo = diasSemana[citaSeleccionada.dayIndex];
          const estadoEfectivo = (citaSeleccionada.estado === "agendada" && citaSeleccionada.anticipoPagado) ? "anticipo_ok" : citaSeleccionada.estado;
          const conf = estadoConfig[estadoEfectivo] ?? estadoConfig.agendada;
          return (
            <DialogContent className="max-w-sm border-[#c8dce8]">
              <DialogHeader>
                <DialogTitle className="text-[#1e2d3a] font-bold">Detalle de Cita</DialogTitle>
                <DialogDescription className="text-[#1e2d3a]/50 text-xs">
                  {diaInfo?.label} {diaInfo?.fecha} · {citaSeleccionada.hora}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-1">
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#e4ecf2]/50 rounded-lg p-2.5">
                    <p className="text-[10px] text-[#1e2d3a]/50 uppercase tracking-wide">Horario</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-[#4a7fa5]" />
                      <span className="text-sm font-bold text-[#1e2d3a]">{citaSeleccionada.hora}</span>
                    </div>
                    <p className="text-xs text-[#1e2d3a]/40">{citaSeleccionada.duracion} min</p>
                  </div>
                  <div className="bg-[#e4ecf2]/50 rounded-lg p-2.5">
                    <p className="text-[10px] text-[#1e2d3a]/50 uppercase tracking-wide">Sesión</p>
                    <p className="text-sm font-bold text-[#1e2d3a] mt-0.5">{citaSeleccionada.sesion}</p>
                    <p className="text-xs text-[#1e2d3a]/40">{citaSeleccionada.sala}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`${conf.bg} ${conf.text} ${conf.border} text-xs`}>
                  {conf.label}
                </Badge>

                <Link href={`/dashboard/expediente?citaId=${citaSeleccionada.id}`}>
                  <Button
                    variant="outline"
                    className="w-full border-[#4a7fa5]/30 text-[#4a7fa5] hover:bg-[#4a7fa5]/5 cursor-pointer text-xs h-9 gap-1.5"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Nota SOAP / Expediente
                  </Button>
                </Link>

                {citaSeleccionada.estado === "pendiente_anticipo" && (
                  <div className="bg-[#e89b3f]/10 border border-[#e89b3f]/30 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-[#854f0b] font-medium flex items-start gap-2">
                      <DollarSign className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {citaSeleccionada.anticipoComprobanteUrl
                        ? "Comprobante recibido — pendiente de validación"
                        : "Anticipo de $200 MXN pendiente"}
                    </p>

                    {citaSeleccionada.anticipoComprobanteUrl ? (
                      <div className="space-y-2">
                        <a
                          href={citaSeleccionada.anticipoComprobanteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-[#4a7fa5] underline hover:text-[#4a7fa5]/80 break-all"
                        >
                          Ver comprobante ↗
                        </a>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              startStatusTransition(async () => {
                                await confirmarAnticipo(citaSeleccionada.id, "transferencia");
                                setCitaSeleccionada(null);
                                const sat = new Date(monday);
                                sat.setDate(monday.getDate() + 5);
                                sat.setHours(23, 59, 59, 999);
                                const db = await getCitasSemana(monday.toISOString(), sat.toISOString());
                                if (db) setCitasData(mapDBCitas(db, monday));
                              });
                            }}
                            disabled={statusPending}
                            className="flex-1 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer text-xs h-8"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Validar
                          </Button>
                          <Button
                            onClick={() => {
                              const motivo = window.prompt("Motivo del rechazo (opcional):") ?? undefined;
                              startStatusTransition(async () => {
                                await rechazarComprobante(citaSeleccionada.id, motivo || undefined);
                                setCitaSeleccionada(null);
                                const sat = new Date(monday);
                                sat.setDate(monday.getDate() + 5);
                                sat.setHours(23, 59, 59, 999);
                                const db = await getCitasSemana(monday.toISOString(), sat.toISOString());
                                if (db) setCitasData(mapDBCitas(db, monday));
                              });
                            }}
                            disabled={statusPending}
                            variant="outline"
                            className="flex-1 border-[#d9534f]/30 text-[#d9534f] hover:bg-[#d9534f]/5 cursor-pointer text-xs h-8"
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            startStatusTransition(async () => {
                              await confirmarAnticipo(citaSeleccionada.id, "transferencia");
                              setCitaSeleccionada(null);
                              const sat = new Date(monday);
                              sat.setDate(monday.getDate() + 5);
                              sat.setHours(23, 59, 59, 999);
                              const db = await getCitasSemana(monday.toISOString(), sat.toISOString());
                              if (db) setCitasData(mapDBCitas(db, monday));
                            });
                          }}
                          disabled={statusPending}
                          className="flex-1 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer text-xs h-8"
                        >
                          <CreditCard className="mr-1 h-3 w-3" />
                          Transferencia
                        </Button>
                        <Button
                          onClick={() => {
                            startStatusTransition(async () => {
                              await confirmarAnticipo(citaSeleccionada.id, "efectivo");
                              setCitaSeleccionada(null);
                              const sat = new Date(monday);
                              sat.setDate(monday.getDate() + 5);
                              sat.setHours(23, 59, 59, 999);
                              const db = await getCitasSemana(monday.toISOString(), sat.toISOString());
                              if (db) setCitasData(mapDBCitas(db, monday));
                            });
                          }}
                          disabled={statusPending}
                          className="flex-1 bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white cursor-pointer text-xs h-8"
                        >
                          <Banknote className="mr-1 h-3 w-3" />
                          Efectivo
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cobrar sesión — solo para confirmada/en_curso */}
                {(citaSeleccionada.estado === "confirmada" || citaSeleccionada.estado === "en_curso") && !modalCobrar && (
                  <Button
                    onClick={() => setModalCobrar(true)}
                    className="w-full bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer text-xs h-9 gap-1.5"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    Cobrar Sesión
                  </Button>
                )}

                {modalCobrar && citaSeleccionada.pacienteId && (
                  <CobrarPanel
                    citaId={citaSeleccionada.id}
                    pacienteId={citaSeleccionada.pacienteId}
                    precioSesion={450}
                    pacienteNombre={citaSeleccionada.paciente}
                    tipoSesion={citaSeleccionada.motivo}
                    onSuccess={async () => {
                      setModalCobrar(false);
                      setCitaSeleccionada(null);
                      const sat = new Date(monday);
                      sat.setDate(monday.getDate() + 5);
                      sat.setHours(23, 59, 59, 999);
                      const db = await getCitasSemana(monday.toISOString(), sat.toISOString());
                      if (db) setCitasData(mapDBCitas(db, monday));
                    }}
                  />
                )}

                {!modalCobrar && (
                  <>
                    {/* Cambiar estado manualmente */}
                    <div className="pt-2 border-t border-[#c8dce8]">
                      <Label className="text-[10px] font-semibold text-[#1e2d3a]/60 uppercase tracking-wider">
                        Cambiar estado manualmente
                      </Label>
                      <Select
                        value={citaSeleccionada.estado}
                        onValueChange={(v) =>
                          handleStatusChange(
                            citaSeleccionada.id,
                            v as "agendada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_show",
                          )
                        }
                        disabled={statusPending}
                      >
                        <SelectTrigger className="h-9 border-[#c8dce8] text-xs cursor-pointer mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agendada" className="cursor-pointer text-xs">Agendada</SelectItem>
                          <SelectItem value="confirmada" className="cursor-pointer text-xs">Confirmada</SelectItem>
                          <SelectItem value="en_curso" className="cursor-pointer text-xs">En curso</SelectItem>
                          <SelectItem value="completada" className="cursor-pointer text-xs">Completada</SelectItem>
                          <SelectItem value="no_show" className="cursor-pointer text-xs">No asistió</SelectItem>
                          <SelectItem value="cancelada" className="cursor-pointer text-xs">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Añadir a calendario (.ics) */}
                    <a
                      href={`/api/calendar/cita/${citaSeleccionada.id}/ics`}
                      download={`cita-${citaSeleccionada.id.slice(0, 8)}.ics`}
                      className="block"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-[#a8cfe0] text-[#4a7fa5] hover:bg-[#e4ecf2] cursor-pointer text-xs h-9"
                      >
                        <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                        Añadir a Apple/Google Calendar (.ics)
                      </Button>
                    </a>

                    <div className="flex gap-2 pt-1">
                      <Button
                        onClick={() => handleStatusChange(citaSeleccionada.id, "completada")}
                        disabled={statusPending || citaSeleccionada.estado === "completada"}
                        className="flex-1 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer text-xs h-9"
                      >
                        {statusPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
                        Completar
                      </Button>
                      <Button
                        onClick={() => handleReagendar(citaSeleccionada)}
                        disabled={statusPending}
                        variant="outline"
                        className="flex-1 border-[#a8cfe0] hover:bg-[#e4ecf2] cursor-pointer text-xs h-9"
                      >
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
                  </>
                )}
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>

      {/* ── MODAL: NUEVA CITA ── */}
      <Dialog open={modalNuevaCita} onOpenChange={setModalNuevaCita}>
        <DialogContent className="max-w-md border-[#c8dce8]">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a] font-bold text-base">Agendar Nueva Cita</DialogTitle>
            <DialogDescription className="text-[#1e2d3a]/40 text-[11px]">
              Completa los datos para agendar
            </DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-3 pt-1">
            <input type="hidden" name="fecha" value={fechaCita} />
            <input type="hidden" name="pacienteId" value={pacienteSeleccionado?.id ?? ""} />

            {/* Fecha selector */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70">Fecha *</Label>
              <Input
                type="date"
                value={fechaCita}
                onChange={(e) => setFechaCita(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="h-9 text-sm border-[#a8cfe0] focus:border-[#4a7fa5] cursor-pointer"
              />
            </div>

            {/* Paciente selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70">Paciente *</Label>
              {pacienteSeleccionado ? (
                <div className="flex items-center gap-3 bg-[#e4ecf2]/50 rounded-lg p-2.5">
                  <Avatar className="h-8 w-8 border border-[#a8cfe0]">
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
                <div className="space-y-1">
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
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
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

              {/* Dynamic slot grid */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e2d3a]/70">Horario disponible *</Label>
                {!fisioId ? (
                  <p className="text-xs text-center text-[#1e2d3a]/40 py-2">Selecciona un terapeuta primero</p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {loadingSlots ? (
                      <p className="col-span-4 text-xs text-center text-[#1e2d3a]/40 py-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin inline mr-1" />
                        Cargando horarios...
                      </p>
                    ) : slotsDisponibles.length === 0 ? (
                      <div className="col-span-4 text-center py-2">
                        <p className="text-xs text-[#1e2d3a]/40">Sin disponibilidad este día</p>
                        <p className="text-[10px] text-[#1e2d3a]/30 mt-0.5">Seleccionar manualmente:</p>
                        <Select value={horaInicio} onValueChange={setHoraInicio}>
                          <SelectTrigger className="h-8 text-xs border-[#a8cfe0] cursor-pointer mt-1 max-w-[140px] mx-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HORAS_DISPONIBLES.map((h) => (
                              <SelectItem key={h} value={h} className="cursor-pointer">{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      slotsDisponibles.map((s) => (
                        <button
                          key={s.hora}
                          type="button"
                          onClick={() => { setHoraInicio(s.hora); setSala(`Cubículo ${s.cubiculo}`); }}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                            horaInicio === s.hora
                              ? "bg-[#4a7fa5] text-white border-[#4a7fa5]"
                              : "bg-white border-[#c8dce8] text-[#1e2d3a] hover:border-[#4a7fa5]"
                          }`}
                        >
                          {s.hora}
                          <span className={`block text-[9px] mt-0.5 ${horaInicio === s.hora ? "text-white/70" : "text-[#1e2d3a]/40"}`}>
                            Cub. {s.cubiculo}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                <input type="hidden" name="horaInicio" value={horaInicio} />
              </div>
            </div>

            {/* Tipo de sesión */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70">Tipo de Sesión</Label>
              <Select value={tipoSesion} onValueChange={(v) => {
                setTipoSesion(v);
                // Auto-select appropriate therapist for this service
                if (fisioterapeutas) {
                  const filtered = filterFisiosByServicio(fisioterapeutas, v);
                  if (filtered.length > 0 && !filtered.some((f) => f.id === fisioId)) {
                    setFisioId(filtered[0].id);
                  }
                }
              }}>
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
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e2d3a]/70">Terapeuta</Label>
                {fisioterapeutas && fisioterapeutas.length > 0 ? (
                  <>
                    <Select value={fisioId} onValueChange={setFisioId}>
                      <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
                        <SelectValue placeholder="Asignar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filterFisiosByServicio(fisioterapeutas, tipoSesion).map((f) => (
                          <SelectItem key={f.id} value={f.id} className="cursor-pointer">{f.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="fisioterapeutaId" value={fisioId} />
                  </>
                ) : (
                  <p className="text-xs text-[#1e2d3a]/40 pt-1">Asignación automática</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1e2d3a]/70">Cubículo</Label>
                {sala ? (
                  <p className="text-sm text-[#1e2d3a] font-medium pt-1">{sala}</p>
                ) : (
                  <p className="text-xs text-[#1e2d3a]/40 pt-1">Auto al elegir horario</p>
                )}
                <input type="hidden" name="sala" value={sala} />
              </div>
            </div>

            {/* Anticipo warning */}
            <div className="bg-[#e89b3f]/10 border border-[#e89b3f]/30 rounded-lg p-2.5">
              <p className="text-xs text-[#854f0b] font-medium flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Anticipo obligatorio de <strong>$200 MXN</strong> como garantía de reserva. Este monto queda como saldo a favor del paciente para aplicar en futuros cobros. Sin pago en 24h la cita se cancela.
              </p>
            </div>

            {formState?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                <p className="text-xs text-red-600 font-medium">{formState.error}</p>
              </div>
            )}

            {formState?.success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                <p className="text-xs text-emerald-600 font-medium">Cita agendada correctamente</p>
              </div>
            )}

            <DialogFooter className="gap-2 pt-1">
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
                className="bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer text-xs"
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
