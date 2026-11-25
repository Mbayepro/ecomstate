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

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function askAdeshinaIA(userMessage: string): AdeshinaReply {
  const q = normalizeText(userMessage);

  // 1. Salutations
  if (
    /^(bonjour|salut|bonsoir|hello|coucou|hey|bjr|slt|salam)\b/.test(q) &&
    q.split(/\s+/).length <= 5
  ) {
    return {
      answer:
        "Bonjour et bienvenue sur **EcomSate** ! Je suis **Adeshina IA**.\n\nDites-moi ce que vous vendez (mode, cosmétiques, électronique, alimentation…) ou posez-moi une question sur :\n• Les **tarifs** et l'essai à `2 000 FCFA`\n• Les commandes **WhatsApp & Paiement à la livraison**\n• Les paiements **Mobile Money** (MTN, Moov, Celtiis, Wave)\n• La création de votre boutique en **2 minutes**.",
      ctaLabel: "Créer ma boutique maintenant",
      ctaHref: "/creer-une-boutique",
    };
  }

  // 2. Commandes WhatsApp, Livraison & Panier (prioritaire avant "comment ça fonctionne")
  if (
    q.includes("whatsapp") ||
    q.includes("livraison") ||
    q.includes("panier") ||
    q.includes("acheteur") ||
    q.includes("commander") ||
    (q.includes("commande") && !q.includes("creer ma boutique"))
  ) {
    return {
      answer:
        "Le parcours d'achat sur votre boutique EcomSate est ultra-fluide sur téléphone :\n\n1. **Choix facile** : votre client choisit ses articles, tailles/couleurs et son mode de réception (**Livraison à domicile** ou **Retrait gratuit en boutique**).\n2. **3 modes de règlement au choix** :\n   • **Commande WhatsApp** : vous recevez le récapitulatif complet sur votre WhatsApp ET la commande s'enregistre dans votre tableau de bord.\n   • **Paiement à la livraison** (espèces ou Mobile Money à la réception).\n   • **Mobile Money direct** vers votre propre numéro.\n3. **Suivi pro** : chaque commande reçoit un numéro unique et décrémente automatiquement votre stock.",
      ctaLabel: "Tester sur une boutique démo",
      ctaHref: "/s/atelier-dakar",
    };
  }

  // 3. Paiements Mobile Money, Wave, MTN, Moov, Celtiis, NINEA / RCCM
  if (
    q.includes("mobile money") ||
    q.includes("momo") ||
    q.includes("mtn") ||
    q.includes("moov") ||
    q.includes("celtiis") ||
    q.includes("wave") ||
    q.includes("orange money") ||
    q.includes("ninea") ||
    q.includes("rccm") ||
    q.includes("ifu") ||
    q.includes("registre") ||
    q.includes("paiement")
  ) {
    return {
      answer:
        "Bonne nouvelle : vous n'avez besoin **ni de carte bancaire, ni de NINEA / RCCM** pour vendre sur EcomSate !\n\n• **Pour encaisser vos clients** : vos acheteurs paient à la livraison, via WhatsApp ou par transfert Mobile Money direct vers **votre propre numéro** (MTN MoMo, Moov Money, Celtiis Cash, Wave, Orange Money).\n• **Pour régler votre abonnement EcomSate** : tout se fait aussi simplement par Mobile Money depuis votre tableau de bord (`/dashboard/abonnement`).",
      ctaLabel: "Voir les offres & moyens de paiement",
      ctaHref: "/tarifs",
    };
  }

  // 4. Tarifs, Prix, Coût, 2000 FCFA, Essai, Abonnement, Commission
  if (
    q.includes("prix") ||
    q.includes("tarif") ||
    q.includes("cout") ||
    q.includes("coute") ||
    q.includes("combien") ||
    q.includes("2000") ||
    q.includes("2 000") ||
    q.includes("7500") ||
    q.includes("15000") ||
    q.includes("essai") ||
    q.includes("gratuit") ||
    q.includes("commission") ||
    q.includes("abonnement") ||
    q.includes("formule") ||
    q.includes("standard") ||
    q.includes("premium")
  ) {
    return {
      answer:
        "Nos tarifs sont pensés pour les commerçants africains avec **0 % de commission sur vos ventes** :\n\n• **Activation & Essai 30 jours** : `2 000 FCFA` (une seule fois) pour lancer et tester toute votre boutique.\n• **Formule Standard** : `7 500 FCFA / mois` (ou `75 000 FCFA / an`, soit 2 mois offerts) — jusqu'à 100 produits, stocks, clients & commandes.\n• **Formule Premium** : `15 000 FCFA / mois` (ou `150 000 FCFA / an`) — produits illimités, statistiques avancées + **domaine personnalisé** (`.com`, `.bj`, `.sn`…). ",
      ctaLabel: "Comparer les formules",
      ctaHref: "/tarifs",
    };
  }

  // 5. Produits, Photos, Images, Catalogue, Stocks
  if (
    q.includes("produit") ||
    q.includes("photo") ||
    q.includes("image") ||
    q.includes("stock") ||
    q.includes("rupture") ||
    q.includes("catalogue") ||
    q.includes("categorie") ||
    q.includes("variante") ||
    q.includes("taille")
  ) {
    return {
      answer:
        "La gestion de vos produits et de vos stocks est ultra-simple, même depuis un téléphone Android :\n\n• **Photos optimisées 3G/4G** : prenez vos articles en photo depuis votre téléphone, EcomSate les compresse automatiquement pour un affichage rapide.\n• **Rédaction par Adeshina IA** : tapez juste le nom de l'article et je rédige sa description commerciale + ses variantes (tailles, couleurs, formats).\n• **Stocks intelligents** : vos quantités se mettent à jour à chaque commande et vous recevez une alerte dès qu'un stock devient faible.",
      ctaLabel: "Explorer le tableau de bord Démo",
      ctaHref: "/dashboard",
    };
  }

  // 6. Domaine personnalisé (.com, .bj, .sn, .ci)
  if (
    q.includes("domaine") ||
    q.includes("sous-domaine") ||
    q.includes(".com") ||
    q.includes(".sn") ||
    q.includes(".bj") ||
    q.includes(".ci") ||
    q.includes("adresse web") ||
    q.includes("lien")
  ) {
    return {
      answer:
        "Dès l'inscription, votre boutique obtient gratuitement son adresse immédiate de type `maboutique.ecomsate.com` (prête à partager en bio TikTok, Instagram, Facebook ou statut WhatsApp).\n\nAvec la formule **Premium**, vous pouvez aussi brancher votre propre nom de domaine professionnel (`.com`, `.bj`, `.sn`, `.ci`, `.tg`) avec certificat de sécurité HTTPS inclus.",
      ctaLabel: "Découvrir la formule Premium",
      ctaHref: "/tarifs",
    };
  }

  // 7. Pays couverts (Bénin, Sénégal, Côte d'Ivoire, Togo, Burkina)
  if (
    q.includes("pays") ||
    q.includes("benin") ||
    q.includes("cotonou") ||
    q.includes("senegal") ||
    q.includes("dakar") ||
    q.includes("ivoire") ||
    q.includes("abidjan") ||
    q.includes("togo") ||
    q.includes("lome") ||
    q.includes("burkina") ||
    q.includes("ouaga") ||
    q.includes("afrique")
  ) {
    return {
      answer:
        "**EcomSate** accompagne les commerçants dans toute l'Afrique francophone, notamment au **Bénin**, au **Sénégal**, en **Côte d'Ivoire**, au **Togo** et au **Burkina Faso**.\n\nLes prix s'affichent nativement en `FCFA`, les numéros WhatsApp locaux (`+229`, `+221`, `+225`, `+228`, `+226`) sont pré-configurés et les boutiques sont allégées pour charger vite sur réseau mobile.",
      ctaLabel: "Lancer ma boutique dans mon pays",
      ctaHref: "/creer-une-boutique",
    };
  }

  // 8. Création de boutique / Inscription / Google
  if (
    q.includes("creer") ||
    q.includes("lancer") ||
    q.includes("ouvrir") ||
    q.includes("inscri") ||
    q.includes("commencer") ||
    q.includes("demarrer") ||
    q.includes("google") ||
    q.includes("aide-moi")
  ) {
    return {
      answer:
        "Vous pouvez ouvrir votre boutique en **moins de 2 minutes** de deux façons :\n\n1. **En 1 clic avec Google** : cliquez sur *« Créer ma boutique en 1 clic avec Google »* sur la page d'inscription.\n2. **Par formulaire classique** : indiquez le nom de votre boutique, votre secteur et votre numéro WhatsApp.\n\nVous pouvez aussi cliquer sur l'onglet **« Créer ma boutique IA »** juste au-dessus dans cette fenêtre pour prévisualiser votre boutique !",
      ctaLabel: "Ouvrir ma boutique maintenant",
      ctaHref: "/creer-une-boutique",
    };
  }

  // 9. Contact / Support / WhatsApp Direction
  if (
    q.includes("contact") ||
    q.includes("support") ||
    q.includes("numero") ||
    q.includes("appeler") ||
    q.includes("joindre") ||
    q.includes("assistance") ||
    q.includes("humain") ||
    q.includes("equipe")
  ) {
    return {
      answer:
        "Notre équipe support **EcomSate** est joignable directement :\n• **WhatsApp Direct** : `+229 95 78 21 32`\n• **E-mail** : `support@ecomsate.com`\n\nNous vous accompagnons pour l'ouverture, la personnalisation et l'activation de votre boutique.",
      ctaLabel: "Contacter le support (+229 95 78 21 32)",
      ctaHref: "/contact",
    };
  }

  // 10. Démo / Exemple / Tester avant de payer
  if (
    q.includes("demo") ||
    q.includes("exemple") ||
    q.includes("voir une boutique") ||
    q.includes("tester") ||
    q.includes("tableau de bord") ||
    q.includes("dashboard")
  ) {
    return {
      answer:
        "Vous pouvez tester librement les deux facettes d'EcomSate dès maintenant :\n• **Côté client** : visitez une vraie boutique modèle avec panier et commande WhatsApp.\n• **Côté commerçant** : ouvrez le **Tableau de bord Démo** pour tester les statistiques, l'ajout de produits et le copilote Adeshina IA.",
      ctaLabel: "Ouvrir le Tableau de bord Démo",
      ctaHref: "/dashboard",
    };
  }

  // 11. Sécurité, Données, Confiance
  if (
    q.includes("securite") ||
    q.includes("donnee") ||
    q.includes("fiable") ||
    q.includes("proprietaire") ||
    q.includes("confidentiel")
  ) {
    return {
      answer:
        "Vos données vous appartiennent à **100 %** : chaque boutique sur EcomSate est strictement isolée (produits, stocks, commandes et fichier clients). Aucun autre vendeur n'a accès à vos clients ou à vos chiffres.",
      ctaLabel: "En savoir plus sur EcomSate",
      ctaHref: "/a-propos",
    };
  }

  // 12. Comment ça marche / Étapes concrètes
  if (
    q.includes("comment ca marche") ||
    q.includes("comment ca fonctionne") ||
    q.includes("comment fonctionne") ||
    q.includes("3 etapes") ||
    q.includes("etape")
  ) {
    return {
      answer:
        "**EcomSate fonctionne en 3 étapes simples :**\n\n1. **Créez votre boutique** (en 1 clic avec Google ou par e-mail) et personnalisez votre logo et vos couleurs.\n2. **Ajoutez vos produits** depuis votre téléphone (photos, prix en FCFA, tailles/couleurs et stocks).\n3. **Partagez votre lien** sur WhatsApp, TikTok, Facebook ou Instagram : vos clients commandent seuls 24h/24 et tout arrive proprement dans votre tableau de bord !",
      ctaLabel: "Voir le guide détaillé",
      ctaHref: "/comment-ca-marche",
    };
  }

  // 13. À quoi sert EcomSate / Utilité du site
  if (
    q.includes("c'est quoi") ||
    q.includes("c est quoi") ||
    q.includes("utilite") ||
    q.includes("sert a quoi") ||
    q.includes("quoi sert") ||
    q.includes("presente") ||
    q.includes("ecomsate")
  ) {
    return {
      answer:
        "**EcomSate** est une plateforme e-commerce tout-en-un conçue pour les commerçants africains.\n\nAu lieu de perdre des ventes dans des dizaines de messages WhatsApp dispersés, vous disposez d'une **vraie boutique professionnelle** avec catalogue filtrable, panier automatique, gestion des stocks et copilote **Adeshina IA** intégré.",
      ctaLabel: "Découvrir toutes les fonctionnalités",
      ctaHref: "/fonctionnalites",
    };
  }

  // 14. Réponse contextuelle pour toute autre question libre
  return {
    answer:
      "Merci pour votre question ! Sur **EcomSate**, je peux vous renseigner précisément sur :\n• **La création de boutique** en 2 minutes (essai 30 jours à `2 000 FCFA`)\n• **Les commandes clients** (WhatsApp, paiement à la livraison, Mobile Money sans NINEA/RCCM)\n• **La gestion des produits, photos & stocks** depuis votre téléphone.\n\nCliquez sur un thème ci-dessous ou joignez directement notre équipe WhatsApp au **+229 95 78 21 32**.",
    ctaLabel: "Créer ma boutique ou voir la Démo",
    ctaHref: "/creer-une-boutique",
  };
}

