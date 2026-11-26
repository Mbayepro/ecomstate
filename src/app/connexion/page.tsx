"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/lib/platform-store";
import { signInWithGoogleOAuth } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const {
    loginAsMerchant,
    loginAsAdmin,
    isAdminEmail,
    adminAccount,
  } = usePlatform();
  const [email, setEmail] = useState("aminata@atelierdakar.sn");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "oauth_google_failed") {
      const reason = (params.get("reason") || "").toLowerCase();
      if (
        reason.includes("provider is not enabled") ||
        reason.includes("unsupported provider")
      ) {
        setError(
          "Google n'est pas encore activé dans votre tableau de bord Supabase : allez dans Authentication > Sign In / Providers > Google et activez « Enable Sign in with Google »."
        );
      } else if (
        reason.includes("code verifier") ||
        reason.includes("aucun code oauth")
      ) {
        setError(
          "L'URL de retour locale ou Vercel n'est pas autorisée dans Supabase : allez dans Supabase > Authentication > URL Configuration > Redirect URLs et ajoutez http://localhost:3000/auth/callback ainsi que https://ecomstate.vercel.app/auth/callback."
        );
      } else if (reason) {
        setError(`Échec OAuth Google : ${params.get("reason")}`);
      } else {
        setError(
          "La connexion avec Google n'a pas pu aboutir. Vérifiez Supabase > Authentication > Providers > Google et Redirect URLs."
        );
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    const res = await signInWithGoogleOAuth("/dashboard");
    if (!res.ok) {
      setGoogleLoading(false);
      setError(res.error ?? "Impossible de démarrer la connexion Google.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isAdminEmail(email)) {
      const adminRes = loginAsAdmin(email, password);
      if (!adminRes.ok) {
        setError(adminRes.error ?? "Identifiants Super Admin invalides");
        return;
      }
      router.push("/admin");
      return;
    }
    const res = loginAsMerchant(email, password);
    if (!res.ok) {
      setError(res.error ?? "Identifiants invalides");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="bg-navy-architectural relative flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo light />
          <Link
            href="/creer-une-boutique"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:border-[#00A884] hover:bg-white/15"
          >
            Créer ma boutique
            <ArrowRight className="h-3.5 w-3.5 text-[#00A884]" />
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-[28px] border border-white/15 bg-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] lg:grid-cols-12">
          {/* Colonne gauche éditoriale sur grand écran */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-[#052B27] p-8 text-white lg:col-span-5 lg:flex">
            <img
              src="/images/hero-african-founder-fashion.jpg"
              alt="Entrepreneure EcomSate"
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#042622] via-[#042622]/65 to-[#073B35]/40" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00A884]/40 bg-[#073B35]/85 px-3 py-1 text-xs font-bold text-[#7CE3C8] backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-[#00A884]" />
                Centre de contrôle COD
              </span>
            </div>

            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl font-extrabold leading-snug text-white">
                Pilotez vos commandes, vos livreurs et votre vrai bénéfice net.
              </h2>
              <ul className="space-y-2 text-xs text-[#E7F7F2]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00A884]" />
                  <span>Suivi des 11 statuts COD & rapprochement cash</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00A884]" />
                  <span>Store Builder Shrine Pro 3 & Form Builder COD</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00A884]" />
                  <span>Copilote opérationnel Adeshina IA</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Colonne droite : Formulaire de connexion */}
          <div className="p-6 sm:p-9 lg:col-span-7">
            <h1 className="text-2xl font-extrabold text-[#15232D]">
              Bon retour sur EcomSate
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Connectez-vous à votre espace propriétaire ou membre d&apos;équipe.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
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
                    ? "Redirection vers Google..."
                    : "Continuer avec Google"}
                </span>
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ou avec vos identifiants
              </span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-[#15232D]">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@maboutique.com"
                  className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm font-medium text-[#15232D] transition focus:border-[#00A884] focus:ring-3 focus:ring-[#00A884]/15 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-[#15232D]">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full shadow-md">
                Accéder à mon tableau de bord
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 border-t border-[#E2E8F0] pt-5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                 Tester immédiatement une boutique démo
              </p>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    loginAsMerchant("aminata@atelierdakar.sn");
                    router.push("/dashboard");
                  }}
                  className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-left text-xs transition hover:border-[#00A884] hover:bg-[#E7F7F2]/40 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2 font-bold text-[#15232D]">
                    <Store className="h-3.5 w-3.5 text-[#00A884]" />
                    Atelier Dakar Mode
                  </span>
                  <span className="rounded bg-[#073B35] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Premium
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginAsMerchant("koffi@cotonoutech.bj");
                    router.push("/dashboard");
                  }}
                  className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-left text-xs transition hover:border-[#00A884] hover:bg-[#E7F7F2]/40 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2 font-bold text-[#15232D]">
                    <Store className="h-3.5 w-3.5 text-[#00A884]" />
                    Cotonou Tech
                  </span>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-[#15232D]">
                    Standard
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  loginAsAdmin(adminAccount?.email || "admin@ecomsate.bj");
                  router.push("/admin");
                }}
                className="mt-2 flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-left text-xs transition hover:border-[#00A884] cursor-pointer"
              >
                <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#073B35]" />
                  Super Administration
                </span>
                <span className="text-[11px] font-bold text-slate-400">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
