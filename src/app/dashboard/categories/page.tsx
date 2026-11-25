"use client";

import { useState } from "react";
import { Edit2, FolderTree, Plus, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { usePlatform } from "@/lib/platform-store";
import type { Category } from "@/types/domain";

const QUICK_CATEGORY_IDEAS = [
  "Vêtements",
  "Chaussures",
  "Électronique",
  "Beauté",
  "Maison",
  "Alimentation",
];

export default function DashboardCategoriesPage() {
  const { activeStore, categories, products, saveCategory, deleteCategory } =
    usePlatform();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!activeStore) return null;

  const storeCategories = categories.filter(
    (c) => c.storeId === activeStore.id
  );
  const storeProducts = products.filter((p) => p.storeId === activeStore.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveCategory(activeStore.id, {
      id: editing?.id,
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setEditing(null);
    setName("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Organisation du catalogue"
        title="Catégories"
        description="Classez vos produits en rayons clairs pour faciliter la recherche côté client."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border-[#E2E8F0] bg-white lg:col-span-5">
          <CardHeader className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-extrabold text-[#073B35]">
              {editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {!editing && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-[#00A884]" />
                  Suggestions rapides :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CATEGORY_IDEAS.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setName(idea)}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#073B35] transition-colors hover:border-[#00A884] hover:bg-white cursor-pointer"
                    >
                      + {idea}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nom de la catégorie"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prêt-à-porter, Soins Visage..."
              />
              <Input
                label="Description courte (optionnel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Sélection phare de la saison"
              />
              <div className="flex gap-2 pt-1">
                <Button type="submit" variant="primary" className="flex-1">
                  <Plus className="h-4 w-4" />
                  {editing ? "Mettre à jour" : "Créer la catégorie"}
                </Button>
                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(null);
                      setName("");
                      setDescription("");
                    }}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] bg-white lg:col-span-7">
          <CardHeader className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-extrabold text-[#073B35]">
              Rayons actifs
            </h2>
            <Badge variant="navy">{storeCategories.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#E2E8F0]">
              {storeCategories.map((cat) => {
                const catProducts = storeProducts.filter(
                  (p) => p.categoryId === cat.id
                );
                const units = catProducts.reduce((s, p) => s + p.stock, 0);

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#F8FAFC]"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#073B35]/8 text-[#073B35]">
                        <FolderTree className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="font-bold text-[#073B35]">{cat.name}</p>
                        <p className="text-xs text-slate-500">
                          {cat.description || `/${cat.slug}`} ·{" "}
                          <strong>{catProducts.length}</strong> produit(s) ·{" "}
                          {units} unité(s) en stock
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(cat);
                          setName(cat.name);
                          setDescription(cat.description ?? "");
                        }}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#073B35] cursor-pointer"
                        aria-label="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(activeStore.id, cat.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {storeCategories.length === 0 && (
                <p className="p-10 text-center text-sm text-slate-500">
                  Aucune catégorie créée pour le moment.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
