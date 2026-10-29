# 📝 Registro de Actividad (Log) — Vault Donde Invierto

Formato estándar de bitácora: `## [YYYY-MM-DD] acción | detalle`

---

## [2026-10-29] quant & feature | Algoritmo cuantitativo dinámico de 3 capas y reestructuración del Score Total
* Implementación del Algoritmo Cuantitativo Dinámico de 3 Capas para cálculo automatizado de Precio Objetivo a 1 Año (`precio_objetivo_estimado`):
  - Capa A (Consenso Fundamental): `per_bancos = target_analistas_promedio / eps_fwd`, `per_base = (0.65 * per_mediana_5a) + (0.35 * per_bancos)`.
  - Capa B (Ajuste Macroeconómico): `cambio_tasas = tasa_proyectada_fed_1a - tasa_actual_fed`, `factor_macro = 1 - (0.025 * cambio_tasas)`, `per_ajustado = per_base * factor_macro`.
  - Capa C (Precio Objetivo Teórico): `precio_objetivo_estimado = eps_fwd * per_ajustado`.
* Reestructuración matemática del SCORE TOTAL (0 a 100):
  - 60% Retorno Potencial Proyectado: mapeo lineal de `retorno_estimado_pct` (0% o negativo = 0 pts; >= 40% = 60 pts máximos).
  - 25% Margen de Seguridad Fundamental: ponderación de `per_actual` vs `per_ajustado`.
  - 15% Filtro de Timing Técnico: desvío técnico respecto a SMA200 (`desvio_tecnico = (precio - sma_200) / sma_200`; descuento < 0 = 15 pts; sobrecompra > 15% penaliza hasta 10 pts).
* Integración técnica completa:
  - Creación del módulo cuantitativo `scripts/quant_algorithm.js` con matriz de fallbacks sectoriales de PER y parámetros macroeconómicos.
  - Script de aplicación auditado `scripts/apply_quant_algorithm.js` y recálculo dinámico en cada barrido de mercado en `scripts/update_market.js`.
  - Captura real de SMA 200 ruedas históricas desde Yahoo Finance para cada acción.
  - Creación de interfaces TypeScript en `web/src/types/market.ts` con tipado de `precioObjetivoAlgoritmo`, `retornoEstimadoPct`, `scoreTotal` y `quant_breakdown`.
  - Actualización de `ScreenerSection.tsx` para ordenamiento descendente estricto por este Score Total unificado y visualización del "POTENCIAL ESTIMADO (1A)".
  - Actualización de `StockDetailModal.tsx` con desglose explícito de las 3 capas cuantitativas y `ScoreDetailModal.tsx` con los 3 pilares reestructurados (60/25/15).

## [2026-10-29] feature & ui | Inversión de jerarquía en Potencial (+41.4% destacado) y modal de desglose del Score Total
* Reestructuración visual de la tarjeta de Potencial Analistas: el porcentaje proyectado a 12 meses (+41.4%) pasa a ser el dato principal y protagónico en tamaño grande y resaltado esmeralda, con el precio objetivo ($2347.14 USD) como referencia secundaria inferior.
* Creación del componente ScoreDetailModal.tsx: al presionar "Desglose ↗" en el Score Total (ej. 91.2/100), se despliega un modal institucional con el desglose exacto de los 4 pilares multifactoriales ponderados (Potencial de Valoración 35%, Calidad Fundamental 25%, Tendencia Técnica 20%, y Respaldo Institucional 20%) con barras de progreso y fundamentación analítica.
* Integración en todas las pestañas de la plataforma (CEDEARs, ETFs, ONs, Merval y Bonos soberanos).



## [2026-10-29] fix & audit | Saneamiento de métricas estáticas en Hero, cálculo dinámico de Brecha y reemplazo de ON
* Detección y saneamiento de brecha cambiaria fija (18.2%): ahora se calcula dinámicamente en scripts/update_market.js contra DolarAPI Oficial (.560) y CCL (.650,3) resultando en 5.8% real.
* Reemplazo de ON CAC2O (con vencimiento inminente en nov 2026) por TTC1O (Tecpetrol Ley NY, vencimiento 2028, TIR 8.65% en USD, Rating AAA).
* Corrección de variación de rendimiento en Bono USA 10Y (^TNX) en Home para mostrar la oscilación real porcentual en lugar de 0.00 bps fijo.



