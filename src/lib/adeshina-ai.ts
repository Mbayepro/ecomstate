import { slugify } from "@/lib/utils";

export interface AdeshinaStoreBlueprint {
  sectorId: string;
  sectorLabel: string;
  suggestedName: string;
  subdomain: string;
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  template: "minimal" | "boutique" | "editorial";
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
    tagline: "L'élégance africaine moderne livrée chez vous",
    description:
      "Créations contemporaines, ensembles en lin, robes brodées et tenues sur-mesure confectionnées avec soin. Livraison rapide en 24h-48h.",
    primaryColor: "#102A43",
    secondaryColor: "#10B981",
    template: "boutique",
    categories: [
      { name: "Ensembles & Tuniques", description: "Coupes fluides en lin et coton" },
      { name: "Robes & Cérémonies", description: "Créations chic pour vos événements" },
      { name: "Accessoires", description: "Sacs, foulards et bijoux" },
    ],
    sampleProducts: [
      {
        name: "Ensemble Lin Brodé Royal",
        price: 42000,
        promoPrice: 36000,
        description:
          "Ensemble deux pièces en lin respirant avec broderie artisanale. Confort absolu et tombé impeccable.",
        variants: "Taille:M, Taille:L, Taille:XL",
        imageUrl:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Robe Midi Satin & Wax",
        price: 34000,
        description:
          "Robe coupe évasée alliant touches de wax authentique et finitions modernes.",
        variants: "Taille:S, Taille:M, Taille:L",
        imageUrl:
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Sac Cabas Cuir Tressé",
        price: 28000,
        promoPrice: 24500,
        description:
          "Cabas artisanal en cuir véritable avec doublure coton et pochette intérieure zippée.",
        variants: "Couleur:Camel, Couleur:Noir",
        imageUrl:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    sectorId: "beaute",
    sectorLabel: "Beauté, Cosmétiques & Soins",
    suggestedName: "Éclat Karité Beauté",
    subdomain: "eclat-karite.ecomsate.com",
    tagline: "Soins naturels d'Afrique pour la peau et les cheveux",
    description:
      "Cosmétiques naturels à base de beurre de karité pur, huiles précieuses et soins capillaires testés pour sublimer votre peau au quotidien.",
    primaryColor: "#4A1D34",
    secondaryColor: "#10B981",
    template: "editorial",
    categories: [
      { name: "Soins Visage", description: "Sérums, crèmes hydratantes et nettoyants" },
      { name: "Soins Capillaires", description: "Chantilly karité, huiles et masques" },
      { name: "Parfums & Corps", description: "Laits corporels et brumes parfumées" },
    ],
    sampleProducts: [
      {
        name: "Coffret Chantilly de Karité & Hibiscus",
        price: 16500,
        promoPrice: 14000,
        description:
          "Soin fouetté ultra-nourrissant au beurre de karité brut et huile d'hibiscus bio pour peau douce et lumineuse.",
        variants: "Format:200ml, Format:400ml",
        imageUrl:
          "https://images.unsplash.com/photo-1608248597359-0e6d526a6828?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Sérum Éclat Vitamine C & Baobab",
        price: 12500,
        description:
          "Unifie le teint, hydrate en profondeur et ravive l'éclat naturel dès 14 jours.",
        variants: "Flacon:30ml",
        imageUrl:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Élixir Capillaire Croissance Ricin & Chébé",
        price: 11000,
        description:
          "Fortifie les longueurs, réduit la casse et nourrit le cuir chevelu.",
        variants: "Flacon:100ml",
        imageUrl:
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    sectorId: "tech",
    sectorLabel: "Électronique, Smartphones & High-Tech",
    suggestedName: "NovaTech Afrique",
    subdomain: "novatech-afrique.ecomsate.com",
    tagline: "Vos équipements high-tech originaux avec garantie locale",
    description:
      "Smartphones, écouteurs sans fil, montres connectées et accessoires de charge rapide testés et garantis avec livraison express.",
    primaryColor: "#0F172A",
    secondaryColor: "#10B981",
    template: "minimal",
    categories: [
      { name: "Audio & Écouteurs", description: "Casques Bluetooth et écouteurs ANC" },
      { name: "Charge & Énergie", description: "Powerbanks et chargeurs GaN 65W" },
      { name: "Montres & Accessoires", description: "Smartwatches et supports" },
    ],
    sampleProducts: [
      {
        name: "Écouteurs Sans Fil Studio ANC",
        price: 24000,
        promoPrice: 19500,
        description:
          "Réduction active du bruit, autonomie 30h avec boîtier USB-C et micros HD pour des appels clairs.",
        variants: "Couleur:Noir, Couleur:Blanc",
        imageUrl:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Montre Connectée Sport AMOLED",
        price: 32000,
        promoPrice: 27000,
        description:
          "Écran AMOLED, notifications appels/WhatsApp, étanche IP68 et autonomie 10 jours.",
        variants: "Bracelet:Silicone Noir, Bracelet:Acier",
        imageUrl:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Batterie Externe 20 000 mAh Charge Rapide",
        price: 22000,
        description:
          "Double port USB-C Power Delivery, idéale pour recharger téléphone et tablette partout.",
        variants: "Capacité:20000mAh",
        imageUrl:
          "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    sectorId: "chaussures",
    sectorLabel: "Chaussures, Baskets & Maroquinerie",
    suggestedName: "Pas d'Or Sneakers & Cuir",
    subdomain: "pas-dor.ecomsate.com",
    tagline: "Du style et du confort à chaque pas",
    description:
      "Sandales en cuir artisanal, mocassins habillés et sneakers urbaines sélectionnées pour leur durabilité. Échange de pointure garanti.",
    primaryColor: "#1E293B",
    secondaryColor: "#10B981",
    template: "boutique",
    categories: [
      { name: "Cuir Artisanal", description: "Sandales et mules cousues main" },
      { name: "Sneakers & Urbain", description: "Baskets confortables au quotidien" },
      { name: "Mocassins & Ville", description: "Chaussures habillées bureau & cérémonie" },
    ],
    sampleProducts: [
      {
        name: "Sandales Cuir Véritable Prestige",
        price: 23000,
        promoPrice: 19500,
        description:
          "Cuir souple tanné artisanalement et semelle antidérapante cousue pour une longévité maximale.",
        variants: "Pointure:40, Pointure:41, Pointure:42, Pointure:43, Pointure:44",
        imageUrl:
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Sneakers Urbaines Minimal Blanc",
        price: 29000,
        description:
          "Design épuré, semelle ergonomique légère et entretien facile.",
        variants: "Pointure:39, Pointure:40, Pointure:41, Pointure:42, Pointure:43",
        imageUrl:
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    sectorId: "alimentation",
    sectorLabel: "Alimentation, Épicerie fine & Terroir",
    suggestedName: "Saveurs du Terroir Bio",
    subdomain: "saveurs-terroir.ecomsate.com",
    tagline: "Produits naturels, épices et douceurs locales livrés frais",
    description:
      "Miel pur, épices sélectionnées, jus naturels, cafés et produits agroalimentaires locaux conditionnés avec hygiène et livrés à domicile.",
    primaryColor: "#14532D",
    secondaryColor: "#10B981",
    template: "minimal",
    categories: [
      { name: "Épices & Condiments", description: "Mélanges naturels et piments parfumés" },
      { name: "Miels & Douceurs", description: "Miel sauvage, confitures et pâte d'arachide" },
      { name: "Boissons & Infusions", description: "Bissap, gingembre, moringa et café" },
    ],
    sampleProducts: [
      {
        name: "Pack Dégustation Miel Sauvage & Épices Douces",
        price: 12000,
        promoPrice: 10000,
        description:
          "Récolte 100 % naturelle non chauffée, idéale pour vos petits-déjeuners et infusions.",
        variants: "Pot:500g, Pot:1kg",
        imageUrl:
          "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Coffret Infusions Bissap, Gingembre & Moringa",
        price: 8500,
        description:
          "Sachets prêts à infuser chauds ou glacés, sans conservateurs ni sucres ajoutés.",
        variants: "Boîte:30 sachets",
        imageUrl:
          "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80",
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
  description: string;
  suggestedPrice: number;
  suggestedPromoPrice: number;
  suggestedVariants: string;
} {
  const clean = productName.trim() || "Article Premium";
  const lower = clean.toLowerCase();

  if (
    lower.includes("robe") ||
    lower.includes("chemise") ||
    lower.includes("ensemble") ||
    lower.includes("tunique") ||
    lower.includes("wax")
  ) {
    return {
      description: `${clean} confectionné avec un tissu haut de gamme alliant élégance et confort. Finitions soignées, coupe flatteuse adaptée au climat tropical et livraison rapide avec échange possible.`,
      suggestedPrice: 35000,
      suggestedPromoPrice: 29500,
      suggestedVariants: "Taille:S, Taille:M, Taille:L, Taille:XL",
    };
  }

  if (
    lower.includes("chaussure") ||
    lower.includes("sandale") ||
    lower.includes("basket") ||
    lower.includes("mocassin")
  ) {
    return {
      description: `${clean} conçu pour offrir maintien, durabilité et style au quotidien. Semelle confortable renforcée et matériaux résistants.`,
      suggestedPrice: 25000,
      suggestedPromoPrice: 21000,
      suggestedVariants: "Pointure:40, Pointure:41, Pointure:42, Pointure:43, Pointure:44",
    };
  }

  if (
    lower.includes("écouteur") ||
    lower.includes("montre") ||
    lower.includes("chargeur") ||
    lower.includes("batterie") ||
    lower.includes("téléphone")
  ) {
    return {
      description: `${clean} certifié haute performance avec autonomie longue durée et compatibilité universelle. Testé et garanti par notre boutique avec livraison express.`,
      suggestedPrice: 24000,
      suggestedPromoPrice: 19900,
      suggestedVariants: "Couleur:Noir, Couleur:Blanc",
    };
  }

  return {
    description: `Découvrez ${clean}, sélectionné pour sa qualité supérieure et sa fiabilité. Disponible immédiatement en stock avec livraison rapide à domicile et paiement à la réception ou via Mobile Money.`,
    suggestedPrice: 18500,
    suggestedPromoPrice: 15500,
    suggestedVariants: "Option:Standard, Option:Pack Duo",
  };
}

export interface AdeshinaReply {
  answer: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function askAdeshinaIA(userMessage: string): AdeshinaReply {
  const q = userMessage.toLowerCase();

  if (
    q.includes("c'est quoi") ||
    q.includes("utilité") ||
    q.includes("utilite") ||
    q.includes("sert à quoi") ||
    q.includes("présente") ||
    q.includes("fonctionne")
  ) {
    return {
      answer:
        "Je suis **Adeshina IA**, l'assistant intelligent d'**EcomSate** ! EcomSate permet à tout commerçant ou entrepreneur en Afrique (Bénin, Sénégal, Côte d'Ivoire, Togo, Burkina Faso…) de créer sa propre boutique en ligne professionnelle en moins de 2 minutes, sans aucune compétence technique : vous obtenez votre adresse `.ecomsate.com`, un tableau de bord pour gérer vos produits/stocks/clients, et vos acheteurs commandent facilement par WhatsApp, paiement à la livraison ou Mobile Money.",
      ctaLabel: "Créer ma boutique avec Adeshina IA",
      ctaHref: "/creer-une-boutique",
    };
  }

  if (
    q.includes("prix") ||
    q.includes("tarif") ||
    q.includes("coût") ||
    q.includes("combien") ||
    q.includes("2000") ||
    q.includes("2 000") ||
    q.includes("abonnement")
  ) {
    return {
      answer:
        "Les tarifs d'EcomSate sont transparents et **sans aucune commission sur vos ventes** :\n• **Activation & Essai 30 jours** : `2 000 FCFA` (paiement unique) avec création automatique de votre boutique.\n• **Offre Standard** : `7 500 FCFA / mois` (jusqu'à 100 produits, sous-domaine gratuit, stocks & commandes).\n• **Offre Premium** : `15 000 FCFA / mois` (produits illimités + votre propre nom de domaine `.com`, `.sn`, `.bj` avec SSL).",
      ctaLabel: "Voir le détail des offres",
      ctaHref: "/tarifs",
    };
  }

  if (
    q.includes("créer") ||
    q.includes("creer") ||
    q.includes("lancer") ||
    q.includes("ouvrir") ||
    q.includes("boutique") ||
    q.includes("vendeur")
  ) {
    return {
      answer:
        "Pour créer votre boutique, je peux tout préparer pour vous ! Choisissez votre secteur d'activité (Mode, Beauté, High-Tech, Chaussures, Alimentation), indiquez votre nom de boutique et je génère automatiquement votre sous-domaine `.ecomsate.com`, vos catégories, votre palette de couleurs et même vos premiers articles modèles.",
      ctaLabel: "Lancer le générateur de boutique",
      ctaHref: "/creer-une-boutique",
    };
  }

  if (
    q.includes("paiement") ||
    q.includes("whatsapp") ||
    q.includes("mobile money") ||
    q.includes("livraison") ||
    q.includes("wave")
  ) {
    return {
      answer:
        "Vos clients peuvent commander sur votre boutique avec 3 modes adaptés aux réalités du marché :\n1. **Paiement à la livraison** (en espèces ou à la réception).\n2. **Commande directe sur WhatsApp** (le panier arrive pré-rempli sur votre numéro ET s'enregistre dans votre tableau de bord).\n3. **Mobile Money** (Wave, Orange Money, MTN MoMo, Moov Money avec référence confirmée par le vendeur).",
      ctaLabel: "Tester sur une boutique démo",
      ctaHref: "/s/atelier-dakar",
    };
  }

  if (q.includes("domaine") || q.includes(".com") || q.includes(".sn") || q.includes(".bj")) {
    return {
      answer:
        "Chaque boutique reçoit dès sa création un sous-domaine gratuit (ex : `maboutique.ecomsate.com`). Avec l'offre **Premium**, vous pouvez connecter ou acheter votre propre nom de domaine (`.com`, `.sn`, `.bj`, `.ci`…) avec certificat HTTPS automatique. Le domaine reste 100 % votre propriété.",
      ctaLabel: "Découvrir l'offre Premium",
      ctaHref: "/tarifs",
    };
  }

  if (
    q.includes("contact") ||
    q.includes("support") ||
    q.includes("numéro") ||
    q.includes("numero") ||
    q.includes("appeler") ||
    q.includes("joindre") ||
    q.includes("aide")
  ) {
    return {
      answer:
        "Vous pouvez joindre directement la direction et le support **EcomSate (Bénin)** sur WhatsApp au **+229 95 78 21 32** ou par e-mail à `support@ecomsate.com`.",
      ctaLabel: "Contacter le support (+229 95 78 21 32)",
      ctaHref: "/contact",
    };
  }


  return {
    answer:
      "Je suis **Adeshina IA**, votre copilote sur EcomSate. Je peux :\n• Expliquer comment fonctionne la plateforme et ses tarifs (`2 000 FCFA` pour 30 jours d'essai)\n• Générer automatiquement la structure complète de votre boutique selon votre secteur\n• Rédiger vos fiches produits et descriptions commerciales dans votre tableau de bord.",
    ctaLabel: "Créer ma boutique assistée par IA",
    ctaHref: "/creer-une-boutique",
  };
}
