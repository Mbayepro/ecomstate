"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import {
  OrderStatusPill,
  PaymentMethodPill,
} from "@/components/dashboard/status-pill";
import { usePlatform } from "@/lib/platform-store";
import { ORDER_STATUS_META } from "@/lib/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/domain";

const ALL_STATUSES: OrderStatus[] = [
  "new",
  "pending_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

const WORKFLOW_STEPS: { status: OrderStatus; short: string }[] = [
  { status: "new", short: "Reçue" },
  { status: "confirmed", short: "Confirmée" },
  { status: "preparing", short: "Préparation" },
  { status: "shipped", short: "Expédiée" },
  { status: "delivered", short: "Livrée" },
];

export default function DashboardCommandesPage() {
  const { activeStore, orders, updateOrderStatus } = usePlatform();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const storeOrders = useMemo(
    () =>
      orders
        .filter((o) => o.storeId === activeStore?.id)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [orders, activeStore?.id]
  );

  if (!activeStore) return null;

  const filtered = storeOrders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      o.deliveryCity.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const selectedOrder: Order | null =
    filtered.find((o) => o.id === selectedId) ?? filtered[0] ?? null;

  const getStepIndex = (status: OrderStatus) => {
    if (status === "cancelled") return -1;
    if (status === "pending_confirmation") return 0;
    return WORKFLOW_STEPS.findIndex((s) => s.status === status);
  };

  const getNextLogicalAction = (
    status: OrderStatus
  ): { next: OrderStatus; label: string } | null => {
    switch (status) {
      case "new":
      case "pending_confirmation":
        return { next: "confirmed", label: "Confirmer la commande" };
      case "confirmed":
        return { next: "preparing", label: "Passer en préparation" };
      case "preparing":
        return { next: "shipped", label: "Marquer expédiée" };
      case "shipped":
        return { next: "delivered", label: "Confirmer la livraison" };
      default:
        return null;
    }
  };

  const renderOrderDetail = (ord: Order) => {
    const currentStepIdx = getStepIndex(ord.status);
    const nextAction = getNextLogicalAction(ord.status);
    const cleanPhone = ord.customerPhone.replace(/[^\d]/g, "");
    const whatsappHref = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Bonjour ${ord.customerName}, concernant votre commande ${ord.orderNumber} chez ${activeStore.name}.`
    )}`;

    return (
      <div key={ord.id} className="animate-tab-panel space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">
                {ord.orderNumber}
              </span>
              <span className="text-xs text-slate-400">
                · {formatDate(ord.createdAt)}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-extrabold text-[#102A43]">
              {ord.customerName}
            </h2>
          </div>
          <OrderStatusPill status={ord.status} showIcon />
        </div>

        {/* Bouton d'avancement rapide en 1 clic (esprit Shafrik) */}
        {nextAction && (
          <Button
            variant="primary"
            className="w-full"
            onClick={() =>
              updateOrderStatus(activeStore.id, ord.id, nextAction.next)
            }
          >
            {nextAction.next === "shipped" ||
            nextAction.next === "delivered" ? (
              <Truck className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {nextAction.label}
          </Button>
        )}

        {/* Progression visuelle */}
        {ord.status !== "cancelled" && (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <div className="flex items-center justify-between gap-1">
              {WORKFLOW_STEPS.map((step, idx) => {
                const done = idx <= currentStepIdx;
                return (
                  <div
                    key={step.status}
                    className="flex flex-1 flex-col items-center gap-1.5 text-center"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                        done
                          ? "bg-[#10B981] text-white"
                          : "border border-[#E2E8F0] bg-white text-slate-400"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        done ? "text-[#102A43]" : "text-slate-400"
                      }`}
                    >
                      {step.short}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sélecteur manuel complet + WhatsApp */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Statut personnalisé
            </label>
            <select
              value={ord.status}
              onChange={(e) =>
                updateOrderStatus(
                  activeStore.id,
                  ord.id,
                  e.target.value as OrderStatus
                )
              }
              className="h-9.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#102A43] focus:border-[#102A43] focus:outline-none cursor-pointer"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {ORDER_STATUS_META[st].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9.5 w-full items-center justify-center gap-2 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-3 text-xs font-bold text-[#102A43] transition-colors hover:bg-[#10B981] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp client
            </a>
          </div>
        </div>

        {/* Coordonnées & Livraison */}
        <div className="space-y-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs text-slate-700">
          <p className="flex items-center gap-2 font-medium text-[#102A43]">
            <Phone className="h-3.5 w-3.5 text-[#10B981]" />
            {ord.customerPhone}
            {ord.customerEmail ? ` · ${ord.customerEmail}` : ""}
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]" />
            <span>
              {ord.deliveryAddress}, <strong>{ord.deliveryCity}</strong>
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-2.5">
            <PaymentMethodPill method={ord.paymentMethod} />
            {ord.paymentReference && (
              <span className="font-mono text-[11px] font-semibold text-[#102A43]">
                Réf : {ord.paymentReference}
              </span>
            )}
          </div>
          {ord.notes && (
            <p className="rounded-lg bg-white px-3 py-2 text-[11px] italic text-slate-600">
              Note : {ord.notes}
            </p>
          )}
        </div>

        {/* Articles */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Articles commandés ({ord.items.length})
          </p>
          <div className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-white">
            {ord.items.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#102A43]">
                    {item.productName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} ×{" "}
                    {formatCurrency(item.unitPrice, activeStore.currency)}
                    {item.variantLabel ? ` · ${item.variantLabel}` : ""}
                  </p>
                </div>
                <span className="shrink-0 font-bold text-[#102A43]">
                  {formatCurrency(item.totalPrice, activeStore.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="space-y-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Sous-total articles</span>
            <span>{formatCurrency(ord.subtotal, activeStore.currency)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Frais de livraison</span>
            <span>{formatCurrency(ord.deliveryFee, activeStore.currency)}</span>
          </div>
          <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-base font-extrabold text-[#102A43]">
            <span>Total</span>
            <span>{formatCurrency(ord.totalAmount, activeStore.currency)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Ventes & Expéditions"
        title="Commandes"
        description={`Suivez, confirmez et livrez vos ${storeOrders.length} commande(s) reçue(s).`}
      />

      {/* Onglets de statut avec compteurs réels */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            statusFilter === "all"
              ? "border-[#102A43] bg-[#102A43] text-white"
              : "border-[#E2E8F0] bg-white text-slate-600 hover:text-[#102A43]"
          }`}
        >
          Toutes ({storeOrders.length})
        </button>
        {ALL_STATUSES.map((st) => {
          const count = storeOrders.filter((o) => o.status === st).length;
          const active = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? "border-[#102A43] bg-[#102A43] text-white"
                  : "border-[#E2E8F0] bg-white text-slate-600 hover:text-[#102A43]"
              }`}
            >
              {ORDER_STATUS_META[st].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="N° commande, nom client, téléphone ou ville..."
          className="h-9.5 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-xs font-medium text-[#1E293B] focus:border-[#102A43] focus:outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-[#E2E8F0] bg-white lg:col-span-7">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {filtered.length} commande{filtered.length > 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-2.5 text-sm font-semibold text-[#102A43]">
                  Aucune commande correspondante
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {filtered.map((ord) => {
                  const active = selectedOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(ord.id);
                        setMobileDetailOpen(true);
                      }}
                      className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors cursor-pointer ${
                        active
                          ? "bg-[#102A43]/[0.04]"
                          : "hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#102A43]">
                            {ord.orderNumber}
                          </span>
                          <OrderStatusPill status={ord.status} />
                        </div>
                        <p className="truncate text-sm font-semibold text-[#102A43]">
                          {ord.customerName} ·{" "}
                          <span className="font-normal text-slate-500">
                            {ord.deliveryCity}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {ord.items.length} article(s) ·{" "}
                          {formatDate(ord.createdAt)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold text-[#102A43]">
                          {formatCurrency(
                            ord.totalAmount,
                            activeStore.currency
                          )}
                        </p>
                        <div className="mt-1.5">
                          <PaymentMethodPill
                            method={ord.paymentMethod}
                            compact
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hidden border-[#E2E8F0] bg-white lg:block lg:col-span-5">
          <CardContent className="p-6">
            {!selectedOrder ? (
              <p className="py-16 text-center text-sm text-slate-500">
                Sélectionnez une commande pour afficher son détail.
              </p>
            ) : (
              renderOrderDetail(selectedOrder)
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tiroir mobile */}
      {mobileDetailOpen && selectedOrder && (
        <div className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#0B1F33]/50 backdrop-blur-xs lg:hidden">
          <div className="animate-modal-in max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Détail commande
              </span>
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderOrderDetail(selectedOrder)}
          </div>
        </div>
      )}
    </div>
  );
}
