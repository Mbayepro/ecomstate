"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  Package,
  ShoppingBag,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/motion";
import { SalesInteractiveChart } from "@/components/dashboard/sales-chart";
import {
  OrderStatusPill,
  PaymentMethodPill,
} from "@/components/dashboard/status-pill";
import { AdeshinaCopilotPanel } from "@/components/dashboard/adeshina-copilot-panel";
import {
  DashboardPageHeader,
  StatMetricCard,
} from "@/components/dashboard/page-header";
import { getRealPopularProducts } from "@/lib/adeshina-merchant-copilot";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency, formatDate } from "@/lib/utils";

type PeriodFilter = "today" | "7d" | "30d" | "all" | "custom";
type RecentTab = "all" | "waiting" | "confirmed" | "delivered";

export default function DashboardOverviewPage() {
  const {
    activeStore,
    products,
    categories,
    orders,
    customers,
    modules,
    updateOrderStatus,
  } = usePlatform();

  // Par défaut "30d" ou "all" : "30d" correspond aux habitudes e-commerce
  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [recentTab, setRecentTab] = useState<RecentTab>("all");

  const storeProducts = useMemo(
    () => products.filter((p) => p.storeId === activeStore?.id),
    [products, activeStore?.id]
  );

  const storeCategories = useMemo(
    () => categories.filter((c) => c.storeId === activeStore?.id),
    [categories, activeStore?.id]
  );

  const storeCustomers = useMemo(
    () => customers.filter((c) => c.storeId === activeStore?.id),
    [customers, activeStore?.id]
  );

  // Filtrage temporel 100 % réel (Aujourd'hui, 7j, 30j, Tout, Période personnalisée)
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
    if (period === "today") {
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      return all.filter((o) => new Date(o.createdAt).getTime() >= startOfDay);
    }

    if (period === "7d" || period === "30d") {
      const days = period === "7d" ? 7 : 30;
      const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
      return all.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
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

  // Les 7 indicateurs demandés dans le cahier de refonte (strictement réels)
  const validOrders = storeOrders.filter((o) => o.status !== "cancelled");
  const revenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const averageBasket =
    validOrders.length > 0 ? Math.round(revenue / validOrders.length) : 0;

  const totalOrdersCount = storeOrders.length;
  const pendingOrdersCount = storeOrders.filter(
    (o) => o.status === "new" || o.status === "pending_confirmation"
  ).length;
  const confirmedOrdersCount = storeOrders.filter(
    (o) =>
      o.status === "confirmed" ||
      o.status === "preparing" ||
      o.status === "shipped"
  ).length;
  const deliveredOrdersCount = storeOrders.filter(
    (o) => o.status === "delivered"
  ).length;

  const availableProductsCount = storeProducts.filter(
    (p) => p.isActive && p.stock > 0
  ).length;
  const outOfStockCount = storeProducts.filter((p) => p.stock === 0).length;
  const totalUnitsInStock = storeProducts.reduce((s, p) => s + p.stock, 0);

  const deliveryRate =
    validOrders.length > 0
      ? Math.round((deliveredOrdersCount / validOrders.length) * 100)
      : 0;

  // Dernières commandes filtrées par onglet rapide
  const filteredRecentOrders = storeOrders
    .filter((o) => {
      if (recentTab === "waiting") {
        return o.status === "new" || o.status === "pending_confirmation";
      }
      if (recentTab === "confirmed") {
        return (
          o.status === "confirmed" ||
          o.status === "preparing" ||
          o.status === "shipped"
        );
      }
      if (recentTab === "delivered") {
        return o.status === "delivered";
      }
      return true;
    })
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* EN-TÊTE + FILTRES TEMPORELS COMPLETS */}
      <DashboardPageHeader
        eyebrow={`Espace commerçant · ${activeStore.countryCode}`}
        title={`Bonjour, ${activeStore.ownerName.split(" ")[0]}`}
        description={
          <span>
            Suivi commercial de{" "}
            <strong className="font-semibold text-[#102A43]">
              {activeStore.name}
            </strong>{" "}
            ·{" "}
            <a
              href={`/s/${activeStore.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#10B981] hover:underline"
            >
              {activeStore.customDomain || activeStore.subdomain}
              <ExternalLink className="h-3 w-3" />
            </a>
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap items-center gap-0.5 rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-2xs">
              <Calendar className="ml-2 mr-1 hidden h-3.5 w-3.5 text-slate-400 sm:inline" />
              {(
                [
                  ["today", "Aujourd'hui"],
                  ["7d", "7 jours"],
                  ["30d", "30 jours"],
                  ["all", "Tout"],
                  ["custom", "Personnalisé"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPeriod(val)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    period === val
                      ? "bg-[#102A43] text-white"
                      : "text-slate-600 hover:text-[#102A43]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Sélecteur de dates si Période personnalisée active */}
      {period === "custom" && (
        <div className="animate-page-enter flex flex-wrap items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-2xs">
          <span className="text-xs font-bold text-[#102A43]">
            Plage de dates :
          </span>
          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
            <span>Du</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-medium text-[#102A43] focus:border-[#102A43] focus:bg-white focus:outline-none"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
            <span>Au</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-medium text-[#102A43] focus:border-[#102A43] focus:bg-white focus:outline-none"
            />
          </label>
          {(customStart || customEnd) && (
            <button
              type="button"
              onClick={() => {
                setCustomStart("");
                setCustomEnd("");
              }}
              className="text-xs font-semibold text-slate-500 hover:text-[#102A43] cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* NIVEAU 1 : 4 INDICATEURS MAJEURS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatMetricCard
          label="Chiffre d'affaires"
          value={
            <AnimatedNumber
              value={revenue}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext={`Panier moyen : ${formatCurrency(
            averageBasket,
            activeStore.currency
          )}`}
          icon={Wallet}
          tone="emerald"
        />

        <StatMetricCard
          label="Nombre de commandes"
          value={<AnimatedNumber value={totalOrdersCount} />}
          subtext={`${validOrders.length} validée(s) sur la période`}
          icon={ShoppingBag}
          tone="navy"
          action={
            <Link
              href="/dashboard/commandes"
              className="font-semibold text-[#102A43] hover:text-[#10B981]"
            >
              Voir →
            </Link>
          }
        />

        <StatMetricCard
          label="Commandes en attente"
          value={<AnimatedNumber value={pendingOrdersCount} />}
          subtext={
            pendingOrdersCount > 0
              ? "Nécessitent votre confirmation"
              : "Aucune commande en attente"
          }
          icon={Clock}
          tone={pendingOrdersCount > 0 ? "amber" : "slate"}
          action={
            pendingOrdersCount > 0 ? (
              <Link
                href="/dashboard/commandes"
                className="font-bold text-amber-700 hover:underline"
              >
                Traiter
              </Link>
            ) : undefined
          }
        />

        <StatMetricCard
          label="Commandes livrées"
          value={<AnimatedNumber value={deliveredOrdersCount} />}
          subtext={`Taux de livraison : ${deliveryRate} %`}
          icon={Truck}
          tone="emerald"
        />
      </div>

      {/* NIVEAU 2 : 3 INDICATEURS OPÉRATIONNELS & CATALOGUE */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatMetricCard
          compact
          label="Commandes confirmées (en cours)"
          value={<AnimatedNumber value={confirmedOrdersCount} />}
          subtext="Confirmées, en préparation ou expédiées"
          icon={CheckCircle2}
          tone="sky"
        />

        <StatMetricCard
          compact
          label="Produits disponibles"
          value={<AnimatedNumber value={availableProductsCount} />}
          subtext={`${totalUnitsInStock} unités disponibles en stock`}
          icon={Package}
          tone="navy"
          action={
            <Link
              href="/dashboard/produits"
              className="font-semibold text-[#102A43] hover:text-[#10B981]"
            >
              Catalogue →
            </Link>
          }
        />

        <StatMetricCard
          compact
          label="Produits en rupture"
          value={<AnimatedNumber value={outOfStockCount} />}
          subtext={
            outOfStockCount > 0
              ? "Articles indisponibles à réapprovisionner"
              : "Aucune rupture de stock"
          }
          icon={AlertCircle}
          tone={outOfStockCount > 0 ? "rose" : "emerald"}
          action={
            outOfStockCount > 0 ? (
              <Link
                href="/dashboard/stocks"
                className="font-bold text-rose-600 hover:underline"
              >
                Stocks →
              </Link>
            ) : undefined
          }
        />
      </div>

      {/* NIVEAU 3 : ÉVOLUTION DES VENTES (8 COLS) + PRODUITS POPULAIRES RÉELS (4 COLS) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-[#E2E8F0] bg-white lg:col-span-8">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#102A43]">
                Évolution des ventes
              </h2>
              <p className="text-xs text-slate-500">
                Suivi journalier du chiffre d&apos;affaires validé
              </p>
            </div>
            <Badge variant="navy">
              <TrendingUp className="mr-1 h-3 w-3 text-[#10B981]" />
              {validOrders.length} vente{validOrders.length > 1 ? "s" : ""}
            </Badge>
          </CardHeader>
          <CardContent className="p-5">
            <SalesInteractiveChart
              orders={storeOrders}
              currency={activeStore.currency}
            />
          </CardContent>
        </Card>

        {/* Top Produits Populaires (calculé sur les vraies ventes) */}
        <Card className="border-[#E2E8F0] bg-white lg:col-span-4">
          <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#102A43]">
                Produits populaires
              </h2>
              <p className="text-xs text-slate-500">
                Classement réel sur la période
              </p>
            </div>
            <Link
              href="/dashboard/produits"
              className="text-xs font-semibold text-[#10B981] hover:underline"
            >
              Tout voir
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {rankedProducts.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-500">
                Aucun produit dans votre catalogue.
              </p>
            ) : (
              <div className="space-y-3">
                {rankedProducts.slice(0, 4).map((item, idx) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/70 p-2.5 transition-colors hover:bg-white"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[11px] font-extrabold text-[#102A43] shadow-2xs">
                        {idx + 1}
                      </span>
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-10 w-10 shrink-0 rounded-lg border border-[#E2E8F0] object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#102A43]">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.unitsSold > 0
                            ? `${item.unitsSold} vendu(s)`
                            : `Prix : ${formatCurrency(
                                item.product.promoPrice ?? item.product.price,
                                activeStore.currency
                              )}`}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {item.revenue > 0 ? (
                        <p className="text-xs font-extrabold text-[#10B981]">
                          {formatCurrency(item.revenue, activeStore.currency)}
                        </p>
                      ) : (
                        <Badge
                          variant={
                            item.product.stock === 0 ? "danger" : "default"
                          }
                        >
                          Stock {item.product.stock}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NIVEAU 4 : COLLABORATEUR ADESHINA IA */}
      <AdeshinaCopilotPanel
        store={activeStore}
        products={storeProducts}
        categories={storeCategories}
        orders={storeOrders}
        customers={storeCustomers}
        modules={modules}
      />

      {/* NIVEAU 5 : DERNIÈRES COMMANDES AVEC ACTIONS RAPIDES EN 1 CLIC */}
      <Card className="border-[#E2E8F0] bg-white">
        <CardHeader className="flex flex-col justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-extrabold text-[#102A43]">
              Dernières commandes
            </h2>
            <p className="text-xs text-slate-500">
              Validez vos commandes ou contactez vos clients sur WhatsApp sans
              quitter cette page
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ["all", `Toutes (${storeOrders.length})`],
                ["waiting", `En attente (${pendingOrdersCount})`],
                ["confirmed", `Confirmées (${confirmedOrdersCount})`],
                ["delivered", `Livrées (${deliveredOrdersCount})`],
              ] as const
            ).map(([tabId, label]) => (
              <button
                key={tabId}
                type="button"
                onClick={() => setRecentTab(tabId)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  recentTab === tabId
                    ? "bg-[#102A43] text-white"
                    : "bg-[#F8FAFC] text-slate-600 hover:text-[#102A43]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredRecentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-[#102A43]">
                Aucune commande sur ce filtre
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Changez la période temporelle ou partagez le lien de votre
                boutique.
              </p>
            </div>
          ) : (
            <>
              {/* Vue cartes optimisée pour mobile */}
              <div className="divide-y divide-[#E2E8F0] md:hidden">
                {filteredRecentOrders.map((ord) => {
                  const isWaiting =
                    ord.status === "new" ||
                    ord.status === "pending_confirmation";
                  const cleanPhone = ord.customerPhone.replace(/[^\d]/g, "");

                  return (
                    <div key={ord.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#102A43]">
                            {ord.orderNumber}
                          </span>
                          <p className="mt-0.5 text-sm font-bold text-[#102A43]">
                            {ord.customerName} ·{" "}
                            <span className="font-normal text-slate-500">
                              {ord.deliveryCity}
                            </span>
                          </p>
                        </div>
                        <OrderStatusPill status={ord.status} />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <PaymentMethodPill method={ord.paymentMethod} compact />
                        <span className="text-sm font-extrabold text-[#102A43]">
                          {formatCurrency(
                            ord.totalAmount,
                            activeStore.currency
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {isWaiting && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
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
                        )}
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#102A43]"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-[#10B981]" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vue tableau Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Commande</th>
                      <th className="px-4 py-3">Client & Ville</th>
                      <th className="px-4 py-3">Paiement</th>
                      <th className="px-4 py-3">Montant</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-5 py-3 text-right">Actions rapides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredRecentOrders.map((ord) => {
                      const isWaiting =
                        ord.status === "new" ||
                        ord.status === "pending_confirmation";
                      const canDeliver =
                        ord.status === "confirmed" ||
                        ord.status === "preparing" ||
                        ord.status === "shipped";
                      const cleanPhone = ord.customerPhone.replace(
                        /[^\d]/g,
                        ""
                      );

                      return (
                        <tr
                          key={ord.id}
                          className="transition-colors hover:bg-[#F8FAFC]"
                        >
                          <td className="px-5 py-3.5">
                            <Link
                              href="/dashboard/commandes"
                              className="font-mono text-xs font-bold text-[#102A43] hover:text-[#10B981]"
                            >
                              {ord.orderNumber}
                            </Link>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {formatDate(ord.createdAt)} · {ord.items.length}{" "}
                              article(s)
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-[#102A43]">
                              {ord.customerName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {ord.deliveryCity}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <PaymentMethodPill
                              method={ord.paymentMethod}
                              compact
                            />
                          </td>
                          <td className="px-4 py-3.5 font-extrabold text-[#102A43]">
                            {formatCurrency(
                              ord.totalAmount,
                              activeStore.currency
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <OrderStatusPill status={ord.status} />
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {isWaiting && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateOrderStatus(
                                      activeStore.id,
                                      ord.id,
                                      "confirmed"
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#10B981] px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#059669] cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Confirmer
                                </button>
                              )}
                              {canDeliver && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateOrderStatus(
                                      activeStore.id,
                                      ord.id,
                                      "delivered"
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#102A43] transition-colors hover:border-[#10B981] hover:text-[#10B981] cursor-pointer"
                                >
                                  Marquer livrée
                                </button>
                              )}
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#10B981] transition-colors hover:bg-[#10B981] hover:text-white"
                                title="Contacter le client sur WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC]/60 px-5 py-3">
            <span className="text-xs text-slate-500">
              {filteredRecentOrders.length} commande(s) affichée(s)
            </span>
            <Link
              href="/dashboard/commandes"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#102A43] hover:text-[#10B981]"
            >
              Ouvrir la gestion complète des commandes
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
