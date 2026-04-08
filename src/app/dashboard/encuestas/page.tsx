"use client";

import { useState } from "react";
import {
  Search,
  TrendingUp,
  MessageSquare,
  Send,
  ThumbsUp,
  Meh,
  CheckCircle2,
  Clock,
  ChevronRight,
  SmilePlus,
  Frown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type DolorEscala = "sin_dolor" | "leve" | "moderado" | "severo" | "muy_severo";
type Satisfaccion = "muy_insatisfecho" | "insatisfecho" | "neutral" | "satisfecho" | "muy_satisfecho";

interface EncuestaSesion {
  id: string;
  pacienteNombre: string;
  pacienteIniciales: string;
  npsScore: number; // 0-10
  dolorPost: DolorEscala;
  satisfaccion: Satisfaccion;
  mejoriaPercibida: boolean;
  comentarios?: string;
  enviadaAt: string;
  respondidaAt?: string;
  respondida: boolean;
  fisioterapeuta: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const DOLOR_CONFIG: Record<DolorEscala, { label: string; color: string; emoji: string }> = {
  sin_dolor:  { label: "Sin dolor",  color: "text-emerald-600", emoji: "😊" },
  leve:       { label: "Leve",       color: "text-lime-600",    emoji: "🙂" },
  moderado:   { label: "Moderado",   color: "text-amber-600",   emoji: "😐" },
  severo:     { label: "Severo",     color: "text-orange-600",  emoji: "😣" },
  muy_severo: { label: "Muy severo", color: "text-red-600",     emoji: "😫" },
};

const SATISFACCION_CONFIG: Record<Satisfaccion, { label: string; color: string; bg: string }> = {
  muy_insatisfecho: { label: "Muy insatisfecho", color: "text-red-600",     bg: "bg-red-50" },
  insatisfecho:     { label: "Insatisfecho",     color: "text-orange-600",  bg: "bg-orange-50" },
  neutral:          { label: "Neutral",          color: "text-amber-600",   bg: "bg-amber-50" },
  satisfecho:       { label: "Satisfecho",       color: "text-lime-600",    bg: "bg-lime-50" },
  muy_satisfecho:   { label: "Muy satisfecho",   color: "text-emerald-600", bg: "bg-emerald-50" },
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const mockEncuestas: EncuestaSesion[] = [
  { id: "e1",  pacienteNombre: "Ana Flores Torres",     pacienteIniciales: "AF", npsScore: 10, dolorPost: "sin_dolor",  satisfaccion: "muy_satisfecho",   mejoriaPercibida: true,  comentarios: "Excelente sesión, me siento mucho mejor del hombro. El doctor fue muy atento.", enviadaAt: "2026-02-28T14:00:00", respondidaAt: "2026-02-28T16:30:00", respondida: true,  fisioterapeuta: "Dr. García" },
  { id: "e2",  pacienteNombre: "Carlos Mendoza López",  pacienteIniciales: "CM", npsScore: 8,  dolorPost: "leve",       satisfaccion: "satisfecho",       mejoriaPercibida: true,  comentarios: "Buen tratamiento, aunque me gustaría sesiones más largas.",                     enviadaAt: "2026-02-27T14:00:00", respondidaAt: "2026-02-27T18:00:00", respondida: true,  fisioterapeuta: "Dr. García" },
  { id: "e3",  pacienteNombre: "Roberto Sánchez Vega",  pacienteIniciales: "RS", npsScore: 6,  dolorPost: "moderado",   satisfaccion: "neutral",          mejoriaPercibida: false, comentarios: "No sentí mucha mejoría esta vez, espero que la próxima sea mejor.",            enviadaAt: "2026-02-26T14:00:00", respondidaAt: "2026-02-26T20:00:00", respondida: true,  fisioterapeuta: "Dra. López" },
  { id: "e4",  pacienteNombre: "Sofía Reyes Castillo",  pacienteIniciales: "SR", npsScore: 9,  dolorPost: "leve",       satisfaccion: "muy_satisfecho",   mejoriaPercibida: true,  comentarios: "Cada sesión me siento mejor. ¡Los ejercicios en casa también ayudan mucho!",   enviadaAt: "2026-02-25T14:00:00", respondidaAt: "2026-02-25T15:00:00", respondida: true,  fisioterapeuta: "Dr. García" },
  { id: "e5",  pacienteNombre: "Luis Hernández Mora",   pacienteIniciales: "LH", npsScore: 7,  dolorPost: "leve",       satisfaccion: "satisfecho",       mejoriaPercibida: true,  enviadaAt: "2026-02-24T14:00:00", respondidaAt: "2026-02-24T19:30:00", respondida: true,  fisioterapeuta: "Dra. López" },
  { id: "e6",  pacienteNombre: "María José Ruiz",       pacienteIniciales: "MR", npsScore: 3,  dolorPost: "severo",     satisfaccion: "insatisfecho",     mejoriaPercibida: false, comentarios: "Sentí más dolor después de la sesión, necesito algo diferente.",               enviadaAt: "2026-02-23T14:00:00", respondidaAt: "2026-02-23T21:00:00", respondida: true,  fisioterapeuta: "Dr. García" },
  { id: "e7",  pacienteNombre: "Ana Flores Torres",     pacienteIniciales: "AF", npsScore: 9,  dolorPost: "sin_dolor",  satisfaccion: "muy_satisfecho",   mejoriaPercibida: true,  comentarios: "Segunda sesión, todo perfecto.",                                                enviadaAt: "2026-02-22T14:00:00", respondidaAt: "2026-02-22T14:45:00", respondida: true,  fisioterapeuta: "Dr. García" },
  { id: "e8",  pacienteNombre: "Carlos Mendoza López",  pacienteIniciales: "CM", npsScore: 0,  dolorPost: "leve",       satisfaccion: "satisfecho",       mejoriaPercibida: true,  enviadaAt: "2026-03-01T14:00:00",                                                                                            respondida: false, fisioterapeuta: "Dra. López" },
  { id: "e9",  pacienteNombre: "Roberto Sánchez Vega",  pacienteIniciales: "RS", npsScore: 0,  dolorPost: "leve",       satisfaccion: "neutral",          mejoriaPercibida: false, enviadaAt: "2026-03-02T14:00:00",                                                                                            respondida: false, fisioterapeuta: "Dr. García" },
  { id: "e10", pacienteNombre: "Sofía Reyes Castillo",  pacienteIniciales: "SR", npsScore: 10, dolorPost: "sin_dolor",  satisfaccion: "muy_satisfecho",   mejoriaPercibida: true,  comentarios: "¡Lo recomiendo al 100%! Mi rodilla ya no duele al subir escaleras.",            enviadaAt: "2026-02-20T14:00:00", respondidaAt: "2026-02-20T14:20:00", respondida: true,  fisioterapeuta: "Dr. García" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function EncuestasPage() {
  const [busqueda, setBusqueda] = useState("");
const [modalDetalle, setModalDetalle] = useState<EncuestaSesion | null>(null);

  // Solo encuestas respondidas para métricas
  const respondidas = mockEncuestas.filter((e) => e.respondida);
  const pendientes = mockEncuestas.filter((e) => !e.respondida);

  // NPS Calculation
  const promotores = respondidas.filter((e) => e.npsScore >= 9).length;
  const pasivos = respondidas.filter((e) => e.npsScore >= 7 && e.npsScore <= 8).length;
  const detractores = respondidas.filter((e) => e.npsScore <= 6).length;
  const npsScore = respondidas.length > 0
    ? Math.round(((promotores - detractores) / respondidas.length) * 100)
    : 0;

  const satisfechos = respondidas.filter((e) => e.satisfaccion === "satisfecho" || e.satisfaccion === "muy_satisfecho").length;
  const tasaSatisfaccion = respondidas.length > 0 ? Math.round((satisfechos / respondidas.length) * 100) : 0;
  const tasaMejoria = respondidas.length > 0 ? Math.round((respondidas.filter(e => e.mejoriaPercibida).length / respondidas.length) * 100) : 0;
  const tasaRespuesta = mockEncuestas.length > 0 ? Math.round((respondidas.length / mockEncuestas.length) * 100) : 0;

  function formatFechaHora(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  }

  function getNpsColor(score: number): string {
    if (score >= 9) return "text-emerald-600";
    if (score >= 7) return "text-amber-600";
    return "text-red-500";
  }

  function getNpsBg(score: number): string {
    if (score >= 9) return "bg-emerald-50";
    if (score >= 7) return "bg-amber-50";
    return "bg-red-50";
  }

  function getNpsLabel(score: number): string {
    if (score >= 9) return "Promotor";
    if (score >= 7) return "Pasivo";
    return "Detractor";
  }

  return (
    <div className="space-y-6">
      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* NPS Score */}
        <Card className="border-cyan-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#164E63]/50 uppercase tracking-wide">NPS Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-3xl font-bold ${npsScore >= 50 ? "text-emerald-600" : npsScore >= 0 ? "text-amber-600" : "text-red-500"}`}>
                    {npsScore > 0 ? "+" : ""}{npsScore}
                  </p>
                </div>
                <p className="text-[11px] text-[#164E63]/40 mt-0.5">
                  {promotores}P · {pasivos}N · {detractores}D
                </p>
              </div>
              <div className={`${npsScore >= 50 ? "bg-emerald-50" : npsScore >= 0 ? "bg-amber-50" : "bg-red-50"} h-10 w-10 rounded-xl flex items-center justify-center`}>
                {npsScore >= 50 ? <SmilePlus className="h-5 w-5 text-emerald-600" /> : npsScore >= 0 ? <Meh className="h-5 w-5 text-amber-600" /> : <Frown className="h-5 w-5 text-red-500" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#164E63]/50 uppercase tracking-wide">Satisfacción</p>
                <p className="text-2xl font-bold text-[#164E63] mt-1">{tasaSatisfaccion}%</p>
                <p className="text-[11px] text-[#164E63]/40 mt-0.5">{satisfechos} de {respondidas.length} satisfechos</p>
              </div>
              <div className="bg-emerald-50 h-10 w-10 rounded-xl flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#164E63]/50 uppercase tracking-wide">Mejoría Percibida</p>
                <p className="text-2xl font-bold text-[#164E63] mt-1">{tasaMejoria}%</p>
                <p className="text-[11px] text-[#164E63]/40 mt-0.5">{respondidas.filter(e => e.mejoriaPercibida).length} reportan mejoría</p>
              </div>
              <div className="bg-cyan-50 h-10 w-10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#164E63]/50 uppercase tracking-wide">Tasa de Respuesta</p>
                <p className="text-2xl font-bold text-[#164E63] mt-1">{tasaRespuesta}%</p>
                <p className="text-[11px] text-[#164E63]/40 mt-0.5">{respondidas.length} de {mockEncuestas.length} respondidas</p>
              </div>
              <div className="bg-violet-50 h-10 w-10 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── NPS BREAKDOWN BAR ── */}
      <Card className="border-cyan-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-[#164E63]">Distribución NPS</p>
              <p className="text-xs text-[#164E63]/40">Promotores vs. Pasivos vs. Detractores</p>
            </div>
            <Badge variant="outline" className={`text-xs border ${npsScore >= 50 ? "border-emerald-200 text-emerald-600 bg-emerald-50" : npsScore >= 0 ? "border-amber-200 text-amber-600 bg-amber-50" : "border-red-200 text-red-500 bg-red-50"}`}>
              NPS: {npsScore > 0 ? "+" : ""}{npsScore}
            </Badge>
          </div>

          {respondidas.length > 0 && (
            <>
              <div className="flex h-6 rounded-full overflow-hidden">
                {promotores > 0 && (
                  <div className="bg-emerald-400 flex items-center justify-center" style={{ width: `${(promotores / respondidas.length) * 100}%` }}>
                    <span className="text-[10px] font-bold text-white">{Math.round((promotores / respondidas.length) * 100)}%</span>
                  </div>
                )}
                {pasivos > 0 && (
                  <div className="bg-amber-400 flex items-center justify-center" style={{ width: `${(pasivos / respondidas.length) * 100}%` }}>
                    <span className="text-[10px] font-bold text-white">{Math.round((pasivos / respondidas.length) * 100)}%</span>
                  </div>
                )}
                {detractores > 0 && (
                  <div className="bg-red-400 flex items-center justify-center" style={{ width: `${(detractores / respondidas.length) * 100}%` }}>
                    <span className="text-[10px] font-bold text-white">{Math.round((detractores / respondidas.length) * 100)}%</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-[#164E63]/50">Promotores (9-10): {promotores}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="text-[11px] text-[#164E63]/50">Pasivos (7-8): {pasivos}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="text-[11px] text-[#164E63]/50">Detractores (0-6): {detractores}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── TABS: Respuestas / Pendientes ── */}
      <Tabs defaultValue="respuestas" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="bg-cyan-50 border border-cyan-100">
            <TabsTrigger value="respuestas" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Respondidas
              <Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-[#0891B2]/20 text-[#0891B2] border-none">
                {respondidas.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pendientes" className="cursor-pointer data-[state=active]:bg-[#0891B2] data-[state=active]:text-white">
              <Clock className="h-3.5 w-3.5 mr-1.5" /> Pendientes
              {pendientes.length > 0 && (
                <Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-amber-100 text-amber-600 border-none">
                  {pendientes.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#164E63]/40" />
              <Input
                placeholder="Buscar paciente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 border-cyan-200 focus:border-[#0891B2] h-10"
              />
            </div>
          </div>
        </div>

        {/* ─── TAB: RESPONDIDAS ─── */}
        <TabsContent value="respuestas" className="space-y-3">
          {respondidas.filter(e => e.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase())).length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 text-[#164E63]/20 mx-auto mb-3" />
              <p className="text-sm text-[#164E63]/50">No se encontraron encuestas respondidas</p>
            </div>
          ) : (
            respondidas
              .filter(e => e.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()))
              .map((enc) => {
                const dolorCfg = DOLOR_CONFIG[enc.dolorPost];
                const satCfg = SATISFACCION_CONFIG[enc.satisfaccion];
                return (
                  <Card
                    key={enc.id}
                    className="border-cyan-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => setModalDetalle(enc)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* NPS Badge */}
                        <div className={`${getNpsBg(enc.npsScore)} h-14 w-14 rounded-2xl flex flex-col items-center justify-center shrink-0`}>
                          <span className={`text-xl font-bold ${getNpsColor(enc.npsScore)}`}>{enc.npsScore}</span>
                          <span className={`text-[8px] font-semibold ${getNpsColor(enc.npsScore)} uppercase`}>{getNpsLabel(enc.npsScore)}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6 border border-cyan-200">
                              <AvatarFallback className="bg-[#0891B2]/15 text-[#0891B2] text-[10px] font-bold">
                                {enc.pacienteIniciales}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold text-[#164E63]">{enc.pacienteNombre}</span>
                            <span className="text-[10px] text-[#164E63]/30">· {enc.fisioterapeuta}</span>
                          </div>

                          {enc.comentarios && (
                            <p className="text-sm text-[#164E63]/60 leading-relaxed line-clamp-2 mb-2">
                              &ldquo;{enc.comentarios}&rdquo;
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] border ${satCfg.bg} ${satCfg.color} border-transparent`}>
                              {satCfg.label}
                            </Badge>
                            <span className="text-[11px] text-[#164E63]/40 flex items-center gap-1">
                              {dolorCfg.emoji} Dolor post: {dolorCfg.label}
                            </span>
                            {enc.mejoriaPercibida && (
                              <span className="text-[11px] text-emerald-600 flex items-center gap-0.5">
                                <TrendingUp className="h-3 w-3" /> Mejoría
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-[#164E63]/30">
                            {enc.respondidaAt && formatFechaHora(enc.respondidaAt)}
                          </p>
                          <ChevronRight className="h-4 w-4 text-[#164E63]/20 mt-2 ml-auto" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </TabsContent>

        {/* ─── TAB: PENDIENTES ─── */}
        <TabsContent value="pendientes" className="space-y-3">
          {pendientes.filter(e => e.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase())).length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="h-12 w-12 text-emerald-200 mx-auto mb-3" />
              <p className="text-sm text-[#164E63]/50">Todas las encuestas han sido respondidas</p>
            </div>
          ) : (
            pendientes
              .filter(e => e.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()))
              .map((enc) => (
                <Card key={enc.id} className="border-amber-100 bg-amber-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-100 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-amber-200">
                            <AvatarFallback className="bg-amber-100 text-amber-600 text-[10px] font-bold">
                              {enc.pacienteIniciales}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-[#164E63]">{enc.pacienteNombre}</span>
                        </div>
                        <p className="text-xs text-[#164E63]/40 mt-0.5">
                          Enviada: {formatFechaHora(enc.enviadaAt)} · {enc.fisioterapeuta}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="cursor-pointer border-amber-200 text-amber-600 hover:bg-amber-50 shrink-0">
                        <Send className="h-3.5 w-3.5 mr-1.5" /> Reenviar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>

      {/* ── MODAL: DETALLE ENCUESTA ── */}
      <Dialog open={!!modalDetalle} onOpenChange={() => setModalDetalle(null)}>
        <DialogContent className="max-w-md">
          {modalDetalle && (() => {
            const dolorCfg = DOLOR_CONFIG[modalDetalle.dolorPost];
            const satCfg = SATISFACCION_CONFIG[modalDetalle.satisfaccion];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-[#164E63]">Detalle de Encuesta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Patient + NPS */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-[#ECFEFF] to-white rounded-xl p-4">
                    <Avatar className="h-11 w-11 border-2 border-cyan-200">
                      <AvatarFallback className="bg-[#0891B2]/15 text-[#0891B2] font-bold">
                        {modalDetalle.pacienteIniciales}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-[#164E63]">{modalDetalle.pacienteNombre}</p>
                      <p className="text-xs text-[#164E63]/40">{modalDetalle.fisioterapeuta} · {modalDetalle.respondidaAt && formatFechaHora(modalDetalle.respondidaAt)}</p>
                    </div>
                    <div className={`ml-auto ${getNpsBg(modalDetalle.npsScore)} h-14 w-14 rounded-2xl flex flex-col items-center justify-center`}>
                      <span className={`text-xl font-bold ${getNpsColor(modalDetalle.npsScore)}`}>{modalDetalle.npsScore}</span>
                      <span className={`text-[8px] font-semibold ${getNpsColor(modalDetalle.npsScore)} uppercase`}>NPS</span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`${satCfg.bg} rounded-xl p-3 text-center`}>
                      <p className={`text-xs font-bold ${satCfg.color}`}>{satCfg.label}</p>
                      <p className="text-[10px] text-[#164E63]/40 mt-0.5">Satisfacción</p>
                    </div>
                    <div className="bg-cyan-50 rounded-xl p-3 text-center">
                      <p className="text-xs font-bold text-[#164E63]">{dolorCfg.emoji} {dolorCfg.label}</p>
                      <p className="text-[10px] text-[#164E63]/40 mt-0.5">Dolor Post</p>
                    </div>
                    <div className={`${modalDetalle.mejoriaPercibida ? "bg-emerald-50" : "bg-red-50"} rounded-xl p-3 text-center`}>
                      <p className={`text-xs font-bold ${modalDetalle.mejoriaPercibida ? "text-emerald-600" : "text-red-500"}`}>
                        {modalDetalle.mejoriaPercibida ? "Sí" : "No"}
                      </p>
                      <p className="text-[10px] text-[#164E63]/40 mt-0.5">Mejoría</p>
                    </div>
                  </div>

                  {/* Comentarios */}
                  {modalDetalle.comentarios && (
                    <div>
                      <p className="text-xs font-semibold text-[#164E63]/50 mb-1.5">Comentarios del Paciente</p>
                      <div className="bg-cyan-50/50 rounded-xl p-3">
                        <p className="text-sm text-[#164E63]/70 leading-relaxed italic">
                          &ldquo;{modalDetalle.comentarios}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#164E63]/40">
                      <Send className="h-3 w-3" /> Enviada: {formatFechaHora(modalDetalle.enviadaAt)}
                    </div>
                    {modalDetalle.respondidaAt && (
                      <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Respondida: {formatFechaHora(modalDetalle.respondidaAt)}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setModalDetalle(null)} className="cursor-pointer">Cerrar</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
