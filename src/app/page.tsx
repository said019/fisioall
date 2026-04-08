import { getConfigPublica } from "@/app/dashboard/configuracion/actions";
import LandingClient from "./landing-client";

export default async function LandingPage() {
  const config = await getConfigPublica();
  return <LandingClient config={config} />;
}
