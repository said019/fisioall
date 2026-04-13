import EncuestasClient from "./encuestas-client";
import { getEncuestas, getEncuestasKPIs } from "./actions";

export default async function EncuestasPage() {
  let encuestas: Awaited<ReturnType<typeof getEncuestas>> = [];
  let kpis: Awaited<ReturnType<typeof getEncuestasKPIs>>;
  try {
    [encuestas, kpis] = await Promise.all([getEncuestas(), getEncuestasKPIs()]);
  } catch {
    encuestas = [];
    kpis = {
      npsScore: 0,
      promotores: 0,
      detractores: 0,
      pasivos: 0,
      totalEncuestas: 0,
      respondidas: 0,
      tasaRespuesta: 0,
      tasaSatisfaccion: 0,
      tasaMejoria: 0,
    };
  }

  return <EncuestasClient encuestas={encuestas} kpis={kpis} />;
}
