"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_PLANS } from "@/lib/permissions";
import { formatCurrency } from "@/lib/utils";

export default function TarifsPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="success">Tarifs & Abonnements</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Des prix simples, sans commissions cachées sur vos ventes
          </h1>
          <p className="mt-3 text-base text-slate-300">
            Démarrez avec 2 000 FCFA (paiement unique) pour 30 jours d&apos;essai,
            puis choisissez la formule adaptée à votre volume.
          </p>


          <div className="mt-6 inline-flex items-center rounded-xl border border-[#E2E8F0] bg-white p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-lg px-4 py-2 text-sm font-medium cursor-pointer ${
                !annual ? "bg-[#102A43] text-white" : "text-slate-600"
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium cursor-pointer ${
                annual ? "bg-[#102A43] text-white" : "text-slate-600"
              }`}
            >
              Annuel (2 mois offerts)
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {DEFAULT_PLANS.map((plan) => {
            const isTrial = plan.code === "trial";
            const isPremium = plan.code === "premium";
            const price = isTrial
              ? plan.monthlyPrice
              : annual
              ? plan.annualPrice
              : plan.monthlyPrice;

            return (
              <Card
                key={plan.id}
                className={
                  isPremium
                    ? "border-2 border-[#102A43] shadow-md"
                    : "border-[#E2E8F0]"
                }
              >
                <CardContent className="flex h-full flex-col p-7">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#102A43]">
                      {plan.name}
                    </h2>
                    {isPremium && <Badge variant="success">Populaire</Badge>}
                    {isTrial && <Badge variant="info">Démarrage</Badge>}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#102A43]">
                      {formatCurrency(price, plan.currency)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {isTrial ? "une seule fois" : `/ ${annual ? "an" : "mois"}`}
                    </span>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/creer-une-boutique" className="mt-8 block">
                    <Button
                      variant={isPremium ? "primary" : "secondary"}
                      size="lg"
                      className="w-full"
                    >
                      {isTrial ? "Activer mon essai" : `Choisir ${plan.name}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
