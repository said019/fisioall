"use client";

import { useState, useEffect } from "react";
import { TrendingDown, TrendingUp, Minus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import BodyMap from "@/components/BodyMap";
import { getHistorialSnapshots } from "@/app/dashboard/expediente/bodymap-actions";
import { marcasToState, evaPromedioDesdeState, SNAPSHOT_TIPO_LABELS } from "@/types/bodymap";
import type { BodyMapSnapshot } from "@/types/bodymap";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function mejoraPct(evaInicial: number, evaActual: number): number {
  if (evaInicial === 0) return 0;
  return Math.round(((evaInicial - evaActual) / evaInicial) * 100);
}

function formatFecha(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface BodyMapComparadorProps {
  pacienteId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BodyMapComparador({ pacienteId }: BodyMapComparadorProps) {
  const [cargando, setCargando] = useState(true);
  const [historial, setHistorial] = useState<BodyMapSnapshot[]>([]);
  const [idxA, setIdxA] = useState(0); // índice del snapshot izquierdo (más antiguo)
  const [idxB, setIdxB] = useState(1); // índice del snapshot derecho (más reciente)

  useEffect(() => {
    setCargando(true);
    getHistorialSnapshots(pacienteId)
      .then((snaps) => {
        setHistorial(snaps);
        if (snaps.length >= 2) {
          setIdxA(0);
          setIdxB(snaps.length - 1);
        }
      })
      .catch(() => setHistorial([]))
      .finally(() => setCargando(false));
  }, [pacienteId]);

  // ── Loading ──
  if (cargando) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex gap-4">
          <Skeleton className="flex-1 h-[480px] rounded-xl" />
          <div className="w-px bg-cyan-100" />
          <Skeleton className="flex-1 h-[480px] rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Sin datos ──
  if (historial.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <div className="h-12 w-12 rounded-xl bg-cyan-50 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-cyan-400" />
        </div>
        <p className="text-sm font-semibold text-[#164E63]">Sin snapshots aún</p>
        <p className="text-xs text-[#164E63]/50 max-w-xs">
          El comparador estará disponible una vez que se registren al menos
          dos evaluaciones del body map.
        </p>
      </div>
    );
  }

  // ── Solo 1 snapshot ──
  if (historial.length === 1) {
    const snap = historial[0];
    const estado = marcasToState(snap.marcas);
    return (
      <div className="space-y-3 p-4">
        <p className="text-xs text-[#164E63]/50 text-center">
          Se necesitan al menos 2 snapshots para comparar. Mostrando el único registro.
        </p>
        <div className="max-w-xl mx-auto">
          <BodyMap marcasIniciales={estado} editable={false} />
        </div>
      </div>
    );
  }

  // ── Comparación ──
  const snapA = historial[idxA];
  const snapB = historial[idxB];
  const estadoA = marcasToState(snapA.marcas);
  const estadoB = marcasToState(snapB.marcas);
  const evaA = evaPromedioDesdeState(estadoA);
  const evaB = evaPromedioDesdeState(estadoB);
  const pct = mejoraPct(
    typeof evaA === "string" ? parseFloat(evaA) : evaA,
    typeof evaB === "string" ? parseFloat(evaB) : evaB
  );
  const zonasA = Object.keys(estadoA).length;
  const zonasB = Object.keys(estadoB).length;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4 p-4">
      {/* Selector de snapshots */}
      <div className="flex flex-wrap items-center gap-3 bg-cyan-50/60 rounded-xl p-3">
        <div className="flex-1 min-w-[180px] space-y-1">
          <p className="text-[10px] font-bold text-[#164E63]/50 uppercase">
            Comparar desde
          </p>
          <select
            value={idxA}
            onChange={(e) => setIdxA(Number(e.target.value))}
            className="w-full text-xs border border-cyan-200 rounded-lg px-3 py-1.5 bg-white text-[#164E63] focus:outline-none focus:border-[#0891B2]"
          >
            {historial.map((s, i) => (
              <option key={s.id} value={i} disabled={i === idxB}>
                {formatFecha(s.createdAt)} · {SNAPSHOT_TIPO_LABELS[s.tipo]} (#{s.sesionNum})
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[180px] space-y-1">
          <p className="text-[10px] font-bold text-[#164E63]/50 uppercase">
            Hasta
          </p>
          <select
            value={idxB}
            onChange={(e) => setIdxB(Number(e.target.value))}
            className="w-full text-xs border border-cyan-200 rounded-lg px-3 py-1.5 bg-white text-[#164E63] focus:outline-none focus:border-[#0891B2]"
          >
            {historial.map((s, i) => (
              <option key={s.id} value={i} disabled={i === idxA}>
                {formatFecha(s.createdAt)} · {SNAPSHOT_TIPO_LABELS[s.tipo]} (#{s.sesionNum})
              </option>
            ))}
          </select>
        </div>

        {/* KPIs */}
        <div className="flex items-center gap-3 ml-auto">
          <KpiChip label="Zonas" before={zonasA} after={zonasB} />
          <KpiChip label="EVA prom." before={Number(evaA)} after={Number(evaB)} />
          <MejoraBadge pct={pct} />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" />
          Imprimir
        </Button>
      </div>

      {/* Cuerpos lado a lado */}
      <div className="grid grid-cols-2 gap-4 print:gap-8">
        {/* Izquierdo — estado inicial */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-700 border-0 text-[10px] font-bold">
              {formatFecha(snapA.createdAt)}
            </Badge>
            <span className="text-[10px] text-[#164E63]/50">
              {SNAPSHOT_TIPO_LABELS[snapA.tipo]} · sesión #{snapA.sesionNum}
            </span>
          </div>
          <BodyMap marcasIniciales={estadoA} editable={false} />
        </div>

        {/* Derecho — estado más reciente */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border-0 text-[10px] font-bold">
              {formatFecha(snapB.createdAt)}
            </Badge>
            <span className="text-[10px] text-[#164E63]/50">
              {SNAPSHOT_TIPO_LABELS[snapB.tipo]} · sesión #{snapB.sesionNum}
            </span>
          </div>
          <BodyMap marcasIniciales={estadoB} editable={false} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────────────────────────────────────
function KpiChip({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  const diff = after - before;
  const color =
    diff < 0 ? "text-green-600" : diff > 0 ? "text-red-500" : "text-[#164E63]/40";
  return (
    <div className="text-center px-3 py-1.5 bg-white rounded-lg border border-cyan-100">
      <p className="text-[9px] font-bold text-[#164E63]/40 uppercase">{label}</p>
      <p className="text-sm font-bold text-[#164E63]">{after}</p>
      <p className={`text-[10px] font-semibold ${color}`}>
        {diff === 0 ? "—" : diff > 0 ? `+${diff}` : `${diff}`}
      </p>
    </div>
  );
}

function MejoraBadge({ pct }: { pct: number }) {
  const positivo = pct > 0;
  const neutro = pct === 0;
  return (
    <div
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold ${
        positivo
          ? "bg-green-50 border-green-200 text-green-700"
          : neutro
          ? "bg-cyan-50 border-cyan-200 text-[#164E63]/50"
          : "bg-red-50 border-red-200 text-red-600"
      }`}
    >
      {positivo ? (
        <TrendingDown className="h-3.5 w-3.5" />
      ) : neutro ? (
        <Minus className="h-3.5 w-3.5" />
      ) : (
        <TrendingUp className="h-3.5 w-3.5" />
      )}
      {positivo ? `-${pct}% dolor` : neutro ? "Sin cambio" : `+${Math.abs(pct)}% dolor`}
    </div>
  );
}
