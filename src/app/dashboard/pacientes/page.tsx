import PacientesClient from "./pacientes-client";
import { getPacientes } from "./actions";

export default async function PacientesPage() {
  let pacientes;
  try {
    pacientes = await getPacientes();
  } catch {
    pacientes = undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PacientesClient initialPacientes={pacientes as any} />;
}
