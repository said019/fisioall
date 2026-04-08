"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Save,
  Camera,
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowLeft,
  ScanLine,
  Loader2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { crearNotaSesion } from "./actions";
import { getTipoExpediente, TIPO_BADGE } from "@/types/expedientes";
import type { TipoExpediente } from "@/types/expedientes";

const BodyMapModal = dynamic(() => import("@/components/BodyMapModal"), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-40 rounded-lg bg-[#e4ecf2] animate-pulse" />
  ),
});

const ExpedienteSueloPelvico = dynamic(() => import("./forms/ExpedienteSueloPelvico"), { ssr: false });
const ExpedienteCosme = dynamic(() => import("./forms/ExpedienteCosme"), { ssr: false });

// ─────────────────────────────────────────────────────────────────────────────
// TÉCNICAS
// ─────────────────────────────────────────────────────────────────────────────
const TECNICAS_DISPONIBLES = [
  "Masaje terapéutico",
  "Ultrasonido",
  "TENS",
  "Electroterapia",
  "Crioterapia",
  "Termoterapia",
  "Movilización articular",
  "Ejercicio terapéutico",
  "Vendaje neuromuscular",
  "Acupuntura",
];

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
interface ExpedienteData {
  paciente: {
    id: string;
    nombre: string;
    iniciales: string;
  };
  sesion: {
    citaId: string | null;
    tipoSesion: string;
    estado: string;
    numeroSesion: number;
    sesionesTotal: number | null;
    fechaHoraInicio?: string | null;
  };
  notaExistente?: {
    id: string;
    subjetivo: string | null;
    objetivo: string | null;
    analisis: string | null;
    plan: string | null;
    dolorInicio: string | null;
    dolorFin: string | null;
    tecnicasUtilizadas: string[];
    evolucion: string | null;
    porcentajeObjetivo: number | null;
    notasAdicionales: string | null;
  } | null;
  historialCitas?: Array<{
    id: string;
    tipoSesion: string;
    estado: string;
    numeroSesion: number | null;
    fechaHoraInicio: string;
    sala: string | null;
    tieneNota: boolean;
    esActual: boolean;
  }>;
  notasSesion: Array<{
    id: string;
    fecha: string;
    subjetivo: string | null;
    objetivo: string | null;
    analisis: string | null;
    plan: string | null;
    dolorInicio: string | null;
    dolorFin: string | null;
    tecnicasUtilizadas: string[];
    evolucion: string | null;
    porcentajeObjetivo: number | null;
    fisioterapeuta: string;
  }>;
  progresosDolor: Array<{
    fecha: string;
    dolorInicio: number | null;
    dolorFin: number | null;
    evolucion: string | null;
    numeroSesion: number | null;
  }>;
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  agendada: { label: "Agendada", color: "bg-blue-50 text-blue-700 border-blue-200" },
  confirmada: { label: "Confirmada", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  en_sala: { label: "En sala", color: "bg-amber-50 text-amber-700 border-amber-200" },
  en_tratamiento: { label: "En tratamiento", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completada: { label: "Completada", color: "bg-green-50 text-green-700 border-green-200" },
  cancelada: { label: "Cancelada", color: "bg-red-50 text-red-700 border-red-200" },
  no_show: { label: "No asistió", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIAL DE SESIONES — Sub-component
// ─────────────────────────────────────────────────────────────────────────────
function HistorialSesiones({
  historial,
  citaActualId,
}: {
  historial: NonNullable<ExpedienteData["historialCitas"]>;
  citaActualId: string | null;
}) {
  const [abierto, setAbierto] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  // Get unique session types for filter tabs
  const tiposUnicos = Array.from(new Set(historial.map((h) => h.tipoSesion)));
  const tieneMuchosTipos = tiposUnicos.length > 1;

  const filtrado = filtroTipo === "todos"
    ? historial
    : historial.filter((h) => h.tipoSesion === filtroTipo);

  const visibles = abierto ? filtrado : filtrado.slice(0, 4);

  return (
    <Card className="border-[#c8dce8] bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[#4a7fa5]" />
            Historial de Sesiones ({filtrado.length}{filtroTipo !== "todos" ? ` de ${historial.length}` : ""})
          </CardTitle>
          {filtrado.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAbierto(!abierto)}
              className="text-xs text-[#4a7fa5] h-7 cursor-pointer"
            >
              {abierto ? (
                <><ChevronUp className="h-3 w-3 mr-1" /> Ver menos</>
              ) : (
                <><ChevronDown className="h-3 w-3 mr-1" /> Ver todas</>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {/* Filter by tipo de sesión (only show if patient has more than 1 type) */}
        {tieneMuchosTipos && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => { setFiltroTipo("todos"); setAbierto(false); }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium border cursor-pointer transition-all ${
                filtroTipo === "todos"
                  ? "bg-[#4a7fa5] text-white border-[#4a7fa5]"
                  : "bg-white border-[#c8dce8] text-[#1e2d3a]/60 hover:border-[#4a7fa5]"
              }`}
            >
              Todas ({historial.length})
            </button>
            {tiposUnicos.map((tipo) => {
              const count = historial.filter((h) => h.tipoSesion === tipo).length;
              return (
                <button
                  key={tipo}
                  onClick={() => { setFiltroTipo(tipo); setAbierto(false); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium border cursor-pointer transition-all ${
                    filtroTipo === tipo
                      ? "bg-[#4a7fa5] text-white border-[#4a7fa5]"
                      : "bg-white border-[#c8dce8] text-[#1e2d3a]/60 hover:border-[#4a7fa5]"
                  }`}
                >
                  {tipo} ({count})
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-1.5">
          {visibles.map((h) => {
            const esActual = h.id === citaActualId;
            const fechaFmt = format(new Date(h.fechaHoraInicio), "d MMM yyyy · HH:mm", { locale: es });
            return (
              <Link
                key={h.id}
                href={`/dashboard/expediente?citaId=${h.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  esActual
                    ? "bg-[#4a7fa5]/10 border border-[#4a7fa5]/30"
                    : "hover:bg-[#e4ecf2]/50"
                }`}
              >
                <div className={`w-1.5 h-8 rounded-full shrink-0 ${
                  h.tieneNota ? "bg-[#3fa87c]" : esActual ? "bg-[#4a7fa5]" : "bg-[#c8dce8]"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1e2d3a] truncate">
                      {h.tipoSesion}
                    </span>
                    {h.numeroSesion && (
                      <span className="text-[10px] text-[#1e2d3a]/40">
                        #{h.numeroSesion}
                      </span>
                    )}
                    {esActual && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-[#4a7fa5]/10 text-[#4a7fa5] border-[#4a7fa5]/30">
                        Actual
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-[#1e2d3a]/40">{fechaFmt}{h.sala ? ` · ${h.sala}` : ""}</p>
                </div>
                <div className="shrink-0">
                  {h.tieneNota ? (
                    <ClipboardCheck className="h-3.5 w-3.5 text-[#3fa87c]" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-[#c8dce8]" />
                  )}
                </div>
              </Link>
            );
          })}
          {filtrado.length === 0 && (
            <p className="text-[11px] text-[#1e2d3a]/30 text-center py-3">
              No hay sesiones de este tipo
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ExpedienteClient({
  initialData,
  citaIdParam,
}: {
  initialData: ExpedienteData;
  citaIdParam?: string;
}) {
  const router = useRouter();
  const { paciente, sesion } = initialData;
  const nota = initialData.notaExistente;

  // Helper to parse DolorEscala enum back to number
  const parseDolorEnum = (val: string | null | undefined): number => {
    if (!val) return 5;
    const m = val.match(/^N(\d+)$/);
    return m ? parseInt(m[1], 10) : 5;
  };

  // ── Estado del formulario (pre-fill from existing nota if revisiting) ──
  const [subjetivo, setSubjetivo] = useState(nota?.subjetivo ?? "");
  const [objetivo, setObjetivo] = useState(nota?.objetivo ?? "");
  const [analisis, setAnalisis] = useState(nota?.analisis ?? "");
  const [plan, setPlan] = useState(nota?.plan ?? "");
  const [dolorInicio, setDolorInicio] = useState(parseDolorEnum(nota?.dolorInicio));
  const [dolorFin, setDolorFin] = useState(parseDolorEnum(nota?.dolorFin));
  const [tecnicas, setTecnicas] = useState<string[]>(nota?.tecnicasUtilizadas ?? []);
  const [evolucion, setEvolucion] = useState(nota?.evolucion ?? "");
  const [porcentajeObjetivo, setPorcentajeObjetivo] = useState(nota?.porcentajeObjetivo ?? 50);
  const [notasAdicionales, setNotasAdicionales] = useState(nota?.notasAdicionales ?? "");
  const [fechaSesion, setFechaSesion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const yaGuardada = !!nota;

  const citaId = citaIdParam ?? sesion.citaId;
  const estadoInfo = ESTADO_LABELS[sesion.estado] ?? ESTADO_LABELS.agendada;
  const tipoExpediente: TipoExpediente = getTipoExpediente(sesion.tipoSesion);
  const tipoBadge = TIPO_BADGE[tipoExpediente];

  useEffect(() => {
    const fecha = sesion.fechaHoraInicio
      ? new Date(sesion.fechaHoraInicio)
      : new Date();
    setFechaSesion(format(fecha, "EEEE d 'de' MMMM, yyyy", { locale: es }));
  }, [sesion.fechaHoraInicio]);

  const toggleTecnica = (t: string) => {
    setTecnicas((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleGuardar = async () => {
    if (guardando) return;
    if (!citaId) {
      toast.error("No hay cita asociada para guardar la nota.");
      return;
    }

    setGuardando(true);
    const fd = new FormData();
    fd.set("citaId", citaId);
    fd.set("pacienteId", paciente.id);
    fd.set("subjetivo", subjetivo);
    fd.set("objetivo", objetivo);
    fd.set("analisis", analisis);
    fd.set("plan", plan);
    fd.set("dolorInicio", String(dolorInicio));
    fd.set("dolorFin", String(dolorFin));
    fd.set("tecnicas", JSON.stringify(tecnicas));
    fd.set("evolucion", evolucion);
    fd.set("porcentajeObjetivo", String(porcentajeObjetivo));
    fd.set("notasAdicionales", notasAdicionales);

    const result = await crearNotaSesion(null, fd);
    setGuardando(false);

    if (result.success) {
      toast.success("Nota SOAP guardada correctamente");
      router.back();
    } else {
      toast.error(result.error ?? "Error al guardar la nota");
    }
  };

  const sesionLabel = sesion.sesionesTotal
    ? `${sesion.tipoSesion} · Sesión #${sesion.numeroSesion} de ${sesion.sesionesTotal}`
    : `${sesion.tipoSesion} · Sesión #${sesion.numeroSesion}`;

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#f0f4f7] min-h-full pb-28">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8 cursor-pointer hover:bg-[#c8dce8] shrink-0"
        >
          <ArrowLeft className="h-4 w-4 text-[#1e2d3a]" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-[#1e2d3a]">Nota SOAP</h1>
          <p className="text-xs text-[#1e2d3a]/50">
            Registra la evolución clínica de la sesión
          </p>
        </div>
      </div>

      {/* ── SECCIÓN 1: INFO CITA ── */}
      <Card className="bg-[#f0f4f7] border-[#c8dce8]">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-[#a8cfe0]">
              <AvatarFallback className="bg-[#4a7fa5] text-white font-bold text-sm">
                {paciente.iniciales}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-[#1e2d3a]">{paciente.nombre}</p>
              <p className="text-xs text-[#1e2d3a]/50">
                {sesionLabel}
              </p>
              <p className="text-[10px] text-[#1e2d3a]/40 mt-0.5">
                {fechaSesion}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${tipoBadge.color} border`}
            >
              {tipoBadge.label}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${estadoInfo.color}`}
            >
              {estadoInfo.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── HISTORIAL DE SESIONES ── */}
      {initialData.historialCitas && initialData.historialCitas.length > 1 && (
        <HistorialSesiones
          historial={initialData.historialCitas}
          citaActualId={citaId ?? null}
        />
      )}

      {/* ── NOTA YA GUARDADA BANNER ── */}
      {yaGuardada && (
        <div className="bg-[#3fa87c]/10 border border-[#3fa87c]/30 rounded-lg p-3 flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-[#3fa87c] shrink-0" />
          <p className="text-xs text-[#2d6a4f] font-medium">
            Esta sesión ya tiene nota SOAP guardada. Los campos muestran los datos registrados.
          </p>
        </div>
      )}

      {/* ── FORMULARIOS ESPECIALIZADOS ── */}
      {tipoExpediente === "suelo_pelvico" && (
        <ExpedienteSueloPelvico
          pacienteId={paciente.id}
          citaId={citaId ?? undefined}
          esInicial={initialData.notasSesion.length === 0}
        />
      )}

      {tipoExpediente === "cosme" && (
        <ExpedienteCosme
          pacienteId={paciente.id}
          citaId={citaId ?? undefined}
          esInicial={initialData.notasSesion.length === 0}
        />
      )}

      {/* ── SECCIÓN 2: ESCALA EVA (solo fisioterapia o seguimiento suelo pélvico) ── */}
      {(tipoExpediente === "fisioterapia" || (tipoExpediente === "suelo_pelvico" && initialData.notasSesion.length > 0)) && (
      <>
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">
            Escala Visual Análoga (EVA)
          </CardTitle>
          <p className="text-[10px] text-[#1e2d3a]/40">
            0 = Sin dolor · 10 = Dolor máximo
          </p>
        </CardHeader>
        <CardContent className="flex gap-6 items-start">
          {/* Dolor inicio */}
          <div className="flex-1 space-y-2">
            <Label className="text-xs font-semibold text-[#1e2d3a]">
              Dolor al inicio
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={10}
                value={dolorInicio}
                onChange={(e) =>
                  setDolorInicio(
                    Math.max(0, Math.min(10, Number(e.target.value)))
                  )
                }
                className="w-16 h-12 text-center border border-[#a8cfe0] rounded-lg bg-white text-rose-500 font-bold text-4xl focus:outline-none focus:border-[#4a7fa5] transition-colors"
              />
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={dolorInicio}
                  onChange={(e) => setDolorInicio(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#1e2d3a]/30 px-0.5">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>
          {/* Dolor fin */}
          <div className="flex-1 space-y-2">
            <Label className="text-xs font-semibold text-[#1e2d3a]">
              Dolor al final
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={10}
                value={dolorFin}
                onChange={(e) =>
                  setDolorFin(
                    Math.max(0, Math.min(10, Number(e.target.value)))
                  )
                }
                className="w-16 h-12 text-center border border-[#a8cfe0] rounded-lg bg-white text-emerald-600 font-bold text-4xl focus:outline-none focus:border-[#4a7fa5] transition-colors"
              />
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={dolorFin}
                  onChange={(e) => setDolorFin(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#1e2d3a]/30 px-0.5">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 3: NOTAS SOAP ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#1e2d3a]">Notas SOAP</h3>

        {/* S */}
        <div className="border-l-4 border-cyan-400 pl-4 space-y-1.5">
          <Label className="text-xs font-semibold text-cyan-700">
            S — Subjetivo
          </Label>
          <textarea
            value={subjetivo}
            onChange={(e) => setSubjetivo(e.target.value)}
            placeholder="¿Qué reporta el paciente?"
            rows={3}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
          />
        </div>

        {/* O */}
        <div className="border-l-4 border-violet-400 pl-4 space-y-1.5">
          <Label className="text-xs font-semibold text-violet-700">
            O — Objetivo
          </Label>
          <textarea
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            placeholder="Hallazgos clínicos, ROM, fuerza..."
            rows={3}
            className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-violet-400 transition-colors resize-none"
          />
        </div>

        {/* A */}
        <div className="border-l-4 border-amber-400 pl-4 space-y-1.5">
          <Label className="text-xs font-semibold text-amber-700">
            A — Análisis
          </Label>
          <textarea
            value={analisis}
            onChange={(e) => setAnalisis(e.target.value)}
            placeholder="Evaluación clínica, interpretación..."
            rows={3}
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-amber-400 transition-colors resize-none"
          />
        </div>

        {/* P */}
        <div className="border-l-4 border-emerald-400 pl-4 space-y-1.5">
          <Label className="text-xs font-semibold text-emerald-700">
            P — Plan
          </Label>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Acciones para próxima sesión..."
            rows={3}
            className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-emerald-400 transition-colors resize-none"
          />
        </div>
      </div>

      {/* ── SECCIÓN 4: TÉCNICAS ── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">
            Técnicas Aplicadas
          </CardTitle>
          <p className="text-[10px] text-[#1e2d3a]/40">
            Selecciona las técnicas utilizadas en esta sesión
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TECNICAS_DISPONIBLES.map((t) => {
              const activo = tecnicas.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTecnica(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-all duration-200 ${
                    activo
                      ? "bg-[#f0f4f7] border-[#4a7fa5] text-[#4a7fa5]"
                      : "bg-white border-gray-200 text-[#1e2d3a]/60 hover:border-[#a8cfe0]"
                  }`}
                >
                  {activo && (
                    <CheckCircle2 className="inline-block h-3 w-3 mr-1 -mt-0.5" />
                  )}
                  {t}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 5: EVOLUCIÓN ── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">
            Evolución del Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {/* Mejoría */}
            <button
              onClick={() => setEvolucion("mejoria")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                evolucion === "mejoria"
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-200 bg-white hover:border-emerald-200"
              }`}
            >
              <TrendingDown
                className={`h-6 w-6 ${
                  evolucion === "mejoria"
                    ? "text-emerald-600"
                    : "text-[#1e2d3a]/30"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  evolucion === "mejoria"
                    ? "text-emerald-700"
                    : "text-[#1e2d3a]/50"
                }`}
              >
                Mejoría
              </span>
            </button>
            {/* Sin cambios */}
            <button
              onClick={() => setEvolucion("sin_cambios")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                evolucion === "sin_cambios"
                  ? "border-[#4a7fa5] bg-[#e4ecf2]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Minus
                className={`h-6 w-6 ${
                  evolucion === "sin_cambios"
                    ? "text-[#4a7fa5]"
                    : "text-[#1e2d3a]/30"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  evolucion === "sin_cambios"
                    ? "text-[#1e2d3a]"
                    : "text-[#1e2d3a]/50"
                }`}
              >
                Sin cambios
              </span>
            </button>
            {/* Deterioro */}
            <button
              onClick={() => setEvolucion("deterioro")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                evolucion === "deterioro"
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-white hover:border-red-200"
              }`}
            >
              <TrendingUp
                className={`h-6 w-6 ${
                  evolucion === "deterioro"
                    ? "text-red-500"
                    : "text-[#1e2d3a]/30"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  evolucion === "deterioro"
                    ? "text-red-600"
                    : "text-[#1e2d3a]/50"
                }`}
              >
                Deterioro
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 6: % OBJETIVO ── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">
            Porcentaje de Objetivo Terapéutico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-5xl font-bold text-[#4a7fa5]">
              {porcentajeObjetivo}%
            </p>
            <p className="text-[10px] text-[#1e2d3a]/40 mt-1">
              del objetivo terapéutico alcanzado
            </p>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={porcentajeObjetivo}
            onChange={(e) => setPorcentajeObjetivo(Number(e.target.value))}
            className="w-full accent-[#4a7fa5] cursor-pointer"
          />
          <Progress
            value={porcentajeObjetivo}
            className="h-3 [&>div]:bg-[#4a7fa5]"
          />
          <div className="flex justify-between text-[10px] text-[#1e2d3a]/30">
            <span>0% — Inicio</span>
            <span>50% — Mitad</span>
            <span>100% — Objetivo</span>
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 7: BODY MAP ── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#1e2d3a]">
                Body Map
              </CardTitle>
              <p className="text-[10px] text-[#1e2d3a]/40 mt-0.5">
                Mapa corporal de hallazgos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BodyMapModal
                pacienteId={paciente.id}
                pacienteNombre={paciente.nombre}
                modoApertura="ver_historial"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] text-xs gap-1.5"
                  >
                    Ver completo
                  </Button>
                }
              />
              <BodyMapModal
                pacienteId={paciente.id}
                pacienteNombre={paciente.nombre}
                citaId={citaId ?? undefined}
                modoApertura="seguimiento"
                trigger={
                  <Button
                    className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white transition-all duration-200 text-xs gap-1.5 shrink-0"
                  >
                    <ScanLine className="h-3.5 w-3.5" />
                    Actualizar Body Map
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ── SECCIÓN 8: FOTOS ── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">
            Evidencia Fotográfica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-dashed border-2 border-[#a8cfe0] rounded-xl p-8 text-center cursor-pointer hover:border-[#4a7fa5] transition-all duration-200">
            <Camera className="h-8 w-8 text-[#4a7fa5]/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#1e2d3a]/60">
              Arrastra fotos aquí o haz clic para subir
            </p>
            <p className="text-[10px] text-[#1e2d3a]/30 mt-1">
              JPG, PNG hasta 5 MB · máx 4 fotos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── NOTAS ADICIONALES ── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">
            Notas Adicionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notasAdicionales}
            onChange={(e) => setNotasAdicionales(e.target.value)}
            placeholder="Observaciones generales, indicaciones al paciente..."
            rows={3}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#4a7fa5] transition-colors resize-none"
          />
        </CardContent>
      </Card>

      {/* ── FOOTER STICKY ── */}
      <div className="sticky bottom-0 bg-white border-t border-[#c8dce8] p-4 -mx-4 md:-mx-6 -mb-28 flex items-center justify-end gap-3 shadow-lg">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] transition-all duration-200 text-sm gap-1.5"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          disabled={guardando || yaGuardada}
          className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white transition-all duration-200 text-sm gap-1.5 disabled:opacity-50"
        >
          {guardando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : yaGuardada ? (
            <ClipboardCheck className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {yaGuardada ? "Nota ya guardada" : "Guardar Nota SOAP"}
        </Button>
      </div>
      </>
      )}
    </div>
  );
}
