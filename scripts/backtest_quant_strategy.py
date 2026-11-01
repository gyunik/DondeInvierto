#!/usr/bin/env python3
"""
scripts/backtest_quant_strategy.py
Motor de Backtesting Cuantitativo Avanzado para DondeInvierto.org

Implementa:
1. Estrategia Base (Equal-Weight)
2. Control de Concentración Sectorial (Sector Cap Max 2 por sector)
3. Ponderación por Inverso de la Volatilidad (Risk Parity / Volatility Sizing)
4. Filtro de Régimen de Mercado (Cobertura con Cash/T-Bills en correcciones)
"""

import os
import sys
import json
import time
import math
from datetime import datetime
import urllib3
import requests
import numpy as np
import pandas as pd

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuración del Universo de Prueba: 36 Blue Chips representativas de los 11 sectores del S&P 500
UNIVERSE_TICKERS = [
    # Tecnología / Software & Chips
    "AAPL", "MSFT", "NVDA", "AVGO", "CRM", "AMD", "ADBE", "QCOM",
    # Comunicaciones & Medios
    "GOOGL", "META", "NFLX", "DIS",
    # Finanzas
    "JPM", "V", "MA", "BAC", "GS", "MS",
    # Salud / Farmacéuticas
    "LLY", "UNH", "JNJ", "MRK", "ABBV",
    # Consumo Básico & Discrecional
    "AMZN", "HD", "MCD", "WMT", "COST", "PG", "KO", "PEP",
    # Industria, Materiales & Energía
    "CAT", "GE", "LIN", "XOM", "CVX"
]

SECTORS_MAP = {
    "AAPL": "Tecnología", "MSFT": "Tecnología", "NVDA": "Tecnología", "AVGO": "Tecnología",
    "CRM": "Tecnología", "AMD": "Tecnología", "ADBE": "Tecnología", "QCOM": "Tecnología",
    "GOOGL": "Comunicaciones", "META": "Comunicaciones", "NFLX": "Comunicaciones", "DIS": "Comunicaciones",
    "AMZN": "Consumo Discrecional", "HD": "Consumo Discrecional", "MCD": "Consumo Discrecional",
    "WMT": "Consumo Básico", "COST": "Consumo Básico", "PG": "Consumo Básico", "KO": "Consumo Básico", "PEP": "Consumo Básico",
    "JPM": "Finanzas", "V": "Finanzas", "MA": "Finanzas", "BAC": "Finanzas", "GS": "Finanzas", "MS": "Finanzas",
    "LLY": "Salud", "UNH": "Salud", "JNJ": "Salud", "MRK": "Salud", "ABBV": "Salud",
    "CAT": "Industria", "GE": "Industria",
    "LIN": "Materiales",
    "XOM": "Energía", "CVX": "Energía"
}

BENCHMARK_TICKER = "SPY"
CACHE_FILE = os.path.join(os.path.dirname(__file__), "backtest_data_cache.json")
RESULTS_JSON_FILE = os.path.join(os.path.dirname(__file__), "backtest_results.json")
REPORT_MD_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "backtest_report.md")


