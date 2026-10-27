"use client";

import React, { useState } from "react";
import marketData from "@/data/marketData.json";
import {
  TrendingUp,
  Shield,
  BarChart3,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Flame,
  Award
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"stocks" | "etfs" | "bonds">("stocks");
  const [searchQuery, setSearchQuery] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState<number>(5000);
  const [riskProfile, setRiskProfile] = useState<"conservative" | "balanced" | "aggressive">("balanced");

  const { market, stocks, etfs, bonds, date, last_updated } = marketData;

  // Filtrado por buscador
  const filteredStocks = stocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEtfs = etfs.filter(
    (e) =>
      e.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBonds = bonds.filter(
    (b) =>
      b.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Perfiles de asignación del simulador
  const allocation = {
    conservative: { stocks: 20, etfs: 35, bonds: 45, label: "Conservador (Prioridad Capital)", yield: "5.1%" },
    balanced: { stocks: 40, etfs: 40, bonds: 20, label: "Balanceado (Crecimiento y Renta)", yield: "7.8%" },
    aggressive: { stocks: 60, etfs: 30, bonds: 10, label: "Agresivo (Máximo Retorno)", yield: "11.4%" },
  }[riskProfile];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                DondeInvierto<span className="text-emerald-400">.com</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Radar Diario USA
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#ranking" className="hover:text-emerald-400 transition-colors">Top 10 Diario</a>
            <a href="#simulador" className="hover:text-emerald-400 transition-colors">Simulador</a>
            <a href="#metodologia" className="hover:text-emerald-400 transition-colors">Metodología</a>
            <a href="#precios" className="hover:text-emerald-400 transition-colors">Planes</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#ranking"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25 active:scale-95"
            >
              Explorar Oportunidades
            </a>
          </div>
        </div>
      </header>

      {/* 2. Barra de Mercado en Vivo */}
      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Mercado USA | Cierre: {date}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            {Object.entries(market).map(([sym, item]) => {
              const isPositive = item.change >= 0;
              return (
                <div key={sym} className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">{item.name}:</span>
                  <span className="font-semibold text-slate-200">
                    {sym === "^TNX" ? `${item.price}%` : `$${item.price.toLocaleString("en-US")}`}
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
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-xs font-medium text-slate-300 mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Motor de Selección Cuantitativo de Wall Street</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            Invierte con datos reales,{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              no con corazonadas.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Analizamos diariamente más de 500 activos de EE.UU. combinando potencial de analistas institucionales,
            momentum de mercado y dividendos para entregarte las **10 mejores decisiones del día**.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#ranking"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Flame className="w-5 h-5 text-slate-950" />
              Ver Top 10 de Hoy
            </a>
            <a
              href="#simulador"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5 text-emerald-400" />
              Simular mi Inversión
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
            <h2 className="text-3xl font-bold tracking-tight text-white">Top 10 Activos de Estados Unidos</h2>
            <p className="text-slate-400 text-sm mt-1">
              Actualizado: <span className="text-slate-300 font-medium">{last_updated}</span>
            </p>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar ticker, empresa o sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all"
            />
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-8 max-w-2xl">
          <button
            onClick={() => setActiveTab("stocks")}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "stocks"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Acciones USA ({filteredStocks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("etfs")}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "etfs"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ETFs ({filteredEtfs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("bonds")}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "bonds"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Bonos & Deuda ({filteredBonds.length})</span>
          </button>
        </div>

        {/* LISTADO DE ACCIONES */}
        {activeTab === "stocks" && (
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
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-white tracking-tight">{stock.ticker}</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                            {stock.sector}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {stock.recommendation}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">{stock.name}</p>
                      </div>
                    </div>

                    {/* Métricas clave */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-medium">Precio Actual</span>
                        <span className="text-lg font-bold text-white">${stock.price.toFixed(2)}</span>
                        <span
                          className={`text-xs font-semibold block ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {isPositive ? `+${stock.day_change}%` : `${stock.day_change}%`}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-medium">Obj. Analistas</span>
                        <span className="text-lg font-bold text-slate-200">
                          {stock.target_price ? `$${stock.target_price.toFixed(2)}` : "N/D"}
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 block">
                          {stock.upside ? `+${stock.upside}% potencial` : ""}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-medium">Indicador RSI</span>
                        <span className="text-lg font-bold text-slate-300">{stock.rsi}</span>
                        <span className="text-xs text-slate-500 block">Neutral / Sano</span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-medium">Score Total</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-extrabold text-emerald-400">{stock.score}</span>
                          <span className="text-xs text-slate-500">/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tesis de Inversión */}
                  <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-emerald-400 uppercase tracking-wider shrink-0">Tesis Cuantitativa:</span>
                    <span>{stock.thesis}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LISTADO DE ETFS */}
        {activeTab === "etfs" && (
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
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white tracking-tight">{etf.ticker}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {etf.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">{etf.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-medium">Precio</span>
                      <span className="text-lg font-bold text-white">${etf.price.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-medium">Retorno 1 Año</span>
                      <span className="text-lg font-bold text-emerald-400">+{etf.return_1y}%</span>
                      <span className="text-xs text-slate-500 block">3M: +{etf.return_3m}%</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-medium">Costo Anual (ER)</span>
                      <span className="text-lg font-bold text-slate-300">{etf.expense_ratio}%</span>
                      <span className="text-xs text-slate-500 block">Div: {etf.dividend_yield}%</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-medium">Score Total</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-emerald-400">{etf.score}</span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-cyan-400 uppercase tracking-wider shrink-0">Tesis Cuantitativa:</span>
                  <span>{etf.thesis}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LISTADO DE BONOS */}
        {activeTab === "bonds" && (
          <div className="grid grid-cols-1 gap-4">
            {filteredBonds.map((bond, idx) => (
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
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white tracking-tight">{bond.ticker}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {bond.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">{bond.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-medium">Precio</span>
                      <span className="text-lg font-bold text-white">${bond.price.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-medium">Rendimiento (Yield)</span>
                      <span className="text-xl font-extrabold text-emerald-400">{bond.yield}% anual</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-medium">Plazo / Duración</span>
                      <span className="text-sm font-semibold text-slate-300">{bond.duration}</span>
                      <span className="text-xs text-slate-500 block">Volatilidad: {bond.volatility}%</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-medium">Score Total</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-emerald-400">{bond.score}</span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-start gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-amber-400 uppercase tracking-wider shrink-0">Tesis Cuantitativa:</span>
                  <span>{bond.thesis}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Simulador de Inversión Interactivo */}
      <section id="simulador" className="py-20 border-t border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 mb-4">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador Inteligente</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">¿Cuánto dinero deseas invertir hoy?</h2>
            <p className="text-slate-400 mt-2 max-w-xl mx-auto text-sm">
              Ingresa tu capital y nuestro modelo distribuirá la cartera automáticamente entre los mejores activos seleccionados de hoy.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">Monto a Invertir (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    step="500"
                    min="500"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 font-bold text-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">Perfil de Riesgo</label>
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
                <span className="text-xs text-slate-400 font-medium block mb-1">Acciones Top USA ({allocation.stocks}%)</span>
                <span className="text-2xl font-extrabold text-white">
                  ${((investmentAmount * allocation.stocks) / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-emerald-400 block mt-1">Recomendado: MSFT, AMZN, TXN</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block mb-1">ETFs Diversificados ({allocation.etfs}%)</span>
                <span className="text-2xl font-extrabold text-white">
                  ${((investmentAmount * allocation.etfs) / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-cyan-400 block mt-1">Recomendado: XLE, XLV, SCHD</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block mb-1">Bonos y Renta Fija ({allocation.bonds}%)</span>
                <span className="text-2xl font-extrabold text-white">
                  ${((investmentAmount * allocation.bonds) / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-amber-400 block mt-1">Recomendado: BIL, HYG (Yield ~{allocation.yield})</span>
              </div>
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
              <p className="text-sm text-slate-400 mb-6">Ideal para comenzar a monitorear el mercado de EE.UU.</p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Top 3 Acciones, ETFs y Bonos diarios</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Métricas de mercado (S&P 500, Nasdaq, VIX)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Simulador de inversión básico</span>
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
                <span className="text-sm text-slate-400">USD / mes</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">Para quienes quieren maximizar rendimientos con información completa.</p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Top 10 completo sin restricciones</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tesis cualitativa y cuantitativa detallada</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Alertas matutinas por Email y Telegram</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Seguimiento histórico de rentabilidad de la cartera</span>
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
            ⚠️ <b>Aviso Legal y de Responsabilidad:</b> DondeInvierto es una plataforma de análisis algorítmico con fines
            estrictamente informativos y educativos. No constituye asesoramiento financiero regulado. Los rendimientos
            pasados no garantizan rentabilidades futuras.
          </p>
          <p>© {new Date().getFullYear()} DondeInvierto.com — Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
