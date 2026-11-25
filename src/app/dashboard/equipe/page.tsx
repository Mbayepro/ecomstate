"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  Check,
  Eye,
  Lock,
  Plus,
  Shield,
  Store as StoreIcon,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { canUseModule, TEAM_ROLE_LABELS } from "@/lib/permissions";
import { usePlatform } from "@/lib/platform-store";
import type { StoreTemplateId, TeamMemberRole } from "@/types/domain";

const ROLE_META: Record<
  TeamMemberRole,
  { label: string; defaultPermissions: string[] }
> = {
  owner: {
    label: "Propriétaire",
    defaultPermissions: ["Accès complet toutes boutiques & finances"],
  },
  admin: {
    label: "Administrateur",
    defaultPermissions: [
      "Store Builder",
      "Form Builder COD",
      "Produits & Commandes",
      "Finances",
    ],
  },
  operator: {
    label: "Opérateur Confirmation",
    defaultPermissions: [
      "Confirmation commandes COD",
      "Clients CRM",
      "Consultation stocks & produits",
    ],
  },
  delivery_manager: {
    label: "Responsable Livraison",
    defaultPermissions: [
      "Assignation livreurs",
      "Rapprochement COD",
      "Suivi retours & stocks",
    ],
  },
  courier: {
    label: "Livreur",
    defaultPermissions: ["Commandes assignées", "Mise à jour statut livré/échec"],
  },
  analyst: {
    label: "Analyste Marketing",
    defaultPermissions: [
      "Campagnes publicitaires ROAS",
      "Statistiques & Finances",
      "Adeshina IA",
    ],
  },
};

