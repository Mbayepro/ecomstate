import type {
  CodFieldType,
  CodFormConfig,
  CodFormField,
  CodFormStyle,
} from "@/types/domain";

export const DEFAULT_COD_STYLE: CodFormStyle = {
  fieldBg: "#FFFFFF",
  borderColor: "#CBD5E1",
  textColor: "#15232D",
  buttonBg: "#00A884",
  buttonText: "#FFFFFF",
  borderRadius: "lg",
  buttonLabel: "Confirmer ma commande — Paiement à la livraison",
  title: "Commandez maintenant — Payez à la livraison",
  subtitle:
    "Remplissez vos coordonnées ci-dessous. Vous ne payez qu'à la réception de votre colis.",
  showOrderSummary: true,
  enableQuantityBreaks: true,
};

export interface CodPresetDefinition {
  id: string;
  name: string;
  niche: string;
  description: string;
  fields: CodFormField[];
  style?: Partial<CodFormStyle>;
}

export const COD_FIELD_LIBRARY: {
  type: CodFieldType;
  label: string;
  defaultPlaceholder: string;
}[] = [
  { type: "full_name", label: "Nom complet", defaultPlaceholder: "Ex : Koffi Mensah" },
  { type: "phone", label: "Téléphone principal", defaultPlaceholder: "Ex : +229 97 00 00 00" },
  { type: "secondary_phone", label: "Téléphone secondaire", defaultPlaceholder: "Numéro de secours (optionnel)" },
  { type: "city", label: "Ville / Zone de livraison", defaultPlaceholder: "Sélectionnez votre ville" },
  { type: "commune", label: "Commune", defaultPlaceholder: "Ex : Abomey-Calavi, Cocody, Plateau" },
  { type: "district", label: "Quartier", defaultPlaceholder: "Ex : Fidjrossè, Sacré-Cœur, Angré" },
  { type: "address", label: "Adresse exacte", defaultPlaceholder: "Rue, maison, bâtiment..." },
  { type: "landmark", label: "Repère de localisation", defaultPlaceholder: "Ex : Près de la pharmacie..." },
  { type: "quantity", label: "Quantité / Offre pack", defaultPlaceholder: "1" },
  { type: "select", label: "Liste déroulante personnalisée", defaultPlaceholder: "Choisir une option" },
  { type: "radio", label: "Choix unique (Boutons)", defaultPlaceholder: "" },
  { type: "checkbox", label: "Case à cocher", defaultPlaceholder: "" },
  { type: "short_text", label: "Texte court personnalisé", defaultPlaceholder: "Votre réponse..." },
  { type: "long_text", label: "Texte long / Précisions", defaultPlaceholder: "Précisions supplémentaires..." },
  { type: "delivery_notes", label: "Instructions au livreur", defaultPlaceholder: "Ex : Appeler 15 min avant l'arrivée" },
];

