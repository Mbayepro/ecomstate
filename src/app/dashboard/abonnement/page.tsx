"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { usePlatform } from "@/lib/platform-store";
import { getStoreSubscriptionHealth } from "@/lib/permissions";
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
  const cleanWhatsappPhone = officialPhone.replace(/[^0-9]/g, "");

  const storePayments = (subscriptionPayments ?? []).filter(
    (p) => p.storeId === activeStore.id
  );

  const currentPlanObj =
    plans.find((p) => p.code === activeStore.planCode) ?? plans[0];
  const chosenPlanObj =
    plans.find((p) => p.code === selectedPlan) ?? plans[0];

  const subHealth = getStoreSubscriptionHealth(activeStore);

  const amountToPay =
    chosenPlanObj.code === "trial"
      ? chosenPlanObj.monthlyPrice
      : billingCycle === "annual"
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
      billingCycle: selectedPlan === "trial" ? "monthly" : billingCycle,
      amount: amountToPay,
      operator,
      senderPhone,
      transactionReference,
    });

    setTransactionReference("");
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 5000);
  };

  const whatsappConfirmUrl = `https://wa.me/${cleanWhatsappPhone}?text=${encodeURIComponent(
    `Bonjour Direction EcomSate,\nJe viens d'effectuer un paiement Mobile Money pour ma boutique "${activeStore.name}" (${activeStore.subdomain}) :\n- Formule : ${chosenPlanObj.name}\n- Montant : ${formatCurrency(amountToPay)}\n- Opérateur : ${operator}\n- Numéro expéditeur : ${senderPhone}\n- Référence SMS : ${transactionReference || "En pièce jointe"}\nMerci d'activer mon abonnement.`
  )}`;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Paiement Mobile Money Direct"
        title="Abonnement & Activation de votre boutique"
        description="Réglez votre activation (2 000 FCFA) ou votre abonnement mensuel directement par Mobile Money (MTN MoMo, Moov Money, Celtiis Cash, Wave) sans carte bancaire."
      />


      {/* Statut actuel de la boutique */}
      <Card className="border-[#E2E8F0] bg-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10B981]/12 text-[#10B981]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#102A43]">
                  Formule actuelle : {currentPlanObj?.name}
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
                    ? "Boutique Active"
                    : activeStore.status === "trial"
                      ? "Période d'essai (30 jours)"
                      : "Suspendue"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Sous-domaine :{" "}
                <span className="font-semibold text-[#102A43]">
                  {activeStore.customDomain || activeStore.subdomain}
                </span>{" "}
                · Échéance :{" "}
                <span className="font-bold text-[#102A43]">
                  {subHealth.statusLabel}
                </span>
                {subHealth.expiresAt
                  ? ` (${formatDate(subHealth.expiresAt)})`
                  : ""}
              </p>

            </div>
          </div>

          <a
            href={whatsappConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-3.5 py-2 text-xs font-bold text-[#059669] transition hover:bg-[#10B981]/20"
          >
            <MessageCircle className="h-4 w-4" />
            Assistance WhatsApp ({officialPhone})
          </a>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Choix de la formule */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
              1. Choisissez la formule
            </h3>
            <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-1 text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-lg px-2.5 py-1 font-semibold cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-[#102A43] text-white"
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
                    ? "bg-[#102A43] text-white"
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
              plan.code === "trial"
                ? plan.monthlyPrice
                : billingCycle === "annual"
                  ? plan.annualPrice
                  : plan.monthlyPrice;
            return (


              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.code)}
                className={`w-full rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#102A43] bg-[#102A43]/[0.03] ring-2 ring-[#102A43]/15"
                    : "border-[#E2E8F0] bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#102A43]">
                      {plan.name}
                    </span>
                    {plan.code === "premium" && (
                      <Badge variant="success">Domaine personnalisé</Badge>
                    )}
                  </div>
                  <span className="text-base font-extrabold text-[#10B981]">
                    {formatCurrency(price)}
                    <span className="text-[11px] font-normal text-slate-500">
                      {plan.code === "trial"
                        ? " / 30j"
                        : billingCycle === "annual"
                          ? " / an"
                          : " / mois"}
                    </span>
                  </span>

                </div>
                <ul className="mt-2.5 space-y-1 text-xs text-slate-600">
                  {plan.features.slice(0, 3).map((feat) => (
                    <li key={feat} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#10B981]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Instructions de transfert Mobile Money & Déclaration */}
        <div className="lg:col-span-7">
          <Card className="border-[#E2E8F0] bg-white">
            <CardHeader className="border-b border-[#E2E8F0] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-5 w-5 text-[#10B981]" />
                  <h3 className="text-base font-extrabold text-[#102A43]">
                    2. Paiement Mobile Money Direct (Sans carte ni formalité)
                  </h3>
                </div>
                <Badge variant="navy">{formatCurrency(amountToPay)}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
              {/* Numéro officiel EcomSate Bénin */}
              <div className="rounded-2xl border border-[#10B981]/30 bg-[#F8FAFC] p-4">
                <p className="text-xs font-semibold text-slate-600">
                  Envoyez{" "}
                  <strong className="text-[#102A43]">
                    {formatCurrency(amountToPay)}
                  </strong>{" "}
                  par transfert Mobile Money (MTN MoMo, Moov Money, Celtiis Cash)
                  au numéro officiel EcomSate :
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#102A43] text-white">
                      <Phone className="h-4 w-4 text-[#10B981]" />
                    </span>
                    <div>
                      <p className="font-mono text-base font-extrabold text-[#102A43]">
                        {officialPhone}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Bénéficiaire :{" "}
                        {adminAccount?.fullName || "Direction EcomSate Bénin"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={copyOfficialPhone}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#102A43] hover:bg-slate-100 cursor-pointer"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#10B981]" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copier le numéro
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Formulaire de déclaration */}
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#102A43]">
                      Réseau Mobile Money utilisé
                    </label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#102A43] focus:border-[#102A43] focus:outline-none"
                    >
                      {MOBILE_OPERATORS.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Votre numéro expéditeur"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                  />
                </div>

                <Input
                  label="Référence / ID de transaction (reçu par SMS)"
                  required
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="Ex : ID 2648192045 ou votre nom"
                />

                {submittedNotice && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <div>
                      <p className="font-bold">
                        Votre déclaration de paiement a été transmise à
                        l&apos;administration EcomSate !
                      </p>
                      <p className="mt-0.5">
                        Vous pouvez également cliquer sur le bouton WhatsApp
                        ci-dessous pour une activation instantanée.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  <Button type="submit" variant="primary" size="md">
                    <CreditCard className="h-4 w-4" />
                    Valider ma référence Mobile Money
                  </Button>

                  <a
                    href={whatsappConfirmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#102A43] bg-white px-4 py-2.5 text-xs font-bold text-[#102A43] transition hover:bg-slate-50"
                  >
                    <MessageCircle className="h-4 w-4 text-[#10B981]" />
                    Envoyer la preuve sur WhatsApp
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historique des paiements déclarés par cette boutique */}
      {storePayments.length > 0 && (
        <Card className="border-[#E2E8F0] bg-white">
          <CardHeader className="border-b border-[#E2E8F0] px-6 py-4">
            <h3 className="text-sm font-extrabold text-[#102A43]">
              Historique de vos règlements Mobile Money
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
                    <p className="font-bold text-[#102A43]">
                      Formule {pay.planCode.toUpperCase()} ·{" "}
                      {formatCurrency(pay.amount, pay.currency)}
                    </p>
                    <p className="mt-0.5 text-slate-500">
                      {pay.operator} · Expéditeur : {pay.senderPhone} · Réf :{" "}
                      <code className="font-semibold text-[#102A43]">
                        {pay.transactionReference}
                      </code>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      {formatDate(pay.createdAt)}
                    </span>
                    {pay.status === "pending" ? (
                      <Badge variant="warning">
                        <Clock className="mr-1 inline h-3 w-3" />
                        En attente de validation
                      </Badge>
                    ) : pay.status === "approved" ? (
                      <Badge variant="success">Validé & Activé</Badge>
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
