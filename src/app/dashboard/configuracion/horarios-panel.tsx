"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { guardarHorariosTerapeutas } from "./actions";

// ── TYPES ───────────────────────────────────────────────────────────────────
interface Franja {
  inicio: string;
  fin: string;
}

interface HorarioData {
  id?: string;
  diaKey: string;
  franjas: Franja[];
  activo: boolean;
}

interface CubiculoData {
  id?: string;
  tipoSesion: string;
  cubiculoPref: number[];
}

interface Terapeuta {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
  horarios: { id: string; diaKey: string; franjas: unknown; activo: boolean }[];
  cubiculos: { id: string; tipoSesion: string; cubiculoPref: number[] }[];
}

interface HorariosPanelProps {
  terapeutas: Terapeuta[];
}

// ── CONSTANTS ───────────────────────────────────────────────────────────────
const DIAS = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const HORAS = Array.from({ length: 27 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const TIPOS_SESION = [
  { key: "fisioterapia", label: "Fisioterapia" },
  { key: "suelo_pelvico", label: "Suelo Pélvico" },
  { key: "cosme", label: "Cosmetología" },
  { key: "ejercicio", label: "Ejercicio Terap." },
];

const CUBICULOS = [1, 2, 3];

// ── HELPERS ─────────────────────────────────────────────────────────────────
function buildHorarioState(terapeuta: Terapeuta): HorarioData[] {
  return DIAS.map((d) => {
    const existing = terapeuta.horarios.find((h) => h.diaKey === d.key);
    if (existing) {
      const franjas = (existing.franjas as Franja[]) || [];
      return { diaKey: d.key, franjas: franjas.length > 0 ? franjas : [{ inicio: "09:00", fin: "14:00" }], activo: existing.activo };
    }
    return { diaKey: d.key, franjas: [{ inicio: "09:00", fin: "14:00" }], activo: false };
  });
}

function buildCubiculoState(terapeuta: Terapeuta): CubiculoData[] {
  return TIPOS_SESION.map((t) => {
    const existing = terapeuta.cubiculos.find((c) => c.tipoSesion === t.key);
    return { tipoSesion: t.key, cubiculoPref: existing?.cubiculoPref ?? [1] };
  });
}

// ── COMPONENT ───────────────────────────────────────────────────────────────
export default function HorariosPanel({ terapeutas }: HorariosPanelProps) {
  const [selectedId, setSelectedId] = useState(terapeutas[0]?.id ?? "");
  const [horarios, setHorarios] = useState<HorarioData[]>(() => {
    const t = terapeutas.find((t) => t.id === selectedId);
    return t ? buildHorarioState(t) : [];
  });
  const [cubiculos, setCubiculos] = useState<CubiculoData[]>(() => {
    const t = terapeutas.find((t) => t.id === selectedId);
    return t ? buildCubiculoState(t) : [];
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const switchTerapeuta = (id: string) => {
    setSelectedId(id);
    const t = terapeutas.find((t) => t.id === id);
    if (t) {
      setHorarios(buildHorarioState(t));
      setCubiculos(buildCubiculoState(t));
    }
    setSaved(false);
  };

  // ── Horario mutations ──
  const toggleDia = (diaKey: string) => {
    setHorarios((prev) =>
      prev.map((h) => (h.diaKey === diaKey ? { ...h, activo: !h.activo } : h))
    );
  };

  const updateFranja = (diaKey: string, idx: number, field: "inicio" | "fin", value: string) => {
    setHorarios((prev) =>
      prev.map((h) => {
        if (h.diaKey !== diaKey) return h;
        const franjas = [...h.franjas];
        franjas[idx] = { ...franjas[idx], [field]: value };
        return { ...h, franjas };
      })
    );
  };

  const addFranja = (diaKey: string) => {
    setHorarios((prev) =>
      prev.map((h) => {
        if (h.diaKey !== diaKey) return h;
        return { ...h, franjas: [...h.franjas, { inicio: "15:00", fin: "19:00" }] };
      })
    );
  };

  const removeFranja = (diaKey: string, idx: number) => {
    setHorarios((prev) =>
      prev.map((h) => {
        if (h.diaKey !== diaKey) return h;
        const franjas = h.franjas.filter((_, i) => i !== idx);
        return { ...h, franjas: franjas.length > 0 ? franjas : [{ inicio: "09:00", fin: "14:00" }] };
      })
    );
  };

  // ── Cubículo mutations ──
  const updateCubiculoPref = (tipoSesion: string, value: number) => {
    setCubiculos((prev) =>
      prev.map((c) => {
        if (c.tipoSesion !== tipoSesion) return c;
        const pref = [...c.cubiculoPref];
        pref[0] = value;
        return { ...c, cubiculoPref: pref };
      })
    );
  };

  const updateCubiculoFallback = (tipoSesion: string, value: number | null) => {
    setCubiculos((prev) =>
      prev.map((c) => {
        if (c.tipoSesion !== tipoSesion) return c;
        const pref = value !== null ? [c.cubiculoPref[0], value] : [c.cubiculoPref[0]];
        return { ...c, cubiculoPref: pref };
      })
    );
  };

  // ── Save ──
  const handleSave = () => {
    startTransition(async () => {
      await guardarHorariosTerapeutas({
        usuarioId: selectedId,
        horarios: horarios.map((h) => ({
          diaKey: h.diaKey,
          activo: h.activo,
          franjas: h.franjas,
        })),
        cubiculos: cubiculos.map((c) => ({
          tipoSesion: c.tipoSesion,
          cubiculoPref: c.cubiculoPref,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  const selectedTerapeuta = terapeutas.find((t) => t.id === selectedId);

  if (terapeutas.length === 0) {
    return (
      <Card className="border-[#c8dce8] bg-white">
        <CardContent className="py-10 text-center text-sm text-[#1e2d3a]/50">
          No hay terapeutas activos en el sistema.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#c8dce8] bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#4a7fa5]" />
              Horarios del Equipo
            </CardTitle>
            <p className="text-[11px] text-[#1e2d3a]/50 mt-0.5">
              Horario individual de cada terapeuta — puede ser diferente al horario general de la clínica
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isPending}
            size="sm"
            className={`cursor-pointer text-xs gap-1.5 transition-all ${
              saved
                ? "bg-[#3fa87c] text-white"
                : "bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white"
            }`}
          >
            {saved ? (
              <><CheckCircle2 className="h-3.5 w-3.5" /> Guardado</>
            ) : isPending ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="h-3.5 w-3.5" /> Guardar</>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Therapist selector ── */}
        <div className="flex gap-2">
          {terapeutas.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTerapeuta(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                selectedId === t.id
                  ? "bg-[#4a7fa5] text-white border-[#4a7fa5]"
                  : "bg-white border-[#c8dce8] text-[#1e2d3a] hover:border-[#4a7fa5]"
              }`}
            >
              {t.nombre} {t.apellido?.charAt(0) ?? ""}.
            </button>
          ))}
        </div>

        {selectedTerapeuta && (
          <>
            {/* ── Schedule per day ── */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Horario semanal
              </Label>

              <div className="space-y-1">
                {horarios.map((h) => {
                  const diaLabel = DIAS.find((d) => d.key === h.diaKey)?.label ?? h.diaKey;
                  return (
                    <div
                      key={h.diaKey}
                      className={`flex items-center gap-2 rounded-lg transition-all ${
                        h.activo
                          ? "border border-[#c8dce8] bg-white px-2.5 py-1.5"
                          : "bg-[#f5f8fa] px-2.5 py-1"
                      }`}
                    >
                      {/* Day toggle */}
                      <button
                        type="button"
                        onClick={() => toggleDia(h.diaKey)}
                        className={`mt-0.5 w-8 h-[18px] rounded-full transition-all cursor-pointer relative shrink-0 ${
                          h.activo ? "bg-[#3fa87c]" : "bg-[#c8dce8]"
                        }`}
                      >
                        <span
                          className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all ${
                            h.activo ? "left-[16px]" : "left-[2px]"
                          }`}
                        />
                      </button>

                      <span className={`w-14 text-xs font-medium shrink-0 ${h.activo ? "text-[#1e2d3a]" : "text-[#1e2d3a]/40"}`}>
                        {diaLabel}
                      </span>

                      {h.activo ? (
                        <div className="flex-1 space-y-0.5">
                          {h.franjas.map((f, fi) => (
                            <div key={fi} className="flex items-center gap-1.5">
                              <Select value={f.inicio} onValueChange={(v) => updateFranja(h.diaKey, fi, "inicio", v)}>
                                <SelectTrigger className="h-7 w-[80px] text-xs border-[#c8dce8]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {HORAS.map((hr) => (
                                    <SelectItem key={hr} value={hr} className="text-xs">{hr}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span className="text-[10px] text-[#1e2d3a]/40">—</span>
                              <Select value={f.fin} onValueChange={(v) => updateFranja(h.diaKey, fi, "fin", v)}>
                                <SelectTrigger className="h-7 w-[80px] text-xs border-[#c8dce8]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {HORAS.map((hr) => (
                                    <SelectItem key={hr} value={hr} className="text-xs">{hr}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {h.franjas.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeFranja(h.diaKey, fi)}
                                  className="p-0.5 text-[#d9534f]/60 hover:text-[#d9534f] cursor-pointer"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addFranja(h.diaKey)}
                            className="flex items-center gap-1 text-[10px] text-[#4a7fa5] hover:text-[#4a7fa5]/80 cursor-pointer mt-0.5"
                          >
                            <Plus className="h-2.5 w-2.5" /> Agregar franja
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#1e2d3a]/30 mt-0.5 italic">Inactivo</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Cubicle preferences ── */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70">
                Cubículos por tipo de sesión
              </Label>

              <div className="space-y-1">
                {cubiculos.map((c) => {
                  const tipoLabel = TIPOS_SESION.find((t) => t.key === c.tipoSesion)?.label ?? c.tipoSesion;
                  return (
                    <div key={c.tipoSesion} className="flex items-center gap-3 px-2 py-1.5 rounded-lg border border-[#c8dce8] bg-white">
                      <span className="text-xs font-medium text-[#1e2d3a] w-28 shrink-0">{tipoLabel}</span>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#1e2d3a]/50">Pref.</span>
                        <Select
                          value={String(c.cubiculoPref[0] ?? 1)}
                          onValueChange={(v) => updateCubiculoPref(c.tipoSesion, Number(v))}
                        >
                          <SelectTrigger className="h-7 w-[90px] text-xs border-[#c8dce8]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CUBICULOS.map((n) => (
                              <SelectItem key={n} value={String(n)} className="text-xs">
                                Cubículo {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#1e2d3a]/50">Alternativo</span>
                        <Select
                          value={c.cubiculoPref[1] != null ? String(c.cubiculoPref[1]) : "none"}
                          onValueChange={(v) =>
                            updateCubiculoFallback(c.tipoSesion, v === "none" ? null : Number(v))
                          }
                        >
                          <SelectTrigger className="h-7 w-[90px] text-xs border-[#c8dce8]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-xs">
                              Ninguno
                            </SelectItem>
                            {CUBICULOS.filter((n) => n !== c.cubiculoPref[0]).map((n) => (
                              <SelectItem key={n} value={String(n)} className="text-xs">
                                Cubículo {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
