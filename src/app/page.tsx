import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CheckCircle2,
  CalendarDays,
  FileText,
  CreditCard,
  Dumbbell,
  BarChart3,
  Wallet,
  Star,
  Users,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: CalendarDays,
    color: "#0891B2",
    bg: "bg-[#0891B2]/10",
    title: "Agenda Inteligente",
    desc: "Programa citas con recordatorios automáticos, confirmación por WhatsApp y vista semanal sin conflictos.",
  },
  {
    icon: FileText,
    color: "#059669",
    bg: "bg-[#059669]/10",
    title: "Expediente Clínico Digital",
    desc: "Notas SOAP, mapas corporales interactivos, evolución del dolor y diagnósticos en un solo lugar.",
  },
  {
    icon: CreditCard,
    color: "#7C3AED",
    bg: "bg-violet-100",
    title: "Membresías y Pagos",
    desc: "Control de paquetes de sesiones, cobros con múltiples métodos y alertas de vencimiento automáticas.",
  },
  {
    icon: Dumbbell,
    color: "#D97706",
    bg: "bg-amber-100",
    title: "Biblioteca de Ejercicios",
    desc: "Prescribe rutinas personalizadas con videos demostrativos y seguimiento de cumplimiento del paciente.",
  },
  {
    icon: BarChart3,
    color: "#DC2626",
    bg: "bg-red-100",
    title: "Reportes y Analítica",
    desc: "Visualiza ingresos, tasa de asistencia, pacientes más activos y evolución clínica en dashboards claros.",
  },
  {
    icon: Wallet,
    color: "#0891B2",
    bg: "bg-[#0891B2]/10",
    title: "Digital Wallet Pass",
    desc: "Tus pacientes llevan su membresía en Apple Wallet o Google Pay. Acceso a sesiones desde su teléfono.",
  },
];

const especialidades = [
  "Rehabilitación Cardíaca",
  "Neuro-Rehabilitación",
  "Fisio Deportiva",
  "Terapia Manual",
  "Pediatría",
  "Geriatría",
  "Columna y Postura",
  "Acuaterapia",
];

const planes = [
  {
    nombre: "Básico",
    precio: "$299",
    periodo: "/mes",
    desc: "Ideal para consultorios independientes",
    destacado: false,
    features: [
      "1 fisioterapeuta",
      "Hasta 30 pacientes activos",
      "Agenda básica",
      "Notas SOAP",
      "Soporte por correo",
    ],
  },
  {
    nombre: "Pro",
    precio: "$599",
    periodo: "/mes",
    desc: "El más elegido por fisioterapeutas en México",
    destacado: true,
    features: [
      "3 fisioterapeutas",
      "Pacientes ilimitados",
      "Agenda inteligente + recordatorios",
      "Expediente clínico completo",
      "Membresías y pagos",
      "Digital Wallet Pass",
      "Reportes avanzados",
      "Soporte prioritario 24/7",
    ],
  },
  {
    nombre: "Clínica",
    precio: "$1,200",
    periodo: "/mes",
    desc: "Para clínicas con múltiples sucursales",
    destacado: false,
    features: [
      "Fisioterapeutas ilimitados",
      "Multi-sucursal",
      "API y webhooks",
      "Onboarding personalizado",
      "SLA garantizado 99.9%",
    ],
  },
];

const testimonios = [
  {
    nombre: "Dra. Sofía Ramírez",
    cargo: "Fisioterapeuta · Guadalajara, Jal.",
    initials: "SR",
    quote:
      "FisioAll transformó por completo mi consultorio. Antes perdía horas en papeleo, ahora todo está digitalizado y mis pacientes adoran recibir recordatorios automáticos.",
  },
  {
    nombre: "Lic. Miguel Ángel Torres",
    cargo: "Clínica ProMove · CDMX",
    initials: "MT",
    quote:
      "El control de membresías es increíble. Cero pacientes con sesiones vencidas sin que nos demos cuenta. El Digital Wallet Pass fue un diferenciador enorme.",
  },
  {
    nombre: "Dra. Fernanda Castillo",
    cargo: "Centro de Rehabilitación · MTY",
    initials: "FC",
    quote:
      "En 2 semanas recuperé la inversión. Mis pacientes pagan más rápido porque la plataforma les manda avisos, y yo tengo más tiempo para atenderlos.",
  },
];

