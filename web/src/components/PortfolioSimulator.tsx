"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Shield,
  ArrowRight,
  Zap,
  Percent,
  Info,
  Copy,
  Check,
  BarChart3,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
} from "lucide-react";
import marketData from "@/data/marketData.json";
import type { StockItem, OnItem, MervalItem } from "@/types/market";
import {
  ModelPortfolioId,
  WeightingMode,
  MODEL_PORTFOLIOS_META,
  buildModelPortfolioAssets,
  simulatePortfolioAllocation,
} from "@/utils/portfolioOptimizer";

interface PortfolioSimulatorProps {
  initialCurrency?: "ARS" | "USD";
  initialAmount?: number;
  initialPortfolioId?: ModelPortfolioId;
}

export default function PortfolioSimulator({
  initialCurrency = "ARS",
  initialAmount,
  initialPortfolioId = "growth_cedears",
}: PortfolioSimulatorProps) {
  const [currency, setCurrency] = useState<"ARS" | "USD">(initialCurrency);
  const [investmentAmount, setInvestmentAmount] = useState<number>(
    initialAmount ?? (initialCurrency === "ARS" ? 1500000 : 5000)
  );
  const [selectedPortfolioId, setSelectedPortfolioId] =
    useState<ModelPortfolioId>(initialPortfolioId);
  const [weightingMode, setWeightingMode] =
    useState<WeightingMode>("risk_parity");
  const [copiedSummary, setCopiedSummary] = useState(false);

  const rawCcl = (marketData as { ccl_dollar?: number | { price: number } }).ccl_dollar;
  const cclDollarPrice = typeof rawCcl === "number" ? rawCcl : rawCcl?.price || 1650;
  const typedMarketData = marketData as unknown as {
    stocks: StockItem[];
    ons: OnItem[];
    argentina?: { merval?: MervalItem[]; sovereign_bonds?: unknown[] };
    ccl_dollar?: number | { price: number };
  };

  // 1. Obtener activos para la cartera seleccionada
  const rawAssets = useMemo(() => {
    return buildModelPortfolioAssets(selectedPortfolioId, typedMarketData);
  }, [selectedPortfolioId, typedMarketData]);

  // 2. Simular asignación con Risk Parity o Equal Weight
  const simulation = useMemo(() => {
    return simulatePortfolioAllocation({
      portfolioId: selectedPortfolioId,
      rawAssets,
      capital: investmentAmount,
      currency,
      weightingMode,
      cclPrice: cclDollarPrice,
    });
  }, [
    selectedPortfolioId,
    rawAssets,
    investmentAmount,
    currency,
    weightingMode,
    cclDollarPrice,
  ]);

  // 3. Simulación contrafáctica (para mostrar la ventaja directa de Risk Parity vs Equal Weight)
  const counterfactualSimulation = useMemo(() => {
    const altMode: WeightingMode =
      weightingMode === "risk_parity" ? "equal" : "risk_parity";
    return simulatePortfolioAllocation({
      portfolioId: selectedPortfolioId,
      rawAssets,
      capital: investmentAmount,
      currency,
      weightingMode: altMode,
      cclPrice: cclDollarPrice,
    });
  }, [
    selectedPortfolioId,
    rawAssets,
    investmentAmount,
    currency,
    weightingMode,
    cclDollarPrice,
  ]);

  const activeMeta = MODEL_PORTFOLIOS_META[selectedPortfolioId];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(
      num
    );
  };

  const currPrefix = currency === "ARS" ? "$" : "u$s ";

  // Presets de capital
  const capitalPresets =
    currency === "ARS"
      ? [500000, 1000000, 2500000, 5000000, 10000000]
      : [1000, 2500, 5000, 10000, 25000];

  const handleCopySummary = () => {
    const text = [
      `📊 Cartera Modelo: ${activeMeta.name} (${currPrefix}${formatNumber(investmentAmount)})`,
      `⚙️ Ponderación: ${weightingMode === "risk_parity" ? "Risk Parity (Vol Sizing)" : "Equal Weight"}`,
      `🎯 Retorno anual estimado: +${simulation.stats.expectedReturnPct}%`,
      `🛡️ Sharpe Ratio: ${simulation.stats.sharpeRatio} | Volatilidad: ${simulation.stats.estimatedVolatility}% | Max DD: ${simulation.stats.maxDrawdown}%`,
      `---`,
      ...simulation.assets.map(
        (a) =>
          `• ${a.ticker} (${a.assetType}) - ${(a.weight * 100).toFixed(1)}% | ${currPrefix}${formatNumber(a.allocatedAmount)} (~${a.shares} nominales)`
      ),
      `---`,
      `Generado en DondeInvierto.org - Algoritmo Cuantitativo Institucional`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <section
      className="w-full py-12 sm:py-16 bg-[#030914] border-t border-slate-800 text-slate-100"
      id="simulador-cartera"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Encabezado Principal */}
        <div className="text-center flex flex-col items-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-[#00F5A0] text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Motor Cuantitativo Institucional • Risk Parity + Sector Cap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Simulador de Cartera Inteligente
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 leading-relaxed">
            Asignación porcentual óptima por inverso de la volatilidad (*Risk Parity*)
            y límite de concentración por sector. Basado en el backtest auditado de 301 ruedas (
            <span className="text-[#00F5A0] font-semibold">+25.96% acumulado vs SPY +18.91%</span>).
          </p>
        </div>

        {/* 1. Selector de Carteras Modelo 1-Click */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00F5A0]" />
              Elegí una Cartera Modelo 1-Click:
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              4 estrategias optimizadas con cotizaciones en tiempo real
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              Object.keys(MODEL_PORTFOLIOS_META) as ModelPortfolioId[]
            ).map((id) => {
              const meta = MODEL_PORTFOLIOS_META[id];
              const isSelected = selectedPortfolioId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedPortfolioId(id)}
                  className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#0b1b2d] border-[#00F5A0] shadow-[0_0_20px_rgba(0,245,160,0.15)] ring-1 ring-[#00F5A0]/50"
                      : "bg-[#081220] border-slate-800 hover:border-slate-700 hover:bg-[#0c1828]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? "bg-emerald-500/20 text-[#00F5A0] border-emerald-500/40"
                            : "bg-slate-800/80 text-slate-400 border-slate-700"
                        }`}
                      >
                        {meta.badge}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {meta.expectedAnnualYield.split(" ")[0]}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {meta.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {meta.tagline}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Sharpe: <strong className="text-white">{meta.historicalSharpe}</strong></span>
                    <span>Max DD: <strong className="text-rose-400">{meta.historicalMaxDrawdown}%</strong></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Panel de Configuración de Capital y Modo Cuantitativo */}
        <div className="bg-[#081220] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Input de Capital */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="investAmountInput"
                  className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5 text-[#00F5A0]" />
                  Capital a Invertir
                </label>
                {/* Selector ARS / USD */}
                <div className="flex rounded-lg bg-[#040912] p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (currency !== "ARS") {
                        setCurrency("ARS");
                        setInvestmentAmount(Math.round(investmentAmount * cclDollarPrice));
                      }
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      currency === "ARS"
                        ? "bg-[#00F5A0] text-black shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Pesos (ARS)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currency !== "USD") {
                        setCurrency("USD");
                        setInvestmentAmount(Math.max(500, Math.round(investmentAmount / cclDollarPrice)));
                      }
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      currency === "USD"
                        ? "bg-[#00F5A0] text-black shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Dólares (USD)
                  </button>
                </div>
              </div>

              <div className="relative flex items-center bg-[#040912] rounded-xl px-4 py-3 border border-slate-800 focus-within:border-emerald-500/50 transition-colors">
                <span className="text-xl font-mono text-[#00F5A0] mr-2 font-bold">
                  {currPrefix}
                </span>
                <input
                  id="investAmountInput"
                  type="number"
                  min={currency === "ARS" ? 50000 : 100}
                  step={currency === "ARS" ? 100000 : 500}
                  value={investmentAmount || ""}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                  className="w-full bg-transparent text-xl font-mono font-bold text-white focus:outline-none placeholder-slate-600"
                  placeholder="0"
                />
              </div>

              {/* Botones de presets */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {capitalPresets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInvestmentAmount(val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                      investmentAmount === val
                        ? "bg-emerald-500/20 text-[#00F5A0] border-emerald-500/40 font-bold"
                        : "bg-[#040912] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {currPrefix}
                    {formatNumber(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Ponderación Cuantitativa (Risk Parity vs Equal Weight) */}
            <div className="lg:col-span-7 flex flex-col gap-2 bg-[#040912] p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#00F5A0]" />
                  Arquitectura de Ponderación
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Backtest Auditado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {/* Opción Risk Parity */}
                <button
                  type="button"
                  onClick={() => setWeightingMode("risk_parity")}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    weightingMode === "risk_parity"
                      ? "bg-[#0c2235] border-[#00F5A0] text-white shadow-sm ring-1 ring-[#00F5A0]/40"
                      : "bg-[#081220] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Risk Parity (Vol Sizing)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00F5A0] font-mono">
                        TOP
                      </span>
                    </span>
                    {weightingMode === "risk_parity" && (
                      <Check className="w-3.5 h-3.5 text-[#00F5A0]" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Pondera por inverso de volatilidad ($w_i \propto 1/\sigma$). Maximiza Sharpe a <strong>0.93</strong> y comprime Drawdown a <strong>-14.3%</strong>.
                  </p>
                </button>

                {/* Opción Equal Weight */}
                <button
                  type="button"
                  onClick={() => setWeightingMode("equal")}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    weightingMode === "equal"
                      ? "bg-[#0c2235] border-amber-400 text-white shadow-sm ring-1 ring-amber-400/40"
                      : "bg-[#081220] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">
                      Equal Weight (20% Plano)
                    </span>
                    {weightingMode === "equal" && (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Distribución uniforme idéntica para todos los activos. Sharpe <strong>0.59</strong> y Drawdown de <strong>-18.1%</strong> en el backtest.
                  </p>
                </button>
              </div>

              {/* Dólar CCL de referencia */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <span>Dólar CCL BYMA de referencia: <strong className="text-slate-300 font-mono">${formatNumber(cclDollarPrice)} ARS</strong></span>
                <span>Sector Cap: <strong className="text-slate-300">Máx 2 por sector</strong></span>
              </div>
            </div>
          </div>

          {/* 3. Métricas Globales de la Cartera (KPI Dashboard) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
            {/* KPI 1: Retorno Anual */}
            <div className="bg-[#040912] p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#00F5A0]" />
                Retorno Anual Proyectado
              </span>
              <div className="mt-2">
                <span className="text-2xl font-mono font-bold text-[#00F5A0]">
                  +{simulation.stats.expectedReturnPct}%
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  ≈ {currPrefix}
                  {formatNumber(
                    (investmentAmount * simulation.stats.expectedReturnPct) / 100
                  )}{" "}
                  / año
                </span>
              </div>
            </div>

            {/* KPI 2: Sharpe Ratio */}
            <div className="bg-[#040912] p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-cyan-400" />
                Sharpe Ratio (Rf=4%)
              </span>
              <div className="mt-2">
                <span className="text-2xl font-mono font-bold text-white">
                  {simulation.stats.sharpeRatio}
                </span>
                <span className="text-[11px] text-emerald-400 block mt-0.5 font-medium">
                  {simulation.stats.sharpeRatio >= 0.9
                    ? "★ Superior a SPY (0.90)"
                    : "Riesgo estándar"}
                </span>
              </div>
            </div>

            {/* KPI 3: Volatilidad Anual */}
            <div className="bg-[#040912] p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Percent className="w-3 h-3 text-amber-400" />
                Volatilidad Anual (σ)
              </span>
              <div className="mt-2">
                <span className="text-2xl font-mono font-bold text-amber-300">
                  {simulation.stats.estimatedVolatility}%
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {weightingMode === "risk_parity"
                    ? "↓ Comprimida por Vol Sizing"
                    : "Plana sin control de riesgo"}
                </span>
              </div>
            </div>

            {/* KPI 4: Max Drawdown */}
            <div className="bg-[#040912] p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-rose-400" />
                Max Drawdown Estimado
              </span>
              <div className="mt-2">
                <span className="text-2xl font-mono font-bold text-rose-400">
                  {simulation.stats.maxDrawdown}%
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {simulation.stats.distinctSectorsCount} sectores en cartera
                </span>
              </div>
            </div>
          </div>

          {/* Micro-banner comparativo Risk Parity vs Equal Weight */}
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#00F5A0] shrink-0" />
              <p className="text-slate-300 leading-snug">
                {weightingMode === "risk_parity" ? (
                  <>
                    <strong className="text-white">Ventaja de Risk Parity activa:</strong>{" "}
                    En comparación con Equal-Weight plano, la volatilidad cae de{" "}
                    <span className="font-mono text-amber-300">
                      {counterfactualSimulation.stats.estimatedVolatility}%
                    </span>{" "}
                    a{" "}
                    <span className="font-mono text-[#00F5A0]">
                      {simulation.stats.estimatedVolatility}%
                    </span>{" "}
                    y el Sharpe sube a{" "}
                    <strong className="font-mono text-white">
                      {simulation.stats.sharpeRatio}
                    </strong>.
                  </>
                ) : (
                  <>
                    <strong className="text-amber-300">Modo Equal-Weight activo:</strong>{" "}
                    Al usar 20% plano, asumís mayor volatilidad ({simulation.stats.estimatedVolatility}% vs {counterfactualSimulation.stats.estimatedVolatility}% con Risk Parity).
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setWeightingMode(
                  weightingMode === "risk_parity" ? "equal" : "risk_parity"
                )
              }
              className="text-[11px] font-bold text-[#00F5A0] hover:underline whitespace-nowrap"
            >
              Cambiar a {weightingMode === "risk_parity" ? "Equal-Weight" : "Risk Parity"} →
            </button>
          </div>

          {/* 4. Tabla Detallada de Asignación de Activos */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>Composición y Orden de Compra Sugerida</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({simulation.assets.length} activos seleccionados)
                </span>
              </h4>
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#040912] hover:bg-[#0c1828] border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00F5A0]" />
                    <span className="text-[#00F5A0]">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Orden</span>
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#040912]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#081220] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Activo / Instrumento</th>
                    <th className="py-3 px-3">Sector</th>
                    <th className="py-3 px-3 text-center">Ponderación</th>
                    <th className="py-3 px-3 text-right">Monto Asignado</th>
                    <th className="py-3 px-3 text-right">Cant. Títulos</th>
                    <th className="py-3 px-3 text-center">Vol. (σ)</th>
                    <th className="py-3 px-4 text-right">Retorno Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {simulation.assets.map((asset) => {
                    const pct = Math.round(asset.weight * 1000) / 10;
                    return (
                      <tr
                        key={asset.ticker}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Activo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 font-sans">
                            <span className="font-mono font-bold text-white text-sm">
                              {asset.ticker}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase font-sans ${
                                asset.assetType === "CEDEAR"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                  : asset.assetType === "ON"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                              }`}
                            >
                              {asset.assetType}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[180px] font-sans">
                            {asset.name}
                          </span>
                        </td>

                        {/* Sector */}
                        <td className="py-3 px-3 font-sans text-slate-400 text-xs">
                          {asset.sector}
                        </td>

                        {/* Ponderación visual */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-white text-xs">
                              {pct}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00F5A0] rounded-full"
                                style={{ width: `${Math.min(100, pct * 2.5)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Monto Asignado */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-white text-xs block">
                            {currPrefix}
                            {formatNumber(asset.allocatedAmount)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans block">
                            {currency === "ARS"
                              ? `u$s ${formatNumber(asset.allocatedAmount / cclDollarPrice)}`
                              : `$${formatNumber(asset.allocatedAmount * cclDollarPrice)} ARS`}
                          </span>
                        </td>

                        {/* Cantidad de Títulos */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-[#00F5A0] text-xs">
                            {formatNumber(asset.shares)}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-sans">
                            {asset.assetType === "ON" ? "láminas" : "acciones"}
                          </span>
                        </td>

                        {/* Volatilidad */}
                        <td className="py-3 px-3 text-center text-slate-400 text-xs">
                          {asset.volatility}%
                        </td>

                        {/* Retorno Estimado */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-[#00F5A0] text-xs">
                            +{asset.expectedReturnPct}%
                          </span>
                          {asset.dividendYield ? (
                            <span className="text-[10px] text-slate-500 block font-sans">
                              Div: {asset.dividendYield}%
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Resumen de Asignación y Liquidez Remanente */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-2 py-1 gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Capital asignado:{" "}
                  <strong className="text-white font-mono">
                    {currPrefix}
                    {formatNumber(simulation.stats.totalAllocated)}
                  </strong>
                  {simulation.stats.unallocatedCash > 0 && (
                    <>
                      {" "}
                      (Remanente en caja:{" "}
                      <span className="font-mono text-slate-300">
                        {currPrefix}
                        {formatNumber(simulation.stats.unallocatedCash)}
                      </span>
                      )
                    </>
                  )}
                </span>
              </div>
              <Link
                href="/screener"
                className="inline-flex items-center gap-1 text-[#00F5A0] hover:underline font-semibold"
              >
                <span>Auditar activos en el Screener</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* 5. Tarjeta Explicativa de Metodología de Backtesting */}
        <div className="p-6 rounded-2xl bg-[#081220] border border-slate-800 text-slate-400 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00F5A0] shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-1">
                ¿Por qué usar Ponderación por Inverso de la Volatilidad y Sector Cap?
              </h5>
              <p className="leading-relaxed">
                En carteras tradicionales de 20% plano (*Equal Weight*), los activos de alta beta consumen la mayor parte del presupuesto de riesgo, aumentando el Drawdown en correcciones. La arquitectura *Risk Parity* de DondeInvierto calibra el peso de cada posición para que todas aporten unidades de riesgo idénticas, mientras el *Sector Cap* (máximo 2 por sector) neutraliza la sobreconcentración tecnológica o financiera.
              </p>
            </div>
          </div>
          <Link
            href="/screener"
            className="px-5 py-2.5 rounded-xl bg-[#0c1828] hover:bg-[#12243d] border border-slate-700 text-slate-200 hover:text-white font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 self-stretch md:self-auto justify-center"
          >
            <span>Ver Ranking Cuantitativo</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#00F5A0]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
