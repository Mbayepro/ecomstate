"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  Layers,
  PackageCheck,
  Play,
  Pause,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { AnimatedNumber, Reveal } from "@/components/ui/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * 1. ROTATING HERO PHRASE — Signature Shopify ("Be the next...")
 * Fait défiler avec fluidité les ambitions e-commerce COD en Afrique.
 */
const HERO_ROTATING_WORDS = [
  "marque Mode de référence",
  "pépite Beauté & Karité",
  "boutique High-Tech rentable",
  "réussite Cash on Delivery",
];

export function RotatingHeroPhrase() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % HERO_ROTATING_WORDS.length);
    }, 3100);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-flex min-h-[1.2em] items-baseline overflow-hidden align-bottom">
      <span key={idx} className="animate-word-flip text-gradient-animated">
        {HERO_ROTATING_WORDS[idx]}.
      </span>
    </span>
  );
}

/**
 * 2. SHOPIFY-STYLE EDITORIAL HERO REEL
 * Carrousel cinématique auto-rythmé avec portraits éditoriaux de fondatrices africaines,
 * effet Ken Burns, barres de progression interactives et cartes UI flottantes en verre dépoli.
 */
interface HeroSlide {
  id: string;
  badge: string;
  cityTag: string;
  headline: string;
  caption: string;
  image: string;
  topFloatingPill: {
    label: string;
    value: string;
    accent: "emerald" | "amber";
  };
  bottomFloatingCard: {
    title: string;
    subtitle: string;
    metricLabel: string;
    metricValue: number;
    metricSuffix: string;
  };
}

const HERO_REEL_SLIDES: HeroSlide[] = [
  {
    id: "fashion-founder",
    badge: "Mode & Prêt-à-porter · Shrine Pro 3",
    cityTag: "Dakar · Abidjan · Cotonou",
    headline: "Créatrices & Ateliers de Mode",
    caption:
      "Présentez vos collections avec Shrine Pro 3, activez les Packs Duo/Trio et encaissez à la livraison.",
    image: "/images/hero-african-founder-fashion.jpg",
    topFloatingPill: {
      label: "Nouvelle commande COD · Pack Duo",
      value: "+49 000 FCFA",
      accent: "emerald",
    },
    bottomFloatingCard: {
      title: "Boutique Shrine Pro 3 active",
      subtitle: "Formulaire COD 1 clic · Tailles & Couleurs",
      metricLabel: "CA Livré vérifié",
      metricValue: 185000,
      metricSuffix: " FCFA",
    },
  },
  {
    id: "beauty-founder",
    badge: "Cosmétiques, Soins & Karité",
    cityTag: "Abidjan · Lomé · Ouagadougou",
    headline: "Marques Beauté & Soins Naturels",
    caption:
      "Valorisez vos sérums et gammes capillaires avec descriptions visuelles riches et suivi de stock automatique.",
    image: "/images/hero-african-founder-beauty.jpg",
    topFloatingPill: {
      label: "Stock synchronisé · Coffret Éclat",
      value: "Confirmée",
      accent: "emerald",
    },
    bottomFloatingCard: {
      title: "Offres Groupées 1x / 2x / 3x",
      subtitle: "Panier moyen augmenté sans carte bancaire",
      metricLabel: "Bénéfice net réel",
      metricValue: 94500,
      metricSuffix: " FCFA",
    },
  },
  {
    id: "cod-handover",
    badge: "Logistique & Paiement à la réception",
    cityTag: "Livraison urbaine & régions",
    headline: "Remise en mains propres & Cash maîtrisé",
    caption:
      "Chaque colis est suivi du départ livreur jusqu'au reversement franc par franc dans votre caisse.",
    image: "/images/african-cod-delivery-handover.jpg",
    topFloatingPill: {
      label: "Colis vérifié & encaissé par le livreur",
      value: "38 500 FCFA",
      accent: "amber",
    },
    bottomFloatingCard: {
      title: "Rapprochement Financier COD",
      subtitle: "Attendu vs Encaissé vs Reversé sans écart",
      metricLabel: "Cash contrôlé",
      metricValue: 142000,
      metricSuffix: " FCFA",
    },
  },
  {
    id: "team-scale",
    badge: "Équipe & Copilote Adeshina IA",
    cityTag: "Multi-rôles & Automatisations",
    headline: "Pilotez vos opérations comme une grande marque",
    caption:
      "Confirmation téléphonique, préparation des colis, ROAS publicitaire et conseils d'Adeshina IA en direct.",
    image: "/images/african-merchant-packaging-cod.jpg",
    topFloatingPill: {
      label: "Adeshina IA · Analyse de rentabilité",
      value: "54 % marge nette",
      accent: "emerald",
    },
    bottomFloatingCard: {
      title: "Centre de contrôle unifié",
      subtitle: "11 statuts COD · Zéro commande perdue",
      metricLabel: "Profit net livré",
      metricValue: 215000,
      metricSuffix: " FCFA",
    },
  },
];

