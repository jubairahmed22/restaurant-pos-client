'use client';

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function OrderItemMenu({
  item,
  onIncrease,
  onDecrease,asdfsad
  onRemove,
}: any) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-slate-200 hover:bg-slate-50 shadow-sm">

      {/* Subtle Premium Overlay on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-slate-100/50 via-transparent to-slate-100/30" />

      <div className="relative flex gap-4">

        {/* Product Image */}
        <div className="relative shrink-0">
          <img
            src={item.image}
            alt={item.title}
            className="w-24 h-24 rounded-2xl object-cover border border-slate-100"
          />

          {/* Qty Badge */}
          <div className="absolute -top-2 -right-2 bg-[#1B3A6B] text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md">
            x{item.qty}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">

          {/* Top Row */}
          <div className="flex items-start justify-between gap-3">

            <div>
              <h4 className="text-[#1B3A6B] font-bold text-sm md:text-base leading-tight">
                {item.title}
              </h4>

              <p className="text-slate-400 text-xs mt-1 font-medium">
                ${item.price.toFixed(2)} each
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-2xl p-1 backdrop-blur-sm">

              <button
                onClick={() => onDecrease(item._id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-[#1B3A6B] hover:text-white transition-all duration-200 cursor-pointer"
              >
                <Minus size={14} />
              </button>

              <span className="w-8 text-center text-[#1B3A6B] font-bold text-sm">
                {item.qty}
              </span>

              <button
                onClick={() => onIncrease(item._id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-[#1B3A6B] hover:text-white transition-all duration-200 cursor-pointer"
              >
                <Plus size={14} />
              </button>

            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between mt-4">

            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                Total
              </p>

              <h3 className="text-[#1B3A6B] text-lg font-bold">
                ${(item.price * item.qty).toFixed(2)}
              </h3>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item._id)}
              className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 cursor-pointer"
            >
              <Trash2 size={16} />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}