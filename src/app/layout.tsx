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
    "La plateforme e-commerce tout-en-un pensée pour les vendeurs Cash on Delivery (COD). Créez votre boutique Shrine Pro, personnalisez votre formulaire COD et pilotez vos commandes, livreurs et bénéfice réel.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "EcomSate",
    title: "EcomSate — Créez votre boutique COD et pilotez votre vrai bénéfice.",
    description:
      "Lancez votre boutique en ligne 100 % paiement à la livraison (COD) avec Store Builder Shrine Pro, Form Builder COD, suivi livreurs et Adeshina IA.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EcomSate — Créez votre boutique COD et pilotez votre vrai bénéfice.",
    description:
      "La plateforme e-commerce pensée pour les vendeurs Cash on Delivery (COD), propulsée par Adeshina IA.",
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Lora:wght@600;700&family=Manrope:wght@600;700;800&family=Outfit:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-[#15232D] antialiased">
        <PlatformProvider>
          {children}
          <AdeshinaFloatingWidget />
        </PlatformProvider>
      </body>
    </html>
  );
}
