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

let dellBefore = null;
let dellAfter = null;

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
    // Estimación por defecto consistente con la temporada de balances
    s.last_earnings_date = s.last_earnings_date || 'Oct 2026';
    s.next_earnings_date = s.next_earnings_date || 'Ene 2027';
    s.earnings_quarter = s.earnings_quarter || 'Q3 2026';
  }

  // Marcar informes de bancos como pre o post balance
  if (s.analyst_consensus && s.analyst_consensus.banks) {
    s.analyst_consensus.banks.forEach(b => {
      if (s.is_under_review) {
        b.is_pre_earnings = true;
      }
    });
  }

  if (s.ticker === 'DELL') {
    dellBefore = { score: s.score, recommendation: s.recommendation, upside: s.upside, target: s.precio_objetivo_algoritmo };
  }

  // Recalcular con algoritmo actualizado
  const quant = calculateStockQuant(s, data.macro);
  if (quant) {
    s.precio_objetivo_algoritmo = quant.precio_objetivo_estimado;
    s.precioObjetivoAlgoritmo = quant.precio_objetivo_estimado;
    s.retorno_estimado_pct = quant.retorno_estimado_pct;
    s.retornoEstimadoPct = quant.retorno_estimado_pct;
    s.score = quant.score_total;
    s.score_total = quant.score_total;
    s.scoreTotal = quant.score_total;
    s.quant_breakdown = quant.score_breakdown;
    s.recommendation = quant.recomendacion_cuantitativa;
    if (quant.is_under_review) {
      s.is_under_review = true;
    }
  }

  if (s.ticker === 'DELL') {
    dellAfter = { score: s.score, recommendation: s.recommendation, upside: s.retorno_estimado_pct, target: s.precio_objetivo_algoritmo };
  }
});

// Ordenar por Score descendente
data.stocks.sort((a, b) => (b.score || 0) - (a.score || 0));

// Actualizar también CEDEARs si tienen acciones asociadas
if (data.argentina && data.argentina.cedears) {
  data.argentina.cedears.forEach(c => {
    const parentStock = data.stocks.find(st => st.ticker === c.ticker);
    if (parentStock) {
      c.score = parentStock.score;
      c.recommendation = parentStock.recommendation;
      c.last_earnings_date = parentStock.last_earnings_date;
      c.next_earnings_date = parentStock.next_earnings_date;
      c.earnings_quarter = parentStock.earnings_quarter;
      c.is_under_review = parentStock.is_under_review;
      c.retorno_estimado_pct = parentStock.retorno_estimado_pct;
      c.precio_objetivo_algoritmo = parentStock.precio_objetivo_algoritmo;
      c.quant_breakdown = parentStock.quant_breakdown;
      if (c.analyst_consensus && c.analyst_consensus.banks) {
        c.analyst_consensus.banks.forEach(b => {
          if (c.is_under_review) {
            b.is_pre_earnings = true;
          }
        });
      }
    }
  });
  data.argentina.cedears.sort((a, b) => (b.score || 0) - (a.score || 0));
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('--- RESULTADO RECALCULO CUANTITATIVO ---');
console.log('DELL Antes:', dellBefore);
console.log('DELL Después:', dellAfter);
console.log('Top 5 Stocks post-ajuste:', data.stocks.slice(0, 5).map(s => `${s.ticker}: Score ${s.score} (${s.recommendation})`));
