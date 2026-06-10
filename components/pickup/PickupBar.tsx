'use client';

import { ChevronDown, Edit2 } from 'lucide-react';
import { usePickupStore } from '@/store/pickupStore';

const PICKUP_COLOR = '#1B3A6B';

interface Props {
  onEdit: () => void;
  className?: string;
}

export default function PickupBar({ onEdit, className = '' }: Props) {
  const { isSet, displayDate, displayTime, isAsap } = usePickupStore();

  if (!isSet) return null;

  return (
    <div className={`flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm ${className}`}>
      {/* Pickup label */}
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 text-slate-700 font-bold text-sm shrink-0"
      >
        Pickup
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {/* Separator */}
      <div className="w-px h-5 bg-slate-200 shrink-0" />

      {/* Date */}
      <span className="text-sm font-bold shrink-0" style={{ color: PICKUP_COLOR }}>
        {displayDate}
      </span>

      {/* Separator */}
      <div className="w-px h-5 bg-slate-200 shrink-0" />

      {/* Time */}
      <span className="text-sm text-slate-600 font-medium shrink-0">
        {isAsap ? 'ASAP' : displayTime}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Edit */}
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors shrink-0"
        style={{ color: PICKUP_COLOR }}
      >
        <Edit2 size={13} />
        Edit
      </button>
    </div>
  );
}
