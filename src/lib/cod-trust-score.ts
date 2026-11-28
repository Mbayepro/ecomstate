import type { Order } from "@/types/domain";

export type CustomerTrustLevel = "trusted" | "risk" | "first_time";

export interface CustomerTrustProfile {
  level: CustomerTrustLevel;
  label: string;
  detail: string;
  deliveredCount: number;
  failedCount: number;
  totalOrders: number;
}

export function normalizePhoneDigits(phone: string): string {
  const digits = (phone || "").replace(/[^\d]/g, "");
  // Conserver les 8 derniers chiffres pour matcher même si l'indicatif a été saisi différemment
  return digits.length > 8 ? digits.slice(-8) : digits;
}

/**
 * Bouclier Anti-Refus COD : évalue instantanément la fiabilité d'un numéro client
 * à partir de l'historique réel des livraisons et des retours.
 */
export function computeCustomerTrustProfile(
  customerPhone: string,
  allOrders: Order[]
): CustomerTrustProfile {
  const key = normalizePhoneDigits(customerPhone);
  if (!key || key.length < 6) {
    return {
      level: "first_time",
      label: "Nouveau numéro",
      detail: "Aucun historique — Confirmez l'adresse par appel.",
      deliveredCount: 0,
      failedCount: 0,
      totalOrders: 0,
    };
  }

  const matching = allOrders.filter(
    (o) => normalizePhoneDigits(o.customerPhone) === key
  );

  const deliveredCount = matching.filter((o) => o.status === "delivered").length;
  const failedCount = matching.filter(
    (o) => o.status === "returned" || o.status === "delivery_failed"
  ).length;

  if (failedCount > 0 && failedCount >= deliveredCount) {
    return {
      level: "risk",
      label: `Risque refus (${failedCount} échec${failedCount > 1 ? "s" : ""})`,
      detail: `Ce numéro compte ${failedCount} retour(s) ou échec(s) de livraison. Exigez une confirmation vocale ferme avant d'envoyer un livreur.`,
      deliveredCount,
      failedCount,
      totalOrders: matching.length,
    };
  }

  if (deliveredCount > 0) {
    return {
      level: "trusted",
      label: `Client fiable (${deliveredCount} livrée${deliveredCount > 1 ? "s" : ""})`,
      detail: `Acheteur sérieux : ${deliveredCount} commande(s) déjà payée(s) à la livraison${failedCount > 0 ? ` (${failedCount} retour)` : " sans aucun refus"}.`,
      deliveredCount,
      failedCount,
      totalOrders: matching.length,
    };
  }

  return {
    level: "first_time",
    label: "1re commande",
    detail: "Première commande enregistrée avec ce numéro — Appelez pour valider le repère.",
    deliveredCount: 0,
    failedCount: 0,
    totalOrders: matching.length,
  };
}

/**
 * Génère l'URL d'image QR Code scannable vers une cible donnée.
 */
export function buildQrCodeImageUrl(targetUrl: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(
    targetUrl
  )}`;
}
