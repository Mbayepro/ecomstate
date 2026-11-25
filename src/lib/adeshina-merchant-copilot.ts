import {
  canUseModule,
  getModuleLimit,
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABELS,
} from "@/lib/permissions";
import {
  askAdeshinaIA,
  generateProductCopyWithAdeshina,
} from "@/lib/adeshina-ai";
import { formatCurrency } from "@/lib/utils";
import type {
  Category,
  Customer,
  ModulePermission,
  Order,
  Product,
  Store,
} from "@/types/domain";

export interface MerchantDataContext {
  store: Store;
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  modules: ModulePermission[];
}

export interface RankedProductStat {
  product: Product;
  unitsSold: number;
  revenue: number;
}

/**
 * Calcule le classement réel des produits les plus vendus à partir des commandes non annulées.
 * N'invente aucune donnée : si aucune commande n'existe, retourne les produits marqués populaires avec 0 vente.
 */
export function getRealPopularProducts(
  products: Product[],
  orders: Order[]
): RankedProductStat[] {
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const salesMap = new Map<string, { units: number; revenue: number }>();

  for (const ord of validOrders) {
    for (const item of ord.items) {
      const prev = salesMap.get(item.productId) ?? { units: 0, revenue: 0 };
      salesMap.set(item.productId, {
        units: prev.units + item.quantity,
        revenue: prev.revenue + item.totalPrice,
      });
    }
  }

  return products
    .map((product) => {
      const stat = salesMap.get(product.id);
      return {
        product,
        unitsSold: stat?.units ?? 0,
        revenue: stat?.revenue ?? 0,
      };
    })
    .sort((a, b) => {
      if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      return Number(Boolean(b.product.isPopular)) - Number(Boolean(a.product.isPopular));
    });
}

export type CopilotIntent =
  | "analyze_sales"
  | "popular_products"
  | "low_stock"
  | "summarize_orders"
  | "advise_merchant"
  | "free_question";

