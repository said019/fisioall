"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { guardarRespuestaNPS } from "@/app/dashboard/encuestas/actions";

// ─────────────────────────────────────────────────────────────────────────────
// NPS PUBLIC SURVEY PAGE — /encuesta/[token]
// Mobile-first, no auth required, Kaya Kalp branding
// ─────────────────────────────────────────────────────────────────────────────

const DOLOR_OPTIONS = [
  { value: "sin_dolor", label: "Sin dolor", emoji: "😊" },
  { value: "leve", label: "Leve", emoji: "🙂" },
  { value: "moderado", label: "Moderado", emoji: "😐" },
  { value: "severo", label: "Severo", emoji: "😣" },
  { value: "muy_severo", label: "Muy severo", emoji: "😫" },
];

export default function EncuestaPublicaPage() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState(0); // 0=NPS, 1=satisfaction, 2=mejoria, 3=dolor, 4=comment, 5=done
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [satisfaccion, setSatisfaccion] = useState<number | null>(null);
  const [mejoria, setMejoria] = useState<"si" | "no" | null>(null);
  const [dolor, setDolor] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(true);

  useEffect(() => {
    setAnimateIn(true);
  }, [step]);

  function nextStep() {
    setAnimateIn(false);
    setTimeout(() => setStep((s) => s + 1), 150);
  }

  async function handleSubmit() {
    if (npsScore === null || satisfaccion === null || mejoria === null) return;
    setEnviando(true);
    setError(null);
    try {
      const result = await guardarRespuestaNPS(token, {
        npsScore,
        satisfaccion,
        mejoriaPercibida: mejoria,
        dolorPost: dolor ?? undefined,
        comentarios: comentarios.trim() || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        nextStep(); // go to thank-you
      }
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  // ── THANK YOU ──
  if (step >= 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e4ecf2] via-white to-[#d4eadd] flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="h-20 w-20 bg-[#3fa87c]/15 rounded-full flex items-center justify-center mx-auto">
            <svg className="h-10 w-10 text-[#3fa87c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1e2d3a]">¡Gracias por tu opinión!</h1>
          <p className="text-sm text-[#1e2d3a]/60 leading-relaxed">
            Tu respuesta nos ayuda a mejorar continuamente nuestros servicios. Nos comprometemos a brindarte la mejor atención posible.
          </p>
          <div className="bg-white/60 rounded-2xl p-4 border border-[#c8dce8]">
            <p className="text-xs text-[#1e2d3a]/40 uppercase tracking-wide font-semibold">Kaya Kalp</p>
            <p className="text-xs text-[#1e2d3a]/30 mt-1">Dando vida a tu cuerpo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4ecf2] via-white to-[#d4eadd] flex flex-col">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-4 py-2 border border-[#c8dce8] shadow-sm">
          <div className="h-6 w-6 bg-[#1e3a4f] rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">KK</span>
          </div>
          <span className="text-sm font-semibold text-[#1e2d3a]">Kaya Kalp</span>
        </div>
        <p className="text-xs text-[#1e2d3a]/40 mt-3">Encuesta de satisfacción</p>
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-1 max-w-xs mx-auto">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < step ? "bg-[#3fa87c]" : i === step ? "bg-[#4a7fa5]" : "bg-[#c8dce8]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div
          className={`max-w-sm w-full transition-all duration-200 ${
            animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {/* ── STEP 0: NPS ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-bold text-[#1e2d3a]">
                  ¿Qué tan probable es que nos recomiendes?
                </h2>
                <p className="text-xs text-[#1e2d3a]/40 mt-1">
                  0 = Nada probable · 10 = Muy probable
                </p>
              </div>

              <div className="grid grid-cols-11 gap-1">
                {Array.from({ length: 11 }, (_, i) => {
                  const isSelected = npsScore === i;
                  let bgClass = "bg-white border-[#c8dce8] text-[#1e2d3a]/60";
                  if (isSelected) {
                    if (i >= 9) bgClass = "bg-[#3fa87c] border-[#3fa87c] text-white shadow-lg shadow-emerald-200";
                    else if (i >= 7) bgClass = "bg-[#e89b3f] border-[#e89b3f] text-white shadow-lg shadow-amber-200";
                    else bgClass = "bg-[#d9534f] border-[#d9534f] text-white shadow-lg shadow-red-200";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setNpsScore(i)}
                      className={`h-11 rounded-xl border-2 font-bold text-sm transition-all duration-150 active:scale-95 cursor-pointer ${bgClass}`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>

              {npsScore !== null && (
                <div className="text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      npsScore >= 9
                        ? "bg-emerald-50 text-emerald-600"
                        : npsScore >= 7
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {npsScore >= 9 ? "🎉 ¡Promotor!" : npsScore >= 7 ? "👍 Neutral" : "😔 Necesitamos mejorar"}
                  </span>
                </div>
              )}

              <button
                onClick={nextStep}
                disabled={npsScore === null}
                className="w-full h-12 rounded-2xl bg-[#4a7fa5] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d6f92] active:scale-[0.98] transition-all cursor-pointer"
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── STEP 1: SATISFACTION ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-bold text-[#1e2d3a]">
                  ¿Qué tan satisfecho/a estás con la sesión?
                </h2>
                <p className="text-xs text-[#1e2d3a]/40 mt-1">1 = Muy insatisfecho · 5 = Muy satisfecho</p>
              </div>

              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = satisfaccion === val;
                  const emojis = ["😤", "😕", "😐", "😊", "🤩"];
                  const labels = ["Muy mal", "Mal", "Regular", "Bien", "Excelente"];
                  return (
                    <button
                      key={val}
                      onClick={() => setSatisfaccion(val)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? "bg-[#4a7fa5]/10 border-[#4a7fa5] shadow-md"
                          : "bg-white border-[#c8dce8] hover:border-[#4a7fa5]/30"
                      }`}
                    >
                      <span className="text-2xl">{emojis[val - 1]}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isSelected ? "text-[#4a7fa5]" : "text-[#1e2d3a]/40"
                        }`}
                      >
                        {labels[val - 1]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextStep}
                disabled={satisfaccion === null}
                className="w-full h-12 rounded-2xl bg-[#4a7fa5] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d6f92] active:scale-[0.98] transition-all cursor-pointer"
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── STEP 2: MEJORIA ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-bold text-[#1e2d3a]">
                  ¿Percibiste mejoría después de la sesión?
                </h2>
              </div>

              <div className="flex justify-center gap-4">
                {(["si", "no"] as const).map((opt) => {
                  const isSelected = mejoria === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setMejoria(opt)}
                      className={`flex flex-col items-center gap-2 px-8 py-5 rounded-2xl border-2 transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? opt === "si"
                            ? "bg-emerald-50 border-[#3fa87c] shadow-md"
                            : "bg-red-50 border-[#d9534f] shadow-md"
                          : "bg-white border-[#c8dce8] hover:border-[#4a7fa5]/30"
                      }`}
                    >
                      <span className="text-3xl">{opt === "si" ? "👍" : "👎"}</span>
                      <span
                        className={`text-sm font-semibold ${
                          isSelected
                            ? opt === "si"
                              ? "text-[#3fa87c]"
                              : "text-[#d9534f]"
                            : "text-[#1e2d3a]/50"
                        }`}
                      >
                        {opt === "si" ? "Sí, mejoré" : "No, aún no"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextStep}
                disabled={mejoria === null}
                className="w-full h-12 rounded-2xl bg-[#4a7fa5] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d6f92] active:scale-[0.98] transition-all cursor-pointer"
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── STEP 3: DOLOR POST ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-bold text-[#1e2d3a]">
                  ¿Cómo describirías tu dolor después de la sesión?
                </h2>
              </div>

              <div className="space-y-2">
                {DOLOR_OPTIONS.map((opt) => {
                  const isSelected = dolor === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setDolor(opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? "bg-[#4a7fa5]/10 border-[#4a7fa5] shadow-md"
                          : "bg-white border-[#c8dce8] hover:border-[#4a7fa5]/30"
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span
                        className={`text-sm font-semibold ${
                          isSelected ? "text-[#4a7fa5]" : "text-[#1e2d3a]/60"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextStep}
                disabled={dolor === null}
                className="w-full h-12 rounded-2xl bg-[#4a7fa5] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d6f92] active:scale-[0.98] transition-all cursor-pointer"
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── STEP 4: COMMENTS + SUBMIT ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-bold text-[#1e2d3a]">
                  ¿Algún comentario adicional?
                </h2>
                <p className="text-xs text-[#1e2d3a]/40 mt-1">Opcional — tu retroalimentación es muy valiosa</p>
              </div>

              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Cuéntanos qué podemos mejorar o qué te gustó..."
                rows={4}
                className="w-full rounded-2xl border-2 border-[#c8dce8] px-4 py-3 text-sm text-[#1e2d3a] placeholder:text-[#1e2d3a]/30 focus:border-[#4a7fa5] focus:outline-none resize-none"
              />

              {/* Summary */}
              <div className="bg-white/70 rounded-2xl border border-[#c8dce8] p-4 space-y-2">
                <p className="text-xs font-semibold text-[#1e2d3a]/50 uppercase tracking-wide">Resumen</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#e4ecf2]/50 rounded-xl p-2 text-center">
                    <p className="font-bold text-[#1e2d3a] text-base">{npsScore}</p>
                    <p className="text-[#1e2d3a]/40">NPS</p>
                  </div>
                  <div className="bg-[#e4ecf2]/50 rounded-xl p-2 text-center">
                    <p className="font-bold text-[#1e2d3a] text-base">{"⭐".repeat(satisfaccion ?? 0)}</p>
                    <p className="text-[#1e2d3a]/40">Satisfacción</p>
                  </div>
                  <div className="bg-[#e4ecf2]/50 rounded-xl p-2 text-center">
                    <p className="font-bold text-[#1e2d3a]">{mejoria === "si" ? "👍 Sí" : "👎 No"}</p>
                    <p className="text-[#1e2d3a]/40">Mejoría</p>
                  </div>
                  <div className="bg-[#e4ecf2]/50 rounded-xl p-2 text-center">
                    <p className="font-bold text-[#1e2d3a]">
                      {DOLOR_OPTIONS.find((d) => d.value === dolor)?.emoji ?? "—"}{" "}
                      {DOLOR_OPTIONS.find((d) => d.value === dolor)?.label ?? "—"}
                    </p>
                    <p className="text-[#1e2d3a]/40">Dolor</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={enviando}
                className="w-full h-12 rounded-2xl bg-[#3fa87c] text-white font-semibold text-sm disabled:opacity-60 hover:bg-[#35946d] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  "Enviar encuesta ✓"
                )}
              </button>

              <button
                onClick={() => { setStep(0); setAnimateIn(true); }}
                className="w-full text-xs text-[#1e2d3a]/30 hover:text-[#1e2d3a]/50 transition-colors cursor-pointer"
              >
                Volver a empezar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
