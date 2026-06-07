"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';

// Inline Facebook SVG (lucide-react removed it in v0.363+)
const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import Link from 'next/link';

import slideOne from '../../assest/slideOne.avif';
import slideTwo from '../../assest/slideTwo.avif';
import rinLogo  from '../../assest/Rin_Logo.png';

const PHONE      = '+61 427 634 574';
const PHONE_HREF = 'tel:+61427634574';
const EMAIL      = 'rintasmania2012@yahoo.com.au';
const EMAIL_HREF = 'mailto:rintasmania2012@yahoo.com.au';
const FACEBOOK   = 'https://www.facebook.com/rintasmania/';

const slides = [
  {
    id: 1,
    img: slideOne,
    title: 'Pure Tokyo Bliss',
    desc: 'Blown away! The ramen broth is incredibly rich, and the sushi tastes like it was flown straight from Tokyo market this morning.',
    rating: '4.8',
    reviews: '1,240',
  },
  {
    id: 2,
    img: slideTwo,
    title: 'Best Izakaya in Tasmania',
    desc: 'Hands down the most authentic Japanese spot in Hobart. Sensational flavours, unreal service, and the tempura is absolutely spot on.',
    rating: '4.9',
    reviews: '850',
  },
];

const openingHours = [
  { day: 'Monday',    time: 'Closed' },
  { day: 'Tuesday',   time: '16:00 – 22:00' },
  { day: 'Wednesday', time: '16:00 – 22:00' },
  { day: 'Thursday',  time: '16:00 – 22:00' },
  { day: 'Friday',    time: '17:00 – 22:00' },
  { day: 'Sat – Sun', time: '17:00 – 22:00' },
];

