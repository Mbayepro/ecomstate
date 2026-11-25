"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/motion";
import {
  DashboardPageHeader,
  StatMetricCard,
} from "@/components/dashboard/page-header";
import { usePlatform } from "@/lib/platform-store";
import { formatDate } from "@/lib/utils";

type StockFilter = "all" | "low" | "out";

export default function DashboardStocksPage() {
  const { activeStore, products, inventoryMovements, adjustStock } =
    usePlatform();
  const [filter, setFilter] = useState<StockFilter>("all");
  const [search, setSearch] = useState("");
  const [restockProductId, setRestockProductId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState("10");
  const [restockReason, setRestockReason] = useState(
    "Réapprovisionnement boutique"
  );

  if (!activeStore) return null;

  const storeProducts = products.filter((p) => p.storeId === activeStore.id);
  const storeMovements = inventoryMovements.filter(
    (m) => m.storeId === activeStore.id
  );

  const totalUnits = storeProducts.reduce((sum, p) => sum + p.stock, 0);
  const healthyCount = storeProducts.filter(
    (p) => p.stock > p.lowStockThreshold
  ).length;
  const lowCount = storeProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;
  const outCount = storeProducts.filter((p) => p.stock === 0).length;

  const filteredProducts = storeProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "low" && p.stock > 0 && p.stock <= p.lowStockThreshold) ||
      (filter === "out" && p.stock === 0);
    return matchSearch && matchFilter;
  });

  const handleCustomRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductId) return;
    const qty = Number(restockQty);
    if (!qty || Number.isNaN(qty)) return;
    adjustStock(
      activeStore.id,
      restockProductId,
      qty,
      restockReason.trim() || "Réapprovisionnement"
    );
    setRestockProductId(null);
    setRestockQty("10");
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Inventaire & Logistique"
        title="Stocks"
        description="Ajustez vos quantités disponibles, évitez les ruptures et tracez chaque mouvement."
      />

      {/* Indicateurs réels */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatMetricCard
          compact
          label="Unités disponibles"
          value={<AnimatedNumber value={totalUnits} />}
          subtext="Cumul de tous les articles"
          icon={Boxes}
          tone="navy"
        />
        <StatMetricCard
          compact
          label="Stock normal"
          value={<AnimatedNumber value={healthyCount} />}
          subtext="Au-dessus du seuil d'alerte"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatMetricCard
          compact
          label="Stock faible"
          value={<AnimatedNumber value={lowCount} />}
          subtext="Proche de la rupture"
          icon={AlertTriangle}
          tone={lowCount > 0 ? "amber" : "slate"}
        />
        <StatMetricCard
          compact
          label="En rupture"
          value={<AnimatedNumber value={outCount} />}
          subtext="Indisponibles à l'achat"
          icon={AlertCircle}
          tone={outCount > 0 ? "rose" : "slate"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Inventaire par produit */}
        <Card className="border-[#E2E8F0] bg-white lg:col-span-7">
          <CardHeader className="space-y-3 border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold text-[#102A43]">
                Niveaux de stock par produit
              </h2>
              <div className="flex gap-1.5">
                {(
                  [
                    ["all", `Tous (${storeProducts.length})`],
                    ["low", `Faibles (${lowCount})`],
                    ["out", `Ruptures (${outCount})`],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      filter === id
                        ? "bg-[#102A43] text-white"
                        : "bg-[#F8FAFC] text-slate-600 hover:text-[#102A43]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrer un article..."
                className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 text-xs focus:border-[#102A43] focus:bg-white focus:outline-none"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-[#E2E8F0]">
              {filteredProducts.map((p) => {
                const ratio = Math.min(
                  100,
                  Math.round(
                    (p.stock / Math.max(p.lowStockThreshold * 3, 10)) * 100
                  )
                );
                const barColor =
                  p.stock === 0
                    ? "bg-rose-500"
                    : p.stock <= p.lowStockThreshold
                    ? "bg-amber-500"
                    : "bg-[#10B981]";

                return (
                  <div key={p.id} className="px-5 py-4 hover:bg-[#F8FAFC]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-11 w-11 shrink-0 rounded-xl border border-[#E2E8F0] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-bold text-[#102A43]">
                              {p.name}
                            </p>
                            {p.stock === 0 ? (
                              <Badge variant="danger">Rupture</Badge>
                            ) : p.stock <= p.lowStockThreshold ? (
                              <Badge variant="warning">
                                Seuil {p.lowStockThreshold}
                              </Badge>
                            ) : null}
                          </div>
                          <div className="mt-2 h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all ${barColor}`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            adjustStock(
                              activeStore.id,
                              p.id,
                              -1,
                              "Ajustement manuel (-1)"
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-extrabold text-[#102A43]">
                          {p.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            adjustStock(
                              activeStore.id,
                              p.id,
                              +1,
                              "Ajustement manuel (+1)"
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRestockProductId(
                              restockProductId === p.id ? null : p.id
                            )
                          }
                          className="rounded-lg bg-[#10B981]/12 px-2.5 py-1.5 text-xs font-bold text-[#10B981] transition-colors hover:bg-[#10B981] hover:text-white cursor-pointer"
                        >
                          Entrée stock
                        </button>
                      </div>
                    </div>

                    {restockProductId === p.id && (
                      <form
                        onSubmit={handleCustomRestock}
                        className="animate-page-enter mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white p-3"
                      >
                        <input
                          type="number"
                          value={restockQty}
                          onChange={(e) => setRestockQty(e.target.value)}
                          placeholder="Qté"
                          className="h-8.5 w-20 rounded-lg border border-[#E2E8F0] px-2.5 text-xs font-bold text-[#102A43]"
                        />
                        <input
                          value={restockReason}
                          onChange={(e) => setRestockReason(e.target.value)}
                          placeholder="Motif du mouvement..."
                          className="h-8.5 min-w-40 flex-1 rounded-lg border border-[#E2E8F0] px-3 text-xs"
                        />
                        <Button type="submit" variant="primary" size="sm">
                          Valider
                        </Button>
                      </form>
                    )}
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <p className="p-8 text-center text-sm text-slate-500">
                  Aucun produit ne correspond à ce filtre.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Historique des mouvements */}
        <Card className="border-[#E2E8F0] bg-white lg:col-span-5">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-extrabold text-[#102A43]">
              Historique des mouvements ({storeMovements.length})
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#E2E8F0]">
              {storeMovements.slice(0, 14).map((m) => {
                const positive = m.change >= 0;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm"
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          positive
                            ? "bg-emerald-50 text-[#10B981]"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {positive ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#102A43]">
                          {m.productName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {m.reason} · {formatDate(m.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={positive ? "success" : "warning"}>
                      {positive ? `+${m.change}` : m.change}
                    </Badge>
                  </div>
                );
              })}
              {storeMovements.length === 0 && (
                <p className="p-8 text-center text-sm text-slate-500">
                  Aucun mouvement enregistré.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
