"""
app.py - Interfaz Web Interactiva para 'DondeInvierto'
Dashboard financiero diario con Top 10 Acciones, ETFs y Bonos de EE.UU.
"""

import warnings
warnings.filterwarnings("ignore")

try:
    import curl_cffi.requests
    _orig_request = curl_cffi.requests.Session.request
    def _patched_request(self, method, url, **kwargs):
        kwargs['verify'] = False
        return _orig_request(self, method, url, **kwargs)
    curl_cffi.requests.Session.request = _patched_request
except Exception:
    pass

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import yfinance as yf
from datetime import datetime
from screener import get_daily_rankings

st.set_page_config(
    page_title="DondeInvierto | Radar Diario USA",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilos CSS personalizados
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #64748b;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #f8fafc;
        border-radius: 10px;
        padding: 12px 18px;
        border: 1px solid #e2e8f0;
    }
    .badge-rank {
        display: inline-block;
        padding: 3px 8px;
        font-weight: bold;
        border-radius: 6px;
        color: white;
        background-color: #2563eb;
    }
    .badge-score {
        display: inline-block;
        padding: 4px 10px;
        font-weight: 600;
        border-radius: 6px;
        background-color: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 20px;
    }
    .stTabs [data-baseweb="tab"] {
        font-size: 1.1rem;
        font-weight: 600;
        padding: 10px 16px;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_data(ttl=3600, show_spinner=False)
def load_data(force_refresh: bool = False):
    return get_daily_rankings(force_refresh=force_refresh)


def plot_ticker_history(ticker: str, period: str = "6mo"):
    """Genera un gráfico interactivo con medias móviles."""
    try:
        t = yf.Ticker(ticker)
        df = t.history(period=period)
        if df.empty:
            return None

        df["SMA20"] = df["Close"].rolling(20).mean()
        df["SMA50"] = df["Close"].rolling(50).mean()

        fig = go.Figure()
        fig.add_trace(go.Candlestick(
            x=df.index,
            open=df["Open"],
            high=df["High"],
            low=df["Low"],
            close=df["Close"],
            name="Precio",
            increasing_line_color="#10b981",
            decreasing_line_color="#ef4444"
        ))
        fig.add_trace(go.Scatter(
            x=df.index, y=df["SMA20"],
            line=dict(color="#3b82f6", width=1.5),
            name="SMA 20"
        ))
        fig.add_trace(go.Scatter(
            x=df.index, y=df["SMA50"],
            line=dict(color="#f59e0b", width=1.5),
            name="SMA 50"
        ))

        fig.update_layout(
            margin=dict(l=20, r=20, t=30, b=20),
            height=320,
            xaxis_rangeslider_visible=False,
            template="plotly_white",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        return fig
    except Exception:
        return None


# Sidebar
with st.sidebar:
    st.image("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80", use_container_width=True)
    st.markdown("### ⚙️ Panel de Control")

    refresh_btn = st.button("🔄 Actualizar Datos de Hoy", use_container_width=True)
    if refresh_btn:
        st.cache_data.clear()
        data = load_data(force_refresh=True)
        st.success("¡Datos actualizados con el mercado!")
    else:
        data = load_data(force_refresh=False)

    st.markdown("---")
    st.markdown("### 🎯 Perfil de Inversión")
    profile = st.selectbox(
        "Foco preferido:",
        ["Balanceado (Todos)", "Crecimiento / Agresivo (Acciones Tech & ETFs)", "Conservador / Defensivo (Bonos & Dividendos)"]
    )

    st.markdown("---")
    st.markdown("### ℹ️ Metodología")
    with st.expander("¿Cómo se calcula el Score?"):
        st.markdown("""
        * **Acciones:** Pondera el *Upside* de analistas institucionales (40%), posición sobre medias móviles de 20 y 50 días (35%), RSI neutral (40-65) y rating de consenso.
        * **ETFs:** Rendimiento a 3 meses y 1 año (40%), ratio de gastos (*expense ratio*) bajo (30%), y tendencia técnica (> SMA 200).
        * **Bonos:** Tasa de interés efectiva anual (*Yield*) (45%), baja volatilidad y estabilidad de capital (35%), y retorno a corto plazo (20%).
        """)

    st.markdown("---")
    st.caption("⚠️ **Aviso Legal:** Esta herramienta tiene fines educativos e informativos. Los rendimientos pasados no garantizan resultados futuros.")

# Encabezado Principal
st.markdown("<div class='main-header'>DondeInvierto 📈</div>", unsafe_allow_html=True)
st.markdown(f"<div class='sub-header'>Radar diario de oportunidades en Wall Street | Actualizado: <b>{data.get('last_updated', datetime.now().strftime('%Y-%m-%d'))}</b></div>", unsafe_allow_html=True)

# Barra de Métricas de Mercado
market = data.get("market", {})
if market:
    cols = st.columns(len(market))
    for col, (sym, m_data) in zip(cols, market.items()):
        with col:
            chg = m_data.get("change", 0.0)
            sign = "+" if chg > 0 else ""
            delta_str = f"{sign}{chg}%"
            val_str = f"${m_data.get('price', 0):,.2f}" if sym != "^TNX" else f"{m_data.get('price', 0)}%"
            st.metric(label=m_data.get("name", sym), value=val_str, delta=delta_str)

st.write("")

# Tabs Principales
tab_stocks, tab_etfs, tab_bonds = st.tabs([
    "📈 Top 10 Acciones (USA)",
    "📊 Top 10 ETFs",
    "🏛️ Top 10 Bonos / Renta Fija"
])

# ----------------- TAB ACCIONES -----------------
with tab_stocks:
    st.markdown("#### Las 10 acciones con mejor combinación de potencial de analistas y momentum técnico")
    stocks = data.get("stocks", [])

    if not stocks:
        st.info("Cargando análisis de acciones... Haz clic en 'Actualizar Datos de Hoy' si es necesario.")
    else:
        for idx, item in enumerate(stocks, 1):
            with st.container():
                c1, c2, c3, c4, c5 = st.columns([1, 4, 3, 3, 2])
                with c1:
                    st.markdown(f"### `#{idx}`")
                with c2:
                    st.markdown(f"**{item['ticker']}** — {item['name']}")
                    st.caption(f"Sector: {item.get('sector', 'N/A')}")
                with c3:
                    price = item.get("price", 0)
                    chg = item.get("day_change", 0)
                    chg_color = "#10b981" if chg >= 0 else "#ef4444"
                    st.markdown(f"**Precio:** ${price:,.2f}")
                    st.markdown(f"<span style='color:{chg_color}; font-size: 0.9rem;'>{'+' if chg > 0 else ''}{chg}% hoy</span>", unsafe_allow_html=True)
                with c4:
                    target = item.get("target_price")
                    upside = item.get("upside")
                    if target and upside is not None:
                        st.markdown(f"**Obj. Analistas:** ${target:,.2f}")
                        st.markdown(f"<span style='color: #2563eb; font-weight:600;'>+{upside}% potencial</span>", unsafe_allow_html=True)
                    else:
                        st.write("Obj: N/D")
                with c5:
                    st.markdown(f"<div class='badge-score'>Score: {item.get('score', 0)}/100</div>", unsafe_allow_html=True)
                    st.caption(f"Consenso: **{item.get('recommendation', 'Buy')}**")

                st.markdown(f"💡 **Tesis:** {item.get('thesis', '')}")

                # Gráfico interactivo expandible
                with st.expander(f"Ver gráfico técnico e indicadores de {item['ticker']}"):
                    fig = plot_ticker_history(item["ticker"])
                    if fig:
                        st.plotly_chart(fig, use_container_width=True)
                    else:
                        st.write("Gráfico no disponible temporalmente.")
                st.markdown("---")

# ----------------- TAB ETFS -----------------
with tab_etfs:
    st.markdown("#### Los 10 mejores fondos cotizados (ETFs) por rendimiento ajustado, costos y tendencia")
    etfs = data.get("etfs", [])

    if not etfs:
        st.info("Cargando análisis de ETFs...")
    else:
        for idx, item in enumerate(etfs, 1):
            with st.container():
                c1, c2, c3, c4, c5 = st.columns([1, 4, 3, 3, 2])
                with c1:
                    st.markdown(f"### `#{idx}`")
                with c2:
                    st.markdown(f"**{item['ticker']}** — {item['name']}")
                    st.caption(f"Categoría: {item.get('category', 'ETF')}")
                with c3:
                    st.markdown(f"**Precio:** ${item.get('price', 0):,.2f}")
                    st.caption(f"Retorno 1 Año: **+{item.get('return_1y', 0)}%**")
                with c4:
                    st.markdown(f"**Costo Anual:** {item.get('expense_ratio', 0)}%")
                    st.caption(f"Dividendo Anual: {item.get('dividend_yield', 0)}%")
                with c5:
                    st.markdown(f"<div class='badge-score'>Score: {item.get('score', 0)}/100</div>", unsafe_allow_html=True)

                st.markdown(f"💡 **Tesis:** {item.get('thesis', '')}")

                with st.expander(f"Ver evolución de {item['ticker']}"):
                    fig = plot_ticker_history(item["ticker"], period="1y")
                    if fig:
                        st.plotly_chart(fig, use_container_width=True)
                st.markdown("---")

# ----------------- TAB BONOS -----------------
with tab_bonds:
    st.markdown("#### Los 10 instrumentos de renta fija y bonos con mejor relación rendimiento / seguridad")
    bonds = data.get("bonds", [])

    if not bonds:
        st.info("Cargando análisis de bonos...")
    else:
        for idx, item in enumerate(bonds, 1):
            with st.container():
                c1, c2, c3, c4, c5 = st.columns([1, 4, 3, 3, 2])
                with c1:
                    st.markdown(f"### `#{idx}`")
                with c2:
                    st.markdown(f"**{item['ticker']}** — {item['name']}")
                    st.caption(f"Perfil: {item.get('category', 'Renta Fija')}")
                with c3:
                    st.markdown(f"**Precio:** ${item.get('price', 0):,.2f}")
                    st.caption(f"Plazo / Duración: **{item.get('duration', 'N/D')}**")
                with c4:
                    bond_yield = item.get("yield", 0)
                    st.markdown(f"**Rendimiento (Yield):**")
                    st.markdown(f"<span style='color: #047857; font-weight: 700; font-size: 1.1rem;'>{bond_yield}% anual</span>", unsafe_allow_html=True)
                with c5:
                    st.markdown(f"<div class='badge-score'>Score: {item.get('score', 0)}/100</div>", unsafe_allow_html=True)

                st.markdown(f"💡 **Tesis:** {item.get('thesis', '')}")

                with st.expander(f"Ver estabilidad y precio de {item['ticker']}"):
                    fig = plot_ticker_history(item["ticker"], period="1y")
                    if fig:
                        st.plotly_chart(fig, use_container_width=True)
                st.markdown("---")

# Footer de exportación
st.write("")
col_d1, col_d2 = st.columns([2, 1])
with col_d1:
    st.caption("¿Quieres automatizar el envío diario por email o Telegram? Podemos integrar alertas programadas.")
with col_d2:
    if stocks:
        df_export = pd.DataFrame(stocks)
        csv = df_export.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Descargar Top 10 Acciones (CSV)",
            data=csv,
            file_name=f"dondeinvierto_acciones_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv",
            use_container_width=True
        )
