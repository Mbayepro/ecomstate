"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Check,
  Copy,
  Eye,
  EyeOff,
  History,
  Laptop,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CodDynamicForm } from "@/components/storefront/cod-dynamic-form";
import {
  applyAdeshinaToCodDraft,
  COD_FIELD_LIBRARY,
  COD_FORM_PRESETS,
} from "@/lib/cod-form-presets";
import { usePlatform } from "@/lib/platform-store";
import { formatDate } from "@/lib/utils";
import type { CodFieldType, CodFormField, CodFormStyle } from "@/types/domain";

export default function FormBuilderCodPage() {
  const {
    activeStore,
    products,
    getStoreCodForm,
    saveCodFormDraft,
    publishCodForm,
    restoreCodFormVersion,
  } = usePlatform();

  const config = activeStore ? getStoreCodForm(activeStore.id) : null;

  const [fields, setFields] = useState<CodFormField[]>(
    config?.draftFields ?? []
  );
  const [style, setStyle] = useState<CodFormStyle | null>(
    config?.draftStyle ?? null
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    config?.draftFields[0]?.id ?? null
  );
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">(
    "mobile"
  );
  const [newFieldType, setNewFieldType] = useState<CodFieldType>("district");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    setFields(config.draftFields);
    setStyle(config.draftStyle);
    setSelectedFieldId(config.draftFields[0]?.id ?? null);
  }, [activeStore?.id, config?.version]);

  if (!activeStore || !config || !style) return null;

  const storeProducts = products.filter((p) => p.storeId === activeStore.id);
  const demoPreviewProduct = storeProducts[0] ?? {
    id: "preview-prod",
    storeId: activeStore.id,
    categoryId: "preview-cat",
    name: "Produit Démo Aperçu COD",
    slug: "produit-demo",
    description: "Aperçu interactif de votre formulaire COD",
    price: 22000,
    promoPrice: 18500,
    stock: 15,
    lowStockThreshold: 3,
    images: [],
    variants: [],
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  const syncDraft = (nextFields: CodFormField[], nextStyle: CodFormStyle) => {
    const ordered = nextFields.map((f, idx) => ({ ...f, order: idx + 1 }));
    setFields(ordered);
    setStyle(nextStyle);
    saveCodFormDraft(activeStore.id, ordered, nextStyle);
  };

  const handleAddField = () => {
    const lib = COD_FIELD_LIBRARY.find((l) => l.type === newFieldType);
    const id = `fld-${Date.now()}`;
    const created: CodFormField = {
      id,
      name:
        newFieldType === "select" ||
        newFieldType === "radio" ||
        newFieldType === "checkbox" ||
        newFieldType === "short_text" ||
        newFieldType === "long_text"
          ? `custom_${Date.now()}`
          : newFieldType,
      label: lib?.label ?? "Nouveau champ",
      type: newFieldType,
      placeholder: lib?.defaultPlaceholder ?? "",
      required: newFieldType === "phone" || newFieldType === "full_name",
      visible: true,
      order: fields.length + 1,
      options:
        newFieldType === "select" || newFieldType === "radio"
          ? ["Option 1", "Option 2", "Option 3"]
          : undefined,
    };
    const next = [...fields, created];
    syncDraft(next, style);
    setSelectedFieldId(id);
  };

  const handleDuplicateField = (field: CodFormField) => {
    const copy: CodFormField = {
      ...field,
      id: `fld-copy-${Date.now()}`,
      name: `${field.name}_copie`,
      label: `${field.label} (copie)`,
      order: fields.length + 1,
    };
    const next = [...fields, copy];
    syncDraft(next, style);
    setSelectedFieldId(copy.id);
  };

  const handleDeleteField = (id: string) => {
    if (fields.length <= 2) return;
    const next = fields.filter((f) => f.id !== id);
    syncDraft(next, style);
    if (selectedFieldId === id) {
      setSelectedFieldId(next[0]?.id ?? null);
    }
  };

  const handleMoveField = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const clone = [...fields];
    const [moved] = clone.splice(idx, 1);
    clone.splice(targetIdx, 0, moved);
    syncDraft(clone, style);
  };

  const handleUpdateField = (patch: Partial<CodFormField>) => {
    if (!selectedField) return;
    const next = fields.map((f) =>
      f.id === selectedField.id ? { ...f, ...patch } : f
    );
    syncDraft(next, style);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = COD_FORM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const nextFields = preset.fields.map((f, idx) => ({ ...f, order: idx + 1 }));
    setFields(nextFields);
    saveCodFormDraft(activeStore.id, nextFields, style, preset.id);
    setSelectedFieldId(nextFields[0]?.id ?? null);
    setSavedNotice(
      `Modèle « ${preset.name} » chargé dans le brouillon. Cliquez sur Publier pour l'activer sur la boutique.`
    );
  };

  const handleAskAdeshina = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const result = applyAdeshinaToCodDraft(aiPrompt, fields, style);
    syncDraft(result.nextFields, result.nextStyle);
    setAiFeedback(result.summary);
    setAiPrompt("");
  };

  const handlePublish = () => {
    saveCodFormDraft(activeStore.id, fields, style);
    publishCodForm(activeStore.id, "Publication manuelle commerçant");
    setSavedNotice(
      "Formulaire COD publié avec succès ! Vos clients voient désormais cette version sur votre boutique."
    );
    setAiFeedback(null);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* En-tête d'actions */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Module 9 · Form Builder COD</Badge>
            <span className="text-xs font-semibold text-slate-500">
              Version publiée #{config.version}
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold text-[#15232D]">
            Constructeur de Formulaire Paiement à la Livraison
          </h1>
          <p className="text-xs text-slate-600 sm:text-sm">
            Personnalisez vos champs, votre style et vos offres packs. Toute
            modification est d&apos;abord enregistrée en brouillon avant
            publication.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncDraft(fields, style)}
          >
            <Save className="h-4 w-4" />
            Sauvegarder brouillon
          </Button>
          <Button variant="primary" size="md" onClick={handlePublish}>
            <Check className="h-4 w-4" />
            Publier le formulaire
          </Button>
        </div>
      </div>

      {savedNotice && (
        <div className="rounded-xl border border-[#00A884]/40 bg-[#E7F7F2] px-4 py-3 text-xs font-bold text-[#073B35]">
          {savedNotice}
        </div>
      )}

      {/* Assistant Adeshina IA dédié au Form Builder COD (Section 9.13) */}
      <Card className="border-[#00A884]/30 bg-[#073B35] text-white">
        <CardContent className="p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00A884] text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-white">
                  Assistant Form Builder Adeshina IA (Modification sur brouillon
                  avec aperçu)
                </p>
                <p className="text-xs text-[#E7F7F2]">
                  Exemples : « Ajoute un champ quartier », « Crée un formulaire
                  chaussures », « Réduis les champs pour mobile »
                </p>
              </div>
            </div>

            <form onSubmit={handleAskAdeshina} className="flex flex-1 gap-2">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Demandez une adaptation du formulaire à Adeshina IA..."
                className="h-10 flex-1 rounded-xl border border-white/20 bg-[#052B27] px-3.5 text-xs text-white placeholder:text-slate-300 focus:border-[#00A884] focus:outline-none"
              />
              <Button type="submit" variant="primary" size="sm">
                <Sparkles className="h-3.5 w-3.5" />
                Adapter le brouillon
              </Button>
            </form>
          </div>

          {aiFeedback && (
            <div className="mt-3 rounded-xl border border-[#00A884]/40 bg-white/10 px-4 py-2.5 text-xs text-[#E7F7F2]">
              <strong>Adeshina IA :</strong> {aiFeedback}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modèles prêts à l'emploi par niche (Section 9.12) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 text-xs font-bold text-[#15232D]">
          Modèles rapides :
        </span>
        {COD_FORM_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleApplyPreset(preset.id)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              config.presetId === preset.id
                ? "border-[#00A884] bg-[#E7F7F2] text-[#073B35]"
                : "border-[#E2E8F0] bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {preset.niche}
          </button>
        ))}
      </div>

      {/* Grille principale : Éditeur (7 cols) + Aperçu temps réel Mobile/Desktop (5 cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Liste & Ordre des champs */}
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
                <h2 className="text-base font-extrabold text-[#15232D]">
                  1. Champs du formulaire ({fields.length})
                </h2>
                <div className="flex items-center gap-2">
                  <select
                    value={newFieldType}
                    onChange={(e) =>
                      setNewFieldType(e.target.value as CodFieldType)
                    }
                    className="h-9 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#15232D]"
                  >
                    {COD_FIELD_LIBRARY.map((item) => (
                      <option key={item.type} value={item.type}>
                        + {item.label}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" variant="secondary" onClick={handleAddField}>
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {fields.map((f, idx) => {
                  const selected = f.id === selectedFieldId;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFieldId(f.id)}
                      className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition cursor-pointer ${
                        selected
                          ? "border-[#00A884] bg-[#E7F7F2]/40"
                          : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#15232D]">
                            {idx + 1}. {f.label}
                          </span>
                          {f.required && (
                            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                              Obligatoire
                            </span>
                          )}
                          {!f.visible && (
                            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              Masqué
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-slate-500">
                          Type : {f.type} · Clé : {f.name}
                        </p>
                      </div>

                      <div
                        className="flex shrink-0 items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, -1)}
                          className="rounded p-1 text-slate-500 hover:bg-white cursor-pointer"
                          title="Monter"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, +1)}
                          className="rounded p-1 text-slate-500 hover:bg-white cursor-pointer"
                          title="Descendre"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            syncDraft(
                              fields.map((it) =>
                                it.id === f.id
                                  ? { ...it, visible: !it.visible }
                                  : it
                              ),
                              style
                            )
                          }
                          className="rounded p-1 text-slate-500 hover:bg-white cursor-pointer"
                          title="Afficher / Masquer"
                        >
                          {f.visible ? (
                            <Eye className="h-3.5 w-3.5 text-[#00A884]" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateField(f)}
                          className="rounded p-1 text-slate-500 hover:bg-white cursor-pointer"
                          title="Dupliquer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(f.id)}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          title="Supprimer"
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

          {/* 2. Propriétés du champ sélectionné */}
          {selectedField && (
            <Card>
              <CardContent className="space-y-4 p-5">
                <h3 className="text-sm font-extrabold text-[#15232D]">
                  2. Paramètres du champ « {selectedField.label} »
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600">
                      Libellé affiché
                    </label>
                    <input
                      value={selectedField.label}
                      onChange={(e) =>
                        handleUpdateField({ label: e.target.value })
                      }
                      className="mt-1 h-9.5 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs font-semibold text-[#15232D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600">
                      Texte indicatif (Placeholder)
                    </label>
                    <input
                      value={selectedField.placeholder ?? ""}
                      onChange={(e) =>
                        handleUpdateField({ placeholder: e.target.value })
                      }
                      className="mt-1 h-9.5 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs text-[#15232D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Texte d&apos;aide sous le champ (optionnel)
                  </label>
                  <input
                    value={selectedField.helpText ?? ""}
                    onChange={(e) =>
                      handleUpdateField({ helpText: e.target.value })
                    }
                    placeholder="Ex : Le livreur appellera sur ce numéro avant son passage"
                    className="mt-1 h-9.5 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs text-[#15232D]"
                  />
                </div>

                {(selectedField.type === "select" ||
                  selectedField.type === "radio") && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600">
                      Options disponibles (séparées par des virgules)
                    </label>
                    <input
                      value={(selectedField.options ?? []).join(", ")}
                      onChange={(e) =>
                        handleUpdateField({
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Ex : S, M, L, XL"
                      className="mt-1 h-9.5 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs text-[#15232D]"
                    />
                  </div>
                )}

                {/* Logique conditionnelle (Section 9.8) */}
                <div className="grid gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600">
                      Afficher seulement si le champ :
                    </label>
                    <select
                      value={selectedField.conditionalFieldName ?? ""}
                      onChange={(e) =>
                        handleUpdateField({
                          conditionalFieldName: e.target.value || undefined,
                        })
                      }
                      className="mt-1 h-8.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs"
                    >
                      <option value="">Toujours visible (aucune condition)</option>
                      {fields
                        .filter((f) => f.id !== selectedField.id)
                        .map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.label} ({f.name})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600">
                      Est égal à la valeur (vide = rempli) :
                    </label>
                    <input
                      value={selectedField.conditionalEquals ?? ""}
                      onChange={(e) =>
                        handleUpdateField({
                          conditionalEquals: e.target.value || undefined,
                        })
                      }
                      placeholder="Ex : Oui ou Cotonou"
                      className="mt-1 h-8.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-5 pt-1 text-xs font-semibold text-[#15232D]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(e) =>
                        handleUpdateField({ required: e.target.checked })
                      }
                      className="h-4 w-4 accent-[#00A884]"
                    />
                    <span>Champ obligatoire</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedField.visible}
                      onChange={(e) =>
                        handleUpdateField({ visible: e.target.checked })
                      }
                      className="h-4 w-4 accent-[#00A884]"
                    />
                    <span>Visible sur la boutique</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Style visuel & Conversion COD */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <h3 className="text-sm font-extrabold text-[#15232D]">
                3. Apparence visuelle & Bouton COD
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Titre du formulaire
                  </label>
                  <input
                    value={style.title}
                    onChange={(e) =>
                      syncDraft(fields, { ...style, title: e.target.value })
                    }
                    className="mt-1 h-9.5 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Texte du bouton de validation COD
                  </label>
                  <input
                    value={style.buttonLabel}
                    onChange={(e) =>
                      syncDraft(fields, {
                        ...style,
                        buttonLabel: e.target.value,
                      })
                    }
                    className="mt-1 h-9.5 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">
                    Bouton COD
                  </label>
                  <input
                    type="color"
                    value={style.buttonBg}
                    onChange={(e) =>
                      syncDraft(fields, { ...style, buttonBg: e.target.value })
                    }
                    className="mt-1 h-9 w-full rounded border border-[#E2E8F0] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">
                    Fond champs
                  </label>
                  <input
                    type="color"
                    value={style.fieldBg}
                    onChange={(e) =>
                      syncDraft(fields, { ...style, fieldBg: e.target.value })
                    }
                    className="mt-1 h-9 w-full rounded border border-[#E2E8F0] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">
                    Bordures
                  </label>
                  <input
                    type="color"
                    value={style.borderColor}
                    onChange={(e) =>
                      syncDraft(fields, {
                        ...style,
                        borderColor: e.target.value,
                      })
                    }
                    className="mt-1 h-9 w-full rounded border border-[#E2E8F0] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">
                    Arrondis
                  </label>
                  <select
                    value={style.borderRadius}
                    onChange={(e) =>
                      syncDraft(fields, {
                        ...style,
                        borderRadius: e.target
                          .value as CodFormStyle["borderRadius"],
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-[#E2E8F0] px-2 text-xs"
                  >
                    <option value="sm">Carré léger</option>
                    <option value="md">Moyen</option>
                    <option value="lg">Arrondi moderne</option>
                    <option value="xl">Très arrondi</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 pt-1 text-xs font-semibold text-[#15232D]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={style.enableQuantityBreaks}
                    onChange={(e) =>
                      syncDraft(fields, {
                        ...style,
                        enableQuantityBreaks: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#00A884]"
                  />
                  <span>Activer les Offres Packs (1x, Duo -5%, Trio -10%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={style.showOrderSummary}
                    onChange={(e) =>
                      syncDraft(fields, {
                        ...style,
                        showOrderSummary: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#00A884]"
                  />
                  <span>Afficher le récapitulatif Total à la livraison</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* 4. Historique des versions publiées & Restauration */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#073B35]" />
                <h3 className="text-sm font-extrabold text-[#15232D]">
                  Historique des versions publiées
                </h3>
              </div>
              <div className="mt-3 space-y-2">
                {config.versionsHistory.map((ver) => (
                  <div
                    key={ver.version}
                    className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#15232D]">
                        v{ver.version} — {ver.label}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(ver.savedAt)} · {ver.fields.length} champs
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        restoreCodFormVersion(activeStore.id, ver.version);
                        setFields(ver.fields);
                        setStyle(ver.style);
                        setSavedNotice(
                          `Version v${ver.version} chargée dans le brouillon.`
                        );
                      }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restaurer
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Aperçu en temps réel (Mobile / Desktop) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5">
              <span className="text-xs font-extrabold text-[#15232D]">
                Aperçu en direct (Brouillon)
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-[#073B35] text-white"
                      : "text-slate-600"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                    previewDevice === "desktop"
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
              className={`mx-auto transition-all ${
                previewDevice === "mobile"
                  ? "max-w-[375px] rounded-[28px] border-4 border-[#15232D] bg-[#F8FAFC] p-3 shadow-xl"
                  : "w-full"
              }`}
            >
              <CodDynamicForm
                store={activeStore}
                fields={fields}
                style={style}
                items={[]}
                singleProduct={demoPreviewProduct}
                previewMode
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