export interface CopilotResponse {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Moteur collaborateur Adeshina IA pour l'espace commerçant.
 * Toutes les réponses chiffrées proviennent exclusivement des données réelles de la boutique active
 * et respectent les modules/permissions du plan actif.
 */
export function runAdeshinaMerchantCollaborator(
  intent: CopilotIntent,
  ctx: MerchantDataContext,
  freeText?: string
): CopilotResponse {
  const { store, products, categories, orders, customers, modules } = ctx;
  const cur = store.currency;

  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((s, o) => s + o.totalAmount, 0);
  const avgBasket =
    validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  const hasAdvancedAnalytics = canUseModule(
    store.planCode,
    "advanced_analytics",
    modules
  );
  const hasCustomDomain = canUseModule(
    store.planCode,
    "custom_domain",
    modules
  );
  const maxProducts = getModuleLimit(
    store.planCode,
    "products_catalog",
    modules
  );

  // Détection d'intention automatique si question libre
  let resolvedIntent = intent;
  if (intent === "free_question" && freeText) {
    const q = freeText.toLowerCase();
    if (
      q.includes("vente") ||
      q.includes("chiffre") ||
      q.includes("revenu") ||
      q.includes("bilan")
    ) {
      resolvedIntent = "analyze_sales";
    } else if (
      q.includes("populaire") ||
      q.includes("meilleur") ||
      q.includes("top") ||
      q.includes("vendu")
    ) {
      resolvedIntent = "popular_products";
    } else if (
      q.includes("stock") ||
      q.includes("rupture") ||
      q.includes("alerte") ||
      q.includes("inventaire")
    ) {
      resolvedIntent = "low_stock";
    } else if (
      q.includes("commande") ||
      q.includes("attente") ||
      q.includes("livr") ||
      q.includes("statut")
    ) {
      resolvedIntent = "summarize_orders";
    } else if (
      q.includes("conseil") ||
      q.includes("amélior") ||
      q.includes("augmenter") ||
      q.includes("astuce")
    ) {
      resolvedIntent = "advise_merchant";
    }
  }

  switch (resolvedIntent) {
    case "analyze_sales": {
      if (validOrders.length === 0) {
        return {
          title: "Analyse des ventes",
          body: `Votre boutique **${store.name}** n'a pas encore enregistré de vente validée sur cette période.\n• Catalogue actuel : ${products.filter((p) => p.isActive).length} produit(s) actif(s)\n• Conseil immédiat : partagez le lien \`https://${store.subdomain}\` sur votre statut WhatsApp pour générer vos premières commandes.`,
          actionLabel: "Voir mes produits",
          actionHref: "/dashboard/produits",
        };
      }

      // Canal de paiement principal réel
      const byMethod = new Map<string, number>();
      const byCity = new Map<string, number>();
      for (const o of validOrders) {
        byMethod.set(o.paymentMethod, (byMethod.get(o.paymentMethod) ?? 0) + 1);
        byCity.set(o.deliveryCity, (byCity.get(o.deliveryCity) ?? 0) + 1);
      }

      const topMethodEntry = Array.from(byMethod.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0];
      const topCityEntry = Array.from(byCity.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0];

      const methodLabel = topMethodEntry
        ? PAYMENT_METHOD_LABELS[
            topMethodEntry[0] as keyof typeof PAYMENT_METHOD_LABELS
          ]
        : "—";

      const lines = [
        `• Chiffre d'affaires validé : ${formatCurrency(totalRevenue, cur)} (${validOrders.length} commande(s))`,
        `• Panier moyen constaté : ${formatCurrency(avgBasket, cur)}`,
        `• Mode de paiement préféré : ${methodLabel} (${topMethodEntry?.[1] ?? 0} cmd)`,
      ];

      if (hasAdvancedAnalytics && topCityEntry) {
        lines.push(
          `• Ville la plus active (Module Analytics Premium) : ${topCityEntry[0]} (${topCityEntry[1]} cmd) · ${customers.length} client(s) fidélisé(s)`
        );
      }

      return {
        title: "Analyse réelle des ventes",
        body: lines.join("\n"),
        actionLabel: "Ouvrir les commandes",
        actionHref: "/dashboard/commandes",
      };
    }

    case "popular_products": {
      const ranked = getRealPopularProducts(products, orders);
      const soldOnes = ranked.filter((r) => r.unitsSold > 0);

      if (soldOnes.length === 0) {
        const flagged = products.filter((p) => p.isPopular);
        return {
          title: "Produits populaires",
          body:
            flagged.length > 0
              ? `Aucune vente enregistrée sur la période, mais ${flagged.length} article(s) sont mis en avant dans votre vitrine : ${flagged
                  .map((p) => p.name)
                  .join(", ")}.`
              : "Aucun article n'a encore été commandé sur cette période. Cochez « Mettre en avant (populaire) » sur vos meilleurs articles pour les valoriser en boutique.",
          actionLabel: "Gérer le catalogue",
          actionHref: "/dashboard/produits",
        };
      }

      const lines = soldOnes.slice(0, 3).map(
        (item, idx) =>
          `${idx + 1}. ${item.product.name} — ${item.unitsSold} vendu(s) (${formatCurrency(
            item.revenue,
            cur
          )}) · Stock restant : ${item.product.stock}`
      );

      return {
        title: "Top produits vendus",
        body: lines.join("\n"),
        actionLabel: "Voir le catalogue",
        actionHref: "/dashboard/produits",
      };
    }

    case "low_stock": {
      const out = products.filter((p) => p.stock === 0);
      const low = products.filter(
        (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
      );

      if (out.length === 0 && low.length === 0) {
        return {
          title: "État des stocks excellent",
          body: `Tous vos ${products.length} produit(s) sont au-dessus de leur seuil d'alerte (${products.reduce(
            (s, p) => s + p.stock,
            0
          )} unités disponibles au total).`,
          actionLabel: "Vérifier l'inventaire",
          actionHref: "/dashboard/stocks",
        };
      }

      const lines: string[] = [];
      if (out.length > 0) {
        lines.push(
          `• En rupture immédiate (${out.length}) : ${out
            .map((p) => p.name)
            .join(", ")}`
        );
      }
      if (low.length > 0) {
        lines.push(
          `• Stock faible (${low.length}) : ${low
            .map((p) => `${p.name} (${p.stock} rest.)`)
            .join(", ")}`
        );
      }

      return {
        title: "Alertes de stock détectées",
        body: lines.join("\n"),
        actionLabel: "Réapprovisionner maintenant",
        actionHref: "/dashboard/stocks",
      };
    }

    case "summarize_orders": {
      if (orders.length === 0) {
        return {
          title: "Résumé des commandes",
          body: "Aucune commande enregistrée sur la période sélectionnée.",
          actionLabel: "Voir ma vitrine",
          actionHref: `/s/${store.slug}`,
        };
      }

      const waiting = orders.filter(
        (o) => o.status === "new" || o.status === "pending_confirmation"
      );
      const countsByStatus = Object.entries(ORDER_STATUS_META)
        .map(([st, meta]) => {
          const c = orders.filter((o) => o.status === st).length;
          return c > 0 ? `• ${meta.label} : ${c}` : null;
        })
        .filter(Boolean);

      if (waiting.length > 0) {
        countsByStatus.unshift(
          `Priorité : ${waiting.length} commande(s) attendent votre confirmation (${waiting
            .slice(0, 2)
            .map((w) => w.customerName)
            .join(", ")}).`
        );
      }

      return {
        title: `Résumé de vos ${orders.length} commande(s)`,
        body: countsByStatus.join("\n"),
        actionLabel: "Traiter les commandes",
        actionHref: "/dashboard/commandes",
      };
    }

    case "advise_merchant": {
      const tips: string[] = [];
      const promoCount = products.filter((p) => Boolean(p.promoPrice)).length;
      const hiddenCount = products.filter((p) => !p.isActive).length;

      if (promoCount === 0 && products.length > 0) {
        tips.push(
          "• Ajoutez un prix promotionnel sur 1 ou 2 produits phares pour activer le filtre « Promotions » sur votre boutique."
        );
      }
      if (categories.length < 2) {
        tips.push(
          "• Créez au moins 2 ou 3 catégories claires pour faciliter le filtrage sur mobile."
        );
      }
      if (!store.settings.bannerUrl) {
        tips.push(
          "• Ajoutez une image de bannière dans Personnalisation pour renforcer la confiance dès l'arrivée du client."
        );
      }
      if (hiddenCount > 0) {
        tips.push(
          `• Vous avez ${hiddenCount} produit(s) masqué(s) : pensez à les activer s'ils sont disponibles.`
        );
      }
      if (!hasCustomDomain) {
        tips.push(
          "• Votre offre actuelle utilise le sous-domaine gratuit .ecomsate.com. L'offre Premium permet de connecter votre propre domaine (.com, .sn, .bj)."
        );
      } else if (!store.customDomain) {
        tips.push(
          "• Votre formule Premium inclut le domaine personnalisé : pensez à associer votre nom de domaine."
        );
      }
      if (maxProducts !== null) {
        tips.push(
          `• Capacité catalogue : ${products.length} / ${maxProducts} produits utilisés sur votre formule (${store.planCode}).`
        );
      }

      return {
        title: "Conseils personnalisés Adeshina IA",
        body:
          tips.length > 0
            ? tips.join("\n")
            : "• Votre boutique est très bien configurée ! Continuez à partager votre lien sur WhatsApp et Instagram après chaque nouveauté.",
        actionLabel: "Personnaliser ma boutique",
        actionHref: "/dashboard/personnalisation",
      };
    }

    default: {
      const generic = askAdeshinaIA(freeText || "");
      return {
        title: "Réponse Adeshina IA",
        body: generic.answer,
        actionLabel: generic.ctaLabel,
        actionHref: generic.ctaHref,
      };
    }
  }
}

export { generateProductCopyWithAdeshina };
