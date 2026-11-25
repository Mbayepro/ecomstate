# Suivi du Projet — EcomSate

Ce document permet de suivre pas à pas l'avancement du développement conformément au [Cahier des charges](./docs/CAHIER_DES_CHARGES.md).

**Légende** : `[ ]` À faire · `[~]` En cours · `[x]` Terminé et testé

---

## 0. Socle technique & Base de données

### Initialisation du projet
- [x] Initialisation Next.js (App Router) + TypeScript + Tailwind CSS
- [x] Configuration du design system (couleurs `#102A43`, `#10B981`, `#F8FAFC`, `#1E293B`, `#E2E8F0`, police `Inter` / `Manrope`)
- [x] Configuration Supabase (PostgreSQL, Auth, Storage) + variables d'environnement sécurisées (`.env.example`, `src/lib/supabase/`)
- [x] Architecture multi-tenant (middleware de routage sous-domaines / domaines personnalisés `src/middleware.ts`)
- [x] Système centralisé de rôles, permissions et modules (`src/lib/permissions.ts`)

### Schéma PostgreSQL & RLS (Section 15)
- [x] `profiles`, `stores`, `store_members`, `store_settings` (`supabase/migrations/0001_initial_schema.sql`)
- [x] `countries`, `payment_providers`
- [x] `categories`, `products`, `product_images`, `product_variants`, `inventory_movements`
- [x] `customers`, `addresses`, `orders`, `order_items`
- [x] `subscription_plans`, `modules`, `plan_modules`, `subscriptions`
- [x] `payments`, `payment_transactions`
- [x] `custom_domains`, `domain_orders`, `domain_renewals`
- [x] `notifications`, `audit_logs`
- [x] Contraintes, index, clés étrangères (`store_id`) et politiques **Row Level Security (RLS)** (`supabase/migrations/0002_rls_policies.sql`)

---

## PHASE 1 — MVP

### Identité visuelle & Site vitrine (Sections 2 & 4)
- [x] Composants UI réutilisables (mobile-first, minimaliste, premium)
- [x] Page **Accueil** (Hero, Comment ça marche en 3 étapes, Fonctionnalités, Avantages, Tarifs, FAQ)
- [x] Pages secondaires : Fonctionnalités, Tarifs, Comment ça marche, À propos, FAQ, Contact
- [x] Pages légales : Politique de confidentialité (`/confidentialite`), CGU (`/cgu`), Conditions commerciales (`/conditions-commerciales`)


### Authentification & Création de boutique (Section 5)
- [x] Inscription commerçant (nom complet, nom boutique, e-mail, téléphone, pays, mot de passe)
- [x] Connexion et création de boutique en 1 clic par **Google OAuth** (`/auth/callback`, `/connexion`, `/creer-une-boutique`)
- [x] Connexion / Déconnexion + Identifiants Super Admin Bénin modifiables (`admin@ecomsate.bj` · `+229 95 78 21 32`)
- [x] Création automatique de la boutique + attribution d'un sous-domaine (`boutique.ecomsate.com`)
- [x] Upload direct de photos produits, logos et bannières avec compression automatique 3G/4G + Supabase Storage (`store-assets`)
- [x] Page d'abonnement & règlement Mobile Money direct sans NINEA/RCCM (`/dashboard/abonnement`) avec validation et activation exclusives par le Super Admin (`/admin`)


### Espace commerçant (Sections 7 & 9)
- [x] **Tableau de bord** : KPIs complets (CA, commandes, attente, confirmées, livrées, disponibles, ruptures), évolution des ventes interactive + filtres temporels (`Aujourd'hui`, `7j`, `30j`, `Tout`, `Personnalisé`)
- [x] **Statistiques dédiées** (`/dashboard/statistiques`) : ventilations réelles par catégorie, ville de livraison, canal de paiement et produit
- [x] **Collaborateur Adeshina IA** (`/dashboard/adeshina-ia` + tiroir latéral) : analyse des ventes, produits populaires, stocks faibles, résumé des commandes, conseils et studio fiche produit
- [x] **Gestion des catégories** : CRUD complet + suggestions rapides
- [x] **Gestion des produits** : CRUD, multi-photos, prix & prix promo, description, catégorie, variantes, ajustement rapide de stock, vue cartes mobile / liste & grille desktop
- [x] **Gestion des stocks** : quantité dispo, entrée de stock avec motif libre, décrémentation automatique, alertes stock faible, historique des mouvements, ruptures
- [x] **Gestion des commandes** : numéro unique, avancement rapide en 1 clic, contact WhatsApp client, workflow des 7 statuts
- [x] **Gestion des clients** : liste, filtre par ville, coordonnées, adresses, historique dépliable des commandes
- [x] **Personnalisation boutique** : logo, bannière, couleurs principales/secondaires, 3 modèles distincts (`Minimal`, `Boutique`, `Éditorial`), sections d'accueil configurables, réseaux sociaux (Instagram, Facebook, TikTok), aperçu mobile en direct

### Boutiques publiques & Commandes V1 (Sections 8 & 11.2)
- [x] Rendu dynamique par sous-domaine (`*.ecomsate.com` et `/s/[slug]`) avec identité visuelle propre à chaque boutique et métadonnées SEO
- [x] Page d'accueil riche : en-tête avec logo & recherche visible, bannière adaptative selon le modèle, catégories, produits populaires, promotions, nouveautés et produits recommandés
- [x] Catalogue complet : filtres par catégorie, budget/prix et disponibilité en stock + aperçu rapide (Quick View)
- [x] Page produit dédiée (`/s/[slug]/produit/[productSlug]`) : galerie multi-images, variantes groupées, quantité, disponibilité, achat immédiat, commande WhatsApp et produits similaires
- [x] Panier isolé par boutique & tunnel de commande mobile-first (Livraison à domicile ou Retrait en boutique, récapitulatif clair, barre flottante mobile)
- [x] Paiement à la livraison (COD), Commande via WhatsApp et Mobile Money manuel avec confirmation vendeur

