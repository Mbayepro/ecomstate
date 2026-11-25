"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bot,
  Calculator,
  Calendar,
  Check,
  Clock,
  Compass,
  ExternalLink,
  FormInput,
  Layers,
  Megaphone,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/motion";
import { SalesInteractiveChart } from "@/components/dashboard/sales-chart";
import { OrderStatusPill } from "@/components/dashboard/status-pill";
import {
  DashboardPageHeader,
  StatMetricCard,
} from "@/components/dashboard/page-header";
import { getRealPopularProducts } from "@/lib/adeshina-merchant-copilot";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency, formatDate } from "@/lib/utils";

type PeriodFilter =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "all"
  | "custom";

type OverviewTab = "orders" | "guide" | "chart";

const MERCHANT_PAGES_DIRECTORY = [
  {
    href: "/dashboard/commandes",
    title: "Commandes clients",
    purpose:
      "Appeler vos clients pour confirmer leurs commandes, choisir un livreur et imprimer le bon COD.",
    icon: ShoppingBag,
  },
  {
    href: "/dashboard/produits",
    title: "Produits & Prix",
    purpose:
      "Ajouter vos articles, définir leur prix de vente et leur coût d'achat pour connaître votre marge.",
    icon: Package,
  },
  {
    href: "/dashboard/livreurs",
    title: "Livreurs & Argent COD",
    purpose:
      "Savoir exactement combien d'argent chaque livreur a encaissé et enregistrer ses versements.",
    icon: Truck,
  },
  {
    href: "/dashboard/finances",
    title: "Mes bénéfices & Dépenses",
    purpose:
      "Voir votre vrai bénéfice net (calculé uniquement sur les commandes livrées) et noter vos charges.",
    icon: Calculator,
  },
  {
    href: "/dashboard/store-builder",
    title: "Apparence de ma boutique",
    purpose:
      "Choisir votre thème (Shrine Pro) et modifier les images, textes et sections de votre vitrine.",
    icon: Layers,
  },
  {
    href: "/dashboard/form-builder",
    title: "Formulaire de commande COD",
    purpose:
      "Choisir les champs que remplit l'acheteur (nom, téléphone, ville, quartier) et créer des packs 1x / 2x / 3x.",
    icon: FormInput,
  },
  {
    href: "/dashboard/adeshina-ia",
    title: "Assistant Adeshina IA",
    purpose:
      "Poser une question simple sur vos chiffres ou laisser l'IA rédiger une fiche produit pour vous.",
    icon: Sparkles,
  },
  {
    href: "/dashboard/clients",
    title: "Fichier clients",
    purpose:
      "Retrouver vos meilleurs clients fidèles et repérer les numéros qui ont fait des retours.",
    icon: Users,
  },
  {
    href: "/dashboard/croissance",
    title: "Publicités & Automatisations",
    purpose:
      "Suivre la rentabilité de vos pubs Facebook/TikTok et activer des alertes automatiques.",
    icon: Megaphone,
  },
];

