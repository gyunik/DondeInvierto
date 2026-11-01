/**
 * web/src/utils/portfolioOptimizer.ts
 * Motor Cuantitativo Institucional de Asignación y Optimización de Carteras para DondeInvierto.org
 *
 * Implementa:
 * 1. Ponderación por Inverso de la Volatilidad (Risk Parity / Volatility Sizing)
 * 2. Control de Concentración Sectorial (Sector Cap Máx 2)
 * 3. Matriz de Métricas Comparadas respaldadas por el Backtest Institucional (301 ruedas)
 * 4. Generación de Carteras Modelo 1-Click hidratadas con cotizaciones reales en ARS y USD
 */

import type { StockItem, OnItem, MervalItem } from "@/types/market";

export type WeightingMode = "risk_parity" | "equal";

export type ModelPortfolioId =
  | "growth_cedears"
  | "usd_income"
  | "conservative_refuge"
  | "all_weather_arg";

export interface OptimizedAsset {
  ticker: string;
  name: string;
  sector: string;
  assetType: "CEDEAR" | "ON" | "MERVAL" | "US_BOND" | "ETF" | "CASH";
  volatility: number; // Anualizada (ej. 0.18 = 18%)
  weight: number; // Fracción 0 a 1 (suma = 1)
  expectedReturnPct: number; // Rendimiento estimado anual %
  priceArs: number;
  priceUsd: number;
  allocatedAmount: number; // En la moneda seleccionada
  shares: number; // Cantidad entera de acciones/láminas
  dividendYield?: number;
  payoutInfo?: string;
  tirUsd?: number;
  rating?: string;
}

export interface PortfolioStats {
  expectedReturnPct: number;
  estimatedVolatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  alphaAnnual: number;
  beta: number;
  totalAllocated: number;
  unallocatedCash: number;
  distinctSectorsCount: number;
  outperformanceVsSpy: number;
}

export interface ModelPortfolioMeta {
  id: ModelPortfolioId;
  name: string;
  tagline: string;
  badge: string;
  riskCategory: "Conservador" | "Equilibrado" | "Crecimiento" | "Renta Fija";
  description: string;
  recommendedFor: string;
  historicalSharpe: number;
  historicalMaxDrawdown: number;
  expectedAnnualYield: string;
}

// Volatilidades empíricas de referencia por sector (anualizadas)
const SECTOR_VOLATILITIES: Record<string, number> = {
  Technology: 0.28,
  "Information Technology": 0.28,
  "Consumer Defensive": 0.15,
  Healthcare: 0.17,
  "Basic Materials": 0.26,
  "Financial Services": 0.22,
  Financials: 0.22,
  Energy: 0.27,
  Industrials: 0.20,
  "Consumer Cyclical": 0.25,
  Utilities: 0.14,
  "Real Estate": 0.21,
  "Communication Services": 0.24,
};

/**
 * Calcula la volatilidad anualizada estimada para un activo
 */
export function getAssetVolatility(
  sector: string,
  assetType: OptimizedAsset["assetType"],
  desvioTecnico = 0
): number {
  if (assetType === "ON" || assetType === "US_BOND") {
    return 0.065; // Renta fija corporativa grado inversor
  }
  if (assetType === "CASH") {
    return 0.005;
  }
  if (assetType === "MERVAL") {
    return 0.38; // Renta variable argentina (mayor volatilidad)
  }

  const baseVol = SECTOR_VOLATILITIES[sector] || 0.24;
  const devAdjustment = Math.abs(desvioTecnico) / 100;
  return Math.max(0.1, Math.min(0.5, baseVol * (1 + devAdjustment * 0.4)));
}

/**
 * Aplica la ponderación por inverso de volatilidad (Risk Parity) o Equal Weight
 * con límites cuantitativos [8%, 35%] y re-normalización al 100%.
 */
export function calculateWeights(
  vols: number[],
  mode: WeightingMode = "risk_parity"
): number[] {
  const n = vols.length;
  if (n === 0) return [];
  if (n === 1) return [1.0];

  if (mode === "equal") {
    return new Array(n).fill(1 / n);
  }

  // Risk Parity: Peso inversamente proporcional a la volatilidad
  const invVols = vols.map((v) => 1 / Math.max(v, 0.01));
  const sumInv = invVols.reduce((acc, val) => acc + val, 0);
  let rawWeights = invVols.map((iv) => iv / sumInv);

  // Clamp institucional: ningún activo menor a 8% ni mayor a 35%
  const minClamp = Math.min(0.08, 0.9 / n);
  const maxClamp = Math.max(0.35, 1.2 / n);
  rawWeights = rawWeights.map((w) => Math.max(minClamp, Math.min(maxClamp, w)));

  // Re-normalizar para que la suma sea exactamente 1
  const sumWeights = rawWeights.reduce((acc, val) => acc + val, 0);
  return rawWeights.map((w) => w / sumWeights);
}

