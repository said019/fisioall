import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kaya Kalp | Fisioterapia & Bienestar · San Juan del Río",
  description:
    "Consultorio de fisioterapia, masajes terapéuticos y tratamientos faciales en San Juan del Río, Qro. Agenda tu cita hoy.",
  keywords: [
    "fisioterapia",
    "masajes terapéuticos",
    "suelo pélvico",
    "tratamientos faciales",
    "San Juan del Río",
    "Querétaro",
    "Kaya Kalp",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BRAND TOKENS
// ─────────────────────────────────────────────────────────────────────────────
// Kaya Kalp = "cuerpo en calma" (sánscrito)
// Palette: cream bg, deep navy, warm gold, cyan accent, sage green

// ─────────────────────────────────────────────────────────────────────────────
// DATA — extraído de los PDFs oficiales
// ─────────────────────────────────────────────────────────────────────────────
const equipo = [
  {
    nombre: "L.F.T. Paola Ríos Aguilar",
    rol: "CEO & Fundadora",
    especialidad: "Disfunciones de Suelo Pélvico · Medios Físicos · Terapia Manual",
    inicial: "PR",
    color: "#1A5276",
  },
  {
    nombre: "L.F.T. Jenni Álvarez",
    rol: "Terapeuta",
    especialidad: "Ejercicio Terapéutico · Rehabilitación · Lesiones",
    inicial: "JA",
    color: "#0891B2",
  },
  {
    nombre: "Gaby Aguilar",
    rol: "Cosmiatra · Cert. SEP",
    especialidad: "Tratamientos Faciales · Corporales · Epilación",
    inicial: "GA",
    color: "#C9A96E",
  },
];

const sesiones = [
  {
    nombre: "Normal / Antistrés",
    precio: "$400",
    duracion: "50 min",
    desc: "Terapia manual enfocada en espalda, hombros, cuello y brazos. Complementada con electroterapia, percusión y presoterapia.",
    tag: "Fisioterapia",
    tagColor: "#0891B2",
  },
  {
    nombre: "Descarga",
    precio: "$470",
    duracion: "50 min",
    desc: "Cuerpo completo. Elimina fatiga, cansancio muscular y previene lesiones. Base de terapia manual con aparatología.",
    tag: "Fisioterapia",
    tagColor: "#0891B2",
  },
  {
    nombre: "Drenaje Linfático",
    precio: "$520",
    duracion: "50 min",
    desc: "Manipulaciones suaves para mejorar la circulación y el sistema linfático. Se realiza de cuerpo completo.",
    tag: "Fisioterapia",
    tagColor: "#0891B2",
  },
  {
    nombre: "Presoterapia",
    precio: "$420",
    duracion: "50 min",
    desc: "Aparato ideal para retorno venoso, drenaje linfático y alivio de ácido láctico. Cuerpo completo por zonas.",
    tag: "Fisioterapia",
    tagColor: "#0891B2",
  },
  {
    nombre: "Ejercicio Terapéutico",
    precio: "$350",
    duracion: "50 min",
    desc: "Rutina personalizada para lesiones deportivas, de trabajo o post-quirúrgicas. Seguimiento y prescripción en casa.",
    tag: "Rehabilitación",
    tagColor: "#059669",
  },
  {
    nombre: "Valoración",
    precio: "$450",
    duracion: "50 min",
    desc: "Diagnóstico preciso de tu lesión + primera terapia incluida + propuesta de tratamiento personalizado.",
    tag: "Fisioterapia",
    tagColor: "#0891B2",
  },
  {
    nombre: "Suelo Pélvico",
    precio: "$550",
    duracion: "50 min",
    desc: "Incontinencia urinaria, prolapsos, embarazo y post-parto. Tratamiento especializado con valoración previa.",
    tag: "Especializado",
    tagColor: "#7C3AED",
  },
];

const faciales = [
  {
    nombre: "Masaje Facial Revitalizante",
    precio: "$450",
    desc: "Reduce el estrés, levanta y tonifica la piel, promueve el colágeno y mejora líneas de expresión.",
    incluye: "Limpieza básica + Masaje",
    regalo: null,
  },
  {
    nombre: "Limpieza Facial Básica",
    precio: "$350",
    desc: "Elimina células muertas, exceso de grasa e impurezas. Oxigena tu piel y reduce el tamaño de los poros.",
    incluye: "Limpieza · Exfoliación · Tonificación · Mascarilla · Protección",
    regalo: "Exfoliación de manos",
  },
  {
    nombre: "Limpieza Facial Profunda",
    precio: "$450",
    desc: "Previene brotes de acné, mejora la apariencia y permite mejor absorción de productos.",
    incluye: "Limpieza · Exfoliación · Vaporización · Extracción · Alta frecuencia",
    regalo: "Masaje facial relajante",
  },
  {
    nombre: "Hidratación Profunda",
    precio: "$500",
    desc: "Limpia poros, activa la circulación, tonifica los músculos faciales. Piel luminosa y suave.",
    incluye: "Hidrofacial · Nutrición · Mascarilla LED · Protección",
    regalo: "Masaje facial + 20% dto. próxima sesión",
  },
  {
    nombre: "Rejuvenecimiento Facial",
    precio: "$550",
    desc: "Reducción de arrugas y manchas, reactivación de colágeno, efecto lifting. Piel más firme y luminosa.",
    incluye: "Microdermoabrasión · Limpieza · Hidroplástica · Nutrición · Protección",
    regalo: "Exfoliación de manos",
  },
  {
    nombre: "Gold Threads · Hilos de Colágeno",
    precio: "$800",
    desc: "Elimina arrugas, mejora la flacidez, disminuye líneas de expresión. Paquete 10 sesiones $7,200.",
    incluye: "Limpieza profunda · Aplicación de hilos · Mascarilla · Hidroplástica · Tónico Gold",
    regalo: "Exfoliación de manos + Crema de salida",
  },
];

const corporales = [
  {
    nombre: "Tratamiento Corporal",
    precio: "$600",
    desc: "No invasivo. Disuelve grasa localizada con cavitador, radiofrecuencia, lipolaser y vacumterapia. Primera sesión incluye valoración personalizada.",
    zonas: ["Piernas", "Abdomen", "Brazos", "Espalda"],
  },
  {
    nombre: "Epilación Roll-On",
    precio: "Desde $150",
    desc: "Método con rodillo de cera tibia. Sin dolor, resultados duraderos, ideal para todo tipo de piel.",
    zonas: ["Axila $150", "Bigote $150", "Barbilla $200", "Área bikini $250", "Barba $250", "Media pierna inf. $200", "Media pierna sup. $300", "Piernas completas $400"],
  },
];

const paquetes = [
  {
    nombre: "Paquete 10 sesiones",
    precio: "$3,800",
    ahorro: "Ahorras $200",
    por: "1 solo pago",
    detail: "2 terapias por semana",
  },
  {
    nombre: "Paquete 20 sesiones",
    precio: "$7,200",
    ahorro: "Ahorras $800",
    por: "1 solo pago",
    detail: "2 terapias por semana",
  },
];

const pasos = [
  { num: "01", titulo: "Elige tu sesión", desc: "Selecciona el tipo de sesión que necesitas de nuestro catálogo." },
  { num: "02", titulo: "Realiza el anticipo", desc: "Transfiere $200 (o 50% para paquetes) para confirmar tu cita vía WhatsApp." },
  { num: "03", titulo: "Confirma por WhatsApp", desc: "Un día antes recibes recordatorio. Cancela con 24 h de anticipación para no perder tu anticipo." },
  { num: "04", titulo: "¡Llega puntual!", desc: "Porta ropa cómoda, llega puntual. Las sesiones son de 50 minutos, no se recuperan tiempos perdidos." },
];

// ─────────────────────────────────────────────────────────────────────────────
// ICONS (inline SVG para no necesitar dependencias extra)
// ─────────────────────────────────────────────────────────────────────────────
function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="#F59E0B" stroke="none" className="w-4 h-4">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconGift() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function KayaKalpLanding() {
  return (
    <div
      className="flex flex-col min-h-[100dvh] font-sans"
      style={{ background: "#FAF7F2", color: "#1C1C1C" }}
    >
      {/* ─── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(255,253,249,0.92)",
          backdropFilter: "blur(12px)",
          borderColor: "#E8DDD0",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
          {/* Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
              style={{ background: "linear-gradient(135deg, #1A5276, #0891B2)" }}
            >
              KK
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-wide" style={{ color: "#1A5276" }}>
                KAYA KALP
              </span>
              <span className="text-[9px] tracking-[0.15em] uppercase" style={{ color: "#C9A96E" }}>
                cuerpo en calma
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {[
              ["#servicios", "Servicios"],
              ["#faciales", "Faciales"],
              ["#equipo", "Equipo"],
              ["#agendar", "Cómo agendar"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-[#1A5276]/8"
                style={{ color: "#1A5276" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://wa.me/521XXXXXXXXXX?text=Hola,%20quisiera%20agendar%20una%20cita"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "#25D366" }}
            >
              <IconWhatsApp />
              <span className="hidden sm:inline">Agendar por WhatsApp</span>
              <span className="sm:hidden">Agendar</span>
            </a>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ─── HERO ─────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden pt-24 pb-28 md:pt-32 md:pb-36"
          style={{ background: "linear-gradient(160deg, #FAF7F2 0%, #EFF6FF 60%, #FAF7F2 100%)" }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(26,82,118,0.08) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)" }}
          />

          <div className="relative max-w-5xl mx-auto px-5 text-center">
            {/* Pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold border shadow-sm"
              style={{
                background: "rgba(201,169,110,0.12)",
                borderColor: "rgba(201,169,110,0.35)",
                color: "#8B6914",
              }}
            >
              <IconLeaf />
              San Juan del Río, Querétaro · L–V 9:00 a.m.–8:00 p.m.
            </div>

            {/* H1 */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight"
              style={{ color: "#1A5276" }}
            >
              Tu bienestar empieza{" "}
              <span
                className="relative"
                style={{ color: "#C9A96E" }}
              >
                aquí
                <svg
                  viewBox="0 0 100 12"
                  className="absolute -bottom-2 left-0 w-full"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8 Q25 2 50 8 Q75 14 98 8"
                    stroke="#C9A96E"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.6"
                  />
                </svg>
              </span>
            </h1>

            <p
              className="mt-8 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed"
              style={{ color: "#4A5568" }}
            >
              Fisioterapia, masajes terapéuticos, tratamientos faciales y corporales.
              Profesionales certificadas comprometidas con tu salud y bienestar.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#agendar"
                className="flex items-center gap-2 h-12 px-8 rounded-full font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl text-base"
                style={{ background: "linear-gradient(135deg, #1A5276, #0891B2)", boxShadow: "0 8px 24px rgba(8,145,178,0.35)" }}
              >
                Ver cómo agendar
              </a>
              <a
                href="#servicios"
                className="flex items-center gap-2 h-12 px-8 rounded-full font-semibold text-sm border-2 transition-all hover:-translate-y-0.5"
                style={{ borderColor: "#1A5276", color: "#1A5276" }}
              >
                Explorar servicios
              </a>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { val: "3", lbl: "Especialistas" },
                { val: "7", lbl: "Tipos de sesión" },
                { val: "50 min", lbl: "Por sesión" },
              ].map((s) => (
                <div key={s.lbl} className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold" style={{ color: "#1A5276" }}>{s.val}</span>
                  <span className="text-xs" style={{ color: "#718096" }}>{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── QUIÉNES SOMOS ────────────────────────────────────────────────── */}
        <section
          className="py-16 border-t border-b"
          style={{ background: "linear-gradient(135deg, #1A5276, #0C3E5C)", borderColor: "#1A5276" }}
        >
          <div className="max-w-5xl mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "#C9A96E" }}>
                  Quiénes somos
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
                  Kaya Kalp significa{" "}
                  <em className="not-italic" style={{ color: "#C9A96E" }}>
                    "cuerpo en calma"
                  </em>
                </h2>
                <p className="text-white/70 leading-relaxed text-base">
                  Nos dedicamos a cuidar tu salud y bienestar. Queremos que trates y prevengas
                  cualquier tipo de lesión y que conviertas tu salud en tu prioridad más grande.
                  Un equipo de profesionales certificadas, comprometidas contigo desde el primer día.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🫁", titulo: "Terapia Manual", desc: "Técnicas especializadas para aliviar dolor y recuperar movimiento." },
                  { icon: "🌿", titulo: "Bienestar Integral", desc: "Cuidado del cuerpo, mente y piel en un solo lugar." },
                  { icon: "📋", titulo: "Seguimiento Real", desc: "Expediente clínico y ficha de evolución en cada sesión." },
                  { icon: "🏅", titulo: "Cert. SEP", desc: "Profesionales certificadas con formación de calidad." },
                ].map((item) => (
                  <div
                    key={item.titulo}
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <p className="text-sm font-semibold text-white mb-1">{item.titulo}</p>
                    <p className="text-xs text-white/55 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SERVICIOS FISIOTERAPIA ───────────────────────────────────────── */}
        <section id="servicios" className="py-20" style={{ background: "#FAF7F2" }}>
          <div className="max-w-6xl mx-auto px-5">
            {/* Heading */}
            <div className="text-center mb-14">
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(8,145,178,0.1)", color: "#0891B2" }}
              >
                Fisioterapia & Masajes
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#1A5276" }}>
                Tipos de sesión
              </h2>
              <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "#718096" }}>
                Todas las sesiones incluyen IVA. Duración aproximada 50 minutos.
              </p>
            </div>

            {/* Cards grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sesiones.map((s) => (
                <div
                  key={s.nombre}
                  className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "#FFFFFF", border: "1px solid #EDE3D8" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: `${s.tagColor}15`, color: s.tagColor }}
                    >
                      {s.tag}
                    </span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>
                      {s.duracion}
                    </span>
                  </div>
                  <h3 className="font-bold text-base leading-tight" style={{ color: "#1A5276" }}>
                    {s.nombre}
                  </h3>
                  <p className="text-xs leading-relaxed flex-1" style={{ color: "#6B7280" }}>
                    {s.desc}
                  </p>
                  <div
                    className="pt-3 mt-auto border-t flex items-center justify-between"
                    style={{ borderColor: "#F0E8DE" }}
                  >
                    <span className="text-xl font-bold" style={{ color: "#1A5276" }}>
                      {s.precio}
                    </span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>
                      IVA incl.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Paquetes */}
            <div className="mt-12">
              <h3
                className="text-center text-xl font-bold mb-6"
                style={{ color: "#1A5276" }}
              >
                Paquetes de tratamiento
              </h3>
              <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                {paquetes.map((p) => (
                  <div
                    key={p.nombre}
                    className="rounded-2xl p-6 text-white relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1A5276, #0891B2)" }}
                  >
                    <div
                      className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-15"
                      style={{ background: "white" }}
                    />
                    <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                      {p.nombre}
                    </p>
                    <p className="text-4xl font-bold mb-1">{p.precio}</p>
                    <p className="text-sm text-white/70 mb-3">{p.detail}</p>
                    <div
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: "rgba(201,169,110,0.25)", color: "#FFD080" }}
                    >
                      ✦ {p.ahorro} · {p.por}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FACIALES ─────────────────────────────────────────────────────── */}
        <section
          id="faciales"
          className="py-20 border-t"
          style={{ background: "#FFFDF8", borderColor: "#EDE3D8" }}
        >
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-14">
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(201,169,110,0.15)", color: "#8B6914" }}
              >
                Por Gaby Aguilar · Cosmiatra Cert. SEP
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#1A5276" }}>
                Tratamientos Faciales
              </h2>
              <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "#718096" }}>
                Cada sesión de 60 minutos. Con historial clínico facial y carta responsiva.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {faciales.map((f) => (
                <div
                  key={f.nombre}
                  className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "#FFFFFF", border: "1px solid #EDE3D8" }}
                >
                  <div>
                    <h3 className="font-bold text-base mb-1.5" style={{ color: "#1A5276" }}>
                      {f.nombre}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                      {f.desc}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#9CA3AF" }}>
                      Incluye
                    </p>
                    <p className="text-xs" style={{ color: "#4A5568" }}>{f.incluye}</p>
                  </div>

                  {f.regalo && (
                    <div
                      className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl font-medium"
                      style={{
                        background: "rgba(201,169,110,0.12)",
                        color: "#7A5C14",
                        border: "1px dashed rgba(201,169,110,0.45)",
                      }}
                    >
                      <IconGift />
                      Regalo: {f.regalo}
                    </div>
                  )}

                  <div
                    className="pt-3 mt-auto border-t flex items-center justify-between"
                    style={{ borderColor: "#F0E8DE" }}
                  >
                    <span className="text-xl font-bold" style={{ color: "#C9A96E" }}>
                      {f.precio}
                    </span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>
                      60 min
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Corporales */}
            <div className="mt-14">
              <h3
                className="text-center text-xl font-bold mb-8"
                style={{ color: "#1A5276" }}
              >
                Tratamientos Corporales
              </h3>
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {corporales.map((c) => (
                  <div
                    key={c.nombre}
                    className="rounded-2xl p-6"
                    style={{ background: "#FFFFFF", border: "1px solid #EDE3D8" }}
                  >
                    <h4 className="font-bold text-base mb-2" style={{ color: "#1A5276" }}>
                      {c.nombre}
                    </h4>
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: "#6B7280" }}>
                      {c.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {c.zonas.map((z) => (
                        <span
                          key={z}
                          className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                          style={{ background: "#F5ECD7", color: "#7A5C14" }}
                        >
                          {z}
                        </span>
                      ))}
                    </div>
                    <p className="text-xl font-bold" style={{ color: "#C9A96E" }}>
                      {c.precio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── EQUIPO ───────────────────────────────────────────────────────── */}
        <section
          id="equipo"
          className="py-20 border-t"
          style={{ background: "#FAF7F2", borderColor: "#EDE3D8" }}
        >
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-14">
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(26,82,118,0.1)", color: "#1A5276" }}
              >
                Nuestro equipo
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#1A5276" }}>
                Profesionales comprometidas
              </h2>
              <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "#718096" }}>
                Cada terapeuta con certificación y especialización en su área.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {equipo.map((e) => (
                <div
                  key={e.nombre}
                  className="rounded-2xl p-7 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "#FFFFFF", border: "1px solid #EDE3D8" }}
                >
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${e.color}, ${e.color}AA)` }}
                  >
                    {e.inicial}
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: "#1A5276" }}>
                    {e.nombre}
                  </h3>
                  <p
                    className="text-xs font-semibold mb-3"
                    style={{ color: "#C9A96E" }}
                  >
                    {e.rol}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                    {e.especialidad}
                  </p>
                  <div className="flex justify-center gap-0.5 mt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <IconStar key={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CÓMO AGENDAR ─────────────────────────────────────────────────── */}
        <section
          id="agendar"
          className="py-20 border-t"
          style={{
            background: "linear-gradient(160deg, #1A5276 0%, #0C3E5C 100%)",
            borderColor: "#1A5276",
          }}
        >
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-14">
              <span
                className="inline-block text-xs font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(201,169,110,0.2)", color: "#FFD080" }}
              >
                Proceso de agendado
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                ¿Cómo agendar tu cita?
              </h2>
              <p className="mt-3 text-base max-w-xl mx-auto text-white/60">
                Sencillo y rápido. Confirmamos por WhatsApp.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
              {pasos.map((p, i) => (
                <div
                  key={p.num}
                  className="rounded-2xl p-5 relative"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <span
                    className="text-4xl font-black mb-3 block"
                    style={{ color: "rgba(201,169,110,0.35)" }}
                  >
                    {p.num}
                  </span>
                  <h3 className="font-bold text-white text-sm mb-2">{p.titulo}</h3>
                  <p className="text-xs text-white/55 leading-relaxed">{p.desc}</p>
                  {i < pasos.length - 1 && (
                    <div
                      className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-white/20 text-lg"
                    >
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Métodos de pago + BBVA */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <h3 className="font-bold text-white text-sm mb-4">Métodos de pago</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Depósito", "Transferencia", "Efectivo", "Tarjeta"].map((m) => (
                    <div
                      key={m}
                      className="flex items-center gap-2 text-xs text-white/70 font-medium"
                    >
                      <div
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#C9A96E" }}
                      />
                      {m}
                    </div>
                  ))}
                </div>
                <div
                  className="mt-5 rounded-xl p-4"
                  style={{ background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.25)" }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Datos BBVA · Paola Ríos Aguilar</p>
                  <p className="text-lg font-mono font-bold tracking-widest" style={{ color: "#FFD080" }}>
                    4152 3145 1397 1146
                  </p>
                  <p className="text-xs text-white/40 mt-1">Anticipo $200 · Paquetes 50%</p>
                </div>
              </div>

              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <h3 className="font-bold text-white text-sm mb-4">Políticas importantes</h3>
                <ul className="space-y-2.5">
                  {[
                    "Presentar INE vigente",
                    "Ropa cómoda para la zona a tratar",
                    "Llegada puntual — no se recuperan minutos",
                    "Cancelación 24 h antes (o pierdes anticipo)",
                    "Carta responsiva + aviso de privacidad",
                    "Facturación disponible con previo aviso",
                  ].map((pol) => (
                    <li key={pol} className="flex items-start gap-2 text-xs text-white/65">
                      <IconShield />
                      <span>{pol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA WhatsApp */}
            <div className="text-center">
              <a
                href="https://wa.me/521XXXXXXXXXX?text=Hola,%20me%20gustaría%20agendar%20una%20cita%20en%20Kaya%20Kalp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 h-14 px-10 rounded-full font-bold text-white text-base shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                style={{ background: "#25D366", boxShadow: "0 10px 30px rgba(37,211,102,0.4)" }}
              >
                <IconWhatsApp />
                Agendar mi cita ahora
              </a>
              <p className="mt-3 text-xs text-white/40">
                Horario: Lunes a Viernes · 9:00 a.m. – 8:00 p.m.
              </p>
            </div>
          </div>
        </section>

        {/* ─── UBICACIÓN ────────────────────────────────────────────────────── */}
        <section
          className="py-16 border-t"
          style={{ background: "#FAF7F2", borderColor: "#EDE3D8" }}
        >
          <div className="max-w-4xl mx-auto px-5">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div>
                <span
                  className="inline-block text-xs font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-4"
                  style={{ background: "rgba(26,82,118,0.1)", color: "#1A5276" }}
                >
                  Encuéntranos
                </span>
                <h2 className="text-2xl font-bold mb-5" style={{ color: "#1A5276" }}>
                  Nuestra ubicación
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(8,145,178,0.12)", color: "#0891B2" }}
                    >
                      <IconMapPin />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5" style={{ color: "#1A5276" }}>
                        Dirección
                      </p>
                      <p className="text-sm" style={{ color: "#6B7280" }}>
                        Av. María No. 25, Fracc. Las Huertas
                        <br />
                        San Juan del Río, Querétaro
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                        Entrada sobre la calle Ayuntamiento, a la altura del Fracc. Tabachines
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(8,145,178,0.12)", color: "#0891B2" }}
                    >
                      <IconClock />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5" style={{ color: "#1A5276" }}>
                        Horario de atención
                      </p>
                      <p className="text-sm" style={{ color: "#6B7280" }}>
                        Lunes a Viernes
                      </p>
                      <p className="text-lg font-bold" style={{ color: "#0891B2" }}>
                        9:00 a.m. – 8:00 p.m.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div
                className="rounded-2xl overflow-hidden relative h-64 sm:h-72 flex items-center justify-center"
                style={{ background: "#E8DDD0", border: "1px solid #D4C4B0" }}
              >
                <div className="text-center">
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3 text-white"
                    style={{ background: "#0891B2" }}
                  >
                    <IconMapPin />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: "#1A5276" }}>
                    Av. María No. 25
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#718096" }}>
                    Fracc. Las Huertas · San Juan del Río
                  </p>
                  <a
                    href="https://maps.google.com/?q=Av.+María+25+Las+Huertas+San+Juan+del+Río+Querétaro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 rounded-full text-white"
                    style={{ background: "#0891B2" }}
                  >
                    <IconMapPin />
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="py-10 border-t"
        style={{ background: "#1A5276", borderColor: "#0C3E5C" }}
      >
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                KK
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-wide text-white">KAYA KALP</span>
                <span className="text-[9px] tracking-[0.15em] uppercase" style={{ color: "#C9A96E" }}>
                  cuerpo en calma
                </span>
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <IconMapPin />
                Av. María No. 25, Las Huertas, SJR
              </span>
              <span className="flex items-center gap-2">
                <IconClock />
                L–V · 9:00–20:00
              </span>
            </div>
          </div>

          <div
            className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <p className="text-xs text-white/30">
              © 2025 Kaya Kalp · Todos los derechos reservados
            </p>
            <p className="text-xs text-white/20">
              Powered by FisioAll
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
