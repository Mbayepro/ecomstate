"use client";

import Link from "next/link";
import React, { use, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useStorefront } from "@/components/storefront/storefront-context";
import { groupProductVariants } from "@/components/storefront/cart-drawer";
import { CodDynamicForm } from "@/components/storefront/cod-dynamic-form";
import { StoreProductCard } from "@/components/storefront/product-card";
import { usePlatform } from "@/lib/platform-store";
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
  const { getStoreCodForm } = usePlatform();

  const product = products.find((p) => p.slug === productSlug) ?? null;
  const codForm = getStoreCodForm(store.id);

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [addedFeedback, setAddedFeedback] = useState(false);

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

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
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

      {/* Grille principale : Galerie (6 cols) + Fiche & Formulaire COD direct (6 cols) */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
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

          {/* Description détaillée sous la galerie sur grand écran */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Présentation détaillée
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {product.description}
            </p>
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-2">
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

        {/* COLONNE CONVERSION : Variantes + Formulaire COD Shrine Pro intégré */}
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

          <div className="mt-4 flex flex-wrap items-baseline gap-3 border-b border-slate-200 pb-4">
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

          {/* Sélecteurs de variantes */}
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
                      <span className="font-bold text-[#15232D]">{current}</span>
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
                    Ajouté au panier (continuez vos achats ou commandez ci-dessous)
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

          {/* FORMULAIRE COD INTÉGRÉ DIRECTEMENT SUR LA FICHE PRODUIT */}
          {!outOfStock && (
            <div className="mt-5">
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
        </div>
      </div>

      {/* Articles similaires */}
      {similarProducts.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-12">
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
    </div>
  );
}
