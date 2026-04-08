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
  Package,
  Heart,
  Zap,
  Scissors,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  corporal:     { label: "Corporales",             icon: Sparkles, color: "text-[#e89b3f]", bg: "bg-[#e89b3f]/10", border: "border-[#e89b3f]/30", accent: "#e89b3f" },
  epilacion:    { label: "Epilación",              icon: Scissors, color: "text-[#d9534f]", bg: "bg-[#d9534f]/10", border: "border-[#d9534f]/30", accent: "#d9534f" },
};

const DURACIONES = ["15 min", "20 min", "30 min", "40 min", "45 min", "50 min", "60 min", "70 min", "90 min"];

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO (datos reales de Kaya Kalp)
// ─────────────────────────────────────────────────────────────────────────────
const catalogoInicial: Servicio[] = [
  // ── FISIOTERAPIA ──
  { id: "f1", nombre: "Valoración Fisioterapéutica", descripcion: "Evaluación integral inicial con diagnóstico funcional y plan de tratamiento", categoria: "fisioterapia", duracion: "60 min", precio: 700, activo: true },
  { id: "f2", nombre: "Sesión de Fisioterapia", descripcion: "Terapia individualizada según diagnóstico: manual, electroterapia, ejercicio terapéutico", categoria: "fisioterapia", duracion: "45 min", precio: 500, popular: true, activo: true },
  { id: "f3", nombre: "Fisioterapia de Suelo Pélvico", descripcion: "Especializada en disfunciones del suelo pélvico, incontinencia, fortalecimiento", categoria: "fisioterapia", duracion: "50 min", precio: 600, activo: true },
  { id: "f4", nombre: "Rehabilitación Deportiva", descripcion: "Recuperación de lesiones deportivas con técnicas avanzadas", categoria: "fisioterapia", duracion: "50 min", precio: 550, activo: true },
  { id: "f5", nombre: "Terapia Manual Ortopédica", descripcion: "Movilización articular, técnicas miofasciales, puntos gatillo", categoria: "fisioterapia", duracion: "45 min", precio: 550, activo: true },
  { id: "f6", nombre: "Electroterapia", descripcion: "TENS, ultrasonido, laser terapéutico, corrientes interferenciales", categoria: "fisioterapia", duracion: "30 min", precio: 350, activo: true },
  { id: "f7", nombre: "Vendaje Neuromuscular (Kinesiotape)", descripcion: "Aplicación de vendaje funcional para soporte y alivio de dolor", categoria: "fisioterapia", duracion: "20 min", precio: 250, activo: true },
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
// SERVICIO CARD — compact row style
// ─────────────────────────────────────────────────────────────────────────────
function ServicioRow({
  servicio,
  onEdit,
  onToggle,
}: {
  servicio: Servicio;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const catCfg = CATEGORIA_CONFIG[servicio.categoria];
  const esPaquete = !!servicio.sesiones;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 hover:bg-[#f0f4f7]/60 transition-colors group ${
        !servicio.activo ? "opacity-50" : ""
      }`}
    >
      {/* Icon */}
      <div className={`h-9 w-9 rounded-lg ${catCfg.bg} flex items-center justify-center shrink-0`}>
        <catCfg.icon className={`h-4 w-4 ${catCfg.color}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#1e2d3a] truncate">{servicio.nombre}</p>
          {servicio.popular && (
            <Badge className="bg-[#e89b3f]/15 text-[#e89b3f] border-[#e89b3f]/30 text-[9px] px-1.5 py-0 h-4 shrink-0" variant="outline">
              <Star className="h-2.5 w-2.5 mr-0.5 fill-current" /> Popular
            </Badge>
          )}
          {esPaquete && (
            <Badge className={`${catCfg.bg} ${catCfg.color} ${catCfg.border} text-[9px] px-1.5 py-0 h-4 shrink-0`} variant="outline">
              <Package className="h-2.5 w-2.5 mr-0.5" /> {servicio.sesiones}ses
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-[#5a7080] truncate">{servicio.descripcion}</p>
      </div>

      {/* Duration */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-[#8fa8ba] shrink-0 w-20">
        <Clock className="h-3 w-3" />
        {servicio.duracion}
      </div>

      {/* Price */}
      <div className="text-right shrink-0 w-24">
        {servicio.precioDescuento ? (
          <div>
            <span className="text-[10px] text-[#8fa8ba] line-through">${servicio.precio.toLocaleString("es-MX")}</span>
            <p className="text-sm font-bold text-[#3fa87c]">${servicio.precioDescuento.toLocaleString("es-MX")}</p>
          </div>
        ) : (
          <p className="text-sm font-bold text-[#1e2d3a]">${servicio.precio.toLocaleString("es-MX")}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="cursor-pointer h-7 w-7 rounded-md hover:bg-[#4a7fa5]/10 flex items-center justify-center text-[#4a7fa5] transition-colors"
          title="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onToggle}
          className={`cursor-pointer h-7 w-7 rounded-md flex items-center justify-center transition-colors ${
            servicio.activo
              ? "hover:bg-[#d9534f]/10 text-[#d9534f]"
              : "hover:bg-[#3fa87c]/10 text-[#3fa87c]"
          }`}
          title={servicio.activo ? "Desactivar" : "Activar"}
        >
          {servicio.activo ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ServiciosPage() {
  const [serviciosData, setServiciosData] = useState<Servicio[]>(catalogoInicial);
  const [busqueda, setBusqueda] = useState("");
  const [catActiva, setCatActiva] = useState<CategoriaServicio>("fisioterapia");
  const [modalEditar, setModalEditar] = useState<Servicio | null>(null);
  const [modalNuevo, setModalNuevo] = useState(false);

  // Form state for edit/create
  const [formNombre, setFormNombre] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategoria, setFormCategoria] = useState<CategoriaServicio>("fisioterapia");
  const [formDuracion, setFormDuracion] = useState("45 min");
  const [formPrecio, setFormPrecio] = useState("");
  const [formPrecioDesc, setFormPrecioDesc] = useState("");
  const [formSesiones, setFormSesiones] = useState("");
  const [formPopular, setFormPopular] = useState(false);

  const categorias = Object.entries(CATEGORIA_CONFIG) as [CategoriaServicio, typeof CATEGORIA_CONFIG[CategoriaServicio]][];

  // Filtered
  const serviciosFiltrados = busqueda
    ? serviciosData.filter(
        (s) =>
          s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          s.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      )
    : serviciosData.filter((s) => s.categoria === catActiva);

  // KPIs
  const totalActivos = serviciosData.filter((s) => s.activo).length;
  const precioPromedio = Math.round(
    serviciosData.filter((s) => s.activo && !s.sesiones).reduce((sum, s) => sum + s.precio, 0) /
    (serviciosData.filter((s) => s.activo && !s.sesiones).length || 1)
  );
  const paquetes = serviciosData.filter((s) => s.sesiones).length;

  function openEdit(s: Servicio) {
    setFormNombre(s.nombre);
    setFormDesc(s.descripcion);
    setFormCategoria(s.categoria);
    setFormDuracion(s.duracion);
    setFormPrecio(s.precio.toString());
    setFormPrecioDesc(s.precioDescuento?.toString() || "");
    setFormSesiones(s.sesiones?.toString() || "");
    setFormPopular(!!s.popular);
    setModalEditar(s);
  }

  function openNuevo() {
    setFormNombre("");
    setFormDesc("");
    setFormCategoria(catActiva);
    setFormDuracion("45 min");
    setFormPrecio("");
    setFormPrecioDesc("");
    setFormSesiones("");
    setFormPopular(false);
    setModalNuevo(true);
  }

  function saveEdit() {
    if (!modalEditar || !formNombre.trim() || !formPrecio) return;
    setServiciosData((prev) =>
      prev.map((s) =>
        s.id === modalEditar.id
          ? {
              ...s,
              nombre: formNombre.trim(),
              descripcion: formDesc.trim(),
              categoria: formCategoria,
              duracion: formDuracion,
              precio: Number(formPrecio),
              precioDescuento: formPrecioDesc ? Number(formPrecioDesc) : undefined,
              sesiones: formSesiones ? Number(formSesiones) : undefined,
              popular: formPopular,
            }
          : s
      )
    );
    setModalEditar(null);
  }

  function saveNuevo() {
    if (!formNombre.trim() || !formPrecio) return;
    const nuevo: Servicio = {
      id: `s${Date.now()}`,
      nombre: formNombre.trim(),
      descripcion: formDesc.trim(),
      categoria: formCategoria,
      duracion: formDuracion,
      precio: Number(formPrecio),
      precioDescuento: formPrecioDesc ? Number(formPrecioDesc) : undefined,
      sesiones: formSesiones ? Number(formSesiones) : undefined,
      popular: formPopular,
      activo: true,
    };
    setServiciosData((prev) => [...prev, nuevo]);
    setModalNuevo(false);
  }

  function toggleActivo(id: string) {
    setServiciosData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activo: !s.activo } : s))
    );
  }

  function deleteServicio(id: string) {
    setServiciosData((prev) => prev.filter((s) => s.id !== id));
    setModalEditar(null);
  }

  // ── Shared form JSX ──
  const formFields = (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#1e2d3a]/70">Nombre *</Label>
        <Input
          value={formNombre}
          onChange={(e) => setFormNombre(e.target.value)}
          placeholder="Ej. Sesión de Fisioterapia"
          className="border-[#c8dce8] focus:border-[#4a7fa5] h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#1e2d3a]/70">Descripción</Label>
        <textarea
          value={formDesc}
          onChange={(e) => setFormDesc(e.target.value)}
          placeholder="Breve descripción del servicio..."
          rows={2}
          className="w-full text-sm border border-[#c8dce8] rounded-lg px-3 py-2 focus:outline-none focus:border-[#4a7fa5] text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Categoría *</Label>
          <Select value={formCategoria} onValueChange={(v) => setFormCategoria(v as CategoriaServicio)}>
            <SelectTrigger className="h-9 border-[#c8dce8] text-xs cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categorias.map(([key, cfg]) => (
                <SelectItem key={key} value={key} className="text-xs cursor-pointer">
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Duración *</Label>
          <Select value={formDuracion} onValueChange={setFormDuracion}>
            <SelectTrigger className="h-9 border-[#c8dce8] text-xs cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURACIONES.map((d) => (
                <SelectItem key={d} value={d} className="text-xs cursor-pointer">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Precio MXN *</Label>
          <Input
            type="number"
            value={formPrecio}
            onChange={(e) => setFormPrecio(e.target.value)}
            placeholder="500"
            className="border-[#c8dce8] focus:border-[#4a7fa5] h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Precio con descuento</Label>
          <Input
            type="number"
            value={formPrecioDesc}
            onChange={(e) => setFormPrecioDesc(e.target.value)}
            placeholder="Opcional"
            className="border-[#c8dce8] focus:border-[#4a7fa5] h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Sesiones (paquete)</Label>
          <Input
            type="number"
            value={formSesiones}
            onChange={(e) => setFormSesiones(e.target.value)}
            placeholder="Dejar vacío si no es paquete"
            className="border-[#c8dce8] focus:border-[#4a7fa5] h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Destacado</Label>
          <button
            type="button"
            onClick={() => setFormPopular(!formPopular)}
            className={`cursor-pointer w-full h-9 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              formPopular
                ? "bg-[#e89b3f]/10 border-[#e89b3f]/30 text-[#e89b3f]"
                : "border-[#c8dce8] text-[#8fa8ba] hover:bg-[#f0f4f7]"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${formPopular ? "fill-current" : ""}`} />
            {formPopular ? "Popular" : "Marcar popular"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Servicios Activos", valor: totalActivos, sub: `${categorias.length} categorías`, icon: Sparkles, color: "text-[#4a7fa5]", bg: "bg-[#e4ecf2]" },
          { label: "Precio Promedio", valor: `$${precioPromedio}`, sub: "Por sesión individual", icon: DollarSign, color: "text-[#3fa87c]", bg: "bg-emerald-50" },
          { label: "Paquetes", valor: paquetes, sub: "Con descuento", icon: Package, color: "text-[#9b59b6]", bg: "bg-purple-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-[#c8dce8] p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#1e2d3a]/50 uppercase tracking-wide">{kpi.label}</p>
              <p className="text-xl font-bold text-[#1e2d3a] mt-0.5">{kpi.valor}</p>
              <p className="text-[10px] text-[#1e2d3a]/35">{kpi.sub}</p>
            </div>
            <div className={`${kpi.bg} h-9 w-9 rounded-lg flex items-center justify-center`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── SEARCH + NEW ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e2d3a]/30" />
          <Input
            placeholder="Buscar servicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 border-[#c8dce8] focus:border-[#4a7fa5] h-9 text-sm"
          />
        </div>
        <Button onClick={openNuevo} className="cursor-pointer bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white text-xs h-9 shrink-0">
          <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo
        </Button>
      </div>

      {/* ── CATEGORY TABS — scrollable ── */}
      {!busqueda && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categorias.map(([key, cfg]) => {
            const count = serviciosData.filter((s) => s.categoria === key).length;
            const isActive = catActiva === key;
            return (
              <button
                key={key}
                onClick={() => setCatActiva(key)}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-[#1e2d3a] text-white shadow-sm"
                    : "bg-white border border-[#c8dce8] text-[#5a7080] hover:bg-[#f0f4f7]"
                }`}
              >
                <cfg.icon className="h-3.5 w-3.5" />
                {cfg.label}
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-[#e4ecf2] text-[#5a7080]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── SERVICE LIST ── */}
      <Card className="border-[#c8dce8] bg-white overflow-hidden">
        {/* Category header */}
        {!busqueda && (
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#c8dce8]/50 bg-[#f0f4f7]/40">
            {(() => {
              const cfg = CATEGORIA_CONFIG[catActiva];
              return (
                <>
                  <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                    <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#1e2d3a]">{cfg.label}</h2>
                    <p className="text-[10px] text-[#8fa8ba]">
                      {serviciosFiltrados.length} servicios
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {busqueda && (
          <div className="px-4 py-2.5 border-b border-[#c8dce8]/50 bg-[#f0f4f7]/40">
            <p className="text-xs text-[#5a7080]">
              {serviciosFiltrados.length} resultado{serviciosFiltrados.length !== 1 ? "s" : ""} para &ldquo;{busqueda}&rdquo;
            </p>
          </div>
        )}

        <CardContent className="p-0">
          {serviciosFiltrados.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="h-10 w-10 text-[#1e2d3a]/10 mx-auto mb-2" />
              <p className="text-sm text-[#1e2d3a]/40 font-medium">Sin servicios</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e4ecf2]">
              {serviciosFiltrados.map((s) => (
                <ServicioRow
                  key={s.id}
                  servicio={s}
                  onEdit={() => openEdit(s)}
                  onToggle={() => toggleActivo(s.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── MODAL: EDITAR SERVICIO ── */}
      <Dialog open={!!modalEditar} onOpenChange={() => setModalEditar(null)}>
        <DialogContent className="max-w-md border-[#c8dce8]">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a] flex items-center gap-2">
              <Pencil className="h-4 w-4 text-[#4a7fa5]" />
              Editar Servicio
            </DialogTitle>
          </DialogHeader>

          {formFields}

          <DialogFooter className="gap-2 mt-1">
            {modalEditar && (
              <Button
                variant="outline"
                onClick={() => deleteServicio(modalEditar.id)}
                className="cursor-pointer mr-auto border-[#d9534f]/30 text-[#d9534f] hover:bg-[#d9534f]/5 text-xs h-8"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
              </Button>
            )}
            <Button variant="outline" onClick={() => setModalEditar(null)} className="cursor-pointer text-xs h-8">
              Cancelar
            </Button>
            <Button onClick={saveEdit} className="cursor-pointer bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white text-xs h-8">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: NUEVO SERVICIO ── */}
      <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
        <DialogContent className="max-w-md border-[#c8dce8]">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a] flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#3fa87c]" />
              Nuevo Servicio
            </DialogTitle>
          </DialogHeader>

          {formFields}

          <DialogFooter className="gap-2 mt-1">
            <Button variant="outline" onClick={() => setModalNuevo(false)} className="cursor-pointer text-xs h-8">
              Cancelar
            </Button>
            <Button onClick={saveNuevo} className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white text-xs h-8">
              <Plus className="h-3.5 w-3.5 mr-1" /> Crear Servicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
