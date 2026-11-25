"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const ITEMS = [
  {
    q: "Dans quels pays EcomSate est-il disponible ?",
    a: "EcomSate est lancé au Bénin, au Sénégal, en Côte d'Ivoire, au Togo et au Burkina Faso, avec une ouverture progressive vers d'autres pays francophones.",
  },
  {
    q: "Combien coûte le démarrage ?",
    a: "L'activation coûte 2 000 FCFA en paiement unique et inclut 30 jours d'essai complet. Ensuite, vous choisissez Standard (7 500 FCFA/mois) ou Premium (15 000 FCFA/mois).",
  },
  {
    q: "Puis-je gérer ma boutique uniquement depuis mon téléphone ?",
    a: "Oui, l'interface commerçant comme la boutique publique sont pensées mobile-first pour Android et iPhone.",
  },
  {
    q: "Comment mes clients paient-ils leurs commandes ?",
    a: "Paiement à la livraison, commande directe via WhatsApp et paiement manuel par Mobile Money avec confirmation par vos soins.",
  },
  {
    q: "Que se passe-t-il à la fin des 30 jours d'essai ?",
    a: "Vous recevez des notifications avant l'échéance afin de choisir votre abonnement. En cas d'expiration, vos données sont conservées et votre boutique est réactivée dès le renouvellement.",
  },
  {
    q: "Le nom de domaine personnalisé m'appartient-il ?",
    a: "Oui, tout nom de domaine acheté ou connecté avec l'offre Premium reste votre propriété exclusive.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="success">Centre d&apos;aide</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Questions fréquentes
          </h1>
        </div>


        <div className="mt-10 space-y-3">
          {ITEMS.map((item, idx) => (
            <Card key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(open === idx ? null : idx)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
              >
                <span className="font-semibold text-[#102A43]">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
                    open === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === idx && (
                <div className="border-t border-[#E2E8F0] px-5 py-4 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
