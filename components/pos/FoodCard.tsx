'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export default function FoodCard({ item, onAdd }: any) {
  return (
    <div className="flex flex-col gap-2 rounded ">

      {/* ── IMAGE CARD ── */}
      <div className="relative rounded-3xl overflow-hidden aspect-square bg-slate-100 group">

        {/* Food image — full bleed */}
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Dark gradient overlay — bottom half only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* + button — top right */}
        <button
          onClick={() => onAdd(item)}
          aria-label={`Add ${item.title} to cart`}
          className="
            absolute top-3 right-3
            w-11 h-11
            bg-white rounded-full
            flex items-center justify-center
            shadow-md
            hover:bg-slate-100
            active:scale-95
            transition-all duration-150
            z-10
          "
        >
          <Plus size={22} strokeWidth={2.5} className="text-slate-800" />
        </button>

        {/* Bottom overlay — price + title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-0.5 z-10">

          {/* Price badge */}
          <span
            className="
              self-start
              bg-white text-slate-800
              text-sm font-semibold
              px-3 py-1 rounded-full text-[12px]
              shadow-sm
              mb-1
            "
          >
            ${Number(item.price).toFixed(2)}
          </span>

          {/* Title */}
          <h3
            className="
              text-white content font-semibold
              text-md 
            "
          >
            {item.title}
          </h3>
        </div>
      </div>

      {/* ── DESCRIPTION below card ── */}
   {item.description && (
  <p className='text-gray-700 font-semibold text-[12px]'>
    {item.description.split(' ').length > 10
      ? item.description.split(' ').slice(0, 5).join(' ') + '..'
      : item.description}
  </p>
)}
    </div>
  );
}