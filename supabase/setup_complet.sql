-- ============================================================================
-- ECOMSATE — SCRIPT D'INSTALLATION COMPLET ET IDEMPOTENT (SUPABASE SQL EDITOR)
-- Regroupe : 0001 (Schéma) + 0002 (Politiques RLS) + 0003 (Données initiales)
-- Vous pouvez coller tout ce fichier d'un seul coup dans le SQL Editor Supabase
-- et cliquer sur "Run" (ré-exécutable sans erreur).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Pays & prestataires de paiement
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  phone_prefix TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('platform_subscription', 'store_checkout', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (country_id, code)
);

-- 2. Profils utilisateurs (liés à auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country_code TEXT NOT NULL DEFAULT 'BJ',
  role TEXT NOT NULL DEFAULT 'merchant' CHECK (role IN ('merchant', 'admin', 'super_admin')),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger automatique pour créer le profil lors d'une inscription Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, country_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'country_code', 'BJ')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Offres d'abonnement & Modules centralisés
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price INTEGER NOT NULL DEFAULT 0,
  annual_price INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  max_products INTEGER,
  custom_domain_allowed BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  limit_value INTEGER,
  UNIQUE (plan_id, module_id)
);

-- 4. Boutiques (Multi-tenant core)
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subdomain TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL DEFAULT 'BJ',
  currency TEXT NOT NULL DEFAULT 'FCFA',
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('pending_activation', 'trial', 'active', 'suspended')),
  plan_code TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.store_settings (
  store_id UUID PRIMARY KEY REFERENCES public.stores(id) ON DELETE CASCADE,
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#102A43',
  secondary_color TEXT NOT NULL DEFAULT '#10B981',
  template TEXT NOT NULL DEFAULT 'minimal' CHECK (template IN ('minimal', 'boutique', 'editorial')),
  description TEXT,
  whatsapp_phone TEXT,
  contact_email TEXT,
  address TEXT,
  delivery_info TEXT,
  terms_of_sale TEXT,
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  home_sections JSONB NOT NULL DEFAULT '{"showHero":true,"showCategories":true,"showPopular":true,"showPromotions":true}'::jsonb,
  mobile_money_number TEXT,
  mobile_money_instructions TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Catalogue & Stocks (isolés par store_id)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, slug)
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  promo_price INTEGER CHECK (promo_price IS NULL OR promo_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, slug)
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price_delta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Clients, Adresses & Commandes
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, phone)
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Livraison',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'BJ',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash_on_delivery', 'whatsapp_order', 'manual_mobile_money', 'wave', 'orange_money', 'mtn_momo', 'moov_money', 'card')),
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'pending_confirmation', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  delivery_fee INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, order_number)
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0)
);