export const COD_FORM_PRESETS: CodPresetDefinition[] = [
  {
    id: "mobile_fast",
    name: "Optimisé Mobile Express (Conversion max)",
    niche: "Mobile",
    description: "4 champs essentiels pour réduire au maximum les abandons sur smartphone.",
    fields: [
      { id: "f-name", name: "full_name", label: "Nom complet", type: "full_name", placeholder: "Votre nom et prénom", required: true, visible: true, order: 1 },
      { id: "f-phone", name: "phone", label: "Numéro de téléphone", type: "phone", placeholder: "Ex : 97 00 00 00", required: true, visible: true, order: 2 },
      { id: "f-city", name: "city", label: "Ville / Zone de livraison", type: "city", placeholder: "Choisissez votre zone", required: true, visible: true, order: 3 },
      { id: "f-landmark", name: "landmark", label: "Quartier & Repère exact", type: "landmark", placeholder: "Ex : Fidjrossè, carré 120 près de l'école", required: true, visible: true, order: 4 },
    ],
  },
  {
    id: "simple",
    name: "Formulaire Simple COD",
    niche: "Généraliste",
    description: "Structure claire adaptée à toutes les boutiques.",
    fields: [
      { id: "f-name", name: "full_name", label: "Nom complet", type: "full_name", placeholder: "Nom et prénom", required: true, visible: true, order: 1 },
      { id: "f-phone", name: "phone", label: "Téléphone joignable", type: "phone", placeholder: "Numéro pour le livreur", required: true, visible: true, order: 2 },
      { id: "f-city", name: "city", label: "Ville / Zone", type: "city", placeholder: "Votre ville", required: true, visible: true, order: 3 },
      { id: "f-address", name: "address", label: "Adresse de livraison", type: "address", placeholder: "Quartier, rue, repère", required: true, visible: true, order: 4 },
      { id: "f-notes", name: "delivery_notes", label: "Note pour le livreur", type: "delivery_notes", placeholder: "Heure souhaitée (facultatif)", required: false, visible: true, order: 5 },
    ],
  },
  {
    id: "mode",
    name: "Mode & Prêt-à-porter",
    niche: "Mode",
    description: "Inclut taille, préférence de coupe, quartier et repère pour le livreur.",
    fields: [
      { id: "f-name", name: "full_name", label: "Nom complet", type: "full_name", placeholder: "Votre nom complet", required: true, visible: true, order: 1 },
      { id: "f-phone", name: "phone", label: "Téléphone principal", type: "phone", placeholder: "Numéro joignable par le livreur", required: true, visible: true, order: 2 },
      { id: "f-size", name: "custom_taille", label: "Taille souhaitée", type: "select", options: ["S", "M", "L", "XL", "XXL"], required: true, visible: true, order: 3 },
      { id: "f-city", name: "city", label: "Ville / Zone", type: "city", placeholder: "Sélectionnez votre zone", required: true, visible: true, order: 4 },
      { id: "f-district", name: "district", label: "Quartier", type: "district", placeholder: "Votre quartier", required: true, visible: true, order: 5 },
      { id: "f-landmark", name: "landmark", label: "Repère de livraison", type: "landmark", placeholder: "Pharmacie, carrefour, immeuble...", required: false, visible: true, order: 6 },
    ],
  },
  {
    id: "chaussures",
    name: "Chaussures & Sneakers",
    niche: "Chaussures",
    description: "Sélection rapide de la pointure + second numéro en cas d'indisponibilité.",
    fields: [
      { id: "f-name", name: "full_name", label: "Nom complet", type: "full_name", placeholder: "Nom et prénom", required: true, visible: true, order: 1 },
      { id: "f-phone", name: "phone", label: "Téléphone principal", type: "phone", placeholder: "Numéro principal", required: true, visible: true, order: 2 },
      { id: "f-phone2", name: "secondary_phone", label: "Téléphone secondaire", type: "secondary_phone", placeholder: "Second numéro (facultatif)", required: false, visible: true, order: 3 },
      { id: "f-shoe", name: "custom_pointure", label: "Pointure", type: "select", options: ["38", "39", "40", "41", "42", "43", "44", "45"], required: true, visible: true, order: 4 },
      { id: "f-city", name: "city", label: "Ville / Zone", type: "city", placeholder: "Votre zone", required: true, visible: true, order: 5 },
      { id: "f-address", name: "address", label: "Quartier & Repère", type: "address", placeholder: "Où devons-nous livrer ?", required: true, visible: true, order: 6 },
    ],
  },
  {
    id: "cosmetiques",
    name: "Cosmétiques & Soins Beauté",
    niche: "Cosmétiques",
    description: "Optimisé pour les packs de soins (1 cure, 2 cures, 3 cures) et créneau horaire.",
    fields: [
      { id: "f-name", name: "full_name", label: "Nom complet", type: "full_name", placeholder: "Votre nom", required: true, visible: true, order: 1 },
      { id: "f-phone", name: "phone", label: "Téléphone", type: "phone", placeholder: "Votre numéro", required: true, visible: true, order: 2 },
      { id: "f-city", name: "city", label: "Ville / Zone", type: "city", placeholder: "Votre zone", required: true, visible: true, order: 3 },
      { id: "f-address", name: "address", label: "Quartier & Adresse", type: "address", placeholder: "Lieu exact de réception", required: true, visible: true, order: 4 },
      { id: "f-slot", name: "custom_creneau", label: "Moment préféré de livraison", type: "radio", options: ["Matin (9h - 13h)", "Après-midi (14h - 18h)", "Soir (après 18h)"], required: false, visible: true, order: 5 },
    ],
  },
  {
    id: "electronique",
    name: "Électronique & High-Tech",
    niche: "Électronique",
    description: "Inclut commune, quartier, repère exact et vérification à la livraison.",
    fields: [
      { id: "f-name", name: "full_name", label: "Nom & Prénom", type: "full_name", placeholder: "Nom du destinataire", required: true, visible: true, order: 1 },
      { id: "f-phone", name: "phone", label: "Téléphone principal", type: "phone", placeholder: "Numéro joignable", required: true, visible: true, order: 2 },
      { id: "f-city", name: "city", label: "Ville", type: "city", placeholder: "Sélectionnez la ville", required: true, visible: true, order: 3 },
      { id: "f-commune", name: "commune", label: "Commune", type: "commune", placeholder: "Ex : Cotonou, Calavi, Plateau...", required: true, visible: true, order: 4 },
      { id: "f-landmark", name: "landmark", label: "Quartier & Repère précis", type: "landmark", placeholder: "Immeuble, bureau ou repère connu", required: true, visible: true, order: 5 },
    ],
  },
  {
    id: "maison",
    name: "Maison & Décoration",
    niche: "Maison",
    description: "Adapté aux articles volumineux avec instructions d'accès au domicile.",
    fields: [
      { id: "f-name", name: "full_name", label: "Nom complet", type: "full_name", placeholder: "Votre nom", required: true, visible: true, order: 1 },
      { id: "f-phone", name: "phone", label: "Téléphone", type: "phone", placeholder: "Numéro principal", required: true, visible: true, order: 2 },
      { id: "f-city", name: "city", label: "Ville / Zone", type: "city", placeholder: "Votre ville", required: true, visible: true, order: 3 },
      { id: "f-address", name: "address", label: "Adresse complète & étage", type: "address", placeholder: "Quartier, rue, maison, étage", required: true, visible: true, order: 4 },
      { id: "f-notes", name: "delivery_notes", label: "Instructions d'accès", type: "delivery_notes", placeholder: "Portail, repère pour le livreur...", required: false, visible: true, order: 5 },
    ],
  },
];

