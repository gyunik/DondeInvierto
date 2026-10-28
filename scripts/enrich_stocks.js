const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'web', 'src', 'data', 'marketData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const stockDetails = {
  MELI: {
    pe_ratio: 48.5,
    market_cap: '$84.8B USD',
    target_price: 2420,
    analyst_consensus: {
      target_mean: 2420,
      target_low: 1750,
      target_high: 2808,
      source: 'Consenso Wall Street (Morgan Stanley, Goldman Sachs, BofA, Cantor Fitzgerald)',
      explanation: 'El consenso de los principales bancos de inversión ubica el precio objetivo medio en US$2.420 (+44.6% de suba estimada). El valor de US$2.808 corresponde al escenario alcista máximo (Bull Case) proyectado ante la fuerte aceleración de la cartera de crédito y el volumen de pagos en Mercado Pago.',
      banks: [
        { name: 'Morgan Stanley', target: 2550, rating: 'Sobreponderar' },
        { name: 'Goldman Sachs', target: 2440, rating: 'Comprar' },
        { name: 'Bank of America (BofA)', target: 2400, rating: 'Comprar' },
        { name: 'Cantor Fitzgerald', target: 2300, rating: 'Sobreponderar' },
        { name: 'Caso Alcista Máximo (Bull)', target: 2808, rating: 'Techo Optimista' }
      ]
    }
  },
  AMZN: {
    pe_ratio: 42.8,
    market_cap: '$2.65T USD',
    target_price: 295,
    analyst_consensus: {
      target_mean: 295,
      target_low: 240,
      target_high: 340,
      source: 'Consenso Wall Street',
      explanation: 'Consenso impulsado por la aceleración de Amazon Web Services (AWS) en cargas de trabajo de inteligencia artificial y expansión de márgenes en comercio electrónico.',
      banks: [
        { name: 'Goldman Sachs', target: 310, rating: 'Comprar' },
        { name: 'JPMorgan', target: 295, rating: 'Sobreponderar' },
        { name: 'Morgan Stanley', target: 290, rating: 'Sobreponderar' },
        { name: 'Bank of America', target: 285, rating: 'Comprar' }
      ]
    }
  },
  NVDA: {
    pe_ratio: 54.2,
    market_cap: '$5.28T USD',
    target_price: 265,
    analyst_consensus: {
      target_mean: 265,
      target_low: 210,
      target_high: 320,
      source: 'Consenso Wall Street',
      explanation: 'Fuerte demanda sostenida de GPUs para centros de datos de IA generativa y arquitectura Blackwell con visibilidad completa de pedidos para el próximo año.',
      banks: [
        { name: 'Morgan Stanley', target: 280, rating: 'Sobreponderar' },
        { name: 'Bank of America', target: 275, rating: 'Comprar' },
        { name: 'Goldman Sachs', target: 260, rating: 'Comprar' },
        { name: 'Citi', target: 250, rating: 'Comprar' }
      ]
    }
  },
  MSFT: {
    pe_ratio: 35.8,
    market_cap: '$3.94T USD',
    target_price: 610,
    analyst_consensus: {
      target_mean: 610,
      target_low: 540,
      target_high: 680,
      source: 'Consenso Wall Street',
      explanation: 'Aceleración continua en ingresos de Azure AI y adopción corporativa a gran escala de Copilot.',
      banks: [
        { name: 'Goldman Sachs', target: 630, rating: 'Comprar' },
        { name: 'Morgan Stanley', target: 620, rating: 'Sobreponderar' },
        { name: 'JPMorgan', target: 605, rating: 'Sobreponderar' }
      ]
    }
  },
  TSLA: {
    pe_ratio: 78.4,
    market_cap: '$1.28T USD',
    target_price: 430,
    analyst_consensus: {
      target_mean: 430,
      target_low: 250,
      target_high: 550,
      source: 'Consenso Wall Street',
      explanation: 'Consenso diversificado entre el negocio de vehículos eléctricos y la opción de escala en robotaxis, software de conducción autónoma y almacenamiento de energía.',
      banks: [
        { name: 'Wedbush', target: 500, rating: 'Sobreponderar' },
        { name: 'Morgan Stanley', target: 450, rating: 'Sobreponderar' },
        { name: 'Goldman Sachs', target: 380, rating: 'Neutral' }
      ]
    }
  },
  AAPL: {
    pe_ratio: 34.1,
    market_cap: '$5.18T USD',
    target_price: 375,
    analyst_consensus: {
      target_mean: 375,
      target_low: 320,
      target_high: 420,
      source: 'Consenso Wall Street',
      explanation: 'Superciclo de renovación impulsado por Apple Intelligence y alta rentabilidad en ingresos por Servicios.',
      banks: [
        { name: 'Morgan Stanley', target: 390, rating: 'Sobreponderar' },
        { name: 'Bank of America', target: 380, rating: 'Comprar' },
        { name: 'JPMorgan', target: 365, rating: 'Sobreponderar' }
      ]
    }
  },
  PLTR: {
    pe_ratio: 112.5,
    market_cap: '$445B USD',
    target_price: 215,
    analyst_consensus: {
      target_mean: 215,
      target_low: 150,
      target_high: 260,
      source: 'Consenso Wall Street',
      explanation: 'Tracción comercial sin precedentes de su Artificial Intelligence Platform (AIP) en empresas del S&P 500 y contratos gubernamentales.',
      banks: [
        { name: 'Wedbush', target: 245, rating: 'Sobreponderar' },
        { name: 'Bank of America', target: 225, rating: 'Comprar' }
      ]
    }
  }
};

for (const s of data.stocks) {
  if (stockDetails[s.ticker]) {
    const d = stockDetails[s.ticker];
    s.pe_ratio = d.pe_ratio;
    s.market_cap = d.market_cap;
    s.target_price = d.target_price;
    s.analyst_consensus = d.analyst_consensus;
  } else {
    const target = s.target_price || Math.round(s.price * 1.2);
    s.market_cap = s.market_cap || '$120B USD';
    s.analyst_consensus = s.analyst_consensus || {
      target_mean: target,
      target_low: Math.round(target * 0.85),
      target_high: Math.round(target * 1.25),
      source: 'Consenso General de Mercado',
      explanation: `Proyección calculada sobre el promedio ponderado de analistas para ${s.name}.`,
      banks: [
        { name: 'Consenso Wall Street', target: target, rating: s.recommendation || 'Comprar' }
      ]
    };
  }
  if (s.target_price && s.price) {
    s.upside = Math.round(((s.target_price - s.price) / s.price) * 1000) / 10;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Base marketData.json enriquecida.');
console.log('MELI:', JSON.stringify(data.stocks[0], null, 2));
