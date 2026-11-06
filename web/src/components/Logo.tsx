import React from "react";

interface LogoProps {
  className?: string;
  dondeColor?: string;
  idPrefix?: string;
  animated?: boolean;
}

export default function Logo({
  className = "w-full h-auto",
  dondeColor,
  idPrefix = "di",
  animated = true,
}: LogoProps) {
  const mascotSrc = animated
    ? "/mascot/don_inversor_inspect.webp"
    : "/mascot/don_inversor_resting.webp";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 520 220"
      className={className}
      role="img"
      aria-label="Donde Invierto - Terminal Quant"
      fill="none"
    >
      {/* Mascota Don Inversor Busto (animada con lupa o en reposo) */}
      <image
        href={mascotSrc}
        x="6"
        y="12"
        width="150"
        height="196"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Tipografía adaptativa a Light y Dark Mode ("donde invierto") */}
      <g id={`${idPrefix}-text-group`}>
        {/* "donde" - se adapta automáticamente: oscuro en light mode, blanco en dark mode */}
        <text
          x="170"
          y="92"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="82"
          fill={dondeColor || "currentColor"}
          className={!dondeColor ? "fill-slate-900 dark:fill-white transition-colors duration-200" : ""}
          letterSpacing="-1.5"
        >
          donde
        </text>

        {/* "invierto" */}
        <text
          x="170"
          y="168"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="82"
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
