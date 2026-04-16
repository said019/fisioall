import { getServicios } from "./actions";
import ServiciosClient from "./servicios-client";

export default async function ServiciosPage() {
  const servicios = await getServicios();
  return <ServiciosClient initialServicios={servicios} />;
}
