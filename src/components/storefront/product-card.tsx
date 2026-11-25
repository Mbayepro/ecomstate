"use client";

import Link from "next/link";
import React from "react";
import { Eye, Plus, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Category, Product, Store } from "@/types/domain";

export function StoreProductCard({
  product,
  store,
  category,
  onAddToCart,
  onQuickView,
}: {
  product: Product;
  store: Store;
  category?: Category;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}) {
  const primary = store.settings.primaryColor || "#073B35";
  const secondary = store.settings.secondaryColor || "#00A884";
  const template = store.settings.template || "minimal";

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const hasPromo =
    Boolean(product.promoPrice) &&
    Number(product.promoPrice) < product.price;
  const discountPct = hasPromo
    ? Math.round((1 - Number(product.promoPrice) / product.price) * 100)
    : 0;

  const aspectClass =
    template === "boutique" ? "aspect-[4/5]" : "aspect-square";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.06]">
      {/* Visuel produit */}
      <div className={`relative w-full overflow-hidden bg-slate-100 ${aspectClass}`}>
        <Link
          href={`/s/${store.slug}/produit/${product.slug}`}
          className="block h-full w-full"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges supérieurs */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {hasPromo && discountPct > 0 && (
            <span
              className="rounded-lg px-2 py-0.5 text-[11px] font-extrabold text-white shadow-xs"
              style={{ backgroundColor: secondary }}
            >
              -{discountPct} %
            </span>
          )}
          {product.isPopular && !outOfStock && (
            <span className="rounded-lg bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
              Populaire
            </span>
          )}
        </div>

        {/* Bouton Aperçu rapide */}
        <button
          type="button"
          onClick={() => onQuickView(product)}
          aria-label={`Aperçu rapide de ${product.name}`}
          className="absolute right-2.5 top-2.5 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-xs transition-all hover:bg-white hover:text-slate-950 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Bandeau rupture */}
        {outOfStock && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-slate-900/80 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-white">
            Rupture de stock
          </div>
        )}
      </div>

      {/* Informations commerciales */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="truncate font-medium text-slate-400">
              {category?.name ?? "Collection"}
            </span>
            {!outOfStock && (
              <span
                className={`shrink-0 font-semibold ${
                  lowStock ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {lowStock ? `Plus que ${product.stock}` : "Disponible"}
              </span>
            )}
          </div>

          <Link
            href={`/s/${store.slug}/produit/${product.slug}`}
            className="mt-1 line-clamp-2 block text-sm font-bold leading-snug text-slate-900 transition-colors hover:underline sm:text-[15px]"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-3 pt-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span
              className="text-base font-extrabold tracking-tight sm:text-lg"
              style={{ color: primary }}
            >
              {formatCurrency(
                hasPromo ? Number(product.promoPrice) : product.price,
                store.currency
              )}
            </span>
            {hasPromo && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.price, store.currency)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => onAddToCart(product)}
            className="mt-2.5 flex h-9.5 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white shadow-2xs transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 cursor-pointer"
            style={!outOfStock ? { backgroundColor: secondary } : undefined}
          >
            {outOfStock ? (
              <span>Indisponible</span>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Ajouter au panier</span>
                <span className="xs:hidden">Ajouter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export function EmptyCatalogState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
      <h3 className="mt-3 text-base font-bold text-slate-900">
        Aucun article ne correspond à votre recherche
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
        Essayez de modifier vos filtres de prix, de disponibilité ou de
        catégorie pour explorer tous les articles disponibles.
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
