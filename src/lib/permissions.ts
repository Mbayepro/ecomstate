import type {
  CodFinancialStatus,
  ModulePermission,
  OrderStatus,
  PaymentMethodCode,
  Store,
  SubscriptionPlan,
  SubscriptionPlanCode,
  TeamMemberRole,
} from "@/types/domain";

/**
 * Contrôle d'accès réel par rôle d'équipe (Section 20.2 du Cahier des charges)
 */
export const TEAM_ROLE_LABELS: Record<TeamMemberRole, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  operator: "Opérateur Confirmation",
  delivery_manager: "Responsable Livraison",
  courier: "Livreur",
  analyst: "Analyste Marketing",
};

const ROLE_ALLOWED_PREFIXES: Record<TeamMemberRole, string[]> = {
  owner: ["/dashboard"],
  admin: ["/dashboard"],
  operator: [
    "/dashboard/commandes",
    "/dashboard/clients",
    "/dashboard/produits",
    "/dashboard/stocks",
    "/dashboard/categories",
  ],
  delivery_manager: [
    "/dashboard/commandes",
    "/dashboard/livreurs",
    "/dashboard/stocks",
  ],
  courier: ["/dashboard/commandes", "/dashboard/livreurs"],
  analyst: [
    "/dashboard/statistiques",
    "/dashboard/croissance",
    "/dashboard/finances",
    "/dashboard/adeshina-ia",
  ],
};

export function canTeamRoleAccessPath(
  role: TeamMemberRole | undefined,
  pathname: string
): boolean {
  const effectiveRole: TeamMemberRole = role ?? "owner";
  if (effectiveRole === "owner" || effectiveRole === "admin") return true;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/support")) {
    return true;
  }
  const allowed = ROLE_ALLOWED_PREFIXES[effectiveRole] ?? [];
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Système centralisé des offres Standard & Premium (Section 5 du Cahier des charges officiel)
 */
export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-standard",
    code: "standard",
    name: "Standard",
    monthlyPrice: 7500,
    annualPrice: 75000,
    currency: "FCFA",
    description:
      "Plan destiné aux commerçants qui souhaitent gérer efficacement une boutique e-commerce COD complète.",
    maxProducts: 150,
    maxStores: 1,
    maxCouriers: 5,
    aiQuotaMonthly: 50,
    customDomainAllowed: false,
    isActive: true,
    features: [
      "1 boutique en ligne + Thème Shrine Pro 3 complet activé",
      "Déblocage immédiat des ventes et commandes clients COD",
      "Jusqu'à 150 produits (photos, GIFs & vidéos en description)",
      "Formulaire COD personnalisable (Form Builder + Packs)",
      "Gestion commandes (11 statuts), clients & stocks",
      "Livraison, jusqu'à 5 livreurs & rapprochement COD",
      "Dépenses essentielles & calcul du bénéfice réel",
      "Adeshina IA (50 générations / mois) & exports de base",
    ],
  },
  {
    id: "plan-premium",
    code: "premium",
    name: "Premium",
    monthlyPrice: 15000,
    annualPrice: 150000,
    currency: "FCFA",
    description:
      "Plan destiné aux commerçants avancés : multi-boutiques, thèmes Shrine Pro supplémentaires, IA avancée et équipe.",
    maxProducts: null,
    maxStores: 5,
    maxCouriers: null,
    aiQuotaMonthly: null,
    customDomainAllowed: true,
    isActive: true,
    features: [
      "Toutes les fonctionnalités Standard incluses",
      "Multi-boutiques (jusqu'à 5 boutiques indépendantes)",
      "Thèmes avancés inclus (Shrine Pro 3 Conversion + Niches)",
      "Produits, livreurs & générations Adeshina IA illimités",
      "Form Builder COD avancé (champs conditionnels & templates)",
      "Suivi publicitaire (ROAS), automatisations & alertes IA",
      "Gestion d'équipe multi-rôles & domaine personnalisé",
      "Exports avancés CSV & support prioritaire",
    ],
  },
];

export interface PlanComparisonRow {
  feature: string;
  standard: string;
  premium: string;
}

/**
 * Comparateur officiel Standard vs Premium (Section 5.3)
 */
