"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Category, Product, Store } from "@/types/domain";
import { usePlatform } from "@/lib/platform-store";

export interface StoreCartItem {
  key: string;
  product: Product;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
}

interface StorefrontContextValue {
  store: Store;
  categories: Category[];
  products: Product[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cart: StoreCartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  checkoutStep: "cart" | "form" | "done";
  setCheckoutStep: (step: "cart" | "form" | "done") => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  justAddedToast: string | null;
  addToCart: (
    product: Product,
    options?: {
      variantLabel?: string;
      quantity?: number;
      openDrawer?: boolean;
      goToCheckout?: boolean;
    }
  ) => void;
  updateCartQty: (key: string, delta: number) => void;
  removeCartItem: (key: string) => void;
  clearCart: () => void;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function StorefrontProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { stores, categories, products } = usePlatform();
  const store = stores.find((s) => s.slug === slug) ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<StoreCartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "done">(
    "cart"
  );
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [justAddedToast, setJustAddedToast] = useState<string | null>(null);

  // Isolation stricte du panier par identifiant de boutique
  const storageKey = store ? `ecomsate_cart_${store.id}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoreCartItem[];
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    } finally {
      setCartHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !cartHydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      // Ignore quota errors
    }
  }, [cart, storageKey, cartHydrated]);

  const storeCategories = useMemo(
    () => (store ? categories.filter((c) => c.storeId === store.id) : []),
    [categories, store]
  );

  const storeProducts = useMemo(
    () =>
      store
        ? products.filter((p) => p.storeId === store.id && p.isActive)
        : [],
    [products, store]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  if (!store) {
    return <>{children}</>;
  }

  const addToCart: StorefrontContextValue["addToCart"] = (product, options) => {
    if (product.stock <= 0) return;
    const qtyToAdd = Math.max(1, options?.quantity ?? 1);
    const defaultVariant =
      product.variants[0]
        ? `${product.variants[0].name} : ${product.variants[0].value}`
        : undefined;
    const variantLabel = options?.variantLabel ?? defaultVariant;
    const unitPrice = product.promoPrice ?? product.price;
    const key = `${product.id}__${variantLabel || "default"}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + qtyToAdd);
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: nextQty, product, unitPrice } : i
        );
      }
      return [
        ...prev,
        {
          key,
          product,
          variantLabel,
          quantity: Math.min(product.stock, qtyToAdd),
          unitPrice,
        },
      ];
    });

    setQuickViewProduct(null);

    if (options?.goToCheckout) {
      setCheckoutStep("form");
      setCartOpen(true);
    } else if (options?.openDrawer) {
      setCheckoutStep("cart");
      setCartOpen(true);
    } else {
      setJustAddedToast(product.name);
      setTimeout(() => setJustAddedToast(null), 2400);
    }
  };

  const updateCartQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key !== key) return item;
          const next = Math.min(item.product.stock, item.quantity + delta);
          return { ...item, quantity: next };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <StorefrontContext.Provider
      value={{
        store,
        categories: storeCategories,
        products: storeProducts,
        searchQuery,
        setSearchQuery,
        cart,
        cartCount,
        cartSubtotal,
        cartOpen,
        setCartOpen,
        checkoutStep,
        setCheckoutStep,
        quickViewProduct,
        setQuickViewProduct,
        justAddedToast,
        addToCart,
        updateCartQty,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx) {
    throw new Error("useStorefront must be used inside StorefrontProvider");
  }
  return ctx;
}
