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
  type ConfigClinicaData,
  type HorarioDiaData,
  type ConfigComidaData,
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
export default function ConfiguracionClient({ initial }: { initial: ConfigCompleta }) {
  const [config, setConfig] = useState<ConfigClinica>(initial.clinica);
  const [horarios, setHorarios] = useState<HorarioDia[]>(
    initial.horarios.map((h) => ({ ...h, dia: DIA_LABELS[h.diaKey] ?? h.diaKey }))
  );
  const [comida, setComida] = useState<ConfigComida>(initial.comida);
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
        </div>
      </div>
    </div>
  );
}
