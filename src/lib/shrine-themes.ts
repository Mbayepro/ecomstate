import type { StoreSectionBlock, StoreTemplateId } from "@/types/domain";

export interface EcomSateThemeDefinition {
  id: StoreTemplateId;
  name: string;
  tier: "standard" | "premium";
  badge: string;
  description: string;
  defaultPrimary: string;
  defaultSecondary: string;
  features: string[];
}

/**
 * Architecture Officielle des Thèmes EcomSate (Section 5 & Audio 3 Propriétaire) :
 * - Plan Essai & Standard (7 500 FCFA/mois) : Thème Shrine Pro 1 (Référence COD) initié automatiquement dès l'ouverture.
 * - Plan Premium (15 000 FCFA/mois — celui qui paie plus) : Débloque le Grand Thème Shrine Pro 3 Ultra-Conversion
 *   (vendu à plus de 1 000 $ sur Shopify) avec l'intégralité des blocs de conversion du dossier `shrine-pro-theme`.
 */
export const ECOMSATE_THEMES: EcomSateThemeDefinition[] = [
  {
    id: "shrine_pro_1",
    name: "Shrine Pro 1 (Référence COD)",
    tier: "standard",
    badge: "Inclus · Essai & Standard (7 500 FCFA)",
    description:
      "Initié automatiquement dès la création de votre boutique : bannière Hero, barre d'annonce COD, bandeau d'engagements, grille de 4 avantages, résultats et FAQ.",
    defaultPrimary: "#073B35",
    defaultSecondary: "#00A884",
    features: [
      "Barre d'annonce Paiement à la livraison",
      "Bandeau défilant d'engagements (Ticker)",
      "Grille de 4 bénéfices clés",
      "Description produit enrichie (Photos, GIFs & Vidéos)",
      "Formulaire COD Express intégré sur la fiche produit",
      "Barres de résultats & FAQ accordéon",
    ],
  },
  {
    id: "shrine_pro_3",
    name: "Shrine Pro 3 (Ultra-Conversion COD)",
    tier: "premium",
    badge: "Exclusif Plan Premium (15 000 FCFA) · Valeur +1 000 $",
    description:
      "Le grand thème complet haute conversion (valeur +1 000 $ sur Shopify) réservé aux abonnés Premium : Packs 1x/2x/3x BUNDLE & SAVE, chronologie de livraison 3 étapes, compte à rebours, comparatif Nous vs Autres, avis vérifiés, témoignages sociaux et barre d'achat collante.",
    defaultPrimary: "#073B35",
    defaultSecondary: "#00A884",
    features: [
      "Étoiles vertes Trustpilot (4,9/5) & 4 arguments cochés sous le titre",
      "Offres Packs BUNDLE & SAVE (1x, Pack Duo 2x, Pack Trio 3x + avantage)",
      "Chronologie visuelle de livraison 3 étapes avec dates calculées",
      "Compte à rebours promotionnel en direct (Heures : Minutes : Secondes)",
      "Mise en scène produit entourée de 4 points forts illustrés",
      "Tableau comparatif visuel (Votre boutique vs Autres vendeurs)",
      "Avis acheteurs vérifiés 4,9/5 + Témoignages sociaux type commentaires",
      "Barre de commande collante en bas d'écran au défilement (Sticky COD)",
    ],
  },
];

