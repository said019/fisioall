"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Activity,
  FileText,
  Filter,
  ChevronRight,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const mockPacientes = [
  {
    id: "1",
    nombre: "María González Ríos",
    initials: "MG",
    edad: 42,
    telefono: "555-120-3344",
    email: "maria.gonzalez@gmail.com",
    diagnostico: "Rehabilitación Rodilla Post-Op",
    categoria: "rehabilitacion",
    estado: "activo",
    ultimaCita: "24 Feb 2026",
    proximaCita: "27 Feb 2026",
    sesionesUsadas: 8,
    sesionesTotales: 10,
    notas: "Paciente con buena evolución. Logró 90° de flexión. Continuar con ejercicios de fortalecimiento de cuádriceps.",
    ciudad: "Ciudad de México",
  },
  {
    id: "2",
    nombre: "Roberto Hernández Vega",
    initials: "RH",
    edad: 55,
    telefono: "555-230-5678",
    email: "rhernandez@hotmail.com",
    diagnostico: "Lumbalgia Crónica",
    categoria: "dolor-cronico",
    estado: "activo",
    ultimaCita: "24 Feb 2026",
    proximaCita: "03 Mar 2026",
    sesionesUsadas: 3,
    sesionesTotales: 5,
    notas: "Dolor referido hacia glúteo izquierdo. Se recomienda complementar con ejercicios de McKenzie en casa.",
    ciudad: "CDMX, Coyoacán",
  },
  {
    id: "3",
    nombre: "Valeria Soto Pérez",
    initials: "VS",
    edad: 28,
    telefono: "555-345-9900",
    email: "valeria.soto@outlook.com",
    diagnostico: "Tendinitis de Hombro Derecho",
    categoria: "deportivo",
    estado: "activo",
    ultimaCita: "20 Feb 2026",
    proximaCita: "24 Feb 2026",
    sesionesUsadas: 1,
    sesionesTotales: 8,
    notas: "Atleta de natación. Evitar movimientos de abducción mayor a 90°. Control en 2 semanas.",
    ciudad: "Guadalajara, Jalisco",
  },
  {
    id: "4",
    nombre: "Jorge Ramírez Luna",
    initials: "JR",
    edad: 38,
    telefono: "555-456-1122",
    email: "jorge.ramirez@empresa.com.mx",
    diagnostico: "Cervicalgia por Postura",
    categoria: "rehabilitacion",
    estado: "alerta",
    ultimaCita: "24 Feb 2026",
    proximaCita: "—",
    sesionesUsadas: 5,
    sesionesTotales: 5,
    notas: "Paciente usa última sesión hoy. Evaluar renovación de paquete. Mejoría del 70% en rango de movimiento cervical.",
    ciudad: "Monterrey, N.L.",
  },
  {
    id: "5",
    nombre: "Ana Sofía Morales",
    initials: "AM",
    edad: 34,
    telefono: "555-567-3344",
    email: "ana.morales@gmail.com",
    diagnostico: "Pie Plano Adulto",
    categoria: "rehabilitacion",
    estado: "activo",
    ultimaCita: "18 Feb 2026",
    proximaCita: "24 Feb 2026",
    sesionesUsadas: 2,
    sesionesTotales: 6,
    notas: "Se prescribieron plantillas ortopédicas. Trabajar propiocepción de tobillo.",
    ciudad: "Ciudad de México",
  },
  {
    id: "6",
    nombre: "Luis Alberto Torres",
    initials: "LT",
    edad: 24,
    telefono: "555-678-5566",
    email: "luis.torres@correo.com",
    diagnostico: "Esguince Tobillo Grado II",
    categoria: "deportivo",
    estado: "inactivo",
    ultimaCita: "10 Feb 2026",
    proximaCita: "—",
    sesionesUsadas: 4,
    sesionesTotales: 5,
    notas: "Paciente no asistió a última cita. Sin contacto desde el 10/02. Seguimiento pendiente.",
    ciudad: "Puebla, Pue.",
  },
  {
    id: "7",
    nombre: "Fernanda Castillo",
    initials: "FC",
    edad: 61,
    telefono: "555-789-7788",
    email: "fernanda.c@yahoo.com",
    diagnostico: "Artrosis de Cadera",
    categoria: "dolor-cronico",
    estado: "activo",
    ultimaCita: "21 Feb 2026",
    proximaCita: "28 Feb 2026",
    sesionesUsadas: 6,
    sesionesTotales: 10,
    notas: "Terapia acuática recomendada. Manejo con AINES por prescripción médica externa.",
    ciudad: "CDMX, Tlalpan",
  },
  {
    id: "8",
    nombre: "Diego Ochoa Gutiérrez",
    initials: "DO",
    edad: 19,
    telefono: "555-890-9900",
    email: "dochoa@mail.com",
    diagnostico: "Epicondilitis Lateral",
    categoria: "deportivo",
    estado: "activo",
    ultimaCita: "22 Feb 2026",
    proximaCita: "26 Feb 2026",
    sesionesUsadas: 3,
    sesionesTotales: 8,
    notas: "Jugador de tenis. Fuerza en antebrazo en progreso. Uso de banda de codo recomendada.",
    ciudad: "Ciudad de México",
  },
];

