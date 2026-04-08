import { validarTokenReagendar } from "./reagendar-actions";
import ReagendarClient from "./reagendar-client";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ReagendarPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Enlace inválido
          </h1>
          <p className="text-gray-500 text-sm">
            Este enlace no contiene un token válido. Solicita uno nuevo
            respondiendo <strong>3</strong> al recordatorio de WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  const result = await validarTokenReagendar(token);

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            No se puede reagendar
          </h1>
          <p className="text-gray-500 text-sm">{result.error}</p>
        </div>
      </div>
    );
  }

  return <ReagendarClient token={token} cita={result.cita} />;
}