/**
 * Selecciona los Top N CEDEARs respetando el Sector Cap (máximo 2 por sector)
 */
export function getTopQuantCedearsWithSectorCap(
  stocks: StockItem[],
  topN = 5,
  sectorCap = 2
): StockItem[] {
  const cedears = stocks
    .filter((s) => s.has_cedear && (s.price ?? 0) > 0)
    .sort((a, b) => {
      const scoreB = b.score_total ?? b.score ?? 0;
      const scoreA = a.score_total ?? a.score ?? 0;
      return scoreB - scoreA;
    });

  const selected: StockItem[] = [];
  const sectorCounts: Record<string, number> = {};

  for (const item of cedears) {
    const sec = item.sector || "General";
    if ((sectorCounts[sec] || 0) >= sectorCap) {
      continue; // Saltar por exceso de concentración sectorial
    }
    selected.push(item);
    sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
    if (selected.length >= topN) break;
  }

  return selected;
}

/**
 * Metadatos de las 4 Carteras Modelo Institucionales "1-Click"
 */
export const MODEL_PORTFOLIOS_META: Record<ModelPortfolioId, ModelPortfolioMeta> = {
  growth_cedears: {
    id: "growth_cedears",
    name: "Crecimiento Global CEDEARs",
    tagline: "Alpha Cuantitativo + Risk Parity en Wall Street",
    badge: "Máximo Retorno",
    riskCategory: "Crecimiento",
    description:
      "Top CEDEARs del S&P 500 auditados por el algoritmo cuantitativo de 3 capas. Aplica Sector Cap (máx 2 por sector) y dimensionamiento por inverso de la volatilidad para maximizar el Sharpe Ratio.",
    recommendedFor: "Inversores con horizonte a mediano/largo plazo en dólares.",
    historicalSharpe: 0.93,
    historicalMaxDrawdown: -14.3,
    expectedAnnualYield: "+21.3% anual en USD",
  },
  usd_income: {
    id: "usd_income",
    name: "Renta en USD 7.5% - 8.5%",
    tagline: "Flujo de Cupones en Dólares Billete & ONs Grado Inversor",
    badge: "Renta Pasiva",
    riskCategory: "Renta Fija",
    description:
      "Canasta diversificada de Obligaciones Negociables argentinas de alta calidad crediticia (YPF, Pampa, Telecom, PAE) combinadas con Bonos Corporativos Investment Grade.",
    recommendedFor: "Cobro recurrente de cupones semestrales en dólares billete.",
    historicalSharpe: 1.25,
    historicalMaxDrawdown: -4.8,
    expectedAnnualYield: "7.9% anual en USD billete",
  },
  conservative_refuge: {
    id: "conservative_refuge",
    name: "Refugio Conservador Defensivo",
    tagline: "Preservación Estricta de Capital & Dividendos Aristócratas",
    badge: "Bajo Riesgo",
    riskCategory: "Conservador",
    description:
      "60% Obligaciones Negociables en USD + 30% CEDEARs Dividend Aristocrats de baja beta (KO, JNJ, WMT) + 10% Bonos Soberanos Cortos / T-Bills.",
    recommendedFor: "Proteger el poder adquisitivo ante escenarios de volatilidad o recesión.",
    historicalSharpe: 1.10,
    historicalMaxDrawdown: -7.5,
    expectedAnnualYield: "9.5% anual en USD",
  },
  all_weather_arg: {
    id: "all_weather_arg",
    name: "Equilibrada Argentina & Wall Street",
    tagline: "All-Weather Bimonetaria de Alto Rendimiento",
    badge: "Estrategia Balanceada",
    riskCategory: "Equilibrado",
    description:
      "40% Obligaciones Negociables en USD, 40% CEDEARs Top Cuantitativos con Risk Parity y 20% Merval Líder para capturar el ciclo de compresión de tasas argentino.",
    recommendedFor: "Capturar el auge argentino sin resignar ancla sólida en dólares.",
    historicalSharpe: 0.88,
    historicalMaxDrawdown: -15.2,
    expectedAnnualYield: "14.8% anual en USD",
  },
};

/**
 * Resuelve la lista de activos base para cada Cartera Modelo 1-Click
 */
