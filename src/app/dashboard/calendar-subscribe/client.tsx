"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Apple, Calendar, Copy, CheckCircle2, RefreshCw, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { regenerarTokenCalendar } from "./actions";

export default function CalendarSubscribeClient({ token: initialToken }: { token: string }) {
  const [token, setToken] = useState(initialToken);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // En producción https://www.kayakalp.com.mx; localmente cae a origin del navegador
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://www.kayakalp.com.mx";
  const httpsUrl = `${baseUrl}/api/calendar/feed/${token}/ics`;
  const webcalUrl = httpsUrl.replace(/^https?:/, "webcal:");

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const regenerar = () => {
    if (!confirm("¿Regenerar el token? La URL actual dejará de funcionar y tendrás que suscribirte de nuevo."))
      return;
    startTransition(async () => {
      const res = await regenerarTokenCalendar();
      setToken(res.token);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 bg-[#f0f4f7] min-h-full max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-[#1e2d3a] flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#4a7fa5]" />
          Suscribir agenda a tu calendario
        </h1>
        <p className="text-sm text-[#5a7080] mt-1">
          Tus citas aparecerán automáticamente en Apple Calendar, Google Calendar u Outlook.
          No necesitas hacer nada cada vez que agreguen una cita — se sincroniza solo.
        </p>
      </div>

      {/* URL principal */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">Tu URL de suscripción</CardTitle>
          <CardDescription className="text-xs text-[#5a7080]">
            Mantén este enlace privado — quien lo tenga puede ver tu agenda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-[#1e2d3a]/60 uppercase tracking-wider">
              Apple Calendar / iPhone (webcal://)
            </label>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-2 bg-[#f0f4f7] border border-[#c8dce8] rounded-lg text-xs text-[#1e2d3a] break-all">
                {webcalUrl}
              </code>
              <Button
                onClick={() => copiar(webcalUrl, "webcal")}
                variant="outline"
                className="cursor-pointer border-[#a8cfe0] text-[#4a7fa5] shrink-0"
              >
                {copiado === "webcal" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-[#1e2d3a]/60 uppercase tracking-wider">
              Google Calendar / Outlook (https://)
            </label>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-2 bg-[#f0f4f7] border border-[#c8dce8] rounded-lg text-xs text-[#1e2d3a] break-all">
                {httpsUrl}
              </code>
              <Button
                onClick={() => copiar(httpsUrl, "https")}
                variant="outline"
                className="cursor-pointer border-[#a8cfe0] text-[#4a7fa5] shrink-0"
              >
                {copiado === "https" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <a href={webcalUrl} className="flex-1">
              <Button className="w-full bg-[#1e2d3a] hover:bg-[#1e2d3a]/90 text-white cursor-pointer">
                <Apple className="h-4 w-4 mr-2" />
                Abrir en Apple Calendar
              </Button>
            </a>
            <a href={httpsUrl} download="kaya-kalp-agenda.ics">
              <Button variant="outline" className="cursor-pointer border-[#a8cfe0] text-[#1e2d3a]">
                <Download className="h-4 w-4 mr-2" />
                Descargar .ics
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card className="border-[#c8dce8] bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#1e2d3a]">Cómo suscribirse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[#1e2d3a]">
          <div>
            <p className="font-semibold flex items-center gap-2">
              <Apple className="h-4 w-4" /> En iPhone / iPad
            </p>
            <ol className="mt-1.5 text-xs text-[#5a7080] space-y-1 list-decimal pl-5">
              <li>Copia la URL de arriba (webcal://).</li>
              <li>Abre <strong>Ajustes → Calendario → Cuentas → Añadir cuenta → Otras → Añadir calendario suscrito</strong>.</li>
              <li>Pega la URL y toca Siguiente → Guardar.</li>
              <li>Listo. Se actualiza automáticamente cada hora.</li>
            </ol>
            <p className="mt-2 text-xs text-[#5a7080]">
              O más rápido: toca <strong>&quot;Abrir en Apple Calendar&quot;</strong> directo en tu iPhone.
            </p>
          </div>

          <div>
            <p className="font-semibold flex items-center gap-2">
              <Apple className="h-4 w-4" /> En Mac (Apple Calendar)
            </p>
            <ol className="mt-1.5 text-xs text-[#5a7080] space-y-1 list-decimal pl-5">
              <li>Abre Calendar → <strong>Archivo → Nueva suscripción a calendario</strong> (⌥⌘S).</li>
              <li>Pega la URL <code className="bg-[#f0f4f7] px-1 rounded">{webcalUrl.slice(0, 45)}…</code></li>
              <li>Configura refresco: cada 15 min o 1 h.</li>
            </ol>
          </div>

          <div>
            <p className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Google Calendar
            </p>
            <ol className="mt-1.5 text-xs text-[#5a7080] space-y-1 list-decimal pl-5">
              <li>Ve a <strong>Google Calendar → Otros calendarios → + → Desde URL</strong>.</li>
              <li>Pega la URL <code className="bg-[#f0f4f7] px-1 rounded">https://</code> (no webcal).</li>
              <li>Google actualiza cada 24 h aproximadamente.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Regenerar token */}
      <Card className="border-amber-200 bg-amber-50/40">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#854f0b]">Regenerar URL</p>
              <p className="text-xs text-[#854f0b]/80 mt-1">
                Si la URL se filtró o quieres cortar el acceso a alguien que la tenía, regenera el token.
                La URL vieja dejará de funcionar inmediatamente.
              </p>
              <Button
                onClick={regenerar}
                disabled={isPending}
                variant="outline"
                className="mt-3 border-amber-300 text-[#854f0b] hover:bg-amber-100 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isPending ? "animate-spin" : ""}`} />
                {isPending ? "Regenerando..." : "Regenerar token"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
