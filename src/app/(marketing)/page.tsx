"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  Globe,
  Layers,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Package,
  Palette,
  Send,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  Wand2,
  X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber, Reveal } from "@/components/ui/motion";
import { DEFAULT_PLANS } from "@/lib/permissions";
import {
  ADESHINA_SECTORS,
  askAdeshinaIA,
  getBlueprintBySector,
} from "@/lib/adeshina-ai";
import { formatCurrency } from "@/lib/utils";

const COUNTRIES_BADGES = [
  "Bénin",
  "Sénégal",
  "Côte d'Ivoire",
  "Togo",
  "Burkina Faso",
];

const HERO_CHART_DAYS = [
  { day: "Lun", pct: 42, amount: "54 000 F" },
  { day: "Mar", pct: 58, amount: "72 500 F" },
  { day: "Mer", pct: 49, amount: "61 000 F" },
  { day: "Jeu", pct: 76, amount: "94 000 F" },
  { day: "Ven", pct: 68, amount: "83 500 F" },
  { day: "Sam", pct: 95, amount: "128 000 F" },
  { day: "Dim", pct: 84, amount: "105 000 F" },
];

const LIVE_HERO_ORDERS = [
  {
    city: "Dakar",
    client: "Fatou Ndiaye",
    method: "Paiement à la livraison · Confirmée WhatsApp",
    amount: "+38 500 F",
  },
  {
    city: "Cotonou",
    client: "Hermann Agossou",
    method: "Mobile Money · Référence vérifiée",
    amount: "+22 000 F",
  },
  {
    city: "Abidjan",
    client: "Adjoua Kouassi",
    method: "Commande WhatsApp · En préparation",
    amount: "+45 000 F",
  },
];

const MARQUEE_ITEMS = [
  "Atelier Dakar Mode · Sénégal",
  "Cotonou Tech Store · Bénin",
  "Maison Kora · Côte d'Ivoire",
  "Éclat Karité · Togo",
  "Saveurs du Terroir · Burkina Faso",
  "Sous-domaine .ecomsate.com offert",
  "Assisté par Adeshina IA",
  "Commandes WhatsApp & Paiement à la livraison",
];

const STEPS = [
  {
    number: "01",
    title: "Créez votre compte",
    description:
      "Inscrivez-vous en quelques secondes. Votre espace marchand et votre sous-domaine gratuit sont générés automatiquement.",
    previewLabel: "maboutique.ecomsate.com",
    previewTag: "Sous-domaine instantané",
  },
  {
    number: "02",
    title: "Personnalisez avec Adeshina IA",
    description:
      "Choisissez votre secteur ou laissez Adeshina IA configurer vos catégories, couleurs, descriptions et premiers produits.",
    previewLabel: "Adeshina IA · Catalogue prêt",
    previewTag: "Assisté par IA",
  },
  {
    number: "03",
    title: "Commencez à vendre",
    description:
      "Partagez votre lien sur WhatsApp, Facebook ou Instagram et gérez chaque commande depuis un tableau de bord clair.",
    previewLabel: "Nouvelle commande · 38 500 FCFA",
    previewTag: "Livraison & WhatsApp",
  },
];

const SHOWCASE_TABS = [
  {
    id: "storefront",
    label: "Boutique Démo",
    icon: Store,
    title: "Une vitrine professionnelle qui met en valeur votre marque",
    description:
      "Vos clients naviguent par catégorie, choisissent leurs tailles ou couleurs, ajoutent au panier et commandent en 30 secondes — même sur connexion mobile.",
    bullets: [
      "Votre propre palette de couleurs, logo et bannière",
      "Paiement à la livraison, commande WhatsApp ou Mobile Money",
      "Rapide sur Android et iPhone, optimisée pour Google (SEO)",
    ],
  },
  {
    id: "dashboard",
    label: "Tableau de bord Démo",
    icon: BarChart3,
    title: "Pilotez vos ventes, vos stocks et vos clients au même endroit",
    description:
      "Fini les commandes perdues dans les discussions WhatsApp. Suivez chaque étape de la nouvelle commande jusqu'à la livraison.",
    bullets: [
      "KPIs filtrables par période (CA, commandes, ruptures)",
      "7 statuts de commande clairs et décrémentation automatique",
      "Annuaire clients privé avec historique complet d'achats",
    ],
  },
  {
    id: "domains",
    label: "Domaines & Sécurité",
    icon: Globe,
    title: "Sous-domaine offert, domaine personnel en un clic",
    description:
      "Démarrez gratuitement avec votre adresse .ecomsate.com, puis connectez votre propre .com, .sn ou .bj dès que vous passez à l'offre Premium.",
    bullets: [
      "Certificat SSL (HTTPS) activé automatiquement",
      "Le nom de domaine reste 100 % votre propriété",
      "Isolation stricte des données entre toutes les boutiques",
    ],
  },
] as const;

