"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  Globe,
  Loader2,
  Sparkles,
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
import { slugify } from "@/lib/utils";
import { signInWithGoogleOAuth } from "@/lib/supabase/client";


export default function CreerUneBoutiquePage() {
  const router = useRouter();
  const { countries, registerMerchant } = usePlatform();

  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("BJ");
  const [password, setPassword] = useState("");
  const [sectorId, setSectorId] = useState("mode");
  const [useAdeshinaSetup, setUseAdeshinaSetup] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const prefs: PendingOAuthStorePrefs = {
        storeName: storeName.trim() || blueprint.suggestedName,
        phone: phone.trim() || undefined,
        countryCode,
        sectorId,
        useAdeshinaSetup,
      };
      window.localStorage.setItem(
        PENDING_OAUTH_STORE_KEY,
        JSON.stringify(prefs)
      );
    } catch {
      // Ignore storage error
    }
    const res = await signInWithGoogleOAuth("/dashboard");
    if (!res.ok) {
      setGoogleLoading(false);
      setError(res.error ?? "Impossible de démarrer l'inscription Google.");
    }
  };


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

  const blueprint = getBlueprintBySector(sectorId, storeName);
  const previewSlug =
    slugify(storeName || blueprint.suggestedName) || "ma-boutique";

  const applyAdeshinaSuggestion = () => {
    const base =
      ADESHINA_SECTORS.find((s) => s.sectorId === sectorId) ??
      ADESHINA_SECTORS[0];
    setStoreName(base.suggestedName);
    setUseAdeshinaSetup(true);
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
      sectorId,
      useAdeshinaSetup,
    });
    if (!res.ok) {
      setError(res.error ?? "Impossible de créer la boutique.");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="bg-navy-architectural min-h-screen bg-[#0B1F33] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <BrandLogo light />
          <Link
            href="/connexion"
            className="rounded-lg border border-white/15 bg-white/8 px-3.5 py-2 text-sm font-medium text-white transition hover:border-[#10B981]/50 hover:bg-white/15"
          >
            Déjà un compte ? Connexion
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Card className="animate-fade-up border-white/15 bg-white shadow-2xl">
              <CardContent className="p-7">

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h1 className="text-2xl font-bold text-[#102A43]">
                    Créez votre boutique en ligne
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/12 px-3 py-1 text-xs font-bold text-[#10B981]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Assisté par Adeshina IA
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">
                  Remplissez vos informations : Adeshina IA configure
                  automatiquement l&apos;apparence et les rayons de votre boutique,
                  prête à accueillir vos propres produits.
                </p>


                {/* Encadré Adeshina IA Copilote */}
                <div className="mt-5 rounded-xl border border-[#10B981]/30 bg-[#F8FAFC] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                      <Bot className="h-4 w-4 text-[#10B981]" />
                      Configuration intelligente Adeshina IA
                    </p>
                    <button
                      type="button"
                      onClick={applyAdeshinaSuggestion}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#102A43] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#1B3B5A] cursor-pointer"
                    >
                      <Wand2 className="h-3 w-3 text-[#10B981]" />
                      Suggérer un nom
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600">
                        Secteur de votre boutique
                      </label>
                      <select
                        value={sectorId}
                        onChange={(e) => setSectorId(e.target.value)}
                        className="mt-1 h-9.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#102A43]"
                      >
                        {ADESHINA_SECTORS.map((s) => (
                          <option key={s.sectorId} value={s.sectorId}>
                            {s.sectorLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-medium text-[#102A43] cursor-pointer w-full">
                        <input
                          type="checkbox"
                          checked={useAdeshinaSetup}
                          onChange={(e) =>
                            setUseAdeshinaSetup(e.target.checked)
                          }
                          className="h-4 w-4 accent-[#10B981]"
                        />
                        <span>Pré-configurer le style & les catégories IA</span>

                      </label>
                    </div>
                  </div>
                </div>

                {/* Bouton Inscription rapide Google OAuth */}
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={googleLoading}
                    className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#102A43] shadow-xs transition hover:border-[#102A43] hover:bg-[#F8FAFC] disabled:opacity-60 cursor-pointer"
                  >
                    {googleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#102A43]" />
                    ) : (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
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
                        ? "Redirection vers Google..."
                        : "Créer ma boutique en 1 clic avec Google"}
                    </span>
                  </button>
                </div>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    ou remplir le formulaire
                  </span>
                  <div className="h-px flex-1 bg-[#E2E8F0]" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Nom complet"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Adjoua Kouassi"
                    />
                    <Input
                      label="Nom de la boutique"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder={`Ex: ${blueprint.suggestedName}`}
                    />
                  </div>

                  <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#102A43]">
                      <Globe className="h-3.5 w-3.5 text-[#10B981]" />
                      Votre adresse gratuite :
                    </span>{" "}
                    <code className="font-semibold text-[#10B981]">
                      {previewSlug}.ecomsate.com
                    </code>
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
                      label="Numéro de téléphone (WhatsApp)"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+229 97 00 00 00"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#102A43]">
                        Pays
                      </label>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#1E293B] focus:border-[#102A43] focus:outline-none"
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
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Créer ma boutique avec Adeshina IA
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5 lg:col-span-5">
            {/* Aperçu en direct de ce qu'Adeshina IA va générer */}
            {useAdeshinaSetup && (
              <Card className="animate-fade-up-delay-1 border-[#10B981]/30 bg-white">
                <CardContent className="p-5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Ce qu&apos;Adeshina IA prépare pour votre boutique :
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#102A43]">
                    {storeName.trim() || blueprint.suggestedName}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {blueprint.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {blueprint.categories.map((c) => (
                      <span
                        key={c.name}
                        className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-medium text-[#102A43]"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500">
                    Catalogue initial vierge (0 produit fictif) : vous ajoutez
                    uniquement vos propres articles réels.
                  </p>

                </CardContent>
              </Card>
            )}

            <div className="rounded-2xl border border-white/15 bg-[#102A43]/90 p-7 text-white shadow-xl backdrop-blur-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
                Activation & Essai 30 jours
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                2 000 FCFA{" "}
                <span className="text-sm font-normal text-slate-300">
                  paiement unique
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Démarrez avec 30 jours complets pour configurer votre boutique
                et recevoir vos premières commandes.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {[
                  "Création automatique assistée par Adeshina IA",
                  "Sous-domaine gratuit attribué immédiatement",
                  "Gestion complète des produits, stocks et commandes",
                  "Commandes WhatsApp & paiement à la livraison",
                  "Isolation totale de vos données clients",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
