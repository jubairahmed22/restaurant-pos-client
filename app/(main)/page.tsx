"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ShoppingBag, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Assets
import slideOne from '../../app/assest/food4.jpg'; afdsad
import slideTwo from '../../app/assest/food3.jpg';
import menu from '../../app/assest/food5.jpg';
import ourRestaourant from '../../app/assest/food1.jpg';
import Link from 'next/link';
import rinLogo from '../../app/assest/Rin_Logo.png';

import PickupTimeModal from '@/components/pickup/PickupTimeModal';
import { usePickupStore } from '@/store/pickupStore';
import RightPanelFooterCard from '@/components/shared/RightPanelFooterCard';


const slides = [
  {
    id: 1,
    img: slideOne,
    title: "Pure Tokyo Bliss",
    desc: "Blown away, mate! The ramen broth is incredibly rich, and the sushi tastes like it was flown straight from Tokyo market this morning.",
    rating: "4.8",
    reviews: "1,240"
  },
  {
    id: 2,
    img: slideTwo,
    title: "Best Izakaya Alive",
    desc: "Hands down the most authentic Japanese spot in town. Sensational flavours, unreal service, and the tempura is absolutely spot on.",
    rating: "4.9",
    reviews: "850"
  }
];

const openingHours = [
  { day: "Monday", time: "Closed" },
  { day: "Tuesday", time: "16:00 - 22:00" },
  { day: "Wednesday", time: "16:00 - 22:00" },
  { day: "Thursday", time: "16:00 - 22:00" },
  { day: "Friday", time: "17:00 - 22:00" },
  { day: "Sat - Sun", time: "17:00 - 22:00" },
];

