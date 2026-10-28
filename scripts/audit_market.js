const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dataPath = path.join(__dirname, '..', 'web', 'src', 'data', 'marketData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function fetchLiveTicker(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const json = await fetchJson(url);
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? price;
    const dayChange = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
    return {
      price: Math.round(price * 100) / 100,
      prevClose: Math.round(prevClose * 100) / 100,
      dayChange: Math.round(dayChange * 100) / 100
    };
  } catch (err) {
    return null;
  }
}

async function fetchLiveDolarCcl() {
  try {
    const json = await fetchJson('https://dolarapi.com/v1/dolares/contadoconliqui');
    return json.venta || json.promedio || 1665.4;
  } catch (e) {
    return 1665.4;
  }
}

function parseRatio(r) {
  if (!r) return 1;
  const p = parseFloat(r.split(':')[0]);
  return isNaN(p) || p <= 0 ? 1 : p;
}

async function runAudit() {
  console.log('🔍 INICIANDO AUDITORÍA INTEGRAL DE MERCADO...\n');

  const ccl = await fetchLiveDolarCcl();
  console.log(`💵 DÓLAR CCL AUDITADO: $${ccl} ARS (Guardado en base: $${data.ccl_dollar} ARS)\n`);

  const results = {
    ccl: { stored: data.ccl_dollar, live: ccl },
    stocks: [],
    etfs: [],
    merval: []
  };

  // 1. Acciones
  console.log('--- 1. AUDITORÍA DE ACCIONES / CEDEARS ---');
  for (const s of data.stocks) {
    const live = await fetchLiveTicker(s.ticker);
    if (!live) {
      results.stocks.push({ ticker: s.ticker, status: 'ERROR_FETCH' });
      continue;
    }
    const ratio = parseRatio(s.cedear_ratio);
    const expectedCedearArs = Math.round((live.price * ccl) / ratio);
    const priceDiff = Math.abs(s.price - live.price);
    const changeDiff = Math.abs(s.day_change - live.dayChange);

    const item = {
      ticker: s.ticker,
      name: s.name,
      storedPrice: s.price,
      livePrice: live.price,
      storedChange: s.day_change,
      liveChange: live.dayChange,
      prevClose: live.prevClose,
      ratio: s.cedear_ratio,
      storedCedearArs: s.cedear_price_ars,
      expectedCedearArs: expectedCedearArs,
      targetPrice: s.target_price,
      storedUpside: s.upside,
      expectedUpside: s.target_price ? Math.round(((s.target_price - live.price) / live.price) * 1000) / 10 : 0,
      peRatio: s.pe_ratio,
      marketCap: s.market_cap,
      hasChangeIssue: changeDiff > 0.5,
      hasPriceIssue: priceDiff > 1
    };
    results.stocks.push(item);
    console.log(`[${s.ticker}] Guardado: $${s.price} (${s.day_change}%) | Real: $${live.price} (${live.dayChange}%) | CEDEAR ARS: $${expectedCedearArs}`);
  }

  // 2. ETFs
  console.log('\n--- 2. AUDITORÍA DE TOP ETFS ---');
  for (const e of data.etfs) {
    const tickerQuery = e.ticker === 'CSPX' ? 'CSPX.L' : e.ticker;
    const live = await fetchLiveTicker(tickerQuery);
    if (!live) {
      results.etfs.push({ ticker: e.ticker, status: 'ERROR_FETCH' });
      continue;
    }
    const ratio = parseRatio(e.cedear_ratio);
    const expectedCedearArs = Math.round((live.price * ccl) / ratio);
    const changeDiff = Math.abs(e.day_change - live.dayChange);

    const item = {
      ticker: e.ticker,
      name: e.name,
      storedPrice: e.price,
      livePrice: live.price,
      storedChange: e.day_change,
      liveChange: live.dayChange,
      prevClose: live.prevClose,
      ratio: e.cedear_ratio,
      storedCedearArs: e.cedear_price_ars,
      expectedCedearArs: expectedCedearArs,
      expenseRatio: e.expense_ratio,
      hasChangeIssue: changeDiff > 0.5
    };
    results.etfs.push(item);
    console.log(`[${e.ticker}] Guardado: $${e.price} (${e.day_change}%) | Real: $${live.price} (${live.dayChange}%) | CEDEAR ARS: $${expectedCedearArs}`);
  }

  // 3. Merval
  console.log('\n--- 3. AUDITORÍA DE MERVAL ---');
  if (data.argentina && data.argentina.merval) {
    for (const m of data.argentina.merval) {
      const live = await fetchLiveTicker(`${m.ticker}.BA`);
      if (live) {
        results.merval.push({
          ticker: m.ticker,
          storedPrice: m.price_ars,
          livePrice: live.price,
          storedChange: m.day_change,
          liveChange: live.dayChange
        });
        console.log(`[${m.ticker}] Guardado: $${m.price_ars} (${m.day_change}%) | Real: $${live.price} (${live.dayChange}%)`);
      }
    }
  }

  fs.writeFileSync(path.join(__dirname, 'audit_results.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('\n✅ Auditoría guardada en scripts/audit_results.json');
}

runAudit().catch(console.error);
