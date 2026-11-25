"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Footprints,
  Globe,
  Home,
  Layers,
  Loader2,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  UserCheck,
  Wand2,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  PENDING_OAUTH_STORE_KEY,
  type PendingOAuthStorePrefs,
  usePlatform,
} from "@/lib/platform-store";
import { ADESHINA_SECTORS, getBlueprintBySector } from "@/lib/adeshina-ai";
import { ECOMSATE_THEMES } from "@/lib/shrine-themes";
import { slugify } from "@/lib/utils";
import { signInWithGoogleOAuth } from "@/lib/supabase/client";
import type { StoreTemplateId } from "@/types/domain";

const NICHE_OPTIONS: {
  sectorId: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    sectorId: "mode",
    title: "Mode & Prêt-à-porter",
    subtitle: "Vêtements, wax, ensembles & accessoires",
    icon: Shirt,
  },
  {
    sectorId: "beaute",
    title: "Beauté & Cosmétiques",
    subtitle: "Soins visage, cheveux, karité & parfums",
    icon: Sparkles,
  },
  {
    sectorId: "tech",
    title: "Électronique & High-Tech",
    subtitle: "Téléphones, montres, écouteurs & gadgets",
    icon: Smartphone,
  },
  {
    sectorId: "chaussures",
    title: "Chaussures & Maroquinerie",
    subtitle: "Sneakers, sandales cuir, sacs & mocassins",
    icon: Footprints,
  },
  {
    sectorId: "maison",
    title: "Maison & Équipements",
    subtitle: "Cuisine, déco, électroménager & rangement",
    icon: Home,
  },
  {
    sectorId: "general",
    title: "Autre / Multi-produits",
    subtitle: "Boutique généraliste avec tous types d'articles",
    icon: ShoppingBag,
  },
];

