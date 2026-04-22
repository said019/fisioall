"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Save,
  Camera,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Globe,
  Facebook,
  Instagram,
  AlertCircle,
  CalendarOff,
  Plus,
  Trash2,
  Unplug,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  guardarConfiguracion,
  type ConfigClinicaData,
  type DiaBloqueadoData,
  type ConfigCompleta,
} from "./actions";
import WhatsAppPanel from "../notificaciones/whatsapp-panel";
import HorariosPanel from "./horarios-panel";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type ConfigClinica = ConfigClinicaData;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface PacienteOption {
  id: string;
  nombre: string;
  telefono: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ConfiguracionClientProps {
  initial: ConfigCompleta;
  pacientes: PacienteOption[];
  terapeutas?: any[];
}

export default function ConfiguracionClient({ initial, pacientes, terapeutas = [] }: ConfiguracionClientProps) {
  const [config, setConfig] = useState<ConfigClinica>(initial.clinica);
  const [diasBloqueados, setDiasBloqueados] = useState<DiaBloqueadoData[]>(initial.diasBloqueados);
  const [nuevoBloqueo, setNuevoBloqueo] = useState<{
    fecha: string;
    motivo: string;
    fisioIds: string[];
    horaInicio: string;
    horaFin: string;
  }>({ fecha: "", motivo: "", fisioIds: [], horaInicio: "", horaFin: "" });
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfig = (key: keyof ConfigClinica, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const result = await guardarConfiguracion({
        clinica: config,
        horarios: initial.horarios,
        comida: initial.comida,
        diasBloqueados,
      });
      if ("error" in result) {
        setError(result.error ?? "Error al guardar");
      } else {
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2500);
      }
    } catch {
      setError("Error de conexión al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e2d3a]">Configuración</h1>
          <p className="text-xs text-[#1e2d3a]/50 mt-0.5">
            Todo lo que configures aquí se refleja en tu página pública y agendamiento
          </p>
        </div>
        <Button
          onClick={handleGuardar}
          disabled={guardando}
          className={`cursor-pointer text-sm gap-1.5 transition-all ${
            guardado
              ? "bg-[#3fa87c] text-white"
              : "bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white"
          }`}
        >
          {guardado ? (
            <><CheckCircle2 className="h-4 w-4" /> Guardado</>
          ) : guardando ? (
            <><Save className="h-4 w-4 animate-pulse" /> Guardando...</>
          ) : (
            <><Save className="h-4 w-4" /> Guardar Cambios</>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#d9534f]/10 border border-[#d9534f]/20 text-[#d9534f] text-xs font-medium rounded-lg px-4 py-2.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── GRID: 2 columns on desktop ── */}
      <div className="grid lg:grid-cols-2 gap-3">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COL 1: IDENTIDAD + CONTACTO (merged) */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Card className="border-[#c8dce8] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#4a7fa5]" />
              Clínica y Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Logo + Nombre + Slogan */}
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 rounded-xl bg-[#f0f4f7] border border-[#c8dce8] flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/images/logo-kaya-kalp.webp"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="h-10 w-10 object-contain"
                />
                <button className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer rounded-xl">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Nombre</Label>
                  <Input
                    value={config.nombre}
                    onChange={(e) => updateConfig("nombre", e.target.value)}
                    className="border-[#c8dce8] text-sm h-8 mt-0.5"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Slogan</Label>
                  <Input
                    value={config.slogan}
                    onChange={(e) => updateConfig("slogan", e.target.value)}
                    placeholder="Ej. Dando vida a tu cuerpo"
                    className="border-[#c8dce8] text-sm h-8 mt-0.5"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#e4ecf2]" />

            {/* Contacto */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Teléfono</Label>
                  <div className="relative mt-0.5">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#1e2d3a]/25" />
                    <Input
                      value={config.telefono}
                      onChange={(e) => updateConfig("telefono", e.target.value)}
                      className="pl-7 border-[#c8dce8] text-sm h-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">WhatsApp</Label>
                  <div className="relative mt-0.5">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#3fa87c]/50" />
                    <Input
                      value={config.whatsapp}
                      onChange={(e) => updateConfig("whatsapp", e.target.value)}
                      className="pl-7 border-[#c8dce8] text-sm h-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Email</Label>
                  <div className="relative mt-0.5">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#1e2d3a]/25" />
                    <Input
                      value={config.email}
                      onChange={(e) => updateConfig("email", e.target.value)}
                      className="pl-7 border-[#c8dce8] text-sm h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Facebook</Label>
                  <div className="relative mt-0.5">
                    <Facebook className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#1877F2]/50" />
                    <Input
                      value={config.facebook}
                      onChange={(e) => updateConfig("facebook", e.target.value)}
                      className="pl-7 border-[#c8dce8] text-sm h-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Instagram</Label>
                  <div className="relative mt-0.5">
                    <Instagram className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#E4405F]/50" />
                    <Input
                      value={config.instagram}
                      onChange={(e) => updateConfig("instagram", e.target.value)}
                      className="pl-7 border-[#c8dce8] text-sm h-8"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Sitio Web</Label>
                  <div className="relative mt-0.5">
                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#1e2d3a]/25" />
                    <Input
                      value={config.sitioWeb}
                      onChange={(e) => updateConfig("sitioWeb", e.target.value)}
                      className="pl-7 border-[#c8dce8] text-sm h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COL 2: UBICACIÓN + DÍAS BLOQUEADOS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          {/* ── Ubicación ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#4a7fa5]" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Dirección</Label>
                <Input
                  value={config.direccion}
                  onChange={(e) => updateConfig("direccion", e.target.value)}
                  className="border-[#c8dce8] text-sm h-8 mt-0.5"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Ciudad</Label>
                  <Input
                    value={config.ciudad}
                    onChange={(e) => updateConfig("ciudad", e.target.value)}
                    className="border-[#c8dce8] text-sm h-8 mt-0.5"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Estado</Label>
                  <Input
                    value={config.estado}
                    onChange={(e) => updateConfig("estado", e.target.value)}
                    className="border-[#c8dce8] text-sm h-8 mt-0.5"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">C.P.</Label>
                  <Input
                    value={config.codigoPostal}
                    onChange={(e) => updateConfig("codigoPostal", e.target.value)}
                    className="border-[#c8dce8] text-sm h-8 mt-0.5"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Google Maps URL</Label>
                <Input
                  value={config.googleMapsUrl}
                  onChange={(e) => updateConfig("googleMapsUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="border-[#c8dce8] text-sm h-8 mt-0.5"
                />
              </div>
            </CardContent>
          </Card>
          {/* ── Días Bloqueados ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <CalendarOff className="h-4 w-4 text-[#d9534f]" />
                Días Bloqueados
              </CardTitle>
              <CardDescription className="text-[11px] text-[#1e2d3a]/50">
                Bloquea por terapeuta y por rango horario — útil para citas médicas, descansos parciales, vacaciones, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Fecha</Label>
                    <Input
                      type="date"
                      value={nuevoBloqueo.fecha}
                      onChange={(e) => setNuevoBloqueo((p) => ({ ...p, fecha: e.target.value }))}
                      className="border-[#c8dce8] text-sm h-8 mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Motivo</Label>
                    <Input
                      value={nuevoBloqueo.motivo}
                      onChange={(e) => setNuevoBloqueo((p) => ({ ...p, motivo: e.target.value }))}
                      placeholder="Ej. Consulta médica, vacaciones"
                      className="border-[#c8dce8] text-sm h-8 mt-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Desde (opcional)</Label>
                    <Input
                      type="time"
                      value={nuevoBloqueo.horaInicio}
                      onChange={(e) => setNuevoBloqueo((p) => ({ ...p, horaInicio: e.target.value }))}
                      className="border-[#c8dce8] text-sm h-8 mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Hasta (opcional)</Label>
                    <Input
                      type="time"
                      value={nuevoBloqueo.horaFin}
                      onChange={(e) => setNuevoBloqueo((p) => ({ ...p, horaFin: e.target.value }))}
                      className="border-[#c8dce8] text-sm h-8 mt-0.5"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#1e2d3a]/40 -mt-1">Si dejas las horas vacías, se bloquea el día completo.</p>

                {terapeutas.length > 0 && (
                  <div>
                    <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Terapeutas afectados</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setNuevoBloqueo((p) => ({ ...p, fisioIds: [] }))}
                        className={`cursor-pointer text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                          nuevoBloqueo.fisioIds.length === 0
                            ? "bg-[#4a7fa5] border-[#4a7fa5] text-white"
                            : "bg-white border-[#c8dce8] text-[#1e2d3a]/70 hover:bg-[#f0f4f7]"
                        }`}
                      >
                        Todos
                      </button>
                      {terapeutas.map((t) => {
                        const selected = nuevoBloqueo.fisioIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() =>
                              setNuevoBloqueo((p) => ({
                                ...p,
                                fisioIds: selected
                                  ? p.fisioIds.filter((id) => id !== t.id)
                                  : [...p.fisioIds, t.id],
                              }))
                            }
                            className={`cursor-pointer text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                              selected
                                ? "bg-[#4a7fa5] border-[#4a7fa5] text-white"
                                : "bg-white border-[#c8dce8] text-[#1e2d3a]/70 hover:bg-[#f0f4f7]"
                            }`}
                          >
                            {t.nombre}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer h-8 w-full border-[#c8dce8] text-[#4a7fa5] hover:bg-[#4a7fa5]/10 gap-1.5"
                  disabled={!nuevoBloqueo.fecha}
                  onClick={() => {
                    if (!nuevoBloqueo.fecha) return;
                    const horaInicio = nuevoBloqueo.horaInicio || undefined;
                    const horaFin = nuevoBloqueo.horaFin || undefined;
                    if ((horaInicio && !horaFin) || (!horaInicio && horaFin)) {
                      setError("Debes definir ambas horas o dejar las dos vacías");
                      return;
                    }
                    if (horaInicio && horaFin && horaInicio >= horaFin) {
                      setError("La hora de inicio debe ser anterior a la hora de fin");
                      return;
                    }
                    setError(null);
                    setDiasBloqueados((prev) => [
                      ...prev,
                      {
                        fecha: nuevoBloqueo.fecha,
                        motivo: nuevoBloqueo.motivo || "Bloqueado",
                        fisioIds: nuevoBloqueo.fisioIds.length > 0 ? nuevoBloqueo.fisioIds : undefined,
                        horaInicio,
                        horaFin,
                      },
                    ]);
                    setNuevoBloqueo({ fecha: "", motivo: "", fisioIds: [], horaInicio: "", horaFin: "" });
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Agregar bloqueo
                </Button>

                {diasBloqueados.length === 0 ? (
                  <p className="text-[11px] text-[#1e2d3a]/30 text-center py-3">
                    No hay días bloqueados
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto mt-2">
                    {diasBloqueados
                      .slice()
                      .sort((a, b) => a.fecha.localeCompare(b.fecha))
                      .map((d, idx) => {
                        const dateObj = new Date(d.fecha + "T12:00:00");
                        const label = dateObj.toLocaleDateString("es-MX", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                        const fisioLabel =
                          !d.fisioIds || d.fisioIds.length === 0
                            ? "Todos"
                            : terapeutas
                                .filter((t) => d.fisioIds!.includes(t.id))
                                .map((t) => t.nombre)
                                .join(", ");
                        const horarioLabel =
                          d.horaInicio && d.horaFin ? `${d.horaInicio}–${d.horaFin}` : "Día completo";
                        return (
                          <div
                            key={`${d.fecha}-${idx}`}
                            className="flex items-start gap-3 bg-[#d9534f]/5 border border-[#d9534f]/10 rounded-lg px-3 py-2"
                          >
                            <CalendarOff className="h-3.5 w-3.5 text-[#d9534f] shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-[#1e2d3a] capitalize">{label}</div>
                              <div className="text-[10px] text-[#1e2d3a]/60 mt-0.5">
                                {horarioLabel} · {fisioLabel}
                              </div>
                              {d.motivo && d.motivo !== "Bloqueado" && (
                                <div className="text-[10px] text-[#1e2d3a]/40 mt-0.5 italic">{d.motivo}</div>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                setDiasBloqueados((prev) =>
                                  prev.filter((_, i) => i !== prev.indexOf(d))
                                )
                              }
                              className="cursor-pointer text-[#1e2d3a]/25 hover:text-[#d9534f] transition-colors shrink-0"
                              aria-label={`Eliminar bloqueo ${label}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* INTEGRACIONES */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="text-sm font-bold text-[#1e2d3a] mb-3 flex items-center gap-2">
          <Unplug className="h-4 w-4 text-[#4a7fa5]" />
          Integraciones
        </h2>
        <WhatsAppPanel pacientes={pacientes} />
      </div>

      {/* ── FULL WIDTH: Horarios del Equipo ── */}
      {terapeutas.length > 0 && (
        <HorariosPanel terapeutas={terapeutas} />
      )}
    </div>
  );
}
