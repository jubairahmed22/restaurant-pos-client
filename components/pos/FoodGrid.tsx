'use client';

import React from 'react';
import { Search } from 'lucide-react';

import FoodCard from './FoodCard';
import { Input } from '@/components/ui/Form';
import { ListButton } from '@/components/ui/ListButton';

/* ─── skeleton card ────────────────────────────────────────── */
function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-slate-100
                 animate-pulse"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* image placeholder */}
      <div className="h-40 sm:h-44 bg-slate-100" />

      {/* body */}
      <div className="p-4 space-y-3">
        {/* title */}
        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        {/* subtitle */}
        <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
        {/* price + button row */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-slate-100 rounded-lg w-16" />
          <div className="h-9 bg-slate-100 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

/* ─── skeleton category pill ───────────────────────────────── */
function SkeletonPill({ width = 'w-20' }: { width?: string }) {
  return (
    <div
      className={`${width} h-9 bg-slate-100 rounded-xl animate-pulse shrink-0`}
    />
  );
}

/* ─── main component ───────────────────────────────────────── */
export default function FoodGrid({
  foods,
  categories,
  search,
  category,
  updateURL,
  onAdd,
  isLoading,
}: any) {
  const categoriesReady = categories && categories.length > 0;

  return (
    <div className="space-y-4 lg:space-y-5">

      {/* ═══════════════════════════════════════
          SEARCH BAR
      ═══════════════════════════════════════ */}
      <div
        className="
          bg-white border border-slate-100 rounded-2xl
          p-3 sm:p-4
          flex items-center gap-3
          transition-shadow duration-200 focus-within:shadow-md
          focus-within:border-indigo-200
        "
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
          <Search size={16} className="text-slate-400" />
        </div>
        <Input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateURL({ search: e.target.value, page: '1' })
          }
          placeholder="Search foods..."
          className="border-0 shadow-none bg-transparent text-sm sm:text-base"
        />
      </div>

      {/* ═══════════════════════════════════════
          CATEGORY FILTERS
      ═══════════════════════════════════════ */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 sm:gap-3 min-w-max">

          {!categoriesReady ? (
            /* skeleton pills */
            <>
              <SkeletonPill width="w-12" />
              <SkeletonPill width="w-24" />
              <SkeletonPill width="w-20" />
              <SkeletonPill width="w-28" />
              <SkeletonPill width="w-16" />
              <SkeletonPill width="w-22" />
            </>
          ) : (
            <>
              <ListButton
                label="All"
                isActive={category === ''}
                onClick={() => updateURL({ category: '', page: '1' })}
              />
              {categories.map((cat: any) => (
                <ListButton
                  key={cat._id}
                  label={cat.title}
                  isActive={category === cat._id}
                  onClick={() =>
                    updateURL({ category: cat._id, page: '1' })
                  }
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          FOOD GRID
      ═══════════════════════════════════════ */}
      <div
        className="
          grid gap-4 lg:gap-5
          grid-cols-1
          xs:grid-cols-2
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-3
          2xl:grid-cols-4
        "
      >
        {/* ── skeleton loading state ── */}
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}

        {/* ── empty state ── */}
        {!isLoading && foods?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
              🍽️
            </div>
            <p className="text-slate-400 font-bold text-sm">No foods found</p>
          </div>
        )}

        {/* ── real cards with staggered entrance ── */}
        {!isLoading &&
          foods?.map((item: any, i: number) => (
            <div
              key={item._id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${i * 40}ms`,
                animationFillMode: 'both',
              }}
            >
              <FoodCard item={item} onAdd={onAdd} />
            </div>
          ))}
      </div>
    </div>
  );
}