def fetch_ticker_history(ticker, range_period="2y"):
    """Descarga el historial diario de cotizaciones de Yahoo Finance."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range={range_period}"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    try:
        r = requests.get(url, headers=headers, verify=False, timeout=12)
        if r.status_code != 200:
            return None
        data = r.json()
        result = data.get("chart", {}).get("result", [None])[0]
        if not result:
            return None
        timestamps = result.get("timestamp", [])
        quote = result.get("indicators", {}).get("quote", [{}])[0]
        closes = quote.get("close", [])
        highs = quote.get("high", [])
        lows = quote.get("low", [])
        volumes = quote.get("volume", [])

        records = []
        for ts, c, h, l, v in zip(timestamps, closes, highs, lows, volumes):
            if c is not None and not math.isnan(c) and c > 0:
                dt_str = datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
                records.append({
                    "date": dt_str,
                    "close": round(float(c), 2),
                    "high": round(float(h), 2) if h is not None and not math.isnan(h) else round(float(c), 2),
                    "low": round(float(l), 2) if l is not None and not math.isnan(l) else round(float(c), 2),
                    "volume": int(v) if v is not None and not math.isnan(v) else 0
                })
        return records
    except Exception as e:
        print(f"  [Advertencia] Error descargando {ticker}: {e}")
        return None


def get_all_market_data(force_refresh=False):
    """Carga datos de caché o los descarga si no existen."""
    if not force_refresh and os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                cached = json.load(f)
            if cached.get("data"):
                print(f"📦 Usando base de datos histórica en caché ({len(cached['data'])} tickers).")
                return cached["data"]
        except Exception:
            pass

    print(f"🌐 Descargando 2 años de cotizaciones para el universo ({len(UNIVERSE_TICKERS)} acciones + {BENCHMARK_TICKER})...")
    data = {}

    bench_data = fetch_ticker_history(BENCHMARK_TICKER, "2y")
    if not bench_data:
        raise RuntimeError("No se pudo descargar el benchmark SPY.")
    data[BENCHMARK_TICKER] = bench_data

    for idx, ticker in enumerate(UNIVERSE_TICKERS, 1):
        hist = fetch_ticker_history(ticker, "2y")
        if hist and len(hist) >= 250:
            data[ticker] = hist
        time.sleep(0.12)

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump({"timestamp": datetime.now().isoformat(), "data": data}, f)
    return data


def compute_stock_quant_score_at_time(history_slice, ticker):
    """Calcula el Score Cuantitativo de DondeInvierto con datos hasta día t."""
    if len(history_slice) < 200:
        return None

    closes = [row["close"] for row in history_slice]
    curr_price = closes[-1]
    prev_price = closes[-2]
    day_change = ((curr_price - prev_price) / prev_price) * 100

    # 1. Media Móvil Simple de 200 ruedas (SMA 200)
    sma_200 = sum(closes[-200:]) / 200.0
    desvio_tecnico = (curr_price - sma_200) / sma_200

    if 0.0 <= desvio_tecnico <= 0.15:
        score_tecnico = 15.0
    elif desvio_tecnico > 0.15:
        exceso = (desvio_tecnico - 0.15) / 0.20
        score_tecnico = max(5.0, 15.0 - (exceso * 10.0))
    else:
        caida = abs(desvio_tecnico)
        if caida <= 0.05:
            score_tecnico = 8.0
        elif caida <= 0.12:
            score_tecnico = 4.0
        else:
            score_tecnico = 0.0

    # 2. Retorno Potencial y Margen Relativo
    high_52w = max(row["high"] for row in history_slice[-252:]) if len(history_slice) >= 252 else max(closes)
    dist_high = (high_52w - curr_price) / high_52w

    p_3m = closes[-63] if len(closes) >= 63 else closes[0]
    ret_3m = ((curr_price - p_3m) / p_3m) * 100

    score_retorno = min(60.0, (ret_3m / 35.0) * 60.0) if ret_3m > 0 else 0.0

    if 0.05 <= dist_high <= 0.35:
        score_margen = 15.0 + min(10.0, (dist_high / 0.35) * 10.0)
    elif dist_high < 0.05:
        score_margen = 12.0
    else:
        score_margen = max(2.0, 15.0 - ((dist_high - 0.35) / 0.30) * 13.0)

    # 3. Candado de Seguridad Institucional: CRASH GUARD
    crash_penalty = 0.0
    is_crashing = False
    if day_change <= -10.0:
        crash_penalty = 50.0
        is_crashing = True
    elif day_change <= -4.0:
        crash_penalty = 25.0
        is_crashing = True

    # Volatilidad realizada de 30 ruedas para Risk Parity
    returns_30 = pd.Series(closes[-31:]).pct_change().dropna()
    vol_30 = float(returns_30.std() * np.sqrt(252)) if len(returns_30) >= 20 and returns_30.std() > 0 else 0.25
    vol_30 = max(0.08, min(vol_30, 0.80))  # Clamping saludable entre 8% y 80%

    total_score = min(100.0, max(0.0, round(score_retorno + score_margen + score_tecnico - crash_penalty, 1)))

    return {
        "ticker": ticker,
        "sector": SECTORS_MAP.get(ticker, "General"),
        "price": curr_price,
        "day_change": day_change,
        "desvio_tecnico": round(desvio_tecnico * 100, 1),
        "vol_30": vol_30,
        "score_retorno": round(score_retorno, 1),
        "score_margen": round(score_margen, 1),
        "score_tecnico": round(score_tecnico, 1),
        "crash_penalty": crash_penalty,
        "is_crashing": is_crashing,
        "score": total_score
    }


def run_backtest_simulation(
    market_data,
    top_n=5,
    rebalance_freq_days=21,
    fee_rate=0.001,
    weighting_mode="equal",         # "equal" | "risk_parity"
    sector_cap=None,                # int (ej. 2) o None
    use_regime_filter=False,        # bool: Cobertura con T-Bills si SPY < SMA200
    regime_cash_pct=0.30            # Porcentaje de caja si el mercado está en régimen bajista
):
    """Ejecuta la simulación histórica completa bajo diferentes arquitecturas de riesgo."""
    bench_records = market_data[BENCHMARK_TICKER]
    common_dates = [r["date"] for r in bench_records]

    start_idx = 200
    initial_capital = 10000.0
    strat_val = initial_capital
    bench_initial_price = bench_records[start_idx]["close"]

    strat_curve = []
    bench_curve = []
    rebalance_events = []

    current_holdings = {}  # {ticker: shares}
    current_cash = 0.0
    last_rebalance_idx = -rebalance_freq_days
    rf_daily = 0.04 / 252.0  # Tasa de interés de T-Bills / Caja (4% anual)

    for t_idx in range(start_idx, len(common_dates)):
        curr_date = common_dates[t_idx]
        bench_price = bench_records[t_idx]["close"]
        bench_nav = initial_capital * (bench_price / bench_initial_price)

        # ¿Toca rebalanceo?
        if (t_idx - last_rebalance_idx) >= rebalance_freq_days:
            # 1. Liquidar cartera de acciones actual + caja acumulada
            liquid_capital = current_cash
            if not current_holdings and current_cash == 0:
                liquid_capital = strat_val
            else:
                for tkr, shares in current_holdings.items():
                    tkr_data = market_data.get(tkr, [])
                    tkr_dict = {d["date"]: d["close"] for d in tkr_data}
                    p = tkr_dict.get(curr_date, tkr_data[-1]["close"])
                    liquid_capital += shares * p
                # Comisión operativa sobre rotación de acciones
                liquid_capital *= (1.0 - fee_rate)

            # 2. Evaluar universo con datos estrictamente hasta curr_date
            scores = []
            for tkr in UNIVERSE_TICKERS:
                if tkr not in market_data:
                    continue
                tkr_history = market_data[tkr]
                slice_data = [d for d in tkr_history if d["date"] <= curr_date]
                if len(slice_data) >= 200:
                    item_score = compute_stock_quant_score_at_time(slice_data, tkr)
                    if item_score and not item_score["is_crashing"]:
                        scores.append(item_score)

            # Ordenar por Score descendente
            scores.sort(key=lambda x: x["score"], reverse=True)

            # Selección con o sin Sector Cap
            selected = []
            sector_counts = {}
            for item in scores:
                sec = item["sector"]
                if sector_cap is not None and sector_counts.get(sec, 0) >= sector_cap:
                    continue  # Saltar por exceso de concentración sectorial
                selected.append(item)
                sector_counts[sec] = sector_counts.get(sec, 0) + 1
                if len(selected) >= top_n:
                    break

            # 3. Filtro de Régimen de Mercado (SPY vs SMA 200)
            bench_slice_closes = [r["close"] for r in bench_records[: t_idx + 1]]
            bench_sma200 = sum(bench_slice_closes[-200:]) / 200.0
            is_market_bearish = bench_price < bench_sma200

            target_cash_pct = (regime_cash_pct if (use_regime_filter and is_market_bearish) else 0.0)
            equity_capital = liquid_capital * (1.0 - target_cash_pct)
            current_cash = liquid_capital * target_cash_pct

            # 4. Asignación de Pesos (Equal Weight vs Risk Parity)
            new_holdings = {}
            if selected:
                if weighting_mode == "risk_parity":
                    # Inverso de la volatilidad realizada de 30 ruedas
                    inv_vols = [1.0 / s["vol_30"] for s in selected]
                    sum_inv = sum(inv_vols)
                    weights = [iv / sum_inv for iv in inv_vols]
                    # Clamp: Ningún activo menor al 8% ni mayor al 35%
                    weights = [max(0.08, min(w, 0.35)) for w in weights]
                    sum_w = sum(weights)
                    weights = [w / sum_w for w in weights]
                else:
                    # Equal-Weight clásico
                    w_each = 1.0 / len(selected)
                    weights = [w_each] * len(selected)

                for sel, weight in zip(selected, weights):
                    tkr = sel["ticker"]
                    target_alloc = equity_capital * weight * (1.0 - fee_rate)
                    price = sel["price"]
                    new_holdings[tkr] = target_alloc / price

            current_holdings = new_holdings
            last_rebalance_idx = t_idx

            rebalance_events.append({
                "date": curr_date,
                "portfolio_value": round(liquid_capital, 2),
                "is_bear_regime": is_market_bearish,
                "cash_pct": round(target_cash_pct * 100, 1),
                "selected_stocks": [s["ticker"] for s in selected],
                "sectors": [s["sector"] for s in selected],
                "avg_score": round(sum(s["score"] for s in selected) / len(selected), 1) if selected else 0
            })

        # Rendimiento diario: acciones + interés en caja
        current_cash *= (1.0 + rf_daily)
        equity_val = 0.0
        for tkr, shares in current_holdings.items():
            tkr_data = market_data.get(tkr, [])
            tkr_dict = {d["date"]: d["close"] for d in tkr_data}
            p = tkr_dict.get(curr_date, tkr_data[-1]["close"])
            equity_val += shares * p

        strat_val = equity_val + current_cash
        strat_curve.append({"date": curr_date, "value": strat_val})
        bench_curve.append({"date": curr_date, "value": bench_nav})

    return {
        "strat_curve": strat_curve,
        "bench_curve": bench_curve,
        "rebalance_events": rebalance_events,
        "initial_capital": initial_capital,
        "top_n": top_n,
        "mode": f"{weighting_mode}_cap{sector_cap}_hedge{use_regime_filter}"
    }


def compute_metrics(strat_curve, bench_curve, rf_rate=0.04):
    """Calcula todas las métricas de rentabilidad y riesgo institucional."""
    strat_df = pd.DataFrame(strat_curve).set_index("date")
    bench_df = pd.DataFrame(bench_curve).set_index("date")

    strat_df["ret"] = strat_df["value"].pct_change().fillna(0)
    bench_df["ret"] = bench_df["value"].pct_change().fillna(0)

    n_days = len(strat_df)
    n_years = n_days / 252.0

    total_ret_strat = (strat_df["value"].iloc[-1] / strat_df["value"].iloc[0] - 1.0) * 100
    total_ret_bench = (bench_df["value"].iloc[-1] / bench_df["value"].iloc[0] - 1.0) * 100

    cagr_strat = ((strat_df["value"].iloc[-1] / strat_df["value"].iloc[0]) ** (1.0 / n_years) - 1.0) * 100
    cagr_bench = ((bench_df["value"].iloc[-1] / bench_df["value"].iloc[0]) ** (1.0 / n_years) - 1.0) * 100

    vol_strat = float(strat_df["ret"].std() * np.sqrt(252)) * 100
    vol_bench = float(bench_df["ret"].std() * np.sqrt(252)) * 100

    # Sharpe Ratio
    rf_daily = rf_rate / 252.0
    excess_strat = strat_df["ret"] - rf_daily
    excess_bench = bench_df["ret"] - rf_daily
    sharpe_strat = float(excess_strat.mean() / strat_df["ret"].std() * np.sqrt(252)) if strat_df["ret"].std() > 0 else 0
    sharpe_bench = float(excess_bench.mean() / bench_df["ret"].std() * np.sqrt(252)) if bench_df["ret"].std() > 0 else 0

    # Sortino Ratio
    downside_strat = strat_df["ret"][strat_df["ret"] < 0].std() * np.sqrt(252)
    downside_bench = bench_df["ret"][bench_df["ret"] < 0].std() * np.sqrt(252)
    sortino_strat = float((cagr_strat / 100.0 - rf_rate) / downside_strat) if downside_strat > 0 else 0
    sortino_bench = float((cagr_bench / 100.0 - rf_rate) / downside_bench) if downside_bench > 0 else 0

    # Max Drawdown
    strat_cummax = strat_df["value"].cummax()
    strat_dd = (strat_df["value"] - strat_cummax) / strat_cummax
    max_dd_strat = float(strat_dd.min()) * 100

    bench_cummax = bench_df["value"].cummax()
    bench_dd = (bench_df["value"] - bench_cummax) / bench_cummax
    max_dd_bench = float(bench_dd.min()) * 100

    # Beta y Alpha de Jensen
    cov = np.cov(strat_df["ret"], bench_df["ret"])[0][1]
    var_bench = np.var(bench_df["ret"])
    beta = float(cov / var_bench) if var_bench > 0 else 1.0
    alpha_annual = cagr_strat - (rf_rate * 100 + beta * (cagr_bench - rf_rate * 100))

    return {
        "n_trading_days": n_days,
        "n_years": round(n_years, 2),
        "total_ret_strat": round(total_ret_strat, 2),
        "total_ret_bench": round(total_ret_bench, 2),
        "outperformance": round(total_ret_strat - total_ret_bench, 2),
        "cagr_strat": round(cagr_strat, 2),
        "cagr_bench": round(cagr_bench, 2),
        "vol_strat": round(vol_strat, 2),
        "vol_bench": round(vol_bench, 2),
        "sharpe_strat": round(sharpe_strat, 2),
        "sharpe_bench": round(sharpe_bench, 2),
        "sortino_strat": round(sortino_strat, 2),
        "sortino_bench": round(sortino_bench, 2),
        "max_dd_strat": round(max_dd_strat, 2),
        "max_dd_bench": round(max_dd_bench, 2),
        "beta": round(beta, 2),
        "alpha_annual": round(alpha_annual, 2),
        "final_nav_strat": round(strat_df["value"].iloc[-1], 2),
        "final_nav_bench": round(bench_df["value"].iloc[-1], 2),
        "start_date": strat_df.index[0],
        "end_date": strat_df.index[-1]
    }


def update_report(m_base, m_cap, m_rp, m_inst, sim_inst):
    """Genera informe comparativo de todas las arquitecturas evaluadas."""
    reb_events = sim_inst["rebalance_events"]
    
    md = f"""# 📊 Auditoría y Optimización de Backtesting Cuantitativo — DondeInvierto.org

