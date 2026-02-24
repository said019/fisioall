"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, X, Upload, ImagePlus, Loader2 } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type Vista = "anterior" | "posterior" | "lateral_der" | "lateral_izq";

export interface FotoSesion {
  id: string;
  url: string;
  nombre: string;
  vista: Vista;
  fecha: string;
  pacienteId: string;
  citaId: string;
}

interface FotoUploaderProps {
  pacienteId: string;
  citaId: string;
  onFotosSubidas: (fotos: FotoSesion[]) => void;
}

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const VISTA_LABELS: Record<Vista, string> = {
  anterior: "Vista Anterior",
  posterior: "Vista Posterior",
  lateral_der: "Lateral Derecho",
  lateral_izq: "Lateral Izquierdo",
};

interface ArchivoLocal {
  file: File;
  preview: string;
  vista: Vista;
  id: string;
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function FotoUploader({ pacienteId, citaId, onFotosSubidas }: FotoUploaderProps) {
  const [archivos, setArchivos] = useState<ArchivoLocal[]>([]);
  const [vistaSeleccionada, setVistaSeleccionada] = useState<Vista>("anterior");
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── helpers ── */
  const agregarArchivos = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const nuevos: ArchivoLocal[] = [];
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        if (file.size > 10 * 1024 * 1024) return; // 10MB max
        nuevos.push({
          file,
          preview: URL.createObjectURL(file),
          vista: vistaSeleccionada,
          id: crypto.randomUUID(),
        });
      });
      setArchivos((prev) => [...prev, ...nuevos]);
    },
    [vistaSeleccionada],
  );

  const eliminarArchivo = (id: string) => {
    setArchivos((prev) => {
      const found = prev.find((a) => a.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((a) => a.id !== id);
    });
  };

  /* ── drag & drop ── */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    agregarArchivos(e.dataTransfer.files);
  };

  /* ── upload (mock) ── */
  const handleSubir = async () => {
    if (archivos.length === 0) return;
    setSubiendo(true);
    setProgreso(0);

    // Simular progreso de subida
    const interval = setInterval(() => {
      setProgreso((p) => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + Math.random() * 15;
      });
    }, 200);

    // Mock: esperar 1.5s y devolver FotoSesion[]
    await new Promise((r) => setTimeout(r, 1500));
    clearInterval(interval);
    setProgreso(100);

    const fotos: FotoSesion[] = archivos.map((a) => ({
      id: a.id,
      url: a.preview,
      nombre: a.file.name,
      vista: a.vista,
      fecha: new Date().toISOString(),
      pacienteId,
      citaId,
    }));

    setTimeout(() => {
      setSubiendo(false);
      setProgreso(0);
      onFotosSubidas(fotos);
      setArchivos([]);
    }, 400);
  };

  /* ── render ── */
  return (
    <div className="space-y-4">
      {/* Vista selector */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-[#164E63]">Vista:</p>
        <Select value={vistaSeleccionada} onValueChange={(v) => setVistaSeleccionada(v as Vista)}>
          <SelectTrigger className="w-48 border-cyan-200 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(VISTA_LABELS) as [Vista, string][]).map(([v, label]) => (
              <SelectItem key={v} value={v} className="cursor-pointer">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-dashed border-2 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-[#0891B2] bg-[#0891B2]/5"
            : "border-cyan-200 hover:border-[#0891B2]/50 hover:bg-[#ECFEFF]/50"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isDragOver ? "bg-[#0891B2]/15" : "bg-[#ECFEFF]"
          }`}>
            <Camera className={`h-5 w-5 transition-all duration-200 ${isDragOver ? "text-[#0891B2]" : "text-[#0891B2]/60"}`} />
          </div>
          <p className="text-sm font-medium text-[#164E63]">
            {isDragOver ? "Suelta las fotos aquí" : "Arrastra fotos o haz clic"}
          </p>
          <p className="text-xs text-[#164E63]/40">JPG, PNG hasta 10MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            agregarArchivos(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Thumbnails grid */}
      {archivos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {archivos.map((a) => (
            <div key={a.id} className="relative group rounded-xl overflow-hidden border border-cyan-100 aspect-square">
              <img
                src={a.preview}
                alt={a.file.name}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200" />
              {/* Vista badge */}
              <Badge className="absolute bottom-2 left-2 bg-black/50 text-white border-none text-[10px] backdrop-blur-sm">
                {VISTA_LABELS[a.vista]}
              </Badge>
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  eliminarArchivo(a.id);
                }}
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:bg-[#EF4444]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {/* Add more placeholder */}
          <button
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-cyan-200 rounded-xl aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#0891B2]/50 hover:bg-[#ECFEFF]/50 transition-all duration-200"
          >
            <ImagePlus className="h-5 w-5 text-[#0891B2]/50" />
            <span className="text-[10px] text-[#164E63]/40 font-medium">Agregar más</span>
          </button>
        </div>
      )}

      {/* Upload progress */}
      {subiendo && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-[#0891B2] animate-spin" />
            <p className="text-sm font-medium text-[#164E63]">
              Subiendo {archivos.length} foto{archivos.length !== 1 ? "s" : ""}...
            </p>
            <span className="ml-auto text-sm font-bold text-[#0891B2] tabular-nums">
              {Math.round(progreso)}%
            </span>
          </div>
          <Progress value={progreso} className="h-2 bg-cyan-100" />
        </div>
      )}

      {/* Submit button */}
      {archivos.length > 0 && !subiendo && (
        <Button
          onClick={handleSubir}
          className="w-full bg-[#059669] hover:bg-[#059669]/90 text-white cursor-pointer transition-all duration-200 font-bold"
        >
          <Upload className="h-4 w-4 mr-2" />
          Subir {archivos.length} foto{archivos.length !== 1 ? "s" : ""}
        </Button>
      )}
    </div>
  );
}
