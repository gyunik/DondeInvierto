const fs = require('fs');
const path = require('path');
const { calculateStockQuant } = require('./quant_algorithm');

const dataPath = path.join(__dirname, '..', 'web', 'src', 'data', 'marketData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Datos fundamentales auditados para cada acción
const FUNDAMENTALS = {
  MELI: { eps_fwd: 48.50, per_mediana_5a: 52.0 },
  AMZN: { eps_fwd: 6.25, per_mediana_5a: 45.0 },
  AMD: { eps_fwd: 13.50, per_mediana_5a: 42.0 },
  UBER: { eps_fwd: 2.65, per_mediana_5a: 34.0 },
  TSLA: { eps_fwd: 4.80, per_mediana_5a: 75.0 },
  PLTR: { eps_fwd: 1.95, per_mediana_5a: 85.0 },
  CRM: { eps_fwd: 8.50, per_mediana_5a: 38.0 },
  NOW: { eps_fwd: 3.85, per_mediana_5a: 48.0 },
  PANW: { eps_fwd: 8.20, per_mediana_5a: 52.0 },
  NFLX: { eps_fwd: 2.45, per_mediana_5a: 32.0 },
  MSFT: { eps_fwd: 15.80, per_mediana_5a: 34.0 },
  NVDA: { eps_fwd: 4.85, per_mediana_5a: 50.0 },
  AAPL: { eps_fwd: 10.80, per_mediana_5a: 30.0 },
  GOOGL: { eps_fwd: 12.20, per_mediana_5a: 24.0 },
  META: { eps_fwd: 26.50, per_mediana_5a: 25.0 },
  KO: { eps_fwd: 3.95, per_mediana_5a: 25.0 },
  JPM: { eps_fwd: 25.50, per_mediana_5a: 13.5 },
  LLY: { eps_fwd: 28.50, per_mediana_5a: 55.0 },
  TXN: { eps_fwd: 9.80, per_mediana_5a: 30.0 },
  JNJ: { eps_fwd: 12.80, per_mediana_5a: 21.0 }
};

console.log('--- APLICANDO ALGORITMO CUANTITATIVO DE 3 CAPAS ---');

data.stocks.forEach(stock => {
  const f = FUNDAMENTALS[stock.ticker] || {};
  stock.eps_fwd = f.eps_fwd || stock.eps_fwd || Math.round((stock.price / (stock.pe_ratio || 25)) * 100) / 100;
  stock.per_mediana_5a = f.per_mediana_5a || stock.per_mediana_5a || 28.0;

  const result = calculateStockQuant(stock);

  stock.precio_objetivo_algoritmo = result.precio_objetivo_estimado;
  stock.precioObjetivoAlgoritmo = result.precio_objetivo_estimado;
  stock.retorno_estimado_pct = result.retorno_estimado_pct;
  stock.retornoEstimadoPct = result.retorno_estimado_pct;
  stock.score = result.score_total;
  stock.score_total = result.score_total;
  stock.scoreTotal = result.score_total;
  stock.quant_breakdown = result.score_breakdown;

  console.log(`[${stock.ticker.padEnd(5)}] Precio: $${stock.price.toFixed(2).padStart(8)} | Target Algoritmo: $${result.precio_objetivo_estimado.toFixed(2).padStart(8)} | Retorno: ${result.retorno_estimado_pct >= 0 ? '+' : ''}${result.retorno_estimado_pct.toFixed(1)}% | SCORE: ${result.score_total} (Retorno: ${result.score_breakdown.score_retorno}pts, Margen: ${result.score_breakdown.score_margen}pts, Técnico: ${result.score_breakdown.score_tecnico}pts)`);
});

// Ordenar acciones por Score Total descendente
data.stocks.sort((a, b) => (b.score || 0) - (a.score || 0));

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ marketData.json actualizado exitosamente con el Algoritmo Cuantitativo de 3 Capas y ordenado por Score Total.');
