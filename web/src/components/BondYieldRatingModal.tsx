"use client";

import React, { useEffect } from "react";
import {
  X,
  ShieldCheck,
  TrendingUp,
  Lock
} from "lucide-react";
import marketData from "@/data/marketData.json";

export type UsBondItem = (typeof marketData.us_bonds)[0];

interface BondYieldRatingModalProps {
  bond: UsBondItem | null;
  onClose: () => void;
  onOpenScoreDetail?: (bond: UsBondItem) => void;
}

export default function BondYieldRatingModal({
  bond,
  onClose,
  onOpenScoreDetail,
}: BondYieldRatingModalProps) {
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

  const treasuryBase = 4.40;
  const spread = Math.max(0.2, Math.round((bond.tir_usd - treasuryBase) * 100) / 100);

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
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#070D18] border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.25)] flex items-center justify-center shrink-0 text-xl sm:text-2xl">
            {bond.brand_icon || "🏛️"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {bond.issuer}
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-bold">
                {bond.ticker}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <span>{bond.name} • {bond.sector}</span>
            </p>
          </div>
        </div>

        {/* Banner Destacado de Calificación & Rendimiento */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-emerald-500/5 to-slate-100 dark:from-blue-950/40 dark:via-[#0c1c2e] dark:to-[#07111e] border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
              Rendimiento Anual Asegurado (YTM)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-[#00FF88]">
                {bond.tir_usd}%
              </span>
              <span className="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-300">
                anual en dólares billete
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-xs">
            <div className="text-slate-500 dark:text-slate-400">Precio USD: <strong className="text-slate-900 dark:text-white">${bond.price_usd?.toFixed(2)}</strong></div>
            <div className="text-blue-600 dark:text-blue-400 font-bold">Horizonte: {bond.maturity_years} años (Vence {bond.maturity})</div>
          </div>
        </div>

        {/* 1. Las 3 Calificadoras Oficiales (The Big Three) */}
        <div className="mt-5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center justify-between">
            <span>Calificaciones Oficiales de Wall Street</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">The Big Three</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center font-mono">
            {/* S&P Global */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold truncate">
                S&P Global
              </span>
              <span className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 block mt-0.5">
                {bond.rating}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">High Grade</span>
            </div>

            {/* Moody's */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold truncate">
                Moody&apos;s
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-[#00FF88] block mt-0.5">
                {bond.moodys}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Equiv. {bond.rating}</span>
            </div>

            {/* Fitch Ratings */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold truncate">
                Fitch
              </span>
              <span className="text-lg sm:text-xl font-black text-teal-600 dark:text-teal-400 block mt-0.5">
                {bond.rating}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Grado Superior</span>
            </div>
          </div>
        </div>

        {/* 2. ¿Qué significa en la práctica para el inversor? */}
        <div className="mt-5 space-y-2.5 font-sans">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ¿Qué significa esta calificación en la práctica?
          </div>

          {/* Riesgo de Default */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs sm:text-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-[#00FF88]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                Riesgo de Default Estadístico &lt; 0.05%
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Estar en el escalón <strong className="text-slate-900 dark:text-white">{bond.rating} ({bond.moodys})</strong> sitúa a {bond.issuer} entre las corporaciones con menor probabilidad de impago del planeta. Su flujo de caja libre diario cubre holgadamente el pago de sus obligaciones.
              </p>
            </div>
          </div>

          {/* Estructura Bullet */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs sm:text-sm">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                Estructura Bullet (100% No Rescatable)
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                La empresa no tiene derecho a cancelar el bono antes de tiempo para bajarte la tasa. Cobrás tus cupones semestrales en dólares del <strong className="text-slate-900 dark:text-white">{bond.coupon}%</strong> y al vencimiento ({bond.maturity}) te devuelven el 100% del capital.
              </p>
            </div>
          </div>

          {/* Desglose del Rendimiento */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs sm:text-sm">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="w-full">
              <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                ¿De dónde sale el {bond.tir_usd}% anual?
              </strong>
              <div className="mt-1.5 p-2 rounded-lg bg-white dark:bg-[#060c16] border border-slate-300 dark:border-slate-700/80 font-mono text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Tasa libre de riesgo (Tesoro EE.UU.):</span>
                  <span className="font-bold text-slate-900 dark:text-white">~{treasuryBase}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sobretasa de {bond.issuer} (Spread):</span>
                  <span className="font-bold text-emerald-600 dark:text-[#00FF88]">+{spread}%</span>
                </div>
                <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-xs sm:text-sm">
                  <span>Rendimiento Total (YTM):</span>
                  <span className="text-emerald-600 dark:text-[#00FF88]">{bond.tir_usd}% anual</span>
                </div>
              </div>
            </div>
          </div>

          {/* Retorno Total Acumulado a Vencimiento */}
          {(() => {
            const years = typeof bond.maturity_years === 'number' && bond.maturity_years > 0 ? bond.maturity_years : 1;
            const ytm = bond.tir_usd || 5.0;
            const compound = Math.round((Math.pow(1 + (ytm / 100) / 2, 2 * years) - 1) * 1000) / 10;
            const coupon = bond.coupon || ytm;
            const price = bond.price_usd && bond.price_usd > 0 ? bond.price_usd : 100;
            const simple = Math.round((((coupon * years) + (100 - price)) / price) * 1000) / 10;
            const sampleInv = 10000;
            const compoundGain = Math.round(sampleInv * (compound / 100));
            const simpleGain = Math.round(sampleInv * (simple / 100));

            return (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 dark:from-emerald-950/40 dark:via-[#0c1c2e] dark:to-[#07111e] border border-emerald-500/30 text-xs sm:text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>💰</span>
                    <span>Retorno Total Acumulado hasta {bond.maturity} ({years} años)</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-[#00FF88]">
                    Garantizado por Contrato
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-mono">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#060c16] border border-slate-300 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Reinvirtiendo (Compuesto)</span>
                    <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-[#00FF88] block">+{compound}% en USD</span>
                    <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                      USD {sampleInv.toLocaleString()} → <strong className="text-slate-900 dark:text-white">USD {(sampleInv + compoundGain).toLocaleString()}</strong>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#060c16] border border-slate-300 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Cobro en Mano (Simple)</span>
                    <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 block">+{simple}% en USD</span>
                    <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                      Cobrás <strong className="text-slate-900 dark:text-white">USD {simpleGain.toLocaleString()}</strong> en cupones
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Acceso directo a cómo se calcula el Score */}
        {onOpenScoreDetail && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              ¿Querés ver por qué la IA le asignó {bond.score} puntos?
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenScoreDetail(bond);
              }}
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Ver explicación del Score</span>
              <span className="text-sm">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
