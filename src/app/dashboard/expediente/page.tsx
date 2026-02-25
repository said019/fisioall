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
  Flame,
  Zap,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import BodyMapModal from "@/components/BodyMapModal";

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
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ExpedientePage() {
  const router = useRouter();
  // ── Estado del formulario ──
  const [subjetivo, setSubjetivo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [analisis, setAnalisis] = useState("");
  const [plan, setPlan] = useState("");
  const [dolorInicio, setDolorInicio] = useState(5);
  const [dolorFin, setDolorFin] = useState(3);
  const [tecnicas, setTecnicas] = useState<string[]>([]);
  const [evolucion, setEvolucion] = useState("");
  const [porcentajeObjetivo, setPorcentajeObjetivo] = useState(70);
  const [notasAdicionales, setNotasAdicionales] = useState("");
  const [fechaSesion, setFechaSesion] = useState("");

  useEffect(() => {
    setFechaSesion(format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es }));
  }, []);

  const toggleTecnica = (t: string) => {
    setTecnicas((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#ECFEFF] min-h-full pb-28">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8 cursor-pointer hover:bg-cyan-100 shrink-0"
        >
          <ArrowLeft className="h-4 w-4 text-[#164E63]" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-[#164E63]">Nota SOAP</h1>
          <p className="text-xs text-[#164E63]/50">
            Registra la evolución clínica de la sesión
          </p>
        </div>
      </div>

      {/* ── SECCIÓN 1: INFO CITA ── */}
      <Card className="bg-[#ECFEFF] border-cyan-100">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-cyan-200">
              <AvatarFallback className="bg-[#0891B2] text-white font-bold text-sm">
                AF
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-[#164E63]">Ana Flores Gutiérrez</p>
              <p className="text-xs text-[#164E63]/50">
                Rehabilitación Post-Operatoria · Sesión #8 de 10
              </p>
              <p className="text-[10px] text-[#164E63]/40 mt-0.5">
                {fechaSesion}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0"
          >
            En curso
          </Badge>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 2: ESCALA EVA ── */}
      <Card className="border-cyan-100 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#164E63]">
            Escala Visual Análoga (EVA)
          </CardTitle>
          <p className="text-[10px] text-[#164E63]/40">
            0 = Sin dolor · 10 = Dolor máximo
          </p>
        </CardHeader>
        <CardContent className="flex gap-6 items-start">
          {/* Dolor inicio */}
          <div className="flex-1 space-y-2">
            <Label className="text-xs font-semibold text-[#164E63]">
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
                className="w-16 h-12 text-center border border-cyan-200 rounded-lg bg-white text-rose-500 font-bold text-4xl focus:outline-none focus:border-[#0891B2] transition-colors"
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
                <div className="flex justify-between text-[9px] text-[#164E63]/30 px-0.5">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>
          {/* Dolor fin */}
          <div className="flex-1 space-y-2">
            <Label className="text-xs font-semibold text-[#164E63]">
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
                className="w-16 h-12 text-center border border-cyan-200 rounded-lg bg-white text-emerald-600 font-bold text-4xl focus:outline-none focus:border-[#0891B2] transition-colors"
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
                <div className="flex justify-between text-[9px] text-[#164E63]/30 px-0.5">
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
        <h3 className="text-sm font-bold text-[#164E63]">Notas SOAP</h3>

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
            className="w-full rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
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
            className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-violet-400 transition-colors resize-none"
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
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-amber-400 transition-colors resize-none"
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
            className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-emerald-400 transition-colors resize-none"
          />
        </div>
      </div>

      {/* ── SECCIÓN 4: TÉCNICAS ── */}
      <Card className="border-cyan-100 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#164E63]">
            Técnicas Aplicadas
          </CardTitle>
          <p className="text-[10px] text-[#164E63]/40">
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
                      ? "bg-[#ECFEFF] border-[#0891B2] text-[#0891B2]"
                      : "bg-white border-gray-200 text-[#164E63]/60 hover:border-cyan-200"
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
      <Card className="border-cyan-100 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#164E63]">
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
                    : "text-[#164E63]/30"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  evolucion === "mejoria"
                    ? "text-emerald-700"
                    : "text-[#164E63]/50"
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
                  ? "border-[#0891B2] bg-cyan-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Minus
                className={`h-6 w-6 ${
                  evolucion === "sin_cambios"
                    ? "text-[#0891B2]"
                    : "text-[#164E63]/30"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  evolucion === "sin_cambios"
                    ? "text-[#164E63]"
                    : "text-[#164E63]/50"
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
                    : "text-[#164E63]/30"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  evolucion === "deterioro"
                    ? "text-red-600"
                    : "text-[#164E63]/50"
                }`}
              >
                Deterioro
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 6: % OBJETIVO ── */}
      <Card className="border-cyan-100 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#164E63]">
            Porcentaje de Objetivo Terapéutico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-5xl font-bold text-[#0891B2]">
              {porcentajeObjetivo}%
            </p>
            <p className="text-[10px] text-[#164E63]/40 mt-1">
              del objetivo terapéutico alcanzado
            </p>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={porcentajeObjetivo}
            onChange={(e) => setPorcentajeObjetivo(Number(e.target.value))}
            className="w-full accent-[#0891B2] cursor-pointer"
          />
          <Progress
            value={porcentajeObjetivo}
            className="h-3 [&>div]:bg-[#0891B2]"
          />
          <div className="flex justify-between text-[10px] text-[#164E63]/30">
            <span>0% — Inicio</span>
            <span>50% — Mitad</span>
            <span>100% — Objetivo</span>
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 7: BODY MAP ── */}
      <Card className="border-cyan-100 bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#164E63]">
                Body Map
              </CardTitle>
              <p className="text-[10px] text-[#164E63]/40 mt-0.5">
                Mapa corporal de hallazgos · Última actualización: sesión #4
              </p>
            </div>
            <BodyMapModal
              pacienteId="1"
              pacienteNombre="Ana Flores Gutiérrez"
              modoApertura="seguimiento"
              trigger={
                <Button
                  className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 text-xs gap-1.5 shrink-0"
                >
                  <ScanLine className="h-3.5 w-3.5" />
                  Actualizar Body Map
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Mini resumen de zonas activas (mock) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 bg-[#ECFEFF]/60 border border-cyan-100 rounded-xl px-3 py-2.5">
              <div className="h-7 w-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <Flame className="h-3.5 w-3.5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#164E63] truncate">Zona Lumbar</p>
                <p className="text-[10px] text-[#164E63]/40">
                  EVA <span className="font-bold text-orange-500">3</span>
                  <span className="ml-1 text-emerald-600">↓6</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#ECFEFF]/60 border border-cyan-100 rounded-xl px-3 py-2.5">
              <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                <Zap className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#164E63] truncate">Rodilla Izq.</p>
                <p className="text-[10px] text-[#164E63]/40">
                  EVA <span className="font-bold text-yellow-500">2</span>
                  <span className="ml-1 text-emerald-600">↓4</span>
                </p>
              </div>
            </div>
            <BodyMapModal
              pacienteId="1"
              pacienteNombre="Ana Flores Gutiérrez"
              modoApertura="ver_historial"
              trigger={
                <div className="flex items-center justify-center gap-1.5 border-2 border-dashed border-cyan-200 rounded-xl px-3 py-2.5 cursor-pointer hover:border-[#0891B2] hover:bg-[#ECFEFF]/80 transition-all duration-200 group">
                  <Activity className="h-3.5 w-3.5 text-[#0891B2]/40 group-hover:text-[#0891B2] transition-colors" />
                  <p className="text-[10px] font-semibold text-[#164E63]/40 group-hover:text-[#0891B2] transition-colors">Ver completo</p>
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 8: FOTOS ── */}
      <Card className="border-cyan-100 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#164E63]">
            Evidencia Fotográfica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-dashed border-2 border-cyan-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#0891B2] transition-all duration-200">
            <Camera className="h-8 w-8 text-[#0891B2]/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#164E63]/60">
              Arrastra fotos aquí o haz clic para subir
            </p>
            <p className="text-[10px] text-[#164E63]/30 mt-1">
              JPG, PNG hasta 5 MB · máx 4 fotos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── NOTAS ADICIONALES ── */}
      <Card className="border-cyan-100 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#164E63]">
            Notas Adicionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notasAdicionales}
            onChange={(e) => setNotasAdicionales(e.target.value)}
            placeholder="Observaciones generales, indicaciones al paciente..."
            rows={3}
            className="w-full rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-[#0891B2] transition-colors resize-none"
          />
        </CardContent>
      </Card>

      {/* ── FOOTER STICKY ── */}
      <div className="sticky bottom-0 bg-white border-t border-cyan-100 p-4 -mx-4 md:-mx-6 -mb-28 flex items-center justify-end gap-3 shadow-lg">
        <Button
          variant="outline"
          className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 transition-all duration-200 text-sm gap-1.5"
        >
          <Save className="h-4 w-4" />
          Guardar Borrador
        </Button>
        <Button className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 text-sm gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          Guardar y Completar Cita
        </Button>
      </div>
    </div>
  );
}
