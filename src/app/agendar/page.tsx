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
type Fisio = { id: string; nombre: string };

const TIPOS_SESION = [
  "Fisioterapia",
  "Masaje Terapéutico",
  "Masaje Relajante",
  "Masaje Descontracturante",
  "Drenaje Linfático",
  "Tratamiento Facial",
  "Tratamiento Corporal",
  "Suelo Pélvico",
  "Rehabilitación",
  "Epilación",
];

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  agendada:    { label: "Agendada",   color: "text-[#4a7fa5]", bg: "bg-[#4a7fa5]/10" },
  confirmada:  { label: "Confirmada", color: "text-[#3fa87c]", bg: "bg-[#3fa87c]/10" },
  en_curso:    { label: "En curso",   color: "text-[#4a7fa5]", bg: "bg-[#4a7fa5]/15" },
  completada:  { label: "Completada", color: "text-[#1e2d3a]/50", bg: "bg-[#1e2d3a]/5" },
  cancelada:   { label: "Cancelada",  color: "text-[#d9534f]", bg: "bg-[#d9534f]/10" },
  no_show:     { label: "No asistió", color: "text-[#d9534f]", bg: "bg-[#d9534f]/10" },
};

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

  // ── Cuando se agenda exitosamente ──
  useEffect(() => {
    if (formState?.success && paciente) {
      setModalNuevaCita(false);
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

  // ── Generar fechas disponibles (próximos 14 días, sin domingo) ──
  function getFechasDisponibles() {
    const fechas: { value: string; label: string }[] = [];
    const hoy = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      if (d.getDay() === 0) continue; // Sin domingos
      fechas.push({
        value: d.toISOString().split("T")[0],
        label: d.toLocaleDateString("es-MX", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      });
    }
    return fechas;
  }

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
        <DialogContent className="max-w-md border-[#c8dce8]">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a] font-bold">Agendar Cita</DialogTitle>
            <DialogDescription className="text-[#5a7080] text-xs">
              Elige fecha, horario y tipo de sesión
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="space-y-4 pt-1">
            <input type="hidden" name="pacienteId" value={paciente?.id || ""} />
            <input type="hidden" name="horaInicio" value={horaSeleccionada} />
            <input type="hidden" name="duracion" value={duracion} />
            <input type="hidden" name="fisioterapeutaId" value={fisioId} />

            {/* Fecha */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70">Fecha</Label>
              <Select value={fechaCita} onValueChange={setFechaCita} name="fecha">
                <SelectTrigger className="h-10 text-sm border-[#a8cfe0] cursor-pointer">
                  <SelectValue placeholder="Elige un día..." />
                </SelectTrigger>
                <SelectContent>
                  {getFechasDisponibles().map((f) => (
                    <SelectItem key={f.value} value={f.value} className="cursor-pointer">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="fecha" value={fechaCita} />
            </div>

            {/* Horarios disponibles */}
            {fechaCita && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]/70">Horario disponible</Label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-[#4a7fa5]" />
                    <span className="text-xs text-[#5a7080]">Cargando horarios...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {slots.map((s) => (
                      <button
                        key={s.hora}
                        type="button"
                        disabled={!s.disponible}
                        onClick={() => setHoraSeleccionada(s.hora)}
                        className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          !s.disponible
                            ? "bg-[#e4ecf2]/50 text-[#1e2d3a]/20 cursor-not-allowed line-through"
                            : horaSeleccionada === s.hora
                            ? "bg-[#4a7fa5] text-white shadow-sm"
                            : "bg-white border border-[#c8dce8] text-[#1e2d3a] hover:border-[#4a7fa5] hover:text-[#4a7fa5]"
                        }`}
                      >
                        {s.hora}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tipo de sesión */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70">Tipo de sesión</Label>
              <Select value={tipoSesion} onValueChange={setTipoSesion}>
                <SelectTrigger className="h-10 text-sm border-[#a8cfe0] cursor-pointer">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SESION.map((t) => (
                    <SelectItem key={t} value={t} className="cursor-pointer">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="tipoSesion" value={tipoSesion} />
            </div>

            {/* Duración */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/70">Duración</Label>
              <Select value={duracion} onValueChange={setDuracion}>
                <SelectTrigger className="h-10 text-sm border-[#a8cfe0] cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30" className="cursor-pointer">30 min</SelectItem>
                  <SelectItem value="45" className="cursor-pointer">45 min</SelectItem>
                  <SelectItem value="60" className="cursor-pointer">60 min</SelectItem>
                  <SelectItem value="90" className="cursor-pointer">90 min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fisioterapeuta */}
            {fisios.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]/70">Fisioterapeuta (opcional)</Label>
                <Select value={fisioId} onValueChange={setFisioId}>
                  <SelectTrigger className="h-10 text-sm border-[#a8cfe0] cursor-pointer">
                    <SelectValue placeholder="Sin preferencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {fisios.map((f) => (
                      <SelectItem key={f.id} value={f.id} className="cursor-pointer">{f.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Error */}
            {formState?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600 font-medium">{formState.error}</p>
              </div>
            )}

            {/* Success */}
            {formState?.success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Cita agendada correctamente
                </p>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalNuevaCita(false)}
                className="border-[#a8cfe0] cursor-pointer text-sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !horaSeleccionada || !fechaCita}
                className="bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white cursor-pointer transition-all duration-200 text-sm"
              >
                {isPending ? (
                  <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Agendando...</>
                ) : (
                  <><CalendarDays className="mr-1.5 h-4 w-4" /> Confirmar Cita</>
                )}
              </Button>
            </DialogFooter>
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
