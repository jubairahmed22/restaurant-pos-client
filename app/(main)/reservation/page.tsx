"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Calendar } from 'lucide-react';
import { ReservationService } from '@/services/reservationService';
import toast from 'react-hot-toast';

import slideOne from '../../assest/slideOne.avif';
import slideTwo from '../../assest/slideTwo.avif';
import Link from 'next/link';

// ─── helpers ──────────────────────────────────────────────────────────────────

function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += 5) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots(16, 22);

const slides = [
  {
    id: 1, img: slideOne,
    title: "The Best Pasta Outside of Italy",
    desc: "I'm Italian, and let me tell you, this pasta tastes like home.",
    rating: "4.8", reviews: "1,240"
  },
  {
    id: 2, img: slideTwo,
    title: "A Culinary Masterpiece",
    desc: "Every bite tells a story of tradition and quality.",
    rating: "4.9", reviews: "850"
  },
];

const openingHours = [
  { day: "Monday",    time: "Closed" },
  { day: "Tuesday",   time: "16:00 - 22:00" },
  { day: "Wednesday", time: "16:00 - 22:00" },
  { day: "Thursday",  time: "16:00 - 22:00" },
  { day: "Friday",    time: "17:00 - 22:00" },
  { day: "Sat - Sun", time: "17:00 - 22:00" },
];

const INIT = { fullName: '', email: '', phone: '', people: '', date: '', time: '', notes: '' };

export default function BookingPage() {
  const [current, setCurrent]   = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [form, setForm]         = useState(INIT);
  const [loading, setLoading]   = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, [nextSlide, isPaused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.phone || !form.people || !form.date || !form.time) {
      toast.error('Please fill in all required fields.');
      return;
    }
    try {
      setLoading(true);
      await ReservationService.createReservation({
        fullName: form.fullName,
        email:    form.email,
        phone:    form.phone,
        people:   Number(form.people),
        date:     form.date,
        time:     form.time,
        notes:    form.notes,
      });
      toast.success('Table reserved successfully!');
      setForm(INIT);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen w-full flex flex-col lg:flex-row bg-[#0a0a0a] text-white font-sans selection:bg-white/20 '>

      {/* ── LEFT SIDE (Slider) ── 
          - On mobile/tablet: fixed h-64
          - On desktop: full h-screen and 70% width
      */}
      <div
        className='relative w-full lg:w-[70%] h-64 lg:h-screen overflow-hidden group flex-shrink-0'
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <Image src={slides[current].img} alt="bg" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/30 lg:bg-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Floating Testimonial - Adjusted for small screens */}
        <div className="absolute bottom-4 left-4 right-4 lg:bottom-12 lg:left-12 z-20 max-w-lg p-6 lg:p-10 rounded-[1.5rem] lg:rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10">
          <h2 className="text-xl lg:text-4xl font-serif italic mb-2 lg:mb-4 leading-tight">"{slides[current].title}"</h2>
          <p className="hidden md:block text-gray-300 font-light mb-4 lg:mb-6 text-sm lg:text-base leading-relaxed">"{slides[current].desc}"</p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => <div key={i} className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-zinc-800 border border-zinc-900" />)}
            </div>
            <span className="text-xs lg:text-sm font-bold">
              {slides[current].rating}{' '}
              <span className="text-zinc-500 font-normal">({slides[current].reviews})</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE (Content) ── 
          - On mobile: natural height (scrolls with page)
          - On desktop: fixed h-screen with internal scroll
      */}
      <div className='w-full lg:w-[30%] h-auto lg:h-screen bg-[#0a0a0a] flex flex-col gap-4 overflow-y-auto p-4 no-scrollbar'>

        {/* Booking Card */}
        <div className="w-full bg-[#121210] p-6 lg:p-8 rounded-[2rem] flex flex-col gap-8 flex-shrink-0 border border-white/5">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif italic mb-3">Reservation</h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">
              Book your table and savor the authentic taste of Italy.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name">
                <input name="fullName" value={form.fullName} onChange={handleChange}
                  type="text" placeholder="Jane Smith" className={inputCls} />
              </Field>
              <Field label="Email">
                <input name="email" value={form.email} onChange={handleChange}
                  type="email" placeholder="jane@example.com" className={inputCls} />
              </Field>
              <Field label="Phone Number">
                <input name="phone" value={form.phone} onChange={handleChange}
                  type="text" placeholder="+420 123 456 789" className={inputCls} />
              </Field>
              <Field label="Guests">
                <input name="people" value={form.people} onChange={handleChange}
                  type="number" min={1} max={20} placeholder="1–20" className={inputCls} />
              </Field>
              <Field label="Date">
                <input name="date" value={form.date} onChange={handleChange}
                  type="date" className={inputCls} style={{ colorScheme: 'dark' }} />
              </Field>
              <Field label="Time Slot">
                <select name="time" value={form.time} onChange={handleChange} className={inputCls}>
                  <option value="">Select time</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Special Requests (optional)">
              <textarea name="notes" value={form.notes} onChange={handleChange}
                placeholder="Allergies, seating preference…"
                rows={2}
                className={`${inputCls} resize-none w-full`}
              />
            </Field>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#fdfcf5] text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] lg:text-xs hover:bg-[#f0eee0] transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="w-full bg-[#161813] p-6 lg:p-8 rounded-[2rem] flex flex-col gap-6 flex-shrink-0">
          <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Opening Hours</h4>
          <div className="flex flex-col gap-4">
            {openingHours.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[14px]">
                <span className="text-zinc-300 font-light">{item.day}</span>
                <div className="flex-grow mx-4 border-b border-dotted border-zinc-800 h-1" />
                <span className={item.time === "Closed" ? "text-zinc-500 font-bold" : "text-zinc-300"}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Grid */}
        <div className="grid grid-cols-2 gap-4 flex-shrink-0">
          <div className="bg-[#161813] p-5 lg:p-6 rounded-3xl flex items-center justify-center lg:justify-between group cursor-pointer border border-white/5 transition-colors hover:bg-zinc-800">
            <span className="text-xs font-light text-zinc-300">X / Twitter</span>
            <X size={14} className="hidden lg:block text-zinc-500 group-hover:text-white" />
          </div>
          <div className="bg-[#161813] p-5 lg:p-6 rounded-3xl flex items-center justify-center lg:justify-between group cursor-pointer border border-white/5 transition-colors hover:bg-zinc-800">
            <span className="text-xs font-light text-zinc-300">Instagram</span>
            <ChevronRight size={14} className="hidden lg:block text-zinc-500 group-hover:text-white" />
          </div>
        </div>

        {/* Footer */}
        <div className="w-full bg-[#161813] py-12 px-8 rounded-[2rem] flex flex-col items-center gap-12 flex-shrink-0 mb-4">
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-xl font-serif italic">Menu</h3>
            <div className="flex flex-col items-center gap-4 text-white/70 font-light text-[14px]">
              {["Home","Menu","About","Restaurant","Reservation"].map(link => (
                <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
          
          <Link target='_blank' href="https://www.linkedin.com/in/jubairahmed10/">
            <div className="pt-8 border-t border-white/5 w-full flex flex-col items-center gap-4">
              <div className="bg-white text-black px-6 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
                <span className="rotate-45 block">▲</span> Made by Jubair Ahmed
              </div>
            </div>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        select option { background: #121210; color: white; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1); opacity: 0.5; cursor: pointer;
        }
      `}</style>
    </div>
  );
}

const inputCls = "bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors text-white w-full placeholder:text-zinc-700";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-zinc-400 font-serif italic text-xs">{label}</label>
      {children}
    </div>
  );
}