"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  AdCampaign,
  AuditLog,
  AutomationRule,
  Category,
  CodFinancialStatus,
  CodFormConfig,
  CodFormField,
  CodFormStyle,
  CountryConfig,
  Courier,
  CustomDomainRequest,
  Customer,
  ExpenseCategory,
  InventoryMovement,
  ModulePermission,
  Order,
  OrderHistoryEntry,
  OrderStatus,
  PaymentMethodCode,
  Product,
  PromoCode,
  Store,
  StoreExpense,
  StoreSectionBlock,
  StoreSettings,
  StoreStatus,
  StoreTemplateId,
  SubscriptionPlan,
  SubscriptionPlanCode,
  TeamMember,
  TeamMemberRole,
  UserRole,
} from "@/types/domain";
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_AUTOMATIONS,
  INITIAL_CAMPAIGNS,
  INITIAL_CATEGORIES,
  INITIAL_COUNTRIES,
  INITIAL_COURIERS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_STORES,
  INITIAL_TEAM_MEMBERS,
} from "@/lib/seed-data";
import {
  canUseModule,
  DEFAULT_MODULES,
  DEFAULT_PLANS,
} from "@/lib/permissions";
import { createInitialCodFormConfig } from "@/lib/cod-form-presets";
import {
  createDefaultShrineSections,
  ECOMSATE_THEMES,
} from "@/lib/shrine-themes";
import {
  ADESHINA_SECTORS,
  getBlueprintBySector,
  type AdeshinaStoreBlueprint,
} from "@/lib/adeshina-ai";

import { generateOrderNumber, slugify } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchCloudPlatformState,
  mergeById,
  pushCloudPlatformState,
} from "@/lib/supabase/cloud-sync";


const STORAGE_KEY = "ecomsate_mvp_state_v1";
export const PENDING_OAUTH_STORE_KEY = "ecomsate_pending_oauth_store";

export interface PendingOAuthStorePrefs {
  storeName?: string;
  phone?: string;
  countryCode?: string;
  sectorId?: string;
  useAdeshinaSetup?: boolean;
}


export interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  teamRole?: TeamMemberRole;
  activeStoreId: string | null;
}

export interface AdminAccountConfig {
  fullName: string;
  email: string;
  secondaryEmail: string;
  password: string;
  phone: string;
  countryCode: string;
  updatedAt: string;
}

export interface SubscriptionPaymentRequest {
  id: string;
  storeId: string;
  storeName: string;
  merchantName: string;
  merchantEmail: string;
  merchantPhone?: string;
  planCode: SubscriptionPlanCode;
  billingCycle?: "monthly" | "annual";
  amount: number;
  currency: string;
  operator: string;
  senderPhone: string;
  transactionReference: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
}

export interface AppNotification {
  id: string;
  recipientRole: "merchant" | "super_admin";
  storeId?: string;
  title: string;
  message: string;
  type: "order" | "payment" | "subscription" | "stock";
  isRead: boolean;
  createdAt: string;
}

interface PlatformState {
  session: AuthSession | null;
  adminAccount: AdminAccountConfig;
  subscriptionPayments: SubscriptionPaymentRequest[];
  notifications: AppNotification[];
  stores: Store[];


  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  inventoryMovements: InventoryMovement[];
  promoCodes: PromoCode[];
  customDomains: CustomDomainRequest[];
  codForms: CodFormConfig[];
  couriers: Courier[];
  expenses: StoreExpense[];
  adCampaigns: AdCampaign[];
  automations: AutomationRule[];
  teamMembers: TeamMember[];
  plans: SubscriptionPlan[];


  modules: ModulePermission[];
  countries: CountryConfig[];
  auditLogs: AuditLog[];
}


interface RegisterMerchantInput {
  fullName: string;
  storeName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  sectorId?: string;
  useAdeshinaSetup?: boolean;
  templateId?: StoreTemplateId;
  niche?: string;
}

interface PlaceOrderInput {
  storeId: string;
  customerName: string;
  customerPhone: string;
  secondaryPhone?: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  commune?: string;
  district?: string;
  landmark?: string;
  customFields?: Record<string, string>;
  paymentMethod: PaymentMethodCode;
  paymentReference?: string;
  notes?: string;
  internalNotes?: string;
  deliveryFee: number;
  promoCode?: string;
  discountAmount?: number;
  items: {
    productId: string;
    productName: string;
    variantLabel?: string;
    quantity: number;
    unitPrice: number;
    costPrice?: number;
    imageUrl?: string;
  }[];
}

interface PlatformContextValue extends PlatformState {
  hydrated: boolean;
  activeStore: Store | null;
  // Auth
  loginAsMerchant: (
    email: string,
    password?: string
  ) => { ok: boolean; error?: string };
  loginAsAdmin: (

    email: string,
    password?: string
  ) => { ok: boolean; error?: string };
  isAdminEmail: (email: string) => boolean;
  adminUpdateCredentials: (
    patch: Partial<Omit<AdminAccountConfig, "updatedAt">>
  ) => void;
  logout: () => void;

  registerMerchant: (input: RegisterMerchantInput) => {
    ok: boolean;
    store?: Store;
    error?: string;
  };
  createAdditionalStore: (input: {
    storeName: string;
    countryCode: string;
    niche?: string;
    templateId?: StoreTemplateId;
  }) => { ok: boolean; store?: Store; error?: string };
  switchActiveStore: (storeId: string) => void;
  switchActiveTeamRole: (teamRole: TeamMemberRole) => void;
  // Merchant CRUD (strictly scoped by storeId)
  saveCategory: (
    storeId: string,
    data: { id?: string; name: string; description?: string }
  ) => void;
  deleteCategory: (storeId: string, categoryId: string) => void;
  saveProduct: (
    storeId: string,
    data: Omit<Product, "id" | "storeId" | "slug" | "createdAt"> & {
      id?: string;
    }
  ) => void;
  deleteProduct: (storeId: string, productId: string) => void;
  toggleProductActive: (storeId: string, productId: string) => void;
  adjustStock: (
    storeId: string,
    productId: string,
    delta: number,
    reason: string
  ) => void;
  updateOrderStatus: (
    storeId: string,
    orderId: string,
    status: OrderStatus,
    note?: string
  ) => void;
  updateOrderInternalNotes: (
    storeId: string,
    orderId: string,
    internalNotes: string
  ) => void;
  updateCustomerNotes: (
    storeId: string,
    customerId: string,
    internalNotes: string
  ) => void;
  updateStoreSettings: (
    storeId: string,
    patch: Partial<StoreSettings>,
    storeName?: string
  ) => void;
  // Store Builder & Shrine Pro Themes
  updateStoreBuilderSections: (
    storeId: string,
    sections: StoreSectionBlock[],
    publish?: boolean
  ) => void;
  applyStoreTheme: (
    storeId: string,
    themeId: StoreTemplateId
  ) => { ok: boolean; error?: string };
  // Form Builder COD
  getStoreCodForm: (storeId: string) => CodFormConfig;
  saveCodFormDraft: (
    storeId: string,
    fields: CodFormField[],
    style: CodFormStyle,
    presetId?: string
  ) => void;
  publishCodForm: (storeId: string, label?: string) => void;
  restoreCodFormVersion: (storeId: string, version: number) => void;
  // Couriers & COD Financial Reconciliation
  saveCourier: (
    storeId: string,
    data: {
      id?: string;
      name: string;
      phone: string;
      zone: string;
      isActive: boolean;
      discrepancyNote?: string;
    }
  ) => { ok: boolean; error?: string };
  deleteCourier: (storeId: string, courierId: string) => void;
  assignOrderCourier: (
    storeId: string,
    orderId: string,
    courierId: string | null
  ) => void;
  updateOrderCodFinancialStatus: (
    storeId: string,
    orderId: string,
    codFinancialStatus: CodFinancialStatus
  ) => void;
  recordCourierRemittance: (
    storeId: string,
    courierId: string,
    amount: number,
    markDeliveredOrdersRemitted?: boolean
  ) => void;
  // Expenses & Profit
  saveExpense: (
    storeId: string,
    data: {
      id?: string;
      category: ExpenseCategory;
      label: string;
      amount: number;
      date: string;
      notes?: string;
    }
  ) => void;
  deleteExpense: (storeId: string, expenseId: string) => void;
  // Ad Campaigns & Automations & Team
  saveAdCampaign: (
    storeId: string,
    data: Omit<AdCampaign, "id" | "storeId"> & { id?: string }
  ) => void;
  toggleAdCampaign: (storeId: string, campaignId: string) => void;
  deleteAdCampaign: (storeId: string, campaignId: string) => void;
  saveAutomation: (
    storeId: string,
    data: {
      id?: string;
      name: string;
      trigger: string;
      condition: string;
      action: string;
      enabled: boolean;
    }
  ) => void;
  toggleAutomation: (storeId: string, automationId: string) => void;
  testAutomation: (storeId: string, automationId: string) => void;
  saveTeamMember: (
    storeId: string,
    data: {
      id?: string;
      fullName: string;
      email: string;
      role: TeamMemberRole;
      permissions: string[];
    }
  ) => { ok: boolean; error?: string };
  deleteTeamMember: (storeId: string, memberId: string) => void;
  savePromoCode: (
    storeId: string,
    data: {
      id?: string;
      code: string;
      discountType: "percent" | "fixed";
      discountValue: number;
      minOrderAmount: number;
      maxUses: number | null;
      expiresAt?: string | null;
      isActive: boolean;
    }
  ) => { ok: boolean; error?: string };
  togglePromoCodeActive: (storeId: string, promoId: string) => void;
  deletePromoCode: (storeId: string, promoId: string) => void;
  requestCustomDomain: (
    storeId: string,
    domain: string,
    requestType: "connect_existing" | "buy_new"
  ) => { ok: boolean; error?: string };
  deleteCustomDomainRequest: (storeId: string, domainId: string) => void;
  adminUpdateDomainStatus: (
    domainId: string,
    status: "active_ssl" | "rejected"
  ) => void;


  // Public storefront checkout
  placeOrder: (input: PlaceOrderInput) => Order;
  // Direct Mobile Money Subscriptions (Zero NINEA / RCCM required)
  submitSubscriptionPayment: (input: {
    storeId: string;
    planCode: SubscriptionPlanCode;
    billingCycle?: "monthly" | "annual";
    amount: number;
    operator: string;
    senderPhone: string;
    transactionReference: string;
  }) => SubscriptionPaymentRequest | null;
  adminReviewSubscriptionPayment: (
    paymentId: string,
    decision: "approved" | "rejected"
  ) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (
    storeId?: string,
    role?: "merchant" | "super_admin"
  ) => void;

  // Super Admin actions

  adminUpdateStoreStatus: (storeId: string, status: StoreStatus) => void;
  adminUpdateStorePlan: (storeId: string, planCode: SubscriptionPlanCode) => void;
  adminUpdatePlan: (planId: string, patch: Partial<SubscriptionPlan>) => void;
  adminToggleModuleInPlan: (
    moduleKey: string,
    planCode: SubscriptionPlanCode
  ) => void;
  adminToggleCountry: (countryCode: string) => void;
}

