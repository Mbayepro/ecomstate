"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  FormInput,
  Layers,
  LayoutDashboard,
  Lock,
  Megaphone,
  MessageSquareWarning,
  Package,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Users,
  UserX,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormattedAiText } from "@/components/ui/formatted-ai-text";
import { AnimatedNumber, Reveal, ScrollProgress, SpotlightCard } from "@/components/ui/motion";
import {
  MerchantEditorialMarquee,
  RotatingHeroPhrase,
  ShopifyBentoShowcase,
  ShopifyHeroReel,
} from "@/components/marketing/shopify-african-showcase";
import { DEFAULT_PLANS, PLAN_COMPARISON_ROWS } from "@/lib/permissions";
import { askAdeshinaIA } from "@/lib/adeshina-ai";
import { formatCurrency } from "@/lib/utils";

/**
 * Section 4.2 — Les 9 problèmes réels rencontrés par les commerçants COD (Enrichis de visuels éditoriaux africains)
 */
const MERCHANT_PAIN_POINTS = [
  {
    icon: MessageSquareWarning,
    title: "Commandes dispersées",
    desc: "Informations perdues dans des messages vocaux, commentaires et discussions non structurées.",
    solution: "Centralisé dans un flux unique à 11 statuts COD",
    image: "/images/african-woman-mobile-shopping.jpg",
    tag: "Flux Centralisé",
  },
  {
    icon: Store,
    title: "Difficulté à créer une boutique pro",
    desc: "Outils techniques complexes ou thèmes inadaptés à la vente rapide sur smartphone.",
    solution: "Thème Shrine Pro 3 prêt en quelques minutes",
    image: "/images/hero-african-founder-fashion.jpg",
    tag: "Shrine Pro 3",
  },
  {
    icon: FormInput,
    title: "Formulaires de commande inadaptés",
    desc: "Formulaires longs demandant e-mail, code postal ou carte bancaire qui font fuir les acheteurs COD.",
    solution: "Form Builder 100 % COD optimisé pour mobile",
    image: "/images/african-fashion-model-teranga.jpg",
    tag: "1 Clic COD",
  },
  {
    icon: Boxes,
    title: "Erreurs de suivi de stock",
    desc: "Ventes d'articles déjà en rupture faute de décrémentation et de réintégration des retours.",
    solution: "Stocks liés en temps réel aux livraisons & retours",
    image: "/images/hero-african-founder-beauty.jpg",
    tag: "Stock Temps Réel",
  },
  {
    icon: UserX,
    title: "Clients difficiles à relancer",
    desc: "Aucun historique centralisé des acheteurs fidèles ni des numéros à fort taux de refus.",
    solution: "CRM automatique : clients fidèles vs retours",
    image: "/images/african-beauty-glow-portrait.jpg",
    tag: "CRM Client",
  },
  {
    icon: Truck,
    title: "Livreurs difficiles à suivre",
    desc: "Manque de clarté sur qui détient quels colis, quels colis sont livrés et lesquels reviennent.",
    solution: "Assignation par livreur et taux de livraison réel",
    image: "/images/african-courier-motorbike-dispatch.jpg",
    tag: "Suivi Livreurs",
  },
  {
    icon: Wallet,
    title: "Encaissements COD mal contrôlés",
    desc: "Écarts fréquents entre le cash encaissé chez le client final et les reversements reçus.",
    solution: "Rapprochement financier COD franc par franc",
    image: "/images/african-cod-delivery-handover.jpg",
    tag: "Contrôle Cash",
  },
  {
    icon: Calculator,
    title: "Aucune visibilité sur le bénéfice réel",
    desc: "Confusion entre chiffre d'affaires commandé, ventes réellement livrées et profit net après dépenses.",
    solution: "Calcul du vrai bénéfice net sur commandes livrées",
    image: "/images/african-merchant-packaging-cod.jpg",
    tag: "Bénéfice Net",
  },
  {
    icon: Clock,
    title: "Manque de temps pour analyser",
    desc: "Impossible de savoir rapidement quel produit ou quelle campagne publicitaire est vraiment rentable.",
    solution: "Copilote Adeshina IA connecté à vos vrais chiffres",
    image: "/images/african-sneakers-leather-studio.jpg",
    tag: "Adeshina IA",
  },
];

/**
 * La chaîne réelle du Cash on Delivery en 4 étapes illustrées
 */
