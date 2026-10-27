"""
screener.py - Motor de análisis y selección de Activos Financieros de EE.UU.
Evalúa y rankea diariamente:
1. Acciones (S&P 500 / Nasdaq)
2. ETFs (Sectores, Índices globales y temáticos)
3. Bonos (Bonos del Tesoro, Corporativos y Deuda)
"""

import warnings
warnings.filterwarnings("ignore")

# Compatibilidad SSL para entornos Windows con certificados locales
try:
    import curl_cffi.requests
    _orig_request = curl_cffi.requests.Session.request
    def _patched_request(self, method, url, **kwargs):
        kwargs['verify'] = False
        return _orig_request(self, method, url, **kwargs)
    curl_cffi.requests.Session.request = _patched_request
except Exception:
    pass

import json
import os
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import yfinance as yf

CACHE_FILE = os.path.join(os.path.dirname(__file__), "market_cache.json")

# Universos de inversión
STOCKS_UNIVERSE = [
    "NVDA", "MSFT", "AAPL", "AMZN", "GOOGL", "META", "TSLA",
    "JPM", "V", "MA", "UNH", "LLY", "XOM", "PG", "HD",
    "COST", "AVGO", "MRK", "PEP", "ABBV", "CRM", "ADBE",
    "AMD", "NFLX", "BAC", "WMT", "QCOM", "TXN", "INTC", "CAT"
]

ETFS_UNIVERSE = [
    {"ticker": "SPY", "name": "SPDR S&P 500 ETF", "category": "Renta Variable Amplia (S&P 500)"},
    {"ticker": "QQQ", "name": "Invesco QQQ Trust", "category": "Tecnología / Nasdaq 100"},
    {"ticker": "VOO", "name": "Vanguard S&P 500 ETF", "category": "Renta Variable Amplia (Bajo Costo)"},
    {"ticker": "VTI", "name": "Vanguard Total Stock Market", "category": "Mercado Total USA"},
    {"ticker": "IWM", "name": "iShares Russell 2000", "category": "Small Caps USA"},
    {"ticker": "DIA", "name": "SPDR Dow Jones Industrial", "category": "Blue Chips Industriales"},
    {"ticker": "XLK", "name": "Technology Select Sector SPDR", "category": "Sector Tecnológico"},
    {"ticker": "XLV", "name": "Health Care Select Sector SPDR", "category": "Sector Salud"},
    {"ticker": "XLF", "name": "Financial Select Sector SPDR", "category": "Sector Financiero"},
    {"ticker": "XLE", "name": "Energy Select Sector SPDR", "category": "Sector Energía"},
    {"ticker": "XLI", "name": "Industrial Select Sector SPDR", "category": "Sector Industrial"},
    {"ticker": "XLP", "name": "Consumer Staples Select SPDR", "category": "Consumo Defensivo"},
    {"ticker": "XLU", "name": "Utilities Select Sector SPDR", "category": "Servicios Públicos"},
    {"ticker": "SMH", "name": "VanEck Semiconductor ETF", "category": "Semiconductores"},
    {"ticker": "SCHD", "name": "Schwab U.S. Dividend Equity", "category": "Dividendos Crecientes"},
    {"ticker": "VYM", "name": "Vanguard High Dividend Yield", "category": "Alto Dividendo"},
    {"ticker": "GLD", "name": "SPDR Gold Shares", "category": "Oro / Cobertura"},
    {"ticker": "VNQ", "name": "Vanguard Real Estate ETF", "category": "Bienes Raíces (REITs)"}
]

