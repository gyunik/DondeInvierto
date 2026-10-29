"use client";

import React from "react";
import { X } from "lucide-react";
import marketData from "@/data/marketData.json";

export type StockItem = (typeof marketData.stocks)[0];

interface StockDetailModalProps {
  stock: StockItem | null;
  onClose: () => void;
}

export default function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
  if (!stock) return null;

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
                {stock.sector}
              </span>
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

        {/* 1. Métricas Fundamentales Clave (PER y Market Cap) */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Métricas Fundamentales de Mercado
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            <div className="bg-[#0e1b2f] p-3 rounded-xl border border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase">P/E Ratio (PER)</span>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {stock.pe_ratio ? `${stock.pe_ratio}x` : "N/D"}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Múltiplo precio/ganancia</span>
            </div>

            <div className="bg-[#0e1b2f] p-3 rounded-xl border border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Capitalización (Market Cap)</span>
              <div className="text-lg font-black text-[#00F5A0] font-mono mt-0.5">
                {stock.market_cap || "N/D"}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Valuación bursátil</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-[#0e1b2f] p-3 rounded-xl border border-slate-700/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Recomendación General</span>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {stock.recommendation}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Bancos de Inversión Tier-1</span>
            </div>
          </div>
        </div>

        {/* 2. Proyección de Bancos de Inversión (Precio Objetivo) */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Proyección a 12 Meses (Promedio Bancos Tier-1)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-white font-mono">
                  ${stock.target_price ? stock.target_price.toFixed(2) : "N/D"} USD
                </span>
                <span className="text-sm font-bold font-mono text-[#00F5A0]">
                  {stock.upside && stock.upside >= 0 ? `+${stock.upside}%` : `${stock.upside}%`} potencial medio
                </span>
              </div>
            </div>
          </div>

          {/* Rango Visual Mín / Medio / Máx */}
          {stock.analyst_consensus && (
            <div className="mt-3 bg-[#0a1424] p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>
                  Mínimo: <strong className="text-slate-200">${stock.analyst_consensus.target_low}</strong>
                </span>
                <span>
                  Promedio Tier-1: <strong className="text-[#00F5A0]">${stock.analyst_consensus.target_mean}</strong>
                </span>
                <span>
                  Máximo: <strong className="text-slate-200">${stock.analyst_consensus.target_high}</strong>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Desglose por Banco de Inversión con Fecha de Publicación */}
        {stock.analyst_consensus?.banks && (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Visión de los Principales Bancos de Inversión (12 Meses)
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                Fecha del informe
              </span>
            </div>
            <div className="mt-1 divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-[#0a1424]/90">
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
        {stock.analyst_consensus?.explanation && (
          <div className="mt-4 p-3 rounded-xl bg-[#0c1a2f] border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
            <span className="text-[#00F5A0] font-bold font-mono mr-1">💡 ¿Cómo se calcula?</span>
            {stock.analyst_consensus.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
