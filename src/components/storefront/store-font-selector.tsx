"use client";

import React, { useRef, useState } from "react";
import { Check, Sparkles, Type, Upload } from "lucide-react";
import {
  POPULAR_GOOGLE_FONTS,
  STORE_FONT_PRESETS,
  StoreDynamicFontInjector,
} from "@/lib/store-fonts";
import { VoiceAudioButton } from "@/components/ui/voice-audio-button";
import { cn } from "@/lib/utils";
import type { StoreFontId, StoreSettings } from "@/types/domain";

interface StoreFontSelectorProps {
  settings: Partial<StoreSettings>;
  onChange: (patch: {
    fontFamily: StoreFontId;
    customFontName?: string;
    customFontDataUrl?: string;
  }) => void;
  compact?: boolean;
}

export function StoreFontSelector({
  settings,
  onChange,
  compact = false,
}: StoreFontSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [googleInput, setGoogleInput] = useState(
    settings.fontFamily === "custom_google" ? settings.customFontName ?? "" : ""
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCustomPanel, setShowCustomPanel] = useState(
    settings.fontFamily === "custom_google" ||
      settings.fontFamily === "custom_file"
  );

  const currentFont = settings.fontFamily ?? "modern";

  const handleApplyGoogleFont = (name: string) => {
    const cleaned = name.trim();
    if (!cleaned) return;
    setGoogleInput(cleaned);
    setUploadError(null);
    onChange({
      fontFamily: "custom_google",
      customFontName: cleaned,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    // Limite raisonnable (650 Ko) pour stockage fluide dans les paramètres boutique
    if (file.size > 650 * 1024) {
      setUploadError(
        "Fichier trop lourd (max 650 Ko). Privilégiez le format .woff2 ou choisissez une police Google ci-dessus."
      );
      return;
    }

    const validExt = /\.(woff2?|ttf|otf)$/i.test(file.name);
    if (!validExt) {
      setUploadError(
        "Format non reconnu. Importez un fichier .woff2, .woff, .ttf ou .otf."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result.startsWith("data:")) {
        setUploadError("Impossible de lire ce fichier de police.");
        return;
      }
      const readableName = file.name.replace(/\.(woff2?|ttf|otf)$/i, "");
      onChange({
        fontFamily: "custom_file",
        customFontName: readableName,
        customFontDataUrl: result,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <StoreDynamicFontInjector settings={settings} />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-[#00A884]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#15232D]">
            {compact
              ? "3. Choisir l'écriture de ma boutique (1 clic)"
              : "Police d'écriture de la boutique"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCustomPanel((v) => !v)}
            className="text-[11px] font-extrabold text-[#00A884] hover:underline cursor-pointer"
          >
            {showCustomPanel
              ? "Masquer ma propre police"
              : "+ Ma propre police (.ttf / Google)"}
          </button>
          <VoiceAudioButton
            textToSpeak="Choisissez le style d'écriture de votre boutique en touchant l'une des cartes Aa. Vous pouvez même importer votre propre fichier de police ou taper le nom d'une police Google."
            variant="icon"
          />
        </div>
      </div>

      {/* Grille visuelle des 6 styles "Aa" rendus dans leur vraie typographie */}
      <div
        className={cn(
          "grid gap-2.5",
          compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3"
        )}
      >
        {STORE_FONT_PRESETS.map((preset) => {
          const active = currentFont === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onChange({
                  fontFamily: preset.id,
                })
              }
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border bg-white p-3 text-left transition-all cursor-pointer",
                active
                  ? "border-2 border-[#00A884] bg-[#E7F7F2]/35 shadow-2xs"
                  : "border-[#E2E8F0] hover:border-slate-300 hover:bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="text-2xl font-bold leading-none text-[#15232D]"
                  style={{ fontFamily: preset.headingFamily }}
                >
                  Aa
                </span>
                {active && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00A884] text-white">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="mt-2">
                <p
                  className="truncate text-xs font-bold text-[#15232D]"
                  style={{ fontFamily: preset.headingFamily }}
                >
                  {preset.name}
                </p>
                {!compact && (
                  <p
                    className="mt-0.5 line-clamp-1 text-[10px] text-slate-500"
                    style={{ fontFamily: preset.bodyFamily }}
                  >
                    {preset.sampleLabel}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Panneau "Ma propre police" : Google Fonts libre + Import fichier .ttf / .woff2 */}
      {showCustomPanel && (
        <div className="space-y-3 rounded-2xl border border-[#00A884]/30 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-[#073B35]">
              <Sparkles className="h-3.5 w-3.5 text-[#00A884]" />
              Utiliser ma propre police personnalisée
            </p>
            {(currentFont === "custom_google" ||
              currentFont === "custom_file") && (
              <span className="rounded-full bg-[#E7F7F2] px-2.5 py-0.5 text-[10px] font-extrabold text-[#073B35]">
                Active : {settings.customFontName}
              </span>
            )}
          </div>

          {/* Option A : Nom d'une police Google Fonts + suggestions 1 clic */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-600">
              Option A — Choisir ou taper n&apos;importe quelle police Google Fonts :
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_GOOGLE_FONTS.map((fontName) => {
                const isSelected =
                  currentFont === "custom_google" &&
                  (settings.customFontName ?? "").toLowerCase() ===
                    fontName.toLowerCase();
                return (
                  <button
                    key={fontName}
                    type="button"
                    onClick={() => handleApplyGoogleFont(fontName)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-[11px] font-bold transition cursor-pointer",
                      isSelected
                        ? "border-[#073B35] bg-[#073B35] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#00A884]"
                    )}
                  >
                    {fontName}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={googleInput}
                onChange={(e) => setGoogleInput(e.target.value)}
                placeholder="Ex : Montserrat, Cinzel, Rubik, Syne..."
                className="h-9 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#15232D] focus:border-[#00A884] focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleApplyGoogleFont(googleInput)}
                className="rounded-xl bg-[#073B35] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#0a4f47] cursor-pointer"
              >
                Appliquer
              </button>
            </div>
          </div>

          {/* Option B : Importer son propre fichier .woff2 / .ttf / .otf */}
          <div className="border-t border-slate-100 pt-2.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-700">
                  Option B — Importer mon fichier de police (.woff2, .ttf, .otf)
                </p>
                <p className="text-[10px] text-slate-500">
                  Idéal si votre marque possède sa propre typographie sur mesure.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".woff2,.woff,.ttf,.otf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#00A884] bg-[#E7F7F2]/60 px-3 py-2 text-xs font-extrabold text-[#073B35] transition hover:bg-[#00A884] hover:text-white cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                Importer un fichier
              </button>
            </div>

            {uploadError && (
              <p className="mt-1.5 text-[11px] font-semibold text-rose-600">
                {uploadError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
