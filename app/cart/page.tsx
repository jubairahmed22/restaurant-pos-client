'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/shared/Navbar';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getCartTotals } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const { subtotal, delivery, total } = getCartTotals();

  const handleCheckoutNavigation = () => {
    if (!user) {
      toast.error('Please log in to continue with checkout.');
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-10 tracking-tight text-slate-900">Your Basket</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Your cart is empty</h2>
              <p className="text-slate-500 text-sm">Looks like you haven't added anything to your cart yet.</p>
            </div>
            <Link href="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md">
              Browse Menu Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left Side: Items Selection Table */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.foodId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0" />
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base">{item.title}</h3>
                        <p className="text-sm text-orange-600 font-bold mt-0.5">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-8">
                      {/* Quantity Controller Box */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button 
                          onClick={() => updateQuantity(item.foodId, Math.max(1, item.quantity - 1))}
                          className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                          className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-black text-slate-900 text-base w-20 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => {
                            removeItem(item.foodId);
                            toast.success(`${item.title} removed from basket.`);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Cost Summary Panel */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="font-bold text-slate-800 text-lg border-b pb-3 border-slate-50">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Cost</span>
                    <span className="font-semibold text-slate-700">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-slate-700">${delivery.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-dashed pt-4 flex justify-between text-slate-900 font-black text-lg">
                    <span>Estimated Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutNavigation}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/10"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2.5 justify-center text-slate-400 text-xs py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Secure payment layer verified</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}