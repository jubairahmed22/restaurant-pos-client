"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Calendar, X,  } from 'lucide-react';

// Assets
import slideOne from '../app/assest/slideOne.avif';
import slideTwo from '../app/assest/slideTwo.avif';
import menu from '../app/assest/menu.avif';
import ourRestaourant from '../app/assest/our-restaourant.avif';

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
    <div className='min-h-screen w-full flex flex-row bg-[#0a0a0a] text-white font-sans selection:bg-white/20'>
      
      {/* LEFT: Premium Slider (70%) */}
      <div 
        className='relative w-[70%] h-screen overflow-hidden group'
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
        <div className="absolute bottom-12 left-12 z-20 max-w-lg p-10 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10">
          <h2 className="text-4xl font-serif italic mb-4 leading-tight">“{slides[current].title}”</h2>
          <p className="text-gray-300 font-light mb-6 leading-relaxed">"{slides[current].desc}"</p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-900" />)}
            </div>
            <span className="text-sm font-bold">{slides[current].rating} <span className="text-zinc-500 font-normal">({slides[current].reviews})</span></span>
          </div>
        </div>
      </div>
dafdas
      {/* RIGHT: Scrollable Side Panel (30%) */}
      <div className='w-[30%] h-screen bg-[#0a0a0a] flex flex-col gap-4 overflow-y-auto p-4 no-scrollbar'>
        
{/* Restaurant Card */}
        <div className="relative cursor-pointer w-full h-56 rounded-[2rem] overflow-hidden group flex-shrink-0">
          <div className="absolute top-0 left-0 bg-[#0a0a0a] px-6 py-3 rounded-br-[1.5rem] z-10 text-xs tracking-widest uppercase text-white">
            Our Restaurant
          </div>
          <Image 
            src={ourRestaourant} // Using your imported slideOne asset
            alt="Restaurant" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        </div>

        {/* Menu Card */}
        <div className="relative cursor-pointer w-full h-56 rounded-[2rem] overflow-hidden group flex-shrink-0">
          <div className="absolute top-0 left-0 bg-[#0a0a0a] px-8 py-3 rounded-br-[1.5rem] z-10 text-xs tracking-widest uppercase text-white">
            Menu
          </div>
          <Image 
            src={menu} // Using your imported slideTwo asset
            alt="Menu" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        </div>

        {/* Book a Table Button */}
        <button className="w-full bg-[#fdfcf5] py-3 px-8 rounded-2xl flex items-center justify-between group flex-shrink-0">
          <span className="text-[#1a1a1a] text-sm font-medium">Book a Table</span>
          <div className="p-2 rounded-lg bg-black/5 text-black">
             <Calendar size={18} />
          </div>
        </button>

        {/* Opening Hours Section */}
        <div className="w-full bg-[#111111] p-8 rounded-[2rem] flex flex-col gap-6 flex-shrink-0">
          <h4 className="text-zinc-500 text-sm font-light">Opening Hours</h4>
          <div className="flex flex-col gap-4">
            {openingHours.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[15px]">
                <span className="text-zinc-300 font-light">{item.day}</span>
                <div className="flex-grow mx-4 border-b border-dotted border-zinc-800 h-1"></div>
                <span className={item.time === "Closed" ? "text-zinc-500" : "text-zinc-300"}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-2 gap-4 flex-shrink-0">
          <div className="bg-[#111111] p-6 rounded-3xl flex items-center justify-between group cursor-pointer border border-white/5">
            <span className="text-sm font-light text-zinc-300">X / Twitter</span>
            {/* <X size={16} className="text-zinc-500 group-hover:text-white transition-colors" /> */}
          </div>
          <div className="bg-[#111111] p-6 rounded-3xl flex items-center justify-between group cursor-pointer border border-white/5">
            <span className="text-sm font-light text-zinc-300">Instagram</span>
            {/* < size={16} className="text-zinc-500 group-hover:text-white transition-colors" /> */}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="w-full bg-[#111111] py-12 px-8 rounded-[2rem] flex flex-col items-center gap-12 flex-shrink-0 mb-4">
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-xl font-serif italic mb-2">Menu</h3>
            <div className="flex flex-col items-center gap-4 text-white font-light text-[15px]">
              {["Home", "Menu", "About", "Restaurant", "Reservation"].map((link) => (
                <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <h3 className="text-xl font-serif italic mb-2">Utility</h3>
            <div className="flex flex-col items-center gap-4 text-white font-light text-[15px]">
              {["404", "Licensing"].map((link) => (
                <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 w-full flex flex-col items-center gap-4">
            <p className="text-zinc-600 text-[13px]">© By <span className="text-white underline cursor-pointer">Gola Templates</span></p>
            <div className="bg-white text-black px-4 py-2 rounded-full flex items-center gap-2 text-[12px] font-medium">
              <span className="rotate-45 block">▲</span> Made in Framer
            </div>
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