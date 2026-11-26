"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Footprints,
  Globe,
  Home,
  Loader2,
  Lock,
  Rocket,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  UserCheck,
  Wand2,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import {
  PENDING_OAUTH_STORE_KEY,
  type PendingOAuthStorePrefs,
  usePlatform,
} from "@/lib/platform-store";
import { ADESHINA_SECTORS, getBlueprintBySector } from "@/lib/adeshina-ai";
import { formatCurrency, slugify } from "@/lib/utils";
import { signInWithGoogleOAuth } from "@/lib/supabase/client";
import type { StoreTemplateId } from "@/types/domain";

interface NicheOption {
  sectorId: string;
  title: string;
  subtitle: string;
  codBadge: string;
  image: string;
  nameIdeas: string[];
  previewProduct: {
    name: string;
    price: number;
    promoPrice: number;
    variantPill: string;
  };
  icon: React.ComponentType<{ className?: string }>;
}

const NICHE_OPTIONS: NicheOption[] = [
  {
    sectorId: "mode",
    title: "Mode & Prêt-à-porter",
    subtitle: "Vêtements, wax, ensembles & couture",
    codBadge: "Tailles & Packs Duo",
    image: "/images/african-fashion-model-teranga.jpg",
    nameIdeas: ["Maison Kora Mode", "Atelier Teranga Chic", "Ébène Couture"],
    previewProduct: {
      name: "Ensemble Lin & Soie Teranga",
      price: 35000,
      promoPrice: 28500,
      variantPill: "Taille : M · L · XL",
    },
    icon: Shirt,
  },
  {
    sectorId: "beaute",
    title: "Beauté & Cosmétiques",
    subtitle: "Soins visage, cheveux, karité & parfums",
    codBadge: "Coffrets & Routines",
    image: "/images/african-beauty-glow-portrait.jpg",
    nameIdeas: ["Éclat Karité Beauté", "Naya Soins Naturels", "Amina Glow"],
    previewProduct: {
      name: "Sérum Botanique & Karité Pur",
      price: 22000,
      promoPrice: 17500,
      variantPill: "Format : Coffret Duo (-20%)",
    },
    icon: Sparkles,
  },
  {
    sectorId: "tech",
    title: "Électronique & High-Tech",
    subtitle: "Téléphones, montres, audio & gadgets",
    codBadge: "Garantie & Test colis",
    image: "/images/african-courier-motorbike-dispatch.jpg",
    nameIdeas: ["NovaTech Store", "Kora Digital Pro", " Élite Tech COD"],
    previewProduct: {
      name: "Écouteurs Sans Fil Pro ANC",
      price: 29000,
      promoPrice: 22000,
      variantPill: "Couleur : Noir Titane",
    },
    icon: Smartphone,
  },
  {
    sectorId: "chaussures",
    title: "Chaussures & Maroquinerie",
    subtitle: "Sneakers, sandales cuir, sacs & mocassins",
    codBadge: "Pointures & Essayage",
    image: "/images/african-sneakers-leather-studio.jpg",
    nameIdeas: ["Pas d'Or Cuir", "Dakar Sneakers Club", "Maison Maroquin"],
    previewProduct: {
      name: "Mocassins Cuir Cousu Main",
      price: 38000,
      promoPrice: 32000,
      variantPill: "Pointure : 40 · 42 · 44",
    },
    icon: Footprints,
  },
  {
    sectorId: "maison",
    title: "Maison & Équipements",
    subtitle: "Cuisine, déco, électroménager & rangement",
    codBadge: "Livraison Domicile",
    image: "/images/african-merchant-packaging-cod.jpg",
    nameIdeas: ["Confort Maison Plus", "Idéal Cuisine Pro", "Oasis Déco"],
    previewProduct: {
      name: "Robot Culinaire Multi-Fonctions",
      price: 42000,
      promoPrice: 34500,
      variantPill: "Pack : Bol Inox 2L + Hachoir",
    },
    icon: Home,
  },
  {
    sectorId: "general",
    title: "Autre / Multi-produits",
    subtitle: "Boutique généraliste avec tous types d'articles",
    codBadge: "Catalogue Flexible",
    image: "/images/hero-african-founder-fashion.jpg",
    nameIdeas: ["Sélection Prestige", "Le Comptoir Express", " Africa Market Pro"],
    previewProduct: {
      name: "Offre Vedette Sélection Premium",
      price: 30000,
      promoPrice: 24000,
      variantPill: "Pack : 1x ou Duo Économique",
    },
    icon: ShoppingBag,
  },
];

