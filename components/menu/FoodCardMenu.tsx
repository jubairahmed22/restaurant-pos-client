'use client';

import { Plus } from 'lucide-react';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';

export default function FoodCardMenu({ item, onAdd }: any) {
  const imgSrc = item.image || PLACEHOLDER;

  return (
    <div className="flex flex-col  rounded-2xl overflow-hidden  cursor-pointer group">

      {/* ── IMAGE ── */}
      <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
        />

        {/* + button — top right */}
        <button
          onClick={() => onAdd(item)}
          aria-label={`Add ${item.title} to cart`}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 active:scale-95 transition-all duration-150 z-10"
        >
          <Plus size={20} strokeWidth={2.5} className="text-slate-800" />
        </button>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex flex-col gap-1 py-3">
        {/* fixed 2-line height — stays constant whether title is 1 or 2 lines */}
        <div className=" overflow-hidden">
          <h3 className="text-slate-900 font-bold text-[15px] leading-snug line-clamp-2">
            {item.title}
          </h3>
        </div>

        {/* fixed 2-line height — always rendered so price never shifts up */}
        <div className=" overflow-hidden">
          {item.description && (
            <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-1">
              {item.description}
            </p>
          )}asdfsad
        </div>

        <p className="text-slate-800 font-black text-[17px] mt-1">
          AUD {Number(item.price).toFixed(2)}
        </p>
      </div>
    </div>
  );
}