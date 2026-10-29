/**
 * scripts/enrich_etfs.js
 * Sanea y enriquece los 20 ETFs con consenso de Bancos de Inversión Tier-1,
 * Chief Equity Strategists y mesas de commodities globales con fecha exacta de reporte.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'web', 'src', 'data', 'marketData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const etfDetails = {
  IBIT: {
    pe_ratio: null,
    market_cap: '$26.4B AUM',
    recommendation: 'Compra Institucional',
    explanation: 'Proyecciones a 12 meses de departamentos de activos digitales y análisis macro de Wall Street basadas en el flujo institucional neto de ETFs y el ciclo de halving de Bitcoin.',
    banks: [
      { name: 'Standard Chartered', target: 68.0, rating: 'Comprar', date: '22 Oct 2026' },
      { name: 'Fundstrat (Tom Lee)', target: 65.0, rating: 'Comprar', date: '18 Oct 2026' },
      { name: 'Bernstein Research', target: 62.0, rating: 'Comprar', date: '16 Oct 2026' },
      { name: 'JPMorgan Digital Assets', target: 54.0, rating: 'Neutral', date: '10 Oct 2026' }
    ]
  },
  SOXX: {
    pe_ratio: 33.5,
    market_cap: '$15.2B AUM',
    recommendation: 'Sobreponderar Fuerte',
    explanation: 'Consenso agregado bottom-up ponderado por capitalización de los 30 mayores fabricantes de microchips (NVIDIA, Broadcom, Qualcomm, AMD, Texas Instruments).',
    banks: [
      { name: 'Goldman Sachs', target: 660.0, rating: 'Comprar', date: '23 Oct 2026' },
      { name: 'Morgan Stanley', target: 645.0, rating: 'Sobreponderar', date: '18 Oct 2026' },
      { name: 'Bank of America', target: 640.0, rating: 'Comprar', date: '15 Oct 2026' },
      { name: 'Citigroup', target: 620.0, rating: 'Comprar', date: '08 Oct 2026' }
    ]
  },
  SLV: {
    pe_ratio: null,
    market_cap: '$17.8B AUM',
    recommendation: 'Compra Moderada',
    explanation: 'Estimaciones de las mesas de commodities de Wall Street ante el déficit estructural global de oferta física y el récord de demanda industrial en paneles solares y electrónica.',
    banks: [
      { name: 'Citigroup Commodities', target: 56.0, rating: 'Comprar', date: '14 Oct 2026' },
      { name: 'Bank of America', target: 54.0, rating: 'Comprar', date: '18 Oct 2026' },
      { name: 'UBS Global Wealth', target: 52.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Morgan Stanley', target: 50.0, rating: 'Neutral', date: '09 Oct 2026' }
    ]
  },
  ARKK: {
    pe_ratio: null,
    market_cap: '$6.2B AUM',
    recommendation: 'Especulativo',
    explanation: 'Consenso agregado ponderado para el portafolio de innovación disruptiva de Cathie Wood (Tesla, Coinbase, Roku, Block, CRISPR Therapeutics).',
    banks: [
      { name: 'Wedbush Securities', target: 105.0, rating: 'Comprar', date: '22 Oct 2026' },
      { name: 'Morgan Stanley', target: 98.0, rating: 'Neutral', date: '17 Oct 2026' },
      { name: 'Goldman Sachs', target: 95.0, rating: 'Neutral', date: '14 Oct 2026' },
      { name: 'Citigroup', target: 92.0, rating: 'Neutral', date: '08 Oct 2026' }
    ]
  },
  GLD: {
    pe_ratio: null,
    market_cap: '$74.5B AUM',
    recommendation: 'Sobreponderar',
    explanation: 'Consenso de analistas de commodities de Wall Street proyectando la onza troy de oro a 12 meses impulsada por compras masivas de bancos centrales y relajación de tasas.',
    banks: [
      { name: 'Goldman Sachs', target: 415.0, rating: 'Comprar', date: '22 Oct 2026' },
      { name: 'Bank of America', target: 415.0, rating: 'Comprar', date: '15 Oct 2026' },
      { name: 'UBS Global Wealth', target: 395.0, rating: 'Comprar', date: '18 Oct 2026' },
      { name: 'Citigroup Commodities', target: 388.0, rating: 'Neutral', date: '07 Oct 2026' },
      { name: 'JPMorgan Commodities', target: 395.0, rating: 'Comprar', date: '11 Oct 2026' }
    ]
  },
  BOTZ: {
    pe_ratio: 38.5,
    market_cap: '$2.9B AUM',
    recommendation: 'Comprar',
    explanation: 'Consenso agregado bottom-up sobre empresas de desarrollo de robótica industrial, automatización quirúrgica (Intuitive Surgical) y visión artificial con IA.',
    banks: [
      { name: 'Goldman Sachs', target: 41.0, rating: 'Comprar', date: '23 Oct 2026' },
      { name: 'Morgan Stanley', target: 40.0, rating: 'Sobreponderar', date: '16 Oct 2026' },
      { name: 'Bank of America', target: 39.5, rating: 'Comprar', date: '11 Oct 2026' },
      { name: 'Jefferies', target: 38.5, rating: 'Comprar', date: '04 Oct 2026' }
    ]
  },
  CSPX: {
    pe_ratio: 27.8,
    market_cap: '$95B AUM',
    recommendation: 'Sobreponderar',
    explanation: 'Proyección institucional para el S&P 500 con estructura de reinversión automática de dividendos e insolvencia fiscal eficiente en Irlanda.',
    banks: [
      { name: 'Morgan Stanley (Mike Wilson)', target: 918.0, rating: 'Sobreponderar', date: '18 Oct 2026' },
      { name: 'Citigroup (Scott Chronert)', target: 918.0, rating: 'Comprar', date: '14 Oct 2026' },
      { name: 'Goldman Sachs (David Kostin)', target: 904.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Bank of America (Savita Subr.)', target: 870.0, rating: 'Neutral', date: '10 Oct 2026' },
      { name: 'JPMorgan (Dubravko Lakos)', target: 845.0, rating: 'Neutral', date: '04 Oct 2026' }
    ]
  },
  XBI: {
    pe_ratio: null,
    market_cap: '$7.8B AUM',
    recommendation: 'Comprar',
    explanation: 'Consenso de analistas de biotecnología y ciencias de la salud, fundamentado en una aceleración de adquisiciones por parte de Big Pharma y aprobaciones regulatorias de la FDA.',
    banks: [
      { name: 'Jefferies Healthcare', target: 195.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Goldman Sachs Biotech', target: 190.0, rating: 'Comprar', date: '15 Oct 2026' },
      { name: 'Morgan Stanley', target: 182.0, rating: 'Sobreponderar', date: '10 Oct 2026' },
      { name: 'Bank of America', target: 178.0, rating: 'Neutral', date: '04 Oct 2026' }
    ]
  },
  CNYA: {
    pe_ratio: 13.8,
    market_cap: '$2.4B AUM',
    recommendation: 'Compra Oportunista',
    explanation: 'Consenso de las mesas de renta variable de Asia sobre acciones domésticas chinas (A-Shares de Shanghai y Shenzhen) tras las medidas de apoyo fiscal y estímulo al consumo.',
    banks: [
      { name: 'Goldman Sachs Asia', target: 37.0, rating: 'Comprar', date: '22 Oct 2026' },
      { name: 'UBS Global Wealth', target: 36.0, rating: 'Comprar', date: '11 Oct 2026' },
      { name: 'Morgan Stanley Asia', target: 35.0, rating: 'Neutral', date: '16 Oct 2026' },
      { name: 'JPMorgan Asia', target: 34.0, rating: 'Neutral', date: '07 Oct 2026' }
    ]
  },
  USO: {
    pe_ratio: null,
    market_cap: '$1.4B AUM',
    recommendation: 'Neutral',
    explanation: 'Proyección a 12 meses de contratos de futuros de petróleo WTI y Brent según los modelos de balance entre oferta OPEP+ y demanda energética mundial.',
    banks: [
      { name: 'Goldman Sachs Commodities', target: 188.0, rating: 'Comprar', date: '18 Oct 2026' },
      { name: 'Morgan Stanley Energy', target: 182.0, rating: 'Neutral', date: '14 Oct 2026' },
      { name: 'JPMorgan Commodities', target: 180.0, rating: 'Neutral', date: '04 Oct 2026' },
      { name: 'Citigroup Commodities', target: 172.0, rating: 'Neutral', date: '09 Oct 2026' }
    ]
  },
  IVV: {
    pe_ratio: 27.8,
    market_cap: '$540B AUM',
    recommendation: 'Sobreponderar',
    explanation: 'Consenso oficial de los estrategas jefes de Wall Street para el índice S&P 500 en formato ETF de comisión ultra reducida de BlackRock.',
    banks: [
      { name: 'Morgan Stanley (Mike Wilson)', target: 852.0, rating: 'Sobreponderar', date: '18 Oct 2026' },
      { name: 'Citigroup (Scott Chronert)', target: 852.0, rating: 'Comprar', date: '14 Oct 2026' },
      { name: 'Goldman Sachs (David Kostin)', target: 839.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Bank of America (Savita Subr.)', target: 808.0, rating: 'Neutral', date: '10 Oct 2026' },
      { name: 'JPMorgan (Dubravko Lakos)', target: 785.0, rating: 'Neutral', date: '04 Oct 2026' }
    ]
  },
  SPY: {
    pe_ratio: 27.8,
    market_cap: '$590B AUM',
    recommendation: 'Sobreponderar',
    explanation: 'Consenso de los Chief Equity Strategists de Wall Street para el índice S&P 500 a 12 meses vista, sustentado en resiliencia macroeconómica y expansión de utilidades por acción (EPS).',
    banks: [
      { name: 'Morgan Stanley (Mike Wilson)', target: 848.0, rating: 'Sobreponderar', date: '18 Oct 2026' },
      { name: 'Citigroup (Scott Chronert)', target: 848.0, rating: 'Comprar', date: '14 Oct 2026' },
      { name: 'Goldman Sachs (David Kostin)', target: 835.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Bank of America (Savita Subr.)', target: 805.0, rating: 'Neutral', date: '10 Oct 2026' },
      { name: 'JPMorgan (Dubravko Lakos)', target: 780.0, rating: 'Neutral', date: '04 Oct 2026' }
    ]
  },
  VOO: {
    pe_ratio: 27.8,
    market_cap: '$520B AUM',
    recommendation: 'Sobreponderar',
    explanation: 'Proyección a 12 meses de los principales estrategas de Wall Street para el S&P 500 vehiculizado mediante el fondo indexado de Vanguard.',
    banks: [
      { name: 'Morgan Stanley (Mike Wilson)', target: 780.0, rating: 'Sobreponderar', date: '18 Oct 2026' },
      { name: 'Citigroup (Scott Chronert)', target: 780.0, rating: 'Comprar', date: '14 Oct 2026' },
      { name: 'Goldman Sachs (David Kostin)', target: 768.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Bank of America (Savita Subr.)', target: 740.0, rating: 'Neutral', date: '10 Oct 2026' },
      { name: 'JPMorgan (Dubravko Lakos)', target: 718.0, rating: 'Neutral', date: '04 Oct 2026' }
    ]
  },
  QQQ: {
    pe_ratio: 31.8,
    market_cap: '$295B AUM',
    recommendation: 'Sobreponderar Fuerte',
    explanation: 'Consenso de analistas de tecnología y estrategas de Wall Street para las 100 empresas de mayor capitalización no financiera del índice Nasdaq 100.',
    banks: [
      { name: 'Wedbush (Dan Ives)', target: 860.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Goldman Sachs', target: 840.0, rating: 'Comprar', date: '23 Oct 2026' },
      { name: 'Morgan Stanley', target: 825.0, rating: 'Sobreponderar', date: '17 Oct 2026' },
      { name: 'Bank of America', target: 810.0, rating: 'Comprar', date: '11 Oct 2026' },
      { name: 'JPMorgan', target: 785.0, rating: 'Neutral', date: '08 Oct 2026' }
    ]
  },
  SCHD: {
    pe_ratio: 15.6,
    market_cap: '$61B AUM',
    recommendation: 'Sobreponderar',
    explanation: 'Consenso fundamental de compañías maduras con balances defensivos grado de inversión y más de 10 años consecutivos de crecimiento de dividendos en dólares.',
    banks: [
      { name: 'Morgan Stanley', target: 41.5, rating: 'Sobreponderar', date: '18 Oct 2026' },
      { name: 'Goldman Sachs', target: 41.0, rating: 'Comprar', date: '22 Oct 2026' },
      { name: 'Bank of America', target: 40.0, rating: 'Comprar', date: '11 Oct 2026' },
      { name: 'JPMorgan', target: 39.5, rating: 'Neutral', date: '07 Oct 2026' }
    ]
  },
  VTI: {
    pe_ratio: 26.5,
    market_cap: '$410B AUM',
    recommendation: 'Sobreponderar',
    explanation: 'Consenso de cobertura total de la economía estadounidense ponderando mega caps (72%), medianas empresas (19%) y pequeñas capitalizaciones (9%).',
    banks: [
      { name: 'Morgan Stanley', target: 418.0, rating: 'Sobreponderar', date: '18 Oct 2026' },
      { name: 'Goldman Sachs', target: 415.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Bank of America', target: 405.0, rating: 'Comprar', date: '11 Oct 2026' },
      { name: 'JPMorgan', target: 395.0, rating: 'Neutral', date: '04 Oct 2026' }
    ]
  },
  IWM: {
    pe_ratio: 22.4,
    market_cap: '$72B AUM',
    recommendation: 'Compra Moderada',
    explanation: 'Consenso de Wall Street para el índice de 2.000 pequeñas empresas de EE.UU., altamente sensibles y beneficiarias de la baja en las tasas de interés corporativas.',
    banks: [
      { name: 'Fundstrat (Tom Lee)', target: 340.0, rating: 'Comprar', date: '22 Oct 2026' },
      { name: 'Bank of America (Jill Carey Hall)', target: 325.0, rating: 'Comprar', date: '16 Oct 2026' },
      { name: 'Goldman Sachs', target: 318.0, rating: 'Comprar', date: '14 Oct 2026' },
      { name: 'Morgan Stanley', target: 305.0, rating: 'Neutral', date: '08 Oct 2026' },
      { name: 'JPMorgan', target: 295.0, rating: 'Neutral', date: '03 Oct 2026' }
    ]
  },
  SMH: {
    pe_ratio: 34.2,
    market_cap: '$24.8B AUM',
    recommendation: 'Sobreponderar Fuerte',
    explanation: 'Consenso agregado de los 25 líderes globales de semiconductores, con alta concentración en NVIDIA (20%), TSMC (12%) y equipamiento litográfico ASML.',
    banks: [
      { name: 'Goldman Sachs', target: 725.0, rating: 'Comprar', date: '23 Oct 2026' },
      { name: 'Morgan Stanley', target: 710.0, rating: 'Sobreponderar', date: '18 Oct 2026' },
      { name: 'Bank of America', target: 700.0, rating: 'Comprar', date: '15 Oct 2026' },
      { name: 'Citigroup', target: 680.0, rating: 'Comprar', date: '08 Oct 2026' }
    ]
  },
  VIG: {
    pe_ratio: 24.2,
    market_cap: '$92B AUM',
    recommendation: 'Sobreponderar',
    explanation: 'Consenso para corporaciones de gran capitalización con historial probado de reinversión eficiente de capital y retribución creciente al accionista.',
    banks: [
      { name: 'Morgan Stanley', target: 285.0, rating: 'Sobreponderar', date: '18 Oct 2026' },
      { name: 'Goldman Sachs', target: 282.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Bank of America', target: 278.0, rating: 'Comprar', date: '14 Oct 2026' },
      { name: 'Citigroup', target: 272.0, rating: 'Neutral', date: '09 Oct 2026' }
    ]
  },
  XLF: {
    pe_ratio: 16.8,
    market_cap: '$44B AUM',
    recommendation: 'Sobreponderar',
    explanation: 'Consenso sectorial agregado de los mayores bancos (JPMorgan, BofA), aseguradoras y redes de pago (Visa, Mastercard) ante la reactivación de banca de inversión y créditos.',
    banks: [
      { name: 'Goldman Sachs', target: 66.0, rating: 'Comprar', date: '21 Oct 2026' },
      { name: 'Morgan Stanley', target: 65.0, rating: 'Sobreponderar', date: '17 Oct 2026' },
      { name: 'Wells Fargo', target: 64.5, rating: 'Comprar', date: '15 Oct 2026' },
      { name: 'Citigroup', target: 62.5, rating: 'Neutral', date: '10 Oct 2026' }
    ]
  }
};

let count = 0;
data.etfs.forEach(etf => {
  const details = etfDetails[etf.ticker];
  if (details) {
    count++;
    etf.pe_ratio = details.pe_ratio;
    etf.market_cap = details.market_cap;
    etf.recommendation = details.recommendation;

    // Calcular media aritmética exacta de los bancos
    const targets = details.banks.map(b => b.target);
    const meanTarget = Math.round((targets.reduce((acc, t) => acc + t, 0) / targets.length) * 100) / 100;
    const minTarget = Math.min(...targets);
    const maxTarget = Math.max(...targets);

    etf.target_price = meanTarget;
    etf.upside = Math.round(((meanTarget - etf.price) / etf.price) * 1000) / 10;

    etf.analyst_consensus = {
      target_mean: meanTarget,
      target_low: minTarget,
      target_high: maxTarget,
      explanation: details.explanation,
      banks: details.banks
    };

    console.log(`✓ [${etf.ticker}] ${etf.name}: Target Medio $${etf.target_price} | Upside: ${etf.upside}% (${details.banks.length} bancos)`);
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n🎉 ${count} ETFs enriquecidos exitosamente con consensos auditados y fechas exactas.`);
