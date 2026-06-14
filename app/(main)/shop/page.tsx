'use client';

import { Suspense, useCallback, useRef, useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, Search, X } from 'lucide-react';
import ShopProductCard, { ShopProduct } from '@/components/shop/ShopProductCard';
import { useShopCartStore } from '@/store/shopCartStore';
import { getShopProducts, getShopCategories } from '@/services/shop.service';

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function ShopProductSkeleton() {
  return (
    <div className="bg-white animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="pt-3 space-y-2">
        <div className="h-2 bg-slate-200 rounded w-1/4" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
        <div className="h-3 bg-slate-200 rounded w-3/5" />
        <div className="h-3.5 bg-slate-200 rounded w-1/3 mt-1" />
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────────────────────── */
function ShopGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useShopCartStore();

  const filterRef = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Local filter form state (inside dropdown — apply on submit or auto)
  const [localSearch,   setLocalSearch]   = useState(searchParams.get('search')   || '');
  const [localMinPrice, setLocalMinPrice] = useState(searchParams.get('minPrice') || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const updateURL = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    router.replace(`/shop?${p.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort     = searchParams.get('sort')     || 'newest';
  const page     = Number(searchParams.get('page') || '1');

  const activeFilterCount = [search, minPrice, maxPrice].filter(Boolean).length;

  // Close filter dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Sync local inputs when URL changes
  useEffect(() => {
    setLocalSearch(searchParams.get('search') || '');
    setLocalMinPrice(searchParams.get('minPrice') || '');
    setLocalMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  const applyFilters = () => {
    updateURL({ search: localSearch, minPrice: localMinPrice, maxPrice: localMaxPrice, page: '1' });
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setLocalSearch(''); setLocalMinPrice(''); setLocalMaxPrice('');
    router.replace(`/shop${category ? `?category=${category}` : ''}`, { scroll: false });
    setFilterOpen(false);
  };

  const qs = new URLSearchParams({
    page: String(page), limit: '16',
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

  const handleAddToCart = (product: ShopProduct, selectedVariant?: string) => {
    const finalPrice = product.finalPrice ?? product.price;
    const cartKey    = selectedVariant ? `${product._id}:${selectedVariant}` : product._id;
    addItem({
      cartKey, _id: product._id, title: product.title,
      price: finalPrice, image: product.images?.[0] || '',
      ...(selectedVariant ? { variant: selectedVariant } : {}),
    });
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Sticky filter bar ──────────────────────────────────────────── */}
      <div className="shrink-0 sticky top-0 z-20 bg-white border-b border-slate-200">

        {/* Category nav row */}
        <div className="flex items-center border-b border-slate-100">
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-0 min-w-max px-5">
              {/* ALL tab */}
              <button
                onClick={() => updateURL({ category: '', page: '1' })}
                className={`relative shrink-0 py-3.5 px-4 text-[11px] font-black uppercase tracking-[0.15em] transition-colors whitespace-nowrap ${
                  !category
                    ? 'text-[#1B3A6B] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1B3A6B]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                View All
              </button>
              {categories.map(c => (
                <button
                  key={c._id}
                  onClick={() => updateURL({ category: c._id === category ? '' : c._id, page: '1' })}
                  className={`relative shrink-0 py-3.5 px-4 text-[11px] font-black uppercase tracking-[0.15em] transition-colors whitespace-nowrap ${
                    category === c._id
                      ? 'text-[#1B3A6B] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1B3A6B]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filter button */}
          <div className="shrink-0 relative border-l border-slate-100" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={`flex items-center gap-2 px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${
                filterOpen || activeFilterCount > 0
                  ? 'text-[#1B3A6B]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal size={13} />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-[#1B3A6B] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={12} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter dropdown */}
            {filterOpen && (
              <div className="absolute right-0 top-full mt-0 w-72 bg-white border border-slate-200 shadow-xl z-30">
                <div className="p-4 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Refine Results</p>

                  {/* Search */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Search</label>
                    <div className="relative">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={localSearch}
                        onChange={e => setLocalSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        placeholder="Title, SKU, description…"
                        className="w-full h-9 pl-8 pr-3 text-xs border border-slate-200 focus:outline-none focus:border-[#1B3A6B] bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Price Range (AUD)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" placeholder="Min"
                        value={localMinPrice}
                        onChange={e => setLocalMinPrice(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 focus:outline-none focus:border-[#1B3A6B] bg-slate-50"
                      />
                      <span className="text-slate-400 text-xs shrink-0">–</span>
                      <input
                        type="number" placeholder="Max"
                        value={localMaxPrice}
                        onChange={e => setLocalMaxPrice(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 focus:outline-none focus:border-[#1B3A6B] bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Sort By</label>
                    <select
                      value={sort}
                      onChange={e => { updateURL({ sort: e.target.value, page: '1' }); }}
                      className="w-full h-9 px-3 text-xs border border-slate-200 focus:outline-none focus:border-[#1B3A6B] bg-slate-50 appearance-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_asc">Price: Low → High</option>
                      <option value="price_desc">Price: High → Low</option>
                      <option value="name_asc">Name A–Z</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={clearFilters}
                      className="flex-1 h-9 text-[11px] font-black uppercase tracking-wider border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X size={11} /> Clear
                    </button>
                    <button
                      onClick={applyFilters}
                      className="flex-1 h-9 text-[11px] font-black uppercase tracking-wider bg-[#1B3A6B] text-white hover:bg-[#14305a] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results count bar */}
        <div className="flex items-center justify-between px-5 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {isLoading ? 'Loading…' : `${pagination.total} Products`}
          </p>
          {(search || minPrice || maxPrice) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
            >
              <X size={10} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Product grid ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-x-5 gap-y-8">
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
              <p className="text-[#1B3A6B] text-sm font-black uppercase tracking-wider">No products found</p>
              <p className="text-slate-400 text-xs mt-2">Try adjusting your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-5 px-6 py-2.5 bg-[#1B3A6B] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#14305a] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-10 pt-6 border-t border-slate-200">
              <button
                disabled={page <= 1}
                onClick={() => updateURL({ page: String(page - 1) })}
                className="px-5 py-2 text-[11px] font-black uppercase tracking-wider border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2)
                .map(p => (
                  <button
                    key={p}
                    onClick={() => updateURL({ page: String(p) })}
                    className={`w-9 h-9 text-[11px] font-black transition-colors ${
                      p === page
                        ? 'bg-[#1B3A6B] text-white'
                        : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))
              }
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => updateURL({ page: String(page + 1) })}
                className="px-5 py-2 text-[11px] font-black uppercase tracking-wider border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopGrid />
    </Suspense>
  );
}
