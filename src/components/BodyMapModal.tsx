"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  X,
  Trash2,
  MapPin,
  Activity,
  Eye,
  Flame,
  Zap,
  Move,
  Hand,
  Minus,
  Clock,
  GitCompareArrows,
  Scan,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type Vista = "anterior" | "posterior" | "lateral_der" | "lateral_izq";
type TipoHallazgo = "dolor" | "inflamacion" | "contractura" | "limitacion" | "parestesia" | "tension";
type Lateralidad = "bilateral" | "izquierdo" | "derecho";
type Modo = "baseline" | "sesion" | "comparacion";

export interface MarcaBodyMap {
  zona: string;
  label: string;
  vista: Vista;
  eva: number;
  tipo: TipoHallazgo;
  lateralidad: Lateralidad;
  notas: string;
  color: string;
}

export interface Snapshot {
  id: string;
  fecha: string;
  sesion: number;
  modo: "baseline" | "sesion";
  marcas: Record<string, MarcaBodyMap>;
}

export interface BodyMapModalProps {
  open: boolean;
  onClose: () => void;
  modo?: Modo;
  pacienteNombre?: string;
  pacienteIniciales?: string;
  sesionNumero?: number;
}

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const TIPO_CONFIG: Record<TipoHallazgo, { label: string; color: string; icon: React.ReactNode }> = {
  dolor:        { label: "Dolor",            color: "#EF4444", icon: <Flame className="h-3.5 w-3.5" /> },
  inflamacion:  { label: "Inflamación",      color: "#8B5CF6", icon: <Zap className="h-3.5 w-3.5" /> },
  contractura:  { label: "Contractura",      color: "#F59E0B", icon: <Activity className="h-3.5 w-3.5" /> },
  limitacion:   { label: "Limitación ROM",   color: "#06B6D4", icon: <Move className="h-3.5 w-3.5" /> },
  parestesia:   { label: "Parestesia",       color: "#10B981", icon: <Hand className="h-3.5 w-3.5" /> },
  tension:      { label: "Tensión muscular", color: "#F97316", icon: <Minus className="h-3.5 w-3.5" /> },
};

const VISTA_LABELS: Record<Vista, string> = {
  anterior:    "Anterior",
  posterior:   "Posterior",
  lateral_der: "Lateral D",
  lateral_izq: "Lateral I",
};

const EVA_COLORS = [
  "#10B981","#10B981","#10B981","#34D399","#FCD34D",
  "#F59E0B","#F97316","#EF4444","#DC2626","#B91C1C","#7F1D1D",
];

/* ── Heat fill / stroke helpers ── */
function heatFill(eva: number): string {
  const fills = [
    "transparent",
    "rgba(16,185,129,0.35)","rgba(16,185,129,0.35)","rgba(52,211,153,0.35)",
    "rgba(251,191,36,0.35)","rgba(245,158,11,0.35)","rgba(249,115,22,0.4)",
    "rgba(239,68,68,0.4)","rgba(220,38,38,0.45)","rgba(185,28,28,0.5)","rgba(127,29,29,0.6)",
  ];
  return fills[Math.min(eva, 10)] ?? "transparent";
}
function heatStroke(eva: number): string {
  const strokes = [
    "rgba(148,163,184,0.18)",
    "rgba(16,185,129,0.5)","rgba(16,185,129,0.5)","rgba(52,211,153,0.5)",
    "rgba(251,191,36,0.5)","rgba(245,158,11,0.5)","rgba(249,115,22,0.55)",
    "rgba(239,68,68,0.55)","rgba(220,38,38,0.6)","rgba(185,28,28,0.65)","rgba(239,68,68,0.8)",
  ];
  return strokes[Math.min(eva, 10)] ?? "rgba(148,163,184,0.18)";
}

/* ═══════════════════════════════════════════════════════════════════
   MOCK SNAPSHOTS (historial del paciente)
   ═══════════════════════════════════════════════════════════════════ */

const SNAPSHOT_BASELINE: Record<string, MarcaBodyMap> = {
  lumbar_posterior: {
    zona: "lumbar", label: "Zona Lumbar (L1-L5)", vista: "posterior",
    eva: 9, tipo: "dolor", lateralidad: "bilateral",
    notas: "Dolor intenso al inicio. Irradiado hacia glúteo izq. No puede estar más de 10 min sentado.",
    color: "#EF4444",
  },
  rodilla_izq_anterior: {
    zona: "rodilla_izq", label: "Rodilla Izquierda", vista: "anterior",
    eva: 6, tipo: "inflamacion", lateralidad: "izquierdo",
    notas: "Inflamación visible. ROM limitado a 90°.",
    color: "#8B5CF6",
  },
  trapecios_posterior: {
    zona: "trapecios", label: "Trapecios", vista: "posterior",
    eva: 6, tipo: "contractura", lateralidad: "bilateral",
    notas: "Contractura bilateral severa al inicio.",
    color: "#F59E0B",
  },
};

const SNAPSHOT_S4: Record<string, MarcaBodyMap> = {
  lumbar_posterior: {
    zona: "lumbar", label: "Zona Lumbar (L1-L5)", vista: "posterior",
    eva: 6, tipo: "dolor", lateralidad: "bilateral",
    notas: "Mejora progresiva. Tolera 30 min sentado.",
    color: "#EF4444",
  },
  rodilla_izq_anterior: {
    zona: "rodilla_izq", label: "Rodilla Izquierda", vista: "anterior",
    eva: 4, tipo: "inflamacion", lateralidad: "izquierdo",
    notas: "Inflamación reducida. ROM mejoró a 110°.",
    color: "#8B5CF6",
  },
  trapecios_posterior: {
    zona: "trapecios", label: "Trapecios", vista: "posterior",
    eva: 3, tipo: "tension", lateralidad: "bilateral",
    notas: "Tensión residual, mejoría notoria.",
    color: "#F97316",
  },
};

