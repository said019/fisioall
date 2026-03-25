import TarjetasClient from "./tarjetas-client";
import { getTarjetasLealtad, getPacientesTarjetas } from "./actions";

export default async function TarjetasLealtadPage() {
  let tarjetas, pacientes;
  try {
    [tarjetas, pacientes] = await Promise.all([
      getTarjetasLealtad(),
      getPacientesTarjetas(),
    ]);
  } catch {
    tarjetas = undefined;
    pacientes = undefined;
  }

  return (
    <TarjetasClient
      initialTarjetas={tarjetas as any}
      pacientes={pacientes as any}
    />
  );
}
