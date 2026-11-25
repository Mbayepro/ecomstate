"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { usePlatform } from "@/lib/platform-store";
import {
  getStoreSubscriptionHealth,
  PLAN_COMPARISON_ROWS,
} from "@/lib/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SubscriptionPlanCode } from "@/types/domain";

const MOBILE_OPERATORS = [
  "MTN Mobile Money (Bénin / CI)",
  "Moov Money (Bénin / Togo / CI)",
  "Celtiis Cash (Bénin)",
  "Wave (Sénégal / CI / Burkina)",
  "Orange Money",
];

export default function DashboardAbonnementPage() {
  const {
    activeStore,
    plans,
    adminAccount,
    subscriptionPayments,
    submitSubscriptionPayment,
  } = usePlatform();

  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlanCode>("standard");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [operator, setOperator] = useState(MOBILE_OPERATORS[0]);
  const [senderPhone, setSenderPhone] = useState(
    activeStore?.ownerPhone ?? "+229 "
  );
  const [transactionReference, setTransactionReference] = useState("");
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  if (!activeStore) return null;

  const officialPhone = adminAccount?.phone || "+229 95 78 21 32";
  const storePayments = (subscriptionPayments ?? []).filter(
    (p) => p.storeId === activeStore.id
  );

  const currentPlanObj =
    plans.find((p) => p.code === activeStore.planCode) ?? plans[0];
  const chosenPlanObj =
    plans.find((p) => p.code === selectedPlan) ?? plans[0];

  const subHealth = getStoreSubscriptionHealth(activeStore);
  const amountToPay =
    billingCycle === "annual"
      ? chosenPlanObj.annualPrice
      : chosenPlanObj.monthlyPrice;

  const copyOfficialPhone = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(officialPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionReference.trim() || !senderPhone.trim()) return;
    submitSubscriptionPayment({
      storeId: activeStore.id,
      planCode: selectedPlan,
      billingCycle,
      amount: amountToPay,
      operator,
      senderPhone,
      transactionReference,
    });

    setTransactionReference("");
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 5000);
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Système d'abonnements officiel"
        title="Offres Standard & Premium"
        description="Gérez votre formule d'abonnement EcomSate et débloquez les fonctionnalités avancées (Multi-boutiques, Shrine Pro 3, Publicités & Équipe)."
      />

      {/* Statut actuel */}
      <Card className="border-[#E2E8F0] bg-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F7F2] text-[#00A884]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#15232D]">
                  Plan actif : {currentPlanObj?.name}
                </h2>
                <Badge
                  variant={
                    activeStore.status === "active"
                      ? "success"
                      : activeStore.status === "trial"
                      ? "warning"
                      : "danger"
                  }
                >
                  {activeStore.status === "active"
                    ? "Actif"
                    : activeStore.status === "trial"
                    ? "Période d'essai"
                    : "Suspendu"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Boutique :{" "}
                <strong className="text-[#15232D]">
                  {activeStore.customDomain || activeStore.subdomain}
                </strong>{" "}
                · Échéance : <strong>{subHealth.statusLabel}</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Choix Standard vs Premium */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
              1. Choisissez votre plan
            </h3>
            <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-1 text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-[#073B35] text-white"
                    : "text-slate-600"
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-[#073B35] text-white"
                    : "text-slate-600"
                }`}
              >
                Annuel (-2 mois)
              </button>
            </div>
          </div>

          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.code;
            const price =
              billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.code)}
                className={`w-full rounded-2xl border p-4 text-left transition cursor-pointer ${
                  isSelected
                    ? "border-2 border-[#00A884] bg-[#E7F7F2]/40"
                    : "border-[#E2E8F0] bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#15232D]">
                      Plan {plan.name}
                    </span>
                    {plan.code === "premium" && (
                      <Badge variant="success">Multi-boutiques & Shrine 3</Badge>
                    )}
                  </div>
                  <span className="text-base font-extrabold text-[#073B35]">
                    {formatCurrency(price)}
                    <span className="text-[11px] font-normal text-slate-500">
                      {billingCycle === "annual" ? " / an" : " / mois"}
                    </span>
                  </span>
                </div>
                <ul className="mt-2.5 space-y-1 text-xs text-slate-600">
                  {plan.features.slice(0, 4).map((feat) => (
                    <li key={feat} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#00A884]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Règlement Abonnement SaaS */}
        <div className="lg:col-span-7">
          <Card className="border-[#E2E8F0] bg-white">
            <CardHeader className="border-b border-[#E2E8F0] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-5 w-5 text-[#00A884]" />
                  <h3 className="text-base font-extrabold text-[#15232D]">
                    2. Activer ou renouveler mon abonnement SaaS
                  </h3>
                </div>
                <Badge variant="navy">{formatCurrency(amountToPay)}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
              <div className="rounded-2xl border border-[#00A884]/30 bg-[#F8FAFC] p-4">
                <p className="text-xs font-semibold text-slate-600">
                  Montant pour le plan{" "}
                  <strong className="text-[#073B35]">
                    {chosenPlanObj.name}
                  </strong>{" "}
                  : <strong>{formatCurrency(amountToPay)}</strong> sur le compte
                  officiel EcomSate :
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#073B35] text-white">
                      <Phone className="h-4 w-4 text-[#00A884]" />
                    </span>
                    <div>
                      <p className="font-mono text-base font-extrabold text-[#15232D]">
                        {officialPhone}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {adminAccount?.fullName || "Direction EcomSate"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={copyOfficialPhone}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#15232D] cursor-pointer"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#00A884]" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copier
                      </>
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#15232D]">
                      Opérateur Mobile Money
                    </label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm"
                    >
                      {MOBILE_OPERATORS.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Numéro expéditeur"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                  />
                </div>

                <Input
                  label="Référence de transaction SMS"
                  required
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="Ex : ID 2648192045"
                />

                {submittedNotice && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#00A884]/40 bg-[#E7F7F2] p-3.5 text-xs text-[#073B35]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00A884]" />
                    <p className="font-bold">
                      Déclaration transmise à l&apos;administration EcomSate !
                    </p>
                  </div>
                )}

                <Button type="submit" variant="primary" size="md">
                  <CreditCard className="h-4 w-4" />
                  Transmettre ma référence d&apos;abonnement
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tableau comparatif complet des permissions */}
      <Card>
        <CardHeader className="border-b border-[#E2E8F0] px-6 py-4">
          <h3 className="text-sm font-extrabold text-[#15232D]">
            Comparatif détaillé des plans Standard & Premium
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] font-bold text-[#15232D]">
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Standard</th>
                  <th className="bg-[#E7F7F2]/50 px-5 py-3 text-[#073B35]">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {PLAN_COMPARISON_ROWS.map((r) => (
                  <tr key={r.feature}>
                    <td className="px-5 py-2.5 font-semibold text-[#15232D]">
                      {r.feature}
                    </td>
                    <td className="px-5 py-2.5 text-slate-600">{r.standard}</td>
                    <td className="bg-[#E7F7F2]/25 px-5 py-2.5 font-semibold text-[#073B35]">
                      {r.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {storePayments.length > 0 && (
        <Card className="border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] px-6 py-4">
            <h3 className="text-sm font-extrabold text-[#15232D]">
              Historique de vos règlements d&apos;abonnement
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#E2E8F0]">
              {storePayments.map((pay) => (
                <div
                  key={pay.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 text-xs"
                >
                  <div>
                    <p className="font-bold text-[#15232D]">
                      Formule {pay.planCode.toUpperCase()} ·{" "}
                      {formatCurrency(pay.amount, pay.currency)}
                    </p>
                    <p className="mt-0.5 text-slate-500">
                      {pay.operator} · Réf : {pay.transactionReference}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      {formatDate(pay.createdAt)}
                    </span>
                    {pay.status === "pending" ? (
                      <Badge variant="warning">
                        <Clock className="mr-1 inline h-3 w-3" />
                        En attente
                      </Badge>
                    ) : pay.status === "approved" ? (
                      <Badge variant="success">Validé</Badge>
                    ) : (
                      <Badge variant="danger">Refusé</Badge>
                    )}
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
