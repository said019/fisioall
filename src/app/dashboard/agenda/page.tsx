import { unstable_noStore as noStore } from "next/cache";
import AgendaClient from "./agenda-client";
import { getCitasSemana, getFisioterapeutas, getPacientesLite } from "./actions";

// Dashboard en vivo — siempre datos frescos, nunca cachear la página
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AgendaPage(props: {
  searchParams: Promise<{ pacienteId?: string }>;
}) {
  noStore();
  const searchParams = await props.searchParams;
  const preselectedPacienteId = searchParams.pacienteId ?? null;

  // Compute current week Mon-Sat in Mexico City timezone.
  // Las fechas para display se construyen como mediodía CDMX (18:00 UTC) para
  // que su ISO represente sin ambigüedad el mismo día calendario al ser
  // parseado en CDMX, sin importar la zona horaria del runtime.
  // El rango de query usa 00:00 CDMX a inicio del Domingo CDMX para abarcar
  // el día completo en zona horaria local.
  const now = new Date();
  const mxDateStr = now.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  const [yMx, mMx, dMx] = mxDateStr.split("-").map(Number);
  const mxNow = new Date(Date.UTC(yMx, mMx - 1, dMx, 18, 0, 0)); // noon CDMX
  const dayOfWeek = mxNow.getUTCDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  // Display dates (noon CDMX)
  const monday = new Date(Date.UTC(yMx, mMx - 1, dMx + diffToMon, 18, 0, 0));
  // Query range (00:00 CDMX = 06:00 UTC del lunes; 00:00 CDMX domingo = fin de sábado)
  const mondayQueryStart = new Date(Date.UTC(yMx, mMx - 1, dMx + diffToMon, 6, 0, 0));
  const saturdayQueryEnd = new Date(Date.UTC(yMx, mMx - 1, dMx + diffToMon + 6, 5, 59, 59, 999));

  let citas, pacientes, fisioterapeutas;

  try {
    [citas, pacientes, fisioterapeutas] = await Promise.all([
      getCitasSemana(mondayQueryStart.toISOString(), saturdayQueryEnd.toISOString()),
      getPacientesLite(),
      getFisioterapeutas(),
    ]);
  } catch {
    citas = undefined;
    pacientes = undefined;
    fisioterapeutas = undefined;
  }

  return (
    <AgendaClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialCitas={citas as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pacientes={pacientes as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fisioterapeutas={fisioterapeutas as any}
      weekStartISO={monday.toISOString()}
      todayISO={mxNow.toISOString()}
      preselectedPacienteId={preselectedPacienteId}
    />
  );
}
