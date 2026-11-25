# CAHIER DES CHARGES — ECOMSATE

**Plateforme SaaS de création et de gestion de boutiques e-commerce**

---

## 1. PRÉSENTATION DU PROJET

### 1.1. Nom du projet

EcomSate

### 1.2. Concept

EcomSate est une plateforme SaaS permettant aux commerçants, entrepreneurs et petites entreprises de créer, personnaliser et gérer leur propre boutique en ligne sans avoir besoin de compétences techniques.

La plateforme s'inspire du modèle de Shafrik.com, avec un système de création de boutiques indépendantes, un tableau de bord de gestion, des abonnements et des fonctionnalités adaptées aux réalités du commerce africain.

Chaque commerçant dispose de son propre espace de gestion et de sa propre boutique publique.

### 1.3. Marché cible

- Bénin.
- Sénégal.
- Côte d'Ivoire.
- Togo.
- Burkina Faso.
- Autres pays francophones dans les évolutions futures.

La plateforme doit être conçue pour fonctionner dans plusieurs pays, avec une architecture permettant d'ajouter progressivement les devises, moyens de paiement et paramètres propres à chaque marché.

### 1.4. Objectif principal

Permettre à chaque commerçant de posséder une boutique professionnelle sur Internet, de recevoir des commandes et de gérer son activité depuis une seule interface.

---

## 2. IDENTITÉ VISUELLE ET DESIGN

### 2.1. Direction artistique

L'identité visuelle doit être moderne, premium, minimaliste et professionnelle.

Le design doit inspirer :
- La confiance.
- La technologie.
- Le commerce.
- La croissance.
- La simplicité d'utilisation.

### 2.2. Palette de couleurs officielle

- **Bleu nuit** : `#102A43`
- **Vert émeraude** : `#10B981`
- **Blanc cassé** : `#F8FAFC`
- **Gris ardoise** : `#1E293B`
- **Gris clair** : `#E2E8F0`

### 2.3. Utilisation des couleurs

- **Bleu nuit** : navigation, identité de marque, menus, titres et éléments structurants.
- **Vert émeraude** : boutons principaux, validations, actions commerciales et indicateurs positifs.
- **Blanc cassé** : arrière-plan principal.
- **Gris** : tableaux, bordures, séparateurs et textes secondaires.

Éviter les dégradés excessifs, les effets lumineux et les animations inutiles.

### 2.4. Typographie

Utiliser une police moderne et lisible comme **Inter** ou **Manrope**.

### 2.5. Responsive design

L'ensemble de la plateforme doit être optimisé pour :
- Smartphones Android.
- iPhone.
- Tablettes.
- Ordinateurs.

L'expérience mobile est prioritaire, car une grande partie des commerçants utilisera EcomSate depuis son téléphone.

---

## 3. ARCHITECTURE GÉNÉRALE

EcomSate doit être une application SaaS multi-tenant.

L'application comprend quatre espaces principaux :

1. Site vitrine EcomSate.
2. Espace commerçant.
3. Boutiques publiques des commerçants.
4. Administration générale EcomSate.

Chaque commerçant possède un identifiant de boutique unique.

Les données, produits, clients, commandes, stocks et paramètres doivent être isolés entre les différentes boutiques.

Un commerçant ne doit jamais pouvoir accéder aux données d'un autre commerçant.

---

## 4. SITE VITRINE ECOMSATE

Créer un site public professionnel permettant de présenter la plateforme et de convertir les visiteurs en abonnés.

### Pages principales

- Accueil.
- Fonctionnalités.
- Tarifs.
- Comment ça marche ?
- À propos.
- FAQ.
- Contact.
- Connexion.
- Créer une boutique.

### Page d'accueil

La page d'accueil doit présenter :

#### Section 1 : Hero
- **Titre proposé** : « Créez votre boutique en ligne. Développez votre commerce. »
- **Sous-titre** : « Avec EcomSate, lancez votre boutique professionnelle, gérez vos produits et recevez vos commandes simplement. »
- **Boutons** :
  - Créer ma boutique.
  - Découvrir les fonctionnalités.

