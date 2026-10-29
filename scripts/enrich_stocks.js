/**
 * scripts/enrich_stocks.js
 * Sanea y enriquece los 20 CEDEARs con métricas fundamentales y consenso
 * exclusivo de Bancos de Inversión Tier-1 globales.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'web', 'src', 'data', 'marketData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const stockDetails = {
  MELI: {
    pe_ratio: 48.5,
    market_cap: '$84.8B USD',
    explanation: 'Consenso de los principales bancos de inversión globales ante la fuerte aceleración de la cartera de crédito y el volumen de pagos en Mercado Pago.',
    banks: [
      { name: 'Barclays', target: 2800, rating: 'Sobreponderar' },
      { name: 'Citigroup', target: 2750, rating: 'Comprar' },
      { name: 'Morgan Stanley', target: 2550, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 2440, rating: 'Comprar' },
      { name: 'Bank of America (BofA)', target: 2400, rating: 'Comprar' }
    ]
  },
  AMZN: {
    pe_ratio: 42.8,
    market_cap: '$2.65T USD',
    explanation: 'Consenso impulsado por la aceleración de Amazon Web Services (AWS) en cargas de trabajo de IA y expansión de márgenes operativos en e-commerce.',
    banks: [
      { name: 'Goldman Sachs', target: 310, rating: 'Comprar' },
      { name: 'JPMorgan', target: 295, rating: 'Sobreponderar' },
      { name: 'Morgan Stanley', target: 290, rating: 'Sobreponderar' },
      { name: 'Bank of America', target: 285, rating: 'Comprar' }
    ]
  },
  AMD: {
    pe_ratio: 45.2,
    market_cap: '$935B USD',
    explanation: 'Creciente penetración de procesadores EPYC en centros de datos corporativos y expansión de la línea de aceleradores de IA Instinct.',
    banks: [
      { name: 'Goldman Sachs', target: 650, rating: 'Comprar' },
      { name: 'Morgan Stanley', target: 630, rating: 'Sobreponderar' },
      { name: 'Bank of America', target: 620, rating: 'Comprar' },
      { name: 'Citigroup', target: 600, rating: 'Comprar' }
    ]
  },
  UBER: {
    pe_ratio: 32.4,
    market_cap: '$138B USD',
    explanation: 'Monetización récord de publicidad en app, alta retención del programa de membresías Uber One y sólido flujo libre de caja.',
    banks: [
      { name: 'JPMorgan', target: 95, rating: 'Sobreponderar' },
      { name: 'Morgan Stanley', target: 92, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 90, rating: 'Comprar' },
      { name: 'Bank of America', target: 88, rating: 'Comprar' }
    ]
  },
  TSLA: {
    pe_ratio: 78.4,
    market_cap: '$1.28T USD',
    explanation: 'Valuación impulsada por avances en conducción autónoma supervisada (FSD), almacenamiento de energía Megapack y el despliegue del ecosistema de robotaxis.',
    banks: [
      { name: 'Morgan Stanley', target: 450, rating: 'Sobreponderar' },
      { name: 'Barclays', target: 440, rating: 'Sobreponderar' },
      { name: 'Bank of America', target: 420, rating: 'Neutral' },
      { name: 'Goldman Sachs', target: 410, rating: 'Neutral' }
    ]
  },
  PLTR: {
    pe_ratio: 112.5,
    market_cap: '$445B USD',
    explanation: 'Tracción comercial masiva de Artificial Intelligence Platform (AIP) en empresas del S&P 500 y renovación de contratos gubernamentales estratégicos.',
    banks: [
      { name: 'Bank of America', target: 230, rating: 'Comprar' },
      { name: 'Citigroup', target: 220, rating: 'Comprar' },
      { name: 'Goldman Sachs', target: 215, rating: 'Neutral' },
      { name: 'Morgan Stanley', target: 195, rating: 'Neutral' }
    ]
  },
  CRM: {
    pe_ratio: 38.6,
    market_cap: '$234B USD',
    explanation: 'Monetización creciente de Agentforce (agentes autónomos de IA empresarial) y expansión sostenida del margen operativo mediante recompras de acciones.',
    banks: [
      { name: 'Morgan Stanley', target: 340, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 335, rating: 'Comprar' },
      { name: 'JPMorgan', target: 330, rating: 'Sobreponderar' },
      { name: 'Citigroup', target: 325, rating: 'Comprar' }
    ]
  },
  NOW: {
    pe_ratio: 44.1,
    market_cap: '$154B USD',
    explanation: 'Plataforma indispensable de digitalización de flujos de trabajo corporativos con retención neta superior al 98% y adopción veloz de Now Assist.',
    banks: [
      { name: 'Morgan Stanley', target: 190, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 185, rating: 'Comprar' },
      { name: 'JPMorgan', target: 185, rating: 'Sobreponderar' },
      { name: 'Bank of America', target: 180, rating: 'Comprar' }
    ]
  },
  PANW: {
    pe_ratio: 51.3,
    market_cap: '$132B USD',
    explanation: 'Liderazgo consolidado en ciberseguridad corporativa bajo estrategia de plataformización integral (Prisma Cloud, Cortex y Strata).',
    banks: [
      { name: 'Goldman Sachs', target: 460, rating: 'Comprar' },
      { name: 'Morgan Stanley', target: 450, rating: 'Sobreponderar' },
      { name: 'JPMorgan', target: 445, rating: 'Sobreponderar' },
      { name: 'Barclays', target: 440, rating: 'Sobreponderar' }
    ]
  },
  NFLX: {
    pe_ratio: 31.8,
    market_cap: '$120B USD',
    explanation: 'Escala indiscutida en streaming global, expansión de márgenes operativos hacia el 35%, ingresos publicitarios en alza y fuerte flujo de caja libre.',
    banks: [
      { name: 'JPMorgan', target: 88, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 86, rating: 'Comprar' },
      { name: 'Morgan Stanley', target: 84, rating: 'Sobreponderar' },
      { name: 'Bank of America', target: 80, rating: 'Comprar' }
    ]
  },
  MSFT: {
    pe_ratio: 35.8,
    market_cap: '$3.94T USD',
    explanation: 'Crecimiento acelerado en infraestructura Azure AI y monetización a gran escala de copilotos de productividad empresarial en Microsoft 365.',
    banks: [
      { name: 'Goldman Sachs', target: 630, rating: 'Comprar' },
      { name: 'Morgan Stanley', target: 620, rating: 'Sobreponderar' },
      { name: 'JPMorgan', target: 605, rating: 'Sobreponderar' },
      { name: 'Bank of America', target: 585, rating: 'Comprar' }
    ]
  },
  NVDA: {
    pe_ratio: 54.2,
    market_cap: '$5.28T USD',
    explanation: 'Demanda insatisfecha de arquitecturas Blackwell y Rubin para clústeres de centros de datos de IA generativa con visibilidad total de órdenes.',
    banks: [
      { name: 'Morgan Stanley', target: 280, rating: 'Sobreponderar' },
      { name: 'Bank of America', target: 275, rating: 'Comprar' },
      { name: 'Goldman Sachs', target: 260, rating: 'Comprar' },
      { name: 'Citigroup', target: 245, rating: 'Comprar' }
    ]
  },
  AAPL: {
    pe_ratio: 34.1,
    market_cap: '$5.18T USD',
    explanation: 'Superciclo de renovación de hardware respaldado por Apple Intelligence y márgenes brutos récord en la división de Servicios.',
    banks: [
      { name: 'Morgan Stanley', target: 390, rating: 'Sobreponderar' },
      { name: 'Bank of America', target: 380, rating: 'Comprar' },
      { name: 'JPMorgan', target: 370, rating: 'Sobreponderar' },
      { name: 'Barclays', target: 360, rating: 'Neutral' }
    ]
  },
  GOOGL: {
    pe_ratio: 25.4,
    market_cap: '$3.98T USD',
    explanation: 'Resiliencia sobresaliente en Search & YouTube Ads, aceleración sostenida en Google Cloud y liderazgo en modelos multimodales Gemini.',
    banks: [
      { name: 'Morgan Stanley', target: 365, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 360, rating: 'Comprar' },
      { name: 'JPMorgan', target: 355, rating: 'Sobreponderar' },
      { name: 'Citigroup', target: 350, rating: 'Comprar' }
    ]
  },
  META: {
    pe_ratio: 26.2,
    market_cap: '$1.55T USD',
    explanation: 'Eficiencia publicitaria impulsada por motores de recomendación de IA Advantage+, monetización de Reels y disciplina de gastos operativos.',
    banks: [
      { name: 'JPMorgan', target: 750, rating: 'Sobreponderar' },
      { name: 'Morgan Stanley', target: 740, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 730, rating: 'Comprar' },
      { name: 'Bank of America', target: 720, rating: 'Comprar' }
    ]
  },
  KO: {
    pe_ratio: 24.8,
    market_cap: '$395B USD',
    explanation: 'Poder de fijación de precios inigualable, diversificación en bebidas listas para consumir (RTD) y dividendo predecible y creciente.',
    banks: [
      { name: 'JPMorgan', target: 102, rating: 'Sobreponderar' },
      { name: 'Morgan Stanley', target: 100, rating: 'Sobreponderar' },
      { name: 'UBS', target: 98, rating: 'Comprar' },
      { name: 'Wells Fargo', target: 96, rating: 'Comprar' }
    ]
  },
  JPM: {
    pe_ratio: 13.5,
    market_cap: '$960B USD',
    explanation: 'Fortaleza patrimonial de primer nivel, liderazgo en banca corporativa e ingresos récord por intermediación financiera.',
    banks: [
      { name: 'Morgan Stanley', target: 380, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 375, rating: 'Comprar' },
      { name: 'Bank of America', target: 370, rating: 'Comprar' },
      { name: 'UBS', target: 365, rating: 'Neutral' }
    ]
  },
  LLY: {
    pe_ratio: 46.8,
    market_cap: '$1.22T USD',
    explanation: 'Dominio global en tratamientos para obesidad y diabetes (Mounjaro y Zepbound) con expansiones industriales de capacidad productiva.',
    banks: [
      { name: 'Morgan Stanley', target: 1420, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 1400, rating: 'Comprar' },
      { name: 'JPMorgan', target: 1380, rating: 'Sobreponderar' },
      { name: 'Citigroup', target: 1360, rating: 'Comprar' }
    ]
  },
  TXN: {
    pe_ratio: 32.1,
    market_cap: '$281B USD',
    explanation: 'Liderazgo en semiconductores analógicos e incrustados para automatización industrial y automotriz con ventajas de escala en fabricación.',
    banks: [
      { name: 'Morgan Stanley', target: 350, rating: 'Sobreponderar' },
      { name: 'Bank of America', target: 345, rating: 'Comprar' },
      { name: 'Goldman Sachs', target: 340, rating: 'Neutral' },
      { name: 'UBS', target: 335, rating: 'Neutral' }
    ]
  },
  JNJ: {
    pe_ratio: 22.3,
    market_cap: '$652B USD',
    explanation: 'Modelo comercial enfocado en productos farmacéuticos innovadores y tecnología médica de alta precisión tras la escisión de Kenvue.',
    banks: [
      { name: 'JPMorgan', target: 305, rating: 'Sobreponderar' },
      { name: 'Morgan Stanley', target: 300, rating: 'Sobreponderar' },
      { name: 'Goldman Sachs', target: 295, rating: 'Comprar' },
      { name: 'Wells Fargo', target: 290, rating: 'Neutral' }
    ]
  }
};

for (const s of data.stocks) {
  const d = stockDetails[s.ticker];
  if (!d) {
    console.warn(`⚠️ No hay detalle configurado para ${s.ticker}`);
    continue;
  }

  s.pe_ratio = d.pe_ratio;
  s.market_cap = d.market_cap;

  // Cálculo matemático exacto del precio objetivo (promedio de los bancos Tier-1)
  const bankTargets = d.banks.map(b => b.target);
  const sum = bankTargets.reduce((acc, val) => acc + val, 0);
  const avg = Math.round((sum / bankTargets.length) * 100) / 100;
  const minTarget = Math.min(...bankTargets);
  const maxTarget = Math.max(...bankTargets);

  s.target_price = avg;

  const bankNames = d.banks.map(b => b.name).join(', ');
  s.analyst_consensus = {
    target_mean: avg,
    target_low: minTarget,
    target_high: maxTarget,
    source: `Consenso Bancos Tier-1 (${bankNames})`,
    explanation: d.explanation,
    banks: d.banks
  };

  // Upside porcentual riguroso
  if (s.price && s.price > 0) {
    s.upside = Math.round(((s.target_price - s.price) / s.price) * 1000) / 10;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Base marketData.json enriquecida con bancos Tier-1 exclusivos.');
