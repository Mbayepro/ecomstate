"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Calculator,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ExpenseCategory } from "@/types/domain";

const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  product_purchase: "Achat produits / Réapprovisionnement",
  ads: "Publicités (Meta / TikTok Ads)",
  delivery: "Frais de livraison / Logistique",
  packaging: "Emballage & Impression",
  salary: "Salaires / Commissions équipe",
  other: "Dépenses diverses",
};

export default function FinancesProfitPage() {
  const {
    activeStore,
    orders,
    products,
    expenses,
    couriers,
    saveExpense,
    deleteExpense,
  } = usePlatform();

  const [category, setCategory] = useState<ExpenseCategory>("ads");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const storeOrders = useMemo(
    () =>
      activeStore ? orders.filter((o) => o.storeId === activeStore.id) : [],
    [orders, activeStore]
  );

  const storeExpenses = useMemo(
    () =>
      activeStore
        ? (expenses ?? []).filter((e) => e.storeId === activeStore.id)
        : [],
    [expenses, activeStore]
  );

  const storeCouriers = useMemo(
    () =>
      activeStore
        ? (couriers ?? []).filter((c) => c.storeId === activeStore.id)
        : [],
    [couriers, activeStore]
  );

  if (!activeStore) return null;

  // Règle stricte Section 13.3 : Une commande non livrée n'est JAMAIS considérée comme un revenu final
  const deliveredOrders = storeOrders.filter((o) => o.status === "delivered");
  const pendingOrders = storeOrders.filter(
    (o) =>
      o.status !== "delivered" &&
      o.status !== "cancelled" &&
      o.status !== "returned" &&
      o.status !== "delivery_failed"
  );

  const deliveredRevenue = deliveredOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );
  const pendingPipelineAmount = pendingOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  // Coût d'achat réel des produits effectivement livrés (COGS)
  const deliveredProductsCost = deliveredOrders.reduce((sum, ord) => {
    const orderCost = ord.items.reduce((acc, item) => {
      if (typeof item.costPrice === "number" && item.costPrice > 0) {
        return acc + item.costPrice * item.quantity;
      }
      const p = products.find((pr) => pr.id === item.productId);
      const fallbackCost = p ? (p.costPrice ?? 0) + (p.additionalCost ?? 0) : 0;
      return acc + fallbackCost * item.quantity;
    }, 0);
    return sum + orderCost;
  }, 0);

  const grossMargin = deliveredRevenue - deliveredProductsCost;
  const totalOperatingExpenses = storeExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const netEstimatedProfit = grossMargin - totalOperatingExpenses;

  // Cash effectivement reçu vs Cash encore chez les livreurs
  const cashRemittedOrders = deliveredOrders
    .filter((o) => o.codFinancialStatus === "remitted")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const cashWaitingWithCouriers = Math.max(
    0,
    deliveredRevenue -
      Math.max(
        cashRemittedOrders,
        storeCouriers.reduce((s, c) => s + c.amountRemitted, 0)
      )
  );

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!label.trim() || Number.isNaN(numericAmount) || numericAmount <= 0)
      return;
    saveExpense(activeStore.id, {
      category,
      label,
      amount: numericAmount,
      date: new Date(date).toISOString(),
    });
    setLabel("");
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
        <Badge variant="success">Module 13 · Dépenses & Bénéfice Réel</Badge>
        <h1 className="mt-1.5 text-2xl font-extrabold text-[#15232D]">
          Finances, Marge Brute & Bénéfice Net Réel
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 sm:text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#00A884]" />
          Règle comptable COD stricte : seules les commandes au statut{" "}
          <strong>Livrée</strong> entrent dans le calcul de votre revenu acquis
          et de votre bénéfice net.
        </p>
      </div>

      {/* Cartes de synthèse financière réelle */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-slate-500">
              Revenus Livrés (Acquis)
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#15232D]">
              {formatCurrency(deliveredRevenue, activeStore.currency)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Hors {formatCurrency(pendingPipelineAmount, activeStore.currency)}{" "}
              en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-slate-500">
              Marge Brute (Après coût produits)
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#073B35]">
              {formatCurrency(grossMargin, activeStore.currency)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Coût d&apos;achat déduit :{" "}
              {formatCurrency(deliveredProductsCost, activeStore.currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase text-slate-500">
              Dépenses enregistrées
            </p>
            <p className="mt-2 text-2xl font-extrabold text-rose-700">
              -{formatCurrency(totalOperatingExpenses, activeStore.currency)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {storeExpenses.length} écriture(s) de charges
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            netEstimatedProfit >= 0
              ? "border-2 border-[#00A884] bg-[#E7F7F2]/50"
              : "border-2 border-rose-300 bg-rose-50/50"
          }
        >
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#073B35]">
              <TrendingUp className="h-4 w-4 text-[#00A884]" />
              Bénéfice Net Réel Estimé
            </p>
            <p
              className={`mt-2 text-2xl font-extrabold ${
                netEstimatedProfit >= 0 ? "text-[#073B35]" : "text-rose-700"
              }`}
            >
              {formatCurrency(netEstimatedProfit, activeStore.currency)}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Cash chez livreurs :{" "}
              {formatCurrency(cashWaitingWithCouriers, activeStore.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Saisie d'une dépense */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-[#00A884]" />
            <h2 className="text-sm font-extrabold text-[#15232D]">
              Enregistrer une nouvelle dépense
            </h2>
          </div>

          <form
            onSubmit={handleAddExpense}
            className="mt-4 grid gap-3 sm:grid-cols-5"
          >
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="h-10.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#15232D]"
            >
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, lbl]) => (
                <option key={k} value={k}>
                  {lbl}
                </option>
              ))}
            </select>

            <div className="sm:col-span-2">
              <Input
                placeholder="Intitulé (ex: Sponsoring TikTok 3 jours)"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <Input
              type="number"
              min={1}
              placeholder={`Montant (${activeStore.currency})`}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10.5 w-32 rounded-lg border border-[#E2E8F0] px-2 text-xs"
              />
              <Button type="submit" variant="primary" className="flex-1">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Journal des dépenses */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-extrabold text-[#15232D]">
            Journal des dépenses de {activeStore.name}
          </h2>

          {storeExpenses.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-500">
              Aucune dépense enregistrée. Ajoutez vos budgets publicitaires,
              emballages ou frais logistiques pour affiner votre bénéfice net.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] font-bold text-slate-600">
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Catégorie</th>
                    <th className="px-3 py-2.5">Libellé</th>
                    <th className="px-3 py-2.5 text-right">Montant</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {storeExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="px-3 py-2.5 text-slate-500">
                        {formatDate(exp.date)}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="default">
                          {EXPENSE_CATEGORY_LABELS[exp.category]}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-[#15232D]">
                        {exp.label}
                      </td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-rose-700">
                        -{formatCurrency(exp.amount, activeStore.currency)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => deleteExpense(activeStore.id, exp.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
