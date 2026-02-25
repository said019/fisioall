"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import BodyMap from "@/components/BodyMap";
import { getSnapshotActual, guardarSnapshot } from "@/app/dashboard/expediente/bodymap-actions";
import { marcasToState, evaPromedioDesdeState } from "@/types/bodymap";
import type { BodyMapState, SnapshotTipo } from "@/types/bodymap";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
export type ModoApertura =
  | "evaluacion_inicial"
  | "seguimiento"
  | "reevaluacion"
  | "ver_historial";

interface ModoConfig {
  color: string;
  badge: string;
  intro: string;
}

const MODO_CONFIG: Record<ModoApertura, ModoConfig> = {
  evaluacion_inicial: {
    color: "#7C3AED",
    badge: "EVALUACIÓN INICIAL",
    intro:
      "Marca TODAS las zonas afectadas. Este será el estado base del tratamiento.",
  },
  seguimiento: {
    color: "#059669",
    badge: "SEGUIMIENTO",
    intro:
      "Solo actualiza las zonas que hayan cambiado desde la última sesión.",
  },
  reevaluacion: {
    color: "#0891B2",
    badge: "RE-EVALUACIÓN",
    intro:
      "Registra el estado actual completo del paciente para la re-evaluación.",
  },
  ver_historial: {
    color: "#64748B",
    badge: "SOLO LECTURA",
    intro: "Vista de solo lectura del estado actual del cuerpo.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface BodyMapModalProps {
  pacienteId: string;
  pacienteNombre: string;
  citaId?: string;
  modoApertura: ModoApertura;
  trigger: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BodyMapModal({
  pacienteId,
  pacienteNombre,
  citaId,
  modoApertura,
  trigger,
}: BodyMapModalProps) {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estadoActual, setEstadoActual] = useState<BodyMapState>({});
  const [notasSnapshot, setNotasSnapshot] = useState("");

  const config = MODO_CONFIG[modoApertura];
  const marcasCount = Object.keys(estadoActual).length;
  const evaPromedio = evaPromedioDesdeState(estadoActual);

  // Cargar snapshot al abrir
  useEffect(() => {
    if (!abierto) return;

    if (modoApertura === "evaluacion_inicial") {
      setEstadoActual({});
      setCargando(false);
      return;
    }

    setCargando(true);
    getSnapshotActual(pacienteId)
      .then((snapshot) => {
        setEstadoActual(marcasToState(snapshot?.marcas ?? []));
      })
      .catch(() => {
        setEstadoActual({});
      })
      .finally(() => setCargando(false));
  }, [abierto, pacienteId, modoApertura]);

  const handleGuardar = async () => {
    if (guardando) return;
    setGuardando(true);

    const marcas = Object.values(estadoActual).map((m) => ({
      zonaId: m.zonaId,
      zonaLabel: m.zonaLabel,
      vista: m.vista,
      tipo: m.tipo,
      intensidad: m.intensidad,
      lateralidad: m.lateralidad,
      notas: m.notas ?? "",
      colorHex: m.colorHex,
    }));

    const result = await guardarSnapshot({
      pacienteId,
      citaId,
      tipo: modoApertura as SnapshotTipo,
      marcas,
      notas: notasSnapshot || undefined,
    });

    if (result.ok) {
      toast.success("Body map guardado correctamente");
      setAbierto(false);
    } else {
      toast.error(result.error ?? "Error al guardar");
      setGuardando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* ── HEADER ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-cyan-100 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${config.color}22` }}
            >
              <MapPin className="h-4 w-4" style={{ color: config.color }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-[#164E63]">Body Map</p>
                <p className="text-xs text-[#164E63]/50 truncate">
                  {pacienteNombre}
                </p>
                <Badge
                  className="text-[10px] px-2 py-0.5 border-0 font-bold"
                  style={{
                    background: `${config.color}20`,
                    color: config.color,
                  }}
                >
                  {config.badge}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {marcasCount > 0 && (
              <span className="text-xs text-[#164E63]/50 hidden sm:block">
                {marcasCount} zonas marcadas
              </span>
            )}
            <button
              onClick={() => setAbierto(false)}
              className="cursor-pointer text-[#164E63]/30 hover:text-[#164E63]/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto p-5">
          {cargando ? (
            <div className="flex gap-4">
              <div className="space-y-2 w-40">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-lg" />
                ))}
              </div>
              <Skeleton className="flex-1 h-[500px] rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Texto intro */}
              <p
                className="text-xs font-medium px-3 py-2 rounded-lg"
                style={{
                  background: `${config.color}10`,
                  color: config.color,
                }}
              >
                {config.intro}
              </p>

              {/* Body Map interactivo */}
              <BodyMap
                marcasIniciales={estadoActual}
                editable={modoApertura !== "ver_historial"}
                onCambio={setEstadoActual}
              />

              {/* Notas del snapshot */}
              {modoApertura !== "ver_historial" && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#164E63]/60">
                    Notas de esta evaluación
                  </p>
                  <textarea
                    value={notasSnapshot}
                    onChange={(e) => setNotasSnapshot(e.target.value)}
                    placeholder="Observaciones generales de la sesión..."
                    className="w-full text-xs border border-cyan-200 rounded-xl p-3 resize-none focus:outline-none focus:border-[#0891B2] text-[#164E63] min-h-[80px]"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 px-5 py-3.5 border-t border-cyan-100 bg-white">
          {/* Stats */}
          <p className="text-xs text-[#164E63]/50">
            {marcasCount === 0 ? (
              "Sin hallazgos registrados"
            ) : (
              <>
                <span className="font-semibold text-[#164E63]">
                  {marcasCount}
                </span>{" "}
                zonas marcadas · EVA promedio:{" "}
                <span className="font-semibold text-[#164E63]">
                  {evaPromedio}
                </span>
              </>
            )}
          </p>

          {/* Acciones */}
          {modoApertura !== "ver_historial" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAbierto(false)}
                className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 transition-all duration-200"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleGuardar}
                disabled={guardando || marcasCount === 0}
                className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 gap-1.5 disabled:opacity-50"
              >
                {guardando ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                Guardar snapshot
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