BONDS_UNIVERSE = [
    {"ticker": "BIL", "name": "SPDR Bloomberg 1-3 Month T-Bill", "category": "Tesoro USA Ultracorto (Caja líquida)", "duration": "0-3 Meses"},
    {"ticker": "SHY", "name": "iShares 1-3 Year Treasury Bond", "category": "Tesoro USA Corto Plazo", "duration": "1-3 Años"},
    {"ticker": "IEI", "name": "iShares 3-7 Year Treasury Bond", "category": "Tesoro USA Mediano Plazo", "duration": "3-7 Años"},
    {"ticker": "IEF", "name": "iShares 7-10 Year Treasury Bond", "category": "Tesoro USA Referencia 10Y", "duration": "7-10 Años"},
    {"ticker": "TLT", "name": "iShares 20+ Year Treasury Bond", "category": "Tesoro USA Largo Plazo", "duration": "20+ Años"},
    {"ticker": "BND", "name": "Vanguard Total Bond Market", "category": "Mercado Agregado USA", "duration": "Medio Diversificado"},
    {"ticker": "AGG", "name": "iShares Core U.S. Aggregate Bond", "category": "Mercado Agregado USA", "duration": "Medio Diversificado"},
    {"ticker": "LQD", "name": "iShares iBoxx $ Investment Grade", "category": "Corporativo Grado de Inversión", "duration": "Mediano Plazo"},
    {"ticker": "VCIT", "name": "Vanguard Intermediate Corporate", "category": "Corporativo Grado de Inversión", "duration": "5-10 Años"},
    {"ticker": "HYG", "name": "iShares iBoxx $ High Yield Corporate", "category": "Alto Rendimiento (High Yield)", "duration": "Corto/Medio"},
    {"ticker": "TIP", "name": "iShares TIPS Bond ETF", "category": "Protegido contra Inflación (TIPS)", "duration": "Mediano Plazo"},
    {"ticker": "MUB", "name": "iShares National Muni Bond", "category": "Bonos Municipales (Exentos de imp.)", "duration": "Mediano Plazo"}
]


def calculate_rsi(series: pd.Series, period: int = 14) -> float:
    """Calcula el Relative Strength Index (RSI)."""
    if len(series) < period + 1:
        return 50.0
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    if loss.iloc[-1] == 0:
        return 100.0
    rs = gain.iloc[-1] / loss.iloc[-1]
    return float(100 - (100 / (1 + rs)))


def get_market_overview():
    """Descarga los índices principales para el encabezado del dashboard."""
    indices = {"^GSPC": "S&P 500", "^IXIC": "Nasdaq 100", "^TNX": "Bono USA 10Y Yield", "^VIX": "VIX (Volatilidad)"}
    data = {}
    for sym, label in indices.items():
        try:
            ticker = yf.Ticker(sym)
            hist = ticker.history(period="5d")
            if not hist.empty and len(hist) >= 2:
                curr = hist["Close"].iloc[-1]
                prev = hist["Close"].iloc[-2]
                chg = ((curr - prev) / prev) * 100
                data[sym] = {
                    "name": label,
                    "price": round(float(curr), 2),
                    "change": round(float(chg), 2)
                }
            elif not hist.empty:
                curr = hist["Close"].iloc[-1]
                data[sym] = {"name": label, "price": round(float(curr), 2), "change": 0.0}
        except Exception:
            data[sym] = {"name": label, "price": 0.0, "change": 0.0}
    return data


def analyze_stocks():
    """Analiza y puntúa el universo de acciones de USA."""
    results = []
    for symbol in STOCKS_UNIVERSE:
        try:
            t = yf.Ticker(symbol)
            hist = t.history(period="6mo")
            if hist.empty or len(hist) < 30:
                continue

            info = t.info or {}
            curr_price = float(hist["Close"].iloc[-1])
            prev_price = float(hist["Close"].iloc[-2]) if len(hist) > 1 else curr_price
            day_change = ((curr_price - prev_price) / prev_price) * 100

            # Medias móviles
            sma50 = float(hist["Close"].rolling(50).mean().iloc[-1]) if len(hist) >= 50 else curr_price
            sma20 = float(hist["Close"].rolling(20).mean().iloc[-1]) if len(hist) >= 20 else curr_price
            rsi = calculate_rsi(hist["Close"], 14)

            # Consenso de analistas
            target_price = info.get("targetMeanPrice")
            recommendation = info.get("recommendationKey", "N/A").replace("_", " ").title()
            forward_pe = info.get("forwardPE")
            profit_margins = info.get("profitMargins")

            upside = 0.0
            if target_price and target_price > 0 and curr_price > 0:
                upside = ((target_price - curr_price) / curr_price) * 100

            # Scoring:
            # 1. Upside potencial (max 40 pts)
            upside_score = min(max(upside, 0), 40)

            # 2. Momentum y tendencia técnica (max 35 pts)
            tech_score = 0
            if curr_price > sma20:
                tech_score += 10
            if curr_price > sma50:
                tech_score += 15
            # RSI saludable (40-65 es zona ideal de acumulación, ni sobrecomprado ni desplome)
            if 40 <= rsi <= 65:
                tech_score += 10
            elif 30 <= rsi < 40:
                tech_score += 8  # Potencial rebote
            elif 65 < rsi <= 75:
                tech_score += 5  # Fuerte pero algo caliente

            # 3. Recomendación institucional (max 25 pts)
            rec_score = 10
            if recommendation.lower() == "strong buy":
                rec_score = 25
            elif recommendation.lower() == "buy":
                rec_score = 20
            elif recommendation.lower() == "hold":
                rec_score = 10

            total_score = min(round(upside_score + tech_score + rec_score, 1), 100)

            # Redacción de tesis
            thesis_points = []
            if upside > 10:
                thesis_points.append(f"Potencial alcista estimado de analistas: +{round(upside, 1)}%")
            if curr_price > sma50:
                thesis_points.append("Tendencia técnica alcista sobre SMA 50")
            if 40 <= rsi <= 60:
                thesis_points.append(f"RSI en zona neutral/acumulación ({round(rsi, 1)})")
            elif rsi < 40:
                thesis_points.append(f"RSI en sobreventa ({round(rsi, 1)}), oportunidad de rebote")
            if recommendation in ["Buy", "Strong Buy"]:
                thesis_points.append(f"Consenso mayoritario: {recommendation}")

            thesis = " | ".join(thesis_points) if thesis_points else "Seguimiento cuantitativo de tendencia y fundamentales."

            results.append({
                "ticker": symbol,
                "name": info.get("shortName", symbol),
                "sector": info.get("sector", "Tecnología / General"),
                "price": round(curr_price, 2),
                "day_change": round(day_change, 2),
                "target_price": round(target_price, 2) if target_price else None,
                "upside": round(upside, 1) if target_price else None,
                "recommendation": recommendation,
                "pe_ratio": round(forward_pe, 1) if forward_pe else None,
                "rsi": round(rsi, 1),
                "score": total_score,
                "thesis": thesis
            })
        except Exception as e:
            continue

    # Ordenar por puntaje descendente y tomar los top 10
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:10]


