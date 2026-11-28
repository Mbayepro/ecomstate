"use client";

import { useState } from "react";
import {
  AlertCircle,
  Download,
  Edit2,
  LayoutGrid,
  List,
  Minus,
  Package,
  Plus,
  Search,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/ui/motion";
import {
  DashboardPageHeader,
  StatMetricCard,
} from "@/components/dashboard/page-header";
import { MultiImageUploadField } from "@/components/ui/image-upload-field";
import { ProductDescriptionMediaField } from "@/components/dashboard/product-description-media-field";
import { ProductPromoPosterModal } from "@/components/dashboard/product-promo-poster-modal";
import { VoiceProductDictation } from "@/components/dashboard/voice-product-dictation";
import { usePlatform } from "@/lib/platform-store";
import { getModuleLimit } from "@/lib/permissions";
import { generateProductCopyWithAdeshina } from "@/lib/adeshina-ai";
import { formatCurrency } from "@/lib/utils";
import type {
  Product,
  ProductDescriptionMedia,
  ProductVariant,
} from "@/types/domain";

export default function DashboardProduitsPage() {
  const {
    activeStore,
    products,
    categories,
    modules,
    saveProduct,
    deleteProduct,
    toggleProductActive,
    adjustStock,
  } = usePlatform();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "hidden" | "out"
  >("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [posterProduct, setPosterProduct] = useState<Product | null>(null);

  // États du formulaire enrichi (Section 7.2)
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [additionalCost, setAdditionalCost] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionMedia, setDescriptionMedia] = useState<
    ProductDescriptionMedia[]
  >([]);
  const [imagesText, setImagesText] = useState("");
  const [variantsText, setVariantsText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  if (!activeStore) return null;

  const storeProducts = products.filter((p) => p.storeId === activeStore.id);
  const storeCategories = categories.filter(
    (c) => c.storeId === activeStore.id
  );
  const maxProducts = getModuleLimit(
    activeStore.planCode,
    "products_catalog",
    modules
  );
  const limitReached =
    maxProducts !== null && storeProducts.length >= maxProducts;

  const availableCount = storeProducts.filter(
    (p) => p.isActive && p.stock > 0
  ).length;
  const outCount = storeProducts.filter((p) => p.stock === 0).length;
  const promoCount = storeProducts.filter((p) => Boolean(p.promoPrice)).length;
  const stockValuation = storeProducts.reduce(
    (sum, p) => sum + (p.promoPrice ?? p.price) * p.stock,
    0
  );

  const filtered = storeProducts.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku ?? "").toLowerCase().includes(q);
    const matchesCat = catFilter === "all" || p.categoryId === catFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.isActive) ||
      (statusFilter === "hidden" && !p.isActive) ||
      (statusFilter === "out" && p.stock === 0);
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Calcul temps réel de la marge brute dans la modale
  const sellPriceNum = Number(promoPrice || price) || 0;
  const totalUnitCostNum =
    (Number(costPrice) || 0) + (Number(additionalCost) || 0);
  const unitMarginNum = sellPriceNum - totalUnitCostNum;
  const marginPctNum =
    sellPriceNum > 0 ? Math.round((unitMarginNum / sellPriceNum) * 100) : 0;

  const openNew = () => {
    setEditing(null);
    setName("");
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategoryId(storeCategories[0]?.id ?? "");
    setCostPrice("");
    setAdditionalCost("");
    setPrice("");
    setPromoPrice("");
    setStock("10");
    setLowStockThreshold("5");
    setShortDescription("");
    setDescription("");
    setDescriptionMedia([]);
    setImagesText("");
    setVariantsText("");
    setIsActive(true);
    setIsPopular(false);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setSku(p.sku ?? "");
    setCategoryId(p.categoryId);
    setCostPrice(p.costPrice ? String(p.costPrice) : "");
    setAdditionalCost(p.additionalCost ? String(p.additionalCost) : "");
    setPrice(String(p.price));
    setPromoPrice(p.promoPrice ? String(p.promoPrice) : "");
    setStock(String(p.stock));
    setLowStockThreshold(String(p.lowStockThreshold));
    setShortDescription(p.shortDescription ?? "");
    setDescription(p.description);
    setDescriptionMedia(p.descriptionMedia ?? []);
    setImagesText(p.images.join("\n"));
    setVariantsText(p.variants.map((v) => `${v.name}:${v.value}`).join(", "));
    setIsActive(p.isActive);
    setIsPopular(Boolean(p.isPopular));
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const images = imagesText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedVariants: ProductVariant[] = variantsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair, idx) => {
        const [vName, vVal] = pair.split(":").map((x) => x.trim());
        return {
          id: `v-${Date.now()}-${idx}`,
          name: vName || "Option",
          value: vVal || vName || "Standard",
          stock: Math.max(1, Math.floor(Number(stock) / 2) || 1),
        };
      });

    saveProduct(activeStore.id, {
      id: editing?.id,
      name: name.trim(),
      sku: sku.trim() || undefined,
      categoryId: categoryId || storeCategories[0]?.id || "",
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim(),
      descriptionMedia:
        descriptionMedia.length > 0 ? descriptionMedia : undefined,
      costPrice: Number(costPrice) || 0,
      additionalCost: Number(additionalCost) || 0,
      price: Number(price) || 0,
      promoPrice: promoPrice ? Number(promoPrice) : null,
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      images:
        images.length > 0
          ? images
          : [
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
            ],
      variants: parsedVariants,
      isActive,
      isPopular,
    });

    setModalOpen(false);
  };

  const handleExportCsv = () => {
    const header = [
      "Nom",
      "SKU",
      "CoutAchat",
      "CoutAdditionnel",
      "PrixVente",
      "PrixPromo",
      "MargeUnitaire",
      "Stock",
      "Statut",
    ];
    const rows = storeProducts.map((p) => {
      const sell = p.promoPrice ?? p.price;
      const cost = (p.costPrice ?? 0) + (p.additionalCost ?? 0);
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku ?? "",
        p.costPrice ?? 0,
        p.additionalCost ?? 0,
        p.price,
        p.promoPrice ?? "",
        sell - cost,
        p.stock,
        p.isActive ? "Actif" : "Masque",
      ].join(";");
    });
    const csvContent = "\uFEFF" + [header.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `catalogue-${activeStore.slug}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = () => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    let imported = 0;
    let skipped = 0;
    for (const line of lines) {
      if (line.toLowerCase().startsWith("nom;")) continue;
      const cols = line.split(/[;,]/).map((c) => c.replace(/^"|"$/g, "").trim());
      const [pName, pSku, pCost, pSell, pStock] = cols;
      if (!pName || !pSell) continue;

      const exists = storeProducts.some(
        (ex) =>
          ex.name.toLowerCase() === pName.toLowerCase() ||
          (pSku && ex.sku?.toLowerCase() === pSku.toLowerCase())
      );
      if (exists) {
        skipped++;
        continue;
      }

      saveProduct(activeStore.id, {
        name: pName,
        sku: pSku || undefined,
        categoryId: storeCategories[0]?.id ?? "",
        description: `${pName} — Disponible en livraison COD.`,
        costPrice: Number(pCost) || 0,
        price: Number(pSell) || 0,
        promoPrice: null,
        stock: Number(pStock) || 10,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
        ],
        variants: [],
        isActive: true,
        isPopular: false,
      });
      imported++;
    }

    setCsvFeedback(
      `${imported} produit(s) importé(s) avec succès${
        skipped > 0 ? ` (${skipped} doublon(s) ignoré(s))` : ""
      }.`
    );
    setCsvText("");
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Module 7 · Catalogue & Rentabilité"
        title="Produits, Coûts & Marges"
        description={
          <span>
            {storeProducts.length} article(s) enregistré(s)
            {maxProducts !== null
              ? ` · Limite ${maxProducts} (${activeStore.planCode})`
              : " · Capacité illimitée"}
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCsvFeedback(null);
                setCsvModalOpen(true);
              }}
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="primary" onClick={openNew} disabled={limitReached}>
              <Plus className="h-4 w-4" />
              Nouveau produit
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatMetricCard
          compact
          label="Produits disponibles"
          value={<AnimatedNumber value={availableCount} />}
          subtext={`Sur ${storeProducts.length} au catalogue`}
          icon={Package}
          tone="emerald"
        />
        <StatMetricCard
          compact
          label="Produits en rupture"
          value={<AnimatedNumber value={outCount} />}
          subtext={outCount > 0 ? "À réapprovisionner" : "Aucune rupture"}
          icon={AlertCircle}
          tone={outCount > 0 ? "rose" : "slate"}
        />
        <StatMetricCard
          compact
          label="En promotion"
          value={<AnimatedNumber value={promoCount} />}
          subtext="Prix barrés actifs"
          icon={Tag}
          tone="sky"
        />
        <StatMetricCard
          compact
          label="Valeur du stock"
          value={
            <AnimatedNumber
              value={stockValuation}
              suffix={` ${activeStore.currency}`}
            />
          }
          subtext="Valorisation marchande"
          icon={Wallet}
          tone="navy"
        />
      </div>

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-56 max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou SKU..."
              className="h-9.5 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-xs font-medium text-[#15232D] focus:border-[#00A884] focus:outline-none"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-9.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#15232D]"
          >
            <option value="all">Toutes catégories</option>
            {storeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "all" | "active" | "hidden" | "out"
              )
            }
            className="h-9.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#15232D]"
          >
            <option value="all">Tous états</option>
            <option value="active">Actifs</option>
            <option value="hidden">Masqués</option>
            <option value="out">En rupture</option>
          </select>
        </div>

        <div className="hidden items-center rounded-xl border border-[#E2E8F0] bg-white p-1 md:inline-flex">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`rounded-lg p-1.5 cursor-pointer ${
              viewMode === "table"
                ? "bg-[#073B35] text-white"
                : "text-slate-400 hover:text-[#15232D]"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-1.5 cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#073B35] text-white"
                : "text-slate-400 hover:text-[#15232D]"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-2.5 text-sm font-semibold text-[#15232D]">
              Aucun produit dans votre catalogue
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ajoutez votre premier article ou importez une liste CSV.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#E2E8F0] bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Produit & SKU</th>
                    <th className="px-4 py-3">Prix de vente</th>
                    <th className="px-4 py-3">Coût revient</th>
                    <th className="px-4 py-3">Marge brute</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filtered.map((p) => {
                    const sell = p.promoPrice ?? p.price;
                    const cost = (p.costPrice ?? 0) + (p.additionalCost ?? 0);
                    const margin = sell - cost;
                    const marginPct =
                      sell > 0 ? Math.round((margin / sell) * 100) : 0;

                    return (
                      <tr key={p.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-11 w-11 shrink-0 rounded-xl border border-[#E2E8F0] object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#15232D]">
                                {p.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {p.sku ? `${p.sku} · ` : ""}
                                {p.variants.length} variante(s)
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-[#15232D]">
                            {formatCurrency(sell, activeStore.currency)}
                          </p>
                          {p.promoPrice && (
                            <p className="text-xs text-slate-400 line-through">
                              {formatCurrency(p.price, activeStore.currency)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          {cost > 0
                            ? formatCurrency(cost, activeStore.currency)
                            : "Non renseigné"}
                        </td>
                        <td className="px-4 py-3.5">
                          {cost > 0 ? (
                            <span
                              className={`text-xs font-extrabold ${
                                margin >= 0 ? "text-[#00A884]" : "text-rose-600"
                              }`}
                            >
                              {formatCurrency(margin, activeStore.currency)} (
                              {marginPct} %)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                adjustStock(
                                  activeStore.id,
                                  p.id,
                                  -1,
                                  "Ajustement rapide (-1)"
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span
                              className={`min-w-8 text-center text-xs font-extrabold ${
                                p.stock === 0
                                  ? "text-rose-600"
                                  : p.stock <= p.lowStockThreshold
                                  ? "text-amber-600"
                                  : "text-[#15232D]"
                              }`}
                            >
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                adjustStock(
                                  activeStore.id,
                                  p.id,
                                  +1,
                                  "Ajustement rapide (+1)"
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() =>
                              toggleProductActive(activeStore.id, p.id)
                            }
                            className="cursor-pointer"
                          >
                            <Badge variant={p.isActive ? "success" : "default"}>
                              {p.isActive ? "Actif" : "Masqué"}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setPosterProduct(p)}
                              title="Générer une affiche Statut WhatsApp / TikTok"
                              className="inline-flex items-center gap-1 rounded-lg border border-[#00A884]/35 bg-[#E7F7F2]/60 px-2.5 py-1.5 text-xs font-extrabold text-[#073B35] hover:bg-[#00A884] hover:text-white cursor-pointer"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                              Affiche
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(activeStore.id, p.id)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Import CSV Guidé */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h2 className="text-base font-extrabold text-[#15232D]">
                Import CSV guidé des produits (Détection anti-doublon)
              </h2>
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              Format par ligne :{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-bold">
                Nom;SKU;CoutAchat;PrixVente;Stock
              </code>
            </p>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Montre Connectée Pro;MTR-001;9500;24000;15\nSac Cuir Élégance;SAC-002;12000;29500;8`}
              className="mt-3 w-full rounded-xl border border-[#E2E8F0] p-3 font-mono text-xs"
            />

            {csvFeedback && (
              <p className="mt-3 rounded-lg bg-[#E7F7F2] px-3 py-2 text-xs font-bold text-[#073B35]">
                {csvFeedback}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCsvModalOpen(false)}>
                Fermer
              </Button>
              <Button variant="primary" onClick={handleImportCsv}>
                Importer les produits
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout / Édition Produit avec calcul Marge & Adeshina IA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#15232D]">
                  {editing ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <p className="text-xs text-slate-500">
                  Calculez automatiquement votre marge nette par vente livrée
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <VoiceProductDictation
                onApply={(parsed) => {
                  setName(parsed.name);
                  if (parsed.costPrice) setCostPrice(parsed.costPrice);
                  if (parsed.price) setPrice(parsed.price);
                  if (parsed.promoPrice) setPromoPrice(parsed.promoPrice);
                  if (parsed.stock) setStock(parsed.stock);
                  setShortDescription(parsed.shortDescription);
                  setDescription(parsed.description);
                  if (!variantsText) setVariantsText(parsed.variantsText);
                }}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Nom du produit *"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex : Ensemble Lin Brodé"
                  />
                </div>
                <Input
                  label="SKU / Référence"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU-001"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-[#15232D]">
                    Catégorie
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1.5 h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm"
                  >
                    {storeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Stock initial *"
                  type="number"
                  required
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
                <Input
                  label="Seuil d'alerte stock"
                  type="number"
                  min={0}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                />
              </div>

              {/* Bloc Prix, Coût d'achat & Calculateur de Marge */}
              <div className="rounded-xl border border-[#00A884]/30 bg-[#E7F7F2]/40 p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <Input
                    label="Prix d'achat"
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="Coût fournisseur"
                  />
                  <Input
                    label="Coût additionnel"
                    type="number"
                    min={0}
                    value={additionalCost}
                    onChange={(e) => setAdditionalCost(e.target.value)}
                    placeholder="Emballage..."
                  />
                  <Input
                    label="Prix de vente *"
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <Input
                    label="Prix promo"
                    type="number"
                    min={0}
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    placeholder="Optionnel"
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between text-xs font-bold text-[#073B35]">
                  <span>
                    Coût de revient total :{" "}
                    {formatCurrency(totalUnitCostNum, activeStore.currency)}
                  </span>
                  <span>
                    Marge brute estimée :{" "}
                    <strong
                      className={
                        unitMarginNum >= 0 ? "text-[#00A884]" : "text-rose-600"
                      }
                    >
                      {formatCurrency(unitMarginNum, activeStore.currency)} (
                      {marginPctNum} %)
                    </strong>
                  </span>
                </div>
              </div>

              <Input
                label="Accroche courte (affichée sous le titre produit)"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Ex : Tissu respirant haute tenue — Vérification à la livraison"
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#15232D]">
                    Description complète
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = generateProductCopyWithAdeshina(
                        name || "Article"
                      );
                      setShortDescription(generated.shortDescription);
                      setDescription(generated.description);
                      if (!costPrice)
                        setCostPrice(String(generated.suggestedCostPrice));
                      if (!price) setPrice(String(generated.suggestedPrice));
                      if (!promoPrice)
                        setPromoPrice(String(generated.suggestedPromoPrice));
                      if (!variantsText)
                        setVariantsText(generated.suggestedVariants);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#E7F7F2] px-2.5 py-1 text-xs font-bold text-[#073B35] hover:bg-[#00A884] hover:text-white cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Pré-remplir avec Adeshina IA
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm focus:border-[#00A884] focus:outline-none"
                />
              </div>

              <ProductDescriptionMediaField
                items={descriptionMedia}
                onChange={setDescriptionMedia}
              />

              <MultiImageUploadField
                label="Photos du produit"
                images={imagesText
                  .split(/\n|,/)
                  .map((s) => s.trim())
                  .filter(Boolean)}
                onChange={(nextImgs) => setImagesText(nextImgs.join("\n"))}
                storeId={activeStore.id}
              />

              <Input
                label="Variantes (Nom:Valeur séparés par des virgules)"
                value={variantsText}
                onChange={(e) => setVariantsText(e.target.value)}
                placeholder="Taille:M, Taille:L, Couleur:Noir"
              />

              <div className="flex flex-wrap gap-6 pt-1 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 accent-[#00A884]"
                  />
                  <span>Visible sur la boutique</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="h-4 w-4 accent-[#00A884]"
                  />
                  <span>Mettre en avant</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  {editing ? "Enregistrer les modifications" : "Créer le produit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ProductPromoPosterModal
        product={posterProduct}
        store={activeStore}
        onClose={() => setPosterProduct(null)}
      />
    </div>
  );
}
