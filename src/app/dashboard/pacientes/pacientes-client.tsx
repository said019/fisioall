"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  User,
  CreditCard,
  Phone,
  Mail,
  Activity,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// Avatar/AvatarFallback removed — not used in this component
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import Link from "next/link";
import dynamic from "next/dynamic";

const BodyMapModal = dynamic(() => import("@/components/BodyMapModal"), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-40 rounded-lg bg-[#e4ecf2] animate-pulse" />
  ),
});

const BodyMapComparador = dynamic(() => import("@/components/BodyMapComparador"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-xl bg-[#e4ecf2] animate-pulse" />
  ),
});

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
interface CitaResumen {
  id: string;
  tipoSesion: string;
  fecha: string;
  hora: string;
  estado: string;
  fisioterapeuta: string;
  esFutura: boolean;
}

type TipoExpediente = "fisioterapia" | "suelo_pelvico" | "cosme";

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  iniciales: string;
  email: string | null;
  telefono: string;
  edad: number | null;
  diagnostico: string | null;
  cie10: string | null;
  sesionesRestantes: number;
  sesionesTotal: number;
  ultimaCita: string | null;
  proximaCita: string | null;
  dolor: number | null;
  activo: boolean;
  color: string;
  ciudad: string | null;
  totalSesiones?: number;
  tiposExpediente?: TipoExpediente[];
  citas?: CitaResumen[];
}