const COMPARISON = [
  {
    topic: "Création & Catalogue",
    before: "Long à rédiger, photos en vrac sur le téléphone",
    after: "Adeshina IA génère vos catégories et fiches produits",
  },
  {
    topic: "Prise de commande",
    before: "Messages dispersés, oublis et erreurs de prix",
    after: "Panier clair, numéro unique et suivi des 7 statuts",
  },
  {
    topic: "Image de marque",
    before: "Simple page sociale dépendante des algorithmes",
    after: "Boutique dédiée avec votre logo, couleurs et domaine",
  },
  {
    topic: "Gestion des stocks",
    before: "Suivi manuel dans un cahier ou de tête",
    after: "Quantités à jour, alertes stock faible et historique",
  },
];

const FAQS = [
  {
    q: "Quel est le rôle d'Adeshina IA sur EcomSate ?",
    a: "Adeshina IA est l'intelligence artificielle intégrée d'EcomSate. Elle accompagne les visiteurs pour comprendre comment fonctionne la plateforme, et aide les vendeurs à créer leur boutique (choix du nom, catégories, couleurs, premiers produits) ainsi qu'à rédiger leurs fiches produits en un clic.",
  },
  {
    q: "Ai-je besoin de compétences techniques pour lancer ma boutique ?",
    a: "Non. EcomSate et Adeshina IA sont conçus pour être pris en main immédiatement depuis un smartphone ou un ordinateur. Vous créez votre compte, ajoutez vos produits et votre boutique est en ligne.",
  },
  {
    q: "Comment fonctionne l'activation à 2 000 FCFA ?",
    a: "Le paiement unique de 2 000 FCFA active votre compte et débloque 30 jours d'essai complet avec création automatique de votre boutique et de votre sous-domaine gratuit.",
  },
  {
    q: "Quels moyens de paiement mes clients peuvent-ils utiliser ?",
    a: "Dès le lancement, vos clients peuvent commander avec paiement à la livraison, via WhatsApp ou par Mobile Money manuel avec votre confirmation. Les intégrations automatiques Wave, Orange Money, MTN MoMo et Moov Money s'ajoutent progressivement.",
  },
  {
    q: "Puis-je connecter mon propre nom de domaine (.com, .sn, .bj) ?",
    a: "Oui, avec l'abonnement Premium à 15 000 FCFA/mois, vous pouvez connecter un domaine existant ou en commander un nouveau. Le domaine reste entièrement votre propriété.",
  },
];

