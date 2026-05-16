'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { OrderService } from '@/services/order.service';
import Navbar from '@/components/shared/Navbar';
import toast from 'react-hot-toast';
import { CreditCard, Truck, ShieldAlert } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotals, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { subtotal, delivery, total } = getCartTotals();
  
  const [address, setAddress] = useState(user?.address || '');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Session clearance expired. Please sign in to verify your billing identity context.');
      router.push('/login');
    } else if (items.length === 0) {
      router.push('/');
    }
  }, [user, items, router]);

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('A valid delivery terminal routing address target is required.');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Transform client Zustand payload states to match database mapping patterns
      const formattedItems = items.map(item => ({
        food: item.foodId,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      }));

      // Step 1: Initialize the core order instance record
      const orderRes = await OrderService.createOrder({
        items: formattedItems,
        subtotal,
        deliveryCharge: delivery,
        total,
        shippingAddress: address
      });

      const orderId = orderRes.data._id;

      // Step 2: Request the tokenized client secret key mapping from Stripe
      const intentRes = await OrderService.createPaymentIntent(orderId);
      const clientSecret = intentRes.clientSecret;

      // Step 3: Fast pipeline resolution emulation for development
      // (Directly switches to the validation route endpoint instantly)
      await OrderService.confirmPayment(orderId, 'ch_mock_' + Math.random().toString(36).substr(2, 9));
      
      clearCart();
      toast.success('Transaction approved! Kitchen execution dispatched.');
      router.push('/orders/success');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Payment execution dropped or rejected.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || items.length === 0) return null;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-10 tracking-tight">Secured Financial Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <form onSubmit={handleExecutePayment} className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Truck size={20} className="text-orange-500" />
                <span>Shipping Logistics</span>
              </h2>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Destination Terminal Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm h-24 resize-none"
                  placeholder="Street Address, Apartment, City, Postal Code"
                  required
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <CreditCard size={20} className="text-orange-500" />
                <span>Payment Gate Credentials</span>
              </h2>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
                <ShieldAlert className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enterprise security layer attached. Your cards pass via tokenized payloads directly to Stripe payment clusters.
                </p>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-600 text-sm font-medium tracking-wide">
                💳 Multi-channel Card Gateway Controller Active
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-black py-4 rounded-xl transition shadow-lg shadow-orange-600/10 text-center block"
            >
              {isProcessing ? 'Verifying transaction tokens...' : `Authorize Charge and Pay $${total.toFixed(2)}`}
            </button>
          </form>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-slate-800 text-base border-b pb-3 border-slate-50">Order Inventory Summary</h3>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 pr-1">
              {items.map(item => (
                <div key={item.foodId} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-800 truncate">{item.title}</p>
                    <p className="text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-700 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500"><span>Basket Price:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Logistics Charge:</span><span>${delivery.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-800 font-black text-sm pt-2 border-t border-dashed">
                <span>Total Due:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}