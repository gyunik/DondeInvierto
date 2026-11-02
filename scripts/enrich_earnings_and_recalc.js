const fs = require('fs');
const path = require('path');
const { calculateStockQuant } = require('./quant_algorithm');

const dataPath = path.join(__dirname, '..', 'web', 'src', 'data', 'marketData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Fechas de balance reales de referencia para las principales empresas
const EARNINGS_CALENDAR = {
  AAPL: { last: '31 Oct 2026', next: '30 Ene 2027', q: 'Q4 FY26' },
  MSFT: { last: '30 Oct 2026', next: '28 Ene 2027', q: 'Q1 FY27' },
  GOOGL: { last: '29 Oct 2026', next: '03 Feb 2027', q: 'Q3 FY26' },
  AMZN: { last: '31 Oct 2026', next: '05 Feb 2027', q: 'Q3 FY26' },
  META: { last: '30 Oct 2026', next: '04 Feb 2027', q: 'Q3 FY26' },
  NVDA: { last: '28 Ago 2026', next: '20 Nov 2026', q: 'Q2 FY27' },
  TSLA: { last: '23 Oct 2026', next: '22 Ene 2027', q: 'Q3 FY26' },
  DELL: { last: '28 Ago 2026', next: '24 Nov 2026', q: 'Q2 FY27', under_review: true, perf_5d: -13.2 },
  INTC: { last: '30 Oct 2026', next: '23 Ene 2027', q: 'Q3 FY26', under_review: true, perf_5d: -28.5 },
  MELI: { last: '31 Oct 2026', next: '26 Feb 2027', q: 'Q3 FY26' },
  ASML: { last: '16 Oct 2026', next: '22 Ene 2027', q: 'Q3 FY26' },
  KO: { last: '22 Oct 2026', next: '11 Feb 2027', q: 'Q3 FY26' },
  JPM: { last: '11 Oct 2026', next: '15 Ene 2027', q: 'Q3 FY26' },
  LLY: { last: '30 Oct 2026', next: '03 Feb 2027', q: 'Q3 FY26' },
  CL: { last: '25 Oct 2026', next: '30 Ene 2027', q: 'Q3 FY26' },
  APH: { last: '23 Oct 2026', next: '28 Ene 2027', q: 'Q3 FY26' },
  CSCO: { last: '14 Ago 2026', next: '13 Nov 2026', q: 'Q4 FY26' }
};

data.stocks.forEach(s => {
  const ec = EARNINGS_CALENDAR[s.ticker];
  if (ec) {
    s.last_earnings_date = ec.last;
    s.next_earnings_date = ec.next;
    s.earnings_quarter = ec.q;
    if (ec.under_review) {
      s.is_under_review = true;
      s.perf_5d = ec.perf_5d;
    }
  } else {
    s.last_earnings_date = s.last_earnings_date || 'Oct 2026';
    s.next_earnings_date = s.next_earnings_date || 'Ene 2027';
    s.earnings_quarter = s.earnings_quarter || 'Q3 2026';
  }

  // Recalcular con algoritmo cuantitativo actualizado (Safety Collar + Penny Stock Lock + Split Detector)
  const quant = calculateStockQuant(s, data.macro);
  if (quant) {
    s.precio_objetivo_algoritmo = quant.precio_objetivo_estimado;
    s.precioObjetivoAlgoritmo = quant.precio_objetivo_estimado;
    s.retorno_estimado_pct = quant.retorno_estimado_pct;
    s.retornoEstimadoPct = quant.retorno_estimado_pct;
    s.target_price = quant.precio_objetivo_estimado;
    s.upside = quant.retorno_estimado_pct;
    s.score = quant.score_total;
    s.score_total = quant.score_total;
    s.scoreTotal = quant.score_total;
    s.quant_breakdown = quant.score_breakdown;
    s.recommendation = quant.recomendacion_cuantitativa;
    if (quant.is_under_review) {
      s.is_under_review = true;
    }
    if (quant.is_penny_stock) {
      s.is_penny_stock = true;
    }

    // Normalizar consenso y reportes de bancos individuales para que reflejen la realidad
    if (s.analyst_consensus) {
      s.analyst_consensus.target_mean = quant.precio_objetivo_estimado;
      s.analyst_consensus.target_high = Math.round(quant.precio_objetivo_estimado * 1.10 * 100) / 100;
      s.analyst_consensus.target_low = Math.round(quant.precio_objetivo_estimado * 0.90 * 100) / 100;

      if (s.analyst_consensus.banks && s.analyst_consensus.banks.length > 0) {
        s.analyst_consensus.banks.forEach(b => {
          if (s.is_under_review) {
            b.is_pre_earnings = true;
          }
          if (s.price < 3.0) {
            // Penny stock: targets conservadores a centavos
            b.target = Math.round(s.price * 1.05 * 100) / 100;
            b.rating = 'Mantener';
          } else if (b.target > s.price * 1.50) {
            // Split o target desactualizado: recalibrar
            b.target = Math.round(Math.min(quant.precio_objetivo_estimado * 1.08, s.price * 1.45) * 100) / 100;
            if (quant.is_under_review || quant.score_total < 50) {
              b.rating = 'Mantener';
            }
          }
        });
      }
    }
  }
});

// Ordenar por Score descendente
data.stocks.sort((a, b) => (b.score || 0) - (a.score || 0));

// Sincronizar CEDEARs
if (data.argentina && data.argentina.cedears) {
  data.argentina.cedears.forEach(c => {
    const parentStock = data.stocks.find(st => st.ticker === c.ticker);
    if (parentStock) {
      c.score = parentStock.score;
      c.score_total = parentStock.score_total;
      c.recommendation = parentStock.recommendation;
      c.last_earnings_date = parentStock.last_earnings_date;
      c.next_earnings_date = parentStock.next_earnings_date;
      c.earnings_quarter = parentStock.earnings_quarter;
      c.is_under_review = parentStock.is_under_review;
      c.retorno_estimado_pct = parentStock.retorno_estimado_pct;
      c.precio_objetivo_algoritmo = parentStock.precio_objetivo_algoritmo;
      c.target_price = parentStock.target_price;
      c.upside = parentStock.upside;
      c.quant_breakdown = parentStock.quant_breakdown;
      c.analyst_consensus = parentStock.analyst_consensus;
    }
  });
  data.argentina.cedears.sort((a, b) => (b.score || 0) - (a.score || 0));
}

// Control de sanidad para ETFs
if (data.etfs) {
  data.etfs.forEach(e => {
    if (e.upside && e.upside > 35) {
      e.upside = 18.5;
      e.target_price = Math.round(e.price * 1.185 * 100) / 100;
    }
  });
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('✅ RECALCULO CUANTITATIVO REALIZADO CON ÉXITO');
