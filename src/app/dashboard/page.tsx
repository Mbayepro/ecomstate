"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bot,
  Calculator,
  Check,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FormInput,
  Image as ImageIcon,
  Laptop,
  Layers,
  Lock,
  Megaphone,
  Package,
  Palette,
  PhoneCall,
  Plus,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/motion";
import { SalesInteractiveChart } from "@/components/dashboard/sales-chart";
import { OrderStatusPill } from "@/components/dashboard/status-pill";
import { StatMetricCard } from "@/components/dashboard/page-header";
import { VoiceAudioButton } from "@/components/ui/voice-audio-button";
import { StoreFontSelector } from "@/components/storefront/store-font-selector";
import {
  getActiveFontDisplayName,
  getStoreFontStyleVars,
  StoreDynamicFontInjector,
} from "@/lib/store-fonts";
import { getRealPopularProducts } from "@/lib/adeshina-merchant-copilot";
import { canStoreAcceptLiveOrders } from "@/lib/permissions";
import { usePlatform } from "@/lib/platform-store";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type PeriodFilter = "today" | "7d" | "30d" | "all";
type OverviewTab = "orders" | "chart" | "guide";

const QUICK_COLOR_PRESETS = [
  {
    id: "emerald",
    label: "Émeraude EcomSate",
    primary: "#073B35",
    secondary: "#00A884",
  },
  {
    id: "amber",
    label: "Or & Prestige",
    primary: "#291D09",
    secondary: "#D97706",
  },
  {
    id: "rose",
    label: "Beauté & Karité",
    primary: "#3B0722",
    secondary: "#BE185D",
  },
  {
    id: "royal",
    label: "Bleu Tech",
    primary: "#0F172A",
    secondary: "#1D4ED8",
  },
  {
    id: "terracotta",
    label: "Couture Teranga",
    primary: "#331407",
    secondary: "#C2410C",
  },
];

const QUICK_BANNER_PRESETS = [
  {
    id: "fashion",
    label: "Mode & Couture",
    url: "/images/african-fashion-model-teranga.jpg",
  },
  {
    id: "beauty",
    label: "Soins & Beauté",
    url: "/images/african-beauty-glow-portrait.jpg",
  },
  {
    id: "shoes",
    label: "Cuir & Sneakers",
    url: "/images/african-sneakers-leather-studio.jpg",
  },
  {
    id: "founder",
    label: "Vitrine Créatrice",
    url: "/images/hero-african-founder-fashion.jpg",
  },
];

const MERCHANT_PAGES_DIRECTORY = [
  {
    href: "/dashboard/commandes",
    title: "Commandes clients",
    purpose:
      "Appeler vos clients pour confirmer leurs commandes, choisir un livreur et imprimer le bon COD.",
    icon: ShoppingBag,
  },
  {
    href: "/dashboard/produits",
    title: "Produits & Prix",
    purpose:
      "Ajouter vos articles, définir leur prix de vente et leur coût d'achat pour connaître votre marge.",
    icon: Package,
  },
  {
    href: "/dashboard/livreurs",
    title: "Livreurs & Argent COD",
    purpose:
      "Savoir exactement combien d'argent chaque livreur a encaissé et enregistrer ses versements.",
    icon: Truck,
  },
  {
    href: "/dashboard/finances",
    title: "Mes bénéfices & Dépenses",
    purpose:
      "Voir votre vrai bénéfice net (calculé uniquement sur les commandes livrées) et noter vos charges.",
    icon: Calculator,
  },
  {
    href: "/dashboard/store-builder",
    title: "Apparence de ma boutique",
    purpose:
      "Choisir votre thème Shrine Pro et modifier les images, textes et sections de votre vitrine.",
    icon: Layers,
  },
  {
    href: "/dashboard/form-builder",
    title: "Formulaire de commande COD",
    purpose:
      "Choisir les champs que remplit l'acheteur (nom, téléphone, ville, quartier) et créer des packs 1x / 2x / 3x.",
    icon: FormInput,
  },
  {
    href: "/dashboard/adeshina-ia",
    title: "Assistant Adeshina IA",
    purpose:
      "Poser une question simple sur vos chiffres ou laisser l'IA rédiger une fiche produit pour vous.",
    icon: Sparkles,
  },
  {
    href: "/dashboard/clients",
    title: "Fichier clients",
    purpose:
      "Retrouver vos meilleurs clients fidèles et repérer les numéros qui ont fait des retours.",
    icon: Users,
  },
  {
    href: "/dashboard/croissance",
    title: "Publicités & Automatisations",
    purpose:
      "Suivre la rentabilité de vos pubs Facebook/TikTok et activer des alertes automatiques.",
    icon: Megaphone,
  },
];