const COUNTRY_FLAGS: Record<string, string> = {
  BJ: "🇧🇯",
  SN: "🇸🇳",
  CI: "🇨🇮",
  TG: "🇹🇬",
  BF: "🇧🇫",
};

const STEPS_META = [
  { num: 1 as const, label: "Secteur & Pays", short: "Activité" },
  { num: 2 as const, label: "Nom & Shrine Pro 3", short: "Boutique" },
  { num: 3 as const, label: "Accès propriétaire", short: "Lancement" },
];

export default function CreerUneBoutiquePage() {
  const router = useRouter();
  const { countries, registerMerchant } = usePlatform();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [quickMode, setQuickMode] = useState(false);

  // Étape 1 : Activité, Niche & Pays
  const [sectorId, setSectorId] = useState("beaute");
  const [activityStage, setActivityStage] = useState<
    "already_selling" | "starting"
  >("already_selling");
  const [countryCode, setCountryCode] = useState("BJ");

  // Étape 2 : Nom de boutique, Thème Shrine Pro 3 & Adeshina IA
  const [storeName, setStoreName] = useState("");
  const [templateId] = useState<StoreTemplateId>("shrine_pro_3");
  const [useAdeshinaSetup, setUseAdeshinaSetup] = useState(true);

  // Étape 3 : Identifiants propriétaire
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("sector");
    const n = params.get("storeName");
    if (s && NICHE_OPTIONS.some((sec) => sec.sectorId === s)) {
      setSectorId(s);
    } else if (s && ADESHINA_SECTORS.some((sec) => sec.sectorId === s)) {
      setSectorId(s);
    }
    if (n) {
      setStoreName(n);
    }
  }, []);

  const activeCountries = useMemo(
    () => countries.filter((c) => c.isActive),
    [countries]
  );

  const selectedCountry = useMemo(
    () =>
      activeCountries.find((c) => c.code === countryCode) ??
      activeCountries[0] ?? {
        code: "BJ",
        name: "Bénin",
        currency: "FCFA",
        phonePrefix: "+229",
      },
    [activeCountries, countryCode]
  );

  const resolvedSectorId = sectorId === "general" ? "mode" : sectorId;
  const blueprint = getBlueprintBySector(resolvedSectorId, storeName);
  const selectedNicheMeta =
    NICHE_OPTIONS.find((n) => n.sectorId === sectorId) ?? NICHE_OPTIONS[1];

  const liveDisplayStoreName =
    storeName.trim() || selectedNicheMeta.nameIdeas[0] || blueprint.suggestedName;
  const previewSlug = slugify(liveDisplayStoreName) || "ma-boutique";

  const progressPct = quickMode ? 100 : step === 1 ? 34 : step === 2 ? 68 : 100;

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let s = 1;
    if (password.length >= 6) s++;
    if (password.length >= 9) s++;
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) s++;
    return Math.min(4, s);
  }, [password]);

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const prefs: PendingOAuthStorePrefs = {
        storeName: liveDisplayStoreName,
        phone: phone.trim() || undefined,
        countryCode,
        sectorId: resolvedSectorId,
        useAdeshinaSetup,
      };
      window.localStorage.setItem(
        PENDING_OAUTH_STORE_KEY,
        JSON.stringify(prefs)
      );
    } catch {
      // Ignore
    }
    const res = await signInWithGoogleOAuth("/dashboard");
    if (!res.ok) {
      setGoogleLoading(false);
      setError(res.error ?? "Impossible de démarrer l'inscription Google.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    const res = registerMerchant({
      fullName,
      storeName: liveDisplayStoreName,
      email,
      phone,
      countryCode,
      password,
      sectorId: resolvedSectorId,
      useAdeshinaSetup,
      templateId,
      niche: selectedNicheMeta.title,
    });
    if (!res.ok) {
      setError(res.error ?? "Impossible de créer la boutique.");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="bg-navy-architectural relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-10">
      {/* Halos d'ambiance subtils */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-24 top-12 h-80 w-80 rounded-full bg-[#00A884]/20 blur-3xl" />
        <div className="animate-blob-delayed absolute right-0 bottom-10 h-96 w-96 rounded-full bg-[#7CE3C8]/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* BARRE SUPÉRIEURE */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <BrandLogo light />

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setQuickMode((v) => !v);
                setStep(3);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3.5 py-2 text-xs font-semibold text-[#E7F7F2] backdrop-blur-xs transition hover:border-[#00A884]/60 hover:bg-white/14 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-[#00A884]" />
              {quickMode ? "Mode guidé en 3 étapes" : "Création directe (30s)"}
            </button>
            <Link
              href="/connexion"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:border-[#00A884] hover:bg-white/18"
            >
              Connexion
            </Link>
          </div>
        </header>

        {/* GRILLE STUDIO : 7 COLONNES CONFIGURATEUR + 5 COLONNES APERÇU MOBILE LIVE */}
        <div className="grid items-start gap-7 lg:grid-cols-12">
          {/* COLONNE GAUCHE : CONFIGURATEUR TACTILE */}
          <div className="overflow-hidden rounded-[28px] border border-white/15 bg-white shadow-[0_28px_70px_-15px_rgba(0,0,0,0.45)] lg:col-span-7">
            {/* Barre de progression fluide + Stepper */}
            {!quickMode && (
              <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 pb-4 pt-5 sm:px-8">
                <div className="mb-3.5 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#073B35]">
                    Configuration de votre boutique COD
                  </span>
                  <span className="rounded-full bg-[#E7F7F2] px-2.5 py-0.5 text-[11px] font-extrabold text-[#00A884]">
                    Étape {step} sur 3 · {progressPct} %
                  </span>
                </div>

                {/* Jauge animée */}
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#073B35] via-[#00A884] to-[#00A884] transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {STEPS_META.map((s) => {
                    const isCurrent = step === s.num;
                    const isDone = step > s.num;
                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => setStep(s.num)}
                        className={`group flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-all cursor-pointer ${isCurrent
                            ? "bg-[#073B35] text-white shadow-md"
                            : isDone
                              ? "bg-[#E7F7F2] text-[#073B35] hover:bg-[#d5f2e9]"
                              : "border border-[#E2E8F0] bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"
                          }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-transform group-hover:scale-105 ${isCurrent || isDone
                              ? "bg-[#00A884] text-white"
                              : "bg-slate-100 text-slate-500"
                            }`}
                        >
                          {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                        </span>
                        <div className="min-w-0">
                          <p className="hidden text-[10px] font-bold uppercase tracking-wider opacity-75 sm:block">
                            Étape 0{s.num}
                          </p>
                          <p className="truncate text-xs font-extrabold">
                            <span className="sm:hidden">{s.short}</span>
                            <span className="hidden sm:inline">{s.label}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-5 sm:p-8">
              {/* =========================================================
                  ÉTAPE 1 : CARTES VISUELLES DE NICHE + CHOIX TACTILES SANS SELECT
                 ========================================================= */}
              {!quickMode && step === 1 && (
                <div key="step-1" className="animate-tab-panel space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F7F2] px-3 py-1 text-[11px] font-extrabold text-[#073B35]">
                      <Sparkles className="h-3.5 w-3.5 text-[#00A884]" />
                      Personnalisation intelligente en temps réel
                    </span>
                    <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-[#15232D] sm:text-[26px]">
                      Quel univers souhaitez-vous lancer ?
                    </h1>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                      Cliquez sur votre secteur : votre aperçu mobile Shrine Pro 3 et
                      votre formulaire COD s&apos;adaptent instantanément.
                    </p>
                  </div>

                  {/* Grille 6 cartes visuelles avec miniature photo africaine & badge COD */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {NICHE_OPTIONS.map((item) => {
                      const Icon = item.icon;
                      const active = sectorId === item.sectorId;
                      return (
                        <button
                          key={item.sectorId}
                          type="button"
                          onClick={() => setSectorId(item.sectorId)}
                          className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border text-left transition-all duration-300 cursor-pointer ${active
                              ? "-translate-y-0.5 border-2 border-[#00A884] bg-white shadow-[0_14px_30px_-10px_rgba(0,168,132,0.28)] ring-4 ring-[#00A884]/12"
                              : "border-[#E2E8F0] bg-[#F8FAFC]/70 hover:-translate-y-0.5 hover:border-[#00A884]/50 hover:bg-white hover:shadow-md"
                            }`}
                        >
                          {/* Bandeau photo éditorial */}
                          <div className="relative h-22 w-full overflow-hidden bg-slate-200">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#042622]/85 via-[#042622]/25 to-transparent" />

                            <span
                              className={`absolute left-2.5 bottom-2 flex h-7 w-7 items-center justify-center rounded-lg shadow-sm transition-colors ${active
                                  ? "bg-[#00A884] text-white"
                                  : "bg-white/95 text-[#073B35]"
                                }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>

                            <span className="absolute right-2.5 bottom-2 rounded-md bg-black/45 px-2 py-0.5 text-[9px] font-bold text-[#E7F7F2] backdrop-blur-xs">
                              {item.codBadge}
                            </span>

                            {active && (
                              <span className="animate-card-pop absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#00A884] text-white shadow-md ring-2 ring-white">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <div className="p-3.5">
                            <p className="text-xs font-extrabold text-[#15232D] group-hover:text-[#073B35]">
                              {item.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                              {item.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Votre situation actuelle : 2 cartes segmentées au lieu d'un select natif */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Où en êtes-vous aujourd&apos;hui ?
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {[
                        {
                          id: "already_selling" as const,
                          title: "Je vends déjà en ligne",
                          desc: "TikTok, WhatsApp, Facebook ou Instagram",
                          icon: TrendingUp,
                        },
                        {
                          id: "starting" as const,
                          title: "Je lance ma 1re boutique",
                          desc: "Démarrage guidé clé en main avec Adeshina IA",
                          icon: Rocket,
                        },
                      ].map((opt) => {
                        const OptIcon = opt.icon;
                        const active = activityStage === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setActivityStage(opt.id)}
                            className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${active
                                ? "border-[#00A884] bg-[#E7F7F2]/65 shadow-2xs"
                                : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-slate-300 hover:bg-white"
                              }`}
                          >
                            <span
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${active
                                  ? "bg-[#073B35] text-[#00A884]"
                                  : "border border-[#E2E8F0] bg-white text-slate-500"
                                }`}
                            >
                              <OptIcon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-extrabold text-[#15232D]">
                                  {opt.title}
                                </p>
                                {active && (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00A884]" />
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                {opt.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pays principal & Devise : Pastilles tactiles 1-clic avec drapeaux & indicatifs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Pays principal & Devise COD
                      </label>
                      <span className="text-[11px] font-bold text-[#073B35]">
                        Devise active : {selectedCountry.currency} (
                        {selectedCountry.phonePrefix})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeCountries.map((c) => {
                        const isSelected = countryCode === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setCountryCode(c.code)}
                            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#073B35] bg-[#073B35] text-white shadow-sm"
                                : "border-[#E2E8F0] bg-white text-[#15232D] hover:border-[#00A884]"
                            }`}
                          >
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-black tracking-wider ${
                                isSelected
                                  ? "bg-[#00A884] text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {c.code}
                            </span>
                            <span>{c.name}</span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {c.currency}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pied d'étape 1 */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-5">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="flex h-2 w-2 rounded-full bg-[#00A884]" />
                      <span>
                        Univers :{" "}
                        <strong className="text-[#073B35]">
                          {selectedNicheMeta.title}
                        </strong>{" "}
                        · {selectedCountry.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto shadow-md"
                    >
                      Continuer vers Nom & Thème
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* =========================================================
                  ÉTAPE 2 : IDENTITÉ DE MARQUE, SUGGESTIONS IA & SHRINE PRO 3
                 ========================================================= */}
              {!quickMode && step === 2 && (
                <div key="step-2" className="animate-tab-panel space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F7F2] px-3 py-1 text-[11px] font-extrabold text-[#073B35]">
                      <Store className="h-3.5 w-3.5 text-[#00A884]" />
                      Identité & Architecture Shrine Pro 3
                    </span>
                    <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-[#15232D]">
                      Donnez un nom mémorable à votre boutique
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      Regardez l&apos;aperçu à droite se mettre à jour en direct dès
                      que vous écrivez.
                    </p>
                  </div>

                  {/* Saisie du nom + Idées en 1 clic + Lien live */}
                  <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#15232D]">
                      Nom commercial de votre marque
                    </label>

                    <div className="relative">
                      <input
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder={`Ex : ${selectedNicheMeta.nameIdeas[0]}`}
                        autoFocus
                        className="h-12 w-full rounded-xl border-2 border-[#E2E8F0] bg-white px-4 pr-28 text-sm font-extrabold text-[#15232D] transition focus:border-[#00A884] focus:outline-none"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg bg-[#E7F7F2] px-2.5 py-1 text-[10px] font-extrabold text-[#073B35]">
                        <Check className="h-3 w-3 text-[#00A884]" />
                        Disponible
                      </span>
                    </div>

                    {/* Suggestions cliquables en 1 tap */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mr-1">
                        <Wand2 className="h-3.5 w-3.5 text-[#00A884]" />
                        Idées {selectedNicheMeta.title.split(" ")[0]} :
                      </span>
                      {selectedNicheMeta.nameIdeas.map((idea) => (
                        <button
                          key={idea}
                          type="button"
                          onClick={() => setStoreName(idea.trim())}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${storeName.trim() === idea.trim()
                              ? "border-[#00A884] bg-[#073B35] text-white"
                              : "border-[#E2E8F0] bg-white text-[#073B35] hover:border-[#00A884]"
                            }`}
                        >
                          {idea.trim()}
                        </button>
                      ))}
                    </div>

                    {/* Sous-domaine généré en direct */}
                    <div className="flex items-center justify-between rounded-xl border border-[#00A884]/25 bg-white px-3.5 py-2.5 text-xs">
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        <Globe className="h-4 w-4 text-[#00A884]" />
                        Adresse web immédiate :
                      </span>
                      <code className="font-extrabold text-[#073B35]">
                        https://{previewSlug}.ecomsate.com
                      </code>
                    </div>
                  </div>

                  {/* Carte Prestige Shrine Pro 3 inclus */}
                  <div className="relative overflow-hidden rounded-2xl border-2 border-[#00A884] bg-gradient-to-br from-[#073B35] to-[#052B27] p-5 text-white shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A884] text-white shadow-sm">
                          <Sparkles className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-sm font-extrabold text-white sm:text-base">
                            Thème Shrine Pro 3 Ultra-Conversion
                          </h3>
                          <p className="text-[11px] text-[#7CE3C8]">
                            Activé d&apos;office sur votre boutique · Valeur 1 000 $ sur Shopify
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#00A884]/25 px-3 py-1 text-[11px] font-extrabold text-[#7CE3C8] border border-[#00A884]/40">
                        Inclus 100 %
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-xs text-[#E7F7F2] sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00A884]" />
                        <span>Formulaire COD 1 clic sur fiche produit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00A884]" />
                        <span>Offres Packs 1x / Duo 2x / Trio 3x</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00A884]" />
                        <span>Jauge de stock & urgence intégrées</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00A884]" />
                        <span>Descriptions riches (photos, vidéos, GIFs)</span>
                      </div>
                    </div>
                  </div>

                  {/* Interrupteur moderne pour le produit modèle prêt à vendre */}
                  <button
                    type="button"
                    onClick={() => setUseAdeshinaSetup((v) => !v)}
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition cursor-pointer ${useAdeshinaSetup
                        ? "border-[#00A884] bg-[#E7F7F2]/60"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                      }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-[#073B35] sm:text-sm">
                        Pré-charger un 1er produit modèle {selectedNicheMeta.title}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Votre boutique ne sera pas vide à l&apos;ouverture : vous pourrez
                        modifier ou remplacer ce produit en 1 clic.
                      </p>
                    </div>
                    <span
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${useAdeshinaSetup ? "bg-[#00A884]" : "bg-slate-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs transition-transform ${useAdeshinaSetup ? "translate-x-5.5" : "translate-x-1"
                          }`}
                      />
                    </span>
                  </button>

                  <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Retour
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={() => setStep(3)}
                      className="shadow-md"
                    >
                      Dernière étape : Créer mon accès
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* =========================================================
                  ÉTAPE 3 (OU MODE RAPIDE) : CRÉATION DU COMPTE PROPRIÉTAIRE
                 ========================================================= */}
              {(quickMode || step === 3) && (
                <div key="step-3" className="animate-tab-panel space-y-5">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F7F2] px-3 py-1 text-[11px] font-extrabold text-[#073B35]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#00A884]" />
                      Boutique prête à être publiée
                    </span>
                    <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-[#15232D]">
                      Activez votre espace propriétaire
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      Accès immédiat à votre Centre de contrôle et à{" "}
                      <strong className="text-[#073B35]">
                        {previewSlug}.ecomsate.com
                      </strong>
                      .
                    </p>
                  </div>

                  {/* Bouton Google OAuth officiel avec vrai logo 4 couleurs */}
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={googleLoading}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#15232D] shadow-2xs transition hover:-translate-y-0.5 hover:border-[#073B35] hover:shadow-md disabled:opacity-60 cursor-pointer"
                  >
                    {googleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#073B35]" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    <span>
                      {googleLoading
                        ? "Connexion sécurisée à Google..."
                        : "Continuer en 1 clic avec Google"}
                    </span>
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#E2E8F0]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      ou par e-mail professionnel
                    </span>
                    <div className="h-px flex-1 bg-[#E2E8F0]" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-[#15232D]">
                          Votre nom complet *
                        </label>
                        <input
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ex : Aminata Diallo"
                          className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm font-medium text-[#15232D] transition focus:border-[#00A884] focus:ring-3 focus:ring-[#00A884]/15 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-[#15232D]">
                          Nom de votre boutique *
                        </label>
                        <input
                          required
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder={selectedNicheMeta.nameIdeas[0]}
                          className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm font-semibold text-[#15232D] transition focus:border-[#00A884] focus:ring-3 focus:ring-[#00A884]/15 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-[#15232D]">
                          Adresse e-mail *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contact@maboutique.com"
                          className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm font-medium text-[#15232D] transition focus:border-[#00A884] focus:ring-3 focus:ring-[#00A884]/15 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 flex items-center justify-between text-xs font-extrabold text-[#15232D]">
                          <span>Téléphone privé *</span>
                          <span className="text-[10px] font-bold text-[#00A884]">
                            100 % confidentiel
                          </span>
                        </label>
                        <div className="flex overflow-hidden rounded-xl border border-[#CBD5E1] bg-white focus-within:border-[#00A884] focus-within:ring-3 focus-within:ring-[#00A884]/15">
                          <span className="inline-flex items-center gap-1 border-r border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-xs font-bold text-[#073B35]">
                            <span>{COUNTRY_FLAGS[countryCode] ?? "🌍"}</span>
                            <span>{selectedCountry.phonePrefix}</span>
                          </span>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="97 00 00 00"
                            className="h-11 w-full px-3 text-sm font-medium text-[#15232D] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* En mode rapide, permettre aussi le clic rapide du pays */}
                    {quickMode && (
                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-[#15232D]">
                          Pays & Devise
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {activeCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => setCountryCode(c.code)}
                              className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold cursor-pointer ${countryCode === c.code
                                  ? "border-[#073B35] bg-[#073B35] text-white"
                                  : "border-[#E2E8F0] bg-[#F8FAFC] text-[#15232D]"
                                }`}
                            >
                              {COUNTRY_FLAGS[c.code] ?? "🌍"} {c.name} ({c.currency})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mot de passe avec bouton Afficher/Masquer et jauge de solidité */}
                    <div>
                      <label className="mb-1.5 block text-xs font-extrabold text-[#15232D]">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 caractères"
                          className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 pr-11 text-sm font-medium text-[#15232D] transition focus:border-[#00A884] focus:ring-3 focus:ring-[#00A884]/15 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label="Afficher ou masquer le mot de passe"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#073B35] cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          {[1, 2, 3, 4].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= lvl
                                  ? passwordStrength >= 3
                                    ? "bg-[#00A884]"
                                    : "bg-[#F4A340]"
                                  : "bg-slate-200"
                                }`}
                            />
                          ))}
                          <span className="ml-1 text-[10px] font-bold text-slate-500">
                            {password.length < 6
                              ? "Trop court"
                              : passwordStrength >= 3
                                ? "Robuste"
                                : "Valide"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-[#F8FAFC] px-3.5 py-2.5 text-[11px] text-slate-600">
                      <Lock className="h-3.5 w-3.5 shrink-0 text-[#00A884]" />
                      <span>
                        Confidentialité garantie : votre numéro personnel n&apos;est{" "}
                        <strong>jamais affiché</strong> sur votre vitrine client.
                      </span>
                    </div>

                    {error && (
                      <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
                        {error}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
                      {!quickMode && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(2)}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Étape 2
                        </Button>
                      )}
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="flex-1 shadow-lg"
                      >
                        <UserCheck className="h-4 w-4" />
                        Ouvrir ma boutique Shrine Pro 3
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================
              COLONNE DROITE STICKY : APERÇU SMARTPHONE EN DIRECT (STYLE SHOPIFY)
             ========================================================= */}
          <div className="lg:sticky lg:top-8 lg:col-span-5">
            <div className="rounded-[28px] border border-white/15 bg-[#052B27]/90 p-5 text-white shadow-2xl backdrop-blur-md sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-[#00A884]" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00A884]" />
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#7CE3C8]">
                    Aperçu mobile en direct
                  </span>
                </div>
                <span className="rounded-full border border-white/15 bg-white/8 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  Shrine Pro 3
                </span>
              </div>

              {/* Coque Smartphone simulée */}
              <div className="mx-auto max-w-[330px] overflow-hidden rounded-[30px] border-[5px] border-[#0C5249] bg-[#F8FAFC] text-[#15232D] shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
                {/* Barre navigateur du téléphone */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3.5 py-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 truncate">
                    <Lock className="h-2.5 w-2.5 shrink-0 text-[#00A884]" />
                    <span className="truncate">{previewSlug}.ecomsate.com</span>
                  </span>
                  <span className="rounded bg-[#E7F7F2] px-1.5 py-0.5 text-[9px] font-extrabold text-[#073B35]">
                    {selectedCountry.currency}
                  </span>
                </div>

                {/* Barre d'annonce COD dynamique selon le pays */}
                <div className="bg-[#00A884] px-3 py-1.5 text-center text-[10px] font-extrabold text-white">
                  Livraison express ({selectedCountry.name}) · Paiement à la réception
                </div>

                {/* En-tête de la boutique */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3.5 py-2.5">
                  <span className="truncate text-xs font-extrabold text-[#073B35]">
                    {liveDisplayStoreName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                    <Truck className="h-2.5 w-2.5 text-[#00A884]" />
                    Suivi COD
                  </span>
                </div>

                {/* Visuel Produit Modèle de la niche sélectionnée */}
                <div key={selectedNicheMeta.sectorId} className="animate-tab-panel p-3">
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-200">
                    <img
                      src={selectedNicheMeta.image}
                      alt={selectedNicheMeta.previewProduct.name}
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute left-2.5 top-2.5 rounded-lg bg-[#00A884] px-2 py-0.5 text-[9px] font-extrabold text-white shadow-xs">
                      Économisez{" "}
                      {formatCurrency(
                        selectedNicheMeta.previewProduct.price -
                        selectedNicheMeta.previewProduct.promoPrice,
                        selectedCountry.currency
                      )}
                    </span>
                    <span className="absolute bottom-2 left-2.5 text-[10px] font-bold text-white">
                      Note client 4.9/5 · Vérification à la livraison
                    </span>
                  </div>

                  {/* Infos fiche produit Shrine Pro 3 */}
                  <div className="mt-2.5 space-y-2">
                    <div>
                      <p className="truncate text-xs font-extrabold text-[#15232D]">
                        {selectedNicheMeta.previewProduct.name}
                      </p>
                      <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-[#073B35]">
                          {formatCurrency(
                            selectedNicheMeta.previewProduct.promoPrice,
                            selectedCountry.currency
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatCurrency(
                            selectedNicheMeta.previewProduct.price,
                            selectedCountry.currency
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Variante & Pack Duo */}
                    <div className="flex items-center justify-between rounded-xl border border-[#00A884]/35 bg-[#E7F7F2]/65 px-2.5 py-1.5 text-[10px] font-bold text-[#073B35]">
                      <span>{selectedNicheMeta.previewProduct.variantPill}</span>
                      <span className="text-[#00A884]">Populaire</span>
                    </div>

                    {/* Mini Formulaire COD intégré */}
                    <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                      <p className="text-[10px] font-extrabold text-[#15232D]">
                        Commander — Paiement à la livraison
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-400">
                        <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-2 py-1">
                          Nom complet *
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-2 py-1">
                          {selectedCountry.phonePrefix} Téléphone *
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-2 py-1 text-[9px] text-slate-400">
                        Ville, Commune, Quartier & Repère *
                      </div>
                      <div className="rounded-xl bg-[#00A884] py-2 text-center text-[10px] font-extrabold text-white shadow-xs">
                        Confirmer ma commande COD
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garanties sous le téléphone */}
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <p className="font-extrabold text-[#00A884]">0 %</p>
                  <p className="text-[10px] text-slate-300">Commission</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <p className="font-extrabold text-white">100 % COD</p>
                  <p className="text-[10px] text-slate-300">Sans CB client</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <p className="font-extrabold text-[#7CE3C8]">Adeshina IA</p>
                  <p className="text-[10px] text-slate-300">Copilote inclus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
