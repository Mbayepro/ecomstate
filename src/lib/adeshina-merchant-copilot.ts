import {
  canUseModule,
  getModuleLimit,
  ORDER_STATUS_META,
} from "@/lib/permissions";
import {
  askAdeshinaIA,
  generateProductCopyWithAdeshina,
} from "@/lib/adeshina-ai";
import { formatCurrency } from "@/lib/utils";
import type {
  AdCampaign,
  Category,
  Courier,
  Customer,
  ModulePermission,
  Order,
  Product,
  Store,
  StoreExpense,
} from "@/types/domain";

export interface MerchantDataContext {
  store: Store;
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  modules: ModulePermission[];
  couriers?: Courier[];
  expenses?: StoreExpense[];
  adCampaigns?: AdCampaign[];
}

export interface RankedProductStat {
  product: Product;
  unitsSold: number;
  revenue: number;
  netMargin: number;
}

/**
 * Calcule le classement réel des produits les plus vendus et les plus rentables (Section 19.6)
 */
export function getRealPopularProducts(
  products: Product[],
  orders: Order[]
): RankedProductStat[] {
  const validOrders = orders.filter(
    (o) =>
      o.status !== "cancelled" &&
      o.status !== "returned" &&
      o.status !== "delivery_failed"
  );
  const salesMap = new Map<
    string,
    { units: number; revenue: number; cost: number }
  >();

  for (const ord of validOrders) {
    for (const item of ord.items) {
      const prev = salesMap.get(item.productId) ?? {
        units: 0,
        revenue: 0,
        cost: 0,
      };
      const prod = products.find((p) => p.id === item.productId);
      const unitCost =
        item.costPrice ??
        (prod ? (prod.costPrice ?? 0) + (prod.additionalCost ?? 0) : 0);
      salesMap.set(item.productId, {
        units: prev.units + item.quantity,
        revenue: prev.revenue + item.totalPrice,
        cost: prev.cost + unitCost * item.quantity,
      });
    }
  }

  return products
    .map((product) => {
      const stat = salesMap.get(product.id);
      const revenue = stat?.revenue ?? 0;
      const cost = stat?.cost ?? 0;
      return {
        product,
        unitsSold: stat?.units ?? 0,
        revenue,
        netMargin: revenue - cost,
      };
    })
    .sort((a, b) => {
      if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
      if (b.netMargin !== a.netMargin) return b.netMargin - a.netMargin;
      return (
        Number(Boolean(b.product.isPopular)) -
        Number(Boolean(a.product.isPopular))
      );
    });
}

export type CopilotIntent =
  | "analyze_sales"
  | "popular_products"
  | "low_stock"
  | "summarize_orders"
  | "profit_and_couriers"
  | "advise_merchant"
  | "free_question";

