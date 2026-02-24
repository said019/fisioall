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
  Dumbbell,
  CreditCard,
  Phone,
  Mail,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  iniciales: string;
  email: string;
  telefono: string;
  edad: number;
  diagnostico: string;
  cie10: string;
  sesionesRestantes: number;
  sesionesTotal: number;
  ultimaCita: string;
  proximaCita: string;
  dolor: number;
  activo: boolean;
  color: string;
  ciudad: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const mockPacientes: Paciente[] = [
  {
    id: "1",
    nombre: "Ana",
    apellido: "Flores Torres",
    iniciales: "AF",
    email: "ana.flores@gmail.com",
    telefono: "+52 55 1234 5678",
    edad: 34,
    diagnostico: "Síndrome de banda iliotibial derecha",
    cie10: "M76.3",
    sesionesRestantes: 2,
    sesionesTotal: 10,
    ultimaCita: "24 feb 2026",
    proximaCita: "26 feb 2026",
    dolor: 4,
    activo: true,
    color: "bg-cyan-500",
    ciudad: "CDMX",
  },
  {
    id: "2",
    nombre: "Carlos",
    apellido: "Mendoza López",
    iniciales: "CM",
    email: "cmendoza@outlook.com",
    telefono: "+52 81 9876 5432",
    edad: 45,
    diagnostico: "Hernia discal C4-C5 con radiculopatía",
    cie10: "M50.1",
    sesionesRestantes: 5,
    sesionesTotal: 12,
    ultimaCita: "24 feb 2026",
    proximaCita: "27 feb 2026",
    dolor: 3,
    activo: true,
    color: "bg-violet-500",
    ciudad: "Monterrey",
  },
  {
    id: "3",
    nombre: "Patricia",
    apellido: "Morales Vega",
    iniciales: "PM",
    email: "pmorales@gmail.com",
    telefono: "+52 33 5555 0101",
    edad: 62,
    diagnostico: "Gonartrosis bilateral grado III",
    cie10: "M17.1",
    sesionesRestantes: 1,
    sesionesTotal: 8,
    ultimaCita: "22 feb 2026",
    proximaCita: "25 feb 2026",
    dolor: 6,
    activo: true,
    color: "bg-orange-500",
    ciudad: "Guadalajara",
  },
  {
    id: "4",
    nombre: "Roberto",
    apellido: "Sánchez Vega",
    iniciales: "RS",
    email: "rsanchez@hotmail.com",
    telefono: "+52 55 6677 8899",
    edad: 28,
    diagnostico: "Esguince de tobillo grado II",
    cie10: "S93.4",
    sesionesRestantes: 6,
    sesionesTotal: 6,
    ultimaCita: "21 feb 2026",
    proximaCita: "24 feb 2026",
    dolor: 2,
    activo: true,
    color: "bg-emerald-500",
    ciudad: "CDMX",
  },
  {
    id: "5",
    nombre: "Daniela",
    apellido: "Martínez Cruz",
    iniciales: "DM",
    email: "dani.mtz@gmail.com",
    telefono: "+52 55 2233 4455",
    edad: 31,
    diagnostico: "Tendinopatía del manguito rotador izquierdo",
    cie10: "M75.1",
    sesionesRestantes: 8,
    sesionesTotal: 10,
    ultimaCita: "20 feb 2026",
    proximaCita: "25 feb 2026",
    dolor: 5,
    activo: true,
    color: "bg-pink-500",
    ciudad: "Puebla",
  },
  {
    id: "6",
    nombre: "José",
    apellido: "Hernández Paz",
    iniciales: "JH",
    email: "jose.hz@gmail.com",
    telefono: "+52 33 9988 7766",
    edad: 52,
    diagnostico: "Lumbalgia crónica con espasmo muscular",
    cie10: "M54.5",
    sesionesRestantes: 3,
    sesionesTotal: 12,
    ultimaCita: "19 feb 2026",
    proximaCita: "26 feb 2026",
    dolor: 5,
    activo: true,
    color: "bg-amber-500",
    ciudad: "Guadalajara",
  },
];

