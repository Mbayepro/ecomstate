import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ConditionsCommercialesPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="success">Conditions Commerciales</Badge>
        <h1 className="mt-3 text-3xl font-extrabold text-white">
          Conditions Commerciales & Abonnements EcomSate
        </h1>

        <Card className="mt-8">
          <CardContent className="space-y-4 p-7 text-sm leading-relaxed text-slate-600">
            <p>
              <strong>1. Activation & Période d&apos;essai (30 jours) :</strong>{" "}
              L&apos;ouverture d&apos;une boutique s&apos;accompagne de frais
              d&apos;activation uniques de <strong>2 000 FCFA</strong> donnant
              accès à 30 jours complets d&apos;utilisation.
            </p>
            <p>
              <strong>2. Formules Standard & Premium :</strong> L&apos;offre
              Standard est facturée <strong>7 500 FCFA / mois</strong> (ou{" "}
              <strong>75 000 FCFA / an</strong>) et l&apos;offre Premium{" "}
              <strong>15 000 FCFA / mois</strong> (ou{" "}
              <strong>150 000 FCFA / an</strong>). EcomSate ne prélève aucune
              commission sur le chiffre d&apos;affaires des commerçants.
            </p>
            <p>
              <strong>3. Modalités de règlement :</strong> Les règlements
              s&apos;effectuent par Mobile Money (MTN MoMo, Moov Money, Celtiis
              Cash, Wave) au numéro officiel indiqué dans l&apos;espace
              commerçant et sont validés par l&apos;administration EcomSate.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
