"use client";

import { Suspense, useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ChevronRight } from "lucide-react";

import { FoodService } from "@/services/food.service";
import { CategoryService } from "@/services/category.service";

import FoodGridMenu from "@/components/menu/FoodGridMenu";
import CheckoutPanelMenu from "@/components/menu/CheckoutPanelMenu";
import { AnimatePresence, motion } from "framer-motion";
import PickupTimeModal from "@/components/pickup/PickupTimeModal";
import { usePickupStore } from "@/store/pickupStore";
import RightPanelFooterCard from "@/components/shared/RightPanelFooterCard";

/* ─── Types ─── */
const CART_KEY = "menu-cart";

interface CartItem {
  _id: string;
  title: string;
  price: number;
  qty: number;
}

// Shape of foods returned from the API (matches MenuItem in FoodGridMenu)
interface FoodApiItem {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category: string | { _id: string };
}

/* ─── localStorage helpers ─── */
const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart: CartItem[]) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* noop */ }
};

/* ─── Page inner ─── */
function MenuPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [pickupOpen, setPickupOpen] = useState(false);
  const { isSet: pickupIsSet } = usePickupStore();

  const [cart, setCartRaw] = useState<CartItem[]>(() => loadCart());
  const [drawerOpen, setDrawerOpen]   = useState(false);

  const menuScrollRef = useRef<HTMLDivElement>(null);

  /* Wrapped setter that auto-persists and broadcasts */
  const setCart = (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    setCartRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveCart(next);
      window.dispatchEvent(new Event("menu-cart-updated"));
      return next;
    });
  };

  /* ─── Queries — fetch ALL foods, grouping is done client-side ─── */
  const { data: foodRes, isLoading } = useQuery({
    queryKey: ["foods-all", search],
    queryFn: () => FoodService.getAllFoods(`search=${search}&limit=500`),
    placeholderData: (prev) => prev,
  });

  const { data: categoryRes } = useQuery({
    queryKey: ["categories"],
    queryFn: CategoryService.getAllCategories,
  });

  const foods      = (foodRes?.data     ?? []) as FoodApiItem[];
  const categories = (categoryRes?.data ?? []) as { _id: string; title: string }[];

  /* ─── URL helpers (search only — category is scroll-based now) ─── */
  const updateURL = (params: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) =>
      v ? p.set(k, v) : p.delete(k)
    );
    router.replace(`?${p.toString()}`);
  };

  /* ─── Cart actions ─── */
  const addToCart = (food: FoodApiItem) =>
    setCart((prev) => {
      const exists = prev.find((x) => x._id === food._id);
      return exists
        ? prev.map((x) => x._id === food._id ? { ...x, qty: x.qty + 1 } : x)
        : [...prev, { _id: food._id, title: food.title, price: food.price, qty: 1 }];
    });

  const increaseQty = (id: string) =>
    setCart((prev) => prev.map((x) => x._id === id ? { ...x, qty: x.qty + 1 } : x));

  const decreaseQty = (id: string) =>
    setCart((prev) => {
      const item = prev.find((x) => x._id === id);
      if (!item) return prev;
      if (item.qty <= 1) return prev.filter((x) => x._id !== id);
      return prev.map((x) => x._id === id ? { ...x, qty: x.qty - 1 } : x);
    });

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((x) => x._id !== id));

  /* ─── Derived values ─── */
  const subtotal = useMemo(
    () => cart.reduce((a, i) => a + i.price * i.qty, 0),
    [cart]
  );
  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  return (
    <div className="min-h-screen w-full flex flex-col xl:flex-row bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#1B3A6B]/10 overflow-hidden">

      <PickupTimeModal isOpen={pickupOpen} onClose={() => setPickupOpen(false)} />

      {/* LEFT: Food grid (70%) */}
      <main className="relative w-full lg:w-[70%] h-screen flex flex-col border-r border-slate-200 bg-[#F8FAFC]">

        {/* Scroll container — ref passed to FoodGridMenu for scroll spy */}
        <div
          ref={menuScrollRef}
          className="flex-1 overflow-y-auto px-6 lg:px-10 no-scrollbar"
        >
          <div className="max-w-350 mx-auto">
            <FoodGridMenu
              foods={foods}
              categories={categories}
              search={search}
              updateURL={updateURL}
              onAdd={addToCart}
              isLoading={isLoading}
              pickupIsSet={pickupIsSet}
              onPickupOpen={() => setPickupOpen(true)}
              scrollContainer={menuScrollRef}
            />
          </div>
        </div>

        {/* Mobile floating cart bar */}
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
                className="w-full flex items-center gap-3 bg-[#1B3A6B] border border-white/10 rounded-2xl px-4 py-3.5 shadow-2xl shadow-[#1B3A6B]/20 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-center min-w-9.5 h-9.5 bg-white text-[#1B3A6B] rounded-xl shrink-0">
                  <span className="text-sm font-black leading-none">{cartCount}</span>
                </div>
                <span className="flex-1 text-left text-white font-bold uppercase tracking-widest text-[11px]">
                  View Order
                </span>
                <span className="text-white text-base font-bold shrink-0">
                  ${subtotal.toFixed(2)}
                </span>
                <ChevronRight size={18} className="text-white/60 shrink-0" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* RIGHT: Order panel (30%) — desktop only */}
      <aside className="hidden lg:flex w-[30%] h-screen bg-white flex-col relative border-l border-slate-100 shadow-sm">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-2xl font-serif italic text-[#1B3A6B]">Current Order</h2>
            <div className="px-3 py-1 bg-[#F8FAFC] rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200">
              Draft #2026
            </div>
          </div>

          <div className="flex-1">
            <CheckoutPanelMenu
              cart={cart}
              subtotal={subtotal}
              tax={subtotal * 0.1}
              total={subtotal * 1.1}
              setCart={setCart}
              increaseQty={increaseQty}
              decreaseQty={decreaseQty}
              removeItem={removeItem}
              clearCart={() => setCart([])}
            />
          </div>

          <RightPanelFooterCard />
        </div>
      </aside>

      {/* Mobile bottom drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm xl:hidden"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-70 bg-white rounded-t-[2.5rem] border-t border-slate-200 max-h-[92vh] overflow-hidden flex flex-col xl:hidden shadow-2xl"
            >
              <div className="flex justify-center pt-4 pb-2 shrink-0">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              <div className="flex justify-between items-center px-6 pb-4 shrink-0 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-serif italic text-[#1B3A6B]">Your Bag</h2>
                  {cartCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-[#1B3A6B] rounded-full text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full border border-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar bg-white">
                <CheckoutPanelMenu
                  cart={cart}
                  subtotal={subtotal}
                  tax={subtotal * 0.1}
                  total={subtotal * 1.1}
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

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function PremiumPOSPage() {
  return (
    <Suspense>
      <MenuPageInner />
    </Suspense>
  );
}
