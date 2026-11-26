import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TIMELINE = [
  {
    step: "Étape 01",
    title: "Onboarding guidé en 3 étapes",
    desc: "Choisissez votre secteur d'activité, votre pays et le nom de votre boutique. Votre sous-domaine .ecomsate.com s'initialise immédiatement avec le thème Shrine Pro 3.",
    image: "/images/hero-african-founder-fashion.jpg",
  },
  {
    step: "Étape 02",
    title: "Store Builder & Form Builder 100 % COD",
    desc: "Personnalisez vos sections visuelles et adaptez les champs de votre formulaire paiement à la livraison (ville, quartier, repère, offres Packs Duo/Trio).",
    image: "/images/african-woman-mobile-shopping.jpg",
  },
  {
    step: "Étape 03",
    title: "Catalogue produits, variantes & marges",
    desc: "Ajoutez vos articles avec photos, variantes, stock disponible et coût d'achat pour suivre automatiquement votre marge brute et vos alertes de rupture.",
    image: "/images/hero-african-founder-beauty.jpg",
  },
  {
    step: "Étape 04",
    title: "Commandes, livreurs & bénéfice net réel",
    desc: "Confirmez les commandes reçues, assignez vos livreurs, rapprochez le cash COD encaissé franc par franc et suivez votre vrai bénéfice net avec Adeshina IA.",
    image: "/images/african-cod-delivery-handover.jpg",
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="success">Parcours commerçant COD</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Comment ça marche ?
          </h1>
          <p className="mt-3 text-base text-slate-200">
            Structurez toute votre activité e-commerce paiement à la livraison
            depuis un seul espace intelligent.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TIMELINE.map((item) => (
            <div
              key={item.step}
              className="group overflow-hidden rounded-3xl border border-white/15 bg-white shadow-lg transition hover:-translate-y-1 hover:border-[#00A884]"
            >
              <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="bento-photo-zoom h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#042622]/85 via-transparent to-transparent" />
                <span className="glass-shopify-dark absolute left-4 top-4 rounded-xl px-3 py-1 text-xs font-extrabold text-[#7CE3C8]">
                  {item.step}
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-extrabold text-[#15232D]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.desc}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#073B35]">
                  <Check className="h-4 w-4 text-[#00A884]" />
                  Intégré nativement dans EcomSate
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
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
