import React from "react";

export function UsaFlag({
  className = "w-5 h-3.5 inline-block rounded-[2px] shadow-sm shrink-0",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 768 480"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bandera de los Estados Unidos"
    >
      <rect width="768" height="480" fill="#B22234" />
      {/* 6 franjas blancas alternadas */}
      <rect y="36.9" width="768" height="36.9" fill="#FFFFFF" />
      <rect y="110.7" width="768" height="36.9" fill="#FFFFFF" />
      <rect y="184.5" width="768" height="36.9" fill="#FFFFFF" />
      <rect y="258.3" width="768" height="36.9" fill="#FFFFFF" />
      <rect y="332.1" width="768" height="36.9" fill="#FFFFFF" />
      <rect y="405.9" width="768" height="36.9" fill="#FFFFFF" />
      {/* Cantón azul marino */}
      <rect width="320" height="258.5" fill="#3C3B6E" />
      {/* Estrellas estilizadas en cuadrícula limpia */}
      <g fill="#FFFFFF" opacity="0.95">
        <circle cx="50" cy="40" r="10" />
        <circle cx="110" cy="40" r="10" />
        <circle cx="170" cy="40" r="10" />
        <circle cx="230" cy="40" r="10" />
        <circle cx="280" cy="40" r="10" />

        <circle cx="80" cy="80" r="10" />
        <circle cx="140" cy="80" r="10" />
        <circle cx="200" cy="80" r="10" />
        <circle cx="255" cy="80" r="10" />

        <circle cx="50" cy="120" r="10" />
        <circle cx="110" cy="120" r="10" />
        <circle cx="170" cy="120" r="10" />
        <circle cx="230" cy="120" r="10" />
        <circle cx="280" cy="120" r="10" />

        <circle cx="80" cy="160" r="10" />
        <circle cx="140" cy="160" r="10" />
        <circle cx="200" cy="160" r="10" />
        <circle cx="255" cy="160" r="10" />

        <circle cx="50" cy="200" r="10" />
        <circle cx="110" cy="200" r="10" />
        <circle cx="170" cy="200" r="10" />
        <circle cx="230" cy="200" r="10" />
        <circle cx="280" cy="200" r="10" />
      </g>
    </svg>
  );
}

export default UsaFlag;
