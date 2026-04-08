"use client";

import { useState, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Activity,
  PartyPopper,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export interface ProgresoSesion {
  sesion: number;
  fecha: string;
  dolor_inicio: number;
  dolor_fin: number;
  evolucion: "mejoria" | "sin_cambios" | "deterioro";
}

interface GraficaProgresDolorProps {
  datos: ProgresoSesion[];
  nombrePaciente?: string;
  diagnostico?: string;
  mostrarResumen?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA (para cuando se use standalone)
   ═══════════════════════════════════════════════════════════════════ */

export const MOCK_PROGRESO: ProgresoSesion[] = [
  { sesion: 1, fecha: "2026-01-06", dolor_inicio: 8, dolor_fin: 6, evolucion: "mejoria" },
  { sesion: 2, fecha: "2026-01-13", dolor_inicio: 7, dolor_fin: 5, evolucion: "mejoria" },
  { sesion: 3, fecha: "2026-01-20", dolor_inicio: 6, dolor_fin: 5, evolucion: "mejoria" },
  { sesion: 4, fecha: "2026-01-27", dolor_inicio: 6, dolor_fin: 4, evolucion: "sin_cambios" },
  { sesion: 5, fecha: "2026-02-03", dolor_inicio: 5, dolor_fin: 3, evolucion: "mejoria" },
  { sesion: 6, fecha: "2026-02-10", dolor_inicio: 4, dolor_fin: 3, evolucion: "mejoria" },
  { sesion: 7, fecha: "2026-02-17", dolor_inicio: 4, dolor_fin: 2, evolucion: "mejoria" },
  { sesion: 8, fecha: "2026-02-24", dolor_inicio: 3, dolor_fin: 2, evolucion: "mejoria" },
];

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const PAD = { top: 16, bottom: 24, left: 28, right: 16 };
const W = 400;
const H = 120;
const GRAPH_W = W - PAD.left - PAD.right;
const GRAPH_H = H - PAD.top - PAD.bottom;
const MAX_DOLOR = 10;

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function GraficaProgresoDolor({
  datos,
  nombrePaciente,
  diagnostico,
  mostrarResumen = true,
}: GraficaProgresDolorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    sesion: number;
    x: number;
    y: number;
    tipo: "inicio" | "fin";
    valor: number;
    fecha: string;
    dolorInicio: number;
    dolorFin: number;
  } | null>(null);

  /* ── computaciones ── */
  const computado = useMemo(() => {
    if (datos.length === 0) return null;

    const primera = datos[0];
    const ultima = datos[datos.length - 1];
    const mejoraPct = primera.dolor_inicio > 0
      ? Math.round(((primera.dolor_inicio - ultima.dolor_inicio) / primera.dolor_inicio) * 100)
      : 0;

    // Tendencia: últimas 3 sesiones
    const ultimas3 = datos.slice(-3);
    let tendencia: "bajando" | "subiendo" | "estable" = "estable";
    if (ultimas3.length >= 3) {
      const diffs = [];
      for (let i = 1; i < ultimas3.length; i++) {
        diffs.push(ultimas3[i].dolor_inicio - ultimas3[i - 1].dolor_inicio);
      }
      const allDown = diffs.every((d) => d <= 0) && diffs.some((d) => d < 0);
      const allUp = diffs.every((d) => d >= 0) && diffs.some((d) => d > 0);
      if (allDown) tendencia = "bajando";
      else if (allUp) tendencia = "subiendo";
    }

    return { primera, ultima, mejoraPct, tendencia };
  }, [datos]);

  /* ── mapToSVG ── */
  const mapToSVG = (valor: number, sesionIndex: number) => {
    const x = PAD.left + (datos.length === 1 ? GRAPH_W / 2 : (sesionIndex / (datos.length - 1)) * GRAPH_W);
    const y = PAD.top + (1 - valor / MAX_DOLOR) * GRAPH_H;
    return { x, y };
  };

  /* ── generate SVG points ── */
  const puntosInicio = datos.map((d, i) => mapToSVG(d.dolor_inicio, i));
  const puntosFin = datos.map((d, i) => mapToSVG(d.dolor_fin, i));
  const polyInicio = puntosInicio.map((p) => `${p.x},${p.y}`).join(" ");
  const polyFin = puntosFin.map((p) => `${p.x},${p.y}`).join(" ");

  /* area fill path */
  const areaPath = datos.length > 0
    ? `M ${puntosInicio[0].x},${puntosInicio[0].y} ` +
      puntosInicio.map((p) => `L ${p.x},${p.y}`).join(" ") +
      ` L ${puntosInicio[puntosInicio.length - 1].x},${H - PAD.bottom}` +
      ` L ${PAD.left},${H - PAD.bottom} Z`
    : "";

  /* grid lines */
  const gridValues = [0, 2, 4, 6, 8, 10];

  /* ── handle hover ── */
  const handlePointHover = (
    e: React.MouseEvent,
    sesionIdx: number,
    tipo: "inicio" | "fin",
  ) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const d = datos[sesionIdx];
    const svgPt = tipo === "inicio" ? puntosInicio[sesionIdx] : puntosFin[sesionIdx];
    // Convert SVG coords to pixel coords relative to container
    const scaleX = rect.width / W;
    const scaleY = rect.height / H;
    setHoveredPoint({
      sesion: d.sesion,
      x: svgPt.x * scaleX,
      y: svgPt.y * scaleY,
      tipo,
      valor: tipo === "inicio" ? d.dolor_inicio : d.dolor_fin,
      fecha: d.fecha,
      dolorInicio: d.dolor_inicio,
      dolorFin: d.dolor_fin,
    });
  };

  /* ── empty state ── */
  if (datos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-14 w-14 rounded-2xl bg-[#f0f4f7] flex items-center justify-center mb-4">
          <Activity className="h-6 w-6 text-[#4a7fa5]/50" />
        </div>
        <p className="text-sm font-semibold text-[#1e2d3a]/60 mb-1">Sin datos de sesiones registradas</p>
        <p className="text-xs text-[#1e2d3a]/40">Los datos de dolor aparecerán aquí después de cada sesión</p>
      </div>
    );
  }

  /* ── render ── */
  return (
    <div className="space-y-4">
      {/* ── HEADER / RESUMEN ── */}
      {mostrarResumen && computado && (
        <div className="flex gap-3 flex-wrap">
          {/* Card: Dolor inicial */}
          <div className="flex-1 min-w-[120px] bg-[#f0f4f7] rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1e2d3a]/40 mb-1">Dolor inicial</p>
            <p className="text-2xl font-black text-rose-500 tabular-nums leading-none">{computado.primera.dolor_inicio}</p>
            <p className="text-[10px] text-[#1e2d3a]/40 mt-1">EVA sesión 1</p>
          </div>

          {/* Card: Dolor actual */}
          <div className="flex-1 min-w-[120px] bg-[#f0f4f7] rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1e2d3a]/40 mb-1">Dolor actual</p>
            <p className="text-2xl font-black text-emerald-600 tabular-nums leading-none">{computado.ultima.dolor_inicio}</p>
            <p className="text-[10px] text-[#1e2d3a]/40 mt-1">EVA última sesión</p>
          </div>

          {/* Card: Mejoría */}
          <div className="flex-1 min-w-[120px] bg-[#f0f4f7] rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1e2d3a]/40 mb-1">Mejoría</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-black tabular-nums leading-none ${
                computado.mejoraPct > 0 ? "text-emerald-600" : computado.mejoraPct < 0 ? "text-[#d9534f]" : "text-[#1e2d3a]/60"
              }`}>
                {computado.mejoraPct > 0 ? "+" : ""}{computado.mejoraPct}%
              </p>
              {computado.mejoraPct >= 50 && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px] font-bold">
                  ¡Excelente!
                </Badge>
              )}
            </div>
          </div>

          {/* Card: Tendencia */}
          <div className="flex-1 min-w-[120px] bg-[#f0f4f7] rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1e2d3a]/40 mb-1">Tendencia</p>
            <div className="flex items-center gap-2">
              {computado.tendencia === "bajando" && <TrendingDown className="h-5 w-5 text-emerald-600" />}
              {computado.tendencia === "subiendo" && <TrendingUp className="h-5 w-5 text-[#d9534f]" />}
              {computado.tendencia === "estable" && <Minus className="h-5 w-5 text-[#1e2d3a]/40" />}
              <p className={`text-sm font-bold capitalize ${
                computado.tendencia === "bajando" ? "text-emerald-600" :
                computado.tendencia === "subiendo" ? "text-[#d9534f]" :
                "text-[#1e2d3a]/60"
              }`}>
                {computado.tendencia === "bajando" ? "En descenso" :
                 computado.tendencia === "subiendo" ? "En aumento" : "Estable"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── GRÁFICA SVG ── */}
      <div
        ref={containerRef}
        className="relative w-full"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: "auto", aspectRatio: `${W}/${H}` }}
        >
          {/* Grid lines */}
          {gridValues.map((val) => {
            const y = PAD.top + (1 - val / MAX_DOLOR) * GRAPH_H;
            return (
              <g key={`grid-${val}`}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={W - PAD.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="0.5"
                  strokeDasharray="3,3"
                />
                <text
                  x={PAD.left - 4}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="8"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Target zone (dolor ≤ 3) */}
          <rect
            x={PAD.left}
            y={PAD.top + (1 - 3 / MAX_DOLOR) * GRAPH_H}
            width={GRAPH_W}
            height={(3 / MAX_DOLOR) * GRAPH_H}
            fill="#3fa87c"
            opacity="0.04"
            rx="2"
          />

          {/* Area fill under dolor_inicio */}
          <path d={areaPath} fill="rgba(239,68,68,0.08)" />

          {/* Line: dolor_inicio */}
          <polyline
            points={polyInicio}
            fill="none"
            stroke="#d9534f"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Line: dolor_fin (dashed) */}
          <polyline
            points={polyFin}
            fill="none"
            stroke="#3fa87c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5,3"
          />

          {/* Points: dolor_inicio */}
          {puntosInicio.map((pt, i) => (
            <circle
              key={`ini-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#d9534f"
              stroke="white"
              strokeWidth="1.5"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={(e) => handlePointHover(e, i, "inicio")}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{
                transform: hoveredPoint?.sesion === datos[i].sesion && hoveredPoint?.tipo === "inicio" ? "scale(1.4)" : "scale(1)",
                transformOrigin: `${pt.x}px ${pt.y}px`,
              }}
            />
          ))}

          {/* Points: dolor_fin */}
          {puntosFin.map((pt, i) => (
            <circle
              key={`fin-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#3fa87c"
              stroke="white"
              strokeWidth="1.5"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={(e) => handlePointHover(e, i, "fin")}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{
                transform: hoveredPoint?.sesion === datos[i].sesion && hoveredPoint?.tipo === "fin" ? "scale(1.4)" : "scale(1)",
                transformOrigin: `${pt.x}px ${pt.y}px`,
              }}
            />
          ))}

          {/* X labels */}
          {datos.map((d, i) => {
            if (datos.length > 10 && i % 2 !== 0 && i !== datos.length - 1) return null;
            const pt = mapToSVG(0, i);
            return (
              <text
                key={`lbl-${i}`}
                x={pt.x}
                y={H - PAD.bottom + 14}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="9"
                fontWeight="500"
              >
                S{d.sesion}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-white border border-[#c8dce8] rounded-lg px-3 py-2 shadow-lg"
            style={{
              left: `${hoveredPoint.x}px`,
              top: `${hoveredPoint.y - 8}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="text-[11px] font-bold text-[#1e2d3a]">
              Sesión {hoveredPoint.sesion}
            </p>
            <p className="text-[10px] text-[#1e2d3a]/50">
              {new Date(hoveredPoint.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d9534f]" />
                <span className="text-[#1e2d3a]/60">Inicio: <span className="font-bold text-[#d9534f]">{hoveredPoint.dolorInicio}</span></span>
              </span>
              <span className="text-[#1e2d3a]/30">→</span>
              <span className="flex items-center gap-1 text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3fa87c]" />
                <span className="text-[#1e2d3a]/60">Fin: <span className="font-bold text-[#3fa87c]">{hoveredPoint.dolorFin}</span></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── LEYENDA ── */}
      <div className="flex items-center gap-5 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-[3px] bg-[#d9534f] rounded-full" />
          <span className="text-[11px] text-[#1e2d3a]/50 font-medium">Dolor al inicio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-[2px] border-t-2 border-dashed border-[#3fa87c]" />
          <span className="text-[11px] text-[#1e2d3a]/50 font-medium">Dolor al final</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-3 h-3 rounded-sm bg-[#3fa87c]/[0.06] border border-[#3fa87c]/20" />
          <span className="text-[10px] text-[#1e2d3a]/40">Zona objetivo (≤3)</span>
        </div>
      </div>

      {/* ── BANNER MEJORÍA ── */}
      {computado && computado.mejoraPct >= 50 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <PartyPopper className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">
              ¡El paciente ha mejorado un {computado.mejoraPct}%!
            </p>
            <p className="text-xs text-emerald-600/80 mt-0.5">
              {nombrePaciente ? `${nombrePaciente} muestra` : "Se muestra"} una tendencia positiva consistente.
              {diagnostico && ` Diagnóstico: ${diagnostico}.`} Esto justifica continuar el tratamiento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
