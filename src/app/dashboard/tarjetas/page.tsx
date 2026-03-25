import TarjetasClient from "./tarjetas-client";
import { getTarjetasLealtad } from "./actions";

export default async function TarjetasLealtadPage() {
  let tarjetas;
  try {
    tarjetas = await getTarjetasLealtad();
  } catch {
    tarjetas = undefined;
  }

  return <TarjetasClient initialTarjetas={tarjetas as any} />;
}
