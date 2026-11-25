import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CguPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="navy">Conditions Générales</Badge>
        <h1 className="mt-3 text-3xl font-extrabold text-[#102A43]">
          Conditions Générales d&apos;Utilisation (CGU)
        </h1>
        <Card className="mt-8">
          <CardContent className="space-y-4 p-7 text-sm leading-relaxed text-slate-600">
            <p>
              <strong>1. Objet du service :</strong> EcomSate est une plateforme
              SaaS permettant aux commerçants et entreprises en Afrique de créer
              et administrer leur boutique en ligne autonome.
            </p>
            <p>
              <strong>2. Responsabilité du commerçant :</strong> Chaque
              commerçant est responsable de la conformité des produits vendus
              sur sa boutique, de l&apos;exactitude de ses prix en FCFA et de la
              livraison des commandes à ses clients.
            </p>
            <p>
              <strong>3. Disponibilité et suspension :</strong> Le maintien en
              ligne de la boutique publique dépend de la validité de la période
              d&apos;essai ou de l&apos;abonnement actif du commerçant.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
