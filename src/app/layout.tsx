import type { Metadata } from "next";
import "./globals.css";
import { PlatformProvider } from "@/lib/platform-store";
import { AdeshinaFloatingWidget } from "@/components/ai/adeshina-widget";

const resolvedBaseUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXT_PUBLIC_APP_URL &&
        !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://ecomstate.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(resolvedBaseUrl),
  title: {
    default:
      "EcomSate — Créez votre boutique en ligne et développez votre commerce",
    template: "%s | EcomSate",
  },
  description:
    "Plateforme SaaS e-commerce propulsée par Adeshina IA. Créez votre boutique en ligne professionnelle, gérez vos stocks et recevez vos commandes par WhatsApp et Mobile Money.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "EcomSate",
    title: "EcomSate — Votre boutique. Votre marque. Votre commerce.",
    description:
      "Lancez votre boutique en ligne professionnelle en 2 minutes avec Adeshina IA. Commandes WhatsApp, paiement à la livraison et Mobile Money (0 % commission).",
  },
  twitter: {
    card: "summary_large_image",
    title: "EcomSate — Votre boutique. Votre marque. Votre commerce.",
    description:
      "La plateforme e-commerce SaaS pensée pour les commerçants africains, propulsée par Adeshina IA.",
  },
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
