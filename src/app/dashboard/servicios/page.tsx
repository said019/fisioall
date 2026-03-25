"use client";

import { useState } from "react";
import {
  Sparkles,
  Search,
  Plus,
  Clock,
  DollarSign,
  CheckCircle2,
  Star,
  Tag,
  Filter,
  Package,
  Heart,
  Zap,
  Scissors,
  Eye,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type CategoriaServicio = "fisioterapia" | "facial" | "masaje" | "corporal" | "epilacion";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaServicio;
  duracion: string;
  precio: number;
  precioDescuento?: number;
  sesiones?: number;
  popular?: boolean;
  activo: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIA_CONFIG: Record<CategoriaServicio, { label: string; icon: typeof Heart; color: string; bg: string; border: string; accent: string }> = {
  fisioterapia: { label: "Fisioterapia",           icon: Zap,      color: "text-[#4a7fa5]", bg: "bg-[#4a7fa5]/10", border: "border-[#4a7fa5]/30", accent: "#4a7fa5" },
  facial:       { label: "Faciales",               icon: Star,     color: "text-[#9b59b6]", bg: "bg-[#9b59b6]/10", border: "border-[#9b59b6]/30", accent: "#9b59b6" },
  masaje:       { label: "Masaje y Drenaje",       icon: Heart,    color: "text-[#3fa87c]", bg: "bg-[#3fa87c]/10", border: "border-[#3fa87c]/30", accent: "#3fa87c" },
  corporal:     { label: "Tratamientos Corporales", icon: Sparkles, color: "text-[#e89b3f]", bg: "bg-[#e89b3f]/10", border: "border-[#e89b3f]/30", accent: "#e89b3f" },
  epilacion:    { label: "Epilación",              icon: Scissors, color: "text-[#d9534f]", bg: "bg-[#d9534f]/10", border: "border-[#d9534f]/30", accent: "#d9534f" },
};

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO DE SERVICIOS (datos reales de Kaya Kalp)
// ─────────────────────────────────────────────────────────────────────────────
const servicios: Servicio[] = [
  // ── FISIOTERAPIA ──
  { id: "f1", nombre: "Valoración Fisioterapéutica", descripcion: "Evaluación integral inicial con diagnóstico funcional y plan de tratamiento", categoria: "fisioterapia", duracion: "60 min", precio: 700, activo: true },
  { id: "f2", nombre: "Sesión de Fisioterapia", descripcion: "Terapia individualizada según diagnóstico: manual, electroterapia, ejercicio terapéutico", categoria: "fisioterapia", duracion: "45 min", precio: 500, popular: true, activo: true },
  { id: "f3", nombre: "Fisioterapia de Suelo Pélvico", descripcion: "Especializada en disfunciones del suelo pélvico, incontinencia, fortalecimiento", categoria: "fisioterapia", duracion: "50 min", precio: 600, activo: true },
  { id: "f4", nombre: "Rehabilitación Deportiva", descripcion: "Recuperación de lesiones deportivas con técnicas avanzadas", categoria: "fisioterapia", duracion: "50 min", precio: 550, activo: true },
  { id: "f5", nombre: "Terapia Manual Ortopédica", descripcion: "Movilización articular, técnicas miofasciales, puntos gatillo", categoria: "fisioterapia", duracion: "45 min", precio: 550, activo: true },
  { id: "f6", nombre: "Electroterapia", descripcion: "TENS, ultrasonido, laser terapéutico, corrientes interferenciales", categoria: "fisioterapia", duracion: "30 min", precio: 350, activo: true },
  { id: "f7", nombre: "Vendaje Neuromuscular (Kinesiotape)", descripcion: "Aplicación de vendaje funcional para soporte y alivio de dolor", categoria: "fisioterapia", duracion: "20 min", precio: 250, activo: true },
  // Paquetes Fisio
  { id: "fp1", nombre: "Paquete 10 Sesiones Fisio", descripcion: "10 sesiones de fisioterapia con descuento. Vigencia 6 meses", categoria: "fisioterapia", duracion: "45 min c/u", precio: 5000, precioDescuento: 4500, sesiones: 10, activo: true },
  { id: "fp2", nombre: "Paquete 20 Sesiones Fisio", descripcion: "20 sesiones de fisioterapia, máximo ahorro. Vigencia 6 meses", categoria: "fisioterapia", duracion: "45 min c/u", precio: 10000, precioDescuento: 8000, sesiones: 20, popular: true, activo: true },

  // ── FACIALES ──
  { id: "fc1", nombre: "Limpieza Facial Profunda", descripcion: "Extracción, vapor, mascarilla purificante y hidratación", categoria: "facial", duracion: "60 min", precio: 550, popular: true, activo: true },
  { id: "fc2", nombre: "Facial Hidratante", descripcion: "Hidratación profunda con ácido hialurónico y colágeno", categoria: "facial", duracion: "50 min", precio: 600, activo: true },
  { id: "fc3", nombre: "Facial Anti-Edad", descripcion: "Tratamiento rejuvenecedor con vitamina C, retinol y péptidos", categoria: "facial", duracion: "60 min", precio: 750, activo: true },
  { id: "fc4", nombre: "Dermaplaning", descripcion: "Exfoliación física con bisturí especial para rostro luminoso", categoria: "facial", duracion: "40 min", precio: 500, activo: true },
  { id: "fc5", nombre: "Facial con Radiofrecuencia", descripcion: "Reafirmante facial con tecnología de radiofrecuencia", categoria: "facial", duracion: "50 min", precio: 700, activo: true },
  { id: "fc6", nombre: "Peeling Químico", descripcion: "Renovación celular con ácidos (glicólico, mandélico, salicílico)", categoria: "facial", duracion: "45 min", precio: 650, activo: true },

  // ── MASAJE Y DRENAJE ──
  { id: "m1", nombre: "Masaje Relajante", descripcion: "Masaje de cuerpo completo con aceites esenciales aromáticos", categoria: "masaje", duracion: "60 min", precio: 500, popular: true, activo: true },
  { id: "m2", nombre: "Masaje Descontracturante", descripcion: "Enfocado en puntos de tensión, nudos musculares y contracturas", categoria: "masaje", duracion: "50 min", precio: 550, activo: true },
  { id: "m3", nombre: "Masaje con Piedras Calientes", descripcion: "Terapia con piedras de basalto calientes para relajación profunda", categoria: "masaje", duracion: "70 min", precio: 650, activo: true },
  { id: "m4", nombre: "Drenaje Linfático Manual", descripcion: "Técnica Vodder para reducir retención de líquidos y desintoxicar", categoria: "masaje", duracion: "60 min", precio: 600, activo: true },
  { id: "m5", nombre: "Masaje Prenatal", descripcion: "Especial para embarazadas, alivio de molestias y relajación", categoria: "masaje", duracion: "50 min", precio: 550, activo: true },
  { id: "m6", nombre: "Reflexología Podal", descripcion: "Masaje de puntos reflejos en los pies para bienestar general", categoria: "masaje", duracion: "40 min", precio: 400, activo: true },

  // ── CORPORALES ──
  { id: "c1", nombre: "Maderoterapia Corporal", descripcion: "Modelación corporal con rodillos de madera, reduce celulitis", categoria: "corporal", duracion: "50 min", precio: 550, popular: true, activo: true },
  { id: "c2", nombre: "Radiofrecuencia Corporal", descripcion: "Reafirmante con calor profundo para flacidez y celulitis", categoria: "corporal", duracion: "45 min", precio: 600, activo: true },
  { id: "c3", nombre: "Vendas Frías", descripcion: "Envolvimiento corporal reductivo con activos lipolíticos", categoria: "corporal", duracion: "60 min", precio: 500, activo: true },
  { id: "c4", nombre: "Exfoliación Corporal", descripcion: "Renovación de piel con exfoliante de sales o café", categoria: "corporal", duracion: "40 min", precio: 400, activo: true },
  { id: "c5", nombre: "Ultracavitación", descripcion: "Ultrasonido focalizado para reducción de grasa localizada", categoria: "corporal", duracion: "45 min", precio: 650, activo: true },

  // ── EPILACIÓN ──
  { id: "e1", nombre: "Epilación Axilas", descripcion: "Depilación con cera o luz pulsada – zona axilar", categoria: "epilacion", duracion: "15 min", precio: 150, activo: true },
  { id: "e2", nombre: "Epilación Piernas Completas", descripcion: "Depilación piernas completas con cera caliente/tibia", categoria: "epilacion", duracion: "45 min", precio: 400, popular: true, activo: true },
  { id: "e3", nombre: "Epilación Bikini", descripcion: "Depilación zona bikini tradicional o brasileña", categoria: "epilacion", duracion: "20 min", precio: 250, activo: true },
  { id: "e4", nombre: "Epilación Facial (Bozo/Cejas)", descripcion: "Depilación con hilo o cera en bozo, cejas o patillas", categoria: "epilacion", duracion: "15 min", precio: 120, activo: true },
  { id: "e5", nombre: "Epilación Brazos", descripcion: "Depilación de brazos completos con cera", categoria: "epilacion", duracion: "30 min", precio: 300, activo: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// SERVICIO CARD
// ─────────────────────────────────────────────────────────────────────────────
function ServicioCard({ servicio, onView }: { servicio: Servicio; onView: () => void }) {
  const catCfg = CATEGORIA_CONFIG[servicio.categoria];
  const esPaquete = !!servicio.sesiones;

  return (
    <Card
      className={`border-[#c8dce8] bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden ${
        servicio.popular ? "ring-1 ring-[#e89b3f]/30" : ""
      }`}
      onClick={onView}
    >
      {/* Top accent line */}
      <div className="h-1" style={{ backgroundColor: catCfg.accent }} />

      <CardContent className="p-5">
        {/* Top badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {servicio.popular && (
              <Badge className="bg-[#e89b3f]/15 text-[#e89b3f] border-[#e89b3f]/30 text-[10px]" variant="outline">
                <Star className="h-3 w-3 mr-1 fill-current" /> Popular
              </Badge>
            )}
            {esPaquete && (
              <Badge className={`${catCfg.bg} ${catCfg.color} ${catCfg.border} text-[10px]`} variant="outline">
                <Package className="h-3 w-3 mr-1" /> {servicio.sesiones} sesiones
              </Badge>
            )}
          </div>
          <div className={`h-9 w-9 rounded-xl ${catCfg.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
            <catCfg.icon className={`h-4 w-4 ${catCfg.color}`} />
          </div>
        </div>

        {/* Title + description */}
        <h3 className="text-sm font-semibold text-[#1e2d3a] mb-1 group-hover:text-[#4a7fa5] transition-colors">
          {servicio.nombre}
        </h3>
        <p className="text-[11px] text-[#5a7080] leading-relaxed line-clamp-2 mb-4">
          {servicio.descripcion}
        </p>

        {/* Duration + Price */}
        <div className="flex items-end justify-between pt-3 border-t border-[#c8dce8]/50">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#8fa8ba]" />
            <span className="text-xs text-[#8fa8ba] font-medium">{servicio.duracion}</span>
          </div>
          <div className="text-right">
            {servicio.precioDescuento ? (
              <>
                <span className="text-[10px] text-[#8fa8ba] line-through mr-1.5">
                  ${servicio.precio.toLocaleString("es-MX")}
                </span>
                <span className="text-lg font-bold text-[#3fa87c]">
                  ${servicio.precioDescuento.toLocaleString("es-MX")}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-[#1e2d3a]">
                ${servicio.precio.toLocaleString("es-MX")}
              </span>
            )}
            <p className="text-[10px] text-[#8fa8ba]">MXN</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ServiciosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [modalDetalle, setModalDetalle] = useState<Servicio | null>(null);
  const [tabActiva, setTabActiva] = useState<string>("fisioterapia");

  const categorias = Object.entries(CATEGORIA_CONFIG);

  // Filtrado por búsqueda
  const serviciosFiltrados = servicios.filter((s) =>
    s.activo && (
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  // Servicios por categoría activa
  const serviciosTab = busqueda
    ? serviciosFiltrados
    : serviciosFiltrados.filter((s) => s.categoria === tabActiva);

  // KPIs
  const totalServicios = servicios.filter((s) => s.activo).length;
  const totalCategorias = Object.keys(CATEGORIA_CONFIG).length;
  const precioPromedio = Math.round(
    servicios.filter((s) => s.activo && !s.sesiones).reduce((sum, s) => sum + s.precio, 0) /
    servicios.filter((s) => s.activo && !s.sesiones).length
  );
  const paquetesDisponibles = servicios.filter((s) => s.sesiones).length;

  return (
    <div className="space-y-6">
      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Servicios Activos", valor: totalServicios.toString(), icon: Sparkles, color: "text-[#4a7fa5]", bg: "bg-[#e4ecf2]", sub: `${totalCategorias} categorías` },
          { label: "Precio Promedio", valor: `$${precioPromedio}`, icon: DollarSign, color: "text-[#3fa87c]", bg: "bg-emerald-50", sub: "Por sesión individual" },
          { label: "Paquetes", valor: paquetesDisponibles.toString(), icon: Package, color: "text-[#9b59b6]", bg: "bg-purple-50", sub: "Con descuento especial" },
          { label: "Más Popular", valor: "Fisio", icon: Star, color: "text-[#e89b3f]", bg: "bg-amber-50", sub: "Sesión de Fisioterapia" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-[#c8dce8] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1e2d3a]/50 uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-2xl font-bold text-[#1e2d3a] mt-1">{kpi.valor}</p>
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

      {/* ── SEARCH ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e2d3a]/40" />
          <Input
            placeholder="Buscar servicio por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 border-[#a8cfe0] focus:border-[#4a7fa5] h-10"
          />
        </div>
        <Button className="cursor-pointer bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white text-sm shadow-sm shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo Servicio
        </Button>
      </div>

      {/* ── TABS POR CATEGORÍA ── */}
      {!busqueda ? (
        <Tabs value={tabActiva} onValueChange={setTabActiva}>
          <TabsList className="bg-[#e4ecf2] border border-[#c8dce8] h-11 p-1 gap-1 flex-wrap">
            {categorias.map(([key, cfg]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="cursor-pointer text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5 px-3"
              >
                <cfg.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{cfg.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categorias.map(([key, cfg]) => (
            <TabsContent key={key} value={key} className="mt-5">
              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#1e2d3a]">{cfg.label}</h2>
                  <p className="text-xs text-[#8fa8ba]">
                    {servicios.filter((s) => s.categoria === key && s.activo).length} servicios disponibles
                  </p>
                </div>
              </div>

              {/* Services grid */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {servicios
                  .filter((s) => s.categoria === key && s.activo)
                  .map((servicio) => (
                    <ServicioCard
                      key={servicio.id}
                      servicio={servicio}
                      onView={() => setModalDetalle(servicio)}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        /* Search results (no tabs) */
        <div>
          <p className="text-sm text-[#5a7080] mb-4">
            {serviciosTab.length} resultado{serviciosTab.length !== 1 ? "s" : ""} para &ldquo;{busqueda}&rdquo;
          </p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {serviciosTab.map((servicio) => (
              <ServicioCard
                key={servicio.id}
                servicio={servicio}
                onView={() => setModalDetalle(servicio)}
              />
            ))}
          </div>
          {serviciosTab.length === 0 && (
            <Card className="border-[#c8dce8] shadow-sm">
              <CardContent className="py-16 text-center">
                <Search className="h-12 w-12 text-[#1e2d3a]/15 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#1e2d3a]/40">No se encontraron servicios</p>
                <p className="text-xs text-[#1e2d3a]/30 mt-1">Intenta con otro término de búsqueda</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── MODAL: DETALLE SERVICIO ── */}
      <Dialog open={!!modalDetalle} onOpenChange={() => setModalDetalle(null)}>
        <DialogContent className="max-w-md">
          {modalDetalle && (() => {
            const catCfg = CATEGORIA_CONFIG[modalDetalle.categoria];
            const esPaquete = !!modalDetalle.sesiones;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-[#1e2d3a] flex items-center gap-2">
                    <catCfg.icon className={`h-5 w-5 ${catCfg.color}`} />
                    Detalle del Servicio
                  </DialogTitle>
                </DialogHeader>

                {/* Header card */}
                <div className="bg-gradient-to-r from-[#f0f4f7] to-white rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-[10px] ${catCfg.color} ${catCfg.bg} ${catCfg.border}`}>
                          {catCfg.label}
                        </Badge>
                        {modalDetalle.popular && (
                          <Badge className="bg-[#e89b3f]/15 text-[#e89b3f] border-[#e89b3f]/30 text-[10px]" variant="outline">
                            <Star className="h-3 w-3 mr-1 fill-current" /> Popular
                          </Badge>
                        )}
                        {esPaquete && (
                          <Badge className="bg-[#4a7fa5]/10 text-[#4a7fa5] border-[#4a7fa5]/30 text-[10px]" variant="outline">
                            <Package className="h-3 w-3 mr-1" /> Paquete
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-[#1e2d3a]">{modalDetalle.nombre}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-[#5a7080] leading-relaxed">{modalDetalle.descripcion}</p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f0f4f7] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="h-3.5 w-3.5 text-[#8fa8ba]" />
                      <span className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wide">Duración</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e2d3a]">{modalDetalle.duracion}</p>
                  </div>
                  <div className="bg-[#f0f4f7] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-[#8fa8ba]" />
                      <span className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wide">Precio</span>
                    </div>
                    {modalDetalle.precioDescuento ? (
                      <div>
                        <span className="text-[11px] text-[#8fa8ba] line-through mr-1">
                          ${modalDetalle.precio.toLocaleString("es-MX")}
                        </span>
                        <span className="text-sm font-bold text-[#3fa87c]">
                          ${modalDetalle.precioDescuento.toLocaleString("es-MX")}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-[#1e2d3a]">
                        ${modalDetalle.precio.toLocaleString("es-MX")} MXN
                      </p>
                    )}
                  </div>
                  {esPaquete && (
                    <>
                      <div className="bg-[#f0f4f7] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Package className="h-3.5 w-3.5 text-[#8fa8ba]" />
                          <span className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wide">Sesiones</span>
                        </div>
                        <p className="text-sm font-semibold text-[#1e2d3a]">{modalDetalle.sesiones}</p>
                      </div>
                      <div className="bg-[#f0f4f7] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Tag className="h-3.5 w-3.5 text-[#8fa8ba]" />
                          <span className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wide">Por sesión</span>
                        </div>
                        <p className="text-sm font-semibold text-[#3fa87c]">
                          ${Math.round((modalDetalle.precioDescuento || modalDetalle.precio) / modalDetalle.sesiones!).toLocaleString("es-MX")}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Savings callout for packages */}
                {esPaquete && modalDetalle.precioDescuento && (
                  <div className="flex items-center gap-2 bg-[#3fa87c]/10 border border-[#3fa87c]/20 rounded-xl p-3">
                    <CheckCircle2 className="h-4 w-4 text-[#3fa87c] shrink-0" />
                    <p className="text-xs font-medium text-[#3fa87c]">
                      Ahorras ${(modalDetalle.precio - modalDetalle.precioDescuento).toLocaleString("es-MX")} MXN ({Math.round(((modalDetalle.precio - modalDetalle.precioDescuento) / modalDetalle.precio) * 100)}% descuento)
                    </p>
                  </div>
                )}

                <DialogFooter className="gap-2 mt-2">
                  <Button variant="outline" onClick={() => setModalDetalle(null)} className="cursor-pointer">
                    Cerrar
                  </Button>
                  <Button className="cursor-pointer bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Agendar Cita
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
