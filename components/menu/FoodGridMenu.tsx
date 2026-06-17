'use client';

import {
  useMemo, useState, useRef, useEffect, useLayoutEffect, RefObject,
} from 'react';
import { SearchIcon, ShoppingBag, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCardMenu from './FoodCardMenu';
import PickupBar from '@/components/pickup/PickupBar';

const PAGE_SIZE = 16;

/* ── Domain types ──────────────────────────────────────────────────────────── */
interface MenuItem {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category: string | { _id: string };
}

interface Category {
  _id: string;
  title: string;
}

interface GroupedCategory extends Category {
  foods: MenuItem[];
}

/* ── Skeleton card ─────────────────────────────────────────────────────────── */
function FoodCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full aspect-4/3 bg-slate-200 rounded-2xl" />
      <div className="flex flex-col gap-2 py-3">
        <div className="h-4 bg-slate-200 rounded-full w-4/5" />
        <div className="h-3 bg-slate-200 rounded-full w-3/5" />
        <div className="h-5 bg-slate-200 rounded-full w-2/5 mt-1" />
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function FoodGridMenu({
  foods,
  categories,
  search,
  updateURL,
  onAdd,
  isLoading,
  pickupIsSet,
  onPickupOpen,
  scrollContainer,
}: {
  foods: MenuItem[];
  categories: Category[];
  search: string;
  updateURL: (p: Record<string, string>) => void;
  onAdd: (food: MenuItem) => void;
  isLoading: boolean;
  pickupIsSet: boolean;
  onPickupOpen: () => void;
  scrollContainer: RefObject<HTMLDivElement | null>;
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCounts, setVisibleCounts]   = useState<Record<string, number>>({});

  // Derived-state reset: when search changes, reset visible counts immediately
  // (calling setState during render is the React-recommended pattern for derived state)
  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setVisibleCounts({});
  }

  const tabsRef         = useRef<HTMLDivElement>(null);
  const tabRefs         = useRef<Record<string, HTMLButtonElement | null>>({});
  const sectionRefs     = useRef<Record<string, HTMLElement | null>>({});
  const isSeekingRef    = useRef(false);
  // Always-current snapshot of groupedFoods for use inside event listeners
  const groupedFoodsRef = useRef<GroupedCategory[]>([]);

  /* ── Group + search filter (all client-side) ───────────────────────────── */
  const groupedFoods: GroupedCategory[] = useMemo(() => {
    if (!categories?.length) return [];
    const q = search.toLowerCase().trim();
    const filtered = q
      ? foods.filter(f =>
          f.title?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q)
        )
      : foods;

    return categories
      .map(cat => ({
        ...cat,
        foods: filtered.filter(f => {
          const catId = typeof f.category === 'object' ? f.category._id : f.category;
          return catId === cat._id;
        }),
      }))
      .filter(cat => cat.foods.length > 0);
  }, [foods, categories, search]);

  // Keep the ref in sync after every render so the scroll handler always sees fresh data
  useLayoutEffect(() => { groupedFoodsRef.current = groupedFoods; });

  /* ── Scroll spy ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;

    const handleScroll = () => {
      if (isSeekingRef.current) return;
      const threshold = container.getBoundingClientRect().top + 150;
      let found = 'all';
      for (const group of groupedFoodsRef.current) {
        const el = sectionRefs.current[group._id];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) found = group._id;
      }
      setActiveCategory(found);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
    // Only re-attach when the scroll container DOM node changes
  }, [scrollContainer]);

  /* ── Auto-scroll active tab into view, accounting for the right-side gradient ── */
  useEffect(() => {
    const tab       = tabRefs.current[activeCategory];
    const container = tabsRef.current;
    if (!tab || !container) return;

    const GRADIENT_PX  = 52;                          // matches the w-12 fade overlay
    const scrollLeft   = container.scrollLeft;
    const visibleWidth = container.clientWidth;
    const tabLeft      = tab.offsetLeft;
    const tabRight     = tabLeft + tab.offsetWidth;

    if (tabRight > scrollLeft + visibleWidth - GRADIENT_PX) {
      // Tab is hidden (fully or partially) behind the right gradient — scroll to expose it
      container.scrollTo({
        left: tabRight - visibleWidth + GRADIENT_PX + 8,
        behavior: 'smooth',
      });
    } else if (tabLeft < scrollLeft + 8) {
      // Tab is scrolled off to the left
      container.scrollTo({ left: tabLeft - 8, behavior: 'smooth' });
    }
  }, [activeCategory]);

  /* ── Tab click → scroll to section ────────────────────────────────────── */
  const seekTo = (id: string) => {
    setActiveCategory(id);
    isSeekingRef.current = true;
    if (id === 'all') {
      scrollContainer.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => { isSeekingRef.current = false; }, 900);
  };

  /* ── Per-category pagination ───────────────────────────────────────────── */
  const getVisible = (id: string) => visibleCounts[id] ?? PAGE_SIZE;
  const loadMore   = (id: string, total: number) =>
    setVisibleCounts(prev => ({
      ...prev,
      [id]: Math.min((prev[id] ?? PAGE_SIZE) + PAGE_SIZE, total),
    }));

  const allTabs: Category[] = [{ _id: 'all', title: 'All' }, ...(categories || [])];

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col min-h-full">

      {/* ── STICKY CONTROL BAR ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white shadow-sm -mx-4 px-4 lg:-mx-10 lg:px-10">

        {/* Search + pickup */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-16 sm:pt-20 pb-3">
          <div className="relative flex-1 group">
            <SearchIcon
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors"
              size={16} strokeWidth={2.5}
            />
            <input
              type="text"
              value={search}
              onChange={e => updateURL({ search: e.target.value })}
              placeholder="Search our menu…"
              className="w-full h-10 pl-10 pr-4 bg-slate-50 text-[#1B3A6B] placeholder-slate-400 text-sm font-medium border border-slate-200 rounded-2xl outline-none focus:border-[#1B3A6B] focus:bg-white focus:ring-4 focus:ring-[#1B3A6B]/5 transition-all"
            />
          </div>
          {pickupIsSet ? (
            <PickupBar onEdit={onPickupOpen} />
          ) : (
            <button
              onClick={onPickupOpen}
              className="h-10 flex items-center justify-center gap-2 px-5 rounded-2xl text-white text-xs font-bold shadow-sm transition-all hover:opacity-90 active:scale-[0.98] whitespace-nowrap shrink-0"
              style={{ background: '#C05428' }}
            >
              <ShoppingBag size={14} />
              Schedule Pickup
            </button>
          )}
        </div>

        {/* Category tab bar — baseline border + sliding indicator */}
        <div className="relative">
          {/* Fade-out on the right so overflowing tabs don't look clipped */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-white to-transparent z-10" />

          <div
            ref={tabsRef}
            className="flex items-end overflow-x-auto no-scrollbar border-b-2 border-slate-100"
          >
            {allTabs.map(tab => {
              const active = activeCategory === tab._id;
              return (
                <button
                  key={tab._id}
                  ref={el => { tabRefs.current[tab._id] = el; }}
                  onClick={() => seekTo(tab._id)}
                  className={`
                    relative px-5 py-3 text-xs uppercase tracking-widest
                    whitespace-nowrap shrink-0 transition-all duration-200
                    ${active
                      ? 'text-[#1B3A6B] font-black'
                      : 'text-slate-500 font-semibold hover:text-slate-800'}
                  `}
                >
                  {tab.title}
                  {active && (
                    <motion.div
                      layoutId="cat-pill"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.75 bg-[#1B3A6B]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MENU CONTENT ───────────────────────────────────────────────── */}
      <div className="mt-8 pb-28">

        {/* Loading skeletons */}
        {isLoading && [0, 1].map(g => (
          <section key={g} className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-7 w-36 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-px flex-1 bg-slate-200" />
              <div className="h-3 w-16 bg-slate-200 rounded-full animate-pulse" />
            </div>
            <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <FoodCardSkeleton key={i} />)}
            </div>
          </section>
        ))}

        {/* Category sections */}
        {!isLoading && groupedFoods.map((group, gi) => {
          const visible   = getVisible(group._id);
          const sliced    = group.foods.slice(0, visible);
          const remaining = group.foods.length - visible;
          const hasMore   = remaining > 0;

          return (
            <section
              key={group._id}
              className="scroll-mt-40"
              ref={el => { sectionRefs.current[group._id] = el; }}
            >
              {/* Category header */}
              <div className="flex items-center gap-5 mb-7">
                <h2 className="text-2xl lg:text-[28px] font-serif italic text-[#1B3A6B] shrink-0">
                  {group.title}
                </h2>
                <div className="h-px flex-1 bg-linear-to-r from-slate-200 to-transparent" />
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] shrink-0">
                  {group.foods.length} Dishes
                </span>
              </div>

              {/* Grid */}
              <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {sliced.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.22,
                        delay: idx < PAGE_SIZE ? 0 : (idx % PAGE_SIZE) * 0.035,
                      }}
                    >
                      <FoodCardMenu item={item} onAdd={onAdd} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* View More */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center gap-4"
                >
                  <div className="h-px flex-1 bg-slate-100" />
                  <button
                    onClick={() => loadMore(group._id, group.foods.length)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 bg-white text-[#1B3A6B] text-[11px] font-black uppercase tracking-wider hover:border-[#1B3A6B]/30 hover:bg-[#1B3A6B]/5 transition-all active:scale-[0.97] shadow-sm"
                  >
                    <ChevronDown size={13} />
                    {Math.min(remaining, PAGE_SIZE)} more {group.title} items
                  </button>
                  <div className="h-px flex-1 bg-slate-100" />
                </motion.div>
              )}

              {/* Section divider */}
              {gi < groupedFoods.length - 1 && (
                <div className="mt-12 mb-2 border-b border-slate-100" />
              )}
            </section>
          );
        })}

        {/* Empty state */}
        {!isLoading && groupedFoods.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <SearchIcon size={24} className="text-slate-300" />
            </div>
            <p className="text-[#1B3A6B] text-lg font-serif italic">
              No culinary matches found.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Try adjusting your search or category filters.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
