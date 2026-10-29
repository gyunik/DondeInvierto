/**
 * Definiciones de tipos e interfaces para los activos de mercado de DondeInvierto.
 */

export interface QuantBreakdown {
  score_retorno: number;
  score_margen: number;
  score_tecnico: number;
  per_bancos: number;
  per_base: number;
  per_ajustado: number;
  factor_macro: number;
  desvio_tecnico: number;
  sma_200: number;
  tasa_actual_fed?: number;
  tasa_proyectada_fed_1a?: number;
  cambio_tasas?: number;
}

export interface BankConsensusItem {
  name: string;
  target: number;
  rating: string;
  date?: string;
}

export interface AnalystConsensus {
  target_mean: number;
  target_low: number;
  target_high: number;
  source: string;
  explanation: string;
  banks?: BankConsensusItem[];
}

export interface StockItem {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  day_change: number;
  target_price?: number;
  upside?: number;
  recommendation: string;
  pe_ratio: number;
  rsi: number;
  score: number;
  cedear_ratio: string;
  cedear_price_ars: number;
  pays_dividend: boolean;
  dividend_yield: number;
  dividend_frequency: string;
  thesis: string;
  market_cap?: string;
  analyst_consensus?: AnalystConsensus;
  sma_200?: number;
  eps_fwd?: number;
  per_mediana_5a?: number;
  // Campos del Algoritmo Cuantitativo de 3 Capas
  precio_objetivo_algoritmo?: number;
  precioObjetivoAlgoritmo?: number;
  retorno_estimado_pct?: number;
  retornoEstimadoPct?: number;
  score_total?: number;
  scoreTotal?: number;
  quant_breakdown?: QuantBreakdown;
}

export interface EtfItem {
  ticker: string;
  name: string;
  category: string;
  manager?: string;
  price: number;
  day_change: number;
  target_price?: number;
  upside?: number;
  expense_ratio: number;
  recommendation: string;
  score: number;
  cedear_ratio: string;
  cedear_price_ars: number;
  pays_dividend: boolean;
  dividend_yield: number;
  dividend_frequency: string;
  thesis: string;
  aum?: string;
  top_holdings?: string[];
  analyst_consensus?: AnalystConsensus;
}

export interface OnItem {
  ticker: string;
  name: string;
  issuer: string;
  rating: string;
  tir_usd: number;
  duration: number;
  maturity: string;
  min_investment_usd: number;
  score: number;
  law: string;
  payout_frequency: string;
  thesis: string;
  coupon_rate: number;
}

export interface MervalItem {
  ticker: string;
  name: string;
  sector: string;
  price_ars: number;
  day_change: number;
  score: number;
  rsi: number;
  recommendation: string;
  thesis: string;
}

export interface BondItem {
  ticker: string;
  name: string;
  tir_usd: number;
  parity: number;
  maturity: string;
  law: string;
  score: number;
  thesis: string;
}

export interface MacroData {
  tasa_actual_fed: number;
  tasa_proyectada_fed_1a: number;
  is_fallback: boolean;
  source: string;
  effective_date?: string;
  last_fetched?: string;
  error_message?: string;
}

export type ScoreItem = StockItem | EtfItem | OnItem | MervalItem | BondItem;
