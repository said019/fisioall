"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const BodyMapModal = dynamic(() => import("@/components/BodyMapModal"), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-40 rounded-lg bg-[#e4ecf2] animate-pulse" />
  ),
});

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
  };
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
// PAGE
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

  // ── Estado del formulario ──
  const [subjetivo, setSubjetivo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [analisis, setAnalisis] = useState("");
  const [plan, setPlan] = useState("");
  const [dolorInicio, setDolorInicio] = useState(5);
  const [dolorFin, setDolorFin] = useState(3);
  const [tecnicas, setTecnicas] = useState<string[]>([]);
  const [evolucion, setEvolucion] = useState("");
  const [porcentajeObjetivo, setPorcentajeObjetivo] = useState(50);
  const [notasAdicionales, setNotasAdicionales] = useState("");
  const [fechaSesion, setFechaSesion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const citaId = citaIdParam ?? sesion.citaId;
  const estadoInfo = ESTADO_LABELS[sesion.estado] ?? ESTADO_LABELS.agendada;

  useEffect(() => {
    setFechaSesion(format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es }));
  }, []);

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
          <Badge
            variant="outline"
            className={`text-[10px] shrink-0 ${estadoInfo.color}`}
          >
            {estadoInfo.label}
          </Badge>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 2: ESCALA EVA ── */}
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
          disabled={guardando}
          className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white transition-all duration-200 text-sm gap-1.5 disabled:opacity-50"
        >
          {guardando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Guardar Nota SOAP
        </Button>
      </div>
    </div>
  );
}