const DEFAULT_ADMIN_ACCOUNT: AdminAccountConfig = {
  fullName: "Direction EcomSate Bénin",
  email: "admin@ecomsate.bj",
  secondaryEmail: "admin@ecomsate.com",
  password: "EcomSate@2026!",
  phone: "+229 95 78 21 32",
  countryCode: "BJ",
  updatedAt: "2026-02-01T08:00:00.000Z",
};


const DEFAULT_STATE: PlatformState = {
  session: {
    userId: "user-aminata",
    email: "aminata@atelierdakar.sn",
    fullName: "Aminata Diallo",
    role: "merchant",
    activeStoreId: "store-atelier-dakar",
  },
  adminAccount: DEFAULT_ADMIN_ACCOUNT,
  subscriptionPayments: [
    {
      id: "subpay-initial-1",
      storeId: "store-atelier-dakar",
      storeName: "Atelier Dakar Mode",
      merchantName: "Aminata Diallo",
      merchantEmail: "aminata@atelierdakar.sn",
      merchantPhone: "+221 77 450 12 34",
      planCode: "premium",
      billingCycle: "monthly",
      amount: 15000,
      currency: "FCFA",
      operator: "Wave (Sénégal / CI / Burkina)",
      senderPhone: "+221 77 450 12 34",
      transactionReference: "WAVE-SN-884120",
      status: "approved",
      createdAt: "2026-02-02T10:15:00.000Z",
      reviewedAt: "2026-02-02T10:25:00.000Z",
    },
    {
      id: "subpay-initial-2",
      storeId: "store-cotonou-tech",
      storeName: "Cotonou Tech Store",
      merchantName: "Koffi Mensah",
      merchantEmail: "koffi@cotonoutech.bj",
      merchantPhone: "+229 97 11 22 33",
      planCode: "trial",
      billingCycle: "monthly",
      amount: 2000,
      currency: "FCFA",
      operator: "MTN Mobile Money (Bénin / CI)",
      senderPhone: "+229 97 11 22 33",
      transactionReference: "MOMO-BJ-519023",
      status: "approved",
      createdAt: "2026-02-10T14:00:00.000Z",
      reviewedAt: "2026-02-10T14:05:00.000Z",
    },
  ],
  notifications: [
    {
      id: "notif-init-1",
      recipientRole: "merchant",
      storeId: "store-atelier-dakar",
      title: "Abonnement Premium actif",
      message: "Votre formule Premium est active et tous vos modules sont débloqués.",
      type: "subscription",
      isRead: false,
      createdAt: "2026-02-15T09:00:00.000Z",
    },
    {
      id: "notif-init-2",
      recipientRole: "merchant",
      storeId: "store-cotonou-tech",
      title: "Période d'essai 30 jours active",
      message: "Bienvenue sur EcomSate ! Pensez à passer à l'offre Standard ou Premium avant la fin de votre essai.",
      type: "subscription",
      isRead: false,
      createdAt: "2026-02-15T09:30:00.000Z",
    },
  ],
  stores: INITIAL_STORES,



  categories: INITIAL_CATEGORIES,
  products: INITIAL_PRODUCTS,
  customers: INITIAL_CUSTOMERS,
  orders: INITIAL_ORDERS,
  inventoryMovements: INITIAL_INVENTORY_MOVEMENTS,
  promoCodes: [
    {
      id: "promo-dakar-bienvenue",
      storeId: "store-atelier-dakar",
      code: "BIENVENUE10",
      discountType: "percent",
      discountValue: 10,
      minOrderAmount: 10000,
      maxUses: 100,
      usedCount: 3,
      expiresAt: null,
      isActive: true,
      createdAt: "2026-02-05T10:00:00.000Z",
    },
  ],
  customDomains: [
    {
      id: "dom-atelier-dakar",
      storeId: "store-atelier-dakar",
      storeName: "Atelier Dakar Mode",
      merchantEmail: "aminata@atelierdakar.sn",
      domain: "atelierdakar.sn",
      requestType: "connect_existing",
      status: "active_ssl",
      dnsTarget: "cname.vercel-dns.com",
      createdAt: "2026-02-02T11:00:00.000Z",
      verifiedAt: "2026-02-02T12:15:00.000Z",
    },
  ],
  codForms: [
    createInitialCodFormConfig("store-atelier-dakar", "mode", "#00A884"),
    createInitialCodFormConfig("store-cotonou-tech", "electronique", "#00A884"),
  ],
  couriers: INITIAL_COURIERS,
  expenses: INITIAL_EXPENSES,
  adCampaigns: INITIAL_CAMPAIGNS,
  automations: INITIAL_AUTOMATIONS,
  teamMembers: INITIAL_TEAM_MEMBERS,
  plans: DEFAULT_PLANS,


  modules: DEFAULT_MODULES,
  countries: INITIAL_COUNTRIES,
  auditLogs: INITIAL_AUDIT_LOGS,
};

/**
 * Initialise les premiers produits prêts à vendre lors de la création d'une boutique
 * afin que la prévisualisation Shrine Pro 3 ne soit jamais vide ou déserte.
 */
