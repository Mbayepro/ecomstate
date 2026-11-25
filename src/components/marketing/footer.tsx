import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#052B27] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo light showTagline />
            <p className="text-sm leading-relaxed text-slate-300">
              Plateforme SaaS e-commerce tout-en-un dédiée au paiement à la
              livraison (COD) : Store Builder, Form Builder COD, livreurs,
              bénéfice réel et Adeshina IA.
            </p>
            <p className="text-xs text-slate-400">
              Bénin · Sénégal · Côte d&apos;Ivoire · Togo · Burkina Faso
            </p>
            <div className="space-y-1 pt-1 text-xs text-slate-300">
              <p>E-mail support plateforme : support@ecomsate.com</p>
              <p>Assistance dédiée : +229 95 78 21 32</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Plateforme
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/#modules" className="hover:text-white">
                  Store Builder & Thèmes Shrine
                </Link>
              </li>
              <li>
                <Link href="/#modules" className="hover:text-white">
                  Form Builder COD
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-white">
                  Offres Standard & Premium
                </Link>
              </li>
              <li>
                <Link href="/s/atelier-dakar" className="hover:text-white">
                  Voir une vitrine COD en direct
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Ressources
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/a-propos" className="hover:text-white">
                  À propos d&apos;EcomSate
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white">
                  Questions fréquentes (COD & Plans)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact & Assistance
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="hover:text-white">
                  Espace Administration
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
                  className="font-semibold text-[#00A884] hover:underline"
                >
                  Créer ma boutique maintenant
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="hover:text-white">
                  Connexion commerçant
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  Explorer le Centre de contrôle
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
