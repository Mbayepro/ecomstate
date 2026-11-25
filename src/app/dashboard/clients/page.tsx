"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
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
  const { activeStore, customers, orders } = usePlatform();
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const storeCustomers = useMemo(
    () => customers.filter((c) => c.storeId === activeStore?.id),
    [customers, activeStore?.id]
  );

  const storeOrders = useMemo(
    () => orders.filter((o) => o.storeId === activeStore?.id),
    [orders, activeStore?.id]
  );

  const cities = useMemo(
    () => Array.from(new Set(storeCustomers.map((c) => c.city).filter(Boolean))),
    [storeCustomers]
  );

  if (!activeStore) return null;

  const totalClientSpend = storeCustomers.reduce(
    (sum, c) => sum + c.totalSpent,
    0
  );
  const totalOrdersCount = storeCustomers.reduce(
    (sum, c) => sum + c.ordersCount,
    0
  );

  const filtered = storeCustomers.filter((c) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);
    const matchCity = cityFilter === "all" || c.city === cityFilter;
    return matchQuery && matchCity;
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Relation client"
        title="Clients"
        description={`Retrouvez les coordonnées, adresses de livraison et l'historique d'achat de vos ${storeCustomers.length} client(s).`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatMetricCard
          compact
          label="Clients enregistrés"
          value={<AnimatedNumber value={storeCustomers.length} />}
          subtext="Base isolée de votre boutique"
          icon={Users}
          tone="navy"
        />
        <StatMetricCard
          compact
          label="Commandes cumulées"
          value={<AnimatedNumber value={totalOrdersCount} />}
          subtext="Associées à vos clients"
          icon={ShoppingBag}
          tone="sky"
        />
        <StatMetricCard
          compact
          label="Valeur cumulée"
          value={
            <AnimatedNumber
              value={totalClientSpend}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext="Total commandé"
          icon={Wallet}
          tone="emerald"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-60 flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone ou ville..."
            className="h-9.5 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-xs font-medium focus:border-[#102A43] focus:outline-none"
          />
        </div>

        {cities.length > 0 && (
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-9.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#102A43]"
          >
            <option value="all">Toutes les villes</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        )}
      </div>

      <Card className="border-[#E2E8F0] bg-white">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-2.5 text-sm font-semibold text-[#102A43]">
                Aucun client trouvé
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Vos acheteurs apparaissent ici automatiquement dès leur première
                commande.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {filtered.map((c) => {
                const isOpen = expandedId === c.id;
                const cleanPhone = c.phone.replace(/\s+/g, "");
                const clientOrders = storeOrders.filter(
                  (o) =>
                    o.customerId === c.id ||
                    o.customerPhone.replace(/\s+/g, "") === cleanPhone
                );

                return (
                  <div key={c.id}>
                    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#F8FAFC]">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#102A43] text-xs font-bold text-white">
                          {c.fullName.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#102A43]">
                            {c.fullName}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3 text-[#10B981]" />
                              {c.phone}
                            </span>
                            {c.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {c.email}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {c.address}, {c.city}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-[#102A43]">
                            {formatCurrency(c.totalSpent, activeStore.currency)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {c.ordersCount} cmd · depuis{" "}
                            {formatDate(c.createdAt)}
                          </p>
                        </div>

                        <a
                          href={`https://wa.me/${c.phone.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-[#E2E8F0] p-2 text-[#10B981] hover:bg-[#10B981]/10"
                          title="Joindre sur WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isOpen ? null : c.id)
                          }
                          className="rounded-lg border border-[#E2E8F0] p-2 text-slate-500 hover:bg-slate-50 cursor-pointer"
                          title="Historique des commandes"
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
                      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
                        <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                          Historique des commandes ({clientOrders.length})
                        </p>
                        {clientOrders.length === 0 ? (
                          <p className="text-xs text-slate-500">
                            Aucune commande détaillée disponible.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {clientOrders.map((ord) => (
                              <div
                                key={ord.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs"
                              >
                                <div>
                                  <span className="font-mono font-bold text-[#102A43]">
                                    {ord.orderNumber}
                                  </span>
                                  <span className="ml-2 text-slate-500">
                                    {formatDate(ord.createdAt)} ·{" "}
                                    {ord.items.length} article(s)
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-[#102A43]">
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
                        )}
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
