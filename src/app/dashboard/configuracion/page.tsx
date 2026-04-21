import ConfiguracionClient from "./configuracion-client";
import { getConfiguracion, getHorariosTerapeutas } from "./actions";
import { getPacientesNotificaciones } from "../notificaciones/notificaciones-actions";

export default async function ConfiguracionPage() {
  const [config, pacientes, terapeutas] = await Promise.all([
    getConfiguracion(),
    getPacientesNotificaciones().catch(() => []),
    getHorariosTerapeutas().catch(() => []),
  ]);
  return <ConfiguracionClient initial={config} pacientes={pacientes} terapeutas={terapeutas} />;
}
