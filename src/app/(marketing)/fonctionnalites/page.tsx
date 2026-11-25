import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calculator,
  FormInput,
  Globe,
  Layers,
  Megaphone,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const MODULES = [
  {
    icon: Layers,
    title: "Store Builder & Thèmes Shrine Pro",
    items: [
      "Thème de référence Shrine Pro 1 inclus dès le plan Standard",
      "Thème Shrine Pro 3 Ultra-Conversion débloqué en Premium",
      "Sections modulaires réorganisables avec aperçu mobile & desktop",
      "Historique des versions et publication contrôlée",
    ],
  },
  {
    icon: FormInput,
    title: "Form Builder 100 % COD",
    items: [
      "15 types de champs personnalisables + logique conditionnelle",
      "Offres Packs / Quantity Breaks (1 unité, Pack Duo, Pack Trio)",
      "Zéro redirection WhatsApp, zéro paiement en ligne imposé",
      "Confidentialité totale : aucun numéro propriétaire exposé",
    ],
  },
  {
    icon: Package,
    title: "Produits, Variantes & Marges",
    items: [
      "Prix d'achat, coûts additionnels et calcul de marge brute en direct",
      "Variantes (tailles, couleurs, pointures, modèles) avec SKU",
      "Stocks liés automatiquement aux commandes, livraisons et retours",
      "Import et export CSV guidé avec détection de doublons",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Commandes COD (11 Statuts)",
    items: [
      "Cycle complet : Nouvelle, À confirmer, Confirmée, Prête, En livraison, Livrée, Retournée, Annulée",
      "Détection automatique des commandes doublons sous 24h",
      "Impression du bon de livraison COD et notes internes",
      "Timeline d'historique traçant chaque changement de statut",
    ],
  },
  {
    icon: Truck,
    title: "Livreurs & Rapprochement COD",
    items: [
      "Assignation des colis par livreur et zone de livraison",
      "6 statuts financiers COD indépendants du statut de livraison",
      "Suivi du cash encaissé sur le terrain vs montants reversés",
      "Audit clair des écarts et taux de livraison par livreur",
    ],
  },
  {
    icon: Calculator,
    title: "Finances & Bénéfice Net Réel",
    items: [
      "Seules les commandes livrées comptent comme revenu acquis",
      "Déduction automatique du coût d'achat des produits livrés",
      "Enregistrement des dépenses (publicités, livraison, emballage, salaires)",
      "Calcul instantané de votre bénéfice net réel",
    ],
  },
  {
    icon: Users,
    title: "CRM Clients & Équipe (6 Rôles)",
    items: [
      "Segmentation automatique : Clients fidèles, Nouveaux et Retours",
      "Multi-boutiques isolées (jusqu'à 5 boutiques en Premium)",
      "6 rôles d'équipe : Propriétaire, Admin, Opérateur, Livraison, Livreur, Analyste",
    ],
  },
  {
    icon: Megaphone,
    title: "Publicités ROAS & Automatisations",
    items: [
      "Suivi des budgets Meta / TikTok Ads et calcul du ROAS sur ventes livrées",
      "Automatisations opérationnelles (Quand → Si → Alors) exécutées en temps réel",
      "Journalisation et test en 1 clic de chaque règle",
    ],
  },
  {
    icon: Bot,
    title: "Adeshina IA & Domaines",
    items: [
      "Copilote opérationnel connecté aux vrais chiffres de la boutique",
      "Génération de fiches produits et préparation du formulaire COD en brouillon",
      "Sous-domaine gratuit .ecomsate.com et domaine personnalisé HTTPS",
    ],
  },
];

export default function FonctionnalitesPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="success">Fonctionnalités officielles</Badge>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Toute votre chaîne e-commerce COD dans un seul espace
          </h1>
          <p className="mt-4 text-base text-slate-200">
            Du Store Builder Shrine Pro et du Form Builder COD jusqu&apos;au
            rapprochement des livreurs et au calcul du bénéfice net réel.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.title} className="card-motion">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7F7F2] text-[#073B35]">
                    <Icon className="h-5 w-5 text-[#00A884]" />
                  </div>
                  <h2 className="mt-4 text-lg font-extrabold text-[#15232D]">
                    {m.title}
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {m.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00A884]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-14 rounded-2xl border border-white/15 bg-[#052B27] p-8 text-center text-white">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-[#00A884]/20 px-3 py-1 text-xs font-bold text-[#E7F7F2]">
            <ShieldCheck className="h-4 w-4 text-[#00A884]" />0 % de commission sur vos commandes
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Prêt à lancer votre boutique COD sur EcomSate ?
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Choisissez l&apos;offre Standard (7 500 FCFA/mois) ou Premium (15 000 FCFA/mois).
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/creer-une-boutique">
              <Button variant="primary" size="lg">
                Créer ma boutique
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tarifs">
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <Globe className="h-4 w-4 text-[#00A884]" />
                Comparer Standard & Premium
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
