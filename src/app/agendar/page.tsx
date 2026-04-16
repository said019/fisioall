import { getServiciosPublicos } from "@/app/dashboard/servicios/actions";
import AgendarClient from "./agendar-client";

export default async function AgendarPage() {
  const serviciosPlanos = await getServiciosPublicos();

  // Agrupar servicios por categoría (misma forma que el client espera)
  const categoriasMap = new Map<
    string,
    {
      id: string;
      label: string;
      color: string;
      especialidad: string;
      servicios: { nombre: string; duracion: number; precio: number; descripcion?: string }[];
    }
  >();

  for (const s of serviciosPlanos) {
    if (!categoriasMap.has(s.categoria)) {
      categoriasMap.set(s.categoria, {
        id: s.categoria,
        label: s.categoriaLabel || s.categoria,
        color: s.categoriaColor || "#4a7fa5",
        especialidad: s.especialidad || "",
        servicios: [],
      });
    }
    categoriasMap.get(s.categoria)!.servicios.push({
      nombre: s.nombre,
      duracion: s.duracion,
      precio: s.precio,
      descripcion: s.descripcion || undefined,
    });
  }

  const categorias = [...categoriasMap.values()];

  return <AgendarClient categorias={categorias} />;
}
