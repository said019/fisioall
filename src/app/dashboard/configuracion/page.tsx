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
  "Fisioterapia Deportiva",
  "Rehabilitación Neurológica",
  "Terapia Manual",
  "Fisioterapia Geriátrica",
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

const COLORES_CLINICA = ["bg-[#0891B2]", "bg-emerald-500", "bg-violet-500", "bg-orange-500", "bg-pink-500"];

const EQUIPO_MOCK = [
  { id: "e1", nombre: "Dra. María López", iniciales: "ML", rol: "Fisioterapeuta", ultimoAcceso: "Hoy, 09:15" },
  { id: "e2", nombre: "Lic. Roberto Díaz", iniciales: "RD", rol: "Asistente",      ultimoAcceso: "Ayer, 17:30" },
  { id: "e3", nombre: "Dr. Ana Torres",    iniciales: "AT", rol: "Fisioterapeuta", ultimoAcceso: "22 Feb, 14:00" },
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
  const [colorClinica, setColorClinica] = useState("bg-[#0891B2]");
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
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#ECFEFF] min-h-full">
      {/* ── Dialog Invitar ── */}
      <Dialog open={openInvitar} onOpenChange={setOpenInvitar}>
        <DialogContent className="max-w-sm border-cyan-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#164E63]">Invitar Fisioterapeuta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#164E63]">Correo electrónico</Label>
              <Input placeholder="correo@ejemplo.com" className="border-cyan-200 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#164E63]">Rol</Label>
              <Select>
                <SelectTrigger className="border-cyan-200 text-sm">
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
            <Button variant="outline" onClick={() => setOpenInvitar(false)} className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 text-sm">
              Cancelar
            </Button>
            <Button onClick={() => setOpenInvitar(false)} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white text-sm">
              Enviar Invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#164E63]">Configuración</h1>
          <p className="text-xs text-[#164E63]/50 mt-0.5">
            Administra tu perfil, clínica, horarios, equipo y facturación
          </p>
        </div>
        <Button
          onClick={handleGuardar}
          className={`cursor-pointer transition-all duration-200 text-sm gap-1.5 ${
            guardado
              ? "bg-[#059669] hover:bg-[#059669] text-white"
              : "bg-[#059669] hover:bg-[#059669]/90 text-white"
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
        <TabsList className="bg-white border border-cyan-100 p-1 h-auto flex-wrap">
          <TabsTrigger value="perfil" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white text-xs gap-1.5">
            <User className="h-3.5 w-3.5" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="clinica" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white text-xs gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Clínica
          </TabsTrigger>
          <TabsTrigger value="horarios" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white text-xs gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Horarios
          </TabsTrigger>
          <TabsTrigger value="equipo" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" /> Equipo
          </TabsTrigger>
          <TabsTrigger value="facturacion" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white text-xs gap-1.5">
            <CreditCard className="h-3.5 w-3.5" /> Facturación
          </TabsTrigger>
        </TabsList>

        {/* ── TAB PERFIL ── */}
        <TabsContent value="perfil" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#164E63]">Datos del Profesional</CardTitle>
              <CardDescription className="text-xs text-[#164E63]/50">Información que aparece en recibos y comunicaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Avatar grande */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-cyan-200">
                    <AvatarFallback className="bg-[#0891B2] text-white text-2xl font-bold">CM</AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#0891B2] flex items-center justify-center cursor-pointer hover:bg-[#0891B2]/80 transition-all duration-200 shadow">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-bold text-[#164E63]">Dr. Carlos Martínez Vega</p>
                  <p className="text-xs text-[#164E63]/50">Fisioterapeuta Certificado</p>
                  <Badge variant="outline" className="mt-1 text-[10px] bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20">
                    Plan Pro · Activo
                  </Badge>
                </div>
              </div>

              {/* Campos */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Nombre</Label>
                  <Input defaultValue="Carlos" className="border-cyan-100 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Apellidos</Label>
                  <Input defaultValue="Martínez Vega" className="border-cyan-100 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="carlos.martinez@clinica.com.mx" disabled className="pl-9 border-cyan-100 text-sm bg-gray-50 opacity-60" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="55 1234 5678" className="pl-9 border-cyan-100 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Cédula Profesional</Label>
                  <Input defaultValue="8724591" className="border-cyan-100 text-sm" />
                </div>
              </div>

              {/* Especialidades multi-select */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#164E63]">Especialidades</Label>
                <div className="flex flex-wrap gap-2">
                  {ESPECIALIDADES_MOCK.map((e) => {
                    const activa = especialidades.includes(e);
                    return (
                      <button
                        key={e}
                        onClick={() => toggleEspecialidad(e)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all duration-200 ${
                          activa
                            ? "bg-[#ECFEFF] border-[#0891B2] text-[#0891B2]"
                            : "bg-white border-gray-200 text-[#164E63]/50 hover:border-cyan-200"
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
                <Label className="text-xs font-semibold text-[#164E63]">Bio</Label>
                <textarea
                  defaultValue="Fisioterapeuta con 8 años de experiencia en rehabilitación deportiva y post-operatoria. Especialista en terapia manual y ejercicio terapéutico."
                  rows={3}
                  className="w-full rounded-lg border border-cyan-100 bg-white px-3 py-2 text-sm text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-[#0891B2] transition-colors resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB CLÍNICA ── */}
        <TabsContent value="clinica" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#164E63]">Datos del Consultorio</CardTitle>
              <CardDescription className="text-xs text-[#164E63]/50">Información visible para pacientes y documentos oficiales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-[#164E63]">Nombre del Consultorio</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="Centro de Fisioterapia Martínez" className="pl-9 border-cyan-100 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="55 9876 5432" className="pl-9 border-cyan-100 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="contacto@fisioterapiamartinez.com.mx" className="pl-9 border-cyan-100 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-[#164E63]">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="Av. Insurgentes Sur 1602, Col. Crédito Constructor" className="pl-9 border-cyan-100 text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Ciudad</Label>
                  <Input defaultValue="Ciudad de México" className="border-cyan-100 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Estado</Label>
                  <Input defaultValue="CDMX" className="border-cyan-100 text-sm" />
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#164E63]">Color de marca</Label>
                <div className="flex items-center gap-2">
                  {COLORES_CLINICA.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColorClinica(c)}
                      className={`h-8 w-8 rounded-full ${c} cursor-pointer transition-all duration-200 ${
                        colorClinica === c
                          ? "ring-2 ring-offset-2 ring-[#164E63]/40 scale-110"
                          : "hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Upload logo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#164E63]">Logo del consultorio</Label>
                <div className="border-dashed border-2 border-cyan-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#0891B2] transition-all duration-200">
                  <Camera className="h-6 w-6 text-[#0891B2]/40 mx-auto mb-1.5" />
                  <p className="text-xs text-[#164E63]/50">Arrastra o haz clic · PNG, SVG</p>
                </div>
              </div>

              {/* Toggle modo clínica */}
              <div
                onClick={() => setModoClinica(!modoClinica)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#ECFEFF] border border-cyan-100 cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-[#164E63]">Modo Clínica</p>
                  <p className="text-[10px] text-[#164E63]/50">Habilita funciones multi-fisioterapeuta y equipo</p>
                </div>
                <div className={`h-5 w-9 rounded-full transition-all duration-200 flex items-center px-0.5 ${modoClinica ? "bg-[#059669]" : "bg-gray-300"}`}>
                  <div className={`h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${modoClinica ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB HORARIOS ── */}
        <TabsContent value="horarios" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#164E63]">Horario de Atención</CardTitle>
              <CardDescription className="text-xs text-[#164E63]/50">Define tus horas de trabajo para el agendamiento de citas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {horarios.map((h) => (
                <div
                  key={h.dia}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all ${
                    h.activo ? "bg-cyan-50/50" : "bg-[#164E63]/5 opacity-50"
                  }`}
                >
                  {/* Switch */}
                  <div
                    onClick={() => toggleDia(h.dia)}
                    className={`h-5 w-9 rounded-full transition-all duration-200 flex items-center px-0.5 cursor-pointer shrink-0 ${
                      h.activo ? "bg-[#059669]" : "bg-gray-300"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${h.activo ? "translate-x-4" : "translate-x-0"}`} />
                  </div>

                  <div className="w-24 shrink-0">
                    <p className={`text-sm font-semibold ${h.activo ? "text-[#164E63]" : "text-[#164E63]/40"}`}>{h.dia}</p>
                  </div>

                  {h.activo ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Select defaultValue={h.inicio}>
                        <SelectTrigger className="w-24 border-cyan-100 text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["07:00","08:00","09:00","10:00","11:00","12:00"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-[#164E63]/40">–</span>
                      <Select defaultValue={h.fin}>
                        <SelectTrigger className="w-24 border-cyan-100 text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-[10px] text-[#164E63]/40 ml-2">
                        {calcHoras(h.inicio, h.fin)}h activo
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#164E63]/30 flex-1">No laborable</span>
                  )}

                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${
                      h.activo
                        ? "bg-[#059669]/10 text-[#059669] border-[#059669]/20"
                        : "bg-[#164E63]/5 text-[#164E63]/30 border-[#164E63]/10"
                    }`}
                  >
                    {h.activo ? "Activo" : "Cerrado"}
                  </Badge>
                </div>
              ))}

              {/* Duración default */}
              <div className="mt-4 pt-4 border-t border-cyan-100 flex items-center gap-3">
                <Label className="text-xs font-semibold text-[#164E63] whitespace-nowrap">
                  Duración default de cita:
                </Label>
                <Input type="number" defaultValue={45} className="w-20 border-cyan-100 text-sm h-8" />
                <span className="text-xs text-[#164E63]/50">min</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB EQUIPO ── */}
        <TabsContent value="equipo" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[#164E63]">Miembros del Equipo</CardTitle>
                <CardDescription className="text-xs text-[#164E63]/50">Gestiona quiénes tienen acceso a tu consultorio</CardDescription>
              </div>
              <Button
                onClick={() => setOpenInvitar(true)}
                className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white text-sm gap-1.5 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Invitar Fisioterapeuta
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-100 bg-[#ECFEFF]/50">
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Miembro</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Rol</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase hidden sm:table-cell">Último Acceso</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EQUIPO_MOCK.map((m) => (
                    <TableRow key={m.id} className="border-cyan-100 hover:bg-[#ECFEFF]/30 transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-[#0891B2]/10 text-[#0891B2] text-[9px] font-bold">{m.iniciales}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold text-[#164E63]">{m.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={`text-[10px] ${
                          m.rol === "Fisioterapeuta"
                            ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                            : "bg-violet-50 text-violet-700 border-violet-200"
                        }`}>
                          {m.rol}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 hidden sm:table-cell">
                        <span className="text-xs text-[#164E63]/50">{m.ultimoAcceso}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer hover:bg-cyan-50">
                            <Pencil className="h-3.5 w-3.5 text-[#164E63]/40" />
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
          <Card className="border-cyan-100 bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-[#164E63]">Plan Actual</p>
                    <Badge className="bg-[#0891B2] text-white border-0 text-[10px]">Pro</Badge>
                  </div>
                  <p className="text-[10px] text-[#164E63]/50 mb-3">
                    Próximo cobro: <span className="font-semibold text-[#164E63]">$599 MXN</span> el 15 Mar 2026
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                    {FEATURES_PRO.map((f) => (
                      <div key={f} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="text-[11px] text-[#164E63]/70">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 text-xs transition-all duration-200">
                  Cambiar plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Facturas */}
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#164E63]">Historial de Facturas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-100 bg-[#ECFEFF]/50">
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Fecha</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Concepto</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase text-right">Monto</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FACTURAS_MOCK.map((f) => (
                    <TableRow key={f.id} className="border-cyan-100 hover:bg-[#ECFEFF]/30 transition-colors">
                      <TableCell className="py-3">
                        <span className="text-xs font-medium text-[#164E63]">{f.fecha}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs text-[#164E63]/60">{f.concepto}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm font-bold text-[#164E63]">${f.monto}.00</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs cursor-pointer text-[#0891B2] hover:bg-cyan-50 gap-1">
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