export function ShopifyHeroReel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_REEL_SLIDES.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [paused, active]);

  const current = HERO_REEL_SLIDES[active];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
    >
      {/* Cadre photographique principal style Shopify */}
      <div className="relative aspect-[4/4.3] w-full overflow-hidden rounded-[28px] border border-white/20 bg-[#042622] shadow-[0_32px_70px_-16px_rgba(0,0,0,0.55)] sm:aspect-[16/14.5]">
        {HERO_REEL_SLIDES.map((slide, i) => {
          const isCurrent = i === active;
          return (
            <div
              key={slide.id}
              aria-hidden={!isCurrent}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isCurrent ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              }`}
            >
              <img
                key={`${slide.id}-${isCurrent ? "active" : "idle"}`}
                src={slide.image}
                alt={slide.headline}
                className={`h-full w-full object-cover object-center ${
                  isCurrent && !paused ? "animate-ken-burns" : ""
                }`}
              />
              {/* Dégradé éditorial subtil pour lisibilité parfaite sans masquer les visages */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#042622]/95 via-[#042622]/25 to-black/15" />
            </div>
          );
        })}

        {/* Pastille supérieure gauche : Secteur & Villes */}
        <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2 sm:left-5 sm:top-5">
          <span className="glass-shopify-dark inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold text-white">
            <span className="relative flex h-2 w-2">
              <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-[#00A884]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00A884]" />
            </span>
            {current.badge}
          </span>
        </div>

        {/* Bouton Play/Pause discret en haut à droite comme sur Shopify.com */}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Relancer le défilement" : "Mettre en pause"}
          className="glass-shopify-dark absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:scale-105 hover:border-[#00A884] sm:right-5 sm:top-5 cursor-pointer"
        >
          {paused ? (
            <Play className="h-3.5 w-3.5 fill-current text-[#00A884]" />
          ) : (
            <Pause className="h-3.5 w-3.5 text-white/90" />
          )}
        </button>

        {/* Notification Commerce COD flottante animée (milieu droit) */}
        <div
          key={`pill-${current.id}`}
          className="animate-card-pop glass-shopify-light absolute right-4 top-16 z-20 hidden max-w-[265px] items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[#15232D] sm:right-5 sm:flex"
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
              current.topFloatingPill.accent === "amber"
                ? "bg-[#F4A340]"
                : "bg-[#00A884]"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-slate-600">
              {current.topFloatingPill.label}
            </p>
            <p className="text-xs font-extrabold text-[#073B35]">
              {current.topFloatingPill.value}
            </p>
          </div>
        </div>

        {/* Bas du cadre : Légende éditoriale + Carte KPI flottante + Barres de progression Story */}
        <div className="absolute inset-x-4 bottom-4 z-20 space-y-3.5 sm:inset-x-5 sm:bottom-5">
          <div className="grid items-end gap-3 sm:grid-cols-12">
            <div key={`txt-${current.id}`} className="animate-fade-up sm:col-span-7">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7CE3C8]">
                {current.cityTag}
              </p>
              <h3 className="mt-0.5 text-lg font-extrabold leading-tight text-white sm:text-xl">
                {current.headline}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-200/95">
                {current.caption}
              </p>
            </div>

            {/* Mini-carte Centre de contrôle flottante en verre sombre */}
            <div
              key={`card-${current.id}`}
              className="animate-card-pop-delayed glass-shopify-dark rounded-2xl p-3 sm:col-span-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-bold text-white">
                  {current.bottomFloatingCard.title}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#00A884]" />
              </div>
              <p className="mt-0.5 truncate text-[10px] text-slate-300">
                {current.bottomFloatingCard.subtitle}
              </p>
              <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-2">
                <span className="text-[10px] font-medium text-[#E7F7F2]">
                  {current.bottomFloatingCard.metricLabel}
                </span>
                <span className="text-sm font-extrabold text-[#00A884]">
                  <AnimatedNumber
                    value={current.bottomFloatingCard.metricValue}
                    suffix={current.bottomFloatingCard.metricSuffix}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Barres de progression style Shopify Story Reel */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {HERO_REEL_SLIDES.map((s, idx) => {
              const isActive = idx === active;
              const isPast = idx < active;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(idx)}
                  aria-label={`Voir ${s.headline}`}
                  className="group/bar py-1 text-left cursor-pointer"
                >
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/25">
                    {isActive ? (
                      <div
                        key={`prog-${active}-${paused ? "p" : "r"}`}
                        className={`h-full rounded-full bg-[#00A884] ${
                          paused ? "w-1/2" : "animate-reel-progress"
                        }`}
                      />
                    ) : (
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isPast
                            ? "w-full bg-white/80"
                            : "w-0 bg-white/50 group-hover/bar:w-1/3"
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. RUBAN VISUEL INFINI (MARQUEE) STYLE SHOPIFY
 * Met en scène l'écosystème e-commerce africain : créatrices, mode, cosmétiques,
 * maroquinerie, acheteuses sur mobile et livreurs COD.
 */
const SHOWCASE_CARDS = [
  {
    title: "Mode & Prêt-à-porter",
    subtitle: "Packs Duo & Sélecteur de tailles COD",
    tag: "Shrine Pro 3",
    image: "/images/african-fashion-model-teranga.jpg",
  },
  {
    title: "Cosmétiques & Soins Karité",
    subtitle: "Fiches enrichies & routines beauté",
    tag: "Beauté & Soins",
    image: "/images/african-beauty-glow-portrait.jpg",
  },
  {
    title: "Commande Mobile en 25s",
    subtitle: "Sans carte bancaire ni e-mail forcé",
    tag: "Form Builder COD",
    image: "/images/african-woman-mobile-shopping.jpg",
  },
  {
    title: "Chaussures & Maroquinerie",
    subtitle: "Variantes pointures & vérification colis",
    tag: "Cuir & Sneakers",
    image: "/images/african-sneakers-leather-studio.jpg",
  },
  {
    title: "Livraison Express & Cash",
    subtitle: "Assignation livreur & suivi encaissement",
    tag: "Logistique COD",
    image: "/images/african-courier-motorbike-dispatch.jpg",
  },
  {
    title: "Ateliers & Marques D2C",
    subtitle: "Du premier colis jusqu'au multi-boutiques",
    tag: "Croissance",
    image: "/images/hero-african-founder-fashion.jpg",
  },
];

export function MerchantEditorialMarquee() {
  const doubled = [...SHOWCASE_CARDS, ...SHOWCASE_CARDS];

  return (
    <section className="overflow-hidden border-b border-[#E2E8F0] bg-white py-12 sm:py-16">
      <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F7F2] px-3 py-1 text-xs font-extrabold text-[#073B35]">
              <Sparkles className="h-3.5 w-3.5 text-[#00A884]" />
              Conçu pour les entrepreneures & commerçants d&apos;Afrique
            </span>
            <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-[#15232D] sm:text-3xl">
              Chaque secteur trouve sa vitrine haute conversion
            </h2>
          </div>
          <Link
            href="/creer-une-boutique"
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#073B35] transition hover:text-[#00A884]"
          >
            Lancer ma boutique Shrine Pro 3
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Ruban défilant fluide avec pause au survol */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-24" />

        <div className="animate-marquee-slow gap-5 px-4">
          {doubled.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className="group relative h-72 w-60 shrink-0 overflow-hidden rounded-3xl border border-[#E2E8F0] bg-[#073B35] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#00A884] hover:shadow-xl sm:h-80 sm:w-68"
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="bento-photo-zoom h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#042622]/90 via-[#042622]/20 to-transparent" />

              <span className="glass-shopify-dark absolute left-3.5 top-3.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-[#7CE3C8]">
                {item.tag}
              </span>

              <div className="absolute inset-x-4 bottom-4">
                <h3 className="text-base font-extrabold text-white">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-xs text-[#E7F7F2]/90">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 4. GRILLE BENTO ASYMÉTRIQUE INTERACTIVE (INSPIRÉE DE SHOPIFY.COM)
 * Associe grandes photographies éditoriales africaines et micro-interfaces vivantes.
 */
export function ShopifyBentoShowcase() {
  const [selectedPack, setSelectedPack] = useState<1 | 2 | 3>(2);

  const packPricing = {
    1: { label: "1 Unité · Standard", total: 28500, save: "Livraison COD" },
    2: { label: "Pack Duo (2x) · Populaire", total: 49000, save: "Économisez 8 000 F" },
    3: { label: "Pack Trio (3x) · Meilleure offre", total: 69000, save: "Économisez 16 500 F" },
  }[selectedPack];

  return (
    <section className="border-b border-[#E2E8F0] bg-[#F8FAFC] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge variant="success">Expérience Visuelle & Opérationnelle</Badge>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#15232D] sm:text-4xl">
            Une esthétique de grande marque.{" "}
            <span className="text-[#00A884]">Un moteur pensé pour le terrain COD.</span>
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Tout ce qui transforme un simple visiteur TikTok ou Facebook en une
            commande réellement livrée, encaissée et rentable.
          </p>
        </Reveal>

        {/* BENTO GRID 12 COLONNES */}
        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          {/* TUILE 1 (7 COLS) : SHRINE PRO 3 INTERACTIF + MODÈLE AFRICAINE */}
          <Reveal className="lg:col-span-7">
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#073B35] p-6 text-white shadow-xl sm:p-8">
              <div className="grid items-center gap-6 sm:grid-cols-12">
                <div className="space-y-4 sm:col-span-7">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00A884]/40 bg-[#00A884]/15 px-3 py-1 text-xs font-extrabold text-[#7CE3C8]">
                    <Layers className="h-3.5 w-3.5 text-[#00A884]" />
                    Thème Shrine Pro 3 inclus (Valeur 1 000 $)
                  </span>
                  <h3 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                    Des fiches produits qui multiplient vos paniers moyens
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Chaque boutique démarre directement avec Shrine Pro 3 :
                    photos HD, jauge de rareté, tableau comparatif et sélecteur
                    de packs interactif. Cliquez pour tester :
                  </p>

                  {/* Sélecteur de pack interactif en direct */}
                  <div className="space-y-2 pt-1">
                    {([1, 2, 3] as const).map((n) => {
                      const active = selectedPack === n;
                      const titles = {
                        1: "1 Article — 28 500 FCFA",
                        2: "Pack Duo (2x) — 49 000 FCFA",
                        3: "Pack Trio (3x) — 69 000 FCFA",
                      };
                      const tags = {
                        1: "Standard",
                        2: "-8 000 F",
                        3: "-16 500 F",
                      };
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSelectedPack(n)}
                          className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs transition-all cursor-pointer ${
                            active
                              ? "border-[#00A884] bg-[#00A884]/20 text-white shadow-sm"
                              : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-bold">
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                active
                                  ? "border-[#00A884] bg-[#00A884]"
                                  : "border-white/40"
                              }`}
                            >
                              {active && <Check className="h-2.5 w-2.5 text-white" />}
                            </span>
                            {titles[n]}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                              active
                                ? "bg-[#00A884] text-white"
                                : "bg-white/10 text-[#7CE3C8]"
                            }`}
                          >
                            {tags[n]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div>
                      <p className="text-[11px] text-[#7CE3C8]">{packPricing.save}</p>
                      <p className="text-lg font-extrabold text-white">
                        Total COD :{" "}
                        <AnimatedNumber value={packPricing.total} suffix=" FCFA" />
                      </p>
                    </div>
                    <Link href="/s/atelier-dakar">
                      <Button variant="primary" size="sm">
                        Voir la boutique démo
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Visuel éditorial portrait avec carte flottante */}
                <div className="relative sm:col-span-5">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/15">
                    <img
                      src="/images/african-fashion-model-teranga.jpg"
                      alt="Collection Mode Africaine Shrine Pro 3"
                      className="bento-photo-zoom h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#042622]/85 via-transparent to-transparent" />
                    <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 p-2.5 text-[#15232D] shadow-lg">
                      <div className="flex items-center justify-between text-[10px] font-extrabold">
                        <span className="text-[#073B35]">Ensemble Lin Teranga</span>
                        <span className="text-[#00A884]">En stock</span>
                      </div>
                      <div className="mt-1.5 rounded-lg bg-[#00A884] py-1.5 text-center text-[10px] font-extrabold text-white">
                        Commander — Payez à la livraison
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* TUILE 2 (5 COLS) : ACHAT MOBILE EN 30 SECONDES SANS CARTE BANCAIRE */}
          <Reveal delayMs={90} className="lg:col-span-5">
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white shadow-sm transition hover:border-[#00A884]/60 hover:shadow-xl">
              <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/african-woman-mobile-shopping.jpg"
                  alt="Cliente africaine commandant facilement sur smartphone"
                  className="bento-photo-zoom h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#073B35]/80 via-transparent to-transparent" />

                {/* Notification flottante */}
                <div className="animate-float glass-shopify-light absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00A884] text-white">
                      <Check className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-[#15232D]">
                        Formulaire COD validé en 24s
                      </p>
                      <p className="text-[10px] font-medium text-slate-500">
                        Nom · Téléphone · Ville & Repère précis
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#E7F7F2] px-2.5 py-1 text-[10px] font-extrabold text-[#073B35]">
                    0 % CB
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#00A884]">
                    Form Builder 100 % COD
                  </span>
                  <h3 className="mt-1.5 text-xl font-extrabold text-[#15232D]">
                    Zéro friction pour vos clientes sur mobile
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Fini les paniers abandonnés à cause d&apos;un e-mail obligatoire ou
                    d&apos;une carte bancaire. Votre cliente commande directement sur la
                    page produit en quelques secondes.
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-extrabold text-[#073B35]">
                  <span>15 champs personnalisables & anti-doublon</span>
                  <Link
                    href="/dashboard/form-builder"
                    className="inline-flex items-center gap-1 text-[#00A884] hover:underline"
                  >
                    Tester <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          {/* TUILE 3 (5 COLS) : LIVRAISON & RAPPROCHEMENT CASH FRANC PAR FRANC */}
          <Reveal delayMs={120} className="lg:col-span-5">
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white shadow-sm transition hover:border-[#00A884]/60 hover:shadow-xl">
              <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/african-cod-delivery-handover.jpg"
                  alt="Remise de colis Paiement à la livraison en Afrique"
                  className="bento-photo-zoom h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute left-4 top-4">
                  <span className="glass-shopify-dark inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white">
                    <Truck className="h-3.5 w-3.5 text-[#00A884]" />
                    Suivi Livreurs & Cash
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-bold text-white">
                  <span>Remise à domicile après vérification</span>
                  <span className="rounded-lg bg-[#00A884] px-2.5 py-1 text-[11px]">
                    Livrée & Payée
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-6 sm:p-7">
                <div>
                  <h3 className="text-xl font-extrabold text-[#15232D]">
                    Sachez toujours qui détient votre cash
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    Distinguez instantanément le cash attendu en tournée, le cash
                    encaissé chez la cliente et les montants déjà reversés.
                  </p>
                </div>

                {/* Mini jauge de rapprochement COD */}
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#F8FAFC] p-3 text-center">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500">Attendu</p>
                    <p className="mt-0.5 text-xs font-extrabold text-[#15232D]">98 000 F</p>
                  </div>
                  <div className="border-x border-slate-200">
                    <p className="text-[10px] font-semibold text-amber-700">Chez livreur</p>
                    <p className="mt-0.5 text-xs font-extrabold text-amber-600">29 000 F</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#073B35]">Reversé</p>
                    <p className="mt-0.5 text-xs font-extrabold text-[#00A884]">69 000 F</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* TUILE 4 (7 COLS) : ÉQUIPE FÉMININE, PRÉPARATION COLIS & ADESHINA IA */}
          <Reveal delayMs={160} className="lg:col-span-7">
            <div className="group relative grid h-full overflow-hidden rounded-[28px] border border-[#073B35]/15 bg-[#E7F7F2]/65 shadow-sm sm:grid-cols-12">
              <div className="relative min-h-[250px] overflow-hidden sm:col-span-5">
                <img
                  src="/images/african-merchant-packaging-cod.jpg"
                  alt="Entrepreneures africaines préparant leurs commandes e-commerce"
                  className="bento-photo-zoom h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#073B35]/75 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#073B35]/15" />
                <span className="glass-shopify-dark absolute bottom-3 left-3 rounded-xl px-3 py-1.5 text-[11px] font-bold text-white">
                  Opérations structurées · 0 oubli
                </span>
              </div>

              <div className="flex flex-col justify-between p-6 sm:col-span-7 sm:p-8">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#073B35] px-3 py-1 text-xs font-bold text-[#7CE3C8]">
                    <Bot className="h-3.5 w-3.5 text-[#00A884]" />
                    Bénéfice Net Réel & Adeshina IA
                  </span>
                  <h3 className="text-2xl font-extrabold leading-tight text-[#15232D]">
                    Ne confondez plus jamais chiffre commandé et vrai bénéfice net
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-700">
                    Une commande non livrée n&apos;est jamais comptée comme acquise.
                    EcomSate déduit automatiquement vos coûts produits, vos pubs
                    TikTok/Meta et vos frais de livraison.
                  </p>
                </div>

                {/* Carte conseil Adeshina IA */}
                <div className="mt-5 rounded-2xl border border-[#00A884]/30 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-extrabold text-[#073B35]">
                      <TrendingUp className="h-4 w-4 text-[#00A884]" />
                      Diagnostic Adeshina IA en temps réel
                    </span>
                    <span className="rounded-full bg-[#E7F7F2] px-2 py-0.5 text-[10px] font-extrabold text-[#073B35]">
                      Connecté à vos chiffres
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    « Vos ventes livrées cette semaine dégagent{" "}
                    <strong className="text-[#073B35]">+54 % de marge nette</strong> après
                    déduction du budget Meta Ads. Pensez à réapprovisionner le{" "}
                    <em>Sérum Karité</em> (4 unités restantes). »
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
