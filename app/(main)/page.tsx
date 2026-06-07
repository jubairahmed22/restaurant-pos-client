"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

// Assets
import slideOne from '../../app/assest/slideOne.avif';
import slideTwo from '../../app/assest/slideTwo.avif';
import menu from '../../app/assest/menu.avif';
import ourRestaourant from '../../app/assest/our-restaourant.avif';
import Link from 'next/link';
import rinLogo from '../../app/assest/Rin_Logo.png';


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
  const [current, setCurrent] = useState(0);
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
    <div className='min-h-screen w-full flex flex-col lg:flex-row bg-white text-white font-sans selection:bg-white/20 pt-20 lg:pt-0'>

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
        <div className="absolute bottom-12 left-12 z-20 max-w-xl rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl transition-all duration-500 ease-in-out">
          <div className="flex flex-col gap-6">

            {/* Header Section: Logo & Branding */}
            <div className="flex items-center gap-6 border-b border-white/10 pb-6">
              {/* Logo */}
              <div className="flex-shrink-0 border-r border-white/10 pr-6">
                <Image
                  src={rinLogo}
                  alt="Serin Beauty"
                  width={140}
                  height={50}
                  priority
                  className="object-contain"
                />
              </div>

              {/* Brand & Tagline */}
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl font-black tracking-widest text-white leading-none mb-1">
                  RIN
                </h1>
                <p className="text-xs font-medium uppercase tracking-wider text-amber-400/90 max-w-[200px]">
                  Japanese Food <span className="block text-white/60 normal-case italic font-normal mt-0.5">Eat in & Take away</span>
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-3">
              {/* Dynamic Title */}
              <h2 className="font-serif text-4xl italic font-light leading-tight text-white tracking-wide">
                {slides[current].title}
              </h2>

              {/* Dynamic Description */}
              <p className="text-sm md:text-base leading-relaxed text-white/80 font-light">
                {slides[current].desc}
              </p>
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

        {/* Reservation Button */}
        <Link href="/reservation" className="block w-full">
          <button className="w-full cursor-pointer bg-[#1B3A6B] py-4 lg:py-3 px-8 rounded-2xl flex items-center justify-between group flex-shrink-0 shadow-lg shadow-[#1B3A6B]/10 border border-[#1B3A6B] hover:bg-[#1B3A6B]/90 transition-all duration-300 focus:outline-none active:scale-[0.98]">

            {/* TEXT: Now white with refined tracking */}
            <span className="text-white text-sm font-bold uppercase tracking-wider">
              Make a Reservation
            </span>

            {/* ICON BOX: Semi-transparent white background for a subtle "glass" look */}
            <div className="p-2 rounded-xl bg-white/10 text-white transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
              <Calendar size={18} />
            </div>

          </button>
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
        </div>asdfas

        {/* Social Links */}
        <div className="grid grid-cols-1 gap-3 flex-shrink-0">
          <a
            href="https://www.facebook.com/rintasmania/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1B3A6B] text-white p-5 rounded-2xl flex items-center justify-between group shadow-sm hover:bg-[#1B3A6B]/90 transition-all"
            aria-label="RIN on Facebook"
          >
            <span className="text-sm font-bold">Follow on Facebook</span>
            <span className="text-white/70 text-xs">@rintasmania</span>
          </a>
          <a
            href="tel:+61427634574"
            className="bg-white border border-zinc-100 p-5 rounded-2xl flex items-center justify-between group shadow-sm hover:bg-zinc-50 transition-all"
            aria-label="Call RIN Japanese Restaurant"
          >
            <span className="text-sm font-semibold text-[#1B3A6B]">+61 427 634 574</span>
            <span className="text-xs text-zinc-400">Call us</span>
          </a>
        </div>

        {/* Footer Navigation */}
        <div className="w-full bg-white py-12 px-8 rounded-2xl flex flex-col items-center gap-12 flex-shrink-0 mb-4 shadow-sm border border-zinc-100">
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-xl font-serif font-bold text-[#1B3A6B] tracking-tight">Navigation</h3>
            <div className="flex flex-col items-center gap-4 text-zinc-600 font-medium text-[15px]">
              {["Home", "Menu", "About", "Restaurant", "Reservation"].map((link) => (
                <a key={link} href="#" className="hover:text-[#1B3A6B] transition-colors">{link}</a>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 w-full flex flex-col items-center gap-4">
            <Link target='_blank' href="https://www.linkedin.com/in/jubairahmed10/">
              <div className="bg-[#1B3A6B] text-white px-6 py-2.5 rounded-full flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1B3A6B]/90 transition-colors shadow-sm">
                <span className="rotate-45 block text-[10px]">▲</span> Made by Jubair Ahmed
              </div>
            </Link>
          </div>
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