// ─────────────────────────────────────────────────────────────────────────────
// TIPOS PARA EXPEDIENTES ESPECIALIZADOS — Kaya Kalp
// ─────────────────────────────────────────────────────────────────────────────

// ── Suelo Pélvico ───────────────────────────────────────────────────────────

export interface ExpedienteSueloPelvico {
  motivoConsulta: string;
  sintomatologia: {
    dolorPelvico: boolean;
    escapesOrina: boolean;
    escapesGas: boolean;
    presionAbdominopelvica: boolean;
    vidaSexualActiva: boolean;
    estrenimientoCronico: boolean;
  };
  datosFertilidad: {
    estabilidadCicloMenstrual: string;
    partos: number;
    cesareas: number;
    abortos: number;
  };
  antecedentesPatologicos: string;
  semanasGestacion: number | null;
  sintomasEmbarazo: string;
  expectativasSesiones: string;
}

export interface SeguimientoSueloPelvico {
  subjetivo: string;
  objetivo: string;
  analisis: string;
  plan: string;
  dolorInicio: number;
  dolorFin: number;
  evolucion: "mejoria" | "sin_cambios" | "deterioro";
  porcentajeObjetivo: number;
  tecnicasUtilizadas: string[];
}

// ── Cosmetología ────────────────────────────────────────────────────────────

export type BiotipoCutaneo = "normal" | "seca" | "grasa" | "mixta";
export type EstadoPiel = "deshidratada" | "atopica" | "fotosensible" | "envejecida";
export type AlteracionPiel = "hipercromia" | "rosacea" | "acne";
export type TexturaPiel = "suave" | "engrosada" | "oleosa";
export type FototipoPiel = "I" | "II" | "III" | "IV";
export type LineasExpresion = "ninguna" | "suaves" | "profundas" | "arrugas" | "flacidez";

export interface ExpedienteCosme {
  productosEnPiel: string;
  rutinaSkincare: string;
  alergias: string;
  usaProtectorSolar: boolean;
  pielAcartonada: boolean;
  consumoCafeinaAlcohol: string;
  tabaco: boolean;
  motivoVisita: string;
  expectativasSesiones: string;
  recomendadoPor: string;
}

export interface SeguimientoCosme {
  biotipoCutaneo: BiotipoCutaneo;
  estadoPiel: EstadoPiel[];
  alteraciones: AlteracionPiel[];
  textura: TexturaPiel;
  fototipo: FototipoPiel;
  lineasExpresion: LineasExpresion;
  observaciones: string;
  diagnosticoTratamiento: string;
  fechaPrimeraSesion: string;
}

// ── Utilidades ──────────────────────────────────────────────────────────────

export type TipoExpediente = "fisioterapia" | "suelo_pelvico" | "cosme";

export const TIPO_BADGE: Record<TipoExpediente, { label: string; color: string }> = {
  fisioterapia:  { label: "Fisioterapia",  color: "bg-[#4a7fa5]/10 text-[#4a7fa5]" },
  suelo_pelvico: { label: "Suelo Pélvico", color: "bg-[#0d9488]/10 text-[#0d9488]" },
  cosme:         { label: "Cosmetología",  color: "bg-[#e89b3f]/10 text-[#854f0b]" },
};

export function getTipoExpediente(tipoSesion: string): TipoExpediente {
  const s = tipoSesion.toLowerCase();
  if (
    s.includes("suelo pélvico") || s.includes("suelo pelvico") ||
    s.includes("prenatal") || s.includes("postparto")
  ) return "suelo_pelvico";
  if (
    s.includes("facial") || s.includes("limpieza") ||
    s.includes("cosme") || s.includes("peeling") ||
    s.includes("dermaplaning") || s.includes("anti-edad") ||
    s.includes("hidratante") || s.includes("radiofrecuencia facial") ||
    s.includes("corporal") || s.includes("epilaci")
  ) return "cosme";
  return "fisioterapia";
}
