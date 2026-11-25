"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  MessageCircle,
  Percent,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardPageHeader,
  StatMetricCard,
} from "@/components/dashboard/page-header";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency, formatDate } from "@/lib/utils";

const QUICK_PRESETS = [
  { code: "BIENVENUE10", type: "percent" as const, value: 10, min: 10000 },
  { code: "PROMO2000", type: "fixed" as const, value: 2000, min: 15000 },
  { code: "VIP15", type: "percent" as const, value: 15, min: 25000 },
];

export default function DashboardPromotionsPage() {
  const {
    activeStore,
    promoCodes,
    orders,
    savePromoCode,
    togglePromoCodeActive,
    deletePromoCode,
  } = usePlatform();

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(
    "percent"
  );
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrderAmount, setMinOrderAmount] = useState("10000");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!activeStore) return null;

  const storePromos = (promoCodes ?? []).filter(
    (p) => p.storeId === activeStore.id
  );
  const activeCount = storePromos.filter((p) => p.isActive).length;
  const totalUses = storePromos.reduce((s, p) => s + p.usedCount, 0);
  const totalDiscountGiven = orders
    .filter((o) => o.storeId === activeStore.id && o.status !== "cancelled")
    .reduce((s, o) => s + (o.discountAmount ?? 0), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const val = Number(discountValue);
    if (!val || val <= 0) {
      setError("Veuillez saisir une valeur de réduction supérieure à 0.");
      return;
    }
    if (discountType === "percent" && val > 90) {
      setError("Une réduction en pourcentage ne peut pas dépasser 90 %.");
      return;
    }

    const res = savePromoCode(activeStore.id, {
      code,
      discountType,
      discountValue: val,
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUses: maxUses.trim() ? Number(maxUses) : null,
      expiresAt: expiresAt || null,
      isActive: true,
    });

    if (!res.ok) {
      setError(res.error ?? "Impossible de créer ce code promo.");
      return;
    }

    setCode("");
    setDiscountValue("10");
    setMinOrderAmount("10000");
    setMaxUses("");
    setExpiresAt("");
  };

  const copyCode = (c: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(c);
      setCopiedCode(c);
      setTimeout(() => setCopiedCode(null), 1800);
    }
  };

  const sharePromoWhatsapp = (
    c: string,
    type: "percent" | "fixed",
    value: number
  ) => {
    const storeUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/s/${activeStore.slug}`
        : `https://${activeStore.subdomain}`;
    const label =
      type === "percent"
        ? `-${value}%`
        : `-${formatCurrency(value, activeStore.currency)}`;
    const text = `Offre spéciale chez *${activeStore.name}* ! Profitez de *${label}* sur votre commande avec le code promo *${c}*.\nCommandez ici : ${storeUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Marketing & Conversion"
        title="Codes Promo & Réductions"
        description="Créez des codes de réduction pour vos statuts WhatsApp, vidéos TikTok et clients fidèles. Ils s'appliquent automatiquement dans le panier."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatMetricCard
          label="Codes promo actifs"
          value={activeCount}
          subtext={`${storePromos.length} créé(s) au total`}
          icon={Tag}
          tone="emerald"
        />
        <StatMetricCard
          label="Utilisations enregistrées"
          value={totalUses}
          subtext="Commandes avec code promo"
          icon={Percent}
          tone="navy"
        />
        <StatMetricCard
          label="Remises offertes"
          value={formatCurrency(totalDiscountGiven, activeStore.currency)}
          subtext="Sur les commandes validées"
          icon={Wallet}
          tone="slate"
        />
      </div>


      <div className="grid gap-6 lg:grid-cols-12">
        {/* Formulaire de création */}
        <Card className="border-[#E2E8F0] bg-white lg:col-span-5">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-extrabold text-[#102A43]">
              Créer un nouveau code promo
            </h2>
          </CardHeader>
          <CardContent className="p-5">
            {/* Suggestions rapides */}
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Idées rapides en 1 clic
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => {
                      setCode(preset.code);
                      setDiscountType(preset.type);
                      setDiscountValue(String(preset.value));
                      setMinOrderAmount(String(preset.min));
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-bold text-[#102A43] hover:border-[#10B981] hover:text-[#10B981] cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-[#10B981]" />
                    {preset.code}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Code promo (ex: BIENVENUE10)"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EX : SOLDES15"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#102A43]">
                    Type de remise
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(e.target.value as "percent" | "fixed")
                    }
                    className="h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#102A43]"
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">
                      Montant fixe ({activeStore.currency})
                    </option>
                  </select>
                </div>

                <Input
                  label={
                    discountType === "percent"
                      ? "Pourcentage (%)"
                      : `Montant (${activeStore.currency})`
                  }
                  type="number"
                  required
                  min={1}
                  max={discountType === "percent" ? 90 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={`Achat minimum (${activeStore.currency})`}
                  type="number"
                  min={0}
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Limite d'utilisations (optionnel)"
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Illimité"
                />
              </div>

              <Input
                label="Date d'expiration (optionnel)"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full">
                <Plus className="h-4 w-4" />
                Activer ce code promo
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste des codes promo de la boutique */}
        <Card className="border-[#E2E8F0] bg-white lg:col-span-7">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-extrabold text-[#102A43]">
              Vos codes promo ({storePromos.length})
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            {storePromos.length === 0 ? (
              <div className="p-12 text-center">
                <Tag className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-2.5 text-sm font-bold text-[#102A43]">
                  Aucun code promo pour le moment
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Créez votre premier code à gauche (ex : BIENVENUE10) et
                  partagez-le sur votre statut WhatsApp pour déclencher vos
                  ventes !
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {storePromos.map((promo) => (
                  <div
                    key={promo.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-[#102A43]/20 bg-[#F8FAFC] px-2.5 py-1 font-mono text-sm font-extrabold tracking-wide text-[#102A43]">
                          {promo.code}
                        </span>
                        <Badge variant={promo.isActive ? "success" : "default"}>
                          {promo.discountType === "percent"
                            ? `-${promo.discountValue}%`
                            : `-${formatCurrency(
                                promo.discountValue,
                                activeStore.currency
                              )}`}
                        </Badge>
                        {!promo.isActive && (
                          <Badge variant="warning">Désactivé</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Min. d&apos;achat :{" "}
                        {formatCurrency(
                          promo.minOrderAmount,
                          activeStore.currency
                        )}{" "}
                        · Utilisé{" "}
                        <strong className="text-[#102A43]">
                          {promo.usedCount}
                          {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                        </strong>{" "}
                        fois
                        {promo.expiresAt
                          ? ` · Expire le ${formatDate(promo.expiresAt)}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyCode(promo.code)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#102A43] hover:bg-slate-50 cursor-pointer"
                        title="Copier le code"
                      >
                        {copiedCode === promo.code ? (
                          <Check className="h-3.5 w-3.5 text-[#10B981]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                        )}
                        {copiedCode === promo.code ? "Copié" : "Copier"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          sharePromoWhatsapp(
                            promo.code,
                            promo.discountType,
                            promo.discountValue
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1.5 text-xs font-bold text-[#059669] hover:bg-[#10B981] hover:text-white cursor-pointer"
                        title="Partager cette offre sur WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          togglePromoCodeActive(activeStore.id, promo.id)
                        }
                        className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#102A43] cursor-pointer"
                      >
                        {promo.isActive ? "Pause" : "Activer"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deletePromoCode(activeStore.id, promo.id)
                        }
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Supprimer ce code"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
