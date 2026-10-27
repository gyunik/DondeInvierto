import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Donde Invierto | Terminal Quant & Radar Diario de Inversión",
  description: "Monitoreo cuantitativo diario de CEDEARs, ETFs globales, Obligaciones Negociables (ONs en dólares) y acciones del S&P Merval con paridad CCL.",
  keywords: ["inversiones", "cedears", "obligaciones negociables", "merval", "wall street", "donde invierto", "dolar ccl"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body
        className="font-sans antialiased bg-[#051424] text-[#d4e4fa] min-h-screen selection:bg-[#4edea3] selection:text-[#002113]"
      >
        {children}
      </body>
    </html>
  );
}