export function createDefaultShrineSections(
  storeName: string,
  themeId: StoreTemplateId = "shrine_pro_3"
): StoreSectionBlock[] {
  const base: StoreSectionBlock[] = [
    {
      id: "sec-announcement",
      type: "announcement_bar",
      title: "Livraison rapide partout · Vous payez uniquement à la réception de votre commande !",
      visible: true,
      order: 1,
    },
    {
      id: "sec-hero",
      type: "hero_shrine",
      title: `Bienvenue chez ${storeName}`,
      subtitle:
        "Qualité vérifiée, expédition rapide et paiement 100 % à la livraison en toute confiance.",
      visible: true,
      order: 2,
    },
    {
      id: "sec-ticker",
      type: "ticker_marquee",
      title: "Engagements boutique",
      visible: true,
      order: 3,
      items: [
        { id: "t1", title: "Paiement à la livraison (COD)", text: "" },
        { id: "t2", title: "Vérification à la réception", text: "" },
        { id: "t3", title: "Expédition rapide 24h - 48h", text: "" },
        { id: "t4", title: "Support client réactif", text: "" },
      ],
    },
    {
      id: "sec-categories",
      type: "categories_rail",
      title: "Parcourir nos rayons",
      subtitle: "Filtrez directement par catégorie",
      visible: true,
      order: 4,
    },
    {
      id: "sec-collection",
      type: "featured_collection",
      title: "Notre catalogue disponible",
      subtitle: "Sélectionnez un article et commandez en 30 secondes, paiement à la livraison",
      visible: true,
      order: 5,
    },
    {
      id: "sec-benefits",
      type: "benefits_grid",
      title: `Pourquoi commander chez ${storeName} ?`,
      subtitle: "Une expérience d'achat simple, fiable et sans risque",
      visible: true,
      order: 6,
      items: [
        {
          id: "b1",
          title: "Zéro risque financier",
          text: "Aucun paiement d'avance en ligne : vous réglez au livreur à la remise du colis.",
        },
        {
          id: "b2",
          title: "Qualité contrôlée",
          text: "Chaque article est vérifié avec soin avant son départ en livraison.",
        },
        {
          id: "b3",
          title: "Livraison à votre porte",
          text: "À domicile, au bureau ou à votre repère habituel selon votre disponibilité.",
        },
        {
          id: "b4",
          title: "Suivi transparent",
          text: "Suivez l'avancement exact de votre commande avec votre numéro unique.",
        },
      ],
    },
  ];

  if (themeId === "shrine_pro_3") {
    base.push(
      {
        id: "sec-bundles",
        type: "bundle_deals",
        title: "Offres Packs Économiques",
        subtitle: "Économisez davantage en commandant plusieurs unités en une seule livraison",
        visible: true,
        order: 7,
        items: [
          { id: "bd1", title: "1 Unité — Découverte", text: "Tarif standard · Paiement à la livraison", badge: "Standard" },
          { id: "bd2", title: "Pack Duo (2 Unités)", text: "Idéal à partager · Économisez sur la livraison", badge: "Populaire" },
          { id: "bd3", title: "Pack Famille / Pro (3 Unités)", text: "Meilleur rapport qualité-prix garanti", badge: "Meilleure offre" },
        ],
      },
      {
        id: "sec-comparison",
        type: "comparison_table",
        title: "La différence qualité",
        subtitle: "Pourquoi nos clients nous préfèrent",
        visible: true,
        order: 8,
        items: [
          { id: "cp1", title: "Paiement à la réception après contrôle", text: "Oui" },
          { id: "cp2", title: "Stock réel disponible localement", text: "Oui" },
          { id: "cp3", title: "Frais de livraison annoncés clairement", text: "Oui" },
          { id: "cp4", title: "Service après-vente dédié", text: "Oui" },
        ],
      }
    );
  }

  base.push(
    {
      id: "sec-results",
      type: "results_bars",
      title: "Nos engagements de service",
      subtitle: "Priorité à la rapidité et à la satisfaction à la livraison",
      visible: true,
      order: 9,
      items: [
        { id: "r1", title: "Commandes confirmées rapidement par notre équipe", text: "Prise en charge dans la journée", percentage: 98 },
        { id: "r2", title: "Colis préparés et contrôlés avant expédition", text: "Emballage soigné", percentage: 100 },
        { id: "r3", title: "Paiement simple en espèces à la livraison", text: "Zéro carte bancaire requise", percentage: 100 },
      ],
    },
    {
      id: "sec-faq",
      type: "faq_accordion",
      title: "Questions fréquentes avant de commander",
      visible: true,
      order: 10,
      items: [
        {
          id: "fq1",
          title: "Comment se passe le paiement ?",
          text: "Le paiement se fait exclusivement à la livraison (Cash on Delivery) lorsque le livreur vous remet votre commande.",
        },
        {
          id: "fq2",
          title: "Quels sont les délais de livraison ?",
          text: "Selon votre zone, la livraison est effectuée entre quelques heures et 24h à 48h après confirmation téléphonique.",
        },
        {
          id: "fq3",
          title: "Comment suivre ma commande ?",
          text: "Dès validation du formulaire, vous recevez un numéro de commande unique utilisable dans l'outil « Suivre ma commande » en haut de la boutique.",
        },
      ],
    }
  );

  return base.map((s, i) => ({ ...s, order: i + 1 }));
}
