'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FoodService } from '@/services/food.service';
import Navbar from '@/components/shared/Navbar';
import FoodCard from '@/components/shared/FoodCard';
import { Search, SlidersHorizontal, Utensils, Sparkles, Flame } from 'lucide-react';
import api from '@/services/axios';

export default function StorefrontHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 1. Fetch live structural categories from database cluster
  const { data: categoryRes } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => (await api.get('/categories')).data,
  });

  // 2. Fetch active food listings based on search metrics and categories
  const { data: foodRes, isLoading } = useQuery({
    queryKey: ['public-foods-catalog', selectedCategory],
    queryFn: () => {
      const paramString = selectedCategory ? `category=${selectedCategory}` : '';
      return FoodService.getAllFoods(paramString);
    },
  });

  const categories = categoryRes?.data || [];
  
  // 3. Client-side filtration overlay for high-speed indexing matching search queries
  const filteredFoods = (foodRes?.data || []).filter((food: any) =>
    food.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />

      {/* Hero Visual Spotlight Box Banner */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-orange-500/20">
              <Sparkles size={12} />
              <span>Premium Culinary Destination</span>
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Craving Excellence? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                We Deliver It Fresh.
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Explore gourmet recipes handcrafted by world-class chefs. Track your meals instantly from the flame grill directly to your front door.
            </p>
          </div>

          {/* Interactive Filtering and Live Query Search Bar */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold tracking-wider text-orange-400 uppercase flex items-center gap-2">
              <Flame size={14} />
              <span>Locate Your Next Meal</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search pizzas, global burgers, dynamic pastas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Catalog Segment Component Layer */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full space-y-10">
        
        {/* Category Filters Carousel Row */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-lg">
            <SlidersHorizontal size={18} className="text-orange-600" />
            <h2>Filter By Category Selection</h2>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/10'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              All Delicacies
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 whitespace-nowrap ${
                  selectedCategory === cat._id
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/10'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Multi-Column Grid Display Panel */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 h-80 animate-pulse space-y-4">
                <div className="bg-slate-200 h-40 rounded-xl w-full" />
                <div className="bg-slate-200 h-5 rounded-md w-2/3" />
                <div className="bg-slate-200 h-4 rounded-md w-full" />
                <div className="flex justify-between items-center pt-2">
                  <div className="bg-slate-200 h-6 rounded-md w-1/3" />
                  <div className="bg-slate-200 h-8 rounded-md w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl max-w-md mx-auto p-8 space-y-4">
            <Utensils className="mx-auto text-slate-300" size={44} />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">No Recipes Match Your Criteria</h3>
              <p className="text-slate-400 text-xs mt-1">Try modifying your text parameters or clearing chosen filtering metrics.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFoods.map((food: any) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}