"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Download,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/motion";
import {
  DashboardPageHeader,
  StatMetricCard,
} from "@/components/dashboard/page-header";
import { OrderStatusPill } from "@/components/dashboard/status-pill";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardClientsPage() {
  const { activeStore, customers, orders, updateCustomerNotes } = usePlatform();
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<
    "all" | "loyal" | "at_risk" | "new"
  >("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const storeCustomers = useMemo(
    () => customers.filter((c) => c.storeId === activeStore?.id),
    [customers, activeStore?.id]
  );

  const storeOrders = useMemo(
    () => orders.filter((o) => o.storeId === activeStore?.id),
    [orders, activeStore?.id]
  );

  if (!activeStore) return null;

  const computeSegment = (c: (typeof storeCustomers)[number]) => {
    if ((c.returnsCount ?? 0) >= 1 || c.segment === "at_risk") return "at_risk";
    if (c.ordersCount >= 2 || c.segment === "loyal") return "loyal";
    return "new";
  };

  const totalClientSpend = storeCustomers.reduce(
    (sum, c) => sum + c.totalSpent,
    0
  );
  const loyalCount = storeCustomers.filter(
    (c) => computeSegment(c) === "loyal"
  ).length;
  const riskCount = storeCustomers.filter(
    (c) => computeSegment(c) === "at_risk"
  ).length;

  const filtered = storeCustomers.filter((c) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);
    const seg = computeSegment(c);
    const matchSeg = segmentFilter === "all" || seg === segmentFilter;
    return matchQuery && matchSeg;
  });

  const handleExportClientsCsv = () => {
    const header = [
      "NomComplet",
      "Telephone",
      "Ville",
      "Adresse",
      "NbCommandes",
      "NbRetours",
      "TotalDepense",
      "Segment",
    ];
    const rows = filtered.map((c) =>
      [
        `"${c.fullName}"`,
        c.phone,
        `"${c.city}"`,
        `"${c.address}"`,
        c.ordersCount,
        c.returnsCount ?? 0,
        c.totalSpent,
        computeSegment(c),
      ].join(";")
    );
    const csv = "\uFEFF" + [header.join(";"), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${activeStore.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Module 11 · CRM & Segmentation COD"
        title="Clients & Fiabilité de réception"
        description={`Suivez l'historique d'achat, la fidélité et les retours COD de vos ${storeCustomers.length} client(s).`}
        actions={
          <Button variant="outline" size="sm" onClick={handleExportClientsCsv}>
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatMetricCard
          compact
          label="Clients enregistrés"
          value={<AnimatedNumber value={storeCustomers.length} />}
          subtext={`${loyalCount} client(s) fidèle(s)`}
          icon={Users}
          tone="navy"
        />
        <StatMetricCard
          compact
          label="Clients à surveiller (Retours)"
          value={<AnimatedNumber value={riskCount} />}
          subtext="Vérification téléphonique conseillée"
          icon={ShoppingBag}
          tone={riskCount > 0 ? "amber" : "slate"}
        />
        <StatMetricCard
          compact
          label="Valeur cumulée commandée"
          value={
            <AnimatedNumber
              value={totalClientSpend}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext="Toutes commandes confondues"
          icon={Wallet}
          tone="emerald"
        />
      </div>

      {/* Filtres de segmentation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: `Tous (${storeCustomers.length})` },
              { id: "loyal", label: `Fidèles (${loyalCount})` },
              { id: "at_risk", label: `Retours / À risque (${riskCount})` },
              {
                id: "new",
                label: `Nouveaux (${
                  storeCustomers.length - loyalCount - riskCount
                })`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSegmentFilter(tab.id)}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                segmentFilter === tab.id
                  ? "border-[#073B35] bg-[#073B35] text-white"
                  : "border-[#E2E8F0] bg-white text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-60 max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone ou ville..."
            className="h-9.5 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-xs font-medium focus:border-[#00A884] focus:outline-none"
          />
        </div>
      </div>

      <Card className="border-[#E2E8F0] bg-white">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-2.5 text-sm font-semibold text-[#15232D]">
                Aucun client dans ce segment
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {filtered.map((c) => {
                const isOpen = expandedId === c.id;
                const seg = computeSegment(c);
                const cleanPhone = c.phone.replace(/\s+/g, "");
                const clientOrders = storeOrders.filter(
                  (o) =>
                    o.customerId === c.id ||
                    o.customerPhone.replace(/\s+/g, "") === cleanPhone
                );

                return (
                  <div key={c.id}>
                    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-[#F8FAFC]">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#073B35] text-xs font-bold text-white">
                          {c.fullName.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-bold text-[#15232D]">
                              {c.fullName}
                            </p>
                            {seg === "loyal" && (
                              <Badge variant="success">Client fidèle</Badge>
                            )}
                            {seg === "at_risk" && (
                              <Badge variant="warning">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                {c.returnsCount ?? 1} retour(s)
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3 text-[#00A884]" />
                              {c.phone}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {c.address}, {c.city}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-[#15232D]">
                            {formatCurrency(c.totalSpent, activeStore.currency)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {c.ordersCount} cmd · depuis{" "}
                            {formatDate(c.createdAt)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedId(isOpen ? null : c.id)}
                          className="rounded-lg border border-[#E2E8F0] p-2 text-slate-500 hover:bg-slate-50 cursor-pointer"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="space-y-4 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-500">
                            Note interne sur ce client
                          </label>
                          <input
                            value={c.internalNotes ?? ""}
                            onChange={(e) =>
                              updateCustomerNotes(
                                activeStore.id,
                                c.id,
                                e.target.value
                              )
                            }
                            placeholder="Ex : Préfère être livré le matin, client très ponctuel..."
                            className="mt-1 h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs"
                          />
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-bold uppercase text-slate-400">
                            Commandes ({clientOrders.length})
                          </p>
                          <div className="space-y-2">
                            {clientOrders.map((ord) => (
                              <div
                                key={ord.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs"
                              >
                                <div>
                                  <span className="font-mono font-bold text-[#15232D]">
                                    {ord.orderNumber}
                                  </span>
                                  <span className="ml-2 text-slate-500">
                                    {formatDate(ord.createdAt)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-[#15232D]">
                                    {formatCurrency(
                                      ord.totalAmount,
                                      activeStore.currency
                                    )}
                                  </span>
                                  <OrderStatusPill status={ord.status} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
