'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, Zap, SkipForward, CalendarClock, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePickupStore } from '@/store/pickupStore';
import rinLogo from '@/app/assest/Rin_Logo.png';

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
const PICKUP_COLOR = '#1B3A6B';

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
    const rounded = Math.ceil((nowMin + 15) / 5) * 5;
    startMin = Math.max(startMin, rounded);
  }

  const endMin = hours.close * 60 - 15;
  const slots: string[] = [];
  for (let min = startMin; min <= endMin; min += 5) {
    const hh = Math.floor(min / 60);
    const mm = min % 60;
    slots.push(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
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

function buildDays() {
  const days: { date: Date; ymd: string; label: string; isOpen: boolean }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    days.push({
      date:   d,
      ymd:    toLocalYMD(d),
      label:  i === 0 ? 'Today' : DAY_ABBR[dow],
      isOpen: OPENING[dow] !== null,
    });
  }
  return days;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'landing' | 'pickup-options' | 'asap' | 'preorder';

interface Props {
  isOpen:     boolean;
  onClose:    () => void;
  onConfirm?: () => void;
}

// ─── Back button (top-level so React compiler doesn't flag it) ───────────────

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
    >
      <ChevronLeft size={16} />
    </button>
  );
}

// ─── Outer wrapper: unmounts inner on close so state resets automatically ────

