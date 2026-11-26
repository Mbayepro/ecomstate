"use client";

import React from "react";
import type { StoreFontId, StoreSettings } from "@/types/domain";

export interface StoreFontPreset {
  id: Exclude<StoreFontId, "custom_google" | "custom_file">;
  name: string;
  vibe: string;
  sampleLabel: string;
  headingFamily: string;
  bodyFamily: string;
}

export const STORE_FONT_PRESETS: StoreFontPreset[] = [
  {
    id: "modern",
    name: "Moderne & Net",
    vibe: "Manrope + Inter",
    sampleLabel: "Clair, rapide & universel",
    headingFamily: '"Manrope", "Inter", ui-sans-serif, system-ui, sans-serif',
    bodyFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "luxury",
    name: "Luxe & Couture",
    vibe: "Playfair + Jakarta",
    sampleLabel: "Mode, wax, bijoux & prestige",
    headingFamily: '"Playfair Display", Georgia, serif',
    bodyFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
  },
  {
    id: "beauty",
    name: "Douceur & Beauté",
    vibe: "Cormorant + Outfit",
    sampleLabel: "Soins, karité, cosmétiques & parfums",
    headingFamily: '"Cormorant Garamond", Georgia, serif',
    bodyFamily: '"Outfit", "Inter", sans-serif',
  },
  {
    id: "rounded",
    name: "Populaire & Rond",
    vibe: "Poppins",
    sampleLabel: "Chaleureux & ultra-lisible sur mobile",
    headingFamily: '"Poppins", "Inter", sans-serif',
    bodyFamily: '"Poppins", "Inter", sans-serif',
  },
  {
    id: "bold_tech",
    name: "Impact & Sneakers",
    vibe: "Space Grotesk + DM Sans",
    sampleLabel: "High-tech, montres, audio & streetwear",
    headingFamily: '"Space Grotesk", "Manrope", sans-serif',
    bodyFamily: '"DM Sans", "Inter", sans-serif',
  },
  {
    id: "classic",
    name: "Maison & Éditorial",
    vibe: "Lora + Inter",
    sampleLabel: "Déco, artisanat & boutique familiale",
    headingFamily: '"Lora", Georgia, serif',
    bodyFamily: '"Inter", ui-sans-serif, sans-serif',
  },
];

export const POPULAR_GOOGLE_FONTS = [
  "Montserrat",
  "Raleway",
  "Cinzel",
  "Quicksand",
  "Josefin Sans",
  "Bebas Neue",
  "Merriweather",
  "Nunito",
];

function sanitizeFontName(raw?: string): string {
  return (raw ?? "")
    .replace(/["'<>\\;{}]/g, "")
    .trim()
    .slice(0, 60);
}

/**
 * Calcule les variables CSS `--font-display` et `--font-sans` appliquées
 * à la vitrine publique `/s/[slug]` ainsi qu'aux aperçus en temps réel.
 */
export function getStoreFontStyleVars(
  settings?: Partial<StoreSettings>
): React.CSSProperties {
  const fontId = settings?.fontFamily ?? "modern";
  const customName = sanitizeFontName(settings?.customFontName);

  if (fontId === "custom_file" && settings?.customFontDataUrl) {
    const uploadedFamily = `"EcomSateUploadedFont", "Inter", sans-serif`;
    return {
      ["--font-display" as string]: uploadedFamily,
      ["--font-sans" as string]: uploadedFamily,
      fontFamily: uploadedFamily,
    };
  }

  if (fontId === "custom_google" && customName) {
    const googleStack = `"${customName}", "Inter", sans-serif`;
    return {
      ["--font-display" as string]: googleStack,
      ["--font-sans" as string]: googleStack,
      fontFamily: googleStack,
    };
  }

  const preset =
    STORE_FONT_PRESETS.find((p) => p.id === fontId) ?? STORE_FONT_PRESETS[0];

  return {
    ["--font-display" as string]: preset.headingFamily,
    ["--font-sans" as string]: preset.bodyFamily,
    fontFamily: preset.bodyFamily,
  };
}

export function getActiveFontDisplayName(
  settings?: Partial<StoreSettings>
): string {
  const fontId = settings?.fontFamily ?? "modern";
  if (fontId === "custom_file" && settings?.customFontDataUrl) {
    return settings.customFontName || "Ma police importée";
  }
  if (fontId === "custom_google" && settings?.customFontName) {
    return settings.customFontName;
  }
  return (
    STORE_FONT_PRESETS.find((p) => p.id === fontId)?.name ??
    STORE_FONT_PRESETS[0].name
  );
}

/**
 * Injecte dynamiquement une feuille Google Fonts ou une règle `@font-face`
 * lorsque le vendeur choisit sa propre police personnalisée.
 */
export function StoreDynamicFontInjector({
  settings,
}: {
  settings?: Partial<StoreSettings>;
}) {
  const fontId = settings?.fontFamily;
  const customName = sanitizeFontName(settings?.customFontName);
  const dataUrl = settings?.customFontDataUrl;

  if (fontId === "custom_google" && customName) {
    const encoded = encodeURIComponent(customName).replace(/%20/g, "+");
    const href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700;800&display=swap`;
    return React.createElement("link", { rel: "stylesheet", href });
  }

  if (fontId === "custom_file" && dataUrl && dataUrl.startsWith("data:")) {
    return React.createElement("style", {
      dangerouslySetInnerHTML: {
        __html: `@font-face { font-family: "EcomSateUploadedFont"; src: url("${dataUrl}"); font-display: swap; }`,
      },
    });
  }

  return null;
}
