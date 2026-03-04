"use client";

import { useState } from "react";
import {
  Dumbbell,
  Search,
  Plus,
  Play,
  Filter,
  LayoutGrid,
  List,
  Clock,
  Repeat,
  Target,
  Video,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type EjercicioTipo = "movilidad" | "fortalecimiento" | "estiramiento" | "cardio" | "equilibrio" | "respiracion" | "otro";
type NivelDificultad = "bajo" | "medio" | "alto";

interface Ejercicio {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: EjercicioTipo;
  zonaCorporal: string[];
  nivelDificultad: NivelDificultad;
  instrucciones: string;
  videoUrl?: string;
  imagenUrl?: string;
  duracionSegundos?: number;
  series?: number;
  repeticiones?: number;
  esGlobal: boolean;
}

interface EjercicioAsignado {
  id: string;
  pacienteNombre: string;
  pacienteIniciales: string;
  ejercicioNombre: string;
  ejercicioTipo: EjercicioTipo;
  series: number;
  repeticiones: number;
  frecuenciaDias: number;
  fechaInicio: string;
  fechaFin?: string;
  cumplimiento: number; // 0-100
  activo: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<EjercicioTipo, { label: string; color: string; bg: string }> = {
  movilidad:        { label: "Movilidad",        color: "text-cyan-600",    bg: "bg-cyan-50" },
  fortalecimiento:  { label: "Fortalecimiento",  color: "text-violet-600",  bg: "bg-violet-50" },
  estiramiento:     { label: "Estiramiento",     color: "text-emerald-600", bg: "bg-emerald-50" },
  cardio:           { label: "Cardio",           color: "text-red-600",     bg: "bg-red-50" },
  equilibrio:       { label: "Equilibrio",       color: "text-amber-600",   bg: "bg-amber-50" },
  respiracion:      { label: "Respiración",      color: "text-sky-600",     bg: "bg-sky-50" },
  otro:             { label: "Otro",             color: "text-slate-600",   bg: "bg-slate-50" },
};

const NIVEL_CONFIG: Record<NivelDificultad, { label: string; color: string }> = {
  bajo:  { label: "Bajo",  color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  medio: { label: "Medio", color: "text-amber-600 bg-amber-50 border-amber-200" },
  alto:  { label: "Alto",  color: "text-red-600 bg-red-50 border-red-200" },
};

const ZONAS = [
  "Cuello", "Hombro", "Codo", "Muñeca", "Mano",
  "Columna dorsal", "Columna lumbar", "Cadera",
  "Rodilla", "Tobillo", "Pie", "Core",
];

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const mockEjercicios: Ejercicio[] = [
  {
    id: "1", nombre: "Sentadilla Isométrica en Pared", descripcion: "Fortalecimiento de cuádriceps sin impacto articular. Ideal para rehabilitación de rodilla.",
    tipo: "fortalecimiento", zonaCorporal: ["Rodilla", "Core"], nivelDificultad: "bajo",
    instrucciones: "Espalda pegada a la pared. Bajar hasta que las rodillas formen 90°. Mantener 30 segundos.",
    videoUrl: "https://example.com/video1", series: 3, repeticiones: 5, duracionSegundos: 30, esGlobal: true,
  },
  {
    id: "2", nombre: "Estiramiento de Isquiotibiales", descripcion: "Mejora la flexibilidad posterior de la pierna y reduce tensión lumbar.",
    tipo: "estiramiento", zonaCorporal: ["Columna lumbar", "Rodilla"], nivelDificultad: "bajo",
    instrucciones: "Sentado en el suelo, pierna extendida. Inclinar el torso hacia adelante manteniendo la espalda recta. Mantener 30 segundos.",
    series: 3, repeticiones: 2, duracionSegundos: 30, esGlobal: true,
  },
  {
    id: "3", nombre: "Circunducción de Hombro", descripcion: "Ejercicio de movilidad articular para recuperar rango de movimiento del hombro.",
    tipo: "movilidad", zonaCorporal: ["Hombro"], nivelDificultad: "bajo",
    instrucciones: "De pie, brazos colgando. Hacer círculos amplios con el brazo afectado. 10 hacia adelante, 10 hacia atrás.",
    series: 2, repeticiones: 10, esGlobal: true,
  },
  {
    id: "4", nombre: "Plancha Frontal", descripcion: "Fortalecimiento del core y estabilización de columna.",
    tipo: "fortalecimiento", zonaCorporal: ["Core", "Columna lumbar"], nivelDificultad: "medio",
    instrucciones: "Boca abajo, apoyado en antebrazos y puntas de los pies. Mantener cuerpo recto como una tabla. Sostener 30-60 segundos.",
    series: 3, repeticiones: 1, duracionSegundos: 45, esGlobal: true,
  },
  {
    id: "5", nombre: "Elevación de Talones", descripcion: "Fortalecimiento de gemelos y estabilización de tobillo.",
    tipo: "fortalecimiento", zonaCorporal: ["Tobillo", "Pie"], nivelDificultad: "bajo",
    instrucciones: "De pie, subir en puntas de los pies lentamente. Bajar controladamente. Usar apoyo si es necesario.",
    series: 3, repeticiones: 15, esGlobal: true,
  },
  {
    id: "6", nombre: "Respiración Diafragmática", descripcion: "Técnica de respiración para relajación y control del dolor.",
    tipo: "respiracion", zonaCorporal: ["Core"], nivelDificultad: "bajo",
    instrucciones: "Acostado boca arriba, manos sobre el abdomen. Inhalar por nariz 4 segundos inflando el abdomen. Exhalar por boca 6 segundos.",
    series: 1, repeticiones: 10, duracionSegundos: 60, esGlobal: true,
  },
  {
    id: "7", nombre: "Equilibrio Unipodal", descripcion: "Ejercicio propioceptivo para estabilización de tobillo y rodilla.",
    tipo: "equilibrio", zonaCorporal: ["Tobillo", "Rodilla"], nivelDificultad: "medio",
    instrucciones: "De pie sobre una pierna, ojos abiertos. Mantener 30 segundos. Progresar cerrando ojos o sobre superficie inestable.",
    series: 3, repeticiones: 2, duracionSegundos: 30, esGlobal: true,
  },
  {
    id: "8", nombre: "Flexión de Cadera con Banda", descripcion: "Fortalecimiento de flexores de cadera con resistencia elástica.",
    tipo: "fortalecimiento", zonaCorporal: ["Cadera"], nivelDificultad: "alto",
    instrucciones: "Banda elástica en tobillos. Elevar rodilla al frente contra resistencia. Control excéntrico al bajar.",
    videoUrl: "https://example.com/video8", series: 3, repeticiones: 12, esGlobal: false,
  },
  {
    id: "9", nombre: "Estiramiento Cervical Lateral", descripcion: "Estiramiento suave de trapecios y musculatura cervical lateral.",
    tipo: "estiramiento", zonaCorporal: ["Cuello"], nivelDificultad: "bajo",
    instrucciones: "Sentado, inclinar la oreja hacia el hombro. Mano del mismo lado sobre la cabeza aplicando ligera presión. Mantener 20 seg cada lado.",
    series: 2, repeticiones: 3, duracionSegundos: 20, esGlobal: true,
  },
  {
    id: "10", nombre: "Bicicleta Estática Suave", descripcion: "Cardio de bajo impacto para mejorar resistencia y circulación post-operatoria.",
    tipo: "cardio", zonaCorporal: ["Rodilla", "Cadera"], nivelDificultad: "medio",
    instrucciones: "Pedaleo suave a resistencia baja. Mantener RPE 3-4/10. Ajustar asiento para extensión completa sin hiperextensión.",
    duracionSegundos: 900, esGlobal: true,
  },
];

const mockAsignados: EjercicioAsignado[] = [
  { id: "a1", pacienteNombre: "Ana Flores", pacienteIniciales: "AF", ejercicioNombre: "Sentadilla Isométrica en Pared", ejercicioTipo: "fortalecimiento", series: 3, repeticiones: 5, frecuenciaDias: 1, fechaInicio: "2026-02-15", cumplimiento: 85, activo: true },
  { id: "a2", pacienteNombre: "Ana Flores", pacienteIniciales: "AF", ejercicioNombre: "Estiramiento de Isquiotibiales", ejercicioTipo: "estiramiento", series: 3, repeticiones: 2, frecuenciaDias: 1, fechaInicio: "2026-02-15", cumplimiento: 92, activo: true },
  { id: "a3", pacienteNombre: "Carlos Mendoza", pacienteIniciales: "CM", ejercicioNombre: "Circunducción de Hombro", ejercicioTipo: "movilidad", series: 2, repeticiones: 10, frecuenciaDias: 1, fechaInicio: "2026-02-20", cumplimiento: 60, activo: true },
  { id: "a4", pacienteNombre: "Carlos Mendoza", pacienteIniciales: "CM", ejercicioNombre: "Respiración Diafragmática", ejercicioTipo: "respiracion", series: 1, repeticiones: 10, frecuenciaDias: 2, fechaInicio: "2026-02-20", cumplimiento: 45, activo: true },
  { id: "a5", pacienteNombre: "Roberto Sánchez", pacienteIniciales: "RS", ejercicioNombre: "Plancha Frontal", ejercicioTipo: "fortalecimiento", series: 3, repeticiones: 1, frecuenciaDias: 2, fechaInicio: "2026-02-01", fechaFin: "2026-02-28", cumplimiento: 100, activo: false },
  { id: "a6", pacienteNombre: "Sofía Reyes", pacienteIniciales: "SR", ejercicioNombre: "Equilibrio Unipodal", ejercicioTipo: "equilibrio", series: 3, repeticiones: 2, frecuenciaDias: 1, fechaInicio: "2026-03-01", cumplimiento: 33, activo: true },
  { id: "a7", pacienteNombre: "Sofía Reyes", pacienteIniciales: "SR", ejercicioNombre: "Elevación de Talones", ejercicioTipo: "fortalecimiento", series: 3, repeticiones: 15, frecuenciaDias: 1, fechaInicio: "2026-03-01", cumplimiento: 50, activo: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function EjerciciosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroZona, setFiltroZona] = useState<string>("todas");
  const [vista, setVista] = useState<"grid" | "list">("grid");
  const [modalCrear, setModalCrear] = useState(false);
  const [modalDetalle, setModalDetalle] = useState<Ejercicio | null>(null);
  const [modalAsignar, setModalAsignar] = useState<Ejercicio | null>(null);

  // Filtrado
  const ejerciciosFiltrados = mockEjercicios.filter((e) => {
    const matchBusqueda = e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = filtroTipo === "todos" || e.tipo === filtroTipo;
    const matchZona = filtroZona === "todas" || e.zonaCorporal.includes(filtroZona);
    return matchBusqueda && matchTipo && matchZona;
  });

  const asignadosActivos = mockAsignados.filter((a) => a.activo);
  const cumplimientoPromedio = asignadosActivos.length > 0
    ? Math.round(asignadosActivos.reduce((sum, a) => sum + a.cumplimiento, 0) / asignadosActivos.length)
    : 0;

  function formatDuracion(seg?: number): string {
    if (!seg) return "—";
    if (seg >= 60) return `${Math.floor(seg / 60)} min`;
    return `${seg} seg`;
  }

  return (
    <div className="space-y-6">
      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Biblioteca", valor: mockEjercicios.length.toString(), sub: `${mockEjercicios.filter(e => e.esGlobal).length} globales · ${mockEjercicios.filter(e => !e.esGlobal).length} propios`, icon: Dumbbell, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Asignados Activos", valor: asignadosActivos.length.toString(), sub: `${new Set(asignadosActivos.map(a => a.pacienteNombre)).size} pacientes`, icon: Target, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Cumplimiento Prom.", valor: `${cumplimientoPromedio}%`, sub: cumplimientoPromedio >= 70 ? "Buen ritmo" : "Necesita atención", icon: CheckCircle2, color: cumplimientoPromedio >= 70 ? "text-emerald-600" : "text-amber-600", bg: cumplimientoPromedio >= 70 ? "bg-emerald-50" : "bg-amber-50" },
          { label: "Con Video", valor: mockEjercicios.filter(e => e.videoUrl).length.toString(), sub: "Recursos multimedia", icon: Video, color: "text-pink-600", bg: "bg-pink-50" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-cyan-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#164E63]/50 uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-2xl font-bold text-[#164E63] mt-1">{kpi.valor}</p>
                  <p className="text-[11px] text-[#164E63]/40 mt-0.5">{kpi.sub}</p>
                </div>
                <div className={`${kpi.bg} h-10 w-10 rounded-xl flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── TABS: Biblioteca / Asignados ── */}
      <Tabs defaultValue="biblioteca" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="bg-cyan-50 border border-cyan-100">
            <TabsTrigger value="biblioteca" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white">
              <Dumbbell className="h-3.5 w-3.5 mr-1.5" /> Biblioteca
            </TabsTrigger>
            <TabsTrigger value="asignados" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white">
              <Target className="h-3.5 w-3.5 mr-1.5" /> Asignados
              {asignadosActivos.length > 0 && (
                <Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-[#0891B2]/20 text-[#0891B2] border-none">
                  {asignadosActivos.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <Button onClick={() => setModalCrear(true)} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white text-sm shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" /> Nuevo Ejercicio
          </Button>
        </div>

        {/* ─── TAB: BIBLIOTECA ─── */}
        <TabsContent value="biblioteca" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#164E63]/40" />
              <Input
                placeholder="Buscar ejercicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 border-cyan-200 focus:border-[#0891B2] h-10"
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-44 border-cyan-200 h-10 cursor-pointer">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-[#164E63]/40" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {Object.entries(TIPO_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroZona} onValueChange={setFiltroZona}>
              <SelectTrigger className="w-full sm:w-44 border-cyan-200 h-10 cursor-pointer">
                <SelectValue placeholder="Zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las zonas</SelectItem>
                {ZONAS.map((z) => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button variant={vista === "grid" ? "default" : "outline"} size="icon" className="cursor-pointer h-10 w-10" onClick={() => setVista("grid")} aria-label="Vista grilla">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={vista === "list" ? "default" : "outline"} size="icon" className="cursor-pointer h-10 w-10" onClick={() => setVista("list")} aria-label="Vista lista">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Grid / List */}
          {ejerciciosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <Dumbbell className="h-12 w-12 text-[#164E63]/20 mx-auto mb-3" />
              <p className="text-sm text-[#164E63]/50">No se encontraron ejercicios</p>
            </div>
          ) : vista === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ejerciciosFiltrados.map((ej) => {
                const tipoCfg = TIPO_CONFIG[ej.tipo];
                const nivelCfg = NIVEL_CONFIG[ej.nivelDificultad];
                return (
                  <Card
                    key={ej.id}
                    className="border-cyan-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                    onClick={() => setModalDetalle(ej)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`${tipoCfg.bg} h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <Dumbbell className={`h-5 w-5 ${tipoCfg.color}`} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {ej.videoUrl && (
                            <span className="h-6 w-6 rounded-full bg-pink-50 flex items-center justify-center">
                              <Play className="h-3 w-3 text-pink-500" />
                            </span>
                          )}
                          {ej.esGlobal && (
                            <Badge variant="outline" className="text-[10px] border-cyan-200 text-[#164E63]/50">Global</Badge>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-[#164E63] mb-1 line-clamp-1">{ej.nombre}</h3>
                      <p className="text-xs text-[#164E63]/50 leading-relaxed line-clamp-2 mb-3">{ej.descripcion}</p>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge className={`text-[10px] border ${nivelCfg.color}`} variant="outline">{nivelCfg.label}</Badge>
                        <Badge className={`text-[10px] border-transparent ${tipoCfg.bg} ${tipoCfg.color}`}>{tipoCfg.label}</Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#164E63]/40">
                        {ej.series && <span className="flex items-center gap-1"><Repeat className="h-3 w-3" />{ej.series}×{ej.repeticiones}</span>}
                        {ej.duracionSegundos && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuracion(ej.duracionSegundos)}</span>}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {ej.zonaCorporal.map((z) => (
                          <span key={z} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-[#0891B2] font-medium">{z}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-cyan-100 divide-y divide-cyan-50">
              {ejerciciosFiltrados.map((ej) => {
                const tipoCfg = TIPO_CONFIG[ej.tipo];
                return (
                  <div
                    key={ej.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-cyan-50/50 transition-colors cursor-pointer"
                    onClick={() => setModalDetalle(ej)}
                  >
                    <div className={`${tipoCfg.bg} h-9 w-9 rounded-lg flex items-center justify-center shrink-0`}>
                      <Dumbbell className={`h-4 w-4 ${tipoCfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#164E63] truncate">{ej.nombre}</p>
                      <p className="text-xs text-[#164E63]/40 truncate">{ej.descripcion}</p>
                    </div>
                    <Badge className={`text-[10px] border-transparent ${tipoCfg.bg} ${tipoCfg.color} shrink-0`}>{tipoCfg.label}</Badge>
                    <div className="flex gap-1 shrink-0">
                      {ej.zonaCorporal.slice(0, 2).map((z) => (
                        <span key={z} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-[#0891B2]">{z}</span>
                      ))}
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#164E63]/20 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB: ASIGNADOS ─── */}
        <TabsContent value="asignados" className="space-y-4">
          <div className="bg-white rounded-xl border border-cyan-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-cyan-100 bg-gradient-to-r from-[#ECFEFF] to-white">
              <p className="text-sm font-bold text-[#164E63]">Ejercicios Asignados a Pacientes</p>
              <p className="text-xs text-[#164E63]/40">{asignadosActivos.length} activos · {mockAsignados.filter(a => !a.activo).length} completados</p>
            </div>

            <div className="divide-y divide-cyan-50">
              {mockAsignados.map((asig) => {
                const tipoCfg = TIPO_CONFIG[asig.ejercicioTipo];
                return (
                  <div key={asig.id} className={`flex items-center gap-4 px-4 py-3 ${!asig.activo ? "opacity-50" : ""}`}>
                    <Avatar className="h-9 w-9 border border-cyan-200 shrink-0">
                      <AvatarFallback className="bg-[#0891B2]/15 text-[#0891B2] text-xs font-bold">
                        {asig.pacienteIniciales}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#164E63] truncate">{asig.pacienteNombre}</p>
                        {!asig.activo && <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400">Completado</Badge>}
                      </div>
                      <p className="text-xs text-[#164E63]/40 truncate">
                        {asig.ejercicioNombre} · {asig.series}×{asig.repeticiones} · cada {asig.frecuenciaDias === 1 ? "día" : `${asig.frecuenciaDias} días`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20 hidden sm:block">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[#164E63]/40">Cumpl.</span>
                          <span className={`text-[10px] font-bold ${asig.cumplimiento >= 70 ? "text-emerald-600" : asig.cumplimiento >= 40 ? "text-amber-600" : "text-red-500"}`}>
                            {asig.cumplimiento}%
                          </span>
                        </div>
                        <Progress
                          value={asig.cumplimiento}
                          className="h-1.5"
                        />
                      </div>
                      <Badge className={`text-[10px] border-transparent ${tipoCfg.bg} ${tipoCfg.color} shrink-0`}>
                        {tipoCfg.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── MODAL: DETALLE EJERCICIO ── */}
      <Dialog open={!!modalDetalle} onOpenChange={() => setModalDetalle(null)}>
        <DialogContent className="max-w-lg">
          {modalDetalle && (() => {
            const tipoCfg = TIPO_CONFIG[modalDetalle.tipo];
            const nivelCfg = NIVEL_CONFIG[modalDetalle.nivelDificultad];
            return (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-3">
                    <div className={`${tipoCfg.bg} h-11 w-11 rounded-xl flex items-center justify-center shrink-0`}>
                      <Dumbbell className={`h-5 w-5 ${tipoCfg.color}`} />
                    </div>
                    <div>
                      <DialogTitle className="text-[#164E63]">{modalDetalle.nombre}</DialogTitle>
                      <div className="flex gap-1.5 mt-1.5">
                        <Badge className={`text-[10px] border-transparent ${tipoCfg.bg} ${tipoCfg.color}`}>{tipoCfg.label}</Badge>
                        <Badge className={`text-[10px] border ${nivelCfg.color}`} variant="outline">{nivelCfg.label}</Badge>
                        {modalDetalle.esGlobal && <Badge variant="outline" className="text-[10px] border-cyan-200 text-[#164E63]/50">Global</Badge>}
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  <p className="text-sm text-[#164E63]/60 leading-relaxed">{modalDetalle.descripcion}</p>

                  {/* Parámetros */}
                  <div className="grid grid-cols-3 gap-3">
                    {modalDetalle.series && (
                      <div className="bg-cyan-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-[#164E63]">{modalDetalle.series}</p>
                        <p className="text-[10px] text-[#164E63]/40">Series</p>
                      </div>
                    )}
                    {modalDetalle.repeticiones && (
                      <div className="bg-cyan-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-[#164E63]">{modalDetalle.repeticiones}</p>
                        <p className="text-[10px] text-[#164E63]/40">Repeticiones</p>
                      </div>
                    )}
                    {modalDetalle.duracionSegundos && (
                      <div className="bg-cyan-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-[#164E63]">{formatDuracion(modalDetalle.duracionSegundos)}</p>
                        <p className="text-[10px] text-[#164E63]/40">Duración</p>
                      </div>
                    )}
                  </div>

                  {/* Zonas */}
                  <div>
                    <p className="text-xs font-semibold text-[#164E63]/50 mb-1.5">Zonas corporales</p>
                    <div className="flex flex-wrap gap-1.5">
                      {modalDetalle.zonaCorporal.map((z) => (
                        <span key={z} className="text-xs px-3 py-1 rounded-full bg-cyan-50 text-[#0891B2] font-medium">{z}</span>
                      ))}
                    </div>
                  </div>

                  {/* Instrucciones */}
                  <div>
                    <p className="text-xs font-semibold text-[#164E63]/50 mb-1.5">Instrucciones</p>
                    <p className="text-sm text-[#164E63]/70 leading-relaxed bg-cyan-50/50 rounded-xl p-3">{modalDetalle.instrucciones}</p>
                  </div>

                  {modalDetalle.videoUrl && (
                    <a href={modalDetalle.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium">
                      <Play className="h-4 w-4" /> Ver video demostrativo <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <DialogFooter className="gap-2 mt-4">
                  <Button variant="outline" onClick={() => setModalDetalle(null)} className="cursor-pointer">
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => { setModalAsignar(modalDetalle); setModalDetalle(null); }}
                    className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white"
                  >
                    <User className="h-4 w-4 mr-1.5" /> Asignar a Paciente
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CREAR EJERCICIO (placeholder) ── */}
      <Dialog open={modalCrear} onOpenChange={setModalCrear}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#164E63]">Nuevo Ejercicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#164E63]/60">Nombre</Label>
              <Input placeholder="Ej: Sentadilla Isométrica" className="border-cyan-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#164E63]/60">Tipo</Label>
              <Select>
                <SelectTrigger className="border-cyan-200 cursor-pointer"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#164E63]/60">Series</Label>
                <Input type="number" placeholder="3" className="border-cyan-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#164E63]/60">Repeticiones</Label>
                <Input type="number" placeholder="10" className="border-cyan-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#164E63]/60">Duración (seg)</Label>
                <Input type="number" placeholder="30" className="border-cyan-200" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#164E63]/60">Instrucciones</Label>
              <textarea rows={3} className="w-full text-sm border border-cyan-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#0891B2] text-[#164E63] placeholder:text-[#164E63]/30" placeholder="Describir paso a paso..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#164E63]/60">URL de Video (opcional)</Label>
              <Input placeholder="https://youtube.com/..." className="border-cyan-200" />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalCrear(false)} className="cursor-pointer">Cancelar</Button>
            <Button onClick={() => setModalCrear(false)} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white">
              <Plus className="h-4 w-4 mr-1.5" /> Crear Ejercicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: ASIGNAR A PACIENTE (placeholder) ── */}
      <Dialog open={!!modalAsignar} onOpenChange={() => setModalAsignar(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#164E63]">Asignar Ejercicio</DialogTitle>
          </DialogHeader>
          {modalAsignar && (
            <div className="space-y-4">
              <div className="bg-cyan-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-[#164E63]">{modalAsignar.nombre}</p>
                <p className="text-xs text-[#164E63]/40">{TIPO_CONFIG[modalAsignar.tipo].label}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#164E63]/60">Paciente</Label>
                <Select>
                  <SelectTrigger className="border-cyan-200 cursor-pointer"><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="af">Ana Flores Torres</SelectItem>
                    <SelectItem value="cm">Carlos Mendoza López</SelectItem>
                    <SelectItem value="rs">Roberto Sánchez Vega</SelectItem>
                    <SelectItem value="sr">Sofía Reyes Castillo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]/60">Series</Label>
                  <Input type="number" defaultValue={modalAsignar.series ?? 3} className="border-cyan-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]/60">Repeticiones</Label>
                  <Input type="number" defaultValue={modalAsignar.repeticiones ?? 10} className="border-cyan-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#164E63]/60">Frecuencia (días)</Label>
                  <Input type="number" defaultValue={1} className="border-cyan-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#164E63]/60">Instrucciones Personalizadas</Label>
                <textarea rows={2} className="w-full text-sm border border-cyan-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#0891B2] text-[#164E63] placeholder:text-[#164E63]/30" placeholder="Notas específicas para este paciente..." />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalAsignar(null)} className="cursor-pointer">Cancelar</Button>
            <Button onClick={() => setModalAsignar(null)} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white">
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
