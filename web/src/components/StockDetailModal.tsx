"use client";

import React from "react";
import { X, Layers } from "lucide-react";
import marketData from "@/data/marketData.json";

import { StockItem, EtfItem } from "@/types/market";
export type ModalItem = StockItem | EtfItem;

interface StockDetailModalProps {
  stock: ModalItem | null;
  onClose: () => void;
}

export default function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
  if (!stock) return null;

  const macro = (marketData as { macro?: import("@/types/market").MacroData }).macro;
  const isEtf = "expense_ratio" in stock;
  const tagLabel = "sector" in stock ? stock.sector : (stock as EtfItem).category;

  const targetAlgoritmo = "precio_objetivo_algoritmo" in stock && stock.precio_objetivo_algoritmo
    ? stock.precio_objetivo_algoritmo
    : stock.target_price;

  const retornoEstimado = "retorno_estimado_pct" in stock && stock.retorno_estimado_pct !== undefined
    ? stock.retorno_estimado_pct
    : stock.upside;

  const qb = "quant_breakdown" in stock ? stock.quant_breakdown : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
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

        {/* Encabezado del Activo */}
        <div className="flex items-start gap-3 sm:gap-4 pr-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#070D18] border-2 border-[#00FF88]/50 shadow-[0_0_20px_rgba(0,255,136,0.25)] flex items-center justify-center shrink-0">
            <span
              className={`font-black font-mono text-white tracking-wider ${
                stock.ticker.length > 4 ? "text-xs" : stock.ticker.length > 3 ? "text-sm" : "text-base sm:text-lg"
              }`}
            >
              {stock.ticker}
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stock.name}
              </h3>
              <span className="px-2 py-0.5 rounded bg-cyan-50 dark:bg-[#132840] border border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200 text-xs font-semibold">
                {tagLabel}
              </span>
              {isEtf && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  {(stock as EtfItem).manager}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-300">
              <span>
                Precio USA: <strong className="text-slate-900 dark:text-white">${stock.price.toFixed(2)} USD</strong>
              </span>
              <span>•</span>
              {stock.cedear_price_ars ? (
                <>
                  <span>
                    CEDEAR: <strong className="text-emerald-700 dark:text-[#00F5A0]">${stock.cedear_price_ars.toLocaleString("es-AR")} ARS</strong>
                  </span>
                  <span>•</span>
                  <span>Ratio: {stock.cedear_ratio}</span>
                </>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  Operable vía <strong className="text-cyan-700 dark:text-cyan-300 font-semibold">Broker Exterior (NYSE / NASDAQ)</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 1. Métrica Principal: Precio Objetivo Cuantitativo a 1 Año (3 Capas) */}
        {!isEtf && targetAlgoritmo && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#0a182b] border border-emerald-200 dark:border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700 dark:text-[#00F5A0]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Precio Objetivo Cuantitativo (Algoritmo 3 Capas)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-[#00F5A0] font-mono font-bold text-xs border border-emerald-300 dark:border-emerald-500/40">
                12 Meses
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  ${targetAlgoritmo.toFixed(2)} USD
                </span>
                <span className="text-lg font-black font-mono text-emerald-700 dark:text-[#00F5A0]">
                  {retornoEstimado && retornoEstimado >= 0 ? `+${retornoEstimado}%` : `${retornoEstimado}%`}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                Consenso Wall Street:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {(() => {
                    const bTargets = stock.analyst_consensus?.banks?.map((b) => b.target).filter((t) => typeof t === "number" && t > 0) || [];
                    const meanVal = bTargets.length > 0
                      ? bTargets.reduce((a, b) => a + b, 0) / bTargets.length
                      : (stock.analyst_consensus?.target_mean ?? stock.target_price ?? stock.price);
                    const pctVal = stock.price ? Math.round(((meanVal - stock.price) / stock.price) * 1000) / 10 : 0;
                    return (
                      <>
                        ${meanVal.toFixed(2)} USD{" "}
                        <span className="text-emerald-600 dark:text-[#00FF88] font-bold">
                          ({pctVal >= 0 ? `+${pctVal}%` : `${pctVal}%`})
                        </span>
                      </>
                    );
                  })()}
                </strong>
              </div>
            </div>

            {/* Micro Breakdown de las 3 Capas */}
            {qb && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-white dark:bg-[#081220] p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Capa A (PER Base)</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{qb.per_base}x</span>
                </div>
                <div
                  className="bg-white dark:bg-[#081220] p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
                  title={`FED Actual: ${qb.tasa_actual_fed ?? macro?.tasa_actual_fed ?? 3.88}% | Proyectada 1A: ${qb.tasa_proyectada_fed_1a ?? macro?.tasa_proyectada_fed_1a ?? 3.16}%`}
                >
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Capa B (Ajuste Macro)</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">+{Math.round((qb.factor_macro - 1) * 1000) / 10}%</span>
                </div>
                <div className="bg-white dark:bg-[#081220] p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Capa C (PER Ajustado)</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-[#00F5A0]">{qb.per_ajustado}x</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Métricas Fundamentales Clave (PER, Market Cap, Último Balance, Recomendación) */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEtf ? "Métricas Clave del Fondo / ETF" : "Métricas Fundamentales de Mercado"}
          </span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-2">
            <div className="bg-slate-100/90 dark:bg-[#0e1b2f] p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                {isEtf ? (stock.pe_ratio ? "P/E Ponderado" : "Costo Anual") : "P/E Ratio (PER)"}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
                {isEtf
                  ? stock.pe_ratio
                    ? `${stock.pe_ratio}x`
                    : `${(stock as EtfItem).expense_ratio}%`
                  : stock.pe_ratio ? `${stock.pe_ratio}x` : "N/D"}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate block">
                {isEtf ? (stock.pe_ratio ? "Valuación de cartera" : "Comisión de gestión") : "Múltiplo precio/ganancia"}
              </span>
            </div>

            <div className="bg-slate-100/90 dark:bg-[#0e1b2f] p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                {isEtf ? "Patrimonio (AUM)" : "Capitalización (Market Cap)"}
              </span>
              <div className="text-lg font-black text-emerald-700 dark:text-[#00F5A0] font-mono mt-0.5 truncate">
                {isEtf ? (stock as EtfItem).aum || "N/D" : (stock as StockItem).market_cap || "N/D"}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate block">
                {isEtf ? "Activos bajo gestión" : "Valuación bursátil"}
              </span>
            </div>

            <div className="bg-slate-100/90 dark:bg-[#0e1b2f] p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                {isEtf ? "Rebalanceo" : "Último Balance"}
              </span>
              <div className="text-lg font-black text-cyan-700 dark:text-cyan-300 font-mono mt-0.5 truncate">
                {isEtf
                  ? "Trimestral"
                  : (stock as StockItem).last_earnings_date || "Auditado 2026"}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate block">
                {isEtf
                  ? "Ajuste de cartera"
                  : (stock as StockItem).next_earnings_date
                    ? `Próx: ${(stock as StockItem).next_earnings_date}`
                    : (stock as StockItem).earnings_quarter || "Resultados trimestrales"}
              </span>
            </div>

            <div className="bg-slate-100/90 dark:bg-[#0e1b2f] p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Recomendación General</span>
              <div
                className={`text-lg font-black font-mono mt-0.5 truncate ${
                  (stock as StockItem).is_under_review || /revisión|revision/i.test(stock.recommendation || "")
                    ? "text-purple-600 dark:text-purple-400"
                    : /sobreponderar|fuerte compra|compra|buy|outperform/i.test(stock.recommendation || "")
                    ? "text-emerald-700 dark:text-[#00FF88]"
                    : /mantener|neutral|hold/i.test(stock.recommendation || "")
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {(stock as StockItem).is_under_review ? "En Revisión" : (stock.recommendation || "Sobreponderar")}
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono truncate block">
                {(stock as StockItem).is_under_review ? "⚠️ Ajuste pendiente" : (isEtf ? "Estrategas & Consenso" : "Consenso Bancos Tier-1")}
              </span>
            </div>
          </div>
        </div>

        {/* Banner de Advertencia de Volatilidad / Revisión Post-Balance */}
        {Boolean((stock as StockItem).is_under_review || qb?.earnings_lock || (qb?.crash_penalty && qb.crash_penalty > 0)) && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-mono flex items-start gap-2.5">
            <span className="text-base leading-none">⚠️</span>
            <div className="space-y-0.5">
              <span className="font-bold block">Activo en Observación / Descuento Cuantitativo por Volatilidad</span>
              <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                Este activo experimentó una corrección reciente o presenta pronósticos previos al último guidance de resultados. El algoritmo de 3 capas aplicó el candado institucional con un descuento de {qb?.crash_penalty || 35} pts y degradó la recomendación para proteger el capital contra falsas gangas.
              </p>
            </div>
          </div>
        )}

        {/* 3. Desglose por Banco de Inversión con Fecha de Publicación */}
        {stock.analyst_consensus?.banks && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEtf ? "Consenso de Estrategas y Bancos de Inversión (12 Meses)" : "Consenso Individual de Bancos de Inversión (12 Meses)"}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                Fecha del informe
              </span>
            </div>
            <div className="mt-1 divide-y divide-slate-200 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0a1424]/90 max-h-48 overflow-y-auto">
              {stock.analyst_consensus.banks.map((bank, bIdx) => {
                const upsideBank = Math.round(((bank.target - stock.price) / stock.price) * 1000) / 10;
                const isTopTarget = bank.target === stock.analyst_consensus?.target_high;
                return (
                  <div
                    key={bIdx}
                    className={`flex items-center justify-between p-2.5 sm:px-3.5 text-xs sm:text-sm font-mono ${
                      isTopTarget ? "bg-emerald-50 dark:bg-emerald-500/10" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                      <span className={`font-semibold ${isTopTarget ? "text-emerald-700 dark:text-[#00F5A0] font-bold" : "text-slate-900 dark:text-white"}`}>
                        {bank.name}
                      </span>
                      {"date" in bank && bank.date && (
                        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          • {bank.date}
                        </span>
                      )}
                      {(bank.is_pre_earnings || ((stock as StockItem).is_under_review && !isEtf)) && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold font-mono">
                          Pre-Balance / En Revisión
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hidden sm:inline">
                        {bank.rating}
                      </span>
                      <span className="text-slate-900 dark:text-white font-extrabold">${bank.target} USD</span>
                      <span className={`font-bold text-xs ${upsideBank >= 0 ? "text-emerald-700 dark:text-[#00F5A0]" : "text-rose-600 dark:text-rose-400"}`}>
                        {upsideBank >= 0 ? `+${upsideBank}%` : `${upsideBank}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Nota Explicativa Metodológica */}
        <div className="mt-4 p-3 rounded-xl bg-cyan-50/70 dark:bg-[#0c1a2f] border border-cyan-200 dark:border-cyan-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
          <span className="text-emerald-700 dark:text-[#00F5A0] font-bold mr-1">💡 Metodología Cuantitativa:</span>
          {!isEtf ? (
            <span>
              El Precio Objetivo Teórico se calcula en 3 capas: fusiona el 65% de la mediana histórica del PER (5 años) con el 35% del PER implícito de bancos, aplica un factor macroeconómico de ajuste por ciclo de tasas de la Reserva Federal (FED actual: {macro?.tasa_actual_fed ?? 3.88}% → Proy: {macro?.tasa_proyectada_fed_1a ?? 3.16}%), y lo multiplica por el EPS Forward proyectado.
            </span>
          ) : (
            <span>
              {stock.analyst_consensus?.explanation || "Consenso de los principales bancos de inversión y estrategas macro de Wall Street."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
