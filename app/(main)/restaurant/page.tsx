"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Phone, Mail, X } from 'lucide-react';

// Assets
import slideOne from '../../assest/slideOne.avif';
import slideTwo from '../../assest/slideTwo.avif';
import Link from 'next/link';

const slides = [
  {
    id: 1,
    img: slideOne,
    title: "The Best Pasta Outside of Italy",
    desc: "I'm Italian, and let me tell you, this pasta tastes like home. The sauces are rich, the pasta is cooked to perfection.",
    rating: "4.8",
    reviews: "1,240"
  },
  {
    id: 2,
    img: slideTwo,
    title: "A Culinary Masterpiece",
    desc: "Every bite tells a story of tradition and quality. The atmosphere is warm, making it the perfect spot.",
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
    <div className='min-h-screen w-full flex flex-col lg:flex-row bg-[#0a0a0a] text-white font-sans selection:bg-white/20 '>

      {/* LEFT: Premium Slider 
          - On mobile/tablet: fixed aspect/height boundary (h-64)
          - On desktop: 70% width boundary and locked view height
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

        {/* Testimonial Overlay with unified small screen spacing */}
        <div className="absolute bottom-4 left-4 right-4 lg:bottom-12 lg:left-12 z-20 max-w-lg p-6 lg:p-10 rounded-[1.5rem] lg:rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10">
          <h2 className="text-xl lg:text-4xl font-serif italic mb-2 lg:mb-4 leading-tight">“{slides[current].title}”</h2>
          <p className="hidden md:block text-gray-300 font-light mb-4 lg:mb-6 text-sm lg:text-base leading-relaxed">"{slides[current].desc}"</p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-zinc-800 border border-zinc-900" />)}
            </div>
            <span className="text-xs lg:text-sm font-bold">{slides[current].rating} <span className="text-zinc-500 font-normal">({slides[current].reviews})</span></span>
          </div>
        </div>
      </div>

      {/* RIGHT: Scrollable Side Panel 
          - On mobile/tablet: Natural scroll document layout
          - On desktop: fixed side panel container with independent scrolling
      */}
      <div className='w-full lg:w-[30%] h-auto lg:h-screen bg-[#0a0a0a] flex flex-col gap-4 overflow-y-auto p-4 no-scrollbar'>

        {/* 1. Opening Hours Card */}
        <div className="w-full bg-[#121210] p-6 lg:p-8 rounded-[2rem] flex flex-col gap-6 flex-shrink-0 border border-white/5">
          <h4 className="text-zinc-500 text-xs lg:text-sm font-light uppercase tracking-widest">Opening Hours</h4>
          <div className="flex flex-col gap-4">
            {openingHours.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[14px] lg:text-[15px]">
                <span className="text-zinc-300 font-light">{item.day}</span>
                <div className="flex-grow mx-4 border-b border-dotted border-zinc-800 h-4"></div>
                <span className={item.time === "Closed" ? "text-zinc-500" : "text-zinc-300"}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Address & Contact Card */}
        <div className="w-full bg-[#121210] p-6 lg:p-8 rounded-[2rem] flex flex-col gap-8 flex-shrink-0 border border-white/5">
          <div className="flex flex-col gap-4">
            <h4 className="text-zinc-500 text-xs lg:text-sm font-light uppercase tracking-widest">Address</h4>
            <p className="text-zinc-300 font-light text-[14px] lg:text-[15px] leading-relaxed">
              Václavské náměstí 45<br />
              110 00 Praha
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-zinc-500 text-xs lg:text-sm font-light uppercase tracking-widest">Contact</h4>
            <div className="flex flex-col gap-3 text-[14px] lg:text-[15px]">
              <a href="tel:+420123456789" className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors">
                <Phone size={16} className="text-zinc-500" />
                <span className="underline underline-offset-4 decoration-zinc-700">+420 123 456 789</span>
              </a>
              <a href="mailto:info@RIN.example" className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors">
                <Mail size={16} className="text-zinc-500" />
                <span className="underline underline-offset-4 decoration-zinc-700">info@RIN.example</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3. Map Card */}
        <div className="w-full h-[250px] lg:h-[300px] bg-[#121210] rounded-[2rem] overflow-hidden flex-shrink-0 border border-white/5 relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.1158145137255!2d14.4265147!3d50.0817634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b949219e2c605%3A0x280e224e754a32!2zVsOhY2xhdnNrw6kgbsOhbcSbc3TDrSA0NSwgMTEwIDAwIE5vdsOpIE3Em3N0bywgQ3plY2hpYQ!5e0!3m2!1sen!2sus!4v1715800000000!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(1) invert(0.92) contrast(1.2)' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Custom Overlay for Map UI feel */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10">
             <div className="flex flex-col gap-2">
                <div className="w-6 h-6 border border-white/20 rounded flex items-center justify-center text-[10px] cursor-pointer">+</div>
                <div className="w-6 h-6 border border-white/20 rounded flex items-center justify-center text-[10px] cursor-pointer">-</div>
             </div>
          </div>
        </div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-2 gap-4 flex-shrink-0 mt-2">
          <div className="bg-[#121210] p-5 lg:p-6 rounded-3xl flex items-center justify-center lg:justify-between group cursor-pointer border border-white/5 transition-colors hover:bg-zinc-800">
            <span className="text-xs lg:text-sm font-light text-zinc-300">X / Twitter</span>
            <X size={14} className="hidden lg:block text-zinc-500 group-hover:text-white transition-colors" />
          </div>
          <div className="bg-[#121210] p-5 lg:p-6 rounded-3xl flex items-center justify-center lg:justify-between group cursor-pointer border border-white/5 transition-colors hover:bg-zinc-800">
            <span className="text-xs lg:text-sm font-light text-zinc-300">Instagram</span>
            <ChevronRight size={14} className="hidden lg:block text-zinc-500 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="w-full bg-[#121210] py-12 px-8 rounded-[2rem] flex flex-col items-center gap-12 flex-shrink-0 mb-4 border border-white/5">
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-xl font-serif italic mb-2">Menu</h3>
            <div className="flex flex-col items-center gap-4 text-zinc-400 font-light text-[14px] lg:text-[15px]">
              {["Home", "Menu", "About", "Restaurant", "Reservation"].map((link) => (
                <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>

          <Link target='_blank' href="https://www.linkedin.com/in/jubairahmed10/">
            <div className="pt-8 border-t border-white/5 w-full flex flex-col items-center gap-4">
              <div className="bg-white text-black px-6 py-2 rounded-full flex items-center gap-2 text-[10px] lg:text-[12px] font-bold uppercase tracking-tighter">
                <span className="rotate-45 block">▲</span> Made by Jubair Ahmed
              </div>
            </div>
          </Link>
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