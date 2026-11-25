-- ============================================================================
-- ECOMSATE — Migration 0005 : Conformité 100% Cahier des Charges Officiel COD
-- Store Builder Shrine Pro, Form Builder COD, 11 Statuts Commandes, Livreurs
-- & Rapprochement COD, Dépenses & Bénéfice Réel, Publicités ROAS,
-- Automatisations & Gestion d'Équipe (6 Rôles RBAC) avec RLS strict par store_id
-- ============================================================================

-- 1. Extension de store_settings pour le Store Builder & Thèmes Shrine Pro 1 / 3
ALTER TABLE IF EXISTS public.store_settings
  DROP CONSTRAINT IF EXISTS store_settings_template_check;

ALTER TABLE IF EXISTS public.store_settings
  ALTER COLUMN primary_color SET DEFAULT '#073B35',
  ALTER COLUMN secondary_color SET DEFAULT '#00A884',
  ALTER COLUMN template SET DEFAULT 'shrine_pro_1',
  ADD COLUMN IF NOT EXISTS builder_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS free_delivery_threshold INTEGER,
  ADD COLUMN IF NOT EXISTS published_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- 2. Extension des 6 rôles officiels d'équipe sur store_members (Section 20.2)
ALTER TABLE IF EXISTS public.store_members
  DROP CONSTRAINT IF EXISTS store_members_role_check;

ALTER TABLE IF EXISTS public.store_members
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD CONSTRAINT store_members_role_check
    CHECK (role IN ('owner', 'admin', 'operator', 'delivery_manager', 'courier', 'analyst'));

-- 3. Extension de products pour coût d'achat, coûts additionnels & calcul de marge (Section 7.2)
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS cost_price INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS additional_cost INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS reserved_stock INTEGER NOT NULL DEFAULT 0;

-- 4. Table des Livreurs & Partenaires logistiques (Section 12)
CREATE TABLE IF NOT EXISTS public.couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  zone TEXT NOT NULL DEFAULT 'Toutes zones',
  is_active BOOLEAN NOT NULL DEFAULT true,
  amount_remitted INTEGER NOT NULL DEFAULT 0,
  last_remittance_at TIMESTAMPTZ,
  discrepancy_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_couriers_store_id ON public.couriers(store_id);

-- 5. Extension de orders pour les 11 statuts COD, 6 statuts financiers COD & champs dynamiques (Sections 10 & 12)
ALTER TABLE IF EXISTS public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS secondary_phone TEXT,
  ADD COLUMN IF NOT EXISTS commune TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS landmark TEXT,
  ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS courier_id UUID REFERENCES public.couriers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS courier_name TEXT,
  ADD COLUMN IF NOT EXISTS cod_financial_status TEXT NOT NULL DEFAULT 'expected'
    CHECK (cod_financial_status IN ('uncollected', 'expected', 'collected_by_courier', 'partially_remitted', 'remitted', 'discrepancy')),
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS is_duplicate_warning BOOLEAN NOT NULL DEFAULT false,
  ADD CONSTRAINT orders_status_check
    CHECK (status IN (
      'new',
      'pending_confirmation',
      'confirmed',
      'preparing',
      'ready_to_ship',
      'assigned_courier',
      'shipped',
      'delivered',
      'delivery_failed',
      'returned',
      'cancelled'
    ));

ALTER TABLE IF EXISTS public.order_items
  ADD COLUMN IF NOT EXISTS cost_price INTEGER NOT NULL DEFAULT 0;

-- 6. Historique auditable des changements de statut de commande (Section 10.7)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_status_history(order_id);

-- 7. Extension de customers pour segmentation CRM & suivi des retours COD (Section 11)
ALTER TABLE IF EXISTS public.customers
  ADD COLUMN IF NOT EXISTS returns_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS segment TEXT NOT NULL DEFAULT 'new'
    CHECK (segment IN ('new', 'loyal', 'at_risk')),
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- 8. Module 9 — Form Builder COD (Configuration & Historique des versions)
CREATE TABLE IF NOT EXISTS public.cod_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL UNIQUE REFERENCES public.stores(id) ON DELETE CASCADE,
  preset_id TEXT NOT NULL DEFAULT 'mobile_fast',
  published_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  published_style JSONB NOT NULL DEFAULT '{}'::jsonb,
  draft_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  draft_style JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  versions_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Module 13 — Dépenses & Calcul du Bénéfice Net Réel
CREATE TABLE IF NOT EXISTS public.store_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('product_purchase', 'ads', 'delivery', 'packaging', 'salary', 'other')),
  label TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  expense_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_expenses_store_id ON public.store_expenses(store_id);

-- 10. Module 16 — Campagnes Publicitaires & Suivi ROAS
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  name TEXT NOT NULL,
  budget INTEGER NOT NULL DEFAULT 0,
  spent INTEGER NOT NULL DEFAULT 0,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  manual_leads_or_orders INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_store_id ON public.ad_campaigns(store_id);

-- 11. Module 17 — Règles d'Automatisations Opérationnelles
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  condition_expr TEXT NOT NULL,
  action_target TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  runs_count INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_store_id ON public.automation_rules(store_id);

-- 12. Table de synchronisation multi-appareils temps réel
CREATE TABLE IF NOT EXISTS public.platform_cloud_state (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Activation Row Level Security (RLS) sur toutes les nouvelles tables
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- Lecture publique du formulaire COD publié pour le rendu storefront client
DROP POLICY IF EXISTS "Public read published cod_forms" ON public.cod_forms;
CREATE POLICY "Public read published cod_forms"
  ON public.cod_forms FOR SELECT
  USING (true);

-- Politiques d'isolation multi-tenant stricte par store_id pour les membres de la boutique
DROP POLICY IF EXISTS "Store members manage couriers" ON public.couriers;
CREATE POLICY "Store members manage couriers"
  ON public.couriers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = couriers.store_id AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store members manage expenses" ON public.store_expenses;
CREATE POLICY "Store members manage expenses"
  ON public.store_expenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = store_expenses.store_id AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store members manage ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "Store members manage ad_campaigns"
  ON public.ad_campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = ad_campaigns.store_id AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store members manage automation_rules" ON public.automation_rules;
CREATE POLICY "Store members manage automation_rules"
  ON public.automation_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = automation_rules.store_id AND s.owner_id = auth.uid()
    )
  );
