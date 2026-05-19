'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, X } from 'lucide-react';

import { FoodService } from '@/services/food.service';
import { CategoryService } from '@/services/category.service';

import FoodGrid from '@/components/pos/FoodGrid';
import CheckoutPanel from '@/components/pos/CheckoutPanel';

/* ─── localStorage ──────────────────────────────────────────── */
const CART_KEY = 'pos-cart-data';

function loadCart(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: any[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

/* ─── component ─────────────────────────────────────────────── */
export default function FoodTablePage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const page     = searchParams.get('page')     || '1';
  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';

  /* POS state – hydrated from localStorage on first render */
  const [cart, setCartRaw]         = useState<any[]>(() => loadCart());
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [drawerOpen, setDrawerOpen]       = useState(false);

  /* wrapper keeps state + storage in sync */
  const setCart = (updater: any[] | ((prev: any[]) => any[])) => {
    setCartRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveCart(next);
      return next;
    });
  };

  /* close drawer on desktop resize */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1280) setDrawerOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* data fetch */
  const { data: foodRes, isLoading } = useQuery({
    queryKey: ['foods', search, category, page],
    queryFn: () =>
      FoodService.getAllFoods(
        `search=${search}&category=${category}&page=${page}`
      ),
  });

  const { data: categoryRes } = useQuery({
    queryKey: ['categories'],
    queryFn: CategoryService.getAllCategories,
  });

  const foods      = foodRes?.data     || [];
  const categories = categoryRes?.data || [];

  /* URL helpers */
  const updateURL = (params: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.push(`?${p.toString()}`);
  };

  /* cart actions */
  const addToCart = (food: any) =>
    setCart((prev) => {
      const exists = prev.find((x) => x._id === food._id);
      return exists
        ? prev.map((x) => (x._id === food._id ? { ...x, qty: x.qty + 1 } : x))
        : [...prev, { ...food, qty: 1 }];
    });

  const increaseQty = (id: string) =>
    setCart((prev) =>
      prev.map((x) => (x._id === id ? { ...x, qty: x.qty + 1 } : x))
    );

  const decreaseQty = (id: string) =>
    setCart((prev) =>
      prev
        .map((x) => (x._id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((x) => x._id !== id));

  const clearCart = () => setCart([]);

  /* totals */
  const subtotal = useMemo(
    () => cart.reduce((a, i) => a + i.price * i.qty, 0),
    [cart]
  );
  const tax   = subtotal * 0.125;
  const total = subtotal + tax;

  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  const checkoutProps = {
    cart,
    subtotal,
    tax,
    total,
    paymentMethod,
    setPaymentMethod,
    setCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
  };

  /* ─── UI ─────────────────────────────────────────────────── */
  return (
    <div className="relative min-h-screen">

      {/* ═══════════════════════════════════════════════════════
          GRID — food left, checkout right (xl+)
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6">

        {/* food grid */}
        <div className="col-span-12 xl:col-span-8">
          <FoodGrid
            foods={foods}
            categories={categories}
            search={search}
            category={category}
            updateURL={updateURL}
            onAdd={addToCart}
            isLoading={isLoading}
          />
          {/* spacer so FAB never covers the last card */}
          <div className="h-24 xl:hidden" />
        </div>

        {/* desktop sidebar */}
        <div className="hidden xl:block xl:col-span-4">
          <CheckoutPanel {...checkoutProps} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE — floating action button
      ═══════════════════════════════════════════════════════ */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Open cart"
        className="
          xl:hidden fixed bottom-5 right-5 z-40
          flex items-center gap-2
          bg-indigo-600 hover:bg-indigo-700 active:scale-95
          text-white font-black rounded-2xl px-5 h-14
          shadow-2xl shadow-indigo-300
          transition-all duration-200
        "
      >
        <ShoppingCart size={20} />
        <span className="text-sm">Cart</span>
        {cartCount > 0 && (
          <span
            className="
              bg-white text-indigo-600 text-xs font-black
              rounded-full w-6 h-6 flex items-center justify-center
              animate-bounce
            "
          >
            {cartCount}
          </span>
        )}
      </button>

      {/* ═══════════════════════════════════════════════════════
          MOBILE — bottom-sheet drawer
      ═══════════════════════════════════════════════════════ */}

      {/* backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`
          xl:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm
          transition-opacity duration-300
          ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* sheet */}
      <div
        className={`
          xl:hidden fixed bottom-0 left-0 right-0 z-50
          bg-white rounded-t-3xl shadow-2xl
          max-h-[92dvh] overflow-y-auto
          transition-transform duration-300 ease-out
          ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* handle bar + header */}
        <div
          className="
            sticky top-0 bg-white/95 backdrop-blur-sm z-10
            pt-3 pb-3 px-5
            border-b border-slate-100
            flex items-center justify-between
          "
        >
          <div
            className="
              w-10 h-1 rounded-full bg-slate-200
              absolute left-1/2 -translate-x-1/2 top-2
            "
          />
          <span className="font-black text-slate-800 text-base mt-2">
            Your Cart
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="mt-2 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-4 pb-8">
          <CheckoutPanel
            {...checkoutProps}
            onOrderSuccess={() => setDrawerOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}