const Page = () => {
  const [current,  setCurrent]  = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-800 font-sans selection:bg-[#1B3A6B]/10">

      {/* ── LEFT: Slider ──────────────────────────────── */}
      <div
        className="relative w-full lg:w-[70%] h-64 lg:h-screen overflow-hidden group flex-shrink-0"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <Image
              src={slides[current].img}
              alt={slides[current].title}
              fill
              className="object-cover"
              priority={current === 0}
              sizes="(max-width: 1024px) 100vw, 70vw"
            />
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>
        </AnimatePresence>

        {/* Testimonial card */}
        <div className="absolute bottom-4 left-4 right-4 lg:bottom-12 lg:left-12 z-20 max-w-lg p-5 lg:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl">
          {/* Logo + brand */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#1B3A6B]/10">
            <div className="relative w-16 h-10 flex-shrink-0">
              <Image src={rinLogo} alt="RIN Logo" fill className="object-contain" priority />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#1B3A6B]">RIN Japanese Restaurant</p>
              <p className="text-[10px] text-amber-600 font-semibold">Eat In &amp; Take Away · Hobart, TAS</p>
            </div>
          </div>
          <h2 className="text-xl lg:text-3xl font-serif italic mb-2 lg:mb-3 leading-tight text-[#1B3A6B]">
            &ldquo;{slides[current].title}&rdquo;
          </h2>
          <p className="hidden md:block text-slate-600 font-medium mb-4 text-xs lg:text-sm leading-relaxed">
            &ldquo;{slides[current].desc}&rdquo;
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#1B3A6B]">★ {slides[current].rating}</span>
            <span className="text-slate-400">({slides[current].reviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Info panel ─────────────────────────── */}
      <div className="w-full lg:w-[30%] h-auto lg:h-screen bg-white flex flex-col gap-4 overflow-y-auto p-4 no-scrollbar border-l border-slate-100">

        {/* Opening Hours */}
        <div className="w-full bg-slate-50 p-6 lg:p-8 rounded-3xl flex flex-col gap-5 border border-slate-100/80 shadow-sm">
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Opening Hours</h4>
          <div className="flex flex-col gap-3.5">
            {openingHours.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[14px] lg:text-[15px] font-medium">
                <span className="text-[#1B3A6B]">{item.day}</span>
                <div className="flex-grow mx-3 border-b border-dotted border-slate-200 h-4" />
                <span className={item.time === 'Closed' ? 'text-red-500 font-bold' : 'text-slate-700 font-bold'}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Contact */}
        <div className="w-full bg-slate-50 p-6 lg:p-8 rounded-3xl flex flex-col gap-6 border border-slate-100/80 shadow-sm">
          {/* Address */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Address</h4>
            <a
              href="https://maps.google.com/?q=196+Macquarie+Street,+Hobart+TAS+7000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-slate-600 hover:text-[#1B3A6B] transition-colors group"
              aria-label="Open in Google Maps"
            >
              <MapPin size={15} className="text-slate-400 group-hover:text-[#1B3A6B] transition-colors mt-0.5 shrink-0" />
              <span className="text-[14px] lg:text-[15px] font-semibold leading-relaxed underline underline-offset-4 decoration-slate-200 group-hover:decoration-[#1B3A6B]/40">
                196 Macquarie Street<br />Hobart TAS 7000, Australia
              </span>
            </a>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Contact</h4>
            <div className="flex flex-col gap-3 text-[14px] lg:text-[15px] font-medium">
              <a href={PHONE_HREF} className="flex items-center gap-3 text-slate-600 hover:text-[#1B3A6B] transition-colors group">
                <Phone size={15} className="text-slate-400 group-hover:text-[#1B3A6B] transition-colors" />
                <span className="underline underline-offset-4 decoration-slate-200 group-hover:decoration-[#1B3A6B]/40">{PHONE}</span>
              </a>
              <a href={EMAIL_HREF} className="flex items-center gap-3 text-slate-600 hover:text-[#1B3A6B] transition-colors group">
                <Mail size={15} className="text-slate-400 group-hover:text-[#1B3A6B] transition-colors" />
                <span className="underline underline-offset-4 decoration-slate-200 group-hover:decoration-[#1B3A6B]/40 break-all">{EMAIL}</span>
              </a>
            </div>
          </div>

          {/* Chef note */}
          <p className="text-[11px] text-slate-400 italic border-t border-slate-100 pt-3">
            🍣 Crafted by authentic Japanese chefs
          </p>
        </div>

        {/* Google Maps — 196 Macquarie Street, Hobart TAS 7000 */}
        <div className="w-full h-[260px] lg:h-[300px] rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm">
          <iframe
            title="RIN Japanese Restaurant location – 196 Macquarie Street Hobart"
            src="https://maps.google.com/maps?q=196+Macquarie+Street%2C+Hobart%2C+TAS+7000%2C+Australia&t=&z=17&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 gap-3">
          <Link
            href={FACEBOOK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1877F2] text-white p-4 rounded-2xl flex items-center justify-between group shadow-sm hover:bg-[#1877F2]/90 transition-all"
            aria-label="RIN on Facebook"
          >
            <div className="flex items-center gap-3">
              <FacebookIcon size={18} />
              <span className="text-sm font-bold">Follow us on Facebook</span>
            </div>
            <span className="text-white/60 text-xs">@rintasmania</span>
          </Link>
        </div>

        {/* Footer nav */}
        <div className="w-full bg-slate-50 py-10 px-8 rounded-3xl flex flex-col items-center gap-8 mb-2 border border-slate-100 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-12">
              <Image src={rinLogo} alt="RIN Japanese Restaurant" fill className="object-contain" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
              Japanese Food · Hobart, Tasmania
            </p>
          </div>
          <div className="flex flex-col items-center gap-3.5 text-slate-500 font-bold text-xs lg:text-sm tracking-wide">
            {[
              { label: 'Home',        href: '/' },
              { label: 'Menu',        href: '/menu' },
              { label: 'Restaurant',  href: '/restaurant' },
              { label: 'Reservation', href: '/reservation' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="hover:text-[#1B3A6B] transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-slate-300 text-center">
            © {new Date().getFullYear()} RIN Japanese Restaurant. All rights reserved.
          </p>
        </div>

      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Page;
