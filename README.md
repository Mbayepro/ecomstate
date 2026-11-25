# EcomSate

> **Plateforme SaaS multi-tenant de création et de gestion de boutiques e-commerce** adaptée aux réalités du commerce africain.

---

## Présentation

**EcomSate** permet aux commerçants, entrepreneurs et petites entreprises (Bénin, Sénégal, Côte d'Ivoire, Togo, Burkina Faso, et autres pays francophones) de créer, personnaliser et gérer leur propre boutique en ligne sans compétences techniques.

Chaque commerçant dispose :
- D'un **espace de gestion** complet (tableau de bord, produits, stocks, commandes, clients, personnalisation).
- D'une **boutique publique** rapide, mobile-first et SEO-friendly avec sous-domaine automatique (`boutique.ecomsate.com`) ou nom de domaine personnalisé (offre Premium).

---

## Documentation & Suivi du projet

| Document | Rôle |
| --- | --- |
| [docs/CAHIER_DES_CHARGES.md](./docs/CAHIER_DES_CHARGES.md) | Cahier des charges complet et officiel (référence fonctionnelle et technique) |
| [SUIVI.md](./SUIVI.md) | Feuille de route détaillée avec cases à cocher par phase, base de données, sécurité et critères de validation |

---

## Architecture générale

L'application SaaS multi-tenant est structurée autour de **4 espaces** avec isolation stricte des données par boutique (`store_id`) :

1. **Site vitrine EcomSate** — Présentation, tarifs, FAQ, inscription et conversion.
2. **Espace commerçant** — Tableau de bord, catalogue, stocks, commandes, clients, personnalisation et domaines.
3. **Boutiques publiques** — Vitrine e-commerce indépendante par commerçant (sous-domaine ou domaine personnalisé).
4. **Administration générale** — Supervision des commerçants, abonnements, modules, finances, domaines et paramètres pays.

---

## Stack technique

| Couche | Technologies |
| --- | --- |
| **Frontend & App** | Next.js, TypeScript, Tailwind CSS, composants UI réutilisables |
| **Backend & Données** | Supabase (PostgreSQL, Auth, Storage, Row Level Security) |
| **Hébergement & Réseau** | Vercel, Cloudflare (DNS / réseau) |
| **Intégrations** | API Registrar (domaines), prestataires de paiement locaux, notifications (e-mail, WhatsApp/SMS) |

---

## Identité visuelle

| Rôle | Couleur | Code Hex |
| --- | --- | --- |
| Navigation, marque, titres, structure | Bleu nuit | `#102A43` |
| Boutons principaux, validations, CTA | Vert émeraude | `#10B981` |
| Arrière-plan principal | Blanc cassé | `#F8FAFC` |
| Textes principaux / foncés | Gris ardoise | `#1E293B` |
| Bordures, séparateurs, tableaux | Gris clair | `#E2E8F0` |

- **Typographie** : `Inter` ou `Manrope`
- **Design** : Moderne, premium, minimaliste, **mobile-first** (sans dégradés excessifs ni animations inutiles).

---

## Modèle d'offres

| Offre | Tarif | Détails |
| --- | --- | --- |
| **Activation** | `2 000 FCFA` (unique) | Accès à 30 jours d'essai, création automatique de la boutique et du sous-domaine |
| **Standard** | `7 500 FCFA / mois` | Fonctionnalités essentielles avec limites configurables |
| **Premium** | `15 000 FCFA / mois` | Accès complet, incluant la connexion/achat de nom de domaine personnalisé |

*(Tarifs annuels préférentiels et limites par module configurables depuis l'administration générale.)*

---

## Avancement global par phase

| Phase | Objectif | Statut |
| --- | --- | --- |
| **Phase 1 — MVP** | Vitrine, Auth, Multi-tenant, Dashboard, Produits/Catégories/Commandes, Boutiques publiques, WhatsApp/COD, Admin | ✅ Implémentée |
| **Phase 2 — Monétisation** | Activation 2 000 FCFA, essai 30 jours, Standard/Premium, modules, paiements, suspensions/renouvellements | ⏳ À démarrer |
| **Phase 3 — Domaines personnalisés** | Recherche, disponibilité, achat registrar, domaine externe, DNS, SSL, renouvellement | ⏳ À démarrer |
| **Phase 4 — Automatisation commerciale** | Wave, Orange Money, MTN MoMo, Moov Money, notifications avancées, stats, codes promo | ⏳ À démarrer |
| **Phase 5 — Expansion** | Nouveaux pays, devises, extensions de domaines, moyens de paiement, app mobile | ⏳ À démarrer |

> Consulter [SUIVI.md](./SUIVI.md) pour le détail tâche par tâche.

---

## Principes de développement

- Développer une application réellement fonctionnelle (pas une simple maquette).
- Isolation stricte des données entre boutiques (RLS + `store_id` partout).
- Centraliser les permissions, modules et limites d'abonnement (jamais codés en dur dans les composants).
- Validation serveur systématique des paiements et webhooks authentifiés/idempotents.
- Ne jamais exposer de clés secrètes côté frontend et ne jamais simuler un paiement réussi en production.
- Tester chaque fonctionnalité avant de passer à la suivante.
