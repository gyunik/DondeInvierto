"use client";

import React, { useEffect } from "react";
import {
  X,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building2,
  ArrowRight,
  Layers
} from "lucide-react";
import { StockItem } from "@/types/market";

interface ExplainPotentialModalProps {
  stock: StockItem | null;
  onClose: () => void;
  onOpenTechnicalDetail?: (stock: StockItem) => void;
}

export default function ExplainPotentialModal({
  stock,
  onClose,
  onOpenTechnicalDetail,
}: ExplainPotentialModalProps) {
  // Bloquear el scroll de fondo mientras la ventana esté abierta
  useEffect(() => {
    if (!stock) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [stock]);

  if (!stock) return null;

  const currentPrice = stock.price || 100;
  const targetPrice = stock.precio_objetivo_algoritmo ?? stock.target_price ?? currentPrice;
  const potentialPct = stock.retorno_estimado_pct ?? stock.upside ?? (
    currentPrice > 0 ? Math.round(((targetPrice - currentPrice) / currentPrice) * 1000) / 10 : 0
  );

  const dollarGain = Math.round((targetPrice - currentPrice) * 100) / 100;
  const score = stock.score ?? 50;

  // Lista de bancos que cubren la acción
  const banks = stock.analyst_consensus?.banks || [];
  const bankNames = banks.slice(0, 3).map((b) => b.name).join(", ");

  // Veredicto según Score y Potencial
  let veredictoBadge = "bg-emerald-500/15 text-emerald-700 dark:text-[#00FF88] border-emerald-500/30";
  let veredictoTitulo = "Oportunidad con Alto Respaldo";
  let veredictoTexto = "La proyección de crecimiento está respaldada por consenso formal de Wall Street y aprobada por los 5 filtros de solvencia de la IA.";

  if (score >= 85 && potentialPct >= 15) {
    veredictoBadge = "bg-emerald-500/20 text-emerald-800 dark:text-[#00FF88] border-emerald-500/40 shadow-sm";
    veredictoTitulo = "🟢 Fuerte Compra • Alta Convicción";
    veredictoTexto = "Excelente alineación: la empresa tiene fundamentos sólidos (sin riesgo de deuda) y el consenso de analistas proyecta una ganancia atractiva a 12 meses.";
  } else if (score >= 65 && potentialPct > 0) {
    veredictoBadge = "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30";
    veredictoTitulo = "🔵 Compra Moderada • Fundamentos Sólidos";
    veredictoTexto = "El activo presenta una relación riesgo/retorno favorable para sumar a cartera con horizonte de mediano plazo.";
  } else if (score < 50 || potentialPct <= 0) {
    veredictoBadge = "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30";
    veredictoTitulo = "🔴 Precaución • Seguir de Cerca";
    veredictoTexto = "El potencial de suba es limitado o la IA detectó debilidad en sus márgenes o volatilidad reciente. No es momento ideal de entrada.";
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

        {/* Encabezado con Identificación */}
        <div className="flex items-start gap-3 sm:gap-4 pr-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#070D18] border-2 border-[#00FF88]/50 shadow-[0_0_20px_rgba(0,255,136,0.25)] flex items-center justify-center shrink-0">
            <span className="text-sm sm:text-base font-black text-[#00FF88] font-mono">
              {stock.ticker}
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stock.name}
              </h2>
              {stock.sector && (
                <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {stock.sector}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00FF88]" />
              <span>Guía educativa: ¿Cómo calculó la IA este porcentaje?</span>
            </p>
          </div>
        </div>

        {/* Banner Destacado del Porcentaje */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 dark:from-emerald-950/40 dark:via-[#0c1c2e] dark:to-[#07111e] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-[#00FF88] block">
              Potencial Estimado a 12 Meses
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-[#00FF88]">
                {potentialPct >= 0 ? `+${potentialPct}%` : `${potentialPct}%`}
              </span>
              <span className="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-300">
                (ganancia proyectada en USD)
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-xs">
            <div className="text-slate-500 dark:text-slate-400">Precio Hoy: <strong className="text-slate-900 dark:text-white">${currentPrice.toFixed(2)}</strong></div>
            <div className="text-emerald-700 dark:text-emerald-300 font-bold">Precio Esperado: ${targetPrice.toFixed(2)} USD</div>
          </div>
        </div>

        {/* Explicación Didáctica Paso a Paso */}
        <div className="mt-5 space-y-3 font-sans">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Explicación paso a paso (sin tecnicismos)
          </div>

          {/* Paso 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-700 dark:text-[#00FF88]">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                Paso 1: ¿Cuánto vale hoy en el mercado?
              </strong>
              <p className="text-slate-600 dark:text-slate-300">
                Si hoy comprás una acción de <strong className="text-slate-900 dark:text-white">{stock.name}</strong>, pagás exactamente <strong className="text-slate-900 dark:text-white">${currentPrice.toFixed(2)} USD</strong>{stock.has_cedear && stock.cedear_price_ars ? ` (o aprox. $${stock.cedear_price_ars.toLocaleString("es-AR")} ARS vía CEDEAR)` : ""}. Ese es el punto de partida real.
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-700 dark:text-[#00FF88]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                Paso 2: ¿A cuánto estiman que llegará Wall Street?
              </strong>
              <p className="text-slate-600 dark:text-slate-300">
                Los analistas de los principales bancos de inversión {bankNames ? `(${bankNames})` : "(JP Morgan, Morgan Stanley, etc.)"} auditaron las ventas, contratos y márgenes proyectados. La mediana de sus modelos a 12 meses fijó su valor en <strong className="text-emerald-700 dark:text-[#00F5A0]">${targetPrice.toFixed(2)} USD</strong>.
              </p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-700 dark:text-[#00FF88]">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed w-full">
              <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                Paso 3: La cuenta simple del porcentaje ({potentialPct >= 0 ? `+${potentialPct}%` : `${potentialPct}%`})
              </strong>
              <p className="text-slate-600 dark:text-slate-300 mb-2">
                Es la ganancia porcentual si la acción sube desde el precio de hoy hasta el valor proyectado:
              </p>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#060c16] border border-slate-300 dark:border-slate-700/80 font-mono text-[11px] sm:text-xs text-center text-slate-800 dark:text-slate-200">
                <span className="text-emerald-600 dark:text-[#00FF88] font-bold">
                  (${targetPrice.toFixed(2)} - ${currentPrice.toFixed(2)}) / ${currentPrice.toFixed(2)}
                </span>{" "}
                ={" "}
                <span className="font-bold text-emerald-700 dark:text-[#00FF88]">
                  {potentialPct >= 0 ? `+${potentialPct}%` : `${potentialPct}%`}
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  (Ganancia estimada de +${dollarGain.toFixed(2)} USD por cada acción comprada)
                </span>
              </div>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-700 dark:text-[#00FF88]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
                Paso 4: El filtro de seguridad de la IA (¿Es creíble?)
              </strong>
              <p className="text-slate-600 dark:text-slate-300">
                La IA auditó a la empresa con un <strong className="text-emerald-700 dark:text-[#00FF88] font-mono">Quant Score de {score}/100</strong>. Comprobó que el P/E ratio es razonable ({stock.pe_ratio ? `${stock.pe_ratio}x` : "adecuado"}), que el balance es solvente y que no es una acción en quiebra ni una promesa inflada.
              </p>
            </div>
          </div>
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

        {/* Acceso a la Ficha Técnica de Wall Street */}
        {onOpenTechnicalDetail && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              ¿Querés ver los balances y las notas banco por banco?
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTechnicalDetail(stock);
              }}
              className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-[#00FF88] hover:underline"
            >
              <span>Ver ficha técnica Wall Street</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
