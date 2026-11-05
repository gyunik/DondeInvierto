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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import ArgentinaFlag from "./ArgentinaFlag";
import UsaFlag from "./UsaFlag";
import marketData from "@/data/marketData.json";
import StockDetailModal, { ModalItem } from "./StockDetailModal";
import ExplainPotentialModal from "./ExplainPotentialModal";
import ScoreDetailModal, { ScoreItem } from "./ScoreDetailModal";

export type UsBondItem = (typeof marketData.us_bonds)[0];
export type StockItem = (typeof marketData.stocks)[0];
export type EtfItem = (typeof marketData.etfs)[0];

const RATING_WEIGHTS: Record<string, number> = {
  AAA: 100,
  "AA+": 90,
  AA: 80,
  "AA-": 70,
  "A+": 60,
  A: 50,
  "A-": 40,
  "BBB+": 30,
  BBB: 20,
  "BBB-": 10,
  "BB+": 5,
};

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
  const [selectedStockSectors, setSelectedStockSectors] = useState<string[]>([]);
  const [etfDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfManagerFilter] = useState<string>("all");
  const [usBondMaturityBlock, setUsBondMaturityBlock] = useState<"all" | "short" | "medium" | "long">("all");
  const [bondHorizonMin, setBondHorizonMin] = useState<string>("");
  const [bondHorizonMax, setBondHorizonMax] = useState<string>("");
  const [usBondBrandCategory, setUsBondBrandCategory] = useState<string>("all");
  const [selectedBondSectors, setSelectedBondSectors] = useState<string[]>([]);
  const [bondYtmMin, setBondYtmMin] = useState<string>("");
  const [bondYtmMax, setBondYtmMax] = useState<string>("");
  const [bondYtmPreset, setBondYtmPreset] = useState<string>("all");
  const [usBondSafetyFilter, setUsBondSafetyFilter] = useState<"all" | "Seguridad Máxima" | "Riesgo Ultra Bajo">("all");

  // Tipos y estados de ordenamiento interactivo por columna
  type UsBondSortKey = "ticker" | "name" | "sector" | "rating" | "maturity" | "tir" | "coupon" | "price" | "score";
  const [usBondSortKey, setUsBondSortKey] = useState<UsBondSortKey>("score");
  const [usBondSortDir, setUsBondSortDir] = useState<"asc" | "desc">("desc");

  type StockSortKey = "ticker" | "name" | "sector" | "rec" | "cedear_price" | "price" | "upside" | "dividend" | "score";
  const [stockSortKey, setStockSortKey] = useState<StockSortKey>("score");
  const [stockSortDir, setStockSortDir] = useState<"asc" | "desc">("desc");

  type EtfSortKey = "ticker" | "name" | "price" | "upside" | "dividend" | "expense" | "score";
  const [etfSortKey, setEtfSortKey] = useState<EtfSortKey>("score");
  const [etfSortDir, setEtfSortDir] = useState<"asc" | "desc">("desc");

  type OnSortKey = "ticker" | "issuer" | "rating" | "law" | "tir" | "coupon" | "maturity" | "score";
  const [onSortKey, setOnSortKey] = useState<OnSortKey>("tir");
  const [onSortDir, setOnSortDir] = useState<"asc" | "desc">("desc");

  type MervalSortKey = "ticker" | "sector" | "price" | "change" | "pe" | "score";
  const [mervalSortKey, setMervalSortKey] = useState<MervalSortKey>("score");
  const [mervalSortDir, setMervalSortDir] = useState<"asc" | "desc">("desc");

  type SovSortKey = "ticker" | "name" | "law" | "tir" | "parity" | "maturity" | "score";
  const [sovSortKey, setSovSortKey] = useState<SovSortKey>("tir");
  const [sovSortDir, setSovSortDir] = useState<"asc" | "desc">("desc");

  const handleUsBondSort = (key: UsBondSortKey) => {
    if (usBondSortKey === key) {
      setUsBondSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setUsBondSortKey(key);
      setUsBondSortDir(key === "ticker" || key === "name" || key === "maturity" || key === "sector" ? "asc" : "desc");
    }
  };

  const handleStockSort = (key: StockSortKey) => {
    if (stockSortKey === key) {
      setStockSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setStockSortKey(key);
      setStockSortDir(key === "ticker" || key === "name" || key === "sector" ? "asc" : "desc");
    }
  };

  const handleEtfSort = (key: EtfSortKey) => {
    if (etfSortKey === key) {
      setEtfSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setEtfSortKey(key);
      setEtfSortDir(key === "ticker" || key === "name" ? "asc" : "desc");
    }
  };

  const handleOnSort = (key: OnSortKey) => {
    if (onSortKey === key) {
      setOnSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOnSortKey(key);
      setOnSortDir(key === "ticker" || key === "issuer" || key === "maturity" ? "asc" : "desc");
    }
  };

  const handleMervalSort = (key: MervalSortKey) => {
    if (mervalSortKey === key) {
      setMervalSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setMervalSortKey(key);
      setMervalSortDir(key === "ticker" || key === "sector" ? "asc" : "desc");
    }
  };

  const handleSovSort = (key: SovSortKey) => {
    if (sovSortKey === key) {
      setSovSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSovSortKey(key);
      setSovSortDir(key === "ticker" || key === "name" || key === "maturity" ? "asc" : "desc");
    }
  };
  const [visibleBondCount, setVisibleBondCount] = useState<number>(30);
  const [selectedStockForModal, setSelectedStockForModal] = useState<ModalItem | null>(null);
  const [selectedExplainStock, setSelectedExplainStock] = useState<ModalItem | null>(null);
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
      if (selectedStockSectors.length > 0) {
        if (!selectedStockSectors.includes(s.sector)) return false;
      } else if (stockSectorFilter !== "all" && s.sector !== stockSectorFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comp = 0;
      switch (stockSortKey) {
        case "ticker":
          comp = a.ticker.localeCompare(b.ticker);
          break;
        case "name":
          comp = a.name.localeCompare(b.name);
          break;
        case "sector":
          comp = (a.sector || "").localeCompare(b.sector || "");
          break;
        case "rec":
          comp = (a.recommendation || "").localeCompare(b.recommendation || "");
          break;
        case "cedear_price":
          comp = (a.cedear_price_ars || 0) - (b.cedear_price_ars || 0);
          break;
        case "price":
          comp = (a.price || 0) - (b.price || 0);
          break;
        case "upside":
          const retA = a.retorno_estimado_pct ?? a.retornoEstimadoPct ?? a.upside ?? 0;
          const retB = b.retorno_estimado_pct ?? b.retornoEstimadoPct ?? b.upside ?? 0;
          comp = retA - retB;
          break;
        case "dividend":
          comp = (a.dividend_yield || 0) - (b.dividend_yield || 0);
          break;
        case "score":
        default:
          const scoreA = a.score_total ?? a.scoreTotal ?? a.score ?? 0;
          const scoreB = b.score_total ?? b.scoreTotal ?? b.score ?? 0;
          comp = scoreA - scoreB;
          break;
      }
      return stockSortDir === "asc" ? comp : -comp;
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
      if (selectedStockSectors.length > 0) {
        if (!selectedStockSectors.includes(s.sector)) return false;
      } else if (stockSectorFilter !== "all" && s.sector !== stockSectorFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comp = 0;
      switch (stockSortKey) {
        case "ticker":
          comp = a.ticker.localeCompare(b.ticker);
          break;
        case "name":
          comp = a.name.localeCompare(b.name);
          break;
        case "sector":
          comp = (a.sector || "").localeCompare(b.sector || "");
          break;
        case "rec":
          comp = (a.recommendation || "").localeCompare(b.recommendation || "");
          break;
        case "cedear_price":
          comp = (a.cedear_price_ars || 0) - (b.cedear_price_ars || 0);
          break;
        case "price":
          comp = (a.price || 0) - (b.price || 0);
          break;
        case "upside":
          const retA = a.retorno_estimado_pct ?? a.retornoEstimadoPct ?? a.upside ?? 0;
          const retB = b.retorno_estimado_pct ?? b.retornoEstimadoPct ?? b.upside ?? 0;
          comp = retA - retB;
          break;
        case "dividend":
          comp = (a.dividend_yield || 0) - (b.dividend_yield || 0);
          break;
        case "score":
        default:
          const scoreA = a.score_total ?? a.scoreTotal ?? a.score ?? 0;
          const scoreB = b.score_total ?? b.scoreTotal ?? b.score ?? 0;
          comp = scoreA - scoreB;
          break;
      }
      return stockSortDir === "asc" ? comp : -comp;
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
    .sort((a, b) => {
      let comp = 0;
      switch (etfSortKey) {
        case "ticker":
          comp = a.ticker.localeCompare(b.ticker);
          break;
        case "name":
          comp = a.name.localeCompare(b.name);
          break;
        case "price":
          comp = (a.price || 0) - (b.price || 0);
          break;
        case "upside":
          comp = (a.upside || 0) - (b.upside || 0);
          break;
        case "dividend":
          comp = (a.dividend_yield || 0) - (b.dividend_yield || 0);
          break;
        case "expense":
          comp = (a.expense_ratio || 0) - (b.expense_ratio || 0);
          break;
        case "score":
        default:
          comp = (a.score || 0) - (b.score || 0);
          break;
      }
      return etfSortDir === "asc" ? comp : -comp;
    });

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

      // Filtro por Bloque de Tranquilidad o Rango Personalizado de Años
      if (bondHorizonMin !== "" || bondHorizonMax !== "") {
        const minYears = bondHorizonMin !== "" ? parseFloat(bondHorizonMin) : 0;
        const maxYears = bondHorizonMax !== "" ? parseFloat(bondHorizonMax) : Infinity;
        const bondYears = typeof b.maturity_years === "number" ? b.maturity_years : 0;
        if (bondYears < minYears || bondYears > maxYears) {
          return false;
        }
      } else if (usBondMaturityBlock !== "all" && b.maturity_block !== usBondMaturityBlock) {
        return false;
      }

      // Filtro por Marcas / Sectores (Múltiples o Único)
      if (selectedBondSectors.length > 0) {
        if (!selectedBondSectors.includes(b.brand_category)) {
          return false;
        }
      } else if (usBondBrandCategory !== "all" && b.brand_category !== usBondBrandCategory) {
        return false;
      }

      // Filtro por Rendimiento Personalizado (YTM %)
      if (bondYtmMin !== "" || bondYtmMax !== "") {
        const minY = bondYtmMin !== "" ? parseFloat(bondYtmMin) : 0;
        const maxY = bondYtmMax !== "" ? parseFloat(bondYtmMax) : Infinity;
        const bondYtm = typeof b.tir_usd === "number" ? b.tir_usd : 0;
        if (bondYtm < minY || bondYtm > maxY) {
          return false;
        }
      } else if (bondYtmPreset !== "all") {
        const minPreset = parseFloat(bondYtmPreset);
        if ((b.tir_usd || 0) < minPreset) {
          return false;
        }
      }

      // Filtro por Nivel de Seguridad
      if (usBondSafetyFilter !== "all" && b.safety_badge !== usBondSafetyFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comp = 0;
      switch (usBondSortKey) {
        case "ticker":
          comp = a.ticker.localeCompare(b.ticker);
          break;
        case "name":
          comp = (a.name || "").localeCompare(b.name || "");
          break;
        case "sector":
          comp = (a.brand_category || a.sector || "").localeCompare(b.brand_category || b.sector || "");
          break;
        case "rating":
          comp = (RATING_WEIGHTS[a.rating] || 0) - (RATING_WEIGHTS[b.rating] || 0);
          break;
        case "maturity":
          comp = (a.maturity_years || 0) - (b.maturity_years || 0);
          break;
        case "tir":
          comp = (a.tir_usd || 0) - (b.tir_usd || 0);
          break;
        case "coupon":
          comp = (a.coupon || 0) - (b.coupon || 0);
          break;
        case "price":
          comp = (a.price_usd || 0) - (b.price_usd || 0);
          break;
        case "score":
        default:
          comp = (a.score || 0) - (b.score || 0);
          break;
      }
      return usBondSortDir === "asc" ? comp : -comp;
    });

  // 5. Filtrado de ONs en Dólares (Argentina)
  let filteredOns = ons
    .filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        o.ticker.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.issuer.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let comp = 0;
      switch (onSortKey) {
        case "ticker":
          comp = a.ticker.localeCompare(b.ticker);
          break;
        case "issuer":
          comp = (a.issuer || a.name || "").localeCompare(b.issuer || b.name || "");
          break;
        case "rating":
          comp = (RATING_WEIGHTS[a.rating] || 0) - (RATING_WEIGHTS[b.rating] || 0);
          break;
        case "law":
          comp = (a.law || "").localeCompare(b.law || "");
          break;
        case "tir":
          comp = (a.tir_usd || 0) - (b.tir_usd || 0);
          break;
        case "coupon":
          comp = (a.coupon || 0) - (b.coupon || 0);
          break;
        case "maturity":
          comp = (parseInt(a.maturity) || 0) - (parseInt(b.maturity) || 0);
          break;
        case "score":
        default:
          comp = (a.score || 0) - (b.score || 0);
          break;
      }
      return onSortDir === "asc" ? comp : -comp;
    });

  // 6. Filtrado de Merval (Acciones Locales)
  let filteredMerval = argentina.merval
    .filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        m.ticker.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let comp = 0;
      switch (mervalSortKey) {
        case "ticker":
          comp = a.ticker.localeCompare(b.ticker);
          break;
        case "sector":
          comp = (a.sector || "").localeCompare(b.sector || "");
          break;
        case "price":
          comp = (a.price_ars || 0) - (b.price_ars || 0);
          break;
        case "change":
          comp = (a.day_change || 0) - (b.day_change || 0);
          break;
        case "pe":
          comp = (a.pe_ratio || 0) - (b.pe_ratio || 0);
          break;
        case "score":
        default:
          comp = (a.score || 0) - (b.score || 0);
          break;
      }
      return mervalSortDir === "asc" ? comp : -comp;
    });

  // 7. Filtrado de Bonos Soberanos (Argentina)
  let filteredSovereign = argentina.sovereign_bonds
    .filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        b.ticker.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let comp = 0;
      switch (sovSortKey) {
        case "ticker":
          comp = a.ticker.localeCompare(b.ticker);
          break;
        case "name":
          comp = (a.name || "").localeCompare(b.name || "");
          break;
        case "law":
          comp = (a.law || "").localeCompare(b.law || "");
          break;
        case "tir":
          comp = (a.tir_usd || 0) - (b.tir_usd || 0);
          break;
        case "parity":
          comp = (a.parity || 0) - (b.parity || 0);
          break;
        case "maturity":
          comp = (parseInt(a.maturity_date?.slice(-4) || "0")) - (parseInt(b.maturity_date?.slice(-4) || "0"));
          break;
        case "score":
        default:
          comp = (a.score || 0) - (b.score || 0);
          break;
      }
      return sovSortDir === "asc" ? comp : -comp;
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
  const getRecommendationBadge = (sc: number, ret: number, stockRec?: string, isUnderReview?: boolean) => {
    if (isUnderReview || /revisi[oó]n/i.test(stockRec || "")) {
      return {
        text: "EN REVISIÓN",
        className: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold",
      };
    }
    if (stockRec === "Evitar" || sc < 45 || ret < -5) {
      return {
        text: "EVITAR",
        className: "bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold",
      };
    }
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
    return {
      text: "MANTENER",
      className: "bg-slate-500/20 text-slate-300 border-slate-500/30 font-medium",
    };
  };

  // Helper para renderizar tarjetas clásicas detalladas (con soporte total Light & Dark Mode)
  const renderStockCard = (stock: StockItem, idx: number, isCedearView: boolean = false) => {
    const isPositive = stock.day_change >= 0;
    const ret = stock.retorno_estimado_pct ?? stock.retornoEstimadoPct ?? stock.upside ?? 0;
    const sc = stock.score_total ?? stock.scoreTotal ?? stock.score ?? 0;
    const recBadge = getRecommendationBadge(sc, ret, stock.recommendation, stock.is_under_review);

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
              {/* Dropdown 1: Plazo / Horizonte Temporal con Rango Personalizado */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "plazo" ? null : "plazo")}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                    usBondMaturityBlock !== "all" || bondHorizonMin !== "" || bondHorizonMax !== ""
                      ? "bg-blue-950/80 text-blue-200 border-blue-500/50 shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${usBondMaturityBlock !== "all" || bondHorizonMin !== "" || bondHorizonMax !== "" ? "bg-blue-400" : "bg-slate-400"}`} />
                  <span className="font-bold text-white">Plazo:</span>
                  <span>
                    {bondHorizonMin !== "" || bondHorizonMax !== ""
                      ? `${bondHorizonMin || 0} - ${bondHorizonMax || "30+"} años`
                      : usBondMaturityBlock === "all"
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
                  <div className="absolute left-0 mt-2 w-80 rounded-xl bg-[#0B1220] border border-blue-500/40 shadow-2xl p-3 z-50 animate-in fade-in duration-100 text-slate-200">
                    <div className="px-1 pb-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-[#1E2D4A] flex items-center justify-between">
                      <span>Horizonte de Vencimiento</span>
                      {(bondHorizonMin !== "" || bondHorizonMax !== "" || usBondMaturityBlock !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setUsBondMaturityBlock("all");
                            setBondHorizonMin("");
                            setBondHorizonMax("");
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition-colors"
                        >
                          Restablecer
                        </button>
                      )}
                    </div>
                    
                    {/* Presets tradicionales */}
                    <div className="space-y-1 mt-2 mb-3 font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setUsBondMaturityBlock("all");
                          setBondHorizonMin("");
                          setBondHorizonMax("");
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          usBondMaturityBlock === "all" && bondHorizonMin === "" && bondHorizonMax === ""
                            ? "bg-blue-950/70 text-blue-200 font-bold border border-blue-500/30"
                            : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        <span>Todos los plazos</span>
                        <span className="font-mono text-xs text-slate-400">{us_bonds.length}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUsBondMaturityBlock("short");
                          setBondHorizonMin("");
                          setBondHorizonMax("");
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          usBondMaturityBlock === "short" ? "bg-emerald-950/70 text-emerald-300 font-bold border border-emerald-500/30" : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white">Corto Plazo (1-3 años)</div>
                          <p className="text-[10px] text-slate-400">Riesgo precio mínimo • Máxima liquidez</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUsBondMaturityBlock("medium");
                          setBondHorizonMin("");
                          setBondHorizonMax("");
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          usBondMaturityBlock === "medium" ? "bg-blue-950/70 text-blue-200 font-bold border border-blue-500/30" : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>Mediano Plazo (3-7 años)</span>
                            <span className="text-[9px] bg-blue-500/30 text-blue-300 px-1 rounded font-mono">RECOMENDADO</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Riesgo moderado • Alta certidumbre</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUsBondMaturityBlock("long");
                          setBondHorizonMin("");
                          setBondHorizonMax("");
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          usBondMaturityBlock === "long" ? "bg-purple-950/70 text-purple-300 font-bold border border-purple-500/30" : "hover:bg-[#111B30] text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white">Largo Plazo (7-10+ años)</div>
                          <p className="text-[10px] text-slate-400">Mayor cupón • Mantener a vencimiento</p>
                        </div>
                      </button>
                    </div>

                    {/* Rango Personalizado en Años */}
                    <div className="pt-2 border-t border-slate-800 font-sans">
                      <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        Rango Personalizado en Años
                      </div>
                      
                      {/* Atajos Rápidos */}
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        {[
                          { label: "1-3a", min: "1", max: "3" },
                          { label: "3-5a", min: "3", max: "5" },
                          { label: "5-8a", min: "5", max: "8" },
                          { label: "8+a", min: "8", max: "30" },
                        ].map((preset) => {
                          const isActive = bondHorizonMin === preset.min && bondHorizonMax === preset.max;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setBondHorizonMin(preset.min);
                                setBondHorizonMax(preset.max);
                                setUsBondMaturityBlock("all");
                              }}
                              className={`py-1 px-1 rounded text-[11px] font-semibold text-center transition-all ${
                                isActive
                                  ? "bg-emerald-500/20 text-[#00FF88] border border-emerald-500/50"
                                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Mín. años</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.5"
                            placeholder="Ej: 3"
                            value={bondHorizonMin}
                            onChange={(e) => {
                              setBondHorizonMin(e.target.value);
                              setUsBondMaturityBlock("all");
                            }}
                            className="w-full bg-[#111B30] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="text-slate-500 mt-3">—</div>
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Máx. años</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.5"
                            placeholder="Ej: 5"
                            value={bondHorizonMax}
                            onChange={(e) => {
                              setBondHorizonMax(e.target.value);
                              setUsBondMaturityBlock("all");
                            }}
                            className="w-full bg-[#111B30] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(null)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded-lg transition-colors"
                        >
                          Aplicar ({filteredUsBonds.length})
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown 2: Sectores de Bonos (Selección Múltiple) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "brand" ? null : "brand")}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                    selectedBondSectors.length > 0 || usBondBrandCategory !== "all"
                      ? "bg-blue-950/80 text-blue-200 border-blue-500/50"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-slate-400">Sector:</span>
                  <span className="text-white font-medium truncate max-w-[130px]">
                    {selectedBondSectors.length === 0
                      ? usBondBrandCategory === "all"
                        ? "Todos"
                        : usBondBrandCategory
                      : selectedBondSectors.length === 1
                      ? selectedBondSectors[0]
                      : `Sectores (${selectedBondSectors.length})`}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === "brand" && (
                  <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#0B1220] border border-[#1E2D4A] shadow-2xl p-3 z-50 text-slate-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300">
                        Sectores de Bonos ({selectedBondSectors.length || "Todos"})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBondSectors([]);
                            setUsBondBrandCategory("all");
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          Todos
                        </button>
                        {selectedBondSectors.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBondSectors([]);
                              setUsBondBrandCategory("all");
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition-colors"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1 font-sans">
                      {bondBrandCategories.map((c) => {
                        const isSelected = selectedBondSectors.includes(c);
                        const count = us_bonds.filter((b) => b.brand_category === c).length;
                        const icon = us_bonds.find((b) => b.brand_category === c)?.brand_icon || "🏷️";
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setSelectedBondSectors((prev) =>
                                prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
                              );
                              setUsBondBrandCategory("all");
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                              isSelected
                                ? "bg-blue-950 text-blue-200 font-semibold border border-blue-500/40"
                                : "hover:bg-[#111B30] text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                                isSelected ? "bg-blue-600 border-blue-400 text-white" : "border-slate-600 bg-slate-800"
                              }`}>
                                {isSelected && "✓"}
                              </span>
                              <span>{icon}</span>
                              <span className="truncate">{c}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 ml-1.5">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(null)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded-lg transition-colors"
                      >
                        Aplicar ({filteredUsBonds.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown 3: Rendimiento Anual (YTM en USD) con Rango Personalizado */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "ytm" ? null : "ytm")}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                    bondYtmMin !== "" || bondYtmMax !== "" || bondYtmPreset !== "all"
                      ? "bg-emerald-950/80 text-[#00FF88] border-emerald-500/50"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">YTM:</span>
                  <span className="text-white font-medium">
                    {bondYtmMin !== "" || bondYtmMax !== ""
                      ? `${bondYtmMin || "0"}% - ${bondYtmMax || "Max"}%`
                      : bondYtmPreset !== "all"
                      ? `> ${bondYtmPreset}%`
                      : "Todos"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === "ytm" && (
                  <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#0B1220] border border-[#1E2D4A] shadow-2xl p-3 z-50 text-slate-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300">Rendimiento (YTM en USD)</span>
                      {(bondYtmMin !== "" || bondYtmMax !== "" || bondYtmPreset !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setBondYtmPreset("all");
                            setBondYtmMin("");
                            setBondYtmMax("");
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition-colors"
                        >
                          Restablecer
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 mb-2 font-sans">
                      {[
                        { label: "Todos los rendimientos", val: "all" },
                        { label: "Mayor a 5.0% YTM", val: "5.0" },
                        { label: "Mayor a 5.2% YTM", val: "5.2" },
                        { label: "Mayor a 5.4% YTM", val: "5.4" },
                      ].map((p) => {
                        const isActive = bondYtmPreset === p.val && bondYtmMin === "" && bondYtmMax === "";
                        return (
                          <button
                            key={p.val}
                            type="button"
                            onClick={() => {
                              setBondYtmPreset(p.val);
                              setBondYtmMin("");
                              setBondYtmMax("");
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                              isActive
                                ? "bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40"
                                : "hover:bg-[#111B30] text-slate-300"
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-800 font-sans">
                      <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        Rango Personalizado (% YTM)
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Mín. %</label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            placeholder="Ej: 5.0"
                            value={bondYtmMin}
                            onChange={(e) => {
                              setBondYtmMin(e.target.value);
                              setBondYtmPreset("all");
                            }}
                            className="w-full bg-[#111B30] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="text-slate-500 mt-3">—</div>
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Máx. %</label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            placeholder="Ej: 5.5"
                            value={bondYtmMax}
                            onChange={(e) => {
                              setBondYtmMax(e.target.value);
                              setBondYtmPreset("all");
                            }}
                            className="w-full bg-[#111B30] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setOpenDropdown(null)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded-lg transition-colors"
                        >
                          Aplicar ({filteredUsBonds.length})
                        </button>
                      </div>
                    </div>
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

              {/* Filtro Sector (Selección Múltiple) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "stockSector" ? null : "stockSector")}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                    selectedStockSectors.length > 0 || stockSectorFilter !== "all"
                      ? "bg-blue-950/80 text-blue-200 border-blue-500/50"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E2D4A] hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-slate-400">Sector:</span>
                  <span className="text-white font-medium truncate max-w-[140px]">
                    {selectedStockSectors.length === 0
                      ? stockSectorFilter === "all"
                        ? "Todos"
                        : stockSectorFilter
                      : selectedStockSectors.length === 1
                      ? selectedStockSectors[0]
                      : `Sectores (${selectedStockSectors.length})`}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === "stockSector" && (
                  <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#0B1220] border border-[#1E2D4A] shadow-2xl p-3 z-50 text-slate-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300">
                        Sectores ({selectedStockSectors.length || "Todos"})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStockSectors([]);
                            setStockSectorFilter("all");
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          Todos
                        </button>
                        {selectedStockSectors.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStockSectors([]);
                              setStockSectorFilter("all");
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 transition-colors"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1 font-sans">
                      {stockSectors.map((sec) => {
                        const isSelected = selectedStockSectors.includes(sec);
                        const count = (activeMarket === "wall_street" ? stocks : stocks.filter((s) => s.has_cedear)).filter(
                          (s) => s.sector === sec
                        ).length;
                        return (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => {
                              setSelectedStockSectors((prev) =>
                                prev.includes(sec) ? prev.filter((item) => item !== sec) : [...prev, sec]
                              );
                              setStockSectorFilter("all");
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                              isSelected
                                ? "bg-blue-950 text-blue-200 font-semibold border border-blue-500/40"
                                : "hover:bg-[#111B30] text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                                isSelected ? "bg-blue-600 border-blue-400 text-white" : "border-slate-600 bg-slate-800"
                              }`}>
                                {isSelected && "✓"}
                              </span>
                              <span className="truncate">{sec}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 ml-1.5">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(null)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded-lg transition-colors"
                      >
                        Aplicar ({activeMarket === "wall_street" ? filteredStocks.length : filteredCedears.length})
                      </button>
                    </div>
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
                value={usBondSortKey}
                onChange={(e) => {
                  const val = e.target.value as UsBondSortKey;
                  setUsBondSortKey(val);
                  setUsBondSortDir(val === "ticker" || val === "name" || val === "maturity" ? "asc" : "desc");
                }}
                className="bg-slate-100 dark:bg-[#111B30] border border-slate-300 dark:border-[#1E2D4A] rounded-lg text-xs sm:text-sm py-1.5 pl-2.5 pr-8 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
              >
                <option value="score">Quant Score (Mayor solidez)</option>
                <option value="tir">Rendimiento (YTM más alto)</option>
                <option value="rating">Rating Crediticio (Calidad AAA/AA)</option>
                <option value="maturity">Horizonte / Vencimiento</option>
                <option value="sector">Sector / Categoría</option>
                <option value="coupon">Tasa de Cupón</option>
                <option value="price">Precio USD</option>
                <option value="ticker">Ticker (A - Z)</option>
                <option value="name">Emisor (A - Z)</option>
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

      {/* Barra de Filtros Activos (Chips Desactivables) */}
      {(selectedBondSectors.length > 0 ||
        bondHorizonMin !== "" ||
        bondHorizonMax !== "" ||
        bondYtmMin !== "" ||
        bondYtmMax !== "" ||
        bondYtmPreset !== "all" ||
        selectedStockSectors.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 px-1 py-1 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
            Filtros Activos:
          </span>

          {/* Chips de Sectores de Bonos */}
          {selectedBondSectors.map((sec) => (
            <span
              key={sec}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs font-medium"
            >
              <span>{sec}</span>
              <button
                type="button"
                onClick={() => setSelectedBondSectors((prev) => prev.filter((s) => s !== sec))}
                className="hover:text-white text-blue-400 ml-0.5"
                title="Quitar este sector"
              >
                ✕
              </button>
            </span>
          ))}

          {/* Chip de Rango de Plazo en Bonos */}
          {(bondHorizonMin !== "" || bondHorizonMax !== "") && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs font-medium">
              <span>Plazo: {bondHorizonMin || 0} a {bondHorizonMax || "30+"} años</span>
              <button
                type="button"
                onClick={() => {
                  setBondHorizonMin("");
                  setBondHorizonMax("");
                }}
                className="hover:text-white text-blue-400 ml-0.5"
                title="Quitar filtro de plazo"
              >
                ✕
              </button>
            </span>
          )}

          {/* Chip de Rendimiento YTM en Bonos */}
          {(bondYtmMin !== "" || bondYtmMax !== "" || bondYtmPreset !== "all") && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-[#00FF88] text-xs font-medium">
              <span>
                YTM:{" "}
                {bondYtmMin !== "" || bondYtmMax !== ""
                  ? `${bondYtmMin || 0}% a ${bondYtmMax || "Max"}%`
                  : `> ${bondYtmPreset}%`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setBondYtmMin("");
                  setBondYtmMax("");
                  setBondYtmPreset("all");
                }}
                className="hover:text-white text-emerald-400 ml-0.5"
                title="Quitar filtro de rendimiento"
              >
                ✕
              </button>
            </span>
          )}

          {/* Chips de Sectores de Acciones */}
          {selectedStockSectors.map((sec) => (
            <span
              key={sec}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs font-medium"
            >
              <span>{sec}</span>
              <button
                type="button"
                onClick={() => setSelectedStockSectors((prev) => prev.filter((s) => s !== sec))}
                className="hover:text-white text-blue-400 ml-0.5"
                title="Quitar este sector"
              >
                ✕
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={() => {
              setSelectedBondSectors([]);
              setBondHorizonMin("");
              setBondHorizonMax("");
              setBondYtmMin("");
              setBondYtmMax("");
              setBondYtmPreset("all");
              setSelectedStockSectors([]);
              setUsBondMaturityBlock("all");
              setStockSectorFilter("all");
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold underline ml-1 cursor-pointer transition-colors"
          >
            Limpiar todos
          </button>
        </div>
      )}

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
            <span className="text-slate-600 dark:text-slate-400 hidden sm:inline font-medium">
              • {activeMarket === "wall_street" && wallStreetSubTab === "bonds"
                ? `Ordenado por ${
                    usBondSortKey === "score"
                      ? "Quant Score"
                      : usBondSortKey === "tir"
                      ? "Rendimiento (YTM)"
                      : usBondSortKey === "rating"
                      ? "Rating"
                      : usBondSortKey === "sector"
                      ? "Sector"
                      : usBondSortKey === "maturity"
                      ? "Vencimiento"
                      : usBondSortKey === "coupon"
                      ? "Cupón"
                      : usBondSortKey === "price"
                      ? "Precio"
                      : usBondSortKey === "ticker"
                      ? "Ticker"
                      : "Emisor"
                  } (${usBondSortDir === "asc" ? "Menor a Mayor ▲" : "Mayor a Menor ▼"})`
                : (activeMarket === "wall_street" && wallStreetSubTab === "stocks") ||
                  (activeMarket === "argentina" && argSubTab === "cedears")
                ? `Ordenado por ${
                    stockSortKey === "score"
                      ? "Quant Score"
                      : stockSortKey === "upside"
                      ? "Potencial (1A)"
                      : stockSortKey === "price"
                      ? "Precio USD"
                      : stockSortKey === "sector"
                      ? "Sector"
                      : stockSortKey === "dividend"
                      ? "Dividendo"
                      : stockSortKey === "rec"
                      ? "Recomendación"
                      : stockSortKey === "cedear_price"
                      ? "Precio CEDEAR"
                      : stockSortKey === "ticker"
                      ? "Ticker"
                      : "Empresa"
                  } (${stockSortDir === "asc" ? "Menor a Mayor ▲" : "Mayor a Menor ▼"})`
                : "Ordenado por modelo cuantitativo institucional"}
            </span>
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
                    {/* 1. Ticker / Activo */}
                    <th
                      onClick={() => handleUsBondSort("ticker")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        usBondSortKey === "ticker" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Ticker"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Ticker / Activo</span>
                        {usBondSortKey === "ticker" ? (
                          usBondSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* 2. Emisor */}
                    <th
                      onClick={() => handleUsBondSort("name")}
                      className={`py-3.5 pl-3 pr-2 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        usBondSortKey === "name" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Emisor"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Emisor</span>
                        {usBondSortKey === "name" ? (
                          usBondSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* 3. Sector / Categoría */}
                    <th
                      onClick={() => handleUsBondSort("sector")}
                      className={`py-3.5 px-3 font-semibold cursor-pointer select-none group transition-colors whitespace-nowrap hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        usBondSortKey === "sector" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Sector de Negocio"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Sector</span>
                        {usBondSortKey === "sector" ? (
                          usBondSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* 4. Rating */}
                    <th
                      onClick={() => handleUsBondSort("rating")}
                      className={`py-3.5 px-3 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        usBondSortKey === "rating" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Calificación Crediticia (Rating)"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Rating</span>
                        {usBondSortKey === "rating" ? (
                          usBondSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* 4. Horizonte / Venc. */}
                    <th
                      onClick={() => handleUsBondSort("maturity")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        usBondSortKey === "maturity" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Plazo / Vencimiento"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Horizonte / Venc.</span>
                        {usBondSortKey === "maturity" ? (
                          usBondSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* 5. YTM (Rendimiento) */}
                    <th
                      onClick={() => handleUsBondSort("tir")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        usBondSortKey === "tir" ? "text-emerald-700 dark:text-[#00FF88]" : "text-emerald-600 dark:text-[#00FF88]"
                      }`}
                      title="Ordenar por Rendimiento Anual (YTM)"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>YTM (Rendimiento)</span>
                        {usBondSortKey === "tir" ? (
                          usBondSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* 6. Cupón */}
                    <th
                      onClick={() => handleUsBondSort("coupon")}
                      className={`py-3.5 px-3 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        usBondSortKey === "coupon" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Tasa de Cupón"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Cupón</span>
                        {usBondSortKey === "coupon" ? (
                          usBondSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* 7. Precio USD */}
                    <th
                      onClick={() => handleUsBondSort("price")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        usBondSortKey === "price" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Precio USD"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Precio USD</span>
                        {usBondSortKey === "price" ? (
                          usBondSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* 8. Quant Score */}
                    <th
                      onClick={() => handleUsBondSort("score")}
                      className={`py-3.5 px-4 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        usBondSortKey === "score" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Quant Score Institucional"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Quant Score</span>
                        {usBondSortKey === "score" ? (
                          usBondSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

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

                      <td className="py-3.5 pl-3 pr-2 font-sans">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{b.name}</div>
                        <div className="text-xs text-slate-400">{b.sector}</div>
                      </td>

                      <td className="py-3.5 px-3 font-sans whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A] whitespace-nowrap" title={b.brand_category}>
                          <span className="text-xs">{b.brand_icon}</span>
                          <span>{b.brand_category}</span>
                        </span>
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
                    <th
                      onClick={() => handleStockSort("ticker")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        stockSortKey === "ticker" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Ticker"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Ticker / Activo</span>
                        {stockSortKey === "ticker" ? (
                          stockSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleStockSort("name")}
                      className={`py-3.5 pl-3 pr-2 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        stockSortKey === "name" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Empresa"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Empresa</span>
                        {stockSortKey === "name" ? (
                          stockSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {/* Sector */}
                    <th
                      onClick={() => handleStockSort("sector")}
                      className={`py-3.5 px-3 font-semibold cursor-pointer select-none group transition-colors whitespace-nowrap hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        stockSortKey === "sector" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Sector de la Empresa"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Sector</span>
                        {stockSortKey === "sector" ? (
                          stockSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleStockSort("rec")}
                      className={`py-3.5 px-3 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        stockSortKey === "rec" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Recomendación"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Recomendación</span>
                        {stockSortKey === "rec" ? (
                          stockSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {activeMarket === "argentina" && (
                      <th
                        onClick={() => handleStockSort("cedear_price")}
                        className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                          stockSortKey === "cedear_price" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                        }`}
                        title="Ordenar por Precio CEDEAR (ARS)"
                      >
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <span>Precio CEDEAR (ARS)</span>
                          {stockSortKey === "cedear_price" ? (
                            stockSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                    )}

                    <th
                      onClick={() => handleStockSort("price")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        stockSortKey === "price" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Precio USD"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Precio USD</span>
                        {stockSortKey === "price" ? (
                          stockSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleStockSort("upside")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        stockSortKey === "upside" ? "text-emerald-700 dark:text-[#00FF88]" : "text-emerald-600 dark:text-[#00FF88]"
                      }`}
                      title="Ordenar por Potencial a 1 Año"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Potencial (1A)</span>
                        {stockSortKey === "upside" ? (
                          stockSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleStockSort("dividend")}
                      className={`py-3.5 px-3 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        stockSortKey === "dividend" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Dividendo Anual"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Dividendo</span>
                        {stockSortKey === "dividend" ? (
                          stockSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleStockSort("score")}
                      className={`py-3.5 px-4 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        stockSortKey === "score" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Quant Score"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Quant Score</span>
                        {stockSortKey === "score" ? (
                          stockSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5 px-4 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E2D4A]/50 font-mono">
                  {(activeMarket === "wall_street" ? filteredStocks : filteredCedears)
                    .slice(0, visibleCount)
                    .map((stock, idx) => {
                      const ret = stock.retorno_estimado_pct ?? stock.retornoEstimadoPct ?? stock.upside ?? 0;
                      const sc = stock.score_total ?? stock.scoreTotal ?? stock.score ?? 0;
                      const recBadge = getRecommendationBadge(sc, ret, stock.recommendation, stock.is_under_review);
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

                          {/* Empresa */}
                          <td className="py-3.5 pl-3 pr-2 font-sans whitespace-nowrap">
                            <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{stock.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stock.has_cedear ? "CEDEAR BYMA" : "S&P 500"}</div>
                          </td>

                          {/* Sector */}
                          <td className="py-3.5 px-3 font-sans whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-[#111B30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2D4A] whitespace-nowrap" title={stock.sector}>
                              {stock.sector}
                            </span>
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
                              onClick={() => setSelectedExplainStock(stock)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-[#111B30] dark:hover:bg-[#00FF88] dark:hover:text-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold border border-slate-300 dark:border-[#1E2D4A] transition-all shadow-sm hover:shadow-md"
                              title="Ver explicación didáctica de cómo se calculó el potencial"
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
                    <th
                      onClick={() => handleEtfSort("ticker")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        etfSortKey === "ticker" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Ticker"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Ticker / ETF</span>
                        {etfSortKey === "ticker" ? (
                          etfSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleEtfSort("name")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        etfSortKey === "name" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Categoría & Manager"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Categoría & Manager</span>
                        {etfSortKey === "name" ? (
                          etfSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleEtfSort("price")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        etfSortKey === "price" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Precio USD"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Precio USD</span>
                        {etfSortKey === "price" ? (
                          etfSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleEtfSort("upside")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        etfSortKey === "upside" ? "text-emerald-700 dark:text-[#00FF88]" : "text-emerald-600 dark:text-[#00FF88]"
                      }`}
                      title="Ordenar por Upside (1A)"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Upside (1A)</span>
                        {etfSortKey === "upside" ? (
                          etfSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleEtfSort("dividend")}
                      className={`py-3.5 px-3 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        etfSortKey === "dividend" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Dividendo"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Dividendo</span>
                        {etfSortKey === "dividend" ? (
                          etfSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleEtfSort("expense")}
                      className={`py-3.5 px-3 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        etfSortKey === "expense" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Costo Anual (Expense Ratio)"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Costo Anual</span>
                        {etfSortKey === "expense" ? (
                          etfSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleEtfSort("score")}
                      className={`py-3.5 px-4 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        etfSortKey === "score" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Quant Score"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Quant Score</span>
                        {etfSortKey === "score" ? (
                          etfSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

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
                        <button
                          type="button"
                          onClick={() => setSelectedStockForModal(e)}
                          className="text-[#00FF88] font-bold text-sm sm:text-base tracking-tight bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/30 hover:border-emerald-400 transition-all text-right block ml-auto"
                          title="Ver consenso de Wall Street y estrategas"
                        >
                          +{e.upside}%
                        </button>
                        {e.target_price && (
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mt-0.5">
                            Target: ${e.target_price} USD
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-200 text-xs sm:text-sm">
                        {e.pays_dividend ? `${e.dividend_yield}%` : "—"}
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-300 text-xs sm:text-sm">
                        {e.expense_ratio}%
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div
                          className="inline-flex items-center space-x-2 cursor-pointer"
                          onClick={() => setSelectedScoreItem(e as unknown as ScoreItem)}
                          title="Ver desglose de Score del ETF"
                        >
                          <div className="w-14 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#00FF88] h-full rounded-full" style={{ width: `${e.score}%` }} />
                          </div>
                          <span className="text-[#00FF88] font-bold text-xs sm:text-sm">{e.score}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedExplainStock(e)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-[#111B30] dark:hover:bg-[#00FF88] dark:hover:text-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans font-semibold border border-slate-300 dark:border-[#1E2D4A] transition-all shadow-sm hover:shadow-md"
                          title="Ver explicación didáctica de cómo se calculó el potencial"
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
                    <th
                      onClick={() => handleOnSort("ticker")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        onSortKey === "ticker" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Ticker"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Ticker / Instrumento</span>
                        {onSortKey === "ticker" ? (
                          onSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleOnSort("issuer")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        onSortKey === "issuer" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Emisor & Industria"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Emisor & Industria</span>
                        {onSortKey === "issuer" ? (
                          onSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleOnSort("rating")}
                      className={`py-3.5 px-3 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        onSortKey === "rating" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Rating"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Rating</span>
                        {onSortKey === "rating" ? (
                          onSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleOnSort("law")}
                      className={`py-3.5 px-4 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        onSortKey === "law" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Jurisdicción / Ley"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Ley</span>
                        {onSortKey === "law" ? (
                          onSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleOnSort("tir")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        onSortKey === "tir" ? "text-emerald-700 dark:text-[#00FF88]" : "text-emerald-600 dark:text-[#00FF88]"
                      }`}
                      title="Ordenar por TIR Anual en Dólares"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>TIR Anual (USD)</span>
                        {onSortKey === "tir" ? (
                          onSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleOnSort("coupon")}
                      className={`py-3.5 px-3 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        onSortKey === "coupon" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Tasa de Cupón"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Cupón</span>
                        {onSortKey === "coupon" ? (
                          onSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleOnSort("maturity")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        onSortKey === "maturity" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Año de Vencimiento"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Vencimiento</span>
                        {onSortKey === "maturity" ? (
                          onSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleOnSort("score")}
                      className={`py-3.5 px-4 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        onSortKey === "score" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Quant Score"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Quant Score</span>
                        {onSortKey === "score" ? (
                          onSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

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
                    <th
                      onClick={() => handleMervalSort("ticker")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        mervalSortKey === "ticker" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Ticker"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Ticker / Empresa</span>
                        {mervalSortKey === "ticker" ? (
                          mervalSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleMervalSort("sector")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        mervalSortKey === "sector" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Sector"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Sector</span>
                        {mervalSortKey === "sector" ? (
                          mervalSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleMervalSort("price")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        mervalSortKey === "price" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Precio en Pesos (ARS)"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Precio (ARS)</span>
                        {mervalSortKey === "price" ? (
                          mervalSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleMervalSort("change")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        mervalSortKey === "change" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Variación Diaria"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Variación Día</span>
                        {mervalSortKey === "change" ? (
                          mervalSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleMervalSort("pe")}
                      className={`py-3.5 px-3 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        mervalSortKey === "pe" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Ratio P/E"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>P/E Ratio</span>
                        {mervalSortKey === "pe" ? (
                          mervalSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleMervalSort("score")}
                      className={`py-3.5 px-4 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        mervalSortKey === "score" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Quant Score"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Quant Score</span>
                        {mervalSortKey === "score" ? (
                          mervalSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

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
                    <th
                      onClick={() => handleSovSort("ticker")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        sovSortKey === "ticker" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Ticker"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Ticker / Bono</span>
                        {sovSortKey === "ticker" ? (
                          sovSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSovSort("name")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        sovSortKey === "name" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Descripción"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Descripción</span>
                        {sovSortKey === "name" ? (
                          sovSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSovSort("law")}
                      className={`py-3.5 px-4 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        sovSortKey === "law" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Ley / Jurisdicción"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Ley</span>
                        {sovSortKey === "law" ? (
                          sovSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSovSort("tir")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        sovSortKey === "tir" ? "text-emerald-700 dark:text-[#00FF88]" : "text-emerald-600 dark:text-[#00FF88]"
                      }`}
                      title="Ordenar por TIR Anual (USD)"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>TIR (USD)</span>
                        {sovSortKey === "tir" ? (
                          sovSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSovSort("parity")}
                      className={`py-3.5 px-4 font-semibold text-right cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        sovSortKey === "parity" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Paridad"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span>Paridad</span>
                        {sovSortKey === "parity" ? (
                          sovSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSovSort("maturity")}
                      className={`py-3.5 px-4 font-semibold cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        sovSortKey === "maturity" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Vencimiento"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Vencimiento</span>
                        {sovSortKey === "maturity" ? (
                          sovSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSovSort("score")}
                      className={`py-3.5 px-4 font-semibold text-center cursor-pointer select-none group transition-colors hover:text-emerald-600 dark:hover:text-[#00FF88] ${
                        sovSortKey === "score" ? "text-emerald-700 dark:text-[#00FF88]" : ""
                      }`}
                      title="Ordenar por Quant Score"
                    >
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span>Quant Score</span>
                        {sovSortKey === "score" ? (
                          sovSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

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

      <ExplainPotentialModal
        stock={selectedExplainStock}
        onClose={() => setSelectedExplainStock(null)}
        onOpenTechnicalDetail={(stk) => setSelectedStockForModal(stk)}
      />

      <ScoreDetailModal
        item={selectedScoreItem}
        onClose={() => setSelectedScoreItem(null)}
      />
    </section>
  );
}
