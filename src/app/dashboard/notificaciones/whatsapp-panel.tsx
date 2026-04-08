"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wifi,
  WifiOff,
  QrCode,
  RefreshCw,
  Send,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Smartphone,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
  getWhatsAppStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  sendWhatsAppMessage,
} from "./whatsapp-actions";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface PacienteOption {
  id: string;
  nombre: string;
  telefono: string;
}

type ConnectionState = "open" | "close" | "connecting" | "unknown";

const STATE_CONFIG: Record<
  ConnectionState,
  { label: string; color: string; icon: typeof Wifi }
> = {
  open: { label: "Conectado", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: Wifi },
  close: { label: "Desconectado", color: "text-red-600 bg-red-50 border-red-200", icon: WifiOff },
  connecting: { label: "Conectando...", color: "text-amber-600 bg-amber-50 border-amber-200", icon: RefreshCw },
  unknown: { label: "Sin configurar", color: "text-slate-500 bg-slate-50 border-slate-200", icon: WifiOff },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function WhatsAppPanel({
  pacientes,
}: {
  pacientes: PacienteOption[];
}) {
  const [state, setState] = useState<ConnectionState>("unknown");
  const [instanceName, setInstanceName] = useState("");
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Send message state
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const result = await getWhatsAppStatus();
      if (result.ok && result.data) {
        setState(result.data.state as ConnectionState);
        setInstanceName(result.data.instanceName);
      } else {
        setState("unknown");
      }
    } catch {
      setState("unknown");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleConnect = async () => {
    setLoading(true);
    setQrBase64(null);
    try {
      const result = await connectWhatsApp();
      if (result.ok && result.data) {
        setQrBase64(result.data.base64);
        setState("connecting");
        toast.success("QR generado. Escanea con WhatsApp.");
      } else {
        toast.error(result.error ?? "Error al conectar");
      }
    } catch {
      toast.error("Error al conectar WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const result = await disconnectWhatsApp();
      if (result.ok) {
        setState("close");
        setQrBase64(null);
        toast.success("WhatsApp desconectado");
      } else {
        toast.error(result.error ?? "Error al desconectar");
      }
    } catch {
      toast.error("Error al desconectar");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedPaciente || !mensaje.trim()) {
      toast.error("Selecciona un paciente y escribe un mensaje");
      return;
    }
    setSending(true);
    try {
      const result = await sendWhatsAppMessage(selectedPaciente, mensaje);
      if (result.ok) {
        toast.success("Mensaje enviado por WhatsApp");
        setMensaje("");
        setSelectedPaciente("");
      } else {
        toast.error(result.error ?? "Error al enviar mensaje");
      }
    } catch {
      toast.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  };

  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.unknown;
  const StateIcon = cfg.icon;

  return (
    <div className="space-y-5">
      {/* ── Connection Status Card ── */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-600" />
              Estado de Conexión WhatsApp
            </CardTitle>
            <Badge variant="outline" className={`text-[10px] border ${cfg.color}`}>
              <StateIcon className={`h-3 w-3 mr-1 ${state === "connecting" ? "animate-spin" : ""}`} />
              {cfg.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {checking ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#4a7fa5]" />
              <span className="ml-2 text-sm text-[#8fa8ba]">Verificando conexión...</span>
            </div>
          ) : (
            <>
              {/* Instance info */}
              {instanceName && (
                <div className="bg-[#f0f4f7] rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-[#8fa8ba] uppercase tracking-wide">Instancia</p>
                  <p className="text-sm font-mono font-medium text-[#1e2d3a] mt-0.5">{instanceName}</p>
                </div>
              )}

              {/* QR Code display */}
              {qrBase64 && state !== "open" && (
                <div className="flex flex-col items-center gap-3 bg-white border border-[#c8dce8] rounded-xl p-6">
                  <QrCode className="h-5 w-5 text-[#4a7fa5]" />
                  <p className="text-xs font-semibold text-[#1e2d3a]">
                    Escanea este código QR con WhatsApp
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <img
                      src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                      alt="QR WhatsApp"
                      className="w-56 h-56"
                    />
                  </div>
                  <p className="text-[10px] text-[#8fa8ba] text-center max-w-xs">
                    Abre WhatsApp en tu teléfono → Ajustes → Dispositivos vinculados → Vincular dispositivo
                  </p>
                </div>
              )}

              {/* Connected state */}
              {state === "open" && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">WhatsApp conectado correctamente</p>
                    <p className="text-xs text-emerald-600/70 mt-0.5">
                      Puedes enviar mensajes y recordatorios a tus pacientes
                    </p>
                  </div>
                </div>
              )}

              {/* Not configured */}
              {state === "unknown" && !qrBase64 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertTriangle className="h-8 w-8 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700">WhatsApp no configurado</p>
                    <p className="text-xs text-amber-600/70 mt-0.5">
                      Configura las variables EVOLUTION_API_URL, EVOLUTION_API_KEY y EVOLUTION_INSTANCE_NAME
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {state !== "open" && (
                  <Button
                    onClick={handleConnect}
                    disabled={loading}
                    className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4 mr-1.5" />
                    )}
                    {qrBase64 ? "Regenerar QR" : "Conectar WhatsApp"}
                  </Button>
                )}
                {state === "open" && (
                  <Button
                    onClick={handleDisconnect}
                    disabled={loading}
                    variant="outline"
                    className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 text-sm"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-1.5" />
                    )}
                    Desconectar
                  </Button>
                )}
                <Button
                  onClick={checkStatus}
                  variant="outline"
                  disabled={checking}
                  className="cursor-pointer border-[#a8cfe0] text-[#4a7fa5] hover:bg-[#e4ecf2] text-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${checking ? "animate-spin" : ""}`} />
                  Verificar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Send Message Card ── */}
      {state === "open" && (
        <Card className="border-[#c8dce8] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#1e2d3a] flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#4a7fa5]" />
              Enviar Mensaje de Prueba
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Paciente</Label>
              <Select value={selectedPaciente} onValueChange={setSelectedPaciente}>
                <SelectTrigger className="border-[#a8cfe0] cursor-pointer">
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} — {p.telefono}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1e2d3a]/60">Mensaje</Label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe el mensaje a enviar..."
                rows={3}
                className="w-full rounded-lg border border-[#a8cfe0] bg-white px-3 py-2 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:outline-none focus:border-[#4a7fa5] transition-colors resize-none"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={sending || !selectedPaciente || !mensaje.trim()}
              className="cursor-pointer bg-[#4a7fa5] hover:bg-[#4a7fa5]/90 text-white text-sm"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1.5" />
              )}
              Enviar por WhatsApp
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
