"use client";

import { useState } from "react";
import {
  Award,
  Search,
  Plus,
  Phone,
  Gift,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Smartphone,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

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
import { toast } from "sonner";
import { crearTarjeta, registrarSello, canjearRecompensa } from "./actions";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type TarjetaEstado = "activa" | "completada" | "canjeada" | "expirada";

interface TarjetaLealtad {
  id: string;
  pacienteNombre: string;
  pacienteIniciales: string;
  telefono: string;
  sellosTotal: number;
  sellosUsados: number;
  estado: TarjetaEstado;
  fechaCreacion: string;
  fechaExpiracion: string;
  ultimaVisita: string;
  recompensa: string;
  sellos: boolean[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<TarjetaEstado, { label: string; color: string; dot: string }> = {
  activa:     { label: "Activa",     color: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  completada: { label: "Completada", color: "text-[#4a7fa5] bg-[#e4ecf2] border-[#a8cfe0]",     dot: "bg-[#4a7fa5]" },
  canjeada:   { label: "Canjeada",   color: "text-[#9b59b6] bg-purple-50 border-purple-200",     dot: "bg-[#9b59b6]" },
  expirada:   { label: "Expirada",   color: "text-slate-500 bg-slate-50 border-slate-200",       dot: "bg-slate-400" },
};


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatFecha(fecha: string): string {
  if (!fecha || fecha === "Sin fecha") return "—";
  const d = new Date(fecha + "T12:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// SELLO VISUAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SelloGrid({ sellos }: { sellos: boolean[] }) {
  const cols = sellos.length <= 10 ? 5 : sellos.length <= 15 ? 5 : 6;
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {sellos.map((activo, i) => (
        <div
          key={i}
          className={`relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            activo
              ? "bg-[#4a7fa5]/10 border-2 border-[#4a7fa5]/30 shadow-sm"
              : "bg-slate-100 border-2 border-dashed border-slate-200"
          }`}
        >
          {activo ? (
            <Image
              src="/images/logo-kaya-kalp.png"
              alt="Sello"
              width={32}
              height={32}
              className="h-5 w-5 object-contain opacity-70"
            />
          ) : (
            <span className="text-[10px] font-bold text-slate-300">{i + 1}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA VISUAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function TarjetaCard({ tarjeta, onView }: { tarjeta: TarjetaLealtad; onView: () => void }) {
  const estadoCfg = ESTADO_CONFIG[tarjeta.estado];
  const pct = tarjeta.sellosTotal > 0 ? Math.round((tarjeta.sellosUsados / tarjeta.sellosTotal) * 100) : 0;
  const restantes = tarjeta.sellosTotal - tarjeta.sellosUsados;
  const casiCompleta = restantes <= 2 && restantes > 0;

  return (
    <Card
      className={`border-[#c8dce8] bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden ${
        casiCompleta ? "ring-2 ring-[#e89b3f]/40" : ""
      } ${tarjeta.estado === "completada" ? "ring-2 ring-[#3fa87c]/30" : ""}`}
      onClick={onView}
    >
      <div className={`h-1.5 ${
        tarjeta.estado === "completada" ? "bg-[#3fa87c]" :
        tarjeta.estado === "canjeada" ? "bg-[#9b59b6]" :
        casiCompleta ? "bg-[#e89b3f]" :
        "bg-[#4a7fa5]"
      }`} />

      <CardContent className="p-5">
        {/* Top row: patient + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-[#c8dce8] group-hover:border-[#4a7fa5] transition-colors">
              <AvatarFallback className="bg-[#4a7fa5]/10 text-[#4a7fa5] text-xs font-bold">
                {tarjeta.pacienteIniciales}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-[#1e2d3a]">{tarjeta.pacienteNombre}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3 w-3 text-[#8fa8ba]" />
                <span className="text-[11px] text-[#8fa8ba] font-mono">{tarjeta.telefono}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={`text-[10px] border shrink-0 ${estadoCfg.color}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${estadoCfg.dot} mr-1.5`} />
            {estadoCfg.label}
          </Badge>
        </div>

        {/* Recompensa */}
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-3.5 w-3.5 text-[#e89b3f] shrink-0" />
          <span className="text-[11px] text-[#5a7080] font-medium truncate">{tarjeta.recompensa}</span>
        </div>

        {/* Sellos */}
        <div className="mb-4">
          <SelloGrid sellos={tarjeta.sellos} />
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#1e2d3a]/60">
              {tarjeta.sellosUsados}/{tarjeta.sellosTotal} sellos
            </span>
            <span className="text-[11px] font-bold text-[#1e2d3a]">{pct}%</span>
          </div>
          <Progress
            value={pct}
            className={`h-2 ${
              tarjeta.estado === "completada" || tarjeta.estado === "canjeada"
                ? "bg-[#e4ecf2] [&>div]:bg-[#3fa87c]"
                : casiCompleta
                ? "bg-[#e89b3f]/15 [&>div]:bg-[#e89b3f]"
                : "bg-slate-100 [&>div]:bg-[#4a7fa5]"
            }`}
          />
        </div>

        {/* Reward preview */}
        {(tarjeta.estado === "completada" || casiCompleta) && (
          <div className={`mt-3 flex items-center gap-2 rounded-lg p-2.5 ${
            tarjeta.estado === "completada"
              ? "bg-[#3fa87c]/10 border border-[#3fa87c]/20"
              : "bg-[#e89b3f]/10 border border-[#e89b3f]/20"
          }`}>
            <Gift className={`h-4 w-4 shrink-0 ${
              tarjeta.estado === "completada" ? "text-[#3fa87c]" : "text-[#e89b3f]"
            }`} />
            <p className={`text-[10px] font-medium ${
              tarjeta.estado === "completada" ? "text-[#3fa87c]" : "text-[#e89b3f]"
            }`}>
              {tarjeta.estado === "completada"
                ? `Listo para canjear: ${tarjeta.recompensa}`
                : `Faltan ${restantes} para: ${tarjeta.recompensa}`}
            </p>
          </div>
        )}

        {/* Footer: last visit */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#c8dce8]/50">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-[#8fa8ba]" />
            <span className="text-[10px] text-[#8fa8ba]">Última visita: {formatFecha(tarjeta.ultimaVisita)}</span>
          </div>
          <span className="text-[10px] text-[#8fa8ba]">Expira: {formatFecha(tarjeta.fechaExpiracion)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WALLET BUTTONS
// ─────────────────────────────────────────────────────────────────────────────
function WalletButtons({ tarjetaId }: { tarjetaId: string }) {
  const [loadingApple, setLoadingApple] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleAppleWallet = async () => {
    setLoadingApple(true);
    try {
      const res = await fetch(`/api/wallet/apple/${tarjetaId}`);
      if (res.status === 503) {
        toast.info("Apple Wallet aún no está configurado. Se requieren certificados de Apple.");
        return;
      }
      if (!res.ok) {
        toast.error("Error al generar el pase de Apple Wallet");
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
      toast.success("Pase de Apple Wallet descargado");
    } catch {
      toast.error("Error al descargar el pase");
    } finally {
      setLoadingApple(false);
    }
  };

  const handleGoogleWallet = async () => {
    setLoadingGoogle(true);
    try {
      const res = await fetch(`/api/wallet/google/${tarjetaId}`);
      if (res.status === 503) {
        toast.info("Google Wallet aún no está configurado. Se requieren credenciales de Google.");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.saveUrl) {
        toast.error("Error al generar la URL de Google Wallet");
        return;
      }
      window.open(data.saveUrl, "_blank");
    } catch {
      toast.error("Error al abrir Google Wallet");
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wide">
        Agregar a Wallet del paciente
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAppleWallet}
          disabled={loadingApple}
          className="cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-lg border border-[#1e2d3a] bg-[#1e2d3a] px-3 py-2.5 text-white text-xs font-medium hover:bg-[#1e2d3a]/90 transition-colors disabled:opacity-50"
        >
          {loadingApple ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Smartphone className="h-4 w-4" />
          )}
          Apple Wallet
        </button>
        <button
          type="button"
          onClick={handleGoogleWallet}
          disabled={loadingGoogle}
          className="cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-lg border border-[#4285f4] bg-[#4285f4] px-3 py-2.5 text-white text-xs font-medium hover:bg-[#4285f4]/90 transition-colors disabled:opacity-50"
        >
          {loadingGoogle ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          Google Wallet
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
interface PacienteOption { id: string; nombre: string; telefono: string; }

export default function TarjetasClient({
  initialTarjetas,
  pacientes,
}: {
  initialTarjetas?: TarjetaLealtad[];
  pacientes?: PacienteOption[];
}) {
  const tarjetasData = initialTarjetas ?? [];
  const pacientesData = pacientes ?? [];

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [modalCrear, setModalCrear] = useState(false);
  const [modalDetalle, setModalDetalle] = useState<TarjetaLealtad | null>(null);

  // Create form state
  const [crearPacienteId, setCrearPacienteId] = useState("");
  const [crearSellosTotal, setCrearSellosTotal] = useState("10");
  const [crearRecompensa, setCrearRecompensa] = useState("");
  const [crearFechaExp, setCrearFechaExp] = useState("");
  const [creando, setCreando] = useState(false);

  // Filtrado
  const tarjetasFiltradas = tarjetasData.filter((t) => {
    const matchBusqueda =
      t.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.telefono.includes(busqueda);
    const matchEstado = filtroEstado === "todos" || t.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  // KPIs
  const activas = tarjetasData.filter((t) => t.estado === "activa").length;
  const completadas = tarjetasData.filter((t) => t.estado === "completada").length;
  const canjeadas = tarjetasData.filter((t) => t.estado === "canjeada").length;
  const casiCompletas = tarjetasData.filter((t) => {
    const rest = t.sellosTotal - t.sellosUsados;
    return t.estado === "activa" && rest <= 2 && rest > 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tarjetas Activas", valor: activas.toString(), icon: Award, color: "text-emerald-600", bg: "bg-emerald-50", sub: "En progreso" },
          { label: "Listas para Canjear", valor: completadas.toString(), icon: Gift, color: "text-[#4a7fa5]", bg: "bg-[#e4ecf2]", sub: "Recompensa pendiente" },
          { label: "Canjeadas", valor: canjeadas.toString(), icon: CheckCircle2, color: "text-[#9b59b6]", bg: "bg-purple-50", sub: "Este trimestre" },
          { label: "Casi Completas", valor: casiCompletas.toString(), icon: Sparkles, color: "text-[#e89b3f]", bg: "bg-amber-50", sub: "Faltan ≤2 sellos", trend: true },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-[#c8dce8] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1e2d3a]/50 uppercase tracking-wide">{kpi.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-[#1e2d3a]">{kpi.valor}</p>
                    {kpi.trend && (
                      <span className="text-[10px] font-bold flex items-center gap-0.5 text-[#e89b3f]">
                        <ArrowUpRight className="h-3 w-3" />
                        Prioridad
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#1e2d3a]/40 mt-0.5">{kpi.sub}</p>
                </div>
                <div className={`${kpi.bg} h-10 w-10 rounded-xl flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e2d3a]/40" />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 border-[#a8cfe0] focus:border-[#4a7fa5] h-10"
            />
          </div>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-full sm:w-40 border-[#a8cfe0] h-10 cursor-pointer">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setModalCrear(true)}
          className="cursor-pointer bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white text-sm shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Nueva Tarjeta
        </Button>
      </div>

      {/* ── GRID DE TARJETAS ── */}
      {tarjetasFiltradas.length === 0 ? (
        <Card className="border-[#c8dce8] shadow-sm">
          <CardContent className="py-16 text-center">
            <Award className="h-12 w-12 text-[#1e2d3a]/15 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#1e2d3a]/40">No se encontraron tarjetas de lealtad</p>
            <p className="text-xs text-[#1e2d3a]/30 mt-1">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tarjetasFiltradas.map((tarjeta) => (
            <TarjetaCard
              key={tarjeta.id}
              tarjeta={tarjeta}
              onView={() => setModalDetalle(tarjeta)}
            />
          ))}
        </div>
      )}

      {/* ── MODAL: DETALLE TARJETA ── */}
      <Dialog open={!!modalDetalle} onOpenChange={() => setModalDetalle(null)}>
        <DialogContent className="max-w-lg">
          {modalDetalle && (() => {
            const estadoCfg = ESTADO_CONFIG[modalDetalle.estado];
            const pct = modalDetalle.sellosTotal > 0 ? Math.round((modalDetalle.sellosUsados / modalDetalle.sellosTotal) * 100) : 0;
            const restantes = modalDetalle.sellosTotal - modalDetalle.sellosUsados;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-[#1e2d3a] flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#4a7fa5]" />
                    Tarjeta de Lealtad
                  </DialogTitle>
                </DialogHeader>

                {/* Patient info */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#f0f4f7] to-white rounded-xl p-4">
                  <Avatar className="h-12 w-12 border-2 border-[#a8cfe0]">
                    <AvatarFallback className="bg-[#4a7fa5]/10 text-[#4a7fa5] font-bold">
                      {modalDetalle.pacienteIniciales}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1e2d3a]">{modalDetalle.pacienteNombre}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-[#8fa8ba]" />
                      <span className="text-xs text-[#8fa8ba] font-mono">{modalDetalle.telefono}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] border ${estadoCfg.color}`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${estadoCfg.dot} mr-1.5`} />
                    {estadoCfg.label}
                  </Badge>
                </div>

                {/* Sellos */}
                <div className="bg-white border border-[#c8dce8] rounded-xl p-4 space-y-3">
                  <div className="flex justify-center py-2">
                    <SelloGrid sellos={modalDetalle.sellos} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#5a7080]">
                        {modalDetalle.sellosUsados} de {modalDetalle.sellosTotal} sellos
                      </span>
                      <span className="text-xs font-bold text-[#1e2d3a]">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2.5 bg-slate-100 [&>div]:bg-[#3fa87c]" />
                  </div>
                </div>

                {/* Reward */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#e89b3f]/10 to-[#e89b3f]/5 border border-[#e89b3f]/20 rounded-xl p-4">
                  <div className="h-10 w-10 rounded-full bg-[#e89b3f]/20 flex items-center justify-center shrink-0">
                    <Gift className="h-5 w-5 text-[#e89b3f]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#e89b3f] uppercase tracking-wide">Recompensa</p>
                    <p className="text-sm font-medium text-[#1e2d3a] mt-0.5">{modalDetalle.recompensa}</p>
                    {restantes > 0 && (
                      <p className="text-[10px] text-[#8fa8ba] mt-0.5">Faltan {restantes} sellos para canjear</p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Fecha de creación", value: formatFecha(modalDetalle.fechaCreacion) },
                    { label: "Fecha de expiración", value: formatFecha(modalDetalle.fechaExpiracion) },
                    { label: "Última visita", value: formatFecha(modalDetalle.ultimaVisita) },
                    { label: "Sellos restantes", value: restantes.toString() },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#f0f4f7] rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-medium text-[#1e2d3a] mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Wallet buttons */}
                <WalletButtons tarjetaId={modalDetalle.id} />

                <DialogFooter className="gap-2 mt-2">
                  <Button variant="outline" onClick={() => setModalDetalle(null)} className="cursor-pointer">
                    Cerrar
                  </Button>
                  {modalDetalle.estado === "activa" && (
                    <Button
                      className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white"
                      onClick={async () => {
                        const result = await registrarSello(modalDetalle.id);
                        if (result.success) {
                          toast.success("Sello registrado");
                          setModalDetalle(null);
                        } else {
                          toast.error(result.error ?? "Error al registrar sello");
                        }
                      }}
                    >
                      <Star className="h-4 w-4 mr-1.5" /> Registrar Sello
                    </Button>
                  )}
                  {modalDetalle.estado === "completada" && (
                    <Button
                      className="cursor-pointer bg-[#e89b3f] hover:bg-[#e89b3f]/90 text-white"
                      onClick={async () => {
                        const result = await canjearRecompensa(modalDetalle.id);
                        if (result.success) {
                          toast.success("Recompensa canjeada");
                          setModalDetalle(null);
                        } else {
                          toast.error(result.error ?? "Error al canjear");
                        }
                      }}
                    >
                      <Gift className="h-4 w-4 mr-1.5" /> Canjear Recompensa
                    </Button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CREAR TARJETA ── */}
      <Dialog open={modalCrear} onOpenChange={(open) => {
        setModalCrear(open);
        if (!open) {
          setCrearPacienteId("");
          setCrearSellosTotal("10");
          setCrearRecompensa("");
          setCrearFechaExp("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a] flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#4a7fa5]" />
              Nueva Tarjeta de Lealtad
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Paciente</Label>
              <Select value={crearPacienteId} onValueChange={setCrearPacienteId}>
                <SelectTrigger className="border-[#a8cfe0] cursor-pointer">
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientesData.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {crearPacienteId && (() => {
              const pac = pacientesData.find((p) => p.id === crearPacienteId);
              return pac ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#1e2d3a]/60">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e2d3a]/30" />
                    <Input value={pac.telefono} readOnly className="pl-9 border-[#a8cfe0] font-mono bg-[#f0f4f7]" />
                  </div>
                </div>
              ) : null;
            })()}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Sellos para recompensa</Label>
              <Select value={crearSellosTotal} onValueChange={setCrearSellosTotal}>
                <SelectTrigger className="border-[#a8cfe0] cursor-pointer">
                  <SelectValue placeholder="Número de sellos" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 8, 10, 12, 15, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} sellos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Recompensa</Label>
              <Input
                value={crearRecompensa}
                onChange={(e) => setCrearRecompensa(e.target.value)}
                placeholder="Ej: 1 sesión de masaje relajante GRATIS"
                className="border-[#a8cfe0]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Fecha de expiración</Label>
              <Input
                type="date"
                value={crearFechaExp}
                onChange={(e) => setCrearFechaExp(e.target.value)}
                className="border-[#a8cfe0] cursor-pointer"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalCrear(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button
              disabled={creando || !crearPacienteId}
              onClick={async () => {
                setCreando(true);
                const result = await crearTarjeta({
                  pacienteId: crearPacienteId,
                  sellosTotal: Number(crearSellosTotal),
                  recompensa: crearRecompensa || "1 sesión GRATIS",
                  fechaExpiracion: crearFechaExp || undefined,
                });
                setCreando(false);
                if (result.success) {
                  toast.success("Tarjeta de lealtad creada");
                  setModalCrear(false);
                } else {
                  toast.error(result.error ?? "Error al crear tarjeta");
                }
              }}
              className="cursor-pointer bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white disabled:opacity-50"
            >
              <Award className="h-4 w-4 mr-1.5" /> Crear Tarjeta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