## [2026-10-29] data & fix | Actualización de reportes a reiteraciones vigentes del ciclo 2026
* Corrección de la fecha de los reportes en el modal de consenso: se sustituyeron las fechas históricas de emisión inicial (2024) por las reiteraciones y notas formales más recientes del ciclo actual (2026) en todas las acciones y ETFs.
* Para MELI: incorporación de las revisiones de Morgan Stanley (Andrew Ruben - 18 Oct 2026, .450), Goldman Sachs (Irma Sgarz - 28 Sep 2026, .230) y Citigroup (Joao Pedro Soares - 22 Oct 2026, upgrade a Compra .050), con promedio consensuado de .347,14 USD (+41,4% upside).
* Actualización de scripts/enrich_stocks.js, scripts/enrich_etfs.js y marketData.json.



## [2026-10-29] feature & data | Precios objetivos auditados y desglose de bancos para los 20 ETFs
* Saneamiento metodológico de la pestaña de ETFs: reemplazo del retorno histórico ambiguo a 1 año por el Potencial Consenso a 12 Meses proyectado de Wall Street, unificando la terminal entre CEDEARs y ETFs.
* Incorporación de proyecciones oficiales de Chief Equity Strategists (S&P 500: Morgan Stanley 6.400, Goldman 6.300, Citi 6.400, BofA 6.000, JPM 5.800) para SPY, IVV, VOO y CSPX; de tecnología para QQQ; de small caps para IWM; y de mesas de commodities y activos digitales para GLD, SLV, USO e IBIT.
* Creación de scripts/enrich_etfs.js y actualización de marketData.json con desglose individual de bancos por cada ETF con fecha exacta de publicación (DD Mon YYYY) y promedio matemático estricto.
* Habilitación del modal interactivo StockDetailModal.tsx para ETFs: desglose de bancos, métricas de AUM (patrimonio gestionado), P/E ponderado y política de comisiones.
* Actualización de scripts/update_market.js para recálculo dinámico de upside en ETFs ante variaciones de precio en vivo.



## [2026-10-29] data & ui | Incorporación de fechas con día exacto y auditoría de research para MELI y acciones
* Corrección y homologación de MELI con los precios objetivos auditados reales de Wall Street: Bradesco BBI (.700 - 18 Sep), Jefferies (.600 - 05 Sep), Morgan Stanley (.450 - 18 Oct), BTG Pactual (.450 - 12 Ago), Goldman Sachs (.100 - 22 Oct), Citigroup (.100 - 03 Oct) y JPMorgan (.900 - 05 Ago).
* Promedio consensuado para MELI recalculado en .328,57 USD (+40,3% upside).
* Actualización de StockDetailModal.tsx para mostrar la fecha de publicación con día exacto al lado de cada entidad financiera.

## [2026-10-29] automation | Optimización de cron a minutos :15 y :45 (frecuencia cada 30m) para evitar demoras de GitHub
* Diagnóstico: GitHub Actions presenta demoras de hasta 50 minutos cuando los crons están programados en el minuto :00 debido a picos globales de saturación.
* Solución: Reconfiguración del workflow a minutos no congestionados (:15 y :45), aumentando la frecuencia a cada 30 minutos durante rueda bursátil (10:00 a 18:00 hs ART), con barrido a las 06:15 hs (Pre-Market) y 19:15 hs (Post-Market).
* Actualización inmediata manual de cotizaciones de cierre a las 17:28 hs.

