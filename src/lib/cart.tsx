"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CART_KEY = "namdar_cart_v1";

export type CartItem = {
  slug: string;
  title: string;
  price: number; // final price per item (after item-level discount if any)
  originalPrice: number;
  image: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  originalTotal: number;
  add: (item: CartItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.slug === item.slug)) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((p) => p.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const has = useCallback(
    (slug: string) => items.some((p) => p.slug === slug),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      total: items.reduce((s, i) => s + i.price, 0),
      originalTotal: items.reduce((s, i) => s + i.originalPrice, 0),
      add,
      remove,
      clear,
      has,
    }),
    [items, add, remove, clear, has]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
