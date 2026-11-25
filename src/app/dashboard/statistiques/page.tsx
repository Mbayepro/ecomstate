"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  MapPin,
  Percent,
  ShoppingBag,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/ui/motion";
import {
  DashboardPageHeader,
  StatMetricCard,
} from "@/components/dashboard/page-header";
import { SalesInteractiveChart } from "@/components/dashboard/sales-chart";
import { getRealPopularProducts } from "@/lib/adeshina-merchant-copilot";
import { canUseModule, PAYMENT_METHOD_LABELS } from "@/lib/permissions";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethodCode } from "@/types/domain";

type PeriodFilter = "today" | "7d" | "30d" | "all";

export default function DashboardStatistiquesPage() {
  const { activeStore, orders, products, categories, modules } = usePlatform();
  const [period, setPeriod] = useState<PeriodFilter>("all");

  const storeProducts = useMemo(
    () => products.filter((p) => p.storeId === activeStore?.id),
    [products, activeStore?.id]
  );

  const storeCategories = useMemo(
    () => categories.filter((c) => c.storeId === activeStore?.id),
    [categories, activeStore?.id]
  );

  const storeOrders = useMemo(() => {
    const all = orders.filter((o) => o.storeId === activeStore?.id);
    if (period === "all") return all;
    const now = new Date();
    if (period === "today") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      return all.filter((o) => new Date(o.createdAt).getTime() >= start);
    }
    const days = period === "7d" ? 7 : 30;
    const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
    return all.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
  }, [orders, activeStore?.id, period]);

  const rankedProducts = useMemo(
    () => getRealPopularProducts(storeProducts, storeOrders),
    [storeProducts, storeOrders]
  );

  if (!activeStore) return null;

  const hasAdvancedModule = canUseModule(
    activeStore.planCode,
    "advanced_analytics",
    modules
  );

  const validOrders = storeOrders.filter((o) => o.status !== "cancelled");
  const deliveredOrders = storeOrders.filter((o) => o.status === "delivered");
  const cancelledOrders = storeOrders.filter((o) => o.status === "cancelled");

  const totalRevenue = validOrders.reduce((s, o) => s + o.totalAmount, 0);
  const netMerchandise = validOrders.reduce((s, o) => s + o.subtotal, 0);
  const averageOrderValue =
    validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  const deliveryRate =
    validOrders.length > 0
      ? Math.round((deliveredOrders.length / validOrders.length) * 100)
      : 0;
  const cancelRate =
    storeOrders.length > 0
      ? Math.round((cancelledOrders.length / storeOrders.length) * 100)
      : 0;

  // Répartition réelle des ventes par catégorie
  const categoryStats = storeCategories
    .map((cat) => {
      const catProductIds = new Set(
        storeProducts.filter((p) => p.categoryId === cat.id).map((p) => p.id)
      );
      let revenue = 0;
      let units = 0;
      for (const ord of validOrders) {
        for (const item of ord.items) {
          if (catProductIds.has(item.productId)) {
            revenue += item.totalPrice;
            units += item.quantity;
          }
        }
      }
      return { category: cat, revenue, units };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Répartition réelle par ville de livraison
  const cityStats = (() => {
    const map = new Map<string, { count: number; revenue: number }>();
    for (const ord of validOrders) {
      const city = ord.deliveryCity || "Non renseignée";
      const prev = map.get(city) ?? { count: 0, revenue: 0 };
      map.set(city, {
        count: prev.count + 1,
        revenue: prev.revenue + ord.totalAmount,
      });
    }
    return Array.from(map.entries())
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  })();

  // Répartition réelle par moyen de paiement
  const paymentStats = (
    [
      "cash_on_delivery",
      "whatsapp_order",
      "manual_mobile_money",
    ] as PaymentMethodCode[]
  ).map((code) => {
    const matching = validOrders.filter((o) => o.paymentMethod === code);
    const amount = matching.reduce((s, o) => s + o.totalAmount, 0);
    return {
      code,
      label: PAYMENT_METHOD_LABELS[code],
      count: matching.length,
      amount,
      pct:
        validOrders.length > 0
          ? Math.round((matching.length / validOrders.length) * 100)
          : 0,
    };
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Performance commerciale"
        title="Statistiques"
        description="Indicateurs réels calculés à partir de vos commandes, produits et livraisons."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {hasAdvancedModule && (
              <Badge variant="success">
                <Sparkles className="mr-1 h-3 w-3" />
                Analytics avancés actifs
              </Badge>
            )}
            <div className="inline-flex items-center gap-0.5 rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-2xs">
              <Calendar className="ml-2 mr-1 h-3.5 w-3.5 text-slate-400" />
              {(
                [
                  ["today", "Aujourd'hui"],
                  ["7d", "7 jours"],
                  ["30d", "30 jours"],
                  ["all", "Tout"],
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

      {/* KPIs analytiques réels */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatMetricCard
          compact
          label="Chiffre d'affaires brut"
          value={
            <AnimatedNumber
              value={totalRevenue}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext={`Hors livraison : ${formatCurrency(
            netMerchandise,
            activeStore.currency
          )}`}
          icon={Wallet}
          tone="emerald"
        />
        <StatMetricCard
          compact
          label="Panier moyen"
          value={
            <AnimatedNumber
              value={averageOrderValue}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext={`Sur ${validOrders.length} commande(s) validée(s)`}
          icon={ShoppingBag}
          tone="navy"
        />
        <StatMetricCard
          compact
          label="Taux de livraison"
          value={<AnimatedNumber value={deliveryRate} suffix=" %" />}
          subtext={`${deliveredOrders.length} commande(s) livrée(s)`}
          icon={Truck}
          tone="sky"
        />
        <StatMetricCard
          compact
          label="Taux d'annulation"
          value={<AnimatedNumber value={cancelRate} suffix=" %" />}
          subtext={`${cancelledOrders.length} commande(s) annulée(s)`}
          icon={Percent}
          tone={cancelRate > 20 ? "rose" : "slate"}
        />
      </div>

      {/* Courbe principale */}
      <Card className="border-[#E2E8F0] bg-white">
        <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-[#102A43]">
              Progression du chiffre d&apos;affaires
            </h2>
            <p className="text-xs text-slate-500">
              Visualisation chronologique des ventes validées
            </p>
          </div>
          <BarChart3 className="h-4.5 w-4.5 text-[#10B981]" />
        </CardHeader>
        <CardContent className="p-5">
          <SalesInteractiveChart
            orders={storeOrders}
            currency={activeStore.currency}
          />
        </CardContent>
      </Card>

      {/* Ventilations par Catégorie, Ville & Moyen de paiement */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Par Catégorie */}
        <Card className="border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-extrabold text-[#102A43]">
              Ventes par catégorie
            </h2>
          </CardHeader>
          <CardContent className="space-y-3.5 p-5">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-slate-500">Aucune catégorie.</p>
            ) : (
              categoryStats.map((item) => {
                const pct =
                  netMerchandise > 0
                    ? Math.round((item.revenue / netMerchandise) * 100)
                    : 0;
                return (
                  <div key={item.category.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#102A43]">
                        {item.category.name}
                      </span>
                      <span className="text-slate-600">
                        {item.units} art. ·{" "}
                        <strong>
                          {formatCurrency(item.revenue, activeStore.currency)}
                        </strong>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#102A43]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Par Ville */}
        <Card className="border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-extrabold text-[#102A43]">
              Villes de livraison
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {cityStats.length === 0 ? (
              <p className="text-xs text-slate-500">
                Aucune commande validée sur cette période.
              </p>
            ) : (
              cityStats.map((c) => (
                <div
                  key={c.city}
                  className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-xs"
                >
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#102A43]">
                    <MapPin className="h-3.5 w-3.5 text-[#10B981]" />
                    {c.city}
                  </span>
                  <span className="font-bold text-[#102A43]">
                    {c.count} cmd ·{" "}
                    {formatCurrency(c.revenue, activeStore.currency)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Par Moyen de paiement */}
        <Card className="border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-extrabold text-[#102A43]">
              Canaux d&apos;encaissement
            </h2>
          </CardHeader>
          <CardContent className="space-y-3.5 p-5">
            {paymentStats.map((pm) => (
              <div key={pm.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate font-semibold text-[#102A43]">
                    {pm.label}
                  </span>
                  <span className="shrink-0 text-slate-600">
                    {pm.count} cmd ({pm.pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#10B981]"
                    style={{ width: `${pm.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Classement détaillé des produits */}
      <Card className="border-[#E2E8F0] bg-white">
        <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
          <h2 className="text-sm font-extrabold text-[#102A43]">
            Performance par produit
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Produit</th>
                  <th className="px-4 py-3">Prix actuel</th>
                  <th className="px-4 py-3">Unités vendues</th>
                  <th className="px-4 py-3">Revenu généré</th>
                  <th className="px-5 py-3 text-right">Stock restant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {rankedProducts.map((r) => (
                  <tr key={r.product.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3.5 font-semibold text-[#102A43]">
                      {r.product.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {formatCurrency(
                        r.product.promoPrice ?? r.product.price,
                        activeStore.currency
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#102A43]">
                      {r.unitsSold}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#10B981]">
                      {formatCurrency(r.revenue, activeStore.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Badge
                        variant={
                          r.product.stock === 0
                            ? "danger"
                            : r.product.stock <= r.product.lowStockThreshold
                            ? "warning"
                            : "success"
                        }
                      >
                        {r.product.stock} en stock
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