export interface CopilotResponse {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Moteur opérationnel Adeshina IA (Section 19) :
 * Répond aux questions commerciales réelles (rentabilité produit, taux de retour, cash livreurs, ROAS, formulaire COD)
 * sans jamais inventer de chiffre ni écraser la boutique sans validation.
 */
export function runAdeshinaMerchantCollaborator(
  intent: CopilotIntent,
  ctx: MerchantDataContext,
  freeText?: string
): CopilotResponse {
  const {
    store,
    products,
    categories,
    orders,
    modules,
    couriers = [],
    expenses = [],
    adCampaigns = [],
  } = ctx;
  const cur = store.currency;

  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const returnedOrders = orders.filter(
    (o) => o.status === "returned" || o.status === "delivery_failed"
  );
  const deliveredRevenue = deliveredOrders.reduce(
    (s, o) => s + o.totalAmount,
    0
  );

  const deliveredCogs = deliveredOrders.reduce((sum, ord) => {
    return (
      sum +
      ord.items.reduce((acc, it) => {
        if (typeof it.costPrice === "number" && it.costPrice > 0) {
          return acc + it.costPrice * it.quantity;
        }
        const p = products.find((pr) => pr.id === it.productId);
        return (
          acc +
          (p ? (p.costPrice ?? 0) + (p.additionalCost ?? 0) : 0) * it.quantity
        );
      }, 0)
    );
  }, 0);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const realNetProfit = deliveredRevenue - deliveredCogs - totalExpenses;

  const maxProducts = getModuleLimit(
    store.planCode,
    "products_catalog",
    modules
  );
  const hasPremiumThemes = canUseModule(
    store.planCode,
    "premium_themes",
    modules
  );

  let resolvedIntent = intent;
  if (intent === "free_question" && freeText) {
    const q = freeText.toLowerCase();
    if (
      q.includes("benefice") ||
      q.includes("bénéfice") ||
      q.includes("profit") ||
      q.includes("marge") ||
      q.includes("rentable") ||
      q.includes("livreur") ||
      q.includes("cash") ||
      q.includes("retour") ||
      q.includes("roas") ||
      q.includes("pub")
    ) {
      resolvedIntent = "profit_and_couriers";
    } else if (
      q.includes("vente") ||
      q.includes("chiffre") ||
      q.includes("revenu")
    ) {
      resolvedIntent = "analyze_sales";
    } else if (
      q.includes("populaire") ||
      q.includes("meilleur") ||
      q.includes("vendu")
    ) {
      resolvedIntent = "popular_products";
    } else if (
      q.includes("stock") ||
      q.includes("rupture") ||
      q.includes("alerte")
    ) {
      resolvedIntent = "low_stock";
    } else if (
      q.includes("commande") ||
      q.includes("attente") ||
      q.includes("statut")
    ) {
      resolvedIntent = "summarize_orders";
    } else if (
      q.includes("formulaire") ||
      q.includes("cod") ||
      q.includes("conseil") ||
      q.includes("amélior")
    ) {
      resolvedIntent = "advise_merchant";
    }
  }

  switch (resolvedIntent) {
    case "profit_and_couriers": {
      const cashWithCouriers = deliveredOrders
        .filter((o) => o.codFinancialStatus === "collected_by_courier")
        .reduce((s, o) => s + o.totalAmount, 0);
      const totalAdSpent = adCampaigns.reduce((s, c) => s + c.spent, 0);
      const roas =
        totalAdSpent > 0 ? (deliveredRevenue / totalAdSpent).toFixed(2) : null;

      const ranked = getRealPopularProducts(products, deliveredOrders);
      const mostProfitable = ranked.find((r) => r.unitsSold > 0);

      const lines = [
        `• **CA réellement livré** : ${formatCurrency(deliveredRevenue, cur)} (${deliveredOrders.length} cmd livrée(s))`,
        `• **Coût produits vendus** : ${formatCurrency(deliveredCogs, cur)} · **Dépenses** : ${formatCurrency(totalExpenses, cur)}`,
        `• **Bénéfice net réel estimé** : **${formatCurrency(realNetProfit, cur)}**`,
        `• **Cash à récupérer chez vos livreurs** : ${formatCurrency(cashWithCouriers, cur)} (${couriers.length} livreur(s) actif(s))`,
        `• **Retours / Échecs de livraison** : ${returnedOrders.length} commande(s)`,
      ];

      if (mostProfitable) {
        lines.push(
          `• **Produit le plus rentable** : ${mostProfitable.product.name} (+${formatCurrency(mostProfitable.netMargin, cur)} de marge brute)`
        );
      }
      if (roas) {
        lines.push(`• **ROAS publicitaire sur ventes livrées** : ${roas}x`);
      }

      return {
        title: "Diagnostic Bénéfice Réel, Livreurs COD & ROAS",
        body: lines.join("\n"),
        actionLabel: "Ouvrir Finances & Profit",
        actionHref: "/dashboard/finances",
      };
    }

    case "analyze_sales": {
      if (orders.length === 0) {
        return {
          title: "Analyse des ventes COD",
          body: `Votre boutique **${store.name}** n'a pas encore reçu de commande.\n• Produits actifs : ${products.filter((p) => p.isActive).length}\n• Vérifiez votre **Form Builder COD** et partagez le lien \`https://${store.subdomain}\`.`,
          actionLabel: "Ouvrir le Form Builder COD",
          actionHref: "/dashboard/form-builder",
        };
      }

      const avgDelivered =
        deliveredOrders.length > 0
          ? Math.round(deliveredRevenue / deliveredOrders.length)
          : 0;

      return {
        title: "Analyse réelle des ventes & livraisons",
        body: [
          `• **Commandes reçues au total** : ${orders.length}`,
          `• **Revenu acquis (Commandes livrées)** : ${formatCurrency(deliveredRevenue, cur)} (${deliveredOrders.length} livrée(s))`,
          `• **Panier moyen livré** : ${formatCurrency(avgDelivered, cur)}`,
          `• **Bénéfice net estimé** : ${formatCurrency(realNetProfit, cur)}`,
        ].join("\n"),
        actionLabel: "Gérer les commandes",
        actionHref: "/dashboard/commandes",
      };
    }

    case "popular_products": {
      const ranked = getRealPopularProducts(products, orders);
      const soldOnes = ranked.filter((r) => r.unitsSold > 0);

      if (soldOnes.length === 0) {
        return {
          title: "Classement produits & marges",
          body: "Aucune vente enregistrée pour le moment. Renseignez bien le **prix d'achat** sur chaque fiche produit pour suivre vos futures marges.",
          actionLabel: "Gérer mes produits",
          actionHref: "/dashboard/produits",
        };
      }

      const lines = soldOnes.slice(0, 4).map(
        (item, idx) =>
          `${idx + 1}. **${item.product.name}** — ${item.unitsSold} vendu(s) · CA ${formatCurrency(
            item.revenue,
            cur
          )} · Marge brute : **${formatCurrency(item.netMargin, cur)}**`
      );

      return {
        title: "Produits les plus vendus & rentabilité",
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
          title: "Stocks sains",
          body: `Aucun produit en rupture sur vos ${products.length} article(s) (${products.reduce(
            (s, p) => s + p.stock,
            0
          )} unités disponibles).`,
          actionLabel: "Voir les mouvements",
          actionHref: "/dashboard/stocks",
        };
      }

      const lines: string[] = [];
      if (out.length > 0) {
        lines.push(
          `• **Rupture immédiate (${out.length})** : ${out
            .map((p) => p.name)
            .join(", ")}`
        );
      }
      if (low.length > 0) {
        lines.push(
          `• **Seuil critique (${low.length})** : ${low
            .map((p) => `${p.name} (${p.stock} rest.)`)
            .join(", ")}`
        );
      }

      return {
        title: "Alertes d'inventaire détectées",
        body: lines.join("\n"),
        actionLabel: "Réapprovisionner",
        actionHref: "/dashboard/stocks",
      };
    }

    case "summarize_orders": {
      if (orders.length === 0) {
        return {
          title: "Suivi des 11 statuts COD",
          body: "Aucune commande enregistrée.",
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
          return c > 0 ? `• ${meta.label} : **${c}**` : null;
        })
        .filter(Boolean);

      if (waiting.length > 0) {
        countsByStatus.unshift(
          `Priorité immédiate : **${waiting.length} commande(s)** à confirmer par appel.`
        );
      }

      return {
        title: `État de vos ${orders.length} commande(s) COD`,
        body: countsByStatus.join("\n"),
        actionLabel: "Traiter les commandes",
        actionHref: "/dashboard/commandes",
      };
    }

    case "advise_merchant": {
      const tips: string[] = [];
      const withoutCost = products.filter((p) => !p.costPrice).length;
      if (withoutCost > 0) {
        tips.push(
          `• Renseignez le **prix d'achat** sur vos ${withoutCost} produit(s) sans coût pour fiabiliser votre bénéfice net réel.`
        );
      }
      tips.push(
        "• Dans le **Form Builder COD**, activez les Offres Packs (1x, Duo -5%, Trio -10%) pour augmenter votre panier moyen."
      );
      if (!hasPremiumThemes) {
        tips.push(
          "• Votre plan Standard utilise le thème **Shrine Pro 1**. Le plan Premium débloque **Shrine Pro 3 Ultra-Conversion**, le multi-boutiques et le suivi ROAS."
        );
      }
      if (maxProducts !== null) {
        tips.push(
          `• Quota catalogue : ${products.length} / ${maxProducts} produits utilisés.`
        );
      }

      return {
        title: "Recommandations d'optimisation COD",
        body: tips.join("\n"),
        actionLabel: "Optimiser mon Form Builder COD",
        actionHref: "/dashboard/form-builder",
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
