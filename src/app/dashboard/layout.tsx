"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  Calculator,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  FolderTree,
  FormInput,
  Globe,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  Users,
  X,
} from "lucide-react";
import { BrandLogo, BrandLogoMark } from "@/components/ui/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdeshinaCollaboratorDrawer } from "@/components/dashboard/adeshina-drawer";
import { usePlatform } from "@/lib/platform-store";
import {
  canTeamRoleAccessPath,
  getStoreSubscriptionHealth,
  TEAM_ROLE_LABELS,
} from "@/lib/permissions";
import { cn, formatCurrency } from "@/lib/utils";

interface NavGroup {
  title: string;
  collapsible?: boolean;
  items: {
    href: string;
    label: string;
    hint: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeType?: "orders" | "stock";
  }[];
}

const PAGE_UTILITY_GUIDE: Record<
  string,
  { title: string; utility: string }
> = {
  "/dashboard": {
    title: "Accueil de votre boutique",
    utility:
      "Voyez en un coup d'œil vos commandes à confirmer aujourd'hui, vos ventes réellement livrées et votre bénéfice net.",
  },
  "/dashboard/commandes": {
    title: "Commandes clients",
    utility:
      "Appelez vos clients pour confirmer leurs commandes, assignez un livreur et imprimez le bon de livraison COD.",
  },
  "/dashboard/produits": {
    title: "Catalogue produits",
    utility:
      "Ajoutez vos articles avec leur prix de vente et leur coût d'achat pour calculer automatiquement votre marge.",
  },
  "/dashboard/clients": {
    title: "Fichier clients",
    utility:
      "Retrouvez tous vos acheteurs, repérez vos clients fidèles et identifiez ceux qui refusent souvent les livraisons.",
  },
  "/dashboard/livreurs": {
    title: "Livreurs & Cash COD",
    utility:
      "Suivez combien d'argent liquide chaque livreur détient sur le terrain et enregistrez ses versements à votre caisse.",
  },
  "/dashboard/finances": {
    title: "Mes bénéfices & Dépenses",
    utility:
      "Connaissez votre vrai gain net (uniquement sur les commandes livrées) après déduction du coût produits et de vos dépenses.",
  },
  "/dashboard/store-builder": {
    title: "Apparence de ma boutique",
    utility:
      "Choisissez votre thème (Shrine Pro) et personnalisez les sections de la vitrine que voient vos clients.",
  },
  "/dashboard/form-builder": {
    title: "Formulaire de commande COD",
    utility:
      "Choisissez les champs demandés au client (téléphone, ville, quartier) et activez des offres packs (1x, Duo, Trio).",
  },
  "/dashboard/personnalisation": {
    title: "Paramètres & Frais de livraison",
    utility:
      "Modifiez le nom de votre boutique, la devise, les frais de livraison et le message affiché après une commande.",
  },
  "/dashboard/adeshina-ia": {
    title: "Assistant Adeshina IA",
    utility:
      "Posez une question simple sur vos chiffres, générez une fiche produit en 1 clic ou adaptez votre formulaire COD.",
  },
  "/dashboard/stocks": {
    title: "Suivi des stocks",
    utility:
      "Repérez immédiatement les produits bientôt épuisés et ajoutez du stock en un clic.",
  },
  "/dashboard/categories": {
    title: "Catégories de produits",
    utility:
      "Classez vos articles par rayons (ex : Soins, Chaussures, Montres) pour aider vos clients à trouver ce qu'ils cherchent.",
  },
  "/dashboard/promotions": {
    title: "Codes promo",
    utility:
      "Créez des codes de réduction (en % ou en FCFA) pour encourager vos clients à commander.",
  },
  "/dashboard/croissance": {
    title: "Publicités & Automatisations",
    utility:
      "Mesurez la rentabilité de vos publicités Facebook/TikTok et activez des règles automatiques sur vos commandes.",
  },
  "/dashboard/statistiques": {
    title: "Statistiques détaillées",
    utility:
      "Analysez vos meilleures villes de livraison et l'évolution détaillée de votre activité.",
  },
  "/dashboard/equipe": {
    title: "Équipe & Multi-boutiques",
    utility:
      "Donnez un accès adapté à vos confirmateurs ou livreurs, et gérez plusieurs boutiques depuis un seul compte.",
  },
  "/dashboard/marketing": {
    title: "Partage & QR Code",
    utility:
      "Copiez le lien de votre boutique ou téléchargez son QR Code pour vos publications WhatsApp, TikTok et Facebook.",
  },
  "/dashboard/domaine": {
    title: "Nom de domaine",
    utility:
      "Personnalisez l'adresse web de votre boutique ou connectez votre propre nom de domaine (.com, .sn, .ci...).",
  },
  "/dashboard/abonnement": {
    title: "Mon abonnement",
    utility:
      "Consultez votre formule actuelle (Standard ou Premium) et vos avantages débloqués.",
  },
  "/dashboard/support": {
    title: "Support, Guide & Tickets",
    utility:
      "Consultez le guide de démarrage rapide ou ouvrez un ticket d'assistance auprès de l'équipe EcomSate.",
  },
  "/dashboard/parametres": {
    title: "Mon compte",
    utility:
      "Consultez et mettez à jour les informations générales de votre compte commerçant.",
  },
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Mon activité",
    items: [
      {
        href: "/dashboard",
        label: "Accueil",
        hint: "Résumé du jour",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/commandes",
        label: "Commandes",
        hint: "Confirmer & livrer",
        icon: ShoppingBag,
        badgeType: "orders",
      },
      {
        href: "/dashboard/produits",
        label: "Produits",
        hint: "Prix & catalogue",
        icon: Package,
      },
      {
        href: "/dashboard/livreurs",
        label: "Livreurs",
        hint: "Argent COD encaissé",
        icon: Truck,
      },
      {
        href: "/dashboard/finances",
        label: "Mes bénéfices",
        hint: "Gain net & dépenses",
        icon: Calculator,
      },
      {
        href: "/dashboard/clients",
        label: "Clients",
        hint: "Acheteurs & retours",
        icon: Users,
      },
    ],
  },
  {
    title: "Ma boutique",
    items: [
      {
        href: "/dashboard/store-builder",
        label: "Apparence",
        hint: "Thème Shrine & design",
        icon: Layers,
      },
      {
        href: "/dashboard/form-builder",
        label: "Formulaire COD",
        hint: "Champs & offres packs",
        icon: FormInput,
      },
      {
        href: "/dashboard/personnalisation",
        label: "Paramètres boutique",
        hint: "Frais & coordonnées",
        icon: Palette,
      },
    ],
  },
  {
    title: "Plus d'outils",
    collapsible: true,
    items: [
      {
        href: "/dashboard/adeshina-ia",
        label: "Adeshina IA",
        hint: "Assistant & conseils",
        icon: Sparkles,
      },
      {
        href: "/dashboard/stocks",
        label: "Stocks",
        hint: "Ruptures & alertes",
        icon: Boxes,
        badgeType: "stock",
      },
      {
        href: "/dashboard/categories",
        label: "Catégories",
        hint: "Rayons produits",
        icon: FolderTree,
      },
      {
        href: "/dashboard/promotions",
        label: "Codes promo",
        hint: "Remises clients",
        icon: Tag,
      },
      {
        href: "/dashboard/croissance",
        label: "Pubs & Automatisations",
        hint: "ROAS & règles auto",
        icon: Megaphone,
      },
      {
        href: "/dashboard/statistiques",
        label: "Statistiques",
        hint: "Villes & tendances",
        icon: BarChart3,
      },
      {
        href: "/dashboard/equipe",
        label: "Équipe & boutiques",
        hint: "Rôles & multi-boutique",
        icon: Users,
      },
      {
        href: "/dashboard/marketing",
        label: "Partage & QR code",
        hint: "Lien réseaux sociaux",
        icon: QrCode,
      },
      {
        href: "/dashboard/domaine",
        label: "Nom de domaine",
        hint: "Adresse web .com",
        icon: Globe,
      },
      {
        href: "/dashboard/abonnement",
        label: "Mon abonnement",
        hint: "Standard ou Premium",
        icon: CreditCard,
      },
      {
        href: "/dashboard/support",
        label: "Aide & Support",
        hint: "Guide & tickets",
        icon: LifeBuoy,
      },
    ],
  },
];

