"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Mail,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store as StoreIcon,
  Truck,
  X,
} from "lucide-react";
import {
  StorefrontProvider,
  useStorefront,
} from "@/components/storefront/storefront-context";
import { StoreCartAndModals } from "@/components/storefront/cart-drawer";
import { usePlatform } from "@/lib/platform-store";
import {
  getStoreSubscriptionHealth,
  ORDER_STATUS_META,
} from "@/lib/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";

/**
 * Coque publique de la boutique client (Sections 9.16 & 18 du Cahier des charges) :
 * - 100 % Paiement à la livraison (COD)
 * - Zéro redirection WhatsApp de commande
 * - Zéro numéro personnel du propriétaire exposé publiquement
 */
function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const {
    store,
    categories,
    searchQuery,
    setSearchQuery,
    cartCount,
    setCartOpen,
    setCheckoutStep,
  } = useStorefront();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackQuery, setTrackQuery] = useState("");
  const { orders } = usePlatform();

  const trackedOrders = trackQuery.trim()
    ? orders.filter((o) => {
        if (o.storeId !== store.id) return false;
        const q = trackQuery.trim().toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerPhone.replace(/\s+/g, "").includes(q.replace(/\s+/g, ""))
        );
      })
    : [];

  useEffect(() => {
    document.title = `${store.name} — Boutique officielle`;
  }, [store.name]);

  const primary = store.settings.primaryColor || "#073B35";
  const secondary = store.settings.secondaryColor || "#00A884";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#15232D]">
      {/* Barre supérieure : Livraison COD & Suivi de commande en ligne */}
      <div
        className="px-4 py-2 text-xs text-white"
        style={{ backgroundColor: primary }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="flex items-center gap-1.5 truncate font-medium text-white/95">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{store.settings.deliveryInfo}</span>
          </p>
          <button
            type="button"
            onClick={() => setTrackModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-white hover:underline cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Suivre ma commande
          </button>
        </div>
      </div>

      {/* EN-TÊTE BOUTIQUE */}
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden cursor-pointer"
              aria-label="Ouvrir le menu de la boutique"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href={`/s/${store.slug}`}
              className="flex min-w-0 items-center gap-2.5"
            >
              {store.settings.logoUrl ? (
                <img
                  src={store.settings.logoUrl}
                  alt={store.name}
                  className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-2xs"
                  style={{ backgroundColor: primary }}
                >
                  {store.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-base font-extrabold tracking-tight text-[#15232D] sm:text-lg">
                  {store.name}
                </p>
                <p className="hidden truncate text-[11px] text-slate-400 sm:block">
                  Paiement à la livraison
                </p>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 lg:flex">
            <Link
              href={`/s/${store.slug}`}
              className="transition-colors hover:text-[#15232D]"
            >
              Accueil
            </Link>
            <a
              href={`/s/${store.slug}#catalogue`}
              className="transition-colors hover:text-[#15232D]"
            >
              Catalogue
            </a>
            <button
              type="button"
              onClick={() => setTrackModalOpen(true)}
              className="transition-colors hover:text-[#15232D] cursor-pointer"
            >
              Suivi de commande
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden w-64 md:block lg:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un article..."
                className="h-9.5 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-medium text-[#15232D] placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden cursor-pointer"
              aria-label="Rechercher"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCheckoutStep("cart");
                setCartOpen(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-95 sm:px-4 cursor-pointer"
              style={{ backgroundColor: secondary }}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Panier COD</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1.5 text-[11px] font-extrabold">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-2.5 md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Que recherchez-vous ?"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-base focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </header>

      {/* Menu latéral Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-950/50 backdrop-blur-xs lg:hidden">
          <div className="flex h-full w-72 flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="font-extrabold text-[#15232D]">{store.name}</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 space-y-4 overflow-y-auto text-sm">
              <div className="space-y-1">
                <Link
                  href={`/s/${store.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 font-semibold text-[#15232D] hover:bg-slate-50"
                >
                  Accueil de la boutique
                </Link>
                <a
                  href={`/s/${store.slug}#catalogue`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Tout le catalogue
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTrackModalOpen(true);
                  }}
                  className="block w-full rounded-xl px-3 py-2.5 text-left font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Suivre ma commande
                </button>
              </div>

              {categories.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Rayons & Catégories
                  </p>
                  <div className="mt-2 space-y-1">
                    {categories.map((cat) => (
                      <a
                        key={cat.id}
                        href={`/s/${store.slug}#catalogue`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#15232D]"
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <main className="flex-1">{children}</main>

      {/* Bandeau de réassurance COD */}
      <section className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: primary }}
            >
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#15232D]">
                Livraison à domicile suivie
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {store.settings.deliveryInfo}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: secondary }}
            >
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#15232D]">
                Paiement 100 % à la livraison
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Aucun prépaiement requis en ligne : vous réglez à la remise du
                colis.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: primary }}
            >
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#15232D]">
                Suivi de commande transparent
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Consultez l&apos;étape exacte de préparation et de livraison
                avec votre numéro de commande.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PIED DE PAGE (Zéro numéro personnel du propriétaire affiché publiquement) */}
      <footer
        id="contact-boutique"
        className="border-t border-slate-200 bg-[#15232D] pb-20 text-slate-300 sm:pb-0"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {store.settings.logoUrl ? (
                <img
                  src={store.settings.logoUrl}
                  alt={store.name}
                  className="h-9 w-9 rounded-lg object-cover"
                />
              ) : (
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                  style={{ backgroundColor: secondary }}
                >
                  {store.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="text-base font-extrabold text-white">
                {store.name}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {store.settings.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Informations & Livraison
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>{store.settings.address}</span>
              </li>
              {store.settings.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>{store.settings.email}</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Conditions & Garanties COD
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              {store.settings.termsOfSale}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {store.settings.socials.instagram && (
                <a
                  href={store.settings.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Instagram
                </a>
              )}
              {store.settings.socials.facebook && (
                <a
                  href={store.settings.socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Facebook
                </a>
              )}
              {store.settings.socials.tiktok && (
                <a
                  href={store.settings.socials.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                >
                  TikTok
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-4 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} {store.name} · Propulsé par{" "}
          <Link href="/" className="font-semibold text-white hover:underline">
            EcomSate
          </Link>
        </div>
      </footer>

      <StoreCartAndModals />

      {/* Modal Suivi de Commande Client */}
      {trackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-base font-extrabold text-[#15232D]">
                  Suivre ma commande
                </h3>
                <p className="text-xs text-slate-500">
                  Saisissez votre N° de commande ou votre téléphone de livraison
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Ex : ES-261123-4821 ou téléphone"
                className="h-10.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-[#15232D] focus:border-[#00A884] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
              {!trackQuery.trim() ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  Entrez votre référence ci-dessus pour consulter l&apos;état de
                  préparation et de livraison.
                </p>
              ) : trackedOrders.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">
                  Aucune commande trouvée pour « {trackQuery} ».
                </p>
              ) : (
                trackedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#15232D]">
                        {ord.orderNumber}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                        style={{ backgroundColor: secondary }}
                      >
                        {ORDER_STATUS_META[ord.status]?.label ?? ord.status}
                      </span>
                    </div>
                    <p className="mt-1 font-semibold text-[#15232D]">
                      {ord.customerName} ·{" "}
                      {formatCurrency(ord.totalAmount, store.currency)} (COD)
                    </p>
                    <p className="mt-0.5 text-slate-500">
                      Livraison : {ord.deliveryAddress} ({formatDate(ord.createdAt)})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StorefrontClientShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { stores } = usePlatform();
  const store = stores.find((s) => s.slug === slug);

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <StoreIcon className="h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-extrabold text-[#15232D]">
          Boutique introuvable
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          L&apos;adresse <code>{slug}</code> ne correspond à aucune boutique
          active sur EcomSate.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-[#073B35] px-5 py-2.5 text-sm font-bold text-white"
        >
          Découvrir EcomSate
        </Link>
      </div>
    );
  }

  const subHealth = getStoreSubscriptionHealth(store);

  if (store.status === "suspended" || subHealth.isExpired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <StoreIcon className="h-12 w-12 text-[#F4A340]" />
        <h1 className="mt-4 text-2xl font-extrabold text-[#15232D]">
          {store.name} est temporairement indisponible
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Cette boutique est actuellement suspendue ou en attente de
          renouvellement d&apos;abonnement.
        </p>
      </div>
    );
  }

  return (
    <StorefrontProvider slug={slug}>
      <StorefrontChrome>{children}</StorefrontChrome>
    </StorefrontProvider>
  );
}
