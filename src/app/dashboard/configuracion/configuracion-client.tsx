"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Apple,
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
  const [nuevoBloqueo, setNuevoBloqueo] = useState({ fecha: "", motivo: "" });
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
                Vacaciones, festivos y cierres — no se podrán agendar citas estos días
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Fecha</Label>
                    <Input
                      type="date"
                      value={nuevoBloqueo.fecha}
                      onChange={(e) => setNuevoBloqueo((p) => ({ ...p, fecha: e.target.value }))}
                      className="border-[#c8dce8] text-sm h-8 mt-0.5"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] font-semibold text-[#1e2d3a]/60">Motivo</Label>
                    <Input
                      value={nuevoBloqueo.motivo}
                      onChange={(e) => setNuevoBloqueo((p) => ({ ...p, motivo: e.target.value }))}
                      placeholder="Ej. Vacaciones, día festivo"
                      className="border-[#c8dce8] text-sm h-8 mt-0.5"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer h-8 px-2.5 border-[#c8dce8] text-[#4a7fa5] hover:bg-[#4a7fa5]/10"
                    disabled={!nuevoBloqueo.fecha}
                    onClick={() => {
                      if (!nuevoBloqueo.fecha) return;
                      if (diasBloqueados.some((d) => d.fecha === nuevoBloqueo.fecha)) return;
                      setDiasBloqueados((prev) => [...prev, { fecha: nuevoBloqueo.fecha, motivo: nuevoBloqueo.motivo || "Bloqueado" }]);
                      setNuevoBloqueo({ fecha: "", motivo: "" });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {diasBloqueados.length === 0 ? (
                  <p className="text-[11px] text-[#1e2d3a]/30 text-center py-3">
                    No hay días bloqueados
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto mt-3">
                    {diasBloqueados
                      .sort((a, b) => a.fecha.localeCompare(b.fecha))
                      .map((d) => {
                        const dateObj = new Date(d.fecha + "T12:00:00");
                        const label = dateObj.toLocaleDateString("es-MX", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                        return (
                          <div
                            key={d.fecha}
                            className="flex items-center gap-3 bg-[#d9534f]/5 border border-[#d9534f]/10 rounded-lg px-3 py-2"
                          >
                            <CalendarOff className="h-3.5 w-3.5 text-[#d9534f] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-[#1e2d3a] capitalize">{label}</span>
                              <span className="text-[10px] text-[#1e2d3a]/40 ml-2">{d.motivo}</span>
                            </div>
                            <button
                              onClick={() => setDiasBloqueados((prev) => prev.filter((x) => x.fecha !== d.fecha))}
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
      {/* INTEGRACIONES — full width, 2 cols */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="text-sm font-bold text-[#1e2d3a] mb-3 flex items-center gap-2">
          <Unplug className="h-4 w-4 text-[#4a7fa5]" />
          Integraciones
        </h2>
        <div className="grid lg:grid-cols-2 gap-3">
          {/* ── Apple Calendar / Suscripción de agenda ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <Apple className="h-4 w-4 text-[#1e2d3a]" />
                Calendario en tu dispositivo
              </CardTitle>
              <CardDescription className="text-[11px] text-[#1e2d3a]/50">
                Suscribe esta agenda a tu Apple Calendar, Google Calendar u Outlook — se actualiza sola.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ol className="space-y-1.5 text-xs text-[#1e2d3a]/70 list-decimal pl-5">
                  <li>Abre la página de suscripción.</li>
                  <li>Copia la URL (<code className="bg-[#f0f4f7] px-1 rounded text-[10px]">webcal://</code> para Apple o <code className="bg-[#f0f4f7] px-1 rounded text-[10px]">https://</code> para Google).</li>
                  <li>Pégala en tu app de calendario. Tus citas aparecerán automáticamente.</li>
                </ol>
                <Link href="/dashboard/calendar-subscribe" className="block">
                  <Button
                    variant="outline"
                    className="cursor-pointer w-full gap-2 border-[#c8dce8] text-[#1e2d3a] hover:bg-[#1e2d3a]/5 transition-all"
                  >
                    <Apple className="h-4 w-4" />
                    Abrir suscripción de calendario
                  </Button>
                </Link>
                <p className="text-[10px] text-[#1e2d3a]/35">
                  Funciona con iPhone, Mac, Android y cualquier cliente que soporte iCalendar (.ics).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── WhatsApp (Evolution API) ── */}
          <WhatsAppPanel pacientes={pacientes} />
        </div>
      </div>

      {/* ── FULL WIDTH: Horarios del Equipo ── */}
      {terapeutas.length > 0 && (
        <HorariosPanel terapeutas={terapeutas} />
      )}
    </div>
  );
}