function createInitialStoreProducts(
  storeId: string,
  categoryId: string,
  blueprint: AdeshinaStoreBlueprint | null
): Product[] {
  if (!blueprint?.sampleProducts || blueprint.sampleProducts.length === 0) {
    return [];
  }
  return blueprint.sampleProducts.map((sp, idx) => {
    const pSlug = slugify(sp.name) || `produit-${idx + 1}`;
    const variantsList: Product["variants"] = [];
    if (sp.variants) {
      const parts = sp.variants.split(",").map((p) => p.trim()).filter(Boolean);
      for (const pt of parts) {
        const [optName, optVal] = pt.includes(":") ? pt.split(":") : ["Option", pt];
        variantsList.push({
          id: `var-${storeId}-${idx}-${variantsList.length}`,
          name: optName.trim(),
          value: (optVal || "").trim(),
          priceDelta: 0,
          stock: 12,
          sku: `${pSlug.toUpperCase().slice(0, 4)}-${(optVal || "").trim().slice(0, 4)}`,
        });
      }
    }
    return {
      id: `prod-${storeId}-${idx + 1}`,
      storeId,
      categoryId,
      name: sp.name,
      slug: pSlug,
      shortDescription:
        sp.description.length > 120 ? sp.description.slice(0, 117) + "..." : sp.description,
      description: sp.description,
      costPrice: Math.round(sp.price * 0.45),
      additionalCost: 1000,
      price: sp.price,
      promoPrice: sp.promoPrice ?? Math.round(sp.price * 0.85),
      sku: `PROD-${Date.now().toString().slice(-4)}-${idx + 1}`,
      stock: 14,
      lowStockThreshold: 4,
      images: [sp.imageUrl],
      variants: variantsList,
      isPopular: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  });
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlatformState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PlatformState>;
        if (
          parsed.adminAccount &&
          parsed.adminAccount.phone === "+229 01 97 00 00 00"
        ) {
          parsed.adminAccount = {
            ...parsed.adminAccount,
            phone: "+229 95 78 21 32",
          };
        }
        // Mise à niveau automatique des plans vers Standard & Premium officiels
        parsed.plans = DEFAULT_PLANS;
        parsed.modules = DEFAULT_MODULES;

        if (Array.isArray(parsed.stores)) {
          const legacyNavy = new Set([
            "#102a43",
            "#0b1f33",
            "#0f172a",
            "#1e293b",
            "#15232d",
            "#1b3b5a",
          ]);
          parsed.stores = parsed.stores.map((st) => {
            const rawPrimary = (st.settings?.primaryColor || "").toLowerCase();
            const rawSecondary = (st.settings?.secondaryColor || "").toLowerCase();
            const resolvedTemplate: StoreTemplateId =
              st.settings?.template || "shrine_pro_3";
            const builderSections =
              st.settings?.builderSections && st.settings.builderSections.length > 0
                ? st.settings.builderSections
                : createDefaultShrineSections(st.name, resolvedTemplate);
            const upgradedBanner =
              st.id === "store-atelier-dakar" &&
              (!st.settings?.bannerUrl || st.settings.bannerUrl.includes("unsplash.com"))
                ? "/images/hero-african-founder-fashion.jpg"
                : st.settings?.bannerUrl;
            return {
              ...st,
              settings: {
                ...st.settings,
                bannerUrl: upgradedBanner,
                primaryColor:
                  !rawPrimary || legacyNavy.has(rawPrimary)
                    ? "#073B35"
                    : st.settings.primaryColor,
                secondaryColor:
                  !rawSecondary || rawSecondary === "#10b981" || rawSecondary === "#059669"
                    ? "#00A884"
                    : st.settings.secondaryColor,
                template: resolvedTemplate,
                builderSections,
              },
            };
          });
        }

        // Mettre à jour les visuels éditoriaux africains des produits de démonstration en cache
        if (Array.isArray(parsed.products)) {
          parsed.products = parsed.products.map((p) => {
            if (p.id === "prod-1") {
              return {
                ...p,
                images: [
                  "/images/african-fashion-model-teranga.jpg",
                  "/images/hero-african-founder-fashion.jpg",
                ],
              };
            }
            if (p.id === "prod-2") {
              return {
                ...p,
                images: ["/images/african-sneakers-leather-studio.jpg"],
              };
            }
            return p;
          });
        }
        setState((prev) => ({
          ...prev,
          ...parsed,
          codForms: mergeById(parsed.codForms, prev.codForms),
          couriers: mergeById(parsed.couriers, prev.couriers),
          expenses: mergeById(parsed.expenses, prev.expenses),
          adCampaigns: mergeById(parsed.adCampaigns, prev.adCampaigns),
          automations: mergeById(parsed.automations, prev.automations),
          teamMembers: mergeById(parsed.teamMembers, prev.teamMembers),
        }));

      }
    } catch {
      // Ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);


  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }

    const timer = window.setTimeout(() => {
      void pushCloudPlatformState({
        updatedAt: new Date().toISOString(),
        adminAccount: state.adminAccount,
        subscriptionPayments: state.subscriptionPayments,
        notifications: state.notifications,
        stores: state.stores,
        categories: state.categories,
        products: state.products,
        customers: state.customers,
        orders: state.orders,
        inventoryMovements: state.inventoryMovements,
        promoCodes: state.promoCodes,
        customDomains: state.customDomains,
        codForms: state.codForms,
        couriers: state.couriers,
        expenses: state.expenses,
        adCampaigns: state.adCampaigns,
        automations: state.automations,
        teamMembers: state.teamMembers,
        plans: state.plans,


        modules: state.modules,
        countries: state.countries,
        auditLogs: state.auditLogs,
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    hydrated,
    state.adminAccount,
    state.subscriptionPayments,
    state.notifications,
    state.stores,
    state.categories,
    state.products,
    state.customers,
    state.orders,
    state.inventoryMovements,
    state.promoCodes,
    state.customDomains,
    state.codForms,
    state.couriers,
    state.expenses,
    state.adCampaigns,
    state.automations,
    state.teamMembers,
    state.plans,


    state.modules,
    state.countries,
    state.auditLogs,
  ]);

  // Synchronisation Cloud Supabase multi-appareils (Téléphone <-> PC)
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    const pullCloud = async () => {
      const cloud = await fetchCloudPlatformState();
      if (!cloud || cancelled) return;

      setState((prev) => ({
        ...prev,
        adminAccount:
          (cloud.adminAccount as AdminAccountConfig | undefined) ??
          prev.adminAccount,
        stores: (
          mergeById(
            cloud.stores as unknown as Store[],
            prev.stores as unknown as Store[]
          ) as unknown as Store[]
        ).map((st) => {
          const rawPrimary = (st.settings?.primaryColor || "").toLowerCase();
          const rawSecondary = (st.settings?.secondaryColor || "").toLowerCase();
          const isLegacyNavy =
            rawPrimary === "#102a43" ||
            rawPrimary === "#0b1f33" ||
            rawPrimary === "#0f172a" ||
            rawPrimary === "#1e293b" ||
            rawPrimary === "#15232d" ||
            rawPrimary === "#1b3b5a";
          return {
            ...st,
            settings: {
              ...st.settings,
              primaryColor:
                !rawPrimary || isLegacyNavy ? "#073B35" : st.settings.primaryColor,
              secondaryColor:
                !rawSecondary || rawSecondary === "#10b981" || rawSecondary === "#059669"
                  ? "#00A884"
                  : st.settings.secondaryColor,
            },
          };
        }),
        categories: mergeById(
          cloud.categories as unknown as Category[],
          prev.categories as unknown as Category[]
        ) as unknown as Category[],
        products: mergeById(
          cloud.products as unknown as Product[],
          prev.products as unknown as Product[]
        ) as unknown as Product[],
        customers: mergeById(
          cloud.customers as unknown as Customer[],
          prev.customers as unknown as Customer[]
        ) as unknown as Customer[],
        orders: mergeById(
          cloud.orders as unknown as Order[],
          prev.orders as unknown as Order[]
        ) as unknown as Order[],
        inventoryMovements: mergeById(
          cloud.inventoryMovements as unknown as InventoryMovement[],
          prev.inventoryMovements as unknown as InventoryMovement[]
        ) as unknown as InventoryMovement[],
        promoCodes: mergeById(
          cloud.promoCodes as unknown as PromoCode[],
          prev.promoCodes as unknown as PromoCode[]
        ) as unknown as PromoCode[],
        customDomains: mergeById(
          cloud.customDomains as unknown as CustomDomainRequest[],
          prev.customDomains as unknown as CustomDomainRequest[]
        ) as unknown as CustomDomainRequest[],
        codForms: mergeById(
          cloud.codForms as unknown as CodFormConfig[],
          prev.codForms as unknown as CodFormConfig[]
        ) as unknown as CodFormConfig[],
        couriers: mergeById(
          cloud.couriers as unknown as Courier[],
          prev.couriers as unknown as Courier[]
        ) as unknown as Courier[],
        expenses: mergeById(
          cloud.expenses as unknown as StoreExpense[],
          prev.expenses as unknown as StoreExpense[]
        ) as unknown as StoreExpense[],
        adCampaigns: mergeById(
          cloud.adCampaigns as unknown as AdCampaign[],
          prev.adCampaigns as unknown as AdCampaign[]
        ) as unknown as AdCampaign[],
        automations: mergeById(
          cloud.automations as unknown as AutomationRule[],
          prev.automations as unknown as AutomationRule[]
        ) as unknown as AutomationRule[],
        teamMembers: mergeById(
          cloud.teamMembers as unknown as TeamMember[],
          prev.teamMembers as unknown as TeamMember[]
        ) as unknown as TeamMember[],
        subscriptionPayments: mergeById(


          cloud.subscriptionPayments as unknown as SubscriptionPaymentRequest[],
          prev.subscriptionPayments as unknown as SubscriptionPaymentRequest[]
        ) as unknown as SubscriptionPaymentRequest[],
        notifications: mergeById(
          cloud.notifications as unknown as AppNotification[],
          prev.notifications as unknown as AppNotification[]
        ) as unknown as AppNotification[],
        auditLogs: mergeById(
          cloud.auditLogs as unknown as AuditLog[],
          prev.auditLogs as unknown as AuditLog[]
        ) as unknown as AuditLog[],
      }));
    };

    void pullCloud();
    const onFocus = () => {
      void pullCloud();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [hydrated]);


  const activeStore =
    state.stores.find((s) => s.id === state.session?.activeStoreId) ?? null;

  const loginAsMerchant = (email: string, password?: string) => {
    const normalized = email.trim().toLowerCase();
    const foundOwnerStore = state.stores.find(
      (s) => s.ownerEmail.toLowerCase() === normalized
    );
    const foundTeamMember = !foundOwnerStore
      ? (state.teamMembers ?? []).find(
        (m) => m.email.toLowerCase() === normalized
      )
      : undefined;
    const found =
      foundOwnerStore ??
      (foundTeamMember
        ? state.stores.find((s) => s.id === foundTeamMember.storeId)
        : undefined);

    if (!found) {
      return {
        ok: false,
        error:
          "Aucun compte commerçant ou membre d'équipe trouvé avec cet e-mail. Vérifiez votre adresse ou créez votre boutique.",
      };
    }
    if (
      foundOwnerStore &&
      typeof password === "string" &&
      password !== "••••••••" &&
      found.ownerPassword &&
      password !== found.ownerPassword
    ) {
      return {
        ok: false,
        error: "Mot de passe incorrect pour ce compte commerçant.",
      };
    }

    const supabase = createSupabaseBrowserClient();
    if (supabase && typeof password === "string" && password !== "••••••••") {
      void supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });
    }

    const resolvedTeamRole: TeamMemberRole = foundTeamMember
      ? foundTeamMember.role
      : "owner";

    setState((prev) => ({
      ...prev,
      session: {
        userId: foundTeamMember ? foundTeamMember.id : found.ownerId,
        email: foundTeamMember ? foundTeamMember.email : found.ownerEmail,
        fullName: foundTeamMember ? foundTeamMember.fullName : found.ownerName,
        role: "merchant",
        teamRole: resolvedTeamRole,
        activeStoreId: found.id,
      },
    }));
    return { ok: true };
  };


  const isAdminEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return false;
    const acc = state.adminAccount ?? DEFAULT_ADMIN_ACCOUNT;
    return (
      normalized === acc.email.trim().toLowerCase() ||
      (Boolean(acc.secondaryEmail.trim()) &&
        normalized === acc.secondaryEmail.trim().toLowerCase())
    );
  };

  const loginAsAdmin = (email: string, password?: string) => {
    const acc = state.adminAccount ?? DEFAULT_ADMIN_ACCOUNT;
    const normalized = (email || acc.email).trim().toLowerCase();
    if (!isAdminEmail(normalized)) {
      return {
        ok: false,
        error: "Cet e-mail ne correspond pas au compte Super Administrateur.",
      };
    }
    if (
      typeof password === "string" &&
      password !== "••••••••" &&
      password !== acc.password
    ) {
      return {
        ok: false,
        error: "Mot de passe Super Administrateur incorrect.",
      };
    }
    setState((prev) => ({
      ...prev,
      session: {
        userId: "admin-ecomsate-bj",
        email: normalized,
        fullName: (prev.adminAccount ?? DEFAULT_ADMIN_ACCOUNT).fullName,
        role: "super_admin",
        activeStoreId: prev.stores[0]?.id ?? null,
      },
    }));
    return { ok: true };
  };

  const adminUpdateCredentials = (
    patch: Partial<Omit<AdminAccountConfig, "updatedAt">>
  ) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const current = prev.adminAccount ?? DEFAULT_ADMIN_ACCOUNT;
      const updated: AdminAccountConfig = {
        ...current,
        ...patch,
        email: (patch.email ?? current.email).trim().toLowerCase(),
        secondaryEmail: (
          patch.secondaryEmail ?? current.secondaryEmail
        )
          .trim()
          .toLowerCase(),
        updatedAt: now,
      };
      return {
        ...prev,
        adminAccount: updated,
        session:
          prev.session?.role === "super_admin"
            ? {
              ...prev.session,
              email: updated.email,
              fullName: updated.fullName,
            }
            : prev.session,
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            actorEmail: updated.email,
            action: "ADMIN_CREDENTIALS_UPDATED",
            targetType: "admin_account",
            targetId: "admin-ecomsate-bj",
            details: `Identifiants Super Admin mis à jour (${updated.fullName} · ${updated.email})`,
            createdAt: now,
          },
          ...prev.auditLogs,
        ],
      };
    });
  };


  const logout = () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      void supabase.auth.signOut();
    }
    setState((prev) => ({ ...prev, session: null }));
  };

  useEffect(() => {
    if (!hydrated) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const syncSupabaseUser = (user: {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
    }) => {
      const email = (user.email ?? "").trim().toLowerCase();
      if (!email) return;

      const metaName =
        (typeof user.user_metadata?.full_name === "string" &&
          user.user_metadata.full_name) ||
        (typeof user.user_metadata?.name === "string" &&
          user.user_metadata.name) ||
        email.split("@")[0];

      let pendingPrefs: PendingOAuthStorePrefs | null = null;
      try {
        const rawPrefs = window.localStorage.getItem(PENDING_OAUTH_STORE_KEY);
        if (rawPrefs) {
          pendingPrefs = JSON.parse(rawPrefs) as PendingOAuthStorePrefs;
          window.localStorage.removeItem(PENDING_OAUTH_STORE_KEY);
        }
      } catch {
        // Ignore
      }

      setState((prev) => {
        const acc = prev.adminAccount ?? DEFAULT_ADMIN_ACCOUNT;
        if (
          email === acc.email.trim().toLowerCase() ||
          (acc.secondaryEmail.trim() &&
            email === acc.secondaryEmail.trim().toLowerCase())
        ) {
          return {
            ...prev,
            session: {
              userId: user.id,
              email,
              fullName: acc.fullName || metaName,
              role: "super_admin",
              activeStoreId: prev.stores[0]?.id ?? null,
            },
          };
        }

        const existingStore = prev.stores.find(
          (s) => s.ownerEmail.toLowerCase() === email
        );

        if (existingStore) {
          if (
            prev.session?.email.toLowerCase() === email &&
            prev.session?.activeStoreId === existingStore.id
          ) {
            return prev;
          }
          return {
            ...prev,
            session: {
              userId: user.id,
              email,
              fullName: existingStore.ownerName || metaName,
              role: "merchant",
              activeStoreId: existingStore.id,
            },
          };
        }

        // Nouveau commerçant connecté via Google OAuth : création automatique de sa boutique
        const sectorId = pendingPrefs?.sectorId || "mode";
        const useAdeshinaSetup = pendingPrefs?.useAdeshinaSetup ?? true;
        const countryCode = pendingPrefs?.countryCode || "BJ";
        const phone = pendingPrefs?.phone || "+229 97 00 00 00";
        const blueprint = useAdeshinaSetup
          ? getBlueprintBySector(sectorId, pendingPrefs?.storeName)
          : null;
        const storeName =
          pendingPrefs?.storeName?.trim() ||
          blueprint?.suggestedName ||
          `Boutique ${metaName}`;

        const baseSlug = slugify(storeName) || "ma-boutique";
        const slugExists = prev.stores.some((s) => s.slug === baseSlug);
        const finalSlug = slugExists
          ? `${baseSlug}-${Math.floor(100 + Math.random() * 899)}`
          : baseSlug;

        const country = prev.countries.find((c) => c.code === countryCode);
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const storeId = `store-${Date.now()}`;

        const newStore: Store = {
          id: storeId,
          ownerId: user.id,
          ownerName: metaName,
          ownerEmail: email,
          ownerPhone: phone,
          name: storeName,
          slug: finalSlug,
          subdomain: `${finalSlug}.ecomsate.com`,
          customDomain: null,
          countryCode,
          currency: country?.currency ?? "FCFA",
          status: "trial",
          planCode: "standard",
          trialEndsAt: trialEnd.toISOString(),
          subscriptionEndsAt: null,
          createdAt: now.toISOString(),
          settings: {
            primaryColor: blueprint?.primaryColor ?? "#073B35",
            secondaryColor: blueprint?.secondaryColor ?? "#00A884",
            template: "shrine_pro_3",
            description:
              blueprint?.description ??
              `Bienvenue chez ${storeName}. Commandez en ligne et payez uniquement à la livraison.`,
            whatsappPhone: phone.replace(/\s+/g, ""),
            email,
            address: country?.name ?? "Afrique de l'Ouest",
            deliveryInfo: "Livraison rapide sous 24h à 48h. Paiement 100 % à la livraison.",
            termsOfSale: "Paiement exclusivement à la livraison à la réception du colis.",
            socials: {},
            homeSections: {
              showHero: true,
              showCategories: true,
              showPopular: true,
              showPromotions: true,
            },
            builderSections: createDefaultShrineSections(storeName, "shrine_pro_3"),
            publishedVersion: 1,
            isPublished: true,
          },
        };

        const generatedCategories: Category[] = blueprint
          ? blueprint.categories.map((cat, idx) => ({
            id: `cat-${storeId}-${idx + 1}`,
            storeId,
            name: cat.name,
            slug: slugify(cat.name) || `cat-${idx}`,
            description: cat.description,
          }))
          : [
            {
              id: `cat-${storeId}-1`,
              storeId,
              name: "Nouveautés",
              slug: "nouveautes",
              description: "Vos premiers articles en ligne",
            },
          ];

        // Pré-remplit un produit modèle prêt à vendre pour tester immédiatement la puissance de conversion de Shrine Pro 3
        const generatedProducts: Product[] = createInitialStoreProducts(
          storeId,
          generatedCategories[0]?.id || `cat-${storeId}-1`,
          blueprint
        );
        const initialCodForm = createInitialCodFormConfig(
          storeId,
          blueprint?.codPresetId ?? "mobile_fast",
          "#00A884"
        );

        return {
          ...prev,
          stores: [newStore, ...prev.stores],
          categories: [...generatedCategories, ...prev.categories],
          products: [...generatedProducts, ...prev.products],
          codForms: [initialCodForm, ...(prev.codForms ?? [])],
          session: {
            userId: user.id,
            email,
            fullName: metaName,
            role: "merchant",
            activeStoreId: newStore.id,
          },
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              actorEmail: email,
              action: "CREATION_BOUTIQUE_GOOGLE_OAUTH",
              targetType: "store",
              targetId: newStore.id,
              details: `Création via Google OAuth de ${newStore.name} (${newStore.subdomain})`,
              createdAt: now.toISOString(),
            },
            ...prev.auditLogs,
          ],
        };
      });
    };

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        syncSupabaseUser(data.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncSupabaseUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [hydrated]);


  const registerMerchant = (input: RegisterMerchantInput) => {
    const baseSlug = slugify(input.storeName) || "ma-boutique";
    const exists = state.stores.some((s) => s.slug === baseSlug);
    const finalSlug = exists
      ? `${baseSlug}-${Math.floor(100 + Math.random() * 899)}`
      : baseSlug;

    const country = state.countries.find((c) => c.code === input.countryCode);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const storeId = `store-${Date.now()}`;
    const ownerId = `user-${Date.now()}`;

    const blueprint = input.useAdeshinaSetup
      ? getBlueprintBySector(input.sectorId || "mode", input.storeName)
      : null;

    const chosenTemplate: StoreTemplateId =
      input.templateId ?? blueprint?.template ?? "shrine_pro_3";

    const newStore: Store = {
      id: storeId,
      ownerId,
      ownerName: input.fullName.trim(),
      ownerEmail: input.email.trim().toLowerCase(),
      ownerPhone: input.phone.trim(),
      ownerPassword: input.password,
      name: input.storeName.trim(),
      slug: finalSlug,
      subdomain: `${finalSlug}.ecomsate.com`,
      customDomain: null,
      countryCode: input.countryCode,
      currency: country?.currency ?? "FCFA",
      niche: input.niche ?? blueprint?.sectorLabel,
      status: "trial",
      planCode: "standard",
      trialEndsAt: trialEnd.toISOString(),
      subscriptionEndsAt: null,
      createdAt: now.toISOString(),
      settings: {
        primaryColor: blueprint?.primaryColor ?? "#073B35",
        secondaryColor: blueprint?.secondaryColor ?? "#00A884",
        template: chosenTemplate,
        description:
          blueprint?.description ??
          `Bienvenue chez ${input.storeName.trim()}. Commandez facilement et payez à la livraison.`,
        whatsappPhone: input.phone.replace(/\s+/g, ""),
        email: input.email.trim().toLowerCase(),
        address: country?.name ?? "Afrique de l'Ouest",
        deliveryInfo: "Livraison rapide sous 24h à 48h. Paiement à la livraison.",
        termsOfSale: "Paiement exclusivement à la livraison à la réception du colis.",
        socials: {},
        homeSections: {
          showHero: true,
          showCategories: true,
          showPopular: true,
          showPromotions: true,
        },
        builderSections: createDefaultShrineSections(
          input.storeName.trim(),
          chosenTemplate
        ),
        publishedVersion: 1,
        isPublished: true,
      },
    };

    const generatedCategories: Category[] = blueprint
      ? blueprint.categories.map((cat, idx) => ({
        id: `cat-${Date.now()}-${idx}`,
        storeId,
        name: cat.name,
        slug: slugify(cat.name) || `cat-${idx}`,
        description: cat.description,
      }))
      : [
        {
          id: `cat-${Date.now()}`,
          storeId,
          name: "Nouveautés",
          slug: "nouveautes",
          description: "Vos premiers articles en ligne",
        },
      ];

    // Pré-remplit un produit modèle prêt à vendre pour tester immédiatement la puissance de conversion de Shrine Pro 3
    const generatedProducts: Product[] = createInitialStoreProducts(
      storeId,
      generatedCategories[0]?.id || `cat-${Date.now()}-0`,
      blueprint
    );
    const initialCodForm = createInitialCodFormConfig(
      storeId,
      blueprint?.codPresetId ?? "mobile_fast",
      "#00A884"
    );

    setState((prev) => ({
      ...prev,
      stores: [newStore, ...prev.stores],
      categories: [...generatedCategories, ...prev.categories],
      products: [...generatedProducts, ...prev.products],
      codForms: [initialCodForm, ...(prev.codForms ?? [])],
      session: {
        userId: ownerId,
        email: newStore.ownerEmail,
        fullName: newStore.ownerName,
        role: "merchant",
        activeStoreId: storeId,
      },
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorEmail: newStore.ownerEmail,
          action: blueprint ? "STORE_CREATED_WITH_ADESHINA_IA" : "STORE_CREATED",
          targetType: "store",
          targetId: storeId,
          details: `Création automatique de ${newStore.subdomain}${blueprint ? ` avec Adeshina IA (${blueprint.sectorLabel})` : ""
            }`,
          createdAt: now.toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    const supabase = createSupabaseBrowserClient();
    if (supabase && input.password) {
      void supabase.auth.signUp({
        email: newStore.ownerEmail,
        password: input.password,
        options: {
          data: {
            full_name: newStore.ownerName,
            phone: newStore.ownerPhone,
            country_code: newStore.countryCode,
          },
        },
      });
    }

    return { ok: true, store: newStore };
  };


  const switchActiveStore = (storeId: string) => {
    const target = state.stores.find((s) => s.id === storeId);
    if (!target) return;
    setState((prev) => ({
      ...prev,
      session: prev.session
        ? {
          ...prev.session,
          activeStoreId: target.id,
          teamRole: prev.session.teamRole ?? "owner",
          ...(prev.session.role === "merchant"
            ? {
              userId: target.ownerId,
              email: target.ownerEmail,
              fullName: target.ownerName,
            }
            : {}),
        }
        : {
          userId: target.ownerId,
          email: target.ownerEmail,
          fullName: target.ownerName,
          role: "merchant",
          teamRole: "owner",
          activeStoreId: target.id,
        },
    }));
  };

  const switchActiveTeamRole = (teamRole: TeamMemberRole) => {
    setState((prev) => ({
      ...prev,
      session: prev.session
        ? {
          ...prev.session,
          teamRole,
        }
        : prev.session,
    }));
  };

  const saveCategory = (
    storeId: string,
    data: { id?: string; name: string; description?: string }
  ) => {
    const slug = slugify(data.name) || `cat-${Date.now()}`;
    setState((prev) => {
      if (data.id) {
        return {
          ...prev,
          categories: prev.categories.map((c) =>
            c.id === data.id && c.storeId === storeId
              ? { ...c, name: data.name, slug, description: data.description }
              : c
          ),
        };
      }
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        storeId,
        name: data.name,
        slug,
        description: data.description,
      };
      return { ...prev, categories: [newCat, ...prev.categories] };
    });
  };

  const deleteCategory = (storeId: string, categoryId: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter(
        (c) => !(c.id === categoryId && c.storeId === storeId)
      ),
    }));
  };

  const saveProduct = (
    storeId: string,
    data: Omit<Product, "id" | "storeId" | "slug" | "createdAt"> & {
      id?: string;
    }
  ) => {
    const slug = slugify(data.name) || `produit-${Date.now()}`;
    setState((prev) => {
      if (data.id) {
        return {
          ...prev,
          products: prev.products.map((p) =>
            p.id === data.id && p.storeId === storeId
              ? { ...p, ...data, slug }
              : p
          ),
        };
      }
      const newProd: Product = {
        ...data,
        id: `prod-${Date.now()}`,
        storeId,
        slug,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, products: [newProd, ...prev.products] };
    });
  };

  const deleteProduct = (storeId: string, productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter(
        (p) => !(p.id === productId && p.storeId === storeId)
      ),
    }));
  };

  const toggleProductActive = (storeId: string, productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId && p.storeId === storeId
          ? { ...p, isActive: !p.isActive }
          : p
      ),
    }));
  };

  const adjustStock = (
    storeId: string,
    productId: string,
    delta: number,
    reason: string
  ) => {
    setState((prev) => {
      const target = prev.products.find(
        (p) => p.id === productId && p.storeId === storeId
      );
      if (!target) return prev;
      const nextStock = Math.max(0, target.stock + delta);
      const nowIso = new Date().toISOString();
      const movement: InventoryMovement = {
        id: `mov-${Date.now()}`,
        storeId,
        productId,
        productName: target.name,
        change: delta,
        reason,
        createdAt: nowIso,
      };
      const hitLowStock =
        nextStock <= target.lowStockThreshold &&
        target.stock > target.lowStockThreshold;
      const updatedAutomations = hitLowStock
        ? (prev.automations ?? []).map((a) =>
          a.storeId === storeId &&
            a.enabled &&
            a.trigger.toLowerCase().includes("stock")
            ? { ...a, runsCount: a.runsCount + 1, lastRunAt: nowIso }
            : a
        )
        : prev.automations;
      const autoNotifs: AppNotification[] = hitLowStock
        ? [
          {
            id: `notif-stock-${Date.now()}`,
            recipientRole: "merchant",
            storeId,
            title: `[Automatisation] Stock critique : ${target.name}`,
            message: `Il ne reste plus que ${nextStock} unité(s) en stock pour ${target.name}.`,
            type: "stock",
            isRead: false,
            createdAt: nowIso,
          },
        ]
        : [];
      return {
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId && p.storeId === storeId
            ? { ...p, stock: nextStock }
            : p
        ),
        inventoryMovements: [movement, ...prev.inventoryMovements],
        automations: updatedAutomations,
        notifications: [...autoNotifs, ...(prev.notifications ?? [])],
      };
    });
  };

  const updateOrderStatus = (
    storeId: string,
    orderId: string,
    status: OrderStatus,
    note?: string
  ) => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const target = prev.orders.find(
        (o) => o.id === orderId && o.storeId === storeId
      );
      if (!target || target.status === status) return prev;

      const actor = prev.session?.fullName || "Commerçant";
      const entry: OrderHistoryEntry = {
        id: `hist-${Date.now()}`,
        actor,
        date: nowIso,
        fromStatus: target.status,
        toStatus: status,
        note,
      };

      // Réintégration stock si retour ou annulation depuis un état non annulé/retourné
      const wasCancelledOrReturned =
        target.status === "cancelled" || target.status === "returned";
      const nowCancelledOrReturned =
        status === "cancelled" || status === "returned";

      let updatedProducts = prev.products;
      const newMovements: InventoryMovement[] = [];
      if (!wasCancelledOrReturned && nowCancelledOrReturned) {
        updatedProducts = prev.products.map((prod) => {
          if (prod.storeId !== storeId) return prod;
          const qty = target.items
            .filter((i) => i.productId === prod.id)
            .reduce((acc, i) => acc + i.quantity, 0);
          if (qty === 0) return prod;
          newMovements.push({
            id: `mov-ret-${Date.now()}-${prod.id}`,
            storeId,
            productId: prod.id,
            productName: prod.name,
            change: +qty,
            reason: `${status === "returned" ? "Retour" : "Annulation"} commande ${target.orderNumber}`,
            createdAt: nowIso,
          });
          return { ...prod, stock: prod.stock + qty };
        });
      }

      // Mise à jour automatique du statut financier COD cohérent
      let nextCodFinancial: CodFinancialStatus =
        target.codFinancialStatus ?? "expected";
      if (status === "delivered" && nextCodFinancial === "expected") {
        nextCodFinancial = target.courierId
          ? "collected_by_courier"
          : "remitted";
      } else if (nowCancelledOrReturned) {
        nextCodFinancial = "uncollected";
      }

      // Mise à jour du compteur de retours client si retournée
      const updatedCustomers =
        status === "returned" && target.status !== "returned"
          ? prev.customers.map((c) => {
            if (
              c.storeId === storeId &&
              c.phone.replace(/\s+/g, "") ===
              target.customerPhone.replace(/\s+/g, "")
            ) {
              const nextReturns = (c.returnsCount ?? 0) + 1;
              return {
                ...c,
                returnsCount: nextReturns,
                segment: nextReturns >= 2 ? "at_risk" : c.segment,
              };
            }
            return c;
          })
          : prev.customers;

      // Exécution automatique des règles d'automatisation liées à la livraison / cash COD
      const isDeliveredCourierCash =
        status === "delivered" && nextCodFinancial === "collected_by_courier";
      const updatedAutomations = isDeliveredCourierCash
        ? (prev.automations ?? []).map((a) =>
          a.storeId === storeId &&
            a.enabled &&
            (a.trigger.toLowerCase().includes("livr") ||
              a.name.toLowerCase().includes("livreur"))
            ? { ...a, runsCount: a.runsCount + 1, lastRunAt: nowIso }
            : a
        )
        : prev.automations;

      return {
        ...prev,
        products: updatedProducts,
        customers: updatedCustomers,
        inventoryMovements: [...newMovements, ...prev.inventoryMovements],
        automations: updatedAutomations,
        orders: prev.orders.map((o) =>
          o.id === orderId && o.storeId === storeId
            ? {
              ...o,
              status,
              codFinancialStatus: nextCodFinancial,
              history: [...(o.history ?? []), entry],
            }
            : o
        ),
      };
    });
  };

  const updateOrderInternalNotes = (
    storeId: string,
    orderId: string,
    internalNotes: string
  ) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId && o.storeId === storeId ? { ...o, internalNotes } : o
      ),
    }));
  };

  const updateCustomerNotes = (
    storeId: string,
    customerId: string,
    internalNotes: string
  ) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === customerId && c.storeId === storeId
          ? { ...c, internalNotes }
          : c
      ),
    }));
  };

  const updateStoreSettings = (
    storeId: string,
    patch: Partial<StoreSettings>,
    storeName?: string
  ) => {
    setState((prev) => ({
      ...prev,
      stores: prev.stores.map((s) =>
        s.id === storeId
          ? {
            ...s,
            ...(storeName ? { name: storeName } : {}),
            settings: { ...s.settings, ...patch },
          }
          : s
      ),
    }));
  };

  const updateStoreBuilderSections = (
    storeId: string,
    sections: StoreSectionBlock[],
    publish = true
  ) => {
    setState((prev) => ({
      ...prev,
      stores: prev.stores.map((s) =>
        s.id === storeId
          ? {
            ...s,
            settings: {
              ...s.settings,
              builderSections: sections.map((sec, idx) => ({
                ...sec,
                order: idx + 1,
              })),
              publishedVersion: publish
                ? (s.settings.publishedVersion ?? 1) + 1
                : s.settings.publishedVersion,
              isPublished: publish ? true : s.settings.isPublished,
            },
          }
          : s
      ),
    }));
  };

  const applyStoreTheme = (
    storeId: string,
    themeId: StoreTemplateId
  ): { ok: boolean; error?: string } => {
    const store = state.stores.find((s) => s.id === storeId);
    if (!store) return { ok: false, error: "Boutique introuvable." };
    const def = ECOMSATE_THEMES.find((t) => t.id === themeId);
    if (
      def?.tier === "premium" &&
      !canUseModule(store.planCode, "premium_themes", state.modules)
    ) {
      return {
        ok: false,
        error:
          "Ce thème avancé (Shrine Pro 3 / Niche Premium) est inclus dans la formule Premium.",
      };
    }

    setState((prev) => ({
      ...prev,
      stores: prev.stores.map((s) =>
        s.id === storeId
          ? {
            ...s,
            settings: {
              ...s.settings,
              template: themeId,
              primaryColor: def?.defaultPrimary ?? s.settings.primaryColor,
              secondaryColor:
                def?.defaultSecondary ?? s.settings.secondaryColor,
              builderSections: createDefaultShrineSections(s.name, themeId),
              publishedVersion: (s.settings.publishedVersion ?? 1) + 1,
            },
          }
          : s
      ),
    }));
    return { ok: true };
  };

  const getStoreCodForm = (storeId: string): CodFormConfig => {
    const found = (state.codForms ?? []).find((f) => f.storeId === storeId);
    if (found) return found;
    return createInitialCodFormConfig(storeId, "mobile_fast", "#00A884");
  };

  const saveCodFormDraft = (
    storeId: string,
    fields: CodFormField[],
    style: CodFormStyle,
    presetId?: string
  ) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const existing = (prev.codForms ?? []).find((f) => f.storeId === storeId);
      const ordered = fields.map((f, idx) => ({ ...f, order: idx + 1 }));
      if (existing) {
        return {
          ...prev,
          codForms: prev.codForms.map((f) =>
            f.storeId === storeId
              ? {
                ...f,
                presetId: presetId ?? f.presetId,
                draftFields: ordered,
                draftStyle: style,
                updatedAt: now,
              }
              : f
          ),
        };
      }
      const created = createInitialCodFormConfig(
        storeId,
        presetId ?? "mobile_fast",
        style.buttonBg
      );
      return {
        ...prev,
        codForms: [
          {
            ...created,
            draftFields: ordered,
            draftStyle: style,
            updatedAt: now,
          },
          ...(prev.codForms ?? []),
        ],
      };
    });
  };

  const publishCodForm = (storeId: string, label?: string) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const existing =
        (prev.codForms ?? []).find((f) => f.storeId === storeId) ??
        createInitialCodFormConfig(storeId);
      const nextVersion = existing.version + 1;
      const publishedFields = existing.draftFields.map((f, idx) => ({
        ...f,
        order: idx + 1,
      }));
      const publishedStyle = { ...existing.draftStyle };
      const updated: CodFormConfig = {
        ...existing,
        publishedFields,
        publishedStyle,
        version: nextVersion,
        updatedAt: now,
        versionsHistory: [
          {
            version: nextVersion,
            savedAt: now,
            label: label || `Version publiée #${nextVersion}`,
            fields: publishedFields,
            style: publishedStyle,
          },
          ...(existing.versionsHistory ?? []).slice(0, 9),
        ],
      };
      const others = (prev.codForms ?? []).filter((f) => f.storeId !== storeId);
      return {
        ...prev,
        codForms: [updated, ...others],
      };
    });
  };

  const restoreCodFormVersion = (storeId: string, version: number) => {
    setState((prev) => ({
      ...prev,
      codForms: (prev.codForms ?? []).map((f) => {
        if (f.storeId !== storeId) return f;
        const snap = f.versionsHistory.find((v) => v.version === version);
        if (!snap) return f;
        return {
          ...f,
          draftFields: snap.fields.map((fl, i) => ({ ...fl, order: i + 1 })),
          draftStyle: { ...snap.style },
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  };

  const saveCourier = (
    storeId: string,
    data: {
      id?: string;
      name: string;
      phone: string;
      zone: string;
      isActive: boolean;
      discrepancyNote?: string;
    }
  ): { ok: boolean; error?: string } => {
    const store = state.stores.find((s) => s.id === storeId);
    if (!store) return { ok: false, error: "Boutique introuvable." };
    const storePlan = state.plans.find((p) => p.code === store.planCode);
    const maxCouriers = storePlan?.maxCouriers ?? 5;
    const currentCount = (state.couriers ?? []).filter(
      (c) => c.storeId === storeId
    ).length;

    if (!data.id && maxCouriers !== null && currentCount >= maxCouriers) {
      return {
        ok: false,
        error: `Limite de ${maxCouriers} livreurs atteinte sur votre formule actuelle. Passez au plan Premium pour des livreurs illimités.`,
      };
    }

    setState((prev) => {
      const list = prev.couriers ?? [];
      if (data.id) {
        return {
          ...prev,
          couriers: list.map((c) =>
            c.id === data.id && c.storeId === storeId ? { ...c, ...data } : c
          ),
        };
      }
      const created: Courier = {
        id: `cour-${Date.now()}`,
        storeId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        zone: data.zone.trim(),
        isActive: data.isActive,
        amountRemitted: 0,
        discrepancyNote: data.discrepancyNote,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, couriers: [created, ...list] };
    });
    return { ok: true };
  };

  const deleteCourier = (storeId: string, courierId: string) => {
    setState((prev) => ({
      ...prev,
      couriers: (prev.couriers ?? []).filter(
        (c) => !(c.id === courierId && c.storeId === storeId)
      ),
    }));
  };

  const assignOrderCourier = (
    storeId: string,
    orderId: string,
    courierId: string | null
  ) => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const courier = courierId
        ? (prev.couriers ?? []).find(
          (c) => c.id === courierId && c.storeId === storeId
        )
        : null;
      return {
        ...prev,
        orders: prev.orders.map((o) => {
          if (o.id !== orderId || o.storeId !== storeId) return o;
          const nextStatus: OrderStatus =
            courier &&
              (o.status === "new" ||
                o.status === "pending_confirmation" ||
                o.status === "confirmed" ||
                o.status === "preparing" ||
                o.status === "ready_to_ship")
              ? "assigned_courier"
              : o.status;
          const entry: OrderHistoryEntry = {
            id: `hist-${Date.now()}`,
            actor: prev.session?.fullName || "Commerçant",
            date: nowIso,
            fromStatus: o.status,
            toStatus: nextStatus,
            note: courier
              ? `Assignée au livreur ${courier.name}`
              : "Livreur retiré",
          };
          return {
            ...o,
            courierId: courier?.id ?? null,
            courierName: courier?.name ?? undefined,
            status: nextStatus,
            history: [...(o.history ?? []), entry],
          };
        }),
      };
    });
  };

  const updateOrderCodFinancialStatus = (
    storeId: string,
    orderId: string,
    codFinancialStatus: CodFinancialStatus
  ) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId && o.storeId === storeId
          ? { ...o, codFinancialStatus }
          : o
      ),
    }));
  };

  const recordCourierRemittance = (
    storeId: string,
    courierId: string,
    amount: number,
    markDeliveredOrdersRemitted = true
  ) => {
    if (amount <= 0) return;
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      couriers: (prev.couriers ?? []).map((c) =>
        c.id === courierId && c.storeId === storeId
          ? {
            ...c,
            amountRemitted: c.amountRemitted + amount,
            lastRemittanceAt: nowIso,
          }
          : c
      ),
      orders: markDeliveredOrdersRemitted
        ? prev.orders.map((o) =>
          o.storeId === storeId &&
            o.courierId === courierId &&
            o.status === "delivered" &&
            o.codFinancialStatus === "collected_by_courier"
            ? { ...o, codFinancialStatus: "remitted" }
            : o
        )
        : prev.orders,
    }));
  };

  const saveExpense = (
    storeId: string,
    data: {
      id?: string;
      category: ExpenseCategory;
      label: string;
      amount: number;
      date: string;
      notes?: string;
    }
  ) => {
    setState((prev) => {
      const list = prev.expenses ?? [];
      if (data.id) {
        return {
          ...prev,
          expenses: list.map((e) =>
            e.id === data.id && e.storeId === storeId ? { ...e, ...data } : e
          ),
        };
      }
      const created: StoreExpense = {
        id: `exp-${Date.now()}`,
        storeId,
        category: data.category,
        label: data.label.trim(),
        amount: Math.max(0, data.amount),
        date: data.date || new Date().toISOString(),
        notes: data.notes?.trim() || undefined,
      };
      return { ...prev, expenses: [created, ...list] };
    });
  };

  const deleteExpense = (storeId: string, expenseId: string) => {
    setState((prev) => ({
      ...prev,
      expenses: (prev.expenses ?? []).filter(
        (e) => !(e.id === expenseId && e.storeId === storeId)
      ),
    }));
  };

  const saveAdCampaign = (
    storeId: string,
    data: Omit<AdCampaign, "id" | "storeId"> & { id?: string }
  ) => {
    setState((prev) => {
      const list = prev.adCampaigns ?? [];
      if (data.id) {
        return {
          ...prev,
          adCampaigns: list.map((c) =>
            c.id === data.id && c.storeId === storeId ? { ...c, ...data } : c
          ),
        };
      }
      const created: AdCampaign = {
        ...data,
        id: `camp-${Date.now()}`,
        storeId,
      };
      return { ...prev, adCampaigns: [created, ...list] };
    });
  };

  const toggleAdCampaign = (storeId: string, campaignId: string) => {
    setState((prev) => ({
      ...prev,
      adCampaigns: (prev.adCampaigns ?? []).map((c) =>
        c.id === campaignId && c.storeId === storeId
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c
      ),
    }));
  };

  const deleteAdCampaign = (storeId: string, campaignId: string) => {
    setState((prev) => ({
      ...prev,
      adCampaigns: (prev.adCampaigns ?? []).filter(
        (c) => !(c.id === campaignId && c.storeId === storeId)
      ),
    }));
  };

  const saveAutomation = (
    storeId: string,
    data: {
      id?: string;
      name: string;
      trigger: string;
      condition: string;
      action: string;
      enabled: boolean;
    }
  ) => {
    setState((prev) => {
      const list = prev.automations ?? [];
      if (data.id) {
        return {
          ...prev,
          automations: list.map((a) =>
            a.id === data.id && a.storeId === storeId ? { ...a, ...data } : a
          ),
        };
      }
      const created: AutomationRule = {
        id: `auto-${Date.now()}`,
        storeId,
        name: data.name.trim(),
        trigger: data.trigger.trim(),
        condition: data.condition.trim(),
        action: data.action.trim(),
        enabled: data.enabled,
        runsCount: 0,
      };
      return { ...prev, automations: [created, ...list] };
    });
  };

  const toggleAutomation = (storeId: string, automationId: string) => {
    setState((prev) => ({
      ...prev,
      automations: (prev.automations ?? []).map((a) =>
        a.id === automationId && a.storeId === storeId
          ? { ...a, enabled: !a.enabled }
          : a
      ),
    }));
  };

  const testAutomation = (storeId: string, automationId: string) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      automations: (prev.automations ?? []).map((a) =>
        a.id === automationId && a.storeId === storeId
          ? { ...a, runsCount: a.runsCount + 1, lastRunAt: now }
          : a
      ),
    }));
  };

  const saveTeamMember = (
    storeId: string,
    data: {
      id?: string;
      fullName: string;
      email: string;
      role: TeamMemberRole;
      permissions: string[];
    }
  ): { ok: boolean; error?: string } => {
    const store = state.stores.find((s) => s.id === storeId);
    if (!store) return { ok: false, error: "Boutique introuvable." };
    if (!canUseModule(store.planCode, "multi_stores", state.modules)) {
      return {
        ok: false,
        error:
          "La gestion d'équipe multi-rôles est réservée à la formule Premium.",
      };
    }

    setState((prev) => {
      const list = prev.teamMembers ?? [];
      if (data.id) {
        return {
          ...prev,
          teamMembers: list.map((m) =>
            m.id === data.id && m.storeId === storeId ? { ...m, ...data } : m
          ),
        };
      }
      const created: TeamMember = {
        id: `team-${Date.now()}`,
        storeId,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role,
        permissions: data.permissions,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, teamMembers: [created, ...list] };
    });
    return { ok: true };
  };

  const deleteTeamMember = (storeId: string, memberId: string) => {
    setState((prev) => ({
      ...prev,
      teamMembers: (prev.teamMembers ?? []).filter(
        (m) => !(m.id === memberId && m.storeId === storeId && m.role !== "owner")
      ),
    }));
  };

  const createAdditionalStore = (input: {
    storeName: string;
    countryCode: string;
    niche?: string;
    templateId?: StoreTemplateId;
  }): { ok: boolean; store?: Store; error?: string } => {
    if (!activeStore) return { ok: false, error: "Aucune session active." };
    if (!canUseModule(activeStore.planCode, "multi_stores", state.modules)) {
      return {
        ok: false,
        error:
          "Le multi-boutiques est réservé à la formule Premium (jusqu'à 5 boutiques isolées).",
      };
    }
    const ownedStores = state.stores.filter(
      (s) => s.ownerEmail.toLowerCase() === activeStore.ownerEmail.toLowerCase()
    );
    if (ownedStores.length >= 5) {
      return {
        ok: false,
        error: "Vous avez atteint la limite maximale de 5 boutiques Premium.",
      };
    }

    const baseSlug = slugify(input.storeName) || "nouvelle-boutique";
    const exists = state.stores.some((s) => s.slug === baseSlug);
    const finalSlug = exists
      ? `${baseSlug}-${Math.floor(100 + Math.random() * 899)}`
      : baseSlug;

    const country = state.countries.find((c) => c.code === input.countryCode);
    const nowIso = new Date().toISOString();
    const storeId = `store-${Date.now()}`;
    const tpl = input.templateId ?? "shrine_pro_3";

    const newStore: Store = {
      id: storeId,
      ownerId: activeStore.ownerId,
      ownerName: activeStore.ownerName,
      ownerEmail: activeStore.ownerEmail,
      ownerPhone: activeStore.ownerPhone,
      ownerPassword: activeStore.ownerPassword,
      name: input.storeName.trim(),
      slug: finalSlug,
      subdomain: `${finalSlug}.ecomsate.com`,
      customDomain: null,
      countryCode: input.countryCode,
      currency: country?.currency ?? "FCFA",
      niche: input.niche || "Généraliste",
      status: "active",
      planCode: "premium",
      trialEndsAt: null,
      subscriptionEndsAt: activeStore.subscriptionEndsAt,
      createdAt: nowIso,
      settings: {
        primaryColor: "#073B35",
        secondaryColor: "#00A884",
        template: tpl,
        description: `Bienvenue chez ${input.storeName.trim()}. Paiement 100 % à la livraison.`,
        whatsappPhone: activeStore.ownerPhone.replace(/\s+/g, ""),
        email: activeStore.ownerEmail,
        address: country?.name ?? "Afrique de l'Ouest",
        deliveryInfo: "Livraison rapide à domicile — Paiement à la réception.",
        termsOfSale: "Paiement exclusivement à la livraison.",
        socials: {},
        homeSections: {
          showHero: true,
          showCategories: true,
          showPopular: true,
          showPromotions: true,
        },
        builderSections: createDefaultShrineSections(input.storeName.trim(), tpl),
        publishedVersion: 1,
        isPublished: true,
      },
    };

    const initialCodForm = createInitialCodFormConfig(storeId, "mobile_fast", "#00A884");

    setState((prev) => ({
      ...prev,
      stores: [newStore, ...prev.stores],
      categories: [
        {
          id: `cat-${storeId}-1`,
          storeId,
          name: "Catalogue",
          slug: "catalogue",
          description: "Articles principaux",
        },
        ...prev.categories,
      ],
      codForms: [initialCodForm, ...(prev.codForms ?? [])],
      session: prev.session
        ? { ...prev.session, activeStoreId: storeId }
        : prev.session,
    }));

    return { ok: true, store: newStore };
  };

  const placeOrder = (input: PlaceOrderInput): Order => {
    const targetStore = state.stores.find((s) => s.id === input.storeId);
    if (
      targetStore &&
      (targetStore.status !== "active" ||
        (targetStore.subscriptionEndsAt
          ? new Date(targetStore.subscriptionEndsAt).getTime() < Date.now()
          : false))
    ) {
      throw new Error(
        "Boutique en Mode Aperçu : le commerçant doit activer son abonnement pour recevoir des commandes."
      );
    }

    const subtotal = input.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const discountAmount = Math.max(
      0,
      Math.min(subtotal, Math.round(input.discountAmount ?? 0))
    );
    const totalAmount = Math.max(
      0,
      subtotal - discountAmount + input.deliveryFee
    );
    const nowIso = new Date().toISOString();
    const orderNumber = generateOrderNumber();

    // Détection automatique de doublon potentiel (même téléphone + même produit en < 24h)
    const cleanPhone = input.customerPhone.replace(/\s+/g, "");
    const firstProdId = input.items[0]?.productId;
    const isDuplicateWarning = state.orders.some((existing) => {
      if (existing.storeId !== input.storeId) return false;
      if (existing.customerPhone.replace(/\s+/g, "") !== cleanPhone) return false;
      const ageMs = Date.now() - new Date(existing.createdAt).getTime();
      if (ageMs > 24 * 60 * 60 * 1000) return false;
      return existing.items.some((it) => it.productId === firstProdId);
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      storeId: input.storeId,
      orderNumber,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      secondaryPhone: input.secondaryPhone?.trim() || undefined,
      customerEmail: input.customerEmail?.trim() || undefined,
      deliveryAddress: input.deliveryAddress.trim(),
      deliveryCity: input.deliveryCity.trim(),
      commune: input.commune?.trim() || undefined,
      district: input.district?.trim() || undefined,
      landmark: input.landmark?.trim() || undefined,
      customFields: input.customFields,
      paymentMethod: "cash_on_delivery",
      codFinancialStatus: "expected",
      status: "new",
      subtotal,
      deliveryFee: input.deliveryFee,
      promoCode: input.promoCode?.trim().toUpperCase() || undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      totalAmount,
      items: input.items.map((i) => {
        const prod = state.products.find((p) => p.id === i.productId);
        const unitCost =
          i.costPrice ??
          (prod ? (prod.costPrice ?? 0) + (prod.additionalCost ?? 0) : 0);
        return {
          ...i,
          costPrice: unitCost,
          totalPrice: i.unitPrice * i.quantity,
        };
      }),
      notes: input.notes?.trim() || undefined,
      internalNotes: input.internalNotes?.trim() || undefined,
      isDuplicateWarning,
      history: [
        {
          id: `hist-${Date.now()}`,
          actor: "Formulaire COD",
          date: nowIso,
          toStatus: "new",
          note: isDuplicateWarning
            ? "Commande enregistrée (Doublon potentiel détecté sous 24h)"
            : "Commande COD enregistrée",
        },
      ],
      createdAt: nowIso,
    };

    setState((prev) => {
      // Décrémentation des stocks + mouvements isolés sur storeId
      const newMovements: InventoryMovement[] = [];
      const updatedProducts = prev.products.map((prod) => {
        if (prod.storeId !== input.storeId) return prod;
        const orderedQty = input.items
          .filter((i) => i.productId === prod.id)
          .reduce((acc, i) => acc + i.quantity, 0);
        if (orderedQty === 0) return prod;
        newMovements.push({
          id: `mov-${Date.now()}-${prod.id}`,
          storeId: input.storeId,
          productId: prod.id,
          productName: prod.name,
          change: -orderedQty,
          reason: `Commande ${orderNumber}`,
          createdAt: nowIso,
        });
        return { ...prod, stock: Math.max(0, prod.stock - orderedQty) };
      });

      // Mise à jour ou création du client dans cette boutique uniquement
      const existingCustomer = prev.customers.find(
        (c) =>
          c.storeId === input.storeId &&
          c.phone.replace(/\s+/g, "") ===
          input.customerPhone.replace(/\s+/g, "")
      );

      let updatedCustomers: Customer[];
      if (existingCustomer) {
        updatedCustomers = prev.customers.map((c) =>
          c.id === existingCustomer.id
            ? {
              ...c,
              ordersCount: c.ordersCount + 1,
              totalSpent: c.totalSpent + totalAmount,
              address: input.deliveryAddress.trim(),
              city: input.deliveryCity.trim(),
            }
            : c
        );
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          storeId: input.storeId,
          fullName: input.customerName.trim(),
          phone: input.customerPhone.trim(),
          email: input.customerEmail?.trim() || undefined,
          address: input.deliveryAddress.trim(),
          city: input.deliveryCity.trim(),
          ordersCount: 1,
          totalSpent: totalAmount,
          createdAt: nowIso,
        };
        updatedCustomers = [newCust, ...prev.customers];
      }

      // Exécution automatique temps réel des règles d'automatisation (Section 17.2)
      const lowStockTriggered = updatedProducts.some(
        (p) =>
          p.storeId === input.storeId &&
          input.items.some((i) => i.productId === p.id) &&
          p.stock <= p.lowStockThreshold
      );
      const updatedAutomations = (prev.automations ?? []).map((a) => {
        if (a.storeId !== input.storeId || !a.enabled) return a;
        const trig = a.trigger.toLowerCase();
        const cond = a.condition.toLowerCase();
        const matchesDup =
          isDuplicateWarning &&
          (trig.includes("nouvelle commande") || a.name.toLowerCase().includes("doublon")) &&
          cond.includes("24h");
        const matchesStock = lowStockTriggered && trig.includes("stock");
        const matchesNewOrder =
          trig.includes("nouvelle commande") && !cond.includes("24h");
        if (matchesDup || matchesStock || matchesNewOrder) {
          return { ...a, runsCount: a.runsCount + 1, lastRunAt: nowIso };
        }
        return a;
      });

      return {
        ...prev,
        orders: [newOrder, ...prev.orders],
        products: updatedProducts,
        customers: updatedCustomers,
        inventoryMovements: [...newMovements, ...prev.inventoryMovements],
        automations: updatedAutomations,
        promoCodes: newOrder.promoCode
          ? (prev.promoCodes ?? []).map((pc) =>
            pc.storeId === input.storeId &&
              pc.code.toUpperCase() === newOrder.promoCode
              ? { ...pc, usedCount: pc.usedCount + 1 }
              : pc
          )
          : prev.promoCodes,
        notifications: [

          {
            id: `notif-ord-${Date.now()}`,
            recipientRole: "merchant",
            storeId: input.storeId,
            title: `Nouvelle commande ${newOrder.orderNumber}`,
            message: `${input.customerName} vient de commander pour ${newOrder.totalAmount} FCFA (${input.deliveryCity}).`,
            type: "order",
            isRead: false,
            createdAt: newOrder.createdAt,
          },
          ...(prev.notifications ?? []),
        ],

      };

    });

    return newOrder;
  };

  const adminUpdateStoreStatus = (storeId: string, status: StoreStatus) => {
    setState((prev) => ({
      ...prev,
      stores: prev.stores.map((s) =>
        s.id === storeId ? { ...s, status } : s
      ),
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorEmail: prev.session?.email ?? "admin@ecomsate.com",
          action: "STORE_STATUS_UPDATED",
          targetType: "store",
          targetId: storeId,
          details: `Statut de la boutique passé à : ${status}`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const adminUpdateStorePlan = (
    storeId: string,
    planCode: SubscriptionPlanCode
  ) => {
    setState((prev) => ({
      ...prev,
      stores: prev.stores.map((s) => {
        if (s.id !== storeId) return s;
        return {
          ...s,
          planCode,
          status: planCode === "trial" ? s.status : "active",
          settings: {
            ...s.settings,
            template: s.settings.template || "shrine_pro_3",
          },
        };
      }),
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorEmail: prev.session?.email ?? "admin@ecomsate.com",
          action: "STORE_PLAN_UPDATED",
          targetType: "store",
          targetId: storeId,
          details: `Formule mise à jour vers : ${planCode}`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const adminUpdatePlan = (
    planId: string,
    patch: Partial<SubscriptionPlan>
  ) => {
    setState((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === planId ? { ...p, ...patch } : p)),
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorEmail: prev.session?.email ?? "admin@ecomsate.com",
          action: "PLAN_CONFIG_UPDATED",
          targetType: "subscription_plan",
          targetId: planId,
          details: `Configuration tarifaire / limites modifiée`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const adminToggleModuleInPlan = (
    moduleKey: string,
    planCode: SubscriptionPlanCode
  ) => {
    setState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.key !== moduleKey) return m;
        const enabled = m.enabledInPlans.includes(planCode);
        return {
          ...m,
          enabledInPlans: enabled
            ? m.enabledInPlans.filter((p) => p !== planCode)
            : [...m.enabledInPlans, planCode],
        };
      }),
    }));
  };

  const adminToggleCountry = (countryCode: string) => {
    setState((prev) => ({
      ...prev,
      countries: prev.countries.map((c) =>
        c.code === countryCode ? { ...c, isActive: !c.isActive } : c
      ),
    }));
  };

  const submitSubscriptionPayment = (input: {
    storeId: string;
    planCode: SubscriptionPlanCode;
    billingCycle?: "monthly" | "annual";
    amount: number;
    operator: string;
    senderPhone: string;
    transactionReference: string;
  }): SubscriptionPaymentRequest | null => {
    const store = state.stores.find((s) => s.id === input.storeId);
    if (!store) return null;
    const now = new Date().toISOString();
    const cycle = input.billingCycle ?? "monthly";
    const req: SubscriptionPaymentRequest = {
      id: `subpay-${Date.now()}`,
      storeId: store.id,
      storeName: store.name,
      merchantName: store.ownerName,
      merchantEmail: store.ownerEmail,
      merchantPhone: store.ownerPhone,
      planCode: input.planCode,
      billingCycle: cycle,
      amount: input.amount,
      currency: store.currency || "FCFA",
      operator: input.operator,
      senderPhone: input.senderPhone.trim(),
      transactionReference: input.transactionReference.trim(),
      status: "pending",
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      subscriptionPayments: [req, ...(prev.subscriptionPayments ?? [])],
      notifications: [
        {
          id: `notif-adm-${Date.now()}`,
          recipientRole: "super_admin",
          storeId: store.id,
          title: `Nouveau paiement Mobile Money (${store.name})`,
          message: `${store.ownerName} a déclaré ${req.amount} ${req.currency} via ${req.operator} (Réf: ${req.transactionReference}).`,
          type: "payment",
          isRead: false,
          createdAt: now,
        },
        {
          id: `notif-mer-${Date.now() + 1}`,
          recipientRole: "merchant",
          storeId: store.id,
          title: "Paiement Mobile Money transmis",
          message: `Votre référence ${req.transactionReference} (${req.amount} ${req.currency}) est en cours de vérification par l'administration.`,
          type: "subscription",
          isRead: false,
          createdAt: now,
        },
        ...(prev.notifications ?? []),
      ],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorEmail: store.ownerEmail,
          action: "SUBSCRIPTION_PAYMENT_DECLARED",
          targetType: "store",
          targetId: store.id,
          details: `Paiement Mobile Money déclaré (${req.operator} · ${req.amount} ${req.currency} · Réf: ${req.transactionReference}) pour la formule ${req.planCode} (${cycle === "annual" ? "Annuel" : "Mensuel"})`,
          createdAt: now,
        },
        ...prev.auditLogs,
      ],
    }));

    return req;
  };

  const adminReviewSubscriptionPayment = (
    paymentId: string,
    decision: "approved" | "rejected"
  ) => {
    const now = new Date();
    setState((prev) => {
      const target = (prev.subscriptionPayments ?? []).find(
        (p) => p.id === paymentId
      );
      if (!target) return prev;

      const durationDays = target.billingCycle === "annual" ? 365 : 30;
      const nextExpiry = new Date(
        now.getTime() + durationDays * 24 * 60 * 60 * 1000
      );

      return {
        ...prev,
        subscriptionPayments: (prev.subscriptionPayments ?? []).map((p) =>
          p.id === paymentId
            ? { ...p, status: decision, reviewedAt: now.toISOString() }
            : p
        ),
        stores:
          decision === "approved"
            ? prev.stores.map((s) => {
                if (s.id !== target.storeId) return s;
                const unlockShrinePro3 = target.planCode === "premium";
                return {
                  ...s,
                  status: "active",
                  planCode: target.planCode,
                  subscriptionEndsAt: nextExpiry.toISOString(),
                  settings: unlockShrinePro3
                    ? {
                        ...s.settings,
                        template: "shrine_pro_3",
                        builderSections: createDefaultShrineSections(
                          s.name,
                          "shrine_pro_3"
                        ),
                      }
                    : s.settings,
                };
              })
            : prev.stores,
        notifications: [
          {
            id: `notif-rev-${Date.now()}`,
            recipientRole: "merchant",
            storeId: target.storeId,
            title:
              decision === "approved"
                ? `Abonnement ${target.planCode.toUpperCase()} activé !`
                : "Paiement Mobile Money non validé",
            message:
              decision === "approved"
                ? `Votre paiement de ${target.amount} ${target.currency} (Réf ${target.transactionReference}) a été validé par l'administration. Votre boutique est active pour ${durationDays} jours.`
                : `La référence ${target.transactionReference} n'a pas pu être confirmée. Contactez le support WhatsApp.`,
            type: "subscription",
            isRead: false,
            createdAt: now.toISOString(),
          },
          ...(prev.notifications ?? []),
        ],
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            actorEmail: prev.adminAccount?.email ?? "admin@ecomsate.bj",
            action:
              decision === "approved"
                ? "SUBSCRIPTION_PAYMENT_APPROVED"
                : "SUBSCRIPTION_PAYMENT_REJECTED",
            targetType: "store",
            targetId: target.storeId,
            details: `${decision === "approved"
              ? "Validation & activation"
              : "Rejet"
              } du paiement Mobile Money (${target.operator} · Réf ${target.transactionReference}) pour ${target.storeName}`,
            createdAt: now.toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const markNotificationRead = (notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: (prev.notifications ?? []).map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
    }));
  };

  const markAllNotificationsRead = (
    storeId?: string,
    role?: "merchant" | "super_admin"
  ) => {
    setState((prev) => ({
      ...prev,
      notifications: (prev.notifications ?? []).map((n) => {
        if (role && n.recipientRole !== role) return n;
        if (storeId && n.storeId !== storeId) return n;
        return { ...n, isRead: true };
      }),
    }));
  };

  const savePromoCode = (
    storeId: string,
    data: {
      id?: string;
      code: string;
      discountType: "percent" | "fixed";
      discountValue: number;
      minOrderAmount: number;
      maxUses: number | null;
      expiresAt?: string | null;
      isActive: boolean;
    }
  ): { ok: boolean; error?: string } => {
    const cleanCode = data.code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "");
    if (cleanCode.length < 3) {
      return {
        ok: false,
        error: "Le code promo doit contenir au moins 3 caractères (lettres/chiffres).",
      };
    }
    const duplicate = (state.promoCodes ?? []).some(
      (p) =>
        p.storeId === storeId &&
        p.code.toUpperCase() === cleanCode &&
        p.id !== data.id
    );
    if (duplicate) {
      return {
        ok: false,
        error: `Le code ${cleanCode} existe déjà dans votre boutique.`,
      };
    }

    setState((prev) => {
      const list = prev.promoCodes ?? [];
      if (data.id) {
        return {
          ...prev,
          promoCodes: list.map((p) =>
            p.id === data.id && p.storeId === storeId
              ? {
                ...p,
                code: cleanCode,
                discountType: data.discountType,
                discountValue: Math.max(1, data.discountValue),
                minOrderAmount: Math.max(0, data.minOrderAmount),
                maxUses: data.maxUses,
                expiresAt: data.expiresAt || null,
                isActive: data.isActive,
              }
              : p
          ),
        };
      }

      const created: PromoCode = {
        id: `promo-${Date.now()}`,
        storeId,
        code: cleanCode,
        discountType: data.discountType,
        discountValue: Math.max(1, data.discountValue),
        minOrderAmount: Math.max(0, data.minOrderAmount),
        maxUses: data.maxUses,
        usedCount: 0,
        expiresAt: data.expiresAt || null,
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, promoCodes: [created, ...list] };
    });

    return { ok: true };
  };

  const togglePromoCodeActive = (storeId: string, promoId: string) => {
    setState((prev) => ({
      ...prev,
      promoCodes: (prev.promoCodes ?? []).map((p) =>
        p.id === promoId && p.storeId === storeId
          ? { ...p, isActive: !p.isActive }
          : p
      ),
    }));
  };

  const deletePromoCode = (storeId: string, promoId: string) => {
    setState((prev) => ({
      ...prev,
      promoCodes: (prev.promoCodes ?? []).filter(
        (p) => !(p.id === promoId && p.storeId === storeId)
      ),
    }));
  };

  const requestCustomDomain = (
    storeId: string,
    domain: string,
    requestType: "connect_existing" | "buy_new"
  ): { ok: boolean; error?: string } => {
    const store = state.stores.find((s) => s.id === storeId);
    if (!store) return { ok: false, error: "Boutique introuvable." };

    if (!canUseModule(store.planCode, "custom_domain", state.modules)) {
      return {
        ok: false,
        error:
          "Les domaines personnalisés sont réservés à la formule Premium (15 000 FCFA / mois).",
      };
    }

    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");

    if (!/^[a-z0-9-]+(\.[a-z]{2,})+$/.test(cleanDomain)) {
      return {
        ok: false,
        error:
          "Format de nom de domaine invalide (ex : maboutique.com ou maboutique.bj).",
      };
    }

    const exists = (state.customDomains ?? []).some(
      (d) => d.domain.toLowerCase() === cleanDomain && d.status !== "rejected"
    );
    if (exists) {
      return {
        ok: false,
        error: `Le domaine ${cleanDomain} est déjà enregistré ou en cours de vérification.`,
      };
    }

    const now = new Date().toISOString();
    const req: CustomDomainRequest = {
      id: `dom-${Date.now()}`,
      storeId: store.id,
      storeName: store.name,
      merchantEmail: store.ownerEmail,
      domain: cleanDomain,
      requestType,
      status: "pending_dns",
      dnsTarget: "cname.vercel-dns.com",
      createdAt: now,
      verifiedAt: null,
    };

    setState((prev) => ({
      ...prev,
      customDomains: [req, ...(prev.customDomains ?? [])],
      notifications: [
        {
          id: `notif-dom-${Date.now()}`,
          recipientRole: "super_admin",
          storeId: store.id,
          title: `Demande de domaine (${cleanDomain})`,
          message: `${store.name} souhaite ${requestType === "buy_new" ? "commander" : "connecter"
            } le domaine ${cleanDomain}.`,
          type: "subscription",
          isRead: false,
          createdAt: now,
        },
        ...(prev.notifications ?? []),
      ],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorEmail: store.ownerEmail,
          action: "CUSTOM_DOMAIN_REQUESTED",
          targetType: "custom_domain",
          targetId: req.id,
          details: `Demande de domaine personnalisé ${cleanDomain} (${requestType}) pour ${store.name}`,
          createdAt: now,
        },
        ...prev.auditLogs,
      ],
    }));

    return { ok: true };
  };

  const deleteCustomDomainRequest = (storeId: string, domainId: string) => {
    setState((prev) => ({
      ...prev,
      customDomains: (prev.customDomains ?? []).filter(
        (d) => !(d.id === domainId && d.storeId === storeId)
      ),
    }));
  };

  const adminUpdateDomainStatus = (
    domainId: string,
    status: "active_ssl" | "rejected"
  ) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const target = (prev.customDomains ?? []).find((d) => d.id === domainId);
      if (!target) return prev;
      return {
        ...prev,
        customDomains: (prev.customDomains ?? []).map((d) =>
          d.id === domainId
            ? {
              ...d,
              status,
              verifiedAt: status === "active_ssl" ? now : null,
            }
            : d
        ),
        stores:
          status === "active_ssl"
            ? prev.stores.map((s) =>
              s.id === target.storeId
                ? { ...s, customDomain: target.domain }
                : s
            )
            : prev.stores,
        notifications: [
          {
            id: `notif-dom-rev-${Date.now()}`,
            recipientRole: "merchant",
            storeId: target.storeId,
            title:
              status === "active_ssl"
                ? `Domaine ${target.domain} activé en HTTPS !`
                : `Domaine ${target.domain} non vérifié`,
            message:
              status === "active_ssl"
                ? `Votre nom de domaine personnalisé ${target.domain} est désormais connecté avec certificat SSL actif.`
                : `La configuration DNS de ${target.domain} n'a pas pu être validée. Vérifiez vos enregistrements DNS.`,
            type: "subscription",
            isRead: false,
            createdAt: now,
          },
          ...(prev.notifications ?? []),
        ],
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            actorEmail: prev.adminAccount?.email ?? "admin@ecomsate.bj",
            action:
              status === "active_ssl"
                ? "CUSTOM_DOMAIN_ACTIVATED"
                : "CUSTOM_DOMAIN_REJECTED",
            targetType: "custom_domain",
            targetId: domainId,
            details: `Domaine ${target.domain} (${target.storeName}) passé au statut : ${status}`,
            createdAt: now,
          },
          ...prev.auditLogs,
        ],
      };
    });
  };





  return (
    <PlatformContext.Provider
      value={{
        ...state,
        hydrated,
        activeStore,
        loginAsMerchant,
        loginAsAdmin,
        isAdminEmail,
        adminUpdateCredentials,
        logout,

        registerMerchant,
        createAdditionalStore,
        switchActiveStore,
        switchActiveTeamRole,
        saveCategory,
        deleteCategory,
        saveProduct,
        deleteProduct,
        toggleProductActive,
        adjustStock,
        updateOrderStatus,
        updateOrderInternalNotes,
        updateCustomerNotes,
        updateStoreSettings,
        updateStoreBuilderSections,
        applyStoreTheme,
        getStoreCodForm,
        saveCodFormDraft,
        publishCodForm,
        restoreCodFormVersion,
        saveCourier,
        deleteCourier,
        assignOrderCourier,
        updateOrderCodFinancialStatus,
        recordCourierRemittance,
        saveExpense,
        deleteExpense,
        saveAdCampaign,
        toggleAdCampaign,
        deleteAdCampaign,
        saveAutomation,
        toggleAutomation,
        testAutomation,
        saveTeamMember,
        deleteTeamMember,
        savePromoCode,
        togglePromoCodeActive,
        deletePromoCode,
        requestCustomDomain,
        deleteCustomDomainRequest,
        adminUpdateDomainStatus,
        placeOrder,


        submitSubscriptionPayment,
        adminReviewSubscriptionPayment,
        markNotificationRead,
        markAllNotificationsRead,
        adminUpdateStoreStatus,


        adminUpdateStorePlan,
        adminUpdatePlan,
        adminToggleModuleInPlan,
        adminToggleCountry,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return ctx;
}
