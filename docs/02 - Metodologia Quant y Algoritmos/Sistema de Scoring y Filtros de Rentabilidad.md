# ⚙️ Sistema de Scoring y Filtros de Rentabilidad

## Modelo de Puntuación Cuantitativa (Score 0 a 100)
Cada activo es evaluado a través de una matriz ponderada:

1. **Momento Técnico & Tendencia (30%)**:
   * RSI (Relative Strength Index) en zona de acumulación (40 - 60).
   * Distancia frente a medias móviles clave (EMA 50 / SMA 200).
2. **Valuación Relativa & Fundamentos (35%)**:
   * P/E Ratio (Price to Earnings) vs promedio histórico del sector.
   * Crecimiento de ingresos y margen operativo (EBITDA).
3. **Consenso de Analistas & Upside (25%)**:
   * Precio objetivo a 12 meses proyectado por el consenso de analistas de Wall Street.
   * Recomendación mayoritaria (Strong Buy / Buy).
4. **Seguridad Financiera & Solidez de Balance (10%)**:
   * Ratios de liquidez y deuda neta / EBITDA.

---

## Filtro: Top 10 Más Rentables (Sin Dividendos)
Cuando el usuario selecciona la vista **"🚀 Sin Dividendos - Top 10 más rentables"**:
* **En Acciones (CEDEARs)**: El algoritmo filtra activos que reinvierten el 100% de su flujo (`pays_dividend: false`) y los ordena en forma descendente por **Upside estimado por Wall Street** (e.g. MELI +35%, AMZN +33.4%, AMD +31.2%).
* **En ETFs**: Filtra fondos de acumulación, materias primas y cripto (`pays_dividend: false`) y los ordena por su **retorno acumulado del último año (1Y Return)** (e.g. IBIT +68.4%, SOXX +42.8%, SLV +36.2%).

---

## Paridad en Bonos y Obligaciones Negociables (ONs)
* **Fórmula de Paridad**:
  $$\text{Paridad} = \frac{\text{Precio}}{\text{Valor Técnico}} \times 100\%$$
* **Sobre la Par (> 100%)**: El instrumento cotiza con prima debido a la máxima calidad crediticia o cupón alto (ej. Pampa MGC3O a 101.9%).
* **Bajo la Par (< 100%)**: El instrumento cotiza con descuento, lo que genera una ganancia de capital adicional al vencimiento y eleva la TIR (ej. Telecom TLC1O a 97.5% o Bonos soberanos como GD30 al 68.4%).
