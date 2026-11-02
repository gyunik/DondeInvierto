"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  CircleDollarSign,
  Zap,
  Calculator,
  Download,
  ChevronDown,
  ShieldCheck,
  LayoutGrid,
  List,
} from "lucide-react";
import ArgentinaFlag from "./ArgentinaFlag";
import UsaFlag from "./UsaFlag";
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
  const [stockSectorFilter, setStockSectorFilter] = useState<string>("all");
  const [etfDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfManagerFilter] = useState<string>("all");
  const [usBondMaturityBlock, setUsBondMaturityBlock] = useState<"all" | "short" | "medium" | "long">("all");
  const [usBondBrandCategory, setUsBondBrandCategory] = useState<string>("all");
  const [usBondSafetyFilter, setUsBondSafetyFilter] = useState<"all" | "Seguridad Máxima" | "Riesgo Ultra Bajo">("all");
  const [usBondSort, setUsBondSort] = useState<"tir" | "score" | "maturity">("tir");
  const brokerFeePercent = 0.5;
  const [visibleBondCount, setVisibleBondCount] = useState<number>(30);
  const [selectedStockForModal, setSelectedStockForModal] = useState<ModalItem | null>(null);
  const [selectedScoreItem, setSelectedScoreItem] = useState<ScoreItem | null>(null);

  // Modo de vista: tabla institucional compacta (por defecto) o tarjetas detalladas
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Dropdown popovers en barra compacta
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { stocks, etfs, ons, argentina, last_updated, ccl_dollar } = marketData;
  const us_bonds: UsBondItem[] = useMemo(() => marketData.us_bonds || [], []);
  const macro = (marketData as { macro?: import("@/types/market").MacroData }).macro;
  const formattedLastUpdated = last_updated.replace(/\s*\(Hora Buenos Aires,?\s*UTC-3\)/i, "");

  // Lista única de sectores para filtros
  const stockSectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return Array.from(set).sort();
  }, [stocks]);

  // Lista única de marcas/sectores de Bonos USA
  const bondBrandCategories = useMemo(() => {
    const set = new Set<string>();
    us_bonds.forEach((b: UsBondItem) => {
      if (b.brand_category) set.add(b.brand_category);
    });
    return Array.from(set).sort();
  }, [us_bonds]);

  // 1. Filtrado de Acciones de Wall Street (Todas)
  let filteredStocks = stocks
    .filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      const ret = s.retorno_estimado_pct ?? s.retornoEstimadoPct ?? s.upside ?? 0;
      const sc = s.score_total ?? s.scoreTotal ?? s.score ?? 0;
      if (stockOpportunityFilter === "opportunities" && !q) {
        if (sc < 60 || ret <= 0) return false;
      }

      if (stockDivFilter === "dividend") return s.pays_dividend;
      if (stockDivFilter === "growth") return !s.pays_dividend;
      if (stockSectorFilter !== "all" && s.sector !== stockSectorFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const scoreB = b.score_total ?? b.scoreTotal ?? b.score ?? 0;
      const scoreA = a.score_total ?? a.scoreTotal ?? a.score ?? 0;
      return scoreB - scoreA;
    });

  // 2. Filtrado de CEDEARs (Solo acciones con CEDEAR en Argentina)
  let filteredCedears = stocks
    .filter((s) => s.has_cedear)
    .filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      const ret = s.retorno_estimado_pct ?? s.retornoEstimadoPct ?? s.upside ?? 0;
      const sc = s.score_total ?? s.scoreTotal ?? s.score ?? 0;
      if (stockOpportunityFilter === "opportunities" && !q) {
        if (sc < 60 || ret <= 0) return false;
      }

      if (stockDivFilter === "dividend") return s.pays_dividend;
      if (stockDivFilter === "growth") return !s.pays_dividend;
      if (stockSectorFilter !== "all" && s.sector !== stockSectorFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const scoreB = b.score_total ?? b.scoreTotal ?? b.score ?? 0;
      const scoreA = a.score_total ?? a.scoreTotal ?? a.score ?? 0;
      return scoreB - scoreA;
    });

  // 3. Filtrado de ETFs de Wall Street
  let filteredEtfs = etfs
    .filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.ticker.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.manager && e.manager.toLowerCase().includes(q));
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
        const netB = (b.tir_usd || 0) - brokerFeePercent / (b.maturity_years || 1);
        const netA = (a.tir_usd || 0) - brokerFeePercent / (a.maturity_years || 1);
        return netB - netA;
      }
      if (usBondSort === "maturity") {
        return (a.maturity_years || 0) - (b.maturity_years || 0);
      }
      return (b.score || 0) - (a.score || 0);
    });

  // 5. Filtrado de ONs en Dólares (Argentina)
  let filteredOns = ons.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      o.ticker.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      o.issuer.toLowerCase().includes(q)
    );
  });

  // 6. Filtrado de Merval (Acciones Locales)
  let filteredMerval = argentina.merval.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      m.ticker.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q)
    );
  });

  // 7. Filtrado de Bonos Soberanos (Argentina)
  let filteredSovereign = argentina.sovereign_bonds.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      b.ticker.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q)
    );
  });

  if (maxItems) {
    filteredStocks = filteredStocks.slice(0, maxItems);
    filteredCedears = filteredCedears.slice(0, maxItems);
    filteredEtfs = filteredEtfs.slice(0, maxItems);
    filteredUsBonds = filteredUsBonds.slice(0, maxItems);
    filteredOns = filteredOns.slice(0, maxItems);
    filteredMerval = filteredMerval.slice(0, maxItems);
    filteredSovereign = filteredSovereign.slice(0, maxItems);
  }

  // Exportar a CSV funcional
  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeMarket === "wall_street" && wallStreetSubTab === "bonds") {
      headers = ["Ticker", "Emisor", "Sector", "Rating", "Vencimiento", "YTM %", "Cupon %", "Precio USD", "Score"];
      rows = filteredUsBonds.map((b) => [
        b.ticker,
        `"${b.issuer}"`,
        `"${b.sector}"`,
        b.rating,
        b.maturity,
        `${b.tir_usd}`,
        `${b.coupon}`,
        `${b.price_usd}`,
        `${b.score}`,
      ]);
    } else if (
      (activeMarket === "wall_street" && wallStreetSubTab === "stocks") ||
      (activeMarket === "argentina" && argSubTab === "cedears")
    ) {
      const list = activeMarket === "wall_street" ? filteredStocks : filteredCedears;
      headers = ["Ticker", "Nombre", "Sector", "Precio USD", "Target USD", "Potencial %", "Score", "Dividendo %", "PER"];
      rows = list.map((s) => [
        s.ticker,
        `"${s.name}"`,
        `"${s.sector}"`,
        `${s.price}`,
        `${s.precio_objetivo_algoritmo ?? s.target_price}`,
        `${s.retorno_estimado_pct ?? s.upside}%`,
        `${s.score_total ?? s.score}`,
        `${s.dividend_yield ?? 0}%`,
        `${s.pe_ratio}`,
      ]);
    } else if (activeMarket === "argentina" && argSubTab === "ons") {
      headers = ["Ticker", "Nombre", "Emisor", "Rating", "TIR USD %", "Cupon %", "Vencimiento", "Ley", "Score"];
      rows = filteredOns.map((o) => [
        o.ticker,
        `"${o.name}"`,
        `"${o.issuer}"`,
        o.rating,
        `${o.tir_usd}%`,
        `${o.coupon}%`,
        o.maturity,
        o.law,
        `${o.score}`,
      ]);
    } else if (activeMarket === "argentina" && argSubTab === "merval") {
      headers = ["Ticker", "Nombre", "Sector", "Precio ARS", "Variacion %", "Score", "P/E"];
      rows = filteredMerval.map((m) => [
        m.ticker,
        `"${m.name}"`,
        `"${m.sector}"`,
        `${m.price_ars}`,
        `${m.day_change}%`,
        `${m.score}`,
        `${m.pe_ratio}`,
      ]);
    } else if (activeMarket === "argentina" && argSubTab === "bonds") {
      headers = ["Ticker", "Nombre", "TIR USD %", "Paridad %", "Vencimiento", "Ley", "Score"];
      rows = filteredSovereign.map((b) => [
        b.ticker,
        `"${b.name}"`,
        `${b.tir_usd}%`,
        `${b.parity}%`,
        b.maturity_date,
        b.law,
        `${b.score}`,
      ]);
    } else {
      headers = ["Ticker", "Nombre", "Categoria", "Precio USD", "Upside %", "Score"];
      rows = filteredEtfs.map((e) => [
        e.ticker,
        `"${e.name}"`,
        `"${e.category}"`,
        `${e.price}`,
        `${e.upside}%`,
        `${e.score}`,
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", encodedUri);
    linkElement.setAttribute(
      "download",
      `dondeinvierto_${activeMarket}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  // Helper de badges de recomendación institucional
  const getRecommendationBadge = (sc: number, ret: number) => {
    if (sc >= 85 && ret >= 25) {
      return {
        text: "FUERTE COMPRA",
        className: "bg-emerald-500/20 text-[#00FF88] border-emerald-500/40 font-bold",
      };
    }
    if (sc >= 60 && ret > 0) {
      return {
        text: "COMPRA",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold",
      };
    }
    if (sc >= 40 && ret >= 0) {
      return {
        text: "MANTENER",
        className: "bg-amber-500/10 text-amber-300 border-amber-500/30 font-medium",
      };
    }
    return {
      text: "PRECAUCIÓN",
      className: "bg-rose-500/15 text-rose-300 border-rose-500/30 font-medium",
    };
  };

  // Helper para renderizar tarjetas clásicas detalladas (con soporte total Light & Dark Mode)
  const renderStockCard = (stock: StockItem, idx: number, isCedearView: boolean = false) => {
    const isPositive = stock.day_change >= 0;
    const ret = stock.retorno_estimado_pct ?? stock.retornoEstimadoPct ?? stock.upside ?? 0;
    const sc = stock.score_total ?? stock.scoreTotal ?? stock.score ?? 0;
    const recBadge = getRecommendationBadge(sc, ret);

    return (
      <div key={stock.ticker} className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E2D4A] hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm dark:shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00FF88] font-mono tracking-tight pt-0.5">
              #{idx + 1}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                  {stock.ticker}
                </span>
                {isCedearView && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30">
                    CEDEAR
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#111B30] border border-slate-200 dark:border-[#1E2D4A] text-cyan-800 dark:text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                  {stock.sector}
                </span>
                <span className={`px-2.5 py-1 rounded-md border text-xs font-black tracking-wider uppercase ${recBadge.className}`}>
                  {recBadge.text}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
                {stock.name}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-[#1E2D4A]">
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">PRECIO USA</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">
                  ${stock.price?.toFixed(2)}
                </span>
                <span className={`text-xs font-bold font-mono ${isPositive ? "text-emerald-600 dark:text-[#00FF88]" : "text-rose-500 dark:text-rose-400"}`}>
                  {isPositive ? `+${stock.day_change}%` : `${stock.day_change}%`}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">OPERATORIA</span>
              {stock.has_cedear && stock.cedear_price_ars ? (
                <>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-[#00FF88] font-mono">
                      ${stock.cedear_price_ars.toLocaleString("es-AR")}
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">ARS</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                    Ratio {stock.cedear_ratio}
                  </span>
                </>
              ) : (
                <div className="text-sm font-mono text-slate-600 dark:text-slate-300 mt-1">NYSE / NASDAQ</div>
              )}
            </div>

            <div
              onClick={() => setSelectedStockForModal(stock)}
              className="flex flex-col cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] p-2 rounded-xl border border-slate-200 dark:border-transparent hover:border-emerald-500/40 transition-all"
            >
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">POTENCIAL (1A)</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {ret >= 0 ? `+${ret}%` : `${ret}%`}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                Target: ${stock.precio_objetivo_algoritmo ?? stock.target_price} USD
              </span>
            </div>

            <div
              onClick={() => setSelectedScoreItem(stock)}
              className="flex flex-col sm:items-end justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] p-2 rounded-xl border border-slate-200 dark:border-transparent hover:border-emerald-500/40 transition-all"
            >
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">SCORE TOTAL</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {sc} <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper para tarjetas de ETFs
  const renderEtfCard = (e: EtfItem, idx: number) => {
    return (
      <div key={e.ticker} className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E2D4A] hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm dark:shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00FF88] font-mono tracking-tight pt-0.5">
              #{idx + 1}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                  {e.ticker}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#111B30] border border-slate-200 dark:border-[#1E2D4A] text-cyan-800 dark:text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                  {e.category}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
                  {e.manager}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
                {e.name}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-[#1E2D4A]">
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">PRECIO USD</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                ${e.price?.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">CEDEAR (ARS)</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-[#00FF88] font-mono mt-0.5">
                {e.cedear_price_ars ? `$${e.cedear_price_ars.toLocaleString("es-AR")}` : "Exterior"}
              </span>
            </div>

            <div
              onClick={() => setSelectedStockForModal(e)}
              className="flex flex-col cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] p-2 rounded-xl border border-slate-200 dark:border-transparent hover:border-emerald-500/40 transition-all"
            >
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">UPSIDE EST.</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                +{e.upside}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                Target: ${e.target_price} USD
              </span>
            </div>

            <div
              onClick={() => setSelectedScoreItem(e)}
              className="flex flex-col sm:items-end justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] p-2 rounded-xl border border-slate-200 dark:border-transparent hover:border-emerald-500/40 transition-all"
            >
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">QUANT SCORE</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {e.score} <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper para tarjetas de Bonos USA
  const renderUsBondCard = (b: UsBondItem, idx: number) => {
    return (
      <div key={b.ticker} className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E2D4A] hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm dark:shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00FF88] font-mono tracking-tight pt-0.5">
              #{idx + 1}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                  {b.ticker}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-500/30">
                  {b.rating}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A]">
                  {b.maturity_years} años • {b.maturity}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
                {b.name} ({b.sector})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-[#1E2D4A]">
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">PRECIO USD</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                ${b.price_usd?.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">CUPÓN</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {b.coupon}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">YTM (RENDIMIENTO)</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {b.tir_usd}%
              </span>
            </div>

            <div
              onClick={() => setSelectedScoreItem(b)}
              className="flex flex-col sm:items-end justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] p-2 rounded-xl border border-slate-200 dark:border-transparent hover:border-emerald-500/40 transition-all"
            >
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">SCORE TOTAL</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {b.score} <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper para tarjetas de Acciones Merval
  const renderMervalCard = (m: (typeof marketData.argentina.merval)[0], idx: number) => {
    const isPositive = m.day_change >= 0;
    return (
      <div key={m.ticker} className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E2D4A] hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm dark:shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00FF88] font-mono tracking-tight pt-0.5">
              #{idx + 1}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                  {m.ticker}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#111B30] border border-slate-200 dark:border-[#1E2D4A] text-cyan-800 dark:text-cyan-200 text-xs sm:text-sm font-bold tracking-wide">
                  {m.sector}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  BYMA
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
                {m.name}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-[#1E2D4A]">
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">PRECIO ARS</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">
                  ${m.price_ars?.toLocaleString("es-AR")}
                </span>
                <span className={`text-xs font-bold font-mono ${isPositive ? "text-emerald-600 dark:text-[#00FF88]" : "text-rose-500 dark:text-rose-400"}`}>
                  {isPositive ? `+${m.day_change}%` : `${m.day_change}%`}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">P/E RATIO</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {m.pe_ratio ? `${m.pe_ratio}x` : "-"}
              </span>
            </div>

            <div
              onClick={() => setSelectedScoreItem(m)}
              className="flex flex-col cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] p-2 rounded-xl border border-slate-200 dark:border-transparent hover:border-emerald-500/40 transition-all"
            >
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">TESIS CUANTITATIVA</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans line-clamp-2 mt-0.5">
                {m.thesis}
              </p>
            </div>

            <div
              onClick={() => setSelectedScoreItem(m)}
              className="flex flex-col sm:items-end justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] p-2 rounded-xl border border-slate-200 dark:border-transparent hover:border-emerald-500/40 transition-all"
            >
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">QUANT SCORE</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {m.score} <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper para tarjetas de Obligaciones Negociables (ONs)
  const renderOnCard = (o: (typeof marketData.ons)[0], idx: number) => {
    return (
      <div key={o.ticker} className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E2D4A] hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm dark:shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00FF88] font-mono tracking-tight pt-0.5">
              #{idx + 1}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                  {o.ticker}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-500/30">
                  {o.rating}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A]">
                  Ley {o.law}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
                {o.name} ({o.issuer})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-[#1E2D4A]">
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">TIR (USD)</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {o.tir_usd}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">PARIDAD</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {o.parity}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">VENCIMIENTO</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {o.maturity}
              </span>
            </div>

            <div
              onClick={() => setSelectedScoreItem(o)}
              className="flex flex-col sm:items-end justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] p-2 rounded-xl border border-slate-200 dark:border-transparent hover:border-emerald-500/40 transition-all"
            >
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">QUANT SCORE</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {o.score} <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper para tarjetas de Bonos Soberanos
  const renderSovereignBondCard = (b: (typeof marketData.argentina.sovereign_bonds)[0], idx: number) => {
    return (
      <div key={b.ticker} className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E2D4A] hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm dark:shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-[#00FF88] font-mono tracking-tight pt-0.5">
              #{idx + 1}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                  {b.ticker}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-100 dark:bg-[#132840] text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-500/40">
                  Ley {b.law}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
                {b.name}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-[#1E2D4A]">
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">TIR (USD)</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {b.tir_usd}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">PARIDAD</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {b.parity}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">VENCIMIENTO</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {b.maturity_date}
              </span>
            </div>

            <div
              onClick={() => setSelectedScoreItem(b)}
              className="flex flex-col sm:items-end justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] p-2 rounded-xl border border-slate-200 dark:border-transparent hover:border-emerald-500/40 transition-all"
            >
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400">QUANT SCORE</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-[#00FF88] font-mono mt-0.5">
                {b.score} <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full max-w-[1720px] mx-auto mb-16 scroll-mt-24 px-4 sm:px-6 lg:px-8 space-y-4" id="radar-section">
      {/* 1. SUBHEADER COMPACTO INSTITUCIONAL (Stitch Pattern) */}
      <div className="bg-white dark:bg-[#0D1424] rounded-2xl p-5 lg:p-6 border border-slate-200 dark:border-[#1E2D4A] shadow-md dark:shadow-xl relative overflow-hidden transition-colors duration-200">
        {/* Glow sutil de fondo */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Lado Izquierdo: Badge + Título + Subtítulo */}
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-[#00FF88] uppercase bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                <Zap className="w-3.5 h-3.5 text-[#00FF88] animate-pulse" />
                Terminal Cuantitativa Institucional
              </span>
              <span className="text-xs text-slate-400 font-mono font-semibold">v4.2</span>
              <span className="text-xs text-slate-400 font-mono hidden md:inline">
                • {formattedLastUpdated}
              </span>
            </div>
            {!hideTitle && (
              <>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                  Radar Cuantitativo de Activos
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  Selección objetiva y ranking de Wall Street y Mercado Local auditado por algoritmos de 3 capas y consenso institucional.
                </p>
              </>
            )}
          </div>

          {/* Lado Derecho: Buscador Omnibox + Switcher con Banderas USA y ARGENTINA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Buscador Omnibox */}
            <div className="relative min-w-[260px] md:min-w-[340px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#00FF88]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ticker, empresa, ON, bono..."
                className="w-full bg-slate-100 dark:bg-[#070B12] border border-slate-300 dark:border-[#1E2D4A] text-sm sm:text-base rounded-xl pl-10 pr-14 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:focus:ring-[#00FF88] focus:border-emerald-500 dark:focus:border-[#00FF88] transition-all font-sans font-medium"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="px-1.5 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Conmutador de Jurisdicción con Banderas Oficiales */}
            <div className="flex items-center bg-slate-100 dark:bg-[#070B12] p-1 rounded-xl border border-slate-300 dark:border-[#1E2D4A] self-start sm:self-auto shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveMarket("wall_street");
                  setVisibleCount(30);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                  activeMarket === "wall_street"
                    ? "bg-white dark:bg-[#111B30] text-emerald-700 dark:text-[#00FF88] border border-emerald-500/40 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <UsaFlag className="w-4 h-3 rounded-[2px]" />
                <span>Wall Street</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMarket("argentina");
                  setVisibleCount(30);
                  setStockOpportunityFilter("all");
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                  activeMarket === "argentina"
                    ? "bg-white dark:bg-[#111B30] text-emerald-700 dark:text-[#00FF88] border border-emerald-500/40 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <ArgentinaFlag className="w-4 h-3 rounded-[2px]" />
                <span>Mercado Local</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barra Inferior del Subheader: Pills de Universo por Activo + Tickers Rápidos */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-[#1E2D4A]/80 flex flex-wrap items-center justify-between gap-3">
          {/* Universos de Wall Street */}
          {activeMarket === "wall_street" ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 mr-1 tracking-wider font-semibold">
                Universo:
              </span>
              <button
                type="button"
                onClick={() => {
                  setWallStreetSubTab("stocks");
                  setVisibleCount(30);
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                  wallStreetSubTab === "stocks"
                    ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-[#00FF88] border border-emerald-400 dark:border-emerald-500/40 shadow-sm font-bold"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A]"
                }`}
              >
                {wallStreetSubTab === "stocks" && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />}
                <span>Acciones S&P 500</span>
                <span className="font-mono text-xs opacity-75">({filteredStocks.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWallStreetSubTab("etfs");
                  setVisibleCount(30);
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                  wallStreetSubTab === "etfs"
                    ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-[#00FF88] border border-emerald-400 dark:border-emerald-500/40 shadow-sm font-bold"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A]"
                }`}
              >
                {wallStreetSubTab === "etfs" && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />}
                <span>Top ETFs</span>
                <span className="font-mono text-xs opacity-75">({filteredEtfs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWallStreetSubTab("bonds");
                  setVisibleCount(30);
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                  wallStreetSubTab === "bonds"
                    ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-[#00FF88] border border-emerald-400 dark:border-emerald-500/40 shadow-sm font-bold"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A]"
                }`}
              >
                {wallStreetSubTab === "bonds" && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />}
                <span>Bonos USA High Grade</span>
                <span className="font-mono text-xs opacity-75">({filteredUsBonds.length})</span>
              </button>
            </div>
          ) : (
            /* Universos de Mercado Local */
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase text-slate-400 mr-1 tracking-wider font-semibold">
                Universo:
              </span>
              <button
                type="button"
                onClick={() => {
                  setArgSubTab("cedears");
                  setVisibleCount(30);
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                  argSubTab === "cedears"
                    ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-[#00FF88] border border-emerald-400 dark:border-emerald-500/40 shadow-sm font-bold"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A]"
                }`}
              >
                {argSubTab === "cedears" && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />}
                <span>CEDEARs</span>
                <span className="font-mono text-xs opacity-75">({filteredCedears.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setArgSubTab("ons");
                  setVisibleCount(30);
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                  argSubTab === "ons"
                    ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-[#00FF88] border border-emerald-400 dark:border-emerald-500/40 shadow-sm font-bold"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A]"
                }`}
              >
                {argSubTab === "ons" && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />}
                <span>ONs en Dólares</span>
                <span className="font-mono text-xs opacity-75">({filteredOns.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setArgSubTab("merval");
                  setVisibleCount(30);
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                  argSubTab === "merval"
                    ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-[#00FF88] border border-emerald-400 dark:border-emerald-500/40 shadow-sm font-bold"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A]"
                }`}
              >
                {argSubTab === "merval" && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />}
                <span>Acciones Merval</span>
                <span className="font-mono text-xs opacity-75">({filteredMerval.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setArgSubTab("bonds");
                  setVisibleCount(30);
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                  argSubTab === "bonds"
                    ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-[#00FF88] border border-emerald-400 dark:border-emerald-500/40 shadow-sm font-bold"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30]/60 dark:hover:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A]"
                }`}
              >
                {argSubTab === "bonds" && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />}
                <span>Bonos Soberanos</span>
                <span className="font-mono text-xs opacity-75">({filteredSovereign.length})</span>
              </button>
            </div>
          )}

          {/* Estadísticas rápidas en el margen derecho */}
          <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-slate-400">
            <div>
              Dólar CCL: <strong className="text-white">${ccl_dollar} ARS</strong>
            </div>
            <div className="h-3 w-[1px] bg-slate-300 dark:bg-[#1E2D4A]" />
            <div>
              Tasa FED: <strong className="text-[#00FF88]">{macro?.tasa_actual_fed ?? 3.88}%</strong>
            </div>
            <div className="h-3 w-[1px] bg-slate-300 dark:bg-[#1E2D4A]" />
            <div>
              Auditados: <strong className="text-white font-bold">{stocks.length + us_bonds.length + ons.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS COMPACTA HORIZONTAL (Stitch Filter Toolbar) */}
      <div className="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-[#1E2D4A] rounded-xl p-2.5 shadow-sm dark:shadow-md flex flex-wrap items-center justify-between gap-3 relative z-30 transition-colors duration-200" ref={dropdownRef}>
        {/* Controles de la Izquierda */}
        <div className="flex flex-wrap items-center gap-2">
          {/* A) Filtros para Bonos USA High Grade */}
          {activeMarket === "wall_street" && wallStreetSubTab === "bonds" && (
            <>
              {/* Dropdown 1: Plazo / Horizonte Temporal */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "plazo" ? null : "plazo")}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                    usBondMaturityBlock !== "all"
                      ? "bg-blue-950/80 text-blue-200 border-blue-500/50 shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${usBondMaturityBlock !== "all" ? "bg-blue-400" : "bg-slate-400"}`} />
                  <span className="font-bold text-white">Plazo:</span>
                  <span>
                    {usBondMaturityBlock === "all"
                      ? "Todos los plazos"
                      : usBondMaturityBlock === "short"
                      ? "Corto (1-3 años)"
                      : usBondMaturityBlock === "medium"
                      ? "Mediano (3-7 años)"
                      : "Largo (7-10+ años)"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === "plazo" && (
                  <div className="absolute left-0 mt-2 w-80 rounded-xl bg-[#0B1220] border border-blue-500/40 shadow-2xl p-2 z-50 animate-in fade-in duration-100">
                    <div className="px-2.5 py-1.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-[#1E2D4A] flex items-center justify-between">
                      <span>Bloques de Tranquilidad</span>
                      <span className="text-blue-400 font-bold">Horizonte temporal</span>
                    </div>
                    <div className="space-y-1 mt-1.5 font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setUsBondMaturityBlock("all");
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors text-left ${
                          usBondMaturityBlock === "all" ? "bg-blue-950/70 text-blue-200 font-bold" : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        <span>Todos los plazos</span>
                        <span className="font-mono text-xs text-slate-400">{us_bonds.length}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUsBondMaturityBlock("short");
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors text-left ${
                          usBondMaturityBlock === "short" ? "bg-emerald-950/70 text-emerald-300 font-bold" : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white">Corto Plazo (1-3 años)</div>
                          <p className="text-[11px] text-slate-400">Riesgo precio mínimo • Máxima liquidez</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUsBondMaturityBlock("medium");
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors text-left ${
                          usBondMaturityBlock === "medium" ? "bg-blue-950/70 text-blue-200 font-bold" : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>Mediano Plazo (3-7 años)</span>
                            <span className="text-[9px] bg-blue-500/30 text-blue-300 px-1 rounded font-mono">RECOMENDADO</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Riesgo moderado • Alta certidumbre</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUsBondMaturityBlock("long");
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors text-left ${
                          usBondMaturityBlock === "long" ? "bg-purple-950/70 text-purple-300 font-bold" : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white">Largo Plazo (7-10+ años)</div>
                          <p className="text-[11px] text-slate-400">Sensible a tasas • Mantener a vencimiento</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown 2: Industria / Marcas */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "brand" ? null : "brand")}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                    usBondBrandCategory !== "all"
                      ? "bg-blue-950/80 text-blue-200 border-blue-500/50"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-slate-400">Sector:</span>
                  <span className="text-white font-medium">
                    {usBondBrandCategory === "all" ? "Todos" : usBondBrandCategory}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === "brand" && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#0B1220] border border-[#1E2D4A] shadow-2xl p-2 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setUsBondBrandCategory("all");
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-[#111B30] text-slate-200"
                    >
                      Todos los sectores
                    </button>
                    {bondBrandCategories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setUsBondBrandCategory(c);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                          usBondBrandCategory === c ? "bg-blue-950 text-blue-200 font-bold" : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 3: Calidad Crediticia */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "safety" ? null : "safety")}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                    usBondSafetyFilter !== "all"
                      ? "bg-blue-950/80 text-blue-200 border-blue-500/50"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-400">Rating:</span>
                  <span className="text-white font-medium">
                    {usBondSafetyFilter === "all" ? "High Grade (AAA / AA+)" : usBondSafetyFilter}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === "safety" && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#0B1220] border border-[#1E2D4A] shadow-2xl p-2 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setUsBondSafetyFilter("all");
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-[#111B30] text-slate-200"
                    >
                      Todos (AAA / AA+ / AA / A)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsBondSafetyFilter("Seguridad Máxima");
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-[#111B30] text-emerald-300 font-medium"
                    >
                      Seguridad Máxima (AAA / Tesoro)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsBondSafetyFilter("Riesgo Ultra Bajo");
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-[#111B30] text-blue-300 font-medium"
                    >
                      Riesgo Ultra Bajo (AA+ / AA)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* B) Filtros para Acciones S&P 500 y CEDEARs */}
          {((activeMarket === "wall_street" && wallStreetSubTab === "stocks") ||
            (activeMarket === "argentina" && argSubTab === "cedears")) && (
            <>
              {/* Filtro Oportunidades (Score >= 60) */}
              <button
                type="button"
                onClick={() =>
                  setStockOpportunityFilter(stockOpportunityFilter === "opportunities" ? "all" : "opportunities")
                }
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg border transition-all ${
                  stockOpportunityFilter === "opportunities"
                    ? "bg-emerald-950/70 text-[#00FF88] border-emerald-500/40 shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#00FF88]" />
                <span>{stockOpportunityFilter === "opportunities" ? "Solo Oportunidades (Score ≥ 60)" : "Todo el Ranking"}</span>
              </button>

              {/* Filtro Dividendos */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "dividend" ? null : "dividend")}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                    stockDivFilter !== "all"
                      ? "bg-blue-950/80 text-blue-200 border-blue-500/50"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">Dividendo:</span>
                  <span className="text-white font-medium">
                    {stockDivFilter === "all" ? "Todos" : stockDivFilter === "dividend" ? "Con Dividendo" : "Crecimiento Puro"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === "dividend" && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#0B1220] border border-[#1E2D4A] shadow-2xl p-2 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setStockDivFilter("all");
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-[#111B30] text-slate-200"
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStockDivFilter("dividend");
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-[#111B30] text-emerald-300 font-semibold"
                    >
                      Con Dividendos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStockDivFilter("growth");
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-[#111B30] text-cyan-300 font-semibold"
                    >
                      Crecimiento (Sin Div)
                    </button>
                  </div>
                )}
              </div>

              {/* Filtro Sector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "stockSector" ? null : "stockSector")}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                    stockSectorFilter !== "all"
                      ? "bg-blue-950/80 text-blue-200 border-blue-500/50"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-slate-400">Sector:</span>
                  <span className="text-white font-medium truncate max-w-[120px]">
                    {stockSectorFilter === "all" ? "Todos" : stockSectorFilter}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === "stockSector" && (
                  <div className="absolute left-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-xl bg-[#0B1220] border border-[#1E2D4A] shadow-2xl p-2 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setStockSectorFilter("all");
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-[#111B30] text-slate-200"
                    >
                      Todos los sectores
                    </button>
                    {stockSectors.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          setStockSectorFilter(sec);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg transition-colors truncate ${
                          stockSectorFilter === sec ? "bg-blue-950 text-blue-200 font-bold" : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* C) Filtro directo para simular cartera cuantitativa */}
          <Link
            href={`/simulador?preset=${activeMarket === "argentina" && argSubTab === "ons" ? "usd_income" : "growth_cedears"}`}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00FF88] border border-emerald-500/40 shadow-sm transition-all"
            title="Optimizar asignación por Inverso de la Volatilidad y Sector Cap"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Simular Cartera (Risk Parity)</span>
          </Link>
        </div>

        {/* Controles de la Derecha: Selector de Ordenamiento, Toggle de Vista y Exportar CSV */}
        <div className="flex items-center space-x-2.5 ml-auto">
          {/* Ordenar en Bonos USA */}
          {activeMarket === "wall_street" && wallStreetSubTab === "bonds" && (
            <div className="flex items-center space-x-1.5 text-xs sm:text-sm">
              <label className="text-slate-400 hidden sm:inline" htmlFor="order-bonds">
                Ordenar:
              </label>
              <select
                id="order-bonds"
                value={usBondSort}
                onChange={(e) => setUsBondSort(e.target.value as "tir" | "score" | "maturity")}
                className="bg-[#111B30] border border-[#1E2D4A] rounded-lg text-xs sm:text-sm py-1.5 pl-2.5 pr-8 text-white focus:outline-none focus:ring-1 focus:ring-[#00FF88] font-medium cursor-pointer"
              >
                <option value="tir">Mayor Rendimiento (YTM)</option>
                <option value="score">Solidez Institucional (Score)</option>
                <option value="maturity">Vencimiento Próximo</option>
              </select>
            </div>
          )}

          {/* Toggle de Densidad de Vista (Tabla compacta vs Tarjetas) */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-[#070B12] p-0.5 rounded-lg border border-slate-300 dark:border-[#1E2D4A]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "table" ? "bg-white dark:bg-[#111B30] text-emerald-700 dark:text-[#00FF88] shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              title="Vista Compacta (Tabla Institucional)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "cards" ? "bg-white dark:bg-[#111B30] text-emerald-700 dark:text-[#00FF88] shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              title="Vista Detallada (Tarjetas)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botón de Exportar a CSV Funcional */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-[#1E2D4A] flex items-center space-x-1.5 transition-colors font-medium"
            title="Descargar datos filtrados en formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 3. TABLA DE DATOS INSTITUCIONAL COMPACTA (Stitch Data Table) */}
      <div className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200 dark:border-[#1E2D4A] shadow-lg dark:shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Banner de Resumen de Resultados */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-[#1E2D4A] bg-slate-50 dark:bg-[#0A101D] flex items-center justify-between text-xs sm:text-sm font-mono">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Resultados Filtrados</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-[#00FF88] text-xs font-bold border border-emerald-500/30">
              {activeMarket === "wall_street"
                ? wallStreetSubTab === "stocks"
                  ? `${filteredStocks.length} Acciones`
                  : wallStreetSubTab === "etfs"
                  ? `${filteredEtfs.length} ETFs`
                  : `${filteredUsBonds.length} Bonos USA`
                : argSubTab === "cedears"
                ? `${filteredCedears.length} CEDEARs`
                : argSubTab === "ons"
                ? `${filteredOns.length} ONs`
                : argSubTab === "merval"
                ? `${filteredMerval.length} Acciones Merval`
                : `${filteredSovereign.length} Bonos Soberanos`}
            </span>
            <span className="text-slate-600 dark:text-slate-400 hidden sm:inline font-medium">• Ordenado por modelo cuantitativo institucional</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
              Cotizaciones auditadas en tiempo real
            </span>
          </div>
        </div>

        {/* --- VISTA: TABLA INSTITUCIONAL --- */}
        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            {/* A) Tabla para Bonos USA High Grade */}
            {activeMarket === "wall_street" && wallStreetSubTab === "bonds" && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1E2D4A] bg-slate-100 dark:bg-[#070B12] text-xs font-mono uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Ticker / Activo</th>
                    <th className="py-3.5 px-4 font-semibold">Emisor & Industria</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Rating</th>
                    <th className="py-3.5 px-4 font-semibold">Horizonte / Venc.</th>
                    <th className="py-3.5 px-4 font-semibold text-right text-[#00FF88]">YTM (Rendimiento)</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Cupón</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Precio USD</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Quant Score</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E2D4A]/50 font-mono">
                  {filteredUsBonds.slice(0, visibleBondCount).map((b) => (
                    <tr key={b.ticker} className="hover:bg-slate-50 dark:hover:bg-[#111B30]/60 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-200">
                            {b.ticker.split(" ")[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-[#00FF88] transition-colors">
                              {b.ticker}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">{(b as { isin?: string }).isin || "US TRACE"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{b.name}</div>
                        <div className="text-xs text-slate-400">{b.sector}</div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-blue-950 text-blue-200 border border-blue-500/30">
                          {b.rating}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="text-slate-100 font-medium text-xs sm:text-sm">{b.maturity_years} años</div>
                        <div className="text-xs text-slate-400 font-mono">{b.maturity}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[#00FF88] font-bold text-sm sm:text-base tracking-tight bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/30">
                          {b.tir_usd}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-300 text-xs sm:text-sm">
                        {b.coupon}%
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        ${b.price_usd?.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-2">
                          <div className="w-14 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#00FF88] h-full rounded-full" style={{ width: `${b.score}%` }} />
                          </div>
                          <span className="text-[#00FF88] font-bold text-xs sm:text-sm">{b.score}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedScoreItem(b)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-[#111B30] dark:hover:bg-[#00FF88] dark:hover:text-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold border border-slate-300 dark:border-[#1E2D4A] transition-all"
                        >
                          Analizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* B) Tabla para Acciones S&P 500 y CEDEARs */}
            {((activeMarket === "wall_street" && wallStreetSubTab === "stocks") ||
              (activeMarket === "argentina" && argSubTab === "cedears")) && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1E2D4A] bg-slate-100 dark:bg-[#070B12] text-xs font-mono uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Ticker / Activo</th>
                    <th className="py-3.5 px-4 font-semibold">Empresa & Industria</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Recomendación</th>
                    {activeMarket === "argentina" && <th className="py-3.5 px-4 font-semibold text-right">Precio CEDEAR (ARS)</th>}
                    <th className="py-3.5 px-4 font-semibold text-right">Precio USD</th>
                    <th className="py-3.5 px-4 font-semibold text-right text-[#00FF88]">Potencial (1A)</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Dividendo</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Quant Score</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E2D4A]/50 font-mono">
                  {(activeMarket === "wall_street" ? filteredStocks : filteredCedears)
                    .slice(0, visibleCount)
                    .map((stock, idx) => {
                      const ret = stock.retorno_estimado_pct ?? stock.retornoEstimadoPct ?? stock.upside ?? 0;
                      const sc = stock.score_total ?? stock.scoreTotal ?? stock.score ?? 0;
                      const recBadge = getRecommendationBadge(sc, ret);
                      const isPositive = stock.day_change >= 0;

                      return (
                        <tr key={stock.ticker} className="hover:bg-slate-50 dark:hover:bg-[#111B30]/60 transition-colors group">
                          {/* Ticker */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <span className="font-mono text-xs text-slate-400 font-bold w-6">
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-[#00FF88] transition-colors">
                                  {stock.ticker}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 font-sans font-medium">
                                  {stock.has_cedear ? `Ratio ${stock.cedear_ratio}` : "NYSE / NASDAQ"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Empresa & Sector */}
                          <td className="py-3.5 px-4 font-sans">
                            <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{stock.name}</div>
                            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">{stock.sector}</div>
                          </td>

                          {/* Recomendación */}
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold border uppercase tracking-wider ${recBadge.className}`}>
                              {recBadge.text}
                            </span>
                          </td>

                          {/* Precio en Pesos (si es vista CEDEAR) */}
                          {activeMarket === "argentina" && (
                            <td className="py-3.5 px-4 text-right">
                              {stock.cedear_price_ars ? (
                                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                  ${stock.cedear_price_ars.toLocaleString("es-AR")}
                                </span>
                              ) : (
                                <span className="text-slate-500 text-xs">Exterior</span>
                              )}
                            </td>
                          )}

                          {/* Precio USD */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                              ${stock.price?.toFixed(2)}
                            </div>
                            <div className={`text-xs font-bold ${isPositive ? "text-[#00FF88]" : "text-rose-400"}`}>
                              {isPositive ? `+${stock.day_change}%` : `${stock.day_change}%`}
                            </div>
                          </td>

                          {/* Potencial 1A */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedStockForModal(stock)}
                              className="text-[#00FF88] font-bold text-sm sm:text-base tracking-tight bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/30 hover:border-emerald-400 transition-all text-right block ml-auto"
                              title="Ver fórmula y consenso de bancos"
                            >
                              {ret >= 0 ? `+${ret}%` : `${ret}%`}
                            </button>
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mt-0.5">
                              Target: ${stock.precio_objetivo_algoritmo ?? stock.target_price} USD
                            </span>
                          </td>

                          {/* Dividendo */}
                          <td className="py-3.5 px-3 text-right text-xs sm:text-sm font-mono">
                            {stock.pays_dividend && stock.dividend_yield ? (
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {stock.dividend_yield}%
                              </span>
                            ) : (
                              <span className="font-bold text-slate-400 dark:text-slate-500">
                                —
                              </span>
                            )}
                          </td>

                          {/* Quant Score */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center space-x-2 cursor-pointer" onClick={() => setSelectedScoreItem(stock)}>
                              <div className="w-14 bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#00FF88] h-full rounded-full" style={{ width: `${sc}%` }} />
                              </div>
                              <span className="text-[#00FF88] font-bold text-xs sm:text-sm">{sc}</span>
                            </div>
                          </td>

                          {/* Acción */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedStockForModal(stock)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-[#111B30] dark:hover:bg-[#00FF88] dark:hover:text-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold border border-slate-300 dark:border-[#1E2D4A] transition-all"
                            >
                              Analizar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}

            {/* C) Tabla para ETFs de Wall Street */}
            {activeMarket === "wall_street" && wallStreetSubTab === "etfs" && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1E2D4A] bg-slate-100 dark:bg-[#070B12] text-xs font-mono uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Ticker / ETF</th>
                    <th className="py-3.5 px-4 font-semibold">Categoría & Manager</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Precio USD</th>
                    <th className="py-3.5 px-4 font-semibold text-right text-[#00FF88]">Upside (1A)</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Dividendo</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Costo Anual</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Quant Score</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E2D4A]/50 font-mono">
                  {filteredEtfs.slice(0, visibleCount).map((e) => (
                    <tr key={e.ticker} className="hover:bg-slate-50 dark:hover:bg-[#111B30]/60 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-[#00FF88] transition-colors">
                          {e.ticker}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">{e.name}</div>
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{e.category}</div>
                        <div className="text-xs text-slate-400">{e.manager || "Gestión Pasiva"}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        ${e.price?.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[#00FF88] font-bold text-sm sm:text-base bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/30">
                          +{e.upside}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-200 text-xs sm:text-sm">
                        {e.pays_dividend ? `${e.dividend_yield}%` : "—"}
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-300 text-xs sm:text-sm">
                        {e.expense_ratio}%
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-2">
                          <div className="w-14 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#00FF88] h-full rounded-full" style={{ width: `${e.score}%` }} />
                          </div>
                          <span className="text-[#00FF88] font-bold text-xs sm:text-sm">{e.score}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedScoreItem(e as unknown as ScoreItem)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-[#111B30] dark:hover:bg-[#00FF88] dark:hover:text-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold border border-slate-300 dark:border-[#1E2D4A] transition-all"
                        >
                          Analizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* D) Tabla para ONs en Dólares (Argentina) */}
            {activeMarket === "argentina" && argSubTab === "ons" && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1E2D4A] bg-slate-100 dark:bg-[#070B12] text-xs font-mono uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Ticker / Instrumento</th>
                    <th className="py-3.5 px-4 font-semibold">Emisor & Industria</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Rating</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Ley</th>
                    <th className="py-3.5 px-4 font-semibold text-right text-[#00FF88]">TIR Anual (USD)</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Cupón</th>
                    <th className="py-3.5 px-4 font-semibold">Vencimiento</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Quant Score</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E2D4A]/50 font-mono">
                  {filteredOns.slice(0, visibleCount).map((o) => (
                    <tr key={o.ticker} className="hover:bg-slate-50 dark:hover:bg-[#111B30]/60 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-[#00FF88] transition-colors">
                          {o.ticker}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">{o.name}</div>
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{o.issuer}</div>
                        <div className="text-xs text-slate-400">Renta Fija Corporativa</div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-blue-950 text-blue-200 border border-blue-500/30">
                          {o.rating}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans text-xs sm:text-sm text-slate-300">
                        {o.law}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[#00FF88] font-bold text-sm sm:text-base bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/30">
                          {o.tir_usd}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-200 text-xs sm:text-sm">
                        {o.coupon}%
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-mono text-xs sm:text-sm">
                        {o.maturity}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-2">
                          <div className="w-14 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#00FF88] h-full rounded-full" style={{ width: `${o.score}%` }} />
                          </div>
                          <span className="text-[#00FF88] font-bold text-xs sm:text-sm">{o.score}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedScoreItem(o)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-[#111B30] dark:hover:bg-[#00FF88] dark:hover:text-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold border border-slate-300 dark:border-[#1E2D4A] transition-all"
                        >
                          Analizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* E) Tabla para Acciones Merval */}
            {activeMarket === "argentina" && argSubTab === "merval" && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1E2D4A] bg-slate-100 dark:bg-[#070B12] text-xs font-mono uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Ticker / Empresa</th>
                    <th className="py-3.5 px-4 font-semibold">Sector</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Precio (ARS)</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Variación Día</th>
                    <th className="py-3.5 px-3 font-semibold text-center">P/E Ratio</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Quant Score</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E2D4A]/50 font-mono">
                  {filteredMerval.slice(0, visibleCount).map((m) => {
                    const isPositive = m.day_change >= 0;
                    return (
                      <tr key={m.ticker} className="hover:bg-slate-50 dark:hover:bg-[#111B30]/60 transition-colors group">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-[#00FF88] transition-colors">
                            {m.ticker}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-sans font-medium">{m.name}</div>
                        </td>

                        <td className="py-3.5 px-4 font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                          {m.sector}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                          ${m.price_ars?.toLocaleString("es-AR")} ARS
                        </td>

                        <td className={`py-3.5 px-4 text-right font-bold text-sm sm:text-base ${isPositive ? "text-[#00FF88]" : "text-rose-400"}`}>
                          {isPositive ? `+${m.day_change}%` : `${m.day_change}%`}
                        </td>

                        <td className="py-3.5 px-3 text-center text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                          {m.pe_ratio ? `${m.pe_ratio}x` : "-"}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center space-x-2">
                            <div className="w-14 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#00FF88] h-full rounded-full" style={{ width: `${m.score}%` }} />
                            </div>
                            <span className="text-[#00FF88] font-bold text-xs sm:text-sm">{m.score}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedScoreItem(m)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-[#111B30] dark:hover:bg-[#00FF88] dark:hover:text-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold border border-slate-300 dark:border-[#1E2D4A] transition-all"
                          >
                            Analizar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* F) Tabla para Bonos Soberanos */}
            {activeMarket === "argentina" && argSubTab === "bonds" && (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1E2D4A] bg-slate-100 dark:bg-[#070B12] text-xs font-mono uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Ticker / Bono</th>
                    <th className="py-3.5 px-4 font-semibold">Descripción</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Ley</th>
                    <th className="py-3.5 px-4 font-semibold text-right text-[#00FF88]">TIR (USD)</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Paridad</th>
                    <th className="py-3.5 px-4 font-semibold">Vencimiento</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Quant Score</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E2D4A]/50 font-mono">
                  {filteredSovereign.slice(0, visibleCount).map((b) => (
                    <tr key={b.ticker} className="hover:bg-slate-50 dark:hover:bg-[#111B30]/60 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-[#00FF88] transition-colors">
                          {b.ticker}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">{b.name}</div>
                      </td>

                      <td className="py-3.5 px-4 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {b.thesis}
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs sm:text-sm font-sans font-bold text-slate-900 dark:text-slate-100">
                        {b.law}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[#00FF88] font-bold text-sm sm:text-base bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/30">
                          {b.tir_usd}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-white text-xs sm:text-sm">
                        {b.parity}%
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-mono font-medium">
                        {b.maturity_date}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-2">
                          <div className="w-14 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#00FF88] h-full rounded-full" style={{ width: `${b.score}%` }} />
                          </div>
                          <span className="text-[#00FF88] font-bold text-xs sm:text-sm">{b.score}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedScoreItem(b)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-[#111B30] dark:hover:bg-[#00FF88] dark:hover:text-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold border border-slate-300 dark:border-[#1E2D4A] transition-all"
                        >
                          Analizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* --- VISTA: TARJETAS DETALLADAS --- */
          <div className="p-4 sm:p-6 space-y-4">
            {activeMarket === "wall_street" && wallStreetSubTab === "stocks" && (
              <div className="space-y-4">
                {filteredStocks.slice(0, visibleCount).map((s, idx) => renderStockCard(s, idx, false))}
              </div>
            )}
            {activeMarket === "wall_street" && wallStreetSubTab === "etfs" && (
              <div className="space-y-4">
                {filteredEtfs.slice(0, visibleCount).map((e, idx) => renderEtfCard(e, idx))}
              </div>
            )}
            {activeMarket === "wall_street" && wallStreetSubTab === "bonds" && (
              <div className="space-y-4">
                {filteredUsBonds.slice(0, visibleBondCount).map((b, idx) => renderUsBondCard(b, idx))}
              </div>
            )}
            {activeMarket === "argentina" && argSubTab === "cedears" && (
              <div className="space-y-4">
                {filteredCedears.slice(0, visibleCount).map((s, idx) => renderStockCard(s, idx, true))}
              </div>
            )}
            {activeMarket === "argentina" && argSubTab === "ons" && (
              <div className="space-y-4">
                {filteredOns.slice(0, visibleCount).map((o, idx) => renderOnCard(o, idx))}
              </div>
            )}
            {activeMarket === "argentina" && argSubTab === "merval" && (
              <div className="space-y-4">
                {filteredMerval.slice(0, visibleCount).map((m, idx) => renderMervalCard(m, idx))}
              </div>
            )}
            {activeMarket === "argentina" && argSubTab === "bonds" && (
              <div className="space-y-4">
                {filteredSovereign.slice(0, visibleCount).map((b, idx) => renderSovereignBondCard(b, idx))}
              </div>
            )}
          </div>
        )}

        {/* Footer Institucional de la Tabla: Paginación y Carga Progresiva */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-[#1E2D4A] bg-slate-50 dark:bg-[#0A101D] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-mono">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-medium">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#00FF88] border border-emerald-300 dark:border-emerald-500/30 font-bold">
              ⚡ ALTA DENSIDAD VISUAL
            </span>
            <span className="text-xs hidden md:inline">
              Diseño institucional condensado: visualiza más activos por pantalla con tipografía optimizada.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {activeMarket === "wall_street" && wallStreetSubTab === "bonds" ? (
              visibleBondCount < filteredUsBonds.length && (
                <button
                  type="button"
                  onClick={() => setVisibleBondCount((prev) => Math.min(prev + 40, filteredUsBonds.length))}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] dark:hover:bg-slate-800 text-emerald-700 dark:text-[#00FF88] font-bold border border-slate-300 dark:border-emerald-500/30 transition-all text-xs sm:text-sm"
                >
                  Cargar más bonos (+40)
                </button>
              )
            ) : (
              visibleCount <
                (activeMarket === "wall_street"
                  ? wallStreetSubTab === "stocks"
                    ? filteredStocks.length
                    : filteredEtfs.length
                  : argSubTab === "cedears"
                  ? filteredCedears.length
                  : argSubTab === "ons"
                  ? filteredOns.length
                  : argSubTab === "merval"
                  ? filteredMerval.length
                  : filteredSovereign.length) && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 30)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] dark:hover:bg-slate-800 text-emerald-700 dark:text-[#00FF88] font-bold border border-slate-300 dark:border-emerald-500/30 transition-all text-xs sm:text-sm"
                >
                  Mostrar más activos (+30)
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* MODALES INSTITUCIONALES */}
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
