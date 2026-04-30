"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardarExpedienteEspecializado } from "../especializado-actions";

interface Props {
  pacienteId: string;
  citaId?: string;
  esInicial: boolean;
  datosExistentes?: Record<string, unknown> | null;
}

const asString = (v: unknown): string => (typeof v === "string" ? v : "");
const asBool = (v: unknown): boolean => v === true;
const asNumber = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const asObj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

// ── Evaluación Inicial ──────────────────────────────────────────────────────
function FormularioInicial({
  pacienteId,
  citaId,
  datosExistentes,
}: Omit<Props, "esInicial">) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const d = datosExistentes ?? {};
  const sint0 = asObj(d.sintomatologia);
  const fert0 = asObj(d.datosFertilidad);
  const [motivoConsulta, setMotivoConsulta] = useState(asString(d.motivoConsulta));
  const [sintomas, setSintomas] = useState({
    dolorPelvico: asBool(sint0.dolorPelvico),
    escapesOrina: asBool(sint0.escapesOrina),
    escapesGas: asBool(sint0.escapesGas),
    presionAbdominopelvica: asBool(sint0.presionAbdominopelvica),
    vidaSexualActiva: asBool(sint0.vidaSexualActiva),
    estrenimientoCronico: asBool(sint0.estrenimientoCronico),
  });
  const [cicloMenstrual, setCicloMenstrual] = useState(
    asString(fert0.estabilidadCicloMenstrual)
  );
  const [partos, setPartos] = useState(asNumber(fert0.partos));
  const [cesareas, setCesareas] = useState(asNumber(fert0.cesareas));
  const [abortos, setAbortos] = useState(asNumber(fert0.abortos));
  const [antecedentes, setAntecedentes] = useState(asString(d.antecedentesPatologicos));
  const [semanasGestacion, setSemanasGestacion] = useState(
    typeof d.semanasGestacion === "number" ? String(d.semanasGestacion) : ""
  );
  const [sintomasEmbarazo, setSintomasEmbarazo] = useState(asString(d.sintomasEmbarazo));
  const [expectativas, setExpectativas] = useState(asString(d.expectativasSesiones));
  const yaGuardado = !!datosExistentes;

  const toggleSintoma = (key: keyof typeof sintomas) => {
    setSintomas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sintomasOpciones = [
    { key: "dolorPelvico" as const, label: "Dolor pélvico o perineal" },
    { key: "escapesOrina" as const, label: "Escapes de orina" },
    { key: "escapesGas" as const, label: "Escapes de gas" },
    { key: "presionAbdominopelvica" as const, label: "Presión/pesadez abdominopélvica" },
    { key: "vidaSexualActiva" as const, label: "Vida sexual activa" },
    { key: "estrenimientoCronico" as const, label: "Estreñimiento crónico" },
  ];

  const handleGuardar = async () => {
    if (guardando) return;
    setGuardando(true);

    const result = await guardarExpedienteEspecializado({
      pacienteId,
      tipo: "suelo_pelvico",
      esInicial: true,
      datosJson: {
        motivoConsulta,
        sintomatologia: sintomas,
        datosFertilidad: {
          estabilidadCicloMenstrual: cicloMenstrual,
          partos,
          cesareas,
          abortos,
        },
        antecedentesPatologicos: antecedentes,
        semanasGestacion: semanasGestacion ? Number(semanasGestacion) : null,
        sintomasEmbarazo,
        expectativasSesiones: expectativas,
      },
      citaId,
    });

    setGuardando(false);
    if (result.success) {
      toast.success(yaGuardado ? "Expediente actualizado" : "Expediente de suelo pélvico guardado");
      router.refresh();
    } else {
      toast.error("Error al guardar el expediente");
    }
  };

  return (
    <div className="space-y-4">
      {yaGuardado && (
        <div className="bg-[#3fa87c]/10 border border-[#3fa87c]/30 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#3fa87c] shrink-0" />
          <p className="text-xs text-[#2d6a4f] font-medium">
            Expediente guardado. Los campos muestran los datos registrados — puedes editarlos y volver a guardar.
          </p>
        </div>
      )}
      {/* Motivo de consulta */}
      <div className="border-l-4 border-[#0d9488] pl-4 space-y-1.5">
        <Label className="text-xs font-semibold text-[#0d9488]">Motivo de Consulta</Label>
        <textarea
          value={motivoConsulta}
          onChange={(e) => setMotivoConsulta(e.target.value)}
          placeholder="Describe el motivo de consulta..."
          rows={3}
          className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#0d9488] transition-colors resize-none"
        />
      </div>

      {/* Sintomatología */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">Sintomatología</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {sintomasOpciones.map((item) => (
              <label
                key={item.key}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200
                  ${sintomas[item.key]
                    ? "bg-[#0d9488]/10 border-[#0d9488]/40"
                    : "bg-white border-[#c8dce8] hover:bg-[#e4ecf2]/50"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={sintomas[item.key]}
                  onChange={() => toggleSintoma(item.key)}
                  className="accent-[#0d9488]"
                />
                <span className="text-xs text-[#1e2d3a]">{item.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Datos de fertilidad */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">Datos de Fertilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-[#1e2d3a]/50">Ciclo menstrual</Label>
              <Input
                value={cicloMenstrual}
                onChange={(e) => setCicloMenstrual(e.target.value)}
                placeholder="Regular / Irregular"
                className="h-9 text-sm border-[#a8cfe0]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-[#1e2d3a]/50">Partos</Label>
              <Input
                type="number"
                min={0}
                value={partos}
                onChange={(e) => setPartos(Number(e.target.value))}
                className="h-9 text-sm border-[#a8cfe0]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-[#1e2d3a]/50">Cesáreas</Label>
              <Input
                type="number"
                min={0}
                value={cesareas}
                onChange={(e) => setCesareas(Number(e.target.value))}
                className="h-9 text-sm border-[#a8cfe0]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-[#1e2d3a]/50">Abortos</Label>
              <Input
                type="number"
                min={0}
                value={abortos}
                onChange={(e) => setAbortos(Number(e.target.value))}
                className="h-9 text-sm border-[#a8cfe0]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campos adicionales */}
      <div className="border-l-4 border-[#0d9488]/50 pl-4 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Antecedentes Patológicos</Label>
          <Input
            value={antecedentes}
            onChange={(e) => setAntecedentes(e.target.value)}
            className="h-9 text-sm border-[#a8cfe0]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Semanas de gestación (si aplica)</Label>
          <Input
            type="number"
            value={semanasGestacion}
            onChange={(e) => setSemanasGestacion(e.target.value)}
            className="h-9 text-sm border-[#a8cfe0]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Síntomas de embarazo latentes</Label>
          <textarea
            value={sintomasEmbarazo}
            onChange={(e) => setSintomasEmbarazo(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#0d9488] transition-colors resize-none"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">¿Qué esperas de tus sesiones?</Label>
          <textarea
            value={expectativas}
            onChange={(e) => setExpectativas(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#0d9488] transition-colors resize-none"
          />
        </div>
      </div>

      {/* Guardar */}
      <div className="sticky bottom-0 bg-white border-t border-[#c8dce8] p-4 -mx-4 md:-mx-6 flex items-center justify-end gap-3 shadow-lg">
        <Button
          onClick={handleGuardar}
          disabled={guardando}
          className="cursor-pointer bg-[#0d9488] hover:bg-[#0d9488]/90 text-white transition-all duration-200 text-sm gap-1.5"
        >
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {yaGuardado ? "Actualizar Expediente" : "Guardar Expediente"}
        </Button>
      </div>
    </div>
  );
}

// ── Seguimiento (reutiliza SOAP estándar) ────────────────────────────────────
// Para seguimiento, el componente padre renderiza el SOAP de fisioterapia
export default function ExpedienteSueloPelvico(props: Props) {
  if (!props.esInicial) {
    return null; // El padre renderizará el formulario SOAP estándar
  }
  return (
    <FormularioInicial
      pacienteId={props.pacienteId}
      citaId={props.citaId}
      datosExistentes={props.datosExistentes}
    />
  );
}
