'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShoppingCart, User, Phone, Mail, MapPin,
  Trash2, ChevronRight, CheckCircle2, X,
  CreditCard, ShieldCheck, Loader2, ArrowLeft, Lock, Plus, Minus,
} from 'lucide-react';
import { useShopCartStore } from '@/store/shopCartStore';
import { placeShopOrder } from '@/services/shop.service';

declare global { interface Window { Square?: any; } }

type Step = 'cart' | 'payment' | 'done';
interface CustomerInfo { fullName: string; email: string; phone: string; address: string; }
const EMPTY: CustomerInfo = { fullName: '', email: '', phone: '', address: '' };

let squareScriptPromise: Promise<void> | null = null;
function loadSquareSDK(): Promise<void> {
  if (squareScriptPromise) return squareScriptPromise;
  squareScriptPromise = new Promise((resolve, reject) => {
    if (window.Square) { resolve(); return; }
    document.querySelectorAll('script[src*="squarecdn"]').forEach(el => el.remove());
    const script = document.createElement('script');
    const isSandbox = process.env.NEXT_PUBLIC_SQUARE_ENV === 'sandbox';
    script.src = isSandbox
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js';
    script.onload = () => resolve();
    script.onerror = () => { squareScriptPromise = null; reject(new Error('Square SDK failed')); };
    document.head.appendChild(script);
  });
  return squareScriptPromise;
}

interface Props {
  onClose?: () => void;
}

