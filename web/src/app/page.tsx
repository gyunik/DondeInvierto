"use client";

import React, { useState } from "react";
import marketData from "@/data/marketData.json";
import {
  TrendingUp,
  Shield,
  Building2,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Flame,
  Award,
  CircleDollarSign
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"cedears" | "ons" | "argentina">("cedears");
  const [cedearSubTab, setCedearSubTab] = useState<"stocks" | "etfs">("stocks");
  const [argSubTab, setArgSubTab] = useState<"merval" | "bonds">("merval");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockDivFilter, setStockDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfDivFilter, setEtfDivFilter] = useState<"all" | "dividend" | "growth">("all");
  const [etfManagerFilter, setEtfManagerFilter] = useState<string>("all");
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000000); // 1 millón de pesos o USD
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [riskProfile, setRiskProfile] = useState<"conservative" | "balanced" | "aggressive">("balanced");

  const { market, stocks, etfs, ons, argentina, date, last_updated, ccl_dollar } = marketData;

  // Filtrado de Acciones
  const filteredStocks = stocks.filter((s) => {
    const matchesSearch =
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (stockDivFilter === "dividend") return s.pays_dividend;
    if (stockDivFilter === "growth") return !s.pays_dividend;
    return true;
  });

  // Filtrado de ETFs por búsqueda, dividendos y gestora (BlackRock, Vanguard, etc.)
  const filteredEtfs = etfs.filter((e) => {
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
  });

  const filteredOns = ons.filter(
    (o) =>
      o.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMerval = argentina.merval.filter(
    (m) =>
      m.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSovereign = argentina.sovereign_bonds.filter(
    (b) =>
      b.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Perfiles de asignación de portafolio para Argentina
  const allocation = {
    conservative: {
      ons: 60,
      cedears: 30,
      merval: 10,
      label: "Conservador (Prioridad Renta en USD)",
      retornoEstimado: "7.8% anual en USD",
    },
    balanced: {
      ons: 40,
      cedears: 45,
      merval: 15,
      label: "Balanceado (Crecimiento Global + Renta)",
      retornoEstimado: "11.2% anual en USD",
    },
    aggressive: {
      ons: 20,
      cedears: 50,
      merval: 30,
      label: "Agresivo (Máximo Crecimiento & Merval)",
      retornoEstimado: "16.5% anual en USD",
    },
  }[riskProfile];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Donde Invierto
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Radar Diario de Inversión
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#ranking" className="hover:text-emerald-400 transition-colors">Top Oportunidades</a>
            <a href="#simulador" className="hover:text-emerald-400 transition-colors">Simulador</a>
            <a href="#metodologia" className="hover:text-emerald-400 transition-colors">Metodología</a>
            <a href="#precios" className="hover:text-emerald-400 transition-colors">Planes</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#ranking"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25 active:scale-95"
            >
              Ver Top del Día
            </a>
          </div>
        </div>
      </header>

      {/* 2. Barra de Mercado en Vivo */}
      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Mercado Hoy | Cierre: {date}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            {Object.entries(market).map(([sym, item]) => {
              const isPositive = item.change >= 0;
              return (
                <div key={sym} className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">{item.name}:</span>
                  <span className="font-semibold text-slate-200">
                    {sym === "CCL"
                      ? `$${item.price.toFixed(2)} ARS`
                      : sym === "^MERVAL"
                      ? `${item.price.toLocaleString("es-AR")} pts`
                      : sym === "^TNX"
                      ? `${item.price}%`
                      : `$${item.price.toLocaleString("en-US")}`}
                  </span>
                  <span
                    className={`flex items-center text-[11px] font-semibold ${
                      isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                    {isPositive ? `+${item.change}%` : `${item.change}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 border-b border-slate-800">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-xs font-medium text-slate-300 mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Wall Street, CEDEARs, Obligaciones Negociables y Merval</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            ¿En qué conviene invertir hoy?{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Decisiones con datos reales.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Monitoreamos diariamente los mejores **CEDEARs de Wall Street** (con precio en pesos y dividendos),
            las **Obligaciones Negociables (ONs en dólares)** más rentables y las oportunidades del **Merval y Bonos soberanos**.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#ranking"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Flame className="w-5 h-5 text-slate-950" />
              Ver Rankings de Hoy
            </a>
            <a
              href="#simulador"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5 text-emerald-400" />
              Simular mi Cartera
            </a>
          </div>
        </div>
      </section>

      {/* 4. Dashboard Principal / Rankings */}
      <section id="ranking" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-1">
              <Award className="w-4 h-4" />
              <span>Selección Cuantitativa Diaria</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Radar Diario de Oportunidades</h2>
            <p className="text-slate-400 text-sm mt-1">
              Dólar CCL de referencia: <span className="text-emerald-400 font-semibold">${ccl_dollar} ARS</span> | Actualizado: <span className="text-slate-300 font-medium">{last_updated}</span>
            </p>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar ticker, empresa, ON..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all"
            />
          </div>
        </div>

        {/* 3 Pestañas Principales (Sin redundancia) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-8 max-w-3xl">
          <button
            onClick={() => setActiveTab("cedears")}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "cedears"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>🌎 Wall Street & CEDEARs</span>
          </button>
          <button
            onClick={() => setActiveTab("ons")}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "ons"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>🏢 ONs en Dólares ({filteredOns.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("argentina")}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "argentina"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>🇦🇷 Mercado Local (Merval & Bonos)</span>
          </button>
        </div>

        {/* ---------------- PESTAÑA 1: WALL STREET & CEDEARS ---------------- */}
        {activeTab === "cedears" && (
          <div>
            {/* Sub-selector: Acciones vs ETFs */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-semibold uppercase text-slate-400">Ver:</span>
              <button
                onClick={() => setCedearSubTab("stocks")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  cedearSubTab === "stocks"
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Top 10 Acciones ({filteredStocks.length})
              </button>
              <button
                onClick={() => setCedearSubTab("etfs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  cedearSubTab === "etfs"
                    ? "bg-slate-800 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Top ETFs ({filteredEtfs.length})
              </button>
            </div>

            {cedearSubTab === "stocks" && (
              <div className="space-y-4">
                {/* Filtro de Dividendos para Acciones */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold mr-1">Filtrar Dividendos:</span>
                  <button
                    onClick={() => setStockDivFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      stockDivFilter === "all"
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    Todos ({stocks.length})
                  </button>
                  <button
                    onClick={() => setStockDivFilter("dividend")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      stockDivFilter === "dividend"
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    <CircleDollarSign className="w-3.5 h-3.5" />
                    <span>💵 Paga Dividendos en USD ({stocks.filter((s) => s.pays_dividend).length})</span>
                  </button>
                  <button
                    onClick={() => setStockDivFilter("growth")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      stockDivFilter === "growth"
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    🚀 Sin Dividendos / Crecimiento ({stocks.filter((s) => !s.pays_dividend).length})
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                {filteredStocks.map((stock, idx) => {
                  const isPositive = stock.day_change >= 0;
                  return (
                    <div
                      key={stock.ticker}
                      className="group relative rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 p-5 sm:p-6 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Identificación */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center font-extrabold text-base text-slate-300 shrink-0">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-bold text-white tracking-tight">{stock.ticker}</h3>
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                                {stock.sector}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {stock.recommendation}
                              </span>

                              {/* BADGE DE DIVIDENDOS */}
                              {stock.pays_dividend ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  <CircleDollarSign className="w-3.5 h-3.5" />
                                  <span>Paga Dividendo ({stock.dividend_yield}% anual)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50">
                                  <span>Sin dividendo (Reinvierte)</span>
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{stock.name}</p>
                          </div>
                        </div>

                        {/* Precios (USA + CEDEAR Pesos) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Precio USA (USD)</span>
                            <span className="text-lg font-bold text-white">${stock.price.toFixed(2)}</span>
                            <span className={`text-xs font-semibold block ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                              {isPositive ? `+${stock.day_change}%` : `${stock.day_change}%`}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                            <span className="text-[11px] text-emerald-400 block uppercase font-bold">CEDEAR en Pesos</span>
                            <span className="text-base sm:text-lg font-extrabold text-white">
                              ${stock.cedear_price_ars.toLocaleString("es-AR")} ARS
                            </span>
                            <span className="text-[11px] text-slate-400 block">Ratio {stock.cedear_ratio}</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Potencial Analistas</span>
                            <span className="text-base font-bold text-slate-200">
                              {stock.target_price ? `$${stock.target_price.toFixed(2)}` : "N/D"}
                            </span>
                            <span className="text-xs font-semibold text-emerald-400 block">
                              +{stock.upside}% estimado
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Score Total</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl font-extrabold text-emerald-400">{stock.score}</span>
                              <span className="text-xs text-slate-500">/100</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tesis de Inversión */}
                      <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-emerald-400 uppercase tracking-wider shrink-0">Tesis:</span>
                        <span>{stock.thesis}</span>
                      </div>
                    </div>
                  );
                })}
                {filteredStocks.length === 0 && (
                  <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
                    No se encontraron acciones que coincidan con los filtros seleccionados.
                  </div>
                )}
                </div>
              </div>
            )}

            {cedearSubTab === "etfs" && (
              <div className="space-y-4">
                {/* Filtro doble para ETFs: Dividendos y Gestoras (BlackRock, Vanguard, etc.) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-semibold mr-1">Dividendos:</span>
                    <button
                      onClick={() => setEtfDivFilter("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        etfDivFilter === "all"
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      Todos ({etfs.length})
                    </button>
                    <button
                      onClick={() => setEtfDivFilter("dividend")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        etfDivFilter === "dividend"
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      <span>💵 Con Dividendos en USD ({etfs.filter((e) => e.pays_dividend).length})</span>
                    </button>
                    <button
                      onClick={() => setEtfDivFilter("growth")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        etfDivFilter === "growth"
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      📦 Acumulación / Sin Dividendo ({etfs.filter((e) => !e.pays_dividend).length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Gestora:</span>
                    <select
                      value={etfManagerFilter}
                      onChange={(e) => setEtfManagerFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="all">Todas las Gestoras</option>
                      <option value="BlackRock (iShares)">BlackRock (iShares)</option>
                      <option value="Vanguard">Vanguard</option>
                      <option value="State Street (SPDR)">State Street (SPDR)</option>
                      <option value="Invesco">Invesco</option>
                      <option value="Charles Schwab">Charles Schwab</option>
                      <option value="VanEck">VanEck</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredEtfs.map((etf, idx) => (
                    <div
                      key={etf.ticker}
                      className="group relative rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 p-5 sm:p-6 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center font-extrabold text-base text-slate-300 shrink-0">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-bold text-white tracking-tight">{etf.ticker}</h3>

                              {/* BADGE DE GESTORA (BlackRock, Vanguard, etc.) */}
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25">
                                {etf.manager}
                              </span>

                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                                {etf.category}
                              </span>

                              {/* BADGE DE POLITICA DE DIVIDENDOS */}
                              {etf.pays_dividend ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  <CircleDollarSign className="w-3.5 h-3.5" />
                                  <span>{etf.dividend_yield}% anual en USD</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700/50">
                                  <span>Acumulación (0% dividendo)</span>
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{etf.name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Precio USA</span>
                            <span className="text-lg font-bold text-white">${etf.price.toFixed(2)} USD</span>
                            <span className="text-xs text-slate-400 block">{etf.dividend_frequency}</span>
                          </div>

                          <div className="p-2 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                            <span className="text-[11px] text-cyan-400 block uppercase font-bold">CEDEAR en Pesos</span>
                            <span className="text-base sm:text-lg font-extrabold text-white">
                              ${etf.cedear_price_ars.toLocaleString("es-AR")} ARS
                            </span>
                            <span className="text-[11px] text-slate-400 block">Ratio {etf.cedear_ratio}</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Retorno 1 Año</span>
                            <span className="text-base font-bold text-emerald-400">+{etf.return_1y}%</span>
                            <span className="text-xs text-slate-500 block">Costo anual: {etf.expense_ratio}%</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Score Total</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl font-extrabold text-emerald-400">{etf.score}</span>
                              <span className="text-xs text-slate-500">/100</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-cyan-400 uppercase tracking-wider shrink-0">Tesis:</span>
                        <span>{etf.thesis}</span>
                      </div>
                    </div>
                  ))}

                  {filteredEtfs.length === 0 && (
                    <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
                      No se encontraron ETFs que coincidan con la gestora o política de dividendos seleccionada.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- PESTAÑA 2: OBLIGACIONES NEGOCIABLES (ONS) ---------------- */}
        {activeTab === "ons" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span>💡 <b>¿Qué son las ONs?</b> Deuda emitida por empresas de primera línea en Argentina. Pagan cupones en <b>dólares billete</b> y se pueden comprar tanto con pesos como con dólares MEP desde cualquier broker.</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredOns.map((on, idx) => (
                <div
                  key={on.ticker}
                  className="group relative rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 p-5 sm:p-6 transition-all duration-200 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center font-extrabold text-base text-slate-300 shrink-0">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold text-white tracking-tight">{on.ticker}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              on.law.includes("Nueva York")
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {on.law}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                            Vence: {on.maturity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{on.name} — <span className="text-slate-300 font-medium">{on.issuer}</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                      <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                        <span className="text-[11px] text-emerald-400 block uppercase font-bold">Rendimiento (TIR)</span>
                        <span className="text-xl font-extrabold text-emerald-400">{on.tir_usd}%</span>
                        <span className="text-[11px] text-slate-400 block">Tasa anual en USD</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Cupón Nominal</span>
                        <span className="text-base font-bold text-white">{on.coupon}% anual</span>
                        <span className="text-[11px] text-slate-400 block">{on.frequency}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Calificación</span>
                        <span className="text-xs font-bold text-slate-200 block mt-1">{on.rating}</span>
                        <span className="text-[11px] text-slate-400 block">Mínimo: {on.min_investment}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Score de Solidez</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-extrabold text-emerald-400">{on.score}</span>
                          <span className="text-xs text-slate-500">/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-emerald-400 uppercase tracking-wider shrink-0">Tesis de Solidez:</span>
                    <span>{on.thesis}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA 3: MERCADO ARGENTINO (MERVAL & BONOS) ---------------- */}
        {activeTab === "argentina" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-semibold uppercase text-slate-400">Ver:</span>
              <button
                onClick={() => setArgSubTab("merval")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  argSubTab === "merval"
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Acciones del Merval ({filteredMerval.length})
              </button>
              <button
                onClick={() => setArgSubTab("bonds")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  argSubTab === "bonds"
                    ? "bg-slate-800 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Bonos Soberanos (AL30 / GD30) ({filteredSovereign.length})
              </button>
            </div>

            {argSubTab === "merval" && (
              <div className="grid grid-cols-1 gap-4">
                {filteredMerval.map((merval, idx) => {
                  const isPositive = merval.day_change >= 0;
                  return (
                    <div
                      key={merval.ticker}
                      className="group relative rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 p-5 sm:p-6 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center font-extrabold text-base text-slate-300 shrink-0">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-white tracking-tight">{merval.ticker}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                                {merval.sector}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{merval.name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Precio en Pesos</span>
                            <span className="text-lg font-bold text-white">${merval.price_ars.toLocaleString("es-AR")} ARS</span>
                            <span className={`text-xs font-semibold block ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                              {isPositive ? `+${merval.day_change}%` : `${merval.day_change}%`}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Valuación (P/E)</span>
                            <span className="text-base font-bold text-slate-200">{merval.pe_ratio}x ganancias</span>
                            <span className="text-xs text-slate-400 block">Múltiplo comprimido</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Score Total</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl font-extrabold text-emerald-400">{merval.score}</span>
                              <span className="text-xs text-slate-500">/100</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-emerald-400 uppercase tracking-wider shrink-0">Tesis Local:</span>
                        <span>{merval.thesis}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {argSubTab === "bonds" && (
              <div className="grid grid-cols-1 gap-4">
                {filteredSovereign.map((bond, idx) => (
                  <div
                    key={bond.ticker}
                    className="group relative rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 p-5 sm:p-6 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center font-extrabold text-base text-slate-300 shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white tracking-tight">{bond.ticker}</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {bond.law}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{bond.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase font-medium">Cotización (USD)</span>
                          <span className="text-lg font-bold text-white">${bond.price_usd} USD</span>
                          <span className="text-xs text-slate-400 block">Paridad: {bond.parity}%</span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase font-medium">Rendimiento (TIR)</span>
                          <span className="text-xl font-extrabold text-emerald-400">{bond.tir_usd}% anual</span>
                          <span className="text-xs text-slate-400 block">Renta en USD</span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase font-medium">Score</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl font-extrabold text-emerald-400">{bond.score}</span>
                            <span className="text-xs text-slate-500">/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-blue-400 uppercase tracking-wider shrink-0">Tesis Soberana:</span>
                      <span>{bond.thesis}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. Simulador de Inversión Interactivo */}
      <section id="simulador" className="py-20 border-t border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 mb-4">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador de Cartera Inteligente</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">¿Cuánto capital deseas invertir hoy?</h2>
            <p className="text-slate-400 mt-2 max-w-xl mx-auto text-sm">
              Distribuimos tu dinero automáticamente entre CEDEARs líderes, Obligaciones Negociables en dólares y Merval.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-300">Monto a Invertir</label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => { setCurrency("ARS"); setInvestmentAmount(1000000); }}
                      className={`px-2 py-0.5 text-xs font-bold rounded ${currency === "ARS" ? "bg-emerald-500 text-slate-950" : "text-slate-400"}`}
                    >
                      ARS
                    </button>
                    <button
                      onClick={() => { setCurrency("USD"); setInvestmentAmount(2000); }}
                      className={`px-2 py-0.5 text-xs font-bold rounded ${currency === "USD" ? "bg-emerald-500 text-slate-950" : "text-slate-400"}`}
                    >
                      USD
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    {currency === "ARS" ? "$" : "USD"}
                  </span>
                  <input
                    type="number"
                    step={currency === "ARS" ? 100000 : 500}
                    min={currency === "ARS" ? 50000 : 100}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 font-bold text-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">Perfil de Inversor</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["conservative", "balanced", "aggressive"] as const).map((prof) => (
                    <button
                      key={prof}
                      onClick={() => setRiskProfile(prof)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        riskProfile === prof
                          ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                          : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {prof === "conservative" ? "Conservador" : prof === "balanced" ? "Balanceado" : "Agresivo"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resultado de la Simulación */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block mb-1">Obligaciones Negociables ({allocation.ons}%)</span>
                <span className="text-2xl font-extrabold text-white">
                  {currency === "ARS" ? "$" : "USD "}
                  {((investmentAmount * allocation.ons) / 100).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-emerald-400 block mt-1">YPF (YMCHD), Pampa (MGC3O)</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block mb-1">CEDEARs Wall Street ({allocation.cedears}%)</span>
                <span className="text-2xl font-extrabold text-white">
                  {currency === "ARS" ? "$" : "USD "}
                  {((investmentAmount * allocation.cedears) / 100).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-cyan-400 block mt-1">SPY, MSFT, NVDA (Con dividendos)</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block mb-1">Merval & Bonos ({allocation.merval}%)</span>
                <span className="text-2xl font-extrabold text-white">
                  {currency === "ARS" ? "$" : "USD "}
                  {((investmentAmount * allocation.merval) / 100).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-blue-400 block mt-1">Galicia (GGAL), AL30 / GD30</span>
              </div>
            </div>

            <div className="mt-4 pt-3 text-center text-xs text-slate-400">
              🎯 Retorno estimado de esta combinación: <span className="text-emerald-400 font-bold">{allocation.retornoEstimado}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Planes de Precios / Modelo Comercial */}
      <section id="precios" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white">Comienza gratis, escala cuando ganes dinero</h2>
          <p className="text-slate-400 mt-2 text-sm">Sin letra chica. Cancela en cualquier momento.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Plan Gratis */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Comunidad</span>
              <h3 className="text-2xl font-bold text-white mb-2">Plan Gratuito</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-sm text-slate-400">/siempre</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">Ideal para monitorear el mercado de EE.UU. y Argentina todos los días.</p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Top 3 CEDEARs, ONs y Merval diarios</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Precios en Pesos y Dólar CCL de referencia</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Simulador de cartera básico</span>
                </li>
              </ul>
            </div>
            <a
              href="#ranking"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-center text-sm transition-all block"
            >
              Usar Plan Gratuito
            </a>
          </div>

          {/* Plan Pro */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 flex flex-col justify-between">
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md">
              Más Popular
            </span>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">Inversor Pro</span>
              <h3 className="text-2xl font-bold text-white mb-2">Membresía Pro</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-white">$9</span>
                <span className="text-sm text-slate-400">USD / mes (o en Pesos al MEP)</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">Para quienes buscan maximizar su capital con análisis completo.</p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Top 10 completo sin límites en todas las clases</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Calendario de dividendos y cupones de ONs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Alertas tempranas por WhatsApp y Telegram</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cartera recomendada según contexto argentino</span>
                </li>
              </ul>
            </div>
            <button className="mt-8 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-center text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95">
              Suscribirse con Garantía de 14 Días
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-800/80 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="max-w-2xl mx-auto text-slate-400">
            ⚠️ <b>Aviso Legal y de Responsabilidad:</b> Donde Invierto es una plataforma de análisis algorítmico con fines
            estrictamente informativos y educativos. No constituye asesoramiento financiero regulado. Los rendimientos
            pasados no garantizan rentabilidades futuras.
          </p>
          <p>© {new Date().getFullYear()} Donde Invierto — Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
