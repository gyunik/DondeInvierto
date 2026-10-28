"use client";

import React, { useState } from "react";
import marketData from "@/data/marketData.json";
import {
  Activity,
  Globe,
  Building2,
  Search,
  Check,
  SlidersHorizontal,
  CircleDollarSign,
  Zap,
  TrendingUp,
  Shield,
  User,
  Calculator
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"cedears" | "ons" | "argentina">("cedears");
  const [cedearSubTab, setCedearSubTab] = useState<"stocks" | "etfs">("stocks");
  const [argSubTab, setArgSubTab] = useState<"merval" | "bonds">("merval");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockDivFilter, setStockDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfDivFilter, setEtfDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfManagerFilter, setEtfManagerFilter] = useState<string>("all");
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000000);
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [riskProfile, setRiskProfile] = useState<"conservador" | "balanceado" | "agresivo">("balanceado");

  const { market, stocks, etfs, ons, argentina, last_updated, ccl_dollar } = marketData;

  // Filtrado y Ordenamiento de Acciones
  const filteredStocks = stocks
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
      // Si se filtra por sin dividendos (crecimiento), ordenar por los más rentables (mayor potencial upside proyectado)
      if (stockDivFilter === "growth") {
        return (b.upside || 0) - (a.upside || 0);
      }
      // Si se filtra por dividendos, ordenar por mayor dividendo yield
      if (stockDivFilter === "dividend") {
        return (b.dividend_yield || 0) - (a.dividend_yield || 0);
      }
      return (b.score || 0) - (a.score || 0);
    });

  // Filtrado y Ordenamiento de ETFs
  const filteredEtfs = etfs
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
      // Si se filtra por sin dividendos / acumulación, ordenar por los más rentables (mayor retorno a 1 año)
      if (etfDivFilter === "growth") {
        return (b.return_1y || 0) - (a.return_1y || 0);
      }
      // Si se filtra por dividendos, ordenar por mayor dividendo yield
      if (etfDivFilter === "dividend") {
        return (b.dividend_yield || 0) - (a.dividend_yield || 0);
      }
      return (b.score || 0) - (a.score || 0);
    });

  // Filtrado de ONs
  const filteredOns = ons.filter(
    (o) =>
      o.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrado de Merval
  const filteredMerval = argentina.merval.filter(
    (m) =>
      m.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrado de Bonos
  const filteredSovereign = argentina.sovereign_bonds.filter(
    (b) =>
      b.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Perfiles de asignación del simulador
  const profiles = {
    conservador: {
      onPct: 60,
      cedearPct: 30,
      mervalPct: 10,
      yieldVal: "8.4% anual en USD",
      assetsON: "Telecom (TLC1O), Pampa (MGC3O), YPF (YMCHD)",
      assetsCEDEAR: "KO, JPM, WMT (Alto dividendo defensivo)",
      assetsMERVAL: "Bonos soberanos cortos (BOPREAL / GD30)",
    },
    balanceado: {
      onPct: 40,
      cedearPct: 45,
      mervalPct: 15,
      yieldVal: "11.2% anual en USD",
      assetsON: "YPF (YMCHD), Pampa (MGC3O)",
      assetsCEDEAR: "SPY, MSFT, NVDA (Con dividendos)",
      assetsMERVAL: "Galicia (GGAL), AL30 / GD30",
    },
    agresivo: {
      onPct: 20,
      cedearPct: 55,
      mervalPct: 25,
      yieldVal: "15.8% anual en USD",
      assetsON: "YPF Luz (YFC2O)",
      assetsCEDEAR: "NVDA, AMZN, META, GOOGL (Growth)",
      assetsMERVAL: "Pampa (PAMP), Vista (VIST), AL30",
    },
  }[riskProfile];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(num);
  };

  const currPrefix = currency === "ARS" ? "$" : "u$s ";

  return (
    <div className="min-h-screen bg-[#050911] text-slate-100 font-sans antialiased selection:bg-[#00F5A0] selection:text-black overflow-x-hidden">
      {/* ========================================================
          1. HEADER FIJO CON TICKER TAPE (DISEÑO STITCH OPTIMIZADO)
      ======================================================== */}
      <header className="w-full border-b border-[#162338]/80 bg-[#060B14]/90 backdrop-blur-md sticky top-0 z-50">
        {/* Top Navigation Bar */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a className="flex items-center gap-3 group" href="#" title="DONDE INVIERTO - Inicio">
              {/* Upward Trend FinTech Logo */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-900/40 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,160,0.25)] group-hover:border-[#00F5A0] transition-colors">
                <svg className="w-6 h-6 text-[#00F5A0]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-extrabold tracking-wider text-white group-hover:text-[#00F5A0] transition-colors">
                  DONDE INVIERTO
                </span>
                <span className="text-[11px] font-mono font-medium tracking-widest uppercase text-slate-400">
                  Terminal Quant
                </span>
              </div>
            </a>
            {/* Live Pulse Radar Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0E202B] border border-emerald-500/30 text-[11px] font-semibold text-[#00F5A0] tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#00F5A0] pulse-dot"></span>
              <span>RADAR EN VIVO</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <a className="px-4 py-2 rounded-lg text-sm font-medium text-[#00F5A0] bg-emerald-500/10 border border-emerald-500/20 transition-all" href="#radar-oportunidades">
              Top Oportunidades
            </a>
            <a className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all" href="#simulador-cartera">
              Simulador
            </a>
            <a className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all" href="#planes-precios">
              Planes
            </a>
          </nav>

          {/* Right Action & Profile Button */}
          <div className="flex items-center space-x-3">
            <a
              className="px-4 py-2 text-xs md:text-sm font-bold bg-[#00F5A0] hover:bg-[#00d68b] text-[#050911] rounded-lg shadow-[0_0_20px_rgba(0,245,160,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              href="#planes-precios"
            >
              Suscribirse Pro
            </a>
            <button
              aria-label="Perfil de usuario"
              className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              type="button"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ticker Stream Bar */}
        <div className="w-full border-t border-[#131E30] bg-[#03060C]/90 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[880px] gap-6 text-[12px] font-mono">
            <div className="flex items-center gap-2 border-b-2 border-[#00F5A0] pb-0.5">
              <span className="text-slate-100 font-bold tracking-wide">S&P 500</span>
              <span className="text-white font-bold">{market["^GSPC"].price.toLocaleString("en-US")}</span>
              <span className="text-[#00F5A0] font-semibold flex items-center">↗ +{market["^GSPC"].change}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-semibold tracking-wide">NASDAQ 100</span>
              <span className="text-white font-bold">{market["^IXIC"].price.toLocaleString("en-US")}</span>
              <span className="text-[#00F5A0] font-semibold flex items-center">↗ +{market["^IXIC"].change}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-semibold tracking-wide">S&P MERVAL</span>
              <span className="text-white font-bold">{market["^MERVAL"].price.toLocaleString("es-AR")}</span>
              <span className="text-[#00F5A0] font-semibold flex items-center">↗ +{market["^MERVAL"].change}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-semibold tracking-wide">DÓLAR CCL</span>
              <span className="text-white font-bold">${market["CCL"].price.toFixed(2)}</span>
              <span className="text-[#00F5A0] font-semibold flex items-center">↗ +{market["CCL"].change}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-semibold tracking-wide">UST 10Y</span>
              <span className="text-white font-bold">{market["^TNX"].price}%</span>
              <span className="text-slate-400 font-semibold">0.00 bps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-semibold tracking-wide">VIX</span>
              <span className="text-white font-bold">{market["^VIX"].price}</span>
              <span className="text-rose-400 font-semibold flex items-center">↘ {market["^VIX"].change}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION CON INTRO & LIVE METRICS (STITCH REDESIGN)
      ======================================================== */}
      <main className="w-full">
        <section className="w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 lg:py-16 radial-glow relative border-b border-[#162338]/80">
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center my-auto">
            {/* Market Scope Capsule Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0D182A]/90 border border-slate-700/60 shadow-lg text-[11px] sm:text-xs tracking-wider uppercase font-semibold text-slate-300 mb-6">
              <Globe className="w-3.5 h-3.5 text-[#00F5A0]" />
              <span>WALL STREET, CEDEARS, OBLIGACIONES NEGOCIABLES Y MERVAL</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.12]">
              ¿En qué conviene invertir hoy? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5A0] via-emerald-300 to-teal-400 drop-shadow-[0_4px_25px_rgba(0,245,160,0.25)]">
                Decisiones con datos reales.
              </span>
            </h1>

            {/* Detailed Description Box */}
            <div className="mt-7 max-w-3xl px-2">
              <p className="text-base sm:text-lg md:text-xl text-slate-100 font-normal leading-relaxed tracking-wide">
                Monitoreamos diariamente los mejores{" "}
                <strong className="text-white font-bold underline decoration-[#00F5A0]/50 underline-offset-4">
                  CEDEARs de Wall Street
                </strong>{" "}
                (con precio en pesos y dividendos), las{" "}
                <strong className="text-white font-bold underline decoration-[#00F5A0]/50 underline-offset-4">
                  Obligaciones Negociables (ONs en dólares)
                </strong>{" "}
                más rentables y las oportunidades del{" "}
                <strong className="text-white font-bold underline decoration-[#00F5A0]/50 underline-offset-4">
                  Merval y Bonos soberanos
                </strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <a
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-bold text-[#050911] bg-[#00F5A0] hover:bg-[#02e093] rounded-xl shadow-[0_0_25px_rgba(0,245,160,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                href="#radar-oportunidades"
              >
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                <span>Ver Rankings de Hoy</span>
              </a>
              <a
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-500 rounded-xl backdrop-blur-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                href="#simulador-cartera"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#00F5A0]" />
                <span>Simular mi Cartera</span>
              </a>
            </div>
          </div>

          {/* Live Market Metric Grid */}
          <div className="w-full max-w-7xl mx-auto mt-12 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {/* Card 1: Dólar CCL */}
              <div className="card-glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-200 font-mono font-bold tracking-wider uppercase mb-1">
                  <span>DÓLAR CCL HOY</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                    ${ccl_dollar.toFixed(2)} <span className="text-xs text-slate-400 font-normal">ARS</span>
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#00F5A0]">▲ +{market["CCL"].change}%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-mono">Brecha cambiaria: 18.2%</div>
              </div>

              {/* Card 2: S&P Merval */}
              <div className="card-glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-200 font-mono font-bold tracking-wider uppercase mb-1">
                  <span>S&P MERVAL</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                    {market["^MERVAL"].price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#00F5A0]">▲ +{market["^MERVAL"].change}%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-mono">Volumen: $48.2B ARS</div>
              </div>

              {/* Card 3: Bono USA 10Y */}
              <div className="card-glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-200 font-mono font-bold tracking-wider uppercase mb-1">
                  <span>BONO USA 10Y</span>
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                    {market["^TNX"].price}% <span className="text-xs text-slate-400 font-normal">Yield</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">0.00 bps</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-mono">Tasa de Referencia FED</div>
              </div>

              {/* Card 4: VIX Volatilidad */}
              <div className="card-glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-200 font-mono font-bold tracking-wider uppercase mb-1">
                  <span>VIX VOLATILIDAD</span>
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]"></span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                    {market["^VIX"].price} <span className="text-xs text-slate-400 font-normal">pts</span>
                  </span>
                  <span className="text-xs font-mono font-semibold text-rose-400">▼ {market["^VIX"].change}%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-mono">Régimen: Baja Aversión</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. RADAR DIARIO DE OPORTUNIDADES (TABS, FILTROS, CARDS)
        ======================================================== */}
        <section className="w-full py-16 bg-[#051424]" id="radar-oportunidades">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
            {/* Header del Radar con Buscador */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[#4edea3] text-xs font-bold uppercase tracking-wider mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  Selección Cuantitativa Diaria
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                  Radar Diario de Oportunidades
                </h2>
                <p className="text-xs font-mono text-[#64748B] mt-1">
                  Dólar CCL de referencia:{" "}
                  <span className="text-[#F8FAFC] font-bold">${ccl_dollar} ARS</span> | Actualizado: {last_updated}
                </p>
              </div>

              {/* Buscador */}
              <div className="w-full lg:w-80 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar ticker, empresa, ON..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#122131] border border-[#1F2937] rounded-xl text-[#d4e4fa] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#4edea3]/60 focus:bg-[#1E293B] shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Pestañas Principales & Sub-pestañas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1c2d] p-2 rounded-xl border border-[#1F2937]">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveTab("cedears")}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === "cedears"
                      ? "bg-[#4edea3] text-[#003824] shadow-sm"
                      : "text-[#bbcabf] hover:bg-[#1E293B] hover:text-[#d4e4fa]"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Wall Street & CEDEARs
                </button>
                <button
                  onClick={() => setActiveTab("ons")}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === "ons"
                      ? "bg-[#4edea3] text-[#003824] shadow-sm"
                      : "text-[#bbcabf] hover:bg-[#1E293B] hover:text-[#d4e4fa]"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  ONs en Dólares ({filteredOns.length})
                </button>
                <button
                  onClick={() => setActiveTab("argentina")}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === "argentina"
                      ? "bg-[#4edea3] text-[#003824] shadow-sm"
                      : "text-[#bbcabf] hover:bg-[#1E293B] hover:text-[#d4e4fa]"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Mercado Local (Merval & Bonos)
                </button>
              </div>

              {/* Sub-selector de CEDEARs */}
              {activeTab === "cedears" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#122131] rounded-lg self-start sm:self-center border border-[#1F2937]">
                  <span className="text-xs font-mono text-[#64748B] mr-1">Ver:</span>
                  <button
                    onClick={() => setCedearSubTab("stocks")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      cedearSubTab === "stocks"
                        ? "bg-[#2c3a4c] text-[#F8FAFC]"
                        : "text-[#64748B] hover:text-[#d4e4fa]"
                    }`}
                  >
                    Acciones CEDEAR ({filteredStocks.length})
                  </button>
                  <button
                    onClick={() => setCedearSubTab("etfs")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      cedearSubTab === "etfs"
                        ? "bg-[#2c3a4c] text-[#F8FAFC]"
                        : "text-[#64748B] hover:text-[#d4e4fa]"
                    }`}
                  >
                    Top ETFs ({filteredEtfs.length})
                  </button>
                </div>
              )}

              {/* Sub-selector de Mercado Local */}
              {activeTab === "argentina" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#122131] rounded-lg self-start sm:self-center border border-[#1F2937]">
                  <span className="text-xs font-mono text-[#64748B] mr-1">Ver:</span>
                  <button
                    onClick={() => setArgSubTab("merval")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      argSubTab === "merval"
                        ? "bg-[#2c3a4c] text-[#F8FAFC]"
                        : "text-[#64748B] hover:text-[#d4e4fa]"
                    }`}
                  >
                    Acciones Merval ({filteredMerval.length})
                  </button>
                  <button
                    onClick={() => setArgSubTab("bonds")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      argSubTab === "bonds"
                        ? "bg-[#2c3a4c] text-[#F8FAFC]"
                        : "text-[#64748B] hover:text-[#d4e4fa]"
                    }`}
                  >
                    Bonos Soberanos ({filteredSovereign.length})
                  </button>
                </div>
              )}
            </div>

            {/* ---------------- PESTAÑA: ACCIONES USA & CEDEARS ---------------- */}
            {activeTab === "cedears" && cedearSubTab === "stocks" && (
              <div className="flex flex-col gap-4">
                {/* Filtro de Dividendos para Acciones */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#0d1c2d] border border-[#1F2937]">
                  <span className="text-xs text-[#64748B] font-semibold mr-1">Filtrar Dividendos:</span>
                  <button
                    onClick={() => setStockDivFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      stockDivFilter === "all"
                        ? "bg-[#4edea3] text-[#003824]"
                        : "bg-[#122131] text-[#bbcabf] hover:text-[#F8FAFC]"
                    }`}
                  >
                    Todas ({stocks.length})
                  </button>
                  <button
                    onClick={() => setStockDivFilter("dividend")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      stockDivFilter === "dividend"
                        ? "bg-[#4edea3] text-[#003824]"
                        : "bg-[#122131] text-[#bbcabf] hover:text-[#F8FAFC]"
                    }`}
                  >
                    <CircleDollarSign className="w-3.5 h-3.5" />
                    <span>💵 Con Dividendos en USD ({stocks.filter((s) => s.pays_dividend).length})</span>
                  </button>
                  <button
                    onClick={() => setStockDivFilter("growth")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      stockDivFilter === "growth"
                        ? "bg-[#4edea3] text-[#003824]"
                        : "bg-[#122131] text-[#bbcabf] hover:text-[#F8FAFC]"
                    }`}
                  >
                    🚀 Sin Dividendos - Top 10 más rentables ({stocks.filter((s) => !s.pays_dividend).length})
                  </button>
                </div>

                {/* Lista de Tarjetas de Acciones (12 Columnas Desktop) */}
                <div className="flex flex-col gap-3">
                  {filteredStocks.map((stock, idx) => {
                    const isPositive = stock.day_change >= 0;
                    return (
                      <article
                        key={stock.ticker}
                        className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 shadow-sm hover:bg-[#1E293B]/60 transition-all flex flex-col gap-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Col 1-4: Identidad y Dividendos */}
                          <div className="md:col-span-4 flex items-center gap-3">
                            <span className="text-lg font-mono text-[#64748B] font-bold min-w-8">
                              #{idx + 1}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-base font-bold text-[#F8FAFC]">
                                  {stock.ticker}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[#122131] text-[11px] font-mono text-[#64748B]">
                                  {stock.sector}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[rgba(16,185,129,0.12)] text-[#10B981] text-[11px] font-bold uppercase">
                                  {stock.recommendation}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-[#64748B] truncate">{stock.name}</span>
                                {stock.pays_dividend ? (
                                  <span className="inline-flex items-center gap-1 text-[#4edea3] text-xs font-mono font-medium">
                                    <CircleDollarSign className="w-3.5 h-3.5" /> Div. {stock.dividend_yield}% anual
                                  </span>
                                ) : (
                                  <span className="text-xs font-mono text-[#64748B]">
                                    Sin dividendo (Reinvierte)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Col 5-6: Precio USA */}
                          <div className="md:col-span-2 flex flex-col">
                            <span className="text-[11px] font-mono text-[#64748B] uppercase">PRECIO USA (USD)</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-bold font-mono text-[#F8FAFC]">
                                ${stock.price.toFixed(2)}
                              </span>
                              <span
                                className={`text-xs font-mono font-bold ${
                                  isPositive ? "text-[#10B981]" : "text-[#EF4444]"
                                }`}
                              >
                                {isPositive ? `+${stock.day_change}%` : `${stock.day_change}%`}
                              </span>
                            </div>
                          </div>

                          {/* Col 7-8: CEDEAR en Pesos */}
                          <div className="md:col-span-2 flex flex-col">
                            <span className="text-[11px] font-mono text-[#64748B] uppercase">CEDEAR EN PESOS</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-bold font-mono text-[#F8FAFC]">
                                ${stock.cedear_price_ars.toLocaleString("es-AR")} ARS
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-[#64748B]">
                              Ratio {stock.cedear_ratio}
                            </span>
                          </div>

                          {/* Col 9-10: Potencial Analistas */}
                          <div className="md:col-span-2 flex flex-col">
                            <span className="text-[11px] font-mono text-[#64748B] uppercase">POTENCIAL ANALISTAS</span>
                            <span className="text-sm font-mono text-[#F8FAFC]">
                              {stock.target_price ? `$${stock.target_price.toFixed(2)}` : "N/D"}
                            </span>
                            <span className="text-xs font-mono text-[#10B981] font-semibold">
                              +{stock.upside}% estimado
                            </span>
                          </div>

                          {/* Col 11-12: Score Total */}
                          <div className="md:col-span-2 flex items-center justify-end gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-[11px] font-mono text-[#64748B] uppercase">Score Total</span>
                              <span className="text-lg font-mono text-[#4edea3] font-bold">
                                {stock.score}{" "}
                                <span className="text-[#64748B] text-xs font-normal">/100</span>
                              </span>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#122131] flex items-center justify-center text-[#4edea3] border border-[#1F2937]">
                              <Zap className="w-4 h-4 stroke-[2.5]" />
                            </div>
                          </div>
                        </div>

                        {/* Tesis Strip */}
                        <div className="pt-2 bg-[#0d1c2d]/70 -mx-4 -mb-4 px-4 py-2 rounded-b-xl flex items-center gap-2 text-[#64748B] text-xs">
                          <span className="text-[#4edea3] font-semibold uppercase text-[11px] font-mono shrink-0">
                            Tesis:
                          </span>
                          <span className="truncate sm:whitespace-normal">{stock.thesis}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------------- PESTAÑA: ETFS CON FILTRO DE GESTORA Y DIVIDENDOS ---------------- */}
            {activeTab === "cedears" && cedearSubTab === "etfs" && (
              <div className="flex flex-col gap-4">
                {/* Filtro doble para ETFs: Dividendos y Gestoras */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 rounded-xl bg-[#0d1c2d] border border-[#1F2937]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-[#64748B] font-semibold mr-1">Dividendos:</span>
                    <button
                      onClick={() => setEtfDivFilter("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        etfDivFilter === "all"
                          ? "bg-[#4edea3] text-[#003824]"
                          : "bg-[#122131] text-[#bbcabf] hover:text-[#F8FAFC]"
                      }`}
                    >
                      Todos ({etfs.length})
                    </button>
                    <button
                      onClick={() => setEtfDivFilter("dividend")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        etfDivFilter === "dividend"
                          ? "bg-[#4edea3] text-[#003824]"
                          : "bg-[#122131] text-[#bbcabf] hover:text-[#F8FAFC]"
                      }`}
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      <span>💵 Con Dividendos ({etfs.filter((e) => e.pays_dividend).length})</span>
                    </button>
                    <button
                      onClick={() => setEtfDivFilter("growth")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        etfDivFilter === "growth"
                          ? "bg-[#4edea3] text-[#003824]"
                          : "bg-[#122131] text-[#bbcabf] hover:text-[#F8FAFC]"
                      }`}
                    >
                      🚀 Sin Dividendos - Top 10 más rentables ({etfs.filter((e) => !e.pays_dividend).length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B] font-semibold whitespace-nowrap">Gestora:</span>
                    <select
                      value={etfManagerFilter}
                      onChange={(e) => setEtfManagerFilter(e.target.value)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#122131] border border-[#1F2937] text-[#d4e4fa] focus:outline-none focus:border-[#4edea3]"
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

                {/* Lista de Tarjetas de ETFs */}
                <div className="flex flex-col gap-3">
                  {filteredEtfs.map((etf, idx) => (
                    <article
                      key={etf.ticker}
                      className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 shadow-sm hover:bg-[#1E293B]/60 transition-all flex flex-col gap-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4 flex items-center gap-3">
                          <span className="text-lg font-mono text-[#64748B] font-bold min-w-8">
                            #{idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-base font-bold text-[#F8FAFC]">
                                {etf.ticker}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#122131] text-[11px] font-mono text-[#38BDF8] border border-[#38BDF8]/20">
                                {etf.manager}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#1c2b3c] text-[11px] font-mono text-[#64748B]">
                                {etf.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[#64748B] truncate">{etf.name}</span>
                              {etf.pays_dividend ? (
                                <span className="inline-flex items-center gap-1 text-[#4edea3] text-xs font-mono font-medium">
                                  <CircleDollarSign className="w-3.5 h-3.5" /> Div. {etf.dividend_yield}% anual
                                </span>
                              ) : (
                                <span className="text-xs font-mono text-[#64748B]">
                                  Acumulación (0% dividendo)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col">
                          <span className="text-[11px] font-mono text-[#64748B] uppercase">PRECIO USA (USD)</span>
                          <span className="text-base font-bold font-mono text-[#F8FAFC]">
                            ${etf.price.toFixed(2)}
                          </span>
                          <span className="text-[11px] font-mono text-[#10B981] font-bold">
                            +{etf.day_change}%
                          </span>
                        </div>

                        <div className="md:col-span-2 flex flex-col">
                          <span className="text-[11px] font-mono text-[#64748B] uppercase">CEDEAR EN PESOS</span>
                          <span className="text-base font-bold font-mono text-[#F8FAFC]">
                            ${etf.cedear_price_ars.toLocaleString("es-AR")} ARS
                          </span>
                          <span className="text-[11px] font-mono text-[#64748B]">Ratio {etf.cedear_ratio}</span>
                        </div>

                        <div className="md:col-span-2 flex flex-col">
                          <span className="text-[11px] font-mono text-[#64748B] uppercase">RETORNO 1 AÑO</span>
                          <span className="text-base font-bold font-mono text-[#10B981]">
                            +{etf.return_1y}%
                          </span>
                          <span className="text-[11px] font-mono text-[#64748B]">Costo: {etf.expense_ratio}%</span>
                        </div>

                        <div className="md:col-span-2 flex items-center justify-end gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-mono text-[#64748B] uppercase">Score Total</span>
                            <span className="text-lg font-mono text-[#4edea3] font-bold">
                              {etf.score}{" "}
                              <span className="text-[#64748B] text-xs font-normal">/100</span>
                            </span>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-[#122131] flex items-center justify-center text-[#4edea3] border border-[#1F2937]">
                            <Zap className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 bg-[#0d1c2d]/70 -mx-4 -mb-4 px-4 py-2 rounded-b-xl flex items-center gap-2 text-[#64748B] text-xs">
                        <span className="text-[#4edea3] font-semibold uppercase text-[11px] font-mono shrink-0">
                          Tesis:
                        </span>
                        <span className="truncate sm:whitespace-normal">{etf.thesis}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- PESTAÑA: OBLIGACIONES NEGOCIABLES EN DÓLARES ---------------- */}
            {activeTab === "ons" && (
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-[#1F2937] text-xs text-[#d4e4fa] flex items-center justify-between">
                  <span>
                    💡 <b>Obligaciones Negociables (ONs):</b> Instrumentos corporativos de deuda en dólares emitidos por empresas de primera línea de Argentina. Pagan cupones en <b>dólares billete</b> y se operan tanto en pesos como en dólares MEP.
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {filteredOns.map((on, idx) => (
                    <article
                      key={on.ticker}
                      className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 shadow-sm hover:bg-[#1E293B]/60 transition-all flex flex-col gap-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3 flex items-center gap-3">
                          <span className="text-lg font-mono text-[#64748B] font-bold min-w-8">
                            #{idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-base font-bold text-[#F8FAFC]">
                                {on.ticker}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                                  on.law.includes("Nueva York")
                                    ? "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20"
                                    : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                                }`}
                              >
                                {on.law}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#122131] text-[11px] font-mono text-[#d4e4fa] border border-[#1F2937]">
                                📅 Vence: <strong className="text-[#4edea3]">{on.maturity_date}</strong>
                              </span>
                            </div>
                            <span className="text-xs text-[#64748B] mt-1 truncate">{on.name} — {on.issuer}</span>
                          </div>
                        </div>

                        {/* Cotización Actual y Paridad */}
                        <div className="md:col-span-2 flex flex-col">
                          <span className="text-[11px] font-mono text-[#64748B] uppercase">COTIZACIÓN & PARIDAD</span>
                          <span className="text-base font-bold font-mono text-[#F8FAFC]">
                            ${on.price_usd ? on.price_usd.toFixed(2) : "100.00"} USD
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                on.parity > 100
                                  ? "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20"
                                  : on.parity < 100
                                  ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                                  : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                              }`}
                            >
                              {on.parity_status || (on.parity > 100 ? "Sobre la par" : "Bajo la par")} ({on.parity}%)
                            </span>
                          </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col">
                          <span className="text-[11px] font-mono text-[#64748B] uppercase">RENDIMIENTO (TIR)</span>
                          <span className="text-lg font-bold font-mono text-[#4edea3]">
                            {on.tir_usd}% anual
                          </span>
                          <span className="text-[11px] font-mono text-[#64748B]">Tasa neta en USD</span>
                        </div>

                        <div className="md:col-span-2 flex flex-col">
                          <span className="text-[11px] font-mono text-[#64748B] uppercase">CUPÓN & FRECUENCIA</span>
                          <span className="text-sm font-bold font-mono text-[#F8FAFC]">
                            {on.coupon}% anual
                          </span>
                          <span className="text-[11px] font-mono text-[#64748B]">{on.frequency}</span>
                        </div>

                        <div className="md:col-span-1 flex flex-col">
                          <span className="text-[11px] font-mono text-[#64748B] uppercase">RATING</span>
                          <span className="text-xs font-bold text-[#F8FAFC] truncate">{on.rating}</span>
                          <span className="text-[11px] font-mono text-[#64748B]">Mín: {on.min_investment}</span>
                        </div>

                        <div className="md:col-span-2 flex items-center justify-end gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-mono text-[#64748B] uppercase">Solidez</span>
                            <span className="text-lg font-mono text-[#4edea3] font-bold">
                              {on.score} <span className="text-[#64748B] text-xs font-normal">/100</span>
                            </span>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-[#122131] flex items-center justify-center text-[#4edea3] border border-[#1F2937]">
                            <Building2 className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 bg-[#0d1c2d]/70 -mx-4 -mb-4 px-4 py-2 rounded-b-xl flex items-center gap-2 text-[#64748B] text-xs">
                        <span className="text-[#4edea3] font-semibold uppercase text-[11px] font-mono shrink-0">
                          Tesis:
                        </span>
                        <span className="truncate sm:whitespace-normal">{on.thesis}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- PESTAÑA: MERCADO LOCAL ARGENTINO (MERVAL & BONOS) ---------------- */}
            {activeTab === "argentina" && (
              <div className="flex flex-col gap-4">
                {argSubTab === "merval" && (
                  <div className="flex flex-col gap-3">
                    {filteredMerval.map((m, idx) => (
                      <article
                        key={m.ticker}
                        className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 shadow-sm hover:bg-[#1E293B]/60 transition-all flex flex-col gap-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-5 flex items-center gap-3">
                            <span className="text-lg font-mono text-[#64748B] font-bold min-w-8">
                              #{idx + 1}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-base font-bold text-[#F8FAFC]">
                                  {m.ticker}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[#122131] text-[11px] font-mono text-[#64748B]">
                                  {m.sector}
                                </span>
                              </div>
                              <span className="text-xs text-[#64748B] mt-1">{m.name}</span>
                            </div>
                          </div>

                          <div className="md:col-span-3 flex flex-col">
                            <span className="text-[11px] font-mono text-[#64748B] uppercase">PRECIO EN PESOS</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-bold font-mono text-[#F8FAFC]">
                                ${m.price_ars.toLocaleString("es-AR")} ARS
                              </span>
                              <span className="text-xs font-mono text-[#10B981] font-bold">
                                +{m.day_change}%
                              </span>
                            </div>
                          </div>

                          <div className="md:col-span-2 flex flex-col">
                            <span className="text-[11px] font-mono text-[#64748B] uppercase">VALUACIÓN (P/E)</span>
                            <span className="text-sm font-bold font-mono text-[#F8FAFC]">
                              {m.pe_ratio}x ganancias
                            </span>
                            <span className="text-[11px] font-mono text-[#64748B]">Múltiplo comprimido</span>
                          </div>

                          <div className="md:col-span-2 flex items-center justify-end gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-[11px] font-mono text-[#64748B] uppercase">Score</span>
                              <span className="text-lg font-mono text-[#4edea3] font-bold">
                                {m.score} <span className="text-[#64748B] text-xs font-normal">/100</span>
                              </span>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#122131] flex items-center justify-center text-[#4edea3] border border-[#1F2937]">
                              <Zap className="w-4 h-4 stroke-[2.5]" />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 bg-[#0d1c2d]/70 -mx-4 -mb-4 px-4 py-2 rounded-b-xl flex items-center gap-2 text-[#64748B] text-xs">
                          <span className="text-[#4edea3] font-semibold uppercase text-[11px] font-mono shrink-0">
                            Tesis Local:
                          </span>
                          <span className="truncate sm:whitespace-normal">{m.thesis}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {argSubTab === "bonds" && (
                  <div className="flex flex-col gap-3">
                    {filteredSovereign.map((b, idx) => (
                      <article
                        key={b.ticker}
                        className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 shadow-sm hover:bg-[#1E293B]/60 transition-all flex flex-col gap-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-5 flex items-center gap-3">
                            <span className="text-lg font-mono text-[#64748B] font-bold min-w-8">
                              #{idx + 1}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-base font-bold text-[#F8FAFC]">
                                  {b.ticker}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
                                  {b.law}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[#122131] text-[11px] font-mono text-[#d4e4fa] border border-[#1F2937]">
                                  📅 Vence: <strong className="text-[#4edea3]">{b.maturity_date}</strong>
                                </span>
                              </div>
                              <span className="text-xs text-[#64748B] mt-1">{b.name}</span>
                            </div>
                          </div>

                          <div className="md:col-span-3 flex flex-col">
                            <span className="text-[11px] font-mono text-[#64748B] uppercase">COTIZACIÓN & PARIDAD</span>
                            <span className="text-base font-bold font-mono text-[#F8FAFC]">
                              ${b.price_usd} USD
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                  b.parity >= 100
                                    ? "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20"
                                    : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                                }`}
                              >
                                {b.parity_status || (b.parity >= 100 ? "Sobre la par" : "Bajo la par")} ({b.parity}%)
                              </span>
                            </div>
                          </div>

                          <div className="md:col-span-2 flex flex-col">
                            <span className="text-[11px] font-mono text-[#64748B] uppercase">RENDIMIENTO (TIR)</span>
                            <span className="text-base font-bold font-mono text-[#4edea3]">
                              {b.tir_usd}% anual
                            </span>
                            <span className="text-[11px] font-mono text-[#64748B]">Renta en USD</span>
                          </div>

                          <div className="md:col-span-2 flex items-center justify-end gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-[11px] font-mono text-[#64748B] uppercase">Score</span>
                              <span className="text-lg font-mono text-[#4edea3] font-bold">
                                {b.score} <span className="text-[#64748B] text-xs font-normal">/100</span>
                              </span>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#122131] flex items-center justify-center text-[#4edea3] border border-[#1F2937]">
                              <Shield className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 bg-[#0d1c2d]/70 -mx-4 -mb-4 px-4 py-2 rounded-b-xl flex items-center gap-2 text-[#64748B] text-xs">
                          <span className="text-[#38BDF8] font-semibold uppercase text-[11px] font-mono shrink-0">
                            Tesis Soberana:
                          </span>
                          <span className="truncate sm:whitespace-normal">{b.thesis}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            4. SIMULADOR DE CARTERA INTELIGENTE (ESTILO STITCH)
        ======================================================== */}
        <section className="w-full py-16 bg-[#010f1f] border-t border-[#1F2937]" id="simulador-cartera">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            <div className="text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c2b3c] text-[#4edea3] text-xs font-bold uppercase tracking-wider mb-2 border border-[#273647]">
                <Calculator className="w-3.5 h-3.5" />
                Simulador de Cartera Inteligente
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
                ¿Cuánto capital deseas invertir hoy?
              </h2>
              <p className="text-sm text-[#64748B] max-w-xl mt-1">
                Distribuimos tu dinero automáticamente entre CEDEARs líderes, Obligaciones Negociables en dólares y Merval.
              </p>
            </div>

            {/* Interfaz del Simulador */}
            <div className="bg-[#111827] border border-[#1F2937] p-6 sm:p-8 rounded-xl shadow-xl flex flex-col gap-6 max-w-4xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                {/* Input de Capital con selector ARS / USD */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-[#F8FAFC]" htmlFor="investAmount">
                      Monto a Invertir
                    </label>
                    <div className="flex rounded-lg bg-[#122131] p-1 text-xs border border-[#1F2937]">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrency("ARS");
                          setInvestmentAmount(1000000);
                        }}
                        className={`px-3 py-0.5 rounded font-bold transition-all ${
                          currency === "ARS" ? "bg-[#4edea3] text-[#003824]" : "text-[#64748B] hover:text-[#d4e4fa]"
                        }`}
                      >
                        ARS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrency("USD");
                          setInvestmentAmount(1000);
                        }}
                        className={`px-3 py-0.5 rounded font-bold transition-all ${
                          currency === "USD" ? "bg-[#4edea3] text-[#003824]" : "text-[#64748B] hover:text-[#d4e4fa]"
                        }`}
                      >
                        USD
                      </button>
                    </div>
                  </div>

                  <div className="relative flex items-center bg-[#010f1f] rounded-xl px-4 py-2.5 border border-[#1F2937] shadow-inner">
                    <span className="text-lg font-mono text-[#4edea3] mr-2 font-bold">{currPrefix}</span>
                    <input
                      id="investAmount"
                      type="number"
                      step={currency === "ARS" ? 100000 : 500}
                      min={currency === "ARS" ? 50000 : 100}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                      className="w-full bg-transparent text-lg font-mono font-bold text-[#F8FAFC] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Selector de Perfil de Riesgo */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[#F8FAFC]">Perfil de Inversor</span>
                  <div className="grid grid-cols-3 gap-1 bg-[#010f1f] p-1 rounded-xl border border-[#1F2937]">
                    {(["conservador", "balanceado", "agresivo"] as const).map((prof) => (
                      <button
                        key={prof}
                        type="button"
                        onClick={() => setRiskProfile(prof)}
                        className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                          riskProfile === prof
                            ? "bg-[#4edea3] text-[#003824] shadow-sm"
                            : "text-[#bbcabf] hover:text-[#d4e4fa]"
                        }`}
                      >
                        {prof}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultados de Asignación */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tarjeta ONs */}
                <div className="bg-[#122131] border border-[#1F2937] p-4 rounded-xl flex flex-col justify-between shadow-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#64748B]">
                        Obligaciones Negociables ({profiles.onPct}%)
                      </span>
                      <Building2 className="w-4 h-4 text-[#4edea3]" />
                    </div>
                    <span className="text-xl font-mono font-bold text-[#F8FAFC]">
                      {currPrefix}
                      {formatNumber((investmentAmount * profiles.onPct) / 100)}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 bg-[#1c2b3c]/40 rounded p-2 border border-[#1F2937]/50">
                    <span className="text-[11px] text-[#64748B] block">Activos sugeridos:</span>
                    <span className="text-xs font-mono text-[#d4e4fa] font-medium">{profiles.assetsON}</span>
                  </div>
                </div>

                {/* Tarjeta CEDEARs */}
                <div className="bg-[#122131] border border-[#1F2937] p-4 rounded-xl flex flex-col justify-between shadow-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#64748B]">
                        CEDEARs Wall Street ({profiles.cedearPct}%)
                      </span>
                      <TrendingUp className="w-4 h-4 text-[#4edea3]" />
                    </div>
                    <span className="text-xl font-mono font-bold text-[#F8FAFC]">
                      {currPrefix}
                      {formatNumber((investmentAmount * profiles.cedearPct) / 100)}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 bg-[#1c2b3c]/40 rounded p-2 border border-[#1F2937]/50">
                    <span className="text-[11px] text-[#64748B] block">Activos sugeridos:</span>
                    <span className="text-xs font-mono text-[#d4e4fa] font-medium">{profiles.assetsCEDEAR}</span>
                  </div>
                </div>

                {/* Tarjeta Merval */}
                <div className="bg-[#122131] border border-[#1F2937] p-4 rounded-xl flex flex-col justify-between shadow-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#64748B]">
                        Merval & Bonos ({profiles.mervalPct}%)
                      </span>
                      <Shield className="w-4 h-4 text-[#4edea3]" />
                    </div>
                    <span className="text-xl font-mono font-bold text-[#F8FAFC]">
                      {currPrefix}
                      {formatNumber((investmentAmount * profiles.mervalPct) / 100)}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 bg-[#1c2b3c]/40 rounded p-2 border border-[#1F2937]/50">
                    <span className="text-[11px] text-[#64748B] block">Activos sugeridos:</span>
                    <span className="text-xs font-mono text-[#d4e4fa] font-medium">{profiles.assetsMERVAL}</span>
                  </div>
                </div>
              </div>

              {/* Banner de Retorno Proyectado */}
              <div className="w-full bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.25)] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <span className="text-sm font-bold text-[#F8FAFC] block">
                      Retorno estimado de esta combinación
                    </span>
                    <span className="text-xs text-[#64748B]">
                      Proyección ponderada neta por dividendos y paridad CCL histórica.
                    </span>
                  </div>
                </div>
                <span className="text-lg font-mono font-bold text-[#4edea3] whitespace-nowrap">
                  {profiles.yieldVal}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. PLANES & SUSCRIPCIONES PRO
        ======================================================== */}
        <section className="w-full py-16 bg-[#051424] border-t border-[#1F2937]" id="planes-precios">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            <div className="text-center flex flex-col items-center">
              <h2 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
                Comienza gratis, escala cuando ganes dinero
              </h2>
              <p className="text-sm text-[#64748B] mt-1">Sin letra chica. Cancela en cualquier momento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full items-stretch">
              {/* Plan Free */}
              <div className="bg-[#111827] border border-[#1F2937] p-6 sm:p-8 rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">COMUNIDAD</span>
                    <h3 className="text-xl font-bold text-[#F8FAFC] mt-1">Plan Gratuito</h3>
                  </div>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-4xl font-extrabold font-mono text-[#F8FAFC]">$0</span>
                    <span className="text-xs text-[#64748B]">/ siempre</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Ideal para monitorear el mercado de EE.UU. y Argentina todos los días.
                  </p>
                  <ul className="flex flex-col gap-2 pt-3">
                    <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                      <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                      Top 3 CEDEARs, ONs y Merval diarios
                    </li>
                    <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                      <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                      Precios en Pesos y Dólar CCL de referencia
                    </li>
                    <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                      <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                      Simulador de cartera básico
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <a
                    href="#radar-oportunidades"
                    className="w-full py-2.5 rounded-xl bg-[#122131] hover:bg-[#1E293B] text-[#F8FAFC] font-bold text-center text-sm transition-colors block border border-[#1F2937]"
                  >
                    Usar Plan Gratuito
                  </a>
                </div>
              </div>

              {/* Plan Pro */}
              <div className="bg-[#122131] border-2 border-[#4edea3] p-6 sm:p-8 rounded-xl flex flex-col justify-between relative shadow-xl shadow-[#4edea3]/10">
                <div className="absolute -top-3 right-6 bg-[#4edea3] text-[#003824] text-[11px] uppercase font-bold px-3 py-1 rounded-full shadow-sm">
                  MÁS POPULAR
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">INVERSOR PRO</span>
                    <h3 className="text-xl font-bold text-[#F8FAFC] mt-1">Membresía Pro</h3>
                  </div>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-4xl font-extrabold font-mono text-[#F8FAFC]">$9</span>
                    <span className="text-xs text-[#64748B]">USD / mes (o en Pesos al MEP)</span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Para quienes buscan maximizar su capital con análisis completo.
                  </p>
                  <ul className="flex flex-col gap-2 pt-3">
                    <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                      <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                      Top 10 completo sin límites en todas las clases
                    </li>
                    <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                      <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                      Calendario de dividendos y cupones de ONs
                    </li>
                    <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                      <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                      Alertas tempranas por WhatsApp y Telegram
                    </li>
                    <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                      <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                      Cartera recomendada según contexto argentino
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <button className="w-full py-2.5 rounded-xl bg-[#4edea3] hover:bg-[#10b981] text-[#003824] font-bold text-sm transition-all shadow-md active:scale-95">
                    Suscribirse con Garantía de 14 Días
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. FOOTER COMPLETO & DISCLAIMER LEGAL CNV
        ======================================================== */}
        <footer className="w-full bg-[#010f1f] text-[#64748B] border-t border-[#1F2937]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#122131] flex items-center justify-center text-[#4edea3] border border-[#1F2937]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-base font-bold text-[#F8FAFC] tracking-tight">DONDE INVIERTO</span>
                </div>
                <p className="text-xs text-[#64748B] max-w-md leading-relaxed">
                  Plataforma cuantitativa y radar diario de activos financieros. Analítica algorítmica para CEDEARs,
                  Obligaciones Negociables, Renta Fija y Acciones del S&P Merval con paridad CCL.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#F8FAFC]">Explorar</span>
                <nav className="flex flex-col gap-1 text-xs">
                  <a href="#radar-oportunidades" className="text-[#bbcabf] hover:text-[#4edea3] transition-colors">
                    Top Oportunidades
                  </a>
                  <a href="#simulador-cartera" className="text-[#bbcabf] hover:text-[#4edea3] transition-colors">
                    Simulador de Portafolio
                  </a>
                  <a href="#planes-precios" className="text-[#bbcabf] hover:text-[#4edea3] transition-colors">
                    Planes & Suscripciones
                  </a>
                </nav>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#F8FAFC]">Cumplimiento & Legal</span>
                <nav className="flex flex-col gap-1 text-xs">
                  <span className="text-[#bbcabf]">Aviso Legal & CNV</span>
                  <span className="text-[#bbcabf]">Política de Privacidad</span>
                  <span className="text-[#bbcabf]">Términos de Servicio</span>
                </nav>
              </div>
            </div>

            <div className="pt-6 border-t border-[#1F2937]/60 flex flex-col gap-3 text-xs text-[#64748B]">
              <p className="leading-relaxed">
                <strong>Aviso de Riesgo y Descargo Financiero:</strong> La información provista por &apos;Donde Invierto - Radar
                Diario de Inversión&apos; tiene fines estrictamente informativos, analíticos y educativos. No constituye
                asesoramiento financiero ni una invitación a comprar o vender títulos valores. Las estimaciones
                cuantitativas, ratios y precios de CEDEARs/CCL provienen de fuentes públicas y pueden experimentar
                demoras. El inversor es el único responsable de sus decisiones patrimoniales.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-2">
                <span className="font-mono text-[11px]">
                  © {new Date().getFullYear()} Donde Invierto. Todos los derechos reservados.
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  <span className="font-mono text-[11px] text-[#F8FAFC]">
                    Terminal v3.4.1 — BYMA & NYSE Data Feeds
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
