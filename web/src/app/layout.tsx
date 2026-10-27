import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DondeInvierto | Radar Diario de Acciones, ETFs y Bonos de EE.UU.",
  description: "Descubre diariamente las mejores 10 oportunidades de inversión en Wall Street seleccionadas mediante análisis cuantitativo, momentum y consenso institucional.",
  keywords: ["inversiones", "acciones usa", "etfs", "bonos del tesoro", "donde invertir", "wall street"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-slate-950"
      >
        {children}
      </body>
    </html>
  );
}
