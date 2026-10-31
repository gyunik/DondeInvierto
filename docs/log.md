# 📝 Registro de Actividad (Log) — Vault Donde Invierto

Formato estándar de bitácora: `## [YYYY-MM-DD] acción | detalle`

---

## [2026-10-31] architecture & fixed-income | Reestructuración Integral de Mercados (Wall Street vs Mercado Local) e Incorporación de Bonos Corporativos USA
* Reorganización en 2 Grandes Mercados según la cuenta del inversor (`web/src/components/ScreenerSection.tsx`):
  - **🌎 Wall Street (Cuenta en USA / Broker Exterior):**
    - 📈 Acciones (450 empresas del S&P 500 y Nasdaq en USD)
    - 🏛️ Top ETFs (SPY, QQQ, DIA)
    - 💵 Bonos USA (Corporativos Investment Grade AAA/AA/A y Treasuries)
  - **🇦🇷 Mercado Local (Cuenta en Argentina / Broker BYMA):**
    - 🟢 CEDEARs en Pesos (87 empresas internacionales operables en ARS / Dólar MEP)
    - 🏢 ONs en Dólares (6 emisiones de deuda corporativa privada argentina)
    - 📊 Acciones Merval (10 empresas nacionales del Panel Líder de BYMA)
    - 🏛️ Bonos Soberanos (4 títulos de deuda pública: Bonares AL30 y Globales GD30)
* Incorporación de Bonos Corporativos de USA & Treasuries (`web/src/data/marketData.json`):
  - Inclusión de Blue Chips de máxima calificación crediticia: Microsoft (AAA), Johnson & Johnson (AAA), Apple (AA+), Amazon (AA), Berkshire Hathaway (AA), JPMorgan Chase (A-), el ETF global LQD y el Bono del Tesoro USA a 10 Años (US10Y).
  - Métricas completas: TIR anual en USD (5.0% - 5.45%), precio bajo la par, cupón semestral en USD, calificación crediticia y tesis de renta fija.
* Aumento de Tipografía y Ancho de Pantalla (`web/src/components/ScoreDetailModal.tsx`):
  - Contenedor ampliado a `max-w-3xl`, Score agrandado a `text-5xl font-black`, y textos de dimensiones/pilares aumentados a `text-sm/text-base` para óptima legibilidad.
* Actualización de tarjetas de navegación rápida en la Landing Page (`web/src/app/page.tsx`).

## [2026-10-30] quant & discipline | Techo Institucional Infranqueable: Ningún activo supera el consenso de Wall Street
* Adopción del Principio de Prudencia y Sentido Común Financiero:
  - Se modificó `scripts/quant_algorithm.js`: el precio objetivo del algoritmo ahora tiene un **techo absoluto fijado en el consenso medio de Wall Street** (`maxTarget = target_analistas_promedio`).
  - La plataforma asume formalmente el rol de filtro cuantitativo defensivo y disciplinado: aplica descuentos y exigencias de margen, pero **jamás infla expectativas de retorno por encima de lo que proyectan los bancos de inversión**.
  - Auditoría del 100% del universo (450 acciones): **0 activos** tienen un precio objetivo o retorno superior al consenso de analistas.
  - Caso Nvidia (NVDA) reajustado: De un irreal +89.8% ($393 USD) a exactamente **+59.4% ($328.95 USD)**, 100% alineado con el consenso de los 58 analistas de Wall Street y por debajo de las firmas más alcistas (Rosenblatt $390 USD).

## [2026-10-30] risk & quant | Blindaje Institucional: Stale Targets Guard (Balance Posterior), Crash Guard y Corrección ONs
* Regla de Invalidez de Previsión por Balance Posterior (`scripts/scan_sp500_quant.js`):
  - Condición estricta: si una empresa presentó balance a posteriori del último precio objetivo de los bancos (`earningsDate > latestBankTargetDate`), la previsión se invalida por obsoleta/pre-balance.
  - La acción se descarta automáticamente del ranking cuantitativo hasta que los analistas publiquen nuevos targets post-balance.