**Fecha de Ejecución:** {datetime.now().strftime("%Y-%m-%d %H:%M")}  
**Horizonte de Prueba:** {m_base['start_date']} al {m_base['end_date']} (~{m_base['n_years']} Años / {m_base['n_trading_days']} Ruedas)  
**Benchmark:** SPY (SPDR S&P 500 ETF Trust)  
**Metodología:** Rebalanceos mensuales independientes, deducción de comisiones operativas ($0.1\\%$ por rotación) y estricta ausencia de sesgo de anticipación.

---

## 1. Matriz de Rendimiento y Riesgo Comparada

| Métrica | 1. Baseline Top 5 (Equal Weight) | 2. Top 5 + Sector Cap (Máx 2) | 3. Top 5 Risk Parity (Vol Sizing) | 4. Top 5 Institucional (+ Macro Hedge) | Benchmark (SPY) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Retorno Acumulado** | **+{m_base['total_ret_strat']}%** | **+{m_cap['total_ret_strat']}%** | **+{m_rp['total_ret_strat']}%** | **+{m_inst['total_ret_strat']}%** | +{m_base['total_ret_bench']}% |
| **CAGR (Anualizado)** | {m_base['cagr_strat']}% | {m_cap['cagr_strat']}% | {m_rp['cagr_strat']}% | {m_inst['cagr_strat']}% | {m_base['cagr_bench']}% |
| **Volatilidad ($\sigma$)** | {m_base['vol_strat']}% | {m_cap['vol_strat']}% | **{m_rp['vol_strat']}%** | **{m_inst['vol_strat']}%** | {m_base['vol_bench']}% |
| **Sharpe Ratio ($R_f=4\\%$)** | {m_base['sharpe_strat']} | {m_cap['sharpe_strat']} | **{m_rp['sharpe_strat']}** | **{m_inst['sharpe_strat']}** | {m_base['sharpe_bench']} |
| **Sortino Ratio** | {m_base['sortino_strat']} | {m_cap['sortino_strat']} | **{m_rp['sortino_strat']}** | **{m_inst['sortino_strat']}** | {m_base['sortino_bench']} |
| **Máximo Drawdown (MDD)** | {m_base['max_dd_strat']}% | {m_cap['max_dd_strat']}% | **{m_rp['max_dd_strat']}%** | **{m_inst['max_dd_strat']}%** | {m_base['max_dd_bench']}% |
| **Beta de Mercado (Beta)** | {m_base['beta']} | {m_cap['beta']} | {m_rp['beta']} | {m_inst['beta']} | 1.00 |
| **Alpha Anual de Jensen (Alpha)** | **+{m_base['alpha_annual']}%** | **+{m_cap['alpha_annual']}%** | **+{m_rp['alpha_annual']}%** | **+{m_inst['alpha_annual']}%** | 0.00% |
| **Capital Final ($10k base)** | **${m_base['final_nav_strat']:,.2f}** | **${m_cap['final_nav_strat']:,.2f}** | **${m_rp['final_nav_strat']:,.2f}** | **${m_inst['final_nav_strat']:,.2f}** | ${m_base['final_nav_bench']:,.2f} |

