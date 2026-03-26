"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Phone,
  Clock,
  MapPin,
  CalendarDays,
  Star,
  Sparkles,
  Award,
  Heart,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Kaya Kalp real services
// ─────────────────────────────────────────────────────────────────────────────

const serviciosFisio = [
  {
    id: "normal",
    nombre: "Normal / Antiestrés",
    desc: "Terapia manual en tren superior complementada con electroterapia, percusión y presoterapia.",
    precio: "$400",
    duracion: "50 min",
  },
  {
    id: "descarga",
    nombre: "Descarga de Esfuerzo",
    desc: "Enfoque manual en cuerpo completo combinada con aparatología. Elimina fatiga y previene lesiones.",
    precio: "$470",
    duracion: "50 min",
  },
  {
    id: "drenaje",
    nombre: "Drenaje Linfático",
    desc: "Manipulaciones suaves para mejorar circulación y funcionamiento del sistema linfático.",
    precio: "$520",
    duracion: "50 min",
  },
  {
    id: "presoterapia",
    nombre: "Presoterapia",
    desc: "Retorno venoso, drenaje linfático y drenar ácido láctico con aparatología especializada.",
    precio: "$420",
    duracion: "50 min",
  },
  {
    id: "ejercicio",
    nombre: "Ejercicio Terapéutico",
    desc: "Rehabilitación de lesiones deportivas, laborales y post-quirúrgicas personalizada.",
    precio: "$350",
    duracion: "50 min",
  },
  {
    id: "valoracion",
    nombre: "Valoración",
    desc: "Evaluación de lesión, diagnóstico y propuesta de tratamiento. Incluye primera terapia.",
    precio: "$450",
    duracion: "50 min",
  },
  {
    id: "pelvico",
    nombre: "Suelo Pélvico",
    desc: "Tratamiento para incontinencia urinaria, prolapsos, embarazo, previo y post-parto.",
    precio: "$550",
    duracion: "50 min",
  },
];

const serviciosFaciales = [
  {
    nombre: "Masaje Revitalizante",
    desc: "Levanta y tonifica la piel, promueve colágeno, mejora líneas de expresión.",
    precio: "$450",
    duracion: "60 min",
  },
  {
    nombre: "Limpieza Profunda",
    desc: "Elimina impurezas, previene acné, disminuye arrugas. Incluye alta frecuencia.",
    precio: "$450",
    duracion: "60 min",
  },
  {
    nombre: "Hidratación Profunda",
    desc: "Hidrofacial, nutrición, mascarilla, máscara LED. Piel luminosa y suave.",
    precio: "$500",
    duracion: "60 min",
  },
  {
    nombre: "Rejuvenecimiento",
    desc: "Microdermoabrasión, tonificación, efecto lifting, piel más firme.",
    precio: "$550",
    duracion: "60 min",
  },
  {
    nombre: "Gold Threads",
    desc: "Hilos de colágeno que eliminan arrugas, mejoran flacidez, retrasan el envejecimiento.",
    precio: "$800",
    duracion: "60 min",
  },
];

