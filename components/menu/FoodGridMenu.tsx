'use client';

import React, { useMemo } from 'react';
import { SearchIcon, ShoppingBag } from 'lucide-react';
import FoodCardMenu from './FoodCardMenu';
import { ListButtonWhite } from '../ui/ListButtonWhite';
import PickupBar from '@/components/pickup/PickupBar';

function FoodCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden animate-pulse">
      <div className="relative w-full aspect-4/3 bg-slate-200 rounded-2xl" />
      <div className="flex flex-col gap-2 py-3">
        <div className="h-4 bg-slate-200 rounded-full w-4/5" />
        <div className="h-3 bg-slate-200 rounded-full w-3/5" />
        <div className="h-5 bg-slate-200 rounded-full w-2/5 mt-1" />
      </div>
    </div>
  );
}
export default function FoodGridMenu({
  foods,
  categories,
  search,
  category,
  updateURL,
  onAdd,
  isLoading,
  pickupIsSet,
  onPickupOpen,
}: any) {

  const groupedFoods = useMemo(() => {
    if (!categories?.length || !foods?.length) return [];
    return categories
      .map((cat: any) => ({
        ...cat,
        foods: foods.filter(
          (food: any) => food.category === cat._id || food.category?._id === cat._id
        ),
      }))
      .filter((cat: any) => cat.foods.length > 0);
  }, [foods, categories]);

  return (
    <div className="flex flex-col gap-6">

      {/* ─── CONTROL BAR ─── */}
      <div className="sticky top-0 z-20 pt-16 sm:pt-20 pb-4 bg-[#F8FAFC]/90 backdrop-blur-xl border-b border-slate-200/80 -mx-4 px-4 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-3">

          {/* Row 1 — stacked on mobile, side-by-side on sm+ */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">

            {/* Search */}
            <div className="relative flex-1 group">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors">
                <SearchIcon size={17} strokeWidth={2.5} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => updateURL({ search: e.target.value, page: '1' })}
                placeholder="Search our menu..."
                className="w-full h-11 pl-10 pr-4 bg-white text-[#1B3A6B] placeholder-slate-400 text-sm font-medium border border-slate-200 rounded-2xl outline-none transition-all shadow-sm focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/5"
              />
            </div>

            {/* Pickup */}
            {pickupIsSet ? (
              <PickupBar onEdit={onPickupOpen} />
            ) : (
              <button
                onClick={onPickupOpen}
                className="h-11 flex items-center justify-center gap-2 px-5 rounded-2xl text-white text-sm font-bold shadow-sm transition-all hover:opacity-90 active:scale-[0.98] whitespace-nowrap shrink-0"
                style={{ background: '#C05428' }}
              >
                <ShoppingBag size={15} />
                Schedule Pickup
              </button>
            )}
          </div>

          {/* Row 2 — Category ribbon */}
          <div className="relative">
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10" />
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-0.5">
              <ListButtonWhite
                label="All"
                isActive={category === ''}
                onClick={() => updateURL({ category: '', page: '1' })}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider shrink-0"
              />
              <div className="w-px h-4 bg-slate-200 shrink-0" />
              {categories?.map((cat: { _id: string; title: string }) => (
                <ListButtonWhite
                  key={cat._id}
                  label={cat.title}
                  isActive={category === cat._id}
                  onClick={() => updateURL({ category: cat._id, page: '1' })}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0"
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ─── MENU EXPLORER ─── */}
      <div className="space-y-1 mt-1">
        {isLoading ? (
          /* Skeleton grid — 2 placeholder category groups */
          [0, 1].map((g) => (
            <section key={g} className="mb-8">
              <div className="flex items-center gap-6 mb-10">
                <div className="h-7 w-36 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-[1px] flex-1 bg-slate-200" />
                <div className="h-3 w-16 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <FoodCardSkeleton key={i} />
                ))}
              </div>
            </section>
          ))
        ) : (
          groupedFoods.map((group: any) => (
            <section
              key={group._id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* Category Header */}
              <div className="flex items-center gap-6 mb-10">
                <h2 className="text-2xl lg:text-3xl font-serif italic text-[#1B3A6B]">
                  {group.title}
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {group.foods.length} Dishes
                </span>
              </div>

              {/* Responsive Grid — cards stagger in */}
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {group.foods.map((item: any, idx: number) => (
                  <div
                    key={item._id}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}
                  >
                    <FoodCardMenu item={item} onAdd={onAdd} />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}

      {/* Empty State */}
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