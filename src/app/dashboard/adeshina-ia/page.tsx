"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Calculator,
  Check,
  FilePlus2,
  FormInput,
  MessageSquare,
  Send,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormattedAiText } from "@/components/ui/formatted-ai-text";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { applyAdeshinaToCodDraft } from "@/lib/cod-form-presets";
import { getModuleLimit } from "@/lib/permissions";
import {
  generateProductCopyWithAdeshina,
  runAdeshinaMerchantCollaborator,
  type CopilotIntent,
  type CopilotResponse,
} from "@/lib/adeshina-merchant-copilot";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/utils";

interface ThreadItem {
  id: string;
  role: "merchant" | "adeshina";
  title?: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}

type AiWorkspaceTab = "ask" | "product" | "form";

const QUICK_QUESTIONS: {
  intent: CopilotIntent;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    intent: "profit_and_couriers",
    label: "Mon bénéfice réel & cash livreurs",
    icon: Calculator,
  },
  {
    intent: "analyze_sales",
    label: "Bilan de mes ventes livrées",
    icon: BarChart3,
  },
  {
    intent: "popular_products",
    label: "Mes produits les plus rentables",
    icon: TrendingUp,
  },
  {
    intent: "low_stock",
    label: "Vérifier mes alertes de stock",
    icon: AlertTriangle,
  },
  {
    intent: "summarize_orders",
    label: "Commandes à confirmer aujourd'hui",
    icon: ShoppingBag,
  },
];