const equipo = [
  {
    nombre: "L.F.T. Paola Ríos Aguilar",
    rol: "CEO · Fisioterapeuta",
    especialidad: "Medios físicos, terapia manual, suelo pélvico y obstetricia",
    initials: "PA",
  },
  {
    nombre: "L.F.T. Jenni Álvarez Álvarez",
    rol: "Fisioterapeuta",
    especialidad: "Ejercicio terapéutico, rehabilitación, coordinación de citas",
    initials: "JA",
  },
  {
    nombre: "Gaby Aguilar",
    rol: "Cosmiatra",
    especialidad: "Tratamientos faciales, corporales y epilación",
    initials: "GA",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#f0f4f7]">
      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-[#f0f4f7]/80 backdrop-blur-xl border-b border-[#c8dce8]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="cursor-pointer">
            <span
              className="text-2xl font-bold text-[#4a7fa5] tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Kaya Kalp
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-12">
            {[
              { href: "#servicios", label: "Servicios" },
              { href: "#equipo", label: "Equipo" },
              { href: "#ubicacion", label: "Ubicación" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#5a7080] hover:text-[#4a7fa5] transition-colors uppercase tracking-[0.2em] cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block">
              <span className="text-sm font-medium text-[#5a7080] hover:text-[#4a7fa5] transition-colors uppercase tracking-[0.15em] cursor-pointer">
                Iniciar Sesión
              </span>
            </Link>
            <Link href="/agendar" className="hidden md:block">
              <button className="cursor-pointer bg-[#4a7fa5] text-white px-8 py-3 rounded-xl font-medium tracking-wide hover:bg-[#2d5f80] transition-all duration-300 active:scale-95 text-sm">
                Agendar Cita
              </button>
            </Link>
            <button
              className="md:hidden text-[#1e2d3a] cursor-pointer p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#f0f4f7] border-t border-[#c8dce8]/60 px-6 py-6 space-y-4"
          >
            {[
              { href: "#servicios", label: "Servicios" },
              { href: "#equipo", label: "Equipo" },
              { href: "#ubicacion", label: "Ubicación" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-[#5a7080] hover:text-[#4a7fa5] uppercase tracking-[0.2em] cursor-pointer"
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#c8dce8]/60">
              <Link href="/login">
                <button className="cursor-pointer w-full py-3 border border-[#c8dce8] rounded-xl text-sm font-medium text-[#5a7080]">
                  Iniciar Sesión
                </button>
              </Link>
              <Link href="/agendar">
                <button className="cursor-pointer w-full py-3 bg-[#4a7fa5] text-white rounded-xl text-sm font-medium">
                  Agendar Cita
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      <main id="main-content" className="pt-32 pb-0">
        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <header className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 mb-6">
                <Award className="h-4 w-4 text-[#4a7fa5]" />
                <span className="text-[#4a7fa5] text-xs tracking-[0.3em] uppercase font-semibold">
                  Certificación CONOCER · SEP
                </span>
              </div>
              <h1
                className="text-6xl md:text-8xl text-[#1e2d3a] leading-[0.9] tracking-tighter"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Dando vida <br />
                <span className="italic font-light text-[#4a7fa5]">a tu cuerpo.</span>
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:pb-4"
            >
              <p className="text-xl text-[#5a7080] font-light max-w-md leading-relaxed">
                Centro de Fisioterapia, Masajes Terapéuticos y Tratamientos Faciales
                en San Juan del Río, Querétaro. Tu bienestar en manos expertas.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/agendar">
                  <button className="cursor-pointer bg-[#4a7fa5] text-white px-10 py-4 rounded-xl font-medium tracking-widest uppercase text-sm hover:bg-[#2d5f80] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-[#4a7fa5]/20">
                    Agendar mi cita
                    <CalendarDays className="w-4 h-4" />
                  </button>
                </Link>
                <a
                  href="#servicios"
                  className="cursor-pointer border border-[#c8dce8] px-10 py-4 rounded-xl font-medium tracking-widest uppercase text-sm text-[#5a7080] hover:border-[#4a7fa5] hover:text-[#4a7fa5] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  Ver servicios
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 flex flex-wrap items-center gap-8 md:gap-16"
          >
            {[
              { icon: Clock, text: "L-V 9am — 8pm" },
              { icon: MapPin, text: "San Juan del Río, Qro." },
              { icon: Shield, text: "Certificadas ante la SEP" },
              { icon: Star, text: "10+ años de experiencia" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-[#4a7fa5]" />
                <span className="text-sm text-[#8fa8ba]">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </header>

        {/* ─── SERVICIOS FISIOTERAPIA ─────────────────────────────────── */}
        <section id="servicios" className="max-w-7xl mx-auto px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-16">
              <span className="text-[#4a7fa5] text-xs tracking-[0.3em] uppercase font-semibold">
                Fisioterapia y Masajes
              </span>
              <h2
                className="text-5xl text-[#1e2d3a] tracking-tight mt-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Tipos de Sesiones
              </h2>
              <div className="h-1 w-20 bg-[#4a7fa5] mt-6" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviciosFisio.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group flex flex-col p-7 rounded-2xl border border-[#c8dce8]/60 bg-white hover:border-[#4a7fa5]/40 hover:shadow-lg transition-all duration-300 cursor-default"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-4 w-4 text-[#4a7fa5] opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8fa8ba] font-semibold">
                    Fisioterapia
                  </span>
                </div>
                <h3 className="font-semibold text-[#1e2d3a] text-lg mb-2">{s.nombre}</h3>
                <p className="text-sm text-[#5a7080] leading-relaxed mb-6 flex-1">{s.desc}</p>
                <div className="flex items-end justify-between pt-4 border-t border-[#c8dce8]/60">
                  <div>
                    <span className="text-2xl font-bold text-[#1e2d3a]">{s.precio}</span>
                    <span className="text-xs text-[#8fa8ba] ml-1">/ sesión</span>
                  </div>
                  <span className="text-xs text-[#8fa8ba] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {s.duracion}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Paquetes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-[#1e2d3a] rounded-2xl p-8 md:p-12"
          >
            <h3
              className="text-3xl text-white mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Paquetes de Tratamiento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { sesiones: "1", freq: "Sesión individual", precio: "$400" },
                { sesiones: "10", freq: "2 terapias/semana", precio: "$3,800" },
                { sesiones: "20", freq: "2 terapias/semana", precio: "$7,200" },
              ].map((p, i) => (
                <div
                  key={p.sesiones}
                  className={`rounded-xl p-6 text-center transition-all duration-300 ${
                    i === 2
                      ? "bg-[#4a7fa5] text-white ring-2 ring-[#4a7fa5]/40 ring-offset-2 ring-offset-[#1e2d3a]"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                >
                  <div className="text-4xl font-bold mb-1">{p.sesiones}</div>
                  <div className="text-sm opacity-70 mb-3">sesiones · {p.freq}</div>
                  <div className="text-2xl font-bold">{p.precio}</div>
                  <div className="text-[10px] opacity-50 mt-1 uppercase tracking-wider">IVA incluido</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── FACIALES ───────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-16">
              <span className="text-[#9b59b6] text-xs tracking-[0.3em] uppercase font-semibold">
                Tratamientos Faciales
              </span>
              <h2
                className="text-5xl text-[#1e2d3a] tracking-tight mt-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Cosmiatra: <span className="italic font-light">Gaby Aguilar</span>
              </h2>
              <div className="h-1 w-20 bg-[#9b59b6] mt-6" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviciosFaciales.map((s, i) => (
              <motion.div
                key={s.nombre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group flex flex-col p-7 rounded-2xl border border-[#c8dce8]/60 bg-white hover:border-[#9b59b6]/40 hover:shadow-lg transition-all duration-300 cursor-default"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-[#9b59b6] opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8fa8ba] font-semibold">
                    Facial
                  </span>
                </div>
                <h3 className="font-semibold text-[#1e2d3a] text-lg mb-2">{s.nombre}</h3>
                <p className="text-sm text-[#5a7080] leading-relaxed mb-6 flex-1">{s.desc}</p>
                <div className="flex items-end justify-between pt-4 border-t border-[#c8dce8]/60">
                  <div>
                    <span className="text-2xl font-bold text-[#1e2d3a]">{s.precio}</span>
                    <span className="text-xs text-[#8fa8ba] ml-1">/ sesión</span>
                  </div>
                  <span className="text-xs text-[#8fa8ba] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {s.duracion}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Corporal + Epilación side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-7 rounded-2xl border border-[#c8dce8]/60 bg-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-[#4a7fa5]" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8fa8ba] font-semibold">Corporal</span>
              </div>
              <h3 className="font-semibold text-[#1e2d3a] text-lg mb-2">Tratamientos Corporales</h3>
              <p className="text-sm text-[#5a7080] leading-relaxed mb-4">
                Celulitis, estrías, piel de naranja y grasa localizada. Cavitador, radiofrecuencia, lipoláser y vacum terapia.
              </p>
              <div className="flex items-end justify-between pt-4 border-t border-[#c8dce8]/60">
                <div>
                  <span className="text-2xl font-bold text-[#1e2d3a]">$600</span>
                  <span className="text-xs text-[#8fa8ba] ml-1">/ sesión</span>
                </div>
                <span className="text-xs text-[#8fa8ba]">60 min</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-7 rounded-2xl border border-[#c8dce8]/60 bg-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-[#e89b3f]" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8fa8ba] font-semibold">Epilación Roll-On</span>
              </div>
              <h3 className="font-semibold text-[#1e2d3a] text-lg mb-2">Depilación</h3>
              <p className="text-sm text-[#5a7080] leading-relaxed mb-4">
                Aplicación suave y precisa, resultados duraderos. Ideal para todo tipo de piel.
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                {[
                  ["Piernas completas", "$400"],
                  ["Media pierna", "$250"],
                  ["Axila", "$200"],
                  ["Bikini", "$250"],
                  ["Bigote", "$150"],
                  ["Barba", "$200"],
                ].map(([zona, precio]) => (
                  <div key={zona} className="flex justify-between">
                    <span className="text-[#5a7080]">{zona}</span>
                    <span className="font-semibold text-[#1e2d3a]">{precio}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── EQUIPO ─────────────────────────────────────────────────── */}
        <section id="equipo" className="max-w-7xl mx-auto px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-16">
              <span className="text-[#4a7fa5] text-xs tracking-[0.3em] uppercase font-semibold">
                Nuestro Equipo
              </span>
              <h2
                className="text-5xl text-[#1e2d3a] tracking-tight mt-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Profesionales <span className="italic font-light">certificadas.</span>
              </h2>
              <div className="h-1 w-20 bg-[#4a7fa5] mt-6" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {equipo.map((e, i) => (
              <motion.div
                key={e.nombre}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl flex flex-col justify-end p-8 ${
                  i === 0
                    ? "bg-[#1e3a4f] text-white h-[420px]"
                    : i === 1
                    ? "bg-[#e4ecf2] text-[#1e2d3a] h-[420px] md:mt-16"
                    : "bg-[#9b59b6]/10 text-[#1e2d3a] h-[420px]"
                }`}
              >
                {/* Decorative initials */}
                <div
                  className={`absolute top-8 right-8 text-[120px] font-bold leading-none opacity-[0.06] pointer-events-none ${
                    i === 0 ? "text-white" : "text-[#1e2d3a]"
                  }`}
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  aria-hidden="true"
                >
                  {e.initials}
                </div>

                <div className="relative z-10">
                  <span
                    className={`text-[10px] uppercase tracking-[0.3em] mb-2 block font-bold ${
                      i === 0 ? "text-[#7ab5d4]" : i === 2 ? "text-[#9b59b6]" : "text-[#4a7fa5]"
                    }`}
                  >
                    {e.rol}
                  </span>
                  <h3
                    className="text-2xl mb-4"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {e.nombre}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed font-light ${
                      i === 0 ? "text-white/70" : "text-[#5a7080]"
                    }`}
                  >
                    {e.especialidad}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── CÓMO FUNCIONA ──────────────────────────────────────────── */}
        <section className="bg-[#1e2d3a] py-24 mb-32">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <span className="text-[#4a7fa5] text-xs tracking-[0.3em] uppercase font-semibold">
                Pasos para agendar
              </span>
              <h2
                className="text-5xl text-white tracking-tight mt-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Agenda en <span className="italic font-light">minutos.</span>
              </h2>
              <div className="h-1 w-20 bg-[#4a7fa5] mt-6" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { num: "01", titulo: "Regístrate", desc: "Crea tu cuenta con tu número de teléfono" },
                { num: "02", titulo: "Elige tu servicio", desc: "Explora nuestro catálogo de terapias y faciales" },
                { num: "03", titulo: "Agenda tu cita", desc: "Escoge fecha, hora y terapeuta" },
                { num: "04", titulo: "Confirma", desc: "Anticipo de $100 y listo — te esperamos" },
              ].map((paso, i) => (
                <motion.div
                  key={paso.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-[#4a7fa5] text-3xl font-bold block mb-4">{paso.num}</span>
                  <h3 className="text-white font-semibold mb-2">{paso.titulo}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{paso.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── POLÍTICAS (FAQ-style) ──────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-12 text-center">
              <span className="text-[#4a7fa5] text-xs tracking-[0.3em] uppercase font-semibold">
                Información importante
              </span>
              <h2
                className="text-4xl text-[#1e2d3a] tracking-tight mt-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Políticas del servicio
              </h2>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: "¿Se requiere anticipo?", a: "Sí, un anticipo de $100 MXN para confirmar tu cita. Se descuenta del costo total de la sesión." },
              { q: "¿Puedo cancelar mi cita?", a: "Sí, con un mínimo de 24 horas de anticipación. De lo contrario se pierde el anticipo." },
              { q: "¿Qué pasa si llego tarde?", a: "No se recuperan minutos perdidos. Te recomendamos llegar puntual para aprovechar tu sesión completa." },
              { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos depósito, transferencia, efectivo y tarjeta de crédito." },
              { q: "¿Qué debo llevar a mi sesión?", a: "Ropa cómoda para tu sesión de fisioterapia. Para faciales no es necesario nada especial." },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="cursor-pointer w-full flex items-center justify-between p-5 rounded-xl bg-white border border-[#c8dce8]/60 text-left hover:border-[#4a7fa5]/40 transition-all duration-200"
                >
                  <span className="font-medium text-[#1e2d3a] text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#8fa8ba] shrink-0 transition-transform duration-200 ${
                      expandedFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-5 pt-2 text-sm text-[#5a7080] leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── UBICACIÓN ──────────────────────────────────────────────── */}
        <section id="ubicacion" className="max-w-7xl mx-auto px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-16">
              <span className="text-[#4a7fa5] text-xs tracking-[0.3em] uppercase font-semibold">
                Encuéntranos
              </span>
              <h2
                className="text-5xl text-[#1e2d3a] tracking-tight mt-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Nuestra clínica
              </h2>
              <div className="h-1 w-20 bg-[#4a7fa5] mt-6" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Map card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative h-[450px] rounded-2xl bg-[#e4ecf2] overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#3fa87c]/15 via-transparent to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 bg-[#4a7fa5] rounded-full animate-ping absolute" />
                <div className="w-5 h-5 bg-[#4a7fa5] rounded-full relative" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-white p-8 rounded-t-2xl shadow-lg">
                <span className="text-[#4a7fa5] text-[10px] uppercase tracking-[0.3em] mb-2 block font-bold">
                  San Juan del Río
                </span>
                <h3
                  className="text-2xl text-[#1e2d3a] mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Kaya Kalp
                </h3>
                <p className="text-sm text-[#5a7080] leading-relaxed mb-4">
                  Ave María No. 25, Fracc. Las Huertas<br />
                  San Juan del Río, Qro.
                </p>
                <a
                  href="https://maps.google.com/?q=Ave+Maria+25+Las+Huertas+San+Juan+del+Rio+Queretaro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer border-b border-[#1e2d3a]/30 pb-1 text-sm tracking-widest uppercase text-[#1e2d3a] hover:border-[#4a7fa5] hover:text-[#4a7fa5] transition-all flex items-center gap-2 w-fit font-medium"
                >
                  Cómo llegar <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col justify-between"
            >
              <div className="space-y-8">
                {[
                  {
                    icon: MapPin,
                    label: "Dirección",
                    value: "Ave María No. 25, Fracc. Las Huertas",
                    sub: "Centro, San Juan del Río, Qro.",
                    color: "text-[#4a7fa5] bg-[#4a7fa5]/10",
                  },
                  {
                    icon: Phone,
                    label: "WhatsApp",
                    value: "427 165 92 04",
                    sub: "Escríbenos para cualquier duda",
                    color: "text-[#4a7fa5] bg-[#4a7fa5]/10",
                  },
                  {
                    icon: Clock,
                    label: "Horario",
                    value: "Lunes a Viernes",
                    sub: "9:00 a.m. — 8:00 p.m.",
                    color: "text-[#e89b3f] bg-[#e89b3f]/10",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8fa8ba] mb-1">{item.label}</p>
                      <p className="font-semibold text-[#1e2d3a]">{item.value}</p>
                      <p className="text-sm text-[#5a7080]">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-10">
                <a
                  href="https://www.instagram.com/kaya_kalp21/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex-1 border border-[#c8dce8] rounded-xl px-5 py-4 text-center text-sm font-medium text-[#5a7080] hover:border-[#4a7fa5] hover:text-[#4a7fa5] transition-all"
                >
                  Instagram
                </a>
                <a
                  href="https://wa.me/524271659204"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex-1 bg-[#25d366] rounded-xl px-5 py-4 text-center text-sm font-medium text-white hover:bg-[#1da851] transition-all"
                >
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── CTA FINAL ──────────────────────────────────────────────── */}
        <section className="bg-[#1e2d3a] py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2
                className="text-5xl md:text-7xl text-white leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Tu bienestar <br />
                <span className="italic font-light text-[#7ab5d4]">comienza hoy.</span>
              </h2>
              <p className="mt-8 text-white/50 text-lg max-w-lg mx-auto font-light leading-relaxed">
                Agenda tu primera cita y experimenta la diferencia de un cuidado profesional y personalizado.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/agendar">
                  <button className="cursor-pointer bg-[#4a7fa5] text-white px-12 py-5 rounded-xl font-medium tracking-widest uppercase text-sm hover:bg-white hover:text-[#1e2d3a] transition-all duration-300 flex items-center gap-3 active:scale-95 shadow-xl">
                    Agendar mi cita
                    <CalendarDays className="w-4 h-4" />
                  </button>
                </Link>
              </div>
              <p className="mt-8 text-[10px] text-white/30 uppercase tracking-[0.2em] leading-relaxed font-medium">
                Anticipo de $100 MXN · Cancelación 24h antes<br />
                Aviso de privacidad · Art. 15 y 16 LFPDPPP
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="bg-[#1e3a4f] pt-24 pb-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="md:col-span-1">
              <span
                className="text-2xl text-white block mb-4 font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Kaya Kalp
              </span>
              <p
                className="text-2xl text-white/60 leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Dando vida <br /> a tu cuerpo.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-2">
              <div className="space-y-6">
                <span className="text-[10px] tracking-widest uppercase text-white/30 font-bold">
                  Servicios
                </span>
                <div className="flex flex-col gap-3">
                  {["Fisioterapia", "Masajes", "Faciales", "Corporales", "Epilación"].map(
                    (link) => (
                      <span
                        key={link}
                        className="text-white/50 text-sm tracking-wide"
                      >
                        {link}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-[10px] tracking-widest uppercase text-white/30 font-bold">
                  Redes
                </span>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Instagram", href: "https://www.instagram.com/kaya_kalp21/" },
                    { label: "WhatsApp", href: "https://wa.me/524271659204" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7ab5d4] hover:text-white text-sm tracking-wide uppercase transition-all cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:text-right space-y-6">
              <span className="text-[10px] tracking-widest uppercase text-white/30 font-bold block">
                Contacto
              </span>
              <div>
                <p className="text-lg text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  427 165 92 04
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
                  Disponible L-V 9:00 — 20:00
                </p>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] tracking-widest uppercase text-white/30 font-bold">
              © 2026 Kaya Kalp. Todos los derechos reservados.
            </p>
            <div className="flex gap-8">
              {["Aviso de privacidad", "Términos"].map((item) => (
                <span
                  key={item}
                  className="text-[10px] tracking-widest uppercase text-white/30 font-bold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
