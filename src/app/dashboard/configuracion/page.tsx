import ConfiguracionClient from "./configuracion-client";
import { getConfiguracion, getGoogleCalendarStatus } from "./actions";
import { getPacientesNotificaciones } from "../notificaciones/notificaciones-actions";

export default async function ConfiguracionPage() {
  const [config, gcalStatus, pacientes] = await Promise.all([
    getConfiguracion(),
    getGoogleCalendarStatus(),
    getPacientesNotificaciones().catch(() => []),
  ]);
  return <ConfiguracionClient initial={config} gcalStatus={gcalStatus} pacientes={pacientes} />;
}
