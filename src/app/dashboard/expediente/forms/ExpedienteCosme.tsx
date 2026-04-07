"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { guardarExpedienteEspecializado } from "../especializado-actions";

interface Props {
  pacienteId: string;
  citaId?: string;
  esInicial: boolean;
}

// ── Evaluación Inicial ──────────────────────────────────────────────────────
function FormularioInicialCosme({ pacienteId, citaId }: Omit<Props, "esInicial">) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [productosEnPiel, setProductosEnPiel] = useState("");
  const [rutinaSkincare, setRutinaSkincare] = useState("");
  const [alergias, setAlergias] = useState("");
  const [usaProtectorSolar, setUsaProtectorSolar] = useState(false);
  const [pielAcartonada, setPielAcartonada] = useState(false);
  const [tabaco, setTabaco] = useState(false);
  const [cafeinaAlcohol, setCafeinaAlcohol] = useState("");
  const [motivoVisita, setMotivoVisita] = useState("");
  const [expectativas, setExpectativas] = useState("");
  const [recomendadoPor, setRecomendadoPor] = useState("");

  const handleGuardar = async () => {
    if (guardando) return;
    setGuardando(true);

    const result = await guardarExpedienteEspecializado({
      pacienteId,
      tipo: "cosme",
      esInicial: true,
      datosJson: {
        productosEnPiel,
        rutinaSkincare,
        alergias,
        usaProtectorSolar,
        pielAcartonada,
        consumoCafeinaAlcohol: cafeinaAlcohol,
        tabaco,
        motivoVisita,
        expectativasSesiones: expectativas,
        recomendadoPor,
      },
      citaId,
    });

    setGuardando(false);
    if (result.success) {
      toast.success("Expediente de cosmetología guardado");
      router.back();
    } else {
      toast.error("Error al guardar el expediente");
    }
  };

  return (
    <div className="space-y-4">
      {/* Productos y rutina */}
      <div className="border-l-4 border-[#e89b3f] pl-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#854f0b]">¿Acostumbras a usar algún producto en tu piel?</Label>
          <textarea
            value={productosEnPiel}
            onChange={(e) => setProductosEnPiel(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#e89b3f] transition-colors resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#854f0b]">Menciona tu rutina de skincare</Label>
          <textarea
            value={rutinaSkincare}
            onChange={(e) => setRutinaSkincare(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#e89b3f] transition-colors resize-none"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">¿Eres alérgica a algún producto?</Label>
          <Input
            value={alergias}
            onChange={(e) => setAlergias(e.target.value)}
            className="h-9 text-sm border-[#a8cfe0]"
          />
        </div>
      </div>

      {/* Toggles */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">Hábitos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${usaProtectorSolar ? "bg-[#e89b3f]/10 border-[#e89b3f]/40" : "bg-white border-[#c8dce8]"}`}>
              <input type="checkbox" checked={usaProtectorSolar} onChange={() => setUsaProtectorSolar(!usaProtectorSolar)} className="accent-[#e89b3f]" />
              <span className="text-xs text-[#1e2d3a]">¿Usas protector solar?</span>
            </label>
            <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${pielAcartonada ? "bg-[#e89b3f]/10 border-[#e89b3f]/40" : "bg-white border-[#c8dce8]"}`}>
              <input type="checkbox" checked={pielAcartonada} onChange={() => setPielAcartonada(!pielAcartonada)} className="accent-[#e89b3f]" />
              <span className="text-xs text-[#1e2d3a]">¿Piel acartonada/tirante?</span>
            </label>
            <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${tabaco ? "bg-[#e89b3f]/10 border-[#e89b3f]/40" : "bg-white border-[#c8dce8]"}`}>
              <input type="checkbox" checked={tabaco} onChange={() => setTabaco(!tabaco)} className="accent-[#e89b3f]" />
              <span className="text-xs text-[#1e2d3a]">¿Consumes tabaco?</span>
            </label>
          </div>
          <div className="mt-3 space-y-1">
            <Label className="text-[10px] text-[#1e2d3a]/50">Bebidas (cafeína, alcohol)</Label>
            <Input
              value={cafeinaAlcohol}
              onChange={(e) => setCafeinaAlcohol(e.target.value)}
              className="h-9 text-sm border-[#a8cfe0]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Motivo y expectativas */}
      <div className="border-l-4 border-[#e89b3f]/50 pl-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Motivo de la visita</Label>
          <textarea
            value={motivoVisita}
            onChange={(e) => setMotivoVisita(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#e89b3f] transition-colors resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">¿Qué esperas obtener en tus sesiones?</Label>
          <textarea
            value={expectativas}
            onChange={(e) => setExpectativas(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#e89b3f] transition-colors resize-none"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Recomendada por</Label>
          <Input
            value={recomendadoPor}
            onChange={(e) => setRecomendadoPor(e.target.value)}
            className="h-9 text-sm border-[#a8cfe0]"
          />
        </div>
      </div>

      {/* Guardar */}
      <div className="sticky bottom-0 bg-white border-t border-[#c8dce8] p-4 -mx-4 md:-mx-6 flex items-center justify-end gap-3 shadow-lg">
        <Button
          onClick={handleGuardar}
          disabled={guardando}
          className="cursor-pointer bg-[#e89b3f] hover:bg-[#e89b3f]/90 text-white transition-all duration-200 text-sm gap-1.5"
        >
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Guardar Expediente
        </Button>
      </div>
    </div>
  );
}

// ── Seguimiento ─────────────────────────────────────────────────────────────
function FormularioSeguimientoCosme({ pacienteId, citaId }: Omit<Props, "esInicial">) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [biotipo, setBiotipo] = useState("");
  const [estadoPiel, setEstadoPiel] = useState<string[]>([]);
  const [alteraciones, setAlteraciones] = useState<string[]>([]);
  const [textura, setTextura] = useState("");
  const [fototipo, setFototipo] = useState("");
  const [lineasExpresion, setLineasExpresion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [diagnosticoTratamiento, setDiagnosticoTratamiento] = useState("");
  const [fechaPrimeraSesion, setFechaPrimeraSesion] = useState("");

  const toggleArray = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleGuardar = async () => {
    if (guardando) return;
    setGuardando(true);

    const result = await guardarExpedienteEspecializado({
      pacienteId,
      tipo: "cosme",
      esInicial: false,
      datosJson: {
        biotipoCutaneo: biotipo,
        estadoPiel,
        alteraciones,
        textura,
        fototipo,
        lineasExpresion,
        observaciones,
        diagnosticoTratamiento,
        fechaPrimeraSesion,
      },
      citaId,
    });

    setGuardando(false);
    if (result.success) {
      toast.success("Seguimiento de cosmetología guardado");
      router.back();
    } else {
      toast.error("Error al guardar el seguimiento");
    }
  };

  return (
    <div className="space-y-4">
      {/* Biotipo cutáneo */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#854f0b]">Biotipo Cutáneo</Label>
        <Select value={biotipo} onValueChange={setBiotipo}>
          <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {["Normal", "Seca", "Grasa", "Mixta"].map((o) => (
              <SelectItem key={o} value={o.toLowerCase()} className="cursor-pointer">{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estado de la piel */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">Estado de la Piel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {["Deshidratada", "Atópica", "Fotosensible", "Envejecida"].map((o) => (
              <label
                key={o}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  estadoPiel.includes(o.toLowerCase()) ? "bg-[#e89b3f]/10 border-[#e89b3f]/40" : "bg-white border-[#c8dce8]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={estadoPiel.includes(o.toLowerCase())}
                  onChange={() => toggleArray(estadoPiel, setEstadoPiel, o.toLowerCase())}
                  className="accent-[#e89b3f]"
                />
                <span className="text-xs text-[#1e2d3a]">{o}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alteraciones */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">Alteraciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {["Hipercromía", "Rosácea", "Acné"].map((o) => (
              <label
                key={o}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  alteraciones.includes(o.toLowerCase()) ? "bg-[#e89b3f]/10 border-[#e89b3f]/40" : "bg-white border-[#c8dce8]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={alteraciones.includes(o.toLowerCase())}
                  onChange={() => toggleArray(alteraciones, setAlteraciones, o.toLowerCase())}
                  className="accent-[#e89b3f]"
                />
                <span className="text-xs text-[#1e2d3a]">{o}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Textura + Fototipo + Líneas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Textura</Label>
          <Select value={textura} onValueChange={setTextura}>
            <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              {["Suave", "Engrosada", "Oleosa"].map((o) => (
                <SelectItem key={o} value={o.toLowerCase()} className="cursor-pointer">{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Fototipo</Label>
          <Select value={fototipo} onValueChange={setFototipo}>
            <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              {["I", "II", "III", "IV"].map((o) => (
                <SelectItem key={o} value={o} className="cursor-pointer">{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Líneas de Expresión</Label>
          <Select value={lineasExpresion} onValueChange={setLineasExpresion}>
            <SelectTrigger className="h-9 text-sm border-[#a8cfe0] cursor-pointer">
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              {["Ninguna", "Suaves", "Profundas", "Arrugas", "Flacidez"].map((o) => (
                <SelectItem key={o} value={o.toLowerCase()} className="cursor-pointer">{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Observaciones + Diagnóstico */}
      <div className="border-l-4 border-[#e89b3f]/50 pl-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Observaciones</Label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#e89b3f] transition-colors resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Diagnóstico y Tratamiento</Label>
          <textarea
            value={diagnosticoTratamiento}
            onChange={(e) => setDiagnosticoTratamiento(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#e89b3f] transition-colors resize-none"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Fecha de primera sesión</Label>
          <Input
            type="date"
            value={fechaPrimeraSesion}
            onChange={(e) => setFechaPrimeraSesion(e.target.value)}
            className="h-9 text-sm border-[#a8cfe0]"
          />
        </div>
      </div>

      {/* Guardar */}
      <div className="sticky bottom-0 bg-white border-t border-[#c8dce8] p-4 -mx-4 md:-mx-6 flex items-center justify-end gap-3 shadow-lg">
        <Button
          onClick={handleGuardar}
          disabled={guardando}
          className="cursor-pointer bg-[#e89b3f] hover:bg-[#e89b3f]/90 text-white transition-all duration-200 text-sm gap-1.5"
        >
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Guardar Seguimiento
        </Button>
      </div>
    </div>
  );
}

export default function ExpedienteCosme(props: Props) {
  if (props.esInicial) {
    return <FormularioInicialCosme pacienteId={props.pacienteId} citaId={props.citaId} />;
  }
  return <FormularioSeguimientoCosme pacienteId={props.pacienteId} citaId={props.citaId} />;
}