export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  { feature: "Nombre de boutiques", standard: "1 boutique", premium: "Jusqu'à 5 boutiques (Multi-boutiques)" },
  { feature: "Nombre de produits", standard: "Jusqu'à 150 produits", premium: "Illimité" },
  { feature: "Store Builder & Thèmes", standard: "Thème Shrine Pro 1 (Référence)", premium: "Shrine Pro 1 + Shrine Pro 3 + Niches" },
  { feature: "Personnalisation vitrine", standard: "Essentielle (couleurs, logo, sections)", premium: "Avancée (blocs, packs, résultats, comparatif)" },
  { feature: "Formulaire COD (Form Builder)", standard: "Personnalisable (champs & design)", premium: "Avancé + Champs personnalisés & Conditions" },
  { feature: "Livreurs & Rapprochement COD", standard: "Jusqu'à 5 livreurs", premium: "Livreurs illimités + Audit écarts" },
  { feature: "Finances & Bénéfice réel", standard: "Revenus livrés, dépenses & marge", premium: "Complet + Analyse rentabilité produit/pub" },
  { feature: "Adeshina IA opérationnelle", standard: "50 actions / mois", premium: "Illimitée (création boutique, produits, formulaires)" },
  { feature: "Analytics & Publicités", standard: "Analytics de base", premium: "Avancés + Suivi campagnes & ROAS" },
  { feature: "Automatisations", standard: "Alertes essentielles", premium: "Règles personnalisées (Déclencheur → Action)" },
  { feature: "Gestion d'équipe", standard: "Propriétaire", premium: "Équipe complète (6 rôles & permissions)" },
  { feature: "Exports CSV & Rapports", standard: "Commandes & Produits", premium: "Exports avancés multi-modules" },
  { feature: "Domaine personnalisé", standard: "Sous-domaine .ecomsate.com", premium: "Domaine personnalisé (.com, .bj, .sn, .ci)" },
  { feature: "Support", standard: "Assistance standard", premium: "Support prioritaire" },
];

export const DEFAULT_MODULES: ModulePermission[] = [
  {
    key: "storefront_core",
    label: "Store Builder & Vitrine COD",
    description: "Création de boutique, sections modulaires et publication",
    enabledInPlans: ["trial", "standard", "premium"],
  },
  {
    key: "products_catalog",
    label: "Catalogue produits, variantes & marges",
    description: "Produits, variantes, prix d'achat, marges et import/export CSV",
    enabledInPlans: ["trial", "standard", "premium"],
    limits: { trial: 50, standard: 150, premium: null },
  },
  {
    key: "cod_form_builder",
    label: "Form Builder COD personnalisable",
    description: "Constructeur visuel de formulaire de commande à la livraison",
    enabledInPlans: ["trial", "standard", "premium"],
  },
  {
    key: "inventory_management",
    label: "Gestion des stocks & alertes",
    description: "Entrées, sorties, réservations, retours et seuils critiques",
    enabledInPlans: ["trial", "standard", "premium"],
  },
  {
    key: "couriers_cod",
    label: "Livreurs & Rapprochement COD",
    description: "Assignation livreurs, encaissements, reversements et écarts",
    enabledInPlans: ["trial", "standard", "premium"],
    limits: { trial: 3, standard: 5, premium: null },
  },
  {
    key: "finance_profit",
    label: "Finances, Dépenses & Bénéfice réel",
    description: "Suivi des revenus encaissés, dépenses et calcul du profit net",
    enabledInPlans: ["trial", "standard", "premium"],
  },
  {
    key: "premium_themes",
    label: "Thèmes Shrine Pro supplémentaires",
    description: "Accès à Shrine Pro 3 Conversion et adaptations avancées",
    enabledInPlans: ["premium"],
  },
  {
    key: "multi_stores",
    label: "Multi-boutiques & Équipe avancée",
    description: "Création de plusieurs boutiques isolées et rôles d'équipe",
    enabledInPlans: ["premium"],
  },
  {
    key: "custom_domain",
    label: "Domaine personnalisé (.com, .sn, .bj...)",
    description: "Connexion d'un nom de domaine propre avec SSL HTTPS",
    enabledInPlans: ["premium"],
  },
  {
    key: "advanced_analytics",
    label: "Analytics avancés, Publicités & Automatisations",
    description: "Suivi campagnes publicitaires, ROAS et règles automatisées",
    enabledInPlans: ["premium"],
  },
];

export function canUseModule(
  planCode: SubscriptionPlanCode,
  moduleKey: string,
  modules: ModulePermission[] = DEFAULT_MODULES
): boolean {
  const mod = modules.find((m) => m.key === moduleKey);
  if (!mod) return false;
  return mod.enabledInPlans.includes(planCode);
}