const stats = [
  { valor: "+500", label: "Clínicas activas" },
  { valor: "45K+", label: "Sesiones mensuales" },
  { valor: "98%", label: "Satisfacción" },
  { valor: "20 min", label: "Ahorrados por día" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT (Server Component)
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#ECFEFF] font-sans">
      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-cyan-100 bg-white/80 backdrop-blur-md" role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#0891B2] flex items-center justify-center shadow-sm">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#164E63]">FisioAll</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Navegación principal">
            <Link
              href="#features"
              className="px-3 py-1.5 text-sm font-medium text-[#164E63]/70 hover:text-[#164E63] hover:bg-cyan-50 rounded-lg transition-all duration-200 cursor-pointer"
            >
              Características
            </Link>
            <Link
              href="#pricing"
              className="px-3 py-1.5 text-sm font-medium text-[#164E63]/70 hover:text-[#164E63] hover:bg-cyan-50 rounded-lg transition-all duration-200 cursor-pointer"
            >
              Precios
            </Link>
          </nav>

          {/* CTA buttons */}
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                className="hidden sm:flex cursor-pointer text-[#164E63] hover:bg-cyan-50 hover:text-[#164E63] transition-all duration-200 text-sm"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/login">
              <Button className="cursor-pointer bg-[#059669] hover:bg-[#059669]/90 text-white transition-all duration-200 text-sm shadow-sm">
                Prueba Gratis
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* ─── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
          {/* Blobs de fondo */}
          <div className="absolute -top-24 -left-24 h-[480px] w-[480px] rounded-full bg-[#0891B2]/15 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-16 -right-16 h-[400px] w-[400px] rounded-full bg-[#059669]/10 blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-1.5 mb-8 shadow-sm">
              <Zap className="h-3.5 w-3.5 text-[#0891B2]" />
              <span className="text-xs font-semibold text-[#164E63]">
                La plataforma #1 para fisioterapeutas en México
              </span>
            </div>

            {/* H1 */}
            <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl md:text-6xl font-bold text-[#164E63] leading-tight tracking-tight">
              Tu clínica,{" "}
              <span className="relative inline-block">
                <span className="text-[#0891B2]">completamente</span>
                {/* Subrayado SVG */}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8 Q75 2 150 8 Q225 14 298 8"
                    stroke="#0891B2"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.5"
                  />
                </svg>
              </span>{" "}
              <span className="text-[#059669]">digital</span>
            </h1>

            {/* Subtítulo */}
            <p className="mt-8 max-w-2xl mx-auto text-[20px] leading-relaxed text-[#164E63]/60">
              Agenda inteligente, expedientes clínicos, membresías y pagos.
              Todo lo que necesitas para gestionar tu consultorio desde un solo lugar.
            </p>

            {/* Botones CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login">
                <Button
                  size="lg"
                  className="cursor-pointer h-12 px-8 bg-[#059669] hover:bg-[#059669]/90 hover:-translate-y-0.5 text-white font-semibold text-base shadow-lg shadow-[#059669]/30 transition-all duration-200"
                >
                  Empieza gratis hoy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer h-12 px-8 border-[#0891B2] text-[#0891B2] hover:bg-[#0891B2]/10 hover:-translate-y-0.5 font-semibold text-base transition-all duration-200"
                >
                  Ver demo en vivo
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              {["Sin tarjeta de crédito", "14 días gratis", "Cancela cuando quieras"].map((txt) => (
                <div key={txt} className="flex items-center gap-1.5 text-sm text-[#164E63]/60">
                  <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── STATS BAR ──────────────────────────────────────────────────── */}
        <div className="border-t border-b border-cyan-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x-0 sm:divide-x divide-cyan-100">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center text-center gap-1">
                  <span className="text-3xl font-bold text-[#164E63]">{s.valor}</span>
                  <span className="text-sm text-[#164E63]/50">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── ESPECIALIDADES ─────────────────────────────────────────────── */}
        <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#164E63]/40 mb-6">
            Diseñado para todas las especialidades
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {especialidades.map((e) => (
              <span
                key={e}
                className="rounded-full border border-cyan-100 bg-white px-4 py-2 text-sm font-medium text-[#164E63]/70 shadow-sm hover:border-[#0891B2] hover:text-[#0891B2] transition-all duration-200 cursor-default"
              >
                {e}
              </span>
            ))}
          </div>
        </section>

        {/* ─── FEATURES ───────────────────────────────────────────────────── */}
        <section id="features" className="bg-white py-20 border-t border-cyan-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {/* Heading */}
            <div className="text-center mb-14">
              <Badge
                variant="outline"
                className="mb-4 bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20 text-xs font-semibold"
              >
                Características
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#164E63]">
                Todo lo que tu clínica necesita
              </h2>
              <p className="mt-4 text-[#164E63]/50 max-w-xl mx-auto text-base">
                Herramientas clínicas y administrativas integradas, diseñadas específicamente para fisioterapeutas en México.
              </p>
            </div>

            {/* Grid 6 cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="border-cyan-100 bg-[#ECFEFF]/40 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group"
                >
                  <CardContent className="p-6">
                    <div
                      className={`${f.bg} h-11 w-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}
                    >
                      <f.icon className="h-5 w-5" style={{ color: f.color }} />
                    </div>
                    <h3 className="text-base font-bold text-[#164E63] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#164E63]/55 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING ────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-20 bg-[#ECFEFF]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {/* Heading */}
            <div className="text-center mb-14">
              <Badge
                variant="outline"
                className="mb-4 bg-[#059669]/10 text-[#059669] border-[#059669]/20 text-xs font-semibold"
              >
                Precios
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#164E63]">
                Planes transparentes, sin sorpresas
              </h2>
              <p className="mt-4 text-[#164E63]/50 max-w-xl mx-auto text-base">
                Paga en MXN. Sin comisiones ocultas. Cambia o cancela cuando quieras.
              </p>
            </div>

            {/* Grid 3 planes */}
            <div className="grid gap-6 sm:grid-cols-3 items-end">
              {planes.map((plan) => (
                <div
                  key={plan.nombre}
                  className={`relative rounded-2xl border p-7 flex flex-col gap-5 transition-all duration-200 ${
                    plan.destacado
                      ? "bg-[#0891B2] border-[#0891B2] text-white scale-105 shadow-2xl shadow-[#0891B2]/30 z-10"
                      : "bg-white border-cyan-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Badge popular */}
                  {plan.destacado && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-[#059669] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                        MÁS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Nombre + precio */}
                  <div>
                    <p
                      className={`text-sm font-bold uppercase tracking-widest mb-1 ${
                        plan.destacado ? "text-white/70" : "text-[#164E63]/50"
                      }`}
                    >
                      {plan.nombre}
                    </p>
                    <div className="flex items-end gap-1">
                      <span
                        className={`text-4xl font-bold ${
                          plan.destacado ? "text-white" : "text-[#164E63]"
                        }`}
                      >
                        {plan.precio}
                      </span>
                      <span
                        className={`text-sm mb-1.5 ${
                          plan.destacado ? "text-white/60" : "text-[#164E63]/40"
                        }`}
                      >
                        {plan.periodo}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        plan.destacado ? "text-white/60" : "text-[#164E63]/50"
                      }`}
                    >
                      {plan.desc}
                    </p>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            plan.destacado ? "text-white/80" : "text-[#059669]"
                          }`}
                        />
                        <span className={plan.destacado ? "text-white/90" : "text-[#164E63]/70"}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href="/login" className="block">
                    <Button
                      className={`w-full cursor-pointer font-semibold transition-all duration-200 ${
                        plan.destacado
                          ? "bg-white text-[#0891B2] hover:bg-white/90"
                          : "bg-[#059669] hover:bg-[#059669]/90 text-white"
                      }`}
                    >
                      {plan.destacado ? "Empezar con Pro" : `Elegir ${plan.nombre}`}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIOS ────────────────────────────────────────────────── */}
        <section className="py-20 bg-white border-t border-cyan-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {/* Heading */}
            <div className="text-center mb-14">
              <Badge
                variant="outline"
                className="mb-4 bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/20 text-xs font-semibold"
              >
                Testimonios
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#164E63]">
                Lo que dicen nuestros usuarios
              </h2>
            </div>

            {/* Cards */}
            <div className="grid gap-5 sm:grid-cols-3">
              {testimonios.map((t) => (
                <Card
                  key={t.nombre}
                  className="border-cyan-100 bg-[#ECFEFF]/40 hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-6 flex flex-col gap-4">
                    {/* Estrellas */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400"
                          fill="#FBBF24"
                          strokeWidth={0}
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-sm italic text-[#164E63]/70 leading-relaxed flex-1">
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-2 border-t border-cyan-100">
                      <div className="h-9 w-9 rounded-full bg-[#0891B2] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">{t.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#164E63]">{t.nombre}</p>
                        <p className="text-xs text-[#164E63]/50">{t.cargo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0891B2] py-20">
          {/* Mesh gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#059669]/20 blur-3xl" />
          </div>

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white/10 mb-6">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Únete a más de 500 clínicas que ya digitalizaron su gestión
            </h2>
            <p className="mt-5 text-white/70 text-lg max-w-xl mx-auto">
              Empieza hoy, sin compromisos. Los primeros 14 días son completamente gratis.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login">
                <Button
                  size="lg"
                  className="cursor-pointer h-12 px-8 bg-white text-[#0891B2] hover:bg-white/90 hover:-translate-y-0.5 font-bold text-base transition-all duration-200 shadow-lg"
                >
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-1.5 text-sm text-white/60">
                <Shield className="h-4 w-4" />
                Sin tarjeta de crédito requerida
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#164E63] py-12" role="contentinfo">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3 mb-10">
            {/* Logo + tagline */}
            <div className="sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 cursor-pointer mb-3">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">FisioAll</span>
              </Link>
              <p className="text-sm text-white/50 leading-relaxed">
                La plataforma SaaS diseñada para fisioterapeutas en México.
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-white/40">
                <Globe className="h-3.5 w-3.5" />
                <span>México · CDMX</span>
              </div>
            </div>

            {/* Producto */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
                Producto
              </p>
              <ul className="space-y-2.5">
                {["Características", "Precios", "Seguridad", "Integraciones"].map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
                Empresa
              </p>
              <ul className="space-y-2.5">
                {["Nosotros", "Blog", "Aviso de Privacidad", "Términos de Uso"].map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40">
              © 2026 FisioAll. Todos los derechos reservados.
            </p>
            <p className="text-xs text-white/30">
              Hecho con dedicación para fisioterapeutas de México
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
