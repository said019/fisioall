"use client";

import { useState, useEffect } from "react";
import { Tag, CheckCircle2 } from "lucide-react";
import { cobrarSesion, getSaldoAnticipo } from "./cobrar-actions";

interface CobrarPanelProps {
  citaId: string;
  pacienteId: string;
  precioSesion: number;
  pacienteNombre: string;
  tipoSesion: string;
  onSuccess: () => void;
}

export default function CobrarPanel({
  citaId,
  pacienteId,
  precioSesion,
  pacienteNombre,
  tipoSesion,
  onSuccess,
}: CobrarPanelProps) {
  const [saldoAnticipo, setSaldoAnticipo] = useState(0);
  const [aplicarAnticipo, setAplicarAnticipo] = useState(false);
  const [metodo, setMetodo] = useState<"efectivo" | "transferencia">("efectivo");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getSaldoAnticipo(pacienteId).then((r) => setSaldoAnticipo(r.saldo));
  }, [pacienteId]);

  const montoAnticipo = aplicarAnticipo
    ? Math.min(saldoAnticipo, precioSesion)
    : 0;
  const montoFinal = precioSesion - montoAnticipo;

  const handleCobrar = async () => {
    setCargando(true);
    const result = await cobrarSesion({
      pacienteId,
      citaId,
      montoTotal: precioSesion,
      metodo,
      aplicarAnticipo,
    });
    setCargando(false);
    if (result.success) onSuccess();
  };

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="bg-[#f0f4f7] rounded-lg p-4">
        <p className="text-xs text-[#1e2d3a]/50 font-medium">Paciente</p>
        <p className="text-sm font-bold text-[#1e2d3a]">{pacienteNombre}</p>
        <p className="text-xs text-[#1e2d3a]/50 mt-1">{tipoSesion}</p>
      </div>

      {/* Precio de sesión */}
      <div className="flex items-center justify-between p-3 border border-[#c8dce8] rounded-lg">
        <span className="text-sm text-[#1e2d3a]/70">Precio de sesión</span>
        <span className="text-sm font-bold text-[#1e2d3a]">
          ${precioSesion.toLocaleString("es-MX")}
        </span>
      </div>

      {/* Anticipo disponible (solo si tiene saldo) */}
      {saldoAnticipo > 0 && (
        <div
          className={`border rounded-lg p-3 transition-all ${
            aplicarAnticipo
              ? "bg-[#3fa87c]/10 border-[#3fa87c]/30"
              : "bg-[#e4ecf2]/40 border-[#c8dce8]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#3fa87c]" />
              <div>
                <p className="text-sm font-medium text-[#1e2d3a]">
                  Anticipo disponible:{" "}
                  <strong className="text-[#3fa87c]">${saldoAnticipo}</strong>
                </p>
                <p className="text-xs text-[#1e2d3a]/50">
                  Crédito guardado del paciente
                </p>
              </div>
            </div>
            <button
              onClick={() => setAplicarAnticipo(!aplicarAnticipo)}
              className={`h-5 w-9 rounded-full transition-all flex items-center px-0.5 cursor-pointer ${
                aplicarAnticipo ? "bg-[#3fa87c]" : "bg-gray-300"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white shadow transition-all ${
                  aplicarAnticipo ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          {aplicarAnticipo && (
            <p className="text-xs text-[#3fa87c] font-medium mt-2">
              − ${montoAnticipo} anticipo aplicado
            </p>
          )}
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between p-4 bg-[#1e2d3a] rounded-lg">
        <span className="text-sm font-medium text-white/70">
          Total a cobrar
        </span>
        <span className="text-xl font-bold text-white">
          ${montoFinal.toLocaleString("es-MX")}
        </span>
      </div>

      {/* Método */}
      <div className="grid grid-cols-2 gap-2">
        {(["efectivo", "transferencia"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetodo(m)}
            className={`py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition-all ${
              metodo === m
                ? "bg-[#4a7fa5] text-white border-[#4a7fa5]"
                : "bg-white text-[#1e2d3a] border-[#c8dce8] hover:border-[#4a7fa5]"
            }`}
          >
            {m === "efectivo" ? "Efectivo" : "Transferencia"}
          </button>
        ))}
      </div>

      <button
        onClick={handleCobrar}
        disabled={cargando}
        className="w-full py-3 bg-[#3fa87c] hover:bg-[#3fa87c]/90 text-white rounded-lg font-medium cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        {cargando
          ? "Procesando..."
          : `Cobrar $${montoFinal.toLocaleString("es-MX")}`}
      </button>
    </div>
  );
}
