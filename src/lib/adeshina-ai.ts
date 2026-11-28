import { slugify } from "@/lib/utils";
import type { StoreTemplateId } from "@/types/domain";

export interface AdeshinaStoreBlueprint {
  sectorId: string;
  sectorLabel: string;
  suggestedName: string;
  subdomain: string;
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  template: StoreTemplateId;
  codPresetId: string;
  categories: { name: string; description: string }[];
  sampleProducts: {
    name: string;
    price: number;
    promoPrice?: number;
    description: string;
    variants: string;
    imageUrl: string;
  }[];
}

export const ADESHINA_SECTORS: AdeshinaStoreBlueprint[] = [
  {
    sectorId: "mode",
    sectorLabel: "Mode, Prêt-à-porter & Wax",
    suggestedName: "Maison Kora Mode",
    subdomain: "maison-kora.ecomsate.com",
    tagline: "L'élégance contemporaine livrée chez vous — Paiement à la livraison",
    description:
      "Créations contemporaines, ensembles en lin, robes brodées et tenues confectionnées avec soin. Commandez en ligne et payez uniquement à la réception.",
    primaryColor: "#073B35",
    secondaryColor: "#00A884",
    template: "shrine_pro_3",
    codPresetId: "mode",
    categories: [
      { name: "Ensembles & Tuniques", description: "Coupes fluides en lin et coton" },
      { name: "Robes & Cérémonies", description: "Créations chic pour vos événements" },
      { name: "Accessoires", description: "Sacs, foulards et bijoux" },
    ],
    sampleProducts: [
      {
        name: "Ensemble Lin & Soie Prestige Teranga",
        price: 35000,
        promoPrice: 28500,
        description:
          "Confection artisanale en lin pur respirant et broderie fine ton sur ton. Tenue élégante adaptée aux cérémonies et au quotidien. Vérification du colis à domicile et paiement 100 % à la livraison.",
        variants: "Taille:M, Taille:L, Taille:XL, Taille:XXL",
        imageUrl: "/images/african-fashion-model-teranga.jpg",
      },
      {
        name: "Tunique Cérémonie Broderie Royale",
        price: 25000,
        promoPrice: 21000,
        description:
          "Coupe classique revisitée avec finitions soignées. Tissu infroissable premium pour un confort thermique optimal toute la journée.",
        variants: "Taille:L, Taille:XL",
        imageUrl: "/images/hero-african-founder-fashion.jpg",
      },
    ],
  },
  {
    sectorId: "beaute",
    sectorLabel: "Beauté, Cosmétiques & Soins",
    suggestedName: "Éclat Karité Beauté",
    subdomain: "eclat-karite.ecomsate.com",
    tagline: "Soins d'exception pour la peau et les cheveux — Payez à la livraison",
    description:
      "Cosmétiques naturels à base de beurre de karité pur, huiles précieuses et soins capillaires testés pour sublimer votre peau au quotidien.",
    primaryColor: "#073B35",
    secondaryColor: "#00A884",
    template: "shrine_pro_3",
    codPresetId: "cosmetiques",
    categories: [
      { name: "Soins Visage", description: "Sérums, crèmes hydratantes et nettoyants" },
      { name: "Soins Capillaires", description: "Chantilly karité, huiles et masques" },
      { name: "Parfums & Corps", description: "Laits corporels et brumes parfumées" },
    ],
    sampleProducts: [
      {
        name: "Sérum Botanique Éclat & Beurre de Karité Brut",
        price: 22000,
        promoPrice: 17500,
        description:
          "Formule naturelle 100% bio enrichie en vitamines A, E & F. Nourrit intensément, estompe les taches, unifie le teint et redonne de l'éclat dès 14 jours. Payez à la livraison après réception.",
        variants: "Format:Flacon 50ml, Format:Pack Duo 2x50ml (-20%)",
        imageUrl: "/images/african-beauty-glow-portrait.jpg",
      },
    ],
  },
  {
    sectorId: "tech",
    sectorLabel: "Électronique, Smartphones & High-Tech",
    suggestedName: "NovaTech Store",
    subdomain: "novatech-store.ecomsate.com",
    tagline: "Équipements high-tech vérifiés avec garantie — Paiement à la livraison",
    description:
      "Smartphones, écouteurs sans fil, montres connectées et accessoires de charge rapide testés et livrés directement à votre adresse.",
    primaryColor: "#073B35",
    secondaryColor: "#00A884",
    template: "shrine_pro_3",
    codPresetId: "electronique",
    categories: [
      { name: "Audio & Écouteurs", description: "Casques Bluetooth et écouteurs ANC" },
      { name: "Charge & Énergie", description: "Powerbanks et chargeurs GaN 65W" },
      { name: "Montres & Accessoires", description: "Smartwatches et supports" },
    ],
    sampleProducts: [
      {
        name: "Écouteurs Pro Sans Fil ANC & Boîtier Affichage LED",
        price: 29000,
        promoPrice: 22000,
        description:
          "Réduction active du bruit ultra-performante (ANC 35dB), basses profondes HD, autonomie record 36h avec boîtier compact. Câble USB-C inclus. Testez le son à la livraison.",
        variants: "Couleur:Noir Mat, Couleur:Blanc Titane",
        imageUrl:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    sectorId: "chaussures",
    sectorLabel: "Chaussures, Sneakers & Maroquinerie",
    suggestedName: "Pas d'Or Sneakers & Cuir",
    subdomain: "pas-dor.ecomsate.com",
    tagline: "Du style et du confort à chaque pas — Vérifiez avant de payer",
    description:
      "Sandales en cuir artisanal, mocassins habillés et sneakers urbaines sélectionnées pour leur durabilité. Paiement à la livraison.",
    primaryColor: "#073B35",
    secondaryColor: "#00A884",
    template: "shrine_pro_3",
    codPresetId: "chaussures",
    categories: [
      { name: "Cuir Artisanal", description: "Sandales et mules cousues main" },
      { name: "Sneakers & Urbain", description: "Baskets confortables au quotidien" },
      { name: "Mocassins & Ville", description: "Chaussures habillées bureau & cérémonie" },
    ],
    sampleProducts: [
      {
        name: "Mocassins Cuir Véritable Cousu Main",
        price: 38000,
        promoPrice: 32000,
        description:
          "Cuir pleine fleur tanné avec soin, semelle ergonomique grand confort et coutures renforcées. Essayage possible à la livraison avant paiement du livreur.",
        variants: "Pointure:40, Pointure:41, Pointure:42, Pointure:43, Pointure:44",
        imageUrl: "/images/african-sneakers-leather-studio.jpg",
      },
    ],
  },
  {
    sectorId: "maison",
    sectorLabel: "Maison, Cuisine & Équipements",
    suggestedName: "Confort Maison Plus",
    subdomain: "confort-maison.ecomsate.com",
    tagline: "Équipez votre intérieur simplement — Livraison à domicile COD",
    description:
      "Appareils pratiques pour la cuisine, rangement intelligent et décoration moderne livrés chez vous avec paiement à la réception.",
    primaryColor: "#073B35",
    secondaryColor: "#00A884",
    template: "shrine_pro_3",
    codPresetId: "maison",
    categories: [
      { name: "Cuisine & Appareils", description: "Ustensiles et électroménager compact" },
      { name: "Organisation & Rangement", description: "Solutions gain de place" },
      { name: "Décoration & Luminaire", description: "Ambiance chaleureuse" },
    ],
    sampleProducts: [
      {
        name: "Mélangeur & Robot Culinaire Multi-Fonctions 8-en-1",
        price: 42000,
        promoPrice: 34500,
        description:
          "Moteur cuivre 1200W puissant, lames inox japonaises haute résistance et bol incassable 2L. Idéal piment, sauces, jus et smoothies. Test de mise sous tension à la livraison.",
        variants: "Capacité:Bol 2L Standard, Capacité:Pack Complet 2L + Mini Hachoir",
        imageUrl:
          "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

export function getBlueprintBySector(
  sectorId: string,
  customStoreName?: string
): AdeshinaStoreBlueprint {
  const base =
    ADESHINA_SECTORS.find((s) => s.sectorId === sectorId) ?? ADESHINA_SECTORS[0];
  if (!customStoreName || !customStoreName.trim()) {
    return base;
  }
  const cleanName = customStoreName.trim();
  const slug = slugify(cleanName) || "ma-boutique";
  return {
    ...base,
    suggestedName: cleanName,
    subdomain: `${slug}.ecomsate.com`,
    description: `${cleanName} — ${base.description}`,
  };
}

export function generateProductCopyWithAdeshina(productName: string): {
  shortDescription: string;
  description: string;
  suggestedCostPrice: number;
  suggestedPrice: number;
  suggestedPromoPrice: number;
  suggestedVariants: string;
  seoTitle: string;
} {
  const clean = productName.trim() || "Article Sélectionné";
  const lower = clean.toLowerCase();

  if (
    lower.includes("robe") ||
    lower.includes("chemise") ||
    lower.includes("ensemble") ||
    lower.includes("tunique") ||
    lower.includes("wax")
  ) {
    return {
      shortDescription: "Coupe élégante et tissu respirant — Paiement à la livraison.",
      description: `${clean} confectionné avec un tissu sélectionné alliant tenue impeccable et confort durable. Finitions soignées, coupe flatteuse et livraison rapide à domicile avec paiement à la réception.`,
      suggestedCostPrice: 14000,
      suggestedPrice: 35000,
      suggestedPromoPrice: 29500,
      suggestedVariants: "Taille:S, Taille:M, Taille:L, Taille:XL",
      seoTitle: `${clean} — Livraison rapide & Paiement à la réception`,
    };
  }

  if (
    lower.includes("chaussure") ||
    lower.includes("sandale") ||
    lower.includes("basket") ||
    lower.includes("mocassin")
  ) {
    return {
      shortDescription: "Semelle renforcée confortable — Choisissez votre pointure.",
      description: `${clean} conçu pour offrir maintien, durabilité et allure soignée au quotidien. Semelle antidérapante confortable et contrôle à la réception avant règlement.`,
      suggestedCostPrice: 9500,
      suggestedPrice: 25000,
      suggestedPromoPrice: 21000,
      suggestedVariants: "Pointure:40, Pointure:41, Pointure:42, Pointure:43, Pointure:44",
      seoTitle: `${clean} — Pointures disponibles en stock`,
    };
  }

  if (
    lower.includes("écouteur") ||
    lower.includes("ecouteur") ||
    lower.includes("montre") ||
    lower.includes("chargeur") ||
    lower.includes("batterie") ||
    lower.includes("téléphone")
  ) {
    return {
      shortDescription: "Testé avant expédition, haute autonomie & garantie.",
      description: `${clean} certifié haute performance avec autonomie longue durée et compatibilité universelle. Vérifié par notre équipe avant départ en livraison COD.`,
      suggestedCostPrice: 8500,
      suggestedPrice: 24000,
      suggestedPromoPrice: 19900,
      suggestedVariants: "Couleur:Noir, Couleur:Blanc",
      seoTitle: `${clean} — Garantie & Livraison COD`,
    };
  }

  return {
    shortDescription: "Disponible en stock local — Commandez et payez à la livraison.",
    description: `Découvrez ${clean}, sélectionné pour sa qualité et sa fiabilité au quotidien. Disponible immédiatement en stock avec livraison rapide et paiement exclusivement à la réception.`,
    suggestedCostPrice: 6500,
    suggestedPrice: 18500,
    suggestedPromoPrice: 15500,
    suggestedVariants: "Offre:1 Unité, Offre:Pack Duo",
    seoTitle: `${clean} — Paiement à la livraison`,
  };
}

export interface AdeshinaReply {
  answer: string;
  ctaLabel?: string;
  ctaHref?: string;
}

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function askAdeshinaIA(userMessage: string): AdeshinaReply {
  const q = normalizeText(userMessage);

  if (
    /^(bonjour|salut|bonsoir|hello|coucou|hey|bjr|slt|salam)\b/.test(q) &&
    q.split(/\s+/).length <= 5
  ) {
    return {
      answer:
        "Bonjour et bienvenue sur **EcomSate** ! Je suis **Adeshina IA**, votre copilote opérationnel.\n\nJe peux vous guider sur :\n• Le **Store Builder** et les thèmes haute conversion (**Shrine Pro 1 & Shrine Pro 3**)\n• Le **Form Builder COD** (formulaire de commande 100 % paiement à la livraison)\n• La gestion des **livreurs, encaissements COD et bénéfice net réel**\n• Les offres **Standard** (`7 500 FCFA/mois`) et **Premium** (`15 000 FCFA/mois`).",
      ctaLabel: "Créer ma boutique",
      ctaHref: "/creer-une-boutique",
    };
  }

  if (
    q.includes("cod") ||
    q.includes("formulaire") ||
    q.includes("form builder") ||
    q.includes("livraison") ||
    q.includes("livreur") ||
    q.includes("commander") ||
    (q.includes("commande") && !q.includes("creer ma boutique"))
  ) {
    return {
      answer:
        "Sur **EcomSate**, le parcours client est **100 % Paiement à la livraison (Cash on Delivery)**, sans redirection extérieure :\n\n1. **Form Builder COD personnalisable** : vous choisissez les champs (nom, téléphone, ville, quartier, repère, taille/pointure, packs 1x/2x/3x) et le style du bouton.\n2. **Confidentialité totale** : aucun numéro privé du propriétaire n'est exposé publiquement sur la boutique.\n3. **Cycle complet 11 statuts & Livreurs** : de *Nouvelle commande* à *Livrée* ou *Retournée*, avec suivi exact des sommes encaissées et reversées par chaque livreur.",
      ctaLabel: "Voir une boutique COD en direct",
      ctaHref: "/s/atelier-dakar",
    };
  }

  if (
    q.includes("benefice") ||
    q.includes("marge") ||
    q.includes("finance") ||
    q.includes("depense") ||
    q.includes("roas") ||
    q.includes("pub")
  ) {
    return {
      answer:
        "**EcomSate** distingue vos commandes en cours de votre **bénéfice net réellement encaissé** :\n\n• **Marge par produit** : renseignez le prix d'achat et les coûts additionnels pour connaître votre marge exacte.\n• **Rapprochement COD** : suivez l'argent détenu par vos livreurs vs l'argent réellement remis.\n• **Bénéfice réel** : déduisez automatiquement vos dépenses (publicités Meta/TikTok, livraison, emballage) des ventes effectivement livrées.",
      ctaLabel: "Explorer le centre de contrôle",
      ctaHref: "/dashboard",
    };
  }

  if (
    q.includes("theme") ||
    q.includes("shrine") ||
    q.includes("store builder") ||
    q.includes("design") ||
    q.includes("personnalis")
  ) {
    return {
      answer:
        "Le **Store Builder EcomSate** intègre nativement des sections modulaires haute conversion :\n\n• **Plan Standard** : inclut le thème de référence **Shrine Référence (Shrine Pro 1)** avec barre d'annonce COD, Hero, bandeau défilant, grille de bénéfices, barres de résultats et FAQ.\n• **Plan Premium** : débloque **Shrine Pro 3 Ultra-Conversion** (Packs 1x/2x/3x, tableau comparatif *Votre marque vs Autres*, fiche produit orientée conversion) et les thèmes par niche.",
      ctaLabel: "Comparer Standard & Premium",
      ctaHref: "/tarifs",
    };
  }

  if (
    q.includes("prix") ||
    q.includes("tarif") ||
    q.includes("cout") ||
    q.includes("combien") ||
    q.includes("7500") ||
    q.includes("15000") ||
    q.includes("abonnement") ||
    q.includes("formule") ||
    q.includes("standard") ||
    q.includes("premium")
  ) {
    return {
      answer:
        "EcomSate propose deux formules claires, avec **0 % de commission sur vos commandes** :\n\n• **Standard (`7 500 FCFA / mois` ou `75 000 FCFA / an`)** : 1 boutique, thème Shrine Pro 1, jusqu'à 150 produits, Form Builder COD, 11 statuts commandes, jusqu'à 5 livreurs, suivi des dépenses et Adeshina IA.\n• **Premium (`15 000 FCFA / mois` ou `150 000 FCFA / an`)** : Multi-boutiques (jusqu'à 5), thème Shrine Pro 3 Conversion, produits & livreurs illimités, suivi publicitaire ROAS, automatisations, gestion d'équipe (6 rôles) et domaine personnalisé.",
      ctaLabel: "Voir le tableau comparatif complet",
      ctaHref: "/tarifs",
    };
  }

  return {
    answer:
      "**EcomSate** réunit dans un seul espace tout ce dont un e-commerçant COD a besoin :\n• **Store Builder modulaire** (Shrine Pro 1 & Shrine Pro 3)\n• **Form Builder COD** sur mesure (100 % paiement à la livraison)\n• **Commandes, Livreurs, Stocks, Dépenses & Bénéfice réel**\n• **Adeshina IA** capable d'analyser votre rentabilité et de préparer vos fiches ou formulaires.",
    ctaLabel: "Créer ma boutique",
    ctaHref: "/creer-une-boutique",
  };
}
