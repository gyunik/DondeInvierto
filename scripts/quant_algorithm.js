/**
 * scripts/quant_algorithm.js
 * Algoritmo cuantitativo dinámico de 3 capas para Precio Objetivo a 1 Año
 * con candados de seguridad institucionales (Safety Collar) y descarte de activos sin cobertura.
 */

// Parámetros macroeconómicos por defecto / fallback (Tasa de la Reserva Federal)
const MACRO_DEFAULTS = {
  tasa_actual_fed: 3.88,
  tasa_proyectada_fed_1a: 3.16
};

/**
 * Valida si una acción cuenta con información financiera suficiente y confiable
 * para ser evaluada por el modelo cuantitativo.
 */
function hasValidQuantData(stock) {
  if (!stock || typeof stock !== 'object') return false;
  if (!stock.price || stock.price <= 0) return false;
  if (!stock.target_price || stock.target_price <= 0) return false;
  if (!stock.eps_fwd || stock.eps_fwd <= 0) return false;
  if (!stock.pe_ratio || stock.pe_ratio <= 0 || stock.pe_ratio > 180) return false;
  return true;
}

/**
 * Calcula el Precio Objetivo Cuantitativo a 1 Año (3 capas)
 * aplicando los candados de seguridad institucionales:
 * 1. Anclaje al múltiplo real de la propia empresa (sin supuestos abstractos).
 * 2. Banda de tolerancia máxima del +/- 25% respecto al consenso de Wall Street (Safety Collar).
 */
function calculateStockQuant(stock, macro = MACRO_DEFAULTS) {
  const precio_actual = stock.price || 100;
  const target_analistas_promedio = stock.target_price || precio_actual;
  const eps_fwd = stock.eps_fwd;

  // Si no tiene datos suficientes, devolver null para descarte
  if (!eps_fwd || eps_fwd <= 0 || !target_analistas_promedio || target_analistas_promedio <= 0) {
    return null;
  }

  // 1. Capa A (Consenso Fundamental):
  // PER implícito que le asigna el consenso de bancos a este activo
  const per_bancos = target_analistas_promedio / eps_fwd;

  // PER ancla histórica: Si tiene mediana de 5 años auditada la usa; si no, usa el PER real actual de la empresa
  // (NUNCA un PER inflado de sector que no corresponde a su modelo de negocio)
  const per_ancla = (stock.per_mediana_5a && stock.per_mediana_5a > 0)
    ? stock.per_mediana_5a
    : (stock.pe_ratio && stock.pe_ratio > 0 ? stock.pe_ratio : per_bancos);

  // Fusión de Capa A (65% ancla de la empresa + 35% expectativa de analistas)
  const per_base = (0.65 * per_ancla) + (0.35 * per_bancos);

  // 2. Capa B (Ajuste Macroeconómico de la FED):
  const tasaActual = typeof macro?.tasa_actual_fed === 'number' ? macro.tasa_actual_fed : MACRO_DEFAULTS.tasa_actual_fed;
  const tasaProy = typeof macro?.tasa_proyectada_fed_1a === 'number' ? macro.tasa_proyectada_fed_1a : MACRO_DEFAULTS.tasa_proyectada_fed_1a;
  const cambio_tasas = tasaProy - tasaActual;
  const factor_macro = 1 - (0.025 * cambio_tasas);
  const per_ajustado = per_base * factor_macro;

  // 3. Capa C (Precio Objetivo Teórico con Candado de Seguridad):
  let precio_teorico = eps_fwd * per_ajustado;

  // CANDADO DE SEGURIDAD (SAFETY COLLAR):
  // El precio objetivo algorítmico no puede despegarse en el vacío más de un +/- 25% del consenso de Wall Street
  const minTarget = target_analistas_promedio * 0.75;
  const maxTarget = target_analistas_promedio * 1.25;
  const precio_objetivo_estimado = Math.round(Math.min(maxTarget, Math.max(minTarget, precio_teorico)) * 100) / 100;

  // Retorno estimado porcentual
  const retorno_estimado_pct = Math.round(((precio_objetivo_estimado - precio_actual) / precio_actual) * 1000) / 10;

  // --- SCORE TOTAL (0 a 100) ---
  // Pilar 1: Retorno Potencial Proyectado (60%)
  // 0% o negativo = 0 pts; >= 35% = 60 pts máximos
  let score_retorno = 0;
  if (retorno_estimado_pct > 0) {
    score_retorno = Math.min(60, Math.round((retorno_estimado_pct / 35) * 60 * 10) / 10);
  }

  // Pilar 2: Margen de Seguridad Fundamental (25%)
  const per_actual = stock.pe_ratio && stock.pe_ratio > 0 ? stock.pe_ratio : per_ancla;
  let score_margen = 15;
  if (per_actual < per_ajustado) {
    const descuento = (per_ajustado - per_actual) / per_ajustado;
    score_margen = Math.min(25, Math.round((15 + (descuento / 0.35) * 10) * 10) / 10);
  } else {
    const sobreprecio = (per_actual - per_ajustado) / per_ajustado;
    score_margen = Math.max(0, Math.round((15 - (sobreprecio / 0.4) * 15) * 10) / 10);
  }

  // Pilar 3: Filtro de Timing Técnico y Tendencia SMA200 (15%)
  const sma_200 = stock.sma_200 || (precio_actual * 0.95);
  const desvio_tecnico = (precio_actual - sma_200) / sma_200;
  let score_tecnico = 10;
  if (desvio_tecnico >= 0 && desvio_tecnico <= 0.15) {
    // Tendencia alcista sana y contenida (+0% a +15% sobre SMA 200)
    score_tecnico = 15;
  } else if (desvio_tecnico > 0.15) {
    // Sobrecomprada respecto a su promedio móvil
    const exceso = (desvio_tecnico - 0.15) / 0.20;
    score_tecnico = Math.max(5, Math.round((15 - exceso * 10) * 10) / 10);
  } else {
    // Por debajo de la SMA 200: PENALIZACIÓN por tendencia bajista (en lugar de premio)
    const caidaDebajo = Math.abs(desvio_tecnico);
    if (caidaDebajo <= 0.05) {
      score_tecnico = 8; // Leve debilidad
    } else if (caidaDebajo <= 0.12) {
      score_tecnico = 4; // Tendencia bajista activa
    } else {
      score_tecnico = 0; // Desplome o quiebre técnico severo (> 12% debajo de SMA 200)
    }
  }

  // CANDADO CRÍTICO: CRASH GUARD (Protección contra cuchillos cayendo)
  // Si una acción cae fuertemente en la rueda de hoy:
  const day_change = typeof stock.day_change === 'number' ? stock.day_change : 0;
  let crash_penalty = 0;
  let is_crashing = false;

  if (day_change <= -10.0) {
    // Desplome masivo (-10% o peor, ej. balance fallido)
    crash_penalty = 50;
    is_crashing = true;
  } else if (day_change <= -4.0) {
    // Caída severa intradiaria (-4% a -10%)
    crash_penalty = 25;
    is_crashing = true;
  }

  const score_total = Math.min(100, Math.max(0, Math.round((score_retorno + score_margen + score_tecnico - crash_penalty) * 10) / 10));

  return {
    precio_objetivo_estimado,
    retorno_estimado_pct,
    score_total,
    is_crashing,
    crash_penalty,
    score_breakdown: {
      score_retorno,
      score_margen,
      score_tecnico,
      crash_penalty,
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
  hasValidQuantData,
  MACRO_DEFAULTS
};
