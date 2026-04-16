import { validarToken } from "./actions";
import ResetPasswordClient from "./reset-client";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const validacion = await validarToken(token ?? "");

  return <ResetPasswordClient token={token ?? ""} validacion={validacion} />;
}
