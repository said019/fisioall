import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Star,
  Shield,
  Heart,
  Sparkles,
  Users,
  Award,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Extracted from Kaya Kalp PDFs
// ─────────────────────────────────────────────────────────────────────────────

const serviciosFisio = [
  {
    nombre: "Normal / Antiestrés",
    desc: "Terapia manual en tren superior (espalda, hombros, cuello y brazos) complementada con electroterapia, percusión y presoterapia.",
    precio: "$400",
    duracion: "50 min",
  },
  {
    nombre: "Descarga de Esfuerzo",
    desc: "Enfoque manual en cuerpo completo combinada con aparatología. Elimina fatiga, cansancio y previene lesiones.",
    precio: "$470",
    duracion: "50 min",
  },
  {
    nombre: "Drenaje Linfático",
    desc: "Manipulaciones suaves para mejorar la circulación y el funcionamiento del sistema linfático. Cuerpo completo.",
    precio: "$520",
    duracion: "50 min",
  },
  {
    nombre: "Presoterapia",
    desc: "Aparato para retorno venoso, drenaje linfático y drenar ácido láctico. Extremidades y zona abdomino-lumbar.",
    precio: "$420",
    duracion: "50 min",
  },
  {
    nombre: "Ejercicio Terapéutico",
    desc: "Rehabilitación de lesiones deportivas, laborales y post-quirúrgicas con rutina personalizada.",
    precio: "$350",
    duracion: "50 min",
  },
  {
    nombre: "Valoración",
    desc: "Evaluación de lesión, diagnóstico acertado y propuesta de tratamiento. Incluye tu primera terapia.",
    precio: "$450",
    duracion: "50 min",
  },
  {
    nombre: "Suelo Pélvico",
    desc: "Tratamiento especializado para incontinencia urinaria, prolapsos, embarazo, previo y post-parto.",
    precio: "$550",
    duracion: "50 min",
  },
];

const serviciosFaciales = [
  {
    nombre: "Masaje Revitalizante",
    desc: "Reduce estrés, levanta y tonifica la piel, promueve colágeno, mejora líneas de expresión.",
    precio: "$450",
    duracion: "60 min",
    incluye: ["Limpieza básica", "Masaje"],
    regalo: null,
  },
  {
    nombre: "Limpieza Básica",
    desc: "Elimina células muertas, quita exceso de grasa, oxigena tu piel, reduce poros.",
    precio: "$350",
    duracion: "60 min",
    incluye: ["Limpieza", "Exfoliación", "Tonificación", "Mascarilla", "Protección"],
    regalo: "Exfoliación de manos",
  },
  {
    nombre: "Limpieza Profunda",
    desc: "Elimina impurezas, previene acné, mejora la absorción de productos, disminuye arrugas.",
    precio: "$450",
    duracion: "60 min",
    incluye: ["Limpieza", "Exfoliación", "Vaporización", "Extracción", "Alta frecuencia", "Protección"],
    regalo: "Masaje facial relajante",
  },
  {
    nombre: "Hidratación Profunda",
    desc: "Limpia poros, mejor oxigenación, tonifica músculos faciales, piel luminosa y suave.",
    precio: "$500",
    duracion: "60 min",
    incluye: ["Hidrofacial", "Nutrición", "Mascarilla", "Máscara LED", "Protección"],
    regalo: "Masaje facial + 20% desc",
  },
  {
    nombre: "Rejuvenecimiento Facial",
    desc: "Reducción de arrugas y manchas, reactivación de colágeno, efecto lifting, piel más firme.",
    precio: "$550",
    duracion: "60 min",
    incluye: ["Microdermoabrasión", "Nutrición", "Tonificación", "Hidroplástica", "Protección"],
    regalo: "Exfoliación de manos",
  },
  {
    nombre: "Gold Threads",
    desc: "Hilos de colágeno que eliminan arrugas, mejoran flacidez, retrasan el envejecimiento.",
    precio: "$800",
    duracion: "60 min",
    incluye: ["Aplicación de hilos", "Mascarilla Hidroplástica", "Tónico Gold", "Drenaje linfático"],
    regalo: "Exfoliación de manos",
  },
];

