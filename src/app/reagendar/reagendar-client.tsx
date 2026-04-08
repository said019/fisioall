"use client";

import { useState, useEffect } from "react";
import {
  CitaReagendar,
  getSlotsReagendar,
  confirmarReagendar,
} from "./reagendar-actions";

interface Props {
  token: string;
  cita: CitaReagendar;
}

export default function ReagendarClient({ token, cita }: Props) {
  const [fecha, setFecha] = useState("");
  const [slots, setSlots] = useState<{ hora: string; disponible: boolean }[]>(
    [],
  );
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [resultado, setResultado] = useState<{
    ok?: boolean;
    mensaje?: string;
    error?: string;
  } | null>(null);

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Max date = 30 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  useEffect(() => {
    if (!fecha) return;
    setLoadingSlots(true);
    setHoraSeleccionada("");
    getSlotsReagendar(cita.fisioterapeuta.id, fecha, cita.duracion)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [fecha, cita.fisioterapeuta.id, cita.duracion]);

  async function handleConfirmar() {
    if (!fecha || !horaSeleccionada) return;
    setLoading(true);
    const res = await confirmarReagendar(token, fecha, horaSeleccionada);
    setResultado(res);
    setLoading(false);
  }

  const citaFecha = new Date(cita.fechaHoraInicio).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const citaHora = new Date(cita.fechaHoraInicio).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (resultado?.ok) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Cita Reagendada!
          </h1>
          <p className="text-gray-600 mb-6">{resultado.mensaje}</p>
          <p className="text-sm text-gray-400">
            Tu anticipo de $200 se conserva para esta nueva fecha.
          </p>
          <div className="mt-6 p-4 bg-[#4a7fa5]/10 rounded-xl">
            <p className="text-sm text-[#4a7fa5] font-medium">
              Recibirás un recordatorio por WhatsApp 24 horas antes de tu cita.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Reagendar Cita
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kaya Kalp</p>
        </div>

        {/* Current appointment info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Cita actual
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              📅 {citaFecha}
            </p>
            <p className="text-sm text-gray-700">
              🕐 {citaHora} hrs
            </p>
            <p className="text-sm text-gray-700">
              👩‍⚕️ {cita.fisioterapeuta.nombre} {cita.fisioterapeuta.apellido}
            </p>
            {cita.tipoSesion && (
              <p className="text-sm text-gray-700">
                📋 {cita.tipoSesion}
              </p>
            )}
          </div>
        </div>

        {resultado?.error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
            {resultado.error}
          </div>
        )}

        {/* Date picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nueva fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={minDate}
            max={maxDateStr}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7fa5]/30 focus:border-[#4a7fa5]"
          />
        </div>

        {/* Slots */}
        {fecha && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Horario disponible
            </label>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#4a7fa5] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No hay horarios disponibles este día.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto">
                {slots
                  .filter((s) => s.disponible)
                  .map((slot) => (
                    <button
                      key={slot.hora}
                      onClick={() => setHoraSeleccionada(slot.hora)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        horaSeleccionada === slot.hora
                          ? "bg-[#4a7fa5] text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {slot.hora}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Confirm button */}
        <button
          onClick={handleConfirmar}
          disabled={!fecha || !horaSeleccionada || loading}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#4a7fa5] hover:bg-[#3d6b8a] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Reagendando…
            </span>
          ) : (
            "Confirmar nueva fecha"
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Tu anticipo de $200 se conserva para la nueva fecha.
        </p>
      </div>
    </div>
  );
}