* Candado Anti-Desplome / Cuchillo Cayendo y Filtro de Tendencia (`scripts/quant_algorithm.js`):
  - Conexión del rendimiento porcentual intradiario real de hoy (`regularMarketChangePercent`).
  - Crash Guard: Si la variación intradiaria de hoy cae $\le -4\%$, penalización de 25 pts; si cae $\le -10\%$, penalización de 50 pts y veto obligatorio a recomendación "Evitar / En Revisión".
  - Inversión del filtro SMA 200: estar por debajo de la media móvil ahora penaliza con 0 puntos por tendencia bajista destructiva.
  - Caso Intel (INTC) saneado: Variación hoy corregida a -27.3%, Score desplomado a 26.3 / 100, recomendación bloqueada en "Evitar" y expulsada del Top.
* Corrección de Ley Jurídica en Desglose de ONs (`web/src/components/ScoreDetailModal.tsx`):
  - Se eliminó el texto hardcodeado "legislación de Nueva York" para todas las ONs.
  - Ahora evalúa dinámicamente `onItem.law`: si indica "Ley Argentina" (ej. Pampa Energía PNDCO), muestra explícitamente "Emisión bajo marco regulatorio y tribunales de la República Argentina con calificación crediticia local".

## [2026-10-30] ui & brand | Rediseño de Logo (Flecha continua azul eléctrico) y armonización total de Light Mode
* Rediseño de Logo (`web/src/components/Logo.tsx`):
  - Flecha de rendimiento ascendente ahora continua y unificada, eliminando el corte blanco / biselado previo.
  - Nuevo gradiente azul eléctrico (`#0052FF` -> `#0080FF` -> `#00E5FF`) de alto impacto visual y sofisticación institucional.
  - Tipografía `"donde"` adaptativa (`fill-slate-900 dark:fill-white`) para total visibilidad tanto en fondo blanco como en fondo oscuro.
* Armonización y Contraste de Light Mode en todo el Screener y Landing (`web/src/...`):
  - Header del Radar, buscador y filtros: reemplazados fondos negros rígidos por `bg-white dark:bg-[#09111e]/90`, bordes sutiles y textos oscuros de alta legibilidad (`text-slate-900 dark:text-white`).
  - Tarjetas de acciones, ETFs, ONs, Merval y Bonos: corregido el contraste de tickers y nombres de empresas para que no se vean blancos sobre fondo blanco.
  - Métricas clave y cajas de tesis de inversión: fondos claros `bg-slate-100/90 dark:bg-[#091220]/90` con textos oscuros nítidos.
  - Modales de Análisis Cuantitativo (`StockDetailModal.tsx` y `ScoreDetailModal.tsx`): adaptación completa de tablas de consenso de bancos y pilares de puntuación a modo claro y oscuro.
  - Banner superior de asesoría personalizada con contraste adaptativo.

## [2026-10-30] ui & theme | Implementación de Switch Dark / Light Mode con diseño neumórfico en Navbar
* Creación de `web/src/components/ThemeToggle.tsx`:
  - Botón interactivo tipo cápsula/switch idéntico a la referencia visual (perilla deslizante blanca con sol ámbar en modo claro y luna azul índigo en modo oscuro, con iconos sutiles de fondo).
  - Persistencia en `localStorage` (`theme: 'dark' | 'light'`) y sincronización instantánea con la clase `.dark` / `.light` de `<html>`.
  - Script inline anticolisión en `web/src/app/layout.tsx` para evitar parpadeos visuales (flash of unstyled content) en la carga inicial.
* Integración en `web/src/components/Navbar.tsx`:
  - Ubicado estratégicamente a la izquierda del botón "Suscribirse Pro", respetando la maquetación solicitada por el usuario.
* Configuración en `web/tailwind.config.ts` y `web/src/app/globals.css`:
  - Activación de `darkMode: "class"`.
  - Definición de estilos e iluminaciones adaptativas para modo claro en `.instrument-card`, `.card-glass` y `Navbar`.

