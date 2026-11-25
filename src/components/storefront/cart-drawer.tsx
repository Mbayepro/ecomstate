"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Smartphone,
  Store as StoreIcon,
  Tag,
  Trash2,

  Truck,
  X,
} from "lucide-react";
import { useStorefront } from "@/components/storefront/storefront-context";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/utils";
import type { Order, PaymentMethodCode, Product } from "@/types/domain";

/**
 * Regroupe les variantes d'un produit par nom d'attribut (ex: Taille -> [M, L], Couleur -> [Noir, Blanc])
 */
export function groupProductVariants(product: Product) {
  const groups = new Map<string, string[]>();
  for (const v of product.variants) {
    const prev = groups.get(v.name) ?? [];
    if (!prev.includes(v.value)) {
      groups.set(v.name, [...prev, v.value]);
    }
  }
  return Array.from(groups.entries()).map(([name, values]) => ({
    name,
    values,
  }));
}

export function StoreCartAndModals() {
  const {
    store,
    cart,
    cartCount,
    cartSubtotal,
    cartOpen,
    setCartOpen,
    checkoutStep,
    setCheckoutStep,
    quickViewProduct,
    setQuickViewProduct,
    justAddedToast,
    addToCart,
    updateCartQty,
    removeCartItem,
    clearCart,
  } = useStorefront();

  const { placeOrder, promoCodes } = usePlatform();

  const primary = store.settings.primaryColor || "#102A43";
  const secondary = store.settings.secondaryColor || "#10B981";

  // Mode de livraison (domicile vs retrait en boutique) & Zones configurées par le commerçant
  const deliveryZones = useMemo(() => {
    const configured = store.settings.deliveryZones ?? [];
    if (configured.length > 0) return configured;
    return [
      {
        id: "default-zone",
        name: "Livraison standard",
        fee: 1500,
        estimatedDelay: "24h - 48h",
      },
    ];
  }, [store.settings.deliveryZones]);

  const [deliveryMode, setDeliveryMode] = useState<"home" | "pickup">("home");
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    deliveryZones[0]?.id ?? "default-zone"
  );

  const selectedZone =
    deliveryZones.find((z) => z.id === selectedZoneId) ?? deliveryZones[0];

  // Code promo client isolé à cette boutique
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const activePromo = useMemo(() => {
    if (!appliedPromoCode) return null;
    const found = (promoCodes ?? []).find(
      (p) =>
        p.storeId === store.id &&
        p.code.toUpperCase() === appliedPromoCode.toUpperCase() &&
        p.isActive
    );
    if (!found) return null;
    if (found.minOrderAmount > cartSubtotal) return null;
    if (found.maxUses !== null && found.usedCount >= found.maxUses) return null;
    if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
      return null;
    }
    return found;
  }, [appliedPromoCode, promoCodes, store.id, cartSubtotal]);

  const discountAmount = useMemo(() => {
    if (!activePromo) return 0;
    if (activePromo.discountType === "percent") {
      return Math.round((cartSubtotal * activePromo.discountValue) / 100);
    }
    return Math.min(cartSubtotal, activePromo.discountValue);
  }, [activePromo, cartSubtotal]);

  const netMerchandise = Math.max(0, cartSubtotal - discountAmount);
  const freeThreshold = store.settings.freeDeliveryThreshold ?? null;
  const qualifiesFreeDelivery =
    freeThreshold !== null && freeThreshold > 0 && netMerchandise >= freeThreshold;

  const deliveryFee =
    deliveryMode === "pickup"
      ? 0
      : qualifiesFreeDelivery
        ? 0
        : (selectedZone?.fee ?? 1500);

  const orderTotal = Math.max(0, netMerchandise + deliveryFee);


  const handleApplyPromo = () => {
    setPromoError(null);
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;
    const found = (promoCodes ?? []).find(
      (p) => p.storeId === store.id && p.code.toUpperCase() === clean
    );
    if (!found || !found.isActive) {
      setPromoError("Code promo invalide ou inactif dans cette boutique.");
      return;
    }
    if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
      setPromoError("Ce code promo a expiré.");
      return;
    }
    if (found.maxUses !== null && found.usedCount >= found.maxUses) {
      setPromoError("Ce code promo a atteint sa limite d'utilisations.");
      return;
    }
    if (cartSubtotal < found.minOrderAmount) {
      setPromoError(
        `Achat minimum requis : ${formatCurrency(
          found.minOrderAmount,
          store.currency
        )}.`
      );
      return;
    }
    setAppliedPromoCode(found.code);
    setPromoInput("");
  };


  // Formulaire client optimisé mobile
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodCode>("cash_on_delivery");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // États Quick View
  const [qvImgIdx, setQvImgIdx] = useState(0);
  const [qvQty, setQvQty] = useState(1);
  const [qvSelectedOptions, setQvSelectedOptions] = useState<
    Record<string, string>
  >({});

  const qvGroups = useMemo(
    () => (quickViewProduct ? groupProductVariants(quickViewProduct) : []),
    [quickViewProduct]
  );

  const resolveQvVariantLabel = () => {
    if (!quickViewProduct || qvGroups.length === 0) return undefined;
    return qvGroups
      .map((g) => `${g.name} : ${qvSelectedOptions[g.name] ?? g.values[0]}`)
      .join(" · ");
  };

  const buildWhatsappUrl = (order: Order) => {
    const cleanPhone = store.settings.whatsappPhone.replace(/[^\d]/g, "");
    const lines = [
      `Bonjour *${store.name}*, voici ma commande *${order.orderNumber}* :`,
      ...order.items.map(
        (i) =>
          `• ${i.quantity}x ${i.productName}${
            i.variantLabel ? ` (${i.variantLabel})` : ""
          } — ${formatCurrency(i.totalPrice, store.currency)}`
      ),
      `Livraison : ${
        deliveryMode === "pickup"
          ? "Retrait en boutique (0 FCFA)"
          : `${order.deliveryAddress}, ${order.deliveryCity} (${formatCurrency(
              order.deliveryFee,
              store.currency
            )})`
      }`,
      ...(order.promoCode && order.discountAmount
        ? [
            `Code promo (${order.promoCode}) : -${formatCurrency(
              order.discountAmount,
              store.currency
            )}`,
          ]
        : []),
      `*Total à régler : ${formatCurrency(order.totalAmount, store.currency)}*`,

      `Client : ${order.customerName} (${order.customerPhone})`,
    ];
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const finalAddress =
      deliveryMode === "pickup"
        ? `Retrait en boutique (${store.settings.address})`
        : deliveryAddress.trim();

    const order = placeOrder({
      storeId: store.id,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress: finalAddress,
      deliveryCity:
        deliveryMode === "home"
          ? deliveryCity.trim() || selectedZone?.name || store.settings.address
          : store.settings.address,
      paymentMethod,

      paymentReference,
      notes,
      deliveryFee,
      promoCode: activePromo?.code,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      items: cart.map((c) => ({

        productId: c.product.id,
        productName: c.product.name,
        variantLabel: c.variantLabel,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        imageUrl: c.product.images[0],
      })),
    });

    setConfirmedOrder(order);
    setAppliedPromoCode(null);
    setPromoInput("");
    setPromoError(null);
    clearCart();
    setCheckoutStep("done");


    // Si le client choisit "Commande via WhatsApp", ouvrir WhatsApp directement
    if (paymentMethod === "whatsapp_order") {
      const waUrl = buildWhatsappUrl(order);
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {/* Notification discrète d'ajout au panier */}
      {justAddedToast && !cartOpen && (
        <div className="animate-fade-up fixed left-1/2 top-20 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xl">
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="max-w-48 truncate">{justAddedToast} ajouté</span>
          <button
            type="button"
            onClick={() => {
              setCheckoutStep("cart");
              setCartOpen(true);
            }}
            className="ml-1 underline text-emerald-400 cursor-pointer"
          >
            Voir le panier
          </button>
        </div>
      )}

      {/* Barre flottante Panier sur Mobile (ergonomie Android / connexion rapide) */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed inset-x-3 bottom-3 z-40 sm:hidden">
          <button
            type="button"
            onClick={() => {
              setCheckoutStep("cart");
              setCartOpen(true);
            }}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-white shadow-xl active:scale-[0.99] cursor-pointer"
            style={{ backgroundColor: primary }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-extrabold text-white"
                style={{ backgroundColor: secondary }}
              >
                {cartCount}
              </span>
              <span className="text-xs font-bold">Voir mon panier</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-extrabold">
              <span>{formatCurrency(cartSubtotal, store.currency)}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* MODAL APERÇU RAPIDE (QUICK VIEW) */}
      {quickViewProduct && (
        <div className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="animate-modal-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Aperçu rapide
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuickViewProduct(null);
                  setQvImgIdx(0);
                  setQvQty(1);
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                  <img
                    src={
                      quickViewProduct.images[qvImgIdx] ||
                      quickViewProduct.images[0]
                    }
                    alt={quickViewProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {quickViewProduct.images.length > 1 && (
                  <div className="mt-2.5 flex gap-2 overflow-x-auto">
                    {quickViewProduct.images.map((img, i) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => setQvImgIdx(i)}
                        className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 cursor-pointer ${
                          qvImgIdx === i
                            ? "border-slate-900"
                            : "border-transparent opacity-70"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {quickViewProduct.name}
                  </h2>

                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span
                      className="text-2xl font-extrabold"
                      style={{ color: primary }}
                    >
                      {formatCurrency(
                        quickViewProduct.promoPrice ?? quickViewProduct.price,
                        store.currency
                      )}
                    </span>
                    {quickViewProduct.promoPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatCurrency(quickViewProduct.price, store.currency)}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {quickViewProduct.description}
                  </p>

                  {/* Variantes groupées */}
                  {qvGroups.map((group) => {
                    const current =
                      qvSelectedOptions[group.name] ?? group.values[0];
                    return (
                      <div key={group.name} className="mt-4">
                        <p className="text-xs font-bold text-slate-700">
                          {group.name} :{" "}
                          <span className="font-normal text-slate-500">
                            {current}
                          </span>
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {group.values.map((val) => {
                            const selected = current === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() =>
                                  setQvSelectedOptions((prev) => ({
                                    ...prev,
                                    [group.name]: val,
                                  }))
                                }
                                className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                                style={
                                  selected
                                    ? {
                                        borderColor: primary,
                                        backgroundColor: primary,
                                        color: "#fff",
                                      }
                                    : {
                                        borderColor: "#E2E8F0",
                                        color: "#334155",
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

                  {/* Quantité */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">
                      Quantité :
                    </span>
                    <div className="inline-flex items-center rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setQvQty((q) => Math.max(1, q - 1))}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">
                        {qvQty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQvQty((q) =>
                            Math.min(quickViewProduct.stock || 1, q + 1)
                          )
                        }
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={quickViewProduct.stock <= 0}
                      onClick={() =>
                        addToCart(quickViewProduct, {
                          variantLabel: resolveQvVariantLabel(),
                          quantity: qvQty,
                          openDrawer: true,
                        })
                      }
                      className="rounded-xl border-2 py-2.5 text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
                      style={{ borderColor: primary, color: primary }}
                    >
                      Ajouter au panier
                    </button>

                    <button
                      type="button"
                      disabled={quickViewProduct.stock <= 0}
                      onClick={() =>
                        addToCart(quickViewProduct, {
                          variantLabel: resolveQvVariantLabel(),
                          quantity: qvQty,
                          goToCheckout: true,
                        })
                      }
                      className="rounded-xl py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-40 cursor-pointer"
                      style={{ backgroundColor: secondary }}
                    >
                      Commander
                    </button>
                  </div>

                  <Link
                    href={`/s/${store.slug}/produit/${quickViewProduct.slug}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="block pt-1 text-center text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline"
                  >
                    Voir la fiche complète du produit →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TIROIR PANIER & TUNNEL DE COMMANDE */}
      {cartOpen && (
        <div className="animate-backdrop fixed inset-0 z-50 flex justify-end bg-slate-950/55 backdrop-blur-xs">
          <div className="animate-drawer-in flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            {/* En-tête du tiroir avec progression */}
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900">
                  {checkoutStep === "cart"
                    ? `Mon panier (${cartCount})`
                    : checkoutStep === "form"
                    ? "Informations de livraison"
                    : "Commande enregistrée"}
                </h2>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  aria-label="Fermer le panier"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {checkoutStep !== "done" && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold">
                  <div
                    className="rounded-full py-1 text-center"
                    style={{
                      backgroundColor:
                        checkoutStep === "cart" ? primary : "#F1F5F9",
                      color: checkoutStep === "cart" ? "#FFF" : "#64748B",
                    }}
                  >
                    1. Panier
                  </div>
                  <div
                    className="rounded-full py-1 text-center"
                    style={{
                      backgroundColor:
                        checkoutStep === "form" ? primary : "#F1F5F9",
                      color: checkoutStep === "form" ? "#FFF" : "#64748B",
                    }}
                  >
                    2. Livraison & Validation
                  </div>
                </div>
              )}
            </div>

            {/* Contenu scrollable */}
            <div
              key={checkoutStep}
              className="animate-tab-panel flex-1 overflow-y-auto p-5"
            >
              {checkoutStep === "cart" && (
                <>
                  {cart.length === 0 ? (
                    <div className="py-16 text-center">
                      <ShoppingBag className="mx-auto h-12 w-12 text-slate-200" />
                      <p className="mt-3 text-sm font-bold text-slate-800">
                        Votre panier est vide
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Parcourez le catalogue de {store.name} pour ajouter vos
                        articles préférés.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCartOpen(false)}
                        className="mt-5 rounded-xl px-5 py-2.5 text-xs font-bold text-white cursor-pointer"
                        style={{ backgroundColor: secondary }}
                      >
                        Continuer mes achats
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {cart.map((item) => (
                        <div
                          key={item.key}
                          className="flex gap-3 rounded-2xl border border-slate-200 p-3"
                        >
                          <Link
                            href={`/s/${store.slug}/produit/${item.product.slug}`}
                            onClick={() => setCartOpen(false)}
                            className="h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                          >
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          </Link>

                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {item.product.name}
                                </p>
                                {item.variantLabel && (
                                  <p className="text-[11px] text-slate-500">
                                    {item.variantLabel}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCartItem(item.key)}
                                className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                aria-label="Supprimer l'article"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <span
                                className="text-sm font-extrabold"
                                style={{ color: primary }}
                              >
                                {formatCurrency(
                                  item.unitPrice * item.quantity,
                                  store.currency
                                )}
                              </span>

                              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.key, -1)}
                                  className="flex h-7 w-7 items-center justify-center text-slate-700 hover:bg-white cursor-pointer"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center text-xs font-bold text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.key, +1)}
                                  className="flex h-7 w-7 items-center justify-center text-slate-700 hover:bg-white cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {checkoutStep === "form" && (
                <form
                  id="store-checkout-form"
                  onSubmit={handleCheckoutSubmit}
                  className="space-y-4"
                >
                  {/* Choix du mode de réception */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Mode de réception
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMode("home")}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left text-xs transition-colors cursor-pointer ${
                          deliveryMode === "home"
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Truck className="h-3.5 w-3.5" />
                          Livraison
                        </span>
                        <span className="mt-0.5 text-[11px] text-slate-500">
                          {qualifiesFreeDelivery
                            ? "Offerte !"
                            : formatCurrency(
                                selectedZone?.fee ?? 1500,
                                store.currency
                              )}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMode("pickup")}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left text-xs transition-colors cursor-pointer ${
                          deliveryMode === "pickup"
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-bold text-slate-900">
                          <StoreIcon className="h-3.5 w-3.5" />
                          Retrait boutique
                        </span>
                        <span className="mt-0.5 text-[11px] text-emerald-600 font-semibold">
                          Gratuit
                        </span>
                      </button>
                    </div>

                    {/* Sélecteur de zone / ville de livraison */}
                    {deliveryMode === "home" && (
                      <div className="pt-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Choisissez votre zone / ville de livraison *
                        </label>
                        <select
                          value={selectedZone?.id ?? ""}
                          onChange={(e) => {
                            const nextId = e.target.value;
                            setSelectedZoneId(nextId);
                            const matched = deliveryZones.find(
                              (z) => z.id === nextId
                            );
                            if (matched) {
                              setDeliveryCity(matched.name);
                            }
                          }}
                          className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                        >
                          {deliveryZones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name} —{" "}
                              {qualifiesFreeDelivery
                                ? "Gratuit"
                                : formatCurrency(zone.fee, store.currency)}
                              {zone.estimatedDelay
                                ? ` (${zone.estimatedDelay})`
                                : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>


                  {/* Coordonnées client (taille 16px sur mobile pour éviter le zoom forcé) */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700">
                        Nom complet *
                      </label>
                      <input
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Awa Diop"
                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-base sm:text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700">
                          Téléphone (WhatsApp) *
                        </label>
                        <input
                          required
                          type="tel"
                          inputMode="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+221 77 000 00 00"
                          className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-base sm:text-sm focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700">
                          Ville *
                        </label>
                        <input
                          required
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          placeholder="Dakar, Cotonou, Abidjan..."
                          className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-base sm:text-sm focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {deliveryMode === "home" ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-700">
                          Quartier / Adresse précise *
                        </label>
                        <input
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Quartier, rue, repère connu..."
                          className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-base sm:text-sm focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        <span>
                          Adresse de retrait :{" "}
                          <strong className="text-slate-900">
                            {store.settings.address}
                          </strong>
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700">
                        E-mail (optionnel)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Pour recevoir le reçu"
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3.5 text-base sm:text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Moyens de paiement existants préservés */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Moyen de commande / paiement
                    </label>
                    {(
                      [
                        [
                          "cash_on_delivery",
                          "Paiement à la livraison",
                          "Réglez en espèces ou mobile money à la réception.",
                          Truck,
                        ],
                        [
                          "whatsapp_order",
                          "Commander via WhatsApp",
                          "Enregistre la commande et ouvre WhatsApp directement.",
                          MessageCircle,
                        ],
                        [
                          "manual_mobile_money",
                          "Mobile Money",
                          store.settings.mobileMoneyNumber ||
                            "Transfert mobile money avec confirmation vendeur.",
                          Smartphone,
                        ],
                      ] as const
                    ).map(([code, title, desc, Icon]) => (
                      <label
                        key={code}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                          paymentMethod === code
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === code}
                          onChange={() => setPaymentMethod(code)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-900 sm:text-sm">
                            <Icon className="h-4 w-4 shrink-0" />
                            {title}
                          </p>
                          <p className="text-[11px] text-slate-500">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === "manual_mobile_money" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">
                      <p className="font-bold">
                        Numéro : {store.settings.mobileMoneyNumber}
                      </p>
                      <p className="mt-1 text-amber-800">
                        {store.settings.mobileMoneyInstructions ||
                          "Effectuez le transfert puis indiquez la référence ci-dessous."}
                      </p>
                      <input
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Référence du transfert (ex: WV-882910)"
                        className="mt-2 h-10 w-full rounded-lg border border-amber-300 bg-white px-3 text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Instructions pour le livreur (optionnel)
                    </label>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Appeler 10 min avant d'arriver"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3.5 text-base sm:text-sm"
                    />
                  </div>

                  {/* Récapitulatif clair avant validation */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                    <p className="mb-2 font-bold text-slate-800">
                      Récapitulatif ({cartCount} article
                      {cartCount > 1 ? "s" : ""})
                    </p>
                    <div className="space-y-1 text-slate-600">
                      {cart.map((c) => (
                        <div key={c.key} className="flex justify-between gap-2">
                          <span className="truncate">
                            {c.quantity}× {c.product.name}
                          </span>
                          <span className="shrink-0 font-semibold text-slate-800">
                            {formatCurrency(
                              c.unitPrice * c.quantity,
                              store.currency
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {checkoutStep === "done" && confirmedOrder && (
                <div className="py-6 text-center">
                  <div
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${secondary}18` }}
                  >
                    <CheckCircle2
                      className="h-9 w-9"
                      style={{ color: secondary }}
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                    Merci {confirmedOrder.customerName} !
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600">
                    Votre commande{" "}
                    <strong className="font-mono text-slate-900">
                      {confirmedOrder.orderNumber}
                    </strong>{" "}
                    a bien été reçue par <strong>{store.name}</strong>.
                  </p>

                  <div className="mt-5 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Montant total</span>
                      <strong className="text-sm text-slate-900">
                        {formatCurrency(
                          confirmedOrder.totalAmount,
                          store.currency
                        )}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Téléphone</span>
                      <span>{confirmedOrder.customerPhone}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="shrink-0 text-slate-500">Adresse</span>
                      <span className="text-right">
                        {confirmedOrder.deliveryAddress},{" "}
                        {confirmedOrder.deliveryCity}
                      </span>
                    </div>
                  </div>

                  <a
                    href={buildWhatsappUrl(confirmedOrder)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:opacity-95"
                  >
                    <MessageCircle className="h-4.5 w-4.5" />
                    Envoyer le récapitulatif sur WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutStep("cart");
                    }}
                    className="mt-3 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Retourner à la boutique
                  </button>
                </div>
              )}
            </div>

            {/* Pied fixe du tiroir avec code promo & calcul automatique du total */}
            {checkoutStep !== "done" && cart.length > 0 && (
              <div className="border-t border-slate-200 bg-white p-5">
                {/* Barre motivante livraison gratuite */}
                {deliveryMode === "home" && freeThreshold && freeThreshold > 0 && (
                  <div className="mb-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-2 text-[11px]">
                    {qualifiesFreeDelivery ? (
                      <p className="font-bold text-emerald-800">
                        Livraison offerte débloquée sur votre commande !
                      </p>
                    ) : (
                      <p className="font-medium text-emerald-900">
                        Ajoutez encore{" "}
                        <strong>
                          {formatCurrency(
                            freeThreshold - netMerchandise,
                            store.currency
                          )}
                        </strong>{" "}
                        pour profiter de la livraison gratuite !
                      </p>
                    )}
                  </div>
                )}

                {/* Champ Code Promo */}

                <div className="mb-3.5">
                  {activePromo ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800">
                        <Tag className="h-3.5 w-3.5 text-[#10B981]" />
                        Code {activePromo.code} appliqué (-
                        {formatCurrency(discountAmount, store.currency)})
                      </span>
                      <button
                        type="button"
                        onClick={() => setAppliedPromoCode(null)}
                        className="font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) =>
                            setPromoInput(e.target.value.toUpperCase())
                          }
                          placeholder="Code promo (ex: BIENVENUE10)"
                          className="h-9.5 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold uppercase text-slate-900 placeholder:normal-case placeholder:font-normal focus:border-slate-900 focus:bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                        >
                          Appliquer
                        </button>
                      </div>
                      {promoError && (
                        <p className="mt-1 text-[11px] font-medium text-rose-600">
                          {promoError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Sous-total</span>
                    <span>{formatCurrency(cartSubtotal, store.currency)}</span>
                  </div>
                  {discountAmount > 0 && activePromo && (
                    <div className="flex justify-between font-semibold text-[#10B981]">
                      <span>Réduction ({activePromo.code})</span>
                      <span>
                        -{formatCurrency(discountAmount, store.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">

                    <span>
                      {deliveryMode === "pickup"
                        ? "Retrait en boutique"
                        : "Frais de livraison"}
                    </span>
                    <span>
                      {deliveryFee === 0
                        ? "Gratuit"
                        : formatCurrency(deliveryFee, store.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-extrabold text-slate-900">
                    <span>Total à payer</span>
                    <span style={{ color: primary }}>
                      {formatCurrency(orderTotal, store.currency)}
                    </span>
                  </div>
                </div>

                {checkoutStep === "cart" ? (
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("form")}
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: secondary }}
                  >
                    <span>Commander maintenant</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="mt-4 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("cart")}
                      className="h-12 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      form="store-checkout-form"
                      className="h-12 flex-1 rounded-xl text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95 cursor-pointer"
                      style={{ backgroundColor: secondary }}
                    >
                      Valider ma commande
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
