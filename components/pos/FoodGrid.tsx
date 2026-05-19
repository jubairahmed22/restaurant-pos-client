'use client';

import React from 'react';
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
  return (
    <div className="space-y-5">

      {/* =========================
          SEARCH BAR
      ========================= */}
      <div className="bg-white border border-slate-100 rounded p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          <Search size={18} className="text-slate-400" />
        </div>
        <Input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateURL({ search: e.target.value, page: '1' })
          }
          placeholder="Search foods..."
          className="border-0 shadow-none bg-transparent"
        />
      </div>

      {/* =========================
          CATEGORY FILTERS
      ========================= */}
      <div className="bg-white border border-slate-100 rounded p-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 min-w-max">

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
              onClick={() => updateURL({ category: cat._id, page: '1' })}
            />
          ))}
        </div>
      </div>

      {/* =========================
          FOOD GRID
      ========================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">

        {isLoading && (
          <div className="col-span-full text-center py-10 text-slate-400 font-bold">
            Loading foods...
          </div>
        )}

        {!isLoading && foods?.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-400 font-bold">
            No foods found
          </div>
        )}

        {foods?.map((item: any) => (
          <FoodCard
            key={item._id}
            item={item}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  );
}