'use client';

import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FoodService } from '@/services/food.service';
import { useCartStore } from '@/store/cartStore';
import Navbar from '@/components/shared/Navbar';
import toast from 'react-hot-toast';
import { ShoppingBag, ChevronLeft, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function FoodDetailsPage({ params }: PageProps) {
  const { slug } = use(params);
  const addItem = useCartStore((state) => state.addItem);

  const { data: foodResponse, isLoading, error } = useQuery({
    queryKey: ['food-details', slug],
    queryFn: () => FoodService.getFoodBySlug(slug),
  });

  const food = foodResponse?.data;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-6 w-24 bg-slate-200 rounded-lg" />
          <div className="h-96 w-full bg-slate-200 rounded-2xl" />
          <div className="h-10 w-2/3 bg-slate-200 rounded-xl" />
          <div className="h-20 w-full bg-slate-200 rounded-xl" />
        </div>
      </>
    );
  }

  if (error || !food) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Menu Item Not Found</h2>
          <p className="text-slate-500 mb-6">The requested dish configuration record could not be pulled from database storage.</p>
          <Link href="/" className="bg-orange-600 text-white font-medium px-6 py-2.5 rounded-xl">Back to Menu</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600 transition mb-8 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition" />
          <span>Back to Menu Marketplace</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-50 border border-slate-100">
            <img src={food.image} alt={food.title} className="object-cover w-full h-full transition hover:scale-105 duration-500" />
          </div>

          <div className="space-y-6">
            <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              {food.category?.title || 'Gourmet Selection'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">{food.title}</h1>
            <p className="text-slate-600 text-base leading-relaxed">{food.description}</p>
            
            <div className="flex items-center gap-6 border-y border-slate-100 py-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Clock size={16} />
                <span>Prep Time: ~20 mins</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <ShieldCheck size={16} />
                <span>Fresh Ingredients</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 pt-4">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unit Cost Price</p>
                <p className="text-4xl font-black text-slate-900">${food.price.toFixed(2)}</p>
              </div>

              <button
                onClick={() => {
                  addItem({ foodId: food._id, title: food.title, price: food.price, image: food.image, quantity: 1 });
                  toast.success(`Appended ${food.title} to your order basket!`);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl transition flex items-center gap-3 shadow-md shadow-orange-600/10 hover:shadow-orange-600/20"
              >
                <ShoppingBag size={20} />
                <span>Add to Basket Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}