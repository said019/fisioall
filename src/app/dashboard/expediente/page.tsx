import { redirect } from "next/navigation";
import { getExpedientePorCita, getExpedientePaciente } from "./actions";
import ExpedienteClient from "./expediente-client";

// Server Component - Expediente page
// Accepts:  ?citaId=xxx        -> loads specific cita
//           ?pacienteId=xxx    -> loads latest cita for that patient

export default async function ExpedientePage(props: {
  searchParams: Promise<{ citaId?: string; pacienteId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { citaId, pacienteId } = searchParams;

  if (!citaId && !pacienteId) {
    redirect("/dashboard/pacientes");
  }

  let data;

  if (citaId) {
    data = await getExpedientePorCita(citaId);
  } else if (pacienteId) {
    data = await getExpedientePaciente(pacienteId);
  }

  if (!data) {
    redirect("/dashboard/pacientes");
  }

  return (
    <ExpedienteClient
      initialData={data}
      citaIdParam={citaId}
    />
  );
}
