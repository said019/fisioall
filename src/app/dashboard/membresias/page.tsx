"use client";

import { useState } from "react";
import {
  CreditCard,
  Package,
  WalletCards,
  Plus,
  Search,
  Download,
  AlertCircle,
  MoreVertical,
  CalendarClock,
  TrendingUp,
  Activity,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const mockMembresias = [
  {
    id: "1",
    paciente: "María González",
    iniciales: "MG",
    paquete: "Rehabilitación Post-Operatoria",
    sesionesTotales: 10,
    sesionesUsadas: 8,
    estado: "activa",
    fechaVencimiento: new Date(2026, 3, 15),
    walletPass: true,
    diasRestantes: 50,
  },
  {
    id: "2",
    paciente: "Carlos Rodríguez",
    iniciales: "CR",
    paquete: "Mantenimiento Mensual",
    sesionesTotales: 4,
    sesionesUsadas: 4,
    estado: "vencida",
    fechaVencimiento: new Date(2026, 1, 10),
    walletPass: false,
    diasRestantes: 0,
  },
  {
    id: "3",
    paciente: "Ana Silva",
    iniciales: "AS",
    paquete: "Deportivo Intensivo",
    sesionesTotales: 5,
    sesionesUsadas: 1,
    estado: "activa",
    fechaVencimiento: new Date(2026, 5, 20),
    walletPass: true,
    diasRestantes: 116,
  },
  {
    id: "4",
    paciente: "Patricia Morales",
    iniciales: "PM",
    paquete: "Rehabilitación Básica",
    sesionesTotales: 8,
    sesionesUsadas: 7,
    estado: "activa",
    fechaVencimiento: new Date(2026, 2, 5),
    walletPass: false,
    diasRestantes: 9,
  },
  {
    id: "5",
    paciente: "Luis Ángel Ramos",
    iniciales: "LR",
    paquete: "Mantenimiento Mensual",
    sesionesTotales: 4,
    sesionesUsadas: 4,
    estado: "pendiente_activacion",
    fechaVencimiento: new Date(2026, 3, 30),
    walletPass: false,
    diasRestantes: 65,
  },
];

const mockPagos = [
  { id: "P-1001", fecha: new Date(2026, 1, 23, 10, 30), paciente: "María González", concepto: "Paquete Rehab (10 sesiones)", monto: 4500, metodo: "Tarjeta", estado: "pagado" },
  { id: "P-1002", fecha: new Date(2026, 1, 23, 14, 15), paciente: "Ana Silva", concepto: "Consulta Suelta", monto: 600, metodo: "Efectivo", estado: "pagado" },
  { id: "P-1003", fecha: new Date(2026, 1, 22, 16, 45), paciente: "Luis Torres", concepto: "Paquete Mantenimiento", monto: 2000, metodo: "Transferencia", estado: "pendiente" },
  { id: "P-1004", fecha: new Date(2026, 1, 21, 9, 0), paciente: "Patricia Morales", concepto: "Renovación membresía", monto: 3600, metodo: "Tarjeta", estado: "pagado" },
];

const mockPaquetes = [
  { id: "1", nombre: "Rehabilitación Básica", sesiones: 5, precio: 2500, vigencia: "3 meses", vigenciaDias: 90, activo: true, color: "bg-cyan-500" },
  { id: "2", nombre: "Rehabilitación Intensiva", sesiones: 10, precio: 4500, vigencia: "6 meses", vigenciaDias: 180, activo: true, color: "bg-violet-500" },
  { id: "3", nombre: "Mantenimiento Mensual", sesiones: 4, precio: 1800, vigencia: "1 mes", vigenciaDias: 30, activo: true, color: "bg-emerald-500" },
  { id: "4", nombre: "Promo Verano", sesiones: 8, precio: 3200, vigencia: "2 meses", vigenciaDias: 60, activo: false, color: "bg-orange-500" },
];

const mockPacientesSelect = [
  "María González",
  "Carlos Rodríguez",
  "Ana Silva",
  "Patricia Morales",
  "Luis Ángel Ramos",
  "Roberto Sánchez",
  "Daniela Martínez",
  "José Hernández",
];

const COLORES_PAQUETE = [
  { value: "bg-cyan-500", clase: "bg-cyan-500" },
  { value: "bg-violet-500", clase: "bg-violet-500" },
  { value: "bg-emerald-500", clase: "bg-emerald-500" },
  { value: "bg-orange-500", clase: "bg-orange-500" },
  { value: "bg-pink-500", clase: "bg-pink-500" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MODAL ASIGNAR PAQUETE
// ─────────────────────────────────────────────────────────────────────────────
function ModalAsignarPaquete({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activarManual, setActivarManual] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-cyan-100">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-[#164E63]">Asignar Paquete</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          {/* Paciente */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#164E63]">Paciente</Label>
            <Select>
              <SelectTrigger className="border-cyan-200 text-sm">
                <SelectValue placeholder="Seleccionar paciente..." />
              </SelectTrigger>
              <SelectContent>
                {mockPacientesSelect.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Paquete */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#164E63]">Paquete</Label>
            <Select>
              <SelectTrigger className="border-cyan-200 text-sm">
                <SelectValue placeholder="Seleccionar paquete..." />
              </SelectTrigger>
              <SelectContent>
                {mockPaquetes.filter((p) => p.activo).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre} · {p.sesiones} ses · ${p.precio.toLocaleString("es-MX")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Método de pago */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#164E63]">Método de pago</Label>
            <Select>
              <SelectTrigger className="border-cyan-200 text-sm">
                <SelectValue placeholder="Seleccionar método..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta_debito">Tarjeta débito</SelectItem>
                <SelectItem value="tarjeta_credito">Tarjeta crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Activar manualmente */}
          <div
            onClick={() => setActivarManual(!activarManual)}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
              activarManual ? "bg-amber-50 border-amber-200" : "bg-[#ECFEFF] border-cyan-100"
            }`}
          >
            <div className={`h-4 w-4 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
              activarManual ? "bg-amber-500 border-amber-500" : "border-cyan-300"
            }`}>
              {activarManual && <div className="h-2 w-2 bg-white rounded-sm" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#164E63]">Activar manualmente</p>
              <p className="text-[10px] text-[#164E63]/50 mt-0.5">Pago previo en efectivo o transferencia confirmada</p>
            </div>
          </div>
          {/* Notas */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#164E63]">Notas (opcional)</Label>
            <Input
              placeholder="Observaciones sobre el paquete o el pago..."
              className="border-cyan-200 text-sm"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 text-sm">
            Cancelar
          </Button>
          <Button onClick={onClose} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white text-sm">
            Asignar y Activar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL COBRO RÁPIDO
// ─────────────────────────────────────────────────────────────────────────────
function ModalCobroRapido({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-cyan-100">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-[#164E63]">Cobro Rápido</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          {/* Paciente */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#164E63]">Paciente</Label>
            <Input placeholder="Nombre del paciente..." className="border-cyan-200 text-sm" />
          </div>
          {/* Monto */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#164E63]">Monto (MXN)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#164E63]/50">$</span>
              <Input
                type="number"
                placeholder="0.00"
                className="pl-6 border-cyan-200 text-sm"
              />
            </div>
          </div>
          {/* Método */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#164E63]">Método de pago</Label>
            <Select>
              <SelectTrigger className="border-cyan-200 text-sm">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta_debito">Tarjeta débito</SelectItem>
                <SelectItem value="tarjeta_credito">Tarjeta crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Concepto */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#164E63]">Concepto</Label>
            <Input placeholder="Ej: Consulta suelta, pago pendiente..." className="border-cyan-200 text-sm" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 text-sm">
            Cancelar
          </Button>
          <Button onClick={onClose} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white text-sm">
            Registrar Cobro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL NUEVO PAQUETE
// ─────────────────────────────────────────────────────────────────────────────
function ModalNuevoPaquete({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [colorSeleccionado, setColorSeleccionado] = useState("bg-cyan-500");
  const [activo, setActivo] = useState(true);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-cyan-100">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-[#164E63]">Nuevo Paquete</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#164E63]">Nombre del paquete</Label>
            <Input placeholder="Ej: Rehabilitación Intensiva" className="border-cyan-200 text-sm" />
          </div>
          {/* Grid 3 cols: sesiones + precio + vigencia */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#164E63]">Sesiones</Label>
              <Input type="number" placeholder="10" className="border-cyan-200 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#164E63]">Precio MXN</Label>
              <Input type="number" placeholder="4500" className="border-cyan-200 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#164E63]">Vigencia días</Label>
              <Input type="number" placeholder="180" className="border-cyan-200 text-sm" />
            </div>
          </div>
          {/* Color picker */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#164E63]">Color del paquete</Label>
            <div className="flex items-center gap-2">
              {COLORES_PAQUETE.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColorSeleccionado(c.value)}
                  className={`h-8 w-8 rounded-full ${c.clase} cursor-pointer transition-all duration-200 ${
                    colorSeleccionado === c.value
                      ? "ring-2 ring-offset-2 ring-[#164E63]/40 scale-110"
                      : "hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
          {/* Switch activo */}
          <div
            onClick={() => setActivo(!activo)}
            className="flex items-center justify-between p-3 rounded-xl bg-[#ECFEFF] border border-cyan-100 cursor-pointer"
          >
            <div>
              <p className="text-xs font-semibold text-[#164E63]">Paquete activo</p>
              <p className="text-[10px] text-[#164E63]/50">Visible para asignación a pacientes</p>
            </div>
            <div className={`h-5 w-9 rounded-full transition-all duration-200 flex items-center px-0.5 ${activo ? "bg-[#059669]" : "bg-gray-300"}`}>
              <div className={`h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${activo ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 text-sm">
            Cancelar
          </Button>
          <Button onClick={onClose} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white text-sm">
            Crear Paquete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function MembresiasPagosPage() {
  const [activeTab, setActiveTab] = useState("membresias");
  const [filtroMembresia, setFiltroMembresia] = useState("todas");
  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalCobro, setModalCobro] = useState(false);
  const [modalPaquete, setModalPaquete] = useState(false);

  // Filtrado de membresías
  const membresiasFiltradas = mockMembresias.filter((m) => {
    if (filtroMembresia === "todas") return true;
    if (filtroMembresia === "activas") return m.estado === "activa";
    if (filtroMembresia === "por_vencer") {
      const restantes = m.sesionesTotales - m.sesionesUsadas;
      return m.estado === "activa" && restantes <= 2;
    }
    if (filtroMembresia === "vencidas") return m.estado === "vencida";
    return true;
  });

  // Total pagados
  const totalPagado = mockPagos.filter((p) => p.estado === "pagado").reduce((a, p) => a + p.monto, 0);

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#ECFEFF] min-h-full">
      {/* Modales */}
      <ModalAsignarPaquete open={modalAsignar} onClose={() => setModalAsignar(false)} />
      <ModalCobroRapido open={modalCobro} onClose={() => setModalCobro(false)} />
      <ModalNuevoPaquete open={modalPaquete} onClose={() => setModalPaquete(false)} />

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#164E63]">Membresías y Pagos</h1>
          <p className="text-xs text-[#164E63]/50 mt-0.5">
            Gestiona paquetes, cobros e historial financiero
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "membresias" && (
            <Button onClick={() => setModalAsignar(true)} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 gap-1.5">
              <Plus className="h-4 w-4" />
              Asignar Paquete
            </Button>
          )}
          {activeTab === "pagos" && (
            <Button onClick={() => setModalCobro(true)} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 gap-1.5">
              <CreditCard className="h-4 w-4" />
              Cobro Rápido
            </Button>
          )}
          {activeTab === "paquetes" && (
            <Button onClick={() => setModalPaquete(true)} className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 gap-1.5">
              <Package className="h-4 w-4" />
              Nuevo Paquete
            </Button>
          )}
        </div>
      </div>

      {/* ── MINI KPI CARDS ── */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-cyan-100 bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#164E63]">$8,100</p>
              <p className="text-[10px] text-[#164E63]/50">Ingresos del Mes</p>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5" /> +12% vs anterior
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-cyan-100 bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
              <WalletCards className="h-4.5 w-4.5 text-[#0891B2]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#164E63]">12</p>
              <p className="text-[10px] text-[#164E63]/50">Membresías Activas</p>
              <p className="text-[10px] text-cyan-600 font-medium">3 por vencer pronto</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-cyan-100 bg-white hover:shadow-md transition-all duration-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
              <Activity className="h-4.5 w-4.5 text-[#0891B2]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#164E63]">34</p>
              <p className="text-[10px] text-[#164E63]/50">Sesiones Esta Semana</p>
              <p className="text-[10px] text-cyan-600 font-medium">+5 vs semana pasada</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── TABS ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-[#ECFEFF] border border-cyan-100">
          <TabsTrigger value="membresias" className="flex gap-2 data-[state=active]:bg-white data-[state=active]:text-[#164E63]">
            <WalletCards className="h-4 w-4" />
            <span className="hidden sm:inline">Membresías</span>
          </TabsTrigger>
          <TabsTrigger value="pagos" className="flex gap-2 data-[state=active]:bg-white data-[state=active]:text-[#164E63]">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Pagos</span>
          </TabsTrigger>
          <TabsTrigger value="paquetes" className="flex gap-2 data-[state=active]:bg-white data-[state=active]:text-[#164E63]">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Catálogo</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB MEMBRESÍAS ── */}
        <TabsContent value="membresias" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#164E63]/40" />
              <input
                type="search"
                placeholder="Buscar por paciente..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-cyan-200 rounded-lg bg-white text-[#164E63] placeholder:text-[#164E63]/40 focus:outline-none focus:border-[#0891B2] transition-colors"
              />
            </div>
            <Select value={filtroMembresia} onValueChange={setFiltroMembresia}>
              <SelectTrigger className="w-full sm:w-56 border-cyan-200 text-sm bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="activas">Activas</SelectItem>
                <SelectItem value="por_vencer">Por vencer (≤2 sesiones)</SelectItem>
                <SelectItem value="vencidas">Vencidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {membresiasFiltradas.map((mem) => {
              const sesionesRestantes = mem.sesionesTotales - mem.sesionesUsadas;
              const porcentaje = (mem.sesionesUsadas / mem.sesionesTotales) * 100;
              const isLowSessions = sesionesRestantes <= 2 && mem.estado === "activa";
              const isPendiente = mem.estado === "pendiente_activacion";

              return (
                <Card
                  key={mem.id}
                  className={`flex flex-col border hover:shadow-md transition-all duration-200 ${
                    isPendiente
                      ? "border-amber-200 bg-amber-50/20"
                      : isLowSessions
                      ? "border-orange-200 bg-orange-50/30"
                      : "border-cyan-100 bg-white"
                  }`}
                >
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#0891B2]/10 text-[#0891B2] text-[10px] font-bold">
                          {mem.iniciales}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm font-bold text-[#164E63]">{mem.paciente}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{mem.paquete}</CardDescription>
                      </div>
                    </div>
                    {isPendiente ? (
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 shrink-0">Pendiente</Badge>
                    ) : mem.estado === "activa" ? (
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">Activa</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-500 border-slate-200 shrink-0">Vencida</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 pb-3 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#164E63]/50">Progreso</span>
                      <span className={`font-semibold ${isLowSessions ? "text-orange-600" : "text-[#164E63]"}`}>
                        {mem.sesionesUsadas} / {mem.sesionesTotales}
                      </span>
                    </div>
                    <Progress
                      value={porcentaje}
                      className={`h-1.5 ${
                        isLowSessions
                          ? "[&>div]:bg-orange-400 bg-orange-100"
                          : isPendiente
                          ? "[&>div]:bg-amber-400 bg-amber-100"
                          : "[&>div]:bg-[#0891B2]"
                      }`}
                    />
                    {isLowSessions && (
                      <div className="flex items-center gap-1 text-[11px] text-orange-600 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        ¡Quedan {sesionesRestantes} {sesionesRestantes === 1 ? "sesión" : "sesiones"}!
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-[#164E63]/50">
                      <div className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        Vence: {format(mem.fechaVencimiento, "d MMM yyyy", { locale: es })}
                      </div>
                      {mem.diasRestantes > 0 && (
                        <span className={`font-semibold ${mem.diasRestantes <= 10 ? "text-orange-500" : "text-[#164E63]/60"}`}>
                          {mem.diasRestantes}d restantes
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t border-current/5 flex justify-between gap-2">
                    {isPendiente ? (
                      <Button
                        size="sm"
                        className="h-7 text-xs cursor-pointer bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200"
                      >
                        Activar Membresía
                      </Button>
                    ) : mem.walletPass ? (
                      <Button variant="ghost" size="sm" className="h-7 text-xs cursor-pointer text-[#0891B2] hover:text-[#0891B2]/80 hover:bg-cyan-50">
                        Ver Apple Wallet
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 text-xs cursor-pointer hover:bg-cyan-50">
                        Generar Pass
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer hover:bg-[#ECFEFF]">
                      <MoreVertical className="h-3.5 w-3.5 text-[#164E63]/40" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TAB PAGOS ── */}
        <TabsContent value="pagos" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-[#164E63]">Historial de Transacciones</CardTitle>
                <CardDescription className="text-xs mt-0.5">Cobros recientes y estado de cuenta mensual.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 transition-all duration-200 text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Reporte
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-100 bg-[#ECFEFF]/50">
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Fecha</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Paciente</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase hidden sm:table-cell">Concepto</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase hidden sm:table-cell">Método</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase text-right">Monto</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPagos.map((pago) => (
                    <TableRow key={pago.id} className="border-cyan-100 hover:bg-[#ECFEFF]/30 transition-colors">
                      <TableCell className="py-3">
                        <p className="text-xs font-medium text-[#164E63]">{format(pago.fecha, "dd/MM/yyyy")}</p>
                        <p className="text-[10px] text-[#164E63]/40">{format(pago.fecha, "HH:mm")}</p>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[9px] bg-[#0891B2]/10 text-[#0891B2]">
                              {pago.paciente.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-[#164E63]">{pago.paciente}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 hidden sm:table-cell">
                        <p className="text-xs text-[#164E63]/60">{pago.concepto}</p>
                      </TableCell>
                      <TableCell className="py-3 hidden sm:table-cell">
                        <p className="text-xs text-[#164E63]/60">{pago.metodo}</p>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <p className="text-sm font-bold text-[#164E63]">
                          ${pago.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            pago.estado === "pagado"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {pago.estado === "pagado" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Fila de totales */}
              <div className="border-t border-cyan-100 px-4 py-3 flex items-center justify-between bg-[#ECFEFF]/50">
                <p className="text-xs font-semibold text-[#164E63]/60">Ingresos del período:</p>
                <p className="text-base font-bold text-emerald-600">
                  ${totalPagado.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB PAQUETES ── */}
        <TabsContent value="paquetes" className="space-y-4">
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#164E63]">Catálogo de Paquetes</CardTitle>
              <CardDescription className="text-xs mt-0.5">Configura los planes de membresía disponibles para venta.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-100 bg-[#ECFEFF]/50">
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Paquete</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase">Sesiones</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase hidden sm:table-cell">Vigencia</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase text-right">Precio</TableHead>
                    <TableHead className="text-[10px] font-bold text-[#164E63]/50 uppercase text-right">Estado</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPaquetes.map((paquete) => (
                    <TableRow key={paquete.id} className="border-cyan-100 hover:bg-[#ECFEFF]/30 transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-6 w-6 rounded-lg ${paquete.color} shrink-0`} />
                          <p className="text-xs font-semibold text-[#164E63]">{paquete.nombre}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="text-xs font-bold text-[#164E63]">{paquete.sesiones}</p>
                      </TableCell>
                      <TableCell className="py-3 hidden sm:table-cell">
                        <p className="text-xs text-[#164E63]/60">{paquete.vigencia}</p>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <p className="text-sm font-bold text-[#164E63]">
                          ${paquete.precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            paquete.activo
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {paquete.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs cursor-pointer hover:bg-cyan-50 text-[#0891B2]">
                          Editar
                        </Button>
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
