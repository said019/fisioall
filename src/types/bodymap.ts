export type VistaBody = "anterior" | "posterior" | "lateral_der" | "lateral_izq";
export type TipoHallazgo =
  | "dolor"
  | "inflamacion"
  | "contractura"
  | "limitacion_rom"
  | "parestesia"
  | "tension_muscular";
export type Lateralidad = "bilateral" | "izquierdo" | "derecho";
export type SnapshotTipo = "evaluacion_inicial" | "seguimiento" | "reevaluacion";

export interface BodyMapMarca {
  id: string;
  snapshotId: string;
  zonaId: string;
  zonaLabel: string;
  vista: VistaBody;
  tipo: TipoHallazgo;
  intensidad: number;
  lateralidad: Lateralidad;
  notas?: string;
  colorHex: string;
}

export interface BodyMapSnapshot {
  id: string;
  pacienteId: string;
  citaId?: string;
  tipo: SnapshotTipo;
  sesionNum: number;
  notas?: string;
  createdAt: Date;
  marcas: BodyMapMarca[];
}

export interface BodyMapZonaState {
  zonaId: string;
  zonaLabel: string;
  vista: VistaBody;
  tipo: TipoHallazgo;
  intensidad: number;
  lateralidad: Lateralidad;
  notas?: string;
  colorHex: string;
}

export type BodyMapState = Record<string, BodyMapZonaState>;

export interface NuevaMarcaForm {
  zonaId: string;
  zonaLabel: string;
  vista: VistaBody;
  tipo: TipoHallazgo;
  intensidad: number;
  lateralidad: Lateralidad;
  notas: string;
  colorHex?: string;
}

export const TIPO_COLORS: Record<TipoHallazgo, string> = {
  dolor: "#EF4444",
  inflamacion: "#8B5CF6",
  contractura: "#F59E0B",
  limitacion_rom: "#06B6D4",
  parestesia: "#10B981",
  tension_muscular: "#F97316",
};

export const TIPO_LABELS: Record<TipoHallazgo, string> = {
  dolor: "Dolor",
  inflamacion: "Inflamación",
  contractura: "Contractura",
  limitacion_rom: "Limitación ROM",
  parestesia: "Parestesia",
  tension_muscular: "Tensión muscular",
};

export const LATERALIDAD_LABELS: Record<Lateralidad, string> = {
  bilateral: "Bilateral",
  izquierdo: "Izquierdo",
  derecho: "Derecho",
};

export const SNAPSHOT_TIPO_LABELS: Record<SnapshotTipo, string> = {
  evaluacion_inicial: "Evaluación inicial",
  seguimiento: "Seguimiento",
  reevaluacion: "Re-evaluación",
};

export function marcasToState(marcas: BodyMapMarca[]): BodyMapState {
  return marcas.reduce((acc, m) => {
    acc[`${m.zonaId}_${m.vista}`] = {
      zonaId: m.zonaId,
      zonaLabel: m.zonaLabel,
      vista: m.vista,
      tipo: m.tipo,
      intensidad: m.intensidad,
      lateralidad: m.lateralidad,
      notas: m.notas,
      colorHex: TIPO_COLORS[m.tipo],
    };
    return acc;
  }, {} as BodyMapState);
}

export function evaPromedioDesdeState(estado: BodyMapState): string {
  const values = Object.values(estado);
  if (values.length === 0) return "—";
  const sum = values.reduce((a, v) => a + v.intensidad, 0);
  return (sum / values.length).toFixed(1);
}
