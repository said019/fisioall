import AgendaClient from "./agenda-client";
import { getCitasSemana, getFisioterapeutas, getPacientesLite } from "./actions";

export default async function AgendaPage() {
  // Compute current week Mon-Sat
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
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
      todayISO={now.toISOString()}
    />
  );
}