#### Section 2 : Comment ça marche ?
Présenter trois étapes :
1. Créez votre compte.
2. Personnalisez votre boutique.
3. Commencez à vendre.

#### Section 3 : Fonctionnalités
Présenter les outils de gestion et de vente.

#### Section 4 : Avantages
Mettre en avant la simplicité, l'autonomie, l'accessibilité et la possibilité d'avoir son propre nom de domaine.

#### Section 5 : Tarifs
Afficher les offres Standard et Premium.

#### Section 6 : FAQ
Répondre aux questions fréquentes des commerçants.

---

## 5. INSCRIPTION ET ACTIVATION DES COMPTES

Chaque commerçant doit pouvoir créer son compte facilement.

### Informations demandées

- Nom complet.
- Nom de la boutique.
- Adresse e-mail.
- Numéro de téléphone.
- Pays.
- Mot de passe.

Prévoir la vérification de l'adresse e-mail et, selon les besoins, du numéro de téléphone.

### Activation

- **Prix d'activation** : 2 000 FCFA, paiement unique.
- Cette activation donne accès à **30 jours d'essai** sur EcomSate.

Après confirmation du paiement :
- Création du compte commerçant.
- Création automatique de sa boutique.
- Attribution d'un sous-domaine.
- Activation de la période d'essai.
- Accès au tableau de bord.

À la fin des 30 jours, le commerçant doit choisir un abonnement pour continuer à utiliser les fonctionnalités payantes.

Prévoir des notifications avant l'expiration de l'essai.

---

## 6. OFFRES ET ABONNEMENTS

### 6.1. Activation
- 2 000 FCFA une seule fois.
- 30 jours d'essai.

### 6.2. Standard
- 7 500 FCFA par mois.
- Offre destinée aux petits commerçants.
- Accès aux fonctionnalités essentielles avec certaines limitations.

### 6.3. Premium
- 15 000 FCFA par mois.
- Accès à toutes les fonctionnalités disponibles dans la formule.
- Comprend notamment la possibilité de connecter un nom de domaine personnel.

### 6.4. Gestion des abonnements

Prévoir :
- Abonnement mensuel.
- Abonnement annuel à tarif préférentiel.
- Historique des paiements.
- Date de début et d'expiration.
- Renouvellement.
- Notifications d'échéance.
- Suspension en cas d'expiration.
- Réactivation après paiement.

Les fonctionnalités doivent être gérées par un système centralisé de modules et de permissions.

Les limites de chaque formule seront configurables depuis l'administration générale, sans modifier le code à chaque changement de tarif.

---

## 7. ESPACE COMMERÇANT

Chaque commerçant possède son tableau de bord personnel.

### 7.1. Tableau de bord

Afficher :
- Nombre total de produits.
- Nombre de commandes.
- Commandes en attente.
- Commandes confirmées.
- Commandes livrées.
- Chiffre d'affaires enregistré.
- Produits en rupture.
- Dernières commandes.
- Évolution des ventes.

Les indicateurs doivent pouvoir être filtrés par période.

### 7.2. Gestion des produits

Permettre au commerçant de :
- Ajouter un produit.
- Modifier un produit.
- Supprimer un produit.
- Ajouter plusieurs photos.
- Définir un prix.
- Définir un prix promotionnel.
- Ajouter une description.
- Associer une catégorie.
- Gérer les variantes.
- Gérer les tailles et couleurs.
- Définir les quantités disponibles.
- Activer ou désactiver un produit.

### 7.3. Gestion des catégories

Créer, modifier et supprimer des catégories.

Exemples : Vêtements, Chaussures, Électronique, Beauté, Maison, Alimentation.

### 7.4. Gestion des stocks

- Quantité disponible.
- Décrémentation après validation selon les règles choisies.
- Alertes de stock faible.
- Historique des mouvements.
- Gestion des ruptures.

### 7.5. Gestion des commandes

