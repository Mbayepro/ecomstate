"use client";

import React, { useRef, useState } from "react";
import { Mic, MicOff, Sparkles, Wand2 } from "lucide-react";
import { generateProductCopyWithAdeshina } from "@/lib/adeshina-ai";
import { toggleVoicePlayback } from "@/lib/voice-assistant";

interface ParsedVoiceProduct {
  name: string;
  costPrice?: string;
  price?: string;
  promoPrice?: string;
  stock?: string;
  shortDescription: string;
  description: string;
  variantsText: string;
}

interface VoiceProductDictationProps {
  onApply: (parsed: ParsedVoiceProduct) => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

/**
 * Extrait intelligemment le nom, le prix d'achat, le prix de vente, le prix promo et le stock
 * à partir d'une phrase parlée ou saisie naturellement en français.
 */
function parseNaturalFrenchProductDictation(raw: string): ParsedVoiceProduct {
  const cleaned = raw.replace(/\s+/g, " ").trim();

  // Normaliser "25 000" -> "25000" pour faciliter l'extraction des montants
  const normalizedNums = cleaned.replace(/(\d)\s+(\d{3})\b/g, "$1$2");

  const costMatch = normalizedNums.match(
    /(?:achet[eé]e?s?|co[uû]t(?:e)?|fournisseur|revient)\s*(?:[aà]|de)?\s*(\d{3,7})/i
  );
  const sellMatch = normalizedNums.match(
    /(?:vendu[es]?|prix(?:\s+de\s+vente)?|tarif|vente)\s*(?:[aà]|de)?\s*(\d{3,7})/i
  );
  const promoMatch = normalizedNums.match(
    /(?:promo(?:tion)?|r[eé]duit)\s*(?:[aà]|de)?\s*(\d{3,7})/i
  );
  const stockMatch = normalizedNums.match(
    /(?:stock|quantit[eé]|j'en\s+ai|disponible[s]?)\s*(?:de|:)?\s*(\d{1,5})|(\d{1,4})\s*(?:en\s+stock|pi[eè]ces?|articles?|unit[eé]s?)/i
  );

  // Extraire le nom du produit avant le premier mot-clé chiffré
  const namePart = normalizedNums
    .split(
      /\b(?:achet[eé]|co[uû]t|vendu|prix|tarif|promo|stock|j'en\s+ai|\d{4,})\b/i
    )[0]
    .replace(/^[,.;:\-\s]+|[,.;:\-\s]+$/g, "")
    .trim();

  const formattedName =
    namePart.length >= 2
      ? namePart.charAt(0).toUpperCase() + namePart.slice(1)
      : "Article Vedette";

  // Fallback si un seul montant a été cité sans mot-clé "vendu"
  const standaloneAmounts = Array.from(
    normalizedNums.matchAll(/\b(\d{4,7})\b/g)
  ).map((m) => m[1]);

  const resolvedCost = costMatch?.[1];
  const resolvedSell =
    sellMatch?.[1] ??
    standaloneAmounts.find((n) => n !== resolvedCost) ??
    undefined;
  const resolvedPromo = promoMatch?.[1];
  const resolvedStock = stockMatch?.[1] || stockMatch?.[2];

  const copy = generateProductCopyWithAdeshina(formattedName);

  return {
    name: formattedName,
    costPrice: resolvedCost || String(copy.suggestedCostPrice),
    price: resolvedSell || String(copy.suggestedPrice),
    promoPrice: resolvedPromo,
    stock: resolvedStock || "15",
    shortDescription: copy.shortDescription,
    description: copy.description,
    variantsText: copy.suggestedVariants,
  };
}

export function VoiceProductDictation({ onApply }: VoiceProductDictationProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const applyDictationText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const parsed = parseNaturalFrenchProductDictation(trimmed);
    onApply(parsed);
    setStatusMsg(
      `Fiche remplie automatiquement pour « ${parsed.name} » (Vente : ${parsed.price} FCFA · Stock : ${parsed.stock}).`
    );
    toggleVoicePlayback(
      "voice-dictation-confirm",
      `J'ai préparé la fiche complète pour ${parsed.name}, au prix de vente de ${parsed.price} Francs CFA avec la marge calculée.`
    );
  };

  const toggleMicrophone = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      if (transcript.trim()) {
        applyDictationText(transcript);
      }
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRecCtor =
      (window as unknown as Record<string, new () => SpeechRecognitionLike>)
        .SpeechRecognition ||
      (window as unknown as Record<string, new () => SpeechRecognitionLike>)
        .webkitSpeechRecognition;

    if (!SpeechRecCtor) {
      setStatusMsg(
        "Micro vocal non pris en charge sur ce navigateur : dictez ou cliquez sur un exemple rapide ci-dessous."
      );
      return;
    }

    try {
      const rec = new SpeechRecCtor();
      rec.lang = "fr-FR";
      rec.continuous = false;
      rec.interimResults = true;

      let latestText = "";

      rec.onresult = (event) => {
        let combined = "";
        for (let i = 0; i < event.results.length; i++) {
          combined += event.results[i][0].transcript + " ";
        }
        latestText = combined.trim();
        setTranscript(latestText);
      };

      rec.onerror = () => {
        setListening(false);
      };

      rec.onend = () => {
        setListening(false);
        if (latestText.trim()) {
          applyDictationText(latestText);
        }
      };

      recognitionRef.current = rec;
      setTranscript("");
      setStatusMsg("Parlez maintenant : dites le nom, le prix d'achat, le prix de vente et le stock...");
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#00A884]/35 bg-gradient-to-r from-[#073B35] to-[#0a4f47] p-4 text-white shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#7CE3C8]">
            <Sparkles className="h-3.5 w-3.5" />
            Création Produit par la Voix · Adeshina IA
          </p>
          <p className="text-xs text-slate-200">
            Dites par exemple : « Crème karité visage achetée 2500 vendue 6500 stock 25 »
          </p>
        </div>

        <button
          type="button"
          onClick={toggleMicrophone}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            listening
              ? "animate-pulse bg-rose-600 text-white ring-2 ring-white"
              : "bg-[#00A884] text-white hover:bg-[#009474]"
          }`}
        >
          {listening ? (
            <>
              <MicOff className="h-4 w-4" />
              Arrêter & Remplir
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Dicter mon article
            </>
          )}
        </button>
      </div>

      {/* Champ de dictée assistée + exemples 1 clic pour démo instantanée */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Ou écrivez / collez une phrase rapide : Sac cuir acheté 8000 vendu 19500 stock 12"
          className="h-9 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 text-xs text-white placeholder:text-slate-300 focus:border-[#7CE3C8] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => applyDictationText(transcript)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-[#073B35] hover:bg-slate-100 cursor-pointer"
        >
          <Wand2 className="h-3.5 w-3.5 text-[#00A884]" />
          Remplir en 1 clic
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-slate-300">Tester un exemple :</span>
        {[
          "Sérum Karité Pur acheté 3000 vendu 8500 stock 30",
          "Robe Basin Brodé achetée 12000 vendue 28000 promo 24500 stock 10",
        ].map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => {
              setTranscript(sample);
              applyDictationText(sample);
            }}
            className="rounded-lg bg-white/10 px-2 py-0.5 font-semibold text-[#7CE3C8] hover:bg-white/20 cursor-pointer"
          >
            {sample.split(" acheté")[0]}
          </button>
        ))}
      </div>

      {statusMsg && (
        <p className="mt-2 rounded-lg bg-black/25 px-3 py-1.5 text-[11px] font-bold text-[#7CE3C8]">
          {statusMsg}
        </p>
      )}
    </div>
  );
}