const COD_WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Commande en 30 secondes",
    subtitle: "Sans carte bancaire",
    desc: "Votre cliente remplit un formulaire épuré (Nom, Téléphone, Ville, Quartier & Repère) optimisé pour mobile en 1 clic.",
    image: "/images/african-woman-mobile-shopping.jpg",
    badge: "1 Clic Mobile",
  },
  {
    step: "02",
    title: "Préparation & Colis soigné",
    subtitle: "Validation express",
    desc: "Votre équipe confirme la commande, prépare le colis avec soin et l'assigne directement au livreur dans EcomSate.",
    image: "/images/african-merchant-packaging-cod.jpg",
    badge: "Préparation & Suivi",
  },
  {
    step: "03",
    title: "Départ Livreur & Tournée",
    subtitle: "Suivi par zone",
    desc: "Chaque livreur connaît ses adresses, repères et montants COD attendus. Vous suivez son taux de livraison en direct.",
    image: "/images/african-courier-motorbike-dispatch.jpg",
    badge: "Tournée tracée",
  },
  {
    step: "04",
    title: "Remise Colis & Bénéfice Net",
    subtitle: "Franc par franc",
    desc: "La cliente vérifie son colis et paie à la livraison. EcomSate rapproche le cash reversé et calcule votre vrai bénéfice net.",
    image: "/images/african-cod-delivery-handover.jpg",
    badge: "Bénéfice Réel Calculé",
  },
];

/**
 * Section 4.3 — Les 12 modules unifiés de la plateforme EcomSate
 */
const PLATFORM_MODULES = [
  {
    icon: Store,
    title: "Store Builder Modulaire",
    desc: "Construisez et réorganisez les sections de votre boutique avec aperçu mobile/desktop et publication en 1 clic.",
  },
  {
    icon: Layers,
    title: "Thèmes Shrine Pro 1 & Shrine Pro 3",
    desc: "Thème de référence inclus en Standard + Shrine Pro 3 Ultra-Conversion (Packs 1x/2x/3x, comparatif, résultats) en Premium.",
  },
  {
    icon: FormInput,
    title: "Form Builder COD sur mesure",
    desc: "Personnalisez vos champs (nom, téléphone, ville, quartier, repère, taille/pointure), couleurs et offres packs 100 % paiement à la livraison.",
  },
  {
    icon: Package,
    title: "Catalogue, Variantes & Marges",
    desc: "Gérez vos produits, prix d'achat, coûts additionnels, marges brutes en temps réel et import/export CSV.",
  },
  {
    icon: ClipboardList,
    title: "Commandes COD (11 Statuts)",
    desc: "Suivez tout le cycle réel : Nouvelle, À confirmer, Confirmée, Prête, Assignée livreur, En livraison, Livrée, Retournée, Annulée.",
  },
  {
    icon: Users,
    title: "CRM Clients & Segmentation",
    desc: "Historique complet par client, détection des acheteurs fidèles, suivi des retours et notes internes.",
  },
  {
    icon: Boxes,
    title: "Gestion Intelligente des Stocks",
    desc: "Mouvements tracés automatiquement aux commandes, réintégration sur retour/annulation et alertes de seuil critique.",
  },
  {
    icon: Truck,
    title: "Livraison & Gestion des Livreurs",
    desc: "Tarifs par zone ou ville, assignation directe des commandes aux livreurs et suivi du taux de livraison.",
  },
  {
    icon: Wallet,
    title: "Rapprochement Financier COD",
    desc: "Distinguez le montant attendu, encaissé par le livreur, reversé partiellement ou intégralement, et auditez les écarts.",
  },
  {
    icon: Calculator,
    title: "Dépenses & Bénéfice Net Réel",
    desc: "Ne comptez jamais une commande non livrée comme acquise : calculez votre vrai profit net après coût produit, pub et livraison.",
  },
  {
    icon: Megaphone,
    title: "Analytics & Campagnes Publicitaires",
    desc: "Suivez vos budgets Meta & TikTok Ads, coûts par commande et ROAS réel sur vos ventes livrées.",
  },
  {
    icon: Zap,
    title: "Automatisations & Adeshina IA",
    desc: "Règles automatiques (stock critique, anti-doublon COD, cash livreur) et copilote IA capable d'analyser et d'agir avec confirmation.",
  },
];

const DEMO_TABS = [
  {
    id: "store_builder",
    label: "1. Boutique & Thèmes Shrine Pro",
    badge: "Store Builder",
  },
  {
    id: "cod_form",
    label: "2. Formulaire de commande COD",
    badge: "Form Builder COD",
  },
  {
    id: "control_center",
    label: "3. Livreurs, Cash COD & Profit Net",
    badge: "Centre de contrôle",
  },
  {
    id: "adeshina",
    label: "4. Copilote Adeshina IA",
    badge: "Intelligence Opérationnelle",
  },
] as const;