### Administration générale — socle (Section 12)
- [x] Console d'administration (`/admin`)
- [x] Liste des commerçants, consultation boutiques, activation / suspension de compte, gestion des plans & modules
- [x] Paramètres généraux (pays disponibles, devises, moyens de paiement)
- [x] Journalisation des opérations sensibles (`audit_logs`)

---

## PHASE 2 — MONÉTISATION

### Activation & Offres (Sections 5, 6 & 11.1)
- [x] Paiement d'activation unique (`2 000 FCFA`) -> déclenche création boutique + 30 jours d'essai
- [x] Offre **Standard** (`7 500 FCFA / mois` ou `75 000 FCFA / an`) + tarif annuel préférentiel (-2 mois)
- [x] Offre **Premium** (`15 000 FCFA / mois` ou `150 000 FCFA / an`) + tarif annuel préférentiel (-2 mois)
- [x] Circuit de règlement Mobile Money direct sans NINEA/RCCM (`/dashboard/abonnement`) + validation exclusive par le Super Admin (`/admin`)

### Gestion des modules, renouvellements & suspensions (Sections 6.4, 12 & 13)
- [x] Administration des offres : création/modification tarifs, modules et limites sans toucher au code
- [x] Historique des paiements, dates de début/expiration (`getStoreSubscriptionHealth`), renouvellement mensuel (30j) ou annuel (365j)
- [x] Suspension automatique à expiration + respect strict des restrictions d'accès sur la boutique publique (`/s/[slug]`) et dans le dashboard
- [x] Réactivation automatique après confirmation de paiement par le Super Admin
- [x] Tableau de bord financier admin (`/admin` -> *Revenus & Finances* : revenus activations, abonnements, transactions, export CSV)
- [x] Centre de notifications intégré (cloche de notifications temps réel : nouvelle commande, paiement déclaré, abonnement activé/refusé) + contact WhatsApp en 1 clic


---

## PHASE 3 — DOMAINES PERSONNALISÉS & MARKETING AVANCÉ

### Domaines Premium & Outils Commerciaux (Sections 10 & 12)
- [x] Espace **Nom de domaine personnalisé** (`/dashboard/domaine`) réservé aux boutiques Premium
- [x] Connexion d'un domaine externe (guide DNS `A` / `CNAME` avec copie 1-clic) & commande de domaine (`.com`, `.bj`, `.sn`, `.ci`, `.shop`)
- [x] Administration des domaines dans `/admin` (onglet *Domaines Premium* avec activation SSL HTTPS en 1 clic)
- [x] Système de **Codes Promo & Réductions** (`/dashboard/promotions` + panier client)
- [x] **Zones & Tarifs de livraison** configurables par ville/quartier + seuil de livraison gratuite
- [x] **Kit Marketing 1-clic** (`/dashboard/marketing` : QR Code boutique imprimable + générateur de posts WhatsApp/TikTok/Facebook par Adeshina IA)
- [x] **Reçu de commande imprimable** + **Suivi de commande public** sur chaque boutique


---

## PHASE 4 — AUTOMATISATION COMMERCIALE

- [ ] Intégration **Wave** (selon KYC et pays)
- [ ] Intégration **Orange Money**
- [ ] Intégration **MTN Mobile Money**
- [ ] Intégration **Moov Money**
- [ ] Intégration cartes bancaires & solutions locales configurables par pays
- [ ] Notifications avancées (WhatsApp / SMS)
- [ ] Statistiques détaillées & analytiques avancées
- [ ] Gestion des codes promotionnels
- [ ] Fonctionnalités commerciales supplémentaires

---

## PHASE 5 — EXPANSION

- [ ] Ajout de nouveaux pays francophones et paramètres locaux
- [ ] Support multi-devises étendu
- [ ] Nouvelles extensions de domaines nationales (`.sn`, `.bj`, `.ci`, `.tg`, `.bf`, etc.)
- [ ] Nouveaux moyens de paiement régionaux
- [ ] Modules avancés additionnels
- [ ] Étude / développement application mobile

---

## Checklist Sécurité & Validation commerciale (Sections 16 & 18)

### Sécurité (Section 16)
- [ ] Isolation stricte multi-tenant vérifiée par tests (commerçant A ne voit jamais boutique B)
- [ ] Impossible pour un utilisateur de modifier son propre abonnement
- [ ] Paiements confirmés exclusivement côté serveur (jamais simulés en prod)
- [ ] Webhooks authentifiés et idempotents
- [ ] Aucune clé secrète dans le code frontend
- [ ] Domaines vérifiés avant association + HTTPS actif

### Critères de validation avant lancement (Section 18)
- [ ] 1. Un commerçant peut créer son compte et activer sa boutique
- [ ] 2. Il peut ajouter et modifier des produits
- [ ] 3. Un visiteur peut passer une commande
- [ ] 4. Le commerçant reçoit la commande dans son tableau de bord
- [ ] 5. Les données de deux boutiques restent totalement isolées
- [ ] 6. Les abonnements activent les bonnes fonctionnalités
- [ ] 7. Un compte expiré respecte les restrictions prévues
- [ ] 8. Un commerçant Premium peut connecter son propre domaine
- [ ] 9. Le domaine affiche la bonne boutique en HTTPS
- [ ] 10. Les paiements sont vérifiés côté serveur
- [ ] 11. L'interface fonctionne sur smartphone et ordinateur
- [ ] 12. L'administration générale peut superviser toute la plateforme