const paquetes = [
  { sesiones: "10", frecuencia: "2 terapias/semana", precio: "$3,800" },
  { sesiones: "20", frecuencia: "2 terapias/semana", precio: "$7,200" },
];

const equipo = [
  {
    nombre: "L.F.T. Paola Ríos Aguilar",
    rol: "CEO · Fisioterapeuta",
    especialidad: "Medios físicos, terapia manual, suelo pélvico y obstetricia",
    initials: "PA",
    color: "bg-[#4a7fa5]",
  },
  {
    nombre: "L.F.T. Jenni Álvarez Álvarez",
    rol: "Fisioterapeuta",
    especialidad: "Ejercicio terapéutico, rehabilitación, coordinación de citas",
    initials: "JA",
    color: "bg-[#3fa87c]",
  },
  {
    nombre: "Gaby Aguilar",
    rol: "Cosmiatra",
    especialidad: "Tratamientos faciales y corporales",
    initials: "GA",
    color: "bg-[#9b59b6]",
  },
];

const politicas = [
  "Anticipo de $100 MXN para confirmar tu cita",
  "Cancelación mínimo 24 horas antes",
  "Puntualidad — no se recuperan minutos perdidos",
  "Ropa cómoda para tu sesión",
  "Aviso de privacidad conforme a la Ley Federal",
];