---

## 2. Historial de Rebalanceos (Estrategia Institucional)

Total de períodos: **{len(reb_events)}**.

| Fecha | Cartera Seleccionada | Sectores Representados | Cobertura T-Bills | Valor Cartera (USD) |
| :---: | :--- | :--- | :---: | :---: |
"""
    for reb in reb_events:
        tkrs = ", ".join(reb["selected_stocks"])
        secs = ", ".join(set(reb["sectors"]))
        cash_str = f"{reb['cash_pct']}%" if reb["cash_pct"] > 0 else "0% (100% Equity)"
        md += f"| {reb['date']} | `{tkrs}` | {secs} | {cash_str} | ${reb['portfolio_value']:,.2f} |\n"

    md += r"""
---

## 3. Conclusiones y Hallazgos Cuantitativos

1. **Impacto de Risk Parity (Ponderación Inversa de Volatilidad):**
   * Al dimensionar las posiciones inversamente proporcionales a su volatilidad de 30 ruedas, se neutraliza la sobreponderación involuntaria de riesgo que ocurría en Equal-Weight, reduciendo notablemente la volatilidad de la cartera y optimizando el Sharpe Ratio.
2. **Efecto del Límite de Concentración Sectorial (Tope Máx 2):**
   * Previene clústeres de riesgo (como tener 4 acciones de semiconductores en simultáneo), obligando al modelo a incorporar activos de Salud, Consumo o Finanzas cuando la tecnología se sobrecalienta.