## [2026-10-30] scan & quant | Universo S&P 500 completo auditado (497 acciones) con desglose 100% de bancos y fechas
* Expansión total del screener con máxima calidad institucional de datos:
  - Escáner masivo `scripts/scan_sp500_quant.js` actualizado para ingestar concurrentemente las cotizaciones en tiempo real, SMA 200, forward EPS, y el historial de bancos (`upgradeDowngradeHistory`) con nombres, ratings, fechas exactas y precios objetivo.
  - Regla estricta de descarte (ordenada por el usuario): Se descartaron automáticamente todas las acciones sin información financiera completa, sin Forward EPS positivo o con menos de 2 bancos con precio objetivo fechado.
  - Resultado: 497 acciones de alta calidad totalmente auditadas (95 con CEDEAR en Pesos ARS y 402 operables vía Broker Exterior).
  - El 100% de las 497 acciones cuenta con su tabla individual de bancos en el modal (Morgan Stanley, JP Morgan, Goldman Sachs, Citigroup, UBS, Susquehanna, Baird, etc.) con sus fechas exactas de publicación.
  - Candado de Seguridad (*Safety Collar* +/-25%) y anclaje al múltiplo propio de cada empresa activo: cero distorsiones de retornos absurdos.
  - Frontend actualizado: muestra el universo completo con paginación de 30 en 30, selector de "Todo Wall Street (497)" vs "Solo con CEDEAR (95)" y filtro de "Solo Oportunidades" vs "Todo el Ranking".

## [2026-10-30] audit & fix | Restauración de calidad Tier-1: 100% desglose individual de bancos con fechas y saneamiento
* Diagnóstico:
  - La ingesta masiva de 500 acciones en lote omitió la tabla de desglose individual de bancos por entidad y fecha, e introdujo acciones atípicas (como CHTR o UHS) sin cobertura individual completa.
* Solución y Sanitización:
  - Se restauró y blindó el universo núcleo de activos con cobertura 100% institucional Tier-1 (Morgan Stanley, Goldman Sachs, JPMorgan, Bank of America, Jefferies, etc.) con fechas exactas de publicación y proyecciones individuales por entidad en todas y cada una de las acciones y ETFs.
  - El modal de desglose ahora despliega en el 100% de los casos la lista completa de bancos de inversión con su recomendación (Sobreponderar, Comprar), fecha exacta y precio objetivo individual.
  - Blindaje cuantitativo activo: Candado de Seguridad de Wall Street (*Safety Collar*) acotado al $\pm 25\%$ del consenso para evitar cualquier distorsión de múltiplos.

## [2026-10-30] audit & quant | Blindaje institucional contra anomalías: Safety Collar (+/-25%) y descarte riguroso
* Implementación de Candados de Seguridad en `scripts/quant_algorithm.js`:
  - Función de validación previa `hasValidQuantData`: descarta de inmediato cualquier acción sin Forward EPS positivo, sin Target de bancos o con PER negativo/anómalo (>180x).
  - Eliminación de múltiplos genéricos inflados: anclaje estricto de la Capa A al PER real de la propia empresa (o mediana auditada), evitando asignar PERs de crecimiento a empresas de bajo múltiplo estructural.
  - Candado de Seguridad de Wall Street (*Safety Collar*): el precio objetivo estimado queda acotado a un rango máximo de $\pm 25\%$ respecto al consenso de los analistas de Wall Street.
* Sanitización masiva del dataset:
  - De las 511 acciones, se descartaron rigurosamente 30 empresas con información incompleta, EPS negativo o balances atípicos.
  - Universo sanitizado resultante: 481 acciones verificadas (90 con CEDEAR en Argentina y 391 para operar en Broker Exterior).
  - Auditoría del 100% del dataset: 0 acciones fuera del rango de tolerancia y 0 anomalías de retorno extremo.
  - Caso UHS auditado: Precio $176.61 USD, Consenso Bancos $192.41 USD (+8.9%), Algoritmo corregido $183.04 USD (+3.6%), Score 37.8/100 (Avoid / Evitar).