const categoriaConfig: Record<string, { label: string; class: string }> = {
  rehabilitacion: { label: "Rehabilitación", class: "bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20" },
  deportivo: { label: "Deportivo", class: "bg-[#059669]/10 text-[#059669] border-[#059669]/20" },
  "dolor-cronico": { label: "Dolor Crónico", class: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" },
};

const estadoPacienteConfig: Record<string, { label: string; class: string }> = {
  activo: { label: "Activo", class: "bg-[#059669]/10 text-[#059669] border-[#059669]/20" },
  alerta: { label: "Alerta", class: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" },
  inactivo: { label: "Inactivo", class: "bg-[#164E63]/10 text-[#164E63]/60 border-[#164E63]/10" },
};

type Paciente = typeof mockPacientes[0];

export default function PacientesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);

  const pacientesFiltrados = mockPacientes.filter((p) => {
    const matchBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.diagnostico.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = filtroCategoria === "todos" || p.categoria === filtroCategoria;
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    return matchBusqueda && matchCategoria && matchEstado;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#164E63]">Directorio de Pacientes</h2>
          <p className="text-sm text-[#164E63]/50">
            {mockPacientes.length} pacientes registrados · {mockPacientes.filter(p => p.estado === "activo").length} activos
          </p>
        </div>
        <Button className="bg-[#059669] hover:bg-[#059669]/90 text-white cursor-pointer transition-all duration-200 shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-cyan-100 bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#164E63]/30" />
              <Input
                placeholder="Buscar por nombre o diagnóstico..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 border-cyan-100 focus-visible:ring-[#0891B2] bg-[#ECFEFF]/50 placeholder:text-[#164E63]/30"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-full sm:w-44 border-cyan-100 text-[#164E63] cursor-pointer">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-[#164E63]/40" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  <SelectItem value="rehabilitacion">Rehabilitación</SelectItem>
                  <SelectItem value="deportivo">Deportivo</SelectItem>
                  <SelectItem value="dolor-cronico">Dolor Crónico</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full sm:w-36 border-cyan-100 text-[#164E63] cursor-pointer">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="alerta">Alerta</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card className="border-cyan-100 bg-white">
        <CardContent className="p-0">
          {pacientesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <User className="h-10 w-10 text-[#164E63]/20 mb-3" />
              <p className="text-sm font-medium text-[#164E63]/50">No se encontraron pacientes</p>
              <p className="text-xs text-[#164E63]/30 mt-1">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#ECFEFF]/50 hover:bg-[#ECFEFF]/50 border-b border-cyan-100">
                    <TableHead className="text-[#164E63]/60 font-semibold text-xs uppercase tracking-wide pl-5">
                      Paciente
                    </TableHead>
                    <TableHead className="text-[#164E63]/60 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                      Diagnóstico
                    </TableHead>
                    <TableHead className="text-[#164E63]/60 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">
                      Próx. Cita
                    </TableHead>
                    <TableHead className="text-[#164E63]/60 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">
                      Estado
                    </TableHead>
                    <TableHead className="text-[#164E63]/60 font-semibold text-xs uppercase tracking-wide hidden xl:table-cell">
                      Sesiones
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientesFiltrados.map((paciente) => {
                    const cat = categoriaConfig[paciente.categoria];
                    const est = estadoPacienteConfig[paciente.estado];
                    const porcentajeSesiones = Math.round((paciente.sesionesUsadas / paciente.sesionesTotales) * 100);
                    return (
                      <TableRow
                        key={paciente.id}
                        onClick={() => setPacienteSeleccionado(paciente)}
                        className="cursor-pointer hover:bg-cyan-50/50 transition-all duration-200 border-b border-cyan-50"
                      >
                        <TableCell className="pl-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-cyan-100 shrink-0">
                              <AvatarFallback className="bg-[#0891B2]/10 text-[#0891B2] text-xs font-bold">
                                {paciente.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-[#164E63] flex items-center gap-1.5">
                                {paciente.nombre}
                                {paciente.estado === "alerta" && (
                                  <AlertCircle className="h-3 w-3 text-[#F59E0B]" />
                                )}
                              </p>
                              <p className="text-xs text-[#164E63]/50">{paciente.edad} años · {paciente.ciudad}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className={`text-[11px] ${cat.class}`}>
                            {cat.label}
                          </Badge>
                          <p className="text-xs text-[#164E63]/60 mt-1 max-w-[180px] truncate">{paciente.diagnostico}</p>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-[#164E63]/70">
                            <CalendarDays className="h-3.5 w-3.5 text-[#0891B2]" />
                            {paciente.proximaCita}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className={`text-[11px] ${est.class}`}>
                            {est.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-cyan-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#0891B2] transition-all"
                                style={{ width: `${porcentajeSesiones}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#164E63]/50">
                              {paciente.sesionesUsadas}/{paciente.sesionesTotales}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-[#164E63]/20" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal detalle paciente */}
      <Dialog open={!!pacienteSeleccionado} onOpenChange={() => setPacienteSeleccionado(null)}>
        {pacienteSeleccionado && (
          <DialogContent className="max-w-lg border-cyan-100">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-cyan-200">
                  <AvatarFallback className="bg-[#0891B2]/20 text-[#0891B2] text-base font-bold">
                    {pacienteSeleccionado.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-[#164E63] font-bold">{pacienteSeleccionado.nombre}</DialogTitle>
                  <DialogDescription className="text-[#164E63]/50 text-xs">
                    {pacienteSeleccionado.edad} años · {pacienteSeleccionado.ciudad}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Contacto */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs text-[#164E63]/70">
                  <Phone className="h-3.5 w-3.5 text-[#0891B2]" />
                  {pacienteSeleccionado.telefono}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#164E63]/70">
                  <Mail className="h-3.5 w-3.5 text-[#0891B2]" />
                  <span className="truncate">{pacienteSeleccionado.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#164E63]/70 col-span-2">
                  <MapPin className="h-3.5 w-3.5 text-[#0891B2] shrink-0" />
                  {pacienteSeleccionado.ciudad}
                </div>
              </div>

              {/* Diagnóstico */}
              <Card className="border-cyan-100 bg-[#ECFEFF]/50">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-[#0891B2]" />
                    <span className="text-xs font-semibold text-[#164E63]">Diagnóstico</span>
                  </div>
                  <p className="text-sm text-[#164E63]">{pacienteSeleccionado.diagnostico}</p>
                  <Badge variant="outline" className={`text-[11px] ${categoriaConfig[pacienteSeleccionado.categoria].class}`}>
                    {categoriaConfig[pacienteSeleccionado.categoria].label}
                  </Badge>
                </CardContent>
              </Card>

              {/* Sesiones */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-cyan-100">
                  <CardContent className="p-3">
                    <p className="text-[10px] text-[#164E63]/50 uppercase tracking-wide mb-1">Sesiones</p>
                    <p className="text-xl font-bold text-[#164E63]">
                      {pacienteSeleccionado.sesionesUsadas}
                      <span className="text-sm font-normal text-[#164E63]/40">/{pacienteSeleccionado.sesionesTotales}</span>
                    </p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-cyan-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0891B2]"
                        style={{ width: `${(pacienteSeleccionado.sesionesUsadas / pacienteSeleccionado.sesionesTotales) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-cyan-100">
                  <CardContent className="p-3">
                    <p className="text-[10px] text-[#164E63]/50 uppercase tracking-wide mb-1">Próxima Cita</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5 text-[#0891B2]" />
                      <p className="text-xs font-semibold text-[#164E63]">{pacienteSeleccionado.proximaCita}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notas */}
              <Card className="border-cyan-100 bg-[#ECFEFF]/30">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs font-semibold text-[#164E63] flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-[#0891B2]" />
                    Última Nota Clínica
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-xs text-[#164E63]/70 leading-relaxed">{pacienteSeleccionado.notas}</p>
                </CardContent>
              </Card>

              {/* Acciones */}
              <div className="flex gap-2 pt-1">
                <Button className="flex-1 bg-[#059669] hover:bg-[#059669]/90 text-white cursor-pointer transition-all duration-200 text-sm">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Agendar Cita
                </Button>
                <Button variant="outline" className="flex-1 border-cyan-200 text-[#164E63] hover:bg-cyan-50 cursor-pointer transition-all duration-200 text-sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Nota SOAP
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