const NOTAS_SOAP = [
  {
    sesion: 7,
    fecha: "24 feb 2026",
    eva: 4,
    badge: "Progreso positivo",
    S: "Paciente refiere dolor moderado en cara lateral de rodilla derecha al subir escaleras. Refiere haber corrido 3 km el fin de semana sin recomendación.",
    O: "EVA 4/10. Tensión palpable en TFL. Prueba de Ober positiva. ROM completo. Sin edema.",
    A: "Síndrome de banda iliotibial en fase subaguda. Progreso favorable respecto sesión anterior (EVA 6).",
    P: "Liberación miofascial TFL y glúteo medio. Estiramientos activos. Electroterapia TENS 20 min. Ejercicios excéntricos cadena cinética cerrada. Próxima cita 26-feb.",
  },
  {
    sesion: 6,
    fecha: "20 feb 2026",
    eva: 6,
    badge: "Seguimiento",
    S: "Dolor en cara lateral de rodilla al correr más de 2 km. Mejoría leve comparado con sesión previa.",
    O: "EVA 6/10. Test de compresión TFL positivo. Leve restricción en rotación interna de cadera.",
    A: "Síndrome iliotibial bilateral, mayor afectación derecha. Adherencias en TFL.",
    P: "Masoterapia profunda. Estiramientos asistidos. Indicaciones de reposo deportivo parcial.",
  },
];

const EJERCICIOS = [
  { id: "1", nombre: "Puente de glúteo unilateral", tipo: "Fuerza", series: 3, reps: 15, completado: true },
  { id: "2", nombre: "Estiramiento de TFL en decúbito", tipo: "Flexibilidad", series: 2, reps: 30, completado: true },
  { id: "3", nombre: "Sentadilla monopodal excéntrica", tipo: "Excéntrico", series: 3, reps: 10, completado: false },
];

const PAGOS_PACIENTE = [
  { id: "P-201", fecha: "10 feb 2026", concepto: "Paquete 10 sesiones", monto: 4500, metodo: "Tarjeta débito", estado: "pagado" },
  { id: "P-145", fecha: "12 ene 2026", concepto: "Evaluación inicial", monto: 600, metodo: "Efectivo", estado: "pagado" },
];

