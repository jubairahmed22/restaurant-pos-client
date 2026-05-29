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

      {/* ─── COMPACT CONTROL BAR ─── */}
      {/*
        On mobile the sticky bar sits under the top of the viewport.
        We keep z-30 here; the floating cart FAB uses z-50 so it layers above.
      */}
      <div className="sticky top-0 z-30 pt-20 xl:pt-24 pb-4 bg-[#161813]/80 backdrop-blur-xl border-b border-white/5 -mx-4 px-4 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-4">

          {/* Search row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group max-w-3xl">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
                <SearchIcon size={16} strokeWidth={2} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => updateURL({ search: e.target.value, page: '1' })}
                placeholder="Search menu..."
                className="w-full h-11 pl-10 pr-4 bg-white/[0.04] text-white placeholder-zinc-500 text-sm border border-white/10 rounded-xl outline-none transition-all focus:border-indigo-500/40 focus:bg-white/[0.07]"
              />
            </div>
          </div>

          {/* Category ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <ListButtonWhite
              label="All"
              isActive={category === ''}
              onClick={() => updateURL({ category: '', page: '1' })}
              className="px-4 py-1.5 text-xs"
            />
            <div className="w-[1px] h-4 bg-white/10 shrink-0" />
            {categories?.map((cat: any) => (
              <ListButtonWhite
                key={cat._id}
                label={cat.title}
                isActive={category === cat._id}
                onClick={() => updateURL({ category: cat._id, page: '1' })}
                className="px-4 py-1.5 text-xs whitespace-nowrap"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── MENU EXPLORER ─── */}
      <div className="space-y-12 mt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-white/[0.02] animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : (
          groupedFoods.map((group: any) => (
            <section
              key={group._id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-serif italic text-white/80">
                  {group.title}
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
                  {group.foods.length} items
                </span>
              </div>

              <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {group.foods.map((item: any) => (
                  <FoodCardMenu key={item._id} item={item} onAdd={onAdd} />
                ))}
              </div>
            </section>
          ))
        )}

        {!isLoading && groupedFoods.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 opacity-60">
            <p className="text-zinc-400 text-sm font-light italic">
              No culinary matches found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}