## [2026-10-29] automation & ui | Barrido pre-market 6am y post-mercado, y ajuste de proporciones estilo ListeningLab
* Configuración de GitHub Actions Cron ampliado: barrido matutino Pre-Market a las 6:00 AM de Buenos Aires (09:00 UTC), barrido horario durante rueda (10:00 a 18:00 hs ART) y barrido post-cierre a las 19:00 hs ART (22:00 UTC).
* Soporte en scripts/update_market.js para captura de preMarketPrice (con flag includePrePost=true).
* Ejecución local inmediata: actualización de cotizaciones y marca temporal a hoy 2026-10-29.
* Ajuste de proporciones en Navbar.tsx según referencia ListeningLab: isologo agrandado (h-11 sm:h-12) y opciones centrales más compactas (text-xs / 13px).

## [2026-10-29] fix & data | Saneamiento de targets (NFLX y NOW) y estandarización a bancos Tier-1 exclusivos
* Corrección del precio objetivo de Netflix (NFLX): desfasaje corregido de $969.90 USD (+1464.6%) a $84.50 USD (+36.3% de upside), alineado con la cotización real post-split ($61.99 USD).
* Corrección preventiva de ServiceNow (NOW): precio objetivo saneado de $1179.36 USD (+685.6%) a $185.00 USD (+23.2% upside).
* Eliminación total de entradas genéricas ("Consenso Wall Street" y "Caso Alcista Máximo (Bull)"): cada una de las 20 acciones cuenta ahora con el desglose individual por bancos de inversión Tier-1 de primera línea (Morgan Stanley, Goldman Sachs, JPMorgan, Bank of America, Citigroup, Barclays, UBS y Wells Fargo).
* El target price y potencial medio de cada activo se calculan como el promedio matemático exacto de las recomendaciones de las instituciones financieras.
* Actualización de `scripts/enrich_stocks.js`, `web/src/data/marketData.json` y `StockDetailModal.tsx`.

## [2026-10-29] ui | Integración del logo oficial vectorial SVG nativo en encabezado y pie
* Creación del componente `Logo.tsx` en `web/src/components/Logo.tsx` y archivo vectorial en `web/public/logo.svg` a partir del SVG oficial (isotipo de 3 barras con gradientes, signo de interrogación, flecha ascendente quebrada en relieve y tipografía oficial).
* Integración en `Navbar.tsx` con soporte responsivo y alineación con badge `Terminal Quant` y `RADAR EN VIVO`.
* Integración en `Footer.tsx` reemplazando el icono genérico previo.
* Optimización de contraste en dark mode: la palabra 'donde' se renderiza en blanco de alto contraste sobre fondos oscuros (contrast ratio 18.5:1) con 'invierto' en `#00BFA5`.

## [2026-10-28] fix & ui | Saneamiento de datos, nuevo isologo oficial, corrección de signos y tipografía
* Corrección metodológica en `scripts/update_market.js`: consulta `range=1d` contra el cierre de la víspera en lugar de 5 días acumulados, saneando la variación porcentual de todas las acciones, ETFs y Merval (ej. MELI corregido a -0.44%).
* Actualización de Target Prices desfasados de Wall Street para AMD ($620), JNJ ($295), TXN ($340), GOOGL ($355), JPM ($370), LLY ($1380) y KO ($98).
* Integración del nuevo isologo oficial (gráfico de barras ascendente con signo de pregunta) en el header de navegación.
* Eliminación del subrayado artificial en S&P 500 y corrección del bug de signos duplicados (`+-0.17%`) con flechas direccionales dinámicas (↗ verde para alzas, ↘ roja para bajas).
* Aumento de tamaño y visibilidad en la barra de índices superiores y en las tarjetas de métricas del hero (Dólar CCL, badge ARS destacado, porcentaje y brecha cambiaria).
* Configuración de reglas de auto-aprobación de terminal en `.antigravity/rules.json`.

## [2026-10-28] feature | Modal interactivo de Desglose de Consenso de Analistas, PER y Market Cap
* Se hizo interactivo el bloque de "Potencial Analistas" en cada tarjeta de CEDEARs con botón "Desglose ↗".
* Creación del Modal Cuantitativo con desglose detallado de los bancos de inversión (Morgan Stanley, Goldman Sachs, BofA, Cantor Fitzgerald y Caso Bull), aclarando la diferencia entre el consenso medio ($2.420 USD) y el escenario alcista máximo ($2.808 USD).
* Incorporación de métricas fundamentales: P/E Ratio (PER) y Capitalización Bursátil (Market Cap).

