"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';

// Assets
import slideOne from '../../assest/slideOne.avif';
import slideTwo from '../../assest/slideTwo.avif';
import aboutCouple from '../../assest/about-couple.webp'; 
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
    <div className='min-h-screen w-full flex flex-col lg:flex-row bg-white text-white font-sans selection:bg-white/20 '>

      {/* LEFT: Premium Slider 
          - On mobile: fixed height (h-64)
          - On desktop: 70% width and full height
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

        {/* Testimonial Overlay - Responsive adjustments for mobile */}
        <div className="absolute bottom-4 left-4 right-4 lg:bottom-12 lg:left-12 z-20 max-w-lg p-6 lg:p-10 rounded-xl lg:rounded-xl bg-black/40 backdrop-blur-xl border border-white/10">
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
          - On mobile: Full width, natural height
          - On desktop: 30% width, fixed height
      */}
      <div className='w-full lg:w-[30%] h-auto lg:h-screen bg-white flex flex-col gap-4 overflow-y-auto p-4 no-scrollbar'>

        {/* --- ABOUT SECTION --- */}
        <div className="flex flex-col gap-4 flex-shrink-0">
          
          {/* Top Intro Card */}
          <div className="bg-[#1B3A6B] p-8 lg:p-10 rounded-xl border border-white/5">
            <h2 className="text-4xl lg:text-5xl font-serif italic mb-6 lg:mb-10">About</h2>
            <p className="text-zinc-400 text-[14px] lg:text-[15px] leading-relaxed font-light">
              Founded by Italian owners, our restaurant brings authentic flavors from Italy to Prague, 
              celebrating tradition, quality ingredients, and true hospitality.
            </p>
          </div>

          {/* Couple Image Card */}
          <div className="relative h-[350px] lg:h-[450px] w-full rounded-xl overflow-hidden group border border-white/5">
            <Image 
              src={aboutCouple} 
              alt="Maria & Giovanni" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            {/* Label Overlay */}
            <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="text-xs font-light tracking-wide text-zinc-200">Maria & Giovanni</span>
            </div>
          </div>

          {/* Bottom Story Card */}
          <div className="bg-[#1B3A6B] p-8 lg:p-10 rounded-xl border border-white/5">
            <h3 className="text-3xl lg:text-4xl font-serif italic mb-6 lg:mb-10">Maria & Giovanni</h3>
            <div className="flex flex-col gap-6">
              <p className="text-zinc-400 text-[14px] lg:text-[15px] leading-relaxed font-light">
                Meet Maria and Giovanni, the heart and soul behind our restaurant. Hailing from the beautiful region of Tuscany, 
                they’ve always had a love for cooking, rooted in family traditions and the rich flavors of Italy.
              </p>
              <p className="text-zinc-400 text-[14px] lg:text-[15px] leading-relaxed font-light">
                After years of honing their skills in Italy’s finest kitchens, they dreamed of sharing authentic Italian 
                flavors with the world—sparking a passion to bring true Italian dining to the vibrant city of Prague.
              </p>
            </div>
          </div>

        </div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-2 gap-4 flex-shrink-0 mt-2">
          <div className="bg-[#1B3A6B] p-5 lg:p-6 rounded-xl flex items-center justify-center lg:justify-between group cursor-pointer border border-white/5 transition-colors hover:bg-zinc-800">
            <span className="text-xs lg:text-sm font-light text-zinc-300">X / Twitter</span>
            <X size={14} className="hidden lg:block text-zinc-500 group-hover:text-white transition-colors" />
          </div>
          <div className="bg-[#1B3A6B] p-5 lg:p-6 rounded-xl flex items-center justify-center lg:justify-between group cursor-pointer border border-white/5 transition-colors hover:bg-zinc-800">
            <span className="text-xs lg:text-sm font-light text-zinc-300">Instagram</span>
            <ChevronRight size={14} className="hidden lg:block text-zinc-500 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="w-full bg-[#1B3A6B] py-12 px-8 rounded-xl flex flex-col items-center gap-12 flex-shrink-0 mb-4 border border-white/5">
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