"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { Product, Store } from "@/types/domain";

const FIRST_NAMES = [
  "Aïcha",
  "Fatou",
  "Koffi",
  "Mariam",
  "Moussa",
  "Nadia",
  "Ibrahim",
  "Clarisse",
];

const MINUTES_AGO = [4, 7, 12, 18, 25, 34];

export function LiveSocialProofToast({
  store,
  products,
}: {
  store: Store;
  products: Product[];
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const enabled = store.settings.enableLiveSocialProof !== false;

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive && p.stock > 0),
    [products]
  );

  const cities = useMemo(() => {
    const fromZones = (store.settings.deliveryZones ?? []).map(
      (z) => z.name.split("(")[0].split("/")[0].trim()
    );
    if (fromZones.length > 0) return fromZones;
    return [store.settings.address || "Centre-ville"];
  }, [store.settings.deliveryZones, store.settings.address]);

  useEffect(() => {
    if (!enabled || dismissed || activeProducts.length === 0) return;

    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 4500);

    const cycleTimer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStepIdx((prev) => prev + 1);
        setVisible(true);
      }, 1200);
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleTimer);
    };
  }, [enabled, dismissed, activeProducts.length]);

  if (!enabled || dismissed || !visible || activeProducts.length === 0) {
    return null;
  }

  const product = activeProducts[stepIdx % activeProducts.length];
  const buyerName = FIRST_NAMES[stepIdx % FIRST_NAMES.length];
  const city = cities[stepIdx % cities.length];
  const mins = MINUTES_AGO[stepIdx % MINUTES_AGO.length];
  const secondary = store.settings.secondaryColor || "#00A884";

  return (
    <div className="animate-card-pop fixed bottom-4 left-4 z-30 max-w-xs rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-xl backdrop-blur-md">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Fermer la notification"
        className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
      >
        <X className="h-3 w-3" />
      </button>

      <Link
        href={`/s/${store.slug}/produit/${product.slug}`}
        className="flex items-center gap-3 pr-4"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold text-[#15232D]">
            {buyerName} à {city}
          </p>
          <p className="truncate text-xs font-extrabold" style={{ color: secondary }}>
            {product.name}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <CheckCircle2 className="h-3 w-3 text-[#00A884]" />
            Commandé en COD · Il y a {mins} min
          </p>
        </div>
      </Link>
    </div>
  );
}
