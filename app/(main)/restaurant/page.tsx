"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Phone, Mail, X } from 'lucide-react';
import Link from 'next/link';

// Assets
import slideOne from '../../assest/slideOne.avif';
import slideTwo from '../../assest/slideTwo.avif';

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
    <div className='min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-800 font-sans selection:bg-[#1B3A6B]/10'>

      {/* LEFT: Premium Slider */}
      <div
        className='relative w-full lg:w-[70%] h-64 lg:h-screen overflow-hidden group flex-shrink-0'
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
            <Image src={slides[current].img} alt="bg" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-slate-900/10 lg:bg-slate-900/5" />
          </motion.div>
        </AnimatePresence>

        {/* Testimonial Overlay - Premium Frosted Translucent Card */}
        <div className="absolute bottom-4 left-4 right-4 lg:bottom-12 lg:left-12 z-20 max-w-lg p-5 lg:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/5">
          <h2 className="text-xl lg:text-3xl font-serif italic mb-1 lg:mb-3 leading-tight text-[#1B3A6B]">“{slides[current].title}”</h2>
          <p className="hidden md:block text-slate-600 font-medium mb-4 lg:mb-5 text-xs lg:text-sm leading-relaxed">"{slides[current].desc}"</p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-slate-200 border-2 border-white shadow-sm" />)}
            </div>
            <span className="text-xs lg:text-sm font-bold text-[#1B3A6B]">{slides[current].rating} <span className="text-slate-400 font-normal">({slides[current].reviews})</span></span>
          </div>
        </div>
      </div>

      {/* RIGHT: Scrollable Side Panel */}
      <div className='w-full lg:w-[30%] h-auto lg:h-screen bg-white flex flex-col gap-4 overflow-y-auto p-4 no-scrollbar border-l border-slate-100'>

        {/* 1. Opening Hours Card */}
        <div className="w-full bg-slate-50 p-6 lg:p-8 rounded-3xl flex flex-col gap-5 flex-shrink-0 border border-slate-100/80 shadow-sm">
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Opening Hours</h4>
          <div className="flex flex-col gap-3.5">
            {openingHours.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[14px] lg:text-[15px] font-medium">
                <span className="text-[#1B3A6B]">{item.day}</span>
                <div className="flex-grow mx-3 border-b border-dotted border-slate-200 h-4"></div>
                <span className={item.time === "Closed" ? "text-slate-400 font-normal" : "text-slate-600 font-bold"}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Address & Contact Card */}
        <div className="w-full bg-slate-50 p-6 lg:p-8 rounded-3xl flex flex-col gap-6 flex-shrink-0 border border-slate-100/80 shadow-sm">
          <div className="flex flex-col gap-2.5">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Address</h4>
            <p className="text-slate-600 font-semibold text-[14px] lg:text-[15px] leading-relaxed">
              Václavské náměstí 45<br />
              110 00 Praha
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Contact</h4>
            <div className="flex flex-col gap-3 text-[14px] lg:text-[15px] font-medium">
              <a href="tel:+420123456789" className="flex items-center gap-3 text-slate-600 hover:text-[#1B3A6B] transition-colors group">
                <Phone size={15} className="text-slate-400 group-hover:text-[#1B3A6B] transition-colors" />
                <span className="underline underline-offset-4 decoration-slate-200 group-hover:decoration-[#1B3A6B]/40">+420 123 456 789</span>
              </a>
              <a href="mailto:info@RIN.example" className="flex items-center gap-3 text-slate-600 hover:text-[#1B3A6B] transition-colors group">
                <Mail size={15} className="text-slate-400 group-hover:text-[#1B3A6B] transition-colors" />
                <span className="underline underline-offset-4 decoration-slate-200 group-hover:decoration-[#1B3A6B]/40">info@RIN.example</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3. Map Card */}
        <div className="w-full h-[250px] lg:h-[300px] bg-slate-100 rounded-3xl overflow-hidden flex-shrink-0 border border-slate-200/60 shadow-sm relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.1158145137255!2d14.4265147!3d50.0817634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b949219e2c605%3A0x280e224e754a32!2zVsOhY2xhdnNrw6kgbsOhbcSbc3TDrSA0NSwgMTEwIDAwIE5vdsOpIE3Em3N0bywgQ3plY2hpYQ!5e0!3m2!1sen!2sus!4v1715800000000!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(0.6) contrast(1.1) brightness(0.95)' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Custom Overlay for Map UI feel */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
             <div className="flex flex-col gap-1">
                <div className="w-6 h-6 border border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-600 font-bold cursor-pointer hover:bg-slate-50 transition-colors">+</div>
                <div className="w-6 h-6 border border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-600 font-bold cursor-pointer hover:bg-slate-50 transition-colors">-</div>
             </div>
          </div>
        </div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-2 gap-4 flex-shrink-0 mt-1">
          <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-center lg:justify-between group cursor-pointer border border-slate-100 shadow-sm transition-all hover:bg-slate-100/70">
            <span className="text-xs lg:text-sm font-bold text-slate-600 group-hover:text-[#1B3A6B] transition-colors">X / Twitter</span>
            <X size={14} className="hidden lg:block text-slate-400 group-hover:text-[#1B3A6B] transition-colors" />
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-center lg:justify-between group cursor-pointer border border-slate-100 shadow-sm transition-all hover:bg-slate-100/70">
            <span className="text-xs lg:text-sm font-bold text-slate-600 group-hover:text-[#1B3A6B] transition-colors">Instagram</span>
            <ChevronRight size={14} className="hidden lg:block text-slate-400 group-hover:text-[#1B3A6B] transition-colors" />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="w-full bg-slate-50 py-10 px-8 rounded-3xl flex flex-col items-center gap-10 flex-shrink-0 mb-2 border border-slate-100 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-serif italic text-[#1B3A6B]">Menu</h3>
            <div className="flex flex-col items-center gap-3.5 text-slate-500 font-bold text-xs lg:text-sm tracking-wide">
              {["Home", "Menu", "About", "Restaurant", "Reservation"].map((link) => (
                <a key={link} href="#" className="hover:text-[#1B3A6B] transition-colors">{link}</a>
              ))}
            </div>
          </div>

          <Link target='_blank' href="https://www.linkedin.com/in/jubairahmed10/">
            <div className="pt-6 border-t border-slate-200/60 w-full flex flex-col items-center gap-3">
              <div className="bg-[#1B3A6B] text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-[10px] lg:text-[11px] font-bold uppercase tracking-wider shadow-md shadow-[#1B3A6B]/10 hover:bg-[#1B3A6B]/90 transition-all cursor-pointer">
                <span className="rotate-45 block text-[9px]">▲</span> Made by Jubair Ahmed
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