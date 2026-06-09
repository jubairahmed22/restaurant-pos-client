'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, Zap } from 'lucide-react';
import { usePickupStore } from '@/store/pickupStore';

// ─── Restaurant opening hours (day-of-week 0=Sun) ────────────────────────────
const OPENING: Record<number, { open: number; close: number } | null> = {
  0: { open: 17, close: 22 }, // Sun
  1: null,                     // Mon – closed
  2: { open: 16, close: 22 }, // Tue
  3: { open: 16, close: 22 }, // Wed
  4: { open: 16, close: 22 }, // Thu
  5: { open: 17, close: 22 }, // Fri
  6: { open: 17, close: 22 }, // Sat
};

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PICKUP_COLOR = '#C05428';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toLocalYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function format24to12(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatHourRange(h: number) {
  const fmt = (n: number) => {
    const p = n >= 12 ? 'PM' : 'AM';
    const h12 = n % 12 === 0 ? 12 : n % 12;
    return `${String(h12).padStart(2, '0')}:00 ${p}`;
  };
  return `${fmt(h)} - ${fmt(h + 1)}`;
}

function generateSlots(date: Date): string[] {
  const dow = date.getDay();
  const hours = OPENING[dow];
  if (!hours) return [];

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  let startMin = hours.open * 60;

  if (isToday) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const buffered = nowMin + 15;
    const rounded = Math.ceil(buffered / 5) * 5;
    startMin = Math.max(startMin, rounded);
  }

  const endMin = hours.close * 60 - 15;
  const slots: string[] = [];
  for (let m = startMin; m <= endMin; m += 5) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return slots;
}

function groupByHour(slots: string[]) {
  const map = new Map<string, string[]>();
  for (const s of slots) {
    const h = parseInt(s.split(':')[0]);
    const key = formatHourRange(h);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}

// ─── Build 7-day list starting today ─────────────────────────────────────────
function buildDays() {
  const days: { date: Date; ymd: string; label: string; sub: string; isOpen: boolean }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    const open = OPENING[dow] !== null;
    days.push({
      date:  d,
      ymd:   toLocalYMD(d),
      label: i === 0 ? 'Today' : DAY_ABBR[dow],
      sub:   `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-AU', { month: 'short' })}`,
      isOpen: open,
    });
  }
  return days;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  isOpen:   boolean;
  onClose:  () => void;
  onConfirm?: () => void; // optional: called after store is updated
}

