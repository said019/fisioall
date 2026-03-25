"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { X, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  VistaBody,
  TipoHallazgo,
  Lateralidad,
  BodyMapState,
  BodyMapZonaState,
} from "@/types/bodymap";
import { TIPO_COLORS, TIPO_LABELS, LATERALIDAD_LABELS } from "@/types/bodymap";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getHeatFill(intensidad: number): string {
  if (intensidad <= 2) return "rgba(16,185,129,0.70)";
  if (intensidad <= 4) return "rgba(234,179,8,0.75)";
  if (intensidad <= 6) return "rgba(249,115,22,0.80)";
  if (intensidad <= 8) return "rgba(239,68,68,0.85)";
  return "rgba(185,28,28,0.92)";
}

function getHeatStroke(intensidad: number): string {
  if (intensidad <= 2) return "#3fa87c";
  if (intensidad <= 4) return "#CA8A04";
  if (intensidad <= 6) return "#EA580C";
  if (intensidad <= 8) return "#DC2626";
  return "#991B1B";
}

function evaColor(val: number): string {
  if (val <= 2) return "#3fa87c";
  if (val <= 4) return "#CA8A04";
  if (val <= 6) return "#EA580C";
  if (val <= 8) return "#DC2626";
  return "#991B1B";
}

const BASE_FILL = "rgba(226,240,248,0.45)";
const BASE_STROKE = "rgba(148,163,184,0.35)";

const VISTA_LABELS: Record<VistaBody, string> = {
  anterior: "Anterior",
  posterior: "Posterior",
  lateral_der: "Lateral D",
  lateral_izq: "Lateral I",
};

// ─────────────────────────────────────────────────────────────────────────────
// ZONAITEM — renders an SVG shape with heatmap or base style
// ─────────────────────────────────────────────────────────────────────────────
interface ZonaItemProps {
  id: string;
  label: string;
  vistaActual: VistaBody;
  estadoMapa: BodyMapState;
  editable: boolean;
  isSelected: boolean;
  onClickZona: (id: string, label: string) => void;
  children: React.ReactElement<React.SVGProps<SVGElement>>;
  extraProps?: Record<string, unknown>;
}

