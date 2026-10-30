/**
 * scripts/build_sp500_universe.js
 * Descarga los componentes oficiales del S&P 500, cruza con la base de CEDEARs
 * autorizados en Argentina y genera scripts/sp500_universe.json
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🌐 Descargando lista oficial del S&P 500...');
  const url = 'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const csvText = await res.text();

  const lines = csvText.trim().split('\n').slice(1);
  const cedearMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'cedear_ratios.json'), 'utf8'));

  // Lista base de ADRs populares que no están en el S&P 500 por ser extranjeras pero tienen alto volumen de CEDEAR
  const topAdrs = [
    { ticker: 'MELI', name: 'MercadoLibre, Inc.', sector: 'Comercio Electrónico & Fintech', has_cedear: true, cedear_ratio: '120:1' },
    { ticker: 'TSM', name: 'Taiwan Semiconductor', sector: 'Semiconductores', has_cedear: true, cedear_ratio: '9:1' },
    { ticker: 'BABA', name: 'Alibaba Group', sector: 'E-Commerce & Cloud', has_cedear: true, cedear_ratio: '9:1' },
    { ticker: 'SPOT', name: 'Spotify Technology', sector: 'Streaming & Música', has_cedear: true, cedear_ratio: '14:1' },
    { ticker: 'SHOP', name: 'Shopify Inc.', sector: 'Software & E-Commerce', has_cedear: true, cedear_ratio: '15:1' },
    { ticker: 'SNOW', name: 'Snowflake Inc.', sector: 'Cloud Data Platform', has_cedear: true, cedear_ratio: '15:1' },
    { ticker: 'VALE', name: 'Vale S.A.', sector: 'Minería & Materiales', has_cedear: true, cedear_ratio: '2:1' },
    { ticker: 'PBR', name: 'Petrobras', sector: 'Petróleo & Gas', has_cedear: true, cedear_ratio: '1:1' }
  ];

  const universe = [];
  const seenTickers = new Set();

  // 1. Agregar ADRs clave
  topAdrs.forEach(adr => {
    universe.push(adr);
    seenTickers.add(adr.ticker);
  });

  // 2. Procesar S&P 500
  lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 3) {
      let ticker = parts[0].replace(/"/g, '').trim();
      // Casos como BRK.B -> BRK-B para Yahoo Finance
      if (ticker === 'BRK.B') ticker = 'BRK-B';
      if (ticker === 'BF.B') ticker = 'BF-B';

      const name = parts[1].replace(/"/g, '').trim();
      const sector = parts[2].replace(/"/g, '').trim();

      if (!seenTickers.has(ticker)) {
        seenTickers.add(ticker);
        const hasCedear = !!cedearMap[ticker];
        universe.push({
          ticker,
          name,
          sector,
          has_cedear: hasCedear,
          cedear_ratio: hasCedear ? cedearMap[ticker] : null
        });
      }
    }
  });

  console.log(`✅ Universo generado: ${universe.length} acciones.`);
  const withCedear = universe.filter(u => u.has_cedear).length;
  console.log(`📊 Con CEDEAR en Argentina: ${withCedear} acciones.`);
  console.log(`🌐 Solo Broker Exterior: ${universe.length - withCedear} acciones.`);

  const outputPath = path.join(__dirname, 'sp500_universe.json');
  fs.writeFileSync(outputPath, JSON.stringify(universe, null, 2), 'utf8');
  console.log(`📁 Guardado en ${outputPath}`);
}

main().catch(err => {
  console.error('❌ Error construyendo universo:', err);
  process.exit(1);
});
