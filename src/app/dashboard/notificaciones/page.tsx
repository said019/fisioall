import NotificacionesClient from "./notificaciones-client";
import { getPacientesNotificaciones } from "./notificaciones-actions";

export default async function NotificacionesPage() {
  let pacientes: { id: string; nombre: string; telefono: string | null }[] = [];
  try {
    pacientes = await getPacientesNotificaciones();
  } catch {
    pacientes = [];
  }

  return <NotificacionesClient pacientes={pacientes} />;
}
