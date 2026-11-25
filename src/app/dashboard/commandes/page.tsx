"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Download,
  MapPin,
  Phone,
  Plus,
  Printer,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import {
  CodFinancialStatusPill,
  OrderStatusPill,
} from "@/components/dashboard/status-pill";
import { usePlatform } from "@/lib/platform-store";
import { ORDER_STATUS_META } from "@/lib/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CodFinancialStatus, Order, OrderStatus } from "@/types/domain";

/**
 * Les 11 statuts officiels du cycle de vie COD (Section 10.5)
 */
const ALL_STATUSES: OrderStatus[] = [
  "new",
  "pending_confirmation",
  "confirmed",
  "preparing",
  "ready_to_ship",
  "assigned_courier",
  "shipped",
  "delivered",
  "delivery_failed",
  "returned",
  "cancelled",
];

export default function DashboardCommandesPage() {
  const {
    activeStore,
    orders,
    products,
    couriers,
    placeOrder,
    updateOrderStatus,
    updateOrderInternalNotes,
    assignOrderCourier,
    updateOrderCodFinancialStatus,
  } = usePlatform();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // Création manuelle de commande (Section 10.6)
  const [mName, setMName] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mCity, setMCity] = useState("");
  const [mAddress, setMAddress] = useState("");
  const [mProductId, setMProductId] = useState("");
  const [mQty, setMQty] = useState("1");
  const [mFee, setMFee] = useState("1500");

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

  const storeCouriers = useMemo(
    () =>
      activeStore
        ? (couriers ?? []).filter((c) => c.storeId === activeStore.id)
        : [],
    [couriers, activeStore]
  );

  const storeProducts = useMemo(
    () =>
      activeStore
        ? products.filter((p) => p.storeId === activeStore.id)
        : [],
    [products, activeStore]
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
      o.deliveryCity.toLowerCase().includes(q) ||
      (o.courierName ?? "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const selectedOrder: Order | null =
    filtered.find((o) => o.id === selectedId) ?? filtered[0] ?? null;

  const getNextLogicalAction = (
    status: OrderStatus
  ): { next: OrderStatus; label: string } | null => {
    switch (status) {
      case "new":
      case "pending_confirmation":
        return { next: "confirmed", label: "Confirmer l'appel client" };
      case "confirmed":
        return { next: "preparing", label: "Passer en préparation" };
      case "preparing":
        return { next: "ready_to_ship", label: "Marquer prête à expédier" };
      case "ready_to_ship":
      case "assigned_courier":
        return { next: "shipped", label: "Démarrer la livraison" };
      case "shipped":
        return { next: "delivered", label: "Confirmer Livraison & COD" };
      default:
        return null;
    }
  };

  const handleExportOrdersCsv = () => {
    const header = [
      "Numero",
      "Date",
      "Client",
      "Telephone",
      "Ville",
      "Adresse",
      "Statut",
      "Livreur",
      "StatutCashCOD",
      "TotalFCFA",
    ];
    const rows = filtered.map((o) =>
      [
        o.orderNumber,
        o.createdAt,
        `"${o.customerName}"`,
        o.customerPhone,
        `"${o.deliveryCity}"`,
        `"${o.deliveryAddress}"`,
        ORDER_STATUS_META[o.status].label,
        o.courierName ?? "",
        o.codFinancialStatus ?? "expected",
        o.totalAmount,
      ].join(";")
    );
    const csv = "\uFEFF" + [header.join(";"), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes-${activeStore.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const prod =
      storeProducts.find((p) => p.id === mProductId) ?? storeProducts[0];
    if (!prod || !mName.trim() || !mPhone.trim()) return;
    const qty = Math.max(1, Number(mQty) || 1);
    const created = placeOrder({
      storeId: activeStore.id,
      customerName: mName,
      customerPhone: mPhone,
      deliveryCity: mCity || activeStore.settings.address,
      deliveryAddress: mAddress || mCity || "Saisie manuelle commerçant",
      paymentMethod: "cash_on_delivery",
      deliveryFee: Number(mFee) || 0,
      internalNotes: "Créée manuellement depuis le back-office",
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          unitPrice: prod.promoPrice ?? prod.price,
          costPrice: (prod.costPrice ?? 0) + (prod.additionalCost ?? 0),
          imageUrl: prod.images[0],
        },
      ],
    });
    setSelectedId(created.id);
    setManualModalOpen(false);
    setMName("");
    setMPhone("");
    setMAddress("");
  };

  const renderOrderDetail = (ord: Order) => {
    const nextAction = getNextLogicalAction(ord.status);

    return (
      <div key={ord.id} className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">
                {ord.orderNumber}
              </span>
              <span className="text-xs text-slate-400">
                · {formatDate(ord.createdAt)}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-extrabold text-[#15232D]">
              {ord.customerName}
            </h2>
          </div>
          <OrderStatusPill status={ord.status} showIcon />
        </div>

        {ord.isDuplicateWarning && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#F4A340]" />
            <span>
              Doublon potentiel détecté (même téléphone & article sous 24h) —
              Vérifiez par appel avant d&apos;expédier.
            </span>
          </div>
        )}

        {nextAction && (
          <Button
            variant="primary"
            className="w-full"
            onClick={() =>
              updateOrderStatus(activeStore.id, ord.id, nextAction.next)
            }
          >
            <Check className="h-4 w-4" />
            {nextAction.label}
          </Button>
        )}

        {/* Cycle 11 statuts + Assignation Livreur + Statut Cash COD */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500">
              Statut logistique (11 états)
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
              className="mt-1 h-9.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#15232D]"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {ORDER_STATUS_META[st].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500">
              Livreur assigné
            </label>
            <select
              value={ord.courierId ?? ""}
              onChange={(e) =>
                assignOrderCourier(
                  activeStore.id,
                  ord.id,
                  e.target.value || null
                )
              }
              className="mt-1 h-9.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#15232D]"
            >
              <option value="">Non assigné</option>
              {storeCouriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.zone})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
          <CodFinancialStatusPill
            status={ord.codFinancialStatus ?? "expected"}
          />
          <div className="flex items-center gap-2">
            <select
              value={ord.codFinancialStatus ?? "expected"}
              onChange={(e) =>
                updateOrderCodFinancialStatus(
                  activeStore.id,
                  ord.id,
                  e.target.value as CodFinancialStatus
                )
              }
              className="h-8 rounded-lg border border-[#E2E8F0] bg-white px-2 text-xs font-semibold"
            >
              <option value="expected">Attendu</option>
              <option value="collected_by_courier">Encaissé livreur</option>
              <option value="partially_remitted">Partiel</option>
              <option value="remitted">Reversé complet</option>
              <option value="uncollected">Non encaissé</option>
              <option value="discrepancy">Écart</option>
            </select>

            <button
              type="button"
              onClick={() => setReceiptOrder(ord)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-bold text-[#15232D] hover:bg-slate-50 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-[#00A884]" />
              Bon COD
            </button>
          </div>
        </div>

        {/* Coordonnées & Champs personnalisés COD */}
        <div className="space-y-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs text-slate-700">
          <p className="flex items-center gap-2 font-bold text-[#15232D]">
            <Phone className="h-3.5 w-3.5 text-[#00A884]" />
            {ord.customerPhone}
            {ord.secondaryPhone ? ` / Secours : ${ord.secondaryPhone}` : ""}
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00A884]" />
            <span>
              {ord.deliveryAddress} — <strong>{ord.deliveryCity}</strong>
            </span>
          </p>
          {ord.customFields && Object.keys(ord.customFields).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(ord.customFields).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#073B35]"
                >
                  {k} : {v}
                </span>
              ))}
            </div>
          )}
          {ord.notes && (
            <p className="rounded bg-white px-2.5 py-1.5 text-[11px] italic">
              Note client : {ord.notes}
            </p>
          )}
        </div>

        {/* Articles */}
        <div className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-white text-xs">
          {ord.items.map((item, idx) => (
            <div
              key={`${item.productId}-${idx}`}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5"
            >
              <div>
                <p className="font-bold text-[#15232D]">{item.productName}</p>
                <p className="text-[11px] text-slate-500">
                  {item.quantity} ×{" "}
                  {formatCurrency(item.unitPrice, activeStore.currency)}
                  {item.variantLabel ? ` · ${item.variantLabel}` : ""}
                </p>
              </div>
              <span className="font-extrabold text-[#15232D]">
                {formatCurrency(item.totalPrice, activeStore.currency)}
              </span>
            </div>
          ))}
          <div className="flex justify-between bg-[#F8FAFC] px-3.5 py-2.5 text-sm font-extrabold text-[#073B35]">
            <span>Total COD (dont livr. {ord.deliveryFee} F)</span>
            <span>{formatCurrency(ord.totalAmount, activeStore.currency)}</span>
          </div>
        </div>

        {/* Notes internes privées */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-500">
            Note interne équipe (non visible par le client)
          </label>
          <input
            value={ord.internalNotes ?? ""}
            onChange={(e) =>
              updateOrderInternalNotes(activeStore.id, ord.id, e.target.value)
            }
            placeholder="Ex : Confirmé par téléphone, livrer après 15h..."
            className="mt-1 h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
          />
        </div>

        {/* Historique auditable des changements de statut */}
        {ord.history && ord.history.length > 0 && (
          <div className="space-y-1.5 border-t border-[#E2E8F0] pt-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-400">
              <Clock className="h-3 w-3" />
              Journal d&apos;audit de la commande
            </p>
            <div className="max-h-32 space-y-1 overflow-y-auto text-[11px] text-slate-600">
              {ord.history.map((h) => (
                <div key={h.id} className="flex justify-between gap-2">
                  <span>
                    <strong>{h.actor}</strong> →{" "}
                    {ORDER_STATUS_META[h.toStatus]?.label ?? h.toStatus}
                    {h.note ? ` (${h.note})` : ""}
                  </span>
                  <span className="shrink-0 text-slate-400">
                    {formatDate(h.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Module 10 · Opérations COD"
        title="Commandes (11 Statuts)"
        description={`Pilotez la confirmation téléphonique, les livreurs et l'encaissement COD de vos ${storeOrders.length} commande(s).`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportOrdersCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setMProductId(storeProducts[0]?.id ?? "");
                setManualModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Commande manuelle
            </Button>
          </div>
        }
      />

      {/* Filtres des 11 statuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
            statusFilter === "all"
              ? "border-[#073B35] bg-[#073B35] text-white"
              : "border-[#E2E8F0] bg-white text-slate-600"
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
              className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                active
                  ? "border-[#073B35] bg-[#073B35] text-white"
                  : "border-[#E2E8F0] bg-white text-slate-600"
              }`}
            >
              {ORDER_STATUS_META[st].label} ({count})
            </button>
          );
        })}
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="N° commande, nom client, téléphone, livreur ou ville..."
          className="h-9.5 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-xs font-medium text-[#15232D] focus:border-[#00A884] focus:outline-none"
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
                <p className="mt-2.5 text-sm font-semibold text-[#15232D]">
                  Aucune commande dans cette vue
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
                        active ? "bg-[#E7F7F2]/50" : "hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#15232D]">
                            {ord.orderNumber}
                          </span>
                          <OrderStatusPill status={ord.status} />
                          {ord.isDuplicateWarning && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                              Doublon ?
                            </span>
                          )}
                        </div>
                        <p className="truncate text-sm font-semibold text-[#15232D]">
                          {ord.customerName} ·{" "}
                          <span className="font-normal text-slate-500">
                            {ord.deliveryCity}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {ord.courierName
                            ? `Livreur : ${ord.courierName} · `
                            : ""}
                          {formatDate(ord.createdAt)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold text-[#073B35]">
                          {formatCurrency(
                            ord.totalAmount,
                            activeStore.currency
                          )}
                        </p>
                        <div className="mt-1">
                          <CodFinancialStatusPill
                            status={ord.codFinancialStatus ?? "expected"}
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

        <Card className="hidden border-[#E2E8F0] bg-white lg:col-span-5 lg:block">
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

      {/* Détail mobile */}
      {mobileDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs lg:hidden">
          <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">
                Détail commande COD
              </span>
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderOrderDetail(selectedOrder)}
          </div>
        </div>
      )}

      {/* Modal Création Manuelle de Commande */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#15232D]">
                Créer une commande COD manuelle
              </h3>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="rounded p-1 text-slate-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {storeProducts.length === 0 ? (
              <p className="py-6 text-xs text-slate-600">
                Créez d&apos;abord au moins un produit dans votre catalogue avant
                de saisir une commande manuelle.
              </p>
            ) : (
              <form onSubmit={handleCreateManualOrder} className="mt-4 space-y-3">
                <Input
                  label="Nom du client *"
                  required
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                />
                <Input
                  label="Téléphone *"
                  required
                  value={mPhone}
                  onChange={(e) => setMPhone(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Ville / Zone"
                    value={mCity}
                    onChange={(e) => setMCity(e.target.value)}
                  />
                  <Input
                    label="Frais livraison"
                    type="number"
                    value={mFee}
                    onChange={(e) => setMFee(e.target.value)}
                  />
                </div>
                <Input
                  label="Quartier & Adresse"
                  value={mAddress}
                  onChange={(e) => setMAddress(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#15232D]">
                      Produit
                    </label>
                    <select
                      value={mProductId}
                      onChange={(e) => setMProductId(e.target.value)}
                      className="mt-1.5 h-10.5 w-full rounded-lg border border-[#E2E8F0] px-2 text-xs"
                    >
                      {storeProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatCurrency(p.promoPrice ?? p.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Qté"
                    type="number"
                    min={1}
                    value={mQty}
                    onChange={(e) => setMQty(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setManualModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Enregistrer la commande
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bon de livraison COD imprimable */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dashed border-[#CBD5E1] pb-4">
              <div>
                <p className="text-base font-extrabold text-[#15232D]">
                  {activeStore.name}
                </p>
                <p className="text-xs text-slate-500">
                  Bon de Livraison Cash on Delivery (COD)
                </p>
              </div>
              <span className="rounded-lg bg-[#073B35] px-2.5 py-1 font-mono text-xs font-bold text-white">
                {receiptOrder.orderNumber}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#F8FAFC] p-3.5 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Destinataire
                </p>
                <p className="mt-0.5 font-bold text-[#15232D]">
                  {receiptOrder.customerName}
                </p>
                <p className="text-slate-600">{receiptOrder.customerPhone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Adresse & Livreur
                </p>
                <p className="mt-0.5 font-semibold text-[#15232D]">
                  {receiptOrder.deliveryAddress}
                </p>
                <p className="text-slate-600">
                  {receiptOrder.courierName || "Livraison directe"}
                </p>
              </div>
            </div>

            <div className="mt-4 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0] text-xs">
              {receiptOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2.5"
                >
                  <span>
                    {item.quantity} × {item.productName}{" "}
                    {item.variantLabel ? `(${item.variantLabel})` : ""}
                  </span>
                  <span className="font-bold">
                    {formatCurrency(item.totalPrice, activeStore.currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between text-base font-extrabold text-[#073B35]">
              <span>Montant à encaisser à la livraison :</span>
              <span className="text-[#00A884]">
                {formatCurrency(receiptOrder.totalAmount, activeStore.currency)}
              </span>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReceiptOrder(null)}
              >
                Fermer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
