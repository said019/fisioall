"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Upload,
  Receipt,
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
  getTarjetasPaciente,
  getScheduleConfig,
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
  estado: string | null;
};

type TarjetaLealtad = {
  id: string;
  sellosTotal: number;
  sellosUsados: number;
  estado: string;
  sellos: boolean[];
  recompensa: string;
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
    id: "suelo_pelvico",
    label: "Suelo Pélvico",
    color: "#0d9488",
    especialidad: "Suelo Pélvico",
    servicios: [
      { nombre: "Valoración Suelo Pélvico", duracion: 60, precio: 500 },
      { nombre: "Rehabilitación Suelo Pélvico", duracion: 45, precio: 450 },
      { nombre: "Terapia Prenatal", duracion: 45, precio: 450 },
      { nombre: "Terapia Postparto", duracion: 45, precio: 450 },
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

// ── WALLET BUTTONS (público) ─────────────────────────────────────────────────
function WalletButtonsPublic({ tarjetaId }: { tarjetaId: string }) {
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);
  const [msg, setMsg] = useState<{ type: "info" | "error"; text: string } | null>(null);

  const handleApple = async () => {
    setLoading("apple");
    setMsg(null);
    try {
      const res = await fetch(`/api/wallet/apple/${tarjetaId}`);
      if (res.status === 503) {
        setMsg({ type: "info", text: "Apple Wallet aún no está disponible." });
        return;
      }
      if (!res.ok) {
        setMsg({ type: "error", text: "Error al generar el pase." });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kaya-kalp-lealtad-${tarjetaId.slice(0, 8)}.pkpass`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setMsg({ type: "error", text: "Error de conexión." });
    } finally {
      setLoading(null);
    }
  };

  const handleGoogle = async () => {
    setLoading("google");
    setMsg(null);
    try {
      const res = await fetch(`/api/wallet/google/${tarjetaId}`);
      if (res.status === 503) {
        setMsg({ type: "info", text: "Google Wallet aún no está disponible." });
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.saveUrl) {
        setMsg({ type: "error", text: "Error al generar la URL." });
        return;
      }
      window.open(data.saveUrl, "_blank");
    } catch {
      setMsg({ type: "error", text: "Error de conexión." });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-[#e4ecf2]">
      <p className="text-[10px] font-bold text-[#8fa8ba] uppercase tracking-wider mb-2">
        Agregar a tu Wallet
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleApple}
          disabled={loading !== null}
          className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#1e2d3a] text-white text-xs font-medium hover:bg-[#1e2d3a]/80 disabled:opacity-50 transition-all"
        >
          {loading === "apple" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          )}
          Apple Wallet
        </button>
        <button
          onClick={handleGoogle}
          disabled={loading !== null}
          className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#4285f4] text-white text-xs font-medium hover:bg-[#4285f4]/80 disabled:opacity-50 transition-all"
        >
          {loading === "google" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
          )}
          Google Wallet
        </button>
      </div>
      {msg && (
        <p className={`text-[10px] mt-1.5 ${msg.type === "error" ? "text-[#d9534f]" : "text-[#5a7080]"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

// ── MINI CALENDARIO ──────────────────────────────────────────────────────────
function MiniCalendario({
  selected,
  onSelect,
  diasInactivos = [0],
  diasBloqueados = [],
}: {
  selected: string;
  onSelect: (fecha: string) => void;
  diasInactivos?: number[];
  diasBloqueados?: string[];
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
          const isDiaInactivo = diasInactivos.includes(fecha.getDay());
          const isBloqueado = diasBloqueados.includes(dateStr);
          const isDisabled = isPast || isDiaInactivo || isBloqueado;
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
  const [tarjetas, setTarjetas] = useState<TarjetaLealtad[]>([]);

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
  const [scheduleConfig, setScheduleConfig] = useState<{ diasInactivos: number[]; diasBloqueados: string[] }>({ diasInactivos: [0], diasBloqueados: [] });

  // Anticipo
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [comprobantePreview, setComprobantePreview] = useState("");
  const [uploadingComprobante, setUploadingComprobante] = useState(false);

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
        // Load citas + membresías + tarjetas
        const [citasData, memData, tarjetasData] = await Promise.all([
          getCitasPaciente(result.paciente.id),
          getMembresiasPaciente(result.paciente.id),
          getTarjetasPaciente(result.paciente.id),
        ]);
        setCitas(citasData);
        setMembresias(memData);
        setTarjetas(tarjetasData);
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
        setTarjetas([]);
        setVista("profile");
      }
    } catch {
      setRegError("Error de conexión. Intenta de nuevo.");
    } finally {
      setRegistrando(false);
    }
  }

  // ── Especialidad derivada de la categoría seleccionada ──
  const especialidadSeleccionada = CATEGORIAS.find((c) => c.id === categoriaId)?.especialidad;

  // ── Cargar horarios cuando se elige fecha, fisio o categoría ──
  useEffect(() => {
    if (!fechaCita) return;
    setLoadingSlots(true);
    setHoraSeleccionada("");
    getHorariosDisponibles(fechaCita, fisioId || undefined, especialidadSeleccionada, Number(duracion) || 60)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [fechaCita, fisioId, especialidadSeleccionada, duracion]);

  // ── Cargar fisioterapeutas al abrir modal ──
  useEffect(() => {
    if (modalNuevaCita) {
      if (fisios.length === 0) getFisioterapeutasPublic().then(setFisios);
    }
  }, [modalNuevaCita, fisios.length]);

  // ── Actualizar días inactivos del calendario según fisio/categoría ──
  useEffect(() => {
    if (!modalNuevaCita) return;
    getScheduleConfig(fisioId || undefined, especialidadSeleccionada).then(setScheduleConfig);
  }, [modalNuevaCita, fisioId, especialidadSeleccionada]);

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
      setComprobanteUrl("");
      setComprobantePreview("");
      // Refresh citas
      getCitasPaciente(paciente.id).then(setCitas);
    }
  }, [formState, paciente]);

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
              <Image
                src="/images/logo-kaya-kalp.webp"
                alt="Kaya Kalp"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
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
            <Image src="/images/logo-kaya-kalp.webp" alt="Kaya Kalp" width={120} height={40} className="h-8 w-auto" />
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
          <Image src="/images/logo-kaya-kalp.webp" alt="Kaya Kalp" width={100} height={36} className="h-7 w-auto" />
          <div className="w-12" />
        </div>
      </header>

      {/* ── PROFILE CONTENT (hidden when booking) ── */}
      {!modalNuevaCita && (
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

        {/* ── Tarjetas de lealtad ── */}
        {tarjetas.length > 0 && (
          <div className="space-y-4">
            {tarjetas.map((t) => (
              <div key={t.id} className="rounded-2xl overflow-hidden shadow-lg shadow-[#4a7fa5]/10">
                {/* ── Card Top: Brand header ── */}
                <div className="relative bg-gradient-to-br from-[#f5f9fc] via-[#eaf1f7] to-[#dce8f0] px-5 pt-5 pb-4">
                  {/* Decorative wave accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <svg viewBox="0 0 120 120" fill="none">
                      <circle cx="80" cy="40" r="60" fill="#4a7fa5" />
                      <circle cx="90" cy="30" r="40" fill="#1e3a4f" />
                    </svg>
                  </div>
                  <div className="relative flex items-start justify-between">
                    <div>
                      <Image
                        src="/images/logo-kaya-kalp.webp"
                        alt="Kaya Kalp"
                        width={120}
                        height={43}
                        className="h-10 w-auto mb-1"
                      />
                      <p className="text-[10px] text-[#5a7080] italic">Dando vida a tu cuerpo</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-[#1e3a4f] rounded-lg px-3 py-1.5 inline-block">
                        <p className="text-[9px] text-white/70 uppercase tracking-wider font-semibold leading-none">Tarjeta de</p>
                        <p className="text-sm text-white font-bold italic leading-tight">Lealtad</p>
                      </div>
                      <p className="text-[9px] text-[#5a7080] mt-1 uppercase tracking-wide font-semibold">Fisioterapia</p>
                    </div>
                  </div>
                  {t.estado === "completada" && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2">
                      <Badge className="text-[10px] bg-[#3fa87c] text-white border-none shadow-sm px-3">
                        Completada
                      </Badge>
                    </div>
                  )}
                </div>

                {/* ── Card Bottom: Stamps area ── */}
                <div className="relative bg-gradient-to-b from-[#b8d0e0] to-[#a3c1d4] px-5 py-5">
                  {/* Decorative curve divider */}
                  <div className="absolute -top-4 left-0 right-0 h-5 overflow-hidden">
                    <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M0 20 Q100 0 200 10 Q300 20 400 5 L400 20 Z" fill="#b8d0e0" />
                    </svg>
                  </div>

                  {/* Stamps 5x2 grid */}
                  <div className="grid grid-cols-5 gap-3">
                    {t.sellos.map((usado, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-full flex items-center justify-center transition-all ${
                          usado
                            ? "bg-white shadow-md shadow-[#4a7fa5]/20"
                            : "bg-white/50 border-2 border-dashed border-white/60"
                        }`}
                      >
                        {usado ? (
                          <Image
                            src="/images/logo-kaya-kalp.webp"
                            alt="Sello"
                            width={48}
                            height={48}
                            className="h-7 w-7 object-contain opacity-80"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white/60">{i + 1}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${(t.sellosUsados / t.sellosTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-white font-bold shrink-0">
                      {t.sellosUsados}/{t.sellosTotal}
                    </span>
                  </div>
                </div>

                {/* ── Reward + Wallet ── */}
                <div className="bg-white px-5 py-4 space-y-3">
                  <div className="flex items-center gap-2 bg-[#e89b3f]/8 border border-[#e89b3f]/15 rounded-xl p-3">
                    <Star className="h-4 w-4 text-[#e89b3f] shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-[#e89b3f] uppercase tracking-wider">Recompensa</p>
                      <p className="text-xs text-[#1e2d3a] font-semibold">{t.recompensa}</p>
                    </div>
                  </div>
                  <WalletButtonsPublic tarjetaId={t.id} />
                </div>
              </div>
            ))}
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
      )}

      {/* ── INLINE BOOKING: TWO-PANEL LAYOUT ── */}
      {modalNuevaCita && (
      <main className="flex-1 w-full">
        <form action={formAction} className="flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">
          <input type="hidden" name="pacienteId" value={paciente?.id || ""} />
          <input type="hidden" name="horaInicio" value={horaSeleccionada} />
          <input type="hidden" name="duracion" value={duracion} />
          <input type="hidden" name="fisioterapeutaId" value={fisioId} />
          <input type="hidden" name="fecha" value={fechaCita} />
          <input type="hidden" name="tipoSesion" value={tipoSesion} />
          <input type="hidden" name="comprobanteUrl" value={comprobanteUrl} />

          {/* ════════════════════════════════════════════════════════════════════
              LEFT PANEL — Categories + Services (60%)
              ════════════════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[60%] bg-white p-6 lg:p-10 overflow-y-auto">
            {/* Back button + Title */}
            <div className="flex items-center gap-4 mb-8">
              <button
                type="button"
                onClick={() => setModalNuevaCita(false)}
                className="h-10 w-10 rounded-full bg-[#f0f4f7] hover:bg-[#e4ecf2] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5 text-[#1e2d3a]" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#1e2d3a]">Agendar Cita</h1>
                <p className="text-sm text-[#5a7080] mt-0.5">Elige servicio, fecha y horario</p>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoriaId(cat.id);
                    setTipoSesion("");
                    setDuracion("45");
                    setFisioId("");
                    setFechaCita("");
                    setHoraSeleccionada("");
                    setSlots([]);
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    categoriaId === cat.id
                      ? "text-white shadow-lg"
                      : "bg-[#f0f4f7] text-[#5a7080] hover:bg-[#e4ecf2]"
                  }`}
                  style={categoriaId === cat.id ? { backgroundColor: cat.color, boxShadow: `0 4px 16px ${cat.color}40` } : undefined}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Service cards for selected category */}
            {categoriaActiva ? (
              <div className="space-y-3">
                {categoriaActiva.servicios.map((srv) => {
                  const isSelected = tipoSesion === srv.nombre;
                  return (
                    <button
                      key={srv.nombre}
                      type="button"
                      onClick={() => {
                        setTipoSesion(srv.nombre);
                        setDuracion(String(srv.duracion));
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all cursor-pointer border-2 ${
                        isSelected
                          ? "bg-[#4a7fa5]/8 border-[#4a7fa5]/30 shadow-md shadow-[#4a7fa5]/10"
                          : "bg-[#f8fafb] border-transparent hover:border-[#c8dce8] hover:shadow-sm"
                      }`}
                    >
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-[#4a7fa5]/15" : "bg-[#e4ecf2]"
                      }`}>
                        <Star className={`h-5 w-5 ${isSelected ? "text-[#4a7fa5]" : "text-[#8fa8ba]"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? "text-[#4a7fa5]" : "text-[#1e2d3a]"}`}>
                          {srv.nombre}
                        </p>
                        <p className="text-xs text-[#8fa8ba] mt-0.5">
                          <Clock className="inline h-3 w-3 mr-1 -mt-0.5" />{srv.duracion} min
                        </p>
                      </div>
                      <span className={`text-base font-bold shrink-0 ${isSelected ? "text-[#4a7fa5]" : "text-[#5a7080]"}`}>
                        ${srv.precio}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-[#4a7fa5]/8 flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-[#4a7fa5]/40" />
                </div>
                <p className="text-sm text-[#5a7080]">Selecciona una categoria para ver los servicios disponibles</p>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              RIGHT PANEL — Calendar, Slots, Therapist, Anticipo, CTA (40%)
              ════════════════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[40%] bg-[#f8fafb] border-l border-[#e4ecf2] p-6 lg:p-8 overflow-y-auto space-y-6">

            {/* ── Calendar ── */}
            {tipoSesion ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[#4a7fa5] flex items-center justify-center">
                    <CalendarDays className="h-3.5 w-3.5 text-white" />
                  </div>
                  <Label className="text-sm font-semibold text-[#1e2d3a]">Fecha</Label>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-[#e4ecf2] shadow-sm">
                  <MiniCalendario
                    selected={fechaCita}
                    onSelect={(f) => {
                      setFechaCita(f);
                      setHoraSeleccionada("");
                    }}
                    diasInactivos={scheduleConfig.diasInactivos}
                    diasBloqueados={scheduleConfig.diasBloqueados}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="h-10 w-10 text-[#1e2d3a]/10 mx-auto mb-3" />
                <p className="text-sm text-[#8fa8ba]">Elige un servicio para continuar</p>
              </div>
            )}

            {/* ── Time slots ── */}
            {fechaCita && tipoSesion && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[#4a7fa5] flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-white" />
                  </div>
                  <Label className="text-sm font-semibold text-[#1e2d3a]">Horario</Label>
                </div>

                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-8 justify-center bg-white rounded-2xl border border-[#e4ecf2]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#4a7fa5]" />
                    <span className="text-xs text-[#5a7080]">Cargando horarios...</span>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-4 border border-[#e4ecf2] shadow-sm space-y-4">
                    {/* Mañana */}
                    {slots.filter((s) => parseInt(s.hora) < 13).length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wider mb-2">Mañana</p>
                        <div className="grid grid-cols-4 gap-2">
                          {slots.filter((s) => parseInt(s.hora) < 13).map((s) => (
                            <button
                              key={s.hora}
                              type="button"
                              disabled={!s.disponible}
                              onClick={() => setHoraSeleccionada(s.hora)}
                              className={`py-2.5 px-1.5 text-xs font-medium rounded-xl transition-all ${
                                !s.disponible
                                  ? "bg-[#f0f2f4] text-[#c8cdd2] cursor-not-allowed"
                                  : horaSeleccionada === s.hora
                                  ? "bg-[#4a7fa5] text-white shadow-md shadow-[#4a7fa5]/25 scale-[1.03]"
                                  : "bg-[#f0f4f7] border border-[#dde5ec] text-[#1e2d3a] hover:border-[#4a7fa5] hover:bg-[#4a7fa5]/5 cursor-pointer"
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
                        <p className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wider mb-2">Tarde</p>
                        <div className="grid grid-cols-4 gap-2">
                          {slots.filter((s) => parseInt(s.hora) >= 13).map((s) => (
                            <button
                              key={s.hora}
                              type="button"
                              disabled={!s.disponible}
                              onClick={() => setHoraSeleccionada(s.hora)}
                              className={`py-2.5 px-1.5 text-xs font-medium rounded-xl transition-all ${
                                !s.disponible
                                  ? "bg-[#f0f2f4] text-[#c8cdd2] cursor-not-allowed"
                                  : horaSeleccionada === s.hora
                                  ? "bg-[#4a7fa5] text-white shadow-md shadow-[#4a7fa5]/25 scale-[1.03]"
                                  : "bg-[#f0f4f7] border border-[#dde5ec] text-[#1e2d3a] hover:border-[#4a7fa5] hover:bg-[#4a7fa5]/5 cursor-pointer"
                              }`}
                            >
                              {s.hora}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {slots.every((s) => !s.disponible) && (
                      <div className="text-center py-4">
                        <p className="text-xs text-[#8fa8ba]">No hay horarios disponibles este dia</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Therapist selector ── */}
            {horaSeleccionada && fisiosFiltrados.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-[#5a7080] font-medium">
                  Terapeuta {fisiosFiltrados.length === 1 ? "" : "(opcional)"}
                </Label>
                {fisiosFiltrados.length === 1 ? (
                  <div className="bg-white border border-[#e4ecf2] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-[#4a7fa5]/15 flex items-center justify-center">
                      <User className="h-4 w-4 text-[#4a7fa5]" />
                    </div>
                    <span className="text-sm font-medium text-[#1e2d3a]">{fisiosFiltrados[0].nombre}</span>
                  </div>
                ) : (
                  <Select value={fisioId} onValueChange={setFisioId}>
                    <SelectTrigger className="h-11 text-sm border-[#c8dce8] rounded-2xl cursor-pointer bg-white hover:bg-[#f0f4f7] transition-colors shadow-sm">
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

            {/* ── Anticipo section ── */}
            {horaSeleccionada && fechaCita && tipoSesion && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[#e89b3f] flex items-center justify-center">
                    <Receipt className="h-3.5 w-3.5 text-white" />
                  </div>
                  <Label className="text-sm font-semibold text-[#1e2d3a]">Anticipo</Label>
                </div>

                <div className="bg-white rounded-2xl border border-[#e89b3f]/20 p-5 space-y-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#e89b3f]/10 flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 text-[#e89b3f]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1e2d3a]">$200 MXN</p>
                      <p className="text-[10px] text-[#5a7080] mt-0.5 leading-relaxed">
                        Para confirmar tu cita, realiza una transferencia de <strong>$200 MXN</strong> y sube tu comprobante.
                        El resto se paga el dia de tu cita.
                      </p>
                    </div>
                  </div>

                  {/* Datos bancarios */}
                  <div className="bg-[#f8fafb] rounded-xl p-3.5 border border-[#e4ecf2] space-y-1.5">
                    <p className="text-[10px] font-bold text-[#8fa8ba] uppercase tracking-wider">Datos para transferencia</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className="text-[#8fa8ba]">Banco:</span>
                      <span className="font-medium text-[#1e2d3a]">BBVA</span>
                      <span className="text-[#8fa8ba]">CLABE:</span>
                      <span className="font-mono font-medium text-[#1e2d3a] text-[11px]">0121 8001 5367 0948 72</span>
                      <span className="text-[#8fa8ba]">Beneficiario:</span>
                      <span className="font-medium text-[#1e2d3a]">Kaya Kalp</span>
                    </div>
                  </div>

                  {/* Upload comprobante */}
                  {comprobantePreview ? (
                    <div className="relative">
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-emerald-700">Comprobante subido</p>
                          <p className="text-[10px] text-emerald-600/70 truncate">{comprobantePreview}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setComprobanteUrl("");
                            setComprobantePreview("");
                          }}
                          className="text-[#8fa8ba] hover:text-[#d9534f] cursor-pointer transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 border-2 border-dashed border-[#c8dce8] rounded-xl p-5 cursor-pointer hover:border-[#4a7fa5] hover:bg-[#4a7fa5]/3 transition-all">
                      {uploadingComprobante ? (
                        <Loader2 className="h-6 w-6 text-[#4a7fa5] animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6 text-[#8fa8ba]" />
                      )}
                      <div className="text-center">
                        <p className="text-xs font-semibold text-[#1e2d3a]">
                          {uploadingComprobante ? "Subiendo..." : "Subir comprobante de pago"}
                        </p>
                        <p className="text-[10px] text-[#8fa8ba] mt-0.5">
                          JPG, PNG, WebP o PDF -- Max. 5 MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        disabled={uploadingComprobante}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingComprobante(true);
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (res.ok && data.url) {
                              setComprobanteUrl(data.url);
                              setComprobantePreview(file.name);
                            } else {
                              alert(data.error || "Error al subir archivo");
                            }
                          } catch {
                            alert("Error de conexion al subir archivo");
                          } finally {
                            setUploadingComprobante(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {formState?.error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {formState.error}
                </p>
              </div>
            )}

            {/* Success */}
            {formState?.success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Cita agendada correctamente
                </p>
              </div>
            )}

            {/* ── Summary + CTA ── */}
            {horaSeleccionada && fechaCita && tipoSesion && (
              <div className="space-y-4">
                {/* Summary card */}
                <div className="bg-white border border-[#4a7fa5]/15 rounded-2xl p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-[#8fa8ba] uppercase tracking-wider mb-2.5">Resumen de tu cita</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#4a7fa5]/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-[#4a7fa5]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1e2d3a]">
                        {new Date(fechaCita + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })} · {horaSeleccionada}
                      </p>
                      <p className="text-xs text-[#5a7080] mt-0.5">
                        {tipoSesion} · {duracion} min
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-[#4a7fa5]">
                        ${categoriaActiva?.servicios.find((s) => s.nombre === tipoSesion)?.precio ?? ""}
                      </p>
                      <p className="text-[10px] text-[#8fa8ba]">Total</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  type="submit"
                  disabled={isPending || !horaSeleccionada || !fechaCita || !tipoSesion || !comprobanteUrl}
                  className="w-full h-13 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer transition-all duration-200 text-base rounded-2xl font-semibold shadow-lg shadow-[#3fa87c]/25"
                >
                  {isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Agendando...</>
                  ) : (
                    <><CalendarDays className="mr-2 h-5 w-5" /> Confirmar Cita</>
                  )}
                </Button>
              </div>
            )}

            {/* Cancel link at bottom of right panel */}
            {!(horaSeleccionada && fechaCita && tipoSesion) && tipoSesion && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setModalNuevaCita(false)}
                  className="text-sm text-[#5a7080] hover:text-[#1e2d3a] transition-colors cursor-pointer"
                >
                  Cancelar y volver al perfil
                </button>
              </div>
            )}
          </div>
        </form>
      </main>
      )}

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
