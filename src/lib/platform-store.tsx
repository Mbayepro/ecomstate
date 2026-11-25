"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  AuditLog,
  Category,
  CountryConfig,
  Customer,
  InventoryMovement,
  ModulePermission,
  Order,
  OrderStatus,
  PaymentMethodCode,
  Product,
  Store,
  StoreSettings,
  StoreStatus,
  SubscriptionPlan,
  SubscriptionPlanCode,
  UserRole,
} from "@/types/domain";
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_COUNTRIES,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_STORES,
} from "@/lib/seed-data";
import { DEFAULT_MODULES, DEFAULT_PLANS } from "@/lib/permissions";
import { ADESHINA_SECTORS, getBlueprintBySector } from "@/lib/adeshina-ai";

import { generateOrderNumber, slugify } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
}

interface PlaceOrderInput {
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  paymentMethod: PaymentMethodCode;
  paymentReference?: string;
  notes?: string;
  deliveryFee: number;
  items: {
    productId: string;
    productName: string;
    variantLabel?: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
  }[];
}

interface PlatformContextValue extends PlatformState {
  hydrated: boolean;
  activeStore: Store | null;
  // Auth
  loginAsMerchant: (email: string) => { ok: boolean; error?: string };
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
  switchActiveStore: (storeId: string) => void;
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
    status: OrderStatus
  ) => void;
  updateStoreSettings: (
    storeId: string,
    patch: Partial<StoreSettings>,
    storeName?: string
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
  plans: DEFAULT_PLANS,
  modules: DEFAULT_MODULES,
  countries: INITIAL_COUNTRIES,
  auditLogs: INITIAL_AUDIT_LOGS,
};

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
        // Nettoyer les produits exemples auto-générés dans les vraies boutiques nouvellement créées (hors boutiques Démo)
        if (Array.isArray(parsed.products)) {
          const sampleNames = new Set(
            ADESHINA_SECTORS.flatMap((sec) =>
              sec.sampleProducts.map((sp) => sp.name.toLowerCase())
            )
          );
          parsed.products = parsed.products.filter((p) => {
            const isDemoStore =
              p.storeId === "store-atelier-dakar" ||
              p.storeId === "store-cotonou-tech";
            if (isDemoStore) return true;
            return !sampleNames.has(p.name.toLowerCase());
          });
        }
        setState((prev) => ({ ...prev, ...parsed }));

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
  }, [state, hydrated]);

  const activeStore =
    state.stores.find((s) => s.id === state.session?.activeStoreId) ?? null;

  const loginAsMerchant = (email: string) => {
    const normalized = email.trim().toLowerCase();
    const found = state.stores.find(
      (s) => s.ownerEmail.toLowerCase() === normalized
    );
    if (!found) {
      return {
        ok: false,
        error:
          "Aucun compte commerçant trouvé avec cet e-mail. Essayez aminata@atelierdakar.sn ou créez votre boutique.",
      };
    }
    setState((prev) => ({
      ...prev,
      session: {
        userId: found.ownerId,
        email: found.ownerEmail,
        fullName: found.ownerName,
        role: "merchant",
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
          planCode: "trial",
          trialEndsAt: trialEnd.toISOString(),
          subscriptionEndsAt: null,
          createdAt: now.toISOString(),
          settings: {
            primaryColor: blueprint?.primaryColor ?? "#102A43",
            secondaryColor: blueprint?.secondaryColor ?? "#10B981",
            template: blueprint?.template ?? "minimal",
            description:
              blueprint?.description ??
              `Bienvenue chez ${storeName}. Découvrez nos produits et commandez facilement en ligne.`,
            whatsappPhone: phone.replace(/\s+/g, ""),
            email,
            address: country?.name ?? "Afrique de l'Ouest",
            deliveryInfo: "Livraison rapide sous 24h à 48h.",
            termsOfSale: "Paiement à la livraison ou par Mobile Money.",
            socials: {},
            homeSections: {
              showHero: true,
              showCategories: true,
              showPopular: true,
              showPromotions: true,
            },
            mobileMoneyNumber: phone,
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

        // Une nouvelle boutique démarre toujours avec un catalogue vide (0 produit fictif)
        const generatedProducts: Product[] = [];



        return {
          ...prev,
          stores: [newStore, ...prev.stores],
          categories: [...generatedCategories, ...prev.categories],
          products: [...generatedProducts, ...prev.products],
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

    const newStore: Store = {
      id: storeId,
      ownerId,
      ownerName: input.fullName.trim(),
      ownerEmail: input.email.trim().toLowerCase(),
      ownerPhone: input.phone.trim(),
      name: input.storeName.trim(),
      slug: finalSlug,
      subdomain: `${finalSlug}.ecomsate.com`,
      customDomain: null,
      countryCode: input.countryCode,
      currency: country?.currency ?? "FCFA",
      status: "trial",
      planCode: "trial",
      trialEndsAt: trialEnd.toISOString(),
      subscriptionEndsAt: null,
      createdAt: now.toISOString(),
      settings: {
        primaryColor: blueprint?.primaryColor ?? "#102A43",
        secondaryColor: blueprint?.secondaryColor ?? "#10B981",
        template: blueprint?.template ?? "minimal",
        description:
          blueprint?.description ??
          `Bienvenue chez ${input.storeName.trim()}. Découvrez nos produits et commandez facilement en ligne.`,
        whatsappPhone: input.phone.replace(/\s+/g, ""),
        email: input.email.trim().toLowerCase(),
        address: country?.name ?? "Afrique de l'Ouest",
        deliveryInfo: "Livraison rapide sous 24h à 48h.",
        termsOfSale: "Paiement à la livraison ou par Mobile Money.",
        socials: {},
        homeSections: {
          showHero: true,
          showCategories: true,
          showPopular: true,
          showPromotions: true,
        },
        mobileMoneyNumber: input.phone.trim(),
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

    // Une nouvelle boutique démarre toujours avec un catalogue vide (0 produit fictif)
    const generatedProducts: Product[] = [];


    setState((prev) => ({
      ...prev,
      stores: [newStore, ...prev.stores],
      categories: [...generatedCategories, ...prev.categories],
      products: [...generatedProducts, ...prev.products],
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
          details: `Création automatique de ${newStore.subdomain}${
            blueprint ? ` avec Adeshina IA (${blueprint.sectorLabel})` : ""
          }`,
          createdAt: now.toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

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
            activeStoreId: target.id,
          },
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
      const movement: InventoryMovement = {
        id: `mov-${Date.now()}`,
        storeId,
        productId,
        productName: target.name,
        change: delta,
        reason,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId && p.storeId === storeId
            ? { ...p, stock: nextStock }
            : p
        ),
        inventoryMovements: [movement, ...prev.inventoryMovements],
      };
    });
  };

  const updateOrderStatus = (
    storeId: string,
    orderId: string,
    status: OrderStatus
  ) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId && o.storeId === storeId ? { ...o, status } : o
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

  const placeOrder = (input: PlaceOrderInput): Order => {
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const totalAmount = subtotal + input.deliveryFee;
    const nowIso = new Date().toISOString();
    const orderNumber = generateOrderNumber();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      storeId: input.storeId,
      orderNumber,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      customerEmail: input.customerEmail?.trim() || undefined,
      deliveryAddress: input.deliveryAddress.trim(),
      deliveryCity: input.deliveryCity.trim(),
      paymentMethod: input.paymentMethod,
      paymentReference: input.paymentReference?.trim() || undefined,
      status:
        input.paymentMethod === "manual_mobile_money"
          ? "pending_confirmation"
          : "new",
      subtotal,
      deliveryFee: input.deliveryFee,
      totalAmount,
      items: input.items.map((i) => ({
        ...i,
        totalPrice: i.unitPrice * i.quantity,
      })),
      notes: input.notes?.trim() || undefined,
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

      return {
        ...prev,
        orders: [newOrder, ...prev.orders],
        products: updatedProducts,
        customers: updatedCustomers,
        inventoryMovements: [...newMovements, ...prev.inventoryMovements],
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
      stores: prev.stores.map((s) =>
        s.id === storeId ? { ...s, planCode } : s
      ),
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
            ? prev.stores.map((s) =>
                s.id === target.storeId
                  ? {
                      ...s,
                      status: "active",
                      planCode: target.planCode,
                      subscriptionEndsAt: nextExpiry.toISOString(),
                    }
                  : s
              )
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
            details: `${
              decision === "approved"
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
        switchActiveStore,
        saveCategory,
        deleteCategory,
        saveProduct,
        deleteProduct,
        toggleProductActive,
        adjustStock,
        updateOrderStatus,
        updateStoreSettings,
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
