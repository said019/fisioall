"use client";

import { useState } from "react";
import {
  User,
  Building2,
  Clock,
  Users,
  CreditCard,
  Save,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  Stethoscope,
  Plus,
  Trash2,
  Pencil,
  Download,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const ESPECIALIDADES_MOCK = [
  "Fisioterapia",
  "Masajes Terapéuticos",
  "Tratamientos Faciales",
  "Tratamientos Corporales",
  "Suelo Pélvico",
  "Epilación",
];

const HORARIOS = [
  { dia: "Lunes",     activo: true,  inicio: "08:00", fin: "18:00" },
  { dia: "Martes",    activo: true,  inicio: "08:00", fin: "18:00" },
  { dia: "Miércoles", activo: true,  inicio: "08:00", fin: "17:00" },
  { dia: "Jueves",    activo: true,  inicio: "08:00", fin: "18:00" },
  { dia: "Viernes",   activo: true,  inicio: "08:00", fin: "15:00" },
  { dia: "Sábado",    activo: true,  inicio: "09:00", fin: "13:00" },
  { dia: "Domingo",   activo: false, inicio: "—",     fin: "—"     },
];

const COLORES_CLINICA = ["bg-[#4a7fa5]", "bg-emerald-500", "bg-violet-500", "bg-orange-500", "bg-pink-500"];

const EQUIPO_MOCK = [
  { id: "e1", nombre: "L.F.T. Paola Ríos",   iniciales: "PA", rol: "Administrador / Fisioterapeuta", ultimoAcceso: "Hoy, 09:15" },
  { id: "e2", nombre: "L.F.T. Gaby Sánchez",  iniciales: "GS", rol: "Fisioterapeuta",                ultimoAcceso: "Hoy, 10:30" },
  { id: "e3", nombre: "L.F.T. Jenni Morales", iniciales: "JM", rol: "Fisioterapeuta / Facialista",   ultimoAcceso: "Ayer, 17:00" },
];

const FACTURAS_MOCK = [
  { id: "f1", fecha: "15 Feb 2026", concepto: "Plan Pro — Febrero 2026",  monto: 599 },
  { id: "f2", fecha: "15 Ene 2026", concepto: "Plan Pro — Enero 2026",    monto: 599 },
  { id: "f3", fecha: "15 Dic 2025", concepto: "Plan Pro — Diciembre 2025", monto: 599 },
];

const FEATURES_PRO = [
  "Pacientes ilimitados",
  "Membresías y cobros",
  "Notificaciones WhatsApp",
  "Reportes avanzados",
  "Soporte prioritario",
  "Exportar a PDF",
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ConfiguracionPage() {
  const [guardado, setGuardado] = useState(false);
  const [horarios, setHorarios] = useState(HORARIOS);
  const [colorClinica, setColorClinica] = useState("bg-[#4a7fa5]");
  const [modoClinica, setModoClinica] = useState(true);
  const [openInvitar, setOpenInvitar] = useState(false);
  const [especialidades, setEspecialidades] = useState(ESPECIALIDADES_MOCK.slice(0, 2));

  const handleGuardar = () => {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const toggleDia = (dia: string) => {
    setHorarios((prev) =>
      prev.map((h) => (h.dia === dia ? { ...h, activo: !h.activo } : h))
    );
  };

  const toggleEspecialidad = (e: string) => {
    setEspecialidades((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  };

  const calcHoras = (inicio: string, fin: string): string => {
    if (inicio === "—" || fin === "—") return "0";
    const [hi, mi] = inicio.split(":").map(Number);
    const [hf, mf] = fin.split(":").map(Number);
    return String(hf - hi + (mf - mi) / 60);
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#f0f4f7] min-h-full">
      {/* ── Dialog Invitar ── */}
      <Dialog open={openInvitar} onOpenChange={setOpenInvitar}>
        <DialogContent className="max-w-sm border-[#c8dce8]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#1e2d3a]">Invitar Fisioterapeuta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]">Correo electrónico</Label>
              <Input placeholder="correo@ejemplo.com" className="border-[#a8cfe0] text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]">Rol</Label>
              <Select>
                <SelectTrigger className="border-[#a8cfe0] text-sm">
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                  <SelectItem value="asistente">Asistente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenInvitar(false)} className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] text-sm">
              Cancelar
            </Button>
            <Button onClick={() => setOpenInvitar(false)} className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white text-sm">
              Enviar Invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e2d3a]">Configuración</h1>
          <p className="text-xs text-[#1e2d3a]/50 mt-0.5">
            Administra tu perfil, clínica, horarios, equipo y facturación
          </p>
        </div>
        <Button
          onClick={handleGuardar}
          className={`cursor-pointer transition-all duration-200 text-sm gap-1.5 ${
            guardado
              ? "bg-[#3fa87c] hover:bg-[#3fa87c] text-white"
              : "bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white"
          }`}
        >
          {guardado ? (
            <><CheckCircle2 className="h-4 w-4" /> Guardado</>
          ) : (
            <><Save className="h-4 w-4" /> Guardar Cambios</>
          )}
        </Button>
      </div>

      {/* ── TABS ── */}
      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="bg-white border border-[#c8dce8] p-1 h-auto flex-wrap">
          <TabsTrigger value="perfil" className="cursor-pointer data-[state=active]:bg-[#4a7fa5] data-[state=active]:text-white text-xs gap-1.5">
            <User className="h-3.5 w-3.5" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="clinica" className="cursor-pointer data-[state=active]:bg-[#4a7fa5] data-[state=active]:text-white text-xs gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Clínica
          </TabsTrigger>
          <TabsTrigger value="horarios" className="cursor-pointer data-[state=active]:bg-[#4a7fa5] data-[state=active]:text-white text-xs gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Horarios
          </TabsTrigger>
          <TabsTrigger value="equipo" className="cursor-pointer data-[state=active]:bg-[#4a7fa5] data-[state=active]:text-white text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" /> Equipo
          </TabsTrigger>
          <TabsTrigger value="facturacion" className="cursor-pointer data-[state=active]:bg-[#4a7fa5] data-[state=active]:text-white text-xs gap-1.5">
            <CreditCard className="h-3.5 w-3.5" /> Facturación
          </TabsTrigger>
        </TabsList>

        {/* ── TAB PERFIL ── */}
        <TabsContent value="perfil" className="space-y-4">
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#1e2d3a]">Datos del Profesional</CardTitle>
              <CardDescription className="text-xs text-[#1e2d3a]/50">Información que aparece en recibos y comunicaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Avatar grande */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-[#a8cfe0]">
                    <AvatarFallback className="bg-[#4a7fa5] text-white text-2xl font-bold">PA</AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#4a7fa5] flex items-center justify-center cursor-pointer hover:bg-[#4a7fa5]/80 transition-all duration-200 shadow">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-bold text-[#1e2d3a]">L.F.T. Paola Ríos</p>
                  <p className="text-xs text-[#1e2d3a]/50">Fisioterapeuta Certificada CONOCER · Administradora</p>
                  <Badge variant="outline" className="mt-1 text-[10px] bg-[#4a7fa5]/10 text-[#4a7fa5] border-[#4a7fa5]/20">
                    Plan Pro · Activo
                  </Badge>
                </div>
              </div>

              {/* Campos */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Nombre</Label>
                  <Input defaultValue="Paola" className="border-[#c8dce8] text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Apellidos</Label>
                  <Input defaultValue="Ríos" className="border-[#c8dce8] text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/30" />
                    <Input defaultValue="paola@kayakalp.com.mx" disabled className="pl-9 border-[#c8dce8] text-sm bg-gray-50 opacity-60" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/30" />
                    <Input defaultValue="427 274 0000" className="pl-9 border-[#c8dce8] text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Cédula Profesional</Label>
                  <Input defaultValue="8724591" className="border-[#c8dce8] text-sm" />
                </div>
              </div>

              {/* Especialidades multi-select */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Especialidades</Label>
                <div className="flex flex-wrap gap-2">
                  {ESPECIALIDADES_MOCK.map((e) => {
                    const activa = especialidades.includes(e);
                    return (
                      <button
                        key={e}
                        onClick={() => toggleEspecialidad(e)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all duration-200 ${
                          activa
                            ? "bg-[#f0f4f7] border-[#4a7fa5] text-[#4a7fa5]"
                            : "bg-white border-gray-200 text-[#1e2d3a]/50 hover:border-[#a8cfe0]"
                        }`}
                      >
                        {activa && <CheckCircle2 className="inline h-3 w-3 mr-1 -mt-0.5" />}
                        {e}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Bio</Label>
                <textarea
                  defaultValue="Licenciada en Fisioterapia con certificación CONOCER ante la SEP. Especialista en fisioterapia, masajes terapéuticos, tratamientos faciales y corporales. Fundadora de Kaya Kalp — Dando vida a tu cuerpo."
                  rows={3}
                  className="w-full rounded-lg border border-[#c8dce8] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#4a7fa5] transition-colors resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB CLÍNICA ── */}
        <TabsContent value="clinica" className="space-y-4">
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#1e2d3a]">Datos del Consultorio</CardTitle>
              <CardDescription className="text-xs text-[#1e2d3a]/50">Información visible para pacientes y documentos oficiales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Nombre del Consultorio</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/30" />
                    <Input defaultValue="Kaya Kalp — Dando vida a tu cuerpo" className="pl-9 border-[#c8dce8] text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/30" />
                    <Input defaultValue="427 274 0000" className="pl-9 border-[#c8dce8] text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/30" />
                    <Input defaultValue="contacto@kayakalp.com.mx" className="pl-9 border-[#c8dce8] text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1e2d3a]/30" />
                    <Input defaultValue="San Juan del Río, Centro" className="pl-9 border-[#c8dce8] text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Ciudad</Label>
                  <Input defaultValue="San Juan del Río" className="border-[#c8dce8] text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]">Estado</Label>
                  <Input defaultValue="Querétaro" className="border-[#c8dce8] text-sm" />
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Color de marca</Label>
                <div className="flex items-center gap-2">
                  {COLORES_CLINICA.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColorClinica(c)}
                      className={`h-8 w-8 rounded-full ${c} cursor-pointer transition-all duration-200 ${
                        colorClinica === c
                          ? "ring-2 ring-offset-2 ring-[#1e2d3a]/40 scale-110"
                          : "hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Upload logo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Logo del consultorio</Label>
                <div className="border-dashed border-2 border-[#a8cfe0] rounded-xl p-6 text-center cursor-pointer hover:border-[#4a7fa5] transition-all duration-200">
                  <Camera className="h-6 w-6 text-[#4a7fa5]/40 mx-auto mb-1.5" />
                  <p className="text-xs text-[#1e2d3a]/50">Arrastra o haz clic · PNG, SVG</p>
                </div>
              </div>

              {/* Toggle modo clínica */}
              <div
                onClick={() => setModoClinica(!modoClinica)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#f0f4f7] border border-[#c8dce8] cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-[#1e2d3a]">Modo Clínica</p>
                  <p className="text-[10px] text-[#1e2d3a]/50">Habilita funciones multi-fisioterapeuta y equipo</p>
                </div>
                <div className={`h-5 w-9 rounded-full transition-all duration-200 flex items-center px-0.5 ${modoClinica ? "bg-[#3fa87c]" : "bg-gray-300"}`}>
                  <div className={`h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${modoClinica ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB HORARIOS ── */}
        <TabsContent value="horarios" className="space-y-4">
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#1e2d3a]">Horario de Atención</CardTitle>
              <CardDescription className="text-xs text-[#1e2d3a]/50">Define tus horas de trabajo para el agendamiento de citas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {horarios.map((h) => (
                <div
                  key={h.dia}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all ${
                    h.activo ? "bg-[#e4ecf2]/50" : "bg-[#1e2d3a]/5 opacity-50"
                  }`}
                >
                  {/* Switch */}
                  <div
                    onClick={() => toggleDia(h.dia)}
                    className={`h-5 w-9 rounded-full transition-all duration-200 flex items-center px-0.5 cursor-pointer shrink-0 ${
                      h.activo ? "bg-[#3fa87c]" : "bg-gray-300"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${h.activo ? "translate-x-4" : "translate-x-0"}`} />
                  </div>

                  <div className="w-24 shrink-0">
                    <p className={`text-sm font-semibold ${h.activo ? "text-[#1e2d3a]" : "text-[#1e2d3a]/40"}`}>{h.dia}</p>
                  </div>

                  {h.activo ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Select defaultValue={h.inicio}>
                        <SelectTrigger className="w-24 border-[#c8dce8] text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["07:00","08:00","09:00","10:00","11:00","12:00"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-[#1e2d3a]/40">–</span>
                      <Select defaultValue={h.fin}>
                        <SelectTrigger className="w-24 border-[#c8dce8] text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-[10px] text-[#1e2d3a]/40 ml-2">
                        {calcHoras(h.inicio, h.fin)}h activo
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#1e2d3a]/30 flex-1">No laborable</span>
                  )}

                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${
                      h.activo
                        ? "bg-[#3fa87c]/10 text-[#3fa87c] border-[#3fa87c]/20"
                        : "bg-[#1e2d3a]/5 text-[#1e2d3a]/30 border-[#1e2d3a]/10"
                    }`}
                  >
                    {h.activo ? "Activo" : "Cerrado"}
                  </Badge>
                </div>
              ))}

              {/* Duración default */}
              <div className="mt-4 pt-4 border-t border-[#c8dce8] flex items-center gap-3">
                <Label className="text-xs font-semibold text-[#1e2d3a] whitespace-nowrap">
                  Duración default de cita:
                </Label>
                <Input type="number" defaultValue={45} className="w-20 border-[#c8dce8] text-sm h-8" />
                <span className="text-xs text-[#1e2d3a]/50">min</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB EQUIPO ── */}
        <TabsContent value="equipo" className="space-y-4">
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[#1e2d3a]">Miembros del Equipo</CardTitle>
                <CardDescription className="text-xs text-[#1e2d3a]/50">Gestiona quiénes tienen acceso a tu consultorio</CardDescription>
              </div>
              <Button
                onClick={() => setOpenInvitar(true)}
                className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white text-sm gap-1.5 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Invitar Fisioterapeuta
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#c8dce8] bg-[#f0f4f7]/50">
                    <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase">Miembro</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase">Rol</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase hidden sm:table-cell">Último Acceso</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EQUIPO_MOCK.map((m) => (
                    <TableRow key={m.id} className="border-[#c8dce8] hover:bg-[#f0f4f7]/30 transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-[#4a7fa5]/10 text-[#4a7fa5] text-[9px] font-bold">{m.iniciales}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold text-[#1e2d3a]">{m.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={`text-[10px] ${
                          m.rol === "Fisioterapeuta"
                            ? "bg-[#e4ecf2] text-cyan-700 border-[#a8cfe0]"
                            : "bg-violet-50 text-violet-700 border-violet-200"
                        }`}>
                          {m.rol}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 hidden sm:table-cell">
                        <span className="text-xs text-[#1e2d3a]/50">{m.ultimoAcceso}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer hover:bg-[#e4ecf2]">
                            <Pencil className="h-3.5 w-3.5 text-[#1e2d3a]/40" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB FACTURACIÓN ── */}
        <TabsContent value="facturacion" className="space-y-4">
          {/* Plan actual */}
          <Card className="border-[#c8dce8] bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-[#1e2d3a]">Plan Actual</p>
                    <Badge className="bg-[#4a7fa5] text-white border-0 text-[10px]">Pro</Badge>
                  </div>
                  <p className="text-[10px] text-[#1e2d3a]/50 mb-3">
                    Próximo cobro: <span className="font-semibold text-[#1e2d3a]">$599 MXN</span> el 15 Mar 2026
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                    {FEATURES_PRO.map((f) => (
                      <div key={f} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="text-[11px] text-[#1e2d3a]/70">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] text-xs transition-all duration-200">
                  Cambiar plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Facturas */}
          <Card className="border-[#c8dce8] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#1e2d3a]">Historial de Facturas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#c8dce8] bg-[#f0f4f7]/50">
                    <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase">Fecha</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase">Concepto</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#1e2d3a]/50 uppercase text-right">Monto</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FACTURAS_MOCK.map((f) => (
                    <TableRow key={f.id} className="border-[#c8dce8] hover:bg-[#f0f4f7]/30 transition-colors">
                      <TableCell className="py-3">
                        <span className="text-xs font-medium text-[#1e2d3a]">{f.fecha}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs text-[#1e2d3a]/60">{f.concepto}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm font-bold text-[#1e2d3a]">${f.monto}.00</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs cursor-pointer text-[#4a7fa5] hover:bg-[#e4ecf2] gap-1">
                          <Download className="h-3 w-3" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
