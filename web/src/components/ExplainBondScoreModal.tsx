"use client";

import React, { useEffect } from "react";
import {
  X,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building2,
  ArrowRight,
  Coins
} from "lucide-react";
import marketData from "@/data/marketData.json";

export type UsBondItem = (typeof marketData.us_bonds)[0];

interface ExplainBondScoreModalProps {
  bond: UsBondItem | null;
  onClose: () => void;
  onOpenYieldRating?: (bond: UsBondItem) => void;
}

export default function ExplainBondScoreModal({
  bond,
  onClose,
  onOpenYieldRating,
}: ExplainBondScoreModalProps) {
  // Bloquear el scroll de fondo mientras la ventana esté abierta
  useEffect(() => {
    if (!bond) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [bond]);

  if (!bond) return null;

  const score = bond.score ?? 90;

  // Desglose de los 4 pilares
  const p1 = Math.round(score * 0.35 * 10) / 10;
  const p2 = Math.round(score * 0.30 * 10) / 10;
  const p3 = Math.round(score * 0.20 * 10) / 10;
  const p4 = Math.round((score - p1 - p2 - p3) * 10) / 10;

  let veredictoBadge = "bg-emerald-500/20 text-emerald-800 dark:text-[#00FF88] border-emerald-500/40";
  let veredictoTitulo = "🟢 Compra Fuerte • Máxima Calidad Conservadora";
  let veredictoTexto = `Inversión institucional de grado de inversión superior (${bond.rating}). Ideal para asegurar una renta anual del ${bond.tir_usd}% en dólares billete con riesgo de impago prácticamente nulo.`;

  if (score < 85) {
    veredictoBadge = "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30";
    veredictoTitulo = "🔵 Oportunidad Sólida de Renta Fija";
    veredictoTexto = `Buen perfil de rendimiento y solvencia para diversificar cartera de renta fija en dólares a mediano plazo.`;
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#091220] border border-slate-200 dark:border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto text-slate-900 dark:text-slate-100 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center border border-slate-300 dark:border-slate-700 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado del Bono */}
        <div className="flex items-start gap-3 sm:gap-4 pr-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#070D18] border-2 border-[#00FF88]/50 shadow-[0_0_20px_rgba(0,255,136,0.25)] flex items-center justify-center shrink-0 text-xl sm:text-2xl">
            {bond.brand_icon || "🏛️"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {bond.issuer}
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-[#00FF88] border border-emerald-500/30 font-bold">
                {bond.ticker}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00FF88]" />
              <span>Guía educativa: ¿Cómo calculó la IA el Score de {score}/100?</span>
            </p>
          </div>
        </div>

        {/* Banner Destacado del Score */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 dark:from-emerald-950/40 dark:via-[#0c1c2e] dark:to-[#07111e] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-[#00FF88] block">
              Quant Score Institucional
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-[#00FF88]">
                {score}
              </span>
              <span className="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-300">
                / 100 puntos
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-xs">
            <div className="text-slate-500 dark:text-slate-400">Rendimiento YTM: <strong className="text-emerald-600 dark:text-[#00FF88]">{bond.tir_usd}% anual USD</strong></div>
            <div className="text-blue-600 dark:text-blue-400 font-bold">Calificación: {bond.rating} ({bond.moodys})</div>
          </div>
        </div>

        {/* Explicación Didáctica Paso a Paso */}
        <div className="mt-5 space-y-3 font-sans">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Explicación paso a paso de los 4 factores
          </div>

          {/* Factor 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-700 dark:text-[#00FF88]">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed w-full">
              <div className="flex items-center justify-between mb-0.5">
                <strong className="text-slate-900 dark:text-white font-semibold">
                  1. Rendimiento Seguro en Dólares ({bond.tir_usd}% anual)
                </strong>
                <span className="text-emerald-700 dark:text-[#00FF88] font-mono font-bold text-xs shrink-0 ml-2">
                  +{p1.toFixed(1)} / 35 pts
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Paga un <strong className="text-slate-900 dark:text-white">{bond.tir_usd}% anual en dólares billete</strong>, superando con creces a cualquier plazo fijo o caja de ahorro bancaria en USD (que suele pagar 1% o 2%).
              </p>
            </div>
          </div>

          {/* Factor 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed w-full">
              <div className="flex items-center justify-between mb-0.5">
                <strong className="text-slate-900 dark:text-white font-semibold">
                  2. Calificación de Máxima Seguridad ({bond.rating} / {bond.moodys})
                </strong>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-xs shrink-0 ml-2">
                  +{p2.toFixed(1)} / 30 pts
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Avalado por S&P, Moody&apos;s y Fitch. {bond.issuer} tiene probabilidad de impago casi nula (&lt; 0.05%) y estructura Bullet garantizada (no te cancelan el bono de forma imprevista).
              </p>
            </div>
          </div>

          {/* Factor 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed w-full">
              <div className="flex items-center justify-between mb-0.5">
                <strong className="text-slate-900 dark:text-white font-semibold">
                  3. Solvencia y Negocio en la Economía Real
                </strong>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold text-xs shrink-0 ml-2">
                  +{p3.toFixed(1)} / 20 pts
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {bond.issuer} opera en el sector de <strong className="text-slate-900 dark:text-white">{bond.brand_category}</strong> con demanda diaria continua. Su colchón de caja operativa cubre decenas de veces los intereses de su deuda.
              </p>
            </div>
          </div>

          {/* Factor 4 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed w-full">
              <div className="flex items-center justify-between mb-0.5">
                <strong className="text-slate-900 dark:text-white font-semibold">
                  4. Liquidez Institucional de Salida
                </strong>
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-xs shrink-0 ml-2">
                  +{p4.toFixed(1)} / 15 pts
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Es una emisión masiva de <strong className="text-slate-900 dark:text-white">{bond.amount_outstanding_usd}</strong> negociada en el sistema TRACE de Wall Street. Si necesitás vender antes de {bond.maturity}, podés hacerlo en el mercado con alta liquidez.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de la Suma */}
        <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-[#060c16] border border-slate-300 dark:border-slate-700/80 font-mono text-center text-xs text-slate-800 dark:text-slate-200">
          <span className="text-slate-500">Cálculo Total: </span>
          <span>{p1.toFixed(1)} + {p2.toFixed(1)} + {p3.toFixed(1)} + {p4.toFixed(1)}</span> ={" "}
          <strong className="text-emerald-600 dark:text-[#00FF88] text-sm">{score} / 100 pts</strong>
        </div>

        {/* Tarjeta de Veredicto Final */}
        <div className={`mt-4 p-3.5 sm:p-4 rounded-xl border ${veredictoBadge} text-xs sm:text-sm leading-relaxed`}>
          <div className="font-bold text-sm mb-1 flex items-center gap-2">
            <span>{veredictoTitulo}</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300">
            {veredictoTexto}
          </p>
        </div>

        {/* Acceso a las Calificaciones de S&P, Moody's y Fitch */}
        {onOpenYieldRating && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              ¿Querés ver las notas de S&P, Moody&apos;s y Fitch?
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenYieldRating(bond);
              }}
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Ver ficha de calificación crediticia</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
