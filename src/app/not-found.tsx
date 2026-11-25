import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-navy-architectural flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center text-white">
      <div className="mb-8">
        <BrandLogo light />
      </div>

      <div className="max-w-md rounded-3xl border border-white/15 bg-white p-8 text-[#15232D] shadow-2xl">
        <span className="inline-flex rounded-full bg-[#E7F7F2] px-3.5 py-1 text-xs font-extrabold text-[#073B35]">
          Erreur 404 · Page introuvable
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-[#15232D]">
          Cette page ou cette boutique n&apos;existe pas
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Vérifiez l&apos;adresse saisie ou revenez à l&apos;accueil de la
          plateforme EcomSate.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button variant="primary">
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/creer-une-boutique">
            <Button variant="outline">
              <Store className="h-4 w-4 text-[#00A884]" />
              Créer ma boutique
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
