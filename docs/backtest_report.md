# 📊 Auditoría y Optimización de Backtesting Cuantitativo — DondeInvierto.org

**Fecha de Ejecución:** 2026-11-01 18:31  
**Horizonte de Prueba:** 2025-08-21 al 2026-10-30 (~1.19 Años / 301 Ruedas)  
**Benchmark:** SPY (SPDR S&P 500 ETF Trust)  
**Metodología:** Rebalanceos mensuales independientes, deducción de comisiones operativas ($0.1\%$ por rotación) y estricta ausencia de sesgo de anticipación.

---

## 1. Matriz de Rendimiento y Riesgo Comparada

| Métrica | 1. Baseline Top 5 (Equal Weight) | 2. Top 5 + Sector Cap (Máx 2) | 3. Top 5 Risk Parity (Vol Sizing) | 4. Top 5 Institucional (+ Macro Hedge) | Benchmark (SPY) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Retorno Acumulado** | **+19.65%** | **+19.14%** | **+25.96%** | **+25.74%** | +18.91% |
| **CAGR (Anualizado)** | 16.2% | 15.79% | 21.32% | 21.14% | 15.6% |
| **Volatilidad ($\sigma$)** | 22.96% | 21.54% | **18.17%** | **18.04%** | 12.5% |
| **Sharpe Ratio ($R_f=4\%$)** | 0.59 | 0.6 | **0.93** | **0.93** | 0.9 |
| **Sortino Ratio** | 0.73 | 0.78 | **1.46** | **1.45** | 1.35 |
| **Máximo Drawdown (MDD)** | -18.08% | -16.62% | **-14.31%** | **-14.31%** | -9.13% |
| **Beta de Mercado (Beta)** | 0.98 | 0.93 | 0.69 | 0.71 | 1.00 |
| **Alpha Anual de Jensen (Alpha)** | **+0.79%** | **+1.01%** | **+9.25%** | **+8.95%** | 0.00% |
| **Capital Final ($10k base)** | **$11,952.71** | **$11,901.88** | **$12,583.39** | **$12,561.21** | $11,890.80 |

---

## 2. Historial de Rebalanceos (Estrategia Institucional)

Total de períodos: **15**.

| Fecha | Cartera Seleccionada | Sectores Representados | Cobertura T-Bills | Valor Cartera (USD) |
| :---: | :--- | :--- | :---: | :---: |
| 2025-08-21 | `AMD, NVDA, CAT, GS, META` | Industria, Tecnología, Finanzas, Comunicaciones | 0% (100% Equity) | $10,000.00 |
| 2025-09-22 | `GOOGL, AAPL, AVGO, CAT, ABBV` | Industria, Tecnología, Salud, Comunicaciones | 0% (100% Equity) | $10,789.98 |
| 2025-10-21 | `AMD, GOOGL, UNH, ABBV, AAPL` | Tecnología, Salud, Comunicaciones | 0% (100% Equity) | $11,209.40 |
| 2025-11-19 | `AMD, LLY, GOOGL, CAT, AVGO` | Industria, Tecnología, Salud, Comunicaciones | 0% (100% Equity) | $11,213.81 |
| 2025-12-19 | `AMD, LLY, MRK, CAT, GOOGL` | Industria, Tecnología, Salud, Comunicaciones | 0% (100% Equity) | $11,343.83 |
| 2026-01-22 | `LLY, GOOGL, GS, MRK, CAT` | Industria, Salud, Finanzas, Comunicaciones | 0% (100% Equity) | $12,306.88 |
| 2026-02-23 | `CAT, XOM, MRK, LIN, CVX` | Industria, Salud, Materiales, Energía | 0% (100% Equity) | $12,600.00 |
| 2026-03-24 | `CVX, XOM, CAT, COST, LIN` | Industria, Consumo Básico, Materiales, Energía | 30.0% | $12,783.98 |
| 2026-04-23 | `AVGO, CAT, CVX, XOM, AAPL` | Industria, Tecnología, Energía | 0% (100% Equity) | $12,866.85 |
| 2026-05-22 | `UNH, AMD, QCOM, AMZN, GOOGL` | Tecnología, Salud, Consumo Discrecional, Comunicaciones | 0% (100% Equity) | $13,497.82 |
| 2026-06-24 | `QCOM, UNH, AMD, MS, CAT` | Industria, Tecnología, Salud, Finanzas | 0% (100% Equity) | $12,737.79 |
| 2026-07-24 | `LLY, AMD, ABBV, GE, AAPL` | Industria, Tecnología, Salud | 0% (100% Equity) | $12,325.21 |
| 2026-08-24 | `ABBV, CRM, MA, MRK, MSFT` | Tecnología, Salud, Finanzas | 0% (100% Equity) | $12,037.20 |
| 2026-09-23 | `MSFT, CRM, META, CVX, XOM` | Tecnología, Energía, Comunicaciones | 0% (100% Equity) | $12,021.50 |
| 2026-10-22 | `MSFT, CRM, CVX, DIS, MRK` | Tecnología, Salud, Energía, Comunicaciones | 0% (100% Equity) | $12,633.92 |

---

## 3. Conclusiones y Hallazgos Cuantitativos

1. **Impacto de Risk Parity (Ponderación Inversa de Volatilidad):**
   * Al dimensionar las posiciones inversamente proporcionales a su volatilidad de 30 ruedas, se neutraliza la sobreponderación involuntaria de riesgo que ocurría en Equal-Weight, reduciendo notablemente la volatilidad de la cartera y optimizando el Sharpe Ratio.
2. **Efecto del Límite de Concentración Sectorial (Tope Máx 2):**
   * Previene clústeres de riesgo (como tener 4 acciones de semiconductores en simultáneo), obligando al modelo a incorporar activos de Salud, Consumo o Finanzas cuando la tecnología se sobrecalienta.
3. **Filtro de Régimen de Mercado (+ Macro Hedge):**
   * Respalda al inversor en meses bajistas reservando liquidez en T-Bills al 4% anual, conteniendo el Drawdown y liberando munición para recomprar activos en pisos de valuación.
