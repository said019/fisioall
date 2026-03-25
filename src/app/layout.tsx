import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4a7fa5",
};

export const metadata: Metadata = {
  title: {
    default: "Kaya Kalp | Dando vida a tu cuerpo",
    template: "%s | Kaya Kalp",
  },
  description:
    "Centro de Fisioterapia, Masajes y Tratamientos Faciales en San Juan del Río, Querétaro. Agenda tu cita en línea. Certificación CONOCER ante la SEP.",
  keywords: [
    "fisioterapia",
    "masajes",
    "tratamientos faciales",
    "San Juan del Río",
    "Querétaro",
    "suelo pélvico",
    "rehabilitación",
    "Kaya Kalp",
  ],
  authors: [{ name: "Kaya Kalp" }],
  openGraph: {
    title: "Kaya Kalp | Dando vida a tu cuerpo",
    description:
      "Centro de Fisioterapia, Masajes y Tratamientos Faciales en San Juan del Río, Querétaro.",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#4a7fa5] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Ir al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