export function getModuleLimit(
  planCode: SubscriptionPlanCode,
  moduleKey: string,
  modules: ModulePermission[] = DEFAULT_MODULES
): number | null {
  const mod = modules.find((m) => m.key === moduleKey);
  if (!mod || !mod.limits) return null;
  const limit = mod.limits[planCode];
  return limit === undefined ? null : limit;
}

/**
 * 11 statuts officiels de commande (Section 10.5)
 */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    badge: "info" | "warning" | "navy" | "success" | "danger" | "default";
  }
> = {
  new: { label: "Nouvelle commande", badge: "info" },
  pending_confirmation: { label: "À confirmer", badge: "warning" },
  confirmed: { label: "Confirmée", badge: "navy" },
  preparing: { label: "À préparer", badge: "navy" },
  ready_to_ship: { label: "Prête à expédier", badge: "info" },
  assigned_courier: { label: "Assignée au livreur", badge: "warning" },
  shipped: { label: "En cours de livraison", badge: "info" },
  delivered: { label: "Livrée", badge: "success" },
  delivery_failed: { label: "Échec de livraison", badge: "danger" },
  returned: { label: "Retournée", badge: "warning" },
  cancelled: { label: "Annulée", badge: "danger" },
};

/**
 * 6 statuts financiers COD indépendants (Section 12.4)
 */
export const COD_FINANCIAL_STATUS_META: Record<
  CodFinancialStatus,
  {
    label: string;
    badge: "default" | "warning" | "info" | "success" | "danger" | "navy";
  }
> = {
  uncollected: { label: "Non encaissé", badge: "default" },
  expected: { label: "Encaissement attendu", badge: "warning" },
  collected_by_courier: { label: "Encaissé par le livreur", badge: "info" },
  partially_remitted: { label: "Reversement partiel", badge: "warning" },
  remitted: { label: "Reversement complet", badge: "success" },
  discrepancy: { label: "Écart à vérifier", badge: "danger" },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodCode, string> = {
  cash_on_delivery: "Paiement à la livraison (COD)",
  whatsapp_order: "Paiement à la livraison (COD)",
  manual_mobile_money: "Paiement à la livraison (COD)",
};

export interface StoreSubscriptionHealth {
  expiresAt: string | null;
  daysRemaining: number | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  statusLabel: string;
}

export function getStoreSubscriptionHealth(
  store: Store
): StoreSubscriptionHealth {
  const targetDateStr =
    store.planCode === "trial"
      ? store.trialEndsAt || store.subscriptionEndsAt
      : store.subscriptionEndsAt || store.trialEndsAt;

  if (!targetDateStr) {
    const suspended = store.status === "suspended";
    return {
      expiresAt: null,
      daysRemaining: null,
      isExpired: suspended,
      isExpiringSoon: false,
      statusLabel: suspended ? "Boutique suspendue" : "Abonnement actif",
    };
  }

  const diffMs = new Date(targetDateStr).getTime() - Date.now();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = store.status === "suspended" || daysRemaining < 0;
  const isExpiringSoon = !isExpired && daysRemaining <= 7;

  let statusLabel = `${daysRemaining} jour(s) restant(s)`;
  if (store.status === "suspended") {
    statusLabel = "Boutique suspendue";
  } else if (daysRemaining < 0) {
    statusLabel = `Expiré depuis ${Math.abs(daysRemaining)} jour(s)`;
  } else if (daysRemaining === 0) {
    statusLabel = "Expire aujourd'hui";
  }

  return {
    expiresAt: targetDateStr,
    daysRemaining,
    isExpired,
    isExpiringSoon,
    statusLabel,
  };
}

/**
 * Règle propriétaire :
 * - Dès la création (`status === "trial"`), le commerçant dispose directement du grand thème
 *   Shrine Pro 3 et peut personnaliser / prévisualiser toute sa boutique en conditions réelles.
 * - En revanche, il doit régler et activer son abonnement (`status === "active"` et non expiré)
 *   avant de pouvoir vendre et recevoir de vraies commandes clients.
 */
export function canStoreAcceptLiveOrders(store: Store): boolean {
  if (store.status !== "active") return false;
  const health = getStoreSubscriptionHealth(store);
  return !health.isExpired;
}