function ZonaItem({
  id,
  label,
  vistaActual,
  estadoMapa,
  editable,
  isSelected,
  onClickZona,
  children,
  extraProps = {},
}: ZonaItemProps) {
  const key = `${id}_${vistaActual}`;
  const marca = estadoMapa[key];
  const fill = marca ? getHeatFill(marca.intensidad) : BASE_FILL;
  const stroke = marca ? getHeatStroke(marca.intensidad) : BASE_STROKE;
  const strokeW = marca ? 2 : 1;

  return React.cloneElement(children, {
    fill,
    stroke,
    strokeWidth: isSelected ? 3 : strokeW,
    strokeDasharray: isSelected ? "4 2" : undefined,
    style: {
      cursor: editable ? "crosshair" : "default",
      transition: "all 0.15s ease",
      filter: isSelected ? "drop-shadow(0 0 6px rgba(8,145,178,0.8))" : marca ? "drop-shadow(0 0 4px rgba(0,0,0,0.25))" : undefined,
    } as React.CSSProperties,
    onClick: editable ? () => onClickZona(id, label) : undefined,
    ...extraProps,
  } as React.SVGProps<SVGElement>);
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONA BUILDER
// ─────────────────────────────────────────────────────────────────────────────
interface ZonaPath { id: string; label: string; element: React.ReactElement; }

function buildZona(
  id: string,
  label: string,
  el: React.ReactElement<React.SVGProps<SVGElement>>,
  vistaActual: VistaBody,
  estadoMapa: BodyMapState,
  editable: boolean,
  selectedZonaId: string | null,
  onClickZona: (id: string, label: string) => void,
  extraProps?: Record<string, unknown>
): ZonaPath {
  return {
    id,
    label,
    element: (
      <ZonaItem
        key={`${id}_${vistaActual}`}
        id={id}
        label={label}
        vistaActual={vistaActual}
        estadoMapa={estadoMapa}
        editable={editable}
        isSelected={selectedZonaId === id}
        onClickZona={onClickZona}
        extraProps={extraProps}
      >
        {el}
      </ZonaItem>
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONAS ANTERIORES
// ─────────────────────────────────────────────────────────────────────────────
function zonasAnterior(
  onClickZona: (id: string, label: string) => void,
  estadoMapa: BodyMapState,
  editable: boolean,
  vistaActual: VistaBody,
  selectedId: string | null
): ZonaPath[] {
  const b = (id: string, label: string, el: React.ReactElement<React.SVGProps<SVGElement>>) =>
    buildZona(id, label, el, vistaActual, estadoMapa, editable, selectedId, onClickZona);

  return [
    b("cabeza", "Cabeza", <ellipse cx="130" cy="42" rx="32" ry="38" />),
    b("cuello", "Cuello", <rect x="115" y="79" width="30" height="22" rx="8" />),
    b("hombro_izq", "Hombro Izq.", <ellipse cx="88" cy="104" rx="26" ry="17" />),
    b("hombro_der", "Hombro Der.", <ellipse cx="172" cy="104" rx="26" ry="17" />),
    b("pecho_izq", "Pecho Izq.", <path d="M 113 102 C 92 108 76 118 74 140 L 74 160 L 113 160 Z" />),
    b("pecho_der", "Pecho Der.", <path d="M 147 102 C 168 108 184 118 186 140 L 186 160 L 147 160 Z" />),
    b("abdomen_sup", "Abdomen Sup.", <rect x="101" y="160" width="58" height="40" rx="5" />),
    b("abdomen_inf", "Abdomen Inf.", <path d="M 101 200 L 159 200 L 162 232 C 157 244 146 252 130 252 C 114 252 103 244 98 232 Z" />),
    b("brazo_sup_izq", "Brazo Sup. Izq.", <path d="M 65 104 C 50 114 42 134 42 160 L 42 178 C 51 183 62 183 70 178 L 74 160 C 79 133 78 110 65 104 Z" />),
    b("brazo_sup_der", "Brazo Sup. Der.", <path d="M 195 104 C 210 114 218 134 218 160 L 218 178 C 209 183 198 183 190 178 L 186 160 C 181 133 182 110 195 104 Z" />),
    b("codo_izq", "Codo Izq.", <ellipse cx="51" cy="185" rx="14" ry="10" />),
    b("codo_der", "Codo Der.", <ellipse cx="209" cy="185" rx="14" ry="10" />),
    b("antebrazo_izq", "Antebrazo Izq.", <path d="M 40 193 C 34 210 32 232 36 258 L 48 263 L 60 258 C 66 234 67 210 63 193 Z" />),
    b("antebrazo_der", "Antebrazo Der.", <path d="M 220 193 C 226 210 228 232 224 258 L 212 263 L 200 258 C 194 234 193 210 197 193 Z" />),
    b("mano_izq", "Mano Izq.", <ellipse cx="42" cy="272" rx="14" ry="18" />),
    b("mano_der", "Mano Der.", <ellipse cx="218" cy="272" rx="14" ry="18" />),
    b("cadera_izq", "Cadera Izq.", <path d="M 98 232 L 98 268 C 94 278 92 284 96 292 L 114 296 L 120 272 L 120 252 C 114 252 103 244 98 232 Z" />),
    b("cadera_der", "Cadera Der.", <path d="M 162 232 L 162 268 C 166 278 168 284 164 292 L 146 296 L 140 272 L 140 252 C 146 252 157 244 162 232 Z" />),
    b("muslo_izq", "Muslo Izq.", <path d="M 96 292 L 114 296 L 118 356 C 116 371 109 376 102 374 C 93 372 85 363 85 346 L 85 308 Z" />),
    b("muslo_der", "Muslo Der.", <path d="M 164 292 L 146 296 L 142 356 C 144 371 151 376 158 374 C 167 372 175 363 175 346 L 175 308 Z" />),
    b("rodilla_izq", "Rodilla Izq.", <ellipse cx="102" cy="381" rx="19" ry="14" />),
    b("rodilla_der", "Rodilla Der.", <ellipse cx="158" cy="381" rx="19" ry="14" />),
    b("tibia_izq", "Tibia Izq.", <path d="M 87 393 L 103 396 L 109 448 C 107 463 99 468 91 464 C 81 458 78 445 80 430 L 80 406 Z" />),
    b("tibia_der", "Tibia Der.", <path d="M 173 393 L 157 396 L 151 448 C 153 463 161 468 169 464 C 179 458 182 445 180 430 L 180 406 Z" />),
    b("tobillo_izq", "Tobillo Izq.", <ellipse cx="90" cy="471" rx="14" ry="10" />),
    b("tobillo_der", "Tobillo Der.", <ellipse cx="170" cy="471" rx="14" ry="10" />),
    b("pie_izq", "Pie Izq.", <path d="M 76 478 C 74 487 74 500 80 510 C 89 523 112 527 120 516 C 122 511 122 500 118 491 L 108 478 Z" />),
    b("pie_der", "Pie Der.", <path d="M 184 478 C 186 487 186 500 180 510 C 171 523 148 527 140 516 C 138 511 138 500 142 491 L 152 478 Z" />),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONAS POSTERIORES
// ─────────────────────────────────────────────────────────────────────────────
function zonasPosteriores(
  onClickZona: (id: string, label: string) => void,
  estadoMapa: BodyMapState,
  editable: boolean,
  vistaActual: VistaBody,
  selectedId: string | null
): ZonaPath[] {
  const b = (id: string, label: string, el: React.ReactElement<React.SVGProps<SVGElement>>) =>
    buildZona(id, label, el, vistaActual, estadoMapa, editable, selectedId, onClickZona);

  return [
    b("cabeza_post", "Cabeza (post.)", <ellipse cx="130" cy="42" rx="32" ry="38" />),
    b("cuello_post", "Cuello (post.)", <rect x="115" y="79" width="30" height="22" rx="8" />),
    b("trapecios", "Trapecios", <path d="M 115 82 C 97 88 76 102 70 118 L 190 118 C 184 102 163 88 145 82 Z" />),
    b("hombro_izq_post", "Hombro Izq.", <ellipse cx="70" cy="118" rx="22" ry="15" />),
    b("hombro_der_post", "Hombro Der.", <ellipse cx="190" cy="118" rx="22" ry="15" />),
    b("escapula_izq", "Escápula Izq.", <path d="M 74 120 C 70 133 70 151 77 166 L 101 169 L 101 120 Z" />),
    b("escapula_der", "Escápula Der.", <path d="M 186 120 C 190 133 190 151 183 166 L 159 169 L 159 120 Z" />),
    b("col_dorsal", "Columna Dorsal", <rect x="117" y="118" width="26" height="72" rx="6" />),
    b("lumbar", "Lumbar", <path d="M 101 190 L 159 190 L 162 234 C 157 252 147 262 130 262 C 113 262 103 252 98 234 Z" />),
    b("sacro", "Sacro / Cóccix", <ellipse cx="130" cy="272" rx="22" ry="14" />),
    b("gluteo_izq", "Glúteo Izq.", <path d="M 98 259 C 88 270 80 291 82 315 L 102 319 L 118 300 L 122 264 C 116 262 106 262 98 259 Z" />),
    b("gluteo_der", "Glúteo Der.", <path d="M 162 259 C 172 270 180 291 178 315 L 158 319 L 142 300 L 138 264 C 144 262 154 262 162 259 Z" />),
    b("isquio_izq", "Isquiotibial Izq.", <path d="M 82 320 L 102 320 L 108 378 C 106 393 97 398 89 394 C 78 388 74 376 76 360 L 76 338 Z" />),
    b("isquio_der", "Isquiotibial Der.", <path d="M 178 320 L 158 320 L 152 378 C 154 393 163 398 171 394 C 182 388 186 376 184 360 L 184 338 Z" />),
    b("pantorrilla_izq", "Pantorrilla Izq.", <path d="M 78 400 L 108 400 C 112 419 112 449 108 466 C 100 477 87 474 81 463 C 74 450 74 427 78 400 Z" />),
    b("pantorrilla_der", "Pantorrilla Der.", <path d="M 182 400 L 152 400 C 148 419 148 449 152 466 C 160 477 173 474 179 463 C 186 450 186 427 182 400 Z" />),
    b("talon_izq", "Talón Izq.", <ellipse cx="90" cy="480" rx="15" ry="12" />),
    b("talon_der", "Talón Der.", <ellipse cx="170" cy="480" rx="15" ry="12" />),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONAS LATERAL
// ─────────────────────────────────────────────────────────────────────────────
function zonasLateral(
  onClickZona: (id: string, label: string) => void,
  estadoMapa: BodyMapState,
  editable: boolean,
  vistaActual: VistaBody,
  izquierdo: boolean,
  selectedId: string | null
): ZonaPath[] {
  const extraProps = izquierdo
    ? { transform: "scale(-1,1) translate(-260,0)" }
    : undefined;

  const b = (id: string, label: string, el: React.ReactElement<React.SVGProps<SVGElement>>) =>
    buildZona(id, label, el, vistaActual, estadoMapa, editable, selectedId, onClickZona, extraProps);

  return [
    b("cabeza_lat", "Cabeza (lat.)", <ellipse cx="130" cy="42" rx="32" ry="38" />),
    b("cuello_lat", "Cuello (lat.)", <rect x="115" y="79" width="30" height="22" rx="8" />),
    b("torax_lat", "Tórax (lat.)", <path d="M 115 103 C 90 108 80 132 80 168 L 180 168 C 180 132 170 108 145 103 Z" />),
    b("lumbar_lat", "Lumbar (lat.)", <path d="M 86 168 L 174 168 L 174 228 C 170 252 150 268 130 268 C 110 268 90 252 86 228 Z" />),
    b("cadera_lat", "Cadera (lat.)", <path d="M 92 268 L 130 268 C 150 268 164 274 168 295 L 168 316 L 92 316 Z" />),
    b("cuadriceps_lat", "Cuádriceps (lat.)", <path d="M 92 316 L 168 316 L 164 382 C 160 403 144 406 130 406 C 116 406 100 403 96 382 Z" />),
    b("rodilla_lat", "Rodilla (lat.)", <ellipse cx="130" cy="406" rx="38" ry="17" />),
    b("pierna_lat", "Pierna (lat.)", <path d="M 96 420 L 164 420 L 162 480 C 158 498 144 503 130 503 C 116 503 102 498 98 480 Z" />),
    b("pie_lat", "Pie (lat.)", <path d="M 94 503 C 90 516 88 533 95 544 C 108 557 152 557 160 544 C 167 533 165 516 164 503 Z" />),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface BodyMapProps {
  marcasIniciales?: BodyMapState;
  editable?: boolean;
  onCambio?: (estado: BodyMapState) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BodyMap({
  marcasIniciales = {},
  editable = false,
  onCambio,
}: BodyMapProps) {
  const [vistaActual, setVistaActual] = useState<VistaBody>("anterior");
  const [estadoMapa, setEstadoMapa] = useState<BodyMapState>(marcasIniciales);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<{
    zonaId: string;
    zonaLabel: string;
  } | null>(null);
  const [formulario, setFormulario] = useState<{
    tipo: TipoHallazgo;
    intensidad: number;
    lateralidad: Lateralidad;
    notas: string;
  }>({ tipo: "dolor", intensidad: 5, lateralidad: "bilateral", notas: "" });
  const [listaAbierta, setListaAbierta] = useState(true);

  const panelRef = useRef<HTMLDivElement>(null);
  const totalMarcas = Object.keys(estadoMapa).length;

  const countPorVista = useCallback(
    (vista: VistaBody) =>
      Object.values(estadoMapa).filter((m) => m.vista === vista).length,
    [estadoMapa]
  );

  const handleClickZona = useCallback((zonaId: string, zonaLabel: string) => {
    if (!editable) return;
    setZonaSeleccionada({ zonaId, zonaLabel });
    const key = `${zonaId}_${vistaActual}`;
    const marca = estadoMapa[key];
    if (marca) {
      setFormulario({
        tipo: marca.tipo,
        intensidad: marca.intensidad,
        lateralidad: marca.lateralidad,
        notas: marca.notas ?? "",
      });
    } else {
      setFormulario({ tipo: "dolor", intensidad: 5, lateralidad: "bilateral", notas: "" });
    }
  }, [editable, vistaActual, estadoMapa]);

  const guardarMarca = () => {
    if (!zonaSeleccionada) return;
    const key = `${zonaSeleccionada.zonaId}_${vistaActual}`;
    const nuevo: BodyMapZonaState = {
      zonaId: zonaSeleccionada.zonaId,
      zonaLabel: zonaSeleccionada.zonaLabel,
      vista: vistaActual,
      tipo: formulario.tipo,
      intensidad: formulario.intensidad,
      lateralidad: formulario.lateralidad,
      notas: formulario.notas,
      colorHex: TIPO_COLORS[formulario.tipo],
    };
    const nuevoEstado = { ...estadoMapa, [key]: nuevo };
    setEstadoMapa(nuevoEstado);
    onCambio?.(nuevoEstado);
    setZonaSeleccionada(null);
  };

  const eliminarMarca = (key?: string) => {
    const k = key ?? `${zonaSeleccionada?.zonaId}_${vistaActual}`;
    const nuevoEstado = { ...estadoMapa };
    delete nuevoEstado[k];
    setEstadoMapa(nuevoEstado);
    onCambio?.(nuevoEstado);
    if (!key) setZonaSeleccionada(null);
  };

  // Close panel on outside click
  useEffect(() => {
    if (!zonaSeleccionada) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setZonaSeleccionada(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [zonaSeleccionada]);

  const zonas =
    vistaActual === "anterior"
      ? zonasAnterior(handleClickZona, estadoMapa, editable, vistaActual, zonaSeleccionada?.zonaId ?? null)
      : vistaActual === "posterior"
      ? zonasPosteriores(handleClickZona, estadoMapa, editable, vistaActual, zonaSeleccionada?.zonaId ?? null)
      : vistaActual === "lateral_der"
      ? zonasLateral(handleClickZona, estadoMapa, editable, vistaActual, false, zonaSeleccionada?.zonaId ?? null)
      : zonasLateral(handleClickZona, estadoMapa, editable, vistaActual, true, zonaSeleccionada?.zonaId ?? null);

  return (
    <div className="flex flex-col gap-4">
      {/* ── VISTA SELECTOR + SVG ── */}
      <div className="flex gap-3 items-start">
        {/* Vista tabs — vertical */}
        <div className="flex flex-col gap-1.5 shrink-0 pt-1">
          {(["anterior", "posterior", "lateral_der", "lateral_izq"] as VistaBody[]).map((vista) => {
            const count = countPorVista(vista);
            const isActive = vistaActual === vista;
            return (
              <button
                key={vista}
                onClick={() => { setVistaActual(vista); setZonaSeleccionada(null); }}
                className={`relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border min-w-[90px] ${
                  isActive
                    ? "bg-[#4a7fa5] border-[#4a7fa5] text-white shadow-md shadow-[#4a7fa5]/30"
                    : "bg-white border-[#c8dce8] text-[#1e2d3a]/60 hover:border-[#4a7fa5]/50 hover:text-[#1e2d3a] hover:bg-[#f0f4f7]"
                }`}
              >
                <span>{VISTA_LABELS[vista]}</span>
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0 rounded-full min-w-[18px] text-center ${
                    isActive ? "bg-white/25 text-white" : "bg-[#4a7fa5] text-white"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SVG — columna central, ancho fijo para que nunca se encoja */}
        <div className="shrink-0 w-[240px] sm:w-[280px]">
          <svg
            viewBox="0 0 260 560"
            className="w-full h-auto select-none drop-shadow-sm"
            aria-label={`Mapa corporal – vista ${VISTA_LABELS[vistaActual]}`}
          >
            <defs>
              <radialGradient id="bodyBg" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#f0f9ff" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </radialGradient>
            </defs>
            <rect width="260" height="560" fill="url(#bodyBg)" rx="8" opacity="0.4" />
            {zonas.map((z) => z.element)}
          </svg>
        </div>

        {/* PANEL — columna derecha, mismo alto que el SVG */}
        {zonaSeleccionada && editable && (
          <div
            ref={panelRef}
            className="shrink-0 w-64 self-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border border-[#a8cfe0] rounded-2xl shadow-xl shadow-cyan-900/10 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#c8dce8] bg-gradient-to-r from-[#f0f4f7] to-white">
                <div>
                  <p className="text-sm font-bold text-[#1e2d3a]">
                    {zonaSeleccionada.zonaLabel}
                  </p>
                  <p className="text-[10px] text-[#1e2d3a]/40">
                    Vista {VISTA_LABELS[vistaActual]}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {estadoMapa[`${zonaSeleccionada.zonaId}_${vistaActual}`] && (
                    <button
                      onClick={() => eliminarMarca()}
                      className="cursor-pointer p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setZonaSeleccionada(null)}
                    className="cursor-pointer p-1.5 rounded-lg text-[#1e2d3a]/30 hover:text-[#1e2d3a]/70 hover:bg-[#e4ecf2] transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="px-4 py-3 space-y-3">
                {/* EVA slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#1e2d3a]/60">Intensidad (EVA)</p>
                    <span
                      className="text-2xl font-black tabular-nums"
                      style={{ color: evaColor(formulario.intensidad) }}
                    >
                      {formulario.intensidad}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={formulario.intensidad}
                    onChange={(e) =>
                      setFormulario((p) => ({ ...p, intensidad: Number(e.target.value) }))
                    }
                    className="w-full h-3 rounded-full cursor-pointer appearance-none"
                    style={{
                      background: `linear-gradient(to right,
                        #3fa87c 0%, #16a34a 20%,
                        #eab308 30%, #f97316 50%,
                        #d9534f 70%, #b91c1c 100%)`,
                      accentColor: evaColor(formulario.intensidad),
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-[#1e2d3a]/40">
                    <span>Sin dolor</span>
                    <span>Máximo</span>
                  </div>
                </div>

                {/* Tipo */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#1e2d3a]/60">Tipo</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(TIPO_LABELS) as TipoHallazgo[]).map((tipo) => {
                      const color = TIPO_COLORS[tipo];
                      const active = formulario.tipo === tipo;
                      return (
                        <button
                          key={tipo}
                          onClick={() => setFormulario((p) => ({ ...p, tipo }))}
                          className="text-[10px] font-bold py-2 px-2 rounded-xl border transition-all duration-200 cursor-pointer text-center"
                          style={
                            active
                              ? { background: `${color}22`, borderColor: color, color, boxShadow: `0 0 0 1.5px ${color}` }
                              : { background: "white", borderColor: "#e2e8f0", color: "#475569" }
                          }
                        >
                          {TIPO_LABELS[tipo]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lateralidad */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#1e2d3a]/60">Lateralidad</p>
                  <div className="flex gap-1.5">
                    {(["bilateral", "izquierdo", "derecho"] as Lateralidad[]).map((lat) => (
                      <button
                        key={lat}
                        onClick={() => setFormulario((p) => ({ ...p, lateralidad: lat }))}
                        className={`flex-1 text-[10px] font-bold py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                          formulario.lateralidad === lat
                            ? "bg-[#4a7fa5] border-[#4a7fa5] text-white shadow-sm"
                            : "bg-white border-[#c8dce8] text-[#1e2d3a]/60 hover:border-[#4a7fa5]/50"
                        }`}
                      >
                        {LATERALIDAD_LABELS[lat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#1e2d3a]/60">Notas clínicas</p>
                  <textarea
                    value={formulario.notas}
                    onChange={(e) => setFormulario((p) => ({ ...p, notas: e.target.value }))}
                    placeholder="Notas clínicas..."
                    rows={3}
                    className="w-full text-xs border border-[#a8cfe0] rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#4a7fa5] text-[#1e2d3a] placeholder:text-[#1e2d3a]/30"
                  />
                </div>

                {/* Guardar */}
                <Button
                  onClick={guardarMarca}
                  className="w-full bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white text-xs cursor-pointer font-bold h-10 rounded-xl transition-all duration-200"
                >
                  Guardar hallazgo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── HALLAZGOS REGISTRADOS ── */}
      {totalMarcas > 0 && (
        <div className="border border-[#c8dce8] rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setListaAbierta((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[#f0f4f7]/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4a7fa5] animate-pulse" />
              <p className="text-xs font-bold text-[#1e2d3a]">
                {totalMarcas} hallazgo{totalMarcas !== 1 ? "s" : ""} registrado{totalMarcas !== 1 ? "s" : ""}
              </p>
            </div>
            {listaAbierta ? (
              <ChevronUp className="h-4 w-4 text-[#1e2d3a]/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#1e2d3a]/40" />
            )}
          </button>

          {listaAbierta && (
            <div className="px-3 pb-3 flex flex-wrap gap-1.5">
              {Object.entries(estadoMapa).map(([key, marca]) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold cursor-pointer hover:scale-105 transition-all duration-150 border"
                  style={{
                    background: `${marca.colorHex}18`,
                    borderColor: `${marca.colorHex}55`,
                    color: marca.colorHex,
                  }}
                  onClick={() => {
                    setVistaActual(marca.vista);
                    handleClickZona(marca.zonaId, marca.zonaLabel);
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: marca.colorHex }}
                  />
                  <span className="text-[#1e2d3a] font-semibold">{marca.zonaLabel}</span>
                  <span className="font-black">·{marca.intensidad}</span>
                  {editable && (
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminarMarca(key); }}
                      className="ml-0.5 cursor-pointer hover:text-red-500 transition-colors text-[#1e2d3a]/30"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── EVA LEYENDA ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-[#1e2d3a]/40 font-semibold">EVA:</span>
        {[
          { label: "0-2", color: "rgba(16,185,129,0.75)" },
          { label: "3-4", color: "rgba(234,179,8,0.80)" },
          { label: "5-6", color: "rgba(249,115,22,0.82)" },
          { label: "7-8", color: "rgba(239,68,68,0.87)" },
          { label: "9-10", color: "rgba(185,28,28,0.92)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm border border-black/10" style={{ background: item.color }} />
            <span className="text-[10px] text-[#1e2d3a]/50">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