Chaque commande doit posséder :
- Un numéro unique.
- Les produits commandés.
- Les quantités.
- Le montant total.
- Les coordonnées du client.
- L'adresse de livraison.
- Le moyen de paiement.
- La date de commande.
- Le statut.

Statuts possibles :
- Nouvelle commande.
- En attente de confirmation.
- Confirmée.
- En préparation.
- Expédiée.
- Livrée.
- Annulée.

### 7.6. Gestion des clients

Créer un espace permettant de consulter :
- Nom du client.
- Téléphone.
- E-mail.
- Historique des commandes.
- Adresse de livraison.

---

## 8. BOUTIQUES PUBLIQUES

Chaque commerçant doit disposer d'une boutique accessible publiquement.

### Structure d'une boutique

- Logo.
- Bannière.
- Nom de la boutique.
- Description.
- Coordonnées.
- Réseaux sociaux.
- Catalogue.
- Catégories.
- Produits populaires.
- Promotions.
- Informations de livraison.
- Conditions de vente.

### Fonctionnalités côté client

Le visiteur doit pouvoir :
1. Consulter les produits.
2. Rechercher un produit.
3. Filtrer par catégorie.
4. Consulter les détails d'un produit.
5. Ajouter au panier.
6. Modifier les quantités.
7. Passer commande.
8. Renseigner ses coordonnées.
9. Choisir un moyen de paiement disponible.
10. Recevoir une confirmation de commande.

La boutique doit être rapide, adaptée aux smartphones et optimisée pour le référencement naturel.

---

## 9. PERSONNALISATION DES BOUTIQUES

Chaque commerçant doit pouvoir personnaliser sa boutique sans modifier le code.

Options prévues :
- Logo.
- Couleurs principales.
- Couleurs secondaires.
- Bannière.
- Présentation.
- Réseaux sociaux.
- Informations de contact.
- Organisation de la page d'accueil.

Prévoir plusieurs modèles de boutiques à choisir.

Les boutiques doivent avoir leur propre identité visuelle, indépendamment de celle d'EcomSate.

---

## 10. GESTION DES NOMS DE DOMAINE

Cette fonctionnalité est particulièrement importante pour les abonnés Premium.

### 10.1. Sous-domaines automatiques

Chaque boutique obtient une adresse gratuite :
- `boutique.ecomsate.com`
- `mode.ecomsate.com`
- `chaussures.ecomsate.com`

Le sous-domaine est attribué automatiquement à la création de la boutique.

### 10.2. Domaines personnalisés Premium

Le commerçant Premium doit pouvoir :
- Rechercher un nom de domaine.
- Vérifier sa disponibilité.
- Consulter le prix.
- Commander son domaine depuis EcomSate.
- Connecter un domaine acheté ailleurs.
- Consulter la date d'expiration.
- Renouveler son domaine.
- Consulter son statut de connexion.

Exemples : `maboutique.com`, `maboutique.sn`, `maboutique.bj`.

### 10.3. Intégration technique

Prévoir une intégration avec un registrar proposant une API de gestion des domaines.

Le système doit gérer :
- Recherche de disponibilité.
- Tarification.
- Enregistrement.
- Vérification de propriété.
- Configuration DNS.
- Connexion à l'infrastructure Vercel.
- Certificat SSL.
- Renouvellement.
- Transfert.

Le domaine doit rester la propriété du commerçant.

L'achat et le renouvellement des domaines doivent être facturés séparément de l'abonnement Premium.

Prévoir une architecture extensible pour prendre en charge les extensions nationales lorsque les fournisseurs le permettent.

---

## 11. PAIEMENTS

La plateforme doit distinguer deux types de paiements.

### 11.1. Paiements des abonnements EcomSate

Le commerçant doit pouvoir régler :
- Activation : 2 000 FCFA.
- Standard : 7 500 FCFA/mois.
- Premium : 15 000 FCFA/mois.
- Renouvellement de domaine.

Les moyens de paiement seront configurés selon les pays.

### 11.2. Paiements des clients des boutiques

