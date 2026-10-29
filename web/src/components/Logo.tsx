import React from "react";

interface LogoProps {
  className?: string;
  dondeColor?: string;
  idPrefix?: string;
}

export default function Logo({
  className = "w-full h-auto",
  dondeColor = "#FFFFFF",
  idPrefix = "di",
}: LogoProps) {
  const bar1 = `${idPrefix}-bar1Grad`;
  const bar2 = `${idPrefix}-bar2Grad`;
  const bar3 = `${idPrefix}-bar3Grad`;
  const qMark = `${idPrefix}-qMarkGrad`;
  const arrow = `${idPrefix}-arrowGrad`;

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
        {/* Gradientes para las barras */}
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

        {/* Gradiente para la flecha destacada */}
        <linearGradient id={arrow} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF1744" />
          <stop offset="100%" stopColor="#FF6D00" />
        </linearGradient>
      </defs>

      {/* Isotipo: Barras estadísticas, Signo y Flecha */}
      <g id={`${idPrefix}-icon`} transform="translate(10, 10)">
        {/* Barra 1 (Izquierda) */}
        <rect x="20" y="85" width="28" height="95" rx="3" fill={`url(#${bar1})`} />

        {/* Barra 2 (Centro) */}
        <rect x="56" y="55" width="28" height="125" rx="3" fill={`url(#${bar2})`} />

        {/* Barra 3 (Derecha) */}
        <rect x="92" y="25" width="28" height="155" rx="3" fill={`url(#${bar3})`} />

        {/* Signo de Interrogación (?) */}
        <path
          d="M 130 52 C 130 20 185 20 185 52 C 185 75 155 85 155 110"
          fill="none"
          stroke={`url(#${qMark})`}
          strokeWidth="18"
          strokeLinecap="round"
        />
        <circle cx="155" cy="140" r="10" fill={`url(#${qMark})`} />

        {/* Flecha ascendente quebrada en relieve */}
        {/* Borde de contraste / sombra */}
        <polyline
          points="5 155, 32 120, 68 152, 160 50"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Trazo principal */}
        <polyline
          points="5 155, 32 120, 68 152, 160 50"
          fill="none"
          stroke={`url(#${arrow})`}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Punta de flecha */}
        <path
          d="M 140 46 L 165 45 L 164 70 Z"
          fill={`url(#${arrow})`}
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>

      {/* Tipografía (donde invierto) */}
      <g id={`${idPrefix}-text-group`}>
        {/* "donde" */}
        <text
          x="235"
          y="92"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="78"
          fill={dondeColor}
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
          fill="#00BFA5"
          letterSpacing="-1.5"
        >
          invierto
        </text>
      </g>
    </svg>
  );
}