export default function MultiBoutiquesEquipePage() {
  const {
    activeStore,
    session,
    stores,
    countries,
    modules,
    teamMembers,
    switchActiveStore,
    switchActiveTeamRole,
    createAdditionalStore,
    saveTeamMember,
    deleteTeamMember,
  } = usePlatform();

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreCountry, setNewStoreCountry] = useState("BJ");
  const [newStoreNiche, setNewStoreNiche] = useState("Mode");

  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<TeamMemberRole>("operator");
  const [activeTab, setActiveTab] = useState<"team" | "stores">("team");
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

  const ownedStores = useMemo(
    () =>
      activeStore
        ? stores.filter(
            (s) =>
              s.ownerEmail.toLowerCase() ===
              activeStore.ownerEmail.toLowerCase()
          )
        : [],
    [stores, activeStore]
  );

  const storeTeam = useMemo(
    () =>
      activeStore
        ? (teamMembers ?? []).filter((m) => m.storeId === activeStore.id)
        : [],
    [teamMembers, activeStore]
  );

  if (!activeStore) return null;

  const canMultiStoreAndTeam = canUseModule(
    activeStore.planCode,
    "multi_stores",
    modules
  );
  const currentRole = session?.teamRole ?? "owner";

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    const res = createAdditionalStore({
      storeName: newStoreName,
      countryCode: newStoreCountry,
      niche: newStoreNiche,
      templateId: "shrine_pro_3" as StoreTemplateId,
    });
    if (!res.ok) {
      setFeedback({ type: "err", msg: res.error ?? "Erreur." });
      return;
    }
    setNewStoreName("");
    setFeedback({
      type: "ok",
      msg: `Nouvelle boutique « ${res.store?.name} » créée et sélectionnée (catalogue vierge prêt à l'emploi) !`,
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;
    const res = saveTeamMember(activeStore.id, {
      fullName: memberName,
      email: memberEmail,
      role: memberRole,
      permissions: ROLE_META[memberRole].defaultPermissions,
    });
    if (!res.ok) {
      setFeedback({
        type: "err",
        msg: res.error ?? "Action réservée Premium.",
      });
      return;
    }
    setMemberName("");
    setMemberEmail("");
    setFeedback({
      type: "ok",
      msg: `Collaborateur ajouté avec le rôle « ${ROLE_META[memberRole].label} ». Il peut se connecter avec son e-mail.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#15232D]">
            Mon Équipe & Mes Boutiques
          </h1>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Donnez un accès sur-mesure à vos collaborateurs ou gérez plusieurs
            boutiques sous le même compte.
          </p>
        </div>

        {!canMultiStoreAndTeam && (
          <Link href="/dashboard/abonnement">
            <Button variant="primary" size="sm">
              <Lock className="h-3.5 w-3.5" />
              Passer au Plan Premium
            </Button>
          </Link>
        )}
      </div>

      {/* Onglets simples : un seul bloc à l'écran */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "team"
              ? "bg-[#073B35] text-white shadow-2xs"
              : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
          }`}
        >
          <Users className="h-4 w-4 text-[#00A884]" />
          1. Mon Équipe & Permissions ({storeTeam.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stores")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
            activeTab === "stores"
              ? "bg-[#073B35] text-white shadow-2xs"
              : "border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#15232D]"
          }`}
        >
          <StoreIcon className="h-4 w-4 text-[#00A884]" />
          2. Mes Boutiques ({ownedStores.length})
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-bold ${
            feedback.type === "ok"
              ? "border-[#00A884]/40 bg-[#E7F7F2] text-[#073B35]"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Simulateur / Sélecteur de rôle actif pour vérifier les permissions RBAC */}
      <Card className="border-[#00A884]/35 bg-[#E7F7F2]/40">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2.5 text-xs">
            <Shield className="h-4 w-4 text-[#00A884]" />
            <span>
              Rôle actuellement appliqué dans le tableau de bord :{" "}
              <strong className="text-[#073B35]">
                {TEAM_ROLE_LABELS[currentRole]}
              </strong>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(ROLE_META) as TeamMemberRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchActiveTeamRole(r)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  currentRole === r
                    ? "bg-[#073B35] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#15232D] hover:border-[#00A884]"
                }`}
              >
                {ROLE_META[r].label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 1. Multi-boutiques */}
      {activeTab === "stores" && (
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <StoreIcon className="h-4 w-4 text-[#00A884]" />
            <h2 className="text-base font-extrabold text-[#15232D]">
              Mes boutiques ({ownedStores.length} /{" "}
              {canMultiStoreAndTeam ? "5" : "1"})
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ownedStores.map((st) => {
              const isCurrent = st.id === activeStore.id;
              return (
                <div
                  key={st.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 ${
                    isCurrent
                      ? "border-2 border-[#00A884] bg-[#E7F7F2]/40"
                      : "border-[#E2E8F0] bg-[#F8FAFC]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-[#15232D]">{st.name}</p>
                      <Badge variant={isCurrent ? "success" : "default"}>
                        {isCurrent ? "Active" : st.countryCode}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {st.customDomain || st.subdomain}
                    </p>
                  </div>

                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant={isCurrent ? "primary" : "outline"}
                      className="w-full"
                      onClick={() => switchActiveStore(st.id)}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Boutique en cours de gestion
                        </>
                      ) : (
                        "Basculer sur cette boutique"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {canMultiStoreAndTeam && ownedStores.length < 5 && (
            <form
              onSubmit={handleCreateStore}
              className="grid gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-4"
            >
              <Input
                placeholder="Nom de la nouvelle boutique *"
                required
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
              />
              <Input
                placeholder="Niche (ex: Cosmétiques)"
                value={newStoreNiche}
                onChange={(e) => setNewStoreNiche(e.target.value)}
              />
              <select
                value={newStoreCountry}
                onChange={(e) => setNewStoreCountry(e.target.value)}
                className="h-10.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.currency})
                  </option>
                ))}
              </select>
              <Button type="submit" variant="primary">
                <Plus className="h-4 w-4" />
                Créer la boutique
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      )}

      {/* 2. Gestion d'Équipe & 6 Rôles granulaires */}
      {activeTab === "team" && (
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#00A884]" />
            <h2 className="text-base font-extrabold text-[#15232D]">
              Équipe & Permissions de {activeStore.name}
            </h2>
          </div>

          <form
            onSubmit={handleAddMember}
            className="grid gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-4"
          >
            <Input
              placeholder="Nom complet *"
              required
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Adresse e-mail *"
              required
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value as TeamMemberRole)}
              className="h-10.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#15232D]"
            >
              {(Object.keys(ROLE_META) as TeamMemberRole[])
                .filter((r) => r !== "owner")
                .map((r) => (
                  <option key={r} value={r}>
                    {ROLE_META[r].label}
                  </option>
                ))}
            </select>
            <Button type="submit" variant="primary">
              <Plus className="h-4 w-4" />
              Inviter membre
            </Button>
          </form>

          <div className="space-y-2.5">
            {storeTeam.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                Vous êtes actuellement le seul gestionnaire sur cette boutique.
              </p>
            ) : (
              storeTeam.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[#15232D]">
                        {m.fullName}
                      </span>
                      <Badge variant={m.role === "owner" ? "navy" : "success"}>
                        <Shield className="mr-1 h-3 w-3" />
                        {ROLE_META[m.role]?.label ?? m.role}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-slate-500">{m.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="rounded-md bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => switchActiveTeamRole(m.role)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Tester ce rôle
                    </Button>
                    {m.role !== "owner" && (
                      <button
                        type="button"
                        onClick={() => deleteTeamMember(activeStore.id, m.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