const STEPS_META = [
  { num: 1 as const, label: "Votre activité" },
  { num: 2 as const, label: "Nom & Thème" },
  { num: 3 as const, label: "Votre compte" },
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

  // Étape 2 : Nom de boutique, Style / Thème Shrine & Adeshina IA
  const [storeName, setStoreName] = useState("");
  const [templateId, setTemplateId] = useState<StoreTemplateId>("shrine_pro_1");
  const [useAdeshinaSetup, setUseAdeshinaSetup] = useState(true);

  // Étape 3 : Identifiants propriétaire
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("sector");
    const n = params.get("storeName");
    if (s && ADESHINA_SECTORS.some((sec) => sec.sectorId === s)) {
      setSectorId(s);
    }
    if (n) {
      setStoreName(n);
    }
  }, []);

  const resolvedSectorId =
    sectorId === "general" ? "mode" : sectorId;
  const blueprint = getBlueprintBySector(resolvedSectorId, storeName);
  const selectedNicheMeta =
    NICHE_OPTIONS.find((n) => n.sectorId === sectorId) ?? NICHE_OPTIONS[0];
  const previewSlug =
    slugify(storeName || blueprint.suggestedName) || "ma-boutique";

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const prefs: PendingOAuthStorePrefs = {
        storeName: storeName.trim() || blueprint.suggestedName,
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
    const finalStoreName = storeName.trim() || blueprint.suggestedName;
    const res = registerMerchant({
      fullName,
      storeName: finalStoreName,
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

  const standardThemes = ECOMSATE_THEMES.filter((t) => t.tier === "standard");

  return (
    <div className="bg-navy-architectural min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Barre supérieure propre et alignée */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <BrandLogo light />
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setQuickMode((v) => !v);
                setStep(3);
              }}
              className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-[#E7F7F2] transition hover:bg-white/15 cursor-pointer"
            >
              {quickMode
                ? "Revenir aux 3 étapes guidées"
                : "Ignorer et créer directement"}
            </button>
            <Link
              href="/connexion"
              className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:border-[#00A884] hover:bg-white/15"
            >
              Connexion
            </Link>
          </div>
        </div>

        {/* Carte centrale unique, propre et parfaitement organisée */}
        <Card className="overflow-hidden border-white/15 bg-white shadow-2xl">
          {/* En-tête de progression visuel en 3 étapes */}
          {!quickMode && (
            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
              <div className="grid grid-cols-3 gap-2">
                {STEPS_META.map((s) => {
                  const isCurrent = step === s.num;
                  const isDone = step > s.num;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => setStep(s.num)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition cursor-pointer ${
                        isCurrent
                          ? "bg-[#073B35] text-white shadow-2xs"
                          : isDone
                          ? "bg-[#E7F7F2] text-[#073B35]"
                          : "bg-white text-slate-400 border border-[#E2E8F0]"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                          isCurrent
                            ? "bg-[#00A884] text-white"
                            : isDone
                            ? "bg-[#00A884] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                          Étape {s.num}
                        </p>
                        <p className="truncate text-xs font-extrabold">
                          {s.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <CardContent className="p-6 sm:p-8">
            {/* ÉTAPE 1 : Niche, Situation & Pays (Grille 3x2 symétrique) */}
            {!quickMode && step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-extrabold text-[#15232D] sm:text-2xl">
                    Quel type de produits souhaitez-vous vendre ?
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Sélectionnez votre secteur pour pré-configurer vos rayons et
                    votre formulaire de paiement à la livraison (COD).
                  </p>
                </div>

                {/* Grille 6 cartes parfaitement alignée (2 colonnes sur mobile/tablette, 3 sur grand écran) */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {NICHE_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const active = sectorId === item.sectorId;
                    return (
                      <button
                        key={item.sectorId}
                        type="button"
                        onClick={() => setSectorId(item.sectorId)}
                        className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition cursor-pointer ${
                          active
                            ? "border-2 border-[#00A884] bg-[#E7F7F2]/60 shadow-2xs"
                            : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                              active
                                ? "bg-[#073B35] text-white"
                                : "bg-white text-[#073B35] border border-[#E2E8F0]"
                            }`}
                          >
                            <Icon className="h-4.5 w-4.5 text-[#00A884]" />
                          </span>
                          {active && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00A884] text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-extrabold text-[#15232D]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#15232D]">
                      Votre situation actuelle
                    </label>
                    <select
                      value={activityStage}
                      onChange={(e) =>
                        setActivityStage(
                          e.target.value as "already_selling" | "starting"
                        )
                      }
                      className="mt-1.5 h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#15232D] focus:border-[#00A884] focus:outline-none"
                    >
                      <option value="already_selling">
                        Je vends déjà (TikTok, Facebook, WhatsApp...)
                      </option>
                      <option value="starting">
                        Je lance ma première boutique en ligne
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#15232D]">
                      Pays principal & Devise
                    </label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#15232D] focus:border-[#00A884] focus:outline-none"
                    >
                      {countries
                        .filter((c) => c.isActive)
                        .map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.currency})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
                  <p className="text-xs text-slate-500">
                    Secteur choisi :{" "}
                    <strong className="text-[#073B35]">
                      {selectedNicheMeta.title}
                    </strong>
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => setStep(2)}
                  >
                    Étape suivante : Nom & Thème
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : Nom de boutique, Thème Shrine & Adeshina IA */}
            {!quickMode && step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#15232D] sm:text-2xl">
                    Donnez un nom à votre boutique
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Choisissez le nom commercial et le design initial de votre
                    vitrine.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-extrabold text-[#15232D]">
                      Nom de votre boutique
                    </label>
                    <button
                      type="button"
                      onClick={() => setStoreName(blueprint.suggestedName)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#00A884] hover:underline cursor-pointer"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      Idée de nom : {blueprint.suggestedName}
                    </button>
                  </div>
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={`Ex : ${blueprint.suggestedName}`}
                    className="mt-2 h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#15232D] focus:border-[#00A884] focus:outline-none"
                  />
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Globe className="h-3.5 w-3.5 text-[#00A884]" />
                    Lien de votre boutique :{" "}
                    <code className="font-bold text-[#073B35]">
                      {previewSlug}.ecomsate.com
                    </code>
                  </p>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-xs font-extrabold text-[#15232D]">
                    Choisissez votre thème Store Builder (modifiable à tout
                    moment)
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {standardThemes.map((th) => {
                      const active = templateId === th.id;
                      return (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setTemplateId(th.id)}
                          className={`rounded-2xl border p-4 text-left transition cursor-pointer ${
                            active
                              ? "border-2 border-[#00A884] bg-[#E7F7F2]/60"
                              : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#15232D]">
                              {th.name}
                            </span>
                            <span className="rounded-md bg-[#073B35] px-2 py-0.5 text-[10px] font-bold text-white">
                              {th.badge}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
                            {th.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-[#00A884]/30 bg-[#E7F7F2]/50 p-4 text-xs font-semibold text-[#073B35] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAdeshinaSetup}
                    onChange={(e) => setUseAdeshinaSetup(e.target.checked)}
                    className="h-4 w-4 accent-[#00A884]"
                  />
                  <span>
                    Pré-configurer automatiquement mes rayons{" "}
                    <strong>{selectedNicheMeta.title}</strong> et mon formulaire
                    100 % COD (catalogue vierge prêt pour vos vrais produits).
                  </span>
                </label>

                <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Étape 1
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => setStep(3)}
                  >
                    Dernière étape : Créer mon accès
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 (ou Mode Rapide) : Création du compte propriétaire */}
            {(quickMode || step === 3) && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-extrabold text-[#15232D] sm:text-2xl">
                    Créez vos identifiants commerçant
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Votre numéro de téléphone reste strictement privé et ne sera
                    jamais affiché sur votre boutique publique.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={googleLoading}
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#15232D] shadow-2xs transition hover:border-[#073B35] hover:bg-[#F8FAFC] disabled:opacity-60 cursor-pointer"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#073B35]" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-[#00A884]" />
                  )}
                  <span>
                    {googleLoading
                      ? "Redirection vers Google..."
                      : "Créer ma boutique en 1 clic avec Google"}
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    ou avec votre e-mail
                  </span>
                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Votre nom complet"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex : Adjoua Kouassi"
                    />
                    <Input
                      label="Nom de votre boutique"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder={`Ex : ${blueprint.suggestedName}`}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Adresse e-mail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@maboutique.com"
                    />
                    <Input
                      label="Téléphone privé (Compte uniquement)"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+229 97 00 00 00"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#15232D]">
                        Pays & Devise
                      </label>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#15232D]"
                      >
                        {countries
                          .filter((c) => c.isActive)
                          .map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name} ({c.currency})
                            </option>
                          ))}
                      </select>
                    </div>
                    <Input
                      label="Mot de passe"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                    />
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
                      className="flex-1"
                    >
                      <UserCheck className="h-4 w-4" />
                      Lancer ma boutique maintenant
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>

          {/* Pied de carte récapitulatif compact sur 1 seule ligne */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-3.5 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#073B35]">
              <Layers className="h-3.5 w-3.5 text-[#00A884]" />
              Thème Shrine Pro inclus
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#073B35]">
              <Check className="h-3.5 w-3.5 text-[#00A884]" />
              Formulaire 100 % COD
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#073B35]">
              <Check className="h-3.5 w-3.5 text-[#00A884]" />
              Numéro personnel 100 % confidentiel
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
