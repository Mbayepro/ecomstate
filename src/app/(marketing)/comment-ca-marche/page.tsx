import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TIMELINE = [
  {
    step: "Étape 1",
    title: "Inscription & création automatique",
    desc: "Renseignez votre nom, le nom de votre boutique, votre pays et votre numéro WhatsApp. Votre sous-domaine .ecomsate.com est provisionné immédiatement.",
  },
  {
    step: "Étape 2",
    title: "Personnalisation de votre marque",
    desc: "Importez votre logo et votre bannière, choisissez vos couleurs, un modèle de vitrine et vos informations de livraison.",
  },
  {
    step: "Étape 3",
    title: "Ajout de votre catalogue",
    desc: "Créez vos catégories et publiez vos produits avec photos, prix promotionnels, tailles/couleurs et quantités en stock.",
  },
  {
    step: "Étape 4",
    title: "Partage et réception des commandes",
    desc: "Partagez le lien de votre boutique sur vos réseaux sociaux. Vos clients commandent en quelques clics et vous gérez chaque étape depuis votre tableau de bord.",
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="navy">Parcours commerçant</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#102A43]">
            Comment ça marche ?
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Passez d&apos;une page sociale ou d&apos;un commerce physique à une vraie
            boutique en ligne en quelques minutes.
          </p>
        </div>

        <div className="mt-12 space-y-5">
          {TIMELINE.map((item) => (
            <Card key={item.step}>
              <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:gap-6">
                <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#102A43] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  {item.step}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#102A43]">
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
