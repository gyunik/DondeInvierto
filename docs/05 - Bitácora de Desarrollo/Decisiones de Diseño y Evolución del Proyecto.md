# 🏛️ Decisiones de Diseño y Evolución del Proyecto (ADRs)

## ADR 001 — Migración de Streamlit a Next.js 15
* **Contexto**: El prototipo original en Python/Streamlit era excelente para validar ideas, pero lento para usuarios finales y poco escalable a nivel de diseño comercial.
* **Decisión**: Reescribir el frontend en Next.js 15 + Tailwind CSS y desplegar en la red edge de Vercel.
* **Consecuencias**: Carga instantánea (<1 segundo), SEO optimizado, diseño 100% responsivo y costo de infraestructura cero.

---

## ADR 002 — Adaptación Integral al Mercado Argentino
* **Contexto**: Un inversor en Argentina no suele comprar acciones directas en dólares en brokers de EE.UU. por fricciones cambiarias; utiliza CEDEARs en pesos y Obligaciones Negociables.
* **Decisión**: Integrar precios automáticos en pesos vía CCL, ratios de conversión oficiales y renta fija local en dólares (ONs y Bonos Soberanos).
* **Consecuencias**: Máxima adopción y utilidad directa para el inversor minorista argentino.

---

## ADR 003 — Transparencia de Paridad en Bonos y ONs
* **Contexto**: Los inversores necesitan saber rápidamente si un bono cotiza con prima ("Sobre la par") o con descuento ("Bajo la par") para entender la TIR real.
* **Decisión**: Agregar la columna `COTIZACIÓN & PARIDAD` con badges de color explícitos.

---

## ADR 004 — Centralización de Documentación en Obsidian Vault (/docs)
* **Contexto**: Mantener la base de conocimiento estructurada de la misma forma que en el proyecto `ListeningLab`.
* **Decisión**: Establecer `C:\DondeInvierto\docs` como Bóveda de Obsidian, gestionada conjuntamente por el usuario y el LLM bajo el patrón `llm-wiki`.
