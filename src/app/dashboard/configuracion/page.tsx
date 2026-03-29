import ConfiguracionClient from "./configuracion-client";
import { getConfiguracion, getGoogleCalendarStatus } from "./actions";

export default async function ConfiguracionPage() {
  const [config, gcalStatus] = await Promise.all([
    getConfiguracion(),
    getGoogleCalendarStatus(),
  ]);
  return <ConfiguracionClient initial={config} gcalStatus={gcalStatus} />;
}