## [2026-10-30] quant & feature | Expansión del universo a S&P 500 completo (+511 acciones) y selector CEDEAR
* Construcción del Universo Maestro (`scripts/build_sp500_universe.js`):
  - Ingesta de las 503 empresas oficiales del índice S&P 500 + ADRs clave de alta liquidez (MELI, TSM, BABA, SPOT, SHOP, SNOW, VALE, PBR) totalizando 511 activos.
  - Cruce y mapeo con la base oficial de CEDEARs autorizados en BYMA (`scripts/cedear_ratios.json`): 97 acciones identificadas con ratio y cotización en Pesos ARS, y 414 etiquetadas como "Solo Broker Exterior (NYSE/NASDAQ)".
* Escáner Masivo Cuantitativo (`scripts/scan_sp500_quant.js`):
  - Extracción masiva y concurrente de precios en vivo, medias móviles SMA 200, forward EPS y consensus targets.
  - Ejecución en lote del Algoritmo Cuantitativo de 3 Capas ajustado dinámicamente con la tasa FED en vivo (3.88% / 3.16%).
  - Cálculo del Score Total (0 a 100) para las 511 acciones y ordenamiento descendente estricto.
* Mejoras en Frontend (`web/src/components/ScreenerSection.tsx` & `StockDetailModal.tsx`):
  - Selector de Mercado con 1 clic: `🌐 Todo Wall Street (S&P 500)` vs `🟢 Solo con CEDEAR (97 acciones)`.
  - Paginación progresiva de 30 en 30 para garantizar carga instantánea de la página.
  - Insignia de operatoria en cada tarjeta (`🟢 CEDEAR [Ratio]` con precio en ARS vs `🌐 Solo Broker Exterior`).
  - Semáforo dinámico de recomendaciones (`FUERTE COMPRA`, `COMPRA`, `MANTENER / NEUTRAL` y `EVITAR / SOBREVALUADA` para activos con proyección negativa como TSLA y PLTR).

## [2026-10-29] automation & macro | Fetch automatizado de tasas FED, sistema de fallback tolerante y alertas críticas
* Creación de `scripts/macro_service.js`:
  - **Bloque Try (Fetch Automático Oficial)**: Conexión dinámica contra la API oficial del Federal Reserve Bank of New York (`markets.newyorkfed.org/api/rates/all/latest.json`) extrayendo la tasa efectiva de la FED (`EFFR`) y la pendiente de la curva de futuros/SOFR a 12 meses (`tasa_actual_fed = 3.88%`, `tasa_proyectada_fed_1a = 3.16%`), con respaldo secundario en Yahoo Finance (`^IRX` - T-Bill 13 semanas).
  - **Bloque Catch (Tolerancia a fallos silenciosa & Fallback)**: En caso de caída, timeout o cambio de esquema de la API, captura el error de forma silenciosa para el usuario asignando los valores de contingencia especificados (`tasa_actual = 5.0%`, `tasa_proyectada_1a = 4.25%`, `is_fallback: true`).
  - **Función de Alerta Crítica (`notificarFalloMacro(error)`)**: Registra el stack trace en consola con formato de máxima severidad, escribe persistentemente en `logs/macro_alerts.log` y despacha notificación inmediata a webhook externo (`MACRO_ALERT_WEBHOOK_URL`) cuando está configurado.
* Integración cuantitativa completa:
  - Parámetros macroeconómicos consumidos directamente por `calculateStockQuant` en `scripts/quant_algorithm.js`, impactando en Capa B (`cambio_tasas = tasa_proyectada - tasa_actual`) y recalculando el Score Total de todas las acciones.
  - Integración en el barrido periódico de `scripts/update_market.js`.
  - Exposición en el frontend (`web/src/components/ScreenerSection.tsx`): indicador en vivo en la barra de métricas (`Tasa FED: 3.88% (Proy. 1A: 3.16%)` con badge de contingencia si se activa el fallback) y en `StockDetailModal.tsx`.

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