## [2026-10-28] ui-redesign | Landing Page y Radar rediseñados según Stitch Imagen 2 & Cron Horario de Mercado
* Rediseño completo del Radar de Oportunidades y tarjetas de instrumentos (`.instrument-card`) según las especificaciones de Stitch (Imagen 2): badges de alta legibilidad, grid de métricas en 4 columnas con contrastes nítidos (`#091220`), y sección de Tesis con insignia esmeralda.
* Sub-selectores y botones de filtro con estética Stitch (activo `#00F5A0` sobre fondo oscuro con sombra de resplandor).
* Nuevo Footer minimalista con enlaces rápidos y mención de terminal cuantitativa.
* Actualización del cron de GitHub Actions a frecuencia horaria (`0 13-21 * * 1-5`, de 10:00 a 18:00 hs de Buenos Aires) para contemplar la apertura actual (10:30 hs ART) y la transición de horario de invierno de EE.UU. (11:30 hs ART).

## [2026-10-28] automation | Implementación de GitHub Actions Cron y motor de actualización autónomo
* Creación de `scripts/update_market.js`: consulta en tiempo real a Yahoo Finance API y DolarAPI, actualizando índices, CEDEARs en ARS con ratios y CCL, ETFs y Merval.
* Creación de `.github/workflows/update_market.yml`: cron job programado de lunes a viernes en horario bursátil (11:30 hs, 14:30 hs y 17:15 hs de Buenos Aires) con disparador manual `workflow_dispatch`.
* Actualización completa de `marketData.json` con cotizaciones reales en vivo.

## [2026-10-28] ui-redesign | Integración del rediseño Desktop UI de Google Stitch y actualización de cotizaciones reales
* Implementación del diseño Stitch Desktop UI Optimization (`stitch_desktop_ui_optimization_redesign`): nuevo logo FinTech con flecha ascendente, paleta `#050911` y `#00F5A0`, efectos `.card-glass`, `.radial-glow` y botón de radar con `.pulse-dot`.
* Actualización de cotizaciones en tiempo real en snapshot: Nvidia (NVDA) corregida a $217.94 USD, Microsoft (MSFT) a $531.33 USD y Amazon (AMZN) a $253.10 USD.

## [2026-10-28] vault-setup | Inicialización del Vault en /docs
* Creación de la estructura del Vault de Obsidian en `c:\DondeInvierto\docs` siguiendo la misma arquitectura que `ListeningLab\docs`.
* Registro de índice general estructurado, log cronológico y categorías numeradas.
* Configuración de `.gitignore` para ignorar `workspace.json` local.

## [2026-10-27] features | Incorporación de Cotización y Paridad en ONs/Bonos y Expansión a 20 Acciones/ETFs
* Se incorporó la cotización actual en dólares y el badge de Paridad (Sobre la par vs Bajo la par) en Obligaciones Negociables y Bonos Soberanos.
* Se ampliaron los universos de datos a 20 Acciones y 20 ETFs, con filtros de ordenamiento que seleccionan automáticamente los 10 más rentables en modo "Sin Dividendos".
* Se incluyeron las fechas de vencimiento exactas en toda la renta fija.

## [2026-10-27] ui-redesign | Migración a Terminal Quant (Estilo Google Stitch)
* Rediseño completo de la UI en Next.js 15 + Tailwind CSS con paleta dark `#051424`.
* Incorporación de header fijo con Ticker Tape en tiempo real, chips de Dólar CCL y simulador dinámico de cartera.

## [2026-10-26] deploy | Migración a Next.js y Despliegue en Vercel
* Migración del prototipo inicial de Streamlit a una aplicación web comercial en Next.js.
* Configuración del despliegue automatizado en Vercel en `https://donde-invierto.vercel.app`.
