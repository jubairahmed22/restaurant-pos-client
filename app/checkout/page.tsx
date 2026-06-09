'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/shared/Navbar';
import api from '@/services/axios';
import toast from 'react-hot-toast';
import { CreditCard, Truck, User, Phone, Mail, ShieldCheck, Loader2 } from 'lucide-react';

// ─── Square types ──────────────────────────────────────────────────────────────
declare global {
  interface Window {
    Square?: any;
  }
}

// ─── Load Square Web Payments SDK script ──────────────────────────────────────
function loadSquareScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) { resolve(); return; }
    const script = document.createElement('script');
    // Use sandbox script if env says so, otherwise production
    const isSandbox = process.env.NEXT_PUBLIC_SQUARE_ENV === 'sandbox';
    script.src = isSandbox
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js';
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Square SDK'));
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotals, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { subtotal, delivery, total } = getCartTotals();

  // Guest / prefilled form state
  const [fullName,        setFullName]        = useState(user?.fullName || user?.name || '');
  const [email,           setEmail]           = useState(user?.email || '');
  const [phone,           setPhone]           = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');

  const [cardReady,    setCardReady]    = useState(false);
  const [cardError,    setCardError]    = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const cardInstanceRef = useRef<any>(null);
  const containerRef    = useRef<HTMLDivElement>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) router.push('/');
  }, [items, router]);

  // Load & initialise Square card element
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SQUARE_APP_ID || !process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID) {
      setCardError('Square is not configured. Contact the restaurant.');
      return;
    }

    let card: any;

    (async () => {
      try {
        await loadSquareScript();

        const payments = window.Square!.payments(
          process.env.NEXT_PUBLIC_SQUARE_APP_ID,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
        );

        card = await payments.card({
          style: {
            '.input-container': { borderRadius: '12px', borderColor: '#e2e8f0' },
            '.input-container.is-focus': { borderColor: '#1B3A6B' },
            '.message-text.is-error': { color: '#ef4444' },
            input: { fontSize: '14px', fontFamily: 'inherit', color: '#1e293b' },
          },
        });

        await card.attach('#square-card-container');
        cardInstanceRef.current = card;
        setCardReady(true);
      } catch (err: any) {
        setCardError(err.message || 'Card widget failed to load');
      }
    })();

    return () => {
      if (card) card.destroy().catch(() => {});
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardReady || !cardInstanceRef.current) {
      toast.error('Card widget is not ready yet. Please wait a moment.');
      return;
    }
    if (!fullName.trim())        { toast.error('Full name is required.');        return; }
    if (!phone.trim())           { toast.error('Phone number is required.');      return; }
    if (!shippingAddress.trim()) { toast.error('Delivery address is required.'); return; }

    try {
      setIsProcessing(true);

      // 1 — Tokenize the card via Square SDK
      const result = await cardInstanceRef.current.tokenize();
      if (result.status !== 'OK') {
        const msg = result.errors?.[0]?.message || 'Card tokenisation failed. Check your card details.';
        toast.error(msg);
        return;
      }

      const sourceId = result.token;

      // 2 — Send to backend: Square charge + order creation in one call
      const formattedItems = items.map(item => ({
        food:     item.foodId,
        title:    item.title,
        price:    item.price,
        quantity: item.quantity,
      }));

      const { data } = await api.post('/payments/square', {
        sourceId,
        fullName:        fullName.trim(),
        email:           email.trim(),
        phone:           phone.trim(),
        shippingAddress: shippingAddress.trim(),
        items:           formattedItems,
        subtotal,
        deliveryCharge:  delivery,
        total,
      });

      if (data.success) {
        clearCart();
        toast.success('Payment successful! Your order is placed.');
        router.push('/orders/success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Payment failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-serif italic text-[#1B3A6B] tracking-tight">
              Checkout
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              No account needed — just fill in your details and pay securely.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* ── LEFT COLUMN — form ── */}
              <div className="lg:col-span-2 space-y-6">

                {/* ─── Customer Details ─── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                  <h2 className="text-base font-bold text-[#1B3A6B] flex items-center gap-2">
                    <User size={18} /> Your Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Jane Smith"
                        required
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/5 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Phone <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+61 4XX XXX XXX"
                          required
                          className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/5 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email <span className="text-slate-300">(optional — for receipt)</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/5 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* ─── Delivery Address ─── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <h2 className="text-base font-bold text-[#1B3A6B] flex items-center gap-2">
                    <Truck size={18} /> Delivery Address
                  </h2>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Address <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={e => setShippingAddress(e.target.value)}
                      required
                      rows={3}
                      placeholder="Street, Suburb, State, Postcode — e.g. 123 Collins St, Melbourne VIC 3000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/5 transition resize-none"
                    />
                  </div>
                </div>

                {/* ─── Card Payment ─── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <h2 className="text-base font-bold text-[#1B3A6B] flex items-center gap-2">
                    <CreditCard size={18} /> Card Payment
                  </h2>

                  {/* Security badge */}
                  <div className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <ShieldCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Secured by <strong className="text-slate-700">Square</strong> — your card details are encrypted and never touch our servers. Powered by Square Australia (AUD).
                    </p>
                  </div>

                  {/* Square card widget mount point */}
                  {cardError ? (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm">
                      {cardError}
                    </div>
                  ) : (
                    <div className="relative min-h-[56px]">
                      {!cardReady && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                          <Loader2 size={20} className="animate-spin text-[#1B3A6B]" />
                          <span className="ml-2 text-sm text-slate-400">Loading card widget…</span>
                        </div>
                      )}
                      <div
                        id="square-card-container"
                        ref={containerRef}
                        className={cardReady ? '' : 'opacity-0 pointer-events-none'}
                      />
                    </div>
                  )}
                </div>

                {/* ─── Submit ─── */}
                <button
                  type="submit"
                  disabled={isProcessing || !cardReady || !!cardError}
                  className="w-full flex items-center justify-center gap-2 bg-[#1B3A6B] hover:bg-[#14305a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-[#1B3A6B]/20 text-base"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing payment…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Pay A${total.toFixed(2)} securely
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400">
                  By placing an order you agree to our terms and conditions.
                  Payments processed by Square — compliant with PCI DSS.
                </p>
              </div>

              {/* ── RIGHT COLUMN — order summary ── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 lg:sticky lg:top-6">
                <h3 className="font-bold text-[#1B3A6B] text-base border-b border-slate-100 pb-3">
                  Order Summary
                </h3>

                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 pr-1 space-y-0">
                  {items.map(item => (
                    <div key={item.foodId} className="py-2.5 flex justify-between items-center text-xs">
                      <div className="truncate pr-2">
                        <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                        <p className="text-slate-400">× {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-700 shrink-0">
                        A${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span><span>A${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery</span><span>A${delivery.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#1B3A6B] font-black text-sm pt-2 border-t border-slate-100">
                    <span>Total</span><span>A${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Square logo / trust badge */}
                <div className="pt-2 flex items-center justify-center gap-1.5 text-slate-300 text-[10px] font-medium uppercase tracking-widest">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  Secured by Square
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}
