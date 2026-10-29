/**
 * scripts/macro_service.js
 * Servicio de extracción automatizada de tasas macroeconómicas oficiales (FED)
 * con tolerancia a fallos, mecanismo de fallback y sistema de alertas críticas.
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');

// Valores de fallback especificados en caso de caída total de APIs
const FALLBACK_MACRO = {
  tasa_actual_fed: 5.0,
  tasa_proyectada_fed_1a: 4.25,
  is_fallback: true,
  source: 'Valores de Fallback de Contingencia (Fed actual: 5.0%, Proyectada: 4.25%)'
};

/**
 * Notifica un fallo crítico en la extracción de tasas macroeconómicas.
 * Registra en consola con formato destacado, persiste en logs/macro_alerts.log
 * y despacha notificación inmediata a webhook (Discord/Slack/Telegram) si está configurado.
 */
async function notificarFalloMacro(error) {
  const timestamp = new Date().toISOString();
  const alertMessage = '¡ALERTA CRÍTICA!: Falló el fetch automatizado de tasas macroeconómicas. Usando valores de fallback.';

  // 1. Log crítico destacado en consola / stderr
  console.error('\n' + '='.repeat(80));
  console.error(`🚨 ${alertMessage}`);
  console.error(`🕒 Timestamp: ${timestamp}`);
  console.error(`🔍 Detalle del error: ${error?.message || error}`);
  if (error?.stack) {
    console.error(`📋 Stack Trace:\n${error.stack}`);
  }
  console.error('='.repeat(80) + '\n');

  // 2. Registro persistente en archivo de log
  try {
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, 'macro_alerts.log');
    const logEntry = `[${timestamp}] CRITICAL: ${alertMessage} | Detalle: ${error?.message || error}\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (fsErr) {
    console.error('⚠️ Error escribiendo archivo de log de alertas:', fsErr.message);
  }

  // 3. Envío de webhook si existe variable de entorno MACRO_ALERT_WEBHOOK_URL
  const webhookUrl = process.env.MACRO_ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **${alertMessage}**\n**Error:** \`${error?.message || error}\`\n**Timestamp:** ${timestamp}\n**Acción:** Se activaron tasas de fallback (5.00% / 4.25%).`
        }),
        signal: AbortSignal.timeout(4000)
      });
      console.log('📡 [WEBHOOK]: Alerta enviada con éxito al canal de monitoreo.');
    } catch (whErr) {
      console.error('⚠️ Error al disparar Webhook de alerta:', whErr.message);
    }
  } else {
    console.log('📢 [SIMULACIÓN WEBHOOK / ALERTA]: Notificación registrada en consola del servidor y archivo logs/macro_alerts.log.');
  }
}

/**
 * Obtiene las tasas de la Fed en vivo (Actual y Proyectada a 1 Año).
 * Bloque Try: Intenta consumir la API oficial del Federal Reserve Bank of New York (EFFR)
 * y como respaldo secundario Yahoo Finance (^IRX).
 * Bloque Catch: Captura cualquier error de red/formato, dispara notificarFalloMacro(error)
 * y retorna de forma transparente los valores de fallback.
 */
async function fetchMacroRates(options = {}) {
  // Flag para pruebas unitarias forzando error
  if (options.forceError) {
    try {
      throw new Error('Prueba de fallo simulada: Conexión rechazada por API remota (ETIMEDOUT)');
    } catch (simError) {
      await notificarFalloMacro(simError);
      return {
        ...FALLBACK_MACRO,
        error_message: simError.message,
        last_fetched: new Date().toISOString()
      };
    }
  }

  try {
    // 1. INTENTO DE FETCH AUTOMÁTICO (Bloque Try)
    // Fuente Primaria Oficial: Federal Reserve Bank of New York (EFFR & SOFR)
    const nyFedUrl = 'https://markets.newyorkfed.org/api/rates/all/latest.json';
    const res = await fetch(nyFedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      throw new Error(`NY Fed API respondió con status HTTP ${res.status}`);
    }

    const json = await res.json();
    const effr = json?.refRates?.find((r) => r.type === 'EFFR');

    if (!effr || typeof effr.percentRate !== 'number') {
      throw new Error('Estructura de respuesta inválida: no se encontró registro EFFR con percentRate numérico.');
    }

    const tasa_actual_fed = Math.round(effr.percentRate * 100) / 100;

    // Expectativa de recorte proyectada a 1 año (~75 bps de recorte según curva SOFR/Dot Plot)
    let spread_1a = 0.75;
    const sofrai = json?.refRates?.find((r) => r.type === 'SOFRAI');
    if (sofrai && sofrai.average30day && sofrai.average180day) {
      const slope = sofrai.average30day - sofrai.average180day;
      if (slope > 0) {
        spread_1a = Math.min(1.25, Math.max(0.5, Math.round(slope * 4 * 100) / 100));
      }
    }

    const tasa_proyectada_fed_1a = Math.round((tasa_actual_fed - spread_1a) * 100) / 100;

    return {
      tasa_actual_fed,
      tasa_proyectada_fed_1a,
      is_fallback: false,
      source: `Federal Reserve Bank of New York (EFFR: ${tasa_actual_fed}%, Proyección 1A: ${tasa_proyectada_fed_1a}%)`,
      effective_date: effr.effectiveDate,
      last_fetched: new Date().toISOString()
    };
  } catch (error) {
    // Intento de respaldo secundario rápido con Yahoo Finance (^IRX) antes de ir a fallback
    try {
      console.warn(`⚠️ Intento primario falló (${error.message}). Intentando fuente secundaria (Yahoo ^IRX)...`);
      const yUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EIRX?interval=1d&range=1d';
      const yRes = await fetch(yUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(4000)
      });
      if (yRes.ok) {
        const yJson = await yRes.json();
        const yPrice = yJson?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (typeof yPrice === 'number' && yPrice > 0) {
          const tasa_actual_fed = Math.round(yPrice * 100) / 100;
          const tasa_proyectada_fed_1a = Math.round((tasa_actual_fed - 0.75) * 100) / 100;
          return {
            tasa_actual_fed,
            tasa_proyectada_fed_1a,
            is_fallback: false,
            source: `Yahoo Finance Treasury Bill (^IRX: ${tasa_actual_fed}%)`,
            last_fetched: new Date().toISOString()
          };
        }
      }
    } catch {
      // Ignorar para proceder al catch principal
    }

    // 2. SISTEMA DE RESPALDO Y ALERTAS (Bloque Catch/Except)
    await notificarFalloMacro(error);

    return {
      ...FALLBACK_MACRO,
      error_message: error.message,
      last_fetched: new Date().toISOString()
    };
  }
}

module.exports = {
  fetchMacroRates,
  notificarFalloMacro,
  FALLBACK_MACRO
};
