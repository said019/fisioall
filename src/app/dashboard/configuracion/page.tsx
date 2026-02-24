"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  Clock,
  Bell,
  Save,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const HORARIOS = [
  { dia: "Lunes",     activo: true,  inicio: "08:00", fin: "18:00" },
  { dia: "Martes",    activo: true,  inicio: "08:00", fin: "18:00" },
  { dia: "Miércoles", activo: true,  inicio: "08:00", fin: "17:00" },
  { dia: "Jueves",    activo: true,  inicio: "08:00", fin: "18:00" },
  { dia: "Viernes",   activo: true,  inicio: "08:00", fin: "15:00" },
  { dia: "Sábado",    activo: true,  inicio: "09:00", fin: "13:00" },
  { dia: "Domingo",   activo: false, inicio: "—",     fin: "—"     },
];

const NOTIFICACIONES = [
  { id: "n1", label: "Recordatorio de cita (24 hrs antes)", activo: true },
  { id: "n2", label: "Confirmación de cita por WhatsApp", activo: true },
  { id: "n3", label: "Membresía por vencer (7 días antes)", activo: true },
  { id: "n4", label: "Resumen diario de citas", activo: false },
  { id: "n5", label: "Reporte semanal de ingresos", activo: false },
];

export default function ConfiguracionPage() {
  const [guardado, setGuardado] = useState(false);
  const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES);

  const handleGuardar = () => {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const toggleNotif = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, activo: !n.activo } : n))
    );
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#164E63]">Configuración</h2>
          <p className="text-sm text-[#164E63]/50">Administra tu perfil, clínica, horarios y notificaciones</p>
        </div>
        <Button
          onClick={handleGuardar}
          className={`cursor-pointer transition-all duration-200 text-sm ${
            guardado
              ? "bg-[#059669] hover:bg-[#059669] text-white"
              : "bg-[#059669] hover:bg-[#059669]/90 text-white"
          }`}
        >
          {guardado ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Guardado
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="bg-white border border-cyan-100 p-1 h-auto">
          <TabsTrigger value="perfil" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white text-xs">
            <User className="mr-1.5 h-3.5 w-3.5" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="clinica" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white text-xs">
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="horarios" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white text-xs">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Horarios
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white text-xs">
            <Bell className="mr-1.5 h-3.5 w-3.5" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {/* ── TAB: PERFIL ── */}
        <TabsContent value="perfil" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#164E63]">Datos del Profesional</CardTitle>
              <CardDescription className="text-xs text-[#164E63]/50">
                Esta información aparece en los recibos y comunicaciones con pacientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-cyan-200">
                    <AvatarFallback className="bg-[#0891B2]/20 text-[#0891B2] text-xl font-bold">
                      DM
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#0891B2] flex items-center justify-center cursor-pointer hover:bg-[#0891B2]/80 transition-all duration-200 shadow">
                    <Camera className="h-3 w-3 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-[#164E63]">Dr. Carlos Martínez Vega</p>
                  <p className="text-xs text-[#164E63]/50">Fisioterapeuta Certificado</p>
                  <Badge variant="outline" className="mt-1 text-[10px] bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20">
                    Plan Pro · Activo
                  </Badge>
                </div>
              </div>

              {/* Campos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Nombre</Label>
                  <Input defaultValue="Carlos" className="border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Apellidos</Label>
                  <Input defaultValue="Martínez Vega" className="border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Cédula Profesional</Label>
                  <Input defaultValue="8724591" className="border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Especialidad</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="Fisioterapia y Rehabilitación" className="pl-9 border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="carlos.martinez@clinica.com.mx" className="pl-9 border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="55 1234 5678" className="pl-9 border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: CLÍNICA ── */}
        <TabsContent value="clinica" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#164E63]">Datos del Consultorio</CardTitle>
              <CardDescription className="text-xs text-[#164E63]/50">
                Información que se mostrará a tus pacientes y en documentos oficiales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#164E63]">Nombre de la Clínica / Consultorio</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                  <Input defaultValue="Centro de Fisioterapia Martínez" className="pl-9 border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#164E63]">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                  <Input defaultValue="Av. Insurgentes Sur 1602, Col. Crédito Constructor, CDMX" className="pl-9 border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Teléfono del Consultorio</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="55 9876 5432" className="pl-9 border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Sitio Web (opcional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#164E63]/30" />
                    <Input defaultValue="www.fisioterapiamartinez.com.mx" className="pl-9 border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">RFC</Label>
                  <Input defaultValue="MAVC890315AB1" className="border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]">Duración de Sesión (minutos)</Label>
                  <Input defaultValue="60" type="number" className="border-cyan-100 focus-visible:ring-[#0891B2] text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: HORARIOS ── */}
        <TabsContent value="horarios" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#164E63]">Horario de Atención</CardTitle>
              <CardDescription className="text-xs text-[#164E63]/50">
                Define tus horas de trabajo para que los pacientes puedan agendar citas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {HORARIOS.map((h) => (
                <div
                  key={h.dia}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all ${
                    h.activo ? "bg-cyan-50/50" : "bg-[#164E63]/5 opacity-50"
                  }`}
                >
                  <div className="w-24 shrink-0">
                    <p className={`text-sm font-semibold ${h.activo ? "text-[#164E63]" : "text-[#164E63]/40"}`}>
                      {h.dia}
                    </p>
                  </div>
                  {h.activo ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        defaultValue={h.inicio}
                        className="border-cyan-100 focus-visible:ring-[#0891B2] text-sm h-8 w-28"
                      />
                      <span className="text-xs text-[#164E63]/40">–</span>
                      <Input
                        type="time"
                        defaultValue={h.fin}
                        className="border-cyan-100 focus-visible:ring-[#0891B2] text-sm h-8 w-28"
                      />
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: NOTIFICACIONES ── */}
        <TabsContent value="notificaciones" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-[#164E63]">Preferencias de Notificaciones</CardTitle>
              <CardDescription className="text-xs text-[#164E63]/50">
                Controla qué avisos recibes y qué mensajes se envían a tus pacientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {notificaciones.map((n) => (
                <div
                  key={n.id}
                  onClick={() => toggleNotif(n.id)}
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-cyan-50/50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Bell className={`h-4 w-4 ${n.activo ? "text-[#0891B2]" : "text-[#164E63]/20"}`} />
                    <p className={`text-sm ${n.activo ? "text-[#164E63]" : "text-[#164E63]/40"}`}>
                      {n.label}
                    </p>
                  </div>
                  <div
                    className={`relative h-5 w-9 rounded-full transition-all duration-200 ${
                      n.activo ? "bg-[#0891B2]" : "bg-[#164E63]/15"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                        n.activo ? "left-4" : "left-0.5"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
