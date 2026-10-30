/**
 * scripts/scan_sp500_quant.js
 * Escáner masivo de alta velocidad para el S&P 500 y CEDEARs.
 * Extrae cotizaciones en vivo, consensus targets y forward EPS,
 * y aplica el Algoritmo Cuantitativo Dinámico de 3 Capas.
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

async function getYahooAuth() {
  try {
    const cookieRes = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(5000)
    });
    const cookie = cookieRes.headers.get('set-cookie');
    const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': cookie || '' },
      signal: AbortSignal.timeout(5000)
    });
    const crumb = await crumbRes.text();
    return { cookie, crumb };
  } catch (err) {
    console.warn('⚠️ No se pudo obtener sesión autenticada de Yahoo:', err.message);
    return { cookie: null, crumb: null };
  }
}

async function fetchTickerDetails(ticker, auth) {
  try {
    // 1. Chart para precio actual, variación diaria y SMA200
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=200d&includePrePost=true`;
    const chartRes = await fetch(chartUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(6000)
    });
    if (!chartRes.ok) return null;
    const chartJson = await chartRes.json();
    const result = chartJson?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.preMarketPrice || meta.regularMarketPrice || 0;
    if (price <= 0) return null;

    const prevClose = meta.chartPreviousClose || price;
    const day_change = prevClose > 0 ? Math.round(((price - prevClose) / prevClose) * 1000) / 10 : 0;

    const closes = result.indicators?.quote?.[0]?.close || [];
    const validCloses = closes.filter((c) => typeof c === 'number' && c > 0);
    const sma_200 = validCloses.length > 0
      ? Math.round((validCloses.reduce((a, b) => a + b, 0) / validCloses.length) * 100) / 100
      : Math.round(price * 0.95 * 100) / 100;

    let target_price = Math.round(price * 1.15 * 100) / 100;
    let eps_fwd = null;
    let pe_ratio = 25.0;
    let market_cap = '$50B USD';
    let dividend_yield = 0;
    let pays_dividend = false;

    // 2. QuoteSummary si hay sesión de Yahoo
    if (auth.crumb && auth.cookie) {
      try {
        const sumUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=financialData,defaultKeyStatistics,summaryDetail&crumb=${auth.crumb}`;
        const sumRes = await fetch(sumUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': auth.cookie },
          signal: AbortSignal.timeout(4000)
        });
        if (sumRes.ok) {
          const sumJson = await sumRes.json();
          const fd = sumJson?.quoteSummary?.result?.[0]?.financialData;
          const ks = sumJson?.quoteSummary?.result?.[0]?.defaultKeyStatistics;
          const sd = sumJson?.quoteSummary?.result?.[0]?.summaryDetail;

          if (fd?.targetMeanPrice?.raw && fd.targetMeanPrice.raw > 0) {
            target_price = Math.round(fd.targetMeanPrice.raw * 100) / 100;
          }
          if (ks?.forwardEps?.raw && ks.forwardEps.raw > 0) {
            eps_fwd = Math.round(ks.forwardEps.raw * 100) / 100;
          }
          if (sd?.trailingPE?.raw && sd.trailingPE.raw > 0) {
            pe_ratio = Math.round(sd.trailingPE.raw * 10) / 10;
          } else if (sd?.forwardPE?.raw && sd.forwardPE.raw > 0) {
            pe_ratio = Math.round(sd.forwardPE.raw * 10) / 10;
          }
          if (sd?.dividendYield?.raw && sd.dividendYield.raw > 0) {
            dividend_yield = Math.round(sd.dividendYield.raw * 1000) / 10;
            pays_dividend = true;
          }
        }
      } catch {
        // Fallback al cálculo básico
      }
    }

    return {
      price: Math.round(price * 100) / 100,
      day_change,
      sma_200,
      target_price,
      eps_fwd,
      pe_ratio,
      market_cap,
      dividend_yield,
      pays_dividend
    };
  } catch (err) {
    return null;
  }
}

async function scanUniverseInBatches(universe, auth, batchSize = 15) {
  const scanned = [];
  console.log(`🚀 Iniciando escaneo de ${universe.length} acciones en tandas de ${batchSize}...`);

  for (let i = 0; i < universe.length; i += batchSize) {
    const batch = universe.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (item) => {
        const details = await fetchTickerDetails(item.ticker, auth);
        if (!details) return null;
        return {
          ...item,
          ...details
        };
      })
    );

    results.forEach((r) => {
      if (r) scanned.push(r);
    });

    process.stdout.write(`\r  [Progreso] ${Math.min(i + batchSize, universe.length)} / ${universe.length} procesadas...`);
  }
  console.log('\n✅ Escaneo bursátil finalizado.');
  return scanned;
}

async function main() {
  console.log('🏛️ Consultando tasas macroeconómicas oficiales (FED)...');
  const macroRates = await fetchMacroRates();
  console.log(`  ✓ Tasa FED Actual: ${macroRates.tasa_actual_fed}% | Proyectada 1A: ${macroRates.tasa_proyectada_fed_1a}%`);

  const universe = JSON.parse(fs.readFileSync(UNIVERSE_PATH, 'utf8'));
  const currentData = JSON.parse(fs.readFileSync(MARKET_DATA_PATH, 'utf8'));
  const ccl = currentData.ccl_dollar || 1650.3;

  console.log('🔑 Obteniendo sesión autenticada de Yahoo...');
  const auth = await getYahooAuth();

  const scannedRaw = await scanUniverseInBatches(universe, auth, 20);

  console.log('🧮 Aplicando Algoritmo Cuantitativo de 3 Capas y Score Total...');
  const processedStocks = scannedRaw.map((stock) => {
    // Si tiene CEDEAR, calcular precio en ARS
    if (stock.has_cedear && stock.cedear_ratio) {
      const ratio = parseRatio(stock.cedear_ratio);
      stock.cedear_price_ars = Math.round((stock.price * ccl) / ratio);
    } else {
      stock.cedear_price_ars = null;
      stock.cedear_ratio = null;
    }

    const quant = calculateStockQuant(stock, macroRates);
    const upside = stock.target_price > 0 ? Math.round(((stock.target_price - stock.price) / stock.price) * 1000) / 10 : 0;

    return {
      ticker: stock.ticker,
      name: stock.name,
      sector: stock.sector,
      price: stock.price,
      day_change: stock.day_change,
      target_price: stock.target_price,
      upside,
      recommendation: quant.score_total >= 85 && quant.retorno_estimado_pct >= 35
        ? 'Strong Buy'
        : quant.score_total >= 60 && quant.retorno_estimado_pct > 0
        ? 'Buy'
        : quant.score_total >= 40
        ? 'Hold'
        : 'Avoid',
      pe_ratio: stock.pe_ratio,
      rsi: 50,
      score: quant.score_total,
      cedear_ratio: stock.cedear_ratio,
      cedear_price_ars: stock.cedear_price_ars,
      has_cedear: stock.has_cedear,
      pays_dividend: stock.pays_dividend,
      dividend_yield: stock.dividend_yield,
      dividend_frequency: stock.pays_dividend ? 'Trimestral en USD' : 'No paga (Reinvierte)',
      thesis: `${stock.name} forma parte del índice S&P 500 en el sector ${stock.sector}. Valuado con el algoritmo cuantitativo de 3 capas de DondeInvierto.`,
      market_cap: stock.market_cap,
      sma_200: stock.sma_200,
      eps_fwd: stock.eps_fwd,
      precio_objetivo_algoritmo: quant.precio_objetivo_estimado,
      precioObjetivoAlgoritmo: quant.precio_objetivo_estimado,
      retorno_estimado_pct: quant.retorno_estimado_pct,
      retornoEstimadoPct: quant.retorno_estimado_pct,
      score_total: quant.score_total,
      scoreTotal: quant.score_total,
      quant_breakdown: quant.score_breakdown
    };
  });

  // Ordenar de forma descendente por Score Total
  processedStocks.sort((a, b) => (b.score || 0) - (a.score || 0));

  console.log(`\n🏆 Top 5 Oportunidades del S&P 500:`);
  processedStocks.slice(0, 5).forEach((s, idx) => {
    console.log(`  #${idx + 1} ${s.ticker.padEnd(5)} | Score: ${s.score} | Retorno: +${s.retorno_estimado_pct}% | CEDEAR: ${s.has_cedear ? 'SÍ (' + s.cedear_ratio + ')' : 'Solo Exterior'}`);
  });

  // Actualizar marketData.json
  currentData.stocks = processedStocks;
  currentData.macro = macroRates;
  currentData.last_updated = `${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs (Hora Buenos Aires, UTC-3)`;

  fs.writeFileSync(MARKET_DATA_PATH, JSON.stringify(currentData, null, 2), 'utf8');
  console.log(`\n💾 marketData.json actualizado con ${processedStocks.length} acciones del S&P 500.`);
}

main().catch((err) => {
  console.error('❌ Error en el escaneo masivo:', err);
  process.exit(1);
});
