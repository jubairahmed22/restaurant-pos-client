"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ReservationService } from '@/services/reservationService';
import { BlogService, type Blog } from '@/services/blog.service';
import toast from 'react-hot-toast';
import { generateReservationSlots, isOpenDay } from '@/lib/schedule';
import { track } from '@/lib/analytics-tracker';
import { ExternalLink, FileVideo, Loader2 } from 'lucide-react';

import heroImg  from '../../assest/food8.jpg';
import RightPanelFooterCard from '@/components/shared/RightPanelFooterCard';

/* ── Structured data ─────────────────────────────────────────────────────── */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rinrestaurant.com.au';

const reservationSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Book a Table at RIN Japanese Restaurant Hobart',
  description: 'Reserve a table at RIN, authentic Japanese restaurant at 196 Macquarie Street Hobart. Available Tuesday to Saturday, Lunch 11:30 am–2:30 pm and Dinner 5:00 pm–8:30 pm.',
  step: [
    { '@type': 'HowToStep', name: 'Choose your date', text: 'Select a date from Tuesday to Saturday. We are closed Sunday and Monday.' },
    { '@type': 'HowToStep', name: 'Select a session and time', text: 'Choose Lunch (11:30 am–2:30 pm) or Dinner (5:00 pm–8:30 pm) and pick your preferred time slot.' },
    { '@type': 'HowToStep', name: 'Enter your details', text: 'Provide your name, phone number, email, and number of guests (up to 20).' },
    { '@type': 'HowToStep', name: 'Confirm your reservation', text: 'Submit the form. You will receive a confirmation. For large parties, call us on +61 427 634 574.' },
  ],
  totalTime: 'PT2M',
  url: `${SITE_URL}/reservation`,
};

/* ── Styling ─────────────────────────────────────────────────────────────── */
const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#1B3A6B] placeholder-slate-400 focus:outline-none focus:border-[#1B3A6B] focus:bg-white transition-all duration-200";

/* ── Constants ───────────────────────────────────────────────────────────── */
const TIME_SLOTS = generateReservationSlots();

const openingHours = [
  { day: 'Monday',             time: 'Closed' },
  { day: 'Tue – Sat  Lunch',  time: '11:30 am – 2:30 pm' },
  { day: 'Tue – Sat  Dinner', time: '5:00 pm – 8:30 pm' },
  { day: 'Sunday',             time: 'Closed' },
];

const INIT = { fullName: '', email: '', phone: '', people: '', date: '', time: '', notes: '' };

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getDomain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?\s]{11})/);
  return m ? m[1] : null;
}

const GLASS = {
  background: 'rgba(15, 8, 4, 0.68)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
} as const;

/* ── Blog card — glass, fixed width for horizontal slider ───────────────── */ 
function BlogCard({ b }: { b: Blog }) {
  const ytId = b.videoLink ? getYouTubeId(b.videoLink) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={GLASS}
      className="shrink-0 w-64 rounded-2xl border border-white/10 overflow-hidden snap-center"
    >
      {/* Show first image as hero thumbnail */}
      {b.images.length > 0 && (
        <div className="relative w-full h-36 overflow-hidden bg-black/30">
          <Image
            src={b.images[0]}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
          {b.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              +{b.images.length - 1}
            </div>
          )}
        </div>
      )}

      {/* YouTube embed */}
      {!b.images.length && ytId && (
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )} 
      {/* Non-YouTube video link (only if no image/YT) */}
      {!b.images.length && !ytId && b.videoLink && (
        <a
          href={b.videoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 pt-3.5 text-white/50 hover:text-white transition-colors text-[10px]"
        >
          <FileVideo size={13} className="shrink-0" />
          <span className="truncate">{getDomain(b.videoLink)}</span>
          <ExternalLink size={9} className="shrink-0 ml-auto" />
        </a>
      )}
      <div className="p-3.5">
        <h3 className="font-black text-white text-xs mb-1.5 leading-snug line-clamp-2">{b.title}</h3>
        {b.paragraph && (
          <p className="text-white/50 text-[10px] leading-relaxed line-clamp-3">{b.paragraph}</p>
        )}
      </div>
    </motion.div>
  );
}

