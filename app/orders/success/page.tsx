'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle size={44} strokeWidth={2.5} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Finalized!</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your transaction has been approved. A digital receipt and delivery invoice verification route copy has been sent to your primary email profile address.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2">
            <ShoppingBag size={16} />
            <span>Order More</span>
          </Link>
          <Link href="/" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2">
            <span>Track Live</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}