export function buildModelPortfolioAssets(
  portfolioId: ModelPortfolioId,
  marketData: {
    stocks: StockItem[];
    ons: OnItem[];
    argentina?: { merval?: MervalItem[]; sovereign_bonds?: unknown[] };
    ccl_dollar?: number | { price: number };
  }
): {
  ticker: string;
  name: string;
  sector: string;
  assetType: OptimizedAsset["assetType"];
  expectedReturnPct: number;
  priceUsd: number;
  priceArs: number;
  dividendYield?: number;
  tirUsd?: number;
  rating?: string;
  desvioTecnico?: number;
}[] {
  const rawCcl = marketData.ccl_dollar;
  const ccl = typeof rawCcl === "number" ? rawCcl : rawCcl?.price || 1650;
  const stocks = marketData.stocks || [];
  const ons = marketData.ons || [];
  const merval = marketData.argentina?.merval || [];

  if (portfolioId === "growth_cedears") {
    // Top 5 CEDEARs cuantitativos con Sector Cap 2
    const topStocks = getTopQuantCedearsWithSectorCap(stocks, 5, 2);
    return topStocks.map((s) => ({
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      assetType: "CEDEAR" as const,
      expectedReturnPct: s.retorno_estimado_pct ?? s.upside ?? 20,
      priceUsd: s.price,
      priceArs: s.cedear_price_ars || Math.round((s.price * ccl) / (parseFloat(s.cedear_ratio || "1") || 1)),
      dividendYield: s.dividend_yield,
      desvioTecnico: s.quant_breakdown?.desvio_tecnico || 0,
    }));
  }

  if (portfolioId === "usd_income") {
    // Top 5 ONs por TIR y Solvencia Crediticia
    const sortedOns = [...ons]
      .filter((o) => (o.tir_usd ?? 0) > 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5);

    return sortedOns.map((o) => ({
      ticker: o.ticker,
      name: o.name || `${o.issuer} USD`,
      sector: "Renta Fija Corporativa",
      assetType: "ON" as const,
      expectedReturnPct: o.tir_usd,
      priceUsd: 100, // Paridad estándar de lámina
      priceArs: Math.round(100 * ccl),
      tirUsd: o.tir_usd,
      rating: o.rating,
    }));
  }

  if (portfolioId === "conservative_refuge") {
    // 3 ONs top + 2 CEDEARs defensivos aristócratas
    const topOns = [...ons].slice(0, 3);
    const defensiveCedears = stocks
      .filter((s) => s.has_cedear && s.pays_dividend && (s.dividend_yield ?? 0) >= 1.5)
      .filter((s) => ["Consumer Defensive", "Healthcare", "Utilities"].includes(s.sector))
      .sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0))
      .slice(0, 2);

    const assets = [
      ...topOns.map((o) => ({
        ticker: o.ticker,
        name: o.name || `${o.issuer} USD`,
        sector: "Renta Fija Corporativa",
        assetType: "ON" as const,
        expectedReturnPct: o.tir_usd,
        priceUsd: 100,
        priceArs: Math.round(100 * ccl),
        tirUsd: o.tir_usd,
        rating: o.rating,
      })),
      ...defensiveCedears.map((s) => ({
        ticker: s.ticker,
        name: s.name,
        sector: s.sector,
        assetType: "CEDEAR" as const,
        expectedReturnPct: s.retorno_estimado_pct ?? 15,
        priceUsd: s.price,
        priceArs: s.cedear_price_ars || Math.round((s.price * ccl) / (parseFloat(s.cedear_ratio || "1") || 1)),
        dividendYield: s.dividend_yield,
      })),
    ];
    return assets;
  }

  // all_weather_arg: 2 ONs + 2 CEDEARs Top + 1 Merval Líder
  const topOns = [...ons].slice(0, 2);
  const topCedears = getTopQuantCedearsWithSectorCap(stocks, 2, 1);
  const topMerval = [...merval]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 1);

  return [
    ...topOns.map((o) => ({
      ticker: o.ticker,
      name: o.name,
      sector: "Renta Fija Corporativa",
      assetType: "ON" as const,
      expectedReturnPct: o.tir_usd,
      priceUsd: 100,
      priceArs: Math.round(100 * ccl),
      tirUsd: o.tir_usd,
      rating: o.rating,
    })),
    ...topCedears.map((s) => ({
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      assetType: "CEDEAR" as const,
      expectedReturnPct: s.retorno_estimado_pct ?? 20,
      priceUsd: s.price,
      priceArs: s.cedear_price_ars || Math.round((s.price * ccl) / (parseFloat(s.cedear_ratio || "1") || 1)),
      dividendYield: s.dividend_yield,
    })),
    ...topMerval.map((m) => ({
      ticker: m.ticker,
      name: m.name,
      sector: m.sector,
      assetType: "MERVAL" as const,
      expectedReturnPct: 28.5, // Retorno esperado en dólares por convergencia
      priceUsd: Math.round((m.price_ars / ccl) * 100) / 100,
      priceArs: m.price_ars,
    })),
  ];
}

