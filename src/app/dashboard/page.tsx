import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  CalendarDays,
  Users,
  TrendingUp,
  CreditCard,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
} from "lucide-react";
import Link from "next/link";

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const stats = [
  {
    label: "Citas de Hoy",
    value: "12",
    sub: "+3 desde ayer",
    icon: CalendarDays,
    trend: "up",
    color: "text-[#0891B2]",
    bg: "bg-[#0891B2]/10",
  },
  {
    label: "Pacientes Activos",
    value: "84",
    sub: "+5 este mes",
    icon: Users,
    trend: "up",
    color: "text-[#059669]",
    bg: "bg-[#059669]/10",
  },
  {
    label: "Membresías por Vencer",
    value: "3",
    sub: "En los próximos 7 días",
    icon: CreditCard,
    trend: "alert",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
  },
  {
    label: "Ingresos del Mes",
    value: "$18,400",
    sub: "+12% vs mes anterior",
    icon: TrendingUp,
    trend: "up",
    color: "text-[#0891B2]",
    bg: "bg-[#0891B2]/10",
  },
];

const citasHoy = [
  {
    id: "1",
    hora: "09:00",
    paciente: "María González Ríos",
    initials: "MG",
    motivo: "Rehab. Rodilla Post-Op",
    sesion: "8/10",
    estado: "confirmada",
  },
  {
    id: "2",
    hora: "10:30",
    paciente: "Roberto Hernández",
    initials: "RH",
    motivo: "Dolor Lumbar Crónico",
    sesion: "3/5",
    estado: "en-curso",
  },
  {
    id: "3",
    hora: "12:00",
    paciente: "Valeria Soto Pérez",
    initials: "VS",
    motivo: "Lesión de Hombro",
    sesion: "1/8",
    estado: "confirmada",
  },
  {
    id: "4",
    hora: "13:00",
    paciente: "Jorge Ramírez Luna",
    initials: "JR",
    motivo: "Cervicalgia",
    sesion: "5/5",
    estado: "pendiente",
  },
  {
    id: "5",
    hora: "15:30",
    paciente: "Ana Sofía Morales",
    initials: "AM",
    motivo: "Pie Plano Adulto",
    sesion: "2/6",
    estado: "confirmada",
  },
  {
    id: "6",
    hora: "17:00",
    paciente: "Luis Alberto Torres",
    initials: "LT",
    motivo: "Deportivo – Tobillo",
    sesion: "4/5",
    estado: "cancelada",
  },
];

const alertas = [
  { tipo: "vencimiento", texto: "Membresía de Roberto Hernández vence en 2 días", href: "/dashboard/membresias" },
  { tipo: "vencimiento", texto: "Jorge Ramírez usa su última sesión hoy", href: "/dashboard/membresias" },
  { tipo: "pendiente", texto: "3 pagos pendientes de confirmación", href: "/dashboard/membresias" },
];

const estadoConfig: Record<string, { label: string; class: string }> = {
  confirmada: { label: "Confirmada", class: "bg-[#059669]/10 text-[#059669] border-[#059669]/20" },
  "en-curso": { label: "En curso", class: "bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20" },
  pendiente: { label: "Pendiente", class: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" },
  cancelada: { label: "Cancelada", class: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" },
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const completadas = citasHoy.filter((c) => c.estado === "en-curso" || c.estado === "confirmada").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-cyan-100 bg-white hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#164E63]/50">{s.label}</p>
                  <p className="text-2xl font-bold text-[#164E63]">{s.value}</p>
                  <p
                    className={`text-xs font-medium ${
                      s.trend === "up"
                        ? "text-[#059669]"
                        : s.trend === "alert"
                        ? "text-[#F59E0B]"
                        : "text-[#164E63]/50"
                    }`}
                  >
                    {s.sub}
                  </p>
                </div>
                <div className={`${s.bg} ${s.color} rounded-lg p-2.5 shrink-0`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
              <p className="text-sm font-semibold text-[#164E63]">Alertas del día</p>
            </div>
            <div className="space-y-2">
              {alertas.map((a, i) => (
                <Link
                  key={i}
                  href={a.href}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white border border-orange-200 px-3 py-2 hover:bg-orange-50 transition-all duration-200 cursor-pointer"
                >
                  <p className="text-xs text-[#164E63]">{a.texto}</p>
                  <ArrowRight className="h-3 w-3 text-[#F59E0B] shrink-0" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-7">
        {/* Citas de hoy */}
        <Card className="border-cyan-100 bg-white lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold text-[#164E63]">Citas de Hoy</CardTitle>
              <CardDescription className="text-[#164E63]/50 text-xs">
                {completadas} de {citasHoy.length} sesiones completadas o en curso
              </CardDescription>
            </div>
            <Link href="/dashboard/agenda">
              <Button variant="outline" size="sm" className="border-cyan-200 text-[#0891B2] hover:bg-cyan-50 cursor-pointer transition-all duration-200 text-xs">
                Ver Agenda
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-cyan-50">
              {citasHoy.map((cita) => {
                const conf = estadoConfig[cita.estado];
                return (
                  <div
                    key={cita.id}
                    className={`flex items-center gap-3 px-5 py-3 hover:bg-cyan-50/50 transition-all duration-200 cursor-pointer ${
                      cita.estado === "cancelada" ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <Clock className="h-3 w-3 text-[#164E63]/30" />
                      <span className="text-xs font-bold text-[#164E63]">{cita.hora}</span>
                    </div>
                    <Avatar className="h-8 w-8 border border-cyan-100 shrink-0">
                      <AvatarFallback className="bg-[#0891B2]/10 text-[#0891B2] text-xs font-bold">
                        {cita.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#164E63] truncate">{cita.paciente}</p>
                      <p className="text-xs text-[#164E63]/50 truncate">{cita.motivo}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[#164E63]/40 hidden sm:block">Ses. {cita.sesion}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${conf.class}`}>
                        {conf.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Panel lateral */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Resumen sesiones */}
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#164E63]">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Completadas", count: citasHoy.filter(c => c.estado === "en-curso").length, icon: CheckCircle2, color: "text-[#0891B2]" },
                { label: "Confirmadas", count: citasHoy.filter(c => c.estado === "confirmada").length, icon: Activity, color: "text-[#059669]" },
                { label: "Canceladas", count: citasHoy.filter(c => c.estado === "cancelada").length, icon: XCircle, color: "text-[#EF4444]" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs text-[#164E63]/70">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-[#164E63]">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Accesos rápidos */}
          <Card className="border-cyan-100 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#164E63]">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/agenda">
                <Button variant="outline" className="w-full justify-start cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 hover:border-[#0891B2] transition-all duration-200 text-xs h-9">
                  <Plus className="mr-2 h-3.5 w-3.5 text-[#0891B2]" />
                  Nueva Cita
                </Button>
              </Link>
              <Link href="/dashboard/pacientes">
                <Button variant="outline" className="w-full justify-start cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 hover:border-[#0891B2] transition-all duration-200 text-xs h-9">
                  <Users className="mr-2 h-3.5 w-3.5 text-[#0891B2]" />
                  Nuevo Paciente
                </Button>
              </Link>
              <Button
                className="w-full justify-start cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 text-xs h-9"
              >
                <FileText className="mr-2 h-3.5 w-3.5" />
                Nota SOAP
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