const FAQS = [
  {
    q: "Comment mes clients passent-ils commande sur ma boutique EcomSate ?",
    a: "Toutes les boutiques EcomSate fonctionnent exclusivement en Paiement à la livraison (Cash on Delivery - COD) via votre formulaire intégré personnalisable (Form Builder COD). Le client remplit ses informations en quelques secondes directement sur la page produit ou le panier, sans redirection WhatsApp ni paiement en ligne complexe.",
  },
  {
    q: "Le numéro de téléphone personnel du propriétaire est-il visible publiquement ?",
    a: "Non. Pour protéger votre confidentialité et centraliser toutes vos opérations dans votre tableau de bord, aucun numéro du propriétaire de la boutique n'est affiché publiquement sur la vitrine client.",
  },
  {
    q: "Quelle est la différence entre le plan Standard (7 500 FCFA) et le plan Premium (15 000 FCFA) ?",
    a: "Le plan Standard (7 500 FCFA/mois) inclut 1 boutique complète avec le thème de référence Shrine Pro 1, jusqu'à 150 produits, le Form Builder COD, jusqu'à 5 livreurs, le suivi des dépenses et Adeshina IA. Le plan Premium (15 000 FCFA/mois) débloque le multi-boutiques (jusqu'à 5 boutiques), le thème avancé Shrine Pro 3 Ultra-Conversion, les produits et livreurs illimités, le suivi publicitaire ROAS, les automatisations personnalisées, la gestion d'équipe multi-rôles et le domaine personnalisé.",
  },
  {
    q: "Puis-je personnaliser les champs de mon formulaire COD selon ma niche ?",
    a: "Oui ! Le Form Builder COD vous permet d'ajouter, supprimer, dupliquer et réordonner les champs (nom, téléphone principal/secondaire, ville, commune, quartier, repère, pointure, taille, instructions livreur), de personnaliser le design du bouton et d'utiliser des modèles prêts à l'emploi ou l'assistance d'Adeshina IA.",
  },
  {
    q: "Comment EcomSate calcule-t-il mon bénéfice réel ?",
    a: "Contrairement aux outils classiques qui additionnent toutes les commandes non livrées, EcomSate sépare les commandes en cours des commandes réellement livrées, puis déduit le coût d'achat des produits vendus et vos dépenses (publicités, livraison, emballage, divers) pour afficher votre bénéfice net réel.",
  },
  {
    q: "Mes données et celles de mes clients sont-elles isolées et sécurisées ?",
    a: "Absolument. Chaque boutique dispose d'un cloisonnement strict : vos produits, commandes, clients, livreurs et données financières n'appartiennent qu'à vous. Adeshina IA ne modifie jamais votre boutique ou votre formulaire publié sans votre confirmation explicite.",
  },
];

