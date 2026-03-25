import AgendaClient from "./agenda-client";
import { getCitasSemana } from "./actions";

export default async function AgendaPage() {
  let citas;
  try {
    // Fetch current week's appointments
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5); // Saturday

    citas = await getCitasSemana(startOfWeek.toISOString(), endOfWeek.toISOString());
  } catch {
    citas = undefined;
  }

  return <AgendaClient initialCitas={citas as any} />;
}
