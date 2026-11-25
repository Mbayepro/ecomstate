"use client";

import { useState } from "react";
import {
  AlertCircle,
  Edit2,
  LayoutGrid,
  List,
  Minus,
  Package,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
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
import { usePlatform } from "@/lib/platform-store";

import { getModuleLimit } from "@/lib/permissions";
import { generateProductCopyWithAdeshina } from "@/lib/adeshina-ai";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/domain";

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
  const [editing, setEditing] = useState<Product | null>(null);

  // États du formulaire
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [description, setDescription] = useState("");
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

  // Données réelles
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
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === "all" || p.categoryId === catFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.isActive) ||
      (statusFilter === "hidden" && !p.isActive) ||
      (statusFilter === "out" && p.stock === 0);
    return matchesSearch && matchesCat && matchesStatus;
  });

  const openNew = () => {
    setEditing(null);
    setName("");
    setCategoryId(storeCategories[0]?.id ?? "");
    setPrice("");
    setPromoPrice("");
    setStock("10");
    setLowStockThreshold("5");
    setDescription("");
    setImagesText(
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
    );
    setVariantsText("Taille:M, Taille:L");
    setIsActive(true);
    setIsPopular(false);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setPrice(String(p.price));
    setPromoPrice(p.promoPrice ? String(p.promoPrice) : "");
    setStock(String(p.stock));
    setLowStockThreshold(String(p.lowStockThreshold));
    setDescription(p.description);
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
      categoryId: categoryId || storeCategories[0]?.id || "",
      description: description.trim(),
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

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Catalogue commercial"
        title="Produits"
        description={
          <span>
            {storeProducts.length} article(s) enregistré(s)
            {maxProducts !== null
              ? ` · Limite ${maxProducts} (${activeStore.planCode})`
              : " · Capacité illimitée"}
          </span>
        }
        actions={
          <Button variant="primary" onClick={openNew} disabled={limitReached}>
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Button>
        }
      />

      {/* Indicateurs réels du catalogue */}
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

      {/* Filtres & Bascule d'affichage */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
              className="h-9.5 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-xs font-medium text-[#1E293B] focus:border-[#102A43] focus:outline-none"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-9.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#102A43]"
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
            className="h-9.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#102A43]"
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
            className={`rounded-lg p-1.5 cursor-pointer ${viewMode === "table"
              ? "bg-[#102A43] text-white"
              : "text-slate-400 hover:text-[#102A43]"
              }`}
            title="Vue tableau"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-1.5 cursor-pointer ${viewMode === "grid"
              ? "bg-[#102A43] text-white"
              : "text-slate-400 hover:text-[#102A43]"
              }`}
            title="Vue grille"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-2.5 text-sm font-semibold text-[#102A43]">
              Aucun produit correspondant
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ajoutez un nouvel article ou modifiez vos filtres.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vue Mobile : Cartes ergonomiques tactiles */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((p) => {
              const cat = storeCategories.find((c) => c.id === p.categoryId);
              return (
                <Card key={p.id} className="border-[#E2E8F0] bg-white">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-14 w-14 shrink-0 rounded-xl border border-[#E2E8F0] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-bold text-[#102A43]">
                            {p.name}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              toggleProductActive(activeStore.id, p.id)
                            }
                          >
                            <Badge variant={p.isActive ? "success" : "default"}>
                              {p.isActive ? "Actif" : "Masqué"}
                            </Badge>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">
                          {cat?.name ?? "Non classé"} · {p.variants.length}{" "}
                          variante(s)
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-[#10B981]">
                          {formatCurrency(
                            p.promoPrice ?? p.price,
                            activeStore.currency
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            adjustStock(activeStore.id, p.id, -1, "Retrait (-1)")
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#102A43]">
                          Stock: {p.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            adjustStock(activeStore.id, p.id, +1, "Ajout (+1)")
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(p)}
                        >
                          Modifier
                        </Button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(activeStore.id, p.id)}
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Vue Desktop : Tableau ou Grille */}
          <div className="hidden md:block">
            {viewMode === "table" ? (
              <Card className="border-[#E2E8F0] bg-white">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Produit</th>
                          <th className="px-4 py-3">Catégorie</th>
                          <th className="px-4 py-3">Prix</th>
                          <th className="px-4 py-3">Stock rapide</th>
                          <th className="px-4 py-3">Statut</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {filtered.map((p) => {
                          const cat = storeCategories.find(
                            (c) => c.id === p.categoryId
                          );
                          return (
                            <tr
                              key={p.id}
                              className="transition-colors hover:bg-[#F8FAFC]"
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3.5">
                                  <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="h-11 w-11 shrink-0 rounded-xl border border-[#E2E8F0] object-cover"
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-[#102A43]">
                                      {p.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {p.variants.length} variante(s)
                                      {p.isPopular ? " · Populaire" : ""}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-xs font-medium text-slate-600">
                                {cat?.name ?? "Non classé"}
                              </td>
                              <td className="px-4 py-3.5">
                                {p.promoPrice ? (
                                  <div>
                                    <p className="font-bold text-[#10B981]">
                                      {formatCurrency(
                                        p.promoPrice,
                                        activeStore.currency
                                      )}
                                    </p>
                                    <p className="text-xs text-slate-400 line-through">
                                      {formatCurrency(
                                        p.price,
                                        activeStore.currency
                                      )}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="font-bold text-[#102A43]">
                                    {formatCurrency(
                                      p.price,
                                      activeStore.currency
                                    )}
                                  </p>
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
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 cursor-pointer"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span
                                    className={`min-w-8 text-center text-xs font-extrabold ${p.stock === 0
                                      ? "text-rose-600"
                                      : p.stock <= p.lowStockThreshold
                                        ? "text-amber-600"
                                        : "text-[#102A43]"
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
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 cursor-pointer"
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
                                  <Badge
                                    variant={p.isActive ? "success" : "default"}
                                  >
                                    {p.isActive ? "Actif" : "Masqué"}
                                  </Badge>
                                </button>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEdit(p)}
                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#102A43] cursor-pointer"
                                    aria-label="Modifier"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteProduct(activeStore.id, p.id)
                                    }
                                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                    aria-label="Supprimer"
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
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => {
                  const cat = storeCategories.find(
                    (c) => c.id === p.categoryId
                  );
                  return (
                    <Card
                      key={p.id}
                      className="hover-lift overflow-hidden border-[#E2E8F0] bg-white"
                    >
                      <div className="relative h-44 w-full bg-slate-100">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute left-3 top-3 flex gap-1.5">
                          <Badge variant={p.isActive ? "success" : "default"}>
                            {p.isActive ? "Actif" : "Masqué"}
                          </Badge>
                          {p.stock === 0 && (
                            <Badge variant="danger">Rupture</Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-slate-400">
                          {cat?.name ?? "—"}
                        </p>
                        <h3 className="mt-0.5 truncate font-bold text-[#102A43]">
                          {p.name}
                        </h3>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="font-extrabold text-[#102A43]">
                            {formatCurrency(
                              p.promoPrice ?? p.price,
                              activeStore.currency
                            )}
                          </span>
                          <span className="text-xs text-slate-500">
                            Stock : {p.stock}
                          </span>
                        </div>
                        <div className="mt-4 flex gap-2 border-t border-[#E2E8F0] pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEdit(p)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProduct(activeStore.id, p.id)}
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Ajout / Édition Produit avec Adeshina IA */}
      {modalOpen && (
        <div className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F33]/50 p-4 backdrop-blur-xs">
          <div className="animate-modal-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#102A43]">
                  {editing ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <p className="text-xs text-slate-500">
                  Saisissez le nom puis utilisez Adeshina IA pour pré-remplir la
                  fiche
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
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nom du produit"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Robe Wax Élégance"
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#102A43]">
                    Catégorie
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-10.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm"
                  >
                    {storeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <Input
                  label={`Prix (${activeStore.currency})`}
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
                <Input
                  label="Quantité"
                  type="number"
                  required
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
                <Input
                  label="Seuil alerte"
                  type="number"
                  min={0}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#102A43]">
                    Description commerciale
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = generateProductCopyWithAdeshina(
                        name || "Article Premium"
                      );
                      setDescription(generated.description);
                      if (!price) setPrice(String(generated.suggestedPrice));
                      if (!promoPrice)
                        setPromoPrice(String(generated.suggestedPromoPrice));
                      if (!variantsText)
                        setVariantsText(generated.suggestedVariants);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981]/12 px-2.5 py-1 text-xs font-bold text-[#10B981] transition-colors hover:bg-[#10B981]/20 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Rédiger avec Adeshina IA
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Caractéristiques, matières, conseils d'entretien..."
                  className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm focus:border-[#102A43] focus:outline-none"
                />
              </div>

              <MultiImageUploadField
                label="Photos du produit (depuis votre téléphone, ordinateur ou lien URL)"
                images={imagesText
                  .split(/\n|,/)
                  .map((s) => s.trim())
                  .filter(Boolean)}
                onChange={(nextImgs) => setImagesText(nextImgs.join("\n"))}
                storeId={activeStore.id}
              />


              <Input
                label="Variantes (format Nom:Valeur séparés par des virgules)"
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
                    className="h-4 w-4 accent-[#10B981]"
                  />
                  <span>Visible sur la boutique</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="h-4 w-4 accent-[#10B981]"
                  />
                  <span>Mettre en avant (populaire)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E2E8F0] pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  {editing ? "Enregistrer" : "Publier le produit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
