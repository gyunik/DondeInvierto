/**
 * scripts/update_market.js
 * Script autónomo para actualizar cotizaciones reales de Yahoo Finance y Dólar CCL.
 * Se ejecuta localmente o de forma automática en GitHub Actions (Cron).
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');

const MARKET_DATA_PATH = path.join(__dirname, '..', 'web', 'src', 'data', 'marketData.json');

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

async function fetchTickerData(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
    const json = await fetchJson(url);
    const result = json?.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta;
    const price = meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
    let change = 0;
    if (prevClose && price) {
      change = ((price - prevClose) / prevClose) * 100;
    }
    return {
      price: Math.round(price * 100) / 100,
      prevClose: Math.round(prevClose * 100) / 100,
      change: isFinite(change) ? Math.round(change * 100) / 100 : 0.0
    };
  } catch (err) {
    console.warn(`⚠️ No se pudo obtener cotización de ${ticker}: ${err.message}`);
    return null;
  }
}

async function fetchDolarCcl() {
  try {
    const data = await fetchJson('https://dolarapi.com/v1/dolares/contadoconliqui');
    const price = data.venta || data.promedio || 1215;
    return { price: Math.round(price * 100) / 100 };
  } catch (err) {
    console.warn(`⚠️ Error al consultar Dólar CCL: ${err.message}. Usando valor previo.`);
    return null;
  }
}

function parseRatio(ratioStr) {
  if (!ratioStr) return 1;
  const parts = ratioStr.split(':');
  const num = parseFloat(parts[0]);
  return isNaN(num) || num <= 0 ? 1 : num;
}

function getBuenosAiresTimestamp() {
  const now = new Date();
  // UTC-3
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const baTime = new Date(utc - 3 * 3600000);
  
  const yyyy = baTime.getFullYear();
  const mm = String(baTime.getMonth() + 1).padStart(2, '0');
  const dd = String(baTime.getDate()).padStart(2, '0');
  const hh = String(baTime.getHours()).padStart(2, '0');
  const min = String(baTime.getMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${min} hs (Hora Buenos Aires, UTC-3)`;
}

async function main() {
  console.log('🔄 Iniciando actualización de cotizaciones de mercado...');
  
  if (!fs.existsSync(MARKET_DATA_PATH)) {
    throw new Error(`Archivo no encontrado: ${MARKET_DATA_PATH}`);
  }

  const rawData = fs.readFileSync(MARKET_DATA_PATH, 'utf8');
  const data = JSON.parse(rawData);

  // 1. Dólar CCL
  const cclInfo = await fetchDolarCcl();
  if (cclInfo?.price) {
    data.ccl_dollar = cclInfo.price;
    if (data.market && data.market['CCL']) {
      data.market['CCL'].price = cclInfo.price;
    }
    console.log(`💵 Dólar CCL actualizado: $${cclInfo.price} ARS`);
  }
  const ccl = data.ccl_dollar || 1215;

  // 2. Índices principales
  const indexTickers = ['^GSPC', '^IXIC', '^TNX', '^VIX'];
  for (const sym of indexTickers) {
    const q = await fetchTickerData(sym);
    if (q && data.market && data.market[sym]) {
      data.market[sym].price = q.price;
      data.market[sym].change = q.change;
      console.log(`📈 Índice ${sym}: ${q.price} (${q.change >= 0 ? '+' : ''}${q.change}%)`);
    }
  }

  // 3. Acciones (Stocks)
  console.log(`\n📊 Actualizando ${data.stocks.length} Acciones / CEDEARs...`);
  for (const s of data.stocks) {
    const q = await fetchTickerData(s.ticker);
    if (q && q.price > 0) {
      s.price = q.price;
      s.day_change = q.change;
      
      const ratio = parseRatio(s.cedear_ratio);
      s.cedear_price_ars = Math.round((q.price * ccl) / ratio);

      if (s.target_price && s.target_price > 0) {
        s.upside = Math.round(((s.target_price - q.price) / q.price) * 1000) / 10;
      }
      console.log(`  ✓ ${s.ticker}: $${q.price} USD | ${q.change >= 0 ? '+' : ''}${q.change}% | CEDEAR: $${s.cedear_price_ars.toLocaleString('es-AR')} ARS`);
    }
  }

  // 4. ETFs
  console.log(`\n🌐 Actualizando ${data.etfs.length} ETFs...`);
  for (const e of data.etfs) {
    // Para CSPX se consulta CSPX.L o se mantiene el precio base
    const tickerQuery = e.ticker === 'CSPX' ? 'CSPX.L' : e.ticker;
    const q = await fetchTickerData(tickerQuery);
    if (q && q.price > 0) {
      e.price = q.price;
      e.day_change = q.change;

      const ratio = parseRatio(e.cedear_ratio);
      e.cedear_price_ars = Math.round((q.price * ccl) / ratio);
      console.log(`  ✓ ${e.ticker}: $${q.price} USD | ${e.day_change}% | CEDEAR: $${e.cedear_price_ars.toLocaleString('es-AR')} ARS`);
    }
  }

  // 5. Merval
  if (data.argentina && data.argentina.merval) {
    console.log(`\n🇦🇷 Actualizando acciones del Merval...`);
    for (const m of data.argentina.merval) {
      const q = await fetchTickerData(`${m.ticker}.BA`);
      if (q && q.price > 0) {
        m.price_ars = q.price;
        m.day_change = q.change;
        console.log(`  ✓ ${m.ticker}.BA: $${m.price_ars} ARS (${m.day_change}%)`);
      }
    }
  }

  // 6. Timestamp de actualización
  data.last_updated = getBuenosAiresTimestamp();
  console.log(`\n🕒 Nueva marca temporal: ${data.last_updated}`);

  // Guardar archivo JSON
  fs.writeFileSync(MARKET_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ Archivo marketData.json actualizado con éxito.');
}

main().catch((err) => {
  console.error('❌ Error durante la actualización:', err);
  process.exit(1);
});
