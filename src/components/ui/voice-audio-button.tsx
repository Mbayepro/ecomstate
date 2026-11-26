"use client";

import React, { useEffect, useId, useSyncExternalStore } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import {
  getServerVoiceSnapshot,
  getVoiceSnapshot,
  stopSpeech,
  subscribeVoiceState,
  toggleVoicePlayback,
} from "@/lib/voice-assistant";
import { cn } from "@/lib/utils";

interface VoiceAudioButtonProps {
  textToSpeak: string;
  label?: string;
  variant?: "pill" | "icon" | "card-action" | "banner";
  className?: string;
  title?: string;
}

export function VoiceAudioButton({
  textToSpeak,
  label,
  variant = "icon",
  className,
  title = "Écouter l'explication vocale",
}: VoiceAudioButtonProps) {
  const buttonId = useId();
  const voiceState = useSyncExternalStore(
    subscribeVoiceState,
    getVoiceSnapshot,
    getServerVoiceSnapshot
  );

  const isThisActive = voiceState.activeId === buttonId;
  const isLoading = isThisActive && voiceState.status === "loading";
  const isPlaying = isThisActive && voiceState.status === "playing";

  // N'arrêter la lecture au démontage que si CE bouton précis était celui en train de parler
  useEffect(() => {
    return () => {
      if (getVoiceSnapshot().activeId === buttonId) {
        stopSpeech();
      }
    };
  }, [buttonId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleVoicePlayback(buttonId, textToSpeak);
  };

  if (variant === "banner") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title={title}
        className={cn(
          "inline-flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-sm",
          isPlaying
            ? "bg-white text-[#073B35] ring-2 ring-[#00A884]"
            : isLoading
              ? "bg-[#00A884]/90 text-white"
              : "bg-[#00A884] text-white hover:bg-[#009675] active:scale-98",
          className
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Préparation vocale...</span>
          </>
        ) : isPlaying ? (
          <>
            <span className="flex h-3.5 items-end gap-0.5" aria-hidden="true">
              <span className="h-2 w-1 animate-pulse rounded-full bg-[#00A884]" />
              <span className="h-3.5 w-1 animate-bounce rounded-full bg-[#00A884]" />
              <span className="h-2.5 w-1 animate-pulse rounded-full bg-[#00A884]" />
            </span>
            <span>Arrêter la voix</span>
            <Square className="h-3 w-3 fill-rose-600 text-rose-600" />
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4" />
            <span>{label || "Écouter en vocal"}</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title={title}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs",
          isPlaying
            ? "border-rose-300 bg-rose-50 text-rose-700 ring-2 ring-rose-200"
            : isLoading
              ? "border-[#00A884] bg-[#E7F7F2] text-[#073B35]"
              : "border-[#00A884]/35 bg-white text-[#073B35] hover:border-[#00A884] hover:bg-[#E7F7F2]/60",
          className
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00A884]" />
            <span>Chargement...</span>
          </>
        ) : isPlaying ? (
          <>
            <Square className="h-3 w-3 fill-rose-600 text-rose-600" />
            <span>Arrêter</span>
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5 text-[#00A884]" />
            <span>{label || "Écouter"}</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "card-action") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title={title}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-extrabold transition-all cursor-pointer",
          isPlaying
            ? "border-rose-300 bg-rose-50 text-rose-700"
            : isLoading
              ? "border-[#00A884] bg-[#E7F7F2] text-[#073B35]"
              : "border-slate-200/80 bg-white/90 text-[#073B35] hover:border-[#00A884] hover:bg-[#E7F7F2]",
          className
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-[#00A884]" />
            <span>Voix...</span>
          </>
        ) : isPlaying ? (
          <>
            <Square className="h-2.5 w-2.5 fill-rose-600 text-rose-600" />
            <span>Arrêter</span>
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5 text-[#00A884]" />
            <span>{label || "Écouter"}</span>
          </>
        )}
      </button>
    );
  }

  // Variant "icon"
  return (
    <button
      type="button"
      onClick={handleToggle}
      title={title}
      aria-label={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer",
        isPlaying
          ? "border-rose-300 bg-rose-50 text-rose-600 ring-2 ring-rose-200"
          : isLoading
            ? "border-[#00A884] bg-[#E7F7F2] text-[#00A884]"
            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#00A884] hover:bg-[#E7F7F2] hover:text-[#073B35]",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isPlaying ? (
        <Square className="h-3 w-3 fill-rose-600 text-rose-600" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

/**
 * Barre flottante de lecture vocale avec sous-titres lisibles et bouton d'arrêt immédiat.
 * S'affiche uniquement pendant qu'Adeshina parle.
 */
export function ActiveVoicePlayerBar() {
  const voiceState = useSyncExternalStore(
    subscribeVoiceState,
    getVoiceSnapshot,
    getServerVoiceSnapshot
  );

  if (voiceState.status === "idle" || !voiceState.activeText) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-[#00A884]/40 bg-[#073B35] p-3.5 text-white shadow-2xl lg:bottom-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00A884] text-white">
            {voiceState.status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex h-3.5 items-end gap-0.5">
                <span className="h-2 w-1 animate-pulse rounded-full bg-white" />
                <span className="h-3.5 w-1 animate-bounce rounded-full bg-white" />
                <span className="h-2.5 w-1 animate-pulse rounded-full bg-white" />
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#7CE3C8]">
              {voiceState.status === "loading"
                ? "Adeshina prépare la voix..."
                : "Adeshina vous parle en direct"}
            </p>
            <p className="line-clamp-2 text-xs leading-snug text-white/95">
              {voiceState.activeText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => stopSpeech()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-500 cursor-pointer"
        >
          <Square className="h-3 w-3 fill-white" />
          Arrêter
        </button>
      </div>
    </div>
  );
}
