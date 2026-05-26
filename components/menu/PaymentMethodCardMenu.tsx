'use client';

import React from 'react';

export default function PaymentMethodCardMenu({
  active,
  title,
  icon,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between border rounded-xl px-4 py-3 ${
        active
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-bold">{title}</span>
      </div>

      <div
        className={`w-4 h-4 rounded-full border-2 ${
          active ? 'bg-indigo-600' : ''
        }`}
      />
    </button>
  );
}