const SNAPSHOT_S8: Record<string, MarcaBodyMap> = {
  lumbar_posterior: {
    zona: "lumbar", label: "Zona Lumbar (L1-L5)", vista: "posterior",
    eva: 3, tipo: "dolor", lateralidad: "bilateral",
    notas: "Dolor controlado. Paciente retomó actividad normal.",
    color: "#EF4444",
  },
  rodilla_izq_anterior: {
    zona: "rodilla_izq", label: "Rodilla Izquierda", vista: "anterior",
    eva: 2, tipo: "inflamacion", lateralidad: "izquierdo",
    notas: "Casi sin inflamación. ROM 130°.",
    color: "#8B5CF6",
  },
};

export const MOCK_SNAPSHOTS: Snapshot[] = [
  { id: "snap-1", fecha: "04 ene 2026", sesion: 1, modo: "baseline", marcas: SNAPSHOT_BASELINE },
  { id: "snap-4", fecha: "20 ene 2026", sesion: 4, modo: "sesion",   marcas: SNAPSHOT_S4 },
  { id: "snap-8", fecha: "24 feb 2026", sesion: 8, modo: "sesion",   marcas: SNAPSHOT_S8 },
];

/* ═══════════════════════════════════════════════════════════════════
   SVG HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function zonaStyle(
  marcas: Record<string, MarcaBodyMap>,
  zonaId: string,
  vista: Vista,
  selected: string | null,
): React.CSSProperties {
  const key = zonaId + "_" + vista;
  const m = marcas[key];
  const isSelected = selected === key;
  return {
    fill: m ? heatFill(m.eva) : "rgba(148,163,184,0.12)",
    stroke: isSelected ? "white" : m ? heatStroke(m.eva) : "rgba(148,163,184,0.18)",
    strokeWidth: isSelected ? 2 : 1,
    cursor: "pointer",
    transition: "all 0.25s",
    filter: isSelected ? "drop-shadow(0 0 8px rgba(255,255,255,0.3))" : undefined,
  };
}

interface ZoneProps {
  zonaId: string;
  label: string;
  vista: Vista;
  marcas: Record<string, MarcaBodyMap>;
  selected: string | null;
  onClick?: (zonaId: string, label: string, vista: Vista) => void;
  readOnly?: boolean;
  children: React.ReactNode;
}

function Zone({ zonaId, label, vista, marcas, selected, onClick, readOnly, children }: ZoneProps) {
  const style = zonaStyle(marcas, zonaId, vista, selected);
  return (
    <g
      style={{ ...style, cursor: readOnly ? "default" : "pointer" }}
      onClick={() => !readOnly && onClick?.(zonaId, label, vista)}
    >
      {children}
    </g>
  );
}

/* ── Mini SVG Anterior (compact, 180×390) ── */
function MiniBodyAnterior({ marcas, selected, onClick, readOnly }: {
  marcas: Record<string, MarcaBodyMap>; selected: string | null;
  onClick?: (z: string, l: string, v: Vista) => void; readOnly?: boolean;
}) {
  const z = (id: string, lbl: string) => ({ zonaId: id, label: lbl, vista: "anterior" as Vista, marcas, selected, onClick, readOnly });
  return (
    <svg width="180" height="390" viewBox="0 0 260 560" xmlns="http://www.w3.org/2000/svg">
      <Zone {...z("cabeza","Cabeza")}><ellipse cx="130" cy="42" rx="32" ry="38" /></Zone>
      <Zone {...z("cuello","Cuello")}><rect x="115" y="79" width="30" height="22" rx="8" /></Zone>
      <Zone {...z("hombro_izq","Hombro Izquierdo")}><ellipse cx="91" cy="104" rx="24" ry="16" /></Zone>
      <Zone {...z("hombro_der","Hombro Derecho")}><ellipse cx="169" cy="104" rx="24" ry="16" /></Zone>
      <Zone {...z("pecho_izq","Pecho Izquierdo")}><path d="M 115 103 C 95 108 78 116 75 138 L 75 158 L 115 158 L 115 103 Z" /></Zone>
      <Zone {...z("pecho_der","Pecho Derecho")}><path d="M 145 103 C 165 108 182 116 185 138 L 185 158 L 145 158 L 145 103 Z" /></Zone>
      <Zone {...z("abdomen_sup","Abdomen Superior")}><rect x="103" y="158" width="54" height="40" rx="4" /></Zone>
      <Zone {...z("abdomen_inf","Abdomen Inferior")}><path d="M 103 198 L 157 198 L 160 230 C 155 240 145 248 130 248 C 115 248 105 240 100 230 Z" /></Zone>
      <Zone {...z("brazo_sup_izq","Brazo Sup. Izq.")}><path d="M 67 103 C 52 112 44 130 44 155 L 44 175 C 52 180 62 180 70 175 L 75 158 C 80 130 79 108 67 103 Z" /></Zone>
      <Zone {...z("brazo_sup_der","Brazo Sup. Der.")}><path d="M 193 103 C 208 112 216 130 216 155 L 216 175 C 208 180 198 180 190 175 L 185 158 C 180 130 181 108 193 103 Z" /></Zone>
      <Zone {...z("codo_izq","Codo Izquierdo")}><ellipse cx="53" cy="182" rx="13" ry="10" /></Zone>
      <Zone {...z("codo_der","Codo Derecho")}><ellipse cx="207" cy="182" rx="13" ry="10" /></Zone>
      <Zone {...z("antebrazo_izq","Antebrazo Izquierdo")}><path d="M 42 190 C 36 205 34 225 38 250 L 48 255 L 58 250 C 65 228 66 205 64 190 L 42 190 Z" /></Zone>
      <Zone {...z("antebrazo_der","Antebrazo Derecho")}><path d="M 218 190 C 224 205 226 225 222 250 L 212 255 L 202 250 C 195 228 194 205 196 190 L 218 190 Z" /></Zone>
      <Zone {...z("mano_izq","Mano / Muñeca Izq.")}><ellipse cx="43" cy="265" rx="14" ry="18" /></Zone>
      <Zone {...z("mano_der","Mano / Muñeca Der.")}><ellipse cx="217" cy="265" rx="14" ry="18" /></Zone>
      <Zone {...z("cadera_izq","Cadera Izquierda")}><path d="M 100 230 L 100 265 C 96 274 94 280 98 288 L 114 292 L 120 270 L 120 248 C 115 248 105 240 100 230 Z" /></Zone>
      <Zone {...z("cadera_der","Cadera Derecha")}><path d="M 160 230 L 160 265 C 164 274 166 280 162 288 L 146 292 L 140 270 L 140 248 C 145 248 155 240 160 230 Z" /></Zone>
      <Zone {...z("muslo_izq","Muslo Izquierdo")}><path d="M 98 288 L 114 292 L 118 350 C 116 365 110 370 104 368 C 95 366 88 358 88 342 L 88 305 Z" /></Zone>
      <Zone {...z("muslo_der","Muslo Derecho")}><path d="M 162 288 L 146 292 L 142 350 C 144 365 150 370 156 368 C 165 366 172 358 172 342 L 172 305 Z" /></Zone>
      <Zone {...z("rodilla_izq","Rodilla Izquierda")}><ellipse cx="103" cy="378" rx="16" ry="12" /></Zone>
      <Zone {...z("rodilla_der","Rodilla Derecha")}><ellipse cx="157" cy="378" rx="16" ry="12" /></Zone>
      <Zone {...z("pierna_izq","Pierna Izquierda")}><path d="M 88 388 L 118 388 C 118 410 116 435 110 455 C 104 468 94 470 88 460 C 82 448 82 420 88 388 Z" /></Zone>
      <Zone {...z("pierna_der","Pierna Derecha")}><path d="M 172 388 L 142 388 C 142 410 144 435 150 455 C 156 468 166 470 172 460 C 178 448 178 420 172 388 Z" /></Zone>
      <Zone {...z("pie_izq","Pie Izquierdo")}><path d="M 82 460 C 78 470 76 484 80 494 C 88 506 108 508 122 500 C 128 494 126 482 120 474 L 88 460 Z" /></Zone>
      <Zone {...z("pie_der","Pie Derecho")}><path d="M 178 460 C 182 470 184 484 180 494 C 172 506 152 508 138 500 C 132 494 134 482 140 474 L 172 460 Z" /></Zone>
    </svg>
  );
}

