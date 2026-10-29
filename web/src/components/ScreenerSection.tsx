"use client";

import React, { useState } from "react";
import {
  Activity,
  Globe,
  Building2,
  Search,
  CircleDollarSign,
  Zap,
  Shield,
} from "lucide-react";
import marketData from "@/data/marketData.json";
import StockDetailModal, { ModalItem } from "./StockDetailModal";
import ScoreDetailModal, { ScoreItem } from "./ScoreDetailModal";

interface ScreenerSectionProps {
  initialTab?: "cedears" | "ons" | "argentina";
  initialCedearSubTab?: "stocks" | "etfs";
  maxItems?: number; // Optional limit for preview/landing mode
  hideTitle?: boolean;
}

export default function ScreenerSection({
  initialTab = "cedears",
  initialCedearSubTab = "stocks",
  maxItems,
  hideTitle = false,
}: ScreenerSectionProps) {
  const [activeTab, setActiveTab] = useState<"cedears" | "ons" | "argentina">(initialTab);
  const [cedearSubTab, setCedearSubTab] = useState<"stocks" | "etfs">(initialCedearSubTab);
  const [argSubTab, setArgSubTab] = useState<"merval" | "bonds">("merval");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockDivFilter, setStockDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfDivFilter, setEtfDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfManagerFilter, setEtfManagerFilter] = useState<string>("all");
  const [selectedStockForModal, setSelectedStockForModal] = useState<ModalItem | null>(null);
  const [selectedScoreItem, setSelectedScoreItem] = useState<ScoreItem | null>(null);

  const { stocks, etfs, ons, argentina, last_updated, ccl_dollar } = marketData;
  const macro = (marketData as { macro?: import("@/types/market").MacroData }).macro;
  const formattedLastUpdated = last_updated.replace(/\s*\(Hora Buenos Aires,?\s*UTC-3\)/i, "");

  // Filtrado y Ordenamiento de Acciones
  let filteredStocks = stocks
    .filter((s) => {
      const matchesSearch =
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sector.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (stockDivFilter === "dividend") return s.pays_dividend;
      if (stockDivFilter === "growth") return !s.pays_dividend;
      return true;
    })
    .sort((a, b) => {
      // Ordenamiento descendente basándose estrictamente en el nuevo Score Total unificado
      const scoreB = b.score_total ?? (b as { scoreTotal?: number }).scoreTotal ?? b.score ?? 0;
      const scoreA = a.score_total ?? (a as { scoreTotal?: number }).scoreTotal ?? a.score ?? 0;
      return scoreB - scoreA;
    });

  // Filtrado y Ordenamiento de ETFs
  let filteredEtfs = etfs
    .filter((e) => {
      const matchesSearch =
        e.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.manager && e.manager.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
      if (etfDivFilter === "dividend") return e.pays_dividend;
      if (etfDivFilter === "growth") return !e.pays_dividend;
      if (etfManagerFilter !== "all" && e.manager !== etfManagerFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (etfDivFilter === "growth") {
        return (b.upside || 0) - (a.upside || 0);
      }
      if (etfDivFilter === "dividend") {
        return (b.dividend_yield || 0) - (a.dividend_yield || 0);
      }
      return (b.score || 0) - (a.score || 0);
    });

  // Filtrado de ONs
  let filteredOns = ons.filter(
    (o) =>
      o.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrado de Merval
  let filteredMerval = argentina.merval.filter(
    (m) =>
      m.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrado de Bonos
  let filteredSovereign = argentina.sovereign_bonds.filter(
    (b) =>
      b.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (maxItems) {
    filteredStocks = filteredStocks.slice(0, maxItems);
    filteredEtfs = filteredEtfs.slice(0, maxItems);
    filteredOns = filteredOns.slice(0, maxItems);
    filteredMerval = filteredMerval.slice(0, maxItems);
    filteredSovereign = filteredSovereign.slice(0, maxItems);
  }

  return (
    <section className="w-full max-w-7xl mx-auto mb-16 scroll-mt-24 px-4 sm:px-6 lg:px-8" id="radar-section">
      {/* Header del Radar y Controles */}
      <div className="bg-[#09111e]/90 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Fila Superior: Subtítulo + Título + Buscador */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            {!hideTitle && (
              <>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00F5A0] tracking-wider uppercase mb-2">
                  <Activity className="w-4 h-4 text-[#00F5A0]" />
                  <span>SELECCIÓN CUANTITATIVA DIARIA</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Radar Diario de Oportunidades
                </h2>
              </>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs sm:text-sm font-mono">
              <span className="text-slate-300 font-medium">
                Dólar CCL:{" "}
                <strong className="text-white font-bold bg-[#142338] px-2 py-0.5 rounded border border-slate-600/60">
                  ${ccl_dollar} ARS
                </strong>
              </span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span
                className="text-slate-300 font-medium flex items-center gap-1.5 cursor-help"
                title={macro?.source || "Tasa oficial de referencia de la Reserva Federal (EFFR)"}
              >
                <span>Tasa FED:</span>
                <strong className="text-[#00F5A0] font-bold bg-[#0a1e1b] px-2 py-0.5 rounded border border-emerald-500/40">
                  {macro?.tasa_actual_fed ?? 3.88}%
                </strong>
                <span className="text-slate-400 text-xs hidden md:inline">
                  (Proy. 1A: <span className="text-white font-semibold">{macro?.tasa_proyectada_fed_1a ?? 3.16}%</span>)
                </span>
                {macro?.is_fallback && (
                  <span
                    className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-600/50 px-1.5 py-0.5 rounded font-mono font-bold"
                    title="Se están utilizando valores de fallback de contingencia debido a un fallo temporal de la API"
                  >
                    FALLBACK
                  </span>
                )}
              </span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-slate-300">
                Actualizado: <span className="text-white font-semibold">{formattedLastUpdated}</span>{" "}
                <span className="text-slate-400">(Hora Buenos Aires, UTC-3)</span>
              </span>
            </div>
          </div>

          {/* Buscador de Alta Visibilidad */}
          <div className="w-full lg:w-96">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-emerald-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ticker, empresa, ON..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0e1b2f] border border-slate-600 focus:border-[#00F5A0] focus:ring-1 focus:ring-[#00F5A0] rounded-xl text-white text-sm placeholder-slate-400 transition-all font-sans font-medium"
              />
            </div>
          </div>
        </div>

        {/* Selector de Categorías Principales y Sub-vistas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("cedears")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "cedears"
                  ? "bg-[#00F5A0] text-black shadow-[0_0_15px_rgba(0,245,160,0.3)]"
                  : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500 font-semibold"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Wall Street &amp; CEDEARs</span>
            </button>
            <button
              onClick={() => setActiveTab("ons")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "ons"
                  ? "bg-[#00F5A0] text-black shadow-[0_0_15px_rgba(0,245,160,0.3)]"
                  : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500 font-semibold"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>ONs en Dólares ({filteredOns.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("argentina")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "argentina"
                  ? "bg-[#00F5A0] text-black shadow-[0_0_15px_rgba(0,245,160,0.3)]"
                  : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500 font-semibold"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Mercado Local (Merval &amp; Bonos)</span>
            </button>
          </div>

          {/* Sub-selector de vista */}
          {activeTab === "cedears" && (
            <div className="flex items-center gap-1.5 bg-[#0e1b2f] p-1 rounded-xl border border-slate-700 self-start sm:self-auto text-xs font-medium">
              <span className="text-slate-400 px-2 font-mono">Ver:</span>
              <button
                onClick={() => setCedearSubTab("stocks")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  cedearSubTab === "stocks"
                    ? "bg-emerald-500/20 text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Acciones CEDEAR ({filteredStocks.length})
              </button>
              <button
                onClick={() => setCedearSubTab("etfs")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  cedearSubTab === "etfs"
                    ? "bg-emerald-500/20 text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Top ETFs ({filteredEtfs.length})
              </button>
            </div>
          )}

          {activeTab === "argentina" && (
            <div className="flex items-center gap-1.5 bg-[#0e1b2f] p-1 rounded-xl border border-slate-700 self-start sm:self-auto text-xs font-medium">
              <span className="text-slate-400 px-2 font-mono">Ver:</span>
              <button
                onClick={() => setArgSubTab("merval")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  argSubTab === "merval"
                    ? "bg-emerald-500/20 text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Acciones Merval ({filteredMerval.length})
              </button>
              <button
                onClick={() => setArgSubTab("bonds")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  argSubTab === "bonds"
                    ? "bg-emerald-500/20 text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Bonos Soberanos ({filteredSovereign.length})
              </button>
            </div>
          )}
        </div>

        {/* Fila de Filtros de Dividendos para CEDEARs */}
        {activeTab === "cedears" && cedearSubTab === "stocks" && (
          <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-slate-800 text-xs sm:text-sm font-medium">
            <span className="text-slate-300 font-semibold mr-1">Filtrar Dividendos:</span>
            <button
              onClick={() => setStockDivFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                stockDivFilter === "all"
                  ? "bg-emerald-500/20 text-[#00F5A0] border border-[#00F5A0] font-bold shadow-sm"
                  : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500"
              }`}
            >
              Todas ({stocks.length})
            </button>
            <button
              onClick={() => setStockDivFilter("dividend")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                stockDivFilter === "dividend"
                  ? "bg-emerald-500/20 text-[#00F5A0] border border-[#00F5A0] font-bold shadow-sm"
                  : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500"
              }`}
            >
              <CircleDollarSign className="w-3.5 h-3.5" />
              <span>Con Dividendos en USD ({stocks.filter((s) => s.pays_dividend).length})</span>
            </button>
            <button
              onClick={() => setStockDivFilter("growth")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                stockDivFilter === "growth"
                  ? "bg-emerald-500/20 text-[#00F5A0] border border-[#00F5A0] font-bold shadow-sm"
                  : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500"
              }`}
            >
              🚀 Sin Dividendos - Top 10 más rentables ({stocks.filter((s) => !s.pays_dividend).length})
            </button>
          </div>
        )}

        {/* Fila de Filtros para ETFs */}
        {activeTab === "cedears" && cedearSubTab === "etfs" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800 text-xs sm:text-sm font-medium">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-300 font-semibold mr-1">Dividendos:</span>
              <button
                onClick={() => setEtfDivFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  etfDivFilter === "all"
                    ? "bg-emerald-500/20 text-[#00F5A0] border border-[#00F5A0] font-bold shadow-sm"
                    : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500"
                }`}
              >
                Todos ({etfs.length})
              </button>
              <button
                onClick={() => setEtfDivFilter("dividend")}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  etfDivFilter === "dividend"
                    ? "bg-emerald-500/20 text-[#00F5A0] border border-[#00F5A0] font-bold shadow-sm"
                    : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500"
                }`}
              >
                <CircleDollarSign className="w-3.5 h-3.5" />
                <span>Con Dividendos ({etfs.filter((e) => e.pays_dividend).length})</span>
              </button>
              <button
                onClick={() => setEtfDivFilter("growth")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  etfDivFilter === "growth"
                    ? "bg-emerald-500/20 text-[#00F5A0] border border-[#00F5A0] font-bold shadow-sm"
                    : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500"
                }`}
              >
                🚀 Crecimiento ({etfs.filter((e) => !e.pays_dividend).length})
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-xs">Gestora:</span>
              <select
                value={etfManagerFilter}
                onChange={(e) => setEtfManagerFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0e1b2f] border border-slate-700 text-white focus:outline-none focus:border-[#00F5A0]"
              >
                <option value="all">Todas las Gestoras</option>
                <option value="BlackRock (iShares)">BlackRock (iShares)</option>
                <option value="Vanguard">Vanguard</option>
                <option value="State Street (SPDR)">State Street (SPDR)</option>
                <option value="Invesco">Invesco</option>
                <option value="Charles Schwab">Charles Schwab</option>
                <option value="VanEck">VanEck</option>
                <option value="ARK Invest (Cathie Wood)">ARK Invest</option>
                <option value="Global X / Mirae Asset">Global X</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* LISTA DE TARJETAS */}
      <div className="mt-6 space-y-4">
        {/* 1. ACCIONES CEDEAR */}
        {activeTab === "cedears" && cedearSubTab === "stocks" && (
          <>
            {filteredStocks.map((stock, idx) => {
              const isPositive = stock.day_change >= 0;
              return (
                <div key={stock.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Izquierda: Rank + Ticker + Empresa */}
                    <div className="flex items-start gap-4">
                      <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono tracking-tight pt-0.5">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="text-2xl sm:text-3xl font-black text-white tracking-wide font-mono">
                            {stock.ticker}
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-[#132840] border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                            {stock.sector}
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400 text-[#00F5A0] text-xs font-black tracking-wider uppercase shadow-[0_0_10px_rgba(0,245,160,0.25)]">
                            {stock.recommendation}
                          </span>
                        </div>
                        <div className="text-sm sm:text-base text-slate-200 font-semibold mt-1 tracking-normal">
                          {stock.name}{" "}
                          <span className="text-white font-medium">
                            • {stock.pays_dividend ? `Div. ${stock.dividend_yield}% anual` : "Sin dividendo (Reinvierte)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Derecha: Grid de 4 Métricas Clave */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-700/80">
                      <div className="flex flex-col">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                          PRECIO USA (USD)
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                            ${stock.price.toFixed(2)}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-bold font-mono ${
                              isPositive ? "text-[#00F5A0]" : "text-rose-400"
                            }`}
                          >
                            {isPositive ? `+${stock.day_change}%` : `${stock.day_change}%`}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                          CEDEAR EN PESOS
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                            ${stock.cedear_price_ars.toLocaleString("es-AR")}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-300">ARS</span>
                        </div>
                        <span className="text-[11px] font-mono font-medium text-slate-300">
                          Ratio {stock.cedear_ratio}
                        </span>
                      </div>

                      <div
                        onClick={() => setSelectedStockForModal(stock)}
                        className="flex flex-col cursor-pointer group/modal bg-[#0e1a2c]/60 hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                        title="Ver desglose de consenso de bancos, PER y capitalización"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            POTENCIAL ESTIMADO (1A)
                          </span>
                          <span className="text-[10px] text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                            Desglose ↗
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.3)]">
                            {(() => {
                              const ret = stock.retorno_estimado_pct ?? (stock as { retornoEstimadoPct?: number }).retornoEstimadoPct ?? stock.upside;
                              if (ret === undefined) return "N/D";
                              return ret >= 0 ? `+${ret}%` : `${ret}%`;
                            })()}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-300">
                          Target Algoritmo: <strong className="text-white">${(stock.precio_objetivo_algoritmo ?? (stock as { precioObjetivoAlgoritmo?: number }).precioObjetivoAlgoritmo ?? stock.target_price ?? 0).toFixed(2)}</strong> USD
                        </span>
                      </div>

                      <div
                        onClick={() => setSelectedScoreItem(stock)}
                        className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-[#0e1a2c]/60 hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                        title="Ver desglose detallado de cómo se compone este Score"
                      >
                        <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            SCORE TOTAL
                          </span>
                          <span className="text-[10px] text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                            Desglose ↗
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                            {stock.score_total ?? (stock as { scoreTotal?: number }).scoreTotal ?? stock.score}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                            <Zap className="w-4 h-4 fill-current" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tesis de Inversión */}
                  <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                    <span className="text-xs sm:text-sm font-extrabold font-mono text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
                      TESIS:
                    </span>
                    <p className="text-sm sm:text-[15px] font-normal text-slate-100 leading-relaxed">
                      {stock.thesis}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* 2. TOP ETFS */}
        {activeTab === "cedears" && cedearSubTab === "etfs" && (
          <>
            {filteredEtfs.map((etf, idx) => (
              <div key={etf.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono tracking-tight pt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-white tracking-wide font-mono">
                          {etf.ticker}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#132840] border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                          {etf.manager}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#162742] border border-slate-600 text-slate-300 text-xs font-semibold">
                          {etf.category}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base text-slate-200 font-semibold mt-1 tracking-normal">
                        {etf.name}{" "}
                        <span className="text-white font-medium">
                          • {etf.pays_dividend ? `Div. ${etf.dividend_yield}% anual` : "Acumulación (0% dividendo)"} • Costo: {etf.expense_ratio}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-700/80">
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                        PRECIO USA (USD)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                          ${etf.price.toFixed(2)}
                        </span>
                        <span className="text-xs sm:text-sm font-bold font-mono text-[#00F5A0]">
                          +{etf.day_change}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                        CEDEAR EN PESOS
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                          ${etf.cedear_price_ars.toLocaleString("es-AR")}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-300">ARS</span>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-slate-300">
                        Ratio {etf.cedear_ratio}
                      </span>
                    </div>

                    <div
                      onClick={() => setSelectedStockForModal(etf)}
                      className="flex flex-col cursor-pointer group/modal bg-[#0e1a2c]/60 hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                      title="Ver desglose de consenso de bancos y estrategas de Wall Street"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                          POTENCIAL ANALISTAS
                        </span>
                        <span className="text-[10px] text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                          Desglose ↗
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.3)]">
                          {etf.upside && etf.upside >= 0 ? `+${etf.upside}%` : `${etf.upside}%`}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-300">
                        Target: <strong className="text-white">${etf.target_price ? etf.target_price.toFixed(2) : "N/D"}</strong> USD
                      </span>
                    </div>

                    <div
                      onClick={() => setSelectedScoreItem(etf)}
                      className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-[#0e1a2c]/60 hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                      title="Ver desglose detallado de cómo se compone este Score"
                    >
                      <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                          SCORE TOTAL
                        </span>
                        <span className="text-[10px] text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                          Desglose ↗
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                          {etf.score}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                          <Zap className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                  <span className="text-xs sm:text-sm font-extrabold font-mono text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
                    TESIS:
                  </span>
                  <p className="text-sm sm:text-[15px] font-normal text-slate-100 leading-relaxed">
                    {etf.thesis}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 3. ONS EN DÓLARES */}
        {activeTab === "ons" && (
          <>
            <div className="p-4 rounded-2xl bg-[#0a1424] border border-cyan-500/30 text-xs sm:text-sm text-slate-200 flex items-center justify-between">
              <span>
                💡 <strong className="text-white">Obligaciones Negociables (ONs):</strong> Deuda corporativa privada emitida por empresas líderes (YPF, Pampa, Pan American Energy, etc.). Pagan cupones periódicos en <strong className="text-[#00F5A0]">dólares billete (Dólar MEP/Cable)</strong> y se negocian tanto en Pesos como en Dólares.
              </span>
            </div>

            {filteredOns.map((on, idx) => (
              <div key={on.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono tracking-tight pt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-white tracking-wide font-mono">
                          {on.ticker}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-bold tracking-wide border ${
                            on.law.includes("Nueva York")
                              ? "bg-[#132840] border-cyan-500/40 text-cyan-200"
                              : "bg-[#291e10] border-amber-500/40 text-amber-300"
                          }`}
                        >
                          {on.law}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#142338] border border-slate-700 text-slate-200 text-xs font-mono">
                          Vence: <strong className="text-[#00F5A0]">{on.maturity_date}</strong>
                        </span>
                      </div>
                      <div className="text-sm sm:text-base text-slate-200 font-semibold mt-1 tracking-normal">
                        {on.name} <span className="text-slate-400 font-normal">• Emisor: {on.issuer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-700/80">
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                        PRECIO &amp; PARIDAD
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                          ${on.price_usd ? on.price_usd.toFixed(2) : "100.00"}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-300">USD</span>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold ${
                          on.parity > 100 ? "text-cyan-300" : on.parity < 100 ? "text-amber-300" : "text-[#00F5A0]"
                        }`}
                      >
                        {on.parity_status || (on.parity > 100 ? "Sobre par" : "Bajo par")} ({on.parity}%)
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                        RENDIMIENTO (TIR)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-[#00F5A0] font-mono">
                          {on.tir_usd}%
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-300">Tasa neta anual USD</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                        CUPÓN &amp; FRECUENCIA
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                          {on.coupon}%
                        </span>
                      </div>
                      <span className="text-xs font-medium font-mono text-slate-300">{on.frequency}</span>
                    </div>

                    <div
                      onClick={() => setSelectedScoreItem(on)}
                      className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-[#0e1a2c]/60 hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                      title="Ver desglose detallado de cómo se compone esta calificación de Solvencia"
                    >
                      <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                          SOLIDEZ
                        </span>
                        <span className="text-[10px] text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                          Desglose ↗
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                          {on.score}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                          <Building2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                  <span className="text-xs sm:text-sm font-extrabold font-mono text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
                    TESIS:
                  </span>
                  <p className="text-sm sm:text-[15px] font-normal text-slate-100 leading-relaxed">
                    {on.thesis}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 4. MERVAL & BONOS SOBERANOS */}
        {activeTab === "argentina" && (
          <>
            {argSubTab === "merval" && (
              <>
                {filteredMerval.map((m, idx) => (
                  <div key={m.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono tracking-tight pt-0.5">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="text-2xl sm:text-3xl font-black text-white tracking-wide font-mono">
                              {m.ticker}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-[#132840] border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                              {m.sector}
                            </span>
                          </div>
                          <div className="text-sm sm:text-base text-slate-200 font-semibold mt-1 tracking-normal">
                            {m.name}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-700/80">
                        <div className="flex flex-col">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            PRECIO EN PESOS
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                              ${m.price_ars.toLocaleString("es-AR")}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-300">ARS</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#00F5A0]">
                            +{m.day_change}% hoy
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            VALUACIÓN (P/E)
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                              {m.pe_ratio}x
                            </span>
                          </div>
                          <span className="text-xs font-medium font-mono text-slate-300">Ganancias anuales</span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            MERCADO
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                              BYMA
                            </span>
                          </div>
                          <span className="text-xs font-medium font-mono text-emerald-400">Panel Líder</span>
                        </div>

                        <div
                          onClick={() => setSelectedScoreItem(m)}
                          className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-[#0e1a2c]/60 hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                          title="Ver desglose detallado de cómo se compone este Score"
                        >
                          <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                            <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                              SCORE
                            </span>
                            <span className="text-[10px] text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                              Desglose ↗
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                              {m.score}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                              <Zap className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
                        TESIS LOCAL:
                      </span>
                      <p className="text-sm sm:text-[15px] font-normal text-slate-100 leading-relaxed">
                        {m.thesis}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {argSubTab === "bonds" && (
              <>
                {filteredSovereign.map((b, idx) => (
                  <div key={b.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono tracking-tight pt-0.5">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="text-2xl sm:text-3xl font-black text-white tracking-wide font-mono">
                              {b.ticker}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-[#132840] border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                              {b.law}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-[#142338] border border-slate-700 text-slate-200 text-xs font-mono">
                              Vence: <strong className="text-[#00F5A0]">{b.maturity_date}</strong>
                            </span>
                          </div>
                          <div className="text-sm sm:text-base text-slate-200 font-semibold mt-1 tracking-normal">
                            {b.name}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-700/80">
                        <div className="flex flex-col">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            COTIZACIÓN &amp; PARIDAD
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                              ${b.price_usd}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-300">USD</span>
                          </div>
                          <span
                            className={`text-xs font-mono font-bold ${
                              b.parity >= 100 ? "text-cyan-300" : "text-amber-300"
                            }`}
                          >
                            {b.parity_status || (b.parity >= 100 ? "Sobre par" : "Bajo par")} ({b.parity}%)
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            RENDIMIENTO (TIR)
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg sm:text-xl font-extrabold text-[#00F5A0] font-mono">
                              {b.tir_usd}%
                            </span>
                          </div>
                          <span className="text-xs font-bold font-mono text-slate-300">Renta neta en USD</span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            TIPO DE ACTIVO
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                              Soberano
                            </span>
                          </div>
                          <span className="text-xs font-medium font-mono text-slate-300">Bonares / Globales</span>
                        </div>

                        <div
                          onClick={() => setSelectedScoreItem(b)}
                          className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-[#0e1a2c]/60 hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                          title="Ver desglose detallado de cómo se compone este Score"
                        >
                          <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                            <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                              SCORE
                            </span>
                            <span className="text-[10px] text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                              Desglose ↗
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xl sm:text-2xl font-black text-[#00F5A0] font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                              {b.score}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                              <Shield className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
                        TESIS SOBERANA:
                      </span>
                      <p className="text-sm sm:text-[15px] font-normal text-slate-100 leading-relaxed">
                        {b.thesis}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalle Consenso de Bancos */}
      <StockDetailModal
        stock={selectedStockForModal}
        onClose={() => setSelectedStockForModal(null)}
      />

      {/* Modal de Desglose del Score Cuantitativo */}
      <ScoreDetailModal
        item={selectedScoreItem}
        onClose={() => setSelectedScoreItem(null)}
      />
    </section>
  );
}
