'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import ShopCartPanel from '@/components/shop/ShopCartPanel';
import { useShopCartStore } from '@/store/shopCartStore';
import RightPanelFooterCard from '@/components/shared/RightPanelFooterCard';

export default function ShopShell({ children }: { children: React.ReactNode }) {
  const { items } = useShopCartStore();
  const itemCount  = items.reduce((s, i) => s + i.qty, 0);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    /* Push below the fixed navbar (48px = mt-12) */
    <div className="mt-12 flex h-[calc(100vh-3rem)] w-full bg-[#F8FAFC] overflow-hidden">

      {/* ── Middle: content area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 border-r border-slate-100 overflow-hidden">

        {/* Mobile top bar */}
        <div className="lg:hidden shrink-0 h-12 flex items-center justify-between px-4 border-b border-slate-100 bg-white z-10">
          <span className="text-sm font-extrabold text-[#1B3A6B]">
            <span className="text-[#C05428] mr-1">RIN</span>Shop
          </span>
          <button
            onClick={() => setCartOpen(true)}
            className="relative h-9 w-9 flex items-center justify-center bg-[#1B3A6B] text-white rounded-xl"
          >
            <ShoppingCart size={15} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C05428] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>

      {/* ── Right: cart panel (desktop) ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[30%] shrink-0 h-full overflow-y-auto no-scrollbar bg-white" >
        <ShopCartPanel />

      </aside>

      {/* ── Mobile: floating cart bar ───────────────────────────────────── */}
      {itemCount > 0 && (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none">
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => setCartOpen(true)}
            className="pointer-events-auto flex items-center gap-3 px-6 py-3.5 bg-[#1B3A6B] text-white rounded-full shadow-2xl font-bold text-sm"
          >
            <ShoppingCart size={18} />
            View Cart ({itemCount})
            <span className="bg-white text-[#1B3A6B] text-xs font-black px-2 py-0.5 rounded-full">
              AUD {items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}
            </span>
          </motion.button>
        </div>
      )}

      {/* ── Mobile: cart drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1" />
              <ShopCartPanel onClose={() => setCartOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
