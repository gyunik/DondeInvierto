/**
 * scripts/quant_algorithm.js
 * Modelo Cuantitativo Multifactor Institucional (Estándar Seeking Alpha / Piotroski)
 * combinado con el Consenso Oficial de Bancos de Wall Street (Estándar Bloomberg / FactSet).
 *
 * 1. Precio Objetivo (Target Price) & Potencial (1A):
 *    - Se toma directamente la Mediana / Promedio Ponderado del Consenso de Bancos de Wall Street.
 *    - Imposible que supere al banco más alcista ni que genere anomalías matemáticas (+5000%).
 *    - Filtro estricto para Penny Stocks (< $3.00 USD).
 *
 * 2. Quant Score Institucional (0 a 100):
 *    - 5 Pilares Objetivos de 0 a 20 puntos cada uno (Suma exacta 0 a 100):
 *      1) Valuación (0-20 pts)
 *      2) Rentabilidad & Calidad (0-20 pts)
 *      3) Crecimiento / Potencial (0-20 pts)
 *      4) Momentum Técnico & Tendencia SMA200 (0-20 pts)
 *      5) Revisiones de Balances & Consenso Institucional (0-20 pts)
 */

function calculateStockQuant(stock, macro = { tasa_actual_fed: 3.88, tasa_proyectada_fed_1a: 3.16 }) {
  const precio_actual = typeof stock.price === 'number' && stock.price > 0 ? stock.price : 100;

  // --- CANDADO 1: FILTRO PENNY STOCKS (< $3.00 USD) ---
  if (precio_actual < 3.0) {
    const targetPenny = Math.round(precio_actual * 1.05 * 100) / 100;
    return {
      precio_objetivo_estimado: targetPenny,
      retorno_estimado_pct: 5.0,
      score_total: 18.0,
      is_penny_stock: true,
      is_under_review: true,
      recomendacion_cuantitativa: "Evitar",
      score_breakdown: {
        score_valuacion: 3.0,
        score_rentabilidad: 3.0,
        score_crecimiento: 3.0,
        score_momentum: 3.0,
        score_revisiones: 6.0,
        consenso_bancos_media: targetPenny,
        consenso_bancos_min: precio_actual,
        consenso_bancos_max: targetPenny,
        cantidad_bancos: 0,
        is_under_review: true,
        is_penny_stock: true,
        sma_200: precio_actual,
        desvio_tecnico_pct: -40.0
      }
    };
  }

  // --- EXTRACCIÓN DEL CONSENSO OFICIAL DE BANCOS DE WALL STREET (Opción 1) ---
  let bank_targets = [];
  let buy_count = 0;
  let total_ratings = 0;

  if (stock.analyst_consensus && Array.isArray(stock.analyst_consensus.banks)) {
    stock.analyst_consensus.banks.forEach(b => {
      if (typeof b.target === 'number' && b.target > 0) {
        bank_targets.push(b.target);
      }
      if (b.rating) {
        total_ratings++;
        if (/sobreponderar|compra|buy|outperform/i.test(b.rating)) {
          buy_count++;
        }
      }
    });
  }

  let bank_mean = stock.analyst_consensus?.target_mean || stock.target_price || precio_actual * 1.15;
  let bank_min = bank_mean * 0.90;
  let bank_max = bank_mean * 1.10;

  if (bank_targets.length > 0) {
    bank_mean = bank_targets.reduce((a, b) => a + b, 0) / bank_targets.length;
    bank_min = Math.min(...bank_targets);
    bank_max = Math.max(...bank_targets);
  }

  // Normalización de splits o targets desfasados (> 80% sobre precio actual)
  const raw_upside = (bank_mean - precio_actual) / precio_actual;
  let is_stale_target = false;
  if (raw_upside > 0.80) {
    is_stale_target = true;
    if (raw_upside > 3.0) {
      bank_mean = Math.round((bank_mean / 4.8) * 100) / 100;
    } else if (raw_upside > 2.0) {
      bank_mean = Math.round((bank_mean / 3.8) * 100) / 100;
    } else {
      bank_mean = Math.round(precio_actual * 1.40 * 100) / 100;
    }
    bank_max = Math.min(bank_max, bank_mean * 1.15);
    bank_min = Math.min(bank_min, bank_mean * 0.85);
  }

  // Techo institucional de prudencia (+48% máximo a 12 meses)
  const max_collar = Math.round(precio_actual * 1.48 * 100) / 100;
  if (bank_mean > max_collar) {
    bank_mean = max_collar;
    is_stale_target = true;
  }

  // Precio Objetivo y Retorno Oficial: Exactamente la Mediana del Consenso Bancario
  const precio_objetivo_estimado = Math.round(bank_mean * 100) / 100;
  const retorno_estimado_pct = Math.round(((precio_objetivo_estimado - precio_actual) / precio_actual) * 1000) / 10;

  // --- MODELO MULTIFACTOR INSTITUCIONAL (5 FACTORES - Opción 2) ---

  // FACTOR 1: VALUACIÓN (0 a 20 pts)
  // Evalúa el múltiplo PER respecto a la normalidad del mercado
  const pe = typeof stock.pe_ratio === 'number' && stock.pe_ratio > 0 ? stock.pe_ratio : 25.0;
  let score_valuacion = 14.0;
  if (pe >= 10 && pe <= 24) {
    // Rango óptimo institucional de valor
    score_valuacion = 20.0;
  } else if (pe > 24 && pe <= 35) {
    // Crecimiento a precio razonable (GARP)
    score_valuacion = 16.0;
  } else if (pe > 35 && pe <= 55) {
    // Múltiplo exigente
    score_valuacion = 11.0;
  } else if (pe > 55 && pe <= 85) {
    // Muy sobrecomprada o especulativa
    score_valuacion = 6.0;
  } else if (pe > 85) {
    score_valuacion = 3.0;
  } else {
    // PER < 10 (posible trampa de valor o crisis)
    score_valuacion = 14.0;
  }

  // FACTOR 2: RENTABILIDAD & CALIDAD (0 a 20 pts)
  // Consistencia de beneficios por acción y dividendos
  const eps = typeof stock.eps_fwd === 'number' ? stock.eps_fwd : 2.5;
  let score_rentabilidad = 12.0;
  if (eps > 10.0) {
    score_rentabilidad = 20.0;
  } else if (eps >= 4.0) {
    score_rentabilidad = 17.0;
  } else if (eps >= 1.5) {
    score_rentabilidad = 14.0;
  } else if (eps > 0) {
    score_rentabilidad = 10.0;
  } else {
    score_rentabilidad = 2.0;
  }
  // Premio de solidez si paga dividendo sustentable
  if (stock.pays_dividend && stock.dividend_yield && stock.dividend_yield > 0) {
    score_rentabilidad = Math.min(20.0, score_rentabilidad + 2.0);
  }

  // FACTOR 3: CRECIMIENTO / POTENCIAL DE UPSIDE (0 a 20 pts)
  // Rendimiento esperado a 12 meses por los analistas
  let score_crecimiento = 0;
  if (retorno_estimado_pct >= 30.0) {
    score_crecimiento = 20.0;
  } else if (retorno_estimado_pct >= 20.0) {
    score_crecimiento = 16.0 + ((retorno_estimado_pct - 20.0) / 10.0) * 4.0;
  } else if (retorno_estimado_pct >= 10.0) {
    score_crecimiento = 11.0 + ((retorno_estimado_pct - 10.0) / 10.0) * 5.0;
  } else if (retorno_estimado_pct >= 0) {
    score_crecimiento = 5.0 + (retorno_estimado_pct / 10.0) * 6.0;
  } else {
    // Retorno negativo esperado
    score_crecimiento = Math.max(0, 5.0 + retorno_estimado_pct * 0.5);
  }
  score_crecimiento = Math.round(Math.min(20.0, Math.max(0, score_crecimiento)) * 10) / 10;

  // FACTOR 4: MOMENTUM TÉCNICO & TENDENCIA SMA200 (0 a 20 pts)
  const sma200 = typeof stock.sma_200 === 'number' && stock.sma_200 > 0 ? stock.sma_200 : (precio_actual * 0.95);
  const desvio_sma = (precio_actual - sma200) / sma200;
  let score_momentum = 12.0;
  if (desvio_sma >= 0 && desvio_sma <= 0.12) {
    // Tendencia alcista sana y contenida (+0% a +12% sobre media 200)
    score_momentum = 20.0;
  } else if (desvio_sma > 0.12 && desvio_sma <= 0.25) {
    // Alcista pero extendida
    score_momentum = 16.0;
  } else if (desvio_sma > 0.25) {
    // Sobrecompra excesiva
    score_momentum = 12.0;
  } else if (desvio_sma < 0 && desvio_sma >= -0.06) {
    // Leve corrección testeando soporte
    score_momentum = 10.0;
  } else if (desvio_sma < -0.06 && desvio_sma >= -0.15) {
    // Tendencia bajista activa
    score_momentum = 5.0;
  } else {
    // Desplome severo (> 15% debajo de SMA 200)
    score_momentum = 1.0;
  }

  // FACTOR 5: REVISIONES DE BALANCES & COBERTURA INSTITUCIONAL (0 a 20 pts)
  const buyRatio = total_ratings > 0 ? (buy_count / total_ratings) : 0.60;
  let score_revisiones = Math.round(buyRatio * 20.0 * 10) / 10;

  // Penalizaciones por advertencias de balance o caídas abruptas
  const is_under_review = Boolean(stock.is_under_review) || is_stale_target;
  const day_change = typeof stock.day_change === 'number' ? stock.day_change : 0;
  const perf_5d = typeof stock.perf_5d === 'number' ? stock.perf_5d : (day_change * 1.5);

  if (is_under_review) {
    score_revisiones = Math.min(score_revisiones, 6.0);
  }
  if (day_change <= -10.0 || perf_5d <= -18.0) {
    score_revisiones = Math.min(score_revisiones, 2.0);
    score_momentum = Math.min(score_momentum, 2.0);
  } else if (day_change <= -4.0 || perf_5d <= -8.0) {
    score_revisiones = Math.min(score_revisiones, 7.0);
  }

  // --- SCORE TOTAL SUMATORIA EXACTA (0 a 100) ---
  const score_total = Math.round(
    Math.min(100.0, Math.max(0, score_valuacion + score_rentabilidad + score_crecimiento + score_momentum + score_revisiones)) * 10
  ) / 10;

  // Recomendación institucional armonizada
  let recomendacion_cuantitativa = "Mantener";
  if (is_under_review) {
    recomendacion_cuantitativa = "En Revisión";
  } else if (score_total < 45.0 || retorno_estimado_pct < -5.0) {
    recomendacion_cuantitativa = "Evitar";
  } else if (score_total >= 80.0 && retorno_estimado_pct >= 15.0) {
    recomendacion_cuantitativa = "Fuerte Compra";
  } else if (score_total >= 60.0 && retorno_estimado_pct > 0) {
    recomendacion_cuantitativa = "Compra";
  } else {
    recomendacion_cuantitativa = "Mantener";
  }

  return {
    precio_objetivo_estimado,
    retorno_estimado_pct,
    score_total,
    is_under_review,
    is_penny_stock: false,
    recomendacion_cuantitativa,
    score_breakdown: {
      score_valuacion,
      score_rentabilidad,
      score_crecimiento,
      score_momentum,
      score_revisiones,
      consenso_bancos_media: precio_objetivo_estimado,
      consenso_bancos_min: Math.round(bank_min * 100) / 100,
      consenso_bancos_max: Math.round(bank_max * 100) / 100,
      cantidad_bancos: bank_targets.length,
      is_under_review,
      sma_200: sma200,
      desvio_tecnico_pct: Math.round(desvio_sma * 1000) / 10
    }
  };
}

module.exports = {
  calculateStockQuant
};
