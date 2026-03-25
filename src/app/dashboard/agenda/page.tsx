import AgendaClient from "./agenda-client";
import { getCitasSemana, getFisioterapeutas } from "./actions";
import { getPacientesLite } from "./actions";

export default async function AgendaPage() {
  let citas;
  let pacientes;
  let fisioterapeutas;

  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5);

    [citas, pacientes, fisioterapeutas] = await Promise.all([
      getCitasSemana(startOfWeek.toISOString(), endOfWeek.toISOString()),
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
      initialCitas={citas as any}
      pacientes={pacientes as any}
      fisioterapeutas={fisioterapeutas as any}
    />
  );
}
