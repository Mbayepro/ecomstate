"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import { canStoreAcceptLiveOrders } from "@/lib/permissions";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/utils";
import type {
  CodFormField,
  CodFormStyle,
  Order,
  Product,
  Store,
} from "@/types/domain";

export interface CodDynamicFormProps {
  store: Store;
  fields: CodFormField[];
  style: CodFormStyle;
  items: {
    productId: string;
    productName: string;
    variantLabel?: string;
    quantity: number;
    unitPrice: number;
    costPrice?: number;
    imageUrl?: string;
  }[];
  singleProduct?: Product;
  selectedVariantLabel?: string;
  previewMode?: boolean;
  onOrderCreated?: (order: Order) => void;
}

const RADIUS_MAP: Record<CodFormStyle["borderRadius"], string> = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
};

export function CodDynamicForm({
  store,
  fields,
  style,
  items,
  singleProduct,
  selectedVariantLabel,
  previewMode = false,
  onOrderCreated,
}: CodDynamicFormProps) {
  const { placeOrder, promoCodes } = usePlatform();
  const salesUnlocked = canStoreAcceptLiveOrders(store);

  const deliveryZones = useMemo(() => {
    const zones = store.settings.deliveryZones ?? [];
    if (zones.length > 0) return zones;
    return [
      {
        id: "default-cod-zone",
        name: "Livraison à domicile standard",
        fee: 1500,
        estimatedDelay: "24h - 48h",
      },
    ];
  }, [store.settings.deliveryZones]);

  const [selectedZoneId, setSelectedZoneId] = useState(
    deliveryZones[0]?.id ?? "default-cod-zone"
  );
  const [packQty, setPackQty] = useState<1 | 2 | 3>(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const visibleFields = useMemo(
    () =>
      fields
        .filter((f) => f.visible)
        .sort((a, b) => a.order - b.order)
        .filter((f) => {
          if (!f.conditionalFieldName) return true;
          const depVal = (values[f.conditionalFieldName] ?? "").trim();
          if (!f.conditionalEquals) return Boolean(depVal);
          return depVal.toLowerCase() === f.conditionalEquals.toLowerCase();
        }),
    [fields, values]
  );

  // Calcul des articles effectifs (supporte les Packs 1x / 2x -5% / 3x -10% sur fiche produit)
  const effectiveItems = useMemo(() => {
    if (singleProduct) {
      const baseUnit = singleProduct.promoPrice ?? singleProduct.price;
      const discountFactor =
        style.enableQuantityBreaks && packQty === 2
          ? 0.95
          : style.enableQuantityBreaks && packQty === 3
          ? 0.9
          : 1;
      const discountedUnit = Math.round(baseUnit * discountFactor);
      return [
        {
          productId: singleProduct.id,
          productName: singleProduct.name,
          variantLabel: selectedVariantLabel,
          quantity: packQty,
          unitPrice: discountedUnit,
          costPrice:
            (singleProduct.costPrice ?? 0) +
            (singleProduct.additionalCost ?? 0),
          imageUrl: singleProduct.images[0],
        },
      ];
    }
    return items;
  }, [singleProduct, selectedVariantLabel, packQty, style.enableQuantityBreaks, items]);

  const subtotal = useMemo(
    () =>
      effectiveItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [effectiveItems]
  );

  const activePromo = useMemo(() => {
    if (!appliedPromoCode) return null;
    const found = (promoCodes ?? []).find(
      (p) =>
        p.storeId === store.id &&
        p.code.toUpperCase() === appliedPromoCode.toUpperCase() &&
        p.isActive
    );
    if (!found || subtotal < found.minOrderAmount) return null;
    if (found.maxUses !== null && found.usedCount >= found.maxUses) return null;
    if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
      return null;
    }
    return found;
  }, [appliedPromoCode, promoCodes, store.id, subtotal]);

  const discountAmount = useMemo(() => {
    if (!activePromo) return 0;
    if (activePromo.discountType === "percent") {
      return Math.round((subtotal * activePromo.discountValue) / 100);
    }
    return Math.min(subtotal, activePromo.discountValue);
  }, [activePromo, subtotal]);

  const selectedZone =
    deliveryZones.find((z) => z.id === selectedZoneId) ?? deliveryZones[0];

  const freeThreshold = store.settings.freeDeliveryThreshold ?? null;
  const qualifiesFree =
    freeThreshold !== null &&
    freeThreshold > 0 &&
    subtotal - discountAmount >= freeThreshold;

  const deliveryFee = qualifiesFree ? 0 : (selectedZone?.fee ?? 1500);
  const totalCod = Math.max(0, subtotal - discountAmount + deliveryFee);

  const radiusCls = RADIUS_MAP[style.borderRadius] ?? "rounded-xl";

  const handleApplyPromo = () => {
    setPromoMsg(null);
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = (promoCodes ?? []).find(
      (p) => p.storeId === store.id && p.code.toUpperCase() === code && p.isActive
    );
    if (!found) {
      setPromoMsg("Code promo invalide.");
      return;
    }
    if (subtotal < found.minOrderAmount) {
      setPromoMsg(
        `Minimum requis : ${formatCurrency(found.minOrderAmount, store.currency)}`
      );
      return;
    }
    setAppliedPromoCode(found.code);
    setPromoInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (previewMode) {
      setFormError(
        "Mode Aperçu Form Builder : publiez le formulaire pour recevoir de vraies commandes sur votre boutique."
      );
      return;
    }

    if (!salesUnlocked) {
      setFormError(
        "Mode Aperçu Boutique : votre vitrine Shrine Pro 3 est prête ! Activez votre abonnement (dès 7 500 FCFA/mois) pour débloquer les ventes et recevoir des commandes clients."
      );
      return;
    }

    if (effectiveItems.length === 0) {
      setFormError("Veuillez sélectionner au moins un article disponible.");
      return;
    }

    // Validation des champs obligatoires visibles
    for (const f of visibleFields) {
      if (f.type === "city") continue; // couvert par le sélecteur de zone si non saisi
      const v = (values[f.name] ?? "").trim();
      if (f.required && !v) {
        setFormError(`Veuillez renseigner le champ obligatoire « ${f.label} ».`);
        return;
      }
      if (f.type === "phone" && v) {
        const digits = v.replace(/[^\d]/g, "");
        if (digits.length < 7) {
          setFormError(
            "Veuillez saisir un numéro de téléphone valide (au moins 8 chiffres)."
          );
          return;
        }
      }
    }

    if (submitting) return;
    setSubmitting(true);

    const customerName =
      values.full_name ||
      Object.entries(values).find(([k]) => k.includes("name"))?.[1] ||
      "Client Boutique";
    const customerPhone =
      values.phone ||
      Object.entries(values).find(([k]) => k.includes("phone"))?.[1] ||
      "Non renseigné";
    const deliveryCity = values.city || selectedZone?.name || store.settings.address;
    const addressParts = [
      values.commune,
      values.district,
      values.address,
      values.landmark,
    ].filter(Boolean);
    const deliveryAddress =
      addressParts.join(" · ") || deliveryCity || "Livraison à domicile";

    const customFields: Record<string, string> = {};
    for (const f of visibleFields) {
      if (
        ![
          "full_name",
          "phone",
          "secondary_phone",
          "city",
          "commune",
          "district",
          "address",
          "landmark",
          "delivery_notes",
        ].includes(f.type) &&
        values[f.name]
      ) {
        customFields[f.label] = values[f.name];
      }
    }

    const order = placeOrder({
      storeId: store.id,
      customerName,
      customerPhone,
      secondaryPhone: values.secondary_phone,
      deliveryCity,
      deliveryAddress,
      commune: values.commune,
      district: values.district,
      landmark: values.landmark,
      customFields:
        Object.keys(customFields).length > 0 ? customFields : undefined,
      notes: values.delivery_notes,
      paymentMethod: "cash_on_delivery",
      deliveryFee,
      promoCode: activePromo?.code,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      items: effectiveItems,
    });

    setSubmitting(false);
    setConfirmedOrder(order);
    if (onOrderCreated) {
      onOrderCreated(order);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="rounded-2xl border-2 border-[#00A884] bg-[#E7F7F2]/65 p-5 text-[#15232D]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00A884] text-white">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-[#073B35]">
              Commande enregistrée avec succès !
            </p>
            <p className="text-xs text-slate-600">
              Référence :{" "}
              <strong className="font-mono text-[#073B35]">
                {confirmedOrder.orderNumber}
              </strong>
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 rounded-xl bg-white p-3.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Destinataire :</span>
            <span className="font-bold">{confirmedOrder.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Téléphone :</span>
            <span className="font-bold">{confirmedOrder.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Lieu de livraison :</span>
            <span className="font-semibold text-right">
              {confirmedOrder.deliveryAddress}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-sm">
            <span className="font-bold text-[#073B35]">
              Montant à régler au livreur :
            </span>
            <span className="font-extrabold text-[#00A884]">
              {formatCurrency(confirmedOrder.totalAmount, store.currency)}
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          Notre équipe prépare votre commande et le livreur vous contactera
          avant son passage. Vous ne payez qu&apos;à la remise de votre colis.
        </p>

        <button
          type="button"
          onClick={() => {
            setConfirmedOrder(null);
            setValues({});
          }}
          className="mt-4 w-full rounded-xl border border-[#073B35]/20 bg-white py-2 text-xs font-bold text-[#073B35] hover:bg-slate-50 cursor-pointer"
        >
          Passer une autre commande
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5"
      style={{ color: style.textColor }}
    >
      {/* En-tête du Formulaire COD */}
      <div className="border-b border-slate-100 pb-3.5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F7F2] px-2.5 py-0.5 text-[11px] font-bold text-[#073B35]">
          <Truck className="h-3 w-3 text-[#00A884]" />
          Paiement 100 % à la livraison (COD)
        </div>
        <h3 className="mt-1.5 text-base font-extrabold sm:text-lg">
          {style.title}
        </h3>
        {style.subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{style.subtitle}</p>
        )}
      </div>

      {/* Sélecteur d'offres Packs 1x / 2x / 3x (Shrine Pro Quantity Breaks) */}
      {singleProduct && style.enableQuantityBreaks && (
        <div className="mt-4 space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#073B35]">
            <Sparkles className="h-3.5 w-3.5 text-[#00A884]" />
            Choisissez votre offre Pack :
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { q: 1, label: "1 Unité", tag: "Standard", disc: 1 },
                { q: 2, label: "Pack Duo (2x)", tag: "-5 %", disc: 0.95 },
                { q: 3, label: "Pack Trio (3x)", tag: "-10 %", disc: 0.9 },
              ] as const
            ).map((opt) => {
              const base = singleProduct.promoPrice ?? singleProduct.price;
              const totalOpt = Math.round(base * opt.disc) * opt.q;
              const active = packQty === opt.q;
              return (
                <button
                  key={opt.q}
                  type="button"
                  onClick={() => setPackQty(opt.q)}
                  className={`flex flex-col items-center justify-between rounded-xl border p-2.5 text-center transition cursor-pointer ${
                    active
                      ? "border-2 border-[#00A884] bg-[#E7F7F2]/55"
                      : "border-slate-200 bg-slate-50/70 hover:bg-slate-50"
                  }`}
                >
                  <span className="rounded-full bg-[#073B35] px-2 py-0.5 text-[9px] font-bold text-white">
                    {opt.tag}
                  </span>
                  <span className="mt-1.5 text-xs font-extrabold text-[#15232D]">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 text-xs font-bold text-[#00A884]">
                    {formatCurrency(totalOpt, store.currency)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Champs dynamiques configurés dans le Form Builder COD */}
      <div className="mt-4 space-y-3">
        {visibleFields.map((field) => {
          const val = values[field.name] ?? "";

          if (field.type === "city") {
            return (
              <div key={field.id}>
                <label className="block text-xs font-bold">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => {
                    const zId = e.target.value;
                    setSelectedZoneId(zId);
                    const z = deliveryZones.find((item) => item.id === zId);
                    if (z) {
                      setValues((prev) => ({ ...prev, [field.name]: z.name }));
                    }
                  }}
                  className={`mt-1 h-11 w-full border px-3 text-sm font-medium focus:outline-none ${radiusCls}`}
                  style={{
                    backgroundColor: style.fieldBg,
                    borderColor: style.borderColor,
                    color: style.textColor,
                  }}
                >
                  {deliveryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} —{" "}
                      {qualifiesFree
                        ? "Livraison offerte"
                        : formatCurrency(z.fee, store.currency)}
                      {z.estimatedDelay ? ` (${z.estimatedDelay})` : ""}
                    </option>
                  ))}
                </select>
                {field.helpText && (
                  <p className="mt-0.5 text-[11px] text-slate-400">{field.helpText}</p>
                )}
              </div>
            );
          }

          if (field.type === "select") {
            const opts = field.options && field.options.length > 0 ? field.options : ["Option 1", "Option 2"];
            return (
              <div key={field.id}>
                <label className="block text-xs font-bold">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>
                <select
                  required={field.required && !previewMode}
                  value={val}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  className={`mt-1 h-11 w-full border px-3 text-sm focus:outline-none ${radiusCls}`}
                  style={{
                    backgroundColor: style.fieldBg,
                    borderColor: style.borderColor,
                    color: style.textColor,
                  }}
                >
                  <option value="">{field.placeholder || "Sélectionnez..."}</option>
                  {opts.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === "radio") {
            const opts = field.options && field.options.length > 0 ? field.options : ["Oui", "Non"];
            return (
              <div key={field.id}>
                <label className="block text-xs font-bold">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {opts.map((opt) => {
                    const checked = val === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setValues((prev) => ({ ...prev, [field.name]: opt }))
                        }
                        className={`border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${radiusCls}`}
                        style={{
                          borderColor: checked ? style.buttonBg : style.borderColor,
                          backgroundColor: checked ? `${style.buttonBg}18` : style.fieldBg,
                          color: style.textColor,
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (field.type === "checkbox") {
            return (
              <label
                key={field.id}
                className="flex items-center gap-2.5 pt-1 text-xs font-semibold cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={val === "Oui"}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.name]: e.target.checked ? "Oui" : "",
                    }))
                  }
                  className="h-4 w-4 accent-[#00A884]"
                />
                <span>{field.label}</span>
              </label>
            );
          }

          if (field.type === "long_text" || field.type === "delivery_notes") {
            return (
              <div key={field.id}>
                <label className="block text-xs font-bold">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={2}
                  value={val}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className={`mt-1 w-full border p-3 text-sm focus:outline-none ${radiusCls}`}
                  style={{
                    backgroundColor: style.fieldBg,
                    borderColor: style.borderColor,
                    color: style.textColor,
                  }}
                />
              </div>
            );
          }

          const inputType =
            field.type === "phone" || field.type === "secondary_phone"
              ? "tel"
              : field.type === "quantity"
              ? "number"
              : "text";

          return (
            <div key={field.id}>
              <label className="block text-xs font-bold">
                {field.label} {field.required && <span className="text-rose-500">*</span>}
              </label>
              <input
                type={inputType}
                value={val}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
                placeholder={field.placeholder}
                className={`mt-1 h-11 w-full border px-3.5 text-base sm:text-sm focus:outline-none ${radiusCls}`}
                style={{
                  backgroundColor: style.fieldBg,
                  borderColor: style.borderColor,
                  color: style.textColor,
                }}
              />
              {field.helpText && (
                <p className="mt-0.5 text-[11px] text-slate-400">{field.helpText}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Code Promo optionnel */}
      <div className="mt-3.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Code promo (facultatif)"
              className="h-9.5 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyPromo}
            className="rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            Appliquer
          </button>
        </div>
        {promoMsg && <p className="mt-1 text-[11px] text-rose-600">{promoMsg}</p>}
        {activePromo && (
          <p className="mt-1 text-[11px] font-bold text-[#00A884]">
            Code {activePromo.code} appliqué (-
            {formatCurrency(discountAmount, store.currency)})
          </p>
        )}
      </div>

      {/* Résumé clair de la commande COD */}
      {style.showOrderSummary && (
        <div className="mt-4 space-y-1.5 rounded-xl border border-[#00A884]/25 bg-[#F8FAFC] p-3.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Sous-total articles</span>
            <span className="font-semibold">
              {formatCurrency(subtotal, store.currency)}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-[#00A884]">
              <span>Réduction promo</span>
              <span className="font-bold">
                -{formatCurrency(discountAmount, store.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Livraison ({selectedZone?.name})</span>
            <span className="font-semibold">
              {deliveryFee === 0
                ? "Offerte"
                : formatCurrency(deliveryFee, store.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-[#15232D]">
            <span>Total à payer à la livraison</span>
            <span style={{ color: style.buttonBg }}>
              {formatCurrency(totalCod, store.currency)}
            </span>
          </div>
        </div>
      )}

      {formError && (
        <div className="mt-3 space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
          <p className="font-semibold">{formError}</p>
          {!salesUnlocked && (
            <Link
              href="/dashboard/abonnement"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#073B35] px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-[#0a4f47]"
            >
              <Lock className="h-3 w-3 text-[#7CE3C8]" />
              Activer mon abonnement pour vendre →
            </Link>
          )}
        </div>
      )}

      {!salesUnlocked && !previewMode && !formError && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] font-bold text-amber-900">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            Mode Aperçu (Payez l&apos;abonnement pour ouvrir les ventes)
          </span>
          <Link
            href="/dashboard/abonnement"
            className="shrink-0 underline decoration-amber-600 underline-offset-2 hover:text-[#073B35]"
          >
            Activer
          </Link>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`mt-4 flex min-h-12 w-full items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold shadow-md transition hover:opacity-95 active:scale-[0.99] cursor-pointer ${radiusCls}`}
        style={{
          backgroundColor: style.buttonBg,
          color: style.buttonText,
        }}
      >
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>{style.buttonLabel}</span>
      </button>
    </form>
  );
}
