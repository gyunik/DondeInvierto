# CHANGELOG — Donde Invierto

Historial de versiones y evolución funcional del producto.

---

## [v2.2.0] — 2026-10-27
### Agregado
- **Cotizaciones y Paridad en Renta Fija**: Soporte para visualizar precios en USD y cálculo de paridad (indicadores "Sobre la par" y "Bajo la par") para ONs corporativas y títulos soberanos.
- **Top 10 más rentables sin dividendos**: Expansión a 20 acciones y 20 ETFs, con algoritmos de ordenamiento dinámico que traen las 10 alternativas de mayor rendimiento (upside de Wall Street y retorno 1Y).
- **Vencimientos**: Fechas de vencimiento exactas (`DD/MM/AAAA`) visibles en las fichas de deuda.

## [v2.1.0] — 2026-10-27
### Agregado
- **Diseño Terminal Quant (Google Stitch)**: Rediseño visual dark con paleta `#051424` / `#4edea3`, Ticker Tape de índices y tarjetas de activos estructuradas en 12 columnas.
- **Simulador Interactivo**: Asignación de capital en ARS y USD según perfil de riesgo (Conservador, Balanceado, Agresivo).

## [v2.0.0] — 2026-10-26
### Cambiado
- **Plataforma Web Next.js 15**: Migración de arquitectura monolítica en Python Streamlit a una aplicación web moderna en React / Next.js desplegada en Vercel.
- **Adaptación al mercado argentino**: Incorporación de CEDEARs con precios en pesos argentinos convertidos por CCL, Obligaciones Negociables en dólares (Ley NY y Ley Arg), y acciones del panel líder del S&P Merval.

## [v1.0.0] — 2026-10-25
### Inicial
- Prototipo funcional en Streamlit (`dondeinvierto.streamlit.app`) con screener de Yahoo Finance.
