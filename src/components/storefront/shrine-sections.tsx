"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import type { Category, Product, Store, StoreSectionBlock } from "@/types/domain";

export function ShrineSectionsRenderer({
  store,
  sections,
  categories,
  products,
  onSelectCategory,
  catalogSlot,
}: {
  store: Store;
  sections: StoreSectionBlock[];
  categories: Category[];
  products: Product[];
  onSelectCategory: (categoryId: string) => void;
  catalogSlot: React.ReactNode;
}) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const primary = store.settings.primaryColor || "#073B35";
  const secondary = store.settings.secondaryColor || "#00A884";

  const ordered = sections
    .filter((s) => s.visible)
    .slice()
    .sort((a, b) => a.order - b.order);

  const hasFeaturedCollection = ordered.some(
    (s) => s.type === "featured_collection"
  );

  return (
    <div>
      {ordered.map((sec) => {
        if (sec.type === "announcement_bar") {
          return (
            <div
              key={sec.id}
              className="px-4 py-2 text-center text-xs font-bold text-white"
              style={{ backgroundColor: secondary }}
            >
              {sec.title}
            </div>
          );
        }

        if (sec.type === "hero_shrine") {
          return (
            <section
              key={sec.id}
              className="relative overflow-hidden text-white"
              style={{ backgroundColor: primary }}
            >
              {store.settings.bannerUrl && (
                <img
                  src={store.settings.bannerUrl}
                  alt={store.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-25"
                />
              )}
              <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
                <div className="max-w-2xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
                    <Truck className="h-3.5 w-3.5" />
                    Paiement 100 % à la livraison
                  </span>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                    {sec.title || store.name}
                  </h1>
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base">
                    {sec.subtitle || store.settings.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="#catalogue"
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
                      style={{ backgroundColor: secondary }}
                    >
                      Commander maintenant
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (sec.type === "ticker_marquee") {
          const items = sec.items ?? [];
          if (items.length === 0) return null;
          return (
            <div
              key={sec.id}
              className="overflow-hidden border-y border-slate-200 bg-white py-2.5"
            >
              <div className="animate-marquee flex items-center gap-10">
                {[...items, ...items, ...items].map((it, idx) => (
                  <span
                    key={`${it.id}-${idx}`}
                    className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-[#15232D]"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: secondary }}
                    />
                    {it.title}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        if (sec.type === "categories_rail") {
          if (categories.length === 0) return null;
          return (
            <section
              key={sec.id}
              className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8"
            >
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#15232D] sm:text-xl">
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p className="text-xs text-slate-500">{sec.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((cat) => {
                  const count = products.filter(
                    (p) => p.categoryId === cat.id
                  ).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onSelectCategory(cat.id)}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#15232D] group-hover:underline">
                          {cat.name}
                        </p>
                        {cat.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <p
                        className="mt-3 text-xs font-bold"
                        style={{ color: secondary }}
                      >
                        {count} article{count > 1 ? "s" : ""} →
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        }

        if (sec.type === "featured_collection") {
          return (
            <div key={sec.id}>
              {catalogSlot}
            </div>
          );
        }

        if (sec.type === "benefits_grid") {
          const items = sec.items ?? [];
          return (
            <section
              key={sec.id}
              className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8"
            >
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-xl font-extrabold text-[#15232D] sm:text-2xl">
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {sec.subtitle}
                    </p>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4"
                    >
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: secondary }}
                      >
                        <ShieldCheck className="h-4.5 w-4.5" />
                      </span>
                      <h3 className="mt-3 text-sm font-bold text-[#15232D]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (sec.type === "bundle_deals") {
          const items = sec.items ?? [];
          return (
            <section
              key={sec.id}
              className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8"
            >
              <div
                className="rounded-3xl p-6 text-white sm:p-8"
                style={{ backgroundColor: primary }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5" />
                      Shrine Pro Conversion · Packs Économiques
                    </span>
                    <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                      {sec.title}
                    </h2>
                    {sec.subtitle && (
                      <p className="mt-1 text-xs text-white/80 sm:text-sm">
                        {sec.subtitle}
                      </p>
                    )}
                  </div>
                  <a
                    href="#catalogue"
                    className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-white"
                    style={{ backgroundColor: secondary }}
                  >
                    Choisir un article éligible →
                  </a>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {items.map((it, idx) => (
                    <div
                      key={it.id}
                      className={`rounded-2xl border p-5 ${
                        idx === 1
                          ? "border-2 border-white bg-white/15"
                          : "border-white/15 bg-white/8"
                      }`}
                    >
                      {it.badge && (
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: secondary }}
                        >
                          {it.badge}
                        </span>
                      )}
                      <h3 className="mt-2 text-base font-extrabold text-white">
                        {it.title}
                      </h3>
                      <p className="mt-1 text-xs text-white/85">{it.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (sec.type === "comparison_table") {
          const items = sec.items ?? [];
          return (
            <section
              key={sec.id}
              className="mx-auto max-w-5xl px-4 pt-14 sm:px-6 lg:px-8"
            >
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 p-6 text-center">
                  <h2 className="text-xl font-extrabold text-[#15232D] sm:text-2xl">
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p className="mt-1 text-xs text-slate-500">{sec.subtitle}</p>
                  )}
                </div>
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC]">
                      <th className="px-4 py-3 font-bold text-[#15232D]">
                        Critère qualité
                      </th>
                      <th
                        className="px-4 py-3 text-center font-extrabold text-white"
                        style={{ backgroundColor: primary }}
                      >
                        {store.name}
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-400">
                        Vendeurs classiques
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td className="px-4 py-3 font-semibold text-[#15232D]">
                          {it.title}
                        </td>
                        <td className="bg-[#E7F7F2]/40 px-4 py-3 text-center">
                          <Check
                            className="mx-auto h-4 w-4"
                            style={{ color: secondary }}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <X className="mx-auto h-4 w-4 text-slate-300" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        }

        if (sec.type === "results_bars") {
          const items = sec.items ?? [];
          return (
            <section
              key={sec.id}
              className="mx-auto max-w-5xl px-4 pt-14 sm:px-6 lg:px-8"
            >
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" style={{ color: secondary }} />
                  <h2 className="text-xl font-extrabold text-[#15232D]">
                    {sec.title}
                  </h2>
                </div>
                {sec.subtitle && (
                  <p className="mt-1 text-xs text-slate-500">{sec.subtitle}</p>
                )}
                <div className="mt-5 space-y-4">
                  {items.map((it) => {
                    const pct = it.percentage ?? 95;
                    return (
                      <div key={it.id}>
                        <div className="flex items-center justify-between text-xs font-bold text-[#15232D]">
                          <span>{it.title}</span>
                          <span style={{ color: secondary }}>{pct} %</span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: secondary,
                            }}
                          />
                        </div>
                        {it.text && (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {it.text}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        if (sec.type === "faq_accordion") {
          const items = sec.items ?? [];
          return (
            <section
              key={sec.id}
              className="mx-auto max-w-4xl px-4 pt-14 sm:px-6 lg:px-8"
            >
              <h2 className="text-center text-xl font-extrabold text-[#15232D] sm:text-2xl">
                {sec.title}
              </h2>
              <div className="mt-6 space-y-2.5">
                {items.map((it) => {
                  const open = openFaqId === it.id;
                  return (
                    <div
                      key={it.id}
                      className="rounded-2xl border border-slate-200 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(open ? null : it.id)}
                        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left text-xs font-bold text-[#15232D] sm:text-sm cursor-pointer"
                      >
                        <span>{it.title}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {open && (
                        <div className="border-t border-slate-100 px-5 py-3.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                          {it.text}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* Si la section featured_collection a été masquée, on garde le catalogue accessible en bas */}
      {!hasFeaturedCollection && catalogSlot}
    </div>
  );
}
