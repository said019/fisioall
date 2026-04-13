import AgendaClient from "./agenda-client";
import { getCitasSemana, getFisioterapeutas, getPacientesLite } from "./actions";

export default async function AgendaPage(props: {
  searchParams: Promise<{ pacienteId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const preselectedPacienteId = searchParams.pacienteId ?? null;

  // Compute current week Mon-Sat in Mexico City timezone
  const now = new Date();
  // Get "today" in Mexico City (handles UTC vs local offset on Vercel)
  const mxDateStr = now.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" }); // "YYYY-MM-DD"
  const mxNow = new Date(mxDateStr + "T12:00:00-06:00");
  const dayOfWeek = mxNow.getDay(); // 0=Sun
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(mxNow.getFullYear(), mxNow.getMonth(), mxNow.getDate() + diffToMon);
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  saturday.setHours(23, 59, 59, 999);

  let citas, pacientes, fisioterapeutas;

  try {
    [citas, pacientes, fisioterapeutas] = await Promise.all([
      getCitasSemana(monday.toISOString(), saturday.toISOString()),
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
