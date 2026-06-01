'use client';

import React, { useMemo } from 'react';
import { SearchIcon } from 'lucide-react';
import FoodCardMenu from './FoodCardMenu';
import { ListButtonWhite } from '../ui/ListButtonWhite';

export default function FoodGridMenu({
  foods,
  categories,
  search,
  category,
  updateURL,
  onAdd,
  isLoading,
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
sfgsf
      {/* ─── PREMIUM CONTROL BAR ─── */}
      <div className="sticky top-0 z-20 pt-20 pb-6 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-slate-200 -mx-4 px-4 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-5">

          {/* Search row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group max-w-3xl">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors">
                <SearchIcon size={18} strokeWidth={2.5} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => updateURL({ search: e.target.value, page: '1' })}
                placeholder="Search our menu..."
                className="w-full h-12 pl-11 pr-4 bg-white text-[#1B3A6B] placeholder-slate-400 text-sm font-medium border border-slate-200 rounded-2xl outline-none transition-all shadow-sm focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/5"
              />
            </div>
          </div>

          {/* Category ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <ListButtonWhite
              label="All Menu"
              isActive={category === ''}
              onClick={() => updateURL({ category: '', page: '1' })}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider"
            />
            <div className="w-[1px] h-4 bg-slate-200 shrink-0 mx-1" />
            {categories?.map((cat: any) => (
              <ListButtonWhite
                key={cat._id}
                label={cat.title}
                isActive={category === cat._id}
                onClick={() => updateURL({ category: cat._id, page: '1' })}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── MENU EXPLORER ─── */}
      <div className="space-y-16 mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-white animate-pulse border border-slate-200 shadow-sm"
              />
            ))}
          </div>
        ) : (
          groupedFoods.map((group: any) => (
            <section
              key={group._id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl lg:text-3xl font-serif italic text-[#1B3A6B]">
                  {group.title}
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {group.foods.length} Dishes
                </span>
              </div>

              {/* Responsive Grid */}
              <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {group.foods.map((item: any) => (
                  <FoodCardMenu key={item._id} item={item} onAdd={onAdd} />
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