"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    color: "#3fa87c",
    badge: "SEGUIMIENTO",
    intro:
      "Solo actualiza las zonas que hayan cambiado desde la última sesión.",
  },
  reevaluacion: {
    color: "#4a7fa5",
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
    if (marcasCount === 0) {
      toast.warning("Selecciona al menos una zona en el cuerpo antes de guardar.");
      return;
    }
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

  if (!abierto) {
    return <span onClick={() => setAbierto(true)}>{trigger}</span>;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setAbierto(false)}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col max-h-[96vh] w-[95vw] max-w-5xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#c8dce8] bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${config.color}22` }}
            >
              <MapPin className="h-3.5 w-3.5" style={{ color: config.color }} />
            </div>
            <p className="text-sm font-bold text-[#1e2d3a]">Body Map</p>
            <p className="text-xs text-[#1e2d3a]/50 truncate hidden sm:block">
              {pacienteNombre}
            </p>
            <Badge
              className="text-[9px] px-1.5 py-0 border-0 font-bold"
              style={{
                background: `${config.color}20`,
                color: config.color,
              }}
            >
              {config.badge}
            </Badge>
          </div>
          <button
            onClick={() => setAbierto(false)}
            className="cursor-pointer text-[#1e2d3a]/30 hover:text-[#1e2d3a]/70 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Intro banner ── */}
        <div className="px-4 pt-2 shrink-0">
          <p
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg"
            style={{
              background: `${config.color}10`,
              color: config.color,
            }}
          >
            {config.intro}
          </p>
        </div>

        {/* ── BODY — fills remaining space, scroll on mobile ── */}
        <div className="flex-1 min-h-0 px-4 py-2 overflow-y-auto">
          {cargando ? (
            <div className="flex gap-4 h-full items-center justify-center">
              <Skeleton className="h-[300px] w-[200px] rounded-xl" />
            </div>
          ) : (
            <BodyMap
              marcasIniciales={estadoActual}
              editable={modoApertura !== "ver_historial"}
              onCambio={setEstadoActual}
            />
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="shrink-0 border-t border-[#c8dce8] bg-white px-4 py-2.5 flex items-center justify-between gap-3 relative z-20">
          {/* Stats */}
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-xs text-[#1e2d3a]/50 shrink-0">
              {marcasCount === 0 ? (
                "Sin hallazgos"
              ) : (
                <>
                  <span className="font-semibold text-[#1e2d3a]">{marcasCount}</span> zonas · EVA{" "}
                  <span className="font-semibold text-[#1e2d3a]">{evaPromedio}</span>
                </>
              )}
            </p>
            {/* Inline notes input */}
            {modoApertura !== "ver_historial" && (
              <input
                value={notasSnapshot}
                onChange={(e) => setNotasSnapshot(e.target.value)}
                placeholder="Notas de evaluación..."
                className="flex-1 min-w-0 text-xs border border-[#c8dce8] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#4a7fa5] text-[#1e2d3a] placeholder:text-[#1e2d3a]/30"
              />
            )}
          </div>

          {/* Actions */}
          {modoApertura !== "ver_historial" && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="cursor-pointer inline-flex items-center justify-center rounded-md border border-[#a8cfe0] bg-white px-3 h-8 text-xs font-medium text-[#1e2d3a] hover:bg-[#e4ecf2] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardar}
                disabled={guardando}
                className={`cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-md px-3 h-8 text-xs font-medium text-white transition-colors ${
                  marcasCount === 0
                    ? "bg-[#3fa87c]/50"
                    : "bg-[#3fa87c] hover:bg-[#3fa87c]/90"
                } disabled:opacity-50`}
              >
                {guardando ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
