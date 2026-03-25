"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  X,
  Eye,
  GitCompareArrows,
  Check,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import ComparativaFotos from "@/components/ComparativaFotos";
import type { FotoSesion } from "@/components/ComparativaFotos";

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════ */

const MOCK_FOTOS: FotoSesion[] = [
  { id: "f1", url: "https://placehold.co/400x500/164E63/ECFEFF?text=Sesion+1+Ant", nombre: "sesion1_anterior.jpg", vista: "anterior", fecha: "2026-01-06T10:00:00Z", pacienteId: "p1", citaId: "c1" },
  { id: "f2", url: "https://placehold.co/400x500/0891B2/ECFEFF?text=Sesion+1+Post", nombre: "sesion1_posterior.jpg", vista: "posterior", fecha: "2026-01-06T10:00:00Z", pacienteId: "p1", citaId: "c1" },
  { id: "f3", url: "https://placehold.co/400x500/059669/ECFEFF?text=Sesion+3+Ant", nombre: "sesion3_anterior.jpg", vista: "anterior", fecha: "2026-01-20T10:00:00Z", pacienteId: "p1", citaId: "c3" },
  { id: "f4", url: "https://placehold.co/400x500/7C3AED/ECFEFF?text=Sesion+3+Post", nombre: "sesion3_posterior.jpg", vista: "posterior", fecha: "2026-01-20T10:00:00Z", pacienteId: "p1", citaId: "c3" },
  { id: "f5", url: "https://placehold.co/400x500/F59E0B/164E63?text=Sesion+5+Ant", nombre: "sesion5_anterior.jpg", vista: "anterior", fecha: "2026-02-03T10:00:00Z", pacienteId: "p1", citaId: "c5" },
  { id: "f6", url: "https://placehold.co/400x500/EF4444/ECFEFF?text=Sesion+5+Lat", nombre: "sesion5_lateral.jpg", vista: "lateral_der", fecha: "2026-02-03T10:00:00Z", pacienteId: "p1", citaId: "c5" },
  { id: "f7", url: "https://placehold.co/400x500/22D3EE/164E63?text=Sesion+8+Ant", nombre: "sesion8_anterior.jpg", vista: "anterior", fecha: "2026-02-24T10:00:00Z", pacienteId: "p1", citaId: "c8" },
  { id: "f8", url: "https://placehold.co/400x500/10B981/ECFEFF?text=Sesion+8+Post", nombre: "sesion8_posterior.jpg", vista: "posterior", fecha: "2026-02-24T10:00:00Z", pacienteId: "p1", citaId: "c8" },
];

const VISTA_LABELS: Record<string, string> = {
  anterior: "Anterior",
  posterior: "Posterior",
  lateral_der: "Lat. Der.",
  lateral_izq: "Lat. Izq.",
};

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

interface HistorialFotosProps {
  pacienteId: string;
}

