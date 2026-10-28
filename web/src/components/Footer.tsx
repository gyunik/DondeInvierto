import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#131E30] bg-[#03060C] py-8 px-6 text-xs text-slate-400 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00F5A0] font-black">
            <Activity className="w-4 h-4 text-[#00F5A0]" />
          </div>
          <span className="text-slate-300">
            <strong className="text-white font-extrabold tracking-wider">DONDE INVIERTO</strong> Terminal Quant © {new Date().getFullYear()} • Monitoreo cuantitativo diario de mercados.
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
