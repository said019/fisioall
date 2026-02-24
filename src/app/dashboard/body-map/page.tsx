"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Trash2,
  Download,
  Save,
  Check,
  X,
  MapPin,
  Activity,
  Eye,
  Flame,
  Zap,
  Move,
  Hand,
  Minus,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type Vista = "anterior" | "posterior" | "lateral_der" | "lateral_izq";
type TipoHallazgo = "dolor" | "inflamacion" | "contractura" | "limitacion" | "parestesia" | "tension";
type Lateralidad = "bilateral" | "izquierdo" | "derecho";

interface Marca {
  zona: string;
  label: string;
  vista: Vista;
  eva: number;
  tipo: TipoHallazgo;
  lateralidad: Lateralidad;
  notas: string;
  color: string;
}

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const TIPO_CONFIG: Record<TipoHallazgo, { label: string; color: string; icon: React.ReactNode }> = {
  dolor:        { label: "Dolor",          color: "#EF4444", icon: <Flame className="h-3.5 w-3.5" /> },
  inflamacion:  { label: "Inflamación",    color: "#8B5CF6", icon: <Zap className="h-3.5 w-3.5" /> },
  contractura:  { label: "Contractura",    color: "#F59E0B", icon: <Activity className="h-3.5 w-3.5" /> },
  limitacion:   { label: "Limitación ROM", color: "#06B6D4", icon: <Move className="h-3.5 w-3.5" /> },
  parestesia:   { label: "Parestesia",     color: "#10B981", icon: <Hand className="h-3.5 w-3.5" /> },
  tension:      { label: "Tensión muscular", color: "#F97316", icon: <Minus className="h-3.5 w-3.5" /> },
};

const VISTA_LABELS: Record<Vista, { short: string; full: string }> = {
  anterior:    { short: "Ant.",   full: "Vista anterior" },
  posterior:   { short: "Post.",  full: "Vista posterior" },
  lateral_der: { short: "Lat.D", full: "Lateral derecho" },
  lateral_izq: { short: "Lat.I", full: "Lateral izquierdo" },
};

const EVA_COLORS = [
  "#10B981","#10B981","#10B981","#34D399","#FCD34D",
  "#F59E0B","#F97316","#EF4444","#DC2626","#B91C1C","#7F1D1D",
];

/* heat-map fill+stroke por intensidad */
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
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════ */

