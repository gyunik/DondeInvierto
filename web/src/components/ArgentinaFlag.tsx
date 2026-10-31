import React from "react";

export function ArgentinaFlag({ className = "w-5 h-3.5 inline-block rounded-[2px] shadow-sm shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 768 480"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bandera de la República Argentina"
    >
      {/* Franja superior celeste */}
      <rect width="768" height="160" fill="#74ACDF" />
      {/* Franja central blanca */}
      <rect y="160" width="768" height="160" fill="#FFFFFF" />
      {/* Franja inferior celeste */}
      <rect y="320" width="768" height="160" fill="#74ACDF" />
      {/* Sol de Mayo estilizado */}
      <circle cx="384" cy="240" r="42" fill="#F6B40E" stroke="#B87333" strokeWidth="3" />
      <circle cx="384" cy="240" r="24" fill="#F6B40E" />
    </svg>
  );
}

export default ArgentinaFlag;