export default function PickupTimeModal({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null;
  return <PickupTimeModalContent onClose={onClose} onConfirm={onConfirm} />;
}

// ─── Inner component — always mounts fresh ────────────────────────────────────

function PickupTimeModalContent({ onClose, onConfirm }: Omit<Props, 'isOpen'>) {
  const router     = useRouter();
  const { setPickup } = usePickupStore();

  const days    = useMemo(() => buildDays(), []);
  const VISIBLE = 4;

  const [view,          setView]          = useState<View>('landing');
  const [carouselStart, setCarouselStart] = useState(0);
  const [selectedYmd,   setSelectedYmd]   = useState<string>(
    () => days.find(d => d.isOpen)?.ymd ?? ''
  );
  const [selectedTime,  setSelectedTime]  = useState<string>('');

  const selectedDay  = days.find(d => d.ymd === selectedYmd);
  const slots        = useMemo(() => (selectedDay ? generateSlots(selectedDay.date) : []), [selectedDay]);
  const grouped      = useMemo(() => groupByHour(slots), [slots]);
  const visibleDays  = days.slice(carouselStart, carouselStart + VISIBLE);

  // ── Navigation helpers (clear time in event handler, not effect) ──────────

  const enterPreorder = () => {
    setSelectedTime('');
    setView('preorder');
  };

  const selectDate = (ymd: string) => {
    setSelectedYmd(ymd);
    setSelectedTime('');
  };

  // ── Confirm handlers ──────────────────────────────────────────────────────

  const confirmAsap = () => {
    const now = new Date();
    const dow = now.getDay();
    setPickup({
      date:        toLocalYMD(now),
      time:        'asap',
      displayDate: `${DAY_ABBR[dow]} ${String(now.getDate()).padStart(2, '0')}`,
      displayTime: 'ASAP',
      isAsap:      true,
    });
    onConfirm?.();
    onClose();
  };

  const confirmPreorder = () => {
    if (!selectedTime) return;
    const d = days.find(d2 => d2.ymd === selectedYmd);
    if (!d) return;
    const dow = d.date.getDay();
    setPickup({
      date:        selectedYmd,
      time:        selectedTime,
      displayDate: `${DAY_ABBR[dow]} ${String(d.date.getDate()).padStart(2, '0')}`,
      displayTime: format24to12(selectedTime),
      isAsap:      false,
    });
    onConfirm?.();
    onClose();
  };
  asdfsd
  const skipToMenu = () => { onClose(); router.push('/menu'); };
  const goReservation = () => { onClose(); router.push('/reservation'); };

  // ── Render ────────────────────────────────────────────────────────────────

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

        {/* ══════════ LANDING ══════════ */}
        {view === 'landing' && (
          <div className="flex flex-col items-center px-6 pt-10 pb-8 gap-8">

            {/* Logo + name */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-12">
                <Image src={rinLogo} alt="RIN Logo" fill className="object-contain" priority />
              </div>
              <div className="border-l border-slate-200 pl-4">
                <p className="text-2xl font-black tracking-[0.25em] text-[#1B3A6B]">RIN</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold">Japanese Food</p>
              </div>
            </div>

            <p className="text-slate-500 text-sm text-center leading-relaxed -mt-2">
              How would you like to enjoy your meal today?
            </p>

            <div className="grid grid-cols-1 gap-3 w-full">
              <button
                onClick={() => setView('pickup-options')}
                className="flex flex-row items-center justify-center gap-3 py-4 rounded-2xl border-2 border-[#1B3A6B] bg-[#1B3A6B] text-white hover:bg-[#14305a] transition-all shadow-md"
              >
                <UtensilsCrossed size={26} />
                <span className="text-sm font-bold tracking-wide">Pick Up</span>
              </button>
              <button
                onClick={goReservation}
                className="flex flex-row items-center justify-center gap-3 py-4 rounded-2xl border-2 border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#1B3A6B]/5 transition-all"
              >
                <CalendarClock size={26} />
                <span className="text-sm font-bold tracking-wide">Reservation</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════ PICKUP OPTIONS ══════════ */}
        {view === 'pickup-options' && (
          <>
            <BackBtn onClick={() => setView('landing')} />
            <div className="flex flex-col items-center px-6 pt-10 pb-8 gap-4">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Choose pickup type</h2>

              <button
                onClick={enterPreorder}
                className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl border-2 border-slate-200 hover:border-[#1B3A6B] hover:bg-[#1B3A6B]/5 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center shrink-0 group-hover:bg-[#1B3A6B]/15 transition">
                  <Clock size={22} className="text-[#1B3A6B]" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm">Pre Order</p>
                  <p className="text-xs text-slate-400 mt-0.5">Schedule a specific pickup time</p>
                </div>
                <ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-[#1B3A6B] transition" />
              </button>

              <button
                onClick={() => setView('asap')}
                className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl border-2 border-slate-200 hover:border-[#1B3A6B] hover:bg-[#1B3A6B]/5 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition">
                  <Zap size={22} className="text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm">ASAP</p>
                  <p className="text-xs text-slate-400 mt-0.5">Order now, pick up as soon as ready</p>
                </div>
                <ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-[#1B3A6B] transition" />
              </button>

              <button
                onClick={skipToMenu}
                className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition">
                  <SkipForward size={22} className="text-slate-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-500 text-sm">Skip to Menu</p>
                  <p className="text-xs text-slate-400 mt-0.5">Browse without scheduling a time</p>
                </div>
                <ChevronRight size={18} className="ml-auto text-slate-200 group-hover:text-slate-400 transition" />
              </button>
            </div>
          </>
        )}

        {/* ══════════ ASAP ══════════ */}
        {view === 'asap' && (
          <>
            <BackBtn onClick={() => setView('pickup-options')} />
            <div className="flex flex-col items-center px-6 pt-14 pb-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${PICKUP_COLOR}15` }}>
                <Zap size={28} style={{ color: PICKUP_COLOR }} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">ASAP Pickup</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-xs">
                Your order will be prepared immediately and ready for pickup as soon as possible.
              </p>
            </div>
            <div className="px-6 pb-6 pt-4 shrink-0">
              <button
                onClick={confirmAsap}
                className="w-full h-13 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-90"
                style={{ background: PICKUP_COLOR }}
              >
                <Zap size={16} />
                Confirm ASAP Pickup
              </button>
            </div>
          </>
        )}

        {/* ══════════ PRE-ORDER ══════════ */}
        {view === 'preorder' && (
          <>
            <BackBtn onClick={() => setView('pickup-options')} />

            <div className="pt-14 pb-2 px-6 text-center shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Select pickup time</h2>
            </div>

            {/* Date Carousel */}
            <div className="flex items-center gap-2 px-4 my-4 shrink-0">
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
                  return (
                    <button
                      key={day.ymd}
                      onClick={() => day.isOpen && selectDate(day.ymd)}
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
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-0.5 rounded" style={{ background: PICKUP_COLOR }} />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{hourLabel}</span>
                    </div>
                    <div className="space-y-2 pl-1">
                      {hourSlots.map(slot => {
                        const isChosen = slot === selectedTime;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition"
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                isChosen ? 'border-transparent' : 'border-slate-300'
                              }`}
                              style={isChosen ? { borderColor: PICKUP_COLOR } : {}}
                            >
                              {isChosen && <div className="w-2.5 h-2.5 rounded-full" style={{ background: PICKUP_COLOR }} />}
                            </div>
                            <span
                              className={`text-sm ${isChosen ? 'font-bold' : 'font-medium text-slate-700'}`}
                              style={isChosen ? { color: PICKUP_COLOR } : {}}
                            >
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

            <div className="px-6 pb-6 pt-3 shrink-0">
              <button
                onClick={confirmPreorder}
                disabled={!selectedTime}
                className="w-full h-13 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:opacity-90"
                style={{ background: PICKUP_COLOR }}
              >
                <Clock size={16} />
                {selectedTime ? `Confirm ${format24to12(selectedTime)}` : 'Select a time'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
