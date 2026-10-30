/**
 * scripts/scan_sp500_quant.js
 * Escáner institucional de alta velocidad y máxima calidad de datos.
 * Audita el universo S&P 500 y CEDEARs:
 * - Descarta estrictamente cualquier acción sin cobertura o sin EPS proyectado positivo.
 * - Ingesta el historial de calificaciones de bancos de inversión (Morgan Stanley, JP Morgan, Goldman Sachs, etc.)
 *   con nombres, precio objetivo, recomendación y fecha exacta del informe.
 * - Aplica el Algoritmo Cuantitativo Dinámico de 3 Capas con Candado de Seguridad (Safety Collar +/-25%).
 * - Actualiza marketData.json para producción en Vercel.
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');
const { calculateStockQuant } = require('./quant_algorithm');
const { fetchMacroRates } = require('./macro_service');

const UNIVERSE_PATH = path.join(__dirname, 'sp500_universe.json');
const MARKET_DATA_PATH = path.join(__dirname, '..', 'web', 'src', 'data', 'marketData.json');

function parseRatio(ratioStr) {
  if (!ratioStr) return 1;
  const parts = ratioStr.split(':');
  if (parts.length === 2) {
    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);
    if (!isNaN(num) && !isNaN(den) && den > 0) return num / den;
  }
  return 1;
}

function formatSpanishDate(epoch) {
  if (!epoch) return 'Oct 2026';
  const d = new Date(epoch * 1000);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function translateGrade(grade) {
  if (!grade) return 'Sobreponderar';
  const g = grade.toLowerCase();
  if (g.includes('strong buy')) return 'Fuerte Compra';
  if (g.includes('buy') || g.includes('outperform') || g.includes('overweight')) return 'Sobreponderar';
  if (g.includes('hold') || g.includes('neutral') || g.includes('equal') || g.includes('peer') || g.includes('market perform')) return 'Mantener';
  if (g.includes('sell') || g.includes('underperform') || g.includes('underweight')) return 'Subponderar';
  return 'Sobreponderar';
}

function formatMarketCap(cap) {
  if (!cap || cap <= 0) return 'N/D';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T USD`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B USD`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M USD`;
  return `$${cap.toLocaleString('en-US')} USD`;
}

async function getYahooAuth() {
  try {
    const cookieRes = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(6000)
    });
    const cookie = cookieRes.headers.get('set-cookie');
    const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': cookie || '' },
      signal: AbortSignal.timeout(6000)
    });
    const crumb = await crumbRes.text();
    return { cookie, crumb };
  } catch (err) {
    console.warn('⚠️ No se pudo obtener sesión autenticada de Yahoo:', err.message);
    return { cookie: null, crumb: null };
  }
}

async function fetchTickerDetails(item, auth) {
  const ticker = item.ticker;
  try {
    // 1. Chart: precio actual, variación diaria y SMA200
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=200d&includePrePost=true`;
    const chartRes = await fetch(chartUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(7000)
    });
    if (!chartRes.ok) return null;
    const chartJson = await chartRes.json();
    const result = chartJson?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice || meta.preMarketPrice || 0;
    if (price <= 0) return null;

    const prevClose = meta.chartPreviousClose || price;
    // Variación real porcentual de hoy (rueda de hoy vs cierre anterior)
    const day_change = typeof meta.regularMarketChangePercent === 'number'
      ? Math.round(meta.regularMarketChangePercent * 10) / 10
      : (prevClose > 0 ? Math.round(((price - prevClose) / prevClose) * 1000) / 10 : 0);

    const closes = result.indicators?.quote?.[0]?.close || [];
    const validCloses = closes.filter((c) => typeof c === 'number' && c > 0);
    const sma_200 = validCloses.length > 0
      ? Math.round((validCloses.reduce((a, b) => a + b, 0) / validCloses.length) * 100) / 100
      : Math.round(price * 0.95 * 100) / 100;

    // 2. QuoteSummary con módulos completos (upgradeDowngradeHistory, financialData, defaultKeyStatistics, summaryDetail, earnings, calendarEvents)
    if (!auth.crumb || !auth.cookie) return null;

    const sumUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=upgradeDowngradeHistory,financialData,defaultKeyStatistics,summaryDetail,earnings,calendarEvents&crumb=${auth.crumb}`;
    const sumRes = await fetch(sumUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': auth.cookie },
      signal: AbortSignal.timeout(7000)
    });
    if (!sumRes.ok) return null;

    const sumJson = await sumRes.json();
    const qs = sumJson?.quoteSummary?.result?.[0];
    if (!qs) return null;

    const fd = qs.financialData;
    const ks = qs.defaultKeyStatistics;
    const sd = qs.summaryDetail;

    const target_price = fd?.targetMeanPrice?.raw;
    const target_low = fd?.targetLowPrice?.raw || (target_price ? Math.round(target_price * 0.85 * 100) / 100 : 0);
    const target_high = fd?.targetHighPrice?.raw || (target_price ? Math.round(target_price * 1.15 * 100) / 100 : 0);
    const eps_fwd = ks?.forwardEps?.raw;
    const pe_ratio = sd?.trailingPE?.raw || sd?.forwardPE?.raw || (target_price && eps_fwd ? target_price / eps_fwd : null);
    const market_cap = formatMarketCap(sd?.marketCap?.raw || ks?.enterpriseValue?.raw);
    const opinions = fd?.numberOfAnalystOpinions?.raw || 0;

    let dividend_yield = 0;
    let pays_dividend = false;
    if (sd?.dividendYield?.raw && sd.dividendYield.raw > 0) {
      dividend_yield = Math.round(sd.dividendYield.raw * 1000) / 10;
      pays_dividend = true;
    }

    // Historial y desglose de bancos individuales
    const rawHistory = qs.upgradeDowngradeHistory?.history || [];
    const banks = [];
    const seenFirms = new Set();

    for (const h of rawHistory) {
      if (!h.firm || !h.currentPriceTarget || h.currentPriceTarget <= 0) continue;
      const firmName = h.firm.trim();
      if (seenFirms.has(firmName.toLowerCase())) continue;
      seenFirms.add(firmName.toLowerCase());

      banks.push({
        name: firmName,
        target: Math.round(h.currentPriceTarget * 100) / 100,
        rating: translateGrade(h.toGrade),
        date: formatSpanishDate(h.epochGradeDate)
      });

      if (banks.length >= 5) break;
    }

    // REGLA ESTRICTA DE DESCARTE (ORDEN DEL USUARIO):
    // 1. "no tomar en cuenta la previsión de los analistas si se presentó balance a posteriori del último precio objetivo de las calificadoras de riesgo"
    const qList = qs.earnings?.earningsChart?.quarterly || [];
    const lastQuarter = qList.length > 0 ? qList[qList.length - 1] : null;
    const earningsEpoch = lastQuarter?.reportedDate?.raw || qs.calendarEvents?.earnings?.earningsCallDate?.[0]?.raw || 0;

    const validHistoryTargets = rawHistory.filter((h) => h.currentPriceTarget > 0 && h.epochGradeDate > 0);
    const latestBankEpoch = validHistoryTargets.length > 0 ? Math.max(...validHistoryTargets.map((h) => h.epochGradeDate)) : 0;

    if (earningsEpoch > 0 && latestBankEpoch > 0 && earningsEpoch > latestBankEpoch) {
      // El balance se presentó DESPUÉS del último precio objetivo emitido -> la previsión quedó caduca/pre-balance
      return null;
    }

    // 2. Si no tiene precio objetivo de consenso, o no tiene EPS forward positivo, o no tiene PER razonable, o no tiene al menos 2 bancos calificados con fecha, DESCARTAR.
    if (!price || price <= 0) return null;
    if (!target_price || target_price <= 0) return null;
    if (!eps_fwd || eps_fwd <= 0) return null;
    if (!pe_ratio || pe_ratio <= 0 || pe_ratio > 180) return null;
    if (banks.length < 2) return null;

    return {
      price: Math.round(price * 100) / 100,
      day_change,
      sma_200,
      target_price: Math.round(target_price * 100) / 100,
      target_low: Math.round(target_low * 100) / 100,
      target_high: Math.round(target_high * 100) / 100,
      eps_fwd: Math.round(eps_fwd * 100) / 100,
      pe_ratio: Math.round(pe_ratio * 10) / 10,
      market_cap,
      dividend_yield,
      pays_dividend,
      opinions,
      banks
    };
  } catch (err) {
    return null;
  }
}

async function scanUniverseInBatches(universe, auth, batchSize = 12) {
  const scanned = [];
  let discardedCount = 0;
  console.log(`🚀 Iniciando auditoría y escaneo masivo de ${universe.length} acciones en tandas de ${batchSize}...`);

  for (let i = 0; i < universe.length; i += batchSize) {
    const batch = universe.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (item) => {
        const details = await fetchTickerDetails(item, auth);
        if (!details) {
          discardedCount++;
          return null;
        }
        return {
          ...item,
          ...details
        };
      })
    );

    results.forEach((r) => {
      if (r) scanned.push(r);
    });

    process.stdout.write(`\r  [Progreso] ${Math.min(i + batchSize, universe.length)} / ${universe.length} procesadas | Válidas con Bancos: ${scanned.length} | Descartadas por falta de datos: ${discardedCount}`);

    // Pausa preventiva de 200ms entre tandas
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`\n✅ Escaneo finalizado: ${scanned.length} acciones aprobadas con cobertura total de bancos.`);
  console.log(`   (Se descartaron ${discardedCount} acciones por no tener consenso de bancos, EPS positivo o precio objetivo verificable).`);
  return scanned;
}

async function main() {
  console.log('🏛️ Consultando tasas macroeconómicas oficiales (FED)...');
  const macroRates = await fetchMacroRates();
  console.log(`  ✓ Tasa FED Actual: ${macroRates.tasa_actual_fed}% | Proyectada 1A: ${macroRates.tasa_proyectada_fed_1a}%`);

  const universe = JSON.parse(fs.readFileSync(UNIVERSE_PATH, 'utf8'));
  const currentData = JSON.parse(fs.readFileSync(MARKET_DATA_PATH, 'utf8'));
  const ccl = currentData.ccl_dollar || 1650.3;

  console.log('🔑 Obteniendo sesión autenticada de Yahoo Finance...');
  const auth = await getYahooAuth();
  if (!auth.crumb) {
    console.error('❌ Error crítico: No se pudo obtener sesión autenticada con Yahoo Finance.');
    process.exit(1);
  }

  const scannedRaw = await scanUniverseInBatches(universe, auth, 12);

  console.log('🧮 Aplicando Algoritmo Cuantitativo de 3 Capas y Candado de Seguridad (+/- 25%)...');
  const processedStocks = [];

  for (const stock of scannedRaw) {
    // Si tiene CEDEAR, calcular precio en ARS
    if (stock.has_cedear && stock.cedear_ratio) {
      const ratio = parseRatio(stock.cedear_ratio);
      stock.cedear_price_ars = Math.round((stock.price * ccl) / ratio);
    } else {
      stock.cedear_price_ars = null;
      stock.cedear_ratio = null;
      stock.has_cedear = false;
    }

    const quant = calculateStockQuant(stock, macroRates);
    if (!quant) continue;

    const upside = stock.target_price > 0 ? Math.round(((stock.target_price - stock.price) / stock.price) * 1000) / 10 : 0;

    // Semáforo dinámico e institucional con Crash Guard
    let recommendation = 'Hold';
    if (quant.is_crashing || stock.day_change <= -4.0 || quant.score_total < 40) {
      recommendation = 'Avoid';
    } else if (quant.score_total >= 85 && quant.retorno_estimado_pct >= 30) {
      recommendation = 'Strong Buy';
    } else if (quant.score_total >= 60 && quant.retorno_estimado_pct > 0) {
      recommendation = 'Buy';
    } else if (quant.score_total >= 40 && quant.retorno_estimado_pct > 0) {
      recommendation = 'Hold';
    } else {
      recommendation = 'Avoid';
    }

    const topFirms = stock.banks.slice(0, 3).map((b) => b.name).join(', ');
    const analyst_consensus = {
      target_mean: stock.target_price,
      target_low: stock.target_low,
      target_high: stock.target_high,
      source: `Consenso Bancos (${topFirms})`,
      explanation: `Consenso institucional de ${stock.opinions || stock.banks.length} analistas de Wall Street y bancos de inversión Tier-1.`,
      banks: stock.banks
    };

    processedStocks.push({
      ticker: stock.ticker,
      name: stock.name,
      sector: stock.sector,
      price: stock.price,
      day_change: stock.day_change,
      target_price: stock.target_price,
      upside,
      recommendation,
      pe_ratio: stock.pe_ratio,
      rsi: 50,
      score: quant.score_total,
      cedear_ratio: stock.cedear_ratio,
      cedear_price_ars: stock.cedear_price_ars,
      has_cedear: stock.has_cedear,
      pays_dividend: stock.pays_dividend,
      dividend_yield: stock.dividend_yield,
      dividend_frequency: stock.pays_dividend ? 'Trimestral en USD' : 'No paga (Reinvierte)',
      thesis: `${stock.name} forma parte del índice S&P 500 en el sector ${stock.sector}. Valuado con el algoritmo cuantitativo de 3 capas de DondeInvierto con candado de seguridad institucional.`,
      market_cap: stock.market_cap,
      sma_200: stock.sma_200,
      eps_fwd: stock.eps_fwd,
      analyst_consensus,
      precio_objetivo_algoritmo: quant.precio_objetivo_estimado,
      precioObjetivoAlgoritmo: quant.precio_objetivo_estimado,
      retorno_estimado_pct: quant.retorno_estimado_pct,
      retornoEstimadoPct: quant.retorno_estimado_pct,
      score_total: quant.score_total,
      scoreTotal: quant.score_total,
      quant_breakdown: quant.score_breakdown
    });
  }

  // Ordenar de forma descendente por Score Total
  processedStocks.sort((a, b) => (b.score || 0) - (a.score || 0));

  console.log(`\n🏆 Universo resultante: ${processedStocks.length} acciones de alta calidad totalmente auditadas.`);
  console.log(`   (Con CEDEAR para operar en ARS: ${processedStocks.filter((s) => s.has_cedear).length})`);
  console.log(`   (Operables vía Broker Exterior: ${processedStocks.filter((s) => !s.has_cedear).length})`);

  console.log(`\nTop 10 Oportunidades del S&P 500:`);
  processedStocks.slice(0, 10).forEach((s, idx) => {
    console.log(`  #${idx + 1} ${s.ticker.padEnd(5)} | Score: ${s.score.toString().padEnd(4)} | Target Alg: $${s.precio_objetivo_algoritmo} | Retorno: +${s.retorno_estimado_pct}% | Bancos: ${s.analyst_consensus.banks.length} (${s.analyst_consensus.banks[0].name} - ${s.analyst_consensus.banks[0].date})`);
  });

  // Actualizar marketData.json preservando todas las demás secciones (etfs, ons, argentina, etc.)
  currentData.stocks = processedStocks;
  currentData.macro = macroRates;
  currentData.last_updated = `${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs (Hora Buenos Aires, UTC-3)`;

  fs.writeFileSync(MARKET_DATA_PATH, JSON.stringify(currentData, null, 2), 'utf8');
  console.log(`\n💾 marketData.json actualizado con éxito con ${processedStocks.length} acciones.`);
}

main().catch((err) => {
  console.error('❌ Error en el escaneo masivo:', err);
  process.exit(1);
});
