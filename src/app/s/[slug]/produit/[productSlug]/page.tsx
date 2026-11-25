"use client";

import Link from "next/link";
import React, { use, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useStorefront } from "@/components/storefront/storefront-context";
import { groupProductVariants } from "@/components/storefront/cart-drawer";
import { StoreProductCard } from "@/components/storefront/product-card";
import { formatCurrency } from "@/lib/utils";

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

  const product = products.find((p) => p.slug === productSlug) ?? null;

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [addedFeedback, setAddedFeedback] = useState(false);

  const primary = store.settings.primaryColor || "#102A43";
  const secondary = store.settings.secondaryColor || "#10B981";

  const variantGroups = useMemo(
    () => (product ? groupProductVariants(product) : []),
    [product]
  );

  // Suggestions de produits similaires (même catégorie puis reste du catalogue réel)
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
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
          Article introuvable
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Ce produit n&apos;est plus disponible ou son adresse a changé.
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
  const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
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

  const cleanWa = store.settings.whatsappPhone.replace(/[^\d]/g, "");
  const directWhatsappUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    `Bonjour ${store.name}, je souhaite commander :\n• ${quantity}x ${product.name}${
      resolvedVariantLabel ? ` (${resolvedVariantLabel})` : ""
    }\n• Prix unitaire : ${formatCurrency(unitPrice, store.currency)}`
  )}`;

  const handleAddToCart = () => {
    addToCart(product, {
      variantLabel: resolvedVariantLabel,
      quantity,
      openDrawer: false,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleBuyNow = () => {
    addToCart(product, {
      variantLabel: resolvedVariantLabel,
      quantity,
      goToCheckout: true,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pb-12 lg:px-8">
      {/* Fil d'Ariane */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <Link
          href={`/s/${store.slug}`}
          className="font-medium hover:text-slate-900"
        >
          Accueil
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        {category && (
          <>
            <Link
              href={`/s/${store.slug}#catalogue`}
              className="font-medium hover:text-slate-900"
            >
              {category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </>
        )}
        <span className="truncate font-semibold text-slate-900">
          {product.name}
        </span>
      </nav>

      {/* Grille principale : Galerie (6 cols) + Fiche d'achat (6 cols) */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* GALERIE D'IMAGES */}
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
                  key={img}
                  type="button"
                  onClick={() => setActiveImgIdx(idx)}
                  className={`h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all cursor-pointer ${
                    activeImgIdx === idx
                      ? "border-slate-900 shadow-xs"
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
        </div>

        {/* INFORMATIONS PRODUIT & ACHAT */}
        <div className="flex flex-col lg:col-span-6">
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
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                En stock ({product.stock} disponibles)
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {product.name}
          </h1>

          {/* Prix */}
          <div className="mt-4 flex flex-wrap items-baseline gap-3 border-b border-slate-200 pb-5">
            <span
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: primary }}
            >
              {formatCurrency(unitPrice, store.currency)}
            </span>
            {hasPromo && (
              <span className="text-base font-medium text-slate-400 line-through">
                {formatCurrency(product.price, store.currency)}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              {product.description}
            </p>
          </div>

          {/* Sélecteurs de variantes par attribut */}
          {variantGroups.length > 0 && (
            <div className="mt-6 space-y-4">
              {variantGroups.map((group) => {
                const current =
                  selectedOptions[group.name] ?? group.values[0];
                return (
                  <div key={group.name}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-slate-500">
                        {group.name}
                      </span>
                      <span className="font-bold text-slate-900">{current}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
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
                            className="min-w-12 rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer"
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
                                    color: "#1E293B",
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

          {/* Sélecteur de quantité */}
          {!outOfStock && (
            <div className="mt-6">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Quantité
              </span>
              <div className="mt-2 inline-flex items-center rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-extrabold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="flex h-11 w-11 items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Boutons Ajouter au panier + Commander maintenant */}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={outOfStock}
              onClick={handleAddToCart}
              className="flex h-12.5 items-center justify-center gap-2 rounded-xl border-2 bg-white text-sm font-extrabold transition-all hover:bg-slate-50 active:scale-[0.99] disabled:opacity-40 cursor-pointer"
              style={{ borderColor: primary, color: primary }}
            >
              {addedFeedback ? (
                <>
                  <Check className="h-4.5 w-4.5 text-emerald-600" />
                  Ajouté au panier !
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4.5 w-4.5" />
                  Ajouter au panier
                </>
              )}
            </button>

            <button
              type="button"
              disabled={outOfStock}
              onClick={handleBuyNow}
              className="flex h-12.5 items-center justify-center gap-2 rounded-xl text-sm font-extrabold text-white shadow-md transition-opacity hover:opacity-95 active:scale-[0.99] disabled:opacity-40 cursor-pointer"
              style={{ backgroundColor: secondary }}
            >
              Commander maintenant
            </button>
          </div>

          {cleanWa && !outOfStock && (
            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 text-xs font-bold text-slate-900 transition-colors hover:bg-[#25D366] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Poser une question ou commander sur WhatsApp
            </a>
          )}

          {/* Informations livraison & garanties */}
          <div className="mt-7 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-slate-800" />
              <div>
                <p className="font-bold text-slate-900">Livraison</p>
                <p className="mt-0.5">{store.settings.deliveryInfo}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-800" />
              <div>
                <p className="font-bold text-slate-900">
                  Conditions & Paiement
                </p>
                <p className="mt-0.5">{store.settings.termsOfSale}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUGGESTIONS DE PRODUITS SIMILAIRES */}
      {similarProducts.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Articles similaires
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            D&apos;autres produits susceptibles de vous intéresser chez{" "}
            {store.name}
          </p>

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

      {/* Barre d'achat fixe en bas sur Mobile */}
      {!outOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:hidden">
          <div>
            <p className="text-[11px] text-slate-500">
              Total ({quantity} art.)
            </p>
            <p
              className="text-base font-extrabold"
              style={{ color: primary }}
            >
              {formatCurrency(unitPrice * quantity, store.currency)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBuyNow}
            className="h-11 flex-1 rounded-xl text-xs font-extrabold text-white shadow-sm cursor-pointer"
            style={{ backgroundColor: secondary }}
          >
            Commander maintenant
          </button>
        </div>
      )}
    </div>
  );
}