export default function HomePage() {
  const [annual, setAnnual] = useState(false);
  const [demoTab, setDemoTab] =
    useState<(typeof DEMO_TABS)[number]["id"]>("store_builder");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [question, setQuestion] = useState("");
  const [aiReply, setAiReply] = useState(
    "Posez-moi une question sur le **Store Builder Shrine Pro**, le **Form Builder COD**, le **suivi des livreurs** ou le **calcul du bénéfice réel**."
  );

  const handleAsk = (q: string) => {
    const res = askAdeshinaIA(q);
    setAiReply(res.answer);
  };

  return (
    <div className="bg-[#F8FAFC] text-[#15232D]">
      <ScrollProgress />
      {/* 4.1 HERO OFFICIEL — Vert Profond #073B35 & Émeraude #00A884 */}
      <section className="bg-navy-architectural relative overflow-hidden border-b border-white/10 text-white">
        {/* Blobs lumineux animés en arrière-plan */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#00A884]/25 blur-3xl" />
          <div className="animate-blob-delayed absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#7CE3C8]/15 blur-3xl" />
          <div className="animate-blob absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#F4A340]/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-22 sm:pt-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="animate-fade-up space-y-6 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00A884]/40 bg-[#E7F7F2]/10 px-4 py-1.5 text-xs font-semibold text-[#E7F7F2]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-[#00A884]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00A884]" />
                </span>
                <span>Plateforme SaaS E-commerce COD & Intelligence Opérationnelle</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:leading-[1.1]">
                Votre e-commerce. Un seul espace.{" "}
                <span className="text-gradient-animated">
                  Une intelligence qui travaille avec vous.
                </span>
              </h1>

              {/* Sous-ligne dynamique style Shopify ("Be the next...") */}
              <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 backdrop-blur-xs">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7CE3C8]">
                  Bâtissez dès aujourd&apos;hui votre
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-white sm:text-xl">
                  <RotatingHeroPhrase />
                </p>
              </div>

              <p className="max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Créez votre boutique, gérez vos commandes, maîtrisez vos
                bénéfices et développez votre activité avec{" "}
                <strong className="font-semibold text-white">Adeshina IA</strong>.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <Link href="/creer-une-boutique">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Créer ma boutique
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#demonstration">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white/25 bg-white/8 text-white hover:border-[#00A884] hover:bg-white/15 sm:w-auto"
                  >
                    Découvrir EcomSate
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-[#E7F7F2] sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#00A884]" />
                  100 % Paiement à la livraison (COD)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#00A884]" />
                  Thème officiel Shrine Pro 3 inclus
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#00A884]" />
                  0 % commission sur vos ventes
                </span>
              </div>
            </div>

            {/* Colonne droite : Story Reel Éditorial Africain & UI Flottantes style Shopify */}
            <div className="lg:col-span-6">
              <Reveal direction="right" delayMs={100}>
                <ShopifyHeroReel />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* RUBAN VISUEL INFINI DES ENTREPRENEURES & BOUTIQUES AFRICAINES (STYLE SHOPIFY) */}
      <MerchantEditorialMarquee />

      {/* GRILLE BENTO ASYMÉTRIQUE INTERACTIVE : PHOTOS ÉDITORIALES + MICRO-UI VIVANTES */}
      <ShopifyBentoShowcase />

      {/* NOUVELLE SECTION VISUELLE : LA CHAÎNE DU CASH ON DELIVERY EN 4 ÉTAPES ILLUSTRÉES */}
      <section id="workflow-cod" className="border-b border-[#E2E8F0] bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00A884]/30 bg-[#E7F7F2] px-3.5 py-1 text-xs font-bold text-[#073B35]">
              <Truck className="h-3.5 w-3.5 text-[#00A884]" />
              La réalité du terrain africain en images
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#15232D] sm:text-4xl">
              Comment fonctionne le Cash on Delivery avec EcomSate ?
            </h2>
            <p className="mt-3 text-base text-slate-600">
              De la commande sur smartphone jusqu&apos;à l&apos;encaissement du cash entre vos mains,
              chaque étape est maîtrisée avec précision.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COD_WORKFLOW_STEPS.map((ws, idx) => (
              <Reveal key={ws.step} delayMs={idx * 80}>
                <SpotlightCard className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs transition-all duration-300 hover:border-[#00A884] hover:shadow-xl">
                  <div>
                    {/* Photo réelle de l'étape */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={ws.image}
                        alt={ws.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      
                      <span className="absolute left-3 top-3 rounded-lg bg-[#073B35]/90 px-2.5 py-1 text-xs font-extrabold text-[#00A884] shadow-md backdrop-blur-xs">
                        Étape {ws.step}
                      </span>

                      <span className="absolute bottom-2.5 left-3 right-3 truncate text-[11px] font-bold text-white/95">
                        {ws.badge}
                      </span>
                    </div>

                    <div className="p-5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#00A884]">
                        {ws.subtitle}
                      </p>
                      <h3 className="mt-1 text-base font-extrabold text-[#15232D] group-hover:text-[#073B35]">
                        {ws.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {ws.desc}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 p-4 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#073B35]">
                      <Check className="h-3.5 w-3.5 text-[#00A884]" />
                      Géré nativement par EcomSate
                    </span>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4.2 PROBLÈMES RENCONTRÉS PAR LES COMMERÇANTS (Cartes Motion Design + Solution intégrée) */}
      <section id="problemes" className="border-b border-[#E2E8F0] bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="warning">Le constat terrain du e-commerce COD</Badge>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#15232D] sm:text-4xl">
              Pourquoi tant de commerçants perdent du temps et de la marge chaque jour ?
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Vendre en paiement à la livraison demande bien plus qu&apos;un simple
              catalogue : voici les 9 blocages que résout EcomSate.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MERCHANT_PAIN_POINTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delayMs={idx * 65}>
                  <SpotlightCard className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs transition-all duration-300 hover:border-[#00A884]/60 hover:shadow-xl">
                    <div>
                      {/* Photo d'illustration réelle */}
                      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                        {/* Tag supérieur */}
                        <div className="absolute left-3 top-3 flex items-center gap-2">
                          <span className="rounded-lg bg-[#073B35]/90 px-2 py-0.5 text-[10px] font-extrabold text-[#00A884] backdrop-blur-xs">
                            {item.tag}
                          </span>
                        </div>

                        <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-0.5 text-[11px] font-extrabold text-[#15232D] shadow-xs">
                          0{idx + 1}
                        </span>

                        <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#073B35] text-[#00A884] shadow-md ring-1 ring-white/20">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-bold text-white drop-shadow-xs">
                            {item.title}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 pt-3.5">
                        <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="shine-sweep flex items-start gap-2 rounded-xl border border-[#00A884]/25 bg-[#E7F7F2]/60 px-3.5 py-2.5 text-xs font-bold leading-snug text-[#073B35] transition-all duration-300 group-hover:border-[#00A884] group-hover:bg-[#073B35] group-hover:text-white">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00A884]" />
                        <span>{item.solution}</span>
                      </div>
                    </div>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4.3 PRÉSENTATION DE LA SOLUTION — LES 12 MODULES UNIFIÉS */}
      <section id="modules" className="bg-dots-subtle border-b border-[#E2E8F0] bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="success">Architecture Tout-en-un EcomSate</Badge>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#15232D] sm:text-4xl">
              12 modules connectés pour piloter toute votre chaîne e-commerce COD
            </h2>
            <p className="mt-3 text-base text-slate-600">
              De la création visuelle de votre boutique jusqu&apos;au calcul de
              votre bénéfice net après reversement des livreurs.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_MODULES.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Reveal key={mod.title} delayMs={idx * 55}>
                  <SpotlightCard className="group flex h-full flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs hover:border-[#00A884]/50">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="icon-wiggle flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F7F2] text-[#073B35] shadow-2xs transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-[#00A884] group-hover:text-white">
                          <Icon className="h-5.5 w-5.5" />
                        </div>
                        <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 transition-colors group-hover:border-[#00A884]/40 group-hover:bg-[#E7F7F2] group-hover:text-[#073B35]">
                          Module {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                      </div>

                      <h3 className="mt-4 text-base font-extrabold text-[#15232D] group-hover:text-[#073B35]">
                        {mod.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-[#00A884]">
                      <span>Intégré nativement</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4.4 DÉMONSTRATIONS VISUELLES RÉELLES & INTERACTIVES */}
      <section
        id="demonstration"
        className="border-b border-white/10 bg-[#073B35] py-18 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00A884]/40 bg-[#E7F7F2]/10 px-4 py-1 text-xs font-bold text-[#E7F7F2]">
              <Sparkles className="h-3.5 w-3.5 text-[#00A884]" />
              Démonstrations fonctionnelles réelles
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Explorez concrètement ce que vous allez utiliser chaque jour
            </h2>
            <p className="mt-2 text-sm text-slate-200 sm:text-base">
              Aucune promesse fictive : testez directement nos moteurs réels en
              ligne.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {DEMO_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setDemoTab(t.id)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm cursor-pointer ${
                  demoTab === t.id
                    ? "bg-[#00A884] text-white shadow-md"
                    : "border border-white/15 bg-white/8 text-slate-200 hover:bg-white/15"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            key={demoTab}
            className="animate-tab-panel mt-8 rounded-2xl border border-white/15 bg-[#052B27] p-6 shadow-2xl sm:p-8"
          >
            {demoTab === "store_builder" && (
              <div className="grid items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-6">
                  <Badge variant="success">Store Builder & Thèmes Shrine Pro</Badge>
                  <h3 className="text-2xl font-extrabold text-white">
                    Architecture e-commerce orientée conversion mobile
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Activez le thème officiel <strong>Shrine Pro 1</strong> dès
                    le plan Standard ou passez à{" "}
                    <strong>Shrine Pro 3 Ultra-Conversion</strong> en Premium :
                    barre d&apos;annonce COD, bandeau défilant, grille de
                    bénéfices, offres Packs 1x/2x/3x, tableau comparatif et FAQ
                    accordéon.
                  </p>
                  <ul className="space-y-2 text-sm text-[#E7F7F2]">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#00A884]" />
                      Ajout, réorganisation, masquage et duplication des sections
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#00A884]" />
                      Aucun numéro privé du propriétaire exposé sur la vitrine
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#00A884]" />
                      Aperçu mobile & desktop en temps réel
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href="/s/atelier-dakar">
                      <Button variant="primary">
                        Voir la vitrine Shrine Pro 3
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/s/cotonou-tech">
                      <Button
                        variant="outline"
                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                      >
                        Voir Shrine Pro 1 (Standard)
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/15 bg-[#073B35] p-5 lg:col-span-6 shadow-xl">
                  <div className="rounded-xl bg-[#00A884] px-3.5 py-1.5 text-center text-xs font-bold text-white shadow-sm">
                    ⚡ LIVRAISON RAPIDE 24H-48H · VOUS PAYEZ UNIQUEMENT À LA RÉCEPTION !
                  </div>

                  <div className="grid gap-3 sm:grid-cols-12 rounded-xl border border-white/10 bg-white/6 p-3.5">
                    {/* Photo produit modèle avec badge promotion */}
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-900 sm:col-span-5">
                      <img
                        src="/images/african-fashion-model-teranga.jpg"
                        alt="Ensemble Lin & Soie Prestige Teranga"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-2 top-2 rounded-lg bg-[#00A884] px-2 py-0.5 text-[10px] font-extrabold text-white">
                        -20% COD
                      </span>
                    </div>

                    <div className="flex flex-col justify-between sm:col-span-7">
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-[#F4A340]">
                          {"★".repeat(5)}
                          <span className="font-bold text-white ml-1">4.9/5</span>
                          <span className="text-slate-300">(148 avis)</span>
                        </div>
                        <h4 className="mt-1 text-sm font-extrabold text-white">
                          Ensemble Lin & Soie Prestige Teranga
                        </h4>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-[#00A884]">
                            28 500 FCFA
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            35 000 FCFA
                          </span>
                        </div>
                      </div>

                      {/* Barre d'urgence & rareté stock */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-[#F4A340]">🔥 Plus que 7 articles en stock</span>
                          <span className="text-slate-300">Offre limitée</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                          <div className="h-full w-3/4 rounded-full bg-[#F4A340]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Offres Packs Shrine Pro 3 */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-white/15 bg-white/6 p-2">
                      <p className="font-bold text-white text-[11px]">1 Unité</p>
                      <p className="text-[10px] text-slate-300">28 500 F</p>
                      <p className="text-[9px] text-[#00A884] font-semibold">Standard</p>
                    </div>
                    <div className="rounded-xl border-2 border-[#00A884] bg-[#00A884]/20 p-2 shadow-xs">
                      <p className="font-bold text-white text-[11px]">Pack Duo (2x)</p>
                      <p className="text-[10px] text-white font-extrabold">49 000 F</p>
                      <p className="text-[9px] text-[#00A884] font-bold">Économie 8 000 F</p>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/6 p-2">
                      <p className="font-bold text-white text-[11px]">Pack Trio (3x)</p>
                      <p className="text-[10px] text-slate-300">69 000 F</p>
                      <p className="text-[9px] text-[#F4A340] font-bold">Super Offre</p>
                    </div>
                  </div>

                  {/* Bouton de commande COD direct */}
                  <div className="rounded-xl bg-[#00A884] py-2.5 text-center text-xs font-extrabold text-white shadow-md transition hover:bg-[#00A884]/90 cursor-pointer">
                    COMMANDER MAINTENANT — PAIEMENT À LA LIVRAISON
                  </div>
                </div>
              </div>
            )}

            {demoTab === "cod_form" && (
              <div className="grid items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-6">
                  <Badge variant="success">Form Builder COD Personnalisable</Badge>
                  <h3 className="text-2xl font-extrabold text-white">
                    Un formulaire pensé à 100 % pour le Cash on Delivery
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Adaptez votre formulaire de commande à votre pays et à votre
                    niche (Mode, Chaussures, Cosmétiques, Électronique, Maison).
                    Zéro friction inutile, zéro redirection WhatsApp, zéro
                    paiement en ligne imposé au client.
                  </p>
                  <ul className="space-y-2 text-sm text-[#E7F7F2]">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#00A884]" />
                      15 types de champs + règles d&apos;affichage conditionnel
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#00A884]" />
                      Détection automatique des commandes doublons sous 24h
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#00A884]" />
                      Sauvegarde brouillon, historique de versions et restauration
                    </li>
                  </ul>
                  <Link href="/dashboard/form-builder" className="inline-block pt-2">
                    <Button variant="primary">
                      Tester le Form Builder COD
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="rounded-xl border border-white/15 bg-white p-5 text-[#15232D] lg:col-span-6">
                  <p className="text-sm font-extrabold text-[#15232D]">
                    Commandez maintenant — Payez à la livraison
                  </p>
                  <p className="text-xs text-slate-500">
                    Aperçu réel généré par le Form Builder COD
                  </p>
                  <div className="mt-3 space-y-2.5 text-xs">
                    <div className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600">
                      Nom complet * — Ex : Koffi Mensah
                    </div>
                    <div className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600">
                      Téléphone principal * — Ex : +229 97 00 00 00
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600">
                        Zone : Cotonou (1 000 F)
                      </div>
                      <div className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600">
                        Quartier & Repère *
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-[#E7F7F2] px-3 py-2 font-bold text-[#073B35]">
                      <span>Total à payer à la livraison</span>
                      <span>22 000 FCFA</span>
                    </div>
                    <div className="rounded-lg bg-[#00A884] py-2.5 text-center font-bold text-white">
                      Confirmer ma commande — Paiement à la livraison
                    </div>
                  </div>
                </div>
              </div>
            )}

            {demoTab === "control_center" && (
              <div className="grid items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-6">
                  <Badge variant="success">Rapprochement COD & Bénéfice Réel</Badge>
                  <h3 className="text-2xl font-extrabold text-white">
                    Sachez exactement qui détient votre cash et combien vous gagnez vraiment
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Une commande non livrée n&apos;est jamais comptée comme un
                    revenu acquis. Suivez chaque livreur, chaque encaissement
                    attendu, chaque reversement partiel ou complet et vos
                    dépenses réelles.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href="/dashboard/livreurs">
                      <Button variant="primary">
                        Voir Livreurs & Rapprochement COD
                      </Button>
                    </Link>
                    <Link href="/dashboard/finances">
                      <Button
                        variant="outline"
                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                      >
                        Voir Finances & Profit Net
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="space-y-3 rounded-xl border border-white/12 bg-[#073B35] p-5 lg:col-span-6">
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/6 px-4 py-3 text-xs">
                    <div>
                      <p className="font-bold text-white">Livreur : Ibrahima Fall</p>
                      <p className="text-slate-300">2 commandes livrées · 69 000 FCFA encaissés</p>
                    </div>
                    <span className="rounded-full bg-[#F4A340]/20 px-2.5 py-1 font-bold text-[#F4A340]">
                      Reste à reverser : 29 000 FCFA
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-white/10 bg-white/6 p-3">
                      <p className="text-slate-300">Coût produits livrés</p>
                      <p className="mt-1 text-base font-bold text-white">29 500 FCFA</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/6 p-3">
                      <p className="text-slate-300">Dépenses Pubs & Emballage</p>
                      <p className="mt-1 text-base font-bold text-white">12 000 FCFA</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[#00A884]/40 bg-[#00A884]/15 px-4 py-3">
                    <span className="text-xs font-bold text-[#E7F7F2]">
                      Bénéfice net réellement généré
                    </span>
                    <span className="text-lg font-extrabold text-[#00A884]">
                      +27 500 FCFA
                    </span>
                  </div>
                </div>
              </div>
            )}

            {demoTab === "adeshina" && (
              <div className="grid items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-5">
                  <Badge variant="success">Copilote Opérationnel Adeshina IA</Badge>
                  <h3 className="text-2xl font-extrabold text-white">
                    Interrogez Adeshina IA en direct
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Adeshina IA analyse vos ventes, prépare vos brouillons de
                    produits et adapte votre formulaire COD sans jamais écraser
                    votre boutique publiée sans votre accord.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Comment fonctionne le formulaire COD ?",
                      "Comment est calculé mon bénéfice réel ?",
                      "Quels thèmes Shrine Pro sont inclus ?",
                      "Quelle différence entre Standard et Premium ?",
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleAsk(q)}
                        className="rounded-lg border border-white/15 bg-white/8 px-3 py-1.5 text-left text-xs text-[#E7F7F2] hover:border-[#00A884] cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/15 bg-[#073B35] p-5 lg:col-span-7">
                  <div className="min-h-36 rounded-lg border border-white/10 bg-[#052B27] p-4 text-xs leading-relaxed text-slate-100">
                    <FormattedAiText text={aiReply} darkBg />
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!question.trim()) return;
                      handleAsk(question);
                      setQuestion("");
                    }}
                    className="mt-3 flex gap-2"
                  >
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Posez une question à Adeshina IA..."
                      className="h-10 flex-1 rounded-xl border border-white/15 bg-[#052B27] px-3.5 text-xs text-white placeholder:text-slate-400 focus:border-[#00A884] focus:outline-none"
                    />
                    <Button type="submit" variant="primary" size="sm">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4.5 TARIFICATION STANDARD & PREMIUM + COMPARATEUR */}
      <section id="tarifs" className="border-b border-[#E2E8F0] bg-white py-18">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="success">Offres claires & évolutives</Badge>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#15232D] sm:text-4xl">
              Choisissez votre plan : Standard ou Premium
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Aucun frais caché, 0 % de commission sur vos commandes COD.
            </p>

            <div className="mt-6 inline-flex items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer ${
                  !annual ? "bg-[#073B35] text-white" : "text-slate-600"
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer ${
                  annual ? "bg-[#073B35] text-white" : "text-slate-600"
                }`}
              >
                Annuel (2 mois offerts)
              </button>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
            {DEFAULT_PLANS.map((plan) => {
              const isPremium = plan.code === "premium";
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`hover-lift flex flex-col rounded-2xl p-8 ${
                    isPremium
                      ? "glow-pulse border-2 border-[#00A884] bg-[#073B35] text-white shadow-xl"
                      : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#15232D]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-extrabold">Plan {plan.name}</h3>
                    {isPremium ? (
                      <span className="rounded-full bg-[#00A884] px-3 py-1 text-xs font-bold text-white">
                        Multi-boutiques & Shrine Pro 3
                      </span>
                    ) : (
                      <Badge variant="navy">Boutique COD complète</Badge>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm ${
                      isPremium ? "text-slate-200" : "text-slate-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold">
                      {formatCurrency(price, plan.currency)}
                    </span>
                    <span
                      className={`text-sm ${
                        isPremium ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      / {annual ? "an" : "mois"}
                    </span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00A884]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/creer-une-boutique?plan=${plan.code}`}
                    className="mt-8 block"
                  >
                    <Button
                      variant={isPremium ? "primary" : "secondary"}
                      size="lg"
                      className="w-full"
                    >
                      Choisir {plan.name}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Aperçu condensé du comparateur */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold uppercase text-[#15232D]">
                    <th className="px-5 py-3.5">Critère</th>
                    <th className="px-5 py-3.5">Standard</th>
                    <th className="bg-[#E7F7F2]/60 px-5 py-3.5 text-[#073B35]">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {PLAN_COMPARISON_ROWS.slice(0, 9).map((row) => (
                    <tr key={row.feature}>
                      <td className="px-5 py-3 font-semibold text-[#15232D]">
                        {row.feature}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{row.standard}</td>
                      <td className="bg-[#E7F7F2]/30 px-5 py-3 font-semibold text-[#073B35]">
                        {row.premium}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 text-right">
              <Link
                href="/tarifs"
                className="text-xs font-bold text-[#073B35] hover:text-[#00A884]"
              >
                Voir les 14 lignes du comparateur complet →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4.6 PREUVE & TRANSPARENCE (ZÉRO FAUX TÉMOIGNAGE / ZÉRO FAUX CHIFFRE) */}
      <section className="border-b border-[#E2E8F0] bg-[#E7F7F2]/55 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#073B35] shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-[#00A884]" />
                Engagement d&apos;authenticité EcomSate
              </div>
              <h2 className="text-2xl font-extrabold text-[#15232D] sm:text-3xl">
                Zéro statistique inventée. Testez nos boutiques modèles réelles.
              </h2>
              <p className="text-sm leading-relaxed text-slate-700">
                Chez EcomSate, nous n&apos;affichons ni faux avis ni compteurs
                artificiels. Vous pouvez inspecter dès maintenant deux vraies
                boutiques configurées sur notre moteur ainsi que le centre de
                contrôle complet avant même de vous inscrire.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5">
              <Link
                href="/s/atelier-dakar"
                className="rounded-2xl border border-[#00A884]/30 bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-[#00A884]"
              >
                <span className="rounded bg-[#E7F7F2] px-2 py-0.5 text-[10px] font-bold text-[#073B35]">
                  Démo Plan Premium · Shrine Pro 3
                </span>
                <p className="mt-2 font-bold text-[#15232D]">Atelier Dakar Mode</p>
                <p className="mt-1 text-xs text-slate-600">
                  Packs 1x/2x/3x, comparatif & Formulaire COD Mode
                </p>
              </Link>
              <Link
                href="/s/cotonou-tech"
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-[#00A884]"
              >
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-[#15232D]">
                  Démo Plan Standard · Shrine Pro 1
                </span>
                <p className="mt-2 font-bold text-[#15232D]">Cotonou Tech Store</p>
                <p className="mt-1 text-xs text-slate-600">
                  Thème de référence & Formulaire COD Électronique
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4.7 FAQ COMPLÈTE */}
      <section id="faq" className="bg-white py-18">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="navy">Questions fréquentes</Badge>
            <h2 className="mt-3 text-3xl font-extrabold text-[#15232D]">
              Tout savoir sur EcomSate, le COD et les formules
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-[#15232D] cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#00A884] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="animate-tab-panel border-t border-[#E2E8F0] bg-white px-5 py-4 text-sm leading-relaxed text-slate-600">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Final */}
          <div className="mt-14 rounded-3xl bg-[#073B35] p-8 text-center text-white sm:p-10">
            <h3 className="text-2xl font-extrabold sm:text-3xl">
              Prêt à structurer vos commandes COD et vos bénéfices ?
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#E7F7F2]">
              Lancez votre boutique en quelques minutes avec l&apos;onboarding
              guidé et l&apos;assistance d&apos;Adeshina IA.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/creer-une-boutique">
                <Button variant="primary" size="lg">
                  Créer ma boutique
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#00A884]" />
                  Explorer le Centre de contrôle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
