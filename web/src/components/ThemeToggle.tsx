"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Leer preferencia guardada o clase actual en <html>
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      const isDark = document.documentElement.classList.contains("dark");
      const current = isDark ? "dark" : "light";
      setTheme(current);
      applyTheme(current);
    }
    setMounted(true);
  }, []);

  const applyTheme = (mode: "dark" | "light") => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    // Placeholder para evitar saltos visuales durante hidratación SSR
    return (
      <div className="w-16 h-8 rounded-full bg-slate-800/60 border border-slate-700/60 opacity-60" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Alternar entre modo oscuro y modo claro"
      title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      className={`relative inline-flex items-center h-8 w-16 p-1 rounded-full cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00F5A0]/60 select-none ${
        isDark
          ? "bg-[#2A374A] border border-slate-600/70 shadow-inner"
          : "bg-[#E2E8F0] border border-slate-300 shadow-inner"
      }`}
    >
      {/* Icono inactivo de fondo izquierdo (Sol en modo oscuro) */}
      <span
        className={`absolute left-2 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${
          isDark ? "opacity-30 text-slate-300" : "opacity-0"
        }`}
      >
        <Sun className="w-4 h-4" />
      </span>

      {/* Icono inactivo de fondo derecho (Luna en modo claro) */}
      <span
        className={`absolute right-2 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${
          !isDark ? "opacity-35 text-slate-500" : "opacity-0"
        }`}
      >
        <Moon className="w-4 h-4" />
      </span>

      {/* Perilla deslizante blanca (Knob con sombra neumórfica e icono activo) */}
      <span
        className={`w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.25)] transform transition-transform duration-300 ease-out z-10 ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-[#3B82F6] stroke-[2.2]" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-[#F59E0B] stroke-[2.2]" />
        )}
      </span>
    </button>
  );
}