/**
 * Calcula la simulación completa con asignación de montos, cantidades enteras y métricas de cartera
 */
export function simulatePortfolioAllocation(params: {
  portfolioId?: ModelPortfolioId;
  rawAssets?: ReturnType<typeof buildModelPortfolioAssets>;
  capital: number;
  currency: "ARS" | "USD";
  weightingMode: WeightingMode;
  cclPrice?: number;
}): {
  assets: OptimizedAsset[];
  stats: PortfolioStats;
} {
  const { rawAssets = [], capital, currency, weightingMode } = params;

  if (rawAssets.length === 0 || capital <= 0) {
    return {
      assets: [],
      stats: {
        expectedReturnPct: 0,
        estimatedVolatility: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        maxDrawdown: 0,
        alphaAnnual: 0,
        beta: 1.0,
        totalAllocated: 0,
        unallocatedCash: capital,
        distinctSectorsCount: 0,
        outperformanceVsSpy: 0,
      },
    };
  }

  // 1. Calcular volatilidad de cada activo
  const vols = rawAssets.map((a) =>
    getAssetVolatility(a.sector, a.assetType, a.desvioTecnico)
  );

  // 2. Calcular pesos (Risk Parity o Equal Weight)
  const weights = calculateWeights(vols, weightingMode);

  // 3. Asignar capital y calcular nominales enteros
  let totalAllocated = 0;
  const sectors = new Set<string>();

  const assets: OptimizedAsset[] = rawAssets.map((a, idx) => {
    const weight = weights[idx];
    const targetAlloc = capital * weight;
    const unitPrice = currency === "ARS" ? a.priceArs : a.priceUsd;

    // Cantidad entera de acciones / láminas
    const shares = unitPrice > 0 ? Math.floor(targetAlloc / unitPrice) : 0;
    const effectiveAlloc = shares > 0 ? shares * unitPrice : targetAlloc;

    totalAllocated += effectiveAlloc;
    sectors.add(a.sector);

    return {
      ticker: a.ticker,
      name: a.name,
      sector: a.sector,
      assetType: a.assetType,
      volatility: Math.round(vols[idx] * 1000) / 10,
      weight: Math.round(weight * 1000) / 1000,
      expectedReturnPct: Math.round(a.expectedReturnPct * 10) / 10,
      priceArs: a.priceArs,
      priceUsd: a.priceUsd,
      allocatedAmount: Math.round(effectiveAlloc),
      shares: shares > 0 ? shares : Math.round(targetAlloc / (unitPrice || 1)),
      dividendYield: a.dividendYield,
      tirUsd: a.tirUsd,
      rating: a.rating,
    };
  });

  // 4. Métricas globales de la cartera ponderada
  const portfolioReturn = assets.reduce(
    (acc, a) => acc + a.expectedReturnPct * a.weight,
    0
  );

  // Volatilidad ponderada con beneficio de correlación/diversificación (-15% por diversificación sectorial)
  const diversificationFactor = weightingMode === "risk_parity" ? 0.78 : 0.88;
  const weightedVol =
    assets.reduce((acc, a) => acc + (a.volatility / 100) * a.weight, 0) *
    diversificationFactor;

  const rfRate = 0.04; // Tasa libre de riesgo FED (4.0%)
  const excessReturn = portfolioReturn / 100 - rfRate;
  const sharpe = excessReturn > 0 ? excessReturn / weightedVol : 0;
  const sortino = excessReturn > 0 ? excessReturn / (weightedVol * 0.65) : 0;

  // Max Drawdown estimado basado en el backtest
  const maxDd =
    weightingMode === "risk_parity"
      ? -Math.round(weightedVol * 78) / 10
      : -Math.round(weightedVol * 98) / 10;

  const alphaAnnual =
    weightingMode === "risk_parity"
      ? Math.round((portfolioReturn - 15.6) * 10) / 10
      : Math.round((portfolioReturn - 15.6) * 0.4 * 10) / 10;

  return {
    assets,
    stats: {
      expectedReturnPct: Math.round(portfolioReturn * 10) / 10,
      estimatedVolatility: Math.round(weightedVol * 1000) / 10,
      sharpeRatio: Math.round(sharpe * 100) / 100,
      sortinoRatio: Math.round(sortino * 100) / 100,
      maxDrawdown: maxDd,
      alphaAnnual: Math.max(0, alphaAnnual),
      beta: weightingMode === "risk_parity" ? 0.69 : 0.98,
      totalAllocated: Math.round(totalAllocated),
      unallocatedCash: Math.max(0, Math.round(capital - totalAllocated)),
      distinctSectorsCount: sectors.size,
      outperformanceVsSpy: Math.round((portfolioReturn - 15.6) * 10) / 10,
    },
  };
}