Pour la première version :
- Paiement à la livraison.
- Commande via WhatsApp.
- Paiement manuel par mobile money avec confirmation par le vendeur.

Évolutions :
- Wave.
- Orange Money.
- MTN Mobile Money.
- Moov Money.
- Cartes bancaires.
- Autres solutions locales.

Les intégrations doivent respecter les conditions KYC, contractuelles et réglementaires des prestataires de paiement dans chaque pays.

Prévoir une architecture permettant de configurer les prestataires par pays.

---

## 12. ADMINISTRATION GÉNÉRALE

L'administrateur EcomSate doit disposer d'un tableau de bord centralisé.

### Gestion des commerçants
- Voir tous les commerçants.
- Consulter leurs boutiques.
- Consulter leurs abonnements.
- Activer ou suspendre un compte.
- Consulter les paiements.
- Consulter les dates d'expiration.

### Gestion des abonnements
- Créer des offres.
- Modifier les tarifs.
- Définir les modules.
- Définir les limites.
- Attribuer des fonctionnalités.
- Gérer les renouvellements.

### Gestion des modules
L'administration doit permettre d'activer ou de désactiver les fonctionnalités selon les abonnements.

### Gestion financière
- Revenus des activations.
- Revenus des abonnements.
- Revenus des domaines.
- Historique des transactions.
- Paiements en attente.
- Rapports financiers.

### Gestion des domaines
- Domaines enregistrés.
- Domaines connectés.
- Domaines expirant prochainement.
- Renouvellements.
- État des connexions DNS.

### Paramètres généraux
- Pays disponibles.
- Devises.
- Moyens de paiement.
- Notifications.
- Informations de la plateforme.

---

## 13. NOTIFICATIONS

Prévoir les notifications suivantes :
- Création de compte.
- Activation réussie.
- Première connexion.
- Nouvelle commande.
- Commande confirmée.
- Commande annulée.
- Paiement reçu.
- Abonnement bientôt expiré.
- Abonnement expiré.
- Nom de domaine connecté.
- Nom de domaine à renouveler.

Les notifications pourront être envoyées par e-mail et, dans les évolutions, par WhatsApp ou SMS.

---

## 14. ARCHITECTURE TECHNIQUE

Technologies retenues :

### Développement
- Google Antigravity.
- Next.js.
- TypeScript.
- Tailwind CSS.
- Composants UI réutilisables.

### Backend
- Supabase.
- PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- Row Level Security.

### Hébergement
- Vercel.
- Cloudflare pour les DNS et services réseau selon les besoins.

### Intégrations
- API des fournisseurs de domaines.
- API des prestataires de paiement.
- Services de notifications.

### Exigences techniques
- Architecture multi-tenant.
- Isolation stricte des données.
- Gestion des rôles et permissions.
- Sécurisation des API.
- Validation serveur des paiements.
- Webhooks sécurisés et idempotents.
- Journalisation des opérations importantes.
- Sauvegardes régulières.
- Gestion des erreurs.
- Optimisation des performances.

Ne jamais stocker les clés secrètes dans le code frontend.

Les règles d'accès Supabase doivent être définies et testées avant la mise en production.

---

## 15. STRUCTURE INDICATIVE DE LA BASE DE DONNÉES

Tables prévues :
- `users`
- `profiles`
- `stores`
- `store_members`
- `products`
- `product_images`
- `categories`
- `product_variants`
- `inventory_movements`
- `customers`
- `orders`
- `order_items`
- `addresses`
- `subscriptions`
- `subscription_plans`
- `modules`
- `plan_modules`
- `payments`
- `payment_transactions`
- `custom_domains`
- `domain_orders`
- `domain_renewals`
- `notifications`
- `audit_logs`
- `countries`
- `payment_providers`
- `store_settings`

Chaque table liée à une boutique doit posséder une relation fiable avec son identifiant de boutique (`store_id`).

Mettre en place les contraintes, index, clés étrangères et politiques RLS nécessaires.

---

