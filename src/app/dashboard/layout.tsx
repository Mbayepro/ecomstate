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
  Check,
  Copy,
  CreditCard,
  ExternalLink,

  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,

  X,
} from "lucide-react";
import { BrandLogo, BrandLogoMark } from "@/components/ui/brand-logo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdeshinaCollaboratorDrawer } from "@/components/dashboard/adeshina-drawer";
import { usePlatform } from "@/lib/platform-store";
import { getStoreSubscriptionHealth } from "@/lib/permissions";
import { cn, formatCurrency } from "@/lib/utils";


interface NavGroup {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeType?: "orders" | "stock";
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Activité",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      {
        href: "/dashboard/commandes",
        label: "Commandes",
        icon: ShoppingBag,
        badgeType: "orders",
      },
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      {
        href: "/dashboard/statistiques",
        label: "Statistiques",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/dashboard/produits", label: "Produits", icon: Package },
      { href: "/dashboard/categories", label: "Catégories", icon: FolderTree },
      {
        href: "/dashboard/stocks",
        label: "Stocks",
        icon: Boxes,
        badgeType: "stock",
      },
      {
        href: "/dashboard/promotions",
        label: "Codes Promo",
        icon: Tag,
      },
    ],
  },

  {
    title: "Boutique & IA",
    items: [
      {
        href: "/dashboard/personnalisation",
        label: "Personnalisation",
        icon: Palette,
      },
      {
        href: "/dashboard/adeshina-ia",
        label: "Adeshina IA",
        icon: Sparkles,
      },
      {
        href: "/dashboard/abonnement",
        label: "Abonnement & Mobile Money",
        icon: CreditCard,
      },
    ],
  },

];

