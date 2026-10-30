import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScreenerSection from "@/components/ScreenerSection";
import PricingSection from "@/components/PricingSection";
import marketData from "@/data/marketData.json";
import {
  Globe,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight,
  Building2,
  Calculator,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { market, ccl_dollar, brecha_cambiaria } = marketData;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050911] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#00F5A0] selection:text-black overflow-x-hidden transition-colors duration-200">
      {/* 1. Header con Ticker Tape */}
      <Navbar />

      <main className="w-full">
        {/* 2. Hero Section */}
        <section className="w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 lg:py-16 radial-glow relative border-b border-slate-200 dark:border-[#162338]/80">
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center my-auto">
            {/* Market Scope Capsule Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-[#0D182A]/90 border border-slate-300 dark:border-slate-700/60 shadow-sm dark:shadow-lg text-[11px] sm:text-xs tracking-wider uppercase font-semibold text-slate-700 dark:text-slate-300 mb-6">
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00F5A0]" />
              <span>WALL STREET, CEDEARS, OBLIGACIONES NEGOCIABLES Y MERVAL</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl leading-[1.12]">
              ¿En qué conviene invertir hoy? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-[#00F5A0] dark:via-emerald-300 dark:to-teal-400 drop-shadow-sm dark:drop-shadow-[0_4px_25px_rgba(0,245,160,0.25)]">
                Decisiones con datos reales.
              </span>
            </h1>

            {/* Detailed Description Box */}
            <div className="mt-7 max-w-3xl px-2">
              <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-100 font-normal leading-relaxed tracking-wide">
                Monitoreamos diariamente los mejores{" "}
                <strong className="text-slate-900 dark:text-white font-bold underline decoration-emerald-500/50 underline-offset-4">
                  CEDEARs de Wall Street
                </strong>{" "}
                (con precio en pesos y dividendos), las{" "}
                <strong className="text-slate-900 dark:text-white font-bold underline decoration-emerald-500/50 underline-offset-4">
                  Obligaciones Negociables (ONs en dólares)
                </strong>{" "}
                más rentables y las oportunidades del{" "}
                <strong className="text-slate-900 dark:text-white font-bold underline decoration-emerald-500/50 underline-offset-4">
                  Merval y Bonos soberanos
                </strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-bold text-black bg-[#00F5A0] hover:bg-[#02e093] rounded-xl shadow-[0_0_25px_rgba(0,245,160,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                href="/screener"
              >
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                <span>Explorar Mercado &amp; Screener</span>
              </Link>
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500 rounded-xl backdrop-blur-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                href="/simulador"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-[#00F5A0]" />
                <span>Simular mi Cartera</span>
              </Link>
            </div>
          </div>

          {/* Live Market Metric Grid */}
          <div className="w-full max-w-7xl mx-auto mt-12 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {/* Card 1: Dólar CCL */}
              <div className="card-glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-200 font-mono font-bold tracking-wider uppercase mb-1">
                  <span>DÓLAR CCL HOY</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                      ${ccl_dollar.toFixed(2)}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-100 bg-slate-200 dark:bg-[#162742] px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 font-mono">
                      ARS
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-mono font-bold text-emerald-600 dark:text-[#00F5A0]">
                    ▲ +{market["CCL"].change}%
                  </span>
                </div>
                <div className="mt-3.5 bg-slate-100 dark:bg-[#0d1c2d] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 inline-block self-start">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 font-mono font-semibold">
                    Brecha cambiaria: <strong className="text-slate-900 dark:text-white font-bold">{brecha_cambiaria ? `${brecha_cambiaria}%` : "5.8%"}</strong>
                  </span>
                </div>
              </div>

              {/* Card 2: S&P Merval */}
              <div className="card-glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-200 font-mono font-bold tracking-wider uppercase mb-1">
                  <span>S&P MERVAL</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                    {market["^MERVAL"].price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-sm sm:text-base font-mono font-bold text-[#00F5A0]">
                    ▲ +{market["^MERVAL"].change}%
                  </span>
                </div>
                <div className="mt-3.5 bg-[#0d1c2d] px-2.5 py-1 rounded-lg border border-slate-700/80 inline-block self-start">
                  <span className="text-xs sm:text-sm text-slate-200 font-mono font-semibold">
                    Volumen: <strong className="text-white font-bold">$48.2B ARS</strong>
                  </span>
                </div>
              </div>

              {/* Card 3: Bono USA 10Y */}
              <div className="card-glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-200 font-mono font-bold tracking-wider uppercase mb-1">
                  <span>BONO USA 10Y</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
                      {market["^TNX"].price}%
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-300 bg-[#162742] px-2 py-0.5 rounded border border-slate-600 font-mono">
                      Yield
                    </span>
                  </div>
                  <span className={`text-sm sm:text-base font-mono font-bold ${market["^TNX"].change >= 0 ? "text-[#00F5A0]" : "text-rose-400"}`}>
                    {market["^TNX"].change >= 0 ? "+" : ""}{market["^TNX"].change}%
                  </span>
                </div>
                <div className="mt-3.5 bg-[#0d1c2d] px-2.5 py-1 rounded-lg border border-slate-700/80 inline-block self-start">
                  <span className="text-xs sm:text-sm text-slate-200 font-mono font-semibold">
                    Tasa de Referencia FED
                  </span>
                </div>
              </div>

              {/* Card 4: VIX Volatilidad */}
              <div className="card-glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-200 font-mono font-bold tracking-wider uppercase mb-1">
                  <span>VIX VOLATILIDAD</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]"></span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
                      {market["^VIX"].price}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-300 bg-[#162742] px-2 py-0.5 rounded border border-slate-600 font-mono">
                      pts
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-mono font-bold text-rose-400">
                    ▼ {market["^VIX"].change}%
                  </span>
                </div>
                <div className="mt-3.5 bg-[#0d1c2d] px-2.5 py-1 rounded-lg border border-slate-700/80 inline-block self-start">
                  <span className="text-xs sm:text-sm text-slate-200 font-mono font-semibold">
                    Régimen: <strong className="text-emerald-400">Baja Aversión</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Secciones Rápidas de Navegación Destacada */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/screener"
              className="p-6 rounded-2xl bg-[#091322] border border-slate-700/80 hover:border-[#00F5A0]/60 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00F5A0] mb-4">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00F5A0] transition-colors">
                  Wall Street &amp; CEDEARs
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Acciones con mayor potencial de suba proyectado por analistas y CEDEARs que pagan dividendos periódicos en dólares.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#00F5A0]">
                <span>Explorar CEDEARs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/screener"
              className="p-6 rounded-2xl bg-[#091322] border border-slate-700/80 hover:border-[#00F5A0]/60 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00F5A0] mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00F5A0] transition-colors">
                  ONs en Dólares Billete
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Deuda de empresas líderes (YPF, Pampa, Pan American) con rentas del 8% al 10% anual en dólares y ley extranjera.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#00F5A0]">
                <span>Ver Renta de ONs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/simulador"
              className="p-6 rounded-2xl bg-[#091322] border border-slate-700/80 hover:border-[#00F5A0]/60 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00F5A0] mb-4">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00F5A0] transition-colors">
                  Simulador Inteligente
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Ingresá tus Pesos o Dólares y recibí una cartera diversificada a tu medida con su retorno anual proyectado.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#00F5A0]">
                <span>Calcular Inversión</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* 4. Vista previa de Oportunidades Destacadas (Top 3) */}
        <div className="w-full pt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F5A0] animate-pulse"></span>
              Top 3 Oportunidades del Día
            </h2>
            <Link
              href="/screener"
              className="text-xs sm:text-sm font-bold text-[#00F5A0] hover:underline flex items-center gap-1.5"
            >
              <span>Ver todos los activos en el Screener</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ScreenerSection maxItems={3} hideTitle />

          {/* Botón para explorar lista completa */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16 text-center">
            <Link
              href="/screener"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#122238] hover:bg-[#182e4c] border border-emerald-500/30 text-[#00F5A0] font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/10"
            >
              <Zap className="w-4 h-4" />
              <span>Ver ranking completo de CEDEARs, ONs y Merval en el Screener</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 5. Banner Invitación al Simulador */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0a192f] via-[#091526] to-[#040912] border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-[#00F5A0] self-center md:self-start">
                <ShieldCheck className="w-4 h-4" />
                <span>ASIGNACIÓN AUTOMÁTICA DE CAPITAL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                ¿Querés saber cuánto rinde tu dinero invertido?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Probá nuestro simulador: ingresás el capital que tenés (en Pesos o Dólares), elegís tu perfil de riesgo y el sistema distribuye automáticamente tus fondos con el rendimiento esperado.
              </p>
            </div>
            <Link
              href="/simulador"
              className="px-8 py-4 rounded-xl bg-[#00F5A0] hover:bg-[#00d68b] text-[#050911] font-extrabold text-sm sm:text-base shadow-[0_0_25px_rgba(0,245,160,0.35)] transition-all whitespace-nowrap transform hover:-translate-y-0.5"
            >
              Abrir Simulador de Cartera →
            </Link>
          </div>
        </section>

        {/* 6. Planes y Precios */}
        <PricingSection />
      </main>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