-- 7. Abonnements & Paiements plateforme
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('trial', 'monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'expired', 'cancelled')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('activation', 'subscription', 'domain_purchase', 'domain_renewal')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'FCFA',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
  provider_code TEXT,
  external_reference TEXT UNIQUE,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  idempotency_key TEXT UNIQUE,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Noms de domaine personnalisés
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL CHECK (source IN ('registrar', 'external')),
  verification_token TEXT NOT NULL,
  dns_verified BOOLEAN NOT NULL DEFAULT false,
  ssl_active BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'connected', 'failed', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.domain_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  custom_domain_id UUID REFERENCES public.custom_domains(id) ON DELETE SET NULL,
  domain TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  registrar_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.domain_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  custom_domain_id UUID NOT NULL REFERENCES public.custom_domains(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  renewed_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Notifications & Journal d'audit
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'whatsapp', 'sms', 'in_app')),
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index multi-tenant
CREATE INDEX IF NOT EXISTS idx_stores_owner ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_subdomain ON public.stores(subdomain);
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_store ON public.categories(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_created ON public.orders(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_store ON public.customers(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_store ON public.inventory_movements(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_store ON public.subscriptions(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================================================
-- FONCTIONS & ROW LEVEL SECURITY (ISOLATION STRICTE MULTI-BOUTIQUES)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_store_member(target_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = target_store_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = target_store_id AND owner_id = auth.uid()
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

-- Nettoyage idempotent des politiques avant recréation
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "stores_public_read_active" ON public.stores;
DROP POLICY IF EXISTS "stores_owner_insert" ON public.stores;
DROP POLICY IF EXISTS "stores_owner_update" ON public.stores;
DROP POLICY IF EXISTS "store_settings_select" ON public.store_settings;
DROP POLICY IF EXISTS "store_settings_modify" ON public.store_settings;
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "categories_merchant_write" ON public.categories;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_merchant_write" ON public.products;
DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
DROP POLICY IF EXISTS "product_images_merchant_write" ON public.product_images;
DROP POLICY IF EXISTS "product_variants_public_read" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_merchant_write" ON public.product_variants;
DROP POLICY IF EXISTS "inventory_movements_merchant_only" ON public.inventory_movements;
DROP POLICY IF EXISTS "customers_merchant_only" ON public.customers;
DROP POLICY IF EXISTS "addresses_merchant_only" ON public.addresses;
DROP POLICY IF EXISTS "orders_merchant_read_write" ON public.orders;
DROP POLICY IF EXISTS "orders_merchant_update" ON public.orders;
DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
DROP POLICY IF EXISTS "order_items_merchant_read" ON public.order_items;
DROP POLICY IF EXISTS "order_items_public_insert" ON public.order_items;
DROP POLICY IF EXISTS "subscriptions_read_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_admin_write" ON public.subscriptions;
DROP POLICY IF EXISTS "payments_read_own" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_write" ON public.payments;
DROP POLICY IF EXISTS "payment_transactions_admin_only" ON public.payment_transactions;
DROP POLICY IF EXISTS "plans_public_read" ON public.subscription_plans;
DROP POLICY IF EXISTS "plans_admin_write" ON public.subscription_plans;
DROP POLICY IF EXISTS "modules_public_read" ON public.modules;
DROP POLICY IF EXISTS "modules_admin_write" ON public.modules;
DROP POLICY IF EXISTS "plan_modules_public_read" ON public.plan_modules;
DROP POLICY IF EXISTS "plan_modules_admin_write" ON public.plan_modules;
DROP POLICY IF EXISTS "countries_public_read" ON public.countries;
DROP POLICY IF EXISTS "countries_admin_write" ON public.countries;
DROP POLICY IF EXISTS "payment_providers_public_read" ON public.payment_providers;
DROP POLICY IF EXISTS "payment_providers_admin_write" ON public.payment_providers;
DROP POLICY IF EXISTS "custom_domains_merchant_read" ON public.custom_domains;
DROP POLICY IF EXISTS "custom_domains_admin_write" ON public.custom_domains;
DROP POLICY IF EXISTS "notifications_own_read" ON public.notifications;
DROP POLICY IF EXISTS "audit_logs_admin_only" ON public.audit_logs;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "stores_public_read_active" ON public.stores
  FOR SELECT USING (status IN ('trial', 'active') OR public.is_store_member(id) OR public.is_platform_admin());

CREATE POLICY "stores_owner_insert" ON public.stores
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "stores_owner_update" ON public.stores
  FOR UPDATE USING (owner_id = auth.uid() OR public.is_platform_admin())
  WITH CHECK (
    public.is_platform_admin()
    OR (
      owner_id = auth.uid()
      AND status = (SELECT status FROM public.stores WHERE id = stores.id)
      AND plan_code = (SELECT plan_code FROM public.stores WHERE id = stores.id)
    )
  );

CREATE POLICY "store_settings_select" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "store_settings_modify" ON public.store_settings
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_merchant_write" ON public.categories
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (is_active = true OR public.is_store_member(store_id) OR public.is_platform_admin());
CREATE POLICY "products_merchant_write" ON public.products
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images_merchant_write" ON public.product_images
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "product_variants_public_read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "product_variants_merchant_write" ON public.product_variants
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "inventory_movements_merchant_only" ON public.inventory_movements
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "customers_merchant_only" ON public.customers
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "addresses_merchant_only" ON public.addresses
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "orders_merchant_read_write" ON public.orders
  FOR SELECT USING (public.is_store_member(store_id) OR public.is_platform_admin());
CREATE POLICY "orders_merchant_update" ON public.orders
  FOR UPDATE USING (public.is_store_member(store_id) OR public.is_platform_admin());
CREATE POLICY "orders_public_insert" ON public.orders
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND status IN ('trial', 'active'))
  );

CREATE POLICY "order_items_merchant_read" ON public.order_items
  FOR SELECT USING (public.is_store_member(store_id) OR public.is_platform_admin());
CREATE POLICY "order_items_public_insert" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND status IN ('trial', 'active'))
  );

CREATE POLICY "subscriptions_read_own" ON public.subscriptions
  FOR SELECT USING (public.is_store_member(store_id) OR public.is_platform_admin());
CREATE POLICY "subscriptions_admin_write" ON public.subscriptions
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "payments_read_own" ON public.payments
  FOR SELECT USING (public.is_store_member(store_id) OR public.is_platform_admin());
CREATE POLICY "payments_admin_write" ON public.payments
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "payment_transactions_admin_only" ON public.payment_transactions
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "plans_public_read" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "plans_admin_write" ON public.subscription_plans FOR ALL USING (public.is_platform_admin());

CREATE POLICY "modules_public_read" ON public.modules FOR SELECT USING (true);
CREATE POLICY "modules_admin_write" ON public.modules FOR ALL USING (public.is_platform_admin());

CREATE POLICY "plan_modules_public_read" ON public.plan_modules FOR SELECT USING (true);
CREATE POLICY "plan_modules_admin_write" ON public.plan_modules FOR ALL USING (public.is_platform_admin());

CREATE POLICY "countries_public_read" ON public.countries FOR SELECT USING (true);
CREATE POLICY "countries_admin_write" ON public.countries FOR ALL USING (public.is_platform_admin());

CREATE POLICY "payment_providers_public_read" ON public.payment_providers FOR SELECT USING (true);
CREATE POLICY "payment_providers_admin_write" ON public.payment_providers FOR ALL USING (public.is_platform_admin());

CREATE POLICY "custom_domains_merchant_read" ON public.custom_domains
  FOR SELECT USING (public.is_store_member(store_id) OR public.is_platform_admin());
CREATE POLICY "custom_domains_admin_write" ON public.custom_domains
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "notifications_own_read" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
  FOR SELECT USING (public.is_platform_admin());

-- ============================================================================
-- DONNÉES INITIALES (PAYS, OFFRES, MODULES)
-- ============================================================================

INSERT INTO public.countries (code, name, currency, phone_prefix, is_active) VALUES
  ('BJ', 'Bénin', 'FCFA', '+229', true),
  ('SN', 'Sénégal', 'FCFA', '+221', true),
  ('CI', 'Côte d''Ivoire', 'FCFA', '+225', true),
  ('TG', 'Togo', 'FCFA', '+228', true),
  ('BF', 'Burkina Faso', 'FCFA', '+226', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subscription_plans (code, name, description, monthly_price, annual_price, currency, max_products, custom_domain_allowed) VALUES
  ('trial', 'Essai 30 jours', 'Activation unique à 2 000 FCFA avec accès complet pendant 30 jours.', 0, 0, 'FCFA', 50, false),
  ('standard', 'Standard', 'Offre destinée aux petits commerçants pour vendre en ligne efficacement.', 7500, 75000, 'FCFA', 100, false),
  ('premium', 'Premium', 'Accès complet incluant nom de domaine personnalisé et fonctionnalités avancées.', 15000, 150000, 'FCFA', NULL, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.modules (key, name, description) VALUES
  ('storefront', 'Boutique publique & sous-domaine', 'Vitrine mobile-first avec sous-domaine automatique .ecomsate.com'),
  ('products_catalog', 'Gestion catalogue & variantes', 'Produits, photos multiples, catégories, tailles et couleurs'),
  ('inventory_tracking', 'Suivi des stocks & alertes', 'Décrémentation automatique, alertes de stock faible et historique'),
  ('whatsapp_checkout', 'Commandes WhatsApp & Paiement à la livraison', 'Tunnel de commande adapté au commerce africain'),
  ('store_customization', 'Personnalisation visuelle', 'Logo, bannière, couleurs et modèles de boutiques'),
  ('custom_domain', 'Nom de domaine personnalisé', 'Connexion ou achat de domaine .com, .sn, .bj avec SSL automatique'),
  ('advanced_analytics', 'Statistiques avancées', 'Rapports de ventes détaillés et suivi par période')
ON CONFLICT (key) DO NOTHING;
