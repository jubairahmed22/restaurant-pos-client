'use client';

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function OrderItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: any) {
  return (
    <div className="border border-slate-100 rounded-xl p-3 bg-white">

      <div className="flex gap-3">

        <img
          src={item.image}
          className="w-20 h-20 rounded-xl object-cover"
        />

        <div className="flex-1">

          <div className="flex justify-between">

            <div>
              <h4 className="font-black text-slate-700 text-sm">
                {item.title}
              </h4>

              <p className="text-xs text-slate-400 mt-1">
                Premium Food
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">

              <button onClick={() => onDecrease(item._id)}>
                <Minus size={14} />
              </button>

              <span className="text-sm font-black w-4 text-center">
                {item.qty}
              </span>

              <button onClick={() => onIncrease(item._id)}>
                <Plus size={14} />
              </button>
            </div>

          </div>

          <div className="flex justify-between mt-4">

            <span className="font-black text-lg">
              ${(item.price * item.qty).toFixed(2)}
            </span>

            <button
              onClick={() => onRemove(item._id)}
              className="text-rose-500"
            >
              <Trash2 size={16} />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}