/* ── Mini SVG Posterior (compact, 180×390) ── */
function MiniBodyPosterior({ marcas, selected, onClick, readOnly }: {
  marcas: Record<string, MarcaBodyMap>; selected: string | null;
  onClick?: (z: string, l: string, v: Vista) => void; readOnly?: boolean;
}) {
  const z = (id: string, lbl: string) => ({ zonaId: id, label: lbl, vista: "posterior" as Vista, marcas, selected, onClick, readOnly });
  return (
    <svg width="180" height="390" viewBox="0 0 260 560" xmlns="http://www.w3.org/2000/svg">
      <Zone {...z("cabeza_post","Cabeza (posterior)")}><ellipse cx="130" cy="42" rx="32" ry="38" /></Zone>
      <Zone {...z("cuello_post","Cuello (posterior)")}><rect x="115" y="79" width="30" height="22" rx="8" /></Zone>
      <Zone {...z("hombro_izq_post","Hombro Izq. (post.)")}><ellipse cx="91" cy="104" rx="24" ry="16" /></Zone>
      <Zone {...z("hombro_der_post","Hombro Der. (post.)")}><ellipse cx="169" cy="104" rx="24" ry="16" /></Zone>
      <Zone {...z("trapecios","Trapecios")}><path d="M 100 82 C 78 92 68 106 70 122 L 130 130 L 190 122 C 192 106 182 92 160 82 L 130 78 Z" /></Zone>
      <Zone {...z("espalda_alta","Espalda Alta")}><path d="M 78 138 C 72 145 70 158 70 170 L 70 200 L 190 200 L 190 170 C 190 158 188 145 182 138 L 130 130 Z" /></Zone>
      <Zone {...z("lumbar","Zona Lumbar")}><path d="M 78 200 L 78 248 C 80 260 92 270 130 272 C 168 270 180 260 182 248 L 182 200 Z" /></Zone>
      <Zone {...z("gluteo_izq","Glúteo Izquierdo")}><path d="M 78 248 C 70 260 68 278 72 295 L 110 300 L 118 275 L 118 272 C 100 272 84 264 78 248 Z" /></Zone>
      <Zone {...z("gluteo_der","Glúteo Derecho")}><path d="M 182 248 C 190 260 192 278 188 295 L 150 300 L 142 275 L 142 272 C 160 272 176 264 182 248 Z" /></Zone>
      <Zone {...z("isquio_izq","Isquiotibiales Izq.")}><path d="M 72 295 L 110 300 L 112 358 C 110 372 102 376 94 372 C 84 368 76 356 76 340 Z" /></Zone>
      <Zone {...z("isquio_der","Isquiotibiales Der.")}><path d="M 188 295 L 150 300 L 148 358 C 150 372 158 376 166 372 C 176 368 184 356 184 340 Z" /></Zone>
      <Zone {...z("rodilla_izq_post","Rodilla Izq. (post.)")}><ellipse cx="94" cy="382" rx="16" ry="12" /></Zone>
      <Zone {...z("rodilla_der_post","Rodilla Der. (post.)")}><ellipse cx="166" cy="382" rx="16" ry="12" /></Zone>
      <Zone {...z("gemelo_izq","Gemelo Izquierdo")}><path d="M 80 392 L 110 392 L 108 450 C 106 464 98 468 90 464 C 82 460 78 446 78 430 Z" /></Zone>
      <Zone {...z("gemelo_der","Gemelo Derecho")}><path d="M 180 392 L 150 392 L 152 450 C 154 464 162 468 170 464 C 178 460 182 446 182 430 Z" /></Zone>
      <Zone {...z("talon_izq","Talón Izquierdo")}><path d="M 78 462 C 74 472 72 486 76 496 C 84 508 104 510 116 502 L 114 462 L 78 462 Z" /></Zone>
      <Zone {...z("talon_der","Talón Derecho")}><path d="M 182 462 C 186 472 188 486 184 496 C 176 508 156 510 144 502 L 146 462 L 182 462 Z" /></Zone>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HISTORIAL TIMELINE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

function HistorialTimeline({
  snapshots,
  onSelect,
  snapshotActivo,
}: {
  snapshots: Snapshot[];
  onSelect: (s: Snapshot) => void;
  snapshotActivo: string | null;
}) {
  return (
    <div className="space-y-2 py-2">
      {snapshots.map((snap, i) => (
        <button
          key={snap.id}
          onClick={() => onSelect(snap)}
          className={`w-full text-left rounded-xl border p-3 transition-all duration-200 cursor-pointer relative ${
            snapshotActivo === snap.id
              ? "border-[#0891B2]/40 bg-[#0891B2]/5"
              : "border-cyan-100 bg-white hover:border-cyan-300 hover:bg-[#ECFEFF]/50"
          }`}
        >
          {/* Timeline line */}
          {i < snapshots.length - 1 && (
            <div className="absolute left-5 top-full h-2 w-0.5 bg-cyan-100" />
          )}
          <div className="flex items-start gap-2.5">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              snap.modo === "baseline"
                ? "bg-violet-100 text-violet-600"
                : "bg-[#0891B2]/10 text-[#0891B2]"
            }`}>
              {snap.modo === "baseline"
                ? <Scan className="h-3 w-3" />
                : <Activity className="h-3 w-3" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-[#164E63]">
                  {snap.modo === "baseline" ? "Evaluación Inicial" : `Sesión #${snap.sesion}`}
                </span>
                {snap.modo === "baseline" && (
                  <Badge className="text-[9px] px-1.5 h-4 bg-violet-100 text-violet-700 border-violet-200 font-bold">
                    BASELINE
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-[#164E63]/40 mt-0.5">{snap.fecha}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-[#164E63]/50">{Object.keys(snap.marcas).length} zonas</span>
                <span className="text-[10px] text-[#164E63]/30">·</span>
                <span className="text-[10px] font-medium" style={{
                  color: EVA_COLORS[Math.round(
                    Object.values(snap.marcas).reduce((s, m) => s + m.eva, 0) /
                    Math.max(Object.keys(snap.marcas).length, 1)
                  )]
                }}>
                  EVA prom. {(
                    Object.values(snap.marcas).reduce((s, m) => s + m.eva, 0) /
                    Math.max(Object.keys(snap.marcas).length, 1)
                  ).toFixed(1)}
                </span>
              </div>
            </div>
            {snapshotActivo === snap.id && (
              <div className="shrink-0 mt-1">
                <div className="h-2 w-2 rounded-full bg-[#0891B2] animate-pulse" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPARACION VIEW — baseline vs current side-by-side
   ═══════════════════════════════════════════════════════════════════ */

function ComparacionView({
  snapshotBase,
  snapshotActual,
}: {
  snapshotBase: Snapshot;
  snapshotActual: Record<string, MarcaBodyMap>;
}) {
  // Compute delta for each zona present in baseline
  const zonaKeys = Array.from(new Set([
    ...Object.keys(snapshotBase.marcas),
    ...Object.keys(snapshotActual),
  ]));

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 text-center">
          <Badge className="bg-violet-100 text-violet-700 border-violet-200 font-bold text-[10px] px-2">
            BASELINE — {snapshotBase.fecha}
          </Badge>
        </div>
        <GitCompareArrows className="h-4 w-4 text-[#164E63]/30 shrink-0" />
        <div className="flex-1 text-center">
          <Badge className="bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20 font-bold text-[10px] px-2">
            HOY — 24 feb 2026
          </Badge>
        </div>
      </div>

      {/* Side-by-side maps */}
      <div className="flex items-start justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] text-[#164E63]/40 font-semibold uppercase">Sesión 1</p>
          <MiniBodyPosterior marcas={snapshotBase.marcas} selected={null} readOnly />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] text-[#164E63]/40 font-semibold uppercase">Sesión 8</p>
          <MiniBodyPosterior marcas={snapshotActual} selected={null} readOnly />
        </div>
      </div>

      {/* Delta table */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-[#164E63]">Progreso por zona</p>
        {zonaKeys.map(key => {
          const antes = snapshotBase.marcas[key];
          const ahora = snapshotActual[key];
          if (!antes && !ahora) return null;
          const evaAntes = antes?.eva ?? 0;
          const evaAhora = ahora?.eva ?? 0;
          const delta = evaAhora - evaAntes;
          const label = antes?.label ?? ahora?.label ?? key;

          return (
            <div key={key} className="flex items-center gap-3 bg-white border border-cyan-100 rounded-xl px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#164E63] truncate">{label}</p>
                <p className="text-[10px] text-[#164E63]/40">{antes?.tipo ? TIPO_CONFIG[antes.tipo].label : ahora?.tipo ? TIPO_CONFIG[ahora.tipo].label : ""}</p>
              </div>
              {/* EVA antes */}
              <div className="text-center shrink-0">
                <p className="text-xs font-black tabular-nums" style={{ color: EVA_COLORS[Math.min(evaAntes, 10)] }}>{antes ? evaAntes : "—"}</p>
                <p className="text-[9px] text-[#164E63]/30">inicio</p>
              </div>
              {/* Arrow */}
              <ChevronRight className="h-3.5 w-3.5 text-[#164E63]/20 shrink-0" />
              {/* EVA ahora */}
              <div className="text-center shrink-0">
                <p className="text-xs font-black tabular-nums" style={{ color: EVA_COLORS[Math.min(evaAhora, 10)] }}>{ahora ? evaAhora : "—"}</p>
                <p className="text-[9px] text-[#164E63]/30">hoy</p>
              </div>
              {/* Delta badge */}
              {antes && ahora && (
                <Badge className={`text-[10px] px-1.5 h-5 font-bold shrink-0 ${
                  delta < 0
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : delta > 0
                    ? "bg-red-100 text-red-600 border-red-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}>
                  {delta < 0 ? `↓${Math.abs(delta)}` : delta > 0 ? `↑${delta}` : "="}
                </Badge>
              )}
              {!ahora && (
                <Badge className="text-[10px] px-1.5 h-5 font-bold shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200">
                  Resuelta
                </Badge>
              )}
              {!antes && (
                <Badge className="text-[10px] px-1.5 h-5 font-bold shrink-0 bg-orange-100 text-orange-600 border-orange-200">
                  Nueva
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN MODAL COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export function BodyMapModal({
  open,
  onClose,
  modo = "sesion",
  pacienteNombre = "Ana Flores Gutiérrez",
  pacienteIniciales = "AF",
  sesionNumero = 8,
}: BodyMapModalProps) {
  /* ── editor state ── */
  const [marcas, setMarcas] = useState<Record<string, MarcaBodyMap>>({ ...SNAPSHOT_S8 });
  const [vista, setVista] = useState<Vista>("anterior");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [guardadoFlash, setGuardadoFlash] = useState(false);
  const [tipoGlobal, setTipoGlobal] = useState<TipoHallazgo>("dolor");

  /* form state */
  const [formEva, setFormEva] = useState(5);
  const [formTipo, setFormTipo] = useState<TipoHallazgo>("dolor");
  const [formLat, setFormLat] = useState<Lateralidad>("bilateral");
  const [formNotas, setFormNotas] = useState("");
  const [formZona, setFormZona] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formVista, setFormVista] = useState<Vista>("anterior");

  /* ── panel state ── */
  type PanelTab = "editor" | "historial" | "comparacion";
  const [panelTab, setPanelTab] = useState<PanelTab>("editor");
  const [snapshotViendo, setSnapshotViendo] = useState<string | null>(null);
  const [historialOpen, setHistorialOpen] = useState(false);

  /* ── snapshots (mock) ── */
  const [snapshots, setSnapshots] = useState<Snapshot[]>(MOCK_SNAPSHOTS);

  const editing = selectedKey !== null && marcas[selectedKey] !== undefined;
  const marcasArr = Object.entries(marcas);
  const totalZonas = marcasArr.length;
  const evaPromedio = totalZonas > 0
    ? (marcasArr.reduce((s, [, m]) => s + m.eva, 0) / totalZonas).toFixed(1)
    : "—";

  /* ── handlers ── */
  const handleClickZona = useCallback((zonaId: string, label: string, v: Vista) => {
    const key = zonaId + "_" + v;
    const existing = marcas[key];
    setSelectedKey(key);
    setFormZona(zonaId);
    setFormLabel(label);
    setFormVista(v);
    setFormEva(existing?.eva ?? 5);
    setFormTipo(existing?.tipo ?? tipoGlobal);
    setFormLat(existing?.lateralidad ?? "bilateral");
    setFormNotas(existing?.notas ?? "");
    setPanelTab("editor");
  }, [marcas, tipoGlobal]);

  const handleSave = () => {
    if (!formZona) return;
    const key = formZona + "_" + formVista;
    setMarcas(prev => ({
      ...prev,
      [key]: {
        zona: formZona,
        label: formLabel,
        vista: formVista,
        eva: formEva,
        tipo: formTipo,
        lateralidad: formLat,
        notas: formNotas,
        color: TIPO_CONFIG[formTipo].color,
      },
    }));
    setSelectedKey(null);
    setGuardadoFlash(true);
    setTimeout(() => setGuardadoFlash(false), 2000);
  };

  const handleDelete = () => {
    if (!selectedKey) return;
    setMarcas(prev => {
      const next = { ...prev };
      delete next[selectedKey];
      return next;
    });
    setSelectedKey(null);
  };

  const resetPanel = () => setSelectedKey(null);

  const handleGuardarSnapshot = () => {
    const newSnap: Snapshot = {
      id: `snap-${Date.now()}`,
      fecha: "24 feb 2026",
      sesion: sesionNumero,
      modo: modo === "baseline" ? "baseline" : "sesion",
      marcas: { ...marcas },
    };
    setSnapshots(prev => [...prev, newSnap]);
    setGuardadoFlash(true);
    setTimeout(() => {
      setGuardadoFlash(false);
      onClose();
    }, 1200);
  };

  const modoConfig = {
    baseline: { label: "Evaluación Inicial", color: "bg-violet-100 text-violet-700 border-violet-200" },
    sesion:   { label: `Sesión #${sesionNumero}`, color: "bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20" },
    comparacion: { label: "Modo Comparación", color: "bg-amber-100 text-amber-700 border-amber-200" },
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 flex flex-col overflow-hidden border-cyan-100">
        {/* ── HEADER ── */}
        <DialogHeader className="px-4 py-3 border-b border-cyan-100 bg-white shrink-0 flex-row items-center gap-3 space-y-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-[#0891B2]/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#0891B2]">{pacienteIniciales}</span>
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-[#164E63] truncate leading-none">
                {pacienteNombre}
              </DialogTitle>
              <p className="text-[10px] text-[#164E63]/40 mt-0.5">Body Map · Actualizar hallazgos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`font-bold text-[10px] ${modoConfig[modo].color}`}>
              {modoConfig[modo].label}
            </Badge>
            {/* Tab switcher */}
            <div className="flex items-center gap-0.5 bg-[#ECFEFF] border border-cyan-100 rounded-lg p-0.5">
              {([
                { key: "editor",      label: "Editar",    icon: <MapPin className="h-3 w-3" /> },
                { key: "historial",   label: "Historial", icon: <Clock className="h-3 w-3" /> },
                { key: "comparacion", label: "Comparar",  icon: <GitCompareArrows className="h-3 w-3" /> },
              ] as { key: PanelTab; label: string; icon: React.ReactNode }[]).map(t => (
                <button
                  key={t.key}
                  onClick={() => { setPanelTab(t.key); setSelectedKey(null); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                    panelTab === t.key
                      ? "bg-[#0891B2] text-white shadow-sm"
                      : "text-[#164E63]/50 hover:text-[#164E63]"
                  }`}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* ── BODY ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ══ LEFT: Vista toggles + heatmap legend ══ */}
          <div className="hidden md:flex w-36 shrink-0 flex-col border-r border-cyan-100 bg-white p-3 gap-1 overflow-y-auto">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#164E63]/40 px-2 mb-1">Vistas</p>
            {(["anterior","posterior","lateral_der","lateral_izq"] as Vista[]).map(v => {
              const marcasEnVista = marcasArr.filter(([, m]) => m.vista === v).length;
              return (
                <button
                  key={v}
                  onClick={() => { setVista(v); resetPanel(); }}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 cursor-pointer w-full text-left border ${
                    vista === v
                      ? "bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20"
                      : "text-[#164E63]/60 hover:bg-cyan-50 border-transparent"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${vista === v ? "bg-[#0891B2]" : "bg-[#164E63]/20"}`} />
                  <span className="truncate">{VISTA_LABELS[v]}</span>
                  {marcasEnVista > 0 && (
                    <span className={`ml-auto text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center shrink-0 ${
                      vista === v ? "bg-[#0891B2]/20 text-[#0891B2]" : "bg-gray-100 text-[#164E63]/40"
                    }`}>{marcasEnVista}</span>
                  )}
                </button>
              );
            })}

            <hr className="border-cyan-100 my-1.5" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#164E63]/40 px-2 mb-1">Tipo activo</p>
            {(Object.entries(TIPO_CONFIG) as [TipoHallazgo, typeof TIPO_CONFIG.dolor][]).map(([tipo, cfg]) => (
              <button
                key={tipo}
                onClick={() => setTipoGlobal(tipo)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 cursor-pointer w-full text-left border ${
                  tipoGlobal === tipo ? "border-current" : "border-transparent text-[#164E63]/50 hover:bg-cyan-50"
                }`}
                style={tipoGlobal === tipo ? { color: cfg.color, background: cfg.color + "14", borderColor: cfg.color + "40" } : undefined}
              >
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                <span className="truncate">{cfg.label}</span>
              </button>
            ))}

            {/* Heatmap scale */}
            <hr className="border-cyan-100 my-1.5" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#164E63]/40 px-2 mb-1">Escala EVA</p>
            <div className="px-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-[#10B981] via-[#FCD34D] to-[#DC2626]" />
              <div className="flex justify-between mt-0.5">
                <span className="text-[8px] text-[#164E63]/30">0</span>
                <span className="text-[8px] text-[#164E63]/30">5</span>
                <span className="text-[8px] text-[#164E63]/30">10</span>
              </div>
            </div>
          </div>

          {/* ══ CENTER: SVG canvas ══ */}
          <div className="flex-1 flex flex-col items-center overflow-y-auto py-4 bg-[#ECFEFF] relative">
            {/* Mobile vista toggle */}
            <div className="flex gap-1 bg-white border border-cyan-100 rounded-xl p-1 mb-4 shadow-sm md:hidden">
              {(["anterior","posterior","lateral_der","lateral_izq"] as Vista[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setVista(v); resetPanel(); }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
                    vista === v ? "bg-[#0891B2] text-white shadow-sm" : "text-[#164E63]/50"
                  }`}
                >
                  {v === "anterior" ? "Ant" : v === "posterior" ? "Post" : v === "lateral_der" ? "LD" : "LI"}
                </button>
              ))}
            </div>

            {panelTab === "comparacion" ? (
              /* Comparacion: show baseline vs current side-by-side */
              <ComparacionView
                snapshotBase={snapshots[0]}
                snapshotActual={marcas}
              />
            ) : panelTab === "historial" ? (
              /* Historial: show snapshot SVGs */
              <div className="w-full max-w-xl px-4">
                <div className="flex items-center gap-2 mb-4">
                  <Scan className="h-4 w-4 text-[#0891B2]" />
                  <p className="text-sm font-bold text-[#164E63]">Historial de snapshots</p>
                  <Badge className="ml-auto bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20 text-[10px]">
                    {snapshots.length} registros
                  </Badge>
                </div>
                <div className="space-y-4">
                  {snapshots.map((snap) => (
                    <div key={snap.id} className="bg-white border border-cyan-100 rounded-2xl overflow-hidden">
                      <div className="px-4 py-3 flex items-center gap-2 border-b border-cyan-100">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                          snap.modo === "baseline" ? "bg-violet-100" : "bg-[#0891B2]/10"
                        }`}>
                          {snap.modo === "baseline"
                            ? <Scan className="h-3 w-3 text-violet-600" />
                            : <Activity className="h-3 w-3 text-[#0891B2]" />
                          }
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#164E63]">
                            {snap.modo === "baseline" ? "Evaluación Inicial (Baseline)" : `Sesión #${snap.sesion}`}
                          </p>
                          <p className="text-[10px] text-[#164E63]/40">{snap.fecha} · {Object.keys(snap.marcas).length} zonas</p>
                        </div>
                        <Badge className="ml-auto text-[10px] font-bold" style={{
                          background: EVA_COLORS[Math.round(
                            Object.values(snap.marcas).reduce((s, m) => s + m.eva, 0) / Math.max(Object.keys(snap.marcas).length, 1)
                          )] + "22",
                          color: EVA_COLORS[Math.round(
                            Object.values(snap.marcas).reduce((s, m) => s + m.eva, 0) / Math.max(Object.keys(snap.marcas).length, 1)
                          )],
                          borderColor: EVA_COLORS[Math.round(
                            Object.values(snap.marcas).reduce((s, m) => s + m.eva, 0) / Math.max(Object.keys(snap.marcas).length, 1)
                          )] + "44",
                        }}>
                          EVA {(Object.values(snap.marcas).reduce((s, m) => s + m.eva, 0) / Math.max(Object.keys(snap.marcas).length, 1)).toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-center py-3 bg-[#ECFEFF]/40">
                        <MiniBodyPosterior marcas={snap.marcas} selected={null} readOnly />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Editor mode: interactive SVG */
              <div style={{ filter: "drop-shadow(0 0 30px rgba(8,145,178,0.07))" }}>
                {vista === "anterior" && (
                  <MiniBodyAnterior marcas={marcas} selected={selectedKey} onClick={handleClickZona} />
                )}
                {vista === "posterior" && (
                  <MiniBodyPosterior marcas={marcas} selected={selectedKey} onClick={handleClickZona} />
                )}
                {vista === "lateral_der" && (
                  <MiniBodyAnterior marcas={marcas} selected={selectedKey} onClick={handleClickZona} />
                )}
                {vista === "lateral_izq" && (
                  <MiniBodyAnterior marcas={marcas} selected={selectedKey} onClick={handleClickZona} />
                )}
              </div>
            )}
          </div>

          {/* ══ RIGHT PANEL ══ */}
          {panelTab === "editor" && (
            <div className="hidden md:flex w-72 shrink-0 flex-col border-l border-cyan-100 bg-white overflow-y-auto">
              {/* Panel header */}
              <div className="px-4 py-3 border-b border-cyan-100">
                <p className="text-xs font-bold text-[#164E63]">
                  {selectedKey ? (editing ? "Editar hallazgo" : "Nuevo hallazgo") : "Hallazgos activos"}
                </p>
                <p className="text-[10px] text-[#164E63]/40 mt-0.5">
                  {selectedKey ? formLabel : `${totalZonas} zonas · EVA prom. ${evaPromedio}`}
                </p>
              </div>

              {/* Empty state */}
              {!selectedKey && totalZonas === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-[#0891B2]/10 flex items-center justify-center mb-3">
                    <MapPin className="h-5 w-5 text-[#0891B2]" />
                  </div>
                  <p className="text-xs font-semibold text-[#164E63]/60">Selecciona una zona</p>
                  <p className="text-[10px] text-[#164E63]/40 mt-1 leading-relaxed">Haz clic en cualquier zona del cuerpo para registrar un hallazgo</p>
                </div>
              )}

              {/* Edit form */}
              {selectedKey && (
                <div className="flex flex-col flex-1 overflow-y-auto">
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-sm font-bold text-[#164E63]">{formLabel}</p>
                    <p className="text-[10px] text-[#164E63]/40">{VISTA_LABELS[formVista]}</p>
                  </div>

                  {/* EVA */}
                  <div className="px-4 py-3 border-b border-cyan-100">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#164E63]/40 mb-2">Intensidad EVA</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black min-w-[44px] text-center tabular-nums" style={{ color: EVA_COLORS[formEva] }}>
                        {formEva}
                      </span>
                      <div className="flex-1">
                        <input
                          type="range" min="0" max="10" value={formEva}
                          onChange={e => setFormEva(Number(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{ background: "linear-gradient(to right, #10B981, #34D399, #FCD34D, #F97316, #EF4444)", accentColor: EVA_COLORS[formEva] }}
                        />
                        <div className="flex justify-between mt-0.5">
                          <span className="text-[8px] text-[#164E63]/30">0</span>
                          <span className="text-[8px] text-[#164E63]/30">10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tipo */}
                  <div className="px-4 py-3 border-b border-cyan-100">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#164E63]/40 mb-2">Tipo</p>
                    <div className="grid grid-cols-2 gap-1">
                      {(Object.entries(TIPO_CONFIG) as [TipoHallazgo, typeof TIPO_CONFIG.dolor][]).map(([tipo, cfg]) => (
                        <button
                          key={tipo}
                          onClick={() => setFormTipo(tipo)}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                            formTipo === tipo ? "text-white" : "text-[#164E63]/50 border-cyan-100 hover:bg-cyan-50"
                          }`}
                          style={formTipo === tipo ? { background: cfg.color, borderColor: cfg.color } : undefined}
                        >
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: formTipo === tipo ? "white" : cfg.color }} />
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lateralidad */}
                  <div className="px-4 py-3 border-b border-cyan-100">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#164E63]/40 mb-2">Lateralidad</p>
                    <div className="grid grid-cols-3 gap-1">
                      {(["bilateral","izquierdo","derecho"] as Lateralidad[]).map(lat => (
                        <button
                          key={lat}
                          onClick={() => setFormLat(lat)}
                          className={`py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer capitalize ${
                            formLat === lat ? "bg-[#0891B2]/10 border-[#0891B2]/30 text-[#0891B2]" : "border-cyan-100 text-[#164E63]/50 hover:bg-cyan-50"
                          }`}
                        >
                          {lat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notas */}
                  <div className="px-4 py-3 border-b border-cyan-100">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#164E63]/40 mb-2">Notas clínicas</p>
                    <textarea
                      value={formNotas}
                      onChange={e => setFormNotas(e.target.value)}
                      placeholder="Describe la evolución de este hallazgo..."
                      rows={3}
                      className="w-full rounded-lg border border-cyan-100 bg-[#ECFEFF]/50 px-3 py-2 text-[12px] text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-[#0891B2]/40 resize-none transition-all duration-200"
                    />
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 space-y-1.5 mt-auto">
                    <Button className="w-full bg-[#059669] hover:bg-[#059669]/90 text-white cursor-pointer transition-all duration-200 text-xs font-bold" onClick={handleSave}>
                      <Check className="h-3.5 w-3.5 mr-1.5" />Guardar hallazgo
                    </Button>
                    {editing && (
                      <Button variant="outline" className="w-full border-red-200 text-[#EF4444] hover:bg-red-50 cursor-pointer transition-all duration-200 text-xs" onClick={handleDelete}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />Eliminar zona
                      </Button>
                    )}
                    <Button variant="ghost" className="w-full text-[#164E63]/40 cursor-pointer transition-all duration-200 text-xs" onClick={resetPanel}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Marcas list */}
              {!selectedKey && totalZonas > 0 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div
                    className="px-4 py-2.5 border-b border-cyan-100 flex items-center gap-1.5 cursor-pointer hover:bg-cyan-50 transition-colors"
                    onClick={() => setHistorialOpen(!historialOpen)}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#164E63]/40 flex-1">
                      {totalZonas} hallazgo{totalZonas !== 1 ? "s" : ""} registrado{totalZonas !== 1 ? "s" : ""}
                    </p>
                    {historialOpen ? <ChevronDown className="h-3 w-3 text-[#164E63]/30" /> : <ChevronRight className="h-3 w-3 text-[#164E63]/30" />}
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                    {marcasArr.map(([key, m]) => (
                      <button
                        key={key}
                        onClick={() => handleClickZona(m.zona, m.label, m.vista)}
                        className="w-full text-left rounded-xl border border-cyan-100 bg-white hover:border-[#0891B2]/30 p-2.5 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: m.color }} />
                          <span className="text-[12px] font-bold text-[#164E63] flex-1 truncate">{m.label}</span>
                          <span className="text-base font-black tabular-nums" style={{ color: m.color }}>{m.eva}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#164E63]/40">
                          <Eye className="h-2.5 w-2.5" />
                          <span>{VISTA_LABELS[m.vista]}</span>
                          <span>·</span>
                          <span>{TIPO_CONFIG[m.tipo].label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 px-4 py-3 border-t border-cyan-100 shrink-0">
                    <div className="text-center">
                      <p className="text-lg font-black text-[#0891B2]">{totalZonas}</p>
                      <p className="text-[8px] uppercase tracking-wider text-[#164E63]/40">Zonas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-[#EF4444]">{evaPromedio}</p>
                      <p className="text-[8px] uppercase tracking-wider text-[#164E63]/40">EVA prom.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RIGHT PANEL: Historial list */}
          {panelTab === "historial" && (
            <div className="hidden md:flex w-72 shrink-0 flex-col border-l border-cyan-100 bg-white overflow-y-auto">
              <div className="px-4 py-3 border-b border-cyan-100">
                <p className="text-xs font-bold text-[#164E63]">Snapshots guardados</p>
                <p className="text-[10px] text-[#164E63]/40 mt-0.5">{snapshots.length} registros históricos</p>
              </div>
              <div className="px-3 py-2 flex-1 overflow-y-auto">
                <HistorialTimeline
                  snapshots={snapshots}
                  onSelect={(s) => setSnapshotViendo(s.id)}
                  snapshotActivo={snapshotViendo}
                />
              </div>
            </div>
          )}

          {/* RIGHT PANEL: Comparacion summary */}
          {panelTab === "comparacion" && (
            <div className="hidden md:flex w-72 shrink-0 flex-col border-l border-cyan-100 bg-white overflow-y-auto">
              <div className="px-4 py-3 border-b border-cyan-100">
                <p className="text-xs font-bold text-[#164E63]">Comparando</p>
                <p className="text-[10px] text-[#164E63]/40 mt-0.5">Sesión 1 → Sesión 8</p>
              </div>
              <div className="px-4 py-3 flex flex-col gap-2">
                {/* Overall progress */}
                {Object.keys(snapshots[0]?.marcas ?? {}).map(key => {
                  const antes = snapshots[0].marcas[key];
                  const ahora = marcas[key];
                  if (!antes) return null;
                  const delta = (ahora?.eva ?? 0) - antes.eva;
                  return (
                    <div key={key} className="flex items-center gap-2 bg-white border border-cyan-100 rounded-xl px-3 py-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: antes.color }} />
                      <span className="text-[11px] font-semibold text-[#164E63] flex-1 truncate">{antes.label}</span>
                      <span className="text-xs font-black tabular-nums" style={{ color: EVA_COLORS[Math.min(antes.eva, 10)] }}>{antes.eva}</span>
                      <ChevronRight className="h-3 w-3 text-[#164E63]/20" />
                      <span className="text-xs font-black tabular-nums" style={{ color: ahora ? EVA_COLORS[Math.min(ahora.eva, 10)] : "#10B981" }}>
                        {ahora ? ahora.eva : "—"}
                      </span>
                      {ahora ? (
                        <Badge className={`text-[9px] px-1 h-4 font-bold ${delta < 0 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : delta > 0 ? "bg-red-100 text-red-600 border-red-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          {delta < 0 ? `↓${Math.abs(delta)}` : delta > 0 ? `↑${delta}` : "="}
                        </Badge>
                      ) : (
                        <Badge className="text-[9px] px-1 h-4 font-bold bg-emerald-100 text-emerald-700 border-emerald-200">✓</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="px-4 py-3 border-t border-cyan-100 bg-white shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-[#164E63]/40">
            <Activity className="h-3.5 w-3.5" />
            <span>{totalZonas} zonas · EVA promedio <strong style={{ color: EVA_COLORS[Math.round(Number(evaPromedio) || 0)] }}>{evaPromedio}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 transition-all duration-200 text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarSnapshot}
              className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 text-xs font-bold gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Guardar Snapshot
            </Button>
          </div>
        </div>

        {/* ── SAVE FLASH ── */}
        {guardadoFlash && (
          <div className="absolute top-16 right-4 z-50 bg-[#059669] text-white px-4 py-2.5 rounded-xl shadow-lg font-bold text-xs flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />Snapshot guardado
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
