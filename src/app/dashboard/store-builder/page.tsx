"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Laptop,
  Lock,
  Plus,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShrineSectionsRenderer } from "@/components/storefront/shrine-sections";
import { canUseModule } from "@/lib/permissions";
import { usePlatform } from "@/lib/platform-store";
import {
  createDefaultShrineSections,
  ECOMSATE_THEMES,
} from "@/lib/shrine-themes";
import type {
  StoreSectionBlock,
  StoreSectionType,
  StoreTemplateId,
} from "@/types/domain";

const SECTION_TYPE_LABELS: Record<StoreSectionType, string> = {
  announcement_bar: "Barre d'annonce COD supérieure",
  hero_shrine: "Bannière Hero Shrine Pro",
  ticker_marquee: "Bandeau défilant (Ticker)",
  categories_rail: "Grille des catégories",
  featured_collection: "Catalogue produits principal",
  benefits_grid: "Grille des 4 avantages COD",
  bundle_deals: "Offres Packs Économiques (1x / 2x / 3x)",
  comparison_table: "Tableau comparatif (Votre marque vs Autres)",
  results_bars: "Barres de résultats & satisfaction (%)",
  faq_accordion: "Questions fréquentes (Accordéon FAQ)",
};

export default function StoreBuilderPage() {
  const {
    activeStore,
    categories,
    products,
    modules,
    updateStoreBuilderSections,
    updateStoreSettings,
    applyStoreTheme,
  } = usePlatform();

  const [sections, setSections] = useState<StoreSectionBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newSecType, setNewSecType] =
    useState<StoreSectionType>("benefits_grid");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "mobile"
  );
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (!activeStore) return;
    const initial =
      activeStore.settings.builderSections &&
      activeStore.settings.builderSections.length > 0
        ? activeStore.settings.builderSections
        : createDefaultShrineSections(
            activeStore.name,
            activeStore.settings.template
          );
    setSections(initial);
    setSelectedId(initial[0]?.id ?? null);
  }, [activeStore?.id, activeStore?.settings.template]);

  if (!activeStore) return null;

  const canUsePremiumThemes = canUseModule(
    activeStore.planCode,
    "premium_themes",
    modules
  );
  const storeCategories = categories.filter(
    (c) => c.storeId === activeStore.id
  );
  const storeProducts = products.filter(
    (p) => p.storeId === activeStore.id && p.isActive
  );

  const selectedSection = sections.find((s) => s.id === selectedId) ?? null;

  const handleSelectTheme = (themeId: StoreTemplateId) => {
    const res = applyStoreTheme(activeStore.id, themeId);
    if (!res.ok) {
      setFeedback({ type: "err", msg: res.error ?? "Action non disponible." });
      return;
    }
    const fresh = createDefaultShrineSections(activeStore.name, themeId);
    setSections(fresh);
    setSelectedId(fresh[0]?.id ?? null);
    setFeedback({
      type: "ok",
      msg: `Thème appliqué avec succès ! Vous pouvez maintenant personnaliser chaque section ci-dessous.`,
    });
  };

  const handleMove = (idx: number, dir: -1 | 1) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= sections.length) return;
    const copy = [...sections];
    const [moved] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, moved);
    setSections(copy.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleAddSection = () => {
    const created: StoreSectionBlock = {
      id: `sec-${Date.now()}`,
      type: newSecType,
      title: SECTION_TYPE_LABELS[newSecType],
      subtitle: "Sous-titre personnalisable",
      visible: true,
      order: sections.length + 1,
      items:
        newSecType === "faq_accordion"
          ? [
              {
                id: `it-${Date.now()}`,
                title: "Comment régler ma commande ?",
                text: "Vous réglez en espèces directement au livreur à la réception.",
              },
            ]
          : newSecType === "benefits_grid" ||
            newSecType === "bundle_deals" ||
            newSecType === "comparison_table" ||
            newSecType === "results_bars" ||
            newSecType === "ticker_marquee"
          ? [
              {
                id: `it-${Date.now()}-1`,
                title: "Engagement qualité #1",
                text: "Détail rassurant pour vos acheteurs COD",
                percentage: 98,
              },
              {
                id: `it-${Date.now()}-2`,
                title: "Livraison rapide #2",
                text: "Expédition suivie jusqu'à votre porte",
                percentage: 100,
              },
            ]
          : undefined,
    };
    const next = [...sections, created];
    setSections(next);
    setSelectedId(created.id);
  };

  const handleDuplicateSection = (sec: StoreSectionBlock) => {
    const copy: StoreSectionBlock = {
      ...sec,
      id: `sec-copy-${Date.now()}`,
      title: `${sec.title} (copie)`,
      order: sections.length + 1,
    };
    const next = [...sections, copy];
    setSections(next);
    setSelectedId(copy.id);
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) return;
    const next = sections
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setSections(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
    }
  };

  const handlePublishStore = () => {
    updateStoreBuilderSections(activeStore.id, sections, true);
    setFeedback({
      type: "ok",
      msg: `Boutique publiée (v${(activeStore.settings.publishedVersion ?? 1) + 1}) ! Toutes vos sections Shrine sont en ligne.`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Barre supérieure */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Module 8 · Store Builder Modulaire</Badge>
            <span className="text-xs font-semibold text-slate-500">
              Version #{activeStore.settings.publishedVersion ?? 1}
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold text-[#15232D]">
            Constructeur de Boutique & Thèmes Shrine Pro
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm">
            Choisissez votre thème, réorganisez vos sections de vente et
            prévisualisez le rendu mobile en temps réel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={`/s/${activeStore.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              Voir la boutique en ligne
            </Button>
          </Link>
          <Button variant="primary" size="md" onClick={handlePublishStore}>
            <Check className="h-4 w-4" />
            Publier les changements
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-bold ${
            feedback.type === "ok"
              ? "border-[#00A884]/40 bg-[#E7F7F2] text-[#073B35]"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          {feedback.msg}{" "}
          {feedback.type === "err" && (
            <Link
              href="/dashboard/abonnement"
              className="ml-2 underline text-[#073B35]"
            >
              Passer au Plan Premium →
            </Link>
          )}
        </div>
      )}

      {/* 1. Sélecteur de Thèmes (Shrine Pro 1 Standard & Shrine Pro 3 Premium) */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#15232D]">
              1. Bibliothèque de Thèmes EcomSate
            </h2>
            <span className="text-xs text-slate-500">
              Plan actif :{" "}
              <strong className="uppercase text-[#073B35]">
                {activeStore.planCode}
              </strong>
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ECOMSATE_THEMES.map((theme) => {
              const isCurrent = activeStore.settings.template === theme.id;
              const locked = theme.tier === "premium" && !canUsePremiumThemes;
              return (
                <div
                  key={theme.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                    isCurrent
                      ? "border-2 border-[#00A884] bg-[#E7F7F2]/40"
                      : "border-[#E2E8F0] bg-[#F8FAFC]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-[#15232D]">
                        {theme.name}
                      </span>
                      <Badge
                        variant={
                          theme.tier === "premium" ? "warning" : "success"
                        }
                      >
                        {theme.badge}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {theme.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-2">
                    <Button
                      size="sm"
                      variant={isCurrent ? "primary" : "outline"}
                      className="w-full"
                      onClick={() => handleSelectTheme(theme.id)}
                    >
                      {locked ? (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          Débloquer en Premium
                        </>
                      ) : isCurrent ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Thème actif
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          Appliquer ce thème
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Constructeur de sections + Aperçu */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          {/* Couleurs globales */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <h3 className="text-sm font-extrabold text-[#15232D]">
                Identité visuelle de la boutique
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Couleur principale
                  </label>
                  <input
                    type="color"
                    value={activeStore.settings.primaryColor}
                    onChange={(e) =>
                      updateStoreSettings(activeStore.id, {
                        primaryColor: e.target.value,
                      })
                    }
                    className="mt-1 h-9.5 w-full rounded border border-[#E2E8F0] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Couleur d&apos;action COD
                  </label>
                  <input
                    type="color"
                    value={activeStore.settings.secondaryColor}
                    onChange={(e) =>
                      updateStoreSettings(activeStore.id, {
                        secondaryColor: e.target.value,
                      })
                    }
                    className="mt-1 h-9.5 w-full rounded border border-[#E2E8F0] cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections modulaires */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3.5">
                <h3 className="text-sm font-extrabold text-[#15232D]">
                  Sections de la page ({sections.length})
                </h3>
                <div className="flex gap-1.5">
                  <select
                    value={newSecType}
                    onChange={(e) =>
                      setNewSecType(e.target.value as StoreSectionType)
                    }
                    className="h-8.5 max-w-44 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 text-xs font-semibold"
                  >
                    {Object.entries(SECTION_TYPE_LABELS).map(([k, lbl]) => (
                      <option key={k} value={k}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" variant="secondary" onClick={handleAddSection}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {sections.map((sec, idx) => {
                  const active = sec.id === selectedId;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedId(sec.id)}
                      className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-xs transition cursor-pointer ${
                        active
                          ? "border-[#00A884] bg-[#E7F7F2]/40"
                          : "border-[#E2E8F0] bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#15232D]">
                          {idx + 1}. {sec.title}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {SECTION_TYPE_LABELS[sec.type]}
                        </p>
                      </div>

                      <div
                        className="flex shrink-0 items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleMove(idx, -1)}
                          className="rounded p-1 text-slate-500 hover:bg-white cursor-pointer"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, +1)}
                          className="rounded p-1 text-slate-500 hover:bg-white cursor-pointer"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSections((prev) =>
                              prev.map((it) =>
                                it.id === sec.id
                                  ? { ...it, visible: !it.visible }
                                  : it
                              )
                            )
                          }
                          className="rounded p-1 text-slate-500 hover:bg-white cursor-pointer"
                        >
                          {sec.visible ? (
                            <Eye className="h-3.5 w-3.5 text-[#00A884]" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateSection(sec)}
                          className="rounded p-1 text-slate-500 hover:bg-white cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sec.id)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Édition du bloc sélectionné */}
          {selectedSection && (
            <Card>
              <CardContent className="space-y-3 p-5">
                <h3 className="text-sm font-extrabold text-[#15232D]">
                  Modifier : {SECTION_TYPE_LABELS[selectedSection.type]}
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Titre principal
                  </label>
                  <input
                    value={selectedSection.title}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s) =>
                          s.id === selectedSection.id
                            ? { ...s, title: e.target.value }
                            : s
                        )
                      )
                    }
                    className="mt-1 h-9.5 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Sous-titre (optionnel)
                  </label>
                  <input
                    value={selectedSection.subtitle ?? ""}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s) =>
                          s.id === selectedSection.id
                            ? { ...s, subtitle: e.target.value }
                            : s
                        )
                      )
                    }
                    className="mt-1 h-9.5 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>

                {selectedSection.items && selectedSection.items.length > 0 && (
                  <div className="space-y-2 border-t border-[#E2E8F0] pt-3">
                    <p className="text-xs font-bold text-slate-600">
                      Éléments internes ({selectedSection.items.length})
                    </p>
                    {selectedSection.items.map((it) => (
                      <div
                        key={it.id}
                        className="space-y-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5"
                      >
                        <input
                          value={it.title}
                          onChange={(e) =>
                            setSections((prev) =>
                              prev.map((s) =>
                                s.id === selectedSection.id
                                  ? {
                                      ...s,
                                      items: (s.items ?? []).map((sub) =>
                                        sub.id === it.id
                                          ? { ...sub, title: e.target.value }
                                          : sub
                                      ),
                                    }
                                  : s
                              )
                            )
                          }
                          className="h-8 w-full rounded border border-[#E2E8F0] bg-white px-2 text-xs font-bold"
                        />
                        <input
                          value={it.text}
                          onChange={(e) =>
                            setSections((prev) =>
                              prev.map((s) =>
                                s.id === selectedSection.id
                                  ? {
                                      ...s,
                                      items: (s.items ?? []).map((sub) =>
                                        sub.id === it.id
                                          ? { ...sub, text: e.target.value }
                                          : sub
                                      ),
                                    }
                                  : s
                              )
                            )
                          }
                          placeholder="Texte / Détail"
                          className="h-8 w-full rounded border border-[#E2E8F0] bg-white px-2 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Aperçu en direct */}
        <div className="lg:col-span-7">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5">
              <span className="text-xs font-extrabold text-[#15232D]">
                Aperçu en temps réel de la vitrine
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                    previewMode === "mobile"
                      ? "bg-[#073B35] text-white"
                      : "text-slate-600"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                    previewMode === "desktop"
                      ? "bg-[#073B35] text-white"
                      : "text-slate-600"
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  Desktop
                </button>
              </div>
            </div>

            <div
              className={`mx-auto max-h-[780px] overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] shadow-inner ${
                previewMode === "mobile" ? "max-w-[390px]" : "w-full"
              }`}
            >
              <ShrineSectionsRenderer
                store={activeStore}
                sections={sections}
                categories={storeCategories}
                products={storeProducts}
                onSelectCategory={() => {}}
                catalogSlot={
                  <div className="px-4 py-8 text-center">
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
                      <p className="text-xs font-bold text-[#15232D]">
                        Grille du Catalogue ({storeProducts.length} produit(s)
                        actif(s))
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Vos articles réels et filtres s&apos;affichent à cet
                        emplacement exact.
                      </p>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
