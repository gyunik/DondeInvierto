# 🏗️ Stack Tecnológico y Pipeline de Datos

## Arquitectura General
El proyecto sigue una arquitectura desacoplada y estática/serverless de alto rendimiento:

```
[Fuentes de Datos de Mercado] (Yahoo Finance, ByMA, MAE, Rava)
                 │
                 ▼
     [Screener & Quant Engine] (Python / screener.py)
                 │  (Genera marketData.json optimizado)
                 ▼
        [Frontend Next.js 15] (web/src/app/page.tsx)
                 │
                 ▼
       [Despliegue Serverless] (Vercel Edge Network)
                 │
                 ▼
        [Usuario Inversor Final] (https://donde-invierto.vercel.app)
```

## Componentes Técnicos
1. **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
2. **Estilos**: Tailwind CSS, paleta de colores Dark Quant, tipografía sans-serif de alto contraste.
3. **Iconografía**: `lucide-react` para indicadores financieros limpios y ligeros.
4. **Base de Datos / Snapshot**: `web/src/data/marketData.json` (almacena el último snapshot de mercado con precios, TIRs, ratios y tesis analíticas).
5. **Hosting & CI/CD**: Repositorio en GitHub (`https://github.com/gyunik/DondeInvierto`) conectado con despliegue automático en Vercel.