const MOBILE_BOTTOM_TABS = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/dashboard/commandes", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/produits", label: "Produits", icon: Package },
  { href: "/dashboard/stocks", label: "Stocks", icon: Boxes },
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
    logout,
    session,
  } = usePlatform();


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

  // Recherche rapide globale isolée à la boutique active
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
        <h1 className="mt-6 text-2xl font-bold text-[#102A43]">
          Connectez-vous à votre espace commerçant
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Vous devez être connecté pour accéder à votre tableau de bord.
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
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsapp = () => {
    const url = `${window.location.origin}/s/${activeStore.slug}`;
    const text = `Découvrez notre boutique en ligne ${activeStore.name} et commandez facilement : ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
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
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div
          className="animate-backdrop fixed inset-0 z-40 bg-[#102A43]/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR LUMINEUSE, ÉLÉGANTE ET COMPACTE */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#E2E8F0] bg-white transition-all duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          collapsed ? "lg:w-18" : "w-64 lg:w-60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo & bouton réduction */}
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
            className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#102A43] lg:inline-flex cursor-pointer"
            title={collapsed ? "Déplier le menu" : "Réduire le menu"}
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
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sélecteur de boutique compact */}
        {!collapsed && (
          <div className="border-b border-[#E2E8F0] p-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                  style={{
                    backgroundColor:
                      activeStore.settings.primaryColor || "#102A43",
                  }}
                >
                  {activeStore.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#102A43]">
                    {activeStore.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {activeStore.customDomain || activeStore.subdomain}
                  </p>
                </div>
              </div>

              <select
                value={activeStore.id}
                onChange={(e) => switchActiveStore(e.target.value)}
                aria-label="Boutique active"
                className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] font-semibold text-[#102A43] focus:border-[#102A43] focus:outline-none cursor-pointer"
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

        {/* Liens de navigation épurés */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3.5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
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
                          ? "bg-[#102A43] text-white shadow-2xs"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-[#102A43]",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "h-4.5 w-4.5 shrink-0",
                            active
                              ? "text-[#10B981]"
                              : "text-slate-400 group-hover:text-[#102A43]"
                          )}
                        />
                        {!collapsed && <span>{item.label}</span>}
                      </span>

                      {!collapsed && badgeCount > 0 && (
                        <span
                          className={cn(
                            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                            active
                              ? "bg-[#10B981] text-white"
                              : item.badgeType === "stock"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#10B981]/15 text-[#10B981]"
                          )}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Accès direct Collaborateur Adeshina IA */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                setCopilotOpen(true);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border border-[#10B981]/30 bg-[#10B981]/[0.07] px-3 py-2.5 text-left text-xs font-bold text-[#102A43] transition-colors hover:bg-[#10B981]/15 cursor-pointer",
                collapsed && "justify-center px-0"
              )}
              title="Collaborateur Adeshina IA"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-[#10B981]" />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate">Adeshina IA</p>
                  <p className="truncate text-[10px] font-normal text-slate-500">
                    Analyser & conseiller
                  </p>
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* Pied de sidebar */}
        <div className="space-y-1.5 border-t border-[#E2E8F0] p-3">
          {!collapsed && (
            <div className="flex items-center justify-between px-2 pb-1 text-[11px] text-slate-500">
              <span>Formule {activeStore.planCode}</span>
              {isDemoStore && <Badge variant="info">Démo</Badge>}
            </div>
          )}

          <Link
            href={`/s/${activeStore.slug}`}
            target="_blank"
            title="Voir ma boutique publique"
            className={cn(
              "flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#102A43] transition-colors hover:border-[#102A43]/30 hover:bg-white",
              collapsed && "justify-center px-0"
            )}
          >
            {!collapsed && <span>Voir ma boutique</span>}
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </Link>

          {!collapsed && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-[#102A43]"
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

      {/* ZONE PRINCIPALE LUMINEUSE */}
      <div className="flex min-w-0 flex-1 flex-col pb-18 lg:pb-0">
        {/* Topbar avec recherche rapide globale & actions 1-clic */}
        <header className="sticky top-0 z-30 flex h-15 items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#102A43] hover:bg-slate-50 lg:hidden cursor-pointer"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Barre de recherche rapide multi-entités */}
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                placeholder="Rechercher commande, produit, client..."
                className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 text-xs text-[#1E293B] placeholder:text-slate-400 transition-colors focus:border-[#102A43] focus:bg-white focus:outline-none"
              />

              {searchFocused && searchResults && (
                <div className="animate-modal-in absolute left-0 right-0 top-11 z-50 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-xl">
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
                          <p className="mb-1 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                            Commandes
                          </p>
                          {searchResults.matchedOrders.map((o) => (
                            <Link
                              key={o.id}
                              href="/dashboard/commandes"
                              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-[#F8FAFC]"
                            >
                              <span className="font-semibold text-[#102A43]">
                                {o.orderNumber} · {o.customerName}
                              </span>
                              <span className="font-bold text-[#10B981]">
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
                          <p className="mb-1 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                            Produits
                          </p>
                          {searchResults.matchedProducts.map((p) => (
                            <Link
                              key={p.id}
                              href="/dashboard/produits"
                              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-[#F8FAFC]"
                            >
                              <span className="truncate font-semibold text-[#102A43]">
                                {p.name}
                              </span>
                              <span className="text-slate-500">
                                Stock: {p.stock}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.matchedCustomers.length > 0 && (
                        <div>
                          <p className="mb-1 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                            Clients
                          </p>
                          {searchResults.matchedCustomers.map((c) => (
                            <Link
                              key={c.id}
                              href="/dashboard/clients"
                              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-[#F8FAFC]"
                            >
                              <span className="font-semibold text-[#102A43]">
                                {c.fullName}
                              </span>
                              <span className="text-slate-500">{c.phone}</span>
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

          {/* Actions rapides à portée de main (esprit Shafrik) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyStoreUrl}
              className="hidden items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#102A43] transition-colors hover:bg-white md:inline-flex cursor-pointer"
              title="Copier le lien de ma boutique"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>{copied ? "Copié !" : "Lien boutique"}</span>
            </button>

            <button
              type="button"
              onClick={shareOnWhatsapp}
              className="hidden items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#102A43] transition-colors hover:border-[#10B981] lg:inline-flex cursor-pointer"
              title="Partager ma boutique sur WhatsApp"
            >
              <Share2 className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Partager</span>
            </button>

            {/* Cloche de notifications commerçant */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#102A43] transition-colors hover:bg-[#F8FAFC] cursor-pointer"
                title="Notifications de la boutique"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#10B981] px-1 text-[10px] font-bold text-white">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="animate-modal-in absolute right-0 top-11 z-50 w-80 rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <span className="text-xs font-extrabold text-[#102A43]">
                      Notifications ({storeNotifications.length})
                    </span>
                    {unreadNotifCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          markAllNotificationsRead(activeStore.id, "merchant")
                        }
                        className="text-[11px] font-semibold text-[#10B981] hover:underline cursor-pointer"
                      >
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  <div className="mt-2 max-h-64 divide-y divide-[#E2E8F0] overflow-y-auto">
                    {storeNotifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">
                        Aucune notification pour le moment.
                      </p>
                    ) : (
                      storeNotifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`py-2.5 text-xs cursor-pointer ${
                            n.isRead ? "opacity-65" : "font-medium"
                          }`}
                        >
                          <p className="font-bold text-[#102A43]">{n.title}</p>
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#10B981]/35 bg-[#10B981]/10 px-3 py-1.5 text-xs font-bold text-[#102A43] transition-colors hover:bg-[#10B981] hover:text-white cursor-pointer"
            >
              <Bot className="h-4 w-4 text-[#10B981] group-hover:text-white" />
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

        {/* Alerte compte suspendu ou abonnement expiré / bientôt expiré */}
        {subHealth.isExpired ? (
          <div className="animate-page-enter flex flex-wrap items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-800">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
              <span>
                <strong>Abonnement expiré ou boutique suspendue :</strong>{" "}
                renouvelez votre abonnement par Mobile Money pour réactiver
                l&apos;accès public à votre vitrine.
              </span>
            </div>
            <Link
              href="/dashboard/abonnement"
              className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-800"
            >
              Renouveler maintenant
            </Link>
          </div>
        ) : subHealth.isExpiringSoon ? (
          <div className="animate-page-enter flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <strong>Attention :</strong> votre formule arrive à échéance
                dans <strong>{subHealth.daysRemaining} jour(s)</strong>. Pensez
                à la renouveler pour éviter toute coupure.
              </span>
            </div>
            <Link
              href="/dashboard/abonnement"
              className="rounded-lg bg-[#102A43] px-3 py-1 text-xs font-bold text-white hover:bg-[#1B3B5A]"
            >
              Gérer mon abonnement
            </Link>
          </div>
        ) : null}


        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div key={pathname} className="animate-page-enter">
            {children}
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
            tab.href === "/dashboard/commandes"
              ? pendingOrdersCount
              : tab.href === "/dashboard/stocks"
              ? stockAlertsCount
              : 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold transition-colors",
                active ? "text-[#102A43]" : "text-slate-400"
              )}
            >
              <Icon
                className={cn("h-5 w-5", active && "text-[#10B981]")}
              />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#10B981] px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-[#10B981] cursor-pointer"
        >
          <Sparkles className="h-5 w-5" />
          <span>IA</span>
        </button>
      </nav>

      {/* Panneau latéral Adeshina IA disponible partout */}
      <AdeshinaCollaboratorDrawer
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </div>
  );
}
