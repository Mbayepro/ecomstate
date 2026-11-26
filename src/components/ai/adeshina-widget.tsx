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
  "Formulaire 100 % COD",
  "Thèmes Shrine Pro 1 & 3",
  "Livreurs & Bénéfice réel",
  "Tarifs Standard & Premium",
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

  // Masquer le widget sur les boutiques clientes (/s/...), le dashboard marchand (/dashboard), l'admin (/admin) et les pages d'authentification (/creer-une-boutique, /connexion)
  if (
    dismissed ||
    pathname?.startsWith("/s/") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/creer-une-boutique") ||
    pathname?.startsWith("/connexion")
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
      {/* Bouton flottant Adeshina IA (Style Shopify/Intercom ultra-net) */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center">
        {!open && (
          <div className="group relative flex items-center">
            {/* Bouton d'ouverture principal */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-3 rounded-full border border-emerald-500/30 bg-gradient-to-r from-[#073B35] to-[#0a4d45] py-2.5 pl-3 pr-4 text-white shadow-[0_12px_32px_-6px_rgba(7,59,53,0.55)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00A884] hover:shadow-[0_18px_40px_-6px_rgba(0,168,132,0.45)] active:scale-98 cursor-pointer ring-2 ring-emerald-500/20"
            >
              {/* Ping glow beacon */}
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00A884] to-[#073B35] text-white shadow-inner">
                <Sparkles className="h-4 w-4 text-[#E7F7F2]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00A884] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00A884] ring-1.5 ring-white" />
                </span>
              </span>

              <div className="text-left">
                <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-white">
                  Adeshina IA
                  <span className="rounded-full bg-[#00A884]/25 px-2 py-0.5 text-[10px] font-bold text-[#7CE3C8]">
                    En ligne
                  </span>
                </p>
                <p className="text-[10px] text-slate-300 font-medium">
                  Guide visiteur & créateur
                </p>
              </div>
            </button>

            {/* Micro bouton discret de masquage au hover */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/90 text-white/70 opacity-0 shadow-md backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100 hover:bg-slate-900 hover:text-white cursor-pointer ring-1 ring-white/20"
              title="Masquer Adeshina IA"
              aria-label="Masquer Adeshina IA"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>


      {/* Fenêtre Adeshina IA */}
      {open && (
        <div className="animate-modal-in fixed bottom-5 right-4 z-50 flex h-[540px] max-h-[85vh] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl sm:right-6">
          {/* Header (shrink-0 pour ne jamais être écrasé) */}
          <div className="shrink-0 bg-[#073B35] p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A884] text-white shadow-xs">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">
                      Adeshina IA
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#00A884]/25 px-2 py-0.5 text-[10px] font-semibold text-[#E7F7F2]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00A884]" />
                      Actif
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Copilote e-commerce COD EcomSate
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
                    ? "bg-[#00A884] text-white shadow-xs"
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
                    ? "bg-[#00A884] text-white shadow-xs"
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
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F8FAFC] p-4">
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
                          ? "bg-[#073B35] text-white"
                          : "border border-[#E2E8F0] bg-white text-[#15232D] shadow-2xs"
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
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-[#00A884] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#073B35]"
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
                    <span className="typing-dot h-2 w-2 rounded-full bg-[#00A884]" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-[#00A884]" />
                    <span className="typing-dot h-2 w-2 rounded-full bg-[#00A884]" />
                  </div>
                )}

                <div ref={scrollEndRef} />
              </div>

              {/* Suggestions rapides en grille flex-wrap bien visible (zéro barre de défilement horizontale qui coupe le texte) */}
              <div className="shrink-0 flex flex-wrap gap-1.5 border-t border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#15232D] transition-colors hover:border-[#00A884] hover:bg-[#E7F7F2] hover:text-[#073B35] cursor-pointer"
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
                className="shrink-0 flex items-center gap-2 border-t border-[#E2E8F0] bg-white p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question à Adeshina IA..."
                  className="h-10 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-xs text-[#15232D] transition-colors focus:border-[#00A884] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00A884] text-white transition-transform hover:bg-[#073B35] active:scale-95 cursor-pointer"
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
                <p className="text-xs font-bold text-[#073B35]">
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
                          ? "bg-[#073B35] text-white shadow-2xs"
                          : "border border-[#E2E8F0] bg-[#F8FAFC] text-slate-700 hover:border-[#073B35]"
                      }`}
                    >
                      {sec.sectorLabel.split(",")[0]}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-xs font-bold text-[#073B35]">
                  2. Nom souhaité (ou laissez Adeshina IA proposer)
                </p>
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={`Ex : ${blueprint.suggestedName}`}
                  className="mt-1.5 h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs focus:border-[#073B35] focus:outline-none"
                />
              </div>

              <div
                key={blueprint.sectorId}
                className="animate-tab-panel rounded-xl border border-[#00A884]/30 bg-white p-4 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00A884]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Proposition Adeshina IA
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {blueprint.subdomain}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-extrabold text-[#073B35]">
                  {blueprint.suggestedName}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {blueprint.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {blueprint.categories.map((c) => (
                    <span
                      key={c.name}
                      className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-medium text-[#073B35]"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>

                <div className="mt-3 space-y-1.5 border-t border-[#E2E8F0] pt-2.5 text-xs">
                  <p className="text-[11px] font-semibold text-slate-500">
                    Configuration prête à l&apos;emploi :
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Thème vitrine :</span>
                    <span className="font-bold text-[#073B35]">Shrine Pro 1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Formulaire client :</span>
                    <span className="font-bold text-[#00A884]">100 % COD</span>
                  </div>
                </div>

                <Link
                  href={`/creer-une-boutique?sector=${
                    blueprint.sectorId
                  }&storeName=${encodeURIComponent(blueprint.suggestedName)}`}
                  onClick={() => setOpen(false)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A884] py-2.5 text-xs font-bold text-white transition-all hover:bg-[#008F6F] active:scale-98"
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