export default function ShopCartPanel({ onClose }: Props) {
  const { items, increaseQty, decreaseQty, removeItem, clearCart } = useShopCartStore();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal;

  const [step, setStep] = useState<Step>('cart');
  const [customer, setCustomer] = useState<CustomerInfo>(EMPTY);
  const [isPayingAtRest, setIsPayingAtRest] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [cardError, setCardError] = useState('');
  const [doneOrderId, setDoneOrderId] = useState('');

  const cardRef = useRef<any>(null);
  const cardContainerId = 'shop-card-container';

  const mountCard = useCallback(async () => {
    if (cardRef.current) return;
    setIsLoadingCard(true);
    setCardError('');
    try {
      await loadSquareSDK();
      const appId     = process.env.NEXT_PUBLIC_SQUARE_APP_ID!;
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!;
      const payments  = window.Square!.payments(appId, locationId);
      const card      = await payments.card();
      await card.attach(`#${cardContainerId}`);
      cardRef.current = card;
      setCardReady(true);
    } catch (err: unknown) {
      setCardError((err as Error).message || 'Card failed to load');
    } finally {
      setIsLoadingCard(false);
    }
  }, []);

  useEffect(() => {
    if (step === 'payment') {
      const t = setTimeout(() => mountCard(), 80);
      return () => clearTimeout(t);
    }
    return () => {
      if (cardRef.current) {
        void (cardRef.current.destroy() as Promise<void>).catch(() => {});
        cardRef.current = null;
        setCardReady(false);
      }
    };
  }, [step, mountCard]);

  const handlePayWithCard = async () => {
    if (!cardRef.current || !cardReady) return;
    type TokenResult = { status: string; token?: string; errors?: { message: string }[] };
    try {
      const result = await cardRef.current.tokenize() as TokenResult;
      if (result.status !== 'OK') {
        alert(result.errors?.[0]?.message || 'Tokenization failed');
        return;
      }
      const res = await placeShopOrder({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        shippingAddress: customer.address,
        items: items.map(i => ({ product: i._id, title: i.title, price: i.price, quantity: i.qty, image: i.image })),
        subtotal, deliveryCharge: 0, total,
        paymentMethod: 'square',
        squarePaymentId: result.token,
      });
      setDoneOrderId(res.data?.orderId || '');
      clearCart();
      setStep('done');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || 'Payment failed');
    }
  };

  const handlePayInRestaurant = async () => {
    if (!customer.fullName || items.length === 0) return;
    setIsPayingAtRest(true);
    try {
      const res = await placeShopOrder({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        shippingAddress: customer.address,
        items: items.map(i => ({ product: i._id, title: i.title, price: i.price, quantity: i.qty, image: i.image })),
        subtotal, deliveryCharge: 0, total,
        paymentMethod: 'cash',
      });
      setDoneOrderId(res.data?.orderId || '');
      clearCart();
      setStep('done');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || 'Order failed');
    } finally {
      setIsPayingAtRest(false);
    }
  };

  const customerValid = customer.fullName.trim().length >= 2 && customer.phone.trim().length >= 8;

  /* ── Done ─────────────────────────────────────────────────────────────────── */
  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Order Placed!</h2>
        <p className="text-slate-500 text-sm">Order <span className="font-mono font-bold text-[#1B3A6B]">{doneOrderId}</span> received.</p>
        <button
          onClick={() => { setStep('cart'); setCustomer(EMPTY); if (onClose) onClose(); }}
          className="mt-4 px-6 py-3 bg-[#1B3A6B] text-white rounded-2xl font-bold text-sm hover:bg-[#14305a] transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  /* ── Payment step ─────────────────────────────────────────────────────────── */
  if (step === 'payment') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
          <button onClick={() => setStep('cart')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-800">Secure Payment</h2>
          <Lock size={14} className="text-slate-400 ml-auto" />
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Order summary */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-1">
            {items.map(i => (
              <div key={i._id} className="flex justify-between text-xs text-slate-600">
                <span className="line-clamp-1">{i.title} × {i.qty}</span>
                <span>AUD {(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-800">
              <span>Total</span><span>AUD {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Card container */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">Card Details</label>
            {isLoadingCard && (
              <div className="flex items-center justify-center h-14 rounded-xl bg-slate-50 border border-slate-200">
                <Loader2 size={18} className="animate-spin text-slate-400" />
              </div>
            )}
            {cardError && <p className="text-xs text-red-500 mb-2">{cardError}</p>}
            <div id={cardContainerId} className="min-h-14 border border-slate-200 rounded-xl px-3 py-3 bg-white" />
          </div>

          <button
            onClick={handlePayWithCard}
            disabled={!cardReady}
            className="w-full h-14 bg-[#1B3A6B] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#14305a] transition-all disabled:opacity-40"
          >
            <CreditCard size={16} />
            <span className="text-xs uppercase tracking-widest font-bold">Pay AUD {total.toFixed(2)}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Cart step ────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-[#1B3A6B]" />
          <h2 className="font-bold text-slate-800">Shop Cart</h2>
          {items.length > 0 && (
            <span className="text-xs bg-[#1B3A6B] text-white px-2 py-0.5 rounded-full font-bold">{items.reduce((s, i) => s + i.qty, 0)}</span>
          )}
        </div>
        {onClose && <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={16} className="text-slate-500" /></button>}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center px-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
            <ShoppingCart size={24} className="text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Your shop cart is empty</p>
          <p className="text-slate-400 text-xs mt-1">Browse products and add items to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map(item => (
              <div key={item._id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <img src={item.image || 'https://placehold.co/48?text=P'} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                  {item.variant && <p className="text-[10px] text-[#C05428] font-semibold">{item.variant}</p>}
                  <p className="text-xs text-slate-500">AUD {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => decreaseQty(item.cartKey)} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <Minus size={10} />
                  </button>
                  <span className="text-sm font-bold text-slate-800 w-5 text-center">{item.qty}</span>
                  <button onClick={() => increaseQty(item.cartKey)} className="w-6 h-6 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center hover:bg-[#14305a] transition-colors">
                    <Plus size={10} />
                  </button>
                </div>
                <button onClick={() => removeItem(item.cartKey)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors ml-1">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Customer form */}
          <div className="px-4 pb-2 space-y-2.5 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Details</p>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                className="w-full h-10 pl-9 pr-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 bg-white"
                placeholder="Full name *"
                value={customer.fullName}
                onChange={e => setCustomer(c => ({ ...c, fullName: e.target.value }))}
              />
            </div>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                className="w-full h-10 pl-9 pr-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 bg-white"
                placeholder="Phone *"
                value={customer.phone}
                onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))}
              />
            </div>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                className="w-full h-10 pl-9 pr-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 bg-white"
                placeholder="Email"
                value={customer.email}
                onChange={e => setCustomer(c => ({ ...c, email: e.target.value }))}
              />
            </div>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                className="w-full h-10 pl-9 pr-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 bg-white"
                placeholder="Shipping address"
                value={customer.address}
                onChange={e => setCustomer(c => ({ ...c, address: e.target.value }))}
              />
            </div>
          </div>

          {/* Totals & actions */}
          <div className="px-4 pb-5 pt-3 border-t border-slate-100 bg-white space-y-3">
            <div className="flex justify-between text-sm font-bold text-slate-800">
              <span>Total</span>
              <span className="text-[#1B3A6B]">AUD {total.toFixed(2)}</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setStep('payment')}
                disabled={items.length === 0 || !customerValid}
                className="w-full h-13 bg-[#1B3A6B] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#14305a] transition-all disabled:opacity-40 cursor-pointer shadow-md"
              >
                <CreditCard size={15} />
                <span className="text-xs uppercase tracking-widest font-bold">Pay with Card</span>
                <ChevronRight size={15} />
              </button>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button
                  onClick={handlePayInRestaurant}
                  disabled={items.length === 0 || !customerValid || isPayingAtRest}
                  className="h-11 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm hover:opacity-90"
                  style={{ background: '#C05428' }}
                >
                  {isPayingAtRest
                    ? <Loader2 size={15} className="animate-spin" />
                    : (<><ShieldCheck size={14} /><span className="text-[11px] uppercase tracking-widest font-bold">Pay Later</span></>)
                  }
                </button>
                <button
                  onClick={() => clearCart()}
                  className="h-11 w-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-100 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