export default function DashboardOverviewPage() {
  const {
    activeStore,
    products,
    orders,
    expenses,
    updateOrderStatus,
  } = usePlatform();

  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activeTab, setActiveTab] = useState<OverviewTab>("orders");

  const storeProducts = useMemo(
    () => products.filter((p) => p.storeId === activeStore?.id),
    [products, activeStore?.id]
  );

  const storeExpenses = useMemo(
    () => (expenses ?? []).filter((e) => e.storeId === activeStore?.id),
    [expenses, activeStore?.id]
  );

  const storeOrders = useMemo(() => {
    const all = orders
      .filter((o) => o.storeId === activeStore?.id)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    if (period === "all") return all;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    if (period === "today") {
      return all.filter(
        (o) => new Date(o.createdAt).getTime() >= startOfToday
      );
    }

    if (period === "yesterday") {
      const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
      return all.filter((o) => {
        const ts = new Date(o.createdAt).getTime();
        return ts >= startOfYesterday && ts < startOfToday;
      });
    }

    if (period === "7d" || period === "30d") {
      const days = period === "7d" ? 7 : 30;
      const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
      return all.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
    }

    if (period === "this_month") {
      const firstOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).getTime();
      return all.filter(
        (o) => new Date(o.createdAt).getTime() >= firstOfMonth
      );
    }

    if (period === "last_month") {
      const firstOfLast = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      ).getTime();
      const firstOfThis = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).getTime();
      return all.filter((o) => {
        const ts = new Date(o.createdAt).getTime();
        return ts >= firstOfLast && ts < firstOfThis;
      });
    }

    if (period === "custom") {
      const minTs = customStart
        ? new Date(`${customStart}T00:00:00`).getTime()
        : -Infinity;
      const maxTs = customEnd
        ? new Date(`${customEnd}T23:59:59`).getTime()
        : Infinity;
      return all.filter((o) => {
        const ts = new Date(o.createdAt).getTime();
        return ts >= minTs && ts <= maxTs;
      });
    }

    return all;
  }, [orders, activeStore?.id, period, customStart, customEnd]);

  const rankedProducts = useMemo(
    () => getRealPopularProducts(storeProducts, storeOrders),
    [storeProducts, storeOrders]
  );

  if (!activeStore) return null;

  const deliveredOrders = storeOrders.filter((o) => o.status === "delivered");
  const returnedOrFailedOrders = storeOrders.filter(
    (o) => o.status === "returned" || o.status === "delivery_failed"
  );
  const pendingConfirmationOrders = storeOrders.filter(
    (o) => o.status === "new" || o.status === "pending_confirmation"
  );

  const totalOrderedAmount = storeOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.totalAmount, 0);
  const deliveredRevenue = deliveredOrders.reduce(
    (s, o) => s + o.totalAmount,
    0
  );

  const deliveredCogs = deliveredOrders.reduce((sum, ord) => {
    return (
      sum +
      ord.items.reduce((acc, it) => {
        if (typeof it.costPrice === "number" && it.costPrice > 0) {
          return acc + it.costPrice * it.quantity;
        }
        const p = storeProducts.find((pr) => pr.id === it.productId);
        return (
          acc +
          (p ? (p.costPrice ?? 0) + (p.additionalCost ?? 0) : 0) * it.quantity
        );
      }, 0)
    );
  }, 0);

  const totalExpenses = storeExpenses.reduce((s, e) => s + e.amount, 0);
  const estimatedNetProfit = deliveredRevenue - deliveredCogs - totalExpenses;

  const closedShipments =
    deliveredOrders.length + returnedOrFailedOrders.length;
  const deliveryRatePct =
    closedShipments > 0
      ? Math.round((deliveredOrders.length / closedShipments) * 100)
      : storeOrders.length > 0
      ? Math.round((deliveredOrders.length / storeOrders.length) * 100)
      : 0;
  const returnRatePct =
    closedShipments > 0
      ? Math.round((returnedOrFailedOrders.length / closedShipments) * 100)
      : 0;

  const cashHeldByCouriers = Math.max(
    0,
    deliveredOrders
      .filter((o) => o.codFinancialStatus === "collected_by_courier")
      .reduce((s, o) => s + o.totalAmount, 0)
  );

  const outOfStockCount = storeProducts.filter((p) => p.stock <= 0).length;
  const lowStockCount = storeProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE SIMPLE */}
      <DashboardPageHeader
        eyebrow={`Boutique · ${activeStore.name}`}
        title={`Bonjour ${activeStore.ownerName.split(" ")[0]} 👋`}
        description={
          <span>
            Lien public de votre boutique :{" "}
            <a
              href={`/s/${activeStore.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#00A884] hover:underline"
            >
              {activeStore.customDomain || activeStore.subdomain}
              <ExternalLink className="h-3 w-3" />
            </a>
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-[#00A884]" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
                className="bg-transparent text-xs font-bold text-[#15232D] focus:outline-none cursor-pointer"
              >
                <option value="today">Aujourd&apos;hui</option>
                <option value="yesterday">Hier</option>
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="this_month">Ce mois-ci</option>
                <option value="last_month">Mois précédent</option>
                <option value="all">Toute l&apos;activité</option>
                <option value="custom">Période personnalisée</option>
              </select>
            </div>

            <Link href="/dashboard/produits">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4" />
                Ajouter un produit
              </Button>
            </Link>
          </div>
        }
      />

      {period === "custom" && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs">
          <span className="font-bold text-[#15232D]">Du :</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5"
          />
          <span className="font-bold text-[#15232D]">Au :</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5"
          />
        </div>
      )}

      {/* 2. LES 4 CHIFFRES ESSENTIELS DU COMMERÇANT COD */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatMetricCard
          label="1. Commandes à confirmer"
          value={<AnimatedNumber value={pendingConfirmationOrders.length} />}
          subtext={`${storeOrders.length} cmd au total (${formatCurrency(totalOrderedAmount, activeStore.currency)})`}
          icon={Clock}
          tone={pendingConfirmationOrders.length > 0 ? "amber" : "emerald"}
          action={
            <Link
              href="/dashboard/commandes"
              className="font-bold text-[#073B35] hover:text-[#00A884]"
            >
              Ouvrir →
            </Link>
          }
        />

        <StatMetricCard
          label="2. Ventes livrées (Encaissées)"
          value={
            <AnimatedNumber
              value={deliveredRevenue}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext={`${deliveredOrders.length} livrée(s) · Taux livraison ${deliveryRatePct} %`}
          icon={Wallet}
          tone="emerald"
        />

        <StatMetricCard
          label="3. Mon bénéfice net réel"
          value={
            <AnimatedNumber
              value={estimatedNetProfit}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext={`Dépenses déduites : ${formatCurrency(totalExpenses, activeStore.currency)}`}
          icon={Calculator}
          tone={estimatedNetProfit >= 0 ? "emerald" : "rose"}
          action={
            <Link
              href="/dashboard/finances"
              className="font-bold text-[#073B35] hover:text-[#00A884]"
            >
              Détails →
            </Link>
          }
        />

        <StatMetricCard
          label="4. Argent chez les livreurs"
          value={
            <AnimatedNumber
              value={cashHeldByCouriers}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext={`Retours : ${returnedOrFailedOrders.length} (${returnRatePct} %)`}
          icon={Truck}
          tone={cashHeldByCouriers > 0 ? "amber" : "navy"}
          action={
            <Link
              href="/dashboard/livreurs"
              className="font-bold text-[#073B35] hover:text-[#00A884]"
            >
              Livreurs →
            </Link>
          }
        />
      </div>

      {/* 3. SÉLECTEUR EN 3 ONGLETS CLAIRS (UN SEUL BLOC AFFICHÉ À LA FOIS POUR NE JAMAIS SURCHARGER L'ÉCRAN) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "orders"
              ? "bg-[#073B35] text-white shadow-2xs"
              : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
          }`}
        >
          <ShoppingBag className="h-4 w-4 text-[#00A884]" />
          Commandes à traiter ({pendingConfirmationOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("guide")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "guide"
              ? "bg-[#073B35] text-white shadow-2xs"
              : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
          }`}
        >
          <Compass className="h-4 w-4 text-[#00A884]" />
          À quoi sert chaque page ? (Guide commerçant)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chart")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "chart"
              ? "bg-[#073B35] text-white shadow-2xs"
              : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
          }`}
        >
          <BarChart3 className="h-4 w-4 text-[#00A884]" />
          Courbe des ventes & Top produits
        </button>
      </div>

      {/* ONGLET 1 : COMMANDES À TRAITER + CONSEIL RAPIDE */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Bot className="h-4 w-4 text-[#00A884]" />
              <span className="text-slate-700">
                <strong className="text-[#15232D]">Conseil du jour :</strong>{" "}
                {pendingConfirmationOrders.length > 0
                  ? `Vous avez ${pendingConfirmationOrders.length} commande(s) à confirmer par téléphone.`
                  : "Toutes vos commandes récentes ont été traitées."}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {(outOfStockCount > 0 || lowStockCount > 0) && (
                <Link
                  href="/dashboard/stocks"
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 font-bold text-amber-900"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-[#F4A340]" />
                  {outOfStockCount + lowStockCount} alerte(s) stock
                </Link>
              )}
              <Link
                href="/dashboard/adeshina-ia"
                className="font-bold text-[#00A884] hover:underline"
              >
                Demander à Adeshina IA →
              </Link>
            </div>
          </div>

          <Card className="border-[#E2E8F0] bg-white">
            <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-[#15232D]">
                  Vos 5 dernières commandes
                </h2>
                <p className="text-xs text-slate-500">
                  Cliquez sur « Confirmer » après avoir appelé le client
                </p>
              </div>
              <Link
                href="/dashboard/commandes"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#073B35] hover:text-[#00A884]"
              >
                Voir toutes les commandes ({storeOrders.length})
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {storeOrders.length === 0 ? (
                <div className="p-10 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-[#15232D]">
                    Aucune commande sur cette période
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {storeOrders.slice(0, 5).map((ord) => {
                    const isWaiting =
                      ord.status === "new" ||
                      ord.status === "pending_confirmation";
                    return (
                      <div
                        key={ord.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#F8FAFC]"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#15232D]">
                              {ord.customerName}
                            </span>
                            <OrderStatusPill status={ord.status} />
                          </div>
                          <p className="text-xs text-slate-500">
                            {ord.deliveryCity} · {ord.customerPhone} ·{" "}
                            {formatDate(ord.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-[#073B35]">
                            {formatCurrency(
                              ord.totalAmount,
                              activeStore.currency
                            )}
                          </span>
                          {isWaiting ? (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                updateOrderStatus(
                                  activeStore.id,
                                  ord.id,
                                  "confirmed"
                                )
                              }
                            >
                              <Check className="h-3.5 w-3.5" />
                              Confirmer
                            </Button>
                          ) : (
                            <Link
                              href="/dashboard/commandes"
                              className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#15232D] hover:bg-slate-50"
                            >
                              Détails
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ONGLET 2 : GUIDE DES PAGES (À QUOI SERT CHAQUE PAGE DU TABLEAU DE BORD) */}
      {activeTab === "guide" && (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {MERCHANT_PAGES_DIRECTORY.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 transition hover:border-[#00A884] hover:shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F7F2] text-[#073B35]">
                      <Icon className="h-5 w-5 text-[#00A884]" />
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#00A884] group-hover:translate-x-0.5 transition-transform">
                      Ouvrir
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#15232D]">
                    {page.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {page.purpose}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ONGLET 3 : COURBE DES VENTES & MEILLEURS PRODUITS */}
      {activeTab === "chart" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="border-[#E2E8F0] bg-white lg:col-span-7">
            <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#15232D]">
                  Évolution de vos ventes
                </h2>
                <p className="text-xs text-slate-500">Activité jour par jour</p>
              </div>
              <Badge variant="navy">{storeOrders.length} cmd</Badge>
            </CardHeader>
            <CardContent className="p-5">
              <SalesInteractiveChart
                orders={storeOrders}
                currency={activeStore.currency}
              />
            </CardContent>
          </Card>

          <Card className="border-[#E2E8F0] bg-white lg:col-span-5">
            <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#15232D]">
                  Produits les plus vendus
                </h2>
                <p className="text-xs text-slate-500">
                  Sur la période choisie
                </p>
              </div>
              <Link
                href="/dashboard/produits"
                className="text-xs font-bold text-[#00A884] hover:underline"
              >
                Catalogue →
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              {rankedProducts.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-2 text-xs text-slate-500">
                    Aucun produit dans votre catalogue.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {rankedProducts.slice(0, 4).map((item, idx) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[11px] font-extrabold text-[#073B35]">
                          {idx + 1}
                        </span>
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#15232D]">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.unitsSold} vendu(s) · Stock{" "}
                            {item.product.stock}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-extrabold text-[#00A884]">
                        {formatCurrency(item.revenue, activeStore.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
