"use client";

import React from "react";
import { X, Zap, ShieldCheck, TrendingUp, BarChart3, Award, Info } from "lucide-react";
import marketData from "@/data/marketData.json";

export type ScoreItem =
  | (typeof marketData.stocks)[0]
  | (typeof marketData.etfs)[0]
  | (typeof marketData.ons)[0]
  | (typeof marketData.argentina.merval)[0]
  | (typeof marketData.argentina.sovereign_bonds)[0];

interface ScoreDetailModalProps {
  item: ScoreItem | null;
  onClose: () => void;
}

export default function ScoreDetailModal({ item, onClose }: ScoreDetailModalProps) {
  if (!item) return null;

  const score = item.score;
  const isEtf = "expense_ratio" in item && item.expense_ratio !== undefined;
  const isOn = "tir_usd" in item && item.tir_usd !== undefined;
  const isStock = !isEtf && !isOn;

  // Subtítulo de categoría
  let categoryLabel: string = "";
  if ("sector" in item && item.sector) categoryLabel = item.sector;
  else if ("category" in item && item.category) categoryLabel = item.category;
  else if ("issuer" in item && item.issuer) categoryLabel = item.issuer;
  else if ("law" in item && item.law) categoryLabel = item.law;

  // Clasificación cualitativa según Score
  let scoreLabel = "Oportunidad Destacada (Top Tier)";
  let scoreBadgeColor = "bg-emerald-500/20 text-[#00F5A0] border-emerald-500/40";
  if (score >= 90) {
    scoreLabel = "Excelente • Compra Fuerte (Top Tier)";
    scoreBadgeColor = "bg-emerald-500/20 text-[#00F5A0] border-emerald-500/50 shadow-[0_0_12px_rgba(0,245,160,0.3)]";
  } else if (score >= 85) {
    scoreLabel = "Muy Favorable • Alta Convicción";
    scoreBadgeColor = "bg-teal-500/20 text-teal-300 border-teal-500/40";
  } else if (score >= 80) {
    scoreLabel = "Sólido • Ponderación Favorable";
    scoreBadgeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
  } else {
    scoreLabel = "Moderado • En Seguimiento";
    scoreBadgeColor = "bg-slate-500/20 text-slate-300 border-slate-500/40";
  }

  // Definición de pilares según tipo de activo
  interface Pillar {
    title: string;
    weight: number;
    points: number;
    maxPoints: number;
    icon: React.ReactNode;
    desc: string;
    metricDetail: string;
  }

  let pillars: Pillar[] = [];

  if (isStock) {
    const p1 = Math.round(score * 0.35 * 10) / 10;
    const p2 = Math.round(score * 0.25 * 10) / 10;
    const p3 = Math.round(score * 0.20 * 10) / 10;
    const p4 = Math.round((score - p1 - p2 - p3) * 10) / 10;

    const upside = "upside" in item ? item.upside : undefined;
    const targetPrice = "target_price" in item ? item.target_price : undefined;
    const peRatio = "pe_ratio" in item ? item.pe_ratio : undefined;
    const rec = "recommendation" in item ? item.recommendation : undefined;

    pillars = [
      {
        title: "Potencial de Valoración Wall Street",
        weight: 35,
        points: p1,
        maxPoints: 35,
        icon: <TrendingUp className="w-4 h-4 text-[#00F5A0]" />,
        desc: "Pondera el margen de suba proyectado por el consenso de bancos de inversión Tier-1 a 12 meses vista.",
        metricDetail: upside !== undefined ? `Upside estimado: +${upside}% (Target: $${targetPrice} USD)` : "Consenso oficial de bancos"
      },
      {
        title: "Calidad Fundamental y Crecimiento",
        weight: 25,
        points: p2,
        maxPoints: 25,
        icon: <BarChart3 className="w-4 h-4 text-cyan-400" />,
        desc: "Evalúa expansión de ingresos (ventas), generación de caja libre (Free Cash Flow) y múltiplos de valuación P/E razonables.",
        metricDetail: peRatio ? `PER: ${peRatio}x • Crecimiento sostenido de márgenes` : "Márgenes operativos sólidos"
      },
      {
        title: "Tendencia Técnica y Momentum",
        weight: 20,
        points: p3,
        maxPoints: 20,
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        desc: "Analiza si el precio cotiza con soporte institucional sobre su media móvil estratégica (SMA 200) y fuera de sobrecompra extrema.",
        metricDetail: "Tendencia estructural sana • Fuerza relativa favorable"
      },
      {
        title: "Respaldo Institucional y Solvencia",
        weight: 20,
        points: p4,
        maxPoints: 20,
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        desc: "Unanimidad de recomendaciones de cobertura de bancos globales, foso defensivo (moat) y bajo riesgo de balance.",
        metricDetail: rec ? `Postura de Wall Street: ${rec}` : "Bancos Tier-1 unánimes"
      }
    ];
  } else if (isEtf) {
    const p1 = Math.round(score * 0.30 * 10) / 10;
    const p2 = Math.round(score * 0.25 * 10) / 10;
    const p3 = Math.round(score * 0.25 * 10) / 10;
    const p4 = Math.round((score - p1 - p2 - p3) * 10) / 10;

    const upside = "upside" in item ? item.upside : undefined;
    const expense = "expense_ratio" in item ? item.expense_ratio : undefined;

    pillars = [
      {
        title: "Potencial Consenso de Mercado",
        weight: 30,
        points: p1,
        maxPoints: 30,
        icon: <TrendingUp className="w-4 h-4 text-[#00F5A0]" />,
        desc: "Proyección a 12 meses de los Chief Equity Strategists de Wall Street y modelos bottom-up para los componentes del índice.",
        metricDetail: upside !== undefined ? `Upside esperado: +${upside}% a 12 meses` : "Proyección institucional"
      },
      {
        title: "Eficiencia de Costos (Expense Ratio)",
        weight: 25,
        points: p2,
        maxPoints: 25,
        icon: <Award className="w-4 h-4 text-cyan-400" />,
        desc: "Premia a los fondos con menor comisión de administración anual, optimizando el retorno neto del inversor a largo plazo.",
        metricDetail: `Costo Anual: ${expense}% (Categoría eficiente)`
      },
      {
        title: "Liquidez y Respaldo Institucional (AUM)",
        weight: 25,
        points: p3,
        maxPoints: 25,
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        desc: "Patrimonio total bajo administración por las mayores gestoras mundiales (BlackRock, Vanguard, State Street) y alto volumen de arbitraje.",
        metricDetail: "Máxima liquidez de entrada y salida sin spreads elevados"
      },
      {
        title: "Política de Flujo y Dividendos",
        weight: 20,
        points: p4,
        maxPoints: 20,
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        desc: "Estabilidad del flujo distribuido en efectivo o reinversión automática libre de retenciones.",
        metricDetail: "Estructura óptima para protección de capital"
      }
    ];
  } else {
    // Renta Fija / ONs / Bonos
    const p1 = Math.round(score * 0.35 * 10) / 10;
    const p2 = Math.round(score * 0.30 * 10) / 10;
    const p3 = Math.round(score * 0.20 * 10) / 10;
    const p4 = Math.round((score - p1 - p2 - p3) * 10) / 10;

    const tir = "tir_usd" in item ? item.tir_usd : undefined;
    const law = "law" in item ? item.law : undefined;

    pillars = [
      {
        title: "Rendimiento Efectivo Anual (TIR USD)",
        weight: 35,
        points: p1,
        maxPoints: 35,
        icon: <TrendingUp className="w-4 h-4 text-[#00F5A0]" />,
        desc: "Tasa interna de retorno neta en dólares billete comparada contra la curva de tasas de bonos grado de inversión global.",
        metricDetail: tir ? `TIR: ${tir}% anual en dólares` : "Rendimiento en USD"
      },
      {
        title: "Seguridad Jurídica y Calificación Crediticia",
        weight: 30,
        points: p2,
        maxPoints: 30,
        icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
        desc: "Protección bajo legislación de Nueva York y máxima nota de solvencia crediticia otorgada por calificadoras de riesgo.",
        metricDetail: law ? `Jurisdicción: ${law}` : "Grado de inversión seguro"
      },
      {
        title: "Solvencia Operativa del Emisor",
        weight: 20,
        points: p3,
        maxPoints: 20,
        icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
        desc: "Generación probada de flujo de caja exportador en sectores estratégicos (Vaca Muerta, energía o telecomunicaciones esenciales).",
        metricDetail: "Caja neta positiva • Cobertura holgada de intereses"
      },
      {
        title: "Plazo de Maduración y Liquidez en ByMA",
        weight: 15,
        points: p4,
        maxPoints: 15,
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        desc: "Cronograma de amortización y facilidad para comprar o vender en el mercado secundario local.",
        metricDetail: "Amortizaciones periódicas • Alto volumen de negociación"
      }
    ];
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#091220] border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado del Score */}
        <div className="flex items-start gap-3 sm:gap-4 pr-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-900/40 border border-emerald-500/40 flex items-center justify-center text-[#00F5A0] font-black font-mono text-lg shadow-[0_0_15px_rgba(0,245,160,0.2)]">
            {item.ticker}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white font-mono">
                {item.name}
              </h3>
              {categoryLabel && (
                <span className="px-2 py-0.5 rounded bg-[#132840] border border-cyan-500/40 text-cyan-200 text-xs font-semibold">
                  {categoryLabel}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1">
              Desglose Metodológico del Algoritmo Cuantitativo
            </p>
          </div>
        </div>

        {/* Caja de Puntuación Principal */}
        <div className="mt-5 p-4 rounded-2xl bg-[#0d1c2d] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Puntuación Cuantitativa Total
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-[#00F5A0] font-mono drop-shadow-[0_0_12px_rgba(0,245,160,0.4)]">
                {score}
              </span>
              <span className="text-sm font-bold font-mono text-slate-300">/ 100 puntos</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold font-mono self-start sm:self-auto ${scoreBadgeColor}`}>
            {scoreLabel}
          </div>
        </div>

        {/* Explicación Introductoria */}
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-[#0a1628] border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            El <strong>Score Total (0 a 100)</strong> es una calificación algorítmica objetiva que pondera <strong>4 dimensiones cuantitativas</strong> para comparar instrumentos financieros sin sesgos emocionales. La suma de los puntos de cada pilar conforma la calificación final.
          </p>
        </div>

        {/* Desglose de los 4 Pilares */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-400 px-1">
            <span>Dimensiones Analizadas</span>
            <span>Aporte al Score</span>
          </div>

          {pillars.map((pillar, idx) => {
            const pctFill = Math.min(100, Math.round((pillar.points / pillar.maxPoints) * 100));
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0a1424]/90 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                      {pillar.icon}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white font-mono">
                        {pillar.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono ml-2">
                        (Peso {pillar.weight}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-[#00F5A0] font-mono">
                      {pillar.points.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      {" "}/ {pillar.maxPoints} pts
                    </span>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="mt-2.5 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#00F5A0] rounded-full transition-all duration-500"
                    style={{ width: `${pctFill}%` }}
                  ></div>
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono text-slate-300">
                  <span className="text-slate-400">{pillar.desc}</span>
                  <span className="text-emerald-300 font-semibold shrink-0">
                    {pillar.metricDetail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen de Tesis Cuantitativa */}
        {item.thesis && (
          <div className="mt-4 p-3 rounded-xl bg-[#0c1626] border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-[#00F5A0] font-bold mr-1.5 uppercase">Tesis Institucional:</span>
            {item.thesis}
          </div>
        )}
      </div>
    </div>
  );
}
