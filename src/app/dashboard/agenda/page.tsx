"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  CalendarDays,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
// Semana del 23 al 28 de Febrero 2026
const diasSemana = [
  { label: "Lun", fecha: "23 Feb", dayIndex: 0 },
  { label: "Mar", fecha: "24 Feb", dayIndex: 1 },
  { label: "Mié", fecha: "25 Feb", dayIndex: 2 },
  { label: "Jue", fecha: "26 Feb", dayIndex: 3 },
  { label: "Vie", fecha: "27 Feb", dayIndex: 4 },
  { label: "Sáb", fecha: "28 Feb", dayIndex: 5 },
];

type Cita = {
  id: string;
  paciente: string;
  initials: string;
  motivo: string;
  hora: string;
  duracion: number;
  estado: "confirmada" | "en-curso" | "pendiente" | "cancelada" | "completada";
  dayIndex: number;
  sesion: string;
  sala: string;
};

const mockCitas: Cita[] = [
  // Lunes 23
  { id: "1", paciente: "Fernanda Castillo", initials: "FC", motivo: "Artrosis Cadera", hora: "09:00", duracion: 60, estado: "completada", dayIndex: 0, sesion: "6/10", sala: "Sala A" },
  { id: "2", paciente: "Diego Ochoa", initials: "DO", motivo: "Epicondilitis", hora: "11:00", duracion: 45, estado: "completada", dayIndex: 0, sesion: "3/8", sala: "Sala B" },
  { id: "3", paciente: "Ana Sofía Morales", initials: "AM", motivo: "Pie Plano", hora: "13:30", duracion: 60, estado: "completada", dayIndex: 0, sesion: "2/6", sala: "Sala A" },
  // Martes 24 (hoy)
  { id: "4", paciente: "María González Ríos", initials: "MG", motivo: "Rehab. Rodilla Post-Op", hora: "09:00", duracion: 60, estado: "completada", dayIndex: 1, sesion: "8/10", sala: "Sala A" },
  { id: "5", paciente: "Roberto Hernández", initials: "RH", motivo: "Lumbalgia Crónica", hora: "10:30", duracion: 60, estado: "en-curso", dayIndex: 1, sesion: "3/5", sala: "Sala B" },
  { id: "6", paciente: "Valeria Soto Pérez", initials: "VS", motivo: "Tendinitis Hombro", hora: "12:00", duracion: 45, estado: "confirmada", dayIndex: 1, sesion: "1/8", sala: "Sala A" },
  { id: "7", paciente: "Jorge Ramírez Luna", initials: "JR", motivo: "Cervicalgia", hora: "13:00", duracion: 45, estado: "pendiente", dayIndex: 1, sesion: "5/5", sala: "Sala B" },
  { id: "8", paciente: "Ana Sofía Morales", initials: "AM", motivo: "Pie Plano Adulto", hora: "15:30", duracion: 60, estado: "confirmada", dayIndex: 1, sesion: "2/6", sala: "Sala A" },
  { id: "9", paciente: "Luis Alberto Torres", initials: "LT", motivo: "Esguince Tobillo", hora: "17:00", duracion: 45, estado: "cancelada", dayIndex: 1, sesion: "4/5", sala: "Sala B" },
  // Miércoles 25
  { id: "10", paciente: "Fernanda Castillo", initials: "FC", motivo: "Artrosis Cadera", hora: "09:30", duracion: 60, estado: "confirmada", dayIndex: 2, sesion: "7/10", sala: "Sala A" },
  { id: "11", paciente: "Diego Ochoa", initials: "DO", motivo: "Epicondilitis", hora: "11:30", duracion: 45, estado: "confirmada", dayIndex: 2, sesion: "4/8", sala: "Sala B" },
  // Jueves 26
  { id: "12", paciente: "Roberto Hernández", initials: "RH", motivo: "Lumbalgia Crónica", hora: "10:00", duracion: 60, estado: "confirmada", dayIndex: 3, sesion: "4/5", sala: "Sala A" },
  { id: "13", paciente: "Valeria Soto Pérez", initials: "VS", motivo: "Tendinitis Hombro", hora: "12:00", duracion: 45, estado: "pendiente", dayIndex: 3, sesion: "2/8", sala: "Sala B" },
  { id: "14", paciente: "María González Ríos", initials: "MG", motivo: "Rehab. Rodilla Post-Op", hora: "14:00", duracion: 60, estado: "confirmada", dayIndex: 3, sesion: "9/10", sala: "Sala A" },
  // Viernes 27
  { id: "15", paciente: "Ana Sofía Morales", initials: "AM", motivo: "Pie Plano Adulto", hora: "09:00", duracion: 60, estado: "confirmada", dayIndex: 4, sesion: "3/6", sala: "Sala A" },
  { id: "16", paciente: "Jorge Ramírez Luna", initials: "JR", motivo: "Cervicalgia", hora: "11:00", duracion: 45, estado: "pendiente", dayIndex: 4, sesion: "1/5", sala: "Sala B" },
  // Sábado 28
  { id: "17", paciente: "Diego Ochoa", initials: "DO", motivo: "Epicondilitis", hora: "10:00", duracion: 45, estado: "confirmada", dayIndex: 5, sesion: "5/8", sala: "Sala A" },
];

