"use client";

import React from "react";
import { X, Layers } from "lucide-react";
import marketData from "@/data/marketData.json";

export type StockItem = (typeof marketData.stocks)[0];
export type EtfItem = (typeof marketData.etfs)[0];
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#091220] border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado del Activo */}
        <div className="flex items-start gap-3 sm:gap-4 pr-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-900/40 border border-emerald-500/40 flex items-center justify-center text-[#00F5A0] font-black font-mono text-lg shadow-[0_0_15px_rgba(0,245,160,0.2)]">
            {stock.ticker}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white font-mono">
                {stock.name}
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#132840] border border-cyan-500/40 text-cyan-200 text-xs font-semibold">
                {tagLabel}
              </span>
              {isEtf && (
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  {(stock as EtfItem).manager}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm font-mono text-slate-300">
              <span>
                Precio USA: <strong className="text-white">${stock.price.toFixed(2)} USD</strong>
              </span>
              <span>•</span>
              <span>
                CEDEAR: <strong className="text-[#00F5A0]">${stock.cedear_price_ars.toLocaleString("es-AR")} ARS</strong>
              </span>
              <span>•</span>
              <span>Ratio: {stock.cedear_ratio}</span>
            </div>
          </div>
        </div>

        {/* 1. Métrica Principal: Precio Objetivo Cuantitativo a 1 Año (3 Capas) */}
        {!isEtf && targetAlgoritmo && (
          <div className="mt-5 p-4 rounded-2xl bg-[#0a182b] border border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00F5A0]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Precio Objetivo Cuantitativo (Algoritmo 3 Capas)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[#00F5A0] font-mono font-bold text-xs border border-emerald-500/40">
                12 Meses
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  ${targetAlgoritmo.toFixed(2)} USD
                </span>
                <span className="text-lg font-black font-mono text-[#00F5A0]">
                  {retornoEstimado && retornoEstimado >= 0 ? `+${retornoEstimado}%` : `${retornoEstimado}%`}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-300">
                Consenso Wall Street: <strong className="text-white">${stock.target_price?.toFixed(2)} USD</strong>
              </div>
            </div>

            {/* Micro Breakdown de las 3 Capas */}
            {qb && (
              <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#081220] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Capa A (PER Base)</span>
                  <span className="text-xs font-bold text-white">{qb.per_base}x</span>
                </div>
                <div
                  className="bg-[#081220] p-2 rounded-lg border border-slate-800"
                  title={`FED Actual: ${qb.tasa_actual_fed ?? macro?.tasa_actual_fed ?? 3.88}% | Proyectada 1A: ${qb.tasa_proyectada_fed_1a ?? macro?.tasa_proyectada_fed_1a ?? 3.16}%`}
                >
                  <span className="text-[10px] text-slate-400 block">Capa B (Ajuste Macro)</span>
                  <span className="text-xs font-bold text-emerald-400">+{Math.round((qb.factor_macro - 1) * 1000) / 10}%</span>
                </div>
                <div className="bg-[#081220] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Capa C (PER Ajustado)</span>
                  <span className="text-xs font-bold text-[#00F5A0]">{qb.per_ajustado}x</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Métricas Fundamentales Clave (PER y Market Cap / AUM) */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            {isEtf ? "Métricas Clave del Fondo / ETF" : "Métricas Fundamentales de Mercado"}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            <div className="bg-[#0e1b2f] p-3 rounded-xl border border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                {isEtf ? (stock.pe_ratio ? "P/E Ponderado (PER)" : "Costo Anual (Expense)") : "P/E Ratio (PER)"}
              </span>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {isEtf
                  ? stock.pe_ratio
                    ? `${stock.pe_ratio}x`
                    : `${(stock as EtfItem).expense_ratio}%`
                  : stock.pe_ratio ? `${stock.pe_ratio}x` : "N/D"}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {isEtf ? (stock.pe_ratio ? "Valuación de cartera" : "Comisión de administración") : "Múltiplo precio/ganancia"}
              </span>
            </div>

            <div className="bg-[#0e1b2f] p-3 rounded-xl border border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                {isEtf ? "Patrimonio (AUM)" : "Capitalización (Market Cap)"}
              </span>
              <div className="text-lg font-black text-[#00F5A0] font-mono mt-0.5">
                {stock.market_cap || "N/D"}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {isEtf ? "Activos bajo gestión" : "Valuación bursátil"}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-[#0e1b2f] p-3 rounded-xl border border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Recomendación General</span>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {stock.recommendation || "Sobreponderar"}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {isEtf ? "Estrategas & Consenso" : "Bancos de Inversión Tier-1"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Desglose por Banco de Inversión con Fecha de Publicación */}
        {stock.analyst_consensus?.banks && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {isEtf ? "Consenso de Estrategas y Bancos de Inversión (12 Meses)" : "Consenso Individual de Bancos de Inversión (12 Meses)"}
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                Fecha del informe
              </span>
            </div>
            <div className="mt-1 divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-[#0a1424]/90 max-h-48 overflow-y-auto">
              {stock.analyst_consensus.banks.map((bank, bIdx) => {
                const upsideBank = Math.round(((bank.target - stock.price) / stock.price) * 1000) / 10;
                const isTopTarget = bank.target === stock.analyst_consensus.target_high;
                return (
                  <div
                    key={bIdx}
                    className={`flex items-center justify-between p-2.5 sm:px-3.5 text-xs sm:text-sm font-mono ${
                      isTopTarget ? "bg-emerald-500/10" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                      <span className={`font-semibold ${isTopTarget ? "text-[#00F5A0] font-bold" : "text-white"}`}>
                        {bank.name}
                      </span>
                      {"date" in bank && bank.date && (
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                          • {bank.date}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline">
                        {bank.rating}
                      </span>
                      <span className="text-white font-extrabold">${bank.target} USD</span>
                      <span className={`font-bold text-xs ${upsideBank >= 0 ? "text-[#00F5A0]" : "text-rose-400"}`}>
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
        <div className="mt-4 p-3 rounded-xl bg-[#0c1a2f] border border-cyan-500/20 text-xs text-slate-300 leading-relaxed font-mono">
          <span className="text-[#00F5A0] font-bold mr-1">💡 Metodología Cuantitativa:</span>
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
