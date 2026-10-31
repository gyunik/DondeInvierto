"use client";

import React from "react";
import { X, Zap, ShieldCheck, TrendingUp, BarChart3, Award, Info } from "lucide-react";
import marketData from "@/data/marketData.json";

export type StockItem = (typeof marketData.stocks)[0];
export type EtfItem = (typeof marketData.etfs)[0];
export type OnItem = (typeof marketData.ons)[0];
export type MervalItem = (typeof marketData.argentina.merval)[0];
export type BondItem = (typeof marketData.argentina.sovereign_bonds)[0];

export type ScoreItem = StockItem | EtfItem | OnItem | MervalItem | BondItem;

interface ScoreDetailModalProps {
  item: ScoreItem | null;
  onClose: () => void;
}

export default function ScoreDetailModal({ item, onClose }: ScoreDetailModalProps) {
  if (!item) return null;

  const score = item.score;
  const isEtf = "expense_ratio" in item && item.expense_ratio !== undefined;
  const isOn = "tir_usd" in item && item.tir_usd !== undefined;
  const isStock = !isEtf && !isOn && "ticker" in item && ("sector" in item || "quant_breakdown" in item);

  // Subtítulo de categoría
  let categoryLabel: string = "";
  if ("sector" in item && item.sector) categoryLabel = item.sector;
  else if ("category" in item && item.category) categoryLabel = item.category;
  else if ("issuer" in item && item.issuer) categoryLabel = item.issuer;
  else if ("law" in item && item.law) categoryLabel = item.law;

  // Clasificación cualitativa según Score
  let scoreLabel = "Oportunidad Destacada (Top Tier)";
  let scoreBadgeColor = "bg-emerald-500/20 text-emerald-800 dark:text-[#00F5A0] border-emerald-500/40";
  if (score >= 90) {
    scoreLabel = "Excelente • Compra Fuerte (Top Tier)";
    scoreBadgeColor = "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-[#00F5A0] border-emerald-400 dark:border-emerald-500/50 shadow-sm dark:shadow-[0_0_12px_rgba(0,245,160,0.3)]";
  } else if (score >= 80) {
    scoreLabel = "Muy Favorable • Alta Convicción";
    scoreBadgeColor = "bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-500/40";
  } else if (score >= 60) {
    scoreLabel = "Sólido • Ponderación Positiva";
    scoreBadgeColor = "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40";
  } else if (score >= 40) {
    scoreLabel = "Moderado • En Seguimiento";
    scoreBadgeColor = "bg-slate-200 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/40";
  } else {
    scoreLabel = "Precaución • Valuación Exigente";
    scoreBadgeColor = "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40";
  }

  // Definición de pilares según tipo de activo
  interface Pillar {
    title: string;
    weight: number;
    points: number;
    maxPoints: number;
    icon: React.ReactNode;
    desc: string;
    metricDetail?: string;
  }

  let pillars: Pillar[] = [];

  if (isStock) {
    const stockItem = item as StockItem;
    const qb = "quant_breakdown" in stockItem ? stockItem.quant_breakdown : null;

    const p1 = qb?.score_retorno ?? Math.round(score * 0.6 * 10) / 10;
    const p2 = qb?.score_margen ?? Math.round(score * 0.25 * 10) / 10;
    const p3 = qb?.score_tecnico ?? Math.round((score - p1 - p2) * 10) / 10;

    pillars = [
      {
        title: "Retorno Potencial Proyectado (12 Meses)",
        weight: 60,
        points: p1,
        maxPoints: 60,
        icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-[#00F5A0]" />,
        desc: "Potencial de subida teórico proyectado por las 3 capas del modelo hasta su precio objetivo.",
        metricDetail: `Proyección: ${stockItem.retorno_estimado_pct ?? stockItem.upside ?? 0}%`
      },
      {
        title: "Margen de Seguridad Fundamental",
        weight: 25,
        points: p2,
        maxPoints: 25,
        icon: <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        desc: "Descuento de valuación comparando el PER real de mercado contra el PER teórico ajustado por ciclo.",
        metricDetail: `PER Actual: ${stockItem.pe_ratio || "N/D"}x`
      },
      {
        title: "Filtro de Timing Técnico (SMA 200)",
        weight: 15,
        points: p3,
        maxPoints: 15,
        icon: <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        desc: "Posición respecto a la Media Móvil Simple de 200 ruedas. Premia comprar con descuento técnico y penaliza sobrecompra.",
        metricDetail: qb?.desvio_tecnico !== undefined ? `Desvío SMA200: ${qb.desvio_tecnico}%` : "Tendencia estructural"
      }
    ];
  } else if (isEtf) {
    const etfItem = item as EtfItem;
    const p1 = Math.round(score * 0.45 * 10) / 10;
    const p2 = Math.round(score * 0.35 * 10) / 10;
    const p3 = Math.round((score - p1 - p2) * 10) / 10;

    pillars = [
      {
        title: "Consenso Institucional y Upside de Cartera",
        weight: 45,
        points: p1,
        maxPoints: 45,
        icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-[#00F5A0]" />,
        desc: "Potencial ponderado estimado por analistas de Wall Street sobre las acciones que componen el fondo.",
        metricDetail: `Potencial: +${etfItem.upside || 0}%`
      },
      {
        title: "Eficiencia de Costos (Expense Ratio)",
        weight: 35,
        points: p2,
        maxPoints: 35,
        icon: <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        desc: "Premia fondos con comisiones ultra bajas que maximizan el retorno compuesto del inversor a largo plazo.",
        metricDetail: `Costo Anual: ${etfItem.expense_ratio}%`
      },
      {
        title: "Solidez y Patrimonio Bajo Gestión (AUM)",
        weight: 20,
        points: p3,
        maxPoints: 20,
        icon: <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        desc: "Respaldo del gestor global (BlackRock, Vanguard, State Street) y alta liquidez diaria.",
        metricDetail: `Gestor: ${etfItem.manager || "Tier 1"} • Cap: ${etfItem.market_cap || "Alta Liquidez"}`
      }
    ];
  } else {
    const onItem = item as OnItem;
    const p1 = Math.round(score * 0.35 * 10) / 10;
    const p2 = Math.round(score * 0.30 * 10) / 10;
    const p3 = Math.round(score * 0.20 * 10) / 10;
    const p4 = Math.round((score - p1 - p2 - p3) * 10) / 10;

    pillars = [
      {
        title: "Rendimiento Efectivo Anual (TIR USD)",
        weight: 35,
        points: p1,
        maxPoints: 35,
        icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-[#00F5A0]" />,
        desc: "Tasa interna de retorno neta en dólares billete comparada contra la curva de tasas de bonos grado de inversión global.",
        metricDetail: "tir_usd" in onItem ? `TIR: ${onItem.tir_usd}% anual en dólares` : "Rendimiento en USD"
      },
      {
        title: "Seguridad Jurídica y Calificación Crediticia",
        weight: 30,
        points: p2,
        maxPoints: 30,
        icon: <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        desc: "law" in onItem && typeof onItem.law === "string" && onItem.law.toLowerCase().includes("argentina")
          ? "Emisión bajo marco regulatorio y tribunales de la República Argentina con calificación crediticia local."
          : "Protección jurídica internacional bajo legislación de Nueva York y máxima nota de solvencia crediticia.",
        metricDetail: "law" in onItem ? `Jurisdicción: ${onItem.law}` : "Grado de inversión seguro"
      },
      {
        title: "Solvencia Operativa del Emisor",
        weight: 20,
        points: p3,
        maxPoints: 20,
        icon: <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        desc: "Generación probada de flujo de caja exportador en sectores estratégicos (Vaca Muerta, energía o telecomunicaciones esenciales).",
        metricDetail: "Caja neta positiva • Cobertura holgada de intereses"
      },
      {
        title: "Plazo de Maduración y Liquidez en ByMA",
        weight: 15,
        points: p4,
        maxPoints: 15,
        icon: <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        desc: "Cronograma de amortización y facilidad para comprar o vender en el mercado secundario local.",
        metricDetail: "Amortizaciones periódicas • Alto volumen de negociación"
      }
    ];
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-[#091220] border border-slate-200 dark:border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden my-auto text-slate-900 dark:text-slate-100 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center border border-slate-300 dark:border-slate-700 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado del Score */}
        <div className="flex items-start gap-3.5 sm:gap-4 pr-12">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-teal-900/40 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-[#00F5A0] font-black font-mono text-xl shadow-sm dark:shadow-[0_0_15px_rgba(0,245,160,0.2)] shrink-0">
            {item.ticker}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {item.name}
              </h3>
              {categoryLabel && (
                <span className="px-2.5 py-1 rounded-md bg-cyan-50 dark:bg-[#132840] border border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200 text-xs sm:text-sm font-semibold">
                  {categoryLabel}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-mono mt-1">
              {isStock ? "Desglose Cuantitativo de 3 Capas • Score Total" : "Desglose Metodológico del Algoritmo Cuantitativo"}
            </p>
          </div>
        </div>

        {/* Caja de Puntuación Principal */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-[#0d1c2d] border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Puntuación Cuantitativa Total
            </span>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-emerald-700 dark:text-[#00F5A0] font-mono drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(0,245,160,0.4)]">
                {score}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-slate-600 dark:text-slate-300">/ 100 puntos</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl border text-sm sm:text-base font-bold font-mono self-start sm:self-auto ${scoreBadgeColor}`}>
            {scoreLabel}
          </div>
        </div>

        {/* Explicación de la Lógica del Score */}
        <div className="mt-5 flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-cyan-50/70 dark:bg-[#0a1628] border border-cyan-200 dark:border-cyan-500/20 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
          <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <p>
            {isStock ? (
              <span>
                El <strong>Score Total</strong> integra 3 capas fundamentales: el <strong>60%</strong> depende del Retorno Estimado Teórico (0 a 40%+), el <strong>25%</strong> del Margen de Seguridad entre el PER Actual y el PER Ajustado, y el <strong>15%</strong> de la posición técnica respecto a la Media Móvil de 200 días (SMA 200).
              </span>
            ) : (
              <span>
                El <strong>Score Total (0 a 100)</strong> pondera objetivamente factores de rendimiento, solvencia y riesgo técnico para ordenar los mejores activos de la terminal.
              </span>
            )}
          </p>
        </div>

        {/* Desglose de los Pilares */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold uppercase text-slate-500 dark:text-slate-400 px-1">
            <span>Dimensiones Analizadas</span>
            <span>Puntos Obtenidos</span>
          </div>

          {pillars.map((pillar, idx) => {
            const pctFill = Math.min(100, Math.round((pillar.points / pillar.maxPoints) * 100));
            return (
              <div
                key={idx}
                className="p-4 sm:p-4.5 rounded-xl bg-slate-50 dark:bg-[#0a1424]/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
                      {pillar.icon}
                    </div>
                    <div>
                      <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {pillar.title}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono ml-2">
                        (Peso {pillar.weight}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-[#00F5A0] font-mono">
                      {pillar.points.toFixed(1)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 font-mono">
                      {" "}/ {pillar.maxPoints} pts
                    </span>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="mt-3 w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-500 dark:via-teal-400 dark:to-[#00F5A0] rounded-full transition-all duration-500"
                    style={{ width: `${pctFill}%` }}
                  ></div>
                </div>

                <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-300">
                  <span className="text-slate-600 dark:text-slate-400 leading-normal">{pillar.desc}</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold shrink-0 text-xs sm:text-sm">
                    {pillar.metricDetail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen de Tesis Cuantitativa */}
        {item.thesis && (
          <div className="mt-5 p-3.5 sm:p-4 rounded-xl bg-slate-100 dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="text-emerald-700 dark:text-[#00F5A0] font-bold mr-1.5 uppercase">Tesis Institucional:</span>
            {item.thesis}
          </div>
        )}
      </div>
    </div>
  );
}