const pasos = [
  { num: "1", titulo: "Regístrate", desc: "Crea tu cuenta con tu número de teléfono" },
  { num: "2", titulo: "Elige tu servicio", desc: "Explora nuestro catálogo y selecciona" },
  { num: "3", titulo: "Agenda tu cita", desc: "Escoge fecha, hora y terapeuta" },
  { num: "4", titulo: "Confirma", desc: "Realiza tu anticipo de $100 y listo" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#f0f4f7] font-sans">
      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 w-full border-b border-[#c8dce8] bg-white/80 backdrop-blur-md"
        role="banner"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 cursor-pointer shrink-0">
            <span
              className="text-2xl font-semibold text-[#4a7fa5]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Kaya Kalp
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Navegación principal">
            {[
              { href: "#servicios", label: "Servicios" },
              { href: "#faciales", label: "Faciales" },
              { href: "#equipo", label: "Equipo" },
              { href: "#como-agendar", label: "Cómo agendar" },
              { href: "#ubicacion", label: "Ubicación" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-[#5a7080] hover:text-[#2d5f80] hover:bg-[#e4ecf2] rounded-lg transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                className="hidden sm:flex cursor-pointer text-[#5a7080] hover:bg-[#e4ecf2] hover:text-[#2d5f80] transition-all duration-200 text-sm"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/agendar">
              <Button className="cursor-pointer bg-[#4a7fa5] hover:bg-[#2d5f80] text-white transition-all duration-200 text-sm shadow-sm">
                Agendar Cita
                <CalendarDays className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* ─── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
          {/* Background blobs */}
          <div
            className="absolute -top-24 -left-24 h-[480px] w-[480px] rounded-full bg-[#4a7fa5]/12 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-16 -right-16 h-[400px] w-[400px] rounded-full bg-[#7ab5d4]/10 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-1/3 right-1/4 h-[200px] w-[200px] rounded-full bg-[#a8cfe0]/15 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c8dce8] bg-white px-4 py-1.5 mb-8 shadow-sm">
              <Award className="h-3.5 w-3.5 text-[#4a7fa5]" />
              <span className="text-xs font-semibold text-[#2d5f80]">
                Certificación CONOCER ante la SEP
              </span>
            </div>

            {/* Brand name */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold text-[#4a7fa5] leading-tight tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Kaya Kalp
            </h1>

            {/* Tagline */}
            <p className="mt-3 text-lg sm:text-xl text-[#8fa8ba] italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Dando vida a tu cuerpo
            </p>

            {/* Description */}
            <p className="mt-8 max-w-2xl mx-auto text-lg leading-relaxed text-[#5a7080]">
              Centro de Fisioterapia, Masajes Terapéuticos y Tratamientos Faciales
              en San Juan del Río, Querétaro. Agenda tu cita en línea y accede a tu expediente clínico, historial de sesiones y tarjeta de lealtad.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/agendar">
                <Button
                  size="lg"
                  className="cursor-pointer h-12 px-8 bg-[#4a7fa5] hover:bg-[#2d5f80] hover:-translate-y-0.5 text-white font-semibold text-base shadow-lg shadow-[#4a7fa5]/25 transition-all duration-200"
                >
                  Agendar mi cita
                  <CalendarDays className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#servicios">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer h-12 px-8 border-[#c8dce8] text-[#4a7fa5] hover:bg-[#e4ecf2] hover:-translate-y-0.5 font-semibold text-base transition-all duration-200"
                >
                  Ver servicios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Trust */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              {[
                "L-V 9:00am — 8:00pm",
                "Certificadas ante la SEP",
                "San Juan del Río, Qro.",
              ].map((txt) => (
                <div key={txt} className="flex items-center gap-1.5 text-sm text-[#8fa8ba]">
                  <CheckCircle2 className="h-4 w-4 text-[#3fa87c] shrink-0" />
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── STATS ──────────────────────────────────────────────────────── */}
        <div className="border-t border-b border-[#c8dce8] bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x-0 sm:divide-x divide-[#e4ecf2]">
              {[
                { icon: Users, valor: "3", label: "Especialistas" },
                { icon: Heart, valor: "7+", label: "Tipos de sesión" },
                { icon: Sparkles, valor: "6", label: "Tratamientos faciales" },
                { icon: Star, valor: "10+", label: "Años de experiencia" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center text-center gap-1">
                  <s.icon className="h-5 w-5 text-[#4a7fa5] mb-1" />
                  <span className="text-3xl font-bold text-[#2d5f80]">{s.valor}</span>
                  <span className="text-sm text-[#8fa8ba]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── CÓMO AGENDAR ───────────────────────────────────────────────── */}
        <section id="como-agendar" className="py-20 bg-[#f0f4f7]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-[#4a7fa5] mb-3">
                Pasos para agendar
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1e2d3a]">
                Agenda tu cita en minutos
              </h2>
              <p className="mt-4 text-[#5a7080] max-w-xl mx-auto text-base">
                Sin llamadas, sin esperas. Regístrate y agenda directamente desde tu celular.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pasos.map((p) => (
                <div
                  key={p.num}
                  className="relative bg-white rounded-2xl p-6 border border-[#c8dce8] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-full bg-[#4a7fa5] text-white flex items-center justify-center font-bold text-lg mb-4">
                    {p.num}
                  </div>
                  <h3 className="font-bold text-[#1e2d3a] text-base mb-2">{p.titulo}</h3>
                  <p className="text-sm text-[#5a7080] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SERVICIOS FISIOTERAPIA ─────────────────────────────────────── */}
        <section id="servicios" className="py-20 bg-white border-t border-[#c8dce8]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-[#4a7fa5] mb-3">
                Fisioterapia y Masajes
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1e2d3a]">
                Tipos de Sesiones
              </h2>
              <p className="mt-4 text-[#5a7080] max-w-xl mx-auto text-base">
                Todas nuestras sesiones tienen una duración de ~50 minutos. Precios con IVA incluido.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {serviciosFisio.map((s) => (
                <Card
                  key={s.nombre}
                  className="border-[#c8dce8] bg-[#f0f4f7]/40 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-[#4a7fa5]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a7fa5]">
                        Fisioterapia
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#1e2d3a] mb-2">{s.nombre}</h3>
                    <p className="text-sm text-[#5a7080] leading-relaxed mb-4">{s.desc}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-bold text-[#2d5f80]">{s.precio}</span>
                        <span className="text-xs text-[#8fa8ba] ml-1">/ sesión</span>
                      </div>
                      <span className="text-xs text-[#8fa8ba] flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {s.duracion}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paquetes */}
            <div className="mt-12">
              <h3 className="text-center text-lg font-bold text-[#1e2d3a] mb-6">
                Paquetes de Tratamiento de Lesiones
              </h3>
              <div className="grid gap-5 sm:grid-cols-3 max-w-3xl mx-auto">
                {paquetes.map((p) => (
                  <div
                    key={p.sesiones}
                    className="bg-gradient-to-br from-[#2d5f80] to-[#4a7fa5] rounded-2xl p-6 text-white text-center shadow-lg"
                  >
                    <div className="text-4xl font-bold mb-1">{p.sesiones}</div>
                    <div className="text-sm opacity-80 mb-3">sesiones · {p.frecuencia}</div>
                    <div className="text-2xl font-bold">{p.precio}</div>
                    <div className="text-xs opacity-60 mt-1">IVA incluido · 1 solo pago</div>
                  </div>
                ))}
                <div className="bg-white rounded-2xl p-6 text-center border-2 border-[#4a7fa5] shadow-sm">
                  <div className="text-4xl font-bold text-[#4a7fa5] mb-1">1</div>
                  <div className="text-sm text-[#5a7080] mb-3">sesión individual</div>
                  <div className="text-2xl font-bold text-[#2d5f80]">$400</div>
                  <div className="text-xs text-[#8fa8ba] mt-1">IVA incluido</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FACIALES ───────────────────────────────────────────────────── */}
        <section id="faciales" className="py-20 bg-[#f0f4f7] border-t border-[#c8dce8]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9b59b6] mb-3">
                Tratamientos Faciales
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1e2d3a]">
                Cosmiatra: Gaby Aguilar
              </h2>
              <p className="mt-4 text-[#5a7080] max-w-xl mx-auto text-base">
                Sesiones de 60 minutos con productos profesionales. Cada tratamiento incluye un regalo especial.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {serviciosFaciales.map((s) => (
                <Card
                  key={s.nombre}
                  className="border-[#c8dce8] bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-[#9b59b6]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9b59b6]">
                        Facial
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#1e2d3a] mb-2">{s.nombre}</h3>
                    <p className="text-sm text-[#5a7080] leading-relaxed mb-3">{s.desc}</p>

                    {/* Incluye */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {s.incluye.map((item) => (
                        <span
                          key={item}
                          className="bg-[#e4ecf2] border border-[#c8dce8] rounded px-2 py-0.5 text-[10px] text-[#5a7080]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-bold text-[#2d5f80]">{s.precio}</span>
                        <span className="text-xs text-[#8fa8ba] ml-1">/ sesión</span>
                      </div>
                      <span className="text-xs text-[#8fa8ba] flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {s.duracion}
                      </span>
                    </div>

                    {s.regalo && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-[#3fa87c] font-medium bg-[#3fa87c]/10 rounded-lg px-3 py-1.5">
                        <Sparkles className="h-3 w-3" />
                        Regalo: {s.regalo}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Corporales y Epilación */}
            <div className="mt-12 grid gap-5 sm:grid-cols-2 max-w-3xl mx-auto">
              <Card className="border-[#c8dce8] bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-[#3fa87c]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#3fa87c]">
                      Corporal
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1e2d3a] mb-2">Tratamientos Corporales</h3>
                  <p className="text-sm text-[#5a7080] leading-relaxed mb-3">
                    Tratamiento no invasivo para celulitis, estrías, piel de naranja y grasa localizada.
                    Cavitador, radiofrecuencia, lipoláser y vacum terapia.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {["Piernas", "Abdomen", "Brazos", "Espalda"].map((z) => (
                      <span key={z} className="bg-[#e4ecf2] border border-[#c8dce8] rounded px-2 py-0.5 text-[10px] text-[#5a7080]">
                        {z}
                      </span>
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-[#2d5f80]">$600</span>
                  <span className="text-xs text-[#8fa8ba] ml-1">/ sesión</span>
                </CardContent>
              </Card>

              <Card className="border-[#c8dce8] bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-[#e89b3f]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#e89b3f]">
                      Epilación
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1e2d3a] mb-2">Epilación Roll-On</h3>
                  <p className="text-sm text-[#5a7080] leading-relaxed mb-3">
                    Aplicación suave y precisa, cero dolorosa, resultados duraderos. Ideal para todo tipo de piel.
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#5a7080]">
                    {[
                      ["Media pierna inf.", "$250"],
                      ["Media pierna sup.", "$300"],
                      ["Piernas completas", "$400"],
                      ["Axila", "$200"],
                      ["Bigote", "$150"],
                      ["Barbilla", "$150"],
                      ["Barba completa", "$200"],
                      ["Área de bikini", "$250"],
                    ].map(([zona, precio]) => (
                      <div key={zona} className="flex justify-between">
                        <span>{zona}</span>
                        <span className="font-semibold text-[#2d5f80]">{precio}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ─── EQUIPO ─────────────────────────────────────────────────────── */}
        <section id="equipo" className="py-20 bg-white border-t border-[#c8dce8]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-[#4a7fa5] mb-3">
                Nuestro equipo
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1e2d3a]">
                Profesionales certificadas
              </h2>
              <p className="mt-4 text-[#5a7080] max-w-xl mx-auto text-base">
                El equipo crece, nos alegra poderte brindar un mejor servicio con las más profesionales.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
              {equipo.map((e) => (
                <div
                  key={e.nombre}
                  className="text-center bg-[#f0f4f7] rounded-2xl p-6 border border-[#c8dce8] hover:shadow-md transition-all duration-200"
                >
                  <div
                    className={`h-16 w-16 rounded-full ${e.color} flex items-center justify-center text-white text-xl font-bold mx-auto mb-4`}
                  >
                    {e.initials}
                  </div>
                  <h3 className="font-bold text-[#1e2d3a] text-base">{e.nombre}</h3>
                  <p className="text-sm text-[#4a7fa5] font-medium mt-1">{e.rol}</p>
                  <p className="text-xs text-[#8fa8ba] mt-2 leading-relaxed">{e.especialidad}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── POLÍTICAS ──────────────────────────────────────────────────── */}
        <section className="py-16 bg-[#f0f4f7] border-t border-[#c8dce8]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h3 className="text-center text-lg font-bold text-[#1e2d3a] mb-8">
              Políticas de Nuestros Servicios
            </h3>
            <div className="space-y-3">
              {politicas.map((p, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#c8dce8]"
                >
                  <div className="h-6 w-6 rounded-full bg-[#4a7fa5]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#4a7fa5]">{i + 1}</span>
                  </div>
                  <p className="text-sm text-[#5a7080]">{p}</p>
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <div className="mt-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8fa8ba] mb-4">
                Métodos de pago aceptados
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Depósito", "Transferencia", "Efectivo", "Tarjeta de crédito"].map((m) => (
                  <span
                    key={m}
                    className="bg-white border border-[#c8dce8] rounded-lg px-4 py-2 text-sm text-[#5a7080] font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── UBICACIÓN ──────────────────────────────────────────────────── */}
        <section id="ubicacion" className="py-20 bg-white border-t border-[#c8dce8]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-[#4a7fa5] mb-3">
                Encuéntranos
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1e2d3a]">Ubicación</h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 items-center">
              {/* Map placeholder */}
              <div className="bg-[#e4ecf2] rounded-2xl h-[300px] flex items-center justify-center border border-[#c8dce8]">
                <div className="text-center">
                  <MapPin className="h-10 w-10 text-[#4a7fa5] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#2d5f80]">Ave María No. 25</p>
                  <p className="text-xs text-[#8fa8ba]">Fracc. Las Huertas, Centro</p>
                  <p className="text-xs text-[#8fa8ba]">San Juan del Río, Qro.</p>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-[#1e2d3a] text-lg mb-4">Datos de contacto</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#4a7fa5]/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-[#4a7fa5]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1e2d3a]">
                          Ave María No. 25, Fracc. Las Huertas
                        </p>
                        <p className="text-xs text-[#8fa8ba]">
                          San Juan del Río, Qro. · Entrada sobre calle Ayuntamiento
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#3fa87c]/10 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-[#3fa87c]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1e2d3a]">427 165 92 04</p>
                        <p className="text-xs text-[#8fa8ba]">WhatsApp</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#e89b3f]/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-[#e89b3f]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1e2d3a]">Lunes a Viernes</p>
                        <p className="text-xs text-[#8fa8ba]">9:00 a.m. a 8:00 p.m.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div className="flex gap-3">
                  <span className="bg-[#e4ecf2] border border-[#c8dce8] rounded-lg px-4 py-2 text-sm text-[#5a7080]">
                    Facebook: Kaya Kalp
                  </span>
                  <span className="bg-[#e4ecf2] border border-[#c8dce8] rounded-lg px-4 py-2 text-sm text-[#5a7080]">
                    Instagram: @kaya_kalp21
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#1e3a4f] py-20">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-[#4a7fa5]/15 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#7ab5d4]/10 blur-3xl" />
          </div>

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2
              className="text-4xl sm:text-5xl font-semibold text-[#a8cfe0] leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Kaya Kalp
            </h2>
            <p
              className="mt-2 text-lg text-[#7ab5d4] italic"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Dando vida a tu cuerpo
            </p>
            <p className="mt-6 text-white/60 text-base max-w-xl mx-auto">
              Agenda tu primera cita hoy. Tu bienestar es nuestra prioridad.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/agendar">
                <Button
                  size="lg"
                  className="cursor-pointer h-12 px-8 bg-[#4a7fa5] text-white hover:bg-[#6b9dbf] hover:-translate-y-0.5 font-bold text-base transition-all duration-200 shadow-lg"
                >
                  Agendar mi cita
                  <CalendarDays className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-1.5 text-sm text-white/40">
                <Shield className="h-4 w-4" />
                Aviso de privacidad · Art. 15 y 16 LFPDPPP
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#1e3a4f] py-12 border-t border-white/5" role="contentinfo">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3 mb-10">
            <div>
              <span
                className="text-2xl font-semibold text-[#a8cfe0]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Kaya Kalp
              </span>
              <p className="text-xs text-white/30 mt-1 italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Dando vida a tu cuerpo
              </p>
              <p className="text-sm text-white/40 mt-3 leading-relaxed">
                Centro de Fisioterapia, Masajes y Tratamientos Faciales.
                Certificación CONOCER ante la SEP.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
                Servicios
              </p>
              <ul className="space-y-2">
                {["Fisioterapia", "Masajes Terapéuticos", "Tratamientos Faciales", "Corporales", "Epilación Roll-On"].map(
                  (l) => (
                    <li key={l}>
                      <span className="text-sm text-white/50">{l}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
                Contacto
              </p>
              <ul className="space-y-2">
                <li className="text-sm text-white/50">WhatsApp: 427 165 92 04</li>
                <li className="text-sm text-white/50">Ave María No. 25, Fracc. Las Huertas</li>
                <li className="text-sm text-white/50">San Juan del Río, Qro.</li>
                <li className="text-sm text-white/50">L-V 9:00am — 8:00pm</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30">
              © 2026 Kaya Kalp. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <span className="text-xs text-white/30">Facebook: Kaya Kalp</span>
              <span className="text-xs text-white/30">Instagram: @kaya_kalp21</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
