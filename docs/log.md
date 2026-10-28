# 📝 Registro de Actividad (Log) — Vault Donde Invierto

Formato estándar de bitácora: `## [YYYY-MM-DD] acción | detalle`

---

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
