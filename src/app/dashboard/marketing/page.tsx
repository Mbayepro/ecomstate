"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Megaphone,
  MessageCircle,
  Printer,
  QrCode,
  Share2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { usePlatform } from "@/lib/platform-store";
import { formatCurrency } from "@/lib/utils";

type SocialChannel = "whatsapp" | "tiktok" | "facebook";

export default function DashboardMarketingPage() {
  const { activeStore, products, promoCodes } = usePlatform();
  const [origin, setOrigin] = useState("https://ecomstate.vercel.app");
  const [selectedProductId, setSelectedProductId] = useState<string>("store");
  const [channel, setChannel] = useState<SocialChannel>("whatsapp");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!activeStore) return null;

  const storeProducts = products.filter(
    (p) => p.storeId === activeStore.id && p.isActive
  );
  const activePromo = (promoCodes ?? []).find(
    (pc) => pc.storeId === activeStore.id && pc.isActive
  );

  const storeUrl = `${origin}/s/${activeStore.slug}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=12&color=102A43&bgcolor=FFFFFF&data=${encodeURIComponent(
    storeUrl
  )}`;

  const selectedProduct = storeProducts.find(
    (p) => p.id === selectedProductId
  );

  const generatedPost = useMemo(() => {
    const promoLine = activePromo
      ? `\n🎁 Code promo actif : *${activePromo.code}* (${
          activePromo.discountType === "percent"
            ? `-${activePromo.discountValue}%`
            : `-${formatCurrency(activePromo.discountValue, activeStore.currency)}`
        })`
      : "";

    const targetUrl = selectedProduct
      ? `${storeUrl}/produit/${selectedProduct.slug}`
      : storeUrl;

    if (!selectedProduct) {
      if (channel === "whatsapp") {
        return `✨ *${activeStore.name}* est désormais ouvert en ligne 24h/24 !\n\nDécouvrez tous nos articles disponibles avec photos réelles, prix en ${activeStore.currency} et commande rapide en 2 clics.${promoLine}\n\n🚚 ${activeStore.settings.deliveryInfo}\n👉 Visitez la boutique ici : ${storeUrl}`;
      }
      if (channel === "tiktok") {
        return `🔥 Plus besoin d'attendre en DM pour commander chez ${activeStore.name} !\nTout notre catalogue est disponible en ligne avec paiement à la livraison & Mobile Money.${promoLine}\n\n🔗 Lien direct en bio : ${storeUrl}\n#EcommerceAfrique #${activeStore.name.replace(/\s+/g, "")} #BoutiqueEnLigne #LivraisonRapide #Shopping`;
      }
      return `🎉 Bonne nouvelle ! Commandez désormais facilement chez ${activeStore.name} depuis votre téléphone !\n\n✅ Catalogue complet & prix transparents en ${activeStore.currency}\n✅ Paiement à la livraison, WhatsApp ou Mobile Money\n✅ ${activeStore.settings.deliveryInfo}${promoLine}\n\n👇 Cliquez ici pour découvrir nos articles :\n${storeUrl}`;
    }

    const displayPrice = formatCurrency(
      selectedProduct.promoPrice ?? selectedProduct.price,
      activeStore.currency
    );
    const oldPrice = selectedProduct.promoPrice
      ? ` (au lieu de ${formatCurrency(selectedProduct.price, activeStore.currency)})`
      : "";

    if (channel === "whatsapp") {
      return `🔥 *NOUVEL ARRIVAGE — ${selectedProduct.name}*\n\n💰 Prix : *${displayPrice}*${oldPrice}\n📦 Stock disponible : ${selectedProduct.stock > 0 ? "En stock immédiat" : "Sur commande"}\n📝 ${selectedProduct.description.slice(0, 140)}${promoLine}\n\n🚚 ${activeStore.settings.deliveryInfo}\n👉 Commander en 1 clic : ${targetUrl}`;
    }

    if (channel === "tiktok") {
      return `✨ Coup de cœur du jour chez ${activeStore.name} : ${selectedProduct.name} à seulement ${displayPrice}${oldPrice} ! 😍\nPaiement à la livraison ou Mobile Money.${promoLine}\n\n👇 Lien direct pour commander : ${targetUrl}\n#BonPlan #ShoppingAfrique #${activeStore.name.replace(/\s+/g, "")} #LivraisonExpress`;
    }

    return `🛍️ DISPONIBLE CHEZ ${activeStore.name.toUpperCase()} !\n\n✨ ${selectedProduct.name}\n💰 Tarif : ${displayPrice}${oldPrice}\n\n${selectedProduct.description}\n\n✅ Paiement à la livraison ou Mobile Money\n✅ ${activeStore.settings.deliveryInfo}${promoLine}\n\n👉 Commandez directement ici sans attendre :\n${targetUrl}`;
  }, [activeStore, selectedProduct, channel, activePromo, storeUrl]);

  const copyText = (text: string, which: "link" | "post") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      if (which === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1800);
      } else {
        setCopiedPost(true);
        setTimeout(() => setCopiedPost(false), 1800);
      }
    }
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Kit Marketing 1-clic"
        title="QR Code Boutique & Posts Adeshina IA"
        description="Imprimez le QR Code officiel de votre boutique pour vos colis/comptoir et générez en 1 clic des textes vendeurs pour vos statuts WhatsApp, TikTok et Facebook."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Colonne 1 : Affiche QR Code officielle imprimable */}
        <Card className="border-[#E2E8F0] bg-white lg:col-span-5">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#102A43]">
                <QrCode className="h-4 w-4 text-[#10B981]" />
                QR Code officiel de votre boutique
              </h2>
              <Badge variant="success">Prêt à imprimer</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {/* Carte affiche imprimable */}
            <div
              className="rounded-2xl border-2 p-6 text-center shadow-sm"
              style={{
                borderColor: activeStore.settings.primaryColor || "#102A43",
                background:
                  "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
              }}
            >
              <p
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{
                  color: activeStore.settings.secondaryColor || "#10B981",
                }}
              >
                Scannez pour commander en ligne
              </p>
              <h3
                className="mt-1 text-xl font-extrabold"
                style={{
                  color: activeStore.settings.primaryColor || "#102A43",
                }}
              >
                {activeStore.name}
              </h3>

              <div className="mx-auto my-5 flex h-52 w-52 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt={`QR Code ${activeStore.name}`}
                  className="h-full w-full object-contain"
                />
              </div>

              <p className="truncate rounded-lg bg-[#F1F5F9] px-3 py-1.5 font-mono text-[11px] font-bold text-[#102A43]">
                {storeUrl}
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                WhatsApp : {activeStore.settings.whatsappPhone} · Paiement à la
                livraison & Mobile Money
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimer l&apos;affiche
              </Button>
              <a
                href={qrImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={`qrcode-${activeStore.slug}.png`}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#102A43] hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5 text-[#10B981]" />
                Ouvrir PNG
              </a>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => copyText(storeUrl, "link")}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#102A43] hover:bg-white cursor-pointer"
              >
                {copiedLink ? (
                  <Check className="h-3.5 w-3.5 text-[#10B981]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                )}
                {copiedLink ? "Lien copié !" : "Copier le lien boutique"}
              </button>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#102A43] hover:bg-slate-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ouvrir
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Colonne 2 : Studio Posts WhatsApp / TikTok / Facebook par Adeshina IA */}
        <Card className="border-[#E2E8F0] bg-white lg:col-span-7">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#102A43]">
                <Sparkles className="h-4 w-4 text-[#10B981]" />
                Générateur de Posts Statut WhatsApp, TikTok & Facebook
              </h2>
              <Badge variant="navy">Adeshina IA</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  1. Que voulez-vous promouvoir ?
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="h-10.5 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#102A43] focus:border-[#102A43] focus:outline-none"
                >
                  <option value="store">
                    Présentation générale de {activeStore.name}
                  </option>
                  {storeProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      Produit : {p.name} (
                      {formatCurrency(
                        p.promoPrice ?? p.price,
                        activeStore.currency
                      )}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Réseau cible
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      ["whatsapp", "WhatsApp"],
                      ["tiktok", "TikTok"],
                      ["facebook", "Facebook"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setChannel(id)}
                      className={`h-10.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        channel === id
                          ? "border-[#102A43] bg-[#102A43] text-white"
                          : "border-[#E2E8F0] bg-[#F8FAFC] text-slate-600 hover:text-[#102A43]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activePromo && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-900">
                <Megaphone className="h-4 w-4 shrink-0 text-[#10B981]" />
                <span>
                  Adeshina IA a automatiquement inclus votre code promo actif{" "}
                  <strong className="font-mono">{activePromo.code}</strong> dans
                  ce texte !
                </span>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Texte prêt à publier
              </label>
              <textarea
                readOnly
                rows={9}
                value={generatedPost}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs leading-relaxed text-[#102A43] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                type="button"
                variant="primary"
                onClick={() => copyText(generatedPost, "post")}
              >
                {copiedPost ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedPost ? "Texte copié !" : "Copier le texte"}
              </Button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(generatedPost)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#10B981] bg-[#10B981]/10 px-4 text-xs font-bold text-[#059669] transition hover:bg-[#10B981] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Partager sur WhatsApp
              </a>

              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    void navigator.share({
                      title: activeStore.name,
                      text: generatedPost,
                      url: storeUrl,
                    });
                  } else {
                    copyText(generatedPost, "post");
                  }
                }}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#102A43] hover:bg-slate-50 cursor-pointer"
              >
                <Share2 className="h-4 w-4 text-slate-500" />
                Partager (Mobile)
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
