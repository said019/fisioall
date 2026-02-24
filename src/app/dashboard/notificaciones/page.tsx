"use client";

import { useState } from "react";
import {
  Bell,
  FileText,
  History,
  CheckCheck,
  Eye,
  AlertTriangle,
  CalendarCheck,
  Dumbbell,
  Heart,
  MessageSquare,
  Send,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
interface Alerta {
  id: string;
  tipo: "recordatorio_cita" | "sesion_por_vencer" | "membresia_vencida" | "seguimiento" | "ejercicio_pendiente";
  titulo: string;
  texto: string;
  tiempo: string;
  paciente: string;
  leida: boolean;
}

const TIPO_CONFIG: Record<Alerta["tipo"], { color: string; bgIcon: string; icon: React.ElementType }> = {
  recordatorio_cita:   { color: "text-cyan-600",    bgIcon: "bg-cyan-50",    icon: CalendarCheck },
  sesion_por_vencer:   { color: "text-orange-600",  bgIcon: "bg-orange-50",  icon: AlertTriangle },
  membresia_vencida:   { color: "text-red-600",     bgIcon: "bg-red-50",     icon: XCircle },
  seguimiento:         { color: "text-blue-600",    bgIcon: "bg-blue-50",    icon: Heart },
  ejercicio_pendiente: { color: "text-violet-600",  bgIcon: "bg-violet-50",  icon: Dumbbell },
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const mockAlertas: Alerta[] = [
  { id: "a1", tipo: "recordatorio_cita",   titulo: "Cita mañana a las 10:00", texto: "Recordatorio automático enviado por WhatsApp. Pendiente de confirmación.", tiempo: "Hace 5 min", paciente: "Ana Flores", leida: false },
  { id: "a2", tipo: "sesion_por_vencer",   titulo: "Quedan 2 sesiones",       texto: "El paquete de rehabilitación está por terminar. Considera renovación.", tiempo: "Hace 30 min", paciente: "Patricia Morales", leida: false },
  { id: "a3", tipo: "membresia_vencida",   titulo: "Membresía vencida",       texto: "La membresía venció el 10 de febrero. No se han agendado nuevas citas.", tiempo: "Hace 2 hrs", paciente: "Carlos Rodríguez", leida: false },
  { id: "a4", tipo: "seguimiento",         titulo: "Seguimiento post-sesión",  texto: "Han pasado 48 hrs desde la última sesión. Enviar mensaje de seguimiento.", tiempo: "Hace 3 hrs", paciente: "Daniela Martínez", leida: true },
  { id: "a5", tipo: "ejercicio_pendiente", titulo: "Ejercicios sin completar", texto: "El paciente no ha reportado completar los ejercicios asignados esta semana.", tiempo: "Ayer", paciente: "José Hernández", leida: true },
  { id: "a6", tipo: "recordatorio_cita",   titulo: "Cita pasado mañana 16:00", texto: "Recordatorio programado. Paciente confirmó por WhatsApp.", tiempo: "Ayer", paciente: "Roberto Sánchez", leida: true },
];

const mockPlantillas = [
  {
    id: "t1",
    nombre: "Recordatorio de Cita",
    tipo: "recordatorio_cita",
    canal: "whatsapp",
    cuerpo: "Hola {{nombre}}, tu cita es mañana {{fecha}} a las {{hora}}. Responde 1 para confirmar o 2 para reagendar.",
  },
  {
    id: "t2",
    nombre: "Seguimiento Post-Sesión",
    tipo: "seguimiento",
    canal: "whatsapp",
    cuerpo: "Hola {{nombre}}, ¿cómo te sentiste después de la sesión? Si tienes alguna molestia, no dudes en escribirnos.",
  },
  {
    id: "t3",
    nombre: "Renovación de Membresía",
    tipo: "membresia_vencida",
    canal: "email",
    cuerpo: "Estimado(a) {{nombre}}, tu membresía ha vencido. Contáctanos para renovarla con un 10% de descuento.",
  },
  {
    id: "t4",
    nombre: "Recordatorio de Ejercicios",
    tipo: "ejercicio_pendiente",
    canal: "whatsapp",
    cuerpo: "Hola {{nombre}}, recuerda completar tus ejercicios del día. Tu progreso depende de la constancia.",
  },
];

const mockHistorial = [
  { id: "h1", fecha: new Date(2026, 1, 24, 8, 15),  paciente: "Ana Flores",        canal: "whatsapp",     resumen: "Recordatorio de cita — mañana 10:00", estado: "enviado" },
  { id: "h2", fecha: new Date(2026, 1, 23, 17, 30), paciente: "Patricia Morales",   canal: "whatsapp",     resumen: "Seguimiento post-sesión #7",          estado: "enviado" },
  { id: "h3", fecha: new Date(2026, 1, 23, 10, 0),  paciente: "Carlos Rodríguez",  canal: "email",        resumen: "Renovación de membresía",             estado: "fallido" },
  { id: "h4", fecha: new Date(2026, 1, 22, 14, 45), paciente: "José Hernández",     canal: "whatsapp",     resumen: "Recordatorio de ejercicios",          estado: "enviado" },
  { id: "h5", fecha: new Date(2026, 1, 22, 9, 20),  paciente: "Daniela Martínez",  canal: "whatsapp",     resumen: "Confirmación de cita reagendada",     estado: "pendiente" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function NotificacionesPage() {
  const [alertas, setAlertas] = useState(mockAlertas);
  const [filtro, setFiltro] = useState<"todas" | "no_leidas" | "criticas">("todas");

  const sinLeer = alertas.filter((a) => !a.leida).length;

  const marcarTodasLeidas = () => {
    setAlertas((prev) => prev.map((a) => ({ ...a, leida: true })));
  };

  const alertasFiltradas = alertas.filter((a) => {
    if (filtro === "todas") return true;
    if (filtro === "no_leidas") return !a.leida;
    if (filtro === "criticas")
      return a.tipo === "membresia_vencida" || a.tipo === "sesion_por_vencer";
    return true;
  });

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#ECFEFF] min-h-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#164E63]">Notificaciones</h1>
          <p className="text-xs text-[#164E63]/50 mt-0.5">
            {sinLeer > 0
              ? `${sinLeer} alerta${sinLeer > 1 ? "s" : ""} sin leer`
              : "Todas las alertas leídas"}
          </p>
        </div>
        {sinLeer > 0 && (
          <Button
            variant="outline"
            onClick={marcarTodasLeidas}
            className="cursor-pointer border-cyan-200 text-[#0891B2] hover:bg-cyan-50 transition-all duration-200 text-sm gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas leídas
          </Button>
        )}
      </div>

      {/* ── TABS ── */}
      <Tabs defaultValue="alertas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-[#ECFEFF] border border-cyan-100">
          <TabsTrigger value="alertas" className="flex gap-2 data-[state=active]:bg-white data-[state=active]:text-[#164E63]">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
            {sinLeer > 0 && (
              <Badge className="h-4 min-w-4 px-1 text-[9px] bg-red-500 text-white border-0 rounded-full">
                {sinLeer}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="plantillas" className="flex gap-2 data-[state=active]:bg-white data-[state=active]:text-[#164E63]">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Plantillas</span>
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex gap-2 data-[state=active]:bg-white data-[state=active]:text-[#164E63]">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historial</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB ALERTAS ── */}
        <TabsContent value="alertas" className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-2">
            {(["todas", "no_leidas", "criticas"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                  filtro === f
                    ? "bg-[#0891B2] text-white"
                    : "bg-white border border-cyan-100 text-[#164E63]/60 hover:border-cyan-300"
                }`}
              >
                {f === "todas" ? "Todas" : f === "no_leidas" ? "No leídas" : "Críticas"}
              </button>
            ))}
          </div>

          {/* Lista */}
          <Card className="border-cyan-100 bg-white divide-y divide-cyan-100">
            {alertasFiltradas.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-[#0891B2]/20 mx-auto mb-2" />
                <p className="text-sm text-[#164E63]/40">No hay alertas en este filtro</p>
              </div>
            ) : (
              alertasFiltradas.map((a) => {
                const cfg = TIPO_CONFIG[a.tipo];
                const Icon = cfg.icon;
                return (
                  <div
                    key={a.id}
                    className={`flex gap-4 p-4 transition-all duration-200 ${
                      !a.leida ? "bg-[#ECFEFF]/50" : ""
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-xl ${cfg.bgIcon} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm ${!a.leida ? "font-bold" : "font-medium"} text-[#164E63]`}>
                            {a.titulo}
                          </p>
                          <p className="text-xs text-[#164E63]/50 mt-0.5 line-clamp-2">
                            {a.texto}
                          </p>
                        </div>
                        {!a.leida && (
                          <div className="h-2 w-2 rounded-full bg-[#0891B2] shrink-0 mt-1.5" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-[#164E63]/40">{a.tiempo}</span>
                        <span className="text-[10px] text-[#164E63]/40">·</span>
                        <span className="text-[10px] text-[#164E63]/50 font-medium">{a.paciente}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 transition-all duration-200"
                        >
                          Resolver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] cursor-pointer text-[#0891B2] hover:bg-cyan-50 transition-all duration-200"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver paciente
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </TabsContent>

        {/* ── TAB PLANTILLAS ── */}
        <TabsContent value="plantillas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {mockPlantillas.map((p) => (
              <Card key={p.id} className="border-cyan-100 bg-white flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-[#164E63]">
                      {p.nombre}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        p.canal === "whatsapp"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-cyan-50 text-cyan-700 border-cyan-200"
                      }`}
                    >
                      {p.canal === "whatsapp" ? "WhatsApp" : "Email"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-[#164E63]/50">
                    Tipo: {p.tipo.replace(/_/g, " ")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-3">
                  <textarea
                    defaultValue={p.cuerpo}
                    rows={4}
                    className="w-full min-h-[100px] rounded-lg border border-cyan-200 bg-[#ECFEFF]/30 px-3 py-2 text-xs text-[#164E63] placeholder:text-[#164E63]/30 focus:outline-none focus:border-[#0891B2] transition-colors resize-none"
                  />
                </CardContent>
                <CardFooter className="pt-3 border-t border-cyan-100 flex items-center justify-between">
                  <p className="text-[10px] text-[#164E63]/30">Última edición: hace 3 días</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 transition-all duration-200"
                  >
                    Guardar cambios
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB HISTORIAL ── */}
        <TabsContent value="historial" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#164E63]">
                Mensajes Enviados
              </CardTitle>
              <CardDescription className="text-xs text-[#164E63]/50">
                Historial de comunicaciones automáticas y manuales
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-100 bg-[#ECFEFF]/50">
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Fecha</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Paciente</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Canal</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase hidden sm:table-cell">Mensaje</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHistorial.map((m) => (
                    <TableRow key={m.id} className="border-cyan-100 hover:bg-[#ECFEFF]/30 transition-colors">
                      <TableCell className="py-3">
                        <p className="text-xs font-medium text-[#164E63]">
                          {format(m.fecha, "dd/MM/yyyy")}
                        </p>
                        <p className="text-[10px] text-[#164E63]/40">
                          {format(m.fecha, "HH:mm")}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[9px] bg-[#0891B2]/10 text-[#0891B2]">
                              {m.paciente.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-[#164E63]">{m.paciente}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            m.canal === "whatsapp"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-cyan-50 text-cyan-700 border-cyan-200"
                          }`}
                        >
                          {m.canal === "whatsapp" ? "WhatsApp" : "Email"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 hidden sm:table-cell max-w-[200px]">
                        <p className="text-xs text-[#164E63]/60 truncate">{m.resumen}</p>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            m.estado === "enviado"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : m.estado === "fallido"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {m.estado === "enviado" ? (
                            <><Send className="h-2.5 w-2.5 mr-1 inline" />Enviado</>
                          ) : m.estado === "fallido" ? (
                            <><XCircle className="h-2.5 w-2.5 mr-1 inline" />Fallido</>
                          ) : (
                            <><Clock className="h-2.5 w-2.5 mr-1 inline" />Pendiente</>
                          )}
                        </Badge>
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
