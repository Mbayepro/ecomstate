"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Truck,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CodFinancialStatusPill } from "@/components/dashboard/status-pill";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CodFinancialStatus } from "@/types/domain";

export default function LivreursCodPage() {
  const {
    activeStore,
    couriers,
    orders,
    plans,
    saveCourier,
    deleteCourier,
    recordCourierRemittance,
    updateOrderCodFinancialStatus,
  } = usePlatform();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("");
  const [remitAmounts, setRemitAmounts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

  const storeCouriers = useMemo(
    () =>
      activeStore
        ? (couriers ?? []).filter((c) => c.storeId === activeStore.id)
        : [],
    [couriers, activeStore]
  );

  const storeOrders = useMemo(
    () =>
      activeStore ? orders.filter((o) => o.storeId === activeStore.id) : [],
    [orders, activeStore]
  );

  if (!activeStore) return null;

  const plan = plans.find((p) => p.code === activeStore.planCode);
  const maxCouriers = plan?.maxCouriers ?? 5;

  // Calculs de rapprochement financier COD par livreur (Section 12.3)
  const courierStats = storeCouriers.map((c) => {
    const assignedOrders = storeOrders.filter((o) => o.courierId === c.id);
    const inTransit = assignedOrders.filter(
      (o) => o.status === "assigned_courier" || o.status === "shipped"
    );
    const delivered = assignedOrders.filter((o) => o.status === "delivered");
    const returned = assignedOrders.filter(
      (o) => o.status === "returned" || o.status === "delivery_failed"
    );

    const expectedTransitCash = inTransit.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );
    const totalCollectedOnDelivered = delivered.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );
    const remainingToRemit = Math.max(
      0,
      totalCollectedOnDelivered - c.amountRemitted
    );
    const deliveryRate =
      delivered.length + returned.length > 0
        ? Math.round(
            (delivered.length / (delivered.length + returned.length)) * 100
          )
        : null;

    return {
      courier: c,
      assignedCount: assignedOrders.length,
      deliveredCount: delivered.length,
      returnedCount: returned.length,
      expectedTransitCash,
      totalCollectedOnDelivered,
      remainingToRemit,
      deliveryRate,
    };
  });

  const totalCashHeldByCouriers = courierStats.reduce(
    (sum, s) => sum + s.remainingToRemit,
    0
  );
  const totalExpectedInTransit = courierStats.reduce(
    (sum, s) => sum + s.expectedTransitCash,
    0
  );
  const totalRemitted = courierStats.reduce(
    (sum, s) => sum + s.courier.amountRemitted,
    0
  );

  const handleAddCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const res = saveCourier(activeStore.id, {
      name,
      phone,
      zone: zone || "Toutes zones",
      isActive: true,
    });
    if (!res.ok) {
      setFeedback({ type: "err", msg: res.error ?? "Impossible d'ajouter." });
      return;
    }
    setName("");
    setPhone("");
    setZone("");
    setFeedback({
      type: "ok",
      msg: "Livreur enregistré avec succès dans votre boutique.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <Badge variant="success">Module 12 · Livreurs & Rapprochement COD</Badge>
          <h1 className="mt-1.5 text-2xl font-extrabold text-[#15232D]">
            Suivi des Livreurs & Reversements Cash on Delivery
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm">
            Contrôlez les colis confiés, les sommes encaissées chez les clients
            et le cash restant à récupérer auprès de chaque livreur.
          </p>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] px-4 py-2 text-xs font-bold text-[#073B35]">
          Quota livreurs : {storeCouriers.length} /{" "}
          {maxCouriers === null ? "Illimité" : maxCouriers}
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-bold ${
            feedback.type === "ok"
              ? "border-[#00A884]/40 bg-[#E7F7F2] text-[#073B35]"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          {feedback.msg}{" "}
          {feedback.type === "err" && (
            <Link href="/dashboard/abonnement" className="ml-2 underline">
              Passer au plan Premium →
            </Link>
          )}
        </div>
      )}

      {/* KPIs Financiers COD */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-amber-900">
              Cash encaissé à récupérer (Livreurs)
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#15232D]">
              {formatCurrency(totalCashHeldByCouriers, activeStore.currency)}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Commandes livrées non encore reversées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-slate-500">
              Encaissement attendu (En tournée)
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#15232D]">
              {formatCurrency(totalExpectedInTransit, activeStore.currency)}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Colis actuellement entre les mains des livreurs
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#00A884]/35 bg-[#E7F7F2]/40">
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-[#073B35]">
              Total Cash COD reversé en caisse
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#073B35]">
              {formatCurrency(totalRemitted, activeStore.currency)}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Reversements vérifiés et enregistrés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire d'ajout de livreur */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-extrabold text-[#15232D]">
            Ajouter un livreur ou partenaire logistique
          </h2>
          <form
            onSubmit={handleAddCourier}
            className="mt-3 grid gap-3 sm:grid-cols-4"
          >
            <Input
              placeholder="Nom du livreur / société *"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Téléphone joignable *"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              placeholder="Zone couverte (ex: Cotonou & Calavi)"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
            />
            <Button type="submit" variant="primary">
              <Plus className="h-4 w-4" />
              Ajouter le livreur
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tableau de Rapprochement COD par Livreur */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-extrabold text-[#15232D]">
            Grand livre de rapprochement COD par livreur
          </h2>
          {courierStats.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-500">
              Aucun livreur enregistré pour le moment. Ajoutez votre premier
              livreur ci-dessus pour lui assigner des commandes COD.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {courierStats.map((row) => {
                const c = row.courier;
                const val = remitAmounts[c.id] ?? "";
                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#073B35] text-white">
                          <Truck className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-extrabold text-[#15232D]">
                              {c.name}
                            </p>
                            {row.deliveryRate !== null && (
                              <Badge variant="success">
                                {row.deliveryRate} % livrées
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {c.phone} · Zone : {c.zone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={100}
                          placeholder={
                            row.remainingToRemit > 0
                              ? `${row.remainingToRemit}`
                              : "Montant remis"
                          }
                          value={val}
                          onChange={(e) =>
                            setRemitAmounts((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          className="h-9 w-36 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-bold"
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            const num =
                              Number(val) || row.remainingToRemit || 0;
                            if (num <= 0) return;
                            recordCourierRemittance(activeStore.id, c.id, num);
                            setRemitAmounts((prev) => ({
                              ...prev,
                              [c.id]: "",
                            }));
                            setFeedback({
                              type: "ok",
                              msg: `Reversement de ${formatCurrency(num, activeStore.currency)} enregistré pour ${c.name}.`,
                            });
                          }}
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          Encaisser reversement
                        </Button>
                        <button
                          type="button"
                          onClick={() => deleteCourier(activeStore.id, c.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          title="Supprimer ce livreur"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E2E8F0] pt-3 text-xs sm:grid-cols-5">
                      <div>
                        <p className="text-slate-500">Colis assignés</p>
                        <p className="font-extrabold text-[#15232D]">
                          {row.assignedCount} ({row.deliveredCount} livrés /{" "}
                          {row.returnedCount} retours)
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">En tournée (attendu)</p>
                        <p className="font-bold text-[#15232D]">
                          {formatCurrency(
                            row.expectedTransitCash,
                            activeStore.currency
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Encaissé (Livrés)</p>
                        <p className="font-bold text-[#15232D]">
                          {formatCurrency(
                            row.totalCollectedOnDelivered,
                            activeStore.currency
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Déjà reversé</p>
                        <p className="font-bold text-[#00A884]">
                          {formatCurrency(c.amountRemitted, activeStore.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Reste à remettre</p>
                        <p
                          className={`font-extrabold ${
                            row.remainingToRemit > 0
                              ? "text-amber-700"
                              : "text-[#00A884]"
                          }`}
                        >
                          {formatCurrency(
                            row.remainingToRemit,
                            activeStore.currency
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit détaillé des statuts financiers COD par commande */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-extrabold text-[#15232D]">
            Statut financier COD indépendant par commande (Section 12.4)
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] font-bold text-slate-600">
                  <th className="px-3 py-2.5">Commande</th>
                  <th className="px-3 py-2.5">Client</th>
                  <th className="px-3 py-2.5">Livreur</th>
                  <th className="px-3 py-2.5">Montant COD</th>
                  <th className="px-3 py-2.5">Statut financier</th>
                  <th className="px-3 py-2.5">Modifier l&apos;état cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {storeOrders.slice(0, 20).map((ord) => (
                  <tr key={ord.id}>
                    <td className="px-3 py-2.5 font-mono font-bold text-[#15232D]">
                      {ord.orderNumber}
                      <span className="block font-sans text-[10px] font-normal text-slate-400">
                        {formatDate(ord.createdAt)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-[#15232D]">
                      {ord.customerName}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {ord.courierName || "Non assigné"}
                    </td>
                    <td className="px-3 py-2.5 font-extrabold text-[#073B35]">
                      {formatCurrency(ord.totalAmount, activeStore.currency)}
                    </td>
                    <td className="px-3 py-2.5">
                      <CodFinancialStatusPill
                        status={ord.codFinancialStatus ?? "expected"}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={ord.codFinancialStatus ?? "expected"}
                        onChange={(e) =>
                          updateOrderCodFinancialStatus(
                            activeStore.id,
                            ord.id,
                            e.target.value as CodFinancialStatus
                          )
                        }
                        className="h-8 rounded-lg border border-[#E2E8F0] bg-white px-2 text-xs font-semibold text-[#15232D]"
                      >
                        <option value="uncollected">Non encaissé</option>
                        <option value="expected">Encaissement attendu</option>
                        <option value="collected_by_courier">
                          Encaissé par le livreur
                        </option>
                        <option value="partially_remitted">
                          Reversement partiel
                        </option>
                        <option value="remitted">Reversement complet</option>
                        <option value="discrepancy">Écart à vérifier</option>
                      </select>
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
