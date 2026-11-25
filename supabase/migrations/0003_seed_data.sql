-- ============================================================================
-- ECOMSATE — Migration 0003 : Données initiales (Pays, Plans, Modules)
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
