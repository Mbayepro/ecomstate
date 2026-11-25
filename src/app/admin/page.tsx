"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  Check,
  Download,
  Eye,
  EyeOff,
  ExternalLink,
  Globe,
  KeyRound,
  Layers,
  MessageCircle,
  ShieldCheck,
  Store as StoreIcon,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/lib/platform-store";
import { getStoreSubscriptionHealth } from "@/lib/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { StoreStatus, SubscriptionPlanCode } from "@/types/domain";

type AdminTab =
  | "merchants"
  | "finance"
  | "plans"
  | "countries"
  | "audit"
  | "account";


export default function AdminDashboardPage() {
  const {
    stores,
    orders,
    plans,
    modules,
    countries,
    auditLogs,
    adminAccount,
    subscriptionPayments,
    adminReviewSubscriptionPayment,
    adminUpdateStoreStatus,
    adminUpdateStorePlan,
    adminUpdatePlan,
    adminToggleModuleInPlan,
    adminToggleCountry,
    adminUpdateCredentials,
  } = usePlatform();


  const [tab, setTab] = useState<AdminTab>("merchants");

  const [adminName, setAdminName] = useState(
    adminAccount?.fullName ?? "Direction EcomSate Bénin"
  );
  const [adminEmail, setAdminEmail] = useState(
    adminAccount?.email ?? "admin@ecomsate.bj"
  );
  const [adminSecondaryEmail, setAdminSecondaryEmail] = useState(
    adminAccount?.secondaryEmail ?? "admin@ecomsate.com"
  );
  const [adminPhone, setAdminPhone] = useState(
    adminAccount?.phone ?? "+229 95 78 21 32"
  );

  const [adminPassword, setAdminPassword] = useState(
    adminAccount?.password ?? "EcomSate@2026!"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (!adminAccount) return;
    setAdminName(adminAccount.fullName);
    setAdminEmail(adminAccount.email);
    setAdminSecondaryEmail(adminAccount.secondaryEmail);
    setAdminPhone(adminAccount.phone);
    setAdminPassword(adminAccount.password);
  }, [adminAccount]);

  const handleSaveAdminAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || adminPassword.length < 6) return;
    adminUpdateCredentials({
      fullName: adminName.trim() || "Direction EcomSate Bénin",
      email: adminEmail.trim(),
      secondaryEmail: adminSecondaryEmail.trim(),
      phone: adminPhone.trim(),
      password: adminPassword,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };


  const activeStoresCount = stores.filter((s) => s.status === "active").length;
  const trialStoresCount = stores.filter((s) => s.status === "trial").length;
  const totalGmv = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const approvedPayments = (subscriptionPayments ?? []).filter(
    (p) => p.status === "approved"
  );
  const pendingPayments = (subscriptionPayments ?? []).filter(
    (p) => p.status === "pending"
  );
  const totalSaasRevenue = approvedPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const activationRevenue = approvedPayments
    .filter((p) => p.planCode === "trial")
    .reduce((sum, p) => sum + p.amount, 0);
  const recurringRevenue = approvedPayments
    .filter((p) => p.planCode !== "trial")
    .reduce((sum, p) => sum + p.amount, 0);

  const exportFinanceCsv = () => {
    const header =
      "Date,Boutique,Commercant,Formule,Cycle,Montant,Devise,Operateur,Expediteur,Reference,Statut\n";
    const rows = (subscriptionPayments ?? [])
      .map(
        (p) =>
          `"${p.createdAt}","${p.storeName}","${p.merchantName}","${p.planCode}","${p.billingCycle || "monthly"}",${p.amount},"${p.currency}","${p.operator}","${p.senderPhone}","${p.transactionReference}","${p.status}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenus-ecomsate-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-[#E2E8F0] bg-[#102A43] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo light href="/" />
            <Badge variant="success">Administration générale</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Espace commerçant
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* KPIs globaux plateforme */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-xs text-slate-500">Boutiques inscrites</p>
                <p className="mt-1 text-2xl font-bold text-[#102A43]">
                  {stores.length}
                </p>
                <p className="mt-0.5 text-xs text-[#10B981]">
                  {activeStoresCount} actives · {trialStoresCount} en essai
                </p>
              </div>
              <StoreIcon className="h-5 w-5 text-[#102A43]" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-xs text-slate-500">Volume d&apos;affaires (GMV)</p>
                <p className="mt-1 text-2xl font-bold text-[#102A43]">
                  {formatCurrency(totalGmv)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {orders.length} commande(s) traitée(s)
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-[#10B981]" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-xs text-slate-500">Pays actifs</p>
                <p className="mt-1 text-2xl font-bold text-[#102A43]">
                  {countries.filter((c) => c.isActive).length} / {countries.length}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Zone FCFA (UEMOA)</p>
              </div>
              <Globe className="h-5 w-5 text-[#102A43]" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-xs text-slate-500">Sécurité & Audit</p>
                <p className="mt-1 text-2xl font-bold text-[#102A43]">
                  {auditLogs.length}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Opérations journalisées
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-[#10B981]" />
            </CardContent>
          </Card>
        </div>

        {/* Navigation onglets */}
        <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-3">
          {(
            [
              ["merchants", "Commerçants & Boutiques", StoreIcon],
              ["finance", "Revenus & Finances", Wallet],
              ["plans", "Abonnements & Modules", Layers],
              ["countries", "Pays & Paiements", Globe],
              ["audit", "Journal d'audit", Activity],
              ["account", "Identifiants Admin (Bénin)", KeyRound],
            ] as const


          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                tab === id
                  ? "bg-[#102A43] text-white"
                  : "bg-white text-slate-600 border border-[#E2E8F0] hover:text-[#102A43]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1 : COMMERÇANTS & BOUTIQUES */}
        {tab === "merchants" && (
          <div className="space-y-6">
            {/* Paiements Mobile Money directs (Sans NINEA / RCCM) à valider */}
            <Card className="border-[#10B981]/30 bg-white">
              <CardHeader className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-base font-bold text-[#102A43]">
                    Paiements Mobile Money reçus au{" "}
                    {adminAccount?.phone || "+229 95 78 21 32"} (Sans NINEA / RCCM)
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Vérifiez le SMS Mobile Money reçu sur votre téléphone puis
                    cliquez sur « Valider & Activer » pour activer la boutique en
                    1 clic.
                  </p>
                </div>
                <Badge variant="success">
                  {
                    (subscriptionPayments ?? []).filter(
                      (p) => p.status === "pending"
                    ).length
                  }{" "}
                  en attente
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {(subscriptionPayments ?? []).length === 0 ? (
                  <p className="px-5 py-6 text-xs text-slate-500">
                    Aucun paiement Mobile Money déclaré pour le moment. Lorsqu&apos;un
                    commerçant déclare un transfert depuis{" "}
                    <code className="font-semibold text-[#102A43]">
                      /dashboard/abonnement
                    </code>
                    , il s&apos;affiche ici pour validation en 1 clic.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E2E8F0]">
                    {(subscriptionPayments ?? []).map((pay) => (
                      <div
                        key={pay.id}
                        className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#102A43]">
                              {pay.storeName}
                            </span>
                            <Badge variant="navy">
                              Formule {pay.planCode.toUpperCase()}
                            </Badge>
                            <span className="font-extrabold text-[#10B981]">
                              {formatCurrency(pay.amount, pay.currency)}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600">
                            {pay.operator} · Expéditeur :{" "}
                            <strong className="text-[#102A43]">
                              {pay.senderPhone}
                            </strong>{" "}
                            · Référence SMS :{" "}
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-[#102A43]">
                              {pay.transactionReference}
                            </code>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {pay.status === "pending" ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  adminReviewSubscriptionPayment(
                                    pay.id,
                                    "approved"
                                  )
                                }
                              >
                                <Check className="h-3.5 w-3.5" />
                                Valider & Activer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  adminReviewSubscriptionPayment(
                                    pay.id,
                                    "rejected"
                                  )
                                }
                              >
                                Refuser
                              </Button>
                            </>
                          ) : pay.status === "approved" ? (
                            <Badge variant="success">Validé & Activé</Badge>
                          ) : (
                            <Badge variant="danger">Refusé</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base font-bold text-[#102A43]">
                  Supervision des commerçants et boutiques
                </h2>
              </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Boutique</th>
                      <th className="px-5 py-3 font-medium">Commerçant</th>
                      <th className="px-5 py-3 font-medium">Pays</th>
                      <th className="px-5 py-3 font-medium">Échéance</th>
                      <th className="px-5 py-3 font-medium">Formule</th>
                      <th className="px-5 py-3 font-medium">Statut</th>
                      <th className="px-5 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {stores.map((s) => {
                      const health = getStoreSubscriptionHealth(s);
                      const cleanPhone = (
                        s.ownerPhone ||
                        s.settings.whatsappPhone ||
                        ""
                      ).replace(/[^0-9]/g, "");
                      return (
                      <tr key={s.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#102A43]">{s.name}</p>
                          <p className="text-xs text-slate-500">
                            {s.customDomain || s.subdomain}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-[#102A43]">
                            {s.ownerName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {s.ownerEmail}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-slate-700">
                          {s.countryCode} ({s.currency})
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <Badge
                            variant={
                              health.isExpired
                                ? "danger"
                                : health.isExpiringSoon
                                  ? "warning"
                                  : "success"
                            }
                          >
                            {health.statusLabel}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={s.planCode}
                            onChange={(e) =>
                              adminUpdateStorePlan(
                                s.id,
                                e.target.value as SubscriptionPlanCode
                              )
                            }
                            className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#102A43]"
                          >
                            <option value="trial">Essai</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={s.status}
                            onChange={(e) =>
                              adminUpdateStoreStatus(
                                s.id,
                                e.target.value as StoreStatus
                              )
                            }
                            className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#102A43]"
                          >
                            <option value="trial">Essai</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspendue</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-3">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                  `Bonjour ${s.ownerName}, ici la Direction EcomSate concernant votre boutique ${s.name} (${s.subdomain}).`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#10B981]"
                                title="Contacter le commerçant sur WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WhatsApp
                              </a>
                            )}
                            <Link
                              href={`/s/${s.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981] hover:underline"
                            >
                              Visiter
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                    })}

                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          </div>
        )}


        {/* TAB FINANCES & REVENUS ECOMSATE (PHASE 2) */}
        {tab === "finance" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500">
                    Revenus SaaS EcomSate encaissés
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#10B981]">
                    {formatCurrency(totalSaasRevenue)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {approvedPayments.length} transaction(s) validée(s)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500">
                    Activations initiales (2 000 FCFA)
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#102A43]">
                    {formatCurrency(activationRevenue)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Ouvertures de boutiques (30j)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500">
                    Abonnements Standard & Premium
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#102A43]">
                    {formatCurrency(recurringRevenue)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Revenus récurrents mensuels / annuels
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500">
                    Paiements Mobile Money à valider
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-600">
                    {pendingPayments.length}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Sur {adminAccount?.phone || "+229 95 78 21 32"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-base font-bold text-[#102A43]">
                    Grand livre des transactions & abonnements Mobile Money
                  </h2>
                  <p className="text-xs text-slate-500">
                    Historique complet des règlements d&apos;activation et
                    d&apos;abonnements des commerçants.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={exportFinanceCsv}>
                  <Download className="h-3.5 w-3.5" />
                  Exporter en CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Boutique</th>
                        <th className="px-5 py-3 font-medium">Formule</th>
                        <th className="px-5 py-3 font-medium">Montant</th>
                        <th className="px-5 py-3 font-medium">Opérateur & Réf</th>
                        <th className="px-5 py-3 font-medium">Statut</th>
                        <th className="px-5 py-3 text-right font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {(subscriptionPayments ?? []).map((pay) => (
                        <tr key={pay.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {formatDate(pay.createdAt)}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-[#102A43]">
                              {pay.storeName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {pay.merchantName} ({pay.senderPhone})
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            <Badge variant="navy">
                              {pay.planCode.toUpperCase()} (
                              {pay.billingCycle === "annual"
                                ? "Annuel"
                                : "Mensuel"}
                              )
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 font-extrabold text-[#102A43]">
                            {formatCurrency(pay.amount, pay.currency)}
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            <p className="text-slate-700">{pay.operator}</p>
                            <code className="font-bold text-[#102A43]">
                              {pay.transactionReference}
                            </code>
                          </td>
                          <td className="px-5 py-3.5">
                            {pay.status === "approved" ? (
                              <Badge variant="success">Validé</Badge>
                            ) : pay.status === "pending" ? (
                              <Badge variant="warning">En attente</Badge>
                            ) : (
                              <Badge variant="danger">Refusé</Badge>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {pay.status === "pending" ? (
                              <div className="inline-flex gap-1.5">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() =>
                                    adminReviewSubscriptionPayment(
                                      pay.id,
                                      "approved"
                                    )
                                  }
                                >
                                  Valider
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    adminReviewSubscriptionPayment(
                                      pay.id,
                                      "rejected"
                                    )
                                  }
                                >
                                  Refuser
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Traité
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2 : ABONNEMENTS & MODULES CENTRALISÉS */}

        {tab === "plans" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[#102A43]">{plan.name}</h3>
                      <Badge variant="navy">{plan.code}</Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <label className="block text-slate-500">
                        Tarif mensuel ({plan.currency})
                      </label>
                      <input
                        type="number"
                        value={plan.monthlyPrice}
                        onChange={(e) =>
                          adminUpdatePlan(plan.id, {
                            monthlyPrice: Number(e.target.value) || 0,
                          })
                        }
                        className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 font-semibold text-[#102A43]"
                      />
                    </div>
                    <div className="space-y-2 text-xs">
                      <label className="block text-slate-500">
                        Limite produits (vide = illimité)
                      </label>
                      <input
                        type="number"
                        value={plan.maxProducts ?? ""}
                        placeholder="Illimité"
                        onChange={(e) =>
                          adminUpdatePlan(plan.id, {
                            maxProducts: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 font-semibold text-[#102A43]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <h2 className="text-base font-bold text-[#102A43]">
                  Matrice centralisée des modules & permissions
                </h2>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-medium">Module</th>
                        <th className="px-5 py-3 text-center font-medium">
                          Essai
                        </th>
                        <th className="px-5 py-3 text-center font-medium">
                          Standard
                        </th>
                        <th className="px-5 py-3 text-center font-medium">
                          Premium
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {modules.map((mod) => (
                        <tr key={mod.key}>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-[#102A43]">
                              {mod.label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {mod.description}
                            </p>
                          </td>
                          {(["trial", "standard", "premium"] as const).map(
                            (planCode) => (
                              <td
                                key={planCode}
                                className="px-5 py-3.5 text-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={mod.enabledInPlans.includes(planCode)}
                                  onChange={() =>
                                    adminToggleModuleInPlan(mod.key, planCode)
                                  }
                                  className="h-4 w-4 cursor-pointer accent-[#10B981]"
                                />
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3 : PAYS & PRESTATAIRES */}
        {tab === "countries" && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-[#102A43]">
                Configuration multi-pays, devises & moyens de paiement
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E2E8F0]">
                {countries.map((c) => (
                  <div
                    key={c.code}
                    className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold text-[#102A43]">
                        {c.name} ({c.code}) · {c.currency} · {c.phonePrefix}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Paiements configurés : {c.paymentProviders.join(", ")}
                      </p>
                    </div>
                    <Button
                      variant={c.isActive ? "primary" : "outline"}
                      size="sm"
                      onClick={() => adminToggleCountry(c.code)}
                    >
                      {c.isActive ? "Actif" : "Inactif"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4 : JOURNAL D'AUDIT */}
        {tab === "audit" && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-[#102A43]">
                Journalisation des opérations sensibles
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E2E8F0]">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="navy">{log.action}</Badge>
                        <span className="text-xs text-slate-500">
                          par {log.actorEmail}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-700">
                        {log.details}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5 : COMPTE SUPER ADMIN & IDENTIFIANTS MODIFIABLES */}
        {tab === "account" && (
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#102A43]">
                    Paramètres du compte Super Administrateur
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Modifiez vos coordonnées de direction, votre numéro Mobile
                    Money de réception et votre mot de passe.
                  </p>
                </div>
                <Badge variant="success">Direction EcomSate</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveAdminAccount} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nom de l'administrateur"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Direction EcomSate Bénin"
                  />
                  <Input
                    label="Téléphone Mobile Money & WhatsApp"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="+229 95 78 21 32"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="E-mail de connexion principal"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@ecomsate.bj"
                  />
                  <Input
                    label="E-mail secondaire"
                    type="email"
                    value={adminSecondaryEmail}
                    onChange={(e) => setAdminSecondaryEmail(e.target.value)}
                    placeholder="contact@ecomsate.com"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#102A43]">
                    Mot de passe Super Administrateur
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 pr-11 text-sm font-medium text-[#102A43] focus:border-[#102A43] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#102A43] cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {savedNotice && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
                    <Check className="h-4 w-4 text-[#10B981]" />
                    Les nouveaux identifiants Super Administrateur ont été
                    enregistrés.
                  </div>
                )}

                <Button type="submit" variant="primary" size="md">
                  Enregistrer les modifications
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>


    </div>
  );
}
