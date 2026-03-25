import { redirect } from "next/navigation";
import ExpedienteClient from "./expediente-client";
import { getExpedientePaciente } from "./actions";

interface Props {
  searchParams: Promise<{ pacienteId?: string; citaId?: string }>;
}

export default async function ExpedientePage({ searchParams }: Props) {
  const { pacienteId, citaId } = await searchParams;

  if (!pacienteId) {
    redirect("/dashboard/pacientes");
  }

  const data = await getExpedientePaciente(pacienteId);

  if (!data) {
    redirect("/dashboard/pacientes");
  }

  return <ExpedienteClient initialData={data} citaIdParam={citaId} />;
}
