-- ============================================================================
-- ECOMSATE — Migration 0002 : Row Level Security (Isolation Multi-tenant)
-- Conforme aux sections 3, 14 et 16 du Cahier des Charges
-- ============================================================================

-- Fonctions utilitaires sécurisées
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
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
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = target_store_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = target_store_id AND owner_id = auth.uid()
  );
$$;

-- Activation RLS sur toutes les tables
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

-- Profiles : chacun lit/modifie son propre profil (sauf role), admin lit tout
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Stores : lecture publique des boutiques actives/essai (vitrine), écriture réservée au propriétaire/admin
CREATE POLICY "stores_public_read_active" ON public.stores
  FOR SELECT USING (status IN ('trial', 'active') OR public.is_store_member(id) OR public.is_platform_admin());

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

-- Store settings : lecture publique (affichage vitrine), écriture membre boutique
CREATE POLICY "store_settings_select" ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY "store_settings_modify" ON public.store_settings
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

-- Catégories & Produits : lecture publique si boutique active, gestion strictement isolée par store_id
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "categories_merchant_write" ON public.categories
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (is_active = true OR public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "products_merchant_write" ON public.products
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "product_images_public_read" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "product_images_merchant_write" ON public.product_images
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "product_variants_public_read" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "product_variants_merchant_write" ON public.product_variants
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "inventory_movements_merchant_only" ON public.inventory_movements
  FOR ALL USING (public.is_store_member(store_id) OR public.is_platform_admin());

-- Clients, Adresses & Commandes : strictement isolés par boutique (insertion commande publique via API/Server Action)
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

-- Abonnements & Paiements : un commerçant NE PEUT JAMAIS modifier son abonnement ni valider son paiement
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

-- Référentiels publics (plans, modules, pays, prestataires) : lecture publique, écriture admin
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

-- Domaines, Notifications & Audit
CREATE POLICY "custom_domains_merchant_read" ON public.custom_domains
  FOR SELECT USING (public.is_store_member(store_id) OR public.is_platform_admin());

CREATE POLICY "custom_domains_admin_write" ON public.custom_domains
  FOR ALL USING (public.is_platform_admin());

CREATE POLICY "notifications_own_read" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
  FOR SELECT USING (public.is_platform_admin());
