/**
 * scripts/quant_algorithm.js
 * Algoritmo cuantitativo dinámico de 3 capas para Precio Objetivo a 1 Año
 * y reestructuración del Score Total (0 a 100).
 */

const SECTOR_PER_FALLBACK = {
  'Comercio Electrónico & Fintech': 36.0,
  'Consumo & Cloud (AWS)': 35.0,
  'Semiconductores': 32.0,
  'Movilidad & Logística': 30.0,
  'Vehículos Eléctricos & Robótica': 45.0,
  'Inteligencia Artificial & Big Data': 45.0,
  'Software Empresarial & Cloud': 34.0,
  'Software de Gestión & IA': 38.0,
  'Ciberseguridad': 40.0,
  'Streaming & Entretenimiento': 30.0,
  'Software, Cloud & IA': 32.0,
  'Aceleradores IA & GPUs': 40.0,
  'Ecosistema de Consumo & Servicios': 28.0,
  'Búsqueda, Cloud & IA': 25.0,
  'Redes Sociales & IA': 25.0,
  'Consumo Defensivo & Dividendos': 24.0,
  'Banca & Servicios Financieros': 14.0,
  'Farmacéutica & GLP-1': 35.0,
  'Microchips Analógicos': 28.0,
  'Salud & Dispositivos Médicos': 22.0,
  'Default': 25.0
};

// Parámetros macroeconómicos por defecto / fallback (Tasa de la Reserva Federal)
const MACRO_DEFAULTS = {
  tasa_actual_fed: 5.0,        // Tasa actual fallback especificada
  tasa_proyectada_fed_1a: 4.25 // Tasa proyectada 1A fallback especificada
};

/**
 * Calcula el Precio Objetivo Cuantitativo a 1 Año (3 capas)
 * y el Score Total reestructurado para una acción.
 * @param {Object} stock - Datos de la acción
 * @param {Object} macro - Tasas macroeconómicas (obtenidas dinámicamente vía macro_service o fallback)
 */
function calculateStockQuant(stock, macro = MACRO_DEFAULTS) {
  const precio_actual = stock.price || 100;
  const target_analistas_promedio = stock.target_price || (precio_actual * 1.15);

  // Sector fallback
  const fallbackPer = SECTOR_PER_FALLBACK[stock.sector] || SECTOR_PER_FALLBACK.Default;

  // EPS Forward
  let eps_fwd = stock.eps_fwd;
  if (!eps_fwd || eps_fwd <= 0) {
    const currentPe = stock.pe_ratio && stock.pe_ratio > 0 ? stock.pe_ratio : fallbackPer;
    eps_fwd = precio_actual / currentPe;
  }

  // PER Mediana 5 Años
  const per_mediana_5a = (stock.per_mediana_5a && stock.per_mediana_5a > 0)
    ? stock.per_mediana_5a
    : fallbackPer;

  // 1. Capa A (Consenso Fundamental)
  const per_bancos = target_analistas_promedio / eps_fwd;
  const per_base = (0.65 * per_mediana_5a) + (0.35 * per_bancos);

  // 2. Capa B (Ajuste Macroeconómico - Conectado con fetch dinámico)
  const tasaActual = typeof macro?.tasa_actual_fed === 'number' ? macro.tasa_actual_fed : MACRO_DEFAULTS.tasa_actual_fed;
  const tasaProy = typeof macro?.tasa_proyectada_fed_1a === 'number' ? macro.tasa_proyectada_fed_1a : MACRO_DEFAULTS.tasa_proyectada_fed_1a;
  const cambio_tasas = tasaProy - tasaActual;
  const factor_macro = 1 - (0.025 * cambio_tasas);
  const per_ajustado = per_base * factor_macro;

  // 3. Capa C (Precio Objetivo Teórico)
  const precio_objetivo_estimado = Math.round(eps_fwd * per_ajustado * 100) / 100;
  const retorno_estimado_pct = Math.round(((precio_objetivo_estimado - precio_actual) / precio_actual) * 1000) / 10;

  // --- REESTRUCTURACIÓN DEL SCORE TOTAL (0 a 100) ---
  
  // Pilar 1: Retorno Potencial Proyectado (60%)
  // 0% o negativo = 0 pts; >= 40% = 60 pts
  let score_retorno = 0;
  if (retorno_estimado_pct > 0) {
    score_retorno = Math.min(60, Math.round((retorno_estimado_pct / 40) * 60 * 10) / 10);
  }

  // Pilar 2: Margen de Seguridad Fundamental (25%)
  // Relación entre PER Actual y PER Ajustado
  const per_actual = stock.pe_ratio && stock.pe_ratio > 0 ? stock.pe_ratio : fallbackPer;
  let score_margen = 15; // Valor neutro / justo
  if (per_actual < per_ajustado) {
    // Si PER Actual < PER Ajustado, sumar puntos proporcionalmente hasta 25
    const descuento = (per_ajustado - per_actual) / per_ajustado;
    score_margen = Math.min(25, Math.round((15 + (descuento / 0.4) * 10) * 10) / 10);
  } else {
    // Si PER Actual > PER Ajustado, penalizar hacia 0
    const sobreprecio = (per_actual - per_ajustado) / per_ajustado;
    score_margen = Math.max(0, Math.round((15 - (sobreprecio / 0.5) * 15) * 10) / 10);
  }

  // Pilar 3: Filtro de Timing Técnico (15%) - Desvío SMA200
  const sma_200 = stock.sma_200 || (precio_actual * 0.95);
  const desvio_tecnico = (precio_actual - sma_200) / sma_200;
  let score_tecnico = 10;
  if (desvio_tecnico <= 0) {
    // Zona de descuento / soporte -> 15 puntos completos
    score_tecnico = 15;
  } else if (desvio_tecnico <= 0.15) {
    score_tecnico = Math.round((15 - (desvio_tecnico / 0.15) * 5) * 10) / 10;
  } else {
    // Sobrecompra > 15%: penalizar restando hasta 10 puntos del score total
    const exceso = (desvio_tecnico - 0.15) / 0.15;
    score_tecnico = Math.max(0, Math.round((10 - exceso * 10) * 10) / 10);
  }

  const score_total = Math.min(100, Math.max(0, Math.round((score_retorno + score_margen + score_tecnico) * 10) / 10));

  return {
    precio_objetivo_estimado,
    retorno_estimado_pct,
    score_total,
    score_breakdown: {
      score_retorno,
      score_margen,
      score_tecnico,
      per_bancos: Math.round(per_bancos * 100) / 100,
      per_base: Math.round(per_base * 100) / 100,
      per_ajustado: Math.round(per_ajustado * 100) / 100,
      factor_macro: Math.round(factor_macro * 1000) / 1000,
      tasa_actual_fed: tasaActual,
      tasa_proyectada_fed_1a: tasaProy,
      cambio_tasas: Math.round(cambio_tasas * 100) / 100,
      desvio_tecnico: Math.round(desvio_tecnico * 1000) / 10,
      sma_200
    }
  };
}

module.exports = {
  calculateStockQuant,
  SECTOR_PER_FALLBACK,
  MACRO_DEFAULTS
};
