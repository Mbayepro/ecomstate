import type {
  ModulePermission,
  OrderStatus,
  PaymentMethodCode,
  Store,
  SubscriptionPlan,
  SubscriptionPlanCode,
} from "@/types/domain";


/**
 * Système centralisé des offres, modules et limites.
 * Ne jamais coder en dur les limites d'abonnement dans les composants UI.
 */
export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-trial",
    code: "trial",
    name: "Activation & Essai 30 jours",
    monthlyPrice: 2000,
    annualPrice: 2000,
    currency: "FCFA",
    description:
      "Paiement unique d'activation donnant accès à 30 jours complets pour lancer et tester votre boutique.",
    maxProducts: 50,
    customDomainAllowed: false,
    isActive: true,
    features: [
      "Création automatique de votre boutique",
      "Sous-domaine gratuit (.ecomsate.com)",
      "Jusqu'à 50 produits avec variantes",
      "Commandes WhatsApp & Paiement à la livraison",
      "Tableau de bord & gestion des stocks",
    ],
  },
  {
    id: "plan-standard",
    code: "standard",
    name: "Standard",
    monthlyPrice: 7500,
    annualPrice: 75000,
    currency: "FCFA",
    description:
      "Idéal pour les commerçants et petites entreprises qui veulent vendre en ligne chaque jour.",
    maxProducts: 100,
    customDomainAllowed: false,
    isActive: true,
    features: [
      "Jusqu'à 100 produits et catégories illimitées",
      "Sous-domaine personnalisé (.ecomsate.com)",
      "Personnalisation complète (logo, bannière, couleurs)",
      "Gestion des stocks, alertes et clients",
      "Commandes WhatsApp, livraison & Mobile Money manuel",
      "Support prioritaire par e-mail et WhatsApp",
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
      "Toute la puissance d'EcomSate pour les marques ambitieuses avec votre propre nom de domaine.",
    maxProducts: null,
    customDomainAllowed: true,
    isActive: true,
    features: [
      "Produits illimités & variantes avancées",
      "Nom de domaine personnalisé (.com, .sn, .bj) + SSL",
      "Tous les modèles de boutiques premium",
      "Statistiques avancées et export des commandes",
      "Multi-paiements locaux (évolutions incluses)",
      "Accompagnement dédié",
    ],
  },
];

export const DEFAULT_MODULES: ModulePermission[] = [
  {
    key: "storefront",
    label: "Boutique publique & sous-domaine",
    description: "Vitrine e-commerce mobile-first accessible via .ecomsate.com",
    enabledInPlans: ["trial", "standard", "premium"],
  },
  {
    key: "products_catalog",
    label: "Catalogue produits & variantes",
    description: "Ajout de produits, photos multiples, prix promo, tailles et couleurs",
    enabledInPlans: ["trial", "standard", "premium"],
    limits: { trial: 50, standard: 100, premium: null },
  },
  {
    key: "inventory_tracking",
    label: "Suivi des stocks & alertes",
    description: "Alertes de stock faible et historique des mouvements",
    enabledInPlans: ["trial", "standard", "premium"],
  },
  {
    key: "store_customization",
    label: "Personnalisation visuelle",
    description: "Logo, bannière, palette personnalisée et modèles de boutique",
    enabledInPlans: ["trial", "standard", "premium"],
  },
  {
    key: "custom_domain",
    label: "Nom de domaine personnalisé",
    description: "Achat et connexion de domaine personnel avec certificat SSL",
    enabledInPlans: ["premium"],
  },
  {
    key: "advanced_analytics",
    label: "Statistiques avancées",
    description: "Rapports détaillés par période et performances produits",
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

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badge: "info" | "warning" | "navy" | "success" | "danger" | "default" }
> = {
  new: { label: "Nouvelle commande", badge: "info" },
  pending_confirmation: { label: "En attente de confirmation", badge: "warning" },
  confirmed: { label: "Confirmée", badge: "navy" },
  preparing: { label: "En préparation", badge: "navy" },
  shipped: { label: "Expédiée", badge: "info" },
  delivered: { label: "Livrée", badge: "success" },
  cancelled: { label: "Annulée", badge: "danger" },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodCode, string> = {
  cash_on_delivery: "Paiement à la livraison",
  whatsapp_order: "Commande via WhatsApp",
  manual_mobile_money: "Mobile Money (confirmation vendeur)",
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

