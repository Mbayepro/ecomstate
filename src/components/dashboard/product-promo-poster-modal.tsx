"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Product, Store } from "@/types/domain";

interface ProductPromoPosterModalProps {
  product: Product | null;
  store: Store;
  onClose: () => void;
}

export function ProductPromoPosterModal({
  product,
  store,
  onClose,
}: ProductPromoPosterModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [ready, setReady] = useState(false);

  const storeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${store.slug}/produit/${product?.slug ?? ""}`
      : `https://${store.subdomain}/produit/${product?.slug ?? ""}`;

  const sellPrice = product ? (product.promoPrice ?? product.price) : 0;
  const hasPromo =
    Boolean(product?.promoPrice) &&
    Number(product?.promoPrice) < (product?.price ?? 0);

  const socialCaption = product
    ? `${product.name} disponible chez ${store.name} !\nPrix : ${formatCurrency(sellPrice, store.currency)}${hasPromo ? ` (au lieu de ${formatCurrency(product.price, store.currency)})` : ""}\nPaiement 100 % à la livraison — Vérifiez votre colis à la réception.\nCommandez en 30 secondes ici : ${storeUrl}`
    : "";

  useEffect(() => {
    if (!product || !canvasRef.current) return;
    setReady(false);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const primary = store.settings.primaryColor || "#073B35";
    const secondary = store.settings.secondaryColor || "#00A884";

    const drawPoster = (imgEl: HTMLImageElement | null) => {
      // Fond dégradé marque
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, primary);
      grad.addColorStop(1, "#041E1B");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // En-tête nom de boutique
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.roundRect(70, 80, W - 140, 100, 50);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 40px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(store.name.toUpperCase(), W / 2, 144);

      // Cadre photo produit central
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(70, 220, W - 140, 960, 48);
      ctx.clip();

      if (imgEl) {
        const scale = Math.max(
          (W - 140) / imgEl.width,
          960 / imgEl.height
        );
        const dw = imgEl.width * scale;
        const dh = imgEl.height * scale;
        const dx = 70 + (W - 140 - dw) / 2;
        const dy = 220 + (960 - dh) / 2;
        ctx.drawImage(imgEl, dx, dy, dw, dh);
      } else {
        ctx.fillStyle = "#E2E8F0";
        ctx.fillRect(70, 220, W - 140, 960);
      }
      ctx.restore();

      // Badge Paiement à la livraison en haut de l'image
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.roundRect(110, 260, 560, 78, 39);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 30px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PAIEMENT 100 % À LA LIVRAISON", 390, 310);

      // Carte blanche inférieure d'information & prix
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(70, 1230, W - 140, 590, 48);
      ctx.fill();

      // Titre produit (tronqué proprement)
      ctx.fillStyle = "#15232D";
      ctx.font = "bold 50px sans-serif";
      ctx.textAlign = "center";
      const displayTitle =
        product.name.length > 32
          ? product.name.slice(0, 30) + "..."
          : product.name;
      ctx.fillText(displayTitle, W / 2, 1335);

      // Prix barré éventuel
      if (hasPromo) {
        ctx.fillStyle = "#94A3B8";
        ctx.font = "bold 36px sans-serif";
        const oldStr = formatCurrency(product.price, store.currency);
        ctx.fillText(`Ancien prix : ${oldStr}`, W / 2, 1405);
      }

      // Prix principal géant
      ctx.fillStyle = secondary;
      ctx.font = "900 84px sans-serif";
      ctx.fillText(
        formatCurrency(sellPrice, store.currency),
        W / 2,
        hasPromo ? 1510 : 1475
      );

      // Bouton d'appel à l'action visuel
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.roundRect(130, 1575, W - 260, 115, 32);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText("COMMANDEZ EN 30 SECONDES", W / 2, 1646);

      // Adresse boutique en pied d'affiche
      ctx.fillStyle = "#475569";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(
        store.customDomain || store.subdomain,
        W / 2,
        1765
      );

      setReady(true);
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => drawPoster(img);
    img.onerror = () => drawPoster(null);
    img.src = product.images[0] || "/images/african-fashion-model-teranga.jpg";
  }, [product, store, sellPrice, hasPromo]);

  if (!product) return null;

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `affiche-statut-${product.slug}.png`;
    link.click();
  };

  const handleCopyCaption = () => {
    navigator.clipboard?.writeText(socialCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F7F2] text-[#00A884]">
              <Share2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-[#15232D]">
                Affiche Prête pour Statut WhatsApp & TikTok
              </h2>
              <p className="text-xs text-slate-500">
                Téléchargez l&apos;image HD et collez la légende avec votre lien direct
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid items-center gap-6 sm:grid-cols-12">
          {/* Aperçu vertical Story 9:16 */}
          <div className="flex justify-center sm:col-span-5">
            <canvas
              ref={canvasRef}
              className="aspect-[9/16] w-full max-w-[230px] rounded-2xl border border-slate-200 shadow-lg"
            />
          </div>

          {/* Légende prête à copier + Bouton téléchargement */}
          <div className="space-y-4 sm:col-span-7">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Texte prêt à coller sous votre Statut / TikTok
              </label>
              <textarea
                readOnly
                rows={6}
                value={socialCaption}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3 text-xs leading-relaxed text-[#15232D]"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                type="button"
                variant="primary"
                onClick={handleDownloadPng}
                disabled={!ready}
                className="w-full"
              >
                <Download className="h-4 w-4" />
                Télécharger l&apos;affiche HD (.PNG)
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCopyCaption}
                className="w-full"
              >
                {copiedCaption ? (
                  <>
                    <Check className="h-4 w-4 text-[#00A884]" />
                    Texte & lien copiés !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier le texte avec le lien boutique
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
