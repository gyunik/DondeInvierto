# 📝 Registro de Actividad (Log) — Vault Donde Invierto

Formato estándar de bitácora: `## [YYYY-MM-DD] acción | detalle`

---

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
