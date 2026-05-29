"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ShoppingCart, ChevronRight } from "lucide-react";

import { FoodService } from "@/services/food.service";
import { CategoryService } from "@/services/category.service";

import FoodGridMenu from "@/components/menu/FoodGridMenu";
import CheckoutPanelMenu from "@/components/menu/CheckoutPanelMenu";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Local Storage Key ─── */
const CART_KEY = "menu-cart";

/* ─── Local Storage Helpers ─── */
const loadCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart: any[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
};

export default function PremiumPOSPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  /* ─── Cart State — initialized from localStorage ─── */
  const [cart, setCartRaw] = useState<any[]>(() => loadCart());
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ─── Wrapped setter that auto-persists to localStorage ─── */
  const setCart = (updater: any) => {
    setCartRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveCart(next);
      return next;
    });
  };

  /* ─── Queries ─── */
  const { data: foodRes, isLoading } = useQuery({
    queryKey: ["foods", search, category, page],
    queryFn: () =>
      FoodService.getAllFoods(
        `search=${search}&category=${category}&page=${page}`
      ),
  });

  const { data: categoryRes } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  const foods = foodRes?.data || [];
  const categories = categoryRes?.data || [];

  /* ─── URL helpers ─── */
  const updateURL = (params: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) =>
      v ? p.set(k, v) : p.delete(k)
    );
    router.push(`?${p.toString()}`);
  };

  /* ─── Cart Actions ─── */
  const addToCart = (food: any) =>
    setCart((prev: any[]) => {
      const exists = prev.find((x) => x._id === food._id);
      return exists
        ? prev.map((x) =>
            x._id === food._id ? { ...x, qty: x.qty + 1 } : x
          )
        : [...prev, { ...food, qty: 1 }];
    });

  const increaseQty = (id: string) =>
    setCart((prev: any[]) =>
      prev.map((x) => (x._id === id ? { ...x, qty: x.qty + 1 } : x))
    );

  const decreaseQty = (id: string) =>
    setCart((prev: any[]) => {
      const item = prev.find((x) => x._id === id);
      if (!item) return prev;
      if (item.qty <= 1) return prev.filter((x) => x._id !== id);
      return prev.map((x) => (x._id === id ? { ...x, qty: x.qty - 1 } : x));
    });

  const removeItem = (id: string) =>
    setCart((prev: any[]) => prev.filter((x) => x._id !== id));

  /* ─── Derived values ─── */
  const subtotal = useMemo(
    () => cart.reduce((a: number, i: any) => a + i.price * i.qty, 0),
    [cart]
  );
  const cartCount = cart.reduce((a: number, i: any) => a + i.qty, 0);

  return (
    <div className="min-h-screen w-full flex bg-[#080808] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden">

      {/* LEFT: Explorer Section (75%) */}
      <main className="relative w-full xl:w-[70%] h-screen flex flex-col border-r border-white/5 bg-[#161813]">
        {/* Content Area — extra bottom padding on mobile so FAB doesn't cover content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 no-scrollbar pb-28 xl:pb-0">
          <div className="max-w-[1400px] mx-auto">
            <FoodGridMenu
              foods={foods}
              categories={categories}
              search={search}
              category={category}
              updateURL={updateURL}
              onAdd={addToCart}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* ─── MOBILE FLOATING CART BAR (sm & md only) ─── */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 220 }}
              className="xl:hidden fixed bottom-6 left-4 right-4 z-50"
            >
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-full flex items-center gap-3 bg-[#080808] border border-white/10 rounded-2xl px-4 py-3.5 shadow-2xl shadow-black/60 active:scale-[0.98] transition-transform"
              >
                {/* Left — cart count badge */}
                <div className="flex items-center justify-center min-w-[38px] h-[38px] bg-indigo-600 rounded-xl shrink-0">
                  <span className="text-white text-sm font-bold leading-none">
                    {cartCount}
                  </span>
                </div>

                {/* Middle — label */}
                <span className="flex-1 text-left text-white text-sm font-semibold tracking-tight">
                  View Cart
                </span>

                {/* Right — total */}
                <span className="text-lime-400 text-base font-bold shrink-0">
                  ${subtotal.toFixed(2)}
                </span>

                <ChevronRight size={18} className="text-zinc-500 shrink-0" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* RIGHT: Order Intelligence (25%) — desktop only */}
      <aside className="hidden xl:flex w-[30%] h-screen bg-[#080808] flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight italic">
              Current Order
            </h2>
            <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-zinc-500 uppercase tracking-widest border border-white/5">
              Draft #2026
            </div>
          </div>
          <CheckoutPanelMenu
            cart={cart}
            subtotal={subtotal}
            tax={subtotal * 0.125}
            total={subtotal * 1.125}
            setCart={setCart}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            removeItem={removeItem}
            clearCart={() => setCart([])}
          />
        </div>
      </aside>

      {/* ─── MOBILE BOTTOM DRAWER ─── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl xl:hidden"
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0d0d0d] rounded-t-[2.5rem] border-t border-white/10 max-h-[92vh] overflow-hidden flex flex-col xl:hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-4 pb-2 shrink-0">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Drawer header */}
              <div className="flex justify-between items-center px-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black italic">Your Bag</h2>
                  {cartCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-indigo-600 rounded-full text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 pb-8 no-scrollbar">
                <CheckoutPanelMenu
                  cart={cart}
                  subtotal={subtotal}
                  tax={subtotal * 0.125}
                  total={subtotal * 1.125}
                  setCart={setCart}
                  increaseQty={increaseQty}
                  decreaseQty={decreaseQty}
                  removeItem={removeItem}
                  clearCart={() => setCart([])}
                  onOrderSuccess={() => setDrawerOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}