export default function HomePage() {
  const [annual, setAnnual] = useState(false);
  const [activeTab, setActiveTab] =
    useState<(typeof SHOWCASE_TABS)[number]["id"]>("storefront");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [liveOrderIdx, setLiveOrderIdx] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<number | null>(5);

  // Studio Adeshina IA interactif sur la page d'accueil
  const [aiSector, setAiSector] = useState("mode");
  const [aiStoreName, setAiStoreName] = useState("");
  const [visitorQuestion, setVisitorQuestion] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [visitorAnswer, setVisitorAnswer] = useState(
    "Je suis Adeshina IA ! Cliquez sur une question ci-dessous ou posez la vôtre pour comprendre comment EcomSate propulse votre commerce en ligne."
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveOrderIdx((prev) => (prev + 1) % LIVE_HERO_ORDERS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const blueprint = getBlueprintBySector(aiSector, aiStoreName);
  const paidPlans = DEFAULT_PLANS.filter((p) => p.code !== "trial");
  const currentTab =
    SHOWCASE_TABS.find((t) => t.id === activeTab) ?? SHOWCASE_TABS[0];
  const currentLiveOrder = LIVE_HERO_ORDERS[liveOrderIdx];

  const handleVisitorAsk = (q: string) => {
    setIsAiTyping(true);
    setTimeout(() => {
      const reply = askAdeshinaIA(q);
      setVisitorAnswer(reply.answer);
      setIsAiTyping(false);
    }, 320);
  };

  return (
    <div className="bg-[#0B1F33] text-slate-100">
      {/* SECTION 1 : HERO — Fond Bleu Nuit Prestige (#102A43) + Animations fluides */}
      <section className="bg-navy-architectural relative overflow-hidden border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Colonne gauche : Message & CTA sur fond Bleu Nuit */}
            <div className="animate-fade-up space-y-6 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
                <span>Propulsé par Adeshina IA · Afrique francophone</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
                Créez votre boutique en ligne.{" "}
                <span className="relative inline-block text-[#10B981]">
                  Développez votre commerce.
                  <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-[#10B981]/35" />
                </span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Avec EcomSate et son assistant intelligent{" "}
                <strong className="font-semibold text-white">
                  Adeshina IA
                </strong>
                , lancez votre boutique professionnelle, gérez vos produits et
                recevez vos commandes simplement.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <Link href="/creer-une-boutique">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Créer ma boutique
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white/20 bg-white/8 text-white hover:border-[#10B981]/60 hover:bg-white/15 sm:w-auto"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#10B981]" />
                    Voir la Démo
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs font-medium text-slate-300 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  Activation 2 000 FCFA (30j d&apos;essai)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  Assisté par Adeshina IA
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  Sous-domaine gratuit
                </span>
              </div>
            </div>

            {/* Colonne droite : Aperçu animé Démo + Adeshina IA */}
            <div className="animate-fade-up-delay-1 relative lg:col-span-6">
              {/* Badge flottant Adeshina IA */}
              <div className="animate-float-delayed mb-3 inline-flex items-center gap-2.5 rounded-xl border border-[#10B981]/40 bg-[#0B1F33]/95 px-3.5 py-2 text-white shadow-xl backdrop-blur-md">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10B981] text-white">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="text-xs">
                  <p className="font-bold text-white">
                    Adeshina IA a généré 3 catégories & 12 fiches produits
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Boutique prête en 45 secondes
                  </p>
                </div>
              </div>

              {/* Carte principale : Mockup navigateur Démo en Bleu Nuit */}
              <div className="animate-float rounded-2xl border border-white/15 bg-[#0B1F33]/90 p-4 shadow-2xl backdrop-blur-md sm:p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-200">
                    <Lock className="h-3 w-3 text-[#10B981]" />
                    atelier-dakar.ecomsate.com
                  </div>
                  <span className="rounded-full bg-[#10B981]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#10B981]">
                    Aperçu Démo
                  </span>
                </div>

                {/* KPIs animés */}
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-[#10B981]/40">
                    <p className="text-[11px] text-slate-400">Ventes du mois</p>
                    <p className="mt-1 text-base font-extrabold text-white sm:text-lg">
                      <AnimatedNumber value={485000} suffix=" F" />
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[#10B981]">
                      +28 %
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-[#10B981]/40">
                    <p className="text-[11px] text-slate-400">Commandes</p>
                    <p className="mt-1 text-base font-extrabold text-white sm:text-lg">
                      <AnimatedNumber value={42} />
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      5 à confirmer
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-[#10B981]/40">
                    <p className="text-[11px] text-slate-400">Clients</p>
                    <p className="mt-1 text-base font-extrabold text-white sm:text-lg">
                      <AnimatedNumber value={128} />
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Fidèles
                    </p>
                  </div>
                </div>

                {/* Mini graphique interactif + aperçu produit */}
                <div className="mt-4 grid gap-3 sm:grid-cols-12">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 sm:col-span-7">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">
                        Évolution des ventes
                      </p>
                      <span className="text-[11px] font-semibold text-[#10B981]">
                        {hoveredBar !== null
                          ? `${HERO_CHART_DAYS[hoveredBar].day} · ${HERO_CHART_DAYS[hoveredBar].amount}`
                          : "7 derniers jours"}
                      </span>
                    </div>
                    <div className="mt-3 flex h-24 items-end gap-2">
                      {HERO_CHART_DAYS.map((item, i) => {
                        const isSelected = hoveredBar === i;
                        return (
                          <button
                            key={item.day}
                            type="button"
                            onMouseEnter={() => setHoveredBar(i)}
                            className="group flex h-full flex-1 flex-col items-center justify-end gap-1 cursor-pointer"
                          >
                            <div
                              className="animate-bar-grow w-full rounded-t-md transition-all duration-200"
                              style={{
                                height: `${item.pct}%`,
                                animationDelay: `${i * 60}ms`,
                                backgroundColor: isSelected
                                  ? "#10B981"
                                  : "#38BDF8",
                                opacity: isSelected ? 1 : 0.25 + i * 0.08,
                              }}
                            />
                            <span className="text-[9px] font-medium text-slate-400">
                              {item.day}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Carte produit boutique */}
                  <div className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-5">
                    <div className="relative h-20 w-full overflow-hidden rounded-lg bg-slate-800">
                      <img
                        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80"
                        alt="Aperçu produit boutique"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-[#10B981] px-2 py-0.5 text-[10px] font-bold text-white">
                        -15 %
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="truncate text-xs font-bold text-white">
                        Ensemble Lin Teranga
                      </p>
                      <p className="text-xs font-extrabold text-[#10B981]">
                        38 500 FCFA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notification commande rotative en direct */}
                <div
                  key={liveOrderIdx}
                  className="animate-tab-panel mt-4 flex items-center justify-between rounded-xl border border-[#10B981]/25 bg-[#102A43] px-4 py-3 text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#10B981] text-white">
                      <ShoppingBag className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Commande reçue · {currentLiveOrder.client} (
                        {currentLiveOrder.city})
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {currentLiveOrder.method}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#10B981]">
                    {currentLiveOrder.amount}
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap gap-2">
                  <Link href="/s/atelier-dakar" className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/15 bg-white/8 text-white hover:bg-white/15"
                    >
                      Boutique Démo
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Démo Tableau de bord
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de confiance & chiffres clés en Bleu Nuit */}
          <Reveal delayMs={120}>
            <div className="mt-14 rounded-2xl border border-white/12 bg-[#0B1F33]/85 p-6 backdrop-blur-xs">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Conçu pour le commerce en Afrique de l&apos;Ouest
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {COUNTRIES_BADGES.map((country) => (
                      <span
                        key={country}
                        className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs font-semibold text-white transition-colors hover:border-[#10B981]"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-4 lg:w-auto lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <div>
                    <p className="text-lg font-extrabold text-white sm:text-xl">
                      &lt; 2 min
                    </p>
                    <p className="text-xs text-slate-400">
                      pour créer sa boutique
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-[#10B981] sm:text-xl">
                      Adeshina IA
                    </p>
                    <p className="text-xs text-slate-400">
                      copilote intégré 24h/24
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-white sm:text-xl">
                      <AnimatedNumber value={2000} suffix=" F" />
                    </p>
                    <p className="text-xs text-slate-400">
                      activation · 30j d&apos;essai
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-white sm:text-xl">
                      <AnimatedNumber value={100} suffix=" %" />
                    </p>
                    <p className="text-xs text-slate-400">
                      optimisé smartphone
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bandeau défilant fluide (Marquee) */}
        <div className="overflow-hidden border-t border-white/10 bg-[#081726] py-3">
          <div className="animate-marquee flex items-center gap-8">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION PHARE : ADESHINA IA — Fond Bleu Nuit profond */}
      <section
        id="adeshina-ia"
        className="bg-navy-deep border-b border-white/10 py-18 sm:py-22"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/35 bg-[#102A43] px-4 py-1.5 text-xs font-bold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
                Innovation EcomSate · Adeshina IA
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Rencontrez Adeshina IA, votre copilote pour comprendre et créer
                votre boutique
              </h2>
              <p className="mt-3 text-base text-slate-300">
                Que vous soyez visiteur curieux de savoir comment fonctionne
                EcomSate ou commerçant prêt à lancer sa boutique,{" "}
                <strong className="text-white">Adeshina IA</strong> vous
                accompagne à chaque étape.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            {/* Colonne 1 : Guide Visiteur interactif */}
            <Reveal delayMs={80} className="lg:col-span-5">
              <div className="hover-lift flex h-full flex-col justify-between rounded-2xl border border-white/12 bg-[#102A43] p-6 sm:p-7">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981]/20 text-[#10B981]">
                      <Bot className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200">
                        Rôle 1 · Guide Visiteur
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-white">
                        Comprendre l&apos;utilité du site
                      </h3>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-300">
                    Cliquez sur un sujet ou posez votre question à Adeshina IA :
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[
                      "À quoi sert EcomSate ?",
                      "Comment ça fonctionne ?",
                      "Combien coûte l'abonnement ?",
                      "Quels paiements pour mes clients ?",
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleVisitorAsk(q)}
                        className="rounded-lg border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:-translate-y-0.5 hover:border-[#10B981] hover:text-white cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Réponse animée d'Adeshina IA */}
                  <div className="mt-4 min-h-34 rounded-xl border border-white/10 bg-[#0B1F33] p-4 text-xs leading-relaxed text-slate-200 whitespace-pre-line">
                    <p className="mb-1.5 flex items-center gap-1.5 font-bold text-[#10B981]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Réponse d&apos;Adeshina IA :
                    </p>
                    {isAiTyping ? (
                      <div className="flex items-center gap-1.5 py-4">
                        <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-[#10B981]" />
                        <span className="ml-1 text-[11px] text-slate-400">
                          Adeshina IA rédige...
                        </span>
                      </div>
                    ) : (
                      <div className="animate-tab-panel">{visitorAnswer}</div>
                    )}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!visitorQuestion.trim()) return;
                    handleVisitorAsk(visitorQuestion);
                    setVisitorQuestion("");
                  }}
                  className="mt-4 flex gap-2 pt-3"
                >
                  <input
                    value={visitorQuestion}
                    onChange={(e) => setVisitorQuestion(e.target.value)}
                    placeholder="Posez une question à Adeshina IA..."
                    className="h-10 flex-1 rounded-xl border border-white/15 bg-[#0B1F33] px-3.5 text-xs text-white placeholder:text-slate-400 focus:border-[#10B981] focus:outline-none"
                  />
                  <Button type="submit" variant="primary" size="sm">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </Reveal>

            {/* Colonne 2 : Générateur de boutique en direct */}
            <Reveal delayMs={180} className="lg:col-span-7">
              <div className="hover-lift h-full rounded-2xl border-2 border-[#10B981]/50 bg-[#102A43] p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981] text-white">
                    <Wand2 className="h-5 w-5" />
                  </span>
                  <div>
                    <Badge variant="success">
                      Rôle 2 · Créateur de Boutique IA
                    </Badge>
                    <h3 className="mt-1 text-lg font-bold text-white">
                      Préparez votre boutique avec Adeshina IA
                    </h3>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-200">
                      1. Votre secteur d&apos;activité
                    </label>
                    <select
                      value={aiSector}
                      onChange={(e) => setAiSector(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-white/15 bg-[#0B1F33] px-3 text-xs font-semibold text-white focus:border-[#10B981] focus:outline-none cursor-pointer"
                    >
                      {ADESHINA_SECTORS.map((sec) => (
                        <option
                          key={sec.sectorId}
                          value={sec.sectorId}
                          className="bg-[#0B1F33] text-white"
                        >
                          {sec.sectorLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200">
                      2. Nom de votre boutique (optionnel)
                    </label>
                    <input
                      value={aiStoreName}
                      onChange={(e) => setAiStoreName(e.target.value)}
                      placeholder={`Suggestion IA : ${blueprint.suggestedName}`}
                      className="mt-1.5 h-10 w-full rounded-xl border border-white/15 bg-[#0B1F33] px-3 text-xs text-white placeholder:text-slate-400 focus:border-[#10B981] focus:outline-none"
                    />
                  </div>
                </div>

                <div
                  key={blueprint.sectorId}
                  className="animate-tab-panel mt-5 rounded-xl border border-white/12 bg-[#0B1F33] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <p className="text-sm font-extrabold text-white">
                        {blueprint.suggestedName}
                      </p>
                      <p className="font-mono text-xs text-[#10B981]">
                        https://{blueprint.subdomain}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-5 w-5 rounded-full border border-white/30"
                        style={{ backgroundColor: blueprint.primaryColor }}
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-white/30"
                        style={{ backgroundColor: blueprint.secondaryColor }}
                      />
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200">
                        Modèle {blueprint.template}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    {blueprint.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {blueprint.categories.map((cat) => (
                      <span
                        key={cat.name}
                        className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[11px] font-semibold text-slate-200"
                      >
                        Catégorie : {cat.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                    {blueprint.sampleProducts.map((prod) => (
                      <div
                        key={prod.name}
                        className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-[#102A43] p-2 transition-transform hover:-translate-y-0.5"
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="h-11 w-11 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-white">
                            {prod.name}
                          </p>
                          <p className="text-[11px] font-extrabold text-[#10B981]">
                            {formatCurrency(prod.promoPrice ?? prod.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <p className="text-xs text-slate-300">
                    Adeshina IA pré-remplit vos catégories, votre thème et vos
                    premiers articles.
                  </p>
                  <Link
                    href={`/creer-une-boutique?sector=${
                      blueprint.sectorId
                    }&storeName=${encodeURIComponent(blueprint.suggestedName)}`}
                    className="w-full sm:w-auto"
                  >
                    <Button variant="primary" className="w-full sm:w-auto">
                      <Sparkles className="h-4 w-4" />
                      Créer cette boutique avec Adeshina IA
                    </Button>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 2 : COMMENT ÇA MARCHE ? */}
      <section className="bg-[#102A43] py-18 sm:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
                Simple et rapide
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Comment ça marche ?
              </h2>
              <p className="mt-3 text-base text-slate-300">
                Trois étapes concrètes pour lancer votre boutique en ligne sans
                dépendre d&apos;un développeur.
              </p>
            </div>
          </Reveal>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute left-16 right-16 top-11 hidden h-px bg-white/15 md:block" />

            {STEPS.map((step, idx) => (
              <Reveal key={step.number} delayMs={idx * 110}>
                <div className="hover-lift relative flex h-full flex-col justify-between rounded-2xl border border-white/12 bg-[#0B1F33] p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981] text-sm font-extrabold text-white shadow-xs">
                      {step.number}
                    </span>
                    <span className="rounded-full bg-[#10B981]/15 px-2.5 py-1 text-[11px] font-semibold text-[#10B981]">
                      {step.previewTag}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
                    {step.description}
                  </p>

                  <div className="mt-5 rounded-lg border border-white/10 bg-[#102A43] px-3.5 py-2.5 font-mono text-xs font-medium text-emerald-300">
                    {step.previewLabel}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2B : APERÇU INTERACTIF DÉMO */}
      <section className="bg-navy-deep border-y border-white/10 py-18 sm:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <Badge variant="success">Démonstration interactive</Badge>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Explorez la Démo de votre future boutique
                </h2>
              </div>

              <div className="inline-flex flex-wrap gap-1.5 rounded-xl border border-white/12 bg-[#102A43] p-1.5">
                {SHOWCASE_TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer sm:text-sm ${
                        active
                          ? "bg-[#10B981] text-white shadow-xs"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <div
            key={activeTab}
            className="animate-tab-panel mt-10 grid items-center gap-8 rounded-2xl border border-white/12 bg-[#102A43] p-6 sm:p-10 lg:grid-cols-12"
          >
            <div className="space-y-5 lg:col-span-5">
              <h3 className="text-2xl font-bold text-white">
                {currentTab.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                {currentTab.description}
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                {currentTab.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 text-[#10B981]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/dashboard">
                  <Button variant="primary">
                    Ouvrir la Démo complète
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/s/atelier-dakar">
                  <Button
                    variant="outline"
                    className="border-white/15 bg-white/8 text-white hover:bg-white/15"
                  >
                    Visiter la boutique Démo
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              {activeTab === "storefront" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      name: "Ensemble Lin Brodé Teranga",
                      price: "38 500 FCFA",
                      oldPrice: "45 000 FCFA",
                      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
                    },
                    {
                      name: "Sac Cabas Cuir Artisanal",
                      price: "27 500 FCFA",
                      oldPrice: "32 000 FCFA",
                      img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="hover-lift group overflow-hidden rounded-xl border border-white/12 bg-[#0B1F33]"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-bold text-white">
                          {item.name}
                        </p>
                        <div className="mt-1.5 flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-[#10B981]">
                            {item.price}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            {item.oldPrice}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-300">
                          <span className="inline-flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5 text-[#10B981]" />
                            Livraison 24h
                          </span>
                          <span className="font-semibold text-white">
                            Ajouter →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "dashboard" && (
                <div className="rounded-xl border border-white/12 bg-[#0B1F33] p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <p className="text-sm font-bold text-white">
                      Tableau de bord Démo · Commandes en direct
                    </p>
                    <Badge variant="success">Mode Démo</Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        ref: "ES-261124-9312",
                        client: "Fatou Ndiaye · Dakar",
                        amount: "23 500 FCFA",
                        status: "Nouvelle commande",
                        variant: "info" as const,
                      },
                      {
                        ref: "ES-261124-7104",
                        client: "Moussa Sarr · Almadies",
                        amount: "29 000 FCFA",
                        status: "Confirmée",
                        variant: "success" as const,
                      },
                      {
                        ref: "ES-261123-4821",
                        client: "Hermann Agossou · Cotonou",
                        amount: "40 000 FCFA",
                        status: "Livrée",
                        variant: "success" as const,
                      },
                    ].map((row) => (
                      <div
                        key={row.ref}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#102A43] px-4 py-3 transition-transform hover:translate-x-1"
                      >
                        <div>
                          <p className="font-mono text-xs font-bold text-white">
                            {row.ref}
                          </p>
                          <p className="text-xs text-slate-300">{row.client}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#10B981]">
                            {row.amount}
                          </span>
                          <Badge variant={row.variant}>{row.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "domains" && (
                <div className="space-y-3 rounded-xl border border-white/12 bg-[#0B1F33] p-5">
                  <p className="text-sm font-bold text-white">
                    Gestion des noms de domaine
                  </p>
                  {[
                    {
                      domain: "atelier-dakar.ecomsate.com",
                      type: "Sous-domaine gratuit",
                      status: "Connecté · HTTPS",
                    },
                    {
                      domain: "atelierdakar.sn",
                      type: "Domaine personnalisé Premium",
                      status: "SSL Actif · Propriétaire",
                    },
                    {
                      domain: "maboutique.bj",
                      type: "Extensions nationales supportées",
                      status: "Disponible",
                    },
                  ].map((d) => (
                    <div
                      key={d.domain}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-[#102A43] px-4 py-3 transition-transform hover:translate-x-1"
                    >
                      <div>
                        <p className="font-mono text-sm font-bold text-white">
                          {d.domain}
                        </p>
                        <p className="text-xs text-slate-300">{d.type}</p>
                      </div>
                      <Badge variant="success">{d.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 : FONCTIONNALITÉS — Bento Grid Bleu Nuit */}
      <section className="bg-[#102A43] py-18 sm:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
                  Fonctionnalités clés
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Pensé pour vendre sérieusement dès le premier jour
                </h2>
              </div>
              <Link href="/fonctionnalites">
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/8 text-white hover:bg-white/15"
                >
                  Toutes les fonctionnalités
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-6">
            <Reveal delayMs={60} className="md:col-span-3">
              <div className="hover-lift h-full rounded-2xl border border-white/12 bg-[#0B1F33] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981]/20 text-[#10B981]">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">
                  Catalogue complet, variantes & rédaction Adeshina IA
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Publiez plusieurs photos par article, gérez vos tailles et
                  couleurs, laissez Adeshina IA rédiger vos descriptions
                  commerciales et recevez des alertes avant toute rupture.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={140} className="md:col-span-3">
              <div className="hover-lift h-full rounded-2xl border border-white/12 bg-[#0B1F33] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981] text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">
                  Commandes WhatsApp, Livraison & Mobile Money
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Offrez les modes de paiement que vos clients utilisent
                  vraiment : paiement à la livraison, commande WhatsApp
                  pré-remplie et Mobile Money avec confirmation.
                </p>
              </div>
            </Reveal>

            {[
              {
                icon: Palette,
                title: "Personnalisation sans code",
                desc: "Logo, bannière, couleurs et modèles de vitrine indépendants d'EcomSate.",
              },
              {
                icon: Smartphone,
                title: "Priorité mobile (Android & iPhone)",
                desc: "Gérez votre boutique et validez vos commandes depuis votre smartphone.",
              },
              {
                icon: ShieldCheck,
                title: "Isolation stricte des données",
                desc: "Vos clients, stocks et chiffres d'affaires appartiennent uniquement à votre boutique.",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.title}
                  delayMs={180 + idx * 80}
                  className="md:col-span-2"
                >
                  <div className="hover-lift h-full rounded-2xl border border-white/12 bg-[#0B1F33] p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/15 text-[#10B981]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 : AVANTAGES & COMPARATIF */}
      <section className="bg-navy-deep border-t border-white/10 py-18 text-white sm:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <Reveal className="space-y-5 lg:col-span-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
                <Sparkles className="h-3.5 w-3.5" />
                Pourquoi passer à EcomSate ?
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Structurez votre commerce et inspirez confiance
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Vendre uniquement en message privé freine votre croissance. Avec
                EcomSate et Adeshina IA, vous gardez la simplicité de WhatsApp
                tout en offrant l&apos;expérience professionnelle d&apos;une
                grande marque.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-3">
                {[
                  { icon: Layers, label: "Architecture multi-pays" },
                  { icon: Globe, label: "Nom de domaine personnel" },
                  { icon: TrendingUp, label: "Suivi du chiffre d'affaires" },
                  { icon: ShieldCheck, label: "Données 100 % privées" },
                ].map((a) => {
                  const Icon = a.icon;
                  return (
                    <div
                      key={a.label}
                      className="flex items-center gap-2.5 rounded-xl border border-white/12 bg-[#102A43] px-3.5 py-3 text-xs font-medium text-slate-200 transition-colors hover:border-[#10B981]/50"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[#10B981]" />
                      <span>{a.label}</span>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delayMs={140} className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#102A43]">
                <div className="grid grid-cols-12 border-b border-white/10 bg-white/5 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <div className="col-span-4">Critère</div>
                  <div className="col-span-4">Sans boutique</div>
                  <div className="col-span-4 text-[#10B981]">Avec EcomSate</div>
                </div>
                <div className="divide-y divide-white/10">
                  {COMPARISON.map((row) => (
                    <div
                      key={row.topic}
                      className="grid grid-cols-12 gap-3 px-5 py-4 text-xs transition-colors hover:bg-white/5 sm:text-sm"
                    >
                      <div className="col-span-12 font-bold text-white sm:col-span-4">
                        {row.topic}
                      </div>
                      <div className="col-span-6 flex items-start gap-1.5 text-slate-400 sm:col-span-4">
                        <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        <span>{row.before}</span>
                      </div>
                      <div className="col-span-6 flex items-start gap-1.5 text-slate-100 sm:col-span-4">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                        <span>{row.after}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 5 : TARIFS */}
      <section className="border-t border-white/10 bg-[#102A43] py-18 sm:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
                Tarifs transparents
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Des formules claires, adaptées à votre activité
              </h2>
              <p className="mt-3 text-base text-slate-300">
                Commencez avec une activation unique de{" "}
                <strong className="text-white">2 000 FCFA</strong> donnant accès
                à <strong className="text-white">30 jours d&apos;essai</strong>{" "}
                et à l&apos;assistant{" "}
                <strong className="text-[#10B981]">Adeshina IA</strong>.
              </p>

              <div className="mt-6 inline-flex items-center rounded-xl border border-white/15 bg-[#0B1F33] p-1">
                <button
                  type="button"
                  onClick={() => setAnnual(false)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                    !annual
                      ? "bg-[#10B981] text-white shadow-2xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  type="button"
                  onClick={() => setAnnual(true)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                    annual
                      ? "bg-[#10B981] text-white shadow-2xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Annuel (2 mois offerts)
                </button>
              </div>
            </div>
          </Reveal>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            {paidPlans.map((plan, idx) => {
              const isPremium = plan.code === "premium";
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              return (
                <Reveal key={plan.id} delayMs={idx * 120}>
                  <div
                    className={`hover-lift flex h-full flex-col rounded-2xl p-7 ${
                      isPremium
                        ? "border-2 border-[#10B981] bg-[#0B1F33] shadow-xl"
                        : "border border-white/12 bg-[#0B1F33]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">
                        {plan.name}
                      </h3>
                      {isPremium && (
                        <Badge variant="success">Recommandé</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      {plan.description}
                    </p>

                    <div className="mt-6 flex items-baseline gap-1.5 border-b border-white/10 pb-6">
                      <span className="text-3xl font-extrabold text-white">
                        <AnimatedNumber
                          value={price}
                          suffix={` ${plan.currency}`}
                        />
                      </span>
                      <span className="text-sm text-slate-400">
                        / {annual ? "an" : "mois"}
                      </span>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-200">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/creer-une-boutique" className="mt-8 block">
                      <Button
                        variant={isPremium ? "primary" : "outline"}
                        className={
                          isPremium
                            ? "w-full"
                            : "w-full border-white/20 bg-white/8 text-white hover:bg-white/15"
                        }
                        size="lg"
                      >
                        Démarrer l&apos;essai 30 jours
                      </Button>
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6 : FAQ FLUIDE + BANNIÈRE FINALE */}
      <section className="bg-navy-deep border-t border-white/10 py-18 sm:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="space-y-4 lg:col-span-4">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
                FAQ
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Questions fréquentes
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Tout ce qu&apos;il faut savoir sur EcomSate et l&apos;assistant{" "}
                <strong className="text-white">Adeshina IA</strong>.
              </p>
              <Link href="/contact" className="inline-block pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/15 bg-white/8 text-white hover:bg-white/15"
                >
                  Poser une autre question
                </Button>
              </Link>
            </Reveal>

            <div className="space-y-3 lg:col-span-8">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <Reveal key={item.q} delayMs={idx * 60}>
                    <div className="overflow-hidden rounded-xl border border-white/12 bg-[#102A43] transition-colors hover:border-[#10B981]/40">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                      >
                        <span className="font-semibold text-white">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-slate-300 transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-[#10B981]" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-white/10 bg-[#0B1F33] px-5 py-4 text-sm leading-relaxed text-slate-300">
                            {item.a}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <Reveal delayMs={120}>
            <div className="mt-18 rounded-2xl border border-[#10B981]/30 bg-[#102A43] px-6 py-12 text-center sm:px-12">
              <h2 className="mx-auto max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Lancez votre boutique professionnelle aujourd&apos;hui avec
                Adeshina IA
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
                Rejoignez les commerçants qui structurent leurs ventes en ligne
                sur EcomSate. Activation unique à 2 000 FCFA pour 30 jours
                d&apos;essai.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/creer-une-boutique">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Créer ma boutique maintenant
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white/20 bg-white/8 text-white hover:bg-white/15 sm:w-auto"
                  >
                    Explorer la Démo
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