def analyze_etfs():
    """Analiza y puntúa el universo de ETFs."""
    results = []
    for item in ETFS_UNIVERSE:
        symbol = item["ticker"]
        try:
            t = yf.Ticker(symbol)
            hist = t.history(period="1y")
            if hist.empty or len(hist) < 30:
                continue

            info = t.info or {}
            curr_price = float(hist["Close"].iloc[-1])
            prev_price = float(hist["Close"].iloc[-2]) if len(hist) > 1 else curr_price
            day_change = ((curr_price - prev_price) / prev_price) * 100

            # Retornos 3 meses y 1 año
            ret_3m = 0.0
            if len(hist) >= 63:
                p_3m = float(hist["Close"].iloc[-63])
                ret_3m = ((curr_price - p_3m) / p_3m) * 100

            ret_1y = 0.0
            if len(hist) >= 250:
                p_1y = float(hist["Close"].iloc[-250])
                ret_1y = ((curr_price - p_1y) / p_1y) * 100
            else:
                p_init = float(hist["Close"].iloc[0])
                ret_1y = ((curr_price - p_init) / p_init) * 100

            # Volatilidad anualizada (30 días)
            daily_returns = hist["Close"].pct_change().dropna()
            volatility = float(daily_returns.tail(30).std() * np.sqrt(252) * 100) if len(daily_returns) >= 30 else 15.0

            expense_ratio = info.get("expenseRatio", 0.001) or 0.001  # Ej. 0.0003 es 0.03%
            dividend_yield = (info.get("yield", 0.0) or info.get("dividendYield", 0.0) or 0.0) * 100

            sma50 = float(hist["Close"].rolling(50).mean().iloc[-1]) if len(hist) >= 50 else curr_price
            sma200 = float(hist["Close"].rolling(200).mean().iloc[-1]) if len(hist) >= 200 else curr_price

            # Scoring:
            # 1. Rendimiento 3M y 1A (max 40 pts)
            ret_score = min(max(ret_3m * 1.5, 0), 20) + min(max(ret_1y * 0.8, 0), 20)

            # 2. Tendencia estructural (max 30 pts)
            trend_score = 0
            if curr_price > sma50:
                trend_score += 15
            if curr_price > sma200:
                trend_score += 15

            # 3. Eficiencia de costos & dividendo (max 30 pts)
            cost_score = max(20 - (expense_ratio * 2000), 5)  # Ratio menor a 0.1% suma mucho
            div_score = min(dividend_yield * 2.5, 10)

            total_score = min(round(ret_score + trend_score + cost_score + div_score, 1), 100)

            thesis_points = [
                f"Retorno 3M: {round(ret_3m, 1)}%",
                f"Costo anual (Expense Ratio): {round(expense_ratio * 100, 2)}%"
            ]
            if curr_price > sma200:
                thesis_points.append("En tendencia alcista de largo plazo (> SMA 200)")
            if dividend_yield > 1.5:
                thesis_points.append(f"Rendimiento por dividendo: {round(dividend_yield, 2)}%")

            results.append({
                "ticker": symbol,
                "name": item["name"],
                "category": item["category"],
                "price": round(curr_price, 2),
                "day_change": round(day_change, 2),
                "return_3m": round(ret_3m, 1),
                "return_1y": round(ret_1y, 1),
                "expense_ratio": round(expense_ratio * 100, 2),
                "dividend_yield": round(dividend_yield, 2),
                "volatility": round(volatility, 1),
                "score": total_score,
                "thesis": " | ".join(thesis_points)
            })
        except Exception:
            continue

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:10]


