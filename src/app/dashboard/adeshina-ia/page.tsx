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
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormattedAiText } from "@/components/ui/formatted-ai-text";

import { DashboardPageHeader } from "@/components/dashboard/page-header";
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

const SKILLS: {
  intent: CopilotIntent;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    intent: "analyze_sales",
    label: "Analyser mes ventes",
    desc: "Chiffre d'affaires, panier moyen et canal favori",
    icon: BarChart3,
  },
  {
    intent: "popular_products",
    label: "Produits populaires",
    desc: "Classement réel de vos meilleures ventes",
    icon: TrendingUp,
  },
  {
    intent: "low_stock",
    label: "Signaler les stocks faibles",
    desc: "Ruptures immédiates et seuils critiques",
    icon: AlertTriangle,
  },
  {
    intent: "summarize_orders",
    label: "Résumer les commandes",
    desc: "État des commandes et clients en attente",
    icon: ShoppingBag,
  },
  {
    intent: "advise_merchant",
    label: "Conseiller ma boutique",
    desc: "Recommandations concrètes selon votre offre",
    icon: Lightbulb,
  },
];

export default function DashboardAdeshinaIAPage() {
  const {
    activeStore,
    products,
    categories,
    orders,
    customers,
    modules,
    saveProduct,
  } = usePlatform();

  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [thread, setThread] = useState<ThreadItem[]>([]);

  // Studio création fiche produit
  const [prodName, setProdName] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodPromo, setProdPromo] = useState("");
  const [prodVariants, setProdVariants] = useState("");
  const [published, setPublished] = useState(false);

  if (!activeStore) return null;

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
    }, 240);
  };

  const handleGenerateSheet = () => {
    if (!prodName.trim()) return;
    const gen = generateProductCopyWithAdeshina(prodName);
    setProdDesc(gen.description);
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
    setTimeout(() => setPublished(false), 3000);
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Assistant intelligent intégré"
        title="Adeshina IA"
        description={`Votre collaborateur dédié à l'analyse des ventes, au suivi des stocks et à la création de fiches produits pour ${activeStore.name}.`}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Colonne 1 : Analyse & Dialogue métier (7 cols) */}
        <Card className="flex flex-col border-[#E2E8F0] bg-white lg:col-span-7">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102A43] text-white">
                <Bot className="h-4.5 w-4.5 text-[#10B981]" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-[#102A43]">
                  Diagnostic & Conseils en temps réel
                </h2>
                <p className="text-xs text-slate-500">
                  Basé exclusivement sur vos vraies données ({storeOrders.length}{" "}
                  cmd · {storeProducts.length} produits)
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col justify-between space-y-5 p-5">
            {/* Grille des compétences */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {SKILLS.map((sk) => {
                const Icon = sk.icon;
                return (
                  <button
                    key={sk.intent}
                    type="button"
                    onClick={() => invokeCollaborator(sk.intent, sk.label)}
                    className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-left transition-all hover:border-[#10B981] hover:bg-white cursor-pointer"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#10B981] shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#102A43]">
                        {sk.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {sk.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Fil de réponses */}
            <div className="min-h-56 space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              {thread.length === 0 && !thinking && (
                <div className="py-12 text-center text-xs text-slate-500">
                  Cliquez sur l&apos;une des missions ci-dessus ou posez votre
                  question à Adeshina IA.
                </div>
              )}

              {thread.map((msg) =>
                msg.role === "merchant" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-[#102A43] px-3.5 py-2 text-xs font-medium text-white">
                      {msg.body}
                    </div>
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className="animate-tab-panel rounded-2xl border border-[#E2E8F0] bg-white p-4 text-xs shadow-2xs"
                  >
                    {msg.title && (
                      <p className="font-extrabold text-[#102A43]">
                        {msg.title}
                      </p>
                    )}
                    <p className="mt-1.5 leading-relaxed text-slate-700 whitespace-pre-line">
                      <FormattedAiText text={msg.body} />
                    </p>

                    {msg.actionLabel && msg.actionHref && (
                      <Link
                        href={msg.actionHref}
                        className="mt-3 inline-flex items-center gap-1.5 font-bold text-[#10B981] hover:underline"
                      >
                        {msg.actionLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                )
              )}

              {thinking && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                  <span>Analyse en cours...</span>
                </div>
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
                placeholder="Posez votre question (ex: fais un point sur mes commandes et mes stocks)..."
                className="h-10.5 flex-1 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs focus:border-[#102A43] focus:outline-none"
              />
              <Button type="submit" variant="primary" size="md">
                <Send className="h-4 w-4" />
                Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Colonne 2 : Studio Fiche Produit assisté (5 cols) */}
        <Card className="border-[#E2E8F0] bg-white lg:col-span-5">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <FilePlus2 className="h-4.5 w-4.5 text-[#10B981]" />
              <div>
                <h2 className="text-sm font-extrabold text-[#102A43]">
                  Studio Fiche Produit IA
                </h2>
                <p className="text-xs text-slate-500">
                  Générez et publiez un produit en quelques secondes
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <form onSubmit={handlePublishProduct} className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="Nom du produit"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Ex: Sandales Cuir Dakar"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerateSheet}
                >
                  <Sparkles className="h-4 w-4 text-[#10B981]" />
                  Générer
                </Button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#102A43]">
                  Catégorie
                </label>
                <select
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm"
                >
                  {storeCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={`Prix (${activeStore.currency})`}
                  type="number"
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="25000"
                />
                <Input
                  label="Prix promo"
                  type="number"
                  value={prodPromo}
                  onChange={(e) => setProdPromo(e.target.value)}
                  placeholder="21000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#102A43]">
                  Description générée
                </label>
                <textarea
                  rows={4}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Cliquez sur « Générer » après avoir saisi le nom..."
                  className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-xs leading-relaxed focus:border-[#102A43] focus:outline-none"
                />
              </div>

              <Input
                label="Variantes suggérées"
                value={prodVariants}
                onChange={(e) => setProdVariants(e.target.value)}
                placeholder="Pointure:40, Pointure:42"
              />

              {published && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  Fiche publiée dans votre catalogue ({formatCurrency(Number(prodPromo || prodPrice), activeStore.currency)}) !
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={limitReached || !prodName.trim()}
              >
                {limitReached
                  ? `Limite atteinte (${maxProducts} produits max)`
                  : "Ajouter ce produit à ma boutique"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
