"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useStorefront } from "@/components/storefront/storefront-context";
import { CodDynamicForm } from "@/components/storefront/cod-dynamic-form";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/utils";
import type { Order, Product } from "@/types/domain";

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

  const { getStoreCodForm } = usePlatform();
  const codForm = getStoreCodForm(store.id);

  const primary = store.settings.primaryColor || "#073B35";
  const secondary = store.settings.secondaryColor || "#00A884";

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Quick View states
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

  return (
    <>
      {/* Notification d'ajout au panier */}
      {justAddedToast && !cartOpen && (
        <div className="fixed left-1/2 top-20 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-slate-200 bg-[#15232D] px-4 py-2 text-xs font-semibold text-white shadow-xl">
          <Check className="h-4 w-4 text-[#00A884]" />
          <span className="max-w-48 truncate">{justAddedToast} ajouté</span>
          <button
            type="button"
            onClick={() => {
              setCheckoutStep("cart");
              setCartOpen(true);
            }}
            className="ml-1 text-[#00A884] underline cursor-pointer"
          >
            Commander
          </button>
        </div>
      )}

      {/* Barre flottante Panier COD sur Mobile */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed inset-x-3 bottom-3 z-40 sm:hidden">
          <button
            type="button"
            onClick={() => {
              setCheckoutStep("form");
              setCartOpen(true);
            }}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-white shadow-xl cursor-pointer"
            style={{ backgroundColor: primary }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-extrabold text-white"
                style={{ backgroundColor: secondary }}
              >
                {cartCount}
              </span>
              <span className="text-xs font-bold">
                Finaliser ma commande COD
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-extrabold">
              <span>{formatCurrency(cartSubtotal, store.currency)}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* MODAL APERÇU RAPIDE */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Aperçu rapide · Paiement à la livraison
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

              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#15232D]">
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
                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {quickViewProduct.description}
                  </p>

                  {qvGroups.map((group) => {
                    const current =
                      qvSelectedOptions[group.name] ?? group.values[0];
                    return (
                      <div key={group.name} className="mt-4">
                        <p className="text-xs font-bold text-slate-700">
                          {group.name} : {current}
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
                                className="rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer"
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
                </div>

                <div className="mt-6 space-y-2">
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
                      className="rounded-xl border-2 py-2.5 text-xs font-bold cursor-pointer"
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
                      className="rounded-xl py-2.5 text-xs font-bold text-white cursor-pointer"
                      style={{ backgroundColor: secondary }}
                    >
                      Commander COD
                    </button>
                  </div>
                  <Link
                    href={`/s/${store.slug}/produit/${quickViewProduct.slug}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="block pt-1 text-center text-xs font-semibold text-slate-500 hover:underline"
                  >
                    Ouvrir la fiche complète & les offres packs →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TIROIR PANIER & FORMULAIRE COD PERSONNALISABLE */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[#15232D]">
                  {checkoutStep === "cart"
                    ? `Mon panier (${cartCount})`
                    : checkoutStep === "form"
                    ? "Formulaire de commande COD"
                    : "Confirmation de commande"}
                </h2>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {checkoutStep !== "done" && cart.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("cart")}
                    className="rounded-full py-1 text-center cursor-pointer"
                    style={{
                      backgroundColor:
                        checkoutStep === "cart" ? primary : "#F1F5F9",
                      color: checkoutStep === "cart" ? "#FFF" : "#64748B",
                    }}
                  >
                    1. Panier ({cartCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("form")}
                    className="rounded-full py-1 text-center cursor-pointer"
                    style={{
                      backgroundColor:
                        checkoutStep === "form" ? secondary : "#F1F5F9",
                      color: checkoutStep === "form" ? "#FFF" : "#64748B",
                    }}
                  >
                    2. Livraison COD
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {checkoutStep === "cart" && (
                <>
                  {cart.length === 0 ? (
                    <div className="py-16 text-center">
                      <ShoppingBag className="mx-auto h-12 w-12 text-slate-200" />
                      <p className="mt-3 text-sm font-bold text-[#15232D]">
                        Votre panier est vide
                      </p>
                      <button
                        type="button"
                        onClick={() => setCartOpen(false)}
                        className="mt-5 rounded-xl px-5 py-2.5 text-xs font-bold text-white cursor-pointer"
                        style={{ backgroundColor: secondary }}
                      >
                        Explorer le catalogue
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {cart.map((item) => (
                        <div
                          key={item.key}
                          className="flex gap-3 rounded-2xl border border-slate-200 p-3"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-16 w-16 shrink-0 rounded-xl object-cover"
                          />
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[#15232D]">
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
                                  className="flex h-7 w-7 items-center justify-center text-slate-700 cursor-pointer"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center text-xs font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.key, +1)}
                                  className="flex h-7 w-7 items-center justify-center text-slate-700 cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => setCheckoutStep("form")}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md cursor-pointer"
                        style={{ backgroundColor: secondary }}
                      >
                        Passer au formulaire de livraison COD
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {checkoutStep === "form" && (
                <CodDynamicForm
                  store={store}
                  fields={codForm.publishedFields}
                  style={codForm.publishedStyle}
                  items={cart.map((c) => ({
                    productId: c.product.id,
                    productName: c.product.name,
                    variantLabel: c.variantLabel,
                    quantity: c.quantity,
                    unitPrice: c.unitPrice,
                    costPrice:
                      (c.product.costPrice ?? 0) +
                      (c.product.additionalCost ?? 0),
                    imageUrl: c.product.images[0],
                  }))}
                  onOrderCreated={(order) => {
                    setConfirmedOrder(order);
                    clearCart();
                    setCheckoutStep("done");
                  }}
                />
              )}

              {checkoutStep === "done" && confirmedOrder && (
                <div className="space-y-4 py-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F7F2] text-[#00A884]">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#15232D]">
                    Merci {confirmedOrder.customerName} !
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Votre commande{" "}
                    <strong className="font-mono text-[#073B35]">
                      {confirmedOrder.orderNumber}
                    </strong>{" "}
                    a bien été transmise. Vous paierez{" "}
                    <strong>
                      {formatCurrency(confirmedOrder.totalAmount, store.currency)}
                    </strong>{" "}
                    directement au livreur à la remise de votre colis.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedOrder(null);
                      setCheckoutStep("cart");
                      setCartOpen(false);
                    }}
                    className="w-full rounded-xl bg-[#073B35] py-3 text-xs font-bold text-white cursor-pointer"
                  >
                    Continuer la visite
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
