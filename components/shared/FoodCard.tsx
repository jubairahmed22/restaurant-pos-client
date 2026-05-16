'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Plus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface FoodCardProps {
  food: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    image: string;
    category?: { title: string };
  };
}

export default function FoodCard({ food }: FoodCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents layout navigation redirect chains when hitting the absolute card canvas boundary
    addItem({
      foodId: food._id,
      title: food.title,
      price: food.price,
      image: food.image,
      quantity: 1
    });
    toast.success(`Appended ${food.title} to your selection!`);
  };

  return (
    <Link 
      href={`/food/${food.slug}`}
      className="group bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition duration-300 flex flex-col justify-between h-full relative"
    >
      <div className="space-y-3 w-full">
        {/* Main Presentation Image Container */}
        <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-50 w-full border border-slate-50">
          <img 
            src={food.image} 
            alt={food.title} 
            className="object-cover w-full h-full transform group-hover:scale-105 transition duration-500"
          />
          {food.category && (
            <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-slate-800 font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg shadow-sm">
              {food.category.title}
            </span>
          )}
        </div>

        {/* Text Explanatory Stack */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-800 text-base tracking-tight group-hover:text-orange-600 transition truncate">
            {food.title}
          </h3>
          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed min-h-[2rem]">
            {food.description}
          </p>
        </div>
      </div>

      {/* Quantitative Bottom Execution Row Bar */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-50 mt-4 w-full">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
          <span className="text-lg font-black text-slate-900">${food.price.toFixed(2)}</span>
        </div>

        <button
          onClick={handleQuickAdd}
          className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-orange-600 transition shadow-sm group/btn flex items-center justify-center"
          title="Add instantly to cart"
        >
          <Plus size={16} className="transform group-hover/btn:rotate-90 transition duration-200" />
        </button>
      </div>
    </Link>
  );
}