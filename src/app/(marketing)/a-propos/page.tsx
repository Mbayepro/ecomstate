import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AProposPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-6">
            <Badge variant="success">À propos d&apos;EcomSate</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Construire l&apos;infrastructure e-commerce des entrepreneures et commerçants africains
            </h1>
            <p className="text-base leading-relaxed text-slate-200">
              EcomSate est né d&apos;un constat simple : des milliers de créatrices,
              de marques et de commerçants au Bénin, au Sénégal, en Côte
              d&apos;Ivoire, au Togo et au Burkina Faso vendent déjà avec talent sur
              TikTok, Facebook ou WhatsApp, mais méritent une infrastructure
              aussi puissante et élégante que les géants mondiaux — pensée à
              100 % pour le Paiement à la livraison (COD).
            </p>
            <div className="pt-2">
              <Link href="/creer-une-boutique">
                <Button variant="primary" size="lg">
                  Créer ma boutique
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-6">
            <div className="overflow-hidden rounded-3xl border border-white/15 shadow-xl">
              <img
                src="/images/hero-african-founder-fashion.jpg"
                alt="Entrepreneure mode en Afrique"
                className="h-64 w-full object-cover sm:h-72"
              />
            </div>
            <div className="mt-6 overflow-hidden rounded-3xl border border-white/15 shadow-xl">
              <img
                src="/images/african-merchant-packaging-cod.jpg"
                alt="Équipe e-commerce préparant des colis COD"
                className="h-64 w-full object-cover sm:h-72"
              />
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Confiance & Propriété",
              desc: "Chaque boutique est indépendante, sécurisée et isolée. Votre marque, vos produits et votre base clientes n'appartiennent qu'à vous.",
            },
            {
              title: "Excellence Mobile & Shrine Pro 3",
              desc: "De la vitrine cliente jusqu'au centre de contrôle, tout est pensé pour convertir avec fluidité sur smartphone.",
            },
            {
              title: "Maîtrise du Cash on Delivery",
              desc: "Suivi des livreurs, rapprochement franc par franc et calcul du vrai bénéfice net sur commandes réellement livrées.",
            },
          ].map((val) => (
            <Card key={val.title} className="card-motion">
              <CardContent className="p-6">
                <ShieldCheck className="h-6 w-6 text-[#00A884]" />
                <h2 className="mt-3 text-base font-extrabold text-[#073B35]">
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
