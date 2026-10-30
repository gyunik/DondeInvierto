import React from "react";

interface LogoProps {
  className?: string;
  dondeColor?: string;
  idPrefix?: string;
}

export default function Logo({
  className = "w-full h-auto",
  dondeColor,
  idPrefix = "di",
}: LogoProps) {
  const bar1 = `${idPrefix}-bar1Grad`;
  const bar2 = `${idPrefix}-bar2Grad`;
  const bar3 = `${idPrefix}-bar3Grad`;
  const qMark = `${idPrefix}-qMarkGrad`;
  const electricArrow = `${idPrefix}-electricArrowGrad`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 820 220"
      className={className}
      role="img"
      aria-label="Donde Invierto - Terminal Quant"
      fill="none"
    >
      <defs>
        {/* Gradientes para las barras estadísticas */}
        <linearGradient id={bar1} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FF3366" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>

        <linearGradient id={bar2} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#E024C3" />
          <stop offset="100%" stopColor="#FF5252" />
        </linearGradient>

        <linearGradient id={bar3} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#7B1FA2" />
          <stop offset="100%" stopColor="#BA68C8" />
        </linearGradient>

        {/* Gradiente para el signo de interrogación */}
        <linearGradient id={qMark} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5E35B1" />
          <stop offset="100%" stopColor="#7C4DFF" />
        </linearGradient>

        {/* Gradiente AZUL ELÉCTRICO continuo y vibrante */}
        <linearGradient id={electricArrow} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0052FF" />
          <stop offset="50%" stopColor="#0080FF" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>

        {/* Sombra suave para destacar la flecha azul eléctrica */}
        <filter id={`${idPrefix}-arrowShadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0052FF" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Isotipo: Barras estadísticas, Signo y Flecha Continua */}
      <g id={`${idPrefix}-icon`} transform="translate(10, 10)">
        {/* Barra 1 (Izquierda) */}
        <rect x="20" y="85" width="28" height="95" rx="4" fill={`url(#${bar1})`} />

        {/* Barra 2 (Centro) */}
        <rect x="56" y="55" width="28" height="125" rx="4" fill={`url(#${bar2})`} />

        {/* Barra 3 (Derecha) */}
        <rect x="92" y="25" width="28" height="155" rx="4" fill={`url(#${bar3})`} />

        {/* Signo de Interrogación (?) */}
        <path
          d="M 130 52 C 130 20 185 20 185 52 C 185 75 155 85 155 110"
          fill="none"
          stroke={`url(#${qMark})`}
          strokeWidth="18"
          strokeLinecap="round"
        />
        <circle cx="155" cy="140" r="10" fill={`url(#${qMark})`} />

        {/* Flecha ascendente AZUL ELÉCTRICO CONTINUA (Sin cortes) */}
        <g filter={`url(#${idPrefix}-arrowShadow)`}>
          {/* Trazo continuo del cuerpo de la flecha */}
          <path
            d="M 5 155 L 32 120 L 68 152 L 150 58"
            fill="none"
            stroke={`url(#${electricArrow})`}
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Punta de flecha perfectamente unificada y fusionada con la trayectoria */}
          <path
            d="M 132 48 L 168 44 L 164 80 L 152 66 Z"
            fill={`url(#${electricArrow})`}
            stroke={`url(#${electricArrow})`}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* Tipografía adaptativa a Light y Dark Mode ("donde invierto") */}
      <g id={`${idPrefix}-text-group`}>
        {/* "donde" - se adapta automáticamente: oscuro en light mode, blanco en dark mode */}
        <text
          x="235"
          y="92"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="78"
          fill={dondeColor || "currentColor"}
          className={!dondeColor ? "fill-slate-900 dark:fill-white transition-colors duration-200" : ""}
          letterSpacing="-1.5"
        >
          donde
        </text>

        {/* "invierto" */}
        <text
          x="235"
          y="168"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="78"
          fill="#00F5A0"
          className="fill-[#059669] dark:fill-[#00F5A0] transition-colors duration-200"
          letterSpacing="-1.5"
        >
          invierto
        </text>
      </g>
    </svg>
  );
}
