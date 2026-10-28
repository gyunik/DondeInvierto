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
            3. RADAR DIARIO DE OPORTUNIDADES (ESTILO STITCH IMAGEN 2)
        ======================================================== */}
        <section className="w-full max-w-7xl mx-auto mb-16 scroll-mt-24 px-4 sm:px-6 lg:px-8" id="radar-section">
          {/* Header del Radar y Controles */}
          <div className="bg-[#09111e]/90 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
            {/* Fila Superior: Subtítulo + Título + Buscador */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-emerald tracking-wider uppercase mb-2">
                  <Activity className="w-4 h-4 text-brand-emerald" />
                  <span>SELECCIÓN CUANTITATIVA DIARIA</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Radar Diario de Oportunidades
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs sm:text-sm font-mono">
                  <span className="text-slate-300 font-medium">
                    Dólar CCL de referencia:{" "}
                    <strong className="text-white font-bold bg-[#142338] px-2 py-0.5 rounded border border-slate-600/60">
                      ${ccl_dollar} ARS
                    </strong>
                  </span>
                  <span className="text-slate-500 hidden sm:inline">|</span>
                  <span className="text-slate-300">
                    Actualizado: <span className="text-white font-semibold">{last_updated}</span>{" "}
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
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0e1b2f] border border-slate-600 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald rounded-xl text-white text-sm placeholder-slate-400 transition-all font-sans font-medium"
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
                      ? "bg-brand-emerald text-black shadow-[0_0_15px_rgba(0,245,160,0.3)]"
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
                      ? "bg-brand-emerald text-black shadow-[0_0_15px_rgba(0,245,160,0.3)]"
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
                      ? "bg-brand-emerald text-black shadow-[0_0_15px_rgba(0,245,160,0.3)]"
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
                        ? "bg-emerald-500/20 text-brand-emerald font-bold border border-emerald-500/30"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Acciones CEDEAR ({filteredStocks.length})
                  </button>
                  <button
                    onClick={() => setCedearSubTab("etfs")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      cedearSubTab === "etfs"
                        ? "bg-emerald-500/20 text-brand-emerald font-bold border border-emerald-500/30"
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
                        ? "bg-emerald-500/20 text-brand-emerald font-bold border border-emerald-500/30"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Acciones Merval ({filteredMerval.length})
                  </button>
                  <button
                    onClick={() => setArgSubTab("bonds")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      argSubTab === "bonds"
                        ? "bg-emerald-500/20 text-brand-emerald font-bold border border-emerald-500/30"
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
                      ? "bg-emerald-500/20 text-brand-emerald border border-brand-emerald font-bold shadow-sm"
                      : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500"
                  }`}
                >
                  Todas ({stocks.length})
                </button>
                <button
                  onClick={() => setStockDivFilter("dividend")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    stockDivFilter === "dividend"
                      ? "bg-emerald-500/20 text-brand-emerald border border-brand-emerald font-bold shadow-sm"
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
                      ? "bg-emerald-500/20 text-brand-emerald border border-brand-emerald font-bold shadow-sm"
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
                        ? "bg-emerald-500/20 text-brand-emerald border border-brand-emerald font-bold shadow-sm"
                        : "bg-[#111e33] hover:bg-[#162742] text-slate-200 border border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    Todos ({etfs.length})
                  </button>
                  <button
                    onClick={() => setEtfDivFilter("dividend")}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      etfDivFilter === "dividend"
                        ? "bg-emerald-500/20 text-brand-emerald border border-brand-emerald font-bold shadow-sm"
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
                        ? "bg-emerald-500/20 text-brand-emerald border border-brand-emerald font-bold shadow-sm"
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
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0e1b2f] border border-slate-700 text-white focus:outline-none focus:border-brand-emerald"
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

          {/* LISTA DE TARJETAS (MAXIMUM LEGIBILITY & CONTRAST - STITCH IMAGEN 2) */}
          <div className="mt-6 space-y-4">
            {/* 1. ACCIONES CEDEAR */}
            {activeTab === "cedears" && cedearSubTab === "stocks" && (
              <>
                {filteredStocks.map((stock, idx) => {
                  const isPositive = stock.day_change >= 0;
                  return (
                    <div key={stock.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Izquierda: Rank + Ticker + Empresa + Subtítulo */}
                        <div className="flex items-start gap-4">
                          <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono tracking-tight pt-0.5">
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
                              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400 text-brand-emerald text-xs font-black tracking-wider uppercase shadow-[0_0_10px_rgba(0,245,160,0.25)]">
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
                                  isPositive ? "text-brand-emerald" : "text-rose-400"
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

                          <div className="flex flex-col">
                            <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                              POTENCIAL ANALISTAS
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                                {stock.target_price ? `$${stock.target_price.toFixed(2)}` : "N/D"}
                              </span>
                            </div>
                            <span className="text-xs font-bold font-mono text-emerald-400">
                              +{stock.upside}% estimado
                            </span>
                          </div>

                          <div className="flex flex-col sm:items-end justify-center">
                            <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                              SCORE TOTAL
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                                {stock.score}
                              </span>
                              <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-brand-emerald">
                                <Zap className="w-4 h-4 fill-current" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tesis de Inversión */}
                      <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                        <span className="text-xs sm:text-sm font-extrabold font-mono text-brand-emerald tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
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
                        <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono tracking-tight pt-0.5">
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
                              • {etf.pays_dividend ? `Div. ${etf.dividend_yield}% anual` : "Acumulación (0% dividendo)"}
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
                            <span className="text-xs sm:text-sm font-bold font-mono text-brand-emerald">
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

                        <div className="flex flex-col">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            RETORNO 1 AÑO
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                              +{etf.return_1y}%
                            </span>
                          </div>
                          <span className="text-xs font-bold font-mono text-slate-300">
                            Costo: {etf.expense_ratio}%
                          </span>
                        </div>

                        <div className="flex flex-col sm:items-end justify-center">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            SCORE TOTAL
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                              {etf.score}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-brand-emerald">
                              <Zap className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-brand-emerald tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
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
                    💡 <strong className="text-white">Obligaciones Negociables (ONs):</strong> Deuda corporativa privada emitida por empresas líderes (YPF, Pampa, Pan American Energy, etc.). Pagan cupones periódicos en <strong className="text-brand-emerald">dólares billete (Dólar MEP/Cable)</strong> y se negocian tanto en Pesos como en Dólares.
                  </span>
                </div>

                {filteredOns.map((on, idx) => (
                  <div key={on.ticker} className="instrument-card rounded-2xl p-5 sm:p-6 transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono tracking-tight pt-0.5">
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
                              Vence: <strong className="text-brand-emerald">{on.maturity_date}</strong>
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
                              on.parity > 100 ? "text-cyan-300" : on.parity < 100 ? "text-amber-300" : "text-brand-emerald"
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
                            <span className="text-lg sm:text-xl font-extrabold text-brand-emerald font-mono">
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

                        <div className="flex flex-col sm:items-end justify-center">
                          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                            SOLIDEZ
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                              {on.score}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-brand-emerald">
                              <Building2 className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-brand-emerald tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
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
                            <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono tracking-tight pt-0.5">
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
                              <span className="text-xs font-mono font-bold text-brand-emerald">
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

                            <div className="flex flex-col sm:items-end justify-center">
                              <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                                SCORE
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                                  {m.score}
                                </span>
                                <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-brand-emerald">
                                  <Zap className="w-4 h-4 fill-current" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                          <span className="text-xs sm:text-sm font-extrabold font-mono text-brand-emerald tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
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
                            <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono tracking-tight pt-0.5">
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
                                  Vence: <strong className="text-brand-emerald">{b.maturity_date}</strong>
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
                                <span className="text-lg sm:text-xl font-extrabold text-brand-emerald font-mono">
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

                            <div className="flex flex-col sm:items-end justify-center">
                              <span className="text-[11px] sm:text-xs font-bold font-mono uppercase text-slate-300 tracking-wider">
                                SCORE
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xl sm:text-2xl font-black text-brand-emerald font-mono drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                                  {b.score}
                                </span>
                                <span className="text-xs font-bold font-mono text-slate-300">/100</span>
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-brand-emerald">
                                  <Shield className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-start gap-2 bg-[#0c1626]/70 p-3 sm:p-4 rounded-xl border border-slate-800">
                          <span className="text-xs sm:text-sm font-extrabold font-mono text-brand-emerald tracking-wide uppercase whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 self-start">
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
            6. MINIMAL FOOTER (ESTILO STITCH)
        ======================================================== */}
        <footer className="w-full border-t border-[#131E30] bg-[#03060C] py-6 px-6 text-xs text-slate-400 font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-brand-emerald font-black">
                <Activity className="w-4 h-4 text-brand-emerald" />
              </div>
              <span className="text-slate-300">
                <strong className="text-white font-extrabold tracking-wider">DONDE INVIERTO</strong> Terminal Quant © {new Date().getFullYear()} • Datos en tiempo real de mercados financieros internacionales y locales.
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <a className="hover:text-brand-emerald transition-colors" href="#radar-section">Radar</a>
              <span>•</span>
              <a className="hover:text-brand-emerald transition-colors" href="#simulador-cartera">Simulador</a>
              <span>•</span>
              <a className="hover:text-brand-emerald transition-colors" href="#">Términos</a>
              <span>•</span>
              <a className="hover:text-brand-emerald transition-colors" href="#">Aviso CNV</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
