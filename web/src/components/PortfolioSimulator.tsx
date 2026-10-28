"use client";

import React, { useState } from "react";
import { Calculator, Building2, TrendingUp, Shield } from "lucide-react";

interface PortfolioSimulatorProps {
  initialCurrency?: "ARS" | "USD";
  initialAmount?: number;
  initialProfile?: "conservador" | "balanceado" | "agresivo";
}

export default function PortfolioSimulator({
  initialCurrency = "ARS",
  initialAmount = 1000000,
  initialProfile = "balanceado",
}: PortfolioSimulatorProps) {
  const [currency, setCurrency] = useState<"ARS" | "USD">(initialCurrency);
  const [investmentAmount, setInvestmentAmount] = useState<number>(initialAmount);
  const [riskProfile, setRiskProfile] = useState<"conservador" | "balanceado" | "agresivo">(initialProfile);

  const profiles = {
    conservador: {
      onPct: 60,
      cedearPct: 30,
      mervalPct: 10,
      yieldVal: "8.4% anual en USD",
      assetsON: "Telecom (TLC1O), Pampa (MGC3O), YPF (YMCHD)",
      assetsCEDEAR: "KO, JPM, WMT (Alto dividendo defensivo)",
      assetsMERVAL: "Bonos soberanos cortos (BOPREAL / GD30)",
    },
    balanceado: {
      onPct: 40,
      cedearPct: 45,
      mervalPct: 15,
      yieldVal: "11.2% anual en USD",
      assetsON: "YPF (YMCHD), Pampa (MGC3O)",
      assetsCEDEAR: "SPY, MSFT, NVDA (Con dividendos)",
      assetsMERVAL: "Galicia (GGAL), AL30 / GD30",
    },
    agresivo: {
      onPct: 20,
      cedearPct: 55,
      mervalPct: 25,
      yieldVal: "15.8% anual en USD",
      assetsON: "YPF Luz (YFC2O)",
      assetsCEDEAR: "NVDA, AMZN, META, GOOGL (Growth)",
      assetsMERVAL: "Pampa (PAMP), Vista (VIST), AL30",
    },
  }[riskProfile];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(num);
  };

  const currPrefix = currency === "ARS" ? "$" : "u$s ";

  return (
    <section className="w-full py-16 bg-[#010f1f] border-t border-[#1F2937]" id="simulador-cartera">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c2b3c] text-[#4edea3] text-xs font-bold uppercase tracking-wider mb-2 border border-[#273647]">
            <Calculator className="w-3.5 h-3.5" />
            Simulador de Cartera Inteligente
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            ¿Cuánto capital deseas invertir hoy?
          </h2>
          <p className="text-sm text-[#64748B] max-w-xl mt-1">
            Distribuimos tu dinero automáticamente entre CEDEARs líderes, Obligaciones Negociables en dólares y Merval.
          </p>
        </div>

        {/* Interfaz del Simulador */}
        <div className="bg-[#111827] border border-[#1F2937] p-6 sm:p-8 rounded-xl shadow-xl flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            {/* Input de Capital con selector ARS / USD */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[#F8FAFC]" htmlFor="investAmount">
                  Monto a Invertir
                </label>
                <div className="flex rounded-lg bg-[#122131] p-1 text-xs border border-[#1F2937]">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("ARS");
                      setInvestmentAmount(1000000);
                    }}
                    className={`px-3 py-0.5 rounded font-bold transition-all ${
                      currency === "ARS" ? "bg-[#4edea3] text-[#003824]" : "text-[#64748B] hover:text-[#d4e4fa]"
                    }`}
                  >
                    ARS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("USD");
                      setInvestmentAmount(1000);
                    }}
                    className={`px-3 py-0.5 rounded font-bold transition-all ${
                      currency === "USD" ? "bg-[#4edea3] text-[#003824]" : "text-[#64748B] hover:text-[#d4e4fa]"
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>

              <div className="relative flex items-center bg-[#010f1f] rounded-xl px-4 py-2.5 border border-[#1F2937] shadow-inner">
                <span className="text-lg font-mono text-[#4edea3] mr-2 font-bold">{currPrefix}</span>
                <input
                  id="investAmount"
                  type="number"
                  step={currency === "ARS" ? 100000 : 500}
                  min={currency === "ARS" ? 50000 : 100}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                  className="w-full bg-transparent text-lg font-mono font-bold text-[#F8FAFC] focus:outline-none"
                />
              </div>
            </div>

            {/* Selector de Perfil de Riesgo */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#F8FAFC]">Perfil de Inversor</span>
              <div className="grid grid-cols-3 gap-1 bg-[#010f1f] p-1 rounded-xl border border-[#1F2937]">
                {(["conservador", "balanceado", "agresivo"] as const).map((prof) => (
                  <button
                    key={prof}
                    type="button"
                    onClick={() => setRiskProfile(prof)}
                    className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                      riskProfile === prof
                        ? "bg-[#4edea3] text-[#003824] shadow-sm"
                        : "text-[#bbcabf] hover:text-[#d4e4fa]"
                    }`}
                  >
                    {prof}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resultados de Asignación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta ONs */}
            <div className="bg-[#122131] border border-[#1F2937] p-4 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#64748B]">
                    Obligaciones Negociables ({profiles.onPct}%)
                  </span>
                  <Building2 className="w-4 h-4 text-[#4edea3]" />
                </div>
                <span className="text-xl font-mono font-bold text-[#F8FAFC]">
                  {currPrefix}
                  {formatNumber((investmentAmount * profiles.onPct) / 100)}
                </span>
              </div>
              <div className="mt-3 pt-2 bg-[#1c2b3c]/40 rounded p-2 border border-[#1F2937]/50">
                <span className="text-[11px] text-[#64748B] block">Activos sugeridos:</span>
                <span className="text-xs font-mono text-[#d4e4fa] font-medium">{profiles.assetsON}</span>
              </div>
            </div>

            {/* Tarjeta CEDEARs */}
            <div className="bg-[#122131] border border-[#1F2937] p-4 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#64748B]">
                    CEDEARs Wall Street ({profiles.cedearPct}%)
                  </span>
                  <TrendingUp className="w-4 h-4 text-[#4edea3]" />
                </div>
                <span className="text-xl font-mono font-bold text-[#F8FAFC]">
                  {currPrefix}
                  {formatNumber((investmentAmount * profiles.cedearPct) / 100)}
                </span>
              </div>
              <div className="mt-3 pt-2 bg-[#1c2b3c]/40 rounded p-2 border border-[#1F2937]/50">
                <span className="text-[11px] text-[#64748B] block">Activos sugeridos:</span>
                <span className="text-xs font-mono text-[#d4e4fa] font-medium">{profiles.assetsCEDEAR}</span>
              </div>
            </div>

            {/* Tarjeta Merval */}
            <div className="bg-[#122131] border border-[#1F2937] p-4 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#64748B]">
                    Merval & Bonos ({profiles.mervalPct}%)
                  </span>
                  <Shield className="w-4 h-4 text-[#4edea3]" />
                </div>
                <span className="text-xl font-mono font-bold text-[#F8FAFC]">
                  {currPrefix}
                  {formatNumber((investmentAmount * profiles.mervalPct) / 100)}
                </span>
              </div>
              <div className="mt-3 pt-2 bg-[#1c2b3c]/40 rounded p-2 border border-[#1F2937]/50">
                <span className="text-[11px] text-[#64748B] block">Activos sugeridos:</span>
                <span className="text-xs font-mono text-[#d4e4fa] font-medium">{profiles.assetsMERVAL}</span>
              </div>
            </div>
          </div>

          {/* Banner de Retorno Proyectado */}
          <div className="w-full bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.25)] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <span className="text-sm font-bold text-[#F8FAFC] block">
                  Retorno estimado de esta combinación
                </span>
                <span className="text-xs text-[#64748B]">
                  Proyección ponderada neta por dividendos y paridad CCL histórica.
                </span>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-[#4edea3] whitespace-nowrap">
              {profiles.yieldVal}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
