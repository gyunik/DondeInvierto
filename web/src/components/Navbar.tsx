"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import Logo from "@/components/Logo";
import marketData from "@/data/marketData.json";

export default function Navbar() {
  const pathname = usePathname();
  const { market } = marketData;

  const renderTickerBadge = (name: string, priceStr: string, change: number, isPercent: boolean = true) => {
    const isPos = change >= 0;
    return (
      <div className="flex items-center gap-2 sm:gap-2.5">
        <span className="text-slate-200 font-bold tracking-wider text-xs sm:text-sm">{name}</span>
        <span className="text-white font-black text-sm sm:text-base font-mono">{priceStr}</span>
        <span className={`text-xs sm:text-sm font-bold font-mono flex items-center gap-0.5 ${isPos ? "text-[#00F5A0]" : "text-rose-400"}`}>
          {isPos ? "↗ +" : "↘ "}{change}{isPercent ? "%" : ""}
        </span>
      </div>
    );
  };

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Mercado & Screener", href: "/screener" },
    { name: "Simulador de Cartera", href: "/simulador" },
    { name: "Planes", href: "/#planes-precios" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  return (
    <header className="w-full border-b border-[#162338]/80 bg-[#060B14]/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Navigation Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link className="flex items-center gap-3 group" href="/" title="DONDE INVIERTO - Inicio">
            {/* Logo Oficial Donde Invierto */}
            <div className="h-9 sm:h-10 flex items-center transition-transform group-hover:scale-[1.02]">
              <Logo className="h-9 sm:h-10 w-auto" idPrefix="nav" />
            </div>
            <div className="hidden sm:flex flex-col justify-center border-l border-slate-700/60 pl-3 leading-tight">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 group-hover:text-slate-200 transition-colors">
                Terminal Quant
              </span>
            </div>
          </Link>
          {/* Live Pulse Radar Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0E202B] border border-emerald-500/30 text-[11px] font-semibold text-[#00F5A0] tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#00F5A0] pulse-dot"></span>
            <span>RADAR EN VIVO</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "text-[#00F5A0] bg-emerald-500/10 border border-emerald-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action & Profile Button */}
        <div className="flex items-center space-x-3">
          <Link
            className="px-4 py-2 text-xs md:text-sm font-bold bg-[#00F5A0] hover:bg-[#00d68b] text-[#050911] rounded-lg shadow-[0_0_20px_rgba(0,245,160,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            href="/#planes-precios"
          >
            Suscribirse Pro
          </Link>
          <button
            aria-label="Perfil de usuario"
            className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            type="button"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile navigation tabs for small screens */}
      <div className="flex md:hidden items-center justify-around border-t border-[#162338]/60 bg-[#060B14] px-2 py-2 text-xs">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                active ? "text-[#00F5A0] bg-emerald-500/10 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Ticker Stream Bar */}
      <div className="w-full border-t border-[#131E30] bg-[#03060C]/90 px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[960px] gap-8 text-sm font-mono">
          {renderTickerBadge("S&P 500", market["^GSPC"].price.toLocaleString("en-US"), market["^GSPC"].change)}
          {renderTickerBadge("NASDAQ 100", market["^IXIC"].price.toLocaleString("en-US"), market["^IXIC"].change)}
          {renderTickerBadge("S&P MERVAL", market["^MERVAL"].price.toLocaleString("es-AR"), market["^MERVAL"].change)}
          {renderTickerBadge("DÓLAR CCL", `$${market["CCL"].price.toFixed(2)}`, market["CCL"].change)}
          <div className="flex items-center gap-2.5">
            <span className="text-slate-200 font-bold tracking-wider text-xs sm:text-sm">UST 10Y</span>
            <span className="text-white font-black text-sm sm:text-base font-mono">{market["^TNX"].price}%</span>
            <span className="text-slate-400 font-semibold text-xs sm:text-sm font-mono">0.00 bps</span>
          </div>
          {renderTickerBadge("VIX", market["^VIX"].price.toString(), market["^VIX"].change)}
        </div>
      </div>
    </header>
  );
}
