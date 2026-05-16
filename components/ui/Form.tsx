// components/ui/Form.tsx
import { ChevronDown } from 'lucide-react';
import React from 'react';

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    {children}
  </label>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-600 placeholder:text-slate-400"
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none min-h-[100px] text-slate-600"
  />
);

export const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select
      {...props}
      className="w-full appearance-none px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 outline-none text-slate-600 cursor-pointer"
    >
      {children}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <ChevronDown size={16} />
    </div>
  </div>
);