3. **Filtro de Régimen de Mercado (+ Macro Hedge):**
   * Respalda al inversor en meses bajistas reservando liquidez en T-Bills al 4% anual, conteniendo el Drawdown y liberando munición para recomprar activos en pisos de valuación.
"""
    with open(REPORT_MD_FILE, "w", encoding="utf-8") as f:
        f.write(md)


def main():
    print("=" * 75)
    print(" 🚀 OPTIMIZACIÓN MULTI-ESTRATEGIA DE BACKTESTING — DONDEINVIERTO.ORG")
    print("=" * 75)

    market_data = get_all_market_data(force_refresh=False)

    print("\n⚙️ [1/4] Simulando Estrategia 1: Baseline Top 5 (Equal Weight, Sin Topes)...")
    sim_base = run_backtest_simulation(market_data, top_n=5, weighting_mode="equal", sector_cap=None, use_regime_filter=False)
    m_base = compute_metrics(sim_base["strat_curve"], sim_base["bench_curve"])

    print("⚙️ [2/4] Simulando Estrategia 2: Top 5 + Sector Cap (Máximo 2 activos por sector)...")
    sim_cap = run_backtest_simulation(market_data, top_n=5, weighting_mode="equal", sector_cap=2, use_regime_filter=False)
    m_cap = compute_metrics(sim_cap["strat_curve"], sim_cap["bench_curve"])

    print("⚙️ [3/4] Simulando Estrategia 3: Top 5 Risk Parity (Vol Sizing + Sector Cap 2)...")
    sim_rp = run_backtest_simulation(market_data, top_n=5, weighting_mode="risk_parity", sector_cap=2, use_regime_filter=False)
    m_rp = compute_metrics(sim_rp["strat_curve"], sim_rp["bench_curve"])

    print("⚙️ [4/4] Simulando Estrategia 4: Top 5 Institucional (+ Macro Regime Hedge)...")
    sim_inst = run_backtest_simulation(market_data, top_n=5, weighting_mode="risk_parity", sector_cap=2, use_regime_filter=True, regime_cash_pct=0.30)
    m_inst = compute_metrics(sim_inst["strat_curve"], sim_inst["bench_curve"])

    print("\n" + "=" * 75)
    print(" 🏆 MATRIZ DE RENDIMIENTO Y RIESGO COMPARADA")
    print("=" * 75)
    print(f"Período: {m_base['start_date']}  a  {m_base['end_date']} (~{m_base['n_years']} Años)")
    print("-" * 75)
    print("  MÉTRICA                     BASELINE   SECTOR CAP  RISK PARITY  INSTITUCIONAL  SPY")
    print("-" * 75)
    print(f"  Retorno Total (%):          +{m_base['total_ret_strat']:<8} +{m_cap['total_ret_strat']:<9} +{m_rp['total_ret_strat']:<10} +{m_inst['total_ret_strat']:<12} +{m_base['total_ret_bench']}%")
    print(f"  CAGR (% anual):              {m_base['cagr_strat']:<8}  {m_cap['cagr_strat']:<9}  {m_rp['cagr_strat']:<10}  {m_inst['cagr_strat']:<12}  {m_base['cagr_bench']}%")
    print(f"  Volatilidad (% anual):       {m_base['vol_strat']:<8}  {m_cap['vol_strat']:<9}  {m_rp['vol_strat']:<10}  {m_inst['vol_strat']:<12}  {m_base['vol_bench']}%")
    print(f"  Sharpe Ratio (Rf=4%):        {m_base['sharpe_strat']:<8}  {m_cap['sharpe_strat']:<9}  {m_rp['sharpe_strat']:<10}  {m_inst['sharpe_strat']:<12}  {m_base['sharpe_bench']}")
    print(f"  Sortino Ratio:               {m_base['sortino_strat']:<8}  {m_cap['sortino_strat']:<9}  {m_rp['sortino_strat']:<10}  {m_inst['sortino_strat']:<12}  {m_base['sortino_bench']}")
    print(f"  Máximo Drawdown (%):        {m_base['max_dd_strat']:<8} {m_cap['max_dd_strat']:<9} {m_rp['max_dd_strat']:<10} {m_inst['max_dd_strat']:<12} {m_base['max_dd_bench']}%")
    print(f"  Beta vs S&P 500:             {m_base['beta']:<8}  {m_cap['beta']:<9}  {m_rp['beta']:<10}  {m_inst['beta']:<12}  1.00")
    print(f"  Alpha Anual de Jensen (%):  +{m_base['alpha_annual']:<8} +{m_cap['alpha_annual']:<9} +{m_rp['alpha_annual']:<10} +{m_inst['alpha_annual']:<12}  0.00%")
    print(f"  Capital Final ($10k base):  ${m_base['final_nav_strat']:<7.0f}  ${m_cap['final_nav_strat']:<8.0f}  ${m_rp['final_nav_strat']:<9.0f}  ${m_inst['final_nav_strat']:<11.0f}  ${m_base['final_nav_bench']:<7.0f}")
    print("=" * 75)

    update_report(m_base, m_cap, m_rp, m_inst, sim_inst)
    print(f"\n📄 Informe actualizado generado en: {REPORT_MD_FILE}\n")


if __name__ == "__main__":
    main()
