"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  Eye,
  EyeOff,
  Trash2,
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

import {
  crearServicio,
  actualizarServicio,
  toggleServicio,
  eliminarServicio,
  type ServicioRow,
} from "./actions";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIA_ICONS: Record<string, typeof Heart> = {
  fisioterapia: Zap,
  faciales: Star,
  suelo_pelvico: Heart,
  corporales: Sparkles,
  epilacion: Scissors,
};

const DURACIONES = [15, 20, 30, 40, 45, 50, 60, 70, 90];

// ─────────────────────────────────────────────────────────────────────────────
// SERVICIO ROW
// ─────────────────────────────────────────────────────────────────────────────
function ServicioRowItem({
  servicio,
  onEdit,
  onToggle,
  disabled,
}: {
  servicio: ServicioRow;
  onEdit: () => void;
  onToggle: () => void;
  disabled: boolean;
}) {
  const Icon = CATEGORIA_ICONS[servicio.categoria] ?? Zap;
  const color = servicio.categoriaColor || "#4a7fa5";
  const esPaquete = !!servicio.sesiones;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 hover:bg-[#f0f4f7]/60 transition-colors group ${
        !servicio.activo ? "opacity-50" : ""
      }`}
    >
      <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#1e2d3a] truncate">{servicio.nombre}</p>
          {servicio.popular && (
            <Badge className="bg-[#e89b3f]/15 text-[#e89b3f] border-[#e89b3f]/30 text-[9px] px-1.5 py-0 h-4 shrink-0" variant="outline">
              <Star className="h-2.5 w-2.5 mr-0.5 fill-current" /> Popular
            </Badge>
          )}
          {esPaquete && (
            <Badge className="text-[9px] px-1.5 py-0 h-4 shrink-0" variant="outline" style={{ backgroundColor: `${color}15`, color, borderColor: `${color}50` }}>
              <Package className="h-2.5 w-2.5 mr-0.5" /> {servicio.sesiones}ses
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-[#5a7080] truncate">{servicio.descripcion}</p>
      </div>

      <div className="hidden sm:flex items-center gap-1 text-xs text-[#8fa8ba] shrink-0 w-20">
        <Clock className="h-3 w-3" />
        {servicio.duracion} min
      </div>

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

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} disabled={disabled} className="cursor-pointer h-7 w-7 rounded-md hover:bg-[#4a7fa5]/10 flex items-center justify-center text-[#4a7fa5] transition-colors" title="Editar">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onToggle} disabled={disabled} className={`cursor-pointer h-7 w-7 rounded-md flex items-center justify-center transition-colors ${servicio.activo ? "hover:bg-[#d9534f]/10 text-[#d9534f]" : "hover:bg-[#3fa87c]/10 text-[#3fa87c]"}`} title={servicio.activo ? "Desactivar" : "Activar"}>
          {servicio.activo ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ServiciosClient({
  initialServicios,
}: {
  initialServicios: ServicioRow[];
}) {
  const [busqueda, setBusqueda] = useState("");
  const [catActiva, setCatActiva] = useState(() => {
    const cats = [...new Set(initialServicios.map((s) => s.categoria))];
    return cats[0] ?? "fisioterapia";
  });
  const [modalEditar, setModalEditar] = useState<ServicioRow | null>(null);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Form state
  const [formNombre, setFormNombre] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategoria, setFormCategoria] = useState("fisioterapia");
  const [formDuracion, setFormDuracion] = useState(45);
  const [formPrecio, setFormPrecio] = useState("");
  const [formPrecioDesc, setFormPrecioDesc] = useState("");
  const [formSesiones, setFormSesiones] = useState("");
  const [formPopular, setFormPopular] = useState(false);

  const servicios = initialServicios;

  // Categorías únicas extraídas de los datos
  const categorias = [...new Map(servicios.map((s) => [s.categoria, { key: s.categoria, label: s.categoriaLabel, color: s.categoriaColor }])).values()];

  const serviciosFiltrados = busqueda
    ? servicios.filter((s) => s.nombre.toLowerCase().includes(busqueda.toLowerCase()) || s.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    : servicios.filter((s) => s.categoria === catActiva);

  const totalActivos = servicios.filter((s) => s.activo).length;
  const precioPromedio = Math.round(
    servicios.filter((s) => s.activo && !s.sesiones).reduce((sum, s) => sum + s.precio, 0) /
    (servicios.filter((s) => s.activo && !s.sesiones).length || 1)
  );
  const paquetes = servicios.filter((s) => s.sesiones).length;

  function openEdit(s: ServicioRow) {
    setFormNombre(s.nombre);
    setFormDesc(s.descripcion);
    setFormCategoria(s.categoria);
    setFormDuracion(s.duracion);
    setFormPrecio(s.precio.toString());
    setFormPrecioDesc(s.precioDescuento?.toString() ?? "");
    setFormSesiones(s.sesiones?.toString() ?? "");
    setFormPopular(s.popular);
    setModalEditar(s);
  }

  function openNuevo() {
    setFormNombre("");
    setFormDesc("");
    setFormCategoria(catActiva);
    setFormDuracion(45);
    setFormPrecio("");
    setFormPrecioDesc("");
    setFormSesiones("");
    setFormPopular(false);
    setModalNuevo(true);
  }

  function handleSaveEdit() {
    if (!modalEditar || !formNombre.trim() || !formPrecio) return;
    startTransition(async () => {
      await actualizarServicio(modalEditar.id, {
        nombre: formNombre.trim(),
        descripcion: formDesc.trim(),
        categoria: formCategoria,
        duracion: formDuracion,
        precio: Number(formPrecio),
        precioDescuento: formPrecioDesc ? Number(formPrecioDesc) : null,
        sesiones: formSesiones ? Number(formSesiones) : null,
        popular: formPopular,
      });
      setModalEditar(null);
      router.refresh();
    });
  }

  function handleSaveNuevo() {
    if (!formNombre.trim() || !formPrecio) return;
    const catInfo = categorias.find((c) => c.key === formCategoria);
    startTransition(async () => {
      await crearServicio({
        nombre: formNombre.trim(),
        descripcion: formDesc.trim(),
        categoria: formCategoria,
        categoriaLabel: catInfo?.label ?? formCategoria,
        categoriaColor: catInfo?.color ?? "#4a7fa5",
        duracion: formDuracion,
        precio: Number(formPrecio),
        precioDescuento: formPrecioDesc ? Number(formPrecioDesc) : null,
        sesiones: formSesiones ? Number(formSesiones) : null,
        popular: formPopular,
      });
      setModalNuevo(false);
      router.refresh();
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleServicio(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await eliminarServicio(id);
      setModalEditar(null);
      router.refresh();
    });
  }

  const formFields = (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#1e2d3a]/70">Nombre *</Label>
        <Input value={formNombre} onChange={(e) => setFormNombre(e.target.value)} placeholder="Ej. Sesión de Fisioterapia" className="border-[#c8dce8] focus:border-[#4a7fa5] h-9" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#1e2d3a]/70">Descripción</Label>
        <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Breve descripción del servicio..." rows={2} className="w-full text-sm border border-[#c8dce8] rounded-lg px-3 py-2 focus:outline-none focus:border-[#4a7fa5] text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Categoría *</Label>
          <Select value={formCategoria} onValueChange={setFormCategoria}>
            <SelectTrigger className="h-9 border-[#c8dce8] text-xs cursor-pointer"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c.key} value={c.key} className="text-xs cursor-pointer">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Duración (min) *</Label>
          <Select value={String(formDuracion)} onValueChange={(v) => setFormDuracion(Number(v))}>
            <SelectTrigger className="h-9 border-[#c8dce8] text-xs cursor-pointer"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DURACIONES.map((d) => (
                <SelectItem key={d} value={String(d)} className="text-xs cursor-pointer">{d} min</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Precio MXN *</Label>
          <Input type="number" value={formPrecio} onChange={(e) => setFormPrecio(e.target.value)} placeholder="500" className="border-[#c8dce8] focus:border-[#4a7fa5] h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Precio con descuento</Label>
          <Input type="number" value={formPrecioDesc} onChange={(e) => setFormPrecioDesc(e.target.value)} placeholder="Opcional" className="border-[#c8dce8] focus:border-[#4a7fa5] h-9" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Sesiones (paquete)</Label>
          <Input type="number" value={formSesiones} onChange={(e) => setFormSesiones(e.target.value)} placeholder="Dejar vacío si no es paquete" className="border-[#c8dce8] focus:border-[#4a7fa5] h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#1e2d3a]/70">Destacado</Label>
          <button type="button" onClick={() => setFormPopular(!formPopular)} className={`cursor-pointer w-full h-9 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${formPopular ? "bg-[#e89b3f]/10 border-[#e89b3f]/30 text-[#e89b3f]" : "border-[#c8dce8] text-[#8fa8ba] hover:bg-[#f0f4f7]"}`}>
            <Star className={`h-3.5 w-3.5 ${formPopular ? "fill-current" : ""}`} />
            {formPopular ? "Popular" : "Marcar popular"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* KPI STRIP */}
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

      {/* SEARCH + NEW */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1e2d3a]/30" />
          <Input placeholder="Buscar servicio..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10 border-[#c8dce8] focus:border-[#4a7fa5] h-9 text-sm" />
        </div>
        <Button onClick={openNuevo} disabled={isPending} className="cursor-pointer bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white text-xs h-9 shrink-0">
          <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo
        </Button>
      </div>

      {/* CATEGORY TABS */}
      {!busqueda && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categorias.map((cat) => {
            const Icon = CATEGORIA_ICONS[cat.key] ?? Zap;
            const count = servicios.filter((s) => s.categoria === cat.key).length;
            const isActive = catActiva === cat.key;
            return (
              <button key={cat.key} onClick={() => setCatActiva(cat.key)} className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${isActive ? "bg-[#1e2d3a] text-white shadow-sm" : "bg-white border border-[#c8dce8] text-[#5a7080] hover:bg-[#f0f4f7]"}`}>
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${isActive ? "bg-white/20 text-white" : "bg-[#e4ecf2] text-[#5a7080]"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* SERVICE LIST */}
      <Card className="border-[#c8dce8] bg-white overflow-hidden">
        {!busqueda && (() => {
          const cat = categorias.find((c) => c.key === catActiva);
          const Icon = CATEGORIA_ICONS[catActiva] ?? Zap;
          return (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#c8dce8]/50 bg-[#f0f4f7]/40">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat?.color ?? "#4a7fa5"}15` }}>
                <Icon className="h-4 w-4" style={{ color: cat?.color ?? "#4a7fa5" }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1e2d3a]">{cat?.label ?? catActiva}</h2>
                <p className="text-[10px] text-[#8fa8ba]">{serviciosFiltrados.length} servicios</p>
              </div>
            </div>
          );
        })()}

        {busqueda && (
          <div className="px-4 py-2.5 border-b border-[#c8dce8]/50 bg-[#f0f4f7]/40">
            <p className="text-xs text-[#5a7080]">{serviciosFiltrados.length} resultado{serviciosFiltrados.length !== 1 ? "s" : ""} para &ldquo;{busqueda}&rdquo;</p>
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
                <ServicioRowItem key={s.id} servicio={s} onEdit={() => openEdit(s)} onToggle={() => handleToggle(s.id)} disabled={isPending} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: EDITAR */}
      <Dialog open={!!modalEditar} onOpenChange={() => setModalEditar(null)}>
        <DialogContent className="max-w-md border-[#c8dce8]">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a] flex items-center gap-2">
              <Pencil className="h-4 w-4 text-[#4a7fa5]" /> Editar Servicio
            </DialogTitle>
          </DialogHeader>
          {formFields}
          <DialogFooter className="gap-2 mt-1">
            {modalEditar && (
              <Button variant="outline" onClick={() => handleDelete(modalEditar.id)} disabled={isPending} className="cursor-pointer mr-auto border-[#d9534f]/30 text-[#d9534f] hover:bg-[#d9534f]/5 text-xs h-8">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
              </Button>
            )}
            <Button variant="outline" onClick={() => setModalEditar(null)} className="cursor-pointer text-xs h-8">Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={isPending} className="cursor-pointer bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white text-xs h-8">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: NUEVO */}
      <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
        <DialogContent className="max-w-md border-[#c8dce8]">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d3a] flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#3fa87c]" /> Nuevo Servicio
            </DialogTitle>
          </DialogHeader>
          {formFields}
          <DialogFooter className="gap-2 mt-1">
            <Button variant="outline" onClick={() => setModalNuevo(false)} className="cursor-pointer text-xs h-8">Cancelar</Button>
            <Button onClick={handleSaveNuevo} disabled={isPending} className="cursor-pointer bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white text-xs h-8">
              <Plus className="h-3.5 w-3.5 mr-1" /> Crear Servicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
