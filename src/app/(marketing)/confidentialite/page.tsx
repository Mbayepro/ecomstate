import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ConfidentialitePage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="navy">Mentions Légales</Badge>
        <h1 className="mt-3 text-3xl font-extrabold text-[#102A43]">
          Politique de confidentialité — EcomSate
        </h1>
        <Card className="mt-8">
          <CardContent className="space-y-4 p-7 text-sm leading-relaxed text-slate-600">
            <p>
              <strong>1. Isolation et propriété des données :</strong> Chaque
              commerçant utilisant EcomSate reste l&apos;unique propriétaire de
              son catalogue, de ses fichiers clients et de ses commandes. Les
              données sont strictement isolées par boutique.
            </p>
            <p>
              <strong>2. Données collectées :</strong> Nous collectons
              uniquement les informations nécessaires à la création et au
              fonctionnement des boutiques en ligne (nom, e-mail, téléphone
              WhatsApp, adresse de livraison).
            </p>
            <p>
              <strong>3. Sécurité :</strong> Toutes les données sont protégées
              par des politiques d&apos;accès strictes (Row Level Security) et
              chiffrées en transit (HTTPS).
            </p>
            <p>
              <strong>4. Contact :</strong> Pour toute demande relative à vos
              données, contactez la direction EcomSate à{" "}
              <code>support@ecomsate.com</code> ou sur WhatsApp au{" "}
              <strong>+229 95 78 21 32</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
