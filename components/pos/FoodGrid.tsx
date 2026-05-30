'use client';

import React, { useMemo } from 'react';
import { Search } from 'lucide-react';

import FoodCard from './FoodCard';
import { Input } from '@/components/ui/Form';
import { ListButton } from '@/components/ui/ListButton';

export default function FoodGrid({
  foods,
  categories,
  search,
  category,
  updateURL,
  onAdd,
  isLoading,
}: any) {

  /* ─────────────────────────────────────────────
     GROUP FOODS BY CATEGORY
  ───────────────────────────────────────────── */
  const groupedFoods = useMemo(() => {
    if (!categories?.length || !foods?.length) return [];

    return categories
      .map((cat: any) => ({
        ...cat,
        foods: foods.filter(
          (food: any) =>
            food.category === cat._id ||
            food.category?._id === cat._id
        ),
      }))
      .filter((cat: any) => cat.foods.length > 0);
  }, [foods, categories]);

  return (
    <div className="h-[100dvh] flex flex-col gap-4 overflow-hidden">

    <div className='flex flex-col'>
            {/* ─────────────────────────────────────────
          SEARCH
      ───────────────────────────────────────── */}
      <div
        className="
          bg-white border border-slate-100 rounded
          p-3 sm:p-4
          flex items-center gap-3
          shrink-0
        "
      >
        {/* <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          <Search size={18} className="text-slate-400" />
        </div> */}

        <Input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateURL({ search: e.target.value, page: '1' })
          }
          placeholder="Search foods..."
          className="border-0 shadow-none bg-transparent"
        />
      </div>

      {/* ─────────────────────────────────────────
          CATEGORY FILTERS
      ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded p-3 overflow-x-auto shrink-0">
        <div className="flex items-center gap-2 min-w-max">
          <ListButton
            label="All"
            isActive={category === ''}
            onClick={() => updateURL({ category: '', page: '1' })}
          />

          {categories?.map((cat: any) => (
            <ListButton
              key={cat._id}
              label={cat.title}
              isActive={category === cat._id}
              onClick={() =>
                updateURL({ category: cat._id, page: '1' })
              }
            />
          ))}
        </div>
      </div>
    </div>

      {/* ─────────────────────────────────────────
          SCROLLABLE CATEGORY SECTIONS
      ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-10">

        {isLoading && (
          <div className="text-center py-10 text-slate-400">
            Loading foods...
          </div>
        )}
asdfasdf
        {!isLoading &&
          groupedFoods.map((group: any) => (
            <div key={group._id} className="space-y-5">

              {/* CATEGORY TITLE */}
              <h2 className="text-xl font-black text-gray-700">
                {group.title}
              </h2>

              {/* FOOD GRID */}
              <div
                className="
                  grid gap-4 lg:gap-5
                  grid-cols-2
                  sm:grid-cols-2
                  lg:grid-cols-3
                  2xl:grid-cols-4
                "
              >
                {group.foods.map((item: any, i: number) => (
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
          ))}

        {!isLoading && groupedFoods.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-slate-400 font-semibold">
              No foods found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}