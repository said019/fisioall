import { getConfigPublica } from "@/app/dashboard/configuracion/actions";
import { getServiciosPublicos } from "@/app/dashboard/servicios/actions";
import LandingClient from "./landing-client";

export default async function LandingPage() {
  const [config, servicios] = await Promise.all([
    getConfigPublica(),
    getServiciosPublicos(),
  ]);
  return <LandingClient config={config} servicios={servicios} />;
}
