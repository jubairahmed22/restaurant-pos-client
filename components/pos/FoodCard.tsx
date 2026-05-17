'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function FoodCard({ item, onAdd }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm relative group overflow-hidden">

      <span className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10">
        Best Seller
      </span>

      <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50">
        <img
          src={item.image}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="flex justify-between items-start mb-2 gap-3">
        <h3 className="font-black text-slate-800">
          {item.title}
        </h3>

        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
          <span className="text-orange-400 text-xs">★</span>
          <span className="text-[10px] font-bold text-slate-600">
            4.8/5
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 font-bold mb-4">
        Premium Food Collection
      </p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-indigo-500 uppercase">
            Regular Price
          </p>

          <span className="text-lg font-black text-slate-800">
            ${item.price}
          </span>
        </div>

        <button
          onClick={() => onAdd(item)}
          className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white"
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  );
}