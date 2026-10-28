import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingSection() {
  return (
    <section className="w-full py-16 bg-[#051424] border-t border-[#1F2937]" id="planes-precios">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="text-center flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
            Comienza gratis, escala cuando ganes dinero
          </h2>
          <p className="text-sm text-[#64748B] mt-1">Sin letra chica. Cancela en cualquier momento.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full items-stretch">
          {/* Plan Free */}
          <div className="bg-[#111827] border border-[#1F2937] p-6 sm:p-8 rounded-xl flex flex-col justify-between shadow-sm">
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">COMUNIDAD</span>
                <h3 className="text-xl font-bold text-[#F8FAFC] mt-1">Plan Gratuito</h3>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-4xl font-extrabold font-mono text-[#F8FAFC]">$0</span>
                <span className="text-xs text-[#64748B]">/ siempre</span>
              </div>
              <p className="text-xs text-[#64748B]">
                Ideal para monitorear el mercado de EE.UU. y Argentina todos los días.
              </p>
              <ul className="flex flex-col gap-2 pt-3">
                <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                  <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                  Top 3 CEDEARs, ONs y Merval diarios
                </li>
                <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                  <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                  Precios en Pesos y Dólar CCL de referencia
                </li>
                <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                  <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                  Simulador de cartera básico
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/screener"
                className="w-full py-2.5 rounded-xl bg-[#122131] hover:bg-[#1E293B] text-[#F8FAFC] font-bold text-center text-sm transition-colors block border border-[#1F2937]"
              >
                Usar Plan Gratuito
              </Link>
            </div>
          </div>

          {/* Plan Pro */}
          <div className="bg-[#122131] border-2 border-[#4edea3] p-6 sm:p-8 rounded-xl flex flex-col justify-between relative shadow-xl shadow-[#4edea3]/10">
            <div className="absolute -top-3 right-6 bg-[#4edea3] text-[#003824] text-[11px] uppercase font-bold px-3 py-1 rounded-full shadow-sm">
              MÁS POPULAR
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">INVERSOR PRO</span>
                <h3 className="text-xl font-bold text-[#F8FAFC] mt-1">Membresía Pro</h3>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-4xl font-extrabold font-mono text-[#F8FAFC]">$9</span>
                <span className="text-xs text-[#64748B]">USD / mes (o en Pesos al MEP)</span>
              </div>
              <p className="text-xs text-[#64748B]">
                Para quienes buscan maximizar su capital con análisis completo.
              </p>
              <ul className="flex flex-col gap-2 pt-3">
                <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                  <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                  Top 10 completo sin límites en todas las clases
                </li>
                <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                  <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                  Calendario de dividendos y cupones de ONs
                </li>
                <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                  <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                  Alertas tempranas por WhatsApp y Telegram
                </li>
                <li className="flex items-center gap-2 text-xs text-[#d4e4fa]">
                  <Check className="w-4 h-4 text-[#4edea3] shrink-0" />
                  Cartera recomendada según contexto argentino
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <button className="w-full py-2.5 rounded-xl bg-[#4edea3] hover:bg-[#10b981] text-[#003824] font-bold text-sm transition-all shadow-md active:scale-95">
                Suscribirse con Garantía de 14 Días
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
