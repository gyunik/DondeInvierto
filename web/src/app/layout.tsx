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
    <html lang="es" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-[#051424] dark:text-[#d4e4fa] min-h-screen selection:bg-[#4edea3] selection:text-[#002113] transition-colors duration-200"
      >
        {children}
      </body>
    </html>
  );
}
