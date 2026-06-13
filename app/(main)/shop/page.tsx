'use client';

import React, { Suspense, useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, X, ChevronDown, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShopProductCard, { ShopProduct } from '@/components/shop/ShopProductCard';
import ShopCartPanel from '@/components/shop/ShopCartPanel';
import { useShopCartStore } from '@/store/shopCartStore';
import { getShopProducts, getShopCategories } from '@/services/shop.service';

function ShopProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-slate-200 rounded-full w-1/3" />
        <div className="h-3.5 bg-slate-200 rounded-full w-4/5" />
        <div className="h-3.5 bg-slate-200 rounded-full w-3/5" />
        <div className="h-4 bg-slate-200 rounded-full w-2/5 mt-1" />
      </div>
    </div>
  );
}

function ShopInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cartOpen, setCartOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { items, addItem } = useShopCartStore();
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  const updateURL = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    router.replace(`?${p.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const search    = searchParams.get('search') || '';
  const category  = searchParams.get('category') || '';
  const minPrice  = searchParams.get('minPrice') || '';
  const maxPrice  = searchParams.get('maxPrice') || '';
  const sort      = searchParams.get('sort') || 'newest';
  const page      = Number(searchParams.get('page') || '1');

  const qs = new URLSearchParams({
    page: String(page), limit: '12',
    ...(search   ? { search }   : {}),
    ...(category ? { category } : {}),
    ...(minPrice ? { minPrice } : {}),
    ...(maxPrice ? { maxPrice } : {}),
    sort,
  }).toString();

  const { data, isLoading } = useQuery({
    queryKey: ['shop-products-public', qs],
    queryFn: () => getShopProducts(qs),
    staleTime: 60_000,
    gcTime: 300_000,
    placeholderData: keepPreviousData,
  });
  const { data: catData } = useQuery({
    queryKey: ['shop-categories-public'],
    queryFn: () => getShopCategories(),
    staleTime: 300_000,
  });

  const products: ShopProduct[] = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };
  const categories: { _id: string; name: string }[] = catData?.data || [];

  const hasFilters = search || category || minPrice || maxPrice;

  const handleAddToCart = (product: ShopProduct, selectedVariant?: string) => {
    const finalPrice = product.finalPrice ?? product.price;
    const cartKey = selectedVariant ? `${product._id}:${selectedVariant}` : product._id;
    addItem({
      cartKey,
      _id: product._id,
      title: product.title,
      price: finalPrice,
      image: product.images?.[0] || '',
      ...(selectedVariant ? { variant: selectedVariant } : {}),
    });
  };

  const FilterPanel = (
    <div className="p-4 space-y-5">
      {/* Title */}
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#C05428]">RIN</p>
        <h1 className="text-lg font-extrabold text-[#1B3A6B] leading-tight">Shop</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">{pagination.total} products</p>
      </div>

      {/* Search */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Search</p>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => updateURL({ search: e.target.value, page: '1' })}
            placeholder="Title, SKU, description…"
            className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/10 focus:border-[#1B3A6B]"
          />
          {search && (
            <button onClick={() => updateURL({ search: '', page: '1' })} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X size={12} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Price Range (AUD)</p>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={e => updateURL({ minPrice: e.target.value, page: '1' })}
            className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/10 focus:border-[#1B3A6B] bg-white"
          />
          <span className="text-slate-400 text-xs shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={e => updateURL({ maxPrice: e.target.value, page: '1' })}
            className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/10 focus:border-[#1B3A6B] bg-white"
          />
        </div>
        {(minPrice || maxPrice) && (
          <button onClick={() => updateURL({ minPrice: '', maxPrice: '', page: '1' })} className="mt-1.5 text-[10px] text-red-400 hover:text-red-600 flex items-center gap-1">
            <X size={10} /> Clear range
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Categories</p>
        <div className="space-y-0.5">
          <button
            onClick={() => updateURL({ category: '', page: '1' })}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !category ? 'bg-[#1B3A6B] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Products</span>
            {!category && <ChevronRight size={11} />}
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => updateURL({ category: c._id === category ? '' : c._id, page: '1' })}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === c._id ? 'bg-[#1B3A6B] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{c.name}</span>
              {category === c._id && <ChevronRight size={11} />}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={() => router.replace('/shop', { scroll: false })}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-colors"
        >
          <X size={12} /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col xl:flex-row bg-[#F8FAFC]">

      {/* ── Left + Middle (68%) ─────────────────────────────────────────────── */}
      <section className="w-full xl:w-[68%] h-screen flex flex-col border-r border-slate-200">

        {/* Sticky top bar */}
        <div className="shrink-0 h-14 flex items-center justify-between px-5 border-b border-slate-100 bg-white/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-[#C05428]">RIN</span>
              <span className="ml-1.5 text-sm font-extrabold text-[#1B3A6B]">Shop</span>
            </div>
            {hasFilters && (
              <span className="text-[10px] bg-[#1B3A6B] text-white px-2 py-0.5 rounded-full font-bold">Filtered</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative hidden sm:block">
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={sort}
                onChange={e => updateURL({ sort: e.target.value, page: '1' })}
                className="h-8 pl-3 pr-7 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none appearance-none cursor-pointer text-slate-700 font-medium"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="name_asc">Name A–Z</option>
              </select>
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterOpen(true)}
              className="xl:hidden flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>
            {/* Mobile cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="xl:hidden relative h-8 w-8 flex items-center justify-center bg-[#1B3A6B] text-white rounded-xl"
            >
              <ShoppingCart size={15} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C05428] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Inner flex row: sidebar + grid */}
        <div className="flex-1 overflow-hidden flex flex-row">

          {/* Filter sidebar (desktop) */}
          <aside className="hidden xl:flex w-56 shrink-0 flex-col h-full overflow-y-auto border-r border-slate-100 bg-white/60 no-scrollbar">
            {FilterPanel}
          </aside>

          {/* Product grid area */}
          <div className="flex-1 h-full overflow-y-auto no-scrollbar">
            <div className="px-5 py-5">

              {/* Results bar */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-400 font-medium">
                  {isLoading ? 'Loading…' : `${pagination.total} results`}
                </p>
                {/* Mobile sort */}
                <div className="relative sm:hidden">
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={sort}
                    onChange={e => updateURL({ sort: e.target.value, page: '1' })}
                    className="h-8 pl-3 pr-7 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price ↑</option>
                    <option value="price_desc">Price ↓</option>
                    <option value="name_asc">Name A–Z</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ShopProductSkeleton key={i} />)
                  : products.map(p => (
                      <ShopProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />
                    ))
                }
              </div>

              {/* Empty */}
              {!isLoading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-slate-300" />
                  </div>
                  <p className="text-[#1B3A6B] text-base font-serif italic">No products found.</p>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
                  {hasFilters && (
                    <button
                      onClick={() => router.replace('/shop', { scroll: false })}
                      className="mt-4 px-5 py-2 text-sm font-bold text-[#1B3A6B] border border-[#1B3A6B] rounded-xl hover:bg-[#1B3A6B] hover:text-white transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-6">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateURL({ page: String(page - 1) })}
                    className="px-4 py-2 text-xs border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold transition-colors"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - page) <= 2)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => updateURL({ page: String(p) })}
                        className={`w-9 h-9 text-xs rounded-xl font-bold transition-colors ${p === page ? 'bg-[#1B3A6B] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {p}
                      </button>
                    ))
                  }
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => updateURL({ page: String(page + 1) })}
                    className="px-4 py-2 text-xs border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Right: Cart panel (32%, desktop only) ──────────────────────────── */}
      <aside className="hidden xl:flex w-[32%] h-screen bg-white flex-col relative border-l border-slate-100">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ShopCartPanel />
        </div>
      </aside>

      {/* ── Mobile: floating cart bar ───────────────────────────────────────── */}
      {itemCount > 0 && (
        <div className="xl:hidden fixed bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none">
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

      {/* ── Mobile: cart drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="xl:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="xl:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1" />
              <ShopCartPanel onClose={() => setCartOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile: filter drawer ───────────────────────────────────────────── */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="xl:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="xl:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-sm">Filters</span>
                <button onClick={() => setFilterOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>
              {FilterPanel}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopInner />
    </Suspense>
  );
}