const estadoConfig: Record<string, { label: string; bg: string; border: string; text: string }> = {
  confirmada:  { label: "Confirmada",  bg: "bg-[#059669]/10",  border: "border-[#059669]/30", text: "text-[#059669]" },
  "en-curso":  { label: "En curso",    bg: "bg-[#0891B2]/15",  border: "border-[#0891B2]/40", text: "text-[#0891B2]" },
  pendiente:   { label: "Pendiente",   bg: "bg-[#F59E0B]/10",  border: "border-[#F59E0B]/30", text: "text-[#F59E0B]" },
  cancelada:   { label: "Cancelada",   bg: "bg-[#EF4444]/5",   border: "border-[#EF4444]/20", text: "text-[#EF4444]" },
  completada:  { label: "Completada",  bg: "bg-[#164E63]/5",   border: "border-[#164E63]/15", text: "text-[#164E63]/50" },
};

const HOY_INDEX = 1; // Martes 24 es "hoy"

export default function AgendaPage() {
  const [diaActivo, setDiaActivo] = useState(HOY_INDEX);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  const citasDia = mockCitas
    .filter((c) => c.dayIndex === diaActivo)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const totalSemana = mockCitas.filter(c => c.estado !== "cancelada").length;
  const confirmadas = mockCitas.filter(c => c.estado === "confirmada").length;
  const completadas = mockCitas.filter(c => c.estado === "completada").length;
  const canceladas = mockCitas.filter(c => c.estado === "cancelada").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#164E63]">Semana del 23 – 28 Feb 2026</h2>
          <p className="text-sm text-[#164E63]/50">{totalSemana} citas programadas esta semana</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="border-cyan-200 hover:bg-cyan-50 cursor-pointer h-9 w-9">
            <ChevronLeft className="h-4 w-4 text-[#164E63]" />
          </Button>
          <Button variant="outline" className="border-cyan-200 hover:bg-cyan-50 cursor-pointer text-xs text-[#164E63] h-9">
            <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-[#0891B2]" />
            Esta semana
          </Button>
          <Button variant="outline" size="icon" className="border-cyan-200 hover:bg-cyan-50 cursor-pointer h-9 w-9">
            <ChevronRight className="h-4 w-4 text-[#164E63]" />
          </Button>
          <Button className="bg-[#059669] hover:bg-[#059669]/90 text-white cursor-pointer transition-all duration-200 text-sm h-9">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Stats semana */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Semana", value: totalSemana, color: "text-[#164E63]", bg: "bg-[#164E63]/5" },
          { label: "Confirmadas", value: confirmadas, color: "text-[#059669]", bg: "bg-[#059669]/10" },
          { label: "Completadas", value: completadas, color: "text-[#0891B2]", bg: "bg-[#0891B2]/10" },
          { label: "Canceladas", value: canceladas, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-lg p-3 flex items-center justify-between`}>
            <span className="text-xs font-medium text-[#164E63]/60">{s.label}</span>
            <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        {/* Selector días (columnas) */}
        <Card className="border-cyan-100 bg-white lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#164E63]">Días de la Semana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-3 pt-0">
            {diasSemana.map((dia) => {
              const citasDiaCount = mockCitas.filter(c => c.dayIndex === dia.dayIndex && c.estado !== "cancelada").length;
              const isHoy = dia.dayIndex === HOY_INDEX;
              const isActivo = dia.dayIndex === diaActivo;
              return (
                <button
                  key={dia.dayIndex}
                  onClick={() => setDiaActivo(dia.dayIndex)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActivo
                      ? "bg-[#0891B2] text-white"
                      : "hover:bg-cyan-50 text-[#164E63]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div>
                      <p className={`text-sm font-bold leading-none ${isActivo ? "text-white" : "text-[#164E63]"}`}>
                        {dia.label}
                        {isHoy && !isActivo && <span className="ml-1 text-[9px] font-bold text-[#0891B2] uppercase tracking-wide">HOY</span>}
                        {isHoy && isActivo && <span className="ml-1 text-[9px] font-bold text-white/70 uppercase tracking-wide">HOY</span>}
                      </p>
                      <p className={`text-[10px] leading-none mt-0.5 ${isActivo ? "text-white/70" : "text-[#164E63]/40"}`}>{dia.fecha}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 px-1.5 ${
                      isActivo
                        ? "bg-white/20 text-white border-white/30"
                        : citasDiaCount > 0
                        ? "bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20"
                        : "text-[#164E63]/30 border-[#164E63]/10"
                    }`}
                  >
                    {citasDiaCount}
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Lista de citas del día */}
        <Card className="border-cyan-100 bg-white lg:col-span-5">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#164E63]">
                {diasSemana[diaActivo].label} {diasSemana[diaActivo].fecha}
                {diaActivo === HOY_INDEX && (
                  <Badge className="ml-2 text-[10px] bg-[#0891B2] text-white border-0 h-5">HOY</Badge>
                )}
              </CardTitle>
              <p className="text-xs text-[#164E63]/50 mt-0.5">
                {citasDia.length === 0 ? "Sin citas" : `${citasDia.length} citas programadas`}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {citasDia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-10 w-10 text-[#164E63]/20 mb-3" />
                <p className="text-sm font-medium text-[#164E63]/50">Sin citas este día</p>
                <Button className="mt-4 bg-[#059669] hover:bg-[#059669]/90 text-white cursor-pointer text-xs h-8">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Agendar Cita
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-cyan-50">
                {citasDia.map((cita) => {
                  const conf = estadoConfig[cita.estado];
                  return (
                    <div
                      key={cita.id}
                      onClick={() => setCitaSeleccionada(cita)}
                      className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-cyan-50/50 transition-all duration-200 ${
                        cita.estado === "cancelada" ? "opacity-40" : ""
                      }`}
                    >
                      {/* Hora */}
                      <div className="flex flex-col items-center w-10 shrink-0">
                        <span className="text-xs font-bold text-[#164E63]">{cita.hora}</span>
                        <span className="text-[10px] text-[#164E63]/30">{cita.duracion}min</span>
                      </div>

                      {/* Indicador estado */}
                      <div className={`w-1 h-10 rounded-full shrink-0 ${conf.bg.replace("/10","").replace("/5","").replace("/15","")} border-l-4 ${conf.border}`} />

                      {/* Avatar */}
                      <Avatar className="h-9 w-9 border border-cyan-100 shrink-0">
                        <AvatarFallback className="bg-[#0891B2]/10 text-[#0891B2] text-xs font-bold">
                          {cita.initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#164E63] truncate">{cita.paciente}</p>
                        <p className="text-xs text-[#164E63]/50 truncate">{cita.motivo} · {cita.sala}</p>
                      </div>

                      {/* Estado + sesión */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${conf.bg} ${conf.text} ${conf.border}`}>
                          {conf.label}
                        </Badge>
                        <span className="text-[10px] text-[#164E63]/40">Ses. {cita.sesion}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal detalle cita */}
      <Dialog open={!!citaSeleccionada} onOpenChange={() => setCitaSeleccionada(null)}>
        {citaSeleccionada && (
          <DialogContent className="max-w-sm border-cyan-100">
            <DialogHeader>
              <DialogTitle className="text-[#164E63] font-bold">Detalle de Cita</DialogTitle>
              <DialogDescription className="text-[#164E63]/50 text-xs">
                {diasSemana[citaSeleccionada.dayIndex].label} {diasSemana[citaSeleccionada.dayIndex].fecha} · {citaSeleccionada.hora}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-cyan-200">
                  <AvatarFallback className="bg-[#0891B2]/20 text-[#0891B2] font-bold">
                    {citaSeleccionada.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#164E63]">{citaSeleccionada.paciente}</p>
                  <p className="text-xs text-[#164E63]/50">{citaSeleccionada.motivo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cyan-50/50 rounded-lg p-3">
                  <p className="text-[10px] text-[#164E63]/50 uppercase tracking-wide">Horario</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3.5 w-3.5 text-[#0891B2]" />
                    <span className="text-sm font-bold text-[#164E63]">{citaSeleccionada.hora}</span>
                  </div>
                  <p className="text-xs text-[#164E63]/40">{citaSeleccionada.duracion} minutos</p>
                </div>
                <div className="bg-cyan-50/50 rounded-lg p-3">
                  <p className="text-[10px] text-[#164E63]/50 uppercase tracking-wide">Sesión</p>
                  <p className="text-sm font-bold text-[#164E63] mt-1">{citaSeleccionada.sesion}</p>
                  <p className="text-xs text-[#164E63]/40">{citaSeleccionada.sala}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${estadoConfig[citaSeleccionada.estado].bg} ${estadoConfig[citaSeleccionada.estado].text} ${estadoConfig[citaSeleccionada.estado].border} text-xs`}
                >
                  {estadoConfig[citaSeleccionada.estado].label}
                </Badge>
              </div>

              <div className="flex gap-2 pt-1">
                <Button className="flex-1 bg-[#059669] hover:bg-[#059669]/90 text-white cursor-pointer transition-all duration-200 text-xs h-9">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Completar
                </Button>
                <Button variant="outline" className="flex-1 border-cyan-200 hover:bg-cyan-50 cursor-pointer text-xs h-9">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[#0891B2]" />
                  Reagendar
                </Button>
                <Button variant="outline" className="border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/5 cursor-pointer text-xs h-9 px-2.5">
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