def analyze_bonds():
    """Analiza y puntúa el universo de Bonos / Renta Fija."""
    results = []
    for item in BONDS_UNIVERSE:
        symbol = item["ticker"]
        try:
            t = yf.Ticker(symbol)
            hist = t.history(period="6mo")
            if hist.empty or len(hist) < 20:
                continue

            info = t.info or {}
            curr_price = float(hist["Close"].iloc[-1])
            prev_price = float(hist["Close"].iloc[-2]) if len(hist) > 1 else curr_price
            day_change = ((curr_price - prev_price) / prev_price) * 100

            # Yield anual
            raw_yield = info.get("yield") or info.get("dividendYield") or 0.0
            if raw_yield < 0.1 and raw_yield > 0:
                bond_yield = raw_yield * 100
            elif raw_yield >= 0.1:
                bond_yield = raw_yield
            else:
                # Estimado típico según tipo de bono si no viene en info
                bond_yield = 4.2 if "BIL" in symbol or "SHY" in symbol else 4.6

            # Volatilidad histórica (a menor volatilidad en bonos, más defensivo)
            daily_returns = hist["Close"].pct_change().dropna()
            volatility = float(daily_returns.std() * np.sqrt(252) * 100) if len(daily_returns) >= 20 else 5.0

            # Retorno 3 meses
            ret_3m = 0.0
            if len(hist) >= 60:
                p_3m = float(hist["Close"].iloc[-60])
                ret_3m = ((curr_price - p_3m) / p_3m) * 100

            # Scoring de Bonos:
            # 1. Atractivo de Yield (max 45 pts)
            # Un yield de 4-6% es muy bueno en el contexto actual
            yield_score = min(bond_yield * 9, 45)

            # 2. Estabilidad de capital / baja volatilidad (max 35 pts)
            stability_score = max(35 - (volatility * 2.5), 10)

            # 3. Tendencia a corto plazo (max 20 pts)
            momentum_score = 10 + min(max(ret_3m * 2, -10), 10)

            total_score = min(round(yield_score + stability_score + momentum_score, 1), 100)

            thesis = f"Rendimiento anual estimado: {round(bond_yield, 2)}% | Duración: {item['duration']} | Volatilidad: {round(volatility, 1)}%"

            results.append({
                "ticker": symbol,
                "name": item["name"],
                "category": item["category"],
                "duration": item["duration"],
                "price": round(curr_price, 2),
                "day_change": round(day_change, 2),
                "yield": round(bond_yield, 2),
                "volatility": round(volatility, 1),
                "score": total_score,
                "thesis": thesis
            })
        except Exception:
            continue

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:10]


def get_daily_rankings(force_refresh: bool = False):
    """
    Retorna el informe diario completo. Si existe caché del día de hoy y no se fuerza refresco,
    lo lee del disco para acelerar la carga a milisegundos.
    """
    today_str = datetime.now().strftime("%Y-%m-%d")

    if not force_refresh and os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("date") == today_str and data.get("stocks"):
                    return data
        except Exception:
            pass

    # Generación de análisis en tiempo real
    market_overview = get_market_overview()
    stocks = analyze_stocks()
    etfs = analyze_etfs()
    bonds = analyze_bonds()

    payload = {
        "date": today_str,
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "market": market_overview,
        "stocks": stocks,
        "etfs": etfs,
        "bonds": bonds
    }

    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"No se pudo guardar la caché: {e}")

    return payload


if __name__ == "__main__":
    print("Ejecutando screener de prueba...")
    data = get_daily_rankings(force_refresh=True)
    print(f"Fecha: {data['date']}")
    print(f"Top 3 Acciones: {[s['ticker'] for s in data['stocks'][:3]]}")
    print(f"Top 3 ETFs: {[e['ticker'] for e in data['etfs'][:3]]}")
    print(f"Top 3 Bonos: {[b['ticker'] for b in data['bonds'][:3]]}")
