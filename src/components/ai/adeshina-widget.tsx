"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  MessageSquareText,
  Send,
  Sparkles,
  Store,
  Wand2,
  X,
} from "lucide-react";
import {
  ADESHINA_SECTORS,
  askAdeshinaIA,
  getBlueprintBySector,
  type AdeshinaReply,
} from "@/lib/adeshina-ai";
import { FormattedAiText } from "@/components/ui/formatted-ai-text";
import { formatCurrency } from "@/lib/utils";


interface ChatTurn {
  id: string;
  sender: "adeshina" | "user";
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const QUICK_PROMPTS = [
  "À quoi sert EcomSate ?",
  "Comment ça marche en 3 étapes ?",
  "Tarifs & essai à 2 000 FCFA",
  "Commandes WhatsApp & Livraison",
  "Mobile Money sans NINEA / RCCM",
];


export function AdeshinaFloatingWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "builder">("chat");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSector, setSelectedSector] = useState("mode");
  const [customName, setCustomName] = useState("");
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: "welcome",
      sender: "adeshina",
      text: "Bonjour ! Je suis Adeshina IA, l'intelligence artificielle d'EcomSate. Je guide les visiteurs pour comprendre la plateforme et j'aide les commerçants à créer et remplir leur boutique en quelques secondes. Que souhaitez-vous faire ?",
      ctaLabel: "Générer ma boutique avec Adeshina IA",
      ctaHref: "/creer-une-boutique",
    },
  ]);

  const blueprint = getBlueprintBySector(selectedSector, customName);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, open]);

  const [dismissed, setDismissed] = useState(false);

  // Masquer le widget sur les boutiques clientes (/s/...), le dashboard marchand (/dashboard) et l'administration (/admin)
  if (
    dismissed ||
    pathname?.startsWith("/s/") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }


  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: "user", text: trimmed },
    ]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply: AdeshinaReply = askAdeshinaIA(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: "adeshina",
          text: reply.answer,
          ctaLabel: reply.ctaLabel,
          ctaHref: reply.ctaHref,
        },
      ]);
      setIsTyping(false);
    }, 380);
  };

  return (
    <>
      {/* Bouton flottant Adeshina IA */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5">
        {!open && (
          <>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/80 text-white/70 backdrop-blur-xs transition hover:bg-slate-900 hover:text-white cursor-pointer shadow-md"
              title="Masquer Adeshina IA"
              aria-label="Masquer Adeshina IA"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="animate-pulse-emerald group flex items-center gap-3 rounded-full border border-white/20 bg-[#102A43] py-2.5 pl-3.5 pr-4 text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl active:scale-98 cursor-pointer"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] text-white transition-transform duration-200 group-hover:rotate-12">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="text-left">
                <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-white">
                  Adeshina IA
                  <span className="rounded-full bg-[#10B981]/25 px-2 py-0.5 text-[10px] font-semibold text-[#10B981]">
                    En ligne
                  </span>
                </p>
                <p className="text-[10px] text-slate-300">
                  Guide visiteur & créateur
                </p>
              </div>
            </button>
          </>
        )}
      </div>


      {/* Fenêtre Adeshina IA */}
      {open && (
        <div className="animate-modal-in fixed bottom-5 right-4 z-50 flex max-h-[84vh] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl sm:right-6">
          {/* Header */}
          <div className="bg-[#102A43] p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981] text-white shadow-xs">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">
                      Adeshina IA
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/20 px-2 py-0.5 text-[10px] font-semibold text-[#10B981]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" />
                      Actif
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Copilote e-commerce EcomSate
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label="Fermer Adeshina IA"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Switcher de mode */}
            <div className="mt-3.5 grid grid-cols-2 gap-1.5 rounded-xl bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setMode("chat")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  mode === "chat"
                    ? "bg-[#10B981] text-white shadow-xs"
                    : "text-slate-200 hover:text-white"
                }`}
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                Comprendre le site
              </button>
              <button
                type="button"
                onClick={() => setMode("builder")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  mode === "builder"
                    ? "bg-[#10B981] text-white shadow-xs"
                    : "text-slate-200 hover:text-white"
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Créer ma boutique IA
              </button>
            </div>
          </div>

          {/* Contenu selon le mode */}
          {mode === "chat" ? (
            <div key="chat" className="animate-tab-panel flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto bg-[#F8FAFC] p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`animate-page-enter flex flex-col ${
                      m.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                        m.sender === "user"
                          ? "bg-[#102A43] text-white"
                          : "border border-[#E2E8F0] bg-white text-[#1E293B] shadow-2xs"
                      }`}
                    >
                      {m.sender === "user" ? (
                        m.text
                      ) : (
                        <FormattedAiText text={m.text} />
                      )}
                    </div>

                    {m.ctaLabel && m.ctaHref && (
                      <Link
                        href={m.ctaHref}
                        onClick={() => setOpen(false)}
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#059669]"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {m.ctaLabel}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 w-fit shadow-2xs">
                    <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                  </div>
                )}

                <div ref={scrollEndRef} />
              </div>

              {/* Barre horizontale compacte de suggestions rapides (ne pousse plus les réponses sur mobile) */}
              <div className="flex gap-1.5 overflow-x-auto border-t border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 no-scrollbar">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="shrink-0 rounded-full border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#102A43] transition-colors hover:border-[#10B981] hover:text-[#10B981] cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>


              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2 border-t border-[#E2E8F0] bg-white p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question à Adeshina IA..."
                  className="h-10 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-xs text-[#1E293B] transition-colors focus:border-[#102A43] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981] text-white transition-transform hover:bg-[#059669] active:scale-95 cursor-pointer"
                  aria-label="Envoyer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <div
              key="builder"
              className="animate-tab-panel flex-1 space-y-4 overflow-y-auto bg-[#F8FAFC] p-4"
            >
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5">
                <p className="text-xs font-bold text-[#102A43]">
                  1. Choisissez votre secteur d&apos;activité
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ADESHINA_SECTORS.map((sec) => (
                    <button
                      key={sec.sectorId}
                      type="button"
                      onClick={() => setSelectedSector(sec.sectorId)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        selectedSector === sec.sectorId
                          ? "bg-[#102A43] text-white shadow-2xs"
                          : "border border-[#E2E8F0] bg-[#F8FAFC] text-slate-700 hover:border-[#102A43]"
                      }`}
                    >
                      {sec.sectorLabel.split(",")[0]}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-xs font-bold text-[#102A43]">
                  2. Nom souhaité (ou laissez Adeshina IA proposer)
                </p>
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={`Ex : ${blueprint.suggestedName}`}
                  className="mt-1.5 h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs focus:border-[#102A43] focus:outline-none"
                />
              </div>

              <div
                key={blueprint.sectorId}
                className="animate-tab-panel rounded-xl border border-[#10B981]/30 bg-white p-4 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10B981]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Proposition Adeshina IA
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {blueprint.subdomain}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-extrabold text-[#102A43]">
                  {blueprint.suggestedName}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {blueprint.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {blueprint.categories.map((c) => (
                    <span
                      key={c.name}
                      className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-medium text-[#102A43]"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>

                <div className="mt-3 space-y-1.5 border-t border-[#E2E8F0] pt-2.5">
                  <p className="text-[11px] font-semibold text-slate-500">
                    Produits pré-configurés par Adeshina IA :
                  </p>
                  {blueprint.sampleProducts.slice(0, 2).map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="truncate font-medium text-[#102A43]">
                        {p.name}
                      </span>
                      <span className="font-bold text-[#10B981]">
                        {formatCurrency(p.promoPrice ?? p.price)}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/creer-une-boutique?sector=${
                    blueprint.sectorId
                  }&storeName=${encodeURIComponent(blueprint.suggestedName)}`}
                  onClick={() => setOpen(false)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] py-2.5 text-xs font-bold text-white transition-all hover:bg-[#059669] active:scale-98"
                >
                  <Store className="h-4 w-4" />
                  Lancer cette boutique maintenant
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
