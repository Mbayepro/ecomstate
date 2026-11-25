"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { usePlatform } from "@/lib/platform-store";
import { canUseModule } from "@/lib/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";

const DOMAIN_EXTENSIONS = [
  { ext: ".com", price: 10000, label: "International (.com)" },
  { ext: ".bj", price: 25000, label: "Bénin (.bj)" },
  { ext: ".sn", price: 22000, label: "Sénégal (.sn)" },
  { ext: ".ci", price: 22000, label: "Côte d'Ivoire (.ci)" },
  { ext: ".shop", price: 12000, label: "E-commerce (.shop)" },
];

export default function DashboardDomainePage() {
  const {
    activeStore,
    modules,
    adminAccount,
    customDomains,
    requestCustomDomain,
    deleteCustomDomainRequest,
  } = usePlatform();

  const [mode, setMode] = useState<"connect_existing" | "buy_new">(
    "connect_existing"
  );
  const [domainInput, setDomainInput] = useState("");
  const [selectedExt, setSelectedExt] = useState(".com");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!activeStore) return null;

  const isPremiumAllowed = canUseModule(
    activeStore.planCode,
    "custom_domain",
    modules
  );
  const storeDomains = (customDomains ?? []).filter(
    (d) => d.storeId === activeStore.id
  );
  const officialPhone = adminAccount?.phone || "+229 95 78 21 32";
  const cleanWa = officialPhone.replace(/[^0-9]/g, "");

  const copyVal = (val: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(val);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const fullDomain =
      mode === "buy_new" && !domainInput.includes(".")
        ? `${domainInput.trim()}${selectedExt}`
        : domainInput.trim();

    const res = requestCustomDomain(activeStore.id, fullDomain, mode);
    if (!res.ok) {
      setError(res.error ?? "Impossible d'enregistrer cette demande.");
      return;
    }

    setDomainInput("");
    setSuccessMsg(
      mode === "connect_existing"
        ? `Demande enregistrée pour ${fullDomain}. Ajoutez les 2 enregistrements DNS ci-dessous puis l'équipe EcomSate activera votre certificat HTTPS.`
        : `Commande enregistrée pour ${fullDomain}. Contactez le support WhatsApp (${officialPhone}) pour finaliser l'enregistrement du domaine à votre nom.`
    );
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Phase 3 · Marque & Adresse Web"
        title="Nom de domaine personnalisé"
        description="Renforcez la crédibilité de votre marque avec votre propre adresse professionnelle (.com, .bj, .sn, .ci) sécurisée en HTTPS."
      />

      {/* Adresse actuelle */}
      <Card className="border-[#E2E8F0] bg-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#073B35] text-[#00A884]">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Adresse principale active de votre boutique
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="font-mono text-base font-extrabold text-[#073B35]">
                  https://{activeStore.customDomain || activeStore.subdomain}
                </span>
                <Badge variant="success">
                  <ShieldCheck className="mr-1 inline h-3 w-3" />
                  SSL HTTPS actif
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Sous-domaine gratuit inclus :{" "}
            <code className="font-semibold text-[#073B35]">
              {activeStore.subdomain}
            </code>
          </p>
        </CardContent>
      </Card>

      {!isPremiumAllowed ? (
        /* Écran d'invitation Premium */
        <Card className="border-2 border-[#073B35]/15 bg-white">
          <CardContent className="p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#073B35] text-[#00A884]">
              <Lock className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold text-[#073B35]">
              Connectez votre propre nom de domaine (.com, .bj, .sn, .ci)
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
              Votre sous-domaine gratuit{" "}
              <code className="font-semibold text-[#073B35]">
                {activeStore.subdomain}
              </code>{" "}
              est déjà actif. Pour utiliser votre propre nom de domaine
              professionnel (ex : <strong>maboutique.com</strong> ou{" "}
              <strong>maboutique.bj</strong>) avec certificat SSL automatique,
              passez à la formule <strong>Premium</strong>.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {DOMAIN_EXTENSIONS.map((item) => (
                <span
                  key={item.ext}
                  className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-bold text-[#073B35]"
                >
                  {item.ext}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/dashboard/abonnement">
                <Button variant="primary" size="lg">
                  <Sparkles className="h-4 w-4" />
                  Passer à l&apos;offre Premium (15 000 FCFA / mois)
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Formulaire Connexion ou Achat de domaine */}
          <Card className="border-[#E2E8F0] bg-white lg:col-span-7">
            <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-extrabold text-[#073B35]">
                  Ajouter un nom de domaine personnalisé
                </h2>
                <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode("connect_existing")}
                    className={`rounded-lg px-3 py-1 font-bold cursor-pointer ${
                      mode === "connect_existing"
                        ? "bg-[#073B35] text-white"
                        : "text-slate-600"
                    }`}
                  >
                    Domaine existant
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("buy_new")}
                    className={`rounded-lg px-3 py-1 font-bold cursor-pointer ${
                      mode === "buy_new"
                        ? "bg-[#073B35] text-white"
                        : "text-slate-600"
                    }`}
                  >
                    Commander un domaine
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "connect_existing" ? (
                  <Input
                    label="Votre nom de domaine existant"
                    required
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="Ex : maboutique.com ou maboutique.bj"
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-7">
                      <Input
                        label="Nom souhaité (sans extension)"
                        required
                        value={domainInput}
                        onChange={(e) =>
                          setDomainInput(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "")
                          )
                        }
                        placeholder="Ex : maison-kora"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <label className="mb-1.5 block text-sm font-medium text-[#073B35]">
                        Extension
                      </label>
                      <select
                        value={selectedExt}
                        onChange={(e) => setSelectedExt(e.target.value)}
                        className="h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#073B35]"
                      >
                        {DOMAIN_EXTENSIONS.map((item) => (
                          <option key={item.ext} value={item.ext}>
                            {item.ext} (~{formatCurrency(item.price)}/an)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </p>
                )}
                {successMsg && (
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00A884]" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5">
                  <Button type="submit" variant="primary">
                    {mode === "connect_existing"
                      ? "Enregistrer & vérifier ce domaine"
                      : "Commander ce nom de domaine"}
                  </Button>
                  <a
                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                      `Bonjour EcomSate, je souhaite de l'aide pour configurer le domaine personnalisé de ma boutique "${activeStore.name}".`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-bold text-[#073B35] hover:bg-slate-50"
                  >
                    <MessageCircle className="h-4 w-4 text-[#00A884]" />
                    Aide DNS WhatsApp
                  </a>
                </div>
              </form>

              {/* Guide DNS */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs">
                <p className="font-bold text-[#073B35]">
                  Configuration DNS à ajouter chez votre fournisseur (Namecheap,
                  OVH, LWS, Cloudflare…) :
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    {
                      key: "a-rec",
                      type: "A",
                      host: "@",
                      val: "76.76.21.21",
                    },
                    {
                      key: "cname-rec",
                      type: "CNAME",
                      host: "www",
                      val: "cname.vercel-dns.com",
                    },
                  ].map((rec) => (
                    <div
                      key={rec.key}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <Badge variant="navy">{rec.type}</Badge>
                        <span className="font-bold text-[#073B35]">
                          {rec.host}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-[#00A884] font-semibold">
                          {rec.val}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyVal(rec.val, rec.key)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#073B35] cursor-pointer"
                      >
                        {copiedKey === rec.key ? (
                          <Check className="h-3.5 w-3.5 text-[#00A884]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedKey === rec.key ? "Copié" : "Copier"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des domaines enregistrés */}
          <Card className="border-[#E2E8F0] bg-white lg:col-span-5">
            <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
              <h2 className="text-sm font-extrabold text-[#073B35]">
                Vos domaines ({storeDomains.length})
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              {storeDomains.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500">
                  Aucun nom de domaine personnalisé enregistré pour le moment.
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {storeDomains.map((dom) => (
                    <div
                      key={dom.id}
                      className="flex items-center justify-between gap-3 px-5 py-4 text-xs"
                    >
                      <div>
                        <p className="font-mono text-sm font-extrabold text-[#073B35]">
                          {dom.domain}
                        </p>
                        <p className="mt-0.5 text-slate-500">
                          {dom.requestType === "buy_new"
                            ? "Commande via EcomSate"
                            : "Domaine externe"}{" "}
                          · {formatDate(dom.createdAt)}
                        </p>
                        <div className="mt-2">
                          {dom.status === "active_ssl" ? (
                            <Badge variant="success">Actif & SSL HTTPS</Badge>
                          ) : dom.status === "pending_dns" ? (
                            <Badge variant="warning">
                              <Clock className="mr-1 inline h-3 w-3" />
                              En attente vérification DNS
                            </Badge>
                          ) : (
                            <Badge variant="danger">Non validé</Badge>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          deleteCustomDomainRequest(activeStore.id, dom.id)
                        }
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Retirer ce domaine"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
