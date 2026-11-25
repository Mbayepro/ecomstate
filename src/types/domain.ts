export type UserRole = "merchant" | "admin" | "super_admin";

export type TeamMemberRole =
  | "owner"
  | "admin"
  | "operator"
  | "delivery_manager"
  | "courier"
  | "analyst";

export type SubscriptionPlanCode = "trial" | "standard" | "premium";

export type StoreStatus = "trial" | "active" | "suspended";

export type StoreTemplateId =
  | "shrine_pro_1"
  | "shrine_pro_3"
  | "minimal"
  | "boutique"
  | "editorial";

/**
 * 11 statuts officiels du cycle de vie de commande COD (Section 10.5 du Cahier des charges)
 */
export type OrderStatus =
  | "new"
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_to_ship"
  | "assigned_courier"
  | "shipped"
  | "delivered"
  | "delivery_failed"
  | "returned"
  | "cancelled";

/**
 * 6 statuts financiers COD indépendants du statut de livraison (Section 12.4)
 */
export type CodFinancialStatus =
  | "uncollected"
  | "expected"
  | "collected_by_courier"
  | "partially_remitted"
  | "remitted"
  | "discrepancy";

export type PaymentMethodCode =
  | "cash_on_delivery"
  | "whatsapp_order"
  | "manual_mobile_money";

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  phonePrefix: string;
  isActive: boolean;
  paymentProviders: string[];
}

export interface ModulePermission {
  key: string;
  label: string;
  description: string;
  enabledInPlans: SubscriptionPlanCode[];
  limits?: Partial<Record<SubscriptionPlanCode, number | null>>;
  limitsByPlan?: Partial<Record<SubscriptionPlanCode, number | null>>;
}

