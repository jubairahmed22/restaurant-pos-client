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

import slideOne from '../../assest/food10.jpg';
import slideTwo from '../../assest/food3.jpg';
import rinLogo  from '../../assest/Rin_Logo.png';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rinrestaurant.com.au';

// ── GEO: FAQPage schema (AI engines index this for direct answers) ─────────────
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What are the opening hours for RIN Japanese Restaurant in Hobart?',
      acceptedAnswer: { '@type': 'Answer', text: 'RIN is open Tuesday to Saturday. Lunch service runs 11:30 am – 2:30 pm and Dinner service runs 5:00 pm – 8:30 pm. We are closed on Sundays and Mondays.' } },
    { '@type': 'Question', name: 'Where is RIN Japanese Restaurant located?',
      acceptedAnswer: { '@type': 'Answer', text: 'RIN is located at 196 Macquarie Street, Hobart TAS 7000, Australia — in the heart of Hobart CBD.' } },
    { '@type': 'Question', name: 'Does RIN Japanese Restaurant offer takeaway?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. RIN offers both eat-in dining and take-away. You can pre-order online and schedule a pickup time during Lunch (11:30 am – 2:30 pm) or Dinner (5:00 pm – 8:30 pm) service, Tuesday to Saturday.' } },
    { '@type': 'Question', name: 'Can I make a reservation at RIN?',
      acceptedAnswer: { '@type': 'Answer', text: `Yes. You can book a table online at ${SITE_URL}/reservation or by calling +61 427 634 574. Reservations are available Tuesday to Saturday during Lunch and Dinner service.` } },
    { '@type': 'Question', name: 'What type of Japanese cuisine does RIN serve?',
      acceptedAnswer: { '@type': 'Answer', text: 'RIN serves authentic Japanese cuisine including sushi, sashimi, ramen, tempura, teriyaki, and seasonal Japanese dishes — all crafted by experienced Japanese chefs.' } },
    { '@type': 'Question', name: 'How do I contact RIN Japanese Restaurant?',
      acceptedAnswer: { '@type': 'Answer', text: 'Call us on +61 427 634 574, email rin.japanese.eatinandtakeaway@gmail.com, or find us on Facebook at facebook.com/rintasmania.' } },
    { '@type': 'Question', name: 'Is RIN Japanese Restaurant suitable for families?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. RIN welcomes families and groups. Please call or book online to arrange seating for larger parties.' } },
    { '@type': 'Question', name: 'Does RIN accept card payments?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. RIN accepts card payments via Square as well as cash. Online orders support secure card payment.' } },
  ],
};

const PHONE      = '+61 427 634 574';
const PHONE_HREF = 'tel:+61427634574';
const EMAIL      = 'rin.japanese.eatinandtakeaway@gmail.com';
const EMAIL_HREF = 'mailto:rin.japanese.eatinandtakeaway@gmail.com';
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
  { day: 'Monday',              time: 'Closed' },
  { day: 'Tue – Sat  Lunch',   time: '11:30 am – 2:30 pm' },
  { day: 'Tue – Sat  Dinner',  time: '5:00 pm – 8:30 pm' },
  { day: 'Sunday',              time: 'Closed' },
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

      {/* GEO: FAQPage structured data for AI search engines */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
           <div className="flex flex-col gap-3 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://www.facebook.com/rintasmania/"
              target="_blank"
              rel="noopener noreferrer"
              className=" text-[#1B3A6B] p-5 rounded-2xl flex flex-row items-center gap-2 shadow-sm  transition-all"
              aria-label="RIN on Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              <span className="text-lg font-bold leading-none">Facebook</span>
            </a>
            <a
              href="https://www.instagram.com/rintasmania/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1B3A6B] p-5 rounded-2xl flex flex-row items-center gap-2 shadow-sm hover:opacity-90 transition-all"
       
              aria-label="RIN on Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span className="text-lg font-bold leading-none">Instagram</span>
            </a>
          </div>
          <a
            href="tel:+61427634574"
            className="bg-white border border-zinc-100 p-5 rounded-2xl flex items-center justify-between group shadow-sm hover:bg-zinc-50 transition-all"
            aria-label="Call RIN Japanese Restaurant"
          >
            <span className="text-sm font-semibold text-[#1B3A6B]">+61 427 634 574</span>
            <span className="text-xs text-zinc-400">Call us</span>
          </a>
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
