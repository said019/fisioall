"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  ArrowLeft,
  CalendarDays,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Star,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  User,
  AlertCircle,
} from "lucide-react";
import {
  buscarPorTelefono,
  registrarPaciente,
  getCitasPaciente,
  getMembresiasPaciente,
  getHorariosDisponibles,
  getFisioterapeutasPublic,
  agendarCitaPublica,
  cancelarCitaPublica,
} from "./actions";

// ── TIPOS ────────────────────────────────────────────────────────────────────
type Paciente = {
  id: string;
  nombre: string;
  iniciales: string;
  telefono: string;
  email: string | null;
  totalSesiones: number;
  miembroDesde: string | null;
};

type CitaPaciente = {
  id: string;
  tipoSesion: string;
  fecha: string;
  hora: string;
  duracion: number;
  fisioterapeuta: string;
  estado: string;
  sala: string | null;
  esFutura: boolean;
  fechaISO: string;
};

type Membresia = {
  id: string;
  paquete: string;
  sesionesUsadas: number;
  sesionesTotal: number;
  estado: string;
};

type Slot = { hora: string; disponible: boolean };
type Fisio = { id: string; nombre: string; especialidades: string[] };

type ServicioItem = { nombre: string; duracion: number; precio: number };
type CategoriaServicio = {
  id: string;
  label: string;
  color: string;
  especialidad: string;
  servicios: ServicioItem[];
};

const CATEGORIAS: CategoriaServicio[] = [
  {
    id: "fisioterapia",
    label: "Fisioterapia",
    color: "#4a7fa5",
    especialidad: "Fisioterapia",
    servicios: [
      { nombre: "Normal / Antiestrés", duracion: 45, precio: 400 },
      { nombre: "Descarga de Esfuerzo", duracion: 45, precio: 470 },
      { nombre: "Drenaje Linfático", duracion: 45, precio: 520 },
      { nombre: "Presoterapia", duracion: 45, precio: 420 },
      { nombre: "Ejercicio Terapéutico", duracion: 45, precio: 350 },
      { nombre: "Valoración", duracion: 45, precio: 450 },
    ],
  },
  {
    id: "faciales",
    label: "Faciales",
    color: "#b07aa8",
    especialidad: "Tratamientos Faciales",
    servicios: [
      { nombre: "Masaje Facial Revitalizante", duracion: 60, precio: 450 },
      { nombre: "Limpieza Facial Básica", duracion: 60, precio: 350 },
      { nombre: "Limpieza Facial Profunda", duracion: 60, precio: 450 },
      { nombre: "Hidratación Profunda", duracion: 60, precio: 500 },
      { nombre: "Rejuvenecimiento Facial", duracion: 60, precio: 550 },
      { nombre: "Hilos de Colágeno", duracion: 60, precio: 800 },
    ],
  },
  {
    id: "corporales",
    label: "Corporales",
    color: "#e89b3f",
    especialidad: "Tratamientos Corporales",
    servicios: [
      { nombre: "Tratamiento Corporal", duracion: 60, precio: 600 },
    ],
  },
  {
    id: "epilacion",
    label: "Epilación",
    color: "#3fa87c",
    especialidad: "Tratamientos Corporales",
    servicios: [
      { nombre: "Media Pierna Inferior", duracion: 30, precio: 250 },
      { nombre: "Media Pierna Superior", duracion: 30, precio: 300 },
      { nombre: "Piernas Completas", duracion: 45, precio: 400 },
      { nombre: "Axila", duracion: 15, precio: 200 },
      { nombre: "Bigote", duracion: 15, precio: 150 },
      { nombre: "Barbilla", duracion: 15, precio: 150 },
      { nombre: "Barba Completa", duracion: 20, precio: 200 },
      { nombre: "Área de Bikini", duracion: 30, precio: 250 },
    ],
  },
];

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  agendada:    { label: "Agendada",   color: "text-[#4a7fa5]", bg: "bg-[#4a7fa5]/10" },
  confirmada:  { label: "Confirmada", color: "text-[#3fa87c]", bg: "bg-[#3fa87c]/10" },
  en_curso:    { label: "En curso",   color: "text-[#4a7fa5]", bg: "bg-[#4a7fa5]/15" },
  completada:  { label: "Completada", color: "text-[#1e2d3a]/50", bg: "bg-[#1e2d3a]/5" },
  cancelada:   { label: "Cancelada",  color: "text-[#d9534f]", bg: "bg-[#d9534f]/10" },
  no_show:     { label: "No asistió", color: "text-[#d9534f]", bg: "bg-[#d9534f]/10" },
};

