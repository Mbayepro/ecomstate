import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TIMELINE = [
  {
    step: "Étape 1",
    title: "Onboarding guidé en 3 étapes",
    desc: "Choisissez votre secteur d'activité, votre pays, le nom de votre boutique et votre thème Shrine Pro. Votre sous-domaine .ecomsate.com est prêt immédiatement.",
  },
  {
    step: "Étape 2",
    title: "Store Builder & Form Builder COD",
    desc: "Personnalisez vos sections visuelles et adaptez les champs de votre formulaire 100 % paiement à la livraison (ville, quartier, repère, offres Packs Duo/Trio).",
  },
  {
    step: "Étape 3",
    title: "Catalogue produits & marges",
    desc: "Ajoutez vos articles avec photos, variantes, stock disponible et coût d'achat pour suivre automatiquement votre marge brute.",
  },
  {
    step: "Étape 4",
    title: "Commandes, livreurs & bénéfice réel",
    desc: "Confirmez les commandes reçues, assignez vos livreurs, rapprochez le cash COD encaissé et suivez votre vrai bénéfice net avec l'aide d'Adeshina IA.",
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="success">Parcours commerçant COD</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Comment ça marche ?
          </h1>
          <p className="mt-3 text-base text-slate-200">
            Structurez toute votre activité e-commerce paiement à la livraison
            depuis un seul espace intelligent.
          </p>
        </div>

        <div className="mt-12 space-y-5">
          {TIMELINE.map((item) => (
            <Card key={item.step} className="card-motion">
              <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:gap-6">
                <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#073B35] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  {item.step}
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-[#15232D]">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/creer-une-boutique">
            <Button variant="primary" size="lg">
              Lancer ma boutique maintenant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
