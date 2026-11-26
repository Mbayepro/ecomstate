/**
 * Gestionnaire Vocal Centralisé Adeshina Voice (Double Moteur Robuste)
 *
 * Moteur 1 (Principal) : Flux MP3 français haute clarté via `/api/tts` lu par HTML5 `<Audio>`.
 *   -> Fonctionne sur 100 % des PC Windows, Mac, Android et iPhone même sans pack SAPI5 installé.
 * Moteur 2 (Secours hors-ligne) : Web Speech API (`window.speechSynthesis`) durcie contre
 *   les bugs connus de Chromium/Edge (race condition `cancel()+speak()`, garbage collection V8,
 *   voix chargées de manière asynchrone et watchdog anti-blocage sur "Arrêter").
 */

export type VoicePlaybackStatus = "idle" | "loading" | "playing";

export interface VoiceStateSnapshot {
  status: VoicePlaybackStatus;
  activeId: string | null;
  activeText: string;
}

declare global {
  interface Window {
    __adeshinaUtterance?: SpeechSynthesisUtterance | null;
  }
}

let currentState: VoiceStateSnapshot = {
  status: "idle",
  activeId: null,
  activeText: "",
};

const listeners = new Set<() => void>();
let sharedAudio: HTMLAudioElement | null = null;
let playSessionToken = 0;
let speechWatchdogTimer: ReturnType<typeof setTimeout> | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function setState(patch: Partial<VoiceStateSnapshot>) {
  currentState = { ...currentState, ...patch };
  emitChange();
}

export function subscribeVoiceState(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getVoiceSnapshot(): VoiceStateSnapshot {
  return currentState;
}

const SERVER_SNAPSHOT: VoiceStateSnapshot = {
  status: "idle",
  activeId: null,
  activeText: "",
};

export function getServerVoiceSnapshot(): VoiceStateSnapshot {
  return SERVER_SNAPSHOT;
}

function clearWatchdog() {
  if (speechWatchdogTimer) {
    clearTimeout(speechWatchdogTimer);
    speechWatchdogTimer = null;
  }
}

function initVoicesOnce() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const load = () => {
    try {
      const list = window.speechSynthesis.getVoices();
      if (list && list.length > 0) {
        cachedVoices = list;
      }
    } catch {
      // Ignorer
    }
  };
  load();
  window.speechSynthesis.addEventListener?.("voiceschanged", load);
}

if (typeof window !== "undefined") {
  initVoicesOnce();
}