export function createInitialCodFormConfig(
  storeId: string,
  presetId = "mobile_fast",
  buttonColor = "#00A884"
): CodFormConfig {
  const preset =
    COD_FORM_PRESETS.find((p) => p.id === presetId) ?? COD_FORM_PRESETS[0];
  const fields = preset.fields.map((f, idx) => ({ ...f, order: idx + 1 }));
  const style: CodFormStyle = {
    ...DEFAULT_COD_STYLE,
    buttonBg: buttonColor,
    ...(preset.style ?? {}),
  };
  const now = new Date().toISOString();
  return {
    id: `codform-${storeId}`,
    storeId,
    presetId: preset.id,
    publishedFields: fields,
    publishedStyle: style,
    draftFields: fields,
    draftStyle: style,
    version: 1,
    updatedAt: now,
    versionsHistory: [
      {
        version: 1,
        savedAt: now,
        label: `Configuration initiale (${preset.name})`,
        fields,
        style,
      },
    ],
  };
}

/**
 * Assistant Adeshina IA dédié au Form Builder COD (Section 9.13).
 * Applique uniquement dans le BROUILLON (draft) afin que le commerçant prévisualise et confirme avant publication !
 */
export function applyAdeshinaToCodDraft(
  prompt: string,
  currentFields: CodFormField[],
  currentStyle: CodFormStyle
): {
  summary: string;
  nextFields: CodFormField[];
  nextStyle: CodFormStyle;
} {
  const q = prompt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let nextFields = [...currentFields.map((f) => ({ ...f }))];
  let nextStyle = { ...currentStyle };
  const changes: string[] = [];

  if (q.includes("chaussure") || q.includes("pointure")) {
    const preset = COD_FORM_PRESETS.find((p) => p.id === "chaussures")!;
    nextFields = preset.fields.map((f, i) => ({ ...f, order: i + 1 }));
    changes.push("Modèle Chaussures appliqué (avec sélection de pointure 38-45)");
  } else if (q.includes("mode") || (q.includes("taille") && q.includes("couleur"))) {
    const hasSize = nextFields.some((f) => f.label.toLowerCase().includes("taille"));
    if (!hasSize) {
      nextFields.push({
        id: `f-ai-size-${Date.now()}`,
        name: "custom_taille",
        label: "Taille",
        type: "select",
        options: ["S", "M", "L", "XL", "XXL"],
        required: true,
        visible: true,
        order: nextFields.length + 1,
      });
    }
    const hasColor = nextFields.some((f) => f.label.toLowerCase().includes("couleur"));
    if (!hasColor) {
      nextFields.push({
        id: `f-ai-color-${Date.now() + 1}`,
        name: "custom_couleur",
        label: "Couleur souhaitée",
        type: "select",
        options: ["Noir", "Blanc", "Vert Émeraude", "Beige"],
        required: true,
        visible: true,
        order: nextFields.length + 1,
      });
    }
    changes.push("Champs Taille et Couleur ajoutés au brouillon");
  }

  if (q.includes("quartier")) {
    if (!nextFields.some((f) => f.type === "district")) {
      nextFields.push({
        id: `f-ai-dist-${Date.now()}`,
        name: "district",
        label: "Quartier de livraison",
        type: "district",
        placeholder: "Indiquez votre quartier exact",
        required: true,
        visible: true,
        order: nextFields.length + 1,
      });
      changes.push("Champ Quartier ajouté et rendu obligatoire");
    }
  }

  if (q.includes("repere") || q.includes("localisation")) {
    if (!nextFields.some((f) => f.type === "landmark")) {
      nextFields.push({
        id: `f-ai-land-${Date.now()}`,
        name: "landmark",
        label: "Repère de localisation",
        type: "landmark",
        placeholder: "Pharmacie, école, carrefour proche...",
        required: false,
        visible: true,
        order: nextFields.length + 1,
      });
      changes.push("Champ Repère de localisation ajouté");
    }
  }

  if (q.includes("reduis") || q.includes("simple") || q.includes("abandon") || q.includes("mobile")) {
    const fast = COD_FORM_PRESETS.find((p) => p.id === "mobile_fast")!;
    nextFields = fast.fields.map((f, i) => ({ ...f, order: i + 1 }));
    changes.push(
      "Formulaire optimisé en 4 champs rapides (Nom, Téléphone, Zone, Repère) pour maximiser la conversion mobile"
    );
  }

  if (q.includes("telephone") && q.includes("obligatoire")) {
    nextFields = nextFields.map((f) =>
      f.type === "phone" ? { ...f, required: true, visible: true } : f
    );
    changes.push("Le numéro de téléphone est défini comme obligatoire");
  }

  if (q.includes("couleur") && q.includes("bouton")) {
    if (q.includes("ambre") || q.includes("orange")) {
      nextStyle.buttonBg = "#F4A340";
    } else if (q.includes("vert") || q.includes("emeraude")) {
      nextStyle.buttonBg = "#00A884";
    } else if (q.includes("noir") || q.includes("sombre")) {
      nextStyle.buttonBg = "#073B35";
    }
    changes.push(`Couleur du bouton modifiée (${nextStyle.buttonBg})`);
  }

  if (changes.length === 0) {
    changes.push(
      "Formulaire optimisé pour le paiement à la livraison (vérification des champs obligatoires et clarté mobile)"
    );
  }

  return {
    summary: `${changes.join(" · ")}. Vérifiez l'aperçu en direct puis cliquez sur « Publier le formulaire » pour activer ces changements.`,
    nextFields: nextFields.map((f, idx) => ({ ...f, order: idx + 1 })),
    nextStyle,
  };
}
