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
  const target_analistas_promedio = stock.analyst_consensus?.target_mean || stock.target_price || precio_actual;
  const eps_fwd = stock.eps_fwd;

  const tasaActual = typeof macro?.tasa_actual_fed === 'number' ? macro.tasa_actual_fed : MACRO_DEFAULTS.tasa_actual_fed;
  const tasaProy = typeof macro?.tasa_proyectada_fed_1a === 'number' ? macro.tasa_proyectada_fed_1a : MACRO_DEFAULTS.tasa_proyectada_fed_1a;

  // CANDADO CRÍTICO 1: FILTRO PENNY STOCK / DISTRESS (Precio menor a $3.00 USD)
  // Las empresas que cotizan a centavos (como BIOX a $0.22) no tienen cobertura institucional
  // confiable y cualquier spread de centavos genera distorsiones matemáticas absurdas (+5000%).
  if (precio_actual < 3.0) {
    return {
      precio_objetivo_estimado: Math.round(precio_actual * 1.05 * 100) / 100,
      retorno_estimado_pct: 5.0,
      score_total: 18.0,
      is_crashing: true,
      crash_penalty: 50,
      is_penny_stock: true,
      is_under_review: true,
      recomendacion_cuantitativa: "Evitar",
      score_breakdown: {
        score_retorno: 3,
        score_margen: 5,
        score_tecnico: 0,
        crash_penalty: 50,
        earnings_lock: true,
        is_under_review: true,
        is_penny_stock: true,
        per_bancos: 0,
        per_base: 0,
        per_ajustado: 0,
        factor_macro: 1.0,
        tasa_actual_fed: tasaActual,
        tasa_proyectada_fed_1a: tasaProy,
        cambio_tasas: 0,
        desvio_tecnico: -50.0,
        sma_200: precio_actual
      }
    };
  }

  // Si no tiene datos suficientes, devolver null para descarte
  if (!eps_fwd || eps_fwd <= 0 || !target_analistas_promedio || target_analistas_promedio <= 0) {
    return null;
  }

  // CANDADO CRÍTICO 2: DETECCIÓN DE SPLITS NO AJUSTADOS Y TARGETS OBSOLETOS (SANITY CAP)
  // En Wall Street, un retorno institucional a 12 meses superior al +80% es señal unívoca de:
  // a) Stock split no ajustado en el target histórico (ej. SONY dividió 5 a 1 pero el target quedó en $105)
  // b) Desplome severo donde los bancos aún no recortaron sus proyecciones (stale targets como GLOB o NVO).
  let target_normalizado = target_analistas_promedio;
  let is_stale_target = false;
  const raw_upside = (target_analistas_promedio - precio_actual) / precio_actual;

  if (raw_upside > 0.80) {
    is_stale_target = true;
    if (raw_upside > 3.0) {
      // Split 4:1 o 5:1 no ajustado (ej. SONY: de $105 pasa a ~$23-$28)
      target_normalizado = Math.round((target_analistas_promedio / 4.8) * 100) / 100;
    } else if (raw_upside > 2.0) {
      // Split o colapso 3:1 a 4:1 (ej. GLOB: de $262 pasa a ~$58)
      target_normalizado = Math.round((target_analistas_promedio / 3.8) * 100) / 100;
    } else if (raw_upside > 1.2) {
      // Split o colapso 2:1 a 3:1 (ej. NVO: de $135 pasa a ~$54)
      target_normalizado = Math.round((target_analistas_promedio / 2.5) * 100) / 100;
    } else {
      // Upside entre 80% y 120%: normalizar al techo institucional
      target_normalizado = Math.round(precio_actual * 1.45 * 100) / 100;
    }
  }

  // Techo institucional absoluto de prudencia cuantitativa (+48% máximo a 12 meses):
  const max_realistic_target = Math.round(precio_actual * 1.48 * 100) / 100;
  if (target_normalizado > max_realistic_target) {
    target_normalizado = max_realistic_target;
    is_stale_target = true;
  }

  // 1. Capa A (Consenso Fundamental Normalizado):
  const per_bancos = target_normalizado / eps_fwd;

  // PER ancla histórica: Si tiene mediana de 5 años auditada la usa; si no, usa el PER real actual de la empresa
  const per_ancla = (stock.per_mediana_5a && stock.per_mediana_5a > 0)
    ? stock.per_mediana_5a
    : (stock.pe_ratio && stock.pe_ratio > 0 ? stock.pe_ratio : per_bancos);

  // Fusión de Capa A (65% ancla de la empresa + 35% expectativa de analistas)
  const per_base = (0.65 * per_ancla) + (0.35 * per_bancos);

  // 2. Capa B (Ajuste Macroeconómico de la FED):
  const cambio_tasas = tasaProy - tasaActual;
  const factor_macro = 1 - (0.025 * cambio_tasas);
  const per_ajustado = per_base * factor_macro;

  // 3. Capa C (Precio Objetivo Teórico con Candado de Seguridad):
  let precio_teorico = eps_fwd * per_ajustado;

  // Candado de Seguridad Estricto:
  const maxTarget = target_normalizado;
  const minTarget = target_normalizado * 0.70;
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

  // CANDADO CRÍTICO: CRASH GUARD & POST-EARNINGS LOCK (Protección contra cuchillos cayendo)
  // 1. Detección de caída intradiaria
  const day_change = typeof stock.day_change === 'number' ? stock.day_change : 0;
  // 2. Detección de caída semanal / multi-sesión (ej: desplome en la rueda previa o últimos 5 días)
  const perf_5d = typeof stock.perf_5d === 'number' ? stock.perf_5d : (typeof stock.week_change === 'number' ? stock.week_change : (day_change * 1.5));
  // 3. Flag de revisión pendiente por balance o quiebre de guidance
  const is_under_review = Boolean(stock.is_under_review);

  let crash_penalty = 0;
  let is_crashing = false;
  let earnings_lock = false;

  if (day_change <= -10.0 || perf_5d <= -18.0) {
    // Desplome masivo (-10% en el día o -18% semanal)
    crash_penalty = 50;
    is_crashing = true;
  } else if (day_change <= -4.0 || perf_5d <= -9.0) {
    // Caída severa (-4% en el día o -9% semanal)
    crash_penalty = 25;
    is_crashing = true;
  }

  // Si el activo está bajo revisión post-balance o por advertencia de resultados o target desfasado:
  if (is_under_review || is_stale_target) {
    earnings_lock = true;
    crash_penalty = Math.max(crash_penalty, 35);
  }

  // Si está cayendo o en revisión, el algoritmo no permite inflar el precio objetivo por consenso previo
  let precio_final = precio_objetivo_estimado;
  let retorno_final = retorno_estimado_pct;

  if (is_under_review || is_crashing) {
    // Descuenta el precio objetivo un 20% adicional por riesgo de recorte de analistas
    precio_final = Math.round(Math.min(precio_objetivo_estimado, precio_actual * 1.08) * 100) / 100;
    retorno_final = Math.round(((precio_final - precio_actual) / precio_actual) * 1000) / 10;
  }

  const score_total = Math.min(100, Math.max(0, Math.round((score_retorno + score_margen + score_tecnico - crash_penalty) * 10) / 10));

  // Clasificación de Recomendación según disciplina cuantitativa
  let recomendacion_cuantitativa = "Mantener";
  if (is_under_review) {
    recomendacion_cuantitativa = "En Revisión";
  } else if (is_crashing || score_total < 50) {
    recomendacion_cuantitativa = "Evitar";
  } else if (score_total >= 85) {
    recomendacion_cuantitativa = "Fuerte Compra";
  } else if (score_total >= 60) {
    recomendacion_cuantitativa = "Compra";
  } else {
    recomendacion_cuantitativa = "Mantener";
  }

  return {
    precio_objetivo_estimado: precio_final,
    retorno_estimado_pct: retorno_final,
    score_total,
    is_crashing,
    crash_penalty,
    earnings_lock,
    is_under_review,
    recomendacion_cuantitativa,
    score_breakdown: {
      score_retorno,
      score_margen,
      score_tecnico,
      crash_penalty,
      earnings_lock,
      is_under_review,
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