/* ── Bottom horizontal blog slider ──────────────────────────────────────── */
function ContentFeed() {
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: BlogService.getAll,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-6 flex items-center gap-2 text-white/40 text-xs">
        <Loader2 size={13} className="animate-spin" /> Loading…
      </div>
    );
  }

  if (blogs.length === 0) return null;

  return (
    <div className="pb-5 pt-3">
      <p className="text-white/35 text-[9px] font-black uppercase tracking-widest px-5 mb-3">
        Our Stories
      </p>
      <div className="flex flex-row gap-3 overflow-x-auto no-scrollbar px-5 pb-1 snap-x snap-mandatory">
        {blogs.map(b => <BlogCard key={b._id} b={b} />)}
      </div>
    </div>
  );
}

/* ── Mobile/tablet blog grid (right-panel, above social links) ───────────── */
function MobileBlogSection() {
  const { data: blogs = [] } = useQuery({
    queryKey: ['blogs'],
    queryFn: BlogService.getAll,
    staleTime: 2 * 60 * 1000,
  });

  if (blogs.length === 0) return null;

  return (
    <div className="lg:hidden w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
      <p className="text-[#1B3A6B] text-[10px] font-black uppercase tracking-widest opacity-60 px-5 pt-5 pb-3">
        Our Stories
      </p>
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        {blogs.map(b => {
          const ytId = b.videoLink ? getYouTubeId(b.videoLink) : null;
          const thumb = b.images[0] || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);

          return (
            <div key={b._id} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              {/* Thumbnail — Cloudinary image or YouTube poster */}
              {thumb && (
                <div className="relative w-full h-28 overflow-hidden bg-slate-200">
                  <Image
                    src={thumb}
                    alt={b.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* Play badge for YouTube */}
                  {ytId && !b.images[0] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#1B3A6B] ml-0.5">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* Image count badge */}
                  {b.images.length > 1 && (
                    <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      +{b.images.length - 1}
                    </div>
                  )}
                </div>
              )}

              {/* Video link row (non-YouTube, no image) */}
              {!thumb && b.videoLink && (
                <a
                  href={b.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 pt-2.5 text-[#1B3A6B]/60 text-[9px] hover:text-[#1B3A6B] transition-colors"
                >
                  <FileVideo size={11} className="shrink-0" />
                  <span className="truncate">{getDomain(b.videoLink)}</span>
                </a>
              )}

              <div className="p-2.5">
                <p className="text-[#1B3A6B] font-bold text-[10px] leading-snug line-clamp-2">{b.title}</p>
                {b.paragraph && (
                  <p className="text-slate-400 text-[9px] mt-1 leading-relaxed line-clamp-2">{b.paragraph}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   BOOKING PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function BookingPage() {
  const [form, setForm]     = useState(INIT);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'date' && value) {
      const dow = new Date(value + 'T12:00:00').getDay();
      if (!isOpenDay(dow)) {
        toast.error('We are closed on Sundays and Mondays. Please select Tue – Sat.'); 
        return;
      }
    }
    setForm(prev => ({ ...prev, [name]: value }));
  }; sdfasdf

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
      track.reservationSuccess(Number(form.people));
      toast.success('Table reserved successfully!');
      setForm(INIT);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      track.reservationFailed(msg || 'unknown');
      toast.error(msg || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] font-sans selection:bg-[#1B3A6B]/10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reservationSchema) }} />

      {/* ── LEFT: full-bleed image + bottom card slider ── */}
      <div className="w-full lg:w-[68%] lg:h-screen shrink-0 relative overflow-hidden min-h-[60vw] lg:min-h-0">
        {/* Background image */}
        <Image src={heroImg} alt="RIN Restaurant" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/45" />

        {/* Bottom-fade gradient + slider — desktop only */}
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-52 bg-linear-to-t from-black/70 to-transparent pointer-events-none z-10" />
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 z-20">
          <ContentFeed />
        </div>
      </div>

      {/* ── RIGHT: booking form ── */}
      <div className="w-full lg:w-[32%] h-auto lg:h-screen bg-[#F8FAFC] flex flex-col gap-4 overflow-y-auto p-4 no-scrollbar">

        {/* Reservation form */}
        <div className="w-full bg-white p-6 lg:p-8 rounded-2xl flex flex-col gap-8 flex-shrink-0 border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif italic mb-3 text-[#1B3A6B]">Reservation</h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Book your table and enjoy authentic Japanese cuisine, freshly prepared to order.
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
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#1B3A6B] focus-within:bg-white transition-all duration-200">
                  <span className="flex items-center gap-1.5 px-3 py-3 border-r border-slate-200 shrink-0 text-xs font-bold text-slate-500 bg-white select-none">
                    🇦🇺 +61
                  </span>
                  <input
                    name="phone" value={form.phone} onChange={handleChange}
                    type="tel" placeholder="4XX XXX XXX"
                    className="flex-1 px-4 py-3 text-sm font-medium text-[#1B3A6B] placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
              </Field>

              <Field label="Guests">
                <input name="people" value={form.people} onChange={handleChange}
                  type="number" min={1} max={20} placeholder="1–20" className={inputCls} />
              </Field>

              <Field label="Date">
                <input name="date" value={form.date} onChange={handleChange}
                  type="date" className={inputCls} />
              </Field>

              <Field label="Time Slot">
                <select name="time" value={form.time} onChange={handleChange} className={inputCls}>
                  <option value="">Select time</option>
                  {(['Lunch', 'Dinner'] as const).map(session => (
                    <optgroup key={session} label={session === 'Lunch' ? 'Lunch (11:30 am – 2:30 pm)' : 'Dinner (5:00 pm – 8:30 pm)'}>
                      {TIME_SLOTS.filter(s => s.session === session).map(slot => (
                        <option key={slot.time} value={slot.time}>{slot.display}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Special Requests (optional)">
              <textarea name="notes" value={form.notes} onChange={handleChange}
                placeholder="Allergies, seating preference…" rows={2}
                className={`${inputCls} resize-none`} />
            </Field>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#1B3A6B] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] lg:text-xs hover:bg-[#1B3A6B]/90 shadow-md shadow-[#1B3A6B]/10 transition-all active:scale-[0.98] mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing…' : 'Confirm Reservation'}
            </button>
          </div>
        </div>

        {/* Opening hours */}
        <div className="w-full bg-white p-6 lg:p-8 rounded-2xl flex flex-col gap-6 flex-shrink-0 border border-slate-200 shadow-sm">
          <h4 className="text-[#1B3A6B] text-[10px] font-black uppercase tracking-widest opacity-60">Opening Hours</h4>
          <div className="flex flex-col gap-4">
            {openingHours.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[14px]">
                <span className="text-slate-600 font-medium">{item.day}</span>
                <div className="flex-grow mx-4 border-b border-dotted border-slate-200" />
                <span className={item.time === 'Closed' ? 'text-red-500 font-bold' : 'text-[#1B3A6B] font-bold'}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Blogs — mobile/tablet only */}
        <MobileBlogSection />

        {/* Social links */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <a href="https://www.facebook.com/rintasmania/" target="_blank" rel="noopener noreferrer"
              className="text-[#1B3A6B] p-5 rounded-2xl flex flex-row items-center gap-2 shadow-sm transition-all bg-white border border-slate-100 hover:border-[#1B3A6B]/20"
              aria-label="RIN on Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              <span className="text-lg font-bold leading-none">Facebook</span>
            </a>
            <a href="https://www.instagram.com/rintasmania/" target="_blank" rel="noopener noreferrer"
              className="text-[#1B3A6B] p-5 rounded-2xl flex flex-row items-center gap-2 shadow-sm transition-all bg-white border border-slate-100 hover:border-[#1B3A6B]/20"
              aria-label="RIN on Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span className="text-lg font-bold leading-none">Instagram</span>
            </a>
          </div>
          <a href="tel:+61427634574"
            className="bg-white border border-zinc-100 p-5 rounded-2xl flex items-center justify-between group shadow-sm hover:bg-zinc-50 transition-all"
            aria-label="Call RIN Japanese Restaurant">
            <span className="text-sm font-semibold text-[#1B3A6B]">+61 427 634 574</span>
            <span className="text-xs text-zinc-400">Call us</span>
          </a>
        </div>

        <RightPanelFooterCard />

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-text-fill-color: #1B3A6B !important;
            -webkit-box-shadow: 0 0 0px 1000px #F8FAFC inset !important;
            transition: background-color 5000s ease-in-out 0s;
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: none; opacity: 0.5; cursor: pointer;
          }
        `}</style>
      </div>
    </div>
  );
}

/* ── Field wrapper ───────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#1B3A6B] font-serif italic text-xs font-semibold pl-1">{label}</label>
      {children}
    </div>
  );
}
