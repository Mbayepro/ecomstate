"use client";

import React, { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useStorefront } from "@/components/storefront/storefront-context";
import {
  EmptyCatalogState,
  StoreProductCard,
} from "@/components/storefront/product-card";
import { ShrineSectionsRenderer } from "@/components/storefront/shrine-sections";
import { createDefaultShrineSections } from "@/lib/shrine-themes";
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

  const primary = store.settings.primaryColor || "#073B35";
  const secondary = store.settings.secondaryColor || "#00A884";

  const builderSections = useMemo(() => {
    if (
      store.settings.builderSections &&
      store.settings.builderSections.length > 0
    ) {
      return store.settings.builderSections;
    }
    return createDefaultShrineSections(store.name, store.settings.template);
  }, [store.name, store.settings.builderSections, store.settings.template]);

  const catalogMaxPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(...products.map((p) => p.promoPrice ?? p.price));
  }, [products]);

  const effectiveMaxPrice = maxPriceFilter ?? catalogMaxPrice;

  const promoProducts = useMemo(
    () =>
      products.filter(
        (p) => Boolean(p.promoPrice) && Number(p.promoPrice) < p.price
      ),
    [products]
  );

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

  const catalogSectionNode = (
    <section
      id="catalogue"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-12 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#15232D]">
            Catalogue disponible
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {filteredCatalog.length} article
            {filteredCatalog.length > 1 ? "s" : ""} · Paiement 100 % à la
            livraison
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
            className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#15232D] focus:outline-none cursor-pointer"
          >
            <option value="featured">Tri : Mis en avant</option>
            <option value="newest">Plus récents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* Pastilles catégories */}
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

      {/* Filtres disponibilité & budget */}
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
              className="h-4 w-4 rounded accent-[#00A884]"
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
                className="w-32 accent-[#073B35] cursor-pointer sm:w-44"
              />
            </div>
          )}
        </div>

        {isSearchingOrFiltering && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="font-bold text-slate-500 hover:text-[#15232D] cursor-pointer"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Grille produits */}
      <div className="mt-6">
        {filteredCatalog.length === 0 ? (
          <EmptyCatalogState
            onReset={resetAllFilters}
            storeTotalProducts={products.length}
            isSearchingOrFiltering={isSearchingOrFiltering}
          />
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
  );

  if (searchQuery.trim()) {
    return catalogSectionNode;
  }

  return (
    <ShrineSectionsRenderer
      store={store}
      sections={builderSections}
      categories={categories}
      products={products}
      onSelectCategory={selectCategoryAndScroll}
      catalogSlot={catalogSectionNode}
    />
  );
}