export interface SubscriptionPlan {
  id: string;
  code: SubscriptionPlanCode;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  description: string;
  maxProducts: number | null;
  maxStores?: number | null;
  maxCouriers?: number | null;
  aiQuotaMonthly?: number | null;
  customDomainAllowed: boolean;
  isActive: boolean;
  features: string[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  estimatedDelay?: string;
}

export type StoreSectionType =
  | "announcement_bar"
  | "hero_shrine"
  | "ticker_marquee"
  | "benefits_grid"
  | "categories_rail"
  | "featured_collection"
  | "bundle_deals"
  | "results_bars"
  | "comparison_table"
  | "faq_accordion";

export interface StoreSectionItem {
  id: string;
  title: string;
  text: string;
  badge?: string;
  percentage?: number;
}

export interface StoreSectionBlock {
  id: string;
  type: StoreSectionType;
  title: string;
  subtitle?: string;
  visible: boolean;
  order: number;
  items?: StoreSectionItem[];
}

export interface StoreSettings {
  primaryColor: string;
  secondaryColor: string;
  template: StoreTemplateId;
  logoUrl?: string;
  bannerUrl?: string;
  description: string;
  whatsappPhone: string;
  email: string;
  address: string;
  deliveryInfo: string;
  deliveryZones?: DeliveryZone[];
  freeDeliveryThreshold?: number | null;
  termsOfSale: string;
  socials: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  homeSections: {
    showHero: boolean;
    showCategories: boolean;
    showPopular: boolean;
    showPromotions: boolean;
  };
  builderSections?: StoreSectionBlock[];
  publishedVersion?: number;
  isPublished?: boolean;
  mobileMoneyNumber?: string;
  mobileMoneyInstructions?: string;
}

export interface Store {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword?: string;
  name: string;
  slug: string;
  subdomain: string;
  customDomain?: string | null;
  countryCode: string;
  currency: string;
  niche?: string;
  status: StoreStatus;
  planCode: SubscriptionPlanCode;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  createdAt: string;
  settings: StoreSettings;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  sku?: string;
  priceDelta?: number;
  stock: number;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  costPrice?: number;
  additionalCost?: number;
  price: number;
  promoPrice?: number | null;
  sku?: string;
  weightGrams?: number;
  videoUrl?: string;
  stock: number;
  reservedStock?: number;
  lowStockThreshold: number;
  images: string[];
  variants: ProductVariant[];
  isActive: boolean;
  isPopular?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  change: number;
  reason: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  storeId: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  ordersCount: number;
  returnsCount?: number;
  totalSpent: number;
  segment?: "new" | "loyal" | "at_risk";
  internalNotes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface OrderHistoryEntry {
  id: string;
  actor: string;
  date: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  note?: string;
}

export interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  customerId?: string;
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
  courierId?: string | null;
  courierName?: string;
  paymentMethod: PaymentMethodCode;
  paymentStatus?: "pending" | "paid";
  codFinancialStatus?: CodFinancialStatus;
  paymentReference?: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  promoCode?: string;
  discountAmount?: number;
  totalAmount: number;
  items: OrderItem[];
  notes?: string;
  internalNotes?: string;
  isDuplicateWarning?: boolean;
  history?: OrderHistoryEntry[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  storeId: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CustomDomainRequest {
  id: string;
  storeId: string;
  storeName: string;
  merchantEmail: string;
  domain: string;
  requestType: "connect_existing" | "buy_new";
  status: "pending_dns" | "active_ssl" | "rejected";
  dnsTarget: string;
  createdAt: string;
  verifiedAt?: string | null;
}

/**
 * Module 9 — Form Builder COD (Formulaire de commande personnalisable)
 */
export type CodFieldType =
  | "full_name"
  | "phone"
  | "secondary_phone"
  | "city"
  | "commune"
  | "district"
  | "address"
  | "landmark"
  | "quantity"
  | "select"
  | "radio"
  | "checkbox"
  | "short_text"
  | "long_text"
  | "delivery_notes";

export interface CodFormField {
  id: string;
  name: string;
  label: string;
  type: CodFieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  visible: boolean;
  order: number;
  options?: string[];
  conditionalFieldName?: string;
  conditionalEquals?: string;
}

export interface CodFormStyle {
  fieldBg: string;
  borderColor: string;
  textColor: string;
  buttonBg: string;
  buttonText: string;
  borderRadius: "sm" | "md" | "lg" | "xl";
  buttonLabel: string;
  title: string;
  subtitle: string;
  showOrderSummary: boolean;
  enableQuantityBreaks: boolean;
}

export interface CodFormConfig {
  id: string;
  storeId: string;
  presetId: string;
  publishedFields: CodFormField[];
  publishedStyle: CodFormStyle;
  draftFields: CodFormField[];
  draftStyle: CodFormStyle;
  version: number;
  updatedAt: string;
  versionsHistory: {
    version: number;
    savedAt: string;
    label: string;
    fields: CodFormField[];
    style: CodFormStyle;
  }[];
}

/**
 * Module 12 — Livreurs & Rapprochement COD
 */
export interface Courier {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  zone: string;
  isActive: boolean;
  amountRemitted: number;
  lastRemittanceAt?: string;
  discrepancyNote?: string;
  createdAt: string;
}

/**
 * Module 13 — Dépenses & Bénéfice Réel
 */
export type ExpenseCategory =
  | "product_purchase"
  | "ads"
  | "delivery"
  | "packaging"
  | "salary"
  | "other";

export interface StoreExpense {
  id: string;
  storeId: string;
  category: ExpenseCategory;
  label: string;
  amount: number;
  date: string;
  notes?: string;
}

/**
 * Module 16 — Campagnes Publicitaires
 */
export interface AdCampaign {
  id: string;
  storeId: string;
  platform: "Meta (Facebook / Instagram)" | "TikTok Ads" | "Snapchat" | "Autre";
  name: string;
  budget: number;
  spent: number;
  productId?: string;
  manualLeadsOrOrders?: number;
  startDate: string;
  status: "active" | "paused";
}

/**
 * Module 17 — Automatisations (Déclencheur -> Conditions -> Action)
 */
export interface AutomationRule {
  id: string;
  storeId: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  runsCount: number;
  lastRunAt?: string;
}

/**
 * Module 20 — Gestion d'Équipe
 */
export interface TeamMember {
  id: string;
  storeId: string;
  fullName: string;
  email: string;
  role: TeamMemberRole;
  permissions: string[];
  createdAt: string;
}
