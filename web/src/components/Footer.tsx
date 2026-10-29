import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#131E30] bg-[#03060C] py-8 px-6 text-xs text-slate-400 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Link href="/" title="DONDE INVIERTO - Inicio" className="flex items-center hover:opacity-90 transition-opacity">
            <Logo className="h-7 w-auto" idPrefix="footer" />
          </Link>
          <span className="text-slate-400 border-l border-slate-800 pl-3">
            <span className="font-semibold text-slate-300">Terminal Quant</span> © {new Date().getFullYear()} • Monitoreo cuantitativo diario de mercados.
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <Link className="hover:text-[#00F5A0] transition-colors" href="/screener">
            Mercado & Screener
          </Link>
          <span>•</span>
          <Link className="hover:text-[#00F5A0] transition-colors" href="/simulador">
            Simulador de Cartera
          </Link>
          <span>•</span>
          <Link className="hover:text-[#00F5A0] transition-colors" href="/#planes-precios">
            Planes
          </Link>
          <span>•</span>
          <span className="text-slate-500 text-[11px]">
            No constituye asesoramiento financiero regulado (Aviso CNV).
          </span>
        </div>
      </div>
    </footer>
  );
}
