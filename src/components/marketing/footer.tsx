import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#102A43] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo light showTagline />
            <p className="text-sm leading-relaxed text-slate-300">

              La plateforme SaaS de référence permettant aux commerçants et
              entreprises africaines de créer et gérer leur boutique en ligne en
              toute autonomie.
            </p>
            <p className="text-xs text-slate-400">
              Bénin · Sénégal · Côte d&apos;Ivoire · Togo · Burkina Faso
            </p>
            <div className="pt-1 text-xs text-slate-300 space-y-1">
              <p>
                WhatsApp Support :{" "}
                <a
                  href="https://wa.me/22995782132?text=Bonjour%20EcomSate%2C%20je%20souhaite%20lancer%20ma%20boutique."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#10B981] hover:underline"
                >
                  +229 95 78 21 32
                </a>
              </p>
              <p>E-mail : support@ecomsate.com</p>
            </div>
          </div>


          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Plateforme
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/fonctionnalites" className="hover:text-white">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="hover:text-white">
                  Comment ça marche ?
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-white">
                  Tarifs & Abonnements
                </Link>
              </li>
              <li>
                <Link href="/s/atelier-dakar" className="hover:text-white">
                  Voir une boutique démo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Entreprise
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/a-propos" className="hover:text-white">
                  À propos d&apos;EcomSate
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  Questions fréquentes
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white">
                  Administration plateforme
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Démarrer
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/creer-une-boutique"
                  className="font-medium text-[#10B981] hover:underline"
                >
                  Créer ma boutique (Essai 30 jours)
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="hover:text-white">
                  Connexion commerçant
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  Démo tableau de bord
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} EcomSate. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/confidentialite" className="hover:text-white">
              Confidentialité
            </Link>
            <Link href="/cgu" className="hover:text-white">
              Conditions générales d&apos;utilisation
            </Link>
            <Link
              href="/conditions-commerciales"
              className="hover:text-white"
            >
              Conditions commerciales
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