export default function DashboardOverviewPage() {
  const {
    activeStore,
    products,
    orders,
    expenses,
    updateOrderStatus,
    updateStoreSettings,
  } = usePlatform();

  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [activeTab, setActiveTab] = useState<OverviewTab>("orders");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">(
    "mobile"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const storeProducts = useMemo(
    () => products.filter((p) => p.storeId === activeStore?.id),
    [products, activeStore?.id]
  );

  const storeExpenses = useMemo(
    () => (expenses ?? []).filter((e) => e.storeId === activeStore?.id),
    [expenses, activeStore?.id]
  );

  const storeOrders = useMemo(() => {
    const all = orders
      .filter((o) => o.storeId === activeStore?.id)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    if (period === "all") return all;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    if (period === "today") {
      return all.filter(
        (o) => new Date(o.createdAt).getTime() >= startOfToday
      );
    }

    const days = period === "7d" ? 7 : 30;
    const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
    return all.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
  }, [orders, activeStore?.id, period]);

  const rankedProducts = useMemo(
    () => getRealPopularProducts(storeProducts, storeOrders),
    [storeProducts, storeOrders]
  );

  if (!activeStore) return null;

  const ownerFirstName = activeStore.ownerName.split(" ")[0] || "Commerçant";
  const deliveredOrders = storeOrders.filter((o) => o.status === "delivered");
  const pendingConfirmationOrders = storeOrders.filter(
    (o) => o.status === "new" || o.status === "pending_confirmation"
  );
  const returnedOrFailedOrders = storeOrders.filter(
    (o) => o.status === "returned" || o.status === "delivery_failed"
  );

  const totalOrderedAmount = storeOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.totalAmount, 0);

  const deliveredRevenue = deliveredOrders.reduce(
    (s, o) => s + o.totalAmount,
    0
  );

  const deliveredCogs = deliveredOrders.reduce((sum, ord) => {
    return (
      sum +
      ord.items.reduce((acc, it) => {
        if (typeof it.costPrice === "number" && it.costPrice > 0) {
          return acc + it.costPrice * it.quantity;
        }
        const p = storeProducts.find((pr) => pr.id === it.productId);
        return (
          acc +
          (p ? (p.costPrice ?? 0) + (p.additionalCost ?? 0) : 0) * it.quantity
        );
      }, 0)
    );
  }, 0);

  const totalExpenses = storeExpenses.reduce((s, e) => s + e.amount, 0);
  const estimatedNetProfit = deliveredRevenue - deliveredCogs - totalExpenses;

  const closedShipments =
    deliveredOrders.length + returnedOrFailedOrders.length;
  const deliveryRatePct =
    closedShipments > 0
      ? Math.round((deliveredOrders.length / closedShipments) * 100)
      : storeOrders.length > 0
        ? Math.round((deliveredOrders.length / storeOrders.length) * 100)
        : 0;

  const cashHeldByCouriers = Math.max(
    0,
    deliveredOrders
      .filter((o) => o.codFinancialStatus === "collected_by_courier")
      .reduce((s, o) => s + o.totalAmount, 0)
  );

  const outOfStockCount = storeProducts.filter((p) => p.stock <= 0).length;
  const lowStockCount = storeProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;

  const brandDarkBase = activeStore.settings.primaryColor || "#073B35";
  const brandAccentCta = activeStore.settings.secondaryColor || "#00A884";
  const currentBannerUrl =
    activeStore.settings.bannerUrl ||
    storeProducts[0]?.images?.[0] ||
    "/images/african-fashion-model-teranga.jpg";

  const dailyVoiceSummary = `Bonjour ${ownerFirstName}. Bienvenue sur votre boutique ${activeStore.name}. Vous avez actuellement ${pendingConfirmationOrders.length} commande à appeler. Vos ventes livrées sont de ${deliveredRevenue} Francs CFA, et votre vrai bénéfice net dans votre poche est de ${estimatedNetProfit} Francs CFA. Vos livreurs gardent ${cashHeldByCouriers} Francs CFA sur le terrain. Juste en dessous, cliquez sur une des quatre grandes photos pour ajouter un produit, personnaliser votre boutique, appeler vos clients ou suivre vos livreurs.`;

  const handleCopyStoreLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/s/${activeStore.slug}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleQuickColorChange = (
    primary: string,
    secondary: string,
    label: string
  ) => {
    updateStoreSettings(activeStore.id, {
      primaryColor: primary,
      secondaryColor: secondary,
    });
    setSavedNotice(`Couleur « ${label} » appliquée à votre boutique`);
    setTimeout(() => setSavedNotice(null), 2600);
  };

  const handleQuickBannerChange = (bannerUrl: string, label: string) => {
    updateStoreSettings(activeStore.id, { bannerUrl });
    setSavedNotice(`Image « ${label} » appliquée à votre vitrine`);
    setTimeout(() => setSavedNotice(null), 2600);
  };

  return (
    <div className="space-y-6">
      {/* =====================================================================
          1. COCKPIT D'ACCUEIL UNIFIÉ (ZÉRO SURCHARGE · VOIX EN 1 CLIC · PÉRIODE TACTILE)
         ===================================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-[#073B35] bg-gradient-to-br from-[#073B35] via-[#09473F] to-[#042622] p-5 text-white shadow-lg sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#00A884]/15 blur-3xl"
        />

        {/* Ligne supérieure : Statut boutique + Lien copiable + Période en 1 clic */}
        <div className="relative flex flex-col gap-3 border-b border-white/12 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {canStoreAcceptLiveOrders(activeStore) ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00A884]/20 px-3 py-1 text-[11px] font-extrabold text-[#7CE3C8] ring-1 ring-[#00A884]/40">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#00A884]" />
                Ventes ouvertes
              </span>
            ) : (
              <Link
                href="/dashboard/abonnement"
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-extrabold text-amber-200 ring-1 ring-amber-300/40 transition hover:bg-amber-400/30"
              >
                <Lock className="h-3 w-3 text-amber-300" />
                Mode Aperçu · Activer pour vendre →
              </Link>
            )}

            <button
              type="button"
              onClick={handleCopyStoreLink}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white transition hover:bg-white/20 cursor-pointer"
              title="Copier le lien de votre boutique pour WhatsApp ou TikTok"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#7CE3C8]" />
                  <span className="text-[#7CE3C8]">Lien copié</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-300" />
                  <span className="max-w-[220px] truncate sm:max-w-xs">
                    {activeStore.customDomain || activeStore.subdomain}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Filtre période tactile en 1 clic (sans menu déroulant caché) */}
          <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-black/25 p-1">
            {(
              [
                { id: "today", label: "Aujourd'hui" },
                { id: "7d", label: "7 jours" },
                { id: "30d", label: "30 jours" },
                { id: "all", label: "Tout" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer",
                  period === p.id
                    ? "bg-[#00A884] text-white shadow-2xs"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ligne principale : Salutation claire + Gros bouton vocal qui fonctionne réellement */}
        <div className="relative mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Bonjour {ownerFirstName}
            </h1>
            <p className="max-w-xl text-xs leading-relaxed text-slate-200 sm:text-sm">
              {pendingConfirmationOrders.length > 0
                ? `Vous avez ${pendingConfirmationOrders.length} commande(s) en attente d'appel téléphonique.`
                : storeProducts.length === 0
                  ? "Votre vitrine est en ligne. Ajoutez votre premier article ou choisissez vos couleurs ci-dessous."
                  : "Votre boutique tourne normalement. Écoutez votre résumé vocal ou cliquez sur une image pour agir."}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <VoiceAudioButton
              textToSpeak={dailyVoiceSummary}
              variant="banner"
              label="Écouter mon bilan vocal"
              title="Écouter le résumé complet de votre boutique à voix haute"
              className="w-full sm:w-auto"
            />

            <Link
              href={`/s/${activeStore.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-white/20"
            >
              <Eye className="h-4 w-4 text-[#7CE3C8]" />
              Voir ma vitrine
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. LES 4 CARTES PHOTOS D'ACTION EN 1 CLIC (COMPRÉHENSION VISUELLE SANS LIRE)
         ===================================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#15232D]">
            Que voulez-vous faire ? (1 clic sur l&apos;image)
          </h2>
          <span className="hidden text-xs font-semibold text-slate-500 sm:inline">
            Repères visuels & vocaux
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Carte Visuelle 1 : Produits */}
          <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#00A884] hover:shadow-lg">
            <div>
              <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src={
                    storeProducts[0]?.images?.[0] ||
                    "/images/hero-african-founder-beauty.jpg"
                  }
                  alt="Ajouter et gérer mes produits"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#00A884] text-xs font-black text-white shadow-xs">
                  1
                </span>
                <div className="absolute right-2.5 top-2.5">
                  <VoiceAudioButton
                    textToSpeak={`Mes produits. Vous avez ${storeProducts.length} article dans votre boutique. Cliquez sur cette carte pour ajouter un nouveau produit avec sa photo et son prix.`}
                    variant="card-action"
                    label="Écouter"
                  />
                </div>
                <span className="absolute bottom-2.5 left-3 rounded-lg bg-white/95 px-2.5 py-0.5 text-[11px] font-black text-[#073B35]">
                  {storeProducts.length} article(s) en rayon
                </span>
              </div>

              <div className="p-4 pb-3">
                <h3 className="text-sm font-black text-[#15232D]">
                  Ajouter un produit
                </h3>
                <p className="mt-1 text-xs leading-snug text-slate-600">
                  Mettre une photo, un prix de vente et votre stock.
                </p>
              </div>
            </div>

            <div className="px-4 pb-4">
              <Link
                href="/dashboard/produits"
                className="flex w-full items-center justify-between rounded-xl bg-[#00A884] px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#009474]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  Ajouter un article
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Carte Visuelle 2 : Personnaliser ma boutique */}
          <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#073B35] hover:shadow-lg">
            <div>
              <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/african-woman-mobile-shopping.jpg"
                  alt="Personnaliser ma boutique"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#073B35] text-xs font-black text-white shadow-xs">
                  2
                </span>
                <div className="absolute right-2.5 top-2.5">
                  <VoiceAudioButton
                    textToSpeak="Personnaliser ma boutique. Cliquez ici pour changer la couleur de votre vitrine, votre grande image d'accueil et votre formulaire de commande."
                    variant="card-action"
                    label="Écouter"
                  />
                </div>
                <span className="absolute bottom-2.5 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-0.5 text-[11px] font-black text-[#073B35]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: brandAccentCta }}
                  />
                  Thème Shrine Pro
                </span>
              </div>

              <div className="p-4 pb-3">
                <h3 className="text-sm font-black text-[#15232D]">
                  Personnaliser ma vitrine
                </h3>
                <p className="mt-1 text-xs leading-snug text-slate-600">
                  Changer vos couleurs, votre image et vos packs promo.
                </p>
              </div>
            </div>

            <div className="px-4 pb-4">
              <a
                href="#atelier-vitrine"
                className="flex w-full items-center justify-between rounded-xl bg-[#073B35] px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#0a4f47]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Palette className="h-4 w-4 text-[#7CE3C8]" />
                  Modifier ma boutique
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Carte Visuelle 3 : Commandes à appeler */}
          <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg">
            <div>
              <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/african-merchant-packaging-cod.jpg"
                  alt="Appeler et préparer mes commandes"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white shadow-xs">
                  3
                </span>
                <div className="absolute right-2.5 top-2.5">
                  <VoiceAudioButton
                    textToSpeak={`Mes commandes clients. Vous avez ${pendingConfirmationOrders.length} commande à appeler. Cliquez ici pour voir le numéro du client et confirmer la livraison.`}
                    variant="card-action"
                    label="Écouter"
                  />
                </div>
                <span className="absolute bottom-2.5 left-3 rounded-lg bg-amber-500 px-2.5 py-0.5 text-[11px] font-black text-white">
                  {pendingConfirmationOrders.length} à appeler
                </span>
              </div>

              <div className="p-4 pb-3">
                <h3 className="text-sm font-black text-[#15232D]">
                  Confirmer mes commandes
                </h3>
                <p className="mt-1 text-xs leading-snug text-slate-600">
                  Appeler l&apos;acheteur et remettre le colis au livreur.
                </p>
              </div>
            </div>

            <div className="px-4 pb-4">
              <Link
                href="/dashboard/commandes"
                className="flex w-full items-center justify-between rounded-xl bg-amber-500 px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-amber-600"
              >
                <span className="inline-flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4" />
                  Ouvrir les commandes
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Carte Visuelle 4 : Argent des livreurs */}
          <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg">
            <div>
              <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/african-cod-delivery-handover.jpg"
                  alt="Récupérer l'argent chez mes livreurs"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white shadow-xs">
                  4
                </span>
                <div className="absolute right-2.5 top-2.5">
                  <VoiceAudioButton
                    textToSpeak={`Argent chez les livreurs. Vos livreurs détiennent ${cashHeldByCouriers} Francs CFA encaissés chez les clients. Cliquez ici pour pointer leurs versements.`}
                    variant="card-action"
                    label="Écouter"
                  />
                </div>
                <span className="absolute bottom-2.5 left-3 rounded-lg bg-white/95 px-2.5 py-0.5 text-[11px] font-black text-indigo-950">
                  {formatCurrency(cashHeldByCouriers, activeStore.currency)}
                </span>
              </div>

              <div className="p-4 pb-3">
                <h3 className="text-sm font-black text-[#15232D]">
                  Encaisser mes livreurs
                </h3>
                <p className="mt-1 text-xs leading-snug text-slate-600">
                  Vérifier les colis livrés et récupérer votre cash.
                </p>
              </div>
            </div>

            <div className="px-4 pb-4">
              <Link
                href="/dashboard/livreurs"
                className="flex w-full items-center justify-between rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-indigo-700"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-4 w-4" />
                  Suivre le cash COD
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. LES 4 CHIFFRES CLÉS COD (LISIBLES D'UN COUP D'ŒIL + AUDIO SUR CHAQUE CARTE)
         ===================================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatMetricCard
          badge="À VALIDER"
          label="Commandes à confirmer"
          value={<AnimatedNumber value={pendingConfirmationOrders.length} />}
          subtext={`${storeOrders.length} reçue(s) · ${formatCurrency(totalOrderedAmount, activeStore.currency)}`}
          icon={PhoneCall}
          tone={pendingConfirmationOrders.length > 0 ? "amber" : "emerald"}
          audioText={`Commandes à confirmer : ${pendingConfirmationOrders.length}. Ce sont les nouvelles commandes reçues. Appelez le client au téléphone pour confirmer avant d'envoyer le livreur.`}
          action={
            <Link
              href="/dashboard/commandes"
              className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-extrabold text-amber-900 transition hover:bg-amber-500 hover:text-white"
            >
              Appeler
            </Link>
          }
        />

        <StatMetricCard
          badge="CASH LIVRÉ"
          label="Ventes réellement livrées"
          value={
            <AnimatedNumber
              value={deliveredRevenue}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext={`${deliveredOrders.length} livrée(s) · Réussite ${deliveryRatePct} %`}
          icon={Wallet}
          tone="emerald"
          audioText={`Ventes réellement livrées : ${deliveredRevenue} Francs CFA, sur ${deliveredOrders.length} colis remis aux clients.`}
        />

        <StatMetricCard
          badge="DANS MA POCHE"
          label="Mon bénéfice net réel"
          value={
            <AnimatedNumber
              value={estimatedNetProfit}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext={`Charges déduites : ${formatCurrency(totalExpenses, activeStore.currency)}`}
          icon={Calculator}
          tone={estimatedNetProfit >= 0 ? "emerald" : "rose"}
          audioText={`Mon vrai bénéfice net : ${estimatedNetProfit} Francs CFA. C'est l'argent qui reste réellement pour vous après le prix d'achat des articles et vos dépenses.`}
          action={
            <Link
              href="/dashboard/finances"
              className="rounded-lg bg-[#00A884]/15 px-2.5 py-1 text-[11px] font-extrabold text-[#073B35] transition hover:bg-[#00A884] hover:text-white"
            >
              Détails
            </Link>
          }
        />

        <StatMetricCard
          badge="CHEZ LIVREURS"
          label="Argent gardé par livreurs"
          value={
            <AnimatedNumber
              value={cashHeldByCouriers}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext={
            cashHeldByCouriers > 0
              ? "Cash à récupérer en caisse"
              : "Aucun cash en attente"
          }
          icon={Truck}
          tone={cashHeldByCouriers > 0 ? "amber" : "navy"}
          audioText={`Argent chez les livreurs : ${cashHeldByCouriers} Francs CFA. C'est la somme encaissée chez les clients que vos livreurs doivent vous verser.`}
          action={
            <Link
              href="/dashboard/livreurs"
              className="rounded-lg bg-slate-900/10 px-2.5 py-1 text-[11px] font-extrabold text-[#073B35] transition hover:bg-[#073B35] hover:text-white"
            >
              Livreurs
            </Link>
          }
        />
      </section>

      {/* =====================================================================
          4. ATELIER VISUEL DE MA BOUTIQUE EN DIRECT (APERÇU + COULEURS & PHOTOS EN 1 CLIC)
         ===================================================================== */}
      <section
        id="atelier-vitrine"
        className="scroll-mt-20 overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-sm"
      >
        {/* Barre supérieure de l'atelier */}
        <div className="flex flex-col gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-xs"
              style={{ backgroundColor: brandDarkBase }}
            >
              <Store className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-[#15232D] sm:text-lg">
                  Voici votre boutique : personnalisez-la en 1 clic
                </h2>
                {savedNotice && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F7F2] px-2.5 py-0.5 text-[11px] font-extrabold text-[#073B35]">
                    <Check className="h-3 w-3 text-[#00A884]" />
                    {savedNotice}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Touchez une couleur ou une image à droite : votre boutique à
                gauche change immédiatement.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <VoiceAudioButton
              textToSpeak="Voici l'aperçu réel de votre boutique. À gauche, vous voyez ce que voient vos clients sur leur téléphone. À droite, cliquez simplement sur un rond de couleur ou sur une photo pour changer immédiatement l'apparence de votre boutique."
              variant="pill"
              label="Comment ça marche ?"
            />

            <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold cursor-pointer",
                  previewDevice === "mobile"
                    ? "bg-[#073B35] text-white"
                    : "text-slate-500 hover:text-[#15232D]"
                )}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold cursor-pointer",
                  previewDevice === "desktop"
                    ? "bg-[#073B35] text-white"
                    : "text-slate-500 hover:text-[#15232D]"
                )}
              >
                <Laptop className="h-3.5 w-3.5" />
                Ordinateur
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-12">
          {/* COLONNE GAUCHE : APERÇU VIVANT DE LA VRAIE VITRINE */}
          <div className="flex flex-col items-center justify-between rounded-2xl bg-slate-100/80 p-4 lg:col-span-5">
            <StoreDynamicFontInjector settings={activeStore.settings} />
            <div
              style={getStoreFontStyleVars(activeStore.settings)}
              className={cn(
                "w-full overflow-hidden border-4 border-slate-900 bg-[#F8FAFC] shadow-xl transition-all duration-300",
                previewDevice === "mobile"
                  ? "max-w-[305px] rounded-[28px]"
                  : "max-w-full rounded-2xl"
              )}
            >
              {/* Barre d'adresse */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
                <span className="flex items-center gap-1 truncate text-[10px] font-bold text-slate-600">
                  <Lock className="h-2.5 w-2.5 shrink-0 text-[#00A884]" />
                  <span className="truncate">
                    {activeStore.customDomain ||
                      `${activeStore.slug}.ecomsate.com`}
                  </span>
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-700">
                  {activeStore.currency}
                </span>
              </div>

              {/* Bandeau supérieur aux vraies couleurs du marchand */}
              <div
                className="px-3 py-1.5 text-center text-[10px] font-extrabold text-white transition-colors duration-300"
                style={{ backgroundColor: brandAccentCta }}
              >
                Paiement à la livraison · Vérifiez avant de payer
              </div>

              {/* En-tête boutique */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3.5 py-2">
                <span
                  className="truncate text-xs font-black"
                  style={{
                    color: brandDarkBase,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {activeStore.name}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white"
                  style={{ backgroundColor: brandAccentCta }}
                >
                  {getActiveFontDisplayName(activeStore.settings)}
                </span>
              </div>

              {/* Bannière image en direct */}
              <div
                className="relative h-38 w-full overflow-hidden"
                style={{ backgroundColor: brandDarkBase }}
              >
                <img
                  src={currentBannerUrl}
                  alt={activeStore.name}
                  className="h-full w-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <p
                    className="truncate text-sm font-black"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {activeStore.name}
                  </p>
                  <p className="truncate text-[10px] text-slate-200">
                    {activeStore.settings.description ||
                      "Livraison rapide à domicile · Payez à la réception"}
                  </p>
                </div>
              </div>

              {/* Carte produit vedette en direct */}
              <div className="space-y-2.5 p-3">
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                  <img
                    src={
                      storeProducts[0]?.images?.[0] ||
                      "/images/african-beauty-glow-portrait.jpg"
                    }
                    alt="Produit vedette"
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-[#15232D]">
                      {storeProducts[0]?.name || "Votre 1er produit vedette"}
                    </p>
                    <p
                      className="mt-0.5 text-xs font-black"
                      style={{ color: brandAccentCta }}
                    >
                      {formatCurrency(
                        storeProducts[0]?.price || 18500,
                        activeStore.currency
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/s/${activeStore.slug}`}
                  target="_blank"
                  className="block w-full rounded-xl py-2.5 text-center text-[11px] font-black text-white shadow-xs transition opacity-95 hover:opacity-100"
                  style={{ backgroundColor: brandAccentCta }}
                >
                  COMMANDER — PAIEMENT À LA LIVRAISON
                </Link>
              </div>
            </div>

            <Link
              href={`/s/${activeStore.slug}`}
              target="_blank"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#073B35] hover:text-[#00A884]"
            >
              <Eye className="h-4 w-4 text-[#00A884]" />
              Ouvrir ma vraie vitrine client dans un nouvel onglet
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* COLONNE DROITE : CONTRÔLES VISUELS EN 1 CLIC (COULEURS + BANNIÈRES + ÉDITEURS) */}
          <div className="flex flex-col justify-between space-y-5 lg:col-span-7">
            {/* 1. Couleurs en 1 clic */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#00A884]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#15232D]">
                    1. Choisir la couleur de ma boutique (1 clic)
                  </h3>
                </div>
                <VoiceAudioButton
                  textToSpeak="Touchez un des cinq ronds de couleur pour changer immédiatement la couleur des boutons et du bandeau de votre boutique."
                  variant="icon"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2.5">
                {QUICK_COLOR_PRESETS.map((preset) => {
                  const isCurrent =
                    brandAccentCta.toLowerCase() ===
                    preset.secondary.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        handleQuickColorChange(
                          preset.primary,
                          preset.secondary,
                          preset.label
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-bold transition cursor-pointer",
                        isCurrent
                          ? "border-[#15232D] ring-2 ring-[#15232D]/15 shadow-xs"
                          : "border-[#E2E8F0] hover:border-slate-400"
                      )}
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: preset.secondary }}
                      >
                        {isCurrent && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span className="text-[#15232D]">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Image de couverture en 1 clic */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#00A884]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#15232D]">
                    2. Choisir la photo d&apos;accueil (1 clic)
                  </h3>
                </div>
                <VoiceAudioButton
                  textToSpeak="Touchez une des quatre photos pour changer immédiatement la grande image d'accueil de votre boutique."
                  variant="icon"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {QUICK_BANNER_PRESETS.map((b) => {
                  const active = currentBannerUrl === b.url;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleQuickBannerChange(b.url, b.label)}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border-2 text-left transition cursor-pointer",
                        active
                          ? "border-[#00A884] ring-2 ring-[#00A884]/25"
                          : "border-transparent hover:border-slate-300"
                      )}
                    >
                      <img
                        src={b.url}
                        alt={b.label}
                        className="h-18 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      {active && (
                        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#00A884] text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                      <span className="absolute bottom-1.5 left-2 right-2 truncate text-[10px] font-extrabold text-white">
                        {b.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Police d'écriture de la boutique en 1 clic (+ police perso) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <StoreFontSelector
                compact
                settings={activeStore.settings}
                onChange={(patch) => {
                  updateStoreSettings(activeStore.id, patch);
                  setSavedNotice("Police d'écriture appliquée à votre boutique");
                  setTimeout(() => setSavedNotice(null), 2600);
                }}
              />
            </div>

            {/* 4. Outils complets de personnalisation */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/dashboard/store-builder"
                className="group flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-3.5 transition hover:border-[#00A884] hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F7F2] text-[#073B35]">
                    <Layers className="h-5 w-5 text-[#00A884]" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-[#15232D]">
                      Sections & Thème Shrine Pro
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Textes, avis, FAQ & bannières perso
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#00A884] transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/dashboard/form-builder"
                className="group flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-3.5 transition hover:border-amber-400 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <FormInput className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-[#15232D]">
                      Formulaire COD & Packs Duo
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Champs client & remises 1x / 2x / 3x
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-amber-600 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. SUIVI DES COMMANDES RÉCENTES, COURBE & GUIDE DES PAGES
         ===================================================================== */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer",
              activeTab === "orders"
                ? "bg-[#073B35] text-white shadow-2xs"
                : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
            )}
          >
            <ShoppingBag className="h-4 w-4 text-[#00A884]" />
            Commandes récentes ({pendingConfirmationOrders.length} à traiter)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chart")}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer",
              activeTab === "chart"
                ? "bg-[#073B35] text-white shadow-2xs"
                : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
            )}
          >
            <BarChart3 className="h-4 w-4 text-[#00A884]" />
            Courbe des ventes & Meilleurs articles
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer",
              activeTab === "guide"
                ? "bg-[#073B35] text-white shadow-2xs"
                : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
            )}
          >
            <Compass className="h-4 w-4 text-[#00A884]" />
            Toutes les pages expliquées
          </button>
        </div>

        {/* ONGLET 1 : COMMANDES RÉCENTES */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {(outOfStockCount > 0 || lowStockCount > 0) && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>
                    Attention stock : {outOfStockCount + lowStockCount}{" "}
                    article(s) bientôt épuisé(s) ou en rupture.
                  </span>
                </div>
                <Link
                  href="/dashboard/stocks"
                  className="rounded-lg bg-amber-600 px-3 py-1.5 font-extrabold text-white hover:bg-amber-700"
                >
                  Réapprovisionner
                </Link>
              </div>
            )}

            <Card className="border-[#E2E8F0] bg-white">
              <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#15232D]">
                    Vos 5 dernières commandes
                  </h3>
                  <p className="text-xs text-slate-500">
                    Appelez le client puis cliquez sur « Confirmer »
                  </p>
                </div>
                <Link
                  href="/dashboard/commandes"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#073B35] hover:text-[#00A884]"
                >
                  Tout voir ({storeOrders.length})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>

              <CardContent className="p-0">
                {storeOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-center">
                    <ShoppingBag className="h-9 w-9 text-slate-300" />
                    <p className="mt-2.5 text-sm font-bold text-[#15232D]">
                      Aucune commande sur cette période
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-slate-500">
                      Partagez le lien de votre boutique sur WhatsApp, TikTok ou
                      Facebook pour recevoir vos premières commandes COD.
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#00A884] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#009474] cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedLink ? "Lien copié !" : "Copier le lien boutique"}
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E2E8F0]">
                    {storeOrders.slice(0, 5).map((ord) => {
                      const isWaiting =
                        ord.status === "new" ||
                        ord.status === "pending_confirmation";
                      return (
                        <div
                          key={ord.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#F8FAFC]"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#15232D]">
                                {ord.customerName}
                              </span>
                              <OrderStatusPill status={ord.status} />
                            </div>
                            <p className="text-xs text-slate-500">
                              {ord.deliveryCity} · {ord.customerPhone} ·{" "}
                              {formatDate(ord.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-[#073B35]">
                              {formatCurrency(
                                ord.totalAmount,
                                activeStore.currency
                              )}
                            </span>
                            {isWaiting ? (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  updateOrderStatus(
                                    activeStore.id,
                                    ord.id,
                                    "confirmed"
                                  )
                                }
                              >
                                <Check className="h-3.5 w-3.5" />
                                Confirmer
                              </Button>
                            ) : (
                              <Link
                                href="/dashboard/commandes"
                                className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#15232D] hover:bg-slate-50"
                              >
                                Détails
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ONGLET 2 : COURBE DES VENTES & TOP PRODUITS */}
        {activeTab === "chart" && (
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="border-[#E2E8F0] bg-white lg:col-span-7">
              <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#15232D]">
                    Évolution de vos ventes
                  </h3>
                  <p className="text-xs text-slate-500">
                    Activité jour par jour
                  </p>
                </div>
                <Badge variant="navy">{storeOrders.length} commande(s)</Badge>
              </CardHeader>
              <CardContent className="p-5">
                <SalesInteractiveChart
                  orders={storeOrders}
                  currency={activeStore.currency}
                />
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0] bg-white lg:col-span-5">
              <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#15232D]">
                    Produits les plus vendus
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sur la période choisie
                  </p>
                </div>
                <Link
                  href="/dashboard/produits"
                  className="text-xs font-bold text-[#00A884] hover:underline"
                >
                  Catalogue
                </Link>
              </CardHeader>
              <CardContent className="p-4">
                {rankedProducts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="mx-auto h-7 w-7 text-slate-300" />
                    <p className="mt-2 text-xs text-slate-500">
                      Aucun produit dans votre catalogue.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {rankedProducts.slice(0, 4).map((item, idx) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[11px] font-extrabold text-[#073B35]">
                            {idx + 1}
                          </span>
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#15232D]">
                              {item.product.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {item.unitsSold} vendu(s) · Stock{" "}
                              {item.product.stock}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-extrabold text-[#00A884]">
                          {formatCurrency(item.revenue, activeStore.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ONGLET 3 : GUIDE VOCAL & VISUEL DES PAGES */}
        {activeTab === "guide" && (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {MERCHANT_PAGES_DIRECTORY.map((page) => {
              const Icon = page.icon;
              return (
                <div
                  key={page.href}
                  className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 transition hover:border-[#00A884] hover:shadow-xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F7F2] text-[#073B35]">
                        <Icon className="h-5 w-5 text-[#00A884]" />
                      </span>
                      <VoiceAudioButton
                        textToSpeak={`${page.title}. ${page.purpose}`}
                        variant="pill"
                        label="Écouter"
                      />
                    </div>
                    <h3 className="text-sm font-extrabold text-[#15232D]">
                      {page.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {page.purpose}
                    </p>
                  </div>

                  <Link
                    href={page.href}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-[#00A884] hover:text-[#073B35]"
                  >
                    Ouvrir cette page
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Raccourci discret vers Adeshina IA */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#00A884]/25 bg-[#E7F7F2]/50 px-4 py-3 text-xs text-[#073B35]">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#00A884]" />
          <span className="font-semibold">
            Une question sur vos ventes ou votre boutique ? Demandez à votre
            assistant Adeshina IA.
          </span>
        </div>
        <Link
          href="/dashboard/adeshina-ia"
          className="font-extrabold text-[#073B35] underline decoration-[#00A884] underline-offset-4 hover:text-[#00A884]"
        >
          Ouvrir Adeshina IA
        </Link>
      </div>
    </div>
  );
}
