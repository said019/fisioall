import PagosClient from "./pagos-client";
import { getPagos } from "./actions";

export default async function PagosPage() {
  let pagos;
  try {
    pagos = await getPagos();
  } catch {
    pagos = undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PagosClient initialPagos={pagos as any} />;
}
