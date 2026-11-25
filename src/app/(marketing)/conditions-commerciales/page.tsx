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
              <strong>1. Formules d&apos;abonnement Standard & Premium :</strong>{" "}
              EcomSate propose deux formules transparentes sans aucune commission
              sur vos ventes : l&apos;offre <strong>Standard</strong> à{" "}
              <strong>7 500 FCFA / mois</strong> (ou{" "}
              <strong>75 000 FCFA / an</strong>) et l&apos;offre{" "}
              <strong>Premium</strong> à <strong>15 000 FCFA / mois</strong> (ou{" "}
              <strong>150 000 FCFA / an</strong>).
            </p>
            <p>
              <strong>2. Commandes boutiques clientes (100 % COD) :</strong> Les
              commandes passées par les acheteurs finaux sur les boutiques
              hébergées par EcomSate s&apos;effectuent exclusivement en paiement
              à la livraison (Cash on Delivery). Le règlement des abonnements
              SaaS EcomSate par le commerçant constitue un système distinct.
            </p>
            <p>
              <strong>3. Règlement et continuité des données :</strong> Les
              abonnements commerçants sont réglés depuis l&apos;espace{" "}
              <em>Mon abonnement</em> et validés par l&apos;administration
              EcomSate. En cas d&apos;expiration, les données de la boutique
              restent préservées jusqu&apos;au renouvellement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