export default function DashboardAdeshinaIAPage() {
  const {
    activeStore,
    products,
    categories,
    orders,
    customers,
    couriers,
    expenses,
    adCampaigns,
    modules,
    saveProduct,
    getStoreCodForm,
    saveCodFormDraft,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<AiWorkspaceTab>("ask");
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [thread, setThread] = useState<ThreadItem[]>([]);

  // Onglet 2 : Créer un produit avec l'IA
  const [prodName, setProdName] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodCost, setProdCost] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodPromo, setProdPromo] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodVariants, setProdVariants] = useState("");
  const [published, setPublished] = useState(false);

  // Onglet 3 : Modifier mon formulaire COD (sur brouillon uniquement)
  const [codInstruction, setCodInstruction] = useState("");
  const [codDraftFeedback, setCodDraftFeedback] = useState<string | null>(null);

  if (!activeStore) return null;

  const storeProducts = products.filter((p) => p.storeId === activeStore.id);
  const storeCategories = categories.filter(
    (c) => c.storeId === activeStore.id
  );
  const storeOrders = orders.filter((o) => o.storeId === activeStore.id);
  const storeCustomers = customers.filter((c) => c.storeId === activeStore.id);
  const storeCouriers = (couriers ?? []).filter(
    (c) => c.storeId === activeStore.id
  );
  const storeExpenses = (expenses ?? []).filter(
    (e) => e.storeId === activeStore.id
  );
  const storeCampaigns = (adCampaigns ?? []).filter(
    (c) => c.storeId === activeStore.id
  );

  const maxProducts = getModuleLimit(
    activeStore.planCode,
    "products_catalog",
    modules
  );
  const limitReached =
    maxProducts !== null && storeProducts.length >= maxProducts;

  const invokeCollaborator = (
    intent: CopilotIntent,
    userLabel: string,
    freeText?: string
  ) => {
    setThread((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "merchant", body: userLabel },
    ]);
    setThinking(true);

    setTimeout(() => {
      const res: CopilotResponse = runAdeshinaMerchantCollaborator(
        intent,
        {
          store: activeStore,
          products: storeProducts,
          categories: storeCategories,
          orders: storeOrders,
          customers: storeCustomers,
          couriers: storeCouriers,
          expenses: storeExpenses,
          adCampaigns: storeCampaigns,
          modules,
        },
        freeText
      );
      setThread((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "adeshina",
          title: res.title,
          body: res.body,
          actionLabel: res.actionLabel,
          actionHref: res.actionHref,
        },
      ]);
      setThinking(false);
    }, 180);
  };

  const handleGenerateSheet = () => {
    if (!prodName.trim()) return;
    const gen = generateProductCopyWithAdeshina(prodName);
    setProdDesc(gen.description);
    setProdCost(String(gen.suggestedCostPrice));
    setProdPrice(String(gen.suggestedPrice));
    setProdPromo(String(gen.suggestedPromoPrice));
    setProdVariants(gen.suggestedVariants);
    if (!prodCategoryId && storeCategories[0]) {
      setProdCategoryId(storeCategories[0].id);
    }
    setPublished(false);
  };

  const handlePublishProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || limitReached) return;

    const parsedVariants = prodVariants
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
      name: prodName.trim(),
      categoryId: prodCategoryId || storeCategories[0]?.id || "",
      description: prodDesc.trim(),
      costPrice: Number(prodCost) || 0,
      price: Number(prodPrice) || 0,
      promoPrice: prodPromo ? Number(prodPromo) : null,
      stock: 10,
      lowStockThreshold: 5,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      ],
      variants: parsedVariants,
      isActive: true,
      isPopular: false,
    });

    setPublished(true);
    setTimeout(() => setPublished(false), 3500);
  };

  const handlePrepareCodDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codInstruction.trim()) return;
    const current = getStoreCodForm(activeStore.id);
    const updated = applyAdeshinaToCodDraft(
      codInstruction,
      current.draftFields,
      current.draftStyle
    );
    saveCodFormDraft(activeStore.id, updated.nextFields, updated.nextStyle);
    setCodDraftFeedback(updated.summary);
    setCodInstruction("");
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Assistant intelligent de votre boutique"
        title="Adeshina IA"
        description="Choisissez ci-dessous ce que vous souhaitez demander à votre assistant aujourd'hui :"
      />

      {/* SÉLECTEUR SIMPLE EN 3 CARTES-BOUTONS (UN SEUL OUTIL AFFICHÉ À LA FOIS) */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setActiveTab("ask")}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
            activeTab === "ask"
              ? "border-[#00A884] bg-[#073B35] text-white shadow-xs"
              : "border-[#E2E8F0] bg-white text-[#15232D] hover:border-[#00A884]"
          }`}
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              activeTab === "ask"
                ? "bg-[#00A884] text-white"
                : "bg-[#E7F7F2] text-[#073B35]"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold">1. Poser une question</p>
            <p
              className={`mt-0.5 text-xs ${
                activeTab === "ask" ? "text-[#E7F7F2]" : "text-slate-500"
              }`}
            >
              Bénéfice, ventes, livreurs et stocks
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("product")}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
            activeTab === "product"
              ? "border-[#00A884] bg-[#073B35] text-white shadow-xs"
              : "border-[#E2E8F0] bg-white text-[#15232D] hover:border-[#00A884]"
          }`}
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              activeTab === "product"
                ? "bg-[#00A884] text-white"
                : "bg-[#E7F7F2] text-[#073B35]"
            }`}
          >
            <FilePlus2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold">2. Créer un produit</p>
            <p
              className={`mt-0.5 text-xs ${
                activeTab === "product" ? "text-[#E7F7F2]" : "text-slate-500"
              }`}
            >
              L&apos;IA rédige la description et calcule le prix
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
            activeTab === "form"
              ? "border-[#00A884] bg-[#073B35] text-white shadow-xs"
              : "border-[#E2E8F0] bg-white text-[#15232D] hover:border-[#00A884]"
          }`}
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              activeTab === "form"
                ? "bg-[#00A884] text-white"
                : "bg-[#E7F7F2] text-[#073B35]"
            }`}
          >
            <FormInput className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold">3. Adapter mon formulaire</p>
            <p
              className={`mt-0.5 text-xs ${
                activeTab === "form" ? "text-[#E7F7F2]" : "text-slate-500"
              }`}
            >
              Ajouter un champ ou une offre pack en 1 phrase
            </p>
          </div>
        </button>
      </div>

      {/* OUTIL 1 : POSER UNE QUESTION SUR MES CHIFFRES */}
      {activeTab === "ask" && (
        <Card className="border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#073B35] text-white">
                <Bot className="h-4.5 w-4.5 text-[#00A884]" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-[#15232D]">
                  Discuter avec Adeshina IA
                </h2>
                <p className="text-xs text-slate-500">
                  Cliquez sur une question rapide ci-dessous ou écrivez votre
                  question
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            {/* Boutons de questions rapides en pilules simples */}
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.intent}
                    type="button"
                    onClick={() => invokeCollaborator(q.intent, q.label)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-bold text-[#15232D] transition hover:border-[#00A884] hover:bg-[#E7F7F2]/50 cursor-pointer"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#00A884]" />
                    {q.label}
                  </button>
                );
              })}
            </div>

            {/* Zone de réponse épurée */}
            <div className="min-h-52 space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              {thread.length === 0 && !thinking && (
                <div className="py-12 text-center text-xs text-slate-500">
                  Cliquez sur l&apos;un des boutons ci-dessus pour obtenir le
                  bilan instantané de <strong>{activeStore.name}</strong>.
                </div>
              )}

              {thread.map((msg) =>
                msg.role === "merchant" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-[#073B35] px-4 py-2 text-xs font-semibold text-white">
                      {msg.body}
                    </div>
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-xs shadow-2xs"
                  >
                    {msg.title && (
                      <p className="text-sm font-extrabold text-[#15232D]">
                        {msg.title}
                      </p>
                    )}
                    <div className="mt-1.5 leading-relaxed text-slate-700">
                      <FormattedAiText text={msg.body} />
                    </div>

                    {msg.actionLabel && msg.actionHref && (
                      <Link
                        href={msg.actionHref}
                        className="mt-3 inline-flex items-center gap-1.5 font-bold text-[#00A884] hover:underline"
                      >
                        {msg.actionLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                )
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!question.trim()) return;
                const q = question.trim();
                setQuestion("");
                invokeCollaborator("free_question", q, q);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Écrivez votre question ici (ex : Quel est mon bénéfice net ?)"
                className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs focus:border-[#00A884] focus:outline-none"
              />
              <Button type="submit" variant="primary" size="md">
                <Send className="h-4 w-4" />
                Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* OUTIL 2 : CRÉER UN PRODUIT AVEC L'IA */}
      {activeTab === "product" && (
        <Card className="mx-auto max-w-2xl border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] px-6 py-4">
            <h2 className="text-base font-extrabold text-[#15232D]">
              Créer une fiche produit avec Adeshina IA
            </h2>
            <p className="text-xs text-slate-500">
              Étape 1 : Entrez le nom du produit et cliquez sur « Remplir avec
              l&apos;IA ». Étape 2 : Vérifiez et publiez.
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handlePublishProduct} className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    label="Nom du produit à vendre"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Ex : Montre Classique Homme ou Crème Karité"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerateSheet}
                >
                  <Sparkles className="h-4 w-4 text-[#00A884]" />
                  Remplir avec l&apos;IA
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Coût d'achat (FCFA)"
                  type="number"
                  value={prodCost}
                  onChange={(e) => setProdCost(e.target.value)}
                />
                <Input
                  label="Prix de vente (FCFA)"
                  type="number"
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                />
                <Input
                  label="Prix promo (optionnel)"
                  type="number"
                  value={prodPromo}
                  onChange={(e) => setProdPromo(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#15232D]">
                  Description pour vos clients
                </label>
                <textarea
                  rows={3}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Cliquez sur « Remplir avec l'IA » pour générer la description..."
                  className="w-full rounded-xl border border-[#E2E8F0] p-3 text-xs"
                />
              </div>

              <Input
                label="Tailles ou options (ex : Taille: M, Taille: L)"
                value={prodVariants}
                onChange={(e) => setProdVariants(e.target.value)}
              />

              {published && (
                <div className="flex items-center gap-2 rounded-xl bg-[#E7F7F2] p-3 text-xs font-bold text-[#073B35]">
                  <Check className="h-4 w-4 text-[#00A884]" />
                  Produit ajouté à votre catalogue (
                  {formatCurrency(
                    Number(prodPromo || prodPrice),
                    activeStore.currency
                  )}
                  ) !
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={limitReached || !prodName.trim()}
              >
                Ajouter ce produit à ma boutique
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* OUTIL 3 : ADAPTER MON FORMULAIRE COD */}
      {activeTab === "form" && (
        <Card className="mx-auto max-w-2xl border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] px-6 py-4">
            <h2 className="text-base font-extrabold text-[#15232D]">
              Adapter mon formulaire de commande COD
            </h2>
            <p className="text-xs text-slate-500">
              Dites en une phrase ce que vous voulez ajouter ou modifier. L&apos;IA
              prépare un brouillon que vous pourrez vérifier avant publication.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            <form onSubmit={handlePrepareCodDraft} className="space-y-3">
              <input
                value={codInstruction}
                onChange={(e) => setCodInstruction(e.target.value)}
                placeholder="Ex : Ajoute un champ quartier et un point de repère pour le livreur"
                className="h-11 w-full rounded-xl border border-[#E2E8F0] px-4 text-xs focus:border-[#00A884] focus:outline-none"
              />
              <Button type="submit" size="md" variant="primary">
                <Sparkles className="h-4 w-4" />
                Préparer la modification dans le brouillon
              </Button>
            </form>

            {codDraftFeedback && (
              <div className="rounded-2xl border border-[#00A884]/30 bg-[#E7F7F2] p-4 text-xs text-[#073B35]">
                <p className="font-bold">{codDraftFeedback}</p>
                <Link
                  href="/dashboard/form-builder"
                  className="mt-2 inline-flex items-center gap-1 font-extrabold text-[#00A884] underline"
                >
                  Ouvrir le Form Builder pour vérifier et publier →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
