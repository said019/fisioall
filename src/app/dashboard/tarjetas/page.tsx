import TarjetasClient from "./tarjetas-client";
import { getTarjetasLealtad, getPacientesTarjetas, getPaquetesTarjetas } from "./actions";

export default async function TarjetasLealtadPage() {
  let tarjetas, pacientes, paquetes;
  try {
    [tarjetas, pacientes, paquetes] = await Promise.all([
      getTarjetasLealtad(),
      getPacientesTarjetas(),
      getPaquetesTarjetas(),
    ]);
  } catch {
    tarjetas = undefined;
    pacientes = undefined;
    paquetes = undefined;
  }

  return (
    <TarjetasClient
      initialTarjetas={tarjetas as any}
      pacientes={pacientes as any}
      paquetes={paquetes as any}
    />
  );
}
