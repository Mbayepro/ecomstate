import type { Metadata } from "next";
import "./globals.css";
import { PlatformProvider } from "@/lib/platform-store";
import { AdeshinaFloatingWidget } from "@/components/ai/adeshina-widget";

export const metadata: Metadata = {
  title: {
    default:
      "EcomSate — Créez votre boutique en ligne et développez votre commerce",
    template: "%s | EcomSate",
  },
  description:
    "Plateforme SaaS de création et de gestion de boutiques e-commerce propulsée par Adeshina IA, pensée pour les commerçants et entreprises d'Afrique francophone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-[#1E293B] antialiased">
        <PlatformProvider>
          {children}
          <AdeshinaFloatingWidget />
        </PlatformProvider>
      </body>
    </html>
  );
}
