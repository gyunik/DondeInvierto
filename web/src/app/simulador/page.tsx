import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioSimulator from "@/components/PortfolioSimulator";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import type { ModelPortfolioId } from "@/utils/portfolioOptimizer";

export const metadata: Metadata = {
  title: "Simulador de Cartera Cuantitativa | Donde Invierto",
  description:
    "Asignación óptima de capital con Ponderación por Inverso de la Volatilidad (Risk Parity) y Sector Cap. Backtest auditado con +25.96% de retorno acumulado.",
};

export default async function SimuladorPage(props: {
  searchParams?: Promise<{ preset?: string; currency?: "ARS" | "USD"; amount?: string }>;
}) {
  const searchParams = await props.searchParams;
  const preset = (searchParams?.preset as ModelPortfolioId) || "growth_cedears";
  const currency = searchParams?.currency === "USD" ? "USD" : "ARS";
  const amount = searchParams?.amount ? parseInt(searchParams.amount, 10) : undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050911] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#00F5A0] selection:text-black overflow-x-hidden transition-colors duration-200">
      <Navbar />

      <main className="w-full pt-6 pb-16">
        {/* Banner contextual hacia el Screener */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0c1829] border border-slate-200 dark:border-[#162a45] shadow-sm dark:shadow-none transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-[#00F5A0]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">¿Querés analizar cada CEDEAR u ON en detalle?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Consultá precios en tiempo real, dividendos, paridades y consenso de Wall Street.</p>
              </div>
            </div>
            <Link
              href="/screener"
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#14263d] dark:hover:bg-[#1a3353] text-emerald-700 dark:text-[#00F5A0] rounded-xl border border-slate-300 dark:border-emerald-500/30 flex items-center gap-2 transition-all whitespace-nowrap"
            >
              <span>Ver Mercado & Screener</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Simulador de Cartera Cuantitativo Renovado */}
        <PortfolioSimulator
          initialPortfolioId={preset}
          initialCurrency={currency}
          initialAmount={amount}
        />
      </main>

      <Footer />
    </div>
  );
}
