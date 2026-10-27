# DondeInvierto 📈

Plataforma inteligente de recomendación financiera que analiza diariamente el mercado de Estados Unidos y genera un **Top 10 diario** de:
1. **Acciones de EE.UU.** (S&P 500 y Nasdaq)
2. **ETFs** (Índices globales, temáticos y sectoriales)
3. **Bonos y Renta Fija** (Bonos del Tesoro estadounidense, corporativos y TIPS)

---

## 🚀 Cómo ejecutar el proyecto localmente

1. **Activar el entorno virtual de Python:**
   * En Windows (PowerShell):
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * En Windows (CMD):
     ```cmd
     .\venv\Scripts\activate.bat
     ```

2. **Iniciar la aplicación interactiva Streamlit:**
   ```bash
   streamlit run app.py
   ```
   Se abrirá automáticamente en tu navegador en `http://localhost:8501`.

---

## 🧠 Metodología de Selección Cuantitativa (Scoring 0 - 100)

### 1. Acciones (Stocks)
* **Potencial Alcista de Analistas (40%):** Compara el precio actual con el *Target Price* de consenso de Wall Street.
* **Momentum y Medias Móviles (35%):** Evalúa si el precio cotiza por encima de la media de 20 y 50 días (SMA) y si el indicador RSI (14 días) se encuentra en una zona óptima de acumulación (40 a 65).
* **Consenso Institucional (25%):** Calificación promedio otorgada por firmas de inversión (*Strong Buy*, *Buy*, etc.).

### 2. ETFs (Exchange Traded Funds)
* **Rendimiento Reciente (40%):** Retorno acumulado a 3 meses y 1 año.
* **Eficiencia en Comisiones (30%):** Bonifica fondos con bajo ratio de gastos (*Expense Ratio* menor al 0.10%).
* **Tendencia Estructural (30%):** Posición técnica alcista sobre la media móvil de 200 días y dividendo.

### 3. Bonos / Renta Fija
* **Rendimiento Anual (*Yield*) (45%):** Tasa de cupón / dividendo efectivo anual.
* **Baja Volatilidad y Preservación de Capital (35%):** Menor desviación estándar diaria.
* **Tendencia a Corto Plazo (20%):** Comportamiento en los últimos 90 días.

---

## 📁 Estructura del Proyecto

```
c:\DondeInvierto\
│
├── app.py              # Interfaz visual interactiva con gráficos Plotly
├── screener.py         # Motor de análisis financiero, métricas y scoring
├── requirements.txt    # Dependencias del proyecto
├── market_cache.json   # Caché diaria para acelerar consultas a milisegundos
└── README.md           # Documentación
```