const DOLOR_HISTORIAL = [7, 6, 6, 5, 5, 6, 4];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Dolor SVG
// ─────────────────────────────────────────────────────────────────────────────
function DolorMiniSVG({ data }: { data: number[] }) {
  const W = 120;
  const H = 32;
  const max = 10;
  const stepX = W / (data.length - 1);
  const pts = data.map((v, i) => ({ x: Math.round(i * stepX), y: Math.round(H - (v / max) * H) }));
  const pathD = pts.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`)).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-8" aria-label="historial dolor">
      <path d={pathD} stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 3.5 : 2.5} fill="#059669" />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: PerfilPaciente (panel derecho)
// ─────────────────────────────────────────────────────────────────────────────
function PerfilPaciente({ paciente, onClose }: { paciente: Paciente; onClose: () => void }) {
  const [tab, setTab] = useState<"expediente" | "soap" | "ejercicios" | "pagos">("expediente");
  const alerta = paciente.sesionesRestantes <= 2;

  const tabs = [
    { key: "expediente", label: "Expediente", icono: User },
    { key: "soap", label: "Notas SOAP", icono: ClipboardList },
    { key: "ejercicios", label: "Ejercicios", icono: Dumbbell },
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
      <div className="max-w-2xl w-full ml-auto bg-white border-l border-cyan-100 shadow-2xl overflow-y-auto flex flex-col">

        {/* Header sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-cyan-100 px-5 py-3 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-medium text-[#164E63]/70 hover:text-[#164E63] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/agenda">
              <Button size="sm" variant="outline" className="cursor-pointer border-cyan-200 text-[#164E63] hover:bg-cyan-50 transition-all duration-200 gap-1.5 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                Nueva Cita
              </Button>
            </Link>
            <Button size="sm" className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 gap-1.5 text-xs">
              <ClipboardList className="h-3.5 w-3.5" />
              Nota SOAP
            </Button>
          </div>
        </div>

        {/* Hero del paciente */}
        <div className="px-6 pt-6 pb-4 border-b border-cyan-100">
          <div className="flex items-start gap-4">
            <div className={`h-14 w-14 rounded-2xl ${paciente.color} flex items-center justify-center shrink-0 shadow-md`}>
              <span className="text-lg font-bold text-white">{paciente.iniciales}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#164E63]">{paciente.nombre} {paciente.apellido}</h2>
              <p className="text-sm text-[#164E63]/50">{paciente.edad} años · {paciente.ciudad}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-bold ${alerta ? "text-orange-600" : "text-emerald-600"}`}>
                    {paciente.sesionesRestantes} / {paciente.sesionesTotal} sesiones
                  </p>
                  {alerta && <AlertCircle className="h-3.5 w-3.5 text-orange-500" />}
                </div>
                <Progress
                  value={Math.round(((paciente.sesionesTotal - paciente.sesionesRestantes) / paciente.sesionesTotal) * 100)}
                  className={`h-1.5 w-20 ${alerta ? "[&>div]:bg-orange-400" : "[&>div]:bg-[#0891B2]"}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cyan-100 px-4 gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-b-2 -mb-px ${
                tab === t.key
                  ? "border-[#0891B2] text-[#0891B2]"
                  : "border-transparent text-[#164E63]/50 hover:text-[#164E63]"
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
                  { icono: CalendarDays, label: "Última cita", valor: paciente.ultimaCita },
                  { icono: CalendarDays, label: "Próxima cita", valor: paciente.proximaCita },
                ].map((item) => (
                  <div key={item.label} className="bg-[#ECFEFF] rounded-xl p-3 flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <item.icono className="h-3.5 w-3.5 text-[#0891B2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#164E63]/40 font-medium">{item.label}</p>
                      <p className="text-xs font-semibold text-[#164E63] truncate">{item.valor}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Diagnóstico */}
              <div className="bg-white border border-cyan-100 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[#164E63] uppercase tracking-wide">Diagnóstico</p>
                    <p className="text-sm text-[#164E63]/70 mt-1 leading-relaxed">{paciente.diagnostico}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-cyan-50 text-[#0891B2] border-cyan-200 shrink-0">
                    CIE-10: {paciente.cie10}
                  </Badge>
                </div>

                {/* Mini gráfica EVA */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-bold text-[#164E63]/50 uppercase">Evolución EVA</p>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {DOLOR_HISTORIAL[0]} → {DOLOR_HISTORIAL[DOLOR_HISTORIAL.length - 1]} / 10
                    </span>
                  </div>
                  <DolorMiniSVG data={DOLOR_HISTORIAL} />
                </div>
              </div>

              {/* Body map básico */}
              <div className="bg-white border border-cyan-100 rounded-xl p-4">
                <p className="text-xs font-bold text-[#164E63] uppercase tracking-wide mb-3">Mapa Corporal</p>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <svg viewBox="0 0 80 160" className="h-32 w-auto" aria-label="silueta corporal">
                      {/* Cabeza */}
                      <ellipse cx="40" cy="16" rx="13" ry="15" fill="#E0F7FA" stroke="#A5F3FC" strokeWidth="1.5" />
                      {/* Torso */}
                      <rect x="22" y="31" width="36" height="50" rx="6" fill="#E0F7FA" stroke="#A5F3FC" strokeWidth="1.5" />
                      {/* Brazo izq */}
                      <rect x="7" y="32" width="14" height="42" rx="6" fill="#E0F7FA" stroke="#A5F3FC" strokeWidth="1.5" />
                      {/* Brazo der */}
                      <rect x="59" y="32" width="14" height="42" rx="6" fill="#E0F7FA" stroke="#A5F3FC" strokeWidth="1.5" />
                      {/* Pierna izq */}
                      <rect x="23" y="82" width="15" height="72" rx="6" fill="#E0F7FA" stroke="#A5F3FC" strokeWidth="1.5" />
                      {/* Pierna der */}
                      <rect x="42" y="82" width="15" height="72" rx="6" fill="#E0F7FA" stroke="#A5F3FC" strokeWidth="1.5" />
                      {/* Punto de lesión — rodilla derecha */}
                      <circle cx="50" cy="116" r="5" fill="#F97316" opacity="0.85" />
                      <circle cx="50" cy="116" r="8" fill="#F97316" opacity="0.25" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 w-3 rounded-full bg-orange-400" />
                      <p className="text-xs text-[#164E63]/60">Zona de lesión principal</p>
                    </div>
                    <p className="text-xs font-semibold text-[#164E63]">Rodilla derecha</p>
                    <p className="text-[10px] text-[#164E63]/50 mt-1">Cara lateral — banda iliotibial</p>
                    <div className="mt-3 bg-[#ECFEFF] rounded-lg p-2">
                      <p className="text-[10px] text-[#164E63]/40">Dolor actual (EVA)</p>
                      <p className={`text-sm font-bold ${paciente.dolor <= 3 ? "text-emerald-600" : paciente.dolor <= 6 ? "text-amber-500" : "text-red-500"}`}>
                        {paciente.dolor} / 10
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB SOAP ── */}
          {tab === "soap" && (
            <div className="space-y-4">
              {NOTAS_SOAP.map((nota) => (
                <div key={nota.sesion} className="border border-cyan-100 rounded-xl overflow-hidden">
                  {/* Header nota */}
                  <div className="bg-[#ECFEFF] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#164E63]">Sesión #{nota.sesion}</span>
                      <span className="text-[10px] text-[#164E63]/50">{nota.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${nota.eva <= 3 ? "bg-emerald-100 text-emerald-700" : nota.eva <= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                        EVA {nota.eva}/10
                      </span>
                      <Badge variant="outline" className="text-[10px] border-cyan-200 text-[#0891B2] bg-white">
                        {nota.badge}
                      </Badge>
                    </div>
                  </div>
                  {/* Body SOAP */}
                  <div className="px-4 py-3 space-y-2.5">
                    {[
                      { key: "S", label: "Subjetivo", color: "border-cyan-400", bg: "bg-cyan-50", text: nota.S },
                      { key: "O", label: "Objetivo", color: "border-violet-400", bg: "bg-violet-50", text: nota.O },
                      { key: "A", label: "Análisis", color: "border-amber-400", bg: "bg-amber-50", text: nota.A },
                      { key: "P", label: "Plan", color: "border-emerald-400", bg: "bg-emerald-50", text: nota.P },
                    ].map((s) => (
                      <div key={s.key} className={`border-l-4 ${s.color} ${s.bg} rounded-r-lg pl-3 pr-2 py-2`}>
                        <p className="text-[10px] font-bold text-[#164E63]/50 uppercase mb-0.5">{s.key} — {s.label}</p>
                        <p className="text-xs text-[#164E63]/80 leading-relaxed">{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB EJERCICIOS ── */}
          {tab === "ejercicios" && (
            <div className="space-y-3">
              {EJERCICIOS.map((ej) => (
                <div key={ej.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${ej.completado ? "bg-emerald-50 border-emerald-200" : "bg-[#ECFEFF]/50 border-cyan-100"}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${ej.completado ? "bg-emerald-100" : "bg-cyan-50"}`}>
                    {ej.completado
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      : <Dumbbell className="h-4 w-4 text-[#0891B2]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#164E63]">{ej.nombre}</p>
                    <p className="text-[10px] text-[#164E63]/50">{ej.tipo}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#164E63]">{ej.series}×{ej.reps}</p>
                    <p className="text-[10px] text-[#164E63]/40">series×{ej.key === "reps" ? "reps" : "seg"}</p>
                  </div>
                </div>
              ))}

              {/* Progreso cumplimiento */}
              <div className="bg-white border border-cyan-100 rounded-xl p-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[#164E63]">Cumplimiento del plan</p>
                  <span className="text-xs font-bold text-emerald-600">
                    {EJERCICIOS.filter((e) => e.completado).length}/{EJERCICIOS.length} completados
                  </span>
                </div>
                <Progress
                  value={Math.round((EJERCICIOS.filter((e) => e.completado).length / EJERCICIOS.length) * 100)}
                  className="h-2 [&>div]:bg-emerald-500"
                />
                <p className="text-[10px] text-[#164E63]/40 mt-1.5">
                  {Math.round((EJERCICIOS.filter((e) => e.completado).length / EJERCICIOS.length) * 100)}% de cumplimiento esta semana
                </p>
              </div>
            </div>
          )}

          {/* ── TAB PAGOS ── */}
          {tab === "pagos" && (
            <div className="space-y-3">
              <div className="divide-y divide-cyan-100 border border-cyan-100 rounded-xl overflow-hidden">
                {PAGOS_PACIENTE.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3.5 bg-white hover:bg-[#ECFEFF]/50 transition-colors duration-200">
                    <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 text-[#0891B2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#164E63]">{p.concepto}</p>
                      <p className="text-[10px] text-[#164E63]/50">{p.fecha} · {p.metodo}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#164E63]">${p.monto.toLocaleString("es-MX")}</p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${p.estado === "pagado" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}
                      >
                        {p.estado === "pagado" ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-[#ECFEFF] rounded-xl p-3.5 flex items-center justify-between border border-cyan-100">
                <p className="text-xs font-semibold text-[#164E63]">Total pagado</p>
                <p className="text-base font-bold text-[#164E63]">
                  ${PAGOS_PACIENTE.filter((p) => p.estado === "pagado").reduce((a, p) => a + p.monto, 0).toLocaleString("es-MX")}
                </p>
              </div>
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
export default function PacientesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [vistaActiva, setVistaActiva] = useState<"grid" | "lista">("grid");
  const [pacienteActivo, setPacienteActivo] = useState<Paciente | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "alerta">("todos");

  const alertaCount = mockPacientes.filter((p) => p.sesionesRestantes <= 2).length;

  const pacientesFiltrados = mockPacientes.filter((p) => {
    const matchBusqueda =
      `${p.nombre} ${p.apellido} ${p.diagnostico}`.toLowerCase().includes(busqueda.toLowerCase());
    const matchAlerta = filtroEstado === "todos" || p.sesionesRestantes <= 2;
    return matchBusqueda && matchAlerta;
  });

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#ECFEFF] min-h-full">
      {/* Panel de perfil */}
      {pacienteActivo && (
        <PerfilPaciente paciente={pacienteActivo} onClose={() => setPacienteActivo(null)} />
      )}

      {/* ── 1. HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#164E63]">Pacientes</h1>
          <p className="text-xs text-[#164E63]/50 mt-0.5">
            {mockPacientes.filter((p) => p.activo).length} pacientes activos
          </p>
        </div>
        <Button className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 gap-1.5 w-fit">
          <Plus className="h-4 w-4" />
          Nuevo Paciente
        </Button>
      </div>

      {/* ── 2. FILTROS ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#164E63]/40" />
          <Input
            placeholder="Buscar por nombre o diagnóstico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 border-cyan-200 bg-white text-sm focus:border-[#0891B2] focus:ring-[#0891B2]/20"
          />
        </div>

        {/* Toggle Todos / Alerta */}
        <div className="flex items-center gap-1 bg-[#ECFEFF] border border-cyan-100 rounded-lg p-1">
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
              filtroEstado === "todos"
                ? "bg-white text-[#164E63] shadow-sm"
                : "text-[#164E63]/50 hover:text-[#164E63]"
            }`}
          >
            Todos ({mockPacientes.length})
          </button>
          <button
            onClick={() => setFiltroEstado("alerta")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer flex items-center gap-1 ${
              filtroEstado === "alerta"
                ? "bg-orange-100 text-orange-700 shadow-sm"
                : "text-[#164E63]/50 hover:text-[#164E63]"
            }`}
          >
            <AlertCircle className="h-3 w-3" />
            Alerta ({alertaCount})
          </button>
        </div>

        {/* Toggle Vista */}
        <div className="flex items-center gap-1 bg-[#ECFEFF] border border-cyan-100 rounded-lg p-1 ml-auto">
          <button
            onClick={() => setVistaActiva("grid")}
            className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              vistaActiva === "grid" ? "bg-[#0891B2] text-white shadow-sm" : "text-[#164E63]/50 hover:text-[#164E63]"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVistaActiva("lista")}
            className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              vistaActiva === "lista" ? "bg-[#0891B2] text-white shadow-sm" : "text-[#164E63]/50 hover:text-[#164E63]"
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
            const pct = Math.round((usadas / paciente.sesionesTotal) * 100);

            return (
              <Card
                key={paciente.id}
                onClick={() => setPacienteActivo(paciente)}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                  alerta
                    ? "border-orange-200 bg-orange-50/30 hover:bg-orange-50/50"
                    : "border-cyan-100 bg-white hover:bg-[#ECFEFF]/50"
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Avatar + datos */}
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl ${paciente.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <span className="text-sm font-bold text-white">{paciente.iniciales}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#164E63] truncate">
                        {paciente.nombre} {paciente.apellido}
                      </p>
                      <p className="text-[10px] text-[#164E63]/50">{paciente.edad} años · {paciente.ciudad}</p>
                    </div>
                    {alerta && <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />}
                  </div>

                  {/* Diagnóstico */}
                  <p className="text-xs text-[#164E63]/60 leading-snug line-clamp-2">{paciente.diagnostico}</p>

                  {/* Sesiones progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#164E63]/40">Sesiones</span>
                      <span className={`text-[10px] font-bold ${alerta ? "text-orange-600" : "text-[#164E63]"}`}>
                        {paciente.sesionesRestantes} restantes
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className={`h-1.5 ${alerta ? "[&>div]:bg-orange-400 bg-orange-100" : "[&>div]:bg-[#0891B2]"}`}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-current/5">
                    <p className="text-[10px] text-[#164E63]/40">
                      Próxima: <span className="font-medium text-[#164E63]/60">{paciente.proximaCita}</span>
                    </p>
                    <div className="flex items-center gap-0.5 text-xs font-medium text-[#0891B2] cursor-pointer hover:text-[#0891B2]/80 transition-colors">
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
        <Card className="border-cyan-100 bg-white">
          <div className="divide-y divide-cyan-100">
            {pacientesFiltrados.map((paciente) => {
              const alerta = paciente.sesionesRestantes <= 2;
              return (
                <div
                  key={paciente.id}
                  onClick={() => setPacienteActivo(paciente)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#ECFEFF]/50 transition-colors duration-200"
                >
                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-xl ${paciente.color} flex items-center justify-center shrink-0`}>
                    <span className="text-xs font-bold text-white">{paciente.iniciales}</span>
                  </div>

                  {/* Nombre + diagnóstico */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#164E63] truncate">
                      {paciente.nombre} {paciente.apellido}
                    </p>
                    <p className="text-[10px] text-[#164E63]/50 truncate">{paciente.diagnostico}</p>
                  </div>

                  {/* Próxima cita */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-[10px] text-[#164E63]/40">Próxima cita</p>
                    <p className="text-xs font-medium text-[#164E63]">{paciente.proximaCita}</p>
                  </div>

                  {/* Sesiones */}
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${alerta ? "text-orange-600" : "text-[#164E63]"}`}>
                      {paciente.sesionesRestantes}
                    </p>
                    <p className="text-[10px] text-[#164E63]/40">sesiones</p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#164E63]/30 shrink-0" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {pacientesFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-12 w-12 rounded-2xl bg-cyan-50 flex items-center justify-center">
            <Activity className="h-6 w-6 text-[#0891B2]" />
          </div>
          <p className="text-sm font-semibold text-[#164E63]/60">No se encontraron pacientes</p>
          <p className="text-xs text-[#164E63]/40">Intenta cambiar los filtros o la búsqueda</p>
        </div>
      )}
    </div>
  );
}
