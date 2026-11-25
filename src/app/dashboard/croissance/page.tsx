"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  Lock,
  Megaphone,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { canUseModule } from "@/lib/permissions";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdCampaign } from "@/types/domain";

export default function CroissancePubsAutomationsPage() {
  const {
    activeStore,
    modules,
    products,
    orders,
    adCampaigns,
    automations,
    saveAdCampaign,
    toggleAdCampaign,
    deleteAdCampaign,
    saveAutomation,
    toggleAutomation,
    testAutomation,
  } = usePlatform();

  // États Campagne Pub
  const [platform, setPlatform] =
    useState<AdCampaign["platform"]>("Meta (Facebook / Instagram)");
  const [campName, setCampName] = useState("");
  const [budget, setBudget] = useState("");
  const [spent, setSpent] = useState("");
  const [productId, setProductId] = useState("");
  const [manualOrders, setManualOrders] = useState("");

  // États Automatisation
  const [autoName, setAutoName] = useState("");
  const [trigger, setTrigger] = useState("Nouvelle commande COD reçue");
  const [condition, setCondition] = useState("Montant supérieur à 25 000 FCFA");
  const [action, setAction] = useState(
    "Alerter l'équipe confirmation en priorité"
  );
  const [activeTab, setActiveTab] = useState<"ads" | "automations">("ads");

  const storeCampaigns = useMemo(
    () =>
      activeStore
        ? (adCampaigns ?? []).filter((c) => c.storeId === activeStore.id)
        : [],
    [adCampaigns, activeStore]
  );

  const storeAutomations = useMemo(
    () =>
      activeStore
        ? (automations ?? []).filter((a) => a.storeId === activeStore.id)
        : [],
    [automations, activeStore]
  );

  const storeProducts = useMemo(
    () =>
      activeStore
        ? products.filter((p) => p.storeId === activeStore.id)
        : [],
    [products, activeStore]
  );

  const storeOrders = useMemo(
    () =>
      activeStore ? orders.filter((o) => o.storeId === activeStore.id) : [],
    [orders, activeStore]
  );

  if (!activeStore) return null;

  const isPremiumAllowed = canUseModule(
    activeStore.planCode,
    "advanced_analytics",
    modules
  );

  const totalAdSpent = storeCampaigns.reduce((s, c) => s + c.spent, 0);
  const deliveredRevenue = storeOrders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.totalAmount, 0);
  const globalRoas =
    totalAdSpent > 0 ? (deliveredRevenue / totalAdSpent).toFixed(2) : null;

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) return;
    saveAdCampaign(activeStore.id, {
      platform,
      name: campName,
      budget: Number(budget) || 0,
      spent: Number(spent) || 0,
      productId: productId || undefined,
      manualLeadsOrOrders: Number(manualOrders) || 0,
      startDate: new Date().toISOString().split("T")[0],
      status: "active",
    });
    setCampName("");
    setBudget("");
    setSpent("");
    setManualOrders("");
  };

  const handleAddAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoName.trim()) return;
    saveAutomation(activeStore.id, {
      name: autoName,
      trigger,
      condition,
      action,
      enabled: true,
    });
    setAutoName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#15232D]">
            Publicités & Automatisations
          </h1>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Suivez la rentabilité de vos publicités sur commandes livrées ou
            activez des règles automatiques.
          </p>
        </div>

        {!isPremiumAllowed && (
          <Link href="/dashboard/abonnement">
            <Button variant="primary" size="sm">
              <Lock className="h-3.5 w-3.5" />
              Débloquer en Premium
            </Button>
          </Link>
        )}
      </div>

      {/* Onglets simples : un seul outil affiché à la fois */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("ads")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "ads"
              ? "bg-[#073B35] text-white shadow-2xs"
              : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
          }`}
        >
          <Megaphone className="h-4 w-4 text-[#00A884]" />
          1. Mes Publicités & Rentabilité ROAS ({storeCampaigns.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("automations")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "automations"
              ? "bg-[#073B35] text-white shadow-2xs"
              : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
          }`}
        >
          <Zap className="h-4 w-4 text-[#00A884]" />
          2. Mes Règles Automatiques ({storeAutomations.length})
        </button>
      </div>

      {activeTab === "ads" && (
        <>
          {/* Synthèse ROAS Réel */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Dépenses Publicitaires Cumulées
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#15232D]">
                  {formatCurrency(totalAdSpent, activeStore.currency)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {storeCampaigns.length} campagne(s) suivie(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Ventes Livrées (Base ROAS)
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#073B35]">
                  {formatCurrency(deliveredRevenue, activeStore.currency)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Commandes réellement livrées uniquement
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#00A884]/40 bg-[#E7F7F2]/40">
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase text-[#073B35]">
                  Rentabilité Pub (ROAS)
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#00A884]">
                  {globalRoas ? `${globalRoas}x` : "Aucune dépense pub"}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Ventes livrées ÷ Budget pub dépensé
                </p>
              </CardContent>
            </Card>
          </div>

          {/* SECTION 16 : Campagnes Publicitaires */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#00A884]" />
                <h2 className="text-base font-extrabold text-[#15232D]">
                  Mes Campagnes Publicitaires (Facebook, TikTok, Snapchat)
                </h2>
              </div>

          {isPremiumAllowed && (
            <form
              onSubmit={handleAddCampaign}
              className="grid gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-6"
            >
              <select
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value as AdCampaign["platform"])
                }
                className="h-10 rounded-lg border border-[#E2E8F0] bg-white px-2 text-xs font-semibold"
              >
                <option value="Meta (Facebook / Instagram)">Meta Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="Snapchat">Snapchat</option>
                <option value="Autre">Autre canal</option>
              </select>

              <Input
                placeholder="Nom campagne *"
                required
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Dépensé *"
                required
                value={spent}
                onChange={(e) => setSpent(e.target.value)}
              />
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="h-10 rounded-lg border border-[#E2E8F0] bg-white px-2 text-xs"
              >
                <option value="">Tous produits</option>
                {storeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="primary" size="sm">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </form>
          )}

          {storeCampaigns.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              Aucune campagne enregistrée pour cette boutique.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] font-bold text-slate-600">
                    <th className="px-3 py-2.5">Plateforme & Nom</th>
                    <th className="px-3 py-2.5">Budget</th>
                    <th className="px-3 py-2.5">Dépensé</th>
                    <th className="px-3 py-2.5">Coût / Cmd</th>
                    <th className="px-3 py-2.5">Statut</th>
                    <th className="px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {storeCampaigns.map((c) => {
                    const cpa =
                      c.manualLeadsOrOrders && c.manualLeadsOrOrders > 0
                        ? Math.round(c.spent / c.manualLeadsOrOrders)
                        : null;
                    return (
                      <tr key={c.id}>
                        <td className="px-3 py-2.5">
                          <p className="font-bold text-[#15232D]">{c.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {c.platform} · Depuis {c.startDate}
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          {formatCurrency(c.budget, activeStore.currency)}
                        </td>
                        <td className="px-3 py-2.5 font-extrabold text-rose-700">
                          {formatCurrency(c.spent, activeStore.currency)}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-[#073B35]">
                          {cpa
                            ? formatCurrency(cpa, activeStore.currency)
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant={
                              c.status === "active" ? "success" : "default"
                            }
                          >
                            {c.status === "active" ? "Active" : "En pause"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                toggleAdCampaign(activeStore.id, c.id)
                              }
                              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
                            >
                              {c.status === "active" ? (
                                <Pause className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                deleteAdCampaign(activeStore.id, c.id)
                              }
                              className="rounded p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </>
      )}

      {/* SECTION 17 : Automatisations (Déclencheur -> Conditions -> Action) */}
      {activeTab === "automations" && (
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#00A884]" />
            <h2 className="text-base font-extrabold text-[#15232D]">
              Mes Règles Automatiques (Quand → Si → Alors)
            </h2>
          </div>

          {isPremiumAllowed && (
            <form
              onSubmit={handleAddAutomation}
              className="grid gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-4"
            >
              <Input
                placeholder="Nom de la règle *"
                required
                value={autoName}
                onChange={(e) => setAutoName(e.target.value)}
              />
              <Input
                placeholder="Déclencheur"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
              />
              <Input
                placeholder="Condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Action"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                />
                <Button type="submit" variant="primary" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {storeAutomations.map((auto) => (
              <div
                key={auto.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#15232D]">
                      {auto.name}
                    </span>
                    <Badge variant={auto.enabled ? "success" : "default"}>
                      {auto.enabled ? "Activée" : "Désactivée"}
                    </Badge>
                  </div>
                  <p className="text-slate-600">
                    <strong>Quand :</strong> {auto.trigger} ·{" "}
                    <strong>Si :</strong> {auto.condition} →{" "}
                    <strong className="text-[#073B35]">{auto.action}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Exécutions enregistrées : {auto.runsCount}
                    {auto.lastRunAt
                      ? ` · Dernier déclenchement : ${formatDate(auto.lastRunAt)}`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testAutomation(activeStore.id, auto.id)}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#00A884]" />
                    Tester
                  </Button>
                  <Button
                    size="sm"
                    variant={auto.enabled ? "secondary" : "primary"}
                    onClick={() => toggleAutomation(activeStore.id, auto.id)}
                  >
                    {auto.enabled ? "Désactiver" : "Activer"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