const Page = () => {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const { isSet } = usePickupStore();

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Auto-open pickup modal on first visit
  useEffect(() => {
    if (!isSet) {
      const t = setTimeout(() => setPickupOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='min-h-screen w-full flex flex-col lg:flex-row bg-white text-white font-sans selection:bg-white/20 pt-20 lg:pt-0'>

      <PickupTimeModal
        isOpen={pickupOpen}
        onClose={() => setPickupOpen(false)}
        onConfirm={() => router.push('/menu')}
      />

      {/* LEFT: Premium Slider - HIDDEN ON MOBILE/TABLET (md/sm), VISIBLE ON LG */}
      <div
        className='hidden lg:block relative lg:w-[70%]  overflow-hidden group'
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
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>



        {/* Testimonial Overlay */}
        {/* Premium Testimonial Overlay */}
        <div className="absolute bottom-8 left-8 z-20 max-w-2xl overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-black/70 via-black/50 to-black/30 p-8 md:p-10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">

          {/* Decorative Glow */}
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#1B3A6B]/20 blur-3xl" />

          <div className="relative flex flex-col gap-8">

            {/* Top Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-6">

              {/* Branding */}
              <div className="flex items-center gap-6">

                <div className="flex-shrink-0 border-r border-white/10 pr-6">
                  <Image
                    src={rinLogo}
                    alt="RIN Japanese Food"
                    width={150}
                    height={55}
                    priority
                    className="object-contain"
                  />
                </div>

                <div>
                  <h1 className="text-4xl font-black tracking-[0.3em] text-white">
                    RIN
                  </h1>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-[1px] w-8 bg-amber-400" />
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-400">
                      Japanese Food
                    </p>
                  </div>

                  <p className="mt-1 text-sm italic text-white/60">
                    Eat In • Take Away • Fresh Daily
                  </p>
                </div>

              </div>

              {/* CTA */}
              <button
                onClick={() => setPickupOpen(true)}
                className="group flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold text-white border-white border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl"

              >
                <ShoppingBag
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-y-[-2px]"
                />
                Order Pickup
              </button>

            </div>

            {/* Content */}
            {/* <div className="space-y-5">

      <span className="inline-block rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-amber-300">
        Featured Experience
      </span>

      <h2 className="font-serif text-xl md:text-2xl italic font-light leading-tight text-white">
        {slides[current].title}
      </h2>

      <p className="max-w-xl text-base leading-relaxed text-white/75">
        {slides[current].desc}
      </p>

    </div> */}

            {/* Bottom Stats */}
            <div className="flex flex-wrap items-center gap-8">

              <div>
                <p className="text-2xl font-bold text-white">4.9★</p>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Customer Rating
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Fresh Ingredients
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-white">Daily</p>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Authentic Taste
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* RIGHT: Scrollable Side Panel - FULL WIDTH ON MOBILE, 30% ON LG */}
      <div className='w-full lg:w-[30%] h-auto lg:h-screen bg-zinc-50/50 flex flex-col gap-4 overflow-y-auto p-4 no-scrollbar border-l border-zinc-100'>

        {/* Restaurant Card */}
        <Link href='/restaurant' className="block w-full h-64 lg:h-80 flex-shrink-0">
          <div className="relative cursor-pointer w-full h-full group rounded-2xl">

            {/* Image fills the whole card with rounded corners */}
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl"
              data-framer-background-image-wrapper="true"
            >
              <Image
                src={ourRestaourant}
                alt="Restaurant"
                fill
                sizes="(min-width: 1200px) 400px, (max-width: 810px) 100vw, 50vw"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectPosition: 'center top',
                  objectFit: 'cover',
                }}
                className="rounded-2xl transition-all duration-1000 ease-out group-hover:scale-110 group-hover:blur-[3px] brightness-90 group-hover:brightness-50"
              />
            </div>

            {/* Label tab — sits on top */}
            <div className="absolute top-0 left-0 z-20 flex flex-col items-start">
              <div className="flex items-start">
                <div className="bg-white py-3 px-2 rounded-tl-2xl rounded-br-2xl text-[15px]  text-[#1B3A6B] font-bold flex items-center gap-3 transition-all duration-300 group-hover:pr-14">
                  <span className="whitespace-nowrap">Restaurant</span>
                  <span className="opacity-0 -translate-x-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 font-light">
                    →
                  </span>
                </div>

                {/* RIGHT SIDE CURVE */}
                <div className="w-5 h-5 -ml-[0.2px] fill-white">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0 L100 0 Q0 0 0 100 Z" />
                  </svg>
                </div>
              </div>

              {/* BOTTOM CURVE */}
              <div className="w-5 h-5 -mt-[0.5px] fill-white">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0 L0 100 Q0 0 100 0 Z" />
                </svg>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition-all duration-500 pointer-events-none" />
          </div>
        </Link>

        {/* Menu Card */}
        <Link href="/menu" className="block w-full h-64 lg:h-80 flex-shrink-0">
          <div className="relative cursor-pointer w-full h-full group rounded-2xl">

            {/* Image fills the whole card with rounded corners */}
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl"
              data-framer-background-image-wrapper="true"
            >
              <Image
                src={menu}
                alt="Menu"
                fill
                sizes="(min-width: 1200px) 400px, (max-width: 810px) 100vw, 50vw"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectPosition: 'center top',
                  objectFit: 'cover',
                }}
                className="rounded-2xl transition-all duration-1000 ease-out group-hover:scale-110 group-hover:blur-[3px] brightness-90 group-hover:brightness-50"
              />
            </div>

            {/* Label tab — sits on top */}
            <div className="absolute top-0 left-0 z-20 flex flex-col items-start">
              <div className="flex items-start">
                <div className="bg-white py-3 px-2 rounded-tl-2xl rounded-br-2xl text-[15px]  text-[#1B3A6B] font-bold flex items-center gap-1 transition-all duration-300 group-hover:pr-14">
                  <span className="whitespace-nowrap">Menu</span>
                  <span className="opacity-0 -translate-x-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 font-light">
                    →
                  </span>
                </div>

                {/* RIGHT SIDE CURVE */}
                <div className="w-5 h-5 -ml-[0.2px] fill-white">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0 L100 0 Q0 0 0 100 Z" />
                  </svg>
                </div>
              </div>

              {/* BOTTOM CURVE */}
              <div className="w-5 h-5 -mt-[0.5px] fill-white">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0 L0 100 Q0 0 100 0 Z" />
                </svg>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition-all duration-500 pointer-events-none" />
          </div>
        </Link>



        <div className='grid sm:grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* Pickup Button */}
          <button
            onClick={() => setPickupOpen(true)}
            className="w-full flex items-center justify-between px-4 py-4 lg:py-3 rounded-2xl border flex-shrink-0 shadow-lg transition-all duration-300 focus:outline-none active:scale-[0.98] hover:opacity-90"
            style={{ background: '#1B3A6B', borderColor: '#1B3A6B' }}
          >
            <span className="text-white text-[12px] font-bold uppercase tracking-wider">
              {isSet ? 'Change Pickup schedule' : 'Order Pickup'}
            </span>
            <div className="p-2 rounded-xl bg-white/15 text-white transition-all duration-300 group-hover:bg-white/25">
              <ShoppingBag size={18} />
            </div>
          </button>

          {/* Reservation Button */}
          <Link href="/reservation" className="block w-full">
            <button className="w-full cursor-pointer bg-[#1B3A6B] py-4 lg:py-3 px-8 rounded-2xl flex items-center justify-between group flex-shrink-0 shadow-lg shadow-[#1B3A6B]/10 border border-[#1B3A6B] hover:bg-[#1B3A6B]/90 transition-all duration-300 focus:outline-none active:scale-[0.98]">

              {/* TEXT: Now white with refined tracking */}
              <span className="text-white text-[12px] font-bold uppercase tracking-wider">
                Make a Reservation
              </span>

              {/* ICON BOX: Semi-transparent white background for a subtle "glass" look */}
              <div className="p-2 rounded-xl bg-white/10 text-white transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
                <Calendar size={18} />
              </div>

            </button>
          </Link>
        </div>
        {/* Visit Shop Button */}
        <Link
          href="/shop"
          className="w-full flex items-center justify-between px-4 py-4 lg:py-3 rounded-2xl  border border-gray-300 bg-white flex-shrink-0 shadow-lg transition-all duration-300 active:scale-[0.98] hover:opacity-90"
        // style={{ background: '#C05428', borderColor: '#C05428' }}
        >
          <span className="text-black text-[12px] font-bold uppercase tracking-wider">
            Visit our Shop
          </span>
          <div className="p-2 rounded-xl bg-white/15 text-black transition-all duration-300">
            <Store size={18} />
          </div>
        </Link>


        {/* Opening Hours Section */}
        <div className="w-full bg-white p-6 lg:p-8 rounded-2xl flex flex-col gap-6 flex-shrink-0 shadow-sm border border-zinc-100">
          <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Opening Hours</h4>
          <div className="flex flex-col gap-4">
            {openingHours.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[14px] lg:text-[15px]">
                <span className="text-zinc-600 font-medium">{item.day}</span>
                <div className="flex-grow mx-4 border-b border-dotted border-zinc-200 h-1"></div>
                <span className={item.time === "Closed" ? "text-red-500 font-bold" : "text-zinc-800 font-semibold"}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
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
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
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
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
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

        {/* Footer Card */}
        <div className="mb-4">
          <RightPanelFooterCard />
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