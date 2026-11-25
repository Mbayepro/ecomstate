export type UserRole = "merchant" | "admin" | "super_admin";

export type StoreStatus = "trial" | "active" | "suspended" | "pending_activation";

export type SubscriptionPlanCode = "trial" | "standard" | "premium";

export type OrderStatus =
  | "new"
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethodCode =
  | "cash_on_delivery"
  | "whatsapp_order"
  | "manual_mobile_money";

export type StoreTemplateId = "minimal" | "boutique" | "editorial";

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
  customDomainAllowed: boolean;
  isActive: boolean;
  features: string[];
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
  status: StoreStatus;
  planCode: SubscriptionPlanCode;
  trialEndsAt?: string | null;
  subscriptionEndsAt?: string | null;
  createdAt: string;
  settings: StoreSettings;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Taille" or "Couleur"
  value: string; // e.g., "M", "Noir"
  stock: number;
  priceDelta?: number;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promoPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  variants: ProductVariant[];
  isActive: boolean;
  isPopular?: boolean;
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
  address: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  paymentMethod: PaymentMethodCode;
  paymentReference?: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  promoCode?: string;
  discountAmount?: number;
  totalAmount: number;

  items: OrderItem[];
  notes?: string;
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

