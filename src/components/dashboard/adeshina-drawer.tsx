"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  FilePlus2,
  Lightbulb,
  Send,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/lib/platform-store";
import { getModuleLimit } from "@/lib/permissions";
import {
  generateProductCopyWithAdeshina,
  runAdeshinaMerchantCollaborator,
  type CopilotIntent,
  type CopilotResponse,
} from "@/lib/adeshina-merchant-copilot";
import { formatCurrency } from "@/lib/utils";

const COLLABORATOR_SKILLS: {
  intent: CopilotIntent;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { intent: "analyze_sales", label: "Analyser mes ventes", icon: BarChart3 },
  {
    intent: "popular_products",
    label: "Produits populaires",
    icon: TrendingUp,
  },
  { intent: "low_stock", label: "Stocks faibles", icon: AlertTriangle },
  {
    intent: "summarize_orders",
    label: "Résumer les commandes",
    icon: ShoppingBag,
  },
  {
    intent: "advise_merchant",
    label: "Conseils boutique",
    icon: Lightbulb,
  },
];

export function AdeshinaCollaboratorDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    activeStore,
    products,
    categories,
    orders,
    customers,
    modules,
    saveProduct,
  } = usePlatform();

  const [tab, setTab] = useState<"assistant" | "product_drafter">("assistant");
  const [question, setQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState<CopilotResponse | null>(null);

  // Créateur rapide de fiche produit par IA
  const [draftName, setDraftName] = useState("");
  const [draftGenerated, setDraftGenerated] = useState<{
    description: string;
    price: number;
    promoPrice: number;
    variants: string;
  } | null>(null);
  const [productCreated, setProductCreated] = useState(false);

  if (!open || !activeStore) return null;

  const storeProducts = products.filter((p) => p.storeId === activeStore.id);
  const storeCategories = categories.filter(
    (c) => c.storeId === activeStore.id
  );
  const storeOrders = orders.filter((o) => o.storeId === activeStore.id);
  const storeCustomers = customers.filter((c) => c.storeId === activeStore.id);

  const maxProducts = getModuleLimit(
    activeStore.planCode,
    "products_catalog",
    modules
  );
  const limitReached =
    maxProducts !== null && storeProducts.length >= maxProducts;

  const triggerIntent = (intent: CopilotIntent, text?: string) => {
    setIsThinking(true);
    setTimeout(() => {
      const res = runAdeshinaMerchantCollaborator(
        intent,
        {
          store: activeStore,
          products: storeProducts,
          categories: storeCategories,
          orders: storeOrders,
          customers: storeCustomers,
          modules,
        },
        text
      );
      setResponse(res);
      setIsThinking(false);
    }, 240);
  };

  const handleGenerateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;
    const gen = generateProductCopyWithAdeshina(draftName);
    setDraftGenerated({
      description: gen.description,
      price: gen.suggestedPrice,
      promoPrice: gen.suggestedPromoPrice,
      variants: gen.suggestedVariants,
    });
    setProductCreated(false);
  };

  const handlePublishDraft = () => {
    if (!draftGenerated || !draftName.trim() || limitReached) return;
    const parsedVariants = draftGenerated.variants
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair, idx) => {
        const [vName, vVal] = pair.split(":").map((x) => x.trim());
        return {
          id: `v-${Date.now()}-${idx}`,
          name: vName || "Option",
          value: vVal || "Standard",
          stock: 5,
        };
      });

    saveProduct(activeStore.id, {
      name: draftName.trim(),
      categoryId: storeCategories[0]?.id ?? "",
      description: draftGenerated.description,
      price: draftGenerated.price,
      promoPrice: draftGenerated.promoPrice,
      stock: 10,
      lowStockThreshold: 5,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      ],
      variants: parsedVariants,
      isActive: true,
      isPopular: false,
    });

    setProductCreated(true);
  };

  return (
    <div className="animate-backdrop fixed inset-0 z-50 flex justify-end bg-[#0B1F33]/45 backdrop-blur-xs">
      <div className="animate-drawer-in flex h-full w-full max-w-md flex-col border-l border-[#E2E8F0] bg-white shadow-2xl">
        {/* En-tête */}
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102A43] text-white shadow-xs">
                <Bot className="h-5 w-5 text-[#10B981]" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-[#102A43]">
                    Adeshina IA
                  </h2>
                  <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
                    Collaborateur
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Connecté aux données de {activeStore.name}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-[#102A43] cursor-pointer"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-1.5 rounded-xl border border-[#E2E8F0] bg-white p-1">
            <button
              type="button"
              onClick={() => setTab("assistant")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                tab === "assistant"
                  ? "bg-[#102A43] text-white"
                  : "text-slate-600 hover:text-[#102A43]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
              Analyse & Conseils
            </button>
            <button
              type="button"
              onClick={() => setTab("product_drafter")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                tab === "product_drafter"
                  ? "bg-[#102A43] text-white"
                  : "text-slate-600 hover:text-[#102A43]"
              }`}
            >
              <FilePlus2 className="h-3.5 w-3.5 text-[#10B981]" />
              Créer fiche produit
            </button>
          </div>
        </div>

        {/* Corps du panneau */}
        {tab === "assistant" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Actions rapides sur votre boutique
                </p>
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {COLLABORATOR_SKILLS.map((skill) => {
                    const Icon = skill.icon;
                    return (
                      <button
                        key={skill.intent}
                        type="button"
                        onClick={() => triggerIntent(skill.intent)}
                        className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-left text-xs font-semibold text-[#102A43] transition-all hover:border-[#10B981] hover:bg-white cursor-pointer"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[#10B981]" />
                        <span>{skill.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isThinking && (
                <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs text-slate-500">
                  <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                  <span>Analyse des données de votre boutique...</span>
                </div>
              )}

              {!isThinking && response && (
                <div className="animate-tab-panel rounded-2xl border border-[#10B981]/30 bg-[#F8FAFC] p-4">
                  <p className="text-xs font-extrabold text-[#102A43]">
                    {response.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                    {response.body}
                  </p>
                  {response.actionLabel && response.actionHref && (
                    <Link
                      href={response.actionHref}
                      onClick={onClose}
                      className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#102A43] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1B3B5A]"
                    >
                      {response.actionLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )}

              {!isThinking && !response && (
                <div className="rounded-xl border border-dashed border-[#E2E8F0] p-4 text-xs leading-relaxed text-slate-500">
                  Sélectionnez une compétence ci-dessus ou posez une question
                  pour qu&apos;Adeshina IA inspecte vos ventes, vos commandes en
                  attente ou vos niveaux de stock.
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!question.trim()) return;
                const q = question.trim();
                setQuestion("");
                triggerIntent("free_question", q);
              }}
              className="flex items-center gap-2 border-t border-[#E2E8F0] bg-white p-4"
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Quel est mon produit le plus vendu ?"
                className="h-10 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-xs focus:border-[#102A43] focus:bg-white focus:outline-none"
              />
              <Button type="submit" variant="primary" size="sm">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <form onSubmit={handleGenerateDraft} className="space-y-3">
              <Input
                label="Nom de l'article à créer"
                required
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Ex: Ensemble Bazin Brodé Prestige"
              />
              <Button type="submit" variant="secondary" className="w-full">
                <Sparkles className="h-4 w-4 text-[#10B981]" />
                Générer la fiche complète
              </Button>
            </form>

            {draftGenerated && (
              <div className="animate-tab-panel space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#102A43]">{draftName}</span>
                  <span className="font-extrabold text-[#10B981]">
                    {formatCurrency(
                      draftGenerated.promoPrice,
                      activeStore.currency
                    )}
                  </span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  {draftGenerated.description}
                </p>
                <p className="text-[11px] text-slate-500">
                  <strong>Variantes :</strong> {draftGenerated.variants}
                </p>

                {productCreated ? (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-800">
                    <Check className="h-4 w-4 text-[#10B981]" />
                    Produit ajouté dans votre catalogue !
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full"
                    disabled={limitReached}
                    onClick={handlePublishDraft}
                  >
                    {limitReached
                      ? "Limite de produits atteinte sur votre offre"
                      : "Publier directement dans mes produits"}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