export default function PickupTimeModal({ isOpen, onClose, onConfirm }: Props) {
  const { setPickup } = usePickupStore();

  const [mode,         setMode]        = useState<'asap' | 'preorder'>('asap');
  const [carouselStart, setCarouselStart] = useState(0);
  const [selectedYmd,  setSelectedYmd]  = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const days = useMemo(buildDays, []);
  const VISIBLE = 4;

  // Default to first open day
  useEffect(() => {
    if (!isOpen) return;
    const first = days.find(d => d.isOpen);
    if (first) setSelectedYmd(first.ymd);
  }, [isOpen, days]);

  const selectedDay = days.find(d => d.ymd === selectedYmd);
  const slots       = useMemo(() => selectedDay ? generateSlots(selectedDay.date) : [], [selectedDay]);
  const grouped     = useMemo(() => groupByHour(slots), [slots]);

  // Reset selected time when day/mode changes
  useEffect(() => { setSelectedTime(''); }, [selectedYmd, mode]);

  if (!isOpen) return null;

  const visibleDays = days.slice(carouselStart, carouselStart + VISIBLE);

  const handleConfirm = () => {
    if (mode === 'asap') {
      const now = new Date();
      const dow = now.getDay();
      const displayDate = `${DAY_ABBR[dow]} ${String(now.getDate()).padStart(2, '0')}`;
      setPickup({
        date:        toLocalYMD(now),
        time:        'asap',
        displayDate,
        displayTime: 'ASAP',
        isAsap:      true,
      });
      onConfirm?.();
      onClose();
      return;
    }

    if (!selectedTime) return;
    const d = days.find(d2 => d2.ymd === selectedYmd);
    if (!d) return;
    const dow = d.date.getDay();
    const displayDate = `${DAY_ABBR[dow]} ${String(d.date.getDate()).padStart(2, '0')}`;
    setPickup({
      date:        selectedYmd,
      time:        selectedTime,
      displayDate,
      displayTime: format24to12(selectedTime),
      isAsap:      false,
    });
    onConfirm?.();
    onClose();
  };

  const canConfirm = mode === 'asap' || !!selectedTime;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
        >
          <X size={15} />
        </button>

        {/* Title */}
        <div className="pt-7 pb-4 px-6 text-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Time of preorder</h2>
        </div>

        {/* ASAP / Pre-Order tabs */}
        <div className="flex gap-2 px-6 mb-4 shrink-0">
          <button
            onClick={() => setMode('asap')}
            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-bold transition-all ${
              mode === 'asap'
                ? 'text-white shadow-md'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            style={mode === 'asap' ? { background: PICKUP_COLOR } : {}}
          >
            <Zap size={15} />
            ASAP
          </button>
          <button
            onClick={() => setMode('preorder')}
            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-bold transition-all ${
              mode === 'preorder'
                ? 'text-white shadow-md'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            style={mode === 'preorder' ? { background: PICKUP_COLOR } : {}}
          >
            <Clock size={15} />
            Pre-Order
          </button>
        </div>

        {/* ── Pre-Order date + time picker ── */}
        {mode === 'preorder' && (
          <>
            {/* Date Carousel */}
            <div className="flex items-center gap-2 px-4 mb-4 shrink-0">
              <button
                onClick={() => setCarouselStart(s => Math.max(0, s - 1))}
                disabled={carouselStart === 0}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 transition shrink-0"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-2 flex-1 overflow-hidden">
                {visibleDays.map(day => {
                  const isSelected = day.ymd === selectedYmd;
                  const isToday    = day.label === 'Today';
                  return (
                    <button
                      key={day.ymd}
                      onClick={() => day.isOpen && setSelectedYmd(day.ymd)}
                      disabled={!day.isOpen}
                      className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all text-center ${
                        !day.isOpen
                          ? 'bg-slate-50 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      style={isSelected && day.isOpen ? { background: PICKUP_COLOR } : {}}
                    >
                      <span className={`text-[11px] font-semibold mb-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                        {day.label}
                      </span>
                      <span className={`text-xl font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {day.date.getDate()}
                      </span>
                      <span className={`text-[11px] mt-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                        {day.date.toLocaleString('en-AU', { month: 'short' })}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCarouselStart(s => Math.min(days.length - VISIBLE, s + 1))}
                disabled={carouselStart >= days.length - VISIBLE}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 transition shrink-0"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Time slots */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4" style={{ scrollbarWidth: 'none' }}>
              {slots.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  {selectedDay && !selectedDay.isOpen
                    ? 'Restaurant is closed on this day.'
                    : 'No available slots for today. Please pick another day.'}
                </div>
              ) : (
                Array.from(grouped.entries()).map(([hourLabel, hourSlots]) => (
                  <div key={hourLabel}>
                    {/* Hour group header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-0.5 rounded" style={{ background: PICKUP_COLOR }} />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {hourLabel}
                      </span>
                    </div>

                    {/* Slots in this hour */}
                    <div className="space-y-2 pl-1">
                      {hourSlots.map(slot => {
                        const isChosen = slot === selectedTime;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition group"
                          >
                            {/* Radio circle */}
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                isChosen ? 'border-transparent' : 'border-slate-300'
                              }`}
                              style={isChosen ? { borderColor: PICKUP_COLOR } : {}}
                            >
                              {isChosen && (
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PICKUP_COLOR }} />
                              )}
                            </div>
                            <span className={`text-sm font-medium ${isChosen ? 'font-bold' : 'text-slate-700'}`}
                              style={isChosen ? { color: PICKUP_COLOR } : {}}>
                              {format24to12(slot)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ASAP message */}
        {mode === 'asap' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${PICKUP_COLOR}15` }}>
              <Zap size={28} style={{ color: PICKUP_COLOR }} />
            </div>
            <p className="font-bold text-slate-700 text-base">Pick up as soon as ready</p>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-xs">
              Your order will be prepared immediately and ready for pickup as soon as possible.
            </p>
          </div>
        )}

        {/* Confirm button */}
        <div className="px-6 pb-6 pt-3 shrink-0">
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full h-13 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            style={{ background: PICKUP_COLOR, height: '52px' }}
          >
            {mode === 'asap' ? (
              <>
                <Zap size={16} />
                Confirm ASAP Pickup
              </>
            ) : (
              <>
                <Clock size={16} />
                {selectedTime ? `Confirm ${format24to12(selectedTime)}` : 'Select a time'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
