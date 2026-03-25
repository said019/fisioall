"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { MoveHorizontal } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export interface FotoSesion {
  id: string;
  url: string;
  nombre: string;
  vista: string;
  fecha: string;
  pacienteId: string;
  citaId: string;
}

interface ComparativaFotosProps {
  fotoAntes: FotoSesion;
  fotoDespues: FotoSesion;
  anotacion?: string;
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function ComparativaFotos({
  fotoAntes,
  fotoDespues,
  anotacion,
}: ComparativaFotosProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  /* ── drag logic ── */
  const updatePosition = useCallback(
    (clientX: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.min(95, Math.max(5, pct)));
    },
    [],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) updatePosition(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => updatePosition(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updatePosition(e.touches[0].clientX);
    };
    const handleUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, updatePosition]);

  /* ── render ── */
  return (
    <div className="space-y-3">
      {/* Slider container */}
      <div
        ref={containerRef}
        className="relative w-full max-h-[400px] aspect-[4/3] overflow-hidden rounded-xl border border-[#c8dce8] bg-[#1e2d3a]/5 select-none"
        style={{ cursor: isDragging ? "ew-resize" : "default" }}
      >
        {/* Image: ANTES (full background) */}
        <img
          src={fotoAntes.url}
          alt="Antes"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Image: DESPUÉS (clipped by sliderPos) */}
        <div
          className="absolute top-0 left-0 bottom-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={fotoDespues.url}
            alt="Después"
            className="absolute top-0 left-0 h-full object-cover pointer-events-none"
            style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : "100vw" }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 z-10"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-[3px] h-full bg-white shadow-lg shadow-black/20" />
        </div>

        {/* Drag handle */}
        <div
          className="absolute top-1/2 z-20 -translate-y-1/2"
          style={{ left: `${sliderPos}%`, transform: `translateX(-50%) translateY(-50%)` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className={`h-10 w-10 rounded-full bg-white border-2 border-[#4a7fa5] shadow-lg flex items-center justify-center cursor-ew-resize transition-all duration-150 ${
            isDragging ? "scale-110 shadow-xl shadow-[#4a7fa5]/30" : "hover:scale-105"
          }`}>
            <MoveHorizontal className="h-4 w-4 text-[#4a7fa5]" />
          </div>
        </div>

        {/* Labels */}
        <Badge className="absolute top-3 left-3 bg-black/50 text-white border-none text-[10px] backdrop-blur-sm z-10">
          DESPUÉS
        </Badge>
        <Badge className="absolute top-3 right-3 bg-black/50 text-white border-none text-[10px] backdrop-blur-sm z-10">
          ANTES
        </Badge>

        {/* Date labels */}
        <div className="absolute bottom-3 left-3 z-10">
          <Badge className="bg-[#3fa87c]/80 text-white border-none text-[10px] backdrop-blur-sm">
            {new Date(fotoDespues.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3 z-10">
          <Badge className="bg-[#d9534f]/80 text-white border-none text-[10px] backdrop-blur-sm">
            {new Date(fotoAntes.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
          </Badge>
        </div>
      </div>

      {/* Annotation */}
      {anotacion && (
        <div className="rounded-lg border border-[#c8dce8] bg-[#f0f4f7] px-4 py-2.5">
          <p className="text-xs text-[#1e2d3a]/70 leading-relaxed">{anotacion}</p>
        </div>
      )}

      {/* Instructions */}
      <p className="text-[11px] text-[#1e2d3a]/40 text-center flex items-center justify-center gap-1">
        <MoveHorizontal className="h-3 w-3" />
        Arrastra el control para comparar antes y después
      </p>
    </div>
  );
}
