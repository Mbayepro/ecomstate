"use client";

import Link from "next/link";
import React, { use, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Flame,
  HeartHandshake,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useStorefront } from "@/components/storefront/storefront-context";
import { groupProductVariants } from "@/components/storefront/cart-drawer";
import { CodDynamicForm } from "@/components/storefront/cod-dynamic-form";
import { StoreProductCard } from "@/components/storefront/product-card";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/utils";
import type { ProductDescriptionMedia } from "@/types/domain";

function getYoutubeEmbedUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function formatShortDayMonth(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function RichDescriptionMediaBlock({
  media,
  productName,
}: {
  media: ProductDescriptionMedia;
  productName: string;
}) {
  const ytEmbed = media.type === "video" ? getYoutubeEmbedUrl(media.url) : null;

  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs">
      {media.type === "video" ? (
        ytEmbed ? (
          <div className="aspect-video w-full bg-black">
            <iframe
              src={ytEmbed}
              title={media.caption || productName}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            src={media.url}
            controls
            playsInline
            loop
            className="max-h-[460px] w-full bg-black object-contain"
          />
        )
      ) : (
        <img
          src={media.url}
          alt={media.caption || productName}
          className="max-h-[520px] w-full object-cover"
        />
      )}
      {media.caption && (
        <figcaption className="border-t border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600">
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { productSlug } = use(params);
  const {
    store,
    categories,
    products,
    addToCart,
    setQuickViewProduct,
  } = useStorefront();
  const { getStoreCodForm } = usePlatform();

  const product = products.find((p) => p.slug === productSlug) ?? null;
  const codForm = getStoreCodForm(store.id);

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [countdownSec, setCountdownSec] = useState(40 * 60);

  // Le thème complet Shrine Pro 3 (issu du dossier `shrine-pro-theme`) s'active pour les boutiques Premium / Shrine Pro 3
  const isShrinePro3 =
    store.planCode === "premium" || store.settings.template === "shrine_pro_3";

  // Compte à rebours evergreen Shrine Pro 3 (`promo-posture` dans product.json)
  useEffect(() => {
    if (!isShrinePro3) return;
    const interval = setInterval(() => {
      setCountdownSec((prev) => (prev > 0 ? prev - 1 : 40 * 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [isShrinePro3]);

  // Barre d'achat collante (`sticky_atc` dans product.json)
  useEffect(() => {
    if (!isShrinePro3) return;
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 520);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isShrinePro3]);

  const primary = store.settings.primaryColor || "#073B35";
  const secondary = store.settings.secondaryColor || "#00A884";

  const variantGroups = useMemo(
    () => (product ? groupProductVariants(product) : []),
    [product]
  );

  const similarProducts = useMemo(() => {
    if (!product) return [];
    const sameCat = products.filter(
      (p) => p.id !== product.id && p.categoryId === product.categoryId
    );
    const others = products.filter(
      (p) => p.id !== product.id && p.categoryId !== product.categoryId
    );
    return [...sameCat, ...others].slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Package className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-extrabold text-[#15232D]">
          Article introuvable
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Ce produit n&apos;est plus disponible dans cette boutique.
        </p>
        <Link
          href={`/s/${store.slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: primary }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retourner au catalogue
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const outOfStock = product.stock <= 0;
  const lowStock =
    product.stock > 0 && product.stock <= product.lowStockThreshold;
  const unitPrice = product.promoPrice ?? product.price;
  const hasPromo =
    Boolean(product.promoPrice) && Number(product.promoPrice) < product.price;
  const savings = hasPromo ? product.price - Number(product.promoPrice) : 0;

  const resolvedVariantLabel =
    variantGroups.length > 0
      ? variantGroups
          .map((g) => `${g.name} : ${selectedOptions[g.name] ?? g.values[0]}`)
          .join(" · ")
      : undefined;

  const handleAddToCart = () => {
    addToCart(product, {
      variantLabel: resolvedVariantLabel,
      quantity: 1,
      openDrawer: false,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const hoursLeft = String(Math.floor(countdownSec / 3600)).padStart(2, "0");
  const minsLeft = String(Math.floor((countdownSec % 3600) / 60)).padStart(
    2,
    "0"
  );
  const secsLeft = String(countdownSec % 60).padStart(2, "0");

  const richMediaList: ProductDescriptionMedia[] = [
    ...(product.videoUrl
      ? [
          {
            id: "legacy-video-url",
            type: "video" as const,
            url: product.videoUrl,
            caption: "Vidéo de présentation",
          },
        ]
      : []),
    ...(product.descriptionMedia ?? []),
  ];

  const productFaqs = [
    {
      q: "Comment se passe le règlement de ma commande ?",
      a: "Vous ne payez rien d'avance en ligne. Le règlement se fait exclusivement en espèces au livreur au moment où vous recevez votre colis en main propre.",
    },
    {
      q: "Puis-je vérifier le produit à la livraison ?",
      a: "Oui. Notre livreur vous contacte avant son arrivée et vous remet votre commande en toute transparence.",
    },
    {
      q: "Quels sont les délais de livraison ?",
      a: `${store.settings.deliveryInfo || "Livraison rapide sous 24h à 48h après confirmation téléphonique."}`,
    },
    {
      q: "Comment commander plusieurs unités avec réduction ?",
      a: "Sélectionnez directement le Pack Duo (2 unités) ou le Pack Trio (3 unités) dans le formulaire de commande ci-dessus pour profiter d'une remise immédiate.",
    },
  ];

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Fil d'Ariane */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <Link
            href={`/s/${store.slug}`}
            className="font-medium hover:text-[#15232D]"
          >
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          {category && (
            <>
              <Link
                href={`/s/${store.slug}#catalogue`}
                className="font-medium hover:text-[#15232D]"
              >
                {category.name}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </>
          )}
          <span className="truncate font-semibold text-[#15232D]">
            {product.name}
          </span>
        </nav>

        {/* =================================================================
            GRILLE PRINCIPALE SHRINE PRO : GALERIE + BLOCS DE CONVERSION COD
           ================================================================= */}
        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Colonne Gauche : Galerie photos + Description enrichie (Photos, GIFs, Vidéos) */}
          <div className="lg:col-span-6">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xs">
              <img
                src={product.images[activeImgIdx] || product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {hasPromo && (
                <span
                  className="absolute left-4 top-4 rounded-xl px-3 py-1 text-xs font-extrabold text-white shadow-sm"
                  style={{ backgroundColor: secondary }}
                >
                  Économisez {formatCurrency(savings, store.currency)}
                </span>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all cursor-pointer ${
                      activeImgIdx === idx
                        ? "border-[#15232D] shadow-xs"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} vue ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description détaillée enrichie (Texte + Photos + GIFs + Vidéos) */}
            <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Présentation détaillée
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {product.description}
                </p>
              </div>

              {richMediaList.length > 0 && (
                <div className="space-y-4 pt-2">
                  {richMediaList.map((media) => (
                    <RichDescriptionMediaBlock
                      key={media.id}
                      media={media}
                      productName={product.name}
                    />
                  ))}
                </div>
              )}

              <div className="grid gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#00A884]" />
                  <span>{store.settings.deliveryInfo}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#00A884]" />
                  <span>{store.settings.termsOfSale}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Blocs Shrine Pro (`trustpilot_stars`, `text_with_icon`, `price`, `inventory`, `CodDynamicForm`, `shipping_checkpoints`) */}
          <div className="flex flex-col lg:col-span-6">
            {/* Bloc Shrine Pro 3 : Étoiles Trustpilot (`trustpilot_stars` de product.json) */}
            {isShrinePro3 && (
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className="flex h-5 w-5 items-center justify-center rounded-xs bg-[#00B67A] text-white"
                    >
                      <Star className="h-3 w-3 fill-white text-white" />
                    </span>
                  ))}
                </div>
                <span className="text-xs font-extrabold text-[#15232D]">
                  4,9/5 · Clients vérifiés satisfaits
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {category.name}
                </span>
              )}
              {outOfStock ? (
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                  Rupture de stock
                </span>
              ) : lowStock ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  Stock limité · Plus que {product.stock} disponible(s)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F7F2] px-3 py-1 text-xs font-bold text-[#073B35]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00A884]" />
                  Disponible immédiatement
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#15232D] sm:text-3xl">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-1.5 text-sm font-medium text-slate-600">
                {product.shortDescription}
              </p>
            )}

            {/* Bloc Shrine Pro 3 : 4 lignes d'arguments cochés (`text_with_icon` x4 dans product.json) */}
            {isShrinePro3 && (
              <div className="mt-4 space-y-2 rounded-2xl border border-slate-200/90 bg-white p-3.5">
                {[
                  "Paiement 100 % en espèces à la réception du colis",
                  "Qualité contrôlée avant départ en livraison",
                  "Expédition rapide à domicile ou au bureau",
                  "Assistance et suivi de commande garantis",
                ].map((bullet) => (
                  <div
                    key={bullet}
                    className="flex items-center gap-2.5 text-xs font-bold text-[#15232D]"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0"
                      style={{ color: secondary }}
                    />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Bloc Prix + Badge Offre Spéciale (`price` dans product.json) */}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
              <span
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: primary }}
              >
                {formatCurrency(unitPrice, store.currency)}
              </span>
              {hasPromo && (
                <>
                  <span className="text-base font-medium text-slate-400 line-through">
                    {formatCurrency(product.price, store.currency)}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: secondary }}
                  >
                    <Sparkles className="h-3 w-3" />
                    OFFRE SPÉCIALE
                  </span>
                </>
              )}
            </div>

            {/* Bloc Urgence Stock (`inventory` dans product.json — Zéro émoji brut) */}
            {!outOfStock && isShrinePro3 && (
              <div className="mt-3.5 rounded-2xl border border-amber-200/90 bg-amber-50/70 p-3.5 text-xs text-amber-950">
                <div className="flex items-center justify-between font-extrabold">
                  <span className="inline-flex items-center gap-1.5 text-amber-900">
                    <Flame className="h-4 w-4 text-amber-600" />
                    Plus que {product.stock > 0 ? Math.min(product.stock, 7) : 0}{" "}
                    pièces disponibles à ce tarif
                  </span>
                  <span className="rounded-md bg-[#073B35] px-2 py-0.5 text-[10px] font-bold text-[#7CE3C8]">
                    Forte demande
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200/80">
                  <div className="h-full w-4/5 rounded-full bg-amber-600" />
                </div>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-900/90">
                  <Users className="h-3.5 w-3.5 text-amber-700" />
                  <span>
                    <strong>12 acheteurs</strong> consultent cette offre en ce
                    moment.
                  </span>
                </p>
              </div>
            )}

            {/* Sélecteurs de variantes (`variant_picker`) */}
            {variantGroups.length > 0 && (
              <div className="mt-4 space-y-3">
                {variantGroups.map((group) => {
                  const current =
                    selectedOptions[group.name] ?? group.values[0];
                  return (
                    <div key={group.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-slate-500">
                          {group.name}
                        </span>
                        <span className="font-bold text-[#15232D]">
                          {current}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {group.values.map((val) => {
                          const isSelected = current === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [group.name]: val,
                                }))
                              }
                              className="min-w-12 rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                              style={
                                isSelected
                                  ? {
                                      borderColor: primary,
                                      backgroundColor: primary,
                                      color: "#FFF",
                                    }
                                  : {
                                      borderColor: "#E2E8F0",
                                      backgroundColor: "#FFF",
                                      color: "#15232D",
                                    }
                              }
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Option d'ajout au panier multi-articles */}
            {!outOfStock && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-[#15232D] hover:bg-slate-50 cursor-pointer"
                >
                  {addedFeedback ? (
                    <>
                      <Check className="h-4 w-4 text-[#00A884]" />
                      Ajouté au panier (continuez vos achats ou commandez
                      ci-dessous)
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      Ajouter au panier pour grouper plusieurs articles
                    </>
                  )}
                </button>
              </div>
            )}

            {/* FORMULAIRE COD EXPRESS + QUANTITY BREAKS SHRINE PRO (1x / Duo / Trio) */}
            {!outOfStock && (
              <div id="formulaire-cod" className="scroll-mt-24 mt-5">
                <CodDynamicForm
                  store={store}
                  fields={codForm.publishedFields}
                  style={codForm.publishedStyle}
                  items={[]}
                  singleProduct={product}
                  selectedVariantLabel={resolvedVariantLabel}
                />
              </div>
            )}

            {/* Bloc Shrine Pro 3 : Chronologie de livraison 3 étapes (`shipping_checkpoints` dans product.json) */}
            {isShrinePro3 && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <span
                      className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: primary }}
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </span>
                    <p className="text-[11px] font-black text-[#15232D]">
                      {formatShortDayMonth(0)}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500">
                      Commandé en ligne
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span
                      className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: primary }}
                    >
                      <Truck className="h-4 w-4" />
                    </span>
                    <p className="text-[11px] font-black text-[#15232D]">
                      {formatShortDayMonth(0)} - {formatShortDayMonth(1)}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500">
                      Colis prêt & expédié
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span
                      className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: secondary }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <p className="text-[11px] font-black text-[#15232D]">
                      {formatShortDayMonth(1)} - {formatShortDayMonth(2)}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500">
                      Livré & payé sur place
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================
          SECTIONS DE CONVERSION SHRINE PRO 3 (EXCLUSIVES AU PLAN PREMIUM)
          Fidèles à l'ordre exact de `shrine-pro-theme/templates/product.json`
         =================================================================== */}
      {isShrinePro3 && (
        <div className="mt-14 space-y-14">
          {/* 1. `icones-slide` : Bandeau défilant continu de fonctionnalités */}
          <div
            className="overflow-hidden border-y py-3 text-white"
            style={{ backgroundColor: primary }}
          >
            <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
              {[
                "Paiement 100 % à la livraison",
                "Contrôle qualité avant expédition",
                "Livraison rapide à votre porte",
                "Offres Packs Duo & Trio économiques",
                "Service client réactif 7j/7",
                "Paiement 100 % à la livraison",
                "Contrôle qualité avant expédition",
                "Livraison rapide à votre porte",
              ].map((txt, idx) => (
                <span
                  key={`${txt}-${idx}`}
                  className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wide"
                >
                  <Sparkles className="h-3.5 w-3.5" style={{ color: secondary }} />
                  {txt}
                </span>
              ))}
            </div>
          </div>

          {/* 2. `benfit` + `image-future` : Mise en scène photo entourée des 4 points forts */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-10">
              <div className="mx-auto max-w-2xl text-center">
                <span
                  className="inline-block rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white"
                  style={{ backgroundColor: secondary }}
                >
                  Qualité Supérieure
                </span>
                <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-[#15232D] sm:text-3xl">
                  Pourquoi {product.name} fait toute la différence
                </h2>
              </div>

              <div className="mt-8 grid items-center gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-4">
                  <div className="rounded-2xl bg-[#F8FAFC] p-4">
                    <Zap className="h-5 w-5" style={{ color: secondary }} />
                    <h3 className="mt-2 text-sm font-extrabold text-[#15232D]">
                      Sélection rigoureuse
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Matériaux et finitions contrôlés pièce par pièce avant
                      chaque départ de notre stock local.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-4">
                    <Award className="h-5 w-5" style={{ color: secondary }} />
                    <h3 className="mt-2 text-sm font-extrabold text-[#15232D]">
                      Fidèle aux photos réelles
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Vous recevez exactement l&apos;article présenté sur cette
                      fiche, sans mauvaise surprise.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="mx-auto aspect-square max-w-xs overflow-hidden rounded-full border-4 border-slate-100 shadow-lg">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-4 lg:col-span-4">
                  <div className="rounded-2xl bg-[#F8FAFC] p-4">
                    <ShieldCheck
                      className="h-5 w-5"
                      style={{ color: secondary }}
                    />
                    <h3 className="mt-2 text-sm font-extrabold text-[#15232D]">
                      Zéro risque d&apos;achat
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Aucune carte bancaire demandée : vous réglez uniquement
                      lorsque le livreur est devant vous.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F8FAFC] p-4">
                    <HeartHandshake
                      className="h-5 w-5"
                      style={{ color: secondary }}
                    />
                    <h3 className="mt-2 text-sm font-extrabold text-[#15232D]">
                      Suivi personnalisé
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Notre équipe vous appelle pour confirmer le créneau et le
                      repère exact de livraison.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. `promo-posture` : Offre spéciale + Compte à rebours Evergreen */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className="grid items-center gap-6 overflow-hidden rounded-3xl p-6 text-white shadow-md sm:p-10 lg:grid-cols-12"
              style={{ backgroundColor: primary }}
            >
              <div className="space-y-3 lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                  <Clock className="h-3.5 w-3.5" />
                  Offre limitée sur le stock actuel
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Commandez maintenant et payez uniquement à la réception
                </h2>
                <p className="max-w-xl text-xs leading-relaxed text-white/85 sm:text-sm">
                  Réservez votre exemplaire en 30 secondes avant épuisement du
                  lot promotionnel en cours.
                </p>
                <div className="pt-1">
                  <a
                    href="#formulaire-cod"
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold text-white shadow-md transition hover:opacity-95"
                    style={{ backgroundColor: secondary }}
                  >
                    Je réserve ma commande COD
                  </a>
                </div>
              </div>

              <div className="flex justify-center gap-3 lg:col-span-5 lg:justify-end">
                {[
                  { val: hoursLeft, lbl: "Heures" },
                  { val: minsLeft, lbl: "Minutes" },
                  { val: secsLeft, lbl: "Secondes" },
                ].map((unit) => (
                  <div
                    key={unit.lbl}
                    className="flex w-22 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 py-3.5 backdrop-blur-xs"
                  >
                    <span className="text-2xl font-black tracking-tight text-white">
                      {unit.val}
                    </span>
                    <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/75">
                      {unit.lbl}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. `comparison-table` : Tableau comparatif Votre Boutique vs Autres */}
          <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xs">
              <div className="grid grid-cols-12 border-b border-slate-200 bg-[#F8FAFC] px-4 py-4 text-xs font-extrabold sm:px-6">
                <div className="col-span-6 text-[#15232D]">
                  Garanties pour vous
                </div>
                <div
                  className="col-span-3 text-center"
                  style={{ color: primary }}
                >
                  {store.name}
                </div>
                <div className="col-span-3 text-center text-slate-400">
                  Autres vendeurs
                </div>
              </div>

              {[
                "Paiement 100 % à la livraison sans avance",
                "Stock réel vérifié localement",
                "Confirmation téléphonique rapide",
                "Remises Packs Duo (2x) & Trio (3x)",
              ].map((row) => (
                <div
                  key={row}
                  className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-3.5 text-xs last:border-b-0 sm:px-6"
                >
                  <div className="col-span-6 font-semibold text-[#15232D]">
                    {row}
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: secondary }}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                      <X className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. `Testi-review` + `facebook-testimonials` : Avis vérifiés & Commentaires sociaux */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-extrabold text-[#15232D]">
                <Star className="h-3.5 w-3.5 fill-[#00B67A] text-[#00B67A]" />
                Note moyenne 4,9/5 · Acheteurs COD vérifiés
              </div>
              <h2 className="mt-2.5 text-2xl font-extrabold text-[#15232D] sm:text-3xl">
                Ce que disent nos clients après livraison
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  author: "Fatou N.",
                  time: "Il y a 2 jours",
                  text: "Livraison super rapide ! Le livreur m'a appelée avant d'arriver et la qualité est exactement comme sur les photos.",
                  likes: "48",
                },
                {
                  author: "Marc K.",
                  time: "Il y a 4 jours",
                  text: "Très rassurant de ne payer qu'à la réception. J'ai pris le Pack Duo pour économiser, emballage impeccable.",
                  likes: "34",
                },
                {
                  author: "Aïcha B.",
                  time: "Cette semaine",
                  text: "Commande passée en 30 secondes sur mon téléphone sans carte bancaire, reçue le lendemain matin. Je recommande à 100 %.",
                  likes: "61",
                },
              ].map((rev) => (
                <div
                  key={rev.author}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white"
                          style={{ backgroundColor: primary }}
                        >
                          {rev.author.slice(0, 1)}
                        </span>
                        <div>
                          <p className="text-xs font-extrabold text-[#15232D]">
                            {rev.author}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00B67A]">
                            <CheckCircle2 className="h-3 w-3" />
                            Acheteur vérifié
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {rev.time}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-slate-700">
                      {rev.text}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5 text-[#00A884]" />
                      Utile ({rev.likes})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      Livraison confirmée
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. `faq-premium` : Questions fréquentes avec carte d'accompagnement */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-12">
              <div className="flex flex-col justify-between rounded-2xl bg-[#F8FAFC] p-5 lg:col-span-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#15232D]">
                    Questions fréquentes
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Tout ce qu&apos;il faut savoir avant de valider votre
                    commande avec paiement à la livraison.
                  </p>
                </div>
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-extrabold text-[#15232D]">
                    Accompagnement 7j/7
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Notre équipe confirme chaque commande par appel avant le
                    départ du livreur.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 lg:col-span-8">
                {productFaqs.map((item, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div
                      key={item.q}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-xs font-extrabold text-[#15232D] sm:text-sm cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-600">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Articles similaires */}
      {similarProducts.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl border-t border-slate-200 px-4 pt-12 sm:px-6 lg:px-8">
          <h2 className="text-xl font-extrabold tracking-tight text-[#15232D] sm:text-2xl">
            Articles similaires
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {similarProducts.map((item) => (
              <StoreProductCard
                key={item.id}
                product={item}
                store={store}
                category={categories.find((c) => c.id === item.categoryId)}
                onAddToCart={(prod) => addToCart(prod)}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* Barre d'achat collante Shrine Pro 3 (`sticky_atc` dans product.json) */}
      {isShrinePro3 && !outOfStock && showStickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_28px_rgba(15,23,42,0.12)] backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="hidden h-11 w-11 shrink-0 rounded-xl object-cover sm:block"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-extrabold text-[#15232D] sm:text-sm">
                  {product.name}
                </p>
                <p
                  className="text-xs font-black"
                  style={{ color: primary }}
                >
                  {formatCurrency(unitPrice, store.currency)} · Paiement à la
                  livraison
                </p>
              </div>
            </div>

            <a
              href="#formulaire-cod"
              className="shrink-0 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: secondary }}
            >
              Commander maintenant
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
