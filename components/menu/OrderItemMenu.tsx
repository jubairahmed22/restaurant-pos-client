'use client';

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function OrderItemMenu({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: any) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white p-4 transition-all duration-300 hover:border-white/20 hover:bg-[#161616]">

      {/* Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-white/[0.03] via-transparent to-white/[0.02]" />

      <div className="relative flex gap-4">

        {/* Product Image */}
        <div className="relative">
          <img
            src={item.image}
            alt={item.title}
            className="w-24 h-24 rounded-2xl object-cover border border-white/10"
          />

          {/* Qty Badge */}
          <div className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
            x{item.qty}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">

          {/* Top */}
          <div className="flex items-start justify-between gap-3">

            <div>
              <h4 className="text-white font-bold text-sm md:text-base leading-tight">
                {item.title}
              </h4>

              <p className="text-slate-400 text-xs mt-1">
                ${item.price.toFixed(2)} each
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-sm">

              <button
                onClick={() => onDecrease(item._id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white hover:text-black transition-all duration-200"
              >
                <Minus size={14} />
              </button>

              <span className="w-8 text-center text-white font-bold text-sm">
                {item.qty}
              </span>

              <button
                onClick={() => onIncrease(item._id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white hover:text-black transition-all duration-200"
              >
                <Plus size={14} />
              </button>

            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between mt-5">

            <div>
              <p className="text-slate-500 text-[11px] uppercase tracking-widest">
                Total
              </p>

              <h3 className="text-white text-lg font-black">
                ${(item.price * item.qty).toFixed(2)}
              </h3>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item._id)}
              className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300"
            >
              <Trash2 size={16} />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}