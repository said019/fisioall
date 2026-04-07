import ConfiguracionClient from "./configuracion-client";
import { getConfiguracion, getGoogleCalendarStatus, getHorariosTerapeutas } from "./actions";
import { getPacientesNotificaciones } from "../notificaciones/notificaciones-actions";

export default async function ConfiguracionPage() {
  const [config, gcalStatus, pacientes, terapeutas] = await Promise.all([
    getConfiguracion(),
    getGoogleCalendarStatus(),
    getPacientesNotificaciones().catch(() => []),
    getHorariosTerapeutas().catch(() => []),
  ]);
  return <ConfiguracionClient initial={config} gcalStatus={gcalStatus} pacientes={pacientes} terapeutas={terapeutas} />;
}
