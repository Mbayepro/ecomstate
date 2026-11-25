"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Clock,
  Lightbulb,
  Send,
  ShoppingBag,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormattedAiText } from "@/components/ui/formatted-ai-text";

import {
  runAdeshinaMerchantCollaborator,
  type CopilotIntent,
  type CopilotResponse,
} from "@/lib/adeshina-merchant-copilot";
import { formatCurrency } from "@/lib/utils";
import type {
  Category,
  Customer,
  ModulePermission,
  Order,
  Product,
  Store,
} from "@/types/domain";

const QUICK_SKILLS: {
  intent: CopilotIntent;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { intent: "analyze_sales", label: "Analyser les ventes", icon: BarChart3 },
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
  { intent: "advise_merchant", label: "Conseils", icon: Lightbulb },
];

export function AdeshinaCopilotPanel({
  store,
  products,
  categories,
  orders,
  customers,
  modules,
}: {
  store: Store;
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  modules: ModulePermission[];
}) {
  const [activeIntent, setActiveIntent] = useState<CopilotIntent | null>(null);
  const [customReply, setCustomReply] = useState<CopilotResponse | null>(null);
  const [question, setQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // 3 cartes proactives calculées 100 % sur les données réelles
  const cards = useMemo(() => {
    const waiting = orders.filter(
      (o) => o.status === "new" || o.status === "pending_confirmation"
    );
    const waitingTotal = waiting.reduce((s, o) => s + o.totalAmount, 0);

    const outOfStock = products.filter((p) => p.stock === 0);
    const lowStock = products.filter(
      (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
    );

    const promoCount = products.filter((p) => Boolean(p.promoPrice)).length;

    return [
      waiting.length > 0
        ? {
            id: "orders",
            badge: "Prioritaire",
            tone: "border-amber-200 bg-amber-50/40",
            title: `${waiting.length} commande(s) en attente`,
            desc: `Volume de ${formatCurrency(
              waitingTotal,
              store.currency
            )} à confirmer auprès de vos clients.`,
            cta: "Confirmer les commandes",
            href: "/dashboard/commandes",
            icon: Clock,
          }
        : {
            id: "orders-clean",
            badge: "À jour",
            tone: "border-[#E2E8F0] bg-[#F8FAFC]",
            title: "Aucune commande bloquée",
            desc: "Toutes les nouvelles commandes de la période ont été prises en charge.",
            cta: "Voir l'historique",
            href: "/dashboard/commandes",
            icon: ShoppingBag,
          },
      outOfStock.length > 0 || lowStock.length > 0
        ? {
            id: "stocks",
            badge: "Inventaire",
            tone: "border-rose-200 bg-rose-50/35",
            title: `${outOfStock.length} rupture(s) · ${lowStock.length} stock(s) faible(s)`,
            desc: `Réapprovisionnez rapidement : ${[...outOfStock, ...lowStock]
              .slice(0, 2)
              .map((p) => p.name)
              .join(", ")}.`,
            cta: "Ajuster les stocks",
            href: "/dashboard/stocks",
            icon: AlertTriangle,
          }
        : {
            id: "stocks-ok",
            badge: "Stock sain",
            tone: "border-[#E2E8F0] bg-[#F8FAFC]",
            title: `${products.reduce((s, p) => s + p.stock, 0)} unités prêtes à vendre`,
            desc: "Aucun article ne se situe sous son seuil d'alerte.",
            cta: "Voir les mouvements",
            href: "/dashboard/stocks",
            icon: Tag,
          },
      {
        id: "catalog",
        badge: "Croissance",
        tone: "border-[#E2E8F0] bg-[#F8FAFC]",
        title:
          promoCount > 0
            ? `${promoCount} offre(s) promotionnelle(s) active(s)`
            : "Créez une fiche produit assistée",
        desc:
          promoCount > 0
            ? "Utilisez Adeshina IA pour enrichir vos descriptions ou ajouter des variantes."
            : "Activez un prix promotionnel ou rédigez un nouvel article en 1 clic avec Adeshina IA.",
        cta: "Ouvrir mes produits",
        href: "/dashboard/produits",
        icon: Sparkles,
      },
    ];
  }, [orders, products, store.currency]);

  const runSkill = (intent: CopilotIntent, freeText?: string) => {
    setActiveIntent(intent);
    setIsThinking(true);
    setTimeout(() => {
      const res = runAdeshinaMerchantCollaborator(
        intent,
        { store, products, categories, orders, customers, modules },
        freeText
      );
      setCustomReply(res);
      setIsThinking(false);
    }, 220);
  };

  return (
    <Card className="border-[#E2E8F0] bg-white">
      <CardHeader className="flex flex-col justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-[#102A43] text-white">
            <Bot className="h-5 w-5 text-[#10B981]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#102A43]">
                Adeshina IA · Collaborateur commercial
              </h2>
              <span className="rounded-full bg-[#10B981]/12 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
                Connecté à votre boutique
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Analyse des ventes, produits populaires, alertes de stock et aide
              à la rédaction
            </p>
          </div>
        </div>

        {/* Compétences en 1 clic */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SKILLS.map((sk) => {
            const Icon = sk.icon;
            const selected = activeIntent === sk.intent;
            return (
              <button
                key={sk.intent}
                type="button"
                onClick={() => runSkill(sk.intent)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selected
                    ? "border-[#102A43] bg-[#102A43] text-white"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#102A43] hover:border-[#10B981] hover:bg-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-[#10B981]" />
                {sk.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {/* Réponse dynamique d'Adeshina IA lorsqu'une compétence ou question est lancée */}
        {isThinking && (
          <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs text-slate-500">
            <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
            <span>Adeshina IA inspecte vos données...</span>
          </div>
        )}

        {!isThinking && customReply && (
          <div className="animate-tab-panel flex flex-col justify-between gap-3 rounded-xl border border-[#10B981]/35 bg-[#F8FAFC] p-4 sm:flex-row sm:items-start">
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-[#102A43]">
                {customReply.title}
              </p>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                <FormattedAiText text={customReply.body} />
              </p>

            </div>
            {customReply.actionLabel && customReply.actionHref && (
              <Link href={customReply.actionHref} className="shrink-0">
                <Button variant="secondary" size="sm">
                  {customReply.actionLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* 3 cartes de synthèse proactive */}
        <div className="grid gap-3 md:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className={`flex flex-col justify-between rounded-xl border p-4 ${c.tone}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {c.badge}
                    </span>
                    <Icon className="h-4 w-4 text-[#102A43]" />
                  </div>
                  <h3 className="mt-1.5 text-sm font-bold text-[#102A43]">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {c.desc}
                  </p>
                </div>
                <Link
                  href={c.href}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#102A43] hover:text-[#10B981]"
                >
                  {c.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Question libre */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!question.trim()) return;
            const q = question.trim();
            setQuestion("");
            runSkill("free_question", q);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez une question sur votre activité à Adeshina IA (ex: quels produits sont en stock faible ?)"
            className="h-9.5 flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-xs text-[#1E293B] placeholder:text-slate-400 focus:border-[#102A43] focus:bg-white focus:outline-none"
          />
          <Button type="submit" variant="outline" size="sm">
            <Send className="h-3.5 w-3.5 text-[#10B981]" />
            Interroger
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
