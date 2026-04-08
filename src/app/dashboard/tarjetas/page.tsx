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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialTarjetas={tarjetas as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pacientes={pacientes as any}
    />
  );
}