const MOBILE_BOTTOM_TABS = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/dashboard/commandes", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/produits", label: "Produits", icon: Package },
  { href: "/dashboard/finances", label: "Bénéfices", icon: Calculator },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const {
    activeStore,
    stores,
    orders,
    products,
    customers,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    switchActiveStore,
    switchActiveTeamRole,
    logout,
    session,
  } = usePlatform();

  const activeTeamRole = session?.teamRole ?? "owner";
  const hasRouteAccess = canTeamRoleAccessPath(activeTeamRole, pathname);

  const pendingOrdersCount = useMemo(() => {
    if (!activeStore) return 0;
    return orders.filter(
      (o) =>
        o.storeId === activeStore.id &&
        (o.status === "new" || o.status === "pending_confirmation")
    ).length;
  }, [orders, activeStore]);

  const stockAlertsCount = useMemo(() => {
    if (!activeStore) return 0;
    return products.filter(
      (p) => p.storeId === activeStore.id && p.stock <= p.lowStockThreshold
    ).length;
  }, [products, activeStore]);

  const searchResults = useMemo(() => {
    if (!activeStore || !quickQuery.trim()) return null;
    const q = quickQuery.toLowerCase();
    const matchedOrders = orders
      .filter(
        (o) =>
          o.storeId === activeStore.id &&
          (o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q))
      )
      .slice(0, 3);
    const matchedProducts = products
      .filter(
        (p) =>
          p.storeId === activeStore.id && p.name.toLowerCase().includes(q)
      )
      .slice(0, 3);
    const matchedCustomers = customers
      .filter(
        (c) =>
          c.storeId === activeStore.id &&
          (c.fullName.toLowerCase().includes(q) || c.phone.includes(q))
      )
      .slice(0, 2);

    return { matchedOrders, matchedProducts, matchedCustomers };
  }, [activeStore, quickQuery, orders, products, customers]);

  if (!activeStore) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <BrandLogo />
        <h1 className="mt-6 text-2xl font-bold text-[#15232D]">
          Connectez-vous à votre espace commerçant
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Vous devez être connecté pour accéder à votre centre de contrôle.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/connexion">
            <Button variant="primary">Connexion</Button>
          </Link>
          <Link href="/creer-une-boutique">
            <Button variant="outline">Créer une boutique</Button>
          </Link>
        </div>
      </div>
    );
  }

  const copyStoreUrl = () => {
    const url = `${window.location.origin}/s/${activeStore.slug}`;
    navigator.clipboard?.writeText(url).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDemoStore =
    activeStore.id === "store-atelier-dakar" ||
    activeStore.id === "store-cotonou-tech";

  const subHealth = getStoreSubscriptionHealth(activeStore);
  const storeNotifications = (notifications ?? []).filter(
    (n) => n.recipientRole === "merchant" && n.storeId === activeStore.id
  );
  const unreadNotifCount = storeNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#15232D]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#15232D]/45 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR OFFICIELLE ECOMSATE */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#E2E8F0] bg-white transition-all duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          collapsed ? "lg:w-18" : "w-66 lg:w-62",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-15 shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4">
          {!collapsed && <BrandLogo href="/" />}
          {collapsed && (
            <Link
              href="/dashboard"
              className="mx-auto flex items-center justify-center"
              title="EcomSate"
            >
              <BrandLogoMark className="h-9 w-10" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#15232D] lg:inline-flex cursor-pointer"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sélecteur Multi-boutiques */}
        {!collapsed && (
          <div className="border-b border-[#E2E8F0] p-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                  style={{
                    backgroundColor:
                      activeStore.settings.primaryColor || "#073B35",
                  }}
                >
                  {activeStore.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#15232D]">
                    {activeStore.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    Plan {activeStore.planCode}
                  </p>
                </div>
              </div>

              <select
                value={activeStore.id}
                onChange={(e) => switchActiveStore(e.target.value)}
                aria-label="Boutique active"
                className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] font-semibold text-[#15232D] focus:border-[#00A884] focus:outline-none cursor-pointer"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.countryCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3.5">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((it) =>
              canTeamRoleAccessPath(activeTeamRole, it.href)
            );
            if (visibleItems.length === 0) return null;
            const groupHasActive = visibleItems.some((it) =>
              pathname.startsWith(it.href)
            );
            const expanded =
              !group.collapsible || moreOpen || groupHasActive || collapsed;
            return (
              <div key={group.title}>
                {!collapsed &&
                  (group.collapsible ? (
                    <button
                      type="button"
                      onClick={() => setMoreOpen((v) => !v)}
                      className="mb-1 flex w-full items-center justify-between rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#073B35] cursor-pointer"
                    >
                      <span>{group.title}</span>
                      <span>{expanded ? "−" : "+"}</span>
                    </button>
                  ) : (
                    <p className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {group.title}
                    </p>
                  ))}
                {expanded && (
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const active =
                        item.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : pathname.startsWith(item.href);

                      const badgeCount =
                        item.badgeType === "orders"
                          ? pendingOrdersCount
                          : item.badgeType === "stock"
                            ? stockAlertsCount
                            : 0;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-[13px] font-semibold transition-colors",
                            active
                              ? "bg-[#073B35] text-white shadow-2xs"
                              : "text-slate-600 hover:bg-[#E7F7F2]/60 hover:text-[#073B35]",
                            collapsed && "justify-center px-0"
                          )}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon
                              className={cn(
                                "h-4.5 w-4.5 shrink-0",
                                active
                                  ? "text-[#00A884]"
                                  : "text-slate-400 group-hover:text-[#00A884]"
                              )}
                            />
                            {!collapsed && (
                              <span className="flex flex-col leading-tight">
                                <span>{item.label}</span>
                                <span
                                  className={cn(
                                    "text-[10px] font-normal",
                                    active
                                      ? "text-[#E7F7F2]/80"
                                      : "text-slate-400"
                                  )}
                                >
                                  {item.hint}
                                </span>
                              </span>
                            )}
                          </span>

                          {!collapsed && badgeCount > 0 && (
                            <span
                              className={cn(
                                "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                                active
                                  ? "bg-[#00A884] text-white"
                                  : item.badgeType === "stock"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-[#E7F7F2] text-[#073B35]"
                              )}
                            >
                              {badgeCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="space-y-1.5 border-t border-[#E2E8F0] p-3">
          {!collapsed && (
            <div className="flex items-center justify-between px-2 pb-1 text-[11px] text-slate-500">
              <span>Formule {activeStore.planCode}</span>
              {isDemoStore && <Badge variant="success">Démo</Badge>}
            </div>
          )}

          <Link
            href={`/s/${activeStore.slug}`}
            target="_blank"
            className={cn(
              "flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#15232D] hover:border-[#00A884]/40 hover:bg-white",
              collapsed && "justify-center px-0"
            )}
          >
            {!collapsed && <span>Voir ma vitrine COD</span>}
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </Link>

          {!collapsed && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-[#15232D]"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/connexion");
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Quitter ({session?.fullName.split(" ")[0] ?? "Compte"})
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ZONE PRINCIPALE */}
      <div className="flex min-w-0 flex-1 flex-col pb-18 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-15 items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#15232D] hover:bg-slate-50 lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                placeholder="Rechercher commande, produit, client..."
                className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 text-xs text-[#15232D] placeholder:text-slate-400 focus:border-[#00A884] focus:bg-white focus:outline-none"
              />

              {searchFocused && searchResults && (
                <div className="absolute left-0 right-0 top-11 z-50 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-xl">
                  {searchResults.matchedOrders.length === 0 &&
                    searchResults.matchedProducts.length === 0 &&
                    searchResults.matchedCustomers.length === 0 ? (
                    <p className="py-3 text-center text-xs text-slate-500">
                      Aucun résultat dans {activeStore.name}
                    </p>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {searchResults.matchedOrders.length > 0 && (
                        <div>
                          <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                            Commandes
                          </p>
                          {searchResults.matchedOrders.map((o) => (
                            <Link
                              key={o.id}
                              href="/dashboard/commandes"
                              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-[#F8FAFC]"
                            >
                              <span className="font-semibold text-[#15232D]">
                                {o.orderNumber} · {o.customerName}
                              </span>
                              <span className="font-bold text-[#00A884]">
                                {formatCurrency(
                                  o.totalAmount,
                                  activeStore.currency
                                )}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {searchResults.matchedProducts.length > 0 && (
                        <div>
                          <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">
                            Produits
                          </p>
                          {searchResults.matchedProducts.map((p) => (
                            <Link
                              key={p.id}
                              href="/dashboard/produits"
                              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-[#F8FAFC]"
                            >
                              <span className="truncate font-semibold text-[#15232D]">
                                {p.name}
                              </span>
                              <span className="text-slate-500">
                                Stock: {p.stock}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyStoreUrl}
              className="hidden items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#15232D] hover:bg-white md:inline-flex cursor-pointer"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#00A884]" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>{copied ? "Copié !" : "Lien boutique"}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#15232D] hover:bg-[#F8FAFC] cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00A884] px-1 text-[10px] font-bold text-white">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <span className="text-xs font-extrabold text-[#15232D]">
                      Notifications ({storeNotifications.length})
                    </span>
                    {unreadNotifCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          markAllNotificationsRead(activeStore.id, "merchant")
                        }
                        className="text-[11px] font-semibold text-[#00A884] hover:underline cursor-pointer"
                      >
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  <div className="mt-2 max-h-64 divide-y divide-[#E2E8F0] overflow-y-auto">
                    {storeNotifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">
                        Aucune notification.
                      </p>
                    ) : (
                      storeNotifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`py-2.5 text-xs cursor-pointer ${n.isRead ? "opacity-65" : "font-medium"
                            }`}
                        >
                          <p className="font-bold text-[#15232D]">{n.title}</p>
                          <p className="mt-0.5 text-slate-600">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCopilotOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#00A884]/40 bg-[#E7F7F2] px-3 py-1.5 text-xs font-bold text-[#073B35] hover:bg-[#00A884] hover:text-white cursor-pointer"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Adeshina IA</span>
            </button>

            <Link href="/dashboard/produits">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Produit</span>
              </Button>
            </Link>
          </div>
        </header>

        {subHealth.isExpired ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-800">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
              <span>
                <strong>Abonnement expiré ou boutique suspendue :</strong>{" "}
                renouvelez votre formule pour réactiver votre boutique.
              </span>
            </div>
            <Link
              href="/dashboard/abonnement"
              className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-bold text-white"
            >
              Renouveler
            </Link>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div key={pathname} className="animate-page-enter space-y-5">
            {hasRouteAccess && PAGE_UTILITY_GUIDE[pathname] && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#00A884]/30 bg-[#E7F7F2]/60 px-4 py-3 text-xs text-[#073B35]">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex shrink-0 items-center rounded-lg bg-[#073B35] px-2.5 py-1 text-[11px] font-extrabold text-white">
                    À quoi sert cette page ?
                  </span>
                  <p className="font-semibold text-[#15232D]">
                    {PAGE_UTILITY_GUIDE[pathname].utility}
                  </p>
                </div>
              </div>
            )}
            {hasRouteAccess ? (
              children
            ) : (
              <div className="mx-auto max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-xs">
                <ShieldCheck className="mx-auto h-10 w-10 text-[#00A884]" />
                <h2 className="mt-3 text-lg font-extrabold text-[#15232D]">
                  Accès restreint pour le rôle « {TEAM_ROLE_LABELS[activeTeamRole]} »
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Ce module est réservé au Propriétaire ou aux rôles disposant
                  de cette permission dans la boutique.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Retour à l&apos;accueil
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => switchActiveTeamRole("owner")}
                  >
                    Revenir au rôle Propriétaire
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Navigation mobile fixe en bas */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-[#E2E8F0] bg-white/95 px-1 backdrop-blur-md lg:hidden">
        {MOBILE_BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          const count =
            tab.href === "/dashboard/commandes" ? pendingOrdersCount : 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold",
                active ? "text-[#073B35]" : "text-slate-400"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-[#00A884]")} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00A884] px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-[#00A884] cursor-pointer"
        >
          <Sparkles className="h-5 w-5" />
          <span>IA</span>
        </button>
      </nav>

      <AdeshinaCollaboratorDrawer
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </div>
  );
}
