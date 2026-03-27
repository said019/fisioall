import ConfiguracionClient from "./configuracion-client";
import { getConfiguracion } from "./actions";

export default async function ConfiguracionPage() {
  const config = await getConfiguracion();
  return <ConfiguracionClient initial={config} />;
}