export default function HistorialFotos({ pacienteId }: HistorialFotosProps) {
  const [modoComparar, setModoComparar] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState<FotoSesion[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<FotoSesion | null>(null);

  /* ── Group photos by date ── */
  const gruposPorFecha = useMemo(() => {
    const grupos: Record<string, FotoSesion[]> = {};
    MOCK_FOTOS.filter((f) => f.pacienteId === pacienteId || pacienteId === "p1").forEach((foto) => {
      const dateKey = new Date(foto.fecha).toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      if (!grupos[dateKey]) grupos[dateKey] = [];
      grupos[dateKey].push(foto);
    });
    return Object.entries(grupos).sort(([, a], [, b]) => {
      return new Date(b[0].fecha).getTime() - new Date(a[0].fecha).getTime();
    });
  }, [pacienteId]);

  /* ── handlers ── */
  const handleClickFoto = (foto: FotoSesion) => {
    if (!modoComparar) {
      setPreviewFoto(foto);
      return;
    }
    setSeleccionadas((prev) => {
      const exists = prev.find((f) => f.id === foto.id);
      if (exists) return prev.filter((f) => f.id !== foto.id);
      if (prev.length >= 2) return [prev[1], foto];
      return [...prev, foto];
    });
  };

  const isSelected = (id: string) => seleccionadas.some((f) => f.id === id);
  const selectionOrder = (id: string) => {
    const idx = seleccionadas.findIndex((f) => f.id === id);
    return idx >= 0 ? idx + 1 : 0;
  };

  const handleCompare = () => {
    if (seleccionadas.length === 2) setModalOpen(true);
  };

  const handleCancelCompare = () => {
    setModoComparar(false);
    setSeleccionadas([]);
  };

  /* ── render ── */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#1e2d3a]">Historial Fotográfico</h3>
          <p className="text-[11px] text-[#1e2d3a]/50">
            {MOCK_FOTOS.length} fotos en {gruposPorFecha.length} sesiones
          </p>
        </div>
        {!modoComparar ? (
          <Button
            variant="outline"
            size="sm"
            className="border-[#4a7fa5]/30 text-[#4a7fa5] hover:bg-[#f0f4f7] cursor-pointer transition-all duration-200 text-xs font-semibold"
            onClick={() => setModoComparar(true)}
          >
            <GitCompareArrows className="h-3.5 w-3.5 mr-1" />
            Comparar
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Badge className="bg-[#4a7fa5]/10 text-[#4a7fa5] border-[#4a7fa5]/20 text-[10px]">
              {seleccionadas.length}/2 seleccionadas
            </Badge>
            <Button
              size="sm"
              className="bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer transition-all duration-200 text-xs font-bold"
              disabled={seleccionadas.length !== 2}
              onClick={handleCompare}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Ver comparativa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#1e2d3a]/50 cursor-pointer transition-all duration-200 text-xs"
              onClick={handleCancelCompare}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Compare mode hint */}
      {modoComparar && seleccionadas.length < 2 && (
        <div className="rounded-lg border border-[#4a7fa5]/20 bg-[#f0f4f7] px-4 py-2.5">
          <p className="text-xs text-[#4a7fa5] font-medium">
            Selecciona 2 fotos de diferentes fechas para comparar el progreso del paciente
          </p>
        </div>
      )}

      {/* Photos grouped by date */}
      {gruposPorFecha.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#f0f4f7] flex items-center justify-center mb-4">
            <Camera className="h-6 w-6 text-[#4a7fa5]/50" />
          </div>
          <p className="text-sm font-semibold text-[#1e2d3a]/60 mb-1">Sin fotos registradas</p>
          <p className="text-xs text-[#1e2d3a]/40">Las fotos se agregarán al completar sesiones</p>
        </div>
      ) : (
        gruposPorFecha.map(([fecha, fotos]) => (
          <div key={fecha}>
            {/* Date header */}
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5 text-[#4a7fa5]/60" />
              <p className="text-xs font-bold text-[#1e2d3a]/60 uppercase tracking-wider">{fecha}</p>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-[#a8cfe0] text-[#1e2d3a]/40">
                {fotos.length} foto{fotos.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Photos grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {fotos.map((foto) => (
                <button
                  key={foto.id}
                  onClick={() => handleClickFoto(foto)}
                  className={`relative group rounded-xl overflow-hidden border aspect-square cursor-pointer transition-all duration-200 ${
                    modoComparar && isSelected(foto.id)
                      ? "border-[#4a7fa5] ring-2 ring-[#4a7fa5]/30 scale-[0.97]"
                      : "border-[#c8dce8] hover:border-[#4a7fa5]/30 hover:shadow-md"
                  }`}
                >
                  <img
                    src={foto.url}
                    alt={foto.nombre}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  {/* Vista label */}
                  <Badge className="absolute bottom-1.5 left-1.5 bg-black/50 text-white border-none text-[9px] backdrop-blur-sm">
                    {VISTA_LABELS[foto.vista] ?? foto.vista}
                  </Badge>
                  {/* Selection indicator */}
                  {modoComparar && isSelected(foto.id) && (
                    <div className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-[#4a7fa5] text-white flex items-center justify-center text-[11px] font-bold shadow-lg">
                      {selectionOrder(foto.id)}
                    </div>
                  )}
                  {modoComparar && !isSelected(foto.id) && (
                    <div className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full border-2 border-white/60 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      {/* ── Preview modal ── */}
      <Dialog open={!!previewFoto} onOpenChange={() => setPreviewFoto(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          {previewFoto && (
            <>
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={previewFoto.url}
                  alt={previewFoto.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-6 pb-4 pt-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#4a7fa5]/10 text-[#4a7fa5] border-[#4a7fa5]/20 text-[10px]">
                    {VISTA_LABELS[previewFoto.vista] ?? previewFoto.vista}
                  </Badge>
                  <span className="text-xs text-[#1e2d3a]/50">
                    {new Date(previewFoto.fecha).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Comparativa modal ── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a] font-bold">Comparativa de progreso</DialogTitle>
          </DialogHeader>
          {seleccionadas.length === 2 && (
            <ComparativaFotos
              fotoAntes={
                new Date(seleccionadas[0].fecha) < new Date(seleccionadas[1].fecha)
                  ? seleccionadas[0]
                  : seleccionadas[1]
              }
              fotoDespues={
                new Date(seleccionadas[0].fecha) >= new Date(seleccionadas[1].fecha)
                  ? seleccionadas[0]
                  : seleccionadas[1]
              }
              anotacion="Desliza el control para comparar el progreso visual entre ambas sesiones."
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
