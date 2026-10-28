import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioSimulator from "@/components/PortfolioSimulator";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Simulador de Cartera Inteligente | Donde Invierto",
  description: "Distribuí tu inversión automáticamente entre CEDEARs, Obligaciones Negociables en dólares y Merval según tu perfil y capital.",
};

export default function SimuladorPage() {
  return (
    <div className="min-h-screen bg-[#050911] text-slate-100 font-sans antialiased selection:bg-[#00F5A0] selection:text-black overflow-x-hidden">
      <Navbar />

      <main className="w-full pt-6 pb-16">
        {/* Banner contextual hacia el Screener */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c1829] border border-[#162a45]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00F5A0]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Querés analizar cada CEDEAR u ON en detalle?</h3>
                <p className="text-xs text-slate-400">Consultá precios en tiempo real, dividendos, paridades y consenso de Wall Street.</p>
              </div>
            </div>
            <Link
              href="/screener"
              className="px-4 py-2 text-xs font-bold bg-[#14263d] hover:bg-[#1a3353] text-[#00F5A0] rounded-xl border border-emerald-500/30 flex items-center gap-2 transition-all whitespace-nowrap"
            >
              <span>Ver Mercado & Screener</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Simulador de Cartera */}
        <PortfolioSimulator />
      </main>

      <Footer />
    </div>
  );
}
