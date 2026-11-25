import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AProposPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Badge variant="navy">À propos</Badge>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#102A43]">
          Construire l&apos;infrastructure e-commerce des commerçants africains
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          EcomSate est né d&apos;un constat simple : des milliers d&apos;entrepreneurs
          et de commerçants au Bénin, au Sénégal, en Côte d&apos;Ivoire, au Togo et
          au Burkina Faso vendent déjà avec talent sur WhatsApp, Facebook ou
          Instagram, mais manquent d&apos;un outil professionnel, abordable et
          adapté à leur réalité pour structurer leur activité.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Confiance & Propriété",
              desc: "Chaque boutique est indépendante, sécurisée et isolée. Votre marque et votre base clients vous appartiennent.",
            },
            {
              title: "Accessibilité mobile",
              desc: "L'ensemble de la plateforme est pensé en priorité pour fonctionner avec fluidité sur smartphone.",
            },
            {
              title: "Croissance régionale",
              desc: "Une architecture multi-pays conçue pour intégrer les devises, extensions de domaines et paiements locaux.",
            },
          ].map((val) => (
            <Card key={val.title}>
              <CardContent className="p-6">
                <h2 className="text-base font-bold text-[#102A43]">
                  {val.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {val.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
