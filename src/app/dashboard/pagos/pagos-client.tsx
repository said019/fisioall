"use client";

import { useState } from "react";
import {
  Wallet,
  Search,
  Plus,
  Filter,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  ArrowRightLeft,
  CircleDot,
  Download,
  CalendarDays,
  User,
  FileText,
  MoreHorizontal,
  RefreshCcw,
  Eye,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type PagoMetodo = "efectivo" | "transferencia" | "otro";
type PagoEstado = "pendiente" | "pagado" | "parcial" | "reembolsado";

interface Pago {
  id: string;
  pacienteNombre: string;
  pacienteIniciales: string;
  monto: number;
  metodo: PagoMetodo;
  estado: PagoEstado;
  concepto: string;
  referenciaExterna?: string;
  notas?: string;
  registradoPor: string;
  fechaPago: string;
  membresiaNombre?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const METODO_CONFIG: Record<PagoMetodo, { label: string; icon: typeof Banknote; color: string; bg: string }> = {
  efectivo:      { label: "Efectivo",      icon: Banknote,       color: "text-emerald-600", bg: "bg-emerald-50" },
  transferencia: { label: "Transferencia", icon: ArrowRightLeft, color: "text-blue-600",    bg: "bg-blue-50" },
  otro:          { label: "Otro",          icon: CircleDot,      color: "text-slate-600",   bg: "bg-slate-50" },
};

const ESTADO_CONFIG: Record<PagoEstado, { label: string; color: string; dot: string }> = {
  pendiente:   { label: "Pendiente",   color: "text-amber-600 bg-amber-50 border-amber-200",     dot: "bg-amber-500" },
  pagado:      { label: "Pagado",      color: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  parcial:     { label: "Parcial",     color: "text-blue-600 bg-blue-50 border-blue-200",         dot: "bg-blue-500" },
  reembolsado: { label: "Reembolsado", color: "text-red-600 bg-red-50 border-red-200",           dot: "bg-red-500" },
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const mockPagos: Pago[] = [
  { id: "p1",  pacienteNombre: "Ana Flores Torres",     pacienteIniciales: "AF", monto: 1200, metodo: "transferencia", estado: "pagado",     concepto: "Membresía mensual – Plan Premium",   referenciaExterna: "SPEI-2026022801", registradoPor: "Dr. García", fechaPago: "2026-02-28", membresiaNombre: "Plan Premium" },
  { id: "p2",  pacienteNombre: "Carlos Mendoza López",  pacienteIniciales: "CM", monto: 800,  metodo: "efectivo",      estado: "pagado",     concepto: "Paquete 8 sesiones",                  registradoPor: "Dr. García", fechaPago: "2026-02-25" },
  { id: "p3",  pacienteNombre: "Roberto Sánchez Vega",  pacienteIniciales: "RS", monto: 600,  metodo: "transferencia", estado: "pendiente",  concepto: "Membresía mensual – Plan Básico",     referenciaExterna: "SPEI-2026030101", registradoPor: "Dr. García", fechaPago: "2026-03-01", membresiaNombre: "Plan Básico" },
  { id: "p4",  pacienteNombre: "Sofía Reyes Castillo",  pacienteIniciales: "SR", monto: 350,  metodo: "efectivo",      estado: "pagado",     concepto: "Sesión individual de fisioterapia",   registradoPor: "Dra. López",  fechaPago: "2026-02-27" },
  { id: "p5",  pacienteNombre: "Ana Flores Torres",     pacienteIniciales: "AF", monto: 200,  metodo: "efectivo",      estado: "pagado",     concepto: "Evaluación postural completa",        registradoPor: "Dr. García", fechaPago: "2026-02-20" },
  { id: "p6",  pacienteNombre: "Luis Hernández Mora",   pacienteIniciales: "LH", monto: 1200, metodo: "transferencia", estado: "pagado",     concepto: "Membresía mensual – Plan Premium",    referenciaExterna: "SPEI-2026022002", registradoPor: "Dra. López",  fechaPago: "2026-02-20", membresiaNombre: "Plan Premium" },
  { id: "p7",  pacienteNombre: "María José Ruiz",       pacienteIniciales: "MR", monto: 500,  metodo: "efectivo",      estado: "parcial",    concepto: "Paquete 4 sesiones – pago parcial",   notas: "Adeuda $300 restantes", registradoPor: "Dr. García", fechaPago: "2026-02-18" },
  { id: "p8",  pacienteNombre: "Carlos Mendoza López",  pacienteIniciales: "CM", monto: 350,  metodo: "otro",          estado: "reembolsado", concepto: "Reembolso – sesión cancelada",         notas: "Sesión cancelada por emergencia", registradoPor: "Dr. García", fechaPago: "2026-02-15" },
  { id: "p9",  pacienteNombre: "Roberto Sánchez Vega",  pacienteIniciales: "RS", monto: 400,  metodo: "efectivo",      estado: "pagado",     concepto: "Sesión de rehabilitación",            registradoPor: "Dra. López",  fechaPago: "2026-02-14" },
  { id: "p10", pacienteNombre: "Sofía Reyes Castillo",  pacienteIniciales: "SR", monto: 1200, metodo: "transferencia", estado: "pendiente",  concepto: "Membresía mensual – Plan Premium",    referenciaExterna: "SPEI-2026030502", registradoPor: "Dr. García", fechaPago: "2026-03-05", membresiaNombre: "Plan Premium" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function PagosClient({ initialPagos }: { initialPagos?: Pago[] }) {
  const pagosData = initialPagos && initialPagos.length > 0 ? initialPagos : mockPagos;

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroMetodo, setFiltroMetodo] = useState<string>("todos");
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState<Pago | null>(null);

  // Filtrado
  const pagosFiltrados = pagosData.filter((p) => {
    const matchBusqueda = p.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()) || p.concepto.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    const matchMetodo = filtroMetodo === "todos" || p.metodo === filtroMetodo;
    return matchBusqueda && matchEstado && matchMetodo;
  });

  // KPIs
  const ingresosMes = pagosData.filter(p => p.estado === "pagado").reduce((sum, p) => sum + p.monto, 0);
  const pendientesMes = pagosData.filter(p => p.estado === "pendiente" || p.estado === "parcial").reduce((sum, p) => sum + p.monto, 0);
  const reembolsosMes = pagosData.filter(p => p.estado === "reembolsado").reduce((sum, p) => sum + p.monto, 0);
  const totalTransacciones = pagosData.length;

  function formatMonto(monto: number): string {
    return `$${monto.toLocaleString("es-MX")}`;
  }

  function formatFecha(fecha: string): string {
    const d = new Date(fecha + "T12:00:00");
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="space-y-6">
      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos del Mes", valor: formatMonto(ingresosMes), sub: `${mockPagos.filter(p => p.estado === "pagado").length} pagos cobrados`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12%", trendUp: true },
          { label: "Pagos Pendientes", valor: formatMonto(pendientesMes), sub: `${mockPagos.filter(p => p.estado === "pendiente" || p.estado === "parcial").length} por cobrar`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Reembolsos", valor: formatMonto(reembolsosMes), sub: `${mockPagos.filter(p => p.estado === "reembolsado").length} este mes`, icon: RefreshCcw, color: "text-red-600", bg: "bg-red-50" },
          { label: "Transacciones", valor: totalTransacciones.toString(), sub: "Total del mes", icon: FileText, color: "text-cyan-600", bg: "bg-[#e4ecf2]" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-[#c8dce8] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1e2d3a]/50 uppercase tracking-wide">{kpi.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-[#1e2d3a]">{kpi.valor}</p>
                    {"trend" in kpi && kpi.trend && (
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${kpi.trendUp ? "text-emerald-600" : "text-red-500"}`}>
                        {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {kpi.trend}
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

      {/* ── HEADER + FILTERS ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e2d3a]/40" />
            <Input
              placeholder="Buscar por paciente o concepto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 border-[#a8cfe0] focus:border-[#4a7fa5] h-10"
            />
          </div>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-full sm:w-40 border-[#a8cfe0] h-10 cursor-pointer">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-[#1e2d3a]/40" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroMetodo} onValueChange={setFiltroMetodo}>
            <SelectTrigger className="w-full sm:w-40 border-[#a8cfe0] h-10 cursor-pointer">
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los métodos</SelectItem>
              {Object.entries(METODO_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setModalRegistrar(true)} className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white text-sm shadow-sm shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Registrar Pago
        </Button>
      </div>

      {/* ── TABLA DE PAGOS ── */}
      <Card className="border-[#c8dce8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#f0f4f7] to-white">
                <TableHead className="text-[#1e2d3a]/60 font-semibold text-xs">Paciente</TableHead>
                <TableHead className="text-[#1e2d3a]/60 font-semibold text-xs">Concepto</TableHead>
                <TableHead className="text-[#1e2d3a]/60 font-semibold text-xs text-right">Monto</TableHead>
                <TableHead className="text-[#1e2d3a]/60 font-semibold text-xs">Método</TableHead>
                <TableHead className="text-[#1e2d3a]/60 font-semibold text-xs">Estado</TableHead>
                <TableHead className="text-[#1e2d3a]/60 font-semibold text-xs">Fecha</TableHead>
                <TableHead className="text-[#1e2d3a]/60 font-semibold text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Wallet className="h-10 w-10 text-[#1e2d3a]/15 mx-auto mb-2" />
                    <p className="text-sm text-[#1e2d3a]/40">No se encontraron pagos</p>
                  </TableCell>
                </TableRow>
              ) : (
                pagosFiltrados.map((pago) => {
                  const metodoCfg = METODO_CONFIG[pago.metodo];
                  const estadoCfg = ESTADO_CONFIG[pago.estado];
                  return (
                    <TableRow key={pago.id} className="hover:bg-[#e4ecf2]/40 transition-colors cursor-pointer" onClick={() => setModalDetalle(pago)}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-[#a8cfe0]">
                            <AvatarFallback className="bg-[#4a7fa5]/15 text-[#4a7fa5] text-xs font-bold">
                              {pago.pacienteIniciales}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-[#1e2d3a] truncate max-w-[140px]">{pago.pacienteNombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-[#1e2d3a]/70 truncate max-w-[200px]">{pago.concepto}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-bold ${pago.estado === "reembolsado" ? "text-red-500" : "text-[#1e2d3a]"}`}>
                          {pago.estado === "reembolsado" ? "-" : ""}{formatMonto(pago.monto)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className={`${metodoCfg.bg} h-6 w-6 rounded-md flex items-center justify-center`}>
                            <metodoCfg.icon className={`h-3 w-3 ${metodoCfg.color}`} />
                          </div>
                          <span className="text-xs text-[#1e2d3a]/50">{metodoCfg.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] border ${estadoCfg.color}`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${estadoCfg.dot} mr-1.5`} />
                          {estadoCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[#1e2d3a]/50">{formatFecha(pago.fechaPago)}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4 text-[#1e2d3a]/40" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setModalDetalle(pago)} className="cursor-pointer">
                              <Eye className="h-3.5 w-3.5 mr-2" /> Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Download className="h-3.5 w-3.5 mr-2" /> Descargar recibo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── MODAL: DETALLE PAGO ── */}
      <Dialog open={!!modalDetalle} onOpenChange={() => setModalDetalle(null)}>
        <DialogContent className="max-w-md">
          {modalDetalle && (() => {
            const metodoCfg = METODO_CONFIG[modalDetalle.metodo];
            const estadoCfg = ESTADO_CONFIG[modalDetalle.estado];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-[#1e2d3a]">Detalle del Pago</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-[#f0f4f7] to-white rounded-xl p-4">
                    <Avatar className="h-11 w-11 border-2 border-[#a8cfe0]">
                      <AvatarFallback className="bg-[#4a7fa5]/15 text-[#4a7fa5] font-bold">
                        {modalDetalle.pacienteIniciales}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-[#1e2d3a]">{modalDetalle.pacienteNombre}</p>
                      <p className="text-xs text-[#1e2d3a]/40">{formatFecha(modalDetalle.fechaPago)}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className={`text-xl font-bold ${modalDetalle.estado === "reembolsado" ? "text-red-500" : "text-[#1e2d3a]"}`}>
                        {modalDetalle.estado === "reembolsado" ? "-" : ""}{formatMonto(modalDetalle.monto)}
                      </p>
                      <Badge variant="outline" className={`text-[10px] border ${estadoCfg.color} mt-1`}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${estadoCfg.dot} mr-1.5`} />
                        {estadoCfg.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Concepto", value: modalDetalle.concepto },
                      { label: "Método de Pago", value: metodoCfg.label },
                      ...(modalDetalle.referenciaExterna ? [{ label: "Referencia", value: modalDetalle.referenciaExterna }] : []),
                      ...(modalDetalle.membresiaNombre ? [{ label: "Membresía", value: modalDetalle.membresiaNombre }] : []),
                      { label: "Registrado por", value: modalDetalle.registradoPor },
                      ...(modalDetalle.notas ? [{ label: "Notas", value: modalDetalle.notas }] : []),
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-start gap-4">
                        <span className="text-xs font-semibold text-[#1e2d3a]/50 shrink-0">{item.label}</span>
                        <span className="text-sm text-[#1e2d3a]/80 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter className="gap-2 mt-4">
                  <Button variant="outline" onClick={() => setModalDetalle(null)} className="cursor-pointer">Cerrar</Button>
                  <Button variant="outline" className="cursor-pointer text-[#1e2d3a]">
                    <Download className="h-4 w-4 mr-1.5" /> Recibo
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── MODAL: REGISTRAR PAGO ── */}
      <Dialog open={modalRegistrar} onOpenChange={setModalRegistrar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a]">Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Paciente</Label>
              <Select>
                <SelectTrigger className="border-[#a8cfe0] cursor-pointer"><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="af">Ana Flores Torres</SelectItem>
                  <SelectItem value="cm">Carlos Mendoza López</SelectItem>
                  <SelectItem value="rs">Roberto Sánchez Vega</SelectItem>
                  <SelectItem value="sr">Sofía Reyes Castillo</SelectItem>
                  <SelectItem value="lh">Luis Hernández Mora</SelectItem>
                  <SelectItem value="mr">María José Ruiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]/60">Monto</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e2d3a]/30" />
                  <Input type="number" placeholder="0.00" className="pl-9 border-[#a8cfe0]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1e2d3a]/60">Método</Label>
                <Select>
                  <SelectTrigger className="border-[#a8cfe0] cursor-pointer"><SelectValue placeholder="Método" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                    <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                    <SelectItem value="otro">📋 Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Concepto</Label>
              <Input placeholder="Ej: Membresía mensual, Sesión individual..." className="border-[#a8cfe0]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Referencia Externa (opcional)</Label>
              <Input placeholder="Ej: SPEI-2026030101" className="border-[#a8cfe0]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Fecha de Pago</Label>
              <Input type="date" className="border-[#a8cfe0] cursor-pointer" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Notas (opcional)</Label>
              <textarea
                rows={2}
                className="w-full text-sm border border-[#a8cfe0] rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#4a7fa5] text-[#1e2d3a] placeholder:text-[#1e2d3a]/30"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalRegistrar(false)} className="cursor-pointer">Cancelar</Button>
            <Button onClick={() => setModalRegistrar(false)} className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white">
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
