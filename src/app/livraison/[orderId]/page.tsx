"use client";

import Link from "next/link";
import React, { use, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Package,
  PhoneCall,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { usePlatform } from "@/lib/platform-store";
import { ORDER_STATUS_META } from "@/lib/permissions";
import { formatCurrency } from "@/lib/utils";

export default function CourierQrScanValidationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const {
    stores,
    orders,
    updateOrderStatus,
    updateOrderCodFinancialStatus,
  } = usePlatform();

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const order = orders.find((o) => o.id === orderId) ?? null;
  const store = order
    ? stores.find((s) => s.id === order.storeId) ?? null
    : null;

  if (!order || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <Package className="h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-extrabold text-[#15232D]">
          Bon de livraison introuvable
        </h1>
        <p className="mt-2 max-w-sm text-xs text-slate-500">
          Ce QR Code ne correspond à aucune commande enregistrée sur cet appareil.
        </p>
        <Link
          href="/dashboard/commandes"
          className="mt-5 rounded-xl bg-[#073B35] px-4 py-2.5 text-xs font-extrabold text-white"
        >
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === "delivered";
  const isFailed =
    order.status === "delivery_failed" || order.status === "returned";

  const handleConfirmDeliveryAndCash = () => {
    updateOrderStatus(store.id, order.id, "delivered");
    updateOrderCodFinancialStatus(store.id, order.id, "collected_by_courier");
    setActionMessage(
      "Livraison validée ! Le colis est marqué Livré et le cash est enregistré sur le compte livreur."
    );
  };

  const handleReportFailure = () => {
    updateOrderStatus(store.id, order.id, "delivery_failed");
    updateOrderCodFinancialStatus(store.id, order.id, "uncollected");
    setActionMessage(
      "Échec signalé : le commerçant est prévenu et le numéro est signalé au Bouclier Anti-Refus."
    );
  };

  return (
    <div className="min-h-screen bg-[#042622] px-4 py-6 text-white">
      <div className="mx-auto max-w-md space-y-4">
        {/* En-tête fiche terrain livreur */}
        <div className="rounded-3xl border border-white/15 bg-[#073B35] p-5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00A884]/25 px-3 py-1 text-[11px] font-extrabold text-[#7CE3C8]">
              <Truck className="h-3.5 w-3.5" />
              Fiche Terrain Livreur COD
            </span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs font-bold">
              {order.orderNumber}
            </span>
          </div>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Boutique : {store.name}
          </p>

          {/* Montant géant à encaisser */}
          <div className="mt-4 rounded-2xl bg-white p-4 text-center text-[#15232D] shadow-md">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Cash à encaisser à la remise
            </p>
            <p className="mt-1 text-3xl font-black tracking-tight text-[#073B35]">
              {formatCurrency(order.totalAmount, store.currency)}
            </p>
            <p className="mt-1 text-[11px] font-bold text-[#00A884]">
              Statut actuel : {ORDER_STATUS_META[order.status]?.label}
            </p>
          </div>
        </div>

        {/* Coordonnées client + Appel 1 clic */}
        <div className="space-y-3 rounded-3xl bg-white p-5 text-[#15232D] shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">
                Client destinataire
              </p>
              <p className="text-lg font-black text-[#15232D]">
                {order.customerName}
              </p>
              <p className="text-xs font-bold text-slate-600">
                {order.customerPhone}
              </p>
            </div>

            <a
              href={`tel:${order.customerPhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#00A884] px-4 py-3 text-xs font-extrabold text-white shadow-sm"
            >
              <PhoneCall className="h-4 w-4" />
              Appeler
            </a>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] p-3.5 text-xs">
            <p className="flex items-start gap-2 font-semibold text-[#15232D]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00A884]" />
              <span>
                {order.deliveryAddress} — <strong>{order.deliveryCity}</strong>
              </span>
            </p>
            {order.courierName && (
              <p className="mt-1.5 pl-6 text-[11px] text-slate-500">
                Livreur assigné : <strong>{order.courierName}</strong>
              </p>
            )}
          </div>

          {/* Contenu du colis */}
          <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2 text-xs">
            {order.items.map((it, idx) => (
              <div
                key={`${it.productId}-${idx}`}
                className="flex items-center justify-between py-2"
              >
                <span className="font-bold text-[#15232D]">
                  {it.quantity} × {it.productName}
                  {it.variantLabel ? ` (${it.variantLabel})` : ""}
                </span>
                <span className="font-extrabold text-slate-700">
                  {formatCurrency(it.totalPrice, store.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {actionMessage && (
          <div className="rounded-2xl border border-[#00A884] bg-[#E7F7F2] p-4 text-xs font-extrabold text-[#073B35]">
            {actionMessage}
          </div>
        )}

        {/* 2 Gros Boutons d'Action Terrain en 1 Clic */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleConfirmDeliveryAndCash}
            disabled={isDelivered}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#00A884] px-5 py-4 text-sm font-black text-white shadow-lg transition hover:bg-[#009474] disabled:opacity-60 cursor-pointer"
          >
            <CheckCircle2 className="h-5 w-5" />
            {isDelivered
              ? "Colis déjà validé Livré & Cash encaissé"
              : "Valider : Colis remis & Cash encaissé"}
          </button>

          <button
            type="button"
            onClick={handleReportFailure}
            disabled={isDelivered || isFailed}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-950/60 px-5 py-3.5 text-xs font-extrabold text-rose-200 transition hover:bg-rose-900/70 disabled:opacity-50 cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Signaler : Client injoignable ou refus
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00A884]" />
            Validation sécurisée EcomSate COD
          </span>
          <Link
            href="/dashboard/commandes"
            className="inline-flex items-center gap-1 font-bold text-[#7CE3C8] hover:underline"
          >
            <Wallet className="h-3.5 w-3.5" />
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
