"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_PLANS, PLAN_COMPARISON_ROWS } from "@/lib/permissions";
import { formatCurrency } from "@/lib/utils";

export default function TarifsPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="bg-[#F8FAFC] py-16 text-[#15232D]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="success">Système d&apos;abonnements officiel</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#15232D]">
            Deux formules transparentes, 0 % de commission sur vos commandes
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Choisissez l&apos;offre adaptée à votre stade de croissance :{" "}
            <strong>Standard</strong> pour structurer une boutique COD rentable,
            ou <strong>Premium</strong> pour le multi-boutiques, Shrine Pro 3,
            le suivi publicitaire et la gestion d&apos;équipe.
          </p>

          <div className="mt-6 inline-flex items-center rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                !annual
                  ? "bg-[#073B35] text-white"
                  : "text-slate-600 hover:text-[#15232D]"
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                annual
                  ? "bg-[#073B35] text-white"
                  : "text-slate-600 hover:text-[#15232D]"
              }`}
            >
              Annuel (2 mois offerts)
            </button>
          </div>
        </div>

        {/* Cartes Standard & Premium */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
          {DEFAULT_PLANS.map((plan) => {
            const isPremium = plan.code === "premium";
            const price = annual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <Card
                key={plan.id}
                className={
                  isPremium
                    ? "border-2 border-[#00A884] bg-white shadow-xl"
                    : "border border-[#E2E8F0] bg-white shadow-sm"
                }
              >
                <CardContent className="flex h-full flex-col p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#00A884]">
                        Offre {plan.name}
                      </span>
                      <h2 className="mt-1 text-2xl font-extrabold text-[#15232D]">
                        Plan {plan.name}
                      </h2>
                    </div>
                    {isPremium ? (
                      <Badge variant="success">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Croissance & Multi-boutiques
                      </Badge>
                    ) : (
                      <Badge variant="navy">Essentiel COD</Badge>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5 border-y border-[#E2E8F0] py-5">
                    <span className="text-4xl font-extrabold text-[#073B35]">
                      {formatCurrency(price, plan.currency)}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      / {annual ? "an" : "mois"}
                    </span>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3 text-sm text-[#15232D]">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00A884]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/creer-une-boutique?plan=${plan.code}`}
                    className="mt-8 block"
                  >
                    <Button
                      variant={isPremium ? "primary" : "secondary"}
                      size="lg"
                      className="w-full"
                    >
                      Démarrer avec le plan {plan.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tableau comparatif officiel Standard vs Premium (Section 5.3) */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] bg-[#073B35] px-6 py-5 text-white">
            <h2 className="text-xl font-bold">
              Comparateur détaillé : Standard vs Premium
            </h2>
            <p className="mt-1 text-xs text-[#E7F7F2]">
              Toutes les limites et permissions sont gérées dynamiquement selon
              votre plan actif.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-[#15232D]">
                  <th className="px-6 py-4">Fonctionnalité / Module</th>
                  <th className="px-6 py-4">Standard (7 500 FCFA/mois)</th>
                  <th className="bg-[#E7F7F2]/60 px-6 py-4 text-[#073B35]">
                    Premium (15 000 FCFA/mois)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {PLAN_COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-3.5 font-semibold text-[#15232D]">
                      {row.feature}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {row.standard}
                    </td>
                    <td className="bg-[#E7F7F2]/30 px-6 py-3.5 font-semibold text-[#073B35]">
                      {row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
