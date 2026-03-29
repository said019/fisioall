"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Clock,
  Save,
  Camera,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Globe,
  UtensilsCrossed,
  Facebook,
  Instagram,
  AlertCircle,
  CalendarOff,
  CalendarSync,
  Plus,
  Trash2,
  Unplug,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  guardarConfiguracion,
  disconnectGoogleCalendar,
  type ConfigClinicaData,
  type HorarioDiaData,
  type ConfigComidaData,
  type DiaBloqueadoData,
  type ConfigCompleta,
} from "./actions";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
interface HorarioDia extends HorarioDiaData {
  dia: string;
}

type ConfigClinica = ConfigClinicaData;
type ConfigComida = ConfigComidaData;

const DIA_LABELS: Record<string, string> = {
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
  jueves: "Jueves", viernes: "Viernes", sabado: "Sábado", domingo: "Domingo",
};

const HORAS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00",
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface GCalStatus {
  connected: boolean;
  email: string | null;
}

export default function ConfiguracionClient({ initial, gcalStatus }: { initial: ConfigCompleta; gcalStatus: GCalStatus }) {
  const [config, setConfig] = useState<ConfigClinica>(initial.clinica);
  const [horarios, setHorarios] = useState<HorarioDia[]>(
    initial.horarios.map((h) => ({ ...h, dia: DIA_LABELS[h.diaKey] ?? h.diaKey }))
  );
  const [comida, setComida] = useState<ConfigComida>(initial.comida);
  const [diasBloqueados, setDiasBloqueados] = useState<DiaBloqueadoData[]>(initial.diasBloqueados);
  const [nuevoBloqueo, setNuevoBloqueo] = useState({ fecha: "", motivo: "" });
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfig = (key: keyof ConfigClinica, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDia = (diaKey: string) => {
    setHorarios((prev) =>
      prev.map((h) => (h.diaKey === diaKey ? { ...h, activo: !h.activo } : h))
    );
  };

  const updateHorario = (diaKey: string, field: "inicio" | "fin", value: string) => {
    setHorarios((prev) =>
      prev.map((h) => (h.diaKey === diaKey ? { ...h, [field]: value } : h))
    );
  };

  const calcHoras = (inicio: string, fin: string): number => {
    const [hi, mi] = inicio.split(":").map(Number);
    const [hf, mf] = fin.split(":").map(Number);
    return hf - hi + (mf - mi) / 60;
  };

  const totalHorasSemana = horarios
    .filter((h) => h.activo)
    .reduce((sum, h) => sum + calcHoras(h.inicio, h.fin) - (comida.activo ? calcHoras(comida.inicio, comida.fin) : 0), 0);

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const result = await guardarConfiguracion({
        clinica: config,
        horarios: horarios.map(({ diaKey, activo, inicio, fin }) => ({ diaKey, activo, inicio, fin })),
        comida,
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
    <div className="space-y-6">
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
      <div className="grid lg:grid-cols-2 gap-5">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COL 1: CLÍNICA */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-5">
          {/* ── Identidad ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#4a7fa5]" />
                Identidad de la Clínica
              </CardTitle>
              <CardDescription className="text-[11px] text-[#1e2d3a]/50">
                Nombre y marca que aparecen en tu página, recibos y comunicaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-xl bg-[#f0f4f7] border border-[#c8dce8] flex items-center justify-center overflow-hidden shrink-0">
                  <Image
                    src="/images/logo-kaya-kalp.png"
                    alt="Logo"
                    width={60}
                    height={60}
                    className="h-12 w-12 object-contain"
                  />
                  <button className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer rounded-xl">
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div>
                    <Label className="text-xs font-semibold text-[#1e2d3a]">Nombre</Label>
                    <Input
                      value={config.nombre}
                      onChange={(e) => updateConfig("nombre", e.target.value)}
                      className="border-[#c8dce8] text-sm h-9 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#1e2d3a]">Slogan</Label>
                <Input
                  value={config.slogan}
                  onChange={(e) => updateConfig("slogan", e.target.value)}
                  placeholder="Ej. Dando vida a tu cuerpo"
                  className="border-[#c8dce8] text-sm h-9 mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Contacto ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#4a7fa5]" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Teléfono</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/25" />
                    <Input
                      value={config.telefono}
                      onChange={(e) => updateConfig("telefono", e.target.value)}
                      className="pl-8 border-[#c8dce8] text-sm h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">WhatsApp</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#3fa87c]/50" />
                    <Input
                      value={config.whatsapp}
                      onChange={(e) => updateConfig("whatsapp", e.target.value)}
                      className="pl-8 border-[#c8dce8] text-sm h-9"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#1e2d3a]">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/25" />
                  <Input
                    value={config.email}
                    onChange={(e) => updateConfig("email", e.target.value)}
                    className="pl-8 border-[#c8dce8] text-sm h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Facebook</Label>
                  <div className="relative mt-1">
                    <Facebook className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1877F2]/50" />
                    <Input
                      value={config.facebook}
                      onChange={(e) => updateConfig("facebook", e.target.value)}
                      className="pl-8 border-[#c8dce8] text-sm h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Instagram</Label>
                  <div className="relative mt-1">
                    <Instagram className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#E4405F]/50" />
                    <Input
                      value={config.instagram}
                      onChange={(e) => updateConfig("instagram", e.target.value)}
                      className="pl-8 border-[#c8dce8] text-sm h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Sitio Web</Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/25" />
                    <Input
                      value={config.sitioWeb}
                      onChange={(e) => updateConfig("sitioWeb", e.target.value)}
                      className="pl-8 border-[#c8dce8] text-sm h-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Ubicación ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#4a7fa5]" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-[#1e2d3a]">Dirección</Label>
                <Input
                  value={config.direccion}
                  onChange={(e) => updateConfig("direccion", e.target.value)}
                  className="border-[#c8dce8] text-sm h-9 mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Ciudad</Label>
                  <Input
                    value={config.ciudad}
                    onChange={(e) => updateConfig("ciudad", e.target.value)}
                    className="border-[#c8dce8] text-sm h-9 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Estado</Label>
                  <Input
                    value={config.estado}
                    onChange={(e) => updateConfig("estado", e.target.value)}
                    className="border-[#c8dce8] text-sm h-9 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">C.P.</Label>
                  <Input
                    value={config.codigoPostal}
                    onChange={(e) => updateConfig("codigoPostal", e.target.value)}
                    className="border-[#c8dce8] text-sm h-9 mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#1e2d3a]">Google Maps URL</Label>
                <Input
                  value={config.googleMapsUrl}
                  onChange={(e) => updateConfig("googleMapsUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="border-[#c8dce8] text-sm h-9 mt-1"
                />
                <p className="text-[10px] text-[#1e2d3a]/35 mt-1">Se muestra en tu landing como enlace de ubicación</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* COL 2: HORARIOS + CITAS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-5">
          {/* ── Horario semanal ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#4a7fa5]" />
                    Horario de Atención
                  </CardTitle>
                  <CardDescription className="text-[11px] text-[#1e2d3a]/50">
                    Horarios disponibles para agendar citas
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] bg-[#4a7fa5]/10 text-[#4a7fa5] border-[#4a7fa5]/20">
                  {Math.round(totalHorasSemana)}h / semana
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {horarios.map((h) => (
                <div
                  key={h.diaKey}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    h.activo ? "bg-[#f0f4f7]/60" : "opacity-40"
                  }`}
                >
                  <button
                    onClick={() => toggleDia(h.diaKey)}
                    className={`h-5 w-9 rounded-full transition-all flex items-center px-0.5 cursor-pointer shrink-0 ${
                      h.activo ? "bg-[#3fa87c]" : "bg-gray-300"
                    }`}
                    aria-label={`${h.activo ? "Desactivar" : "Activar"} ${h.dia}`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white shadow transition-all ${h.activo ? "translate-x-4" : "translate-x-0"}`} />
                  </button>

                  <span className={`text-xs font-semibold w-20 shrink-0 ${h.activo ? "text-[#1e2d3a]" : "text-[#1e2d3a]/40"}`}>
                    {h.dia}
                  </span>

                  {h.activo ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <Select value={h.inicio} onValueChange={(v) => updateHorario(h.diaKey, "inicio", v)}>
                        <SelectTrigger className="w-[80px] border-[#c8dce8] text-[11px] h-7 cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HORAS.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs cursor-pointer">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-[10px] text-[#1e2d3a]/30">—</span>
                      <Select value={h.fin} onValueChange={(v) => updateHorario(h.diaKey, "fin", v)}>
                        <SelectTrigger className="w-[80px] border-[#c8dce8] text-[11px] h-7 cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HORAS.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs cursor-pointer">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-[10px] text-[#1e2d3a]/30 ml-1">
                        {calcHoras(h.inicio, h.fin)}h
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#1e2d3a]/25 flex-1">Cerrado</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Hora de Comida ── */}
          <Card className={`border-[#c8dce8] bg-white transition-opacity ${!comida.activo ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-[#e89b3f]" />
                  Hora de Comida
                </CardTitle>
                <button
                  onClick={() => setComida((prev) => ({ ...prev, activo: !prev.activo }))}
                  className={`h-5 w-9 rounded-full transition-all flex items-center px-0.5 cursor-pointer shrink-0 ${
                    comida.activo ? "bg-[#3fa87c]" : "bg-gray-300"
                  }`}
                  aria-label="Toggle hora de comida"
                >
                  <div className={`h-4 w-4 rounded-full bg-white shadow transition-all ${comida.activo ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
              <CardDescription className="text-[11px] text-[#1e2d3a]/50">
                Este horario se bloquea automáticamente para no agendar citas
              </CardDescription>
            </CardHeader>
            {comida.activo && (
              <CardContent>
                <div className="flex items-center gap-3 bg-[#e89b3f]/5 border border-[#e89b3f]/15 rounded-lg px-4 py-3">
                  <UtensilsCrossed className="h-4 w-4 text-[#e89b3f] shrink-0" />
                  <div className="flex items-center gap-2 flex-1">
                    <Select value={comida.inicio} onValueChange={(v) => setComida((p) => ({ ...p, inicio: v }))}>
                      <SelectTrigger className="w-[90px] border-[#e89b3f]/20 text-xs h-8 bg-white cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HORAS.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs cursor-pointer">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-[#1e2d3a]/30">a</span>
                    <Select value={comida.fin} onValueChange={(v) => setComida((p) => ({ ...p, fin: v }))}>
                      <SelectTrigger className="w-[90px] border-[#e89b3f]/20 text-xs h-8 bg-white cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HORAS.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs cursor-pointer">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-[10px] text-[#e89b3f] font-semibold shrink-0">
                    {calcHoras(comida.inicio, comida.fin)}h
                  </span>
                </div>
                <div className="flex items-start gap-2 mt-2.5">
                  <AlertCircle className="h-3 w-3 text-[#1e2d3a]/25 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-[#1e2d3a]/35 leading-relaxed">
                    Los pacientes no podrán agendar citas durante este horario. Aplica a todos los días laborables.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* ── Días Bloqueados ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <CalendarOff className="h-4 w-4 text-[#d9534f]" />
                Días Bloqueados
              </CardTitle>
              <CardDescription className="text-[11px] text-[#1e2d3a]/50">
                Vacaciones, días festivos o cierres especiales — no se podrán agendar citas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Agregar nuevo */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Fecha</Label>
                  <Input
                    type="date"
                    value={nuevoBloqueo.fecha}
                    onChange={(e) => setNuevoBloqueo((p) => ({ ...p, fecha: e.target.value }))}
                    className="border-[#c8dce8] text-sm h-9 mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Motivo</Label>
                  <Input
                    value={nuevoBloqueo.motivo}
                    onChange={(e) => setNuevoBloqueo((p) => ({ ...p, motivo: e.target.value }))}
                    placeholder="Ej. Vacaciones, día festivo"
                    className="border-[#c8dce8] text-sm h-9 mt-1"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer h-9 px-3 border-[#c8dce8] text-[#4a7fa5] hover:bg-[#4a7fa5]/10"
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

              {/* Lista de días bloqueados */}
              {diasBloqueados.length === 0 ? (
                <p className="text-[11px] text-[#1e2d3a]/30 text-center py-3">
                  No hay días bloqueados
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
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
            </CardContent>
          </Card>

          {/* ── Citas ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#4a7fa5]" />
                Configuración de Citas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Duración default</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={config.duracionDefault}
                      onChange={(e) => updateConfig("duracionDefault", Number(e.target.value))}
                      className="border-[#c8dce8] text-sm h-9 w-20"
                    />
                    <span className="text-xs text-[#1e2d3a]/40">minutos</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Intervalo de slots</Label>
                  <Select
                    value={config.intervaloSlots.toString()}
                    onValueChange={(v) => updateConfig("intervaloSlots", Number(v))}
                  >
                    <SelectTrigger className="border-[#c8dce8] text-sm h-9 mt-1 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15" className="cursor-pointer text-xs">Cada 15 min</SelectItem>
                      <SelectItem value="30" className="cursor-pointer text-xs">Cada 30 min</SelectItem>
                      <SelectItem value="60" className="cursor-pointer text-xs">Cada 60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[10px] text-[#1e2d3a]/35">
                El intervalo determina cada cuánto se muestran opciones de hora al agendar (ej. 09:00, 09:30, 10:00...)
              </p>
            </CardContent>
          </Card>

          {/* ── Google Calendar ── */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
                <CalendarSync className="h-4 w-4 text-[#4285F4]" />
                Google Calendar
              </CardTitle>
              <CardDescription className="text-[11px] text-[#1e2d3a]/50">
                Sincroniza citas automáticamente con tu Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gcalStatus.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-[#3fa87c]/10 border border-[#3fa87c]/20 rounded-lg px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-[#3fa87c] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1e2d3a]">Conectado</p>
                      <p className="text-[10px] text-[#1e2d3a]/50 truncate">{gcalStatus.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-xs border-[#d9534f]/30 text-[#d9534f] hover:bg-[#d9534f]/10 gap-1.5"
                      onClick={async () => {
                        await disconnectGoogleCalendar();
                        window.location.reload();
                      }}
                    >
                      <Unplug className="h-3.5 w-3.5" />
                      Desconectar
                    </Button>
                  </div>
                  <p className="text-[10px] text-[#1e2d3a]/35">
                    Las citas creadas se sincronizan automáticamente. Los eventos de tu calendario bloquean horarios de agendamiento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#1e2d3a]/50">
                    Conecta tu cuenta de Google para sincronizar citas automáticamente y bloquear horarios ocupados.
                  </p>
                  <a href="/api/auth/google">
                    <Button
                      variant="outline"
                      className="cursor-pointer w-full gap-2 border-[#c8dce8] text-[#1e2d3a] hover:bg-[#4285F4]/10 hover:border-[#4285F4]/40 hover:text-[#4285F4] transition-all"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Conectar Google Calendar
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
