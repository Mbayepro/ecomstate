"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const ITEMS = [
  {
    q: "Dans quels pays EcomSate est-il disponible ?",
    a: "EcomSate est disponible au Bénin, au Sénégal, en Côte d'Ivoire, au Togo et au Burkina Faso, avec une architecture prête à évoluer à l'international.",
  },
  {
    q: "Quelles sont les offres d'abonnement EcomSate ?",
    a: "EcomSate propose deux formules sans commission (0 % sur vos commandes) : le plan Standard à 7 500 FCFA / mois (ou 75 000 FCFA / an) et le plan Premium à 15 000 FCFA / mois (ou 150 000 FCFA / an).",
  },
  {
    q: "Comment mes clients passent-ils et paient-ils leurs commandes ?",
    a: "Exclusivement en paiement à la livraison (Cash on Delivery — COD) via le formulaire intégré personnalisable (Form Builder COD) directement sur votre boutique. Aucun parcours de commande WhatsApp ni paiement en ligne n'est imposé au client.",
  },
  {
    q: "Mon numéro de téléphone personnel est-il affiché publiquement sur ma boutique ?",
    a: "Non. Conformément aux règles de confidentialité EcomSate, aucun numéro du propriétaire n'est affiché publiquement sur la vitrine client.",
  },
  {
    q: "Puis-je gérer ma boutique, mes livreurs et mes bénéfices depuis mon téléphone ?",
    a: "Oui, le Store Builder, le Form Builder COD, les 11 statuts de commande, le rapprochement des encaissements livreurs et Adeshina IA sont 100 % optimisés mobile-first pour Android et iPhone.",
  },
  {
    q: "Le nom de domaine personnalisé m'appartient-il ?",
    a: "Oui, tout nom de domaine acheté ou connecté avec l'offre Premium reste votre propriété exclusive avec certificat HTTPS automatique.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="success">Centre d&apos;aide EcomSate</Badge>
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
                <span className="font-semibold text-[#073B35]">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[#00A884] transition-transform ${
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