export function formatReadableVoiceText(text: string): string {
  return text
    .replace(/[#*_`~>•·]/g, " ")
    .replace(/→/g, " ")
    .replace(/\bFCFA\b/gi, "Francs CFA")
    .replace(/\bcmd\b/gi, "commandes")
    .replace(/\bCOD\b/gi, "paiement à la livraison")
    .replace(/\(s\)/gi, "s")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Arrête immédiatement toute lecture audio ou synthèse vocale en cours.
 */
export function stopSpeech(): void {
  playSessionToken += 1;
  clearWatchdog();

  if (sharedAudio) {
    try {
      sharedAudio.onplaying = null;
      sharedAudio.onended = null;
      sharedAudio.onerror = null;
      sharedAudio.pause();
      sharedAudio.removeAttribute("src");
      sharedAudio.load();
    } catch {
      // Ignorer
    }
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      if (window.__adeshinaUtterance) {
        window.__adeshinaUtterance.onstart = null;
        window.__adeshinaUtterance.onend = null;
        window.__adeshinaUtterance.onerror = null;
        window.__adeshinaUtterance = null;
      }
      window.speechSynthesis.cancel();
    } catch {
      // Ignorer
    }
  }

  if (currentState.status !== "idle" || currentState.activeId !== null) {
    setState({ status: "idle", activeId: null, activeText: "" });
  }
}

/**
 * Secours hors-ligne via Web Speech API durcie contre les blocages Windows/Chromium.
 */
function speakWithBrowserFallback(
  cleanText: string,
  id: string,
  token: number,
  rate = 0.96
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    setState({ status: "idle", activeId: null, activeText: "" });
    return false;
  }

  const synth = window.speechSynthesis;
  const wasBusy = synth.speaking || synth.pending;

  if (wasBusy) {
    try {
      synth.cancel();
    } catch {
      // Ignorer
    }
  }

  const launchUtterance = () => {
    if (token !== playSessionToken) return;

    try {
      if (synth.paused) {
        synth.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      // Conserver une référence globale pour empêcher le Garbage Collector V8 de supprimer onend
      window.__adeshinaUtterance = utterance;

      const voices =
        cachedVoices.length > 0 ? cachedVoices : synth.getVoices() ?? [];
      const frVoice =
        voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("fr") &&
            (v.name.includes("Natural") ||
              v.name.includes("Online") ||
              v.name.includes("Google") ||
              v.name.includes("Microsoft"))
        ) ||
        voices.find((v) => v.lang.toLowerCase().startsWith("fr")) ||
        null;

      if (frVoice) {
        utterance.voice = frVoice;
        utterance.lang = frVoice.lang;
      } else if (voices.length > 0) {
        // Si aucune voix FR n'est installée sur Windows, utiliser la voix système disponible
        // plutôt que de bloquer la file SAPI5 en silence
        utterance.voice = voices[0];
        utterance.lang = "fr-FR";
      } else {
        utterance.lang = "fr-FR";
      }

      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      let started = false;

      utterance.onstart = () => {
        if (token !== playSessionToken) return;
        started = true;
        clearWatchdog();
        setState({ status: "playing", activeId: id, activeText: cleanText });
      };

      utterance.onend = () => {
        if (token !== playSessionToken) return;
        clearWatchdog();
        window.__adeshinaUtterance = null;
        setState({ status: "idle", activeId: null, activeText: "" });
      };

      utterance.onerror = () => {
        if (token !== playSessionToken) return;
        clearWatchdog();
        window.__adeshinaUtterance = null;
        setState({ status: "idle", activeId: null, activeText: "" });
      };

      // Watchdog anti-blocage : si SAPI5 ne démarre pas sous 2,2 secondes, libérer le bouton "Arrêter"
      clearWatchdog();
      speechWatchdogTimer = setTimeout(() => {
        if (token === playSessionToken && !started && !synth.speaking) {
          window.__adeshinaUtterance = null;
          try {
            synth.cancel();
          } catch {
            // Ignorer
          }
          setState({ status: "idle", activeId: null, activeText: "" });
        }
      }, 2200);

      synth.speak(utterance);
    } catch {
      setState({ status: "idle", activeId: null, activeText: "" });
    }
  };

  // Délai de 90ms après cancel() pour éviter le bug Chromium qui annule le nouvel appel speak()
  if (wasBusy) {
    setTimeout(launchUtterance, 90);
  } else {
    launchUtterance();
  }

  return true;
}

/**
 * Lance la lecture vocale pour un identifiant de bouton donné (bascule lecture / arrêt).
 */
export function toggleVoicePlayback(
  id: string,
  rawText: string,
  options?: { rate?: number }
): void {
  if (typeof window === "undefined") return;

  // Si ce même bouton est déjà actif (chargement ou lecture), on arrête tout
  if (
    currentState.activeId === id &&
    (currentState.status === "playing" || currentState.status === "loading")
  ) {
    stopSpeech();
    return;
  }

  // Arrêter proprement toute autre lecture précédente
  stopSpeech();

  const cleanText = formatReadableVoiceText(rawText);
  if (!cleanText) return;

  const token = ++playSessionToken;
  setState({ status: "loading", activeId: id, activeText: cleanText });

  // Moteur 1 : Audio MP3 via `/api/tts` (fiabilité universelle sur tous les navigateurs)
  try {
    if (!sharedAudio) {
      sharedAudio = new Audio();
      sharedAudio.preload = "auto";
    }

    const audio = sharedAudio;
    const ttsEndpoint = `/api/tts?text=${encodeURIComponent(cleanText)}`;

    let fallbackTriggered = false;
    const triggerFallback = () => {
      if (fallbackTriggered || token !== playSessionToken) return;
      fallbackTriggered = true;
      speakWithBrowserFallback(cleanText, id, token, options?.rate ?? 0.96);
    };

    audio.src = ttsEndpoint;
    audio.playbackRate = options?.rate ?? 1.0;

    audio.onplaying = () => {
      if (token !== playSessionToken) return;
      clearWatchdog();
      setState({ status: "playing", activeId: id, activeText: cleanText });
    };

    audio.onended = () => {
      if (token !== playSessionToken) return;
      clearWatchdog();
      setState({ status: "idle", activeId: null, activeText: "" });
    };

    audio.onerror = () => {
      triggerFallback();
    };

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        triggerFallback();
      });
    }
  } catch {
    speakWithBrowserFallback(cleanText, id, token, options?.rate ?? 0.96);
  }
}

/**
 * Compatibilité descendante avec d'éventuels appels directs.
 */
export function speakText(
  text: string,
  options?: {
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): boolean {
  toggleVoicePlayback("direct-call", text, { rate: options?.rate });
  options?.onStart?.();
  return true;
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined";
}