const INITIAL_MARCAS: Record<string, Marca> = {
  lumbar_posterior: {
    zona: "lumbar", label: "Zona Lumbar (L1-L5)", vista: "posterior",
    eva: 8, tipo: "dolor", lateralidad: "bilateral",
    notas: "Dolor irradiado hacia glúteo izq. al estar sentado más de 30 min. Peor por las mañanas.",
    color: "#EF4444",
  },
  rodilla_izq_anterior: {
    zona: "rodilla_izq", label: "Rodilla Izquierda", vista: "anterior",
    eva: 5, tipo: "inflamacion", lateralidad: "izquierdo",
    notas: "Inflamación visible al palpar. ROM limitado a 110°.",
    color: "#8B5CF6",
  },
  trapecios_posterior: {
    zona: "trapecios", label: "Trapecios", vista: "posterior",
    eva: 4, tipo: "contractura", lateralidad: "bilateral",
    notas: "Contractura bilateral, peor al lado derecho.",
    color: "#F59E0B",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   SVG ZONE DEFINITIONS
   Each zona: { id, svgId, label, element }
   ═══════════════════════════════════════════════════════════════════ */

interface ZonaDef {
  id: string;
  label: string;
}

/* Re-usable SVG props for a zona */
function zonaBaseStyle(
  marcas: Record<string, Marca>,
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
    filter: isSelected ? "drop-shadow(0 0 8px rgba(255,255,255,0.3))" : m && m.eva >= 10 ? "drop-shadow(0 0 10px rgba(239,68,68,0.6))" : undefined,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   SVG BODY VIEWS
   ═══════════════════════════════════════════════════════════════════ */

/* Helper: each body zone is a clickable SVG element */
interface ZoneProps {
  zonaId: string;
  label: string;
  vista: Vista;
  marcas: Record<string, Marca>;
  selected: string | null;
  onClick: (zonaId: string, label: string, vista: Vista) => void;
  children: React.ReactNode;
}

function Zone({ zonaId, label, vista, marcas, selected, onClick, children }: ZoneProps) {
  const style = zonaBaseStyle(marcas, zonaId, vista, selected);
  return (
    <g
      className="cursor-pointer"
      style={style}
      onClick={() => onClick(zonaId, label, vista)}
    >
      {children}
    </g>
  );
}

/* ── ANTERIOR VIEW ── */
function BodyAnterior({ marcas, selected, onClick }: { marcas: Record<string, Marca>; selected: string | null; onClick: (z: string, l: string, v: Vista) => void }) {
  const z = (id: string, label: string) => ({ zonaId: id, label, vista: "anterior" as Vista, marcas, selected, onClick });
  return (
    <svg width="260" height="560" viewBox="0 0 260 560" xmlns="http://www.w3.org/2000/svg">
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
      <Zone {...z("rodilla_izq","Rodilla Izquierda")}><ellipse cx="104" cy="375" rx="18" ry="14" /></Zone>
      <Zone {...z("rodilla_der","Rodilla Derecha")}><ellipse cx="156" cy="375" rx="18" ry="14" /></Zone>
      <Zone {...z("tibia_izq","Tibia / Pantorrilla Izq.")}><path d="M 90 386 L 104 389 L 110 440 C 108 455 100 460 93 456 C 84 450 80 438 82 424 L 82 400 Z" /></Zone>
      <Zone {...z("tibia_der","Tibia / Pantorrilla Der.")}><path d="M 170 386 L 156 389 L 150 440 C 152 455 160 460 167 456 C 176 450 180 438 178 424 L 178 400 Z" /></Zone>
      <Zone {...z("tobillo_izq","Tobillo Izquierdo")}><ellipse cx="92" cy="463" rx="14" ry="10" /></Zone>
      <Zone {...z("tobillo_der","Tobillo Derecho")}><ellipse cx="168" cy="463" rx="14" ry="10" /></Zone>
      <Zone {...z("pie_izq","Pie Izquierdo")}><path d="M 78 470 C 76 478 76 490 82 498 C 90 510 110 514 118 504 C 120 500 120 490 116 482 L 106 470 L 78 470 Z" /></Zone>
      <Zone {...z("pie_der","Pie Derecho")}><path d="M 182 470 C 184 478 184 490 178 498 C 170 510 150 514 142 504 C 140 500 140 490 144 482 L 154 470 L 182 470 Z" /></Zone>
      <text x="130" y="545" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600">VISTA ANTERIOR</text>
    </svg>
  );
}

/* ── POSTERIOR VIEW ── */
function BodyPosterior({ marcas, selected, onClick }: { marcas: Record<string, Marca>; selected: string | null; onClick: (z: string, l: string, v: Vista) => void }) {
  const z = (id: string, label: string) => ({ zonaId: id, label, vista: "posterior" as Vista, marcas, selected, onClick });
  return (
    <svg width="260" height="560" viewBox="0 0 260 560" xmlns="http://www.w3.org/2000/svg">
      <Zone {...z("cabeza","Cabeza / Nuca")}><ellipse cx="130" cy="42" rx="32" ry="38" /></Zone>
      <Zone {...z("cuello_post","Cuello Posterior")}><rect x="115" y="79" width="30" height="22" rx="8" /></Zone>
      <Zone {...z("trapecios","Trapecios")}><path d="M 115 82 C 98 88 78 100 72 115 L 188 115 C 182 100 162 88 145 82 Z" /></Zone>
      <Zone {...z("escapula_izq","Escápula Izquierda")}><path d="M 75 118 C 72 130 72 148 78 162 L 100 165 L 100 118 Z" /></Zone>
      <Zone {...z("escapula_der","Escápula Derecha")}><path d="M 185 118 C 188 130 188 148 182 162 L 160 165 L 160 118 Z" /></Zone>
      <Zone {...z("col_dorsal","Columna Dorsal")}><rect x="118" y="115" width="24" height="70" rx="5" /></Zone>
      <Zone {...z("lumbar","Zona Lumbar (L1-L5)")}><path d="M 103 185 L 157 185 L 160 230 C 155 248 145 258 130 258 C 115 258 105 248 100 230 Z" /></Zone>
      <Zone {...z("sacro","Sacro / Cóccix")}><ellipse cx="130" cy="268" rx="20" ry="14" /></Zone>
      <Zone {...z("gluteo_izq","Glúteo Izquierdo")}><path d="M 100 255 C 90 265 82 285 84 308 L 102 312 L 116 295 L 120 260 C 115 258 105 258 100 255 Z" /></Zone>
      <Zone {...z("gluteo_der","Glúteo Derecho")}><path d="M 160 255 C 170 265 178 285 176 308 L 158 312 L 144 295 L 140 260 C 145 258 155 258 160 255 Z" /></Zone>
      <Zone {...z("isquio_izq","Isquiotibiales Izq.")}><path d="M 84 315 L 102 315 L 108 370 C 106 385 98 390 90 386 C 80 382 76 370 78 355 L 78 330 Z" /></Zone>
      <Zone {...z("isquio_der","Isquiotibiales Der.")}><path d="M 176 315 L 158 315 L 152 370 C 154 385 162 390 170 386 C 180 382 184 370 182 355 L 182 330 Z" /></Zone>
      <Zone {...z("pantorrilla_izq","Pantorrilla Izquierda")}><path d="M 80 392 L 108 392 C 112 410 112 438 108 455 C 100 465 88 462 82 452 C 76 440 76 418 80 392 Z" /></Zone>
      <Zone {...z("pantorrilla_der","Pantorrilla Derecha")}><path d="M 180 392 L 152 392 C 148 410 148 438 152 455 C 160 465 172 462 178 452 C 184 440 184 418 180 392 Z" /></Zone>
      <Zone {...z("hombro_izq_post","Hombro Izq. Posterior")}><ellipse cx="72" cy="115" rx="22" ry="15" /></Zone>
      <Zone {...z("hombro_der_post","Hombro Der. Posterior")}><ellipse cx="188" cy="115" rx="22" ry="15" /></Zone>
      <Zone {...z("brazo_post_izq","Brazo Post. Izq.")}><path d="M 50 124 C 38 138 34 158 36 178 L 56 186 L 68 174 L 70 148 C 64 132 56 124 50 124 Z" /></Zone>
      <Zone {...z("brazo_post_der","Brazo Post. Der.")}><path d="M 210 124 C 222 138 226 158 224 178 L 204 186 L 192 174 L 190 148 C 196 132 204 124 210 124 Z" /></Zone>
      <Zone {...z("talon_izq","Talón Izquierdo")}><ellipse cx="92" cy="475" rx="14" ry="12" /></Zone>
      <Zone {...z("talon_der","Talón Derecho")}><ellipse cx="168" cy="475" rx="14" ry="12" /></Zone>
      <text x="130" y="545" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600">VISTA POSTERIOR</text>
    </svg>
  );
}

/* ── LATERAL DER VIEW ── */
function BodyLateralDer({ marcas, selected, onClick }: { marcas: Record<string, Marca>; selected: string | null; onClick: (z: string, l: string, v: Vista) => void }) {
  const z = (id: string, label: string) => ({ zonaId: id, label, vista: "lateral_der" as Vista, marcas, selected, onClick });
  return (
    <svg width="260" height="560" viewBox="0 0 260 560" xmlns="http://www.w3.org/2000/svg">
      <Zone {...z("cabeza","Cabeza (lateral)")}><ellipse cx="138" cy="42" rx="30" ry="36" /></Zone>
      <Zone {...z("cervical","Columna Cervical")}><path d="M 130 76 C 122 82 118 92 118 106 L 132 110 L 148 106 C 148 92 144 82 138 76 Z" /></Zone>
      <Zone {...z("torax","Tórax / Costillas")}><path d="M 110 108 C 88 118 78 140 78 170 L 78 210 L 148 210 L 152 170 C 152 140 142 118 138 108 L 110 108 Z" /></Zone>
      <Zone {...z("lumbar","Zona Lumbar")}><path d="M 120 208 C 110 218 108 238 112 258 L 140 262 L 152 258 C 156 238 152 218 148 208 L 120 208 Z" /></Zone>
      <Zone {...z("cadera_lat","Cadera / Trocánter")}><path d="M 112 258 C 100 268 90 290 92 315 L 120 320 L 148 315 C 150 290 145 268 140 262 L 112 258 Z" /></Zone>
      <Zone {...z("cuadriceps_lat","Cuádriceps (lateral)")}><path d="M 95 320 L 125 325 L 128 380 C 126 394 118 398 110 394 C 100 390 92 378 92 362 L 92 338 Z" /></Zone>
      <Zone {...z("rodilla_lat","Rodilla (lateral)")}><ellipse cx="112" cy="400" rx="20" ry="14" /></Zone>
      <Zone {...z("pierna_lat","Pierna (lateral)")}><path d="M 93 412 L 128 412 C 130 435 128 460 120 476 C 112 484 100 482 94 472 C 88 460 88 438 93 412 Z" /></Zone>
      <Zone {...z("pie_lat","Pie (lateral)")}><path d="M 88 476 C 84 486 82 500 86 510 C 96 522 118 524 134 514 C 140 508 140 498 136 488 L 118 476 L 88 476 Z" /></Zone>
      <text x="130" y="545" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600">LATERAL DERECHO</text>
    </svg>
  );
}

/* ── LATERAL IZQ VIEW (mirrored) ── */
function BodyLateralIzq({ marcas, selected, onClick }: { marcas: Record<string, Marca>; selected: string | null; onClick: (z: string, l: string, v: Vista) => void }) {
  const z = (id: string, label: string) => ({ zonaId: id, label, vista: "lateral_izq" as Vista, marcas, selected, onClick });
  return (
    <svg width="260" height="560" viewBox="0 0 260 560" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(260,0) scale(-1,1)">
        <Zone {...z("cabeza","Cabeza (lateral izq.)")}><ellipse cx="138" cy="42" rx="30" ry="36" /></Zone>
        <Zone {...z("cervical","Columna Cervical")}><path d="M 130 76 C 122 82 118 92 118 106 L 132 110 L 148 106 C 148 92 144 82 138 76 Z" /></Zone>
        <Zone {...z("torax","Tórax / Costillas")}><path d="M 110 108 C 88 118 78 140 78 170 L 78 210 L 148 210 L 152 170 C 152 140 142 118 138 108 L 110 108 Z" /></Zone>
        <Zone {...z("lumbar","Zona Lumbar")}><path d="M 120 208 C 110 218 108 238 112 258 L 140 262 L 152 258 C 156 238 152 218 148 208 L 120 208 Z" /></Zone>
        <Zone {...z("cadera_lat","Cadera / Trocánter")}><path d="M 112 258 C 100 268 90 290 92 315 L 120 320 L 148 315 C 150 290 145 268 140 262 L 112 258 Z" /></Zone>
        <Zone {...z("cuadriceps_lat","Cuádriceps (lateral)")}><path d="M 95 320 L 125 325 L 128 380 C 126 394 118 398 110 394 C 100 390 92 378 92 362 L 92 338 Z" /></Zone>
        <Zone {...z("rodilla_lat","Rodilla (lateral)")}><ellipse cx="112" cy="400" rx="20" ry="14" /></Zone>
        <Zone {...z("pierna_lat","Pierna (lateral)")}><path d="M 93 412 L 128 412 C 130 435 128 460 120 476 C 112 484 100 482 94 472 C 88 460 88 438 93 412 Z" /></Zone>
        <Zone {...z("pie_lat","Pie (lateral)")}><path d="M 88 476 C 84 486 82 500 86 510 C 96 522 118 524 134 514 C 140 508 140 498 136 488 L 118 476 L 88 476 Z" /></Zone>
        <text x="130" y="545" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600" transform="scale(-1,1) translate(-260,0)">LATERAL IZQUIERDO</text>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function BodyMapPage() {
  /* ── state ── */
  const [marcas, setMarcas] = useState<Record<string, Marca>>(INITIAL_MARCAS);
  const [vista, setVista] = useState<Vista>("anterior");
  const [tipoGlobal, setTipoGlobal] = useState<TipoHallazgo>("dolor");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [guardadoFlash, setGuardadoFlash] = useState(false);

  /* form state */
  const [formEva, setFormEva] = useState(5);
  const [formTipo, setFormTipo] = useState<TipoHallazgo>("dolor");
  const [formLat, setFormLat] = useState<Lateralidad>("bilateral");
  const [formNotas, setFormNotas] = useState("");
  const [formZona, setFormZona] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formVista, setFormVista] = useState<Vista>("anterior");

  const editing = selectedKey !== null && marcas[selectedKey] !== undefined;

  /* ── derived ── */
  const marcasArr = Object.entries(marcas);
  const totalZonas = marcasArr.length;
  const evaPromedio = totalZonas > 0 ? (marcasArr.reduce((s, [, m]) => s + m.eva, 0) / totalZonas).toFixed(1) : "—";
  const countByVista = (v: Vista) => marcasArr.filter(([, m]) => m.vista === v).length;

  /* ── handlers ── */
  const handleClickZona = useCallback((zonaId: string, label: string, v: Vista) => {
    const key = zonaId + "_" + v;
    const existing = marcas[key];
    setSelectedKey(key);
    setFormZona(zonaId);
    setFormLabel(label);
    setFormVista(v);
    setFormEva(existing ? existing.eva : 5);
    setFormTipo(existing ? existing.tipo : tipoGlobal);
    setFormLat(existing ? existing.lateralidad : "bilateral");
    setFormNotas(existing ? existing.notas : "");
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

  const handleClearAll = () => {
    setMarcas({});
    setSelectedKey(null);
  };

  const handleExport = () => {
    const data = {
      paciente: "María González López",
      sesion: 8,
      fecha: "2026-02-24",
      marcas: Object.values(marcas),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bodymap_sesion8.json";
    a.click();
  };

  const resetPanel = () => setSelectedKey(null);

  /* ── render ── */
  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] -m-4 sm:-m-6">

      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-cyan-100 bg-white shrink-0">
        <Link href="/dashboard/pacientes" className="cursor-pointer">
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer hover:bg-cyan-50 transition-all duration-200">
            <ArrowLeft className="h-4 w-4 text-[#164E63]" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-9 w-9 border-2 border-[#0891B2]/30 shrink-0">
            <AvatarFallback className="bg-[#0891B2]/15 text-[#0891B2] text-sm font-bold">MG</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#164E63] truncate">María González López</p>
            <p className="text-[11px] text-[#164E63]/50">Sesión #8 · Lun 24 Feb 2026</p>
          </div>
        </div>
        <Badge className="bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20 font-semibold text-xs shrink-0">
          <Activity className="h-3 w-3 mr-1" />Body Map Pro
        </Badge>
      </div>

      {/* ── MAIN LAYOUT: sidebar + canvas + panel ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══ LEFT SIDEBAR ══ */}
        <div className="hidden lg:flex w-56 shrink-0 flex-col border-r border-cyan-100 bg-white p-4 gap-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#164E63]/40 px-2 mb-1">Vistas</p>
          {(["anterior","posterior","lateral_der","lateral_izq"] as Vista[]).map(v => (
            <button
              key={v}
              onClick={() => { setVista(v); resetPanel(); }}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 cursor-pointer w-full text-left ${
                vista === v
                  ? "bg-[#0891B2]/10 text-[#0891B2] border border-[#0891B2]/20"
                  : "text-[#164E63]/60 hover:bg-cyan-50 hover:text-[#164E63] border border-transparent"
              }`}
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${vista === v ? "bg-[#0891B2]" : "bg-[#164E63]/30"}`} />
              {VISTA_LABELS[v].full}
              <Badge variant="outline" className={`ml-auto text-[10px] px-1.5 h-5 ${
                vista === v ? "bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/25" : "text-[#164E63]/40 border-cyan-200"
              }`}>
                {countByVista(v)}
              </Badge>
            </button>
          ))}

          <hr className="border-cyan-100 my-2" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#164E63]/40 px-2 mb-1">Tipo de hallazgo</p>
          {(Object.entries(TIPO_CONFIG) as [TipoHallazgo, typeof TIPO_CONFIG.dolor][]).map(([tipo, cfg]) => (
            <button
              key={tipo}
              onClick={() => setTipoGlobal(tipo)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 cursor-pointer w-full text-left border ${
                tipoGlobal === tipo
                  ? "border-current"
                  : "border-transparent text-[#164E63]/50 hover:bg-cyan-50"
              }`}
              style={tipoGlobal === tipo ? { color: cfg.color, background: cfg.color + "14", borderColor: cfg.color + "40" } : undefined}
            >
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: cfg.color }} />
              {cfg.label}
            </button>
          ))}

          <hr className="border-cyan-100 my-2" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#164E63]/40 px-2 mb-1">Acciones</p>
          <button onClick={handleClearAll} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-[#EF4444] hover:bg-red-50 transition-all duration-200 cursor-pointer w-full text-left">
            <Trash2 className="h-3.5 w-3.5" />Limpiar todo
          </button>
          <button onClick={handleExport} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-[#164E63]/60 hover:bg-cyan-50 transition-all duration-200 cursor-pointer w-full text-left">
            <Download className="h-3.5 w-3.5" />Exportar datos
          </button>
        </div>

        {/* ══ CENTER CANVAS ══ */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto py-6 px-4 bg-[#ECFEFF] relative">
          {/* Glow bg */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#0891B2]/[0.04] blur-3xl pointer-events-none" />

          {/* Vista toggle (mobile + always visible) */}
          <div className="flex gap-1 bg-white border border-cyan-100 rounded-xl p-1 mb-5 shadow-sm relative z-10">
            {(["anterior","posterior","lateral_der","lateral_izq"] as Vista[]).map(v => (
              <button
                key={v}
                onClick={() => { setVista(v); resetPanel(); }}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                  vista === v
                    ? "bg-[#ECFEFF] text-[#0891B2] border border-[#0891B2]/20 shadow-sm"
                    : "text-[#164E63]/50 hover:text-[#164E63]"
                }`}
              >
                {v === "anterior" ? "Anterior" : v === "posterior" ? "Posterior" : v === "lateral_der" ? "Lateral D" : "Lateral I"}
              </button>
            ))}
          </div>

          {/* Heatmap legend */}
          <div className="flex items-center gap-3 bg-white border border-cyan-100 rounded-xl px-4 py-2.5 mb-5 shadow-sm max-w-xs w-full relative z-10">
            <span className="text-[10px] font-semibold text-[#164E63]/50 whitespace-nowrap">Sin dolor</span>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-gradient-to-r from-[#10B981] via-[#FCD34D] to-[#DC2626]" />
              <div className="flex justify-between mt-0.5">
                {[0,2,4,6,8,10].map(n => (
                  <span key={n} className="text-[8px] text-[#164E63]/30">{n}</span>
                ))}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-[#164E63]/50 whitespace-nowrap">Máximo</span>
          </div>

          {/* SVG body */}
          <div className="relative z-10" style={{ filter: "drop-shadow(0 0 40px rgba(8,145,178,0.08))" }}>
            {vista === "anterior" && <BodyAnterior marcas={marcas} selected={selectedKey} onClick={handleClickZona} />}
            {vista === "posterior" && <BodyPosterior marcas={marcas} selected={selectedKey} onClick={handleClickZona} />}
            {vista === "lateral_der" && <BodyLateralDer marcas={marcas} selected={selectedKey} onClick={handleClickZona} />}
            {vista === "lateral_izq" && <BodyLateralIzq marcas={marcas} selected={selectedKey} onClick={handleClickZona} />}
          </div>

          {/* Mobile: actions row */}
          <div className="flex gap-2 mt-4 lg:hidden relative z-10">
            <Button variant="outline" size="sm" className="border-cyan-200 text-[#164E63]/60 cursor-pointer text-xs transition-all duration-200" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1" />Exportar
            </Button>
            <Button variant="outline" size="sm" className="border-red-200 text-[#EF4444] cursor-pointer text-xs transition-all duration-200" onClick={handleClearAll}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />Limpiar
            </Button>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="hidden md:flex w-80 shrink-0 flex-col border-l border-cyan-100 bg-white overflow-y-auto">

          {/* Panel header */}
          <div className="px-5 py-4 border-b border-cyan-100">
            <p className="text-sm font-bold text-[#164E63]">
              {selectedKey ? (editing ? "Editar hallazgo" : "Nuevo hallazgo") : "Hallazgos"}
            </p>
            <p className="text-[11px] text-[#164E63]/50 mt-0.5">
              {selectedKey ? formLabel : `${totalZonas} registros`}
            </p>
          </div>

          {/* ── No selection state ── */}
          {!selectedKey && totalZonas === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[#0891B2]/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-[#0891B2]" />
              </div>
              <p className="text-sm font-semibold text-[#164E63]/70 mb-1">Selecciona una zona</p>
              <p className="text-xs text-[#164E63]/40 leading-relaxed">Haz click en cualquier área anatómica para registrar dolor, inflamación o contractura</p>
            </div>
          )}

          {/* ── Edit form ── */}
          {selectedKey && (
            <div className="flex flex-col flex-1">
              {/* Zone name */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-base font-bold text-[#164E63]">{formLabel}</p>
                <p className="text-[11px] text-[#164E63]/40">{VISTA_LABELS[formVista].full}</p>
              </div>

              {/* EVA slider */}
              <div className="px-5 py-4 border-b border-cyan-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#164E63]/40 mb-3">Intensidad EVA</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black min-w-[56px] text-center tabular-nums leading-none" style={{ color: EVA_COLORS[formEva] }}>
                    {formEva}
                  </span>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formEva}
                      onChange={e => setFormEva(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: "linear-gradient(to right, #10B981, #34D399, #FCD34D, #F97316, #EF4444)",
                        accentColor: EVA_COLORS[formEva],
                      }}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-[#164E63]/30">Sin dolor</span>
                      <span className="text-[9px] text-[#164E63]/30">Moderado</span>
                      <span className="text-[9px] text-[#164E63]/30">Máximo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo hallazgo */}
              <div className="px-5 py-4 border-b border-cyan-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#164E63]/40 mb-3">Tipo de hallazgo</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.entries(TIPO_CONFIG) as [TipoHallazgo, typeof TIPO_CONFIG.dolor][]).map(([tipo, cfg]) => (
                    <button
                      key={tipo}
                      onClick={() => setFormTipo(tipo)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[12px] font-semibold transition-all duration-200 cursor-pointer ${
                        formTipo === tipo ? "text-white" : "text-[#164E63]/50 border-cyan-100 hover:bg-cyan-50"
                      }`}
                      style={formTipo === tipo ? { background: cfg.color, borderColor: cfg.color } : undefined}
                    >
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: formTipo === tipo ? "white" : cfg.color }} />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lateralidad */}
              <div className="px-5 py-4 border-b border-cyan-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#164E63]/40 mb-3">Lateralidad</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["bilateral","izquierdo","derecho"] as Lateralidad[]).map(lat => (
                    <button
                      key={lat}
                      onClick={() => setFormLat(lat)}
                      className={`py-2 rounded-lg border text-[12px] font-semibold transition-all duration-200 cursor-pointer capitalize ${
                        formLat === lat
                          ? "bg-[#0891B2]/10 border-[#0891B2]/30 text-[#0891B2]"
                          : "border-cyan-100 text-[#164E63]/50 hover:bg-cyan-50"
                      }`}
                    >
                      {lat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div className="px-5 py-4 border-b border-cyan-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#164E63]/40 mb-3">Notas clínicas</p>
                <textarea
                  value={formNotas}
                  onChange={e => setFormNotas(e.target.value)}
                  placeholder="Ej: Dolor irradiado hacia la pierna, peor al sentarse más de 30 min..."
                  rows={3}
                  className="w-full rounded-lg border border-cyan-100 bg-[#ECFEFF]/50 px-3 py-2.5 text-[13px] text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-[#0891B2]/40 resize-none transition-all duration-200"
                />
              </div>

              {/* Actions */}
              <div className="px-5 py-4 mt-auto space-y-2">
                <Button className="w-full bg-[#059669] hover:bg-[#059669]/90 text-white cursor-pointer transition-all duration-200 font-bold" onClick={handleSave}>
                  <Check className="h-4 w-4 mr-2" />Guardar hallazgo
                </Button>
                {editing && (
                  <Button variant="outline" className="w-full border-red-200 text-[#EF4444] hover:bg-red-50 cursor-pointer transition-all duration-200" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />Eliminar zona
                  </Button>
                )}
                <Button variant="ghost" className="w-full text-[#164E63]/50 cursor-pointer transition-all duration-200" onClick={resetPanel}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* ── Marcas list ── */}
          {!selectedKey && totalZonas > 0 && (
            <div className="flex-1 flex flex-col">
              <div className="px-5 py-3 border-b border-cyan-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#164E63]/40">
                  {totalZonas} hallazgo{totalZonas !== 1 ? "s" : ""} registrado{totalZonas !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {marcasArr.map(([key, m]) => (
                  <button
                    key={key}
                    onClick={() => handleClickZona(m.zona, m.label, m.vista)}
                    className="w-full text-left rounded-xl border border-cyan-100 bg-white hover:border-[#0891B2]/30 p-3 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                      <span className="text-[13px] font-bold text-[#164E63] flex-1 truncate">{m.label}</span>
                      <span className="text-lg font-black tabular-nums" style={{ color: m.color }}>{m.eva}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#164E63]/40">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />{VISTA_LABELS[m.vista].short}
                      </span>
                      <span>{TIPO_CONFIG[m.tipo].label}</span>
                      {m.lateralidad !== "bilateral" && <span className="capitalize">{m.lateralidad}</span>}
                    </div>
                    {m.notas && (
                      <p className="text-[11px] text-[#164E63]/40 mt-1.5 line-clamp-2 leading-relaxed">{m.notas}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats footer */}
          <div className="grid grid-cols-2 gap-3 px-5 py-4 border-t border-cyan-100 mt-auto shrink-0">
            <div className="text-center">
              <p className="text-xl font-black text-[#0891B2] tabular-nums">{totalZonas}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#164E63]/40">Zonas marcadas</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-[#EF4444] tabular-nums">{evaPromedio}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#164E63]/40">EVA promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SAVE FLASH TOAST ── */}
      {guardadoFlash && (
        <div className="fixed top-20 right-6 z-50 bg-[#059669] text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 font-bold text-sm flex items-center gap-2 animate-in slide-in-from-right-5 duration-300">
          <Check className="h-4 w-4" />Hallazgo guardado
        </div>
      )}

      {/* ── MOBILE BOTTOM PANEL (shown when zone selected on small screens) ── */}
      {selectedKey && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-cyan-100 shadow-2xl rounded-t-2xl max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-100">
            <div>
              <p className="text-sm font-bold text-[#164E63]">{formLabel}</p>
              <p className="text-[11px] text-[#164E63]/40">{VISTA_LABELS[formVista].full}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={resetPanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* EVA */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#164E63]/40 mb-2">EVA</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black min-w-[44px] text-center tabular-nums" style={{ color: EVA_COLORS[formEva] }}>{formEva}</span>
              <input
                type="range" min="0" max="10" value={formEva}
                onChange={e => setFormEva(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: "linear-gradient(to right, #10B981, #34D399, #FCD34D, #F97316, #EF4444)", accentColor: EVA_COLORS[formEva] }}
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="px-4 py-2">
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(TIPO_CONFIG) as [TipoHallazgo, typeof TIPO_CONFIG.dolor][]).map(([tipo, cfg]) => (
                <button
                  key={tipo}
                  onClick={() => setFormTipo(tipo)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                    formTipo === tipo ? "text-white" : "text-[#164E63]/50 border-cyan-100"
                  }`}
                  style={formTipo === tipo ? { background: cfg.color, borderColor: cfg.color } : undefined}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: formTipo === tipo ? "white" : cfg.color }} />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="px-4 py-2">
            <textarea
              value={formNotas}
              onChange={e => setFormNotas(e.target.value)}
              placeholder="Notas clínicas..."
              rows={2}
              className="w-full rounded-lg border border-cyan-100 bg-[#ECFEFF]/50 px-3 py-2 text-[13px] text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-[#0891B2]/40 resize-none"
            />
          </div>

          {/* Save */}
          <div className="px-4 py-3 flex gap-2">
            <Button className="flex-1 bg-[#059669] hover:bg-[#059669]/90 text-white cursor-pointer font-bold transition-all duration-200" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" />Guardar
            </Button>
            {editing && (
              <Button variant="outline" className="border-red-200 text-[#EF4444] cursor-pointer transition-all duration-200" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