// ── MINI CALENDARIO ──────────────────────────────────────────────────────────
function MiniCalendario({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (fecha: string) => void;
}) {
  const [mesOffset, setMesOffset] = useState(0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const mesBase = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1);
  const mesNombre = mesBase.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const primerDia = new Date(mesBase.getFullYear(), mesBase.getMonth(), 1);
  const ultimoDia = new Date(mesBase.getFullYear(), mesBase.getMonth() + 1, 0);

  let offset = primerDia.getDay() - 1;
  if (offset < 0) offset = 6;

  const celdas: (number | null)[] = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= ultimoDia.getDate(); d++) celdas.push(d);

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          disabled={mesOffset === 0}
          onClick={() => setMesOffset((p) => p - 1)}
          className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-[#e4ecf2] disabled:opacity-30 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 text-[#1e2d3a]" />
        </button>
        <span className="text-sm font-semibold text-[#1e2d3a] capitalize">{mesNombre}</span>
        <button
          type="button"
          disabled={mesOffset >= 2}
          onClick={() => setMesOffset((p) => p + 1)}
          className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-[#e4ecf2] disabled:opacity-30 transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4 text-[#1e2d3a]" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-[#8fa8ba] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {celdas.map((dia, i) => {
          if (dia === null) return <div key={`e-${i}`} />;
          const fecha = new Date(mesBase.getFullYear(), mesBase.getMonth(), dia);
          const dateStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const isPast = fecha < hoy;
          const isDomingo = fecha.getDay() === 0;
          const isDisabled = isPast || isDomingo;
          const isSelected = dateStr === selected;
          const isToday = fecha.getTime() === hoy.getTime();

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(dateStr)}
              className={`h-9 w-full rounded-lg text-xs font-medium transition-all ${
                isDisabled
                  ? "text-[#d0d5da] cursor-not-allowed"
                  : isSelected
                  ? "bg-[#4a7fa5] text-white shadow-md shadow-[#4a7fa5]/25"
                  : isToday
                  ? "bg-[#4a7fa5]/10 text-[#4a7fa5] font-bold hover:bg-[#4a7fa5]/20 cursor-pointer"
                  : "text-[#1e2d3a] hover:bg-[#e4ecf2] cursor-pointer"
              }`}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────
export default function AgendarPage() {
  // ── State machine: "phone" → "register" → "profile" ──
  const [vista, setVista] = useState<"phone" | "register" | "profile">("phone");
  const [telefono, setTelefono] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [regNombre, setRegNombre] = useState("");
  const [regApellido, setRegApellido] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [regError, setRegError] = useState("");
  const [errorTel, setErrorTel] = useState("");

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [citas, setCitas] = useState<CitaPaciente[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);

  // Nueva cita
  const [modalNuevaCita, setModalNuevaCita] = useState(false);
  const [categoriaId, setCategoriaId] = useState("");
  const [fechaCita, setFechaCita] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [tipoSesion, setTipoSesion] = useState("");
  const [duracion, setDuracion] = useState("45");
  const [fisioId, setFisioId] = useState("");
  const [fisios, setFisios] = useState<Fisio[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formState, formAction, isPending] = useActionState(agendarCitaPublica, null);

  // Cancelar cita
  const [cancelando, startCancelar] = useTransition();
  const [modalCancelar, setModalCancelar] = useState<CitaPaciente | null>(null);

  // ── Buscar paciente por teléfono ──
  async function handleBuscar() {
    setErrorTel("");

    setBuscando(true);

    try {
      const result = await buscarPorTelefono(telefono);

      if (result.error) {
        setErrorTel(result.error);
      } else if (result.notFound) {
        setVista("register");
      } else if (result.paciente) {
        setPaciente(result.paciente);
        // Load citas + membresías
        const [citasData, memData] = await Promise.all([
          getCitasPaciente(result.paciente.id),
          getMembresiasPaciente(result.paciente.id),
        ]);
        setCitas(citasData as any);
        setMembresias(memData as any);
        setVista("profile");
      }
    } catch {
      setErrorTel("Error de conexión. Intenta de nuevo.");
    } finally {
      setBuscando(false);
    }
  }

  // ── Registrar paciente nuevo ──
  async function handleRegistro() {
    setRegError("");
    setRegistrando(true);
    try {
      const result = await registrarPaciente(telefono, regNombre, regApellido, regEmail || undefined);
      if (result.error) {
        setRegError(result.error);
      } else if (result.paciente) {
        setPaciente(result.paciente);
        setCitas([]);
        setMembresias([]);
        setVista("profile");
      }
    } catch {
      setRegError("Error de conexión. Intenta de nuevo.");
    } finally {
      setRegistrando(false);
    }
  }

  // ── Cargar horarios cuando se elige fecha ──
  useEffect(() => {
    if (!fechaCita) return;
    setLoadingSlots(true);
    setHoraSeleccionada("");
    getHorariosDisponibles(fechaCita)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [fechaCita]);

  // ── Cargar fisioterapeutas al abrir modal ──
  useEffect(() => {
    if (modalNuevaCita && fisios.length === 0) {
      getFisioterapeutasPublic().then(setFisios);
    }
  }, [modalNuevaCita]);

  // ── Auto-seleccionar fisio si solo hay uno para la categoría ──
  useEffect(() => {
    if (!categoriaId || fisios.length === 0) return;
    const cat = CATEGORIAS.find((c) => c.id === categoriaId);
    if (!cat) return;
    const compatibles = fisios.filter((f) =>
      f.especialidades.some((e) => e === cat.especialidad)
    );
    if (compatibles.length === 1) {
      setFisioId(compatibles[0].id);
    }
  }, [categoriaId, fisios]);

  // ── Cuando se agenda exitosamente ──
  useEffect(() => {
    if (formState?.success && paciente) {
      setModalNuevaCita(false);
      setCategoriaId("");
      setFechaCita("");
      setHoraSeleccionada("");
      setTipoSesion("");
      // Refresh citas
      getCitasPaciente(paciente.id).then(setCitas);
    }
  }, [formState]);

  // ── Cancelar cita ──
  function handleCancelar(cita: CitaPaciente) {
    if (!paciente) return;
    startCancelar(async () => {
      const result = await cancelarCitaPublica(cita.id, paciente.id);
      if (result.success) {
        setModalCancelar(null);
        const updated = await getCitasPaciente(paciente.id);
        setCitas(updated);
      }
    });
  }

  // ── Categoría activa y servicios filtrados ──
  const categoriaActiva = CATEGORIAS.find((c) => c.id === categoriaId);
  const fisiosFiltrados = categoriaActiva
    ? fisios.filter((f) => f.especialidades.some((e) => e === categoriaActiva.especialidad))
    : fisios;

  const citasFuturas = citas.filter((c) => c.esFutura && c.estado !== "cancelada");
  const citasPasadas = citas.filter((c) => !c.esFutura || c.estado === "cancelada");

  // ─────────────────────────────────────────────────────────────────────────
  // VISTA: INGRESAR TELÉFONO
  // ─────────────────────────────────────────────────────────────────────────
  if (vista === "phone") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f4f7] to-white flex flex-col">
        {/* Header */}
        <header className="border-b border-[#c8dce8] bg-white/80 backdrop-blur-md">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 text-[#4a7fa5]" />
              <span className="text-lg font-semibold text-[#4a7fa5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Kaya Kalp
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm space-y-8">
            {/* Icon */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-[#4a7fa5]/10 flex items-center justify-center mb-4">
                <CalendarDays className="h-8 w-8 text-[#4a7fa5]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1e2d3a]">Mi Cuenta Kaya Kalp</h1>
              <p className="text-sm text-[#5a7080] mt-2">
                Ingresa tu número de teléfono para ver tus citas, agendar o reagendar.
              </p>
            </div>

            {/* Phone input */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-[#1e2d3a]">Número de celular</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e2d3a]/30" />
                <Input
                  type="tel"
                  placeholder="427 123 4567"
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(e.target.value);
                    setErrorTel("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                  className="pl-11 h-12 text-base border-[#a8cfe0] focus:border-[#4a7fa5] rounded-xl"
                  maxLength={15}
                />
              </div>

              {errorTel && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errorTel}
                </p>
              )}

              <Button
                onClick={handleBuscar}
                disabled={buscando || telefono.replace(/\D/g, "").length < 10}
                className="w-full h-12 bg-[#4a7fa5] hover:bg-[#2d5f80] text-white font-semibold rounded-xl cursor-pointer transition-all duration-200"
              >
                {buscando ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</>
                ) : (
                  <>Acceder a mi cuenta</>
                )}
              </Button>
            </div>

            <p className="text-center text-[10px] text-[#8fa8ba]">
              Si es tu primera vez, te registraremos automáticamente.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VISTA: REGISTRO NUEVO PACIENTE
  // ─────────────────────────────────────────────────────────────────────────
  if (vista === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f4f7] to-white flex flex-col">
        <header className="border-b border-[#c8dce8] bg-white/80 backdrop-blur-md">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setVista("phone")}
              className="flex items-center gap-2 text-sm text-[#4a7fa5] cursor-pointer hover:text-[#2d5f80] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <span className="text-lg font-semibold text-[#4a7fa5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Kaya Kalp
            </span>
            <div className="w-16" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-[#3fa87c]/10 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-[#3fa87c]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1e2d3a]">Crear tu cuenta</h1>
              <p className="text-sm text-[#5a7080] mt-2">
                Es tu primera vez. Ingresa tu nombre para registrarte.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-[#e4ecf2] rounded-full px-4 py-1.5">
                <Phone className="h-3.5 w-3.5 text-[#4a7fa5]" />
                <span className="text-xs font-medium text-[#1e2d3a]">{telefono}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1e2d3a]">Nombre(s)</Label>
                <Input
                  placeholder="Ej. María"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  className="h-12 text-base border-[#a8cfe0] focus:border-[#4a7fa5] rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1e2d3a]">Apellido(s)</Label>
                <Input
                  placeholder="Ej. González Ríos"
                  value={regApellido}
                  onChange={(e) => setRegApellido(e.target.value)}
                  className="h-12 text-base border-[#a8cfe0] focus:border-[#4a7fa5] rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-[#1e2d3a]">
                  Correo electrónico <span className="text-[#8fa8ba] font-normal">(opcional)</span>
                </Label>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegistro()}
                  className="h-12 text-base border-[#a8cfe0] focus:border-[#4a7fa5] rounded-xl"
                />
              </div>

              {regError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {regError}
                </p>
              )}

              <Button
                onClick={handleRegistro}
                disabled={registrando || !regNombre.trim() || !regApellido.trim()}
                className="w-full h-12 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white font-semibold rounded-xl cursor-pointer transition-all duration-200"
              >
                {registrando ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
                ) : (
                  <><CheckCircle2 className="mr-2 h-4 w-4" /> Crear cuenta y continuar</>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VISTA: PERFIL DEL PACIENTE
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f4f7]">
      {/* Header */}
      <header className="border-b border-[#c8dce8] bg-white sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => { setVista("phone"); setPaciente(null); }}
            className="flex items-center gap-2 text-sm text-[#4a7fa5] cursor-pointer hover:text-[#2d5f80] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Salir
          </button>
          <span className="text-sm font-semibold text-[#4a7fa5]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Kaya Kalp
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* ── Profile card ── */}
        {paciente && (
          <div className="bg-white rounded-2xl border border-[#c8dce8] p-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-[#a8cfe0]">
                <AvatarFallback className="bg-[#4a7fa5]/15 text-[#4a7fa5] font-bold text-lg">
                  {paciente.iniciales}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-[#1e2d3a] truncate">{paciente.nombre}</h2>
                <p className="text-xs text-[#5a7080]">{paciente.telefono}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#e4ecf2]/50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-[#4a7fa5]">{paciente.totalSesiones}</p>
                <p className="text-[10px] text-[#5a7080]">Sesiones totales</p>
              </div>
              <div className="bg-[#e4ecf2]/50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-[#4a7fa5]">{citasFuturas.length}</p>
                <p className="text-[10px] text-[#5a7080]">Citas próximas</p>
              </div>
            </div>

            {/* Membresías activas */}
            {membresias.length > 0 && (
              <div className="mt-4 space-y-2">
                {membresias.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 bg-[#3fa87c]/5 rounded-xl p-3">
                    <CreditCard className="h-4 w-4 text-[#3fa87c] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1e2d3a] truncate">{m.paquete}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-[#e4ecf2] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3fa87c] rounded-full"
                            style={{ width: `${(m.sesionesUsadas / m.sesionesTotal) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#5a7080] font-medium shrink-0">
                          {m.sesionesUsadas}/{m.sesionesTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Botón agendar ── */}
        <Button
          onClick={() => setModalNuevaCita(true)}
          className="w-full h-12 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white font-semibold rounded-xl cursor-pointer transition-all duration-200 text-base"
        >
          <Plus className="mr-2 h-5 w-5" />
          Agendar Nueva Cita
        </Button>

        {/* ── Próximas citas ── */}
        {citasFuturas.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#1e2d3a] mb-3">Próximas Citas</h3>
            <div className="space-y-2.5">
              {citasFuturas.map((cita) => {
                const conf = ESTADO_CONFIG[cita.estado] ?? ESTADO_CONFIG.agendada;
                return (
                  <Card key={cita.id} className="border-[#c8dce8] bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-[#4a7fa5]/10 h-11 w-11 rounded-xl flex flex-col items-center justify-center shrink-0">
                          <CalendarDays className="h-4 w-4 text-[#4a7fa5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1e2d3a]">{cita.tipoSesion}</p>
                          <p className="text-xs text-[#5a7080] mt-0.5">
                            {cita.fecha} · {cita.hora} · {cita.duracion}min
                          </p>
                          <p className="text-[10px] text-[#8fa8ba] mt-0.5">{cita.fisioterapeuta}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <Badge className={`text-[10px] ${conf.bg} ${conf.color} border-none`}>
                            {conf.label}
                          </Badge>
                          <button
                            onClick={() => setModalCancelar(cita)}
                            className="text-[10px] text-[#d9534f] hover:text-[#d9534f]/80 cursor-pointer font-medium"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Historial ── */}
        {citasPasadas.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#1e2d3a] mb-3">Historial</h3>
            <div className="space-y-2">
              {citasPasadas.slice(0, 8).map((cita) => {
                const conf = ESTADO_CONFIG[cita.estado] ?? ESTADO_CONFIG.completada;
                return (
                  <div key={cita.id} className="flex items-center gap-3 bg-white rounded-xl border border-[#e4ecf2] p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1e2d3a] truncate">{cita.tipoSesion}</p>
                      <p className="text-[10px] text-[#8fa8ba]">{cita.fecha} · {cita.hora}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${conf.bg} ${conf.color} border-none`}>
                      {conf.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {citas.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays className="h-10 w-10 text-[#1e2d3a]/15 mx-auto mb-3" />
            <p className="text-sm text-[#5a7080]">Aún no tienes citas registradas</p>
            <p className="text-xs text-[#8fa8ba] mt-1">Agenda tu primera cita arriba</p>
          </div>
        )}
      </main>

      {/* ── MODAL: NUEVA CITA ── */}
      <Dialog open={modalNuevaCita} onOpenChange={setModalNuevaCita}>
        <DialogContent className="max-w-[26rem] border-[#c8dce8] p-0 gap-0 overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-[#4a7fa5] to-[#3fa87c] px-5 py-4">
            <DialogHeader>
              <DialogTitle className="text-white font-bold text-base">Agendar Cita</DialogTitle>
              <DialogDescription className="text-white/70 text-xs">
                Elige servicio, fecha y horario
              </DialogDescription>
            </DialogHeader>
          </div>

          <form action={formAction} className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
            <input type="hidden" name="pacienteId" value={paciente?.id || ""} />
            <input type="hidden" name="horaInicio" value={horaSeleccionada} />
            <input type="hidden" name="duracion" value={duracion} />
            <input type="hidden" name="fisioterapeutaId" value={fisioId} />
            <input type="hidden" name="fecha" value={fechaCita} />
            <input type="hidden" name="tipoSesion" value={tipoSesion} />

            {/* ── PASO 1: Categoría ── */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#4a7fa5] flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </div>
                <Label className="text-sm font-semibold text-[#1e2d3a]">Servicio</Label>
              </div>

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoriaId(cat.id);
                      setTipoSesion("");
                      setDuracion("45");
                      setFisioId("");
                    }}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      categoriaId === cat.id
                        ? "text-white shadow-md"
                        : "bg-[#f0f4f7] text-[#5a7080] hover:bg-[#e4ecf2]"
                    }`}
                    style={categoriaId === cat.id ? { backgroundColor: cat.color, boxShadow: `0 4px 12px ${cat.color}40` } : undefined}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Service list for selected category */}
              {categoriaActiva && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {categoriaActiva.servicios.map((srv) => (
                    <button
                      key={srv.nombre}
                      type="button"
                      onClick={() => {
                        setTipoSesion(srv.nombre);
                        setDuracion(String(srv.duracion));
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        tipoSesion === srv.nombre
                          ? "bg-[#4a7fa5]/8 border-2 border-[#4a7fa5]/30"
                          : "bg-[#f8fafb] border-2 border-transparent hover:border-[#c8dce8]"
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-semibold ${tipoSesion === srv.nombre ? "text-[#4a7fa5]" : "text-[#1e2d3a]"}`}>
                          {srv.nombre}
                        </p>
                        <p className="text-[10px] text-[#8fa8ba] mt-0.5">{srv.duracion} min</p>
                      </div>
                      <span className={`text-xs font-bold ${tipoSesion === srv.nombre ? "text-[#4a7fa5]" : "text-[#5a7080]"}`}>
                        ${srv.precio}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Divider ── */}
            {tipoSesion && <div className="border-t border-[#e4ecf2]" />}

            {/* ── PASO 2: Calendario ── */}
            {tipoSesion && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#4a7fa5] flex items-center justify-center">
                    <CalendarDays className="h-3 w-3 text-white" />
                  </div>
                  <Label className="text-sm font-semibold text-[#1e2d3a]">Fecha</Label>
                </div>
                <div className="bg-[#f8fafb] rounded-xl p-3 border border-[#e4ecf2]">
                  <MiniCalendario
                    selected={fechaCita}
                    onSelect={(f) => {
                      setFechaCita(f);
                      setHoraSeleccionada("");
                    }}
                  />
                </div>
              </div>
            )}

            {/* ── PASO 3: Horarios ── */}
            {fechaCita && tipoSesion && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#4a7fa5] flex items-center justify-center">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                  <Label className="text-sm font-semibold text-[#1e2d3a]">Horario</Label>
                </div>

                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-6 justify-center bg-[#f8fafb] rounded-xl">
                    <Loader2 className="h-4 w-4 animate-spin text-[#4a7fa5]" />
                    <span className="text-xs text-[#5a7080]">Cargando horarios...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Mañana */}
                    {slots.filter((s) => parseInt(s.hora) < 13).length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wider mb-1.5">Mañana</p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {slots.filter((s) => parseInt(s.hora) < 13).map((s) => (
                            <button
                              key={s.hora}
                              type="button"
                              disabled={!s.disponible}
                              onClick={() => setHoraSeleccionada(s.hora)}
                              className={`py-2 px-1 text-xs font-medium rounded-lg transition-all ${
                                !s.disponible
                                  ? "bg-[#f0f2f4] text-[#c8cdd2] cursor-not-allowed"
                                  : horaSeleccionada === s.hora
                                  ? "bg-[#4a7fa5] text-white shadow-md shadow-[#4a7fa5]/25 scale-[1.02]"
                                  : "bg-white border border-[#dde5ec] text-[#1e2d3a] hover:border-[#4a7fa5] hover:bg-[#4a7fa5]/5 cursor-pointer"
                              }`}
                            >
                              {s.hora}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tarde */}
                    {slots.filter((s) => parseInt(s.hora) >= 13).length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wider mb-1.5">Tarde</p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {slots.filter((s) => parseInt(s.hora) >= 13).map((s) => (
                            <button
                              key={s.hora}
                              type="button"
                              disabled={!s.disponible}
                              onClick={() => setHoraSeleccionada(s.hora)}
                              className={`py-2 px-1 text-xs font-medium rounded-lg transition-all ${
                                !s.disponible
                                  ? "bg-[#f0f2f4] text-[#c8cdd2] cursor-not-allowed"
                                  : horaSeleccionada === s.hora
                                  ? "bg-[#4a7fa5] text-white shadow-md shadow-[#4a7fa5]/25 scale-[1.02]"
                                  : "bg-white border border-[#dde5ec] text-[#1e2d3a] hover:border-[#4a7fa5] hover:bg-[#4a7fa5]/5 cursor-pointer"
                              }`}
                            >
                              {s.hora}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {slots.every((s) => !s.disponible) && (
                      <div className="text-center py-4 bg-[#f8fafb] rounded-xl">
                        <p className="text-xs text-[#8fa8ba]">No hay horarios disponibles este día</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Terapeuta (auto-filtrado por categoría) ── */}
            {horaSeleccionada && fisiosFiltrados.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[11px] text-[#5a7080]">
                  Terapeuta {fisiosFiltrados.length === 1 ? "" : "(opcional)"}
                </Label>
                {fisiosFiltrados.length === 1 ? (
                  <div className="bg-[#f8fafb] border border-[#e4ecf2] rounded-xl px-3 py-2.5 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#4a7fa5]/15 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-[#4a7fa5]" />
                    </div>
                    <span className="text-sm font-medium text-[#1e2d3a]">{fisiosFiltrados[0].nombre}</span>
                  </div>
                ) : (
                  <Select value={fisioId} onValueChange={setFisioId}>
                    <SelectTrigger className="h-10 text-sm border-[#c8dce8] rounded-xl cursor-pointer bg-[#f8fafb] hover:bg-white transition-colors">
                      <SelectValue placeholder="Sin preferencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {fisiosFiltrados.map((f) => (
                        <SelectItem key={f.id} value={f.id} className="cursor-pointer">{f.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Error */}
            {formState?.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {formState.error}
                </p>
              </div>
            )}

            {/* Success */}
            {formState?.success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Cita agendada correctamente
                </p>
              </div>
            )}

            {/* ── Resumen + Botones ── */}
            <div className="pt-1 space-y-3">
              {horaSeleccionada && fechaCita && tipoSesion && (
                <div className="bg-[#4a7fa5]/5 border border-[#4a7fa5]/15 rounded-xl p-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#4a7fa5]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-[#4a7fa5]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1e2d3a]">
                      {new Date(fechaCita + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })} · {horaSeleccionada}
                    </p>
                    <p className="text-[10px] text-[#5a7080]">
                      {tipoSesion} · {duracion} min
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalNuevaCita(false)}
                  className="flex-1 h-11 border-[#c8dce8] cursor-pointer text-sm rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !horaSeleccionada || !fechaCita || !tipoSesion}
                  className="flex-1 h-11 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer transition-all duration-200 text-sm rounded-xl font-semibold"
                >
                  {isPending ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Agendando...</>
                  ) : (
                    <><CalendarDays className="mr-1.5 h-4 w-4" /> Confirmar Cita</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CANCELAR CITA ── */}
      <Dialog open={!!modalCancelar} onOpenChange={() => setModalCancelar(null)}>
        {modalCancelar && (
          <DialogContent className="max-w-sm border-[#c8dce8]">
            <DialogHeader>
              <DialogTitle className="text-[#1e2d3a] font-bold">Cancelar Cita</DialogTitle>
              <DialogDescription className="text-[#5a7080] text-xs">
                Esta acción no se puede deshacer
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="bg-[#e4ecf2]/50 rounded-xl p-4">
                <p className="text-sm font-semibold text-[#1e2d3a]">{modalCancelar.tipoSesion}</p>
                <p className="text-xs text-[#5a7080] mt-0.5">
                  {modalCancelar.fecha} · {modalCancelar.hora} · {modalCancelar.duracion}min
                </p>
                <p className="text-[10px] text-[#8fa8ba] mt-0.5">{modalCancelar.fisioterapeuta}</p>
              </div>

              <p className="text-xs text-[#5a7080]">
                Si necesitas reagendar, cancela esta cita y agenda una nueva con el horario que prefieras.
              </p>
            </div>

            <DialogFooter className="gap-2 pt-3">
              <Button
                variant="outline"
                onClick={() => setModalCancelar(null)}
                className="border-[#a8cfe0] cursor-pointer text-sm"
              >
                Volver
              </Button>
              <Button
                onClick={() => handleCancelar(modalCancelar)}
                disabled={cancelando}
                className="bg-[#d9534f] hover:bg-[#d9534f]/90 text-white cursor-pointer transition-all duration-200 text-sm"
              >
                {cancelando ? (
                  <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Cancelando...</>
                ) : (
                  <><XCircle className="mr-1.5 h-4 w-4" /> Sí, cancelar cita</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
