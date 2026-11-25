"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, ShieldCheck, Store } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "oauth_google_failed") {
      setError(
        "La connexion avec Google n'a pas pu aboutir. Vérifiez que le fournisseur Google est activé dans Supabase > Authentication > Providers."
      );
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
    <div className="bg-navy-architectural flex min-h-screen flex-col items-center justify-center bg-[#0B1F33] px-4 py-12">
      <div className="mb-8">
        <BrandLogo light />
      </div>

      <Card className="w-full max-w-md border-white/15 bg-white shadow-2xl">
        <CardContent className="p-7">

          <h1 className="text-2xl font-bold text-[#102A43]">Connexion</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Accédez à votre espace commerçant EcomSate.
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#102A43] shadow-xs transition hover:border-[#102A43] hover:bg-[#F8FAFC] disabled:opacity-60 cursor-pointer"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#102A43]" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
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
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              ou par e-mail
            </span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              label="Adresse e-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@maboutique.com"
            />
            <Input
              label="Mot de passe"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Se connecter
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 border-t border-[#E2E8F0] pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Accès rapide démo (Phase 1)
            </p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  loginAsMerchant("aminata@atelierdakar.sn");
                  router.push("/dashboard");
                }}
                className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-left text-xs hover:border-[#102A43] cursor-pointer"
              >
                <span className="inline-flex items-center gap-2 font-medium text-[#102A43]">
                  <Store className="h-3.5 w-3.5 text-[#10B981]" />
                  Atelier Dakar Mode (Sénégal)
                </span>
                <span className="text-slate-500">Premium</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsMerchant("koffi@cotonoutech.bj");
                  router.push("/dashboard");
                }}
                className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-left text-xs hover:border-[#102A43] cursor-pointer"
              >
                <span className="inline-flex items-center gap-2 font-medium text-[#102A43]">
                  <Store className="h-3.5 w-3.5 text-[#10B981]" />
                  Cotonou Tech Store (Bénin)
                </span>
                <span className="text-slate-500">Essai</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsAdmin(adminAccount?.email || "admin@ecomsate.bj");
                  router.push("/admin");
                }}
                className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-left text-xs hover:border-[#102A43] cursor-pointer"
              >
                <span className="inline-flex items-center gap-2 font-medium text-[#102A43]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#102A43]" />
                  Administration générale ({adminAccount?.email || "admin@ecomsate.bj"})
                </span>
                <span className="text-slate-500">Super Admin</span>
              </button>

            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Pas encore de boutique ?{" "}
            <Link
              href="/creer-une-boutique"
              className="font-semibold text-[#10B981] hover:underline"
            >
              Créer ma boutique
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
