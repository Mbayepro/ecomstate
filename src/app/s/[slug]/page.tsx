"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useStorefront } from "@/components/storefront/storefront-context";
import {
  EmptyCatalogState,
  StoreProductCard,
} from "@/components/storefront/product-card";
import { formatCurrency } from "@/lib/utils";

type SortMode = "featured" | "newest" | "price_asc" | "price_desc";

export default function PublicStorefrontHomePage() {
  const {
    store,
    categories,
    products,
    searchQuery,
    setSearchQuery,
    addToCart,
    setQuickViewProduct,
  } = useStorefront();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>("featured");
  const [filtersOpenMobile, setFiltersOpenMobile] = useState(false);

  const primary = store.settings.primaryColor || "#102A43";
  const secondary = store.settings.secondaryColor || "#10B981";
  const template = store.settings.template || "minimal";
  const sections = store.settings.homeSections;

  // Bornes de prix réelles calculées depuis les produits actifs de la boutique
  const catalogMaxPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(...products.map((p) => p.promoPrice ?? p.price));
  }, [products]);

  const effectiveMaxPrice = maxPriceFilter ?? catalogMaxPrice;

  // Sélections éditoriales réelles (sans données inventées)
  const popularProducts = useMemo(
    () => products.filter((p) => p.isPopular && p.stock > 0).slice(0, 4),
    [products]
  );

  const promoProducts = useMemo(
    () =>
      products
        .filter(
          (p) => Boolean(p.promoPrice) && Number(p.promoPrice) < p.price
        )
        .slice(0, 4),
    [products]
  );

  const newestProducts = useMemo(
    () =>
      products
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 4),
    [products]
  );

  const recommendedProducts = useMemo(
    () => products.filter((p) => p.stock > 0).slice(0, 4),
    [products]
  );

  const heroFeaturedProduct = popularProducts[0] ?? products[0] ?? null;

  // Catalogue filtré & trié
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = products.filter((p) => {
      const effectivePrice = p.promoPrice ?? p.price;
      const matchCat =
        selectedCategory === "all" ||
        (selectedCategory === "promos"
          ? Boolean(p.promoPrice)
          : p.categoryId === selectedCategory);
      const matchStock = !onlyAvailable || p.stock > 0;
      const matchPrice =
        maxPriceFilter === null || effectivePrice <= maxPriceFilter;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      return matchCat && matchStock && matchPrice && matchQuery;
    });

    return list.sort((a, b) => {
      const priceA = a.promoPrice ?? a.price;
      const priceB = b.promoPrice ?? b.price;
      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      // featured : populaires en stock d'abord
      return (
        Number(Boolean(b.isPopular && b.stock > 0)) -
        Number(Boolean(a.isPopular && a.stock > 0))
      );
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    onlyAvailable,
    maxPriceFilter,
    sortBy,
  ]);

  const isSearchingOrFiltering =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "all" ||
    onlyAvailable ||
    maxPriceFilter !== null;

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setOnlyAvailable(false);
    setMaxPriceFilter(null);
    setSearchQuery("");
    setSortBy("featured");
  };

  const selectCategoryAndScroll = (catId: string) => {
    setSelectedCategory(catId);
    document
      .getElementById("catalogue")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* ===================================================================
          1. BANNIÈRE PRINCIPALE ADAPTÉE AU MODÈLE CHOISI PAR LE COMMERÇANT
         =================================================================== */}
      {sections.showHero && !searchQuery.trim() && (
        <>
          {template === "boutique" && (
            <section
              className="relative overflow-hidden text-white"
              style={{ backgroundColor: primary }}
            >
              {store.settings.bannerUrl && (
                <img
                  src={store.settings.bannerUrl}
                  alt={store.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                />
              )}
              <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-22 lg:px-8">
                <div className="max-w-2xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    Boutique officielle
                  </span>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                    {store.name}
                  </h1>
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base">
                    {store.settings.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="#catalogue"
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-95"
                      style={{ backgroundColor: secondary }}
                    >
                      Découvrir la collection
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    {promoProducts.length > 0 && (
                      <a
                        href="#promotions"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-xs hover:bg-white/20"
                      >
                        Voir les promotions ({promoProducts.length})
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {template === "editorial" && (
            <section className="border-b border-slate-200 bg-white">
              <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: secondary }}
                >
                  Bienvenue chez {store.name}
                </p>
                <h1
                  className="mx-auto mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl"
                  style={{ color: primary }}
                >
                  {store.name}
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  {store.settings.description}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <a
                    href="#catalogue"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: primary }}
                  >
                    Explorer le catalogue
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>

                {store.settings.bannerUrl && (
                  <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
                    <img
                      src={store.settings.bannerUrl}
                      alt={store.name}
                      className="h-56 w-full object-cover sm:h-80"
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {template === "minimal" && (
            <section className="border-b border-slate-200 bg-white">
              <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:px-8">
                <div className="space-y-4 lg:col-span-7">
                  <span
                    className="inline-block rounded-lg px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: secondary }}
                  >
                    Commande rapide & Livraison
                  </span>
                  <h1
                    className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
                    style={{ color: primary }}
                  >
                    {store.name}
                  </h1>
                  <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    {store.settings.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a
                      href="#catalogue"
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-xs"
                      style={{ backgroundColor: primary }}
                    >
                      Parcourir les articles ({products.length})
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  {store.settings.bannerUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      <img
                        src={store.settings.bannerUrl}
                        alt={store.name}
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </div>
                  ) : (
                    heroFeaturedProduct && (
                      <Link
                        href={`/s/${store.slug}/produit/${heroFeaturedProduct.slug}`}
                        className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 transition-shadow hover:shadow-md"
                      >
                        <img
                          src={heroFeaturedProduct.images[0]}
                          alt={heroFeaturedProduct.name}
                          className="h-24 w-24 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            À la une
                          </span>
                          <p className="mt-0.5 truncate text-base font-extrabold text-slate-900">
                            {heroFeaturedProduct.name}
                          </p>
                          <p
                            className="mt-1 text-base font-extrabold"
                            style={{ color: secondary }}
                          >
                            {formatCurrency(
                              heroFeaturedProduct.promoPrice ??
                                heroFeaturedProduct.price,
                              store.currency
                            )}
                          </p>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ===================================================================
          2. PRÉSENTATION DES CATÉGORIES
         =================================================================== */}
      {sections.showCategories &&
        categories.length > 0 &&
        !isSearchingOrFiltering && (
          <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                Explorer par catégorie
              </h2>
              <span className="text-xs font-medium text-slate-400">
                {categories.length} rayon{categories.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.categoryId === cat.id
                ).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategoryAndScroll(cat.id)}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:underline">
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <p
                      className="mt-3 text-xs font-bold"
                      style={{ color: secondary }}
                    >
                      {count} article{count > 1 ? "s" : ""} →
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

      {/* ===================================================================
          3. SÉLECTION DE PRODUITS POPULAIRES
         =================================================================== */}
      {sections.showPopular &&
        popularProducts.length > 0 &&
        !isSearchingOrFiltering && (
          <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color: secondary }}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Meilleures sélections
                </p>
                <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Produits populaires
                </h2>
              </div>
              <a
                href="#catalogue"
                className="text-xs font-bold text-slate-600 hover:text-slate-950"
              >
                Tout voir →
              </a>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {popularProducts.map((p) => (
                <StoreProductCard
                  key={p.id}
                  product={p}
                  store={store}
                  category={categories.find((c) => c.id === p.categoryId)}
                  onAddToCart={(prod) => addToCart(prod)}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          </section>
        )}

      {/* ===================================================================
          4. LES PROMOTIONS (affichées lorsqu'elles existent)
         =================================================================== */}
      {sections.showPromotions &&
        promoProducts.length > 0 &&
        !isSearchingOrFiltering && (
          <section
            id="promotions"
            className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8"
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: secondary }}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    Offres en cours
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    Promotions à saisir
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => selectCategoryAndScroll("promos")}
                  className="text-xs font-bold hover:underline cursor-pointer"
                  style={{ color: primary }}
                >
                  Filtrer toutes les promotions →
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {promoProducts.map((p) => (
                  <StoreProductCard
                    key={p.id}
                    product={p}
                    store={store}
                    category={categories.find((c) => c.id === p.categoryId)}
                    onAddToCart={(prod) => addToCart(prod)}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

      {/* ===================================================================
          5. LES NOUVEAUTÉS
         =================================================================== */}
      {newestProducts.length > 0 && !isSearchingOrFiltering && (
        <section
          id="nouveautes"
          className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Récemment ajoutés
              </p>
              <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Nouveautés
              </h2>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {newestProducts.map((p) => (
              <StoreProductCard
                key={p.id}
                product={p}
                store={store}
                category={categories.find((c) => c.id === p.categoryId)}
                onAddToCart={(prod) => addToCart(prod)}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================
          6. CATALOGUE COMPLET AVEC FILTRES (CATÉGORIE, PRIX, DISPONIBILITÉ)
         =================================================================== */}
      <section
        id="catalogue"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-14 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Catalogue complet
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {filteredCatalog.length} article
              {filteredCatalog.length > 1 ? "s" : ""} affiché
              {filteredCatalog.length > 1 ? "s" : ""}
              {searchQuery.trim() ? ` pour « ${searchQuery} »` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpenMobile((v) => !v)}
              className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 sm:hidden cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtres
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMode)}
              className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Tri : Mis en avant</option>
              <option value="newest">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Pastilles catégories défilables au doigt sur mobile */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className="shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer"
            style={
              selectedCategory === "all"
                ? { backgroundColor: primary, color: "#FFF" }
                : {
                    backgroundColor: "#FFF",
                    color: "#334155",
                    border: "1px solid #E2E8F0",
                  }
            }
          >
            Tous ({products.length})
          </button>

          {promoProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory("promos")}
              className="shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer"
              style={
                selectedCategory === "promos"
                  ? { backgroundColor: secondary, color: "#FFF" }
                  : {
                      backgroundColor: "#FFF",
                      color: "#334155",
                      border: "1px solid #E2E8F0",
                    }
              }
            >
              Promotions ({promoProducts.length})
            </button>
          )}

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className="shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer"
              style={
                selectedCategory === cat.id
                  ? { backgroundColor: primary, color: "#FFF" }
                  : {
                      backgroundColor: "#FFF",
                      color: "#334155",
                      border: "1px solid #E2E8F0",
                    }
              }
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Barre de filtres Prix & Disponibilité */}
        <div
          className={`mt-3 flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs ${
            filtersOpenMobile ? "flex" : "hidden sm:flex"
          }`}
        >
          <div className="flex flex-wrap items-center gap-5">
            <label className="inline-flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              <span>En stock uniquement</span>
            </label>

            {catalogMaxPrice > 0 && (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">
                  Budget max :{" "}
                  <strong style={{ color: primary }}>
                    {formatCurrency(effectiveMaxPrice, store.currency)}
                  </strong>
                </span>
                <input
                  type="range"
                  min={1000}
                  max={catalogMaxPrice}
                  step={500}
                  value={effectiveMaxPrice}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="w-32 accent-slate-900 cursor-pointer sm:w-44"
                />
              </div>
            )}
          </div>

          {isSearchingOrFiltering && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Grille Catalogue 2 colonnes mobile / 4 desktop */}
        <div className="mt-6">
          {filteredCatalog.length === 0 ? (
            <EmptyCatalogState onReset={resetAllFilters} />
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {filteredCatalog.map((p) => (
                <StoreProductCard
                  key={p.id}
                  product={p}
                  store={store}
                  category={categories.find((c) => c.id === p.categoryId)}
                  onAddToCart={(prod) => addToCart(prod)}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================
          7. SECTION PRODUITS RECOMMANDÉS
         =================================================================== */}
      {recommendedProducts.length > 1 && !isSearchingOrFiltering && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Recommandés pour vous
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Sélection d&apos;articles immédiatement disponibles chez{" "}
              {store.name}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {recommendedProducts.map((p) => (
                <StoreProductCard
                  key={p.id}
                  product={p}
                  store={store}
                  category={categories.find((c) => c.id === p.categoryId)}
                  onAddToCart={(prod) => addToCart(prod)}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
