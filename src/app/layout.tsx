import type { Metadata, Viewport } from "next";
import { Figtree, Fira_Sans } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const firaSans = Fira_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0891B2",
};

export const metadata: Metadata = {
  title: {
    default: "FisioAll | Fisioterapia y Rehabilitación",
    template: "%s | FisioAll",
  },
  description:
    "Plataforma SaaS para Fisioterapeutas y Clínicas — Agenda, expediente clínico digital, membresías y más.",
  keywords: [
    "fisioterapia",
    "rehabilitación",
    "clínica",
    "SaaS",
    "expediente clínico",
    "body map",
  ],
  authors: [{ name: "FisioAll" }],
  openGraph: {
    title: "FisioAll | Fisioterapia y Rehabilitación",
    description: "Plataforma SaaS para Fisioterapeutas y Clínicas",
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
      <body
        className={`${figtree.variable} ${firaSans.variable} font-sans antialiased`}
      >
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#0891B2] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Ir al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
