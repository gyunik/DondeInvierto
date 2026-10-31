"use client";

import React, { useState } from "react";
import {
  Activity,
  Globe,
  Building2,
  Search,
  CircleDollarSign,
  Zap,
} from "lucide-react";
import ArgentinaFlag from "./ArgentinaFlag";
import marketData from "@/data/marketData.json";
import StockDetailModal, { ModalItem } from "./StockDetailModal";
import ScoreDetailModal, { ScoreItem } from "./ScoreDetailModal";

export type UsBondItem = (typeof marketData.us_bonds)[0];
export type StockItem = (typeof marketData.stocks)[0];
export type EtfItem = (typeof marketData.etfs)[0];

interface ScreenerSectionProps {
  initialTab?: string;
  initialCedearSubTab?: string;
  maxItems?: number; // Optional limit for preview/landing mode
  hideTitle?: boolean;
}

export default function ScreenerSection({
  initialTab = "wall_street",
    maxItems,
  hideTitle = false,
}: ScreenerSectionProps) {
  // Nivel 1: Mercado Principal (Wall Street vs Mercado Local)
  const [activeMarket, setActiveMarket] = useState<"wall_street" | "argentina">(
    initialTab === "argentina" || initialTab === "ons" ? "argentina" : "wall_street"
  );

  // Nivel 2: Instrumentos dentro de Wall Street
  const [wallStreetSubTab, setWallStreetSubTab] = useState<"stocks" | "etfs" | "bonds">("stocks");

  // Nivel 2: Instrumentos dentro de Mercado Local
  const [argSubTab, setArgSubTab] = useState<"cedears" | "ons" | "merval" | "bonds">(
    initialTab === "ons" ? "ons" : "cedears"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [stockOpportunityFilter, setStockOpportunityFilter] = useState<"opportunities" | "all">("opportunities");
  const [visibleCount, setVisibleCount] = useState<number>(30);
  const [stockDivFilter, setStockDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfDivFilter, setEtfDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfManagerFilter, setEtfManagerFilter] = useState<string>("all");
  const [usBondMaturityBlock, setUsBondMaturityBlock] = useState<"all" | "short" | "medium" | "long">("all");
  const [usBondBrandCategory, setUsBondBrandCategory] = useState<string>("all");
  const [usBondSafetyFilter, setUsBondSafetyFilter] = useState<"all" | "Seguridad Máxima" | "Riesgo Ultra Bajo">("all");
  const [usBondSort, setUsBondSort] = useState<"tir" | "score" | "maturity">("tir");
  const [brokerFeePercent, setBrokerFeePercent] = useState<number>(0.5);
  const [visibleBondCount, setVisibleBondCount] = useState<number>(30);
  const [selectedStockForModal, setSelectedStockForModal] = useState<ModalItem | null>(null);
  const [selectedScoreItem, setSelectedScoreItem] = useState<ScoreItem | null>(null);

  const { stocks, etfs, ons, argentina, last_updated, ccl_dollar } = marketData;
  const us_bonds: UsBondItem[] = marketData.us_bonds || [];
  const macro = (marketData as { macro?: import("@/types/market").MacroData }).macro;
  const formattedLastUpdated = last_updated.replace(/\s*\(Hora Buenos Aires,?\s*UTC-3\)/i, "");

  // 1. Filtrado de Acciones de Wall Street (Todas)
  let filteredStocks = stocks
    .filter((s) => {
      const matchesSearch =
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sector.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const ret = s.retorno_estimado_pct ?? s.retorno_estimado_pct ?? s.upside ?? 0;
      const sc = s.score_total ?? s.score_total ?? s.score ?? 0;
      if (stockOpportunityFilter === "opportunities" && !searchQuery.trim()) {
        if (sc < 60 || ret <= 0) return false;
      }

      if (stockDivFilter === "dividend") return s.pays_dividend;
      if (stockDivFilter === "growth") return !s.pays_dividend;
      return true;
    })
    .sort((a, b) => {
      const scoreB = b.score_total ?? b.score_total ?? b.score ?? 0;
      const scoreA = a.score_total ?? a.score_total ?? a.score ?? 0;
      return scoreB - scoreA;
    });

  // 2. Filtrado de CEDEARs (Solo acciones con CEDEAR en Argentina)
  let filteredCedears = stocks
    .filter((s) => s.has_cedear)
    .filter((s) => {
      const matchesSearch =
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sector.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const ret = s.retorno_estimado_pct ?? s.retorno_estimado_pct ?? s.upside ?? 0;
      const sc = s.score_total ?? s.score_total ?? s.score ?? 0;
      if (stockOpportunityFilter === "opportunities" && !searchQuery.trim()) {
        if (sc < 60 || ret <= 0) return false;
      }

      if (stockDivFilter === "dividend") return s.pays_dividend;
      if (stockDivFilter === "growth") return !s.pays_dividend;
      return true;
    })
    .sort((a, b) => {
      const scoreB = b.score_total ?? b.score_total ?? b.score ?? 0;
      const scoreA = a.score_total ?? a.score_total ?? a.score ?? 0;
      return scoreB - scoreA;
    });

  // 3. Filtrado de ETFs de Wall Street
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
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  // 4. Filtrado de Bonos Corporativos & Treasuries USA High Grade
  let filteredUsBonds = us_bonds
    .filter((b: UsBondItem) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          b.ticker.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q) ||
          b.issuer.toLowerCase().includes(q) ||
          (b.sector && b.sector.toLowerCase().includes(q)) ||
          (b.brand_category && b.brand_category.toLowerCase().includes(q)) ||
          (b.rating && b.rating.toLowerCase().includes(q)) ||
          (b.moodys && b.moodys.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Filtro por Bloque de Tranquilidad
      if (usBondMaturityBlock !== "all" && b.maturity_block !== usBondMaturityBlock) {
        return false;
      }

      // Filtro por Marcas Conocidas
      if (usBondBrandCategory !== "all" && b.brand_category !== usBondBrandCategory) {
        return false;
      }

      // Filtro por Nivel de Seguridad
      if (usBondSafetyFilter !== "all" && b.safety_badge !== usBondSafetyFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (usBondSort === "tir") {
        const netB = (b.tir_usd || 0) - (brokerFeePercent / (b.maturity_years || 1));
        const netA = (a.tir_usd || 0) - (brokerFeePercent / (a.maturity_years || 1));
        return netB - netA;
      }
      if (usBondSort === "maturity") {
        return (a.maturity_years || 0) - (b.maturity_years || 0);
      }
      return (b.score || 0) - (a.score || 0);
    });

  // 5. Filtrado de ONs en Dólares (Argentina)
  let filteredOns = ons.filter(
    (o) =>
      o.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 6. Filtrado de Merval (Acciones Locales)
  let filteredMerval = argentina.merval.filter(
    (m) =>
      m.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 7. Filtrado de Bonos Soberanos (Argentina)
  let filteredSovereign = argentina.sovereign_bonds.filter(
    (b) =>
      b.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (maxItems) {
    filteredStocks = filteredStocks.slice(0, maxItems);
    filteredCedears = filteredCedears.slice(0, maxItems);
    filteredEtfs = filteredEtfs.slice(0, maxItems);
    filteredUsBonds = filteredUsBonds.slice(0, maxItems);
    filteredOns = filteredOns.slice(0, maxItems);
    filteredMerval = filteredMerval.slice(0, maxItems);
    filteredSovereign = filteredSovereign.slice(0, maxItems);
  }

  // Helper para renderizar tarjetas de acciones / cedears
  const renderStockCard = (stock: StockItem, idx: number, isCedearView: boolean = false) => {
    const isPositive = stock.day_change >= 0;
    const ret = stock.retorno_estimado_pct ?? stock.retornoEstimadoPct ?? stock.upside ?? 0;
    const sc = stock.score_total ?? stock.scoreTotal ?? stock.score ?? 0;

    let recBadge = {
      text: "COMPRA",
      className: "bg-emerald-500/20 border-emerald-400 text-emerald-800 dark:text-[#00F5A0] shadow-[0_0_10px_rgba(0,245,160,0.25)]"
    };
    if (sc >= 85 && ret >= 30) {
      recBadge = {
        text: "FUERTE COMPRA",
        className: "bg-emerald-500/25 border-emerald-400 text-emerald-800 dark:text-[#00F5A0] shadow-[0_0_14px_rgba(0,245,160,0.35)]"
      };
    } else if (sc >= 60 && ret > 0) {
      recBadge = {
        text: "COMPRA",
        className: "bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-300"
      };
    } else if (sc >= 40 && ret > 0) {
      recBadge = {
        text: "MANTENER",
        className: "bg-amber-500/20 border-amber-500/50 text-amber-800 dark:text-amber-300"
      };
    } else {
      recBadge = {
        text: "EVITAR / PRECAUCIÓN",
        className: "bg-rose-500/20 border-rose-500/50 text-rose-800 dark:text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
      };
    }

    return (
      <div key={stock.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Izquierda: Rank + Ticker + Empresa */}
          <div className="flex items-start gap-4">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-[#00F5A0] font-mono tracking-tight pt-0.5">
              #{idx + 1}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                  {stock.ticker}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-[#132840] border border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                  {stock.sector}
                </span>
                <span className={`px-2.5 py-1 rounded-md border text-xs font-black tracking-wider uppercase ${recBadge.className}`}>
                  {recBadge.text}
                </span>
              </div>
              <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-semibold mt-1 tracking-normal">
                {stock.name}{" "}
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  • {stock.pays_dividend ? `Div. ${stock.dividend_yield}% anual` : "Sin dividendo (Reinvierte)"}
                </span>
              </div>
            </div>
          </div>

          {/* Derecha: Grid de 4 Métricas Clave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-slate-100/90 dark:bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            {/* 1. Precio USA */}
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                PRECIO USA (USD)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  ${stock.price.toFixed(2)}
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold font-mono ${
                    isPositive ? "text-emerald-600 dark:text-[#00F5A0]" : "text-rose-500 dark:text-rose-400"
                  }`}
                  title="Variación porcentual de la rueda de hoy"
                >
                  {isPositive ? `+${stock.day_change}%` : `${stock.day_change}%`}
                </span>
              </div>
            </div>

            {/* 2. Operatoria Local (CEDEAR o Broker Exterior) */}
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                {isCedearView ? "PRECIO CEDEAR (ARS)" : "OPERATORIA"}
              </span>
              {stock.has_cedear && stock.cedear_price_ars ? (
                <>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-[#00F5A0] font-mono">
                      ${stock.cedear_price_ars.toLocaleString("es-AR")}
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">ARS</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                    Ratio {stock.cedear_ratio}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 font-mono">
                      Broker Exterior
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    NYSE / NASDAQ
                  </span>
                </>
              )}
            </div>

            {/* 3. Potencial Estimado (1A) con enlace al Modal */}
            <div
              onClick={() => setSelectedStockForModal(stock)}
              className="flex flex-col cursor-pointer group/modal bg-slate-200/60 hover:bg-slate-200 dark:bg-[#0e1a2c]/60 dark:hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
              title="Click para ver la fórmula del Algoritmo Cuantitativo y el consenso de bancos"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                  POTENCIAL (1A)
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                  Desglose ↗
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-[#00F5A0] font-mono">
                  {ret >= 0 ? `+${ret}%` : `${ret}%`}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                Target: ${stock.precio_objetivo_algoritmo ?? stock.target_price} USD
              </span>
            </div>

            {/* 4. Score Cuantitativo con enlace a ScoreDetailModal */}
            <div
              onClick={() => setSelectedScoreItem(stock)}
              className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-slate-200/60 hover:bg-slate-200 dark:bg-[#0e1a2c]/60 dark:hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
              title="Click para ver el desglose detallado de los 3 pilares del Score"
            >
              <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                  SCORE TOTAL
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                  Desglose ↗
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00F5A0] font-mono drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                  {sc}
                </span>
                <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">/100</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tesis de Inversión Institucional */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start gap-2 bg-slate-50 dark:bg-[#060b13] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-700 dark:text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30 self-start">
            TESIS:
          </span>
          <p className="text-sm sm:text-[15px] font-normal text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
            {stock.thesis}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full max-w-7xl mx-auto mb-16 scroll-mt-24 px-4 sm:px-6 lg:px-8" id="radar-section">
      {/* Header del Radar y Controles */}
      <div className="bg-white dark:bg-[#09111e]/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-sm dark:shadow-2xl backdrop-blur-xl transition-colors duration-200">
        {/* Fila Superior: Subtítulo + Título + Buscador */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            {!hideTitle && (
              <>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-[#00F5A0] tracking-wider uppercase mb-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-[#00F5A0]" />
                  <span>TERMINAL CUANTITATIVA INSTITUCIONAL</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Radar Cuantitativo de Activos
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  Selección objetiva y ranking de Wall Street y Mercado Local auditado por algoritmos de 3 capas y consenso institucional.
                </p>
              </>
            )}

            {/* Barra de Datos Clave en Tiempo Real */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm font-mono">
              <span className="text-slate-600 dark:text-slate-300">
                Dólar CCL:{" "}
                <strong className="text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-[#142338] px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600/60">
                  ${ccl_dollar} ARS
                </strong>
              </span>
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">|</span>
              <span
                className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 cursor-help"
                title={macro?.source || "Tasa oficial de referencia de la Reserva Federal (EFFR)"}
              >
                <span>Tasa FED:</span>
                <strong className="text-emerald-700 dark:text-[#00F5A0] font-bold bg-emerald-50 dark:bg-[#0a1e1b] px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/40">
                  {macro?.tasa_actual_fed ?? 3.88}%
                </strong>
                <span className="text-slate-500 dark:text-slate-400 text-xs hidden md:inline">
                  (Proy. 1A: <span className="text-slate-900 dark:text-white font-semibold">{macro?.tasa_proyectada_fed_1a ?? 3.16}%</span>)
                </span>
              </span>
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">|</span>
              <span className="text-slate-600 dark:text-slate-300">
                Actualizado: <span className="text-slate-900 dark:text-white font-semibold">{formattedLastUpdated}</span>{" "}
                <span className="text-slate-500 dark:text-slate-400">(Hora Buenos Aires, UTC-3)</span>
              </span>
            </div>
          </div>

          {/* Buscador de Alta Visibilidad */}
          <div className="w-full lg:w-96">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ticker, empresa, ON, bono..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-[#0e1b2f] border border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-[#00F5A0] focus:ring-1 focus:ring-emerald-500 dark:focus:ring-[#00F5A0] rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-500 dark:placeholder-slate-400 transition-all font-sans font-medium"
              />
            </div>
          </div>
        </div>

        {/* Nivel 1: Selector de Mercado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { setActiveMarket("wall_street"); setVisibleCount(30); }}
              className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeMarket === "wall_street"
                  ? "bg-[#00F5A0] text-black shadow-[0_0_15px_rgba(0,245,160,0.3)]"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111e33] dark:hover:bg-[#162742] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 font-semibold"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Wall Street</span>
            </button>
            <button
              onClick={() => { setActiveMarket("argentina"); setVisibleCount(30); }}
              className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeMarket === "argentina"
                  ? "bg-[#00F5A0] text-black shadow-[0_0_15px_rgba(0,245,160,0.3)]"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111e33] dark:hover:bg-[#162742] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 font-semibold"
              }`}
            >
              <ArgentinaFlag className="w-5 h-3.5 rounded-[2px] shadow-sm" />
              <span>Mercado Local</span>
            </button>
          </div>

          {/* Nivel 2: Sub-selector de vista según el mercado activo */}
          {activeMarket === "wall_street" && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0e1b2f] p-1 rounded-xl border border-slate-300 dark:border-slate-700 self-start sm:self-auto text-xs font-medium">
              <span className="text-slate-500 dark:text-slate-400 px-2 font-mono">Ver:</span>
              <button
                onClick={() => setWallStreetSubTab("stocks")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  wallStreetSubTab === "stocks"
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Acciones ({filteredStocks.length})
              </button>
              <button
                onClick={() => setWallStreetSubTab("etfs")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  wallStreetSubTab === "etfs"
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Top ETFs ({filteredEtfs.length})
              </button>
              <button
                onClick={() => setWallStreetSubTab("bonds")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  wallStreetSubTab === "bonds"
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Bonos USA ({filteredUsBonds.length})
              </button>
            </div>
          )}

          {activeMarket === "argentina" && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0e1b2f] p-1 rounded-xl border border-slate-300 dark:border-slate-700 self-start sm:self-auto text-xs font-medium">
              <span className="text-slate-500 dark:text-slate-400 px-2 font-mono">Ver:</span>
              <button
                onClick={() => setArgSubTab("cedears")}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  argSubTab === "cedears"
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                CEDEARs ({filteredCedears.length})
              </button>
              <button
                onClick={() => setArgSubTab("ons")}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  argSubTab === "ons"
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                ONs en Dólares ({filteredOns.length})
              </button>
              <button
                onClick={() => setArgSubTab("merval")}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  argSubTab === "merval"
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Acciones Merval ({filteredMerval.length})
              </button>
              <button
                onClick={() => setArgSubTab("bonds")}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  argSubTab === "bonds"
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Bonos Soberanos ({filteredSovereign.length})
              </button>
            </div>
          )}
        </div>

        {/* Fila de Filtros de Oportunidad y Dividendos */}
        {((activeMarket === "wall_street" && wallStreetSubTab === "stocks") ||
          (activeMarket === "argentina" && argSubTab === "cedears")) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStockOpportunityFilter(stockOpportunityFilter === "opportunities" ? "all" : "opportunities")}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold border flex items-center gap-1.5 ${
                  stockOpportunityFilter === "opportunities"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-[#00F5A0] dark:border-emerald-500/40 shadow-sm"
                    : "bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900 dark:bg-[#0b1626] dark:text-slate-400 dark:border-slate-700 dark:hover:text-white"
                }`}
                title="Alternar entre solo acciones con Score >= 60 o el ranking completo"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{stockOpportunityFilter === "opportunities" ? "🔥 Solo Oportunidades (Score ≥ 60)" : "📋 Mostrar Todo el Ranking"}</span>
              </button>
            </div>

            {/* Filtro de Dividendos */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">Dividendos:</span>
              <button
                onClick={() => setStockDivFilter("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  stockDivFilter === "all"
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStockDivFilter("dividend")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  stockDivFilter === "dividend"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-300 dark:border-emerald-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <CircleDollarSign className="w-3 h-3 text-emerald-600 dark:text-[#00F5A0]" />
                <span>Con Div.</span>
              </button>
              <button
                onClick={() => setStockDivFilter("growth")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  stockDivFilter === "growth"
                    ? "bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-300 dark:border-cyan-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Zap className="w-3 h-3 text-cyan-600 dark:text-cyan-300" />
                <span>Crecimiento</span>
              </button>
            </div>
          </div>
        )}

        {/* Filtros Especiales para Bonos USA High Grade (Diseñado para Inversores Principiantes) */}
        {activeMarket === "wall_street" && wallStreetSubTab === "bonds" && (
          <div className="flex flex-col gap-4 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium">
            {/* 1. Bloques de Tranquilidad basados en Vencimiento */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 dark:bg-[#07111e] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-300 font-mono text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                <span>🛡️ Bloques de Tranquilidad:</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { setUsBondMaturityBlock("all"); setVisibleBondCount(30); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    usBondMaturityBlock === "all"
                      ? "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "bg-slate-200/70 dark:bg-[#0e1a2c] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Todos ({us_bonds.length})
                </button>
                <button
                  onClick={() => { setUsBondMaturityBlock("short"); setVisibleBondCount(30); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    usBondMaturityBlock === "short"
                      ? "bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950/80 dark:text-[#00F5A0] dark:border-emerald-500/50 shadow-sm"
                      : "bg-slate-200/70 border-transparent dark:bg-[#0e1a2c] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Aproximadamente 1 a 3 años. Mínima fluctuación de precio, ideal para principiantes y preservación de capital"
                >
                  <span>🟢 Corto Plazo (1-3 años)</span>
                  <span className="text-[10px] opacity-75 font-normal hidden md:inline">• Riesgo precio mínimo / Conservador</span>
                </button>
                <button
                  onClick={() => { setUsBondMaturityBlock("medium"); setVisibleBondCount(30); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    usBondMaturityBlock === "medium"
                      ? "bg-cyan-100 text-cyan-950 border-cyan-400 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/50 shadow-sm"
                      : "bg-slate-200/70 border-transparent dark:bg-[#0e1a2c] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Aproximadamente 3 a 7 años. Equilibrio recomendado entre tasa alta fija y duración"
                >
                  <span>🔵 Mediano Plazo (3-7 años)</span>
                  <span className="text-[10px] opacity-75 font-normal hidden md:inline">• Riesgo moderado / Recomendado</span>
                </button>
                <button
                  onClick={() => { setUsBondMaturityBlock("long"); setVisibleBondCount(30); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    usBondMaturityBlock === "long"
                      ? "bg-purple-100 text-purple-950 border-purple-400 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-500/50 shadow-sm"
                      : "bg-slate-200/70 border-transparent dark:bg-[#0e1a2c] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Aproximadamente 7 a 10 años. Asegurar tasas altas por una década completa con devolución íntegra al vencimiento"
                >
                  <span>🟣 Largo Plazo (7-10 años)</span>
                  <span className="text-[10px] opacity-75 font-normal hidden md:inline">• Sensible / Mantener a vencimiento</span>
                </button>
              </div>
            </div>

            {/* 2. Filtro de Marcas Conocidas y Cotidianas */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold mr-1">
                Marcas Cotidianas:
              </span>
              <button
                onClick={() => { setUsBondBrandCategory("all"); setVisibleBondCount(30); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  usBondBrandCategory === "all"
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🏢 Todas
              </button>
              <button
                onClick={() => { setUsBondBrandCategory("Empresas Tecnológicas Líderes"); setVisibleBondCount(30); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  usBondBrandCategory === "Empresas Tecnológicas Líderes"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-300 dark:border-emerald-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                💻 Tech Líderes (Apple, Microsoft, Google)
              </button>
              <button
                onClick={() => { setUsBondBrandCategory("Consumo Masivo & Alimentos"); setVisibleBondCount(30); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  usBondBrandCategory === "Consumo Masivo & Alimentos"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-300 dark:border-emerald-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🛒 Consumo (Walmart, Coca-Cola, P&amp;G, Nike)
              </button>
              <button
                onClick={() => { setUsBondBrandCategory("Salud & Farmacéuticas"); setVisibleBondCount(30); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  usBondBrandCategory === "Salud & Farmacéuticas"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-300 dark:border-emerald-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🏥 Salud (J&amp;J, Eli Lilly, Abbott, Merck)
              </button>
              <button
                onClick={() => { setUsBondBrandCategory("Pagos & Finanzas"); setVisibleBondCount(30); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  usBondBrandCategory === "Pagos & Finanzas"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-300 dark:border-emerald-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                💳 Pagos (Visa, Mastercard, Berkshire)
              </button>
              <button
                onClick={() => { setUsBondBrandCategory("Energía & Recursos"); setVisibleBondCount(30); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  usBondBrandCategory === "Energía & Recursos"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-300 dark:border-emerald-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                ⚡ Energía (Exxon, Chevron)
              </button>
              <button
                onClick={() => { setUsBondBrandCategory("Gobierno & Deuda Soberana"); setVisibleBondCount(30); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  usBondBrandCategory === "Gobierno & Deuda Soberana"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-300 dark:border-emerald-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🏛️ Deuda Soberana USA (Tesoro)
              </button>
            </div>

            {/* 3. Nivel de Seguridad Traducido y Ordenamiento */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">Calidad Crediticia:</span>
                <button
                  onClick={() => { setUsBondSafetyFilter("all"); setVisibleBondCount(30); }}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    usBondSafetyFilter === "all"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Todas (High Grade)
                </button>
                <button
                  onClick={() => { setUsBondSafetyFilter("Seguridad Máxima"); setVisibleBondCount(30); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                    usBondSafetyFilter === "Seguridad Máxima"
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-[#00F5A0] font-bold border border-emerald-400 dark:border-emerald-500/40"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>🛡️ Seguridad Máxima (AAA / AA+)</span>
                </button>
                <button
                  onClick={() => { setUsBondSafetyFilter("Riesgo Ultra Bajo"); setVisibleBondCount(30); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                    usBondSafetyFilter === "Riesgo Ultra Bajo"
                      ? "bg-cyan-100 text-cyan-900 dark:bg-cyan-950/80 dark:text-cyan-300 font-bold border border-cyan-400 dark:border-cyan-500/40"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>💎 Riesgo Ultra Bajo (AA / AA-)</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold">Ordenar:</span>
                <button
                  onClick={() => setUsBondSort("tir")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    usBondSort === "tir"
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Ordenar por mayor rendimiento anual garantizado al vencimiento"
                >
                  Mayor Rendimiento (YTM)
                </button>
                <button
                  onClick={() => setUsBondSort("score")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    usBondSort === "score"
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Solidez Institucional
                </button>
                <button
                  onClick={() => setUsBondSort("maturity")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    usBondSort === "maturity"
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Ordenar por cobro de capital más cercano"
                >
                  Vencimiento Próximo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros para ETFs */}
        {activeMarket === "wall_street" && wallStreetSubTab === "etfs" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">Gestor:</span>
              <button
                onClick={() => setEtfManagerFilter("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  etfManagerFilter === "all"
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setEtfManagerFilter("State Street")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  etfManagerFilter === "State Street"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-300 dark:border-emerald-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                State Street (SPY)
              </button>
              <button
                onClick={() => setEtfManagerFilter("Invesco")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  etfManagerFilter === "Invesco"
                    ? "bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-300 dark:border-cyan-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Invesco (QQQ)
              </button>
            </div>

            {/* Filtro de Dividendos en ETFs */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">Dividendos:</span>
              <button
                onClick={() => setEtfDivFilter("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  etfDivFilter === "all"
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setEtfDivFilter("dividend")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  etfDivFilter === "dividend"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#00F5A0] font-bold border border-emerald-300 dark:border-emerald-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <CircleDollarSign className="w-3 h-3 text-emerald-600 dark:text-[#00F5A0]" />
                <span>Con Div.</span>
              </button>
              <button
                onClick={() => setEtfDivFilter("growth")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  etfDivFilter === "growth"
                    ? "bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-300 dark:border-cyan-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Zap className="w-3 h-3 text-cyan-600 dark:text-cyan-300" />
                <span>Crecimiento</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LISTA DE TARJETAS */}
      <div className="mt-6 space-y-4">
        {/* 1. WALL STREET -> ACCIONES */}
        {activeMarket === "wall_street" && wallStreetSubTab === "stocks" && (
          <>
            <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-[#0a1628] border border-cyan-200 dark:border-cyan-500/30 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>
                🌐 <strong className="text-slate-900 dark:text-white">Wall Street (Acciones Directas en USD):</strong> Universo auditado de 450 empresas del S&P 500 y Nasdaq para inversores con cuenta en broker de Estados Unidos (Interactive Brokers, Charles Schwab, Ameritrade). Cotizan en dólares billete.
              </span>
            </div>

            {filteredStocks.slice(0, visibleCount).map((stock, idx) => renderStockCard(stock, idx, false))}

            {visibleCount < filteredStocks.length && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 30)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0e1b2f] dark:hover:bg-[#142642] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold font-mono transition-all"
                >
                  Cargar más acciones ({visibleCount} de {filteredStocks.length}) ↓
                </button>
              </div>
            )}
          </>
        )}

        {/* 2. WALL STREET -> ETFS */}
        {activeMarket === "wall_street" && wallStreetSubTab === "etfs" && (
          <>
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#091522] border border-emerald-200 dark:border-emerald-500/30 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>
                🏛️ <strong className="text-slate-900 dark:text-white">Fondos Cotizados Globales (ETFs):</strong> Carteras diversificadas de gestión pasiva que replican los índices más prestigiosos del planeta (S&P 500, Nasdaq 100, Dow Jones).
              </span>
            </div>

            {filteredEtfs.map((etf, idx) => (
              <div key={etf.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-[#00F5A0] font-mono tracking-tight pt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                          {etf.ticker}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-[#132840] border border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                          {etf.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-[#0a1e1b] border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-[#00F5A0] text-xs font-black uppercase tracking-wider">
                          ETF TOP TIER
                        </span>
                      </div>
                      <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-semibold mt-1 tracking-normal">
                        {etf.name}{" "}
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          • Gestor: {etf.manager} • Comisión: {etf.expense_ratio}% anual
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-slate-100/90 dark:bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        PRECIO USA (USD)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                          ${etf.price.toFixed(2)}
                        </span>
                        <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-[#00F5A0]">
                          +{etf.day_change}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        PRECIO CEDEAR (ARS)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-[#00F5A0] font-mono">
                          ${etf.cedear_price_ars.toLocaleString("es-AR")}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">ARS</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                        Ratio {etf.cedear_ratio}
                      </span>
                    </div>

                    <div
                      onClick={() => setSelectedStockForModal(etf as unknown as ModalItem)}
                      className="flex flex-col cursor-pointer group/modal bg-slate-200/60 hover:bg-slate-200 dark:bg-[#0e1a2c]/60 dark:hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                      title="Click para ver el potencial de cartera y consenso"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                          POTENCIAL (1A)
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                          Desglose ↗
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-[#00F5A0] font-mono">
                          +{etf.upside}%
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                        Target: ${etf.target_price} USD
                      </span>
                    </div>

                    <div
                      onClick={() => setSelectedScoreItem(etf as unknown as ScoreItem)}
                      className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-slate-200/60 hover:bg-slate-200 dark:bg-[#0e1a2c]/60 dark:hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                      title="Click para ver el desglose del Score"
                    >
                      <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                          SCORE TOTAL
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                          Desglose ↗
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00F5A0] font-mono drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                          {etf.score}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">/100</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start gap-2 bg-slate-50 dark:bg-[#060b13] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-700 dark:text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30 self-start">
                    TESIS:
                  </span>
                  <p className="text-sm sm:text-[15px] font-normal text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                    {etf.thesis}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 3. WALL STREET -> BONOS USA HIGH GRADE (DISEÑADO PARA INVERSORES PRINCIPIANTES) */}
        {activeMarket === "wall_street" && wallStreetSubTab === "bonds" && (
          <>
            <div className="p-4 sm:p-5 rounded-2xl bg-cyan-50/70 dark:bg-[#071322] border border-cyan-200 dark:border-cyan-500/30 text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <strong className="text-slate-900 dark:text-white text-sm sm:text-base font-bold">
                  Catálogo Curado de Renta Fija en Dólares (High Grade EE.UU. - Riesgo Casi Nulo)
                </strong>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Selección de <strong>{us_bonds.length} bonos corporativos y del tesoro de EE.UU.</strong> diseñada específicamente para inversores principiantes. Todos los títulos cuentan con <strong>calificación crediticia High Grade (AAA a AA-)</strong>, estructura <strong>100% Bullet (No Rescatable)</strong> para eliminar el riesgo de refinanciación, emisiones superiores a <strong>$1.000M USD</strong> para máxima liquidez y un <strong>plazo mínimo de 1 año (al menos 2 cupones semestrales por cobrar)</strong> para asegurar que la rentabilidad supere ampliamente las comisiones del broker.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-mono flex items-center gap-1.5 border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                <span>ℹ️</span>
                <span><strong>Nota de Cotización:</strong> Precios y paridades de referencia de mercado secundario (cierre diario OTC / FINRA TRACE). Al momento de comprar en tu broker internacional (Charles Schwab, Interactive Brokers), el precio final variará centavos según el spread de compra-venta vigente en la mesa de dinero.</span>
              </p>
            </div>

            {/* Calculadora Interactiva de Comisión de Broker & TIR Neta */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-[#071322] border border-slate-300 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00F5A0] border border-emerald-500/20 shrink-0">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Comisión de tu Broker para Cálculo de TIR Neta
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-[#00F5A0] border border-emerald-300 dark:border-emerald-600/30 font-bold">
                      {brokerFeePercent > 0 ? `Comisión activa: ${brokerFeePercent}%` : "TIR Bruta (Sin Comisión)"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Descuenta el costo transaccional de compra distribuido en el plazo del bono para reflejar tu rentabilidad real de bolsillo.
                  </p>
                </div>
              </div>

              {/* Botones Presets + Input Personalizado */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-1 hidden sm:inline">Brokers:</span>
                {[
                  { label: "0% (Bruta)", val: 0.0 },
                  { label: "0.1% (IBKR / Schwab)", val: 0.1 },
                  { label: "0.5% (Estándar)", val: 0.5 },
                  { label: "1.0% (Broker Local)", val: 1.0 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setBrokerFeePercent(preset.val)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                      brokerFeePercent === preset.val
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-xs dark:bg-[#00F5A0] dark:text-black dark:border-[#00F5A0]"
                        : "bg-white dark:bg-[#0d1b2e] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                
                <div className="flex items-center gap-1 bg-white dark:bg-[#0d1b2e] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1" title="Ingresa un porcentaje de comisión manual">
                  <span className="text-[11px] font-mono text-slate-400">Otro:</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.05"
                    value={brokerFeePercent}
                    onChange={(e) => setBrokerFeePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-12 bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white outline-none text-right"
                  />
                  <span className="text-xs font-mono text-slate-500">%</span>
                </div>
              </div>
            </div>

            {filteredUsBonds.slice(0, visibleBondCount).map((bond: UsBondItem, idx: number) => {
              const feeDrag = (bond.maturity_years && bond.maturity_years > 0)
                ? (brokerFeePercent / bond.maturity_years)
                : brokerFeePercent;
              const netYtm = Math.max(0, (bond.tir_usd || 0) - feeDrag);

              return (
              <div key={bond.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-[#00F5A0] font-mono tracking-tight pt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono flex items-center gap-1.5">
                          <span>{bond.brand_icon || "🏢"}</span>
                          <span>{bond.ticker}</span>
                        </span>

                        {/* Badge de Seguridad Traducido */}
                        <span className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-bold tracking-wide border flex items-center gap-1.5 shadow-xs ${
                          bond.rating === "AAA" || bond.rating === "AA+"
                            ? "bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-500/20 dark:text-[#00F5A0] dark:border-[#00F5A0]"
                            : "bg-cyan-100 text-cyan-950 border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400"
                        }`}>
                          <span>{bond.safety_badge === "Seguridad Máxima" ? "🛡️ Seguridad Máxima" : "💎 Riesgo Ultra Bajo"}</span>
                          <span className="text-[11px] opacity-75 font-mono">({bond.rating} / {bond.moodys})</span>
                        </span>

                        {/* Estructura No Rescatable (Bullet) */}
                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-[#142338] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono" title="Bono no rescatable: la empresa no puede cancelarlo antes de tiempo">
                          🔒 Bullet (No Rescatable)
                        </span>

                        {/* Bloque de Tranquilidad */}
                        <span className={`px-2 py-1 rounded-md text-xs font-mono font-bold border ${
                          bond.maturity_block === "short"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-[#00F5A0] dark:border-emerald-500/40"
                            : bond.maturity_block === "medium"
                            ? "bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-500/40"
                            : "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-500/40"
                        }`}>
                          {bond.maturity_block === "short" ? "🟢 Corto Plazo (1-3A)" : bond.maturity_block === "medium" ? "🔵 Mediano Plazo (3-7A)" : "🟣 Largo Plazo (7-10A)"}
                        </span>

                        {/* Emisión Mínima Garantizada */}
                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-[#142338] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono hidden sm:inline" title="Monto de emisión superior a $1.000M USD">
                          💧 {bond.amount_outstanding_usd}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-semibold mt-1 tracking-normal">
                        {bond.name}{" "}
                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                          • Emisor: {bond.issuer} ({bond.sector})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5 Métricas Clave (Rendimiento YTM, Cotización & Paridad, Cupón, Vencimiento y Solidez) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-5 bg-slate-100/90 dark:bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    {/* 1. Rendimiento al Vencimiento (YTM / TIR Neta o Bruta) - Métrica Principal */}
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-emerald-800 dark:text-[#00F5A0] tracking-wider">
                        {brokerFeePercent > 0 ? "TIR NETA (EN BOLSILLO)" : "RENDIMIENTO SEGURO (YTM)"}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-[#00F5A0] font-mono">
                          {netYtm.toFixed(2)}%
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-800 dark:text-[#00F5A0]/90">
                        {brokerFeePercent > 0 ? "Tasa neta anual estimada" : "Tasa neta anual USD"}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {brokerFeePercent > 0
                          ? `Bruta: ${bond.tir_usd}% (Comisión: -${feeDrag.toFixed(2)}%/año)`
                          : "Fija al vencimiento"}
                      </span>
                    </div>

                    {/* 2. Precio de Cotización & Paridad */}
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        PRECIO &amp; PARIDAD
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                          ${bond.price_usd?.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">USD</span>
                      </div>
                      <span className="text-xs font-medium font-mono text-slate-600 dark:text-slate-300">
                        Paridad {bond.parity}%
                      </span>
                      <span className={`text-[10px] font-mono font-bold mt-0.5 ${
                        bond.price_usd < 100
                          ? "text-emerald-700 dark:text-[#00F5A0]"
                          : bond.price_usd === 100
                          ? "text-slate-600 dark:text-slate-300"
                          : "text-blue-600 dark:text-blue-400"
                      }`}>
                        {bond.price_usd < 100
                          ? "🟢 Bajo la par"
                          : bond.price_usd === 100
                          ? "⚪ A la par"
                          : "🔵 Sobre la par"}
                      </span>
                    </div>

                    {/* 3. Cupón Periódico */}
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        CUPÓN &amp; COBRO
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                          {bond.coupon}%
                        </span>
                      </div>
                      <span className="text-xs font-medium font-mono text-slate-600 dark:text-slate-300">{bond.frequency}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Renta pasiva directa</span>
                    </div>

                    {/* 4. Vencimiento de Capital */}
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        COBRO DE CAPITAL
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
                          {bond.maturity_date}
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300">{bond.maturity_years} años restantes</span>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-[#00F5A0] font-semibold">
                        📅 {bond.remaining_coupons || Math.max(2, Math.round(bond.maturity_years * 2))} cupones restantes
                      </span>
                    </div>

                    {/* 5. Solidez y Desglose Cuantitativo */}
                    <div
                      onClick={() => setSelectedScoreItem(bond)}
                      className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-slate-200/60 hover:bg-slate-200 dark:bg-[#0e1a2c]/60 dark:hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                      title="Ver desglose detallado de solvencia y calificación crediticia"
                    >
                      <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                          SOLIDEZ
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                          Desglose ↗
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-[#00F5A0] font-mono">
                          {bond.score}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">/ 100</span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {bond.min_investment}
                      </span>
                    </div>
                  </div>
                </div>

                {bond.thesis && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                    <span className="text-emerald-700 dark:text-[#00F5A0] font-bold mr-1">Tesis para Principiantes:</span>
                    {bond.thesis}
                  </div>
                )}
              </div>
              );
            })}

            {visibleBondCount < filteredUsBonds.length && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setVisibleBondCount((prev) => prev + 30)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0e1b2f] dark:hover:bg-[#142642] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold font-mono transition-all"
                >
                  Cargar más bonos ({visibleBondCount} de {filteredUsBonds.length}) ↓
                </button>
              </div>
            )}
          </>
        )}

        {/* 4. MERCADO LOCAL -> CEDEARS EN PESOS */}
        {activeMarket === "argentina" && argSubTab === "cedears" && (
          <>
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#091522] border border-emerald-200 dark:border-emerald-500/30 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>
                🟢 <strong className="text-slate-900 dark:text-white">CEDEARs (Certificados de Depósito Argentinos):</strong> Acciones y ETFs de empresas internacionales (Apple, Nvidia, Microsoft, etc.) que se compran y venden directamente en la Bolsa de Buenos Aires (BYMA) en <strong className="text-emerald-700 dark:text-[#00F5A0]">Pesos (ARS) o Dólar MEP</strong>, vinculadas a la cotización del Dólar CCL oficial.
              </span>
            </div>

            {filteredCedears.slice(0, visibleCount).map((stock, idx) => renderStockCard(stock, idx, true))}

            {visibleCount < filteredCedears.length && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 30)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0e1b2f] dark:hover:bg-[#142642] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold font-mono transition-all"
                >
                  Cargar más CEDEARs ({visibleCount} de {filteredCedears.length}) ↓
                </button>
              </div>
            )}
          </>
        )}

        {/* 5. MERCADO LOCAL -> ONS EN DÓLARES */}
        {activeMarket === "argentina" && argSubTab === "ons" && (
          <>
            <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-[#0a1424] border border-cyan-200 dark:border-cyan-500/30 text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span>
                🏢 <strong className="text-slate-900 dark:text-white">Obligaciones Negociables (ONs):</strong> Deuda corporativa privada de empresas líderes (YPF, Pampa Energía, Pan American Energy). Pagan cupones periódicos en <strong className="text-emerald-700 dark:text-[#00F5A0]">Dólares billete (MEP / Cable)</strong> y se operan tanto en Pesos como en Dólares en BYMA.
              </span>
            </div>

            {filteredOns.map((on, idx) => (
              <div key={on.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-[#00F5A0] font-mono tracking-tight pt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                          {on.ticker}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-bold tracking-wide border ${
                            on.law.includes("Nueva York")
                              ? "bg-cyan-50 dark:bg-[#132840] border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200"
                              : "bg-amber-50 dark:bg-[#291e10] border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {on.law}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#142338] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono">
                          Vence: <strong className="text-emerald-700 dark:text-[#00F5A0]">{on.maturity_date}</strong>
                        </span>
                      </div>
                      <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-semibold mt-1 tracking-normal">
                        {on.name} <span className="text-slate-500 dark:text-slate-400 font-normal">• Emisor: {on.issuer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-slate-100/90 dark:bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        PRECIO &amp; PARIDAD
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                          ${on.price_usd ? on.price_usd.toFixed(2) : "100.00"}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">USD</span>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold ${
                          on.parity > 100 ? "text-cyan-600 dark:text-cyan-300" : on.parity < 100 ? "text-amber-600 dark:text-amber-300" : "text-emerald-600 dark:text-[#00F5A0]"
                        }`}
                      >
                        {on.parity_status || (on.parity > 100 ? "Sobre par" : "Bajo par")} ({on.parity}%)
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        RENDIMIENTO (TIR)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-[#00F5A0] font-mono">
                          {on.tir_usd}%
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">Tasa neta anual USD</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        CUPÓN &amp; FRECUENCIA
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                          {on.coupon}%
                        </span>
                      </div>
                      <span className="text-xs font-medium font-mono text-slate-600 dark:text-slate-300">{on.frequency}</span>
                    </div>

                    <div
                      onClick={() => setSelectedScoreItem(on)}
                      className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-slate-200/60 hover:bg-slate-200 dark:bg-[#0e1a2c]/60 dark:hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                      title="Ver desglose detallado de cómo se compone esta calificación de Solvencia"
                    >
                      <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                          SOLIDEZ
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                          Desglose ↗
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00F5A0] font-mono drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                          {on.score}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">/100</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                          <Building2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start gap-2 bg-slate-50 dark:bg-[#060b13] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-700 dark:text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30 self-start">
                    TESIS:
                  </span>
                  <p className="text-sm sm:text-[15px] font-normal text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                    {on.thesis}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 6. MERCADO LOCAL -> MERVAL */}
        {activeMarket === "argentina" && argSubTab === "merval" && (
          <>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#091522] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>
                📊 <strong className="text-slate-900 dark:text-white">Acciones Argentinas (S&P Merval):</strong> Las empresas nacionales más representativas (Galicia, YPF, Pampa Energía, Macro) cotizando en Pesos en el Panel Líder de BYMA.
              </span>
            </div>

            {filteredMerval.map((m, idx) => (
              <div key={m.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00F5A0] font-mono tracking-tight pt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                          {m.ticker}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-[#132840] border border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                          {m.sector}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-semibold mt-1 tracking-normal">
                        {m.name}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-slate-100/90 dark:bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        PRECIO EN PESOS
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                          ${m.price_ars.toLocaleString("es-AR")}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">ARS</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#00F5A0]">
                        +{m.day_change}% hoy
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        VALUACIÓN (P/E)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                          {m.pe_ratio}x
                        </span>
                      </div>
                      <span className="text-xs font-medium font-mono text-slate-600 dark:text-slate-300">Ganancias anuales</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        MERCADO
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                          BYMA
                        </span>
                      </div>
                      <span className="text-xs font-medium font-mono text-emerald-600 dark:text-emerald-400">Panel Líder</span>
                    </div>

                    <div
                      onClick={() => setSelectedScoreItem(m)}
                      className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-slate-200/60 hover:bg-slate-200 dark:bg-[#0e1a2c]/60 dark:hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                      title="Ver desglose detallado de cómo se compone este Score"
                    >
                      <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                          SCORE TOTAL
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                          Desglose ↗
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00F5A0] font-mono drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                          {m.score}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">/100</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start gap-2 bg-slate-50 dark:bg-[#060b13] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-700 dark:text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30 self-start">
                    TESIS:
                  </span>
                  <p className="text-sm sm:text-[15px] font-normal text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                    {m.thesis}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 7. MERCADO LOCAL -> BONOS SOBERANOS */}
        {activeMarket === "argentina" && argSubTab === "bonds" && (
          <>
            <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-[#0a1424] border border-cyan-200 dark:border-cyan-500/30 text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span>
                🏛️ <strong className="text-slate-900 dark:text-white">Bonos Soberanos de la República Argentina:</strong> Deuda pública nacional (Bonares y Globales). Instrumentos para inversores que buscan altos rendimientos en dólares con perfil de riesgo soberano.
              </span>
            </div>

            {filteredSovereign.map((b, idx) => (
              <div key={b.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00F5A0] font-mono tracking-tight pt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                          {b.ticker}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-[#132840] border border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                          {b.parity_status || (b.law.includes("Nueva York") ? "Bono Global" : "Bonar")}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#142338] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono">
                          Ley: {b.law}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-semibold mt-1 tracking-normal">
                        {b.name}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-slate-100/90 dark:bg-[#091220]/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        PRECIO USD
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                          ${b.price_usd.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">USD</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#00F5A0]">
                        Paridad {b.parity}%
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        RENDIMIENTO (TIR)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-[#00F5A0] font-mono">
                          {b.tir_usd}%
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">Tasa anual en USD</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                        VENCIMIENTO
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                          {b.maturity_date}
                        </span>
                      </div>
                      <span className="text-xs font-medium font-mono text-slate-600 dark:text-slate-300">Amortizable</span>
                    </div>

                    <div
                      onClick={() => setSelectedScoreItem(b)}
                      className="flex flex-col sm:items-end justify-center cursor-pointer group/modal bg-slate-200/60 hover:bg-slate-200 dark:bg-[#0e1a2c]/60 dark:hover:bg-[#12243d] p-2 -m-2 rounded-xl border border-transparent hover:border-emerald-500/40 transition-all"
                      title="Ver desglose detallado de cómo se compone este Score"
                    >
                      <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full">
                        <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-300 tracking-wider">
                          SCORE TOTAL
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-[#00F5A0] font-mono group-hover/modal:underline flex items-center">
                          Desglose ↗
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00F5A0] font-mono drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                          {b.score}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-300">/100</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-[#00F5A0] group-hover/modal:scale-110 transition-transform">
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start gap-2 bg-slate-50 dark:bg-[#060b13] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-700 dark:text-[#00F5A0] tracking-wide uppercase whitespace-nowrap bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30 self-start">
                    TESIS:
                  </span>
                  <p className="text-sm sm:text-[15px] font-normal text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                    {b.thesis}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modales Detallados */}
      <StockDetailModal
        stock={selectedStockForModal}
        onClose={() => setSelectedStockForModal(null)}
      />

      <ScoreDetailModal
        item={selectedScoreItem}
        onClose={() => setSelectedScoreItem(null)}
      />
    </section>
  );
}
