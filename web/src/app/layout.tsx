import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://dondeinvierto.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Donde Invierto | Terminal Cuantitativa & Screener de Inversión",
    template: "%s | Donde Invierto",
  },
  description:
    "Terminal cuantitativa institucional para inversores de Wall Street y el Mercado Local. Monitoreo diario de más de 1.200 activos: Acciones del S&P 500, ETFs globales, Bonos USA High Grade, CEDEARs, Obligaciones Negociables (ONs en dólares) y S&P Merval con paridad CCL y optimización de cartera.",
  keywords: [
    "donde invierto",
    "acciones wall street",
    "etfs globales",
    "bonos usa treasuries",
    "cedears argentina",
    "obligaciones negociables en dolares",
    "ons recomendadas",
    "merval acciones",
    "dolar ccl",
    "simulador de cartera",
    "risk parity",
    "inversiones argentina",
    "wall street sp500",
  ],
  authors: [{ name: "Donde Invierto" }],
  creator: "Donde Invierto",
  publisher: "Donde Invierto",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Donde Invierto",
    title: "Donde Invierto | Decisiones Financieras con Datos Cuantitativos",
    description:
      "Descubrí en qué invertir hoy: más de 1.200 activos de Wall Street (S&P 500, ETFs, Bonos USA) y Mercado Local (CEDEARs, ONs en USD, Merval) auditados con modelos cuantitativos y consenso Tier-1.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donde Invierto | Terminal Cuantitativa",
    description:
      "Monitoreo diario de Wall Street (S&P 500, ETFs, Bonos USA) y Mercado Local (CEDEARs, ONs en USD, Merval) con simulador de carteras y algoritmos cuantitativos.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Donde Invierto",
  url: siteUrl,
  applicationCategory: "FinanceApplication",
  operatingSystem: "All",
  description:
    "Plataforma cuantitativa institucional para análisis y simulación de carteras en Wall Street, CEDEARs, Obligaciones Negociables y Merval.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
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