## 16. SÉCURITÉ ET FIABILITÉ

La sécurité est une priorité :
- Un commerçant ne peut accéder qu'à ses propres données.
- Les utilisateurs ne peuvent pas modifier leur propre abonnement.
- Les paiements doivent être confirmés côté serveur.
- Les webhooks doivent être authentifiés.
- Les accès administrateurs doivent être protégés.
- Les opérations sensibles doivent être enregistrées.
- Les domaines doivent être vérifiés avant leur association.
- Les certificats HTTPS doivent être actifs.
- Les comptes suspendus doivent respecter les règles d'accès définies.

Prévoir une politique de confidentialité, des conditions générales d'utilisation et des conditions commerciales adaptées aux pays de lancement.

---

## 17. PHASAGE DU DÉVELOPPEMENT

### PHASE 1 — MVP
- Identité visuelle.
- Site vitrine.
- Inscription et connexion.
- Création des boutiques.
- Sous-domaines automatiques.
- Tableau de bord commerçant.
- Gestion des produits.
- Gestion des catégories.
- Gestion des commandes.
- Boutiques publiques.
- Commandes WhatsApp.
- Paiement à la livraison.
- Administration générale.

### PHASE 2 — MONÉTISATION
- Activation à 2 000 FCFA.
- Période d'essai de 30 jours.
- Abonnement Standard.
- Abonnement Premium.
- Gestion des modules.
- Paiements des abonnements.
- Gestion des suspensions et renouvellements.

### PHASE 3 — DOMAINES PERSONNALISÉS
- Recherche de domaines.
- Vérification de disponibilité.
- Achat via registrar partenaire.
- Connexion de domaines externes.
- Configuration DNS.
- SSL automatique.
- Renouvellement.

### PHASE 4 — AUTOMATISATION COMMERCIALE
- Wave.
- Orange Money.
- MTN Mobile Money.
- Moov Money.
- Notifications avancées.
- Statistiques détaillées.
- Codes promotionnels.
- Fonctionnalités supplémentaires.

### PHASE 5 — EXPANSION
- Nouveaux pays.
- Nouvelles devises.
- Nouvelles extensions de domaines.
- Nouveaux moyens de paiement.
- Modules avancés.
- Application mobile éventuelle.

---

## 18. CRITÈRES DE VALIDATION

Le projet ne sera considéré comme prêt à être commercialisé que lorsque les tests suivants seront réussis :

1. Un commerçant peut créer son compte et activer sa boutique.
2. Il peut ajouter et modifier des produits.
3. Un visiteur peut passer une commande.
4. Le commerçant reçoit la commande dans son tableau de bord.
5. Les données de deux boutiques restent totalement isolées.
6. Les abonnements activent les bonnes fonctionnalités.
7. Un compte expiré respecte les restrictions prévues.
8. Un commerçant Premium peut connecter son propre domaine.
9. Le domaine affiche la bonne boutique en HTTPS.
10. Les paiements sont vérifiés côté serveur.
11. L'interface fonctionne sur smartphone et ordinateur.
12. L'administration générale peut superviser toute la plateforme.

---

## 19. PRINCIPES DE DÉVELOPPEMENT

- Ne pas construire une simple maquette.
- Développer une application réellement fonctionnelle.
- Utiliser des composants réutilisables.
- Éviter les duplications de code.
- Ne pas mélanger les données des différentes boutiques.
- Ne pas coder les limites des abonnements directement dans plusieurs fichiers.
- Centraliser les permissions et les modules.
- Prévoir l'évolution vers plusieurs pays.
- Tester chaque fonctionnalité avant de poursuivre.
- Documenter les intégrations externes.
- Ne jamais simuler un paiement réussi en production.

**Résultat attendu :** Une plateforme SaaS e-commerce multi-boutiques, professionnelle, évolutive et sécurisée, permettant aux commerçants africains de créer et gérer leurs propres boutiques en ligne, avec une gestion centralisée des abonnements, des commandes, des paiements et des noms de domaine.