const TIPO_EXPEDIENTE_CONFIG: Record<TipoExpediente, { label: string; color: string; bg: string; border: string }> = {
  fisioterapia:  { label: "Fisioterapia",  color: "text-[#4a7fa5]", bg: "bg-[#4a7fa5]/10", border: "border-[#4a7fa5]/30" },
  suelo_pelvico: { label: "Suelo Pélvico", color: "text-[#0d9488]", bg: "bg-[#0d9488]/10", border: "border-[#0d9488]/30" },
  cosme:         { label: "Cosmetología",  color: "text-[#854f0b]", bg: "bg-[#e89b3f]/10", border: "border-[#e89b3f]/30" },
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE HELPER
// ─────────────────────────────────────────────────────────────────────────────
function EmptyTabState({ icono: Icono, mensaje, submensaje }: { icono: React.ElementType; mensaje: string; submensaje: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <div className="h-12 w-12 rounded-2xl bg-[#e4ecf2] flex items-center justify-center">
        <Icono className="h-6 w-6 text-[#1e2d3a]/30" />
      </div>
      <p className="text-sm font-semibold text-[#1e2d3a]/50">{mensaje}</p>
      <p className="text-xs text-[#1e2d3a]/30">{submensaje}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: PerfilPaciente (panel derecho)
// ─────────────────────────────────────────────────────────────────────────────
function PerfilPaciente({ paciente, onClose }: { paciente: Paciente; onClose: () => void }) {
  const [tab, setTab] = useState<"expediente" | "soap" | "pagos" | "progreso">("expediente");
  const alerta = paciente.sesionesRestantes <= 2;

  const tabs = [
    { key: "expediente", label: "Expediente", icono: User },
    { key: "soap", label: "Notas SOAP", icono: ClipboardList },
    { key: "progreso", label: "Progreso", icono: TrendingUp },
    { key: "pagos", label: "Pagos", icono: CreditCard },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-black/30 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        aria-label="Cerrar perfil"
      />

      {/* Panel */}
      <div className="max-w-2xl w-full ml-auto bg-white border-l border-[#c8dce8] shadow-2xl overflow-y-auto flex flex-col">

        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#c8dce8] px-5 py-3 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-medium text-[#1e2d3a]/70 hover:text-[#1e2d3a] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/agenda">
              <Button size="sm" variant="outline" className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] transition-all duration-200 gap-1.5 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                Nueva Cita
              </Button>
            </Link>
            <Link href={`/dashboard/expediente?pacienteId=${paciente.id}`}>
              <Button size="sm" className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white transition-all duration-200 gap-1.5 text-xs">
                <ClipboardList className="h-3.5 w-3.5" />
                Nota SOAP
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero del paciente */}
        <div className="px-6 pt-6 pb-4 border-b border-[#c8dce8]">
          <div className="flex items-start gap-4">
            <div className={`h-14 w-14 rounded-2xl ${paciente.color} flex items-center justify-center shrink-0 shadow-md`}>
              <span className="text-lg font-bold text-white">{paciente.iniciales}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-[#1e2d3a]">{paciente.nombre} {paciente.apellido}</h2>
                {paciente.tiposExpediente?.map((tipo) => {
                  const cfg = TIPO_EXPEDIENTE_CONFIG[tipo];
                  return (
                    <Badge key={tipo} variant="outline" className={`text-[9px] font-semibold px-1.5 py-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {cfg.label}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-sm text-[#1e2d3a]/50">{paciente.edad ? `${paciente.edad} años` : ""}{paciente.ciudad ? ` · ${paciente.ciudad}` : ""}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-bold ${alerta ? "text-orange-600" : "text-emerald-600"}`}>
                    {paciente.sesionesRestantes} / {paciente.sesionesTotal} sesiones
                  </p>
                  {alerta && <AlertCircle className="h-3.5 w-3.5 text-orange-500" />}
                </div>
                <Progress
                  value={paciente.sesionesTotal > 0 ? Math.round(((paciente.sesionesTotal - paciente.sesionesRestantes) / paciente.sesionesTotal) * 100) : 0}
                  className={`h-1.5 w-20 ${alerta ? "[&>div]:bg-orange-400" : "[&>div]:bg-[#4a7fa5]"}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#c8dce8] px-4 gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-b-2 -mb-px ${
                tab === t.key
                  ? "border-[#4a7fa5] text-[#4a7fa5]"
                  : "border-transparent text-[#1e2d3a]/50 hover:text-[#1e2d3a]"
              }`}
            >
              <t.icono className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido tabs */}
        <div className="flex-1 px-5 py-5 space-y-4">

          {/* ── TAB EXPEDIENTE ── */}
          {tab === "expediente" && (
            <div className="space-y-4">
              {/* Info de contacto */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icono: Phone, label: "Teléfono", valor: paciente.telefono },
                  { icono: Mail, label: "Email", valor: paciente.email },
                  { icono: CalendarDays, label: "Última cita", valor: paciente.ultimaCita || "—" },
                  { icono: CalendarDays, label: "Próxima cita", valor: paciente.proximaCita || "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#f0f4f7] rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <item.icono className="h-3.5 w-3.5 text-[#4a7fa5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#1e2d3a]/40 font-medium">{item.label}</p>
                      <p className="text-xs font-semibold text-[#1e2d3a] truncate">{item.valor}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mapa Corporal */}
              <div className="bg-white border border-[#c8dce8] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#1e2d3a] uppercase tracking-wide">Mapa Corporal</p>
                  <div className="flex items-center gap-2">
                    <BodyMapModal
                      pacienteId={paciente.id}
                      pacienteNombre={`${paciente.nombre} ${paciente.apellido}`}
                      modoApertura="evaluacion_inicial"
                      trigger={
                        <Button size="sm" variant="outline" className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] text-xs gap-1 h-7 px-2">
                          <MapPin className="h-3 w-3" />
                          Eval. inicial
                        </Button>
                      }
                    />
                    <BodyMapModal
                      pacienteId={paciente.id}
                      pacienteNombre={`${paciente.nombre} ${paciente.apellido}`}
                      modoApertura="seguimiento"
                      trigger={
                        <Button size="sm" className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white text-xs gap-1 h-7 px-2">
                          <MapPin className="h-3 w-3" />
                          Actualizar
                        </Button>
                      }
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#1e2d3a]/40">
                  Registra hallazgos clínicos en el mapa corporal interactivo.
                </p>
              </div>

              {/* Diagnóstico */}
              <div className="bg-white border border-[#c8dce8] rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-[#1e2d3a] uppercase tracking-wide">Diagnóstico</p>
                {paciente.diagnostico ? (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-[#1e2d3a]/70 leading-relaxed">{paciente.diagnostico}</p>
                      {paciente.cie10 && (
                        <Badge variant="outline" className="text-[10px] bg-[#e4ecf2] text-[#4a7fa5] border-[#a8cfe0] shrink-0">
                          CIE-10: {paciente.cie10}
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-[#1e2d3a]/40">Sin diagnóstico registrado</p>
                    <p className="text-[10px] text-[#1e2d3a]/30 mt-1">Se registrará en la evaluación inicial</p>
                  </div>
                )}
              </div>

              {/* Citas del paciente */}
              {paciente.citas && paciente.citas.length > 0 && (
                <div className="bg-white border border-[#c8dce8] rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-[#1e2d3a] uppercase tracking-wide">Citas</p>
                  <div className="space-y-2">
                    {paciente.citas.slice(0, 5).map((cita) => (
                      <div key={cita.id} className="flex items-center gap-3 bg-[#f0f4f7]/50 rounded-lg p-2.5">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${cita.esFutura ? "bg-[#4a7fa5]/10" : "bg-[#e4ecf2]"}`}>
                          <CalendarDays className={`h-3.5 w-3.5 ${cita.esFutura ? "text-[#4a7fa5]" : "text-[#1e2d3a]/30"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1e2d3a] truncate">{cita.tipoSesion}</p>
                          <p className="text-[10px] text-[#1e2d3a]/50">{cita.fecha} · {cita.hora}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${
                          cita.estado === "completada" ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : cita.estado === "cancelada" ? "bg-red-50 text-red-500 border-red-200"
                          : cita.esFutura ? "bg-[#4a7fa5]/10 text-[#4a7fa5] border-[#a8cfe0]"
                          : "bg-[#e4ecf2] text-[#1e2d3a]/50 border-[#c8dce8]"
                        }`}>
                          {cita.estado === "completada" ? "Completada" : cita.estado === "cancelada" ? "Cancelada" : cita.esFutura ? "Agendada" : cita.estado}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB SOAP ── */}
          {tab === "soap" && (
            <EmptyTabState icono={ClipboardList} mensaje="Sin notas SOAP" submensaje="Las notas clínicas aparecerán aquí después de cada sesión" />
          )}

          {/* ── TAB PAGOS ── */}
          {tab === "pagos" && (
            <EmptyTabState icono={CreditCard} mensaje="Sin pagos registrados" submensaje="Los pagos del paciente aparecerán aquí" />
          )}

          {/* ── TAB PROGRESO ── */}
          {tab === "progreso" && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#1e2d3a]/50">
                Comparación de body maps entre sesiones
              </p>
              <BodyMapComparador pacienteId={paciente.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function PacientesClient({ initialPacientes }: { initialPacientes?: Paciente[] }) {
  const pacientesSource = initialPacientes ?? [];
  const [busqueda, setBusqueda] = useState("");
  const [vistaActiva, setVistaActiva] = useState<"grid" | "lista">("grid");
  const [pacienteActivo, setPacienteActivo] = useState<Paciente | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "alerta">("todos");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoExpediente>("todos");
  const [modalNuevoPaciente, setModalNuevoPaciente] = useState(false);

  // Form state para nuevo paciente
  const [formNuevo, setFormNuevo] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    edad: "",
    ciudad: "",
    diagnostico: "",
    cie10: "",
    sesionesTotal: "10",
  });

  const handleFormChange = (field: string, value: string) => {
    setFormNuevo((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardarPaciente = () => {
    // Mock save — solo cierra el modal y resetea el form
    setModalNuevoPaciente(false);
    setFormNuevo({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      edad: "",
      ciudad: "",
      diagnostico: "",
      cie10: "",
      sesionesTotal: "10",
    });
  };

  const alertaCount = pacientesSource.filter((p) => p.sesionesRestantes <= 2).length;

  const pacientesFiltrados = pacientesSource.filter((p) => {
    const matchBusqueda =
      `${p.nombre} ${p.apellido} ${p.diagnostico ?? ""}`.toLowerCase().includes(busqueda.toLowerCase());
    const matchAlerta = filtroEstado === "todos" || p.sesionesRestantes <= 2;
    const matchTipo = filtroTipo === "todos" || (p.tiposExpediente?.includes(filtroTipo) ?? false);
    return matchBusqueda && matchAlerta && matchTipo;
  });

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#f0f4f7] min-h-full">
      {/* Panel de perfil */}
      {pacienteActivo && (
        <PerfilPaciente paciente={pacienteActivo} onClose={() => setPacienteActivo(null)} />
      )}

      {/* ── MODAL: Nuevo Paciente ── */}
      <Dialog open={modalNuevoPaciente} onOpenChange={setModalNuevoPaciente}>
        <DialogContent className="max-w-lg border-[#c8dce8] bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1e2d3a]">Nuevo Paciente</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Nombre *</Label>
                <Input
                  placeholder="Ej. Ana"
                  value={formNuevo.nombre}
                  onChange={(e) => handleFormChange("nombre", e.target.value)}
                  className="border-[#a8cfe0] focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Apellido *</Label>
                <Input
                  placeholder="Ej. Flores Torres"
                  value={formNuevo.apellido}
                  onChange={(e) => handleFormChange("apellido", e.target.value)}
                  className="border-[#a8cfe0] focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20"
                />
              </div>
            </div>

            {/* Email + Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Email</Label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formNuevo.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className="border-[#a8cfe0] focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Teléfono</Label>
                <Input
                  placeholder="+52 55 1234 5678"
                  value={formNuevo.telefono}
                  onChange={(e) => handleFormChange("telefono", e.target.value)}
                  className="border-[#a8cfe0] focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20"
                />
              </div>
            </div>

            {/* Edad + Ciudad */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Edad</Label>
                <Input
                  type="number"
                  placeholder="34"
                  value={formNuevo.edad}
                  onChange={(e) => handleFormChange("edad", e.target.value)}
                  className="border-[#a8cfe0] focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Ciudad</Label>
                <Select value={formNuevo.ciudad} onValueChange={(v) => handleFormChange("ciudad", v)}>
                  <SelectTrigger className="cursor-pointer border-[#a8cfe0] focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDMX" className="cursor-pointer">CDMX</SelectItem>
                    <SelectItem value="Guadalajara" className="cursor-pointer">Guadalajara</SelectItem>
                    <SelectItem value="Monterrey" className="cursor-pointer">Monterrey</SelectItem>
                    <SelectItem value="Puebla" className="cursor-pointer">Puebla</SelectItem>
                    <SelectItem value="Querétaro" className="cursor-pointer">Querétaro</SelectItem>
                    <SelectItem value="Mérida" className="cursor-pointer">Mérida</SelectItem>
                    <SelectItem value="Otra" className="cursor-pointer">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Diagnóstico + CIE-10 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">Diagnóstico</Label>
                <Input
                  placeholder="Ej. Lumbalgia mecánica"
                  value={formNuevo.diagnostico}
                  onChange={(e) => handleFormChange("diagnostico", e.target.value)}
                  className="border-[#a8cfe0] focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]">CIE-10</Label>
                <Input
                  placeholder="M54.5"
                  value={formNuevo.cie10}
                  onChange={(e) => handleFormChange("cie10", e.target.value)}
                  className="border-[#a8cfe0] focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20"
                />
              </div>
            </div>

            {/* Sesiones totales */}
            <div className="w-1/3 space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]">Sesiones autorizadas</Label>
              <Input
                type="number"
                placeholder="10"
                value={formNuevo.sesionesTotal}
                onChange={(e) => handleFormChange("sesionesTotal", e.target.value)}
                className="border-[#a8cfe0] focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setModalNuevoPaciente(false)}
              className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a] hover:bg-[#e4ecf2] transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarPaciente}
              disabled={!formNuevo.nombre.trim() || !formNuevo.apellido.trim()}
              className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white transition-all duration-200 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Guardar Paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 1. HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1e2d3a]">Pacientes</h1>
          <p className="text-xs text-[#1e2d3a]/50 mt-0.5">
            {pacientesSource.filter((p) => p.activo).length} pacientes activos
          </p>
        </div>
        <Button onClick={() => setModalNuevoPaciente(true)} className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white transition-all duration-200 gap-1.5 w-fit">
          <Plus className="h-4 w-4" />
          Nuevo Paciente
        </Button>
      </div>

      {/* ── 2. FILTROS ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e2d3a]/40" />
          <Input
            placeholder="Buscar por nombre o diagnóstico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 border-[#a8cfe0] bg-white text-sm focus:border-[#4a7fa5] focus:ring-[#4a7fa5]/20"
          />
        </div>

        {/* Toggle Todos / Alerta */}
        <div className="flex items-center gap-1 bg-[#f0f4f7] border border-[#c8dce8] rounded-lg p-1">
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
              filtroEstado === "todos"
                ? "bg-white text-[#1e2d3a] shadow-sm"
                : "text-[#1e2d3a]/50 hover:text-[#1e2d3a]"
            }`}
          >
            Todos ({pacientesSource.length})
          </button>
          <button
            onClick={() => setFiltroEstado("alerta")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer flex items-center gap-1 ${
              filtroEstado === "alerta"
                ? "bg-orange-100 text-orange-700 shadow-sm"
                : "text-[#1e2d3a]/50 hover:text-[#1e2d3a]"
            }`}
          >
            <AlertCircle className="h-3 w-3" />
            Alerta ({alertaCount})
          </button>
        </div>

        {/* Filtro por tipo de expediente */}
        <div className="flex items-center gap-1 bg-[#f0f4f7] border border-[#c8dce8] rounded-lg p-1">
          <button
            onClick={() => setFiltroTipo("todos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
              filtroTipo === "todos"
                ? "bg-white text-[#1e2d3a] shadow-sm"
                : "text-[#1e2d3a]/50 hover:text-[#1e2d3a]"
            }`}
          >
            Todos
          </button>
          {(["fisioterapia", "suelo_pelvico", "cosme"] as TipoExpediente[]).map((tipo) => {
            const cfg = TIPO_EXPEDIENTE_CONFIG[tipo];
            const count = pacientesSource.filter((p) => p.tiposExpediente?.includes(tipo)).length;
            return (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  filtroTipo === tipo
                    ? `${cfg.bg} ${cfg.color} shadow-sm`
                    : "text-[#1e2d3a]/50 hover:text-[#1e2d3a]"
                }`}
              >
                {cfg.label}
                <span className={`text-[10px] ${filtroTipo === tipo ? "opacity-70" : "opacity-40"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toggle Vista */}
        <div className="flex items-center gap-1 bg-[#f0f4f7] border border-[#c8dce8] rounded-lg p-1 ml-auto">
          <button
            onClick={() => setVistaActiva("grid")}
            className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              vistaActiva === "grid" ? "bg-[#4a7fa5] text-white shadow-sm" : "text-[#1e2d3a]/50 hover:text-[#1e2d3a]"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVistaActiva("lista")}
            className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              vistaActiva === "lista" ? "bg-[#4a7fa5] text-white shadow-sm" : "text-[#1e2d3a]/50 hover:text-[#1e2d3a]"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── 3. VISTA GRID ── */}
      {vistaActiva === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pacientesFiltrados.map((paciente) => {
            const alerta = paciente.sesionesRestantes <= 2;
            const usadas = paciente.sesionesTotal - paciente.sesionesRestantes;
            const pct = paciente.sesionesTotal > 0 ? Math.round((usadas / paciente.sesionesTotal) * 100) : 0;

            return (
              <Card
                key={paciente.id}
                onClick={() => setPacienteActivo(paciente)}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                  alerta
                    ? "border-orange-200 bg-orange-50/30 hover:bg-orange-50/50"
                    : "border-[#c8dce8] bg-white hover:bg-[#f0f4f7]/50"
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Avatar + datos */}
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl ${paciente.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <span className="text-sm font-bold text-white">{paciente.iniciales}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1e2d3a] truncate">
                        {paciente.nombre} {paciente.apellido}
                      </p>
                      <p className="text-[10px] text-[#1e2d3a]/50">{paciente.edad ? `${paciente.edad} años` : ""}{paciente.edad && paciente.ciudad ? " · " : ""}{paciente.ciudad ?? ""}</p>
                    </div>
                    {alerta && <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />}
                  </div>

                  {/* Tipo expediente badges */}
                  {paciente.tiposExpediente && paciente.tiposExpediente.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {paciente.tiposExpediente.map((tipo) => {
                        const cfg = TIPO_EXPEDIENTE_CONFIG[tipo];
                        return (
                          <Badge key={tipo} variant="outline" className={`text-[9px] font-semibold px-1.5 py-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            {cfg.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Diagnóstico */}
                  <p className="text-xs text-[#1e2d3a]/60 leading-snug line-clamp-2">{paciente.diagnostico ?? "Sin diagnóstico"}</p>

                  {/* Sesiones progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#1e2d3a]/40">Sesiones</span>
                      <span className={`text-[10px] font-bold ${alerta ? "text-orange-600" : "text-[#1e2d3a]"}`}>
                        {paciente.sesionesRestantes} restantes
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className={`h-1.5 ${alerta ? "[&>div]:bg-orange-400 bg-orange-100" : "[&>div]:bg-[#4a7fa5]"}`}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-current/5">
                    <p className="text-[10px] text-[#1e2d3a]/40">
                      Próxima: <span className="font-medium text-[#1e2d3a]/60">{paciente.proximaCita ?? "—"}</span>
                    </p>
                    <div className="flex items-center gap-0.5 text-xs font-medium text-[#4a7fa5] cursor-pointer hover:text-[#4a7fa5]/80 transition-colors">
                      Ver perfil
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── 4. VISTA LISTA ── */}
      {vistaActiva === "lista" && (
        <Card className="border-[#c8dce8] bg-white">
          <div className="divide-y divide-[#c8dce8]">
            {pacientesFiltrados.map((paciente) => {
              const alerta = paciente.sesionesRestantes <= 2;
              return (
                <div
                  key={paciente.id}
                  onClick={() => setPacienteActivo(paciente)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f0f4f7]/50 transition-colors duration-200"
                >
                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-xl ${paciente.color} flex items-center justify-center shrink-0`}>
                    <span className="text-xs font-bold text-white">{paciente.iniciales}</span>
                  </div>

                  {/* Nombre + diagnóstico */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-[#1e2d3a] truncate">
                        {paciente.nombre} {paciente.apellido}
                      </p>
                      {paciente.tiposExpediente?.map((tipo) => {
                        const cfg = TIPO_EXPEDIENTE_CONFIG[tipo];
                        return (
                          <Badge key={tipo} variant="outline" className={`text-[8px] font-semibold px-1 py-0 ${cfg.bg} ${cfg.color} ${cfg.border} shrink-0`}>
                            {cfg.label}
                          </Badge>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-[#1e2d3a]/50 truncate">{paciente.diagnostico ?? "Sin diagnóstico"}</p>
                  </div>

                  {/* Próxima cita */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-[10px] text-[#1e2d3a]/40">Próxima cita</p>
                    <p className="text-xs font-medium text-[#1e2d3a]">{paciente.proximaCita ?? "—"}</p>
                  </div>

                  {/* Sesiones */}
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${alerta ? "text-orange-600" : "text-[#1e2d3a]"}`}>
                      {paciente.sesionesRestantes}
                    </p>
                    <p className="text-[10px] text-[#1e2d3a]/40">sesiones</p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#1e2d3a]/30 shrink-0" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {pacientesFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#e4ecf2] flex items-center justify-center">
            <Activity className="h-6 w-6 text-[#4a7fa5]" />
          </div>
          <p className="text-sm font-semibold text-[#1e2d3a]/60">No se encontraron pacientes</p>
          <p className="text-xs text-[#1e2d3a]/40">Intenta cambiar los filtros o la búsqueda</p>
        </div>
      )}
    </div>
  );
}
