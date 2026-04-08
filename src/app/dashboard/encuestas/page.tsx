import EncuestasClient from "./encuestas-client";
import { getEncuestas } from "./actions";

export default async function EncuestasPage() {
  let encuestas;
  try {
    encuestas = await getEncuestas();
  } catch {
    encuestas = undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <EncuestasClient initialEncuestas={encuestas as any} />;
}
