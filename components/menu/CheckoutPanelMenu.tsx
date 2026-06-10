'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import {
  ShoppingCart, User, Phone, Mail,
  Trash2, ChevronRight, CheckCircle2, X, Printer,
  CreditCard, ShieldCheck, Loader2, ArrowLeft, Lock,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import OrderItemMenu from './OrderItemMenu';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete';
import api from '@/services/axios';
import { usePickupStore } from '@/store/pickupStore';

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════════════════ */

export interface CustomerInfo {
  fullName: string;
  email:    string;
  phone:    string;
  address:  string;
}

declare global {
  interface Window { Square?: any; }
}

type Step = 'cart' | 'payment' | 'done';

const EMPTY_CUSTOMER: CustomerInfo = { fullName: '', email: '', phone: '', address: '' };
const CART_KEY = 'menu-cart';

/* ═══════════════════════════════════════════════════════════════════════════════
   SQUARE SDK LOADER (singleton — only loads once per page)
═══════════════════════════════════════════════════════════════════════════════ */

let squareScriptPromise: Promise<void> | null = null;

function loadSquareSDK(): Promise<void> {
  if (squareScriptPromise) return squareScriptPromise;
  squareScriptPromise = new Promise((resolve, reject) => {
    if (window.Square) { resolve(); return; }
    // Remove any stale script tag before adding a fresh one
    document.querySelectorAll('script[src*="squarecdn"]').forEach(el => el.remove());
    const script    = document.createElement('script');
    const isSandbox = process.env.NEXT_PUBLIC_SQUARE_ENV === 'sandbox';
    script.src      = isSandbox
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js';
    script.onload   = () => resolve();
    script.onerror  = () => { squareScriptPromise = null; reject(new Error('Failed to load Square SDK')); };
    document.head.appendChild(script);
  });
  return squareScriptPromise;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   RECEIPT (thermal 80 mm)
═══════════════════════════════════════════════════════════════════════════════ */

function buildReceiptHTML(
  customer: CustomerInfo, cart: any[],
  subtotal: number, tax: number, total: number, orderId: string,
): string {
  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  const rows    = cart.map((item: any) => `
    <tr>
      <td class="item-name">${item.title || item.name}</td>
      <td class="item-qty">${item.qty}&nbsp;×&nbsp;A$${Number(item.price).toFixed(2)}</td>
      <td class="item-total">A$${(item.qty * item.price).toFixed(2)}</td>
    </tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt #${orderId}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Courier New',Courier,monospace;font-size:13px;color:#000;background:#fff;width:302px;margin:0 auto;padding:16px 10px 32px}
    .center{text-align:center}.dashed{border-top:1px dashed #000;margin:10px 0}.solid{border-top:2px solid #000;margin:10px 0}
    .rname{font-size:22px;font-weight:900;letter-spacing:3px;text-transform:uppercase}
    .small{font-size:11px;color:#555;margin-top:2px}
    .oid{font-size:11px;color:#888;margin-top:4px}
    .slabel{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#777;margin-bottom:5px}
    .cname{font-size:13px;font-weight:700}.cdet{font-size:11px;color:#333;margin-top:2px}
    table{width:100%;border-collapse:collapse}
    .item-name{padding:5px 0;font-size:12px;vertical-align:top;width:44%}
    .item-qty{padding:5px 4px;font-size:11px;text-align:center;white-space:nowrap}
    .item-total{padding:5px 0;font-size:12px;text-align:right;font-weight:700;white-space:nowrap}
    .sl{font-size:12px;padding:3px 0}.sv{font-size:12px;text-align:right}
    .tl{font-size:17px;font-weight:900;padding-top:6px}.tv{font-size:17px;font-weight:900;text-align:right;padding-top:6px}
    .foot{font-size:11px;color:#555;margin-top:14px;line-height:1.8}
    .badge{display:inline-block;border:1px solid #1B3A6B;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;color:#1B3A6B;letter-spacing:1px;text-transform:uppercase}
    @media print{body{width:80mm}@page{margin:0;size:80mm auto}}
  </style></head><body>
  <div class="center" style="padding-bottom:10px">
    <p class="rname">Restaurant</p>
    <p class="small">Premium Food Experience</p>
    <p class="oid">Order #${orderId.toUpperCase()}</p>
    <p class="small">${dateStr} &bull; ${timeStr}</p>
  </div>
  <div class="dashed"></div>
  <div style="padding:4px 0 8px">
    <p class="slabel">Customer</p>
    <p class="cname">${customer.fullName}</p>
    ${customer.phone   ? `<p class="cdet">${customer.phone}</p>` : ''}
    ${customer.address ? `<p class="cdet">${customer.address}</p>` : ''}
    ${customer.email   ? `<p class="cdet">${customer.email}</p>` : ''}
  </div>
  <div class="dashed"></div>
  <div style="padding:4px 0 8px">
    <p class="slabel">Items</p>
    <table><tbody>${rows}</tbody></table>
  </div>
  <div class="dashed"></div>
  <table><tbody>
    <tr><td class="sl">Subtotal</td><td class="sv">A$${subtotal.toFixed(2)}</td></tr>
    <tr><td class="sl">Tax (12.5%)</td><td class="sv">A$${tax.toFixed(2)}</td></tr>
  </tbody></table>
  <div class="solid"></div>
  <table><tbody>
    <tr><td class="tl">TOTAL</td><td class="tv">A$${total.toFixed(2)}</td></tr>
  </tbody></table>
  <div class="dashed"></div>
  <div class="center" style="margin:6px 0"><span class="badge">&#128274; Paid via Square</span></div>
  <div class="center foot">
    <p>&#9829; Thank you for dining with us! &#9829;</p>
    <p>Please come again soon</p>
  </div>
  </body></html>`;
}

function printReceipt(
  customer: CustomerInfo, cart: any[],
  subtotal: number, tax: number, total: number, orderId: string,
) {
  const html = buildReceiptHTML(customer, cart, subtotal, tax, total, orderId);
  const win  = window.open('', '_blank', 'width=420,height=720,toolbar=0,scrollbars=0,status=0');
  if (!win) return;
  win.document.open(); win.document.write(html); win.document.close();
  win.onafterprint = () => win.close();
  win.onload = () => { win.focus(); win.print(); };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TRANSPARENT INPUT (reusable form field)
═══════════════════════════════════════════════════════════════════════════════ */

function TransparentInput({ icon, placeholder, value, onChange, isTextArea = false, type = 'text' }: any) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-[#1B3A6B] focus-within:bg-white transition-all group">
      <span className="mt-0.5 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors shrink-0">
        {icon}
      </span>
      {isTextArea ? (
        <textarea
          rows={2}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 text-[#1B3A6B] font-medium resize-none"
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 text-[#1B3A6B] font-medium"
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SQUARE CARD STEP (isolated component — manages SDK lifecycle)
═══════════════════════════════════════════════════════════════════════════════ */

interface SquareStepProps {
  total:        number;
  tax:          number;
  subtotal:     number;
  cart:         any[];
  customer:     CustomerInfo;
  containerId:  string;
  onBack:       () => void;
  onSuccess:    (orderId: string) => void;
}

function SquarePaymentStep({
  total, tax, subtotal, cart, customer, containerId, onBack, onSuccess,
}: SquareStepProps) {
  const appId      = process.env.NEXT_PUBLIC_SQUARE_APP_ID      || '';
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '';
  const configured = !!(appId && locationId);

  const [cardReady,    setCardReady]    = useState(false);
  const [cardError,    setCardError]    = useState(!configured ? 'Square is not configured — contact the restaurant.' : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const cardRef = useRef<Record<string, (...a: unknown[]) => unknown> | null>(null);

  // Inject a global CSS rule to nuke the postal code row regardless of class names
  useEffect(() => {
    const id  = `sq-hide-postal-${containerId}`;
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      #${containerId} [class*="postal"],
      #${containerId} [id*="postal"],
      #${containerId} [data-testid*="postal"],
      #${containerId} iframe[title*="ostal"],
      #${containerId} iframe[title*="ip"] { display: none !important; height: 0 !important; overflow: hidden !important; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, [containerId]);

  useEffect(() => {
    if (!configured) return;

    let card: any;
    let destroyed = false;

    (async () => {
      try {
        await loadSquareSDK();
        if (destroyed) return;

        console.log('[Square] init — appId:', appId, '| locationId:', locationId, '| env:', process.env.NEXT_PUBLIC_SQUARE_ENV);
        const payments = window.Square!.payments(appId, locationId);
        card = await payments.card({
          // Square sandbox validates as US ZIP (5-digit). Pre-fill a valid value
          // so it passes silently. AU banks don't check AVS so this is harmless.
          postalCode: '10001',
          style: {
            '.input-container': {
              borderRadius: '12px',
              borderColor:  '#e2e8f0',
            },
            '.input-container.is-focus': { borderColor: '#1B3A6B' },
            '.message-text.is-error':    { color: '#ef4444' },
            'input': {
              fontSize:   '14px',
              fontFamily: 'inherit',
              color:      '#1e293b',
            },
          },
        });

        if (destroyed) { card.destroy().catch(() => {}); return; }

        await card.attach(`#${containerId}`);

        // ── Hide postal code field — AU cards don't use AVS ──────────────
        // Square renders each field in its own iframe. We find the postal
        // code iframe by title and hide its top-level wrapper div.
        const hidePostalField = (): boolean => {
          const container = document.getElementById(containerId);
          if (!container) return false;

          // 1. Find by iframe title (most reliable)
          const iframes = Array.from(container.querySelectorAll('iframe'));
          for (const iframe of iframes) {
            const t = (iframe.getAttribute('title') || '').toLowerCase();
            if (t.includes('postal') || t.includes('zip')) {
              // Walk up until direct child of our container
              let el: HTMLElement | null = iframe.parentElement;
              while (el && el.parentElement !== container) el = el.parentElement;
              if (el) { el.style.setProperty('display', 'none', 'important'); return true; }
            }
          }

          // 2. Fallback: match any element with "postal" in class or id
          const byClass = container.querySelector<HTMLElement>('[class*="postal"],[id*="postal"]');
          if (byClass) {
            let el: HTMLElement | null = byClass;
            while (el && el.parentElement !== container) el = el.parentElement;
            if (el) { el.style.setProperty('display', 'none', 'important'); return true; }
          }

          return false;
        };

        // Try immediately; if Square hasn't finished rendering yet, retry every 150 ms
        if (!hidePostalField()) {
          const iv = setInterval(() => { if (hidePostalField()) clearInterval(iv); }, 150);
          setTimeout(() => clearInterval(iv), 4000); // give up after 4 s
        }

        cardRef.current = card;
        setCardReady(true);
      } catch (err: unknown) {
        const msg = (err as { message?: string }).message;
        if (!destroyed) setCardError(msg || 'Card widget failed to load');
      }
    })();

    return () => {
      destroyed = true;
      if (cardRef.current) {
        void (cardRef.current.destroy() as Promise<void>).catch(() => {});
        cardRef.current = null;
      }
    };
  }, [configured, appId, locationId, containerId]);

  const handlePay = async () => {
    if (!cardRef.current || !cardReady) return;

    try {
      setIsProcessing(true);

      type TokenizeResult = { status: string; token?: string; errors?: { message: string }[] };
      const result = await cardRef.current.tokenize() as TokenizeResult;
      if (result.status !== 'OK') {
        const msg = result.errors?.[0]?.message || 'Card tokenisation failed. Please check your card details.';
        setCardError(msg);
        return;
      }

      const formattedItems = cart.map((item: any) => ({
        food:     item._id,
        title:    item.title || item.name,
        price:    item.price,
        quantity: item.qty ?? item.quantity ?? 1,
      }));

      const { data } = await api.post('/payments/square', {
        sourceId:        result.token,
        fullName:        customer.fullName,
        email:           customer.email,
        phone:           customer.phone,
        shippingAddress: customer.address || 'Dine-In',
        items:           formattedItems,
        subtotal,
        deliveryCharge:  tax,
        total,
      });

      if (data.success) {
        onSuccess(data.data?.orderId || data.data?._id || '');
      }
    } catch (err: any) {
      // Log full error so we can see exactly what Square / backend returned
      console.error('❌ Payment error:', {
        status:  err.response?.status,
        data:    err.response?.data,
        message: err.message,
      });
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Payment failed. Please try again.';
      setCardError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#1B3A6B] transition disabled:opacity-40"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 2 of 2</p>
          <h2 className="text-lg font-serif italic text-[#1B3A6B]">Card Payment</h2>
        </div>
      </div>

      {/* Amount pill */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 mb-5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Due</span>
        <span className="text-xl font-bold text-[#1B3A6B]">A${total.toFixed(2)}</span>
      </div>

      {/* Card widget */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
        {/* Security badge */}
        <div className="flex items-center gap-2.5 bg-emerald-50 rounded-2xl px-4 py-3 border border-emerald-100">
          <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
          <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
            Secured by <strong>Square</strong> — card details are encrypted end-to-end. PCI DSS compliant.
          </p>
        </div>

        {/* Square card mount */}
        {cardError ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm leading-relaxed">
            {cardError}
          </div>
        ) : (
          <div className="relative">
            {/* Loading shimmer */}
            {!cardReady && (
              <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[56px]">
                <Loader2 size={16} className="animate-spin text-[#1B3A6B]" />
                <span className="text-xs text-slate-400">Loading card widget…</span>
              </div>
            )}
            {/* Square injects into this div */}
            <div
              id={containerId}
              className={`min-h-[56px] transition-opacity duration-300 ${cardReady ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        )}

        {/* Order summary mini */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Order Summary</p>
          <div className="max-h-36 overflow-y-auto space-y-1.5 no-scrollbar">
            {cart.map((item: any) => (
              <div key={item._id} className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium truncate pr-2">
                  {item.title || item.name}
                  <span className="text-slate-400 ml-1">× {item.qty}</span>
                </span>
                <span className="text-[#1B3A6B] font-bold shrink-0">
                  A${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 pt-2 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span><span>A${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Tax (12.5%)</span><span>A${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#1B3A6B] pt-1 border-t border-slate-200">
              <span>Total</span><span>A${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={isProcessing || !cardReady || !!cardError}
        className="mt-5 w-full h-14 rounded-2xl bg-[#1B3A6B] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2.5 hover:bg-[#14305a] transition-colors shadow-lg shadow-[#1B3A6B]/20 text-sm"
      >
        {isProcessing ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Processing payment…
          </>
        ) : (
          <>
            <Lock size={15} />
            Pay A${total.toFixed(2)} securely
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-slate-400 mt-2">
        Powered by Square · AUD · PCI DSS
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SUCCESS MODAL
═══════════════════════════════════════════════════════════════════════════════ */

function SuccessModal({
  onClose, onPrint, variant = 'card',
}: {
  onClose: () => void;
  onPrint?: () => void;
  variant?: 'card' | 'restaurant';
}) {
  const isRestaurant = variant === 'restaurant';
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
          <X size={18} />
        </button>
        <div className={`flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-5 ${isRestaurant ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
          <CheckCircle2 className={isRestaurant ? 'text-amber-500' : 'text-emerald-500'} size={40} />
        </div>
        <h2 className="text-2xl font-serif italic text-[#1B3A6B]">
          {isRestaurant ? 'Order Confirmed!' : 'Payment Successful!'}
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          {isRestaurant
            ? 'Your order is placed. Please pay when you pick up at the restaurant.'
            : 'Order placed and payment received via Square. Receipt is ready.'}
        </p>
        {!isRestaurant && onPrint && (
          <button onClick={onPrint} className="mt-5 w-full h-12 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition text-sm font-bold flex items-center justify-center gap-2">
            <Printer size={15} /> Print Receipt
          </button>
        )}
        <button onClick={onClose} className="mt-3 w-full h-12 rounded-2xl bg-[#1B3A6B] text-white font-bold hover:bg-[#1B3A6B]/90 transition text-sm shadow-sm">
          Done
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */

export default function CheckoutPanelMenu({
  cart, subtotal, tax, total,
  setCart, increaseQty, decreaseQty, removeItem, onOrderSuccess,
}: any) {
  const queryClient = useQueryClient();

  const [step,              setStep]             = useState<Step>('cart');
  const [customer,          setCustomer]         = useState<CustomerInfo>(EMPTY_CUSTOMER);
  const [showSuccessModal,  setShowSuccessModal]  = useState(false);
  const [successVariant,    setSuccessVariant]    = useState<'card' | 'restaurant'>('card');
  const [isPayingAtRest,    setIsPayingAtRest]    = useState(false);

  const pickup = usePickupStore();

  // Unique container id per component instance (desktop sidebar / mobile drawer coexist)
  const uid         = useId().replace(/:/g, '');
  const containerId = `sq-card-${uid}`;

  const completedOrderRef = useRef<{
    customer: CustomerInfo; cart: any[];
    subtotal: number; tax: number; total: number; orderId: string;
  } | null>(null);

  const clearCartAndStorage = useCallback(() => {
    setCart([]);
    try { localStorage.removeItem(CART_KEY); } catch {}
  }, [setCart]);

  const handleField = (field: keyof CustomerInfo, value: string) =>
    setCustomer(prev => ({ ...prev, [field]: value }));

  const handleProceedToPayment = () => {
    if (cart.length === 0) return;
    if (!customer.fullName.trim() || !customer.phone.trim()) {
      alert('Please enter your full name and phone number.');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSuccess = async (orderId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

    const snapshot = {
      customer: { ...customer },
      cart:     cart.map((i: any) => ({ ...i })),
      subtotal, tax, total,
      orderId: orderId || Date.now().toString(36),
    };
    completedOrderRef.current = snapshot;

    clearCartAndStorage();
    setCustomer(EMPTY_CUSTOMER);
    setStep('cart');

    printReceipt(snapshot.customer, snapshot.cart, snapshot.subtotal, snapshot.tax, snapshot.total, snapshot.orderId);
    setShowSuccessModal(true);
    onOrderSuccess?.();
  };

  const handleManualPrint = () => {
    const s = completedOrderRef.current;
    if (!s) return;
    printReceipt(s.customer, s.cart, s.subtotal, s.tax, s.total, s.orderId);
  };

  const handlePayInRestaurant = async () => {
    if (cart.length === 0) return;
    if (!customer.fullName.trim() || !customer.phone.trim()) {
      alert('Please enter your full name and phone number.');
      return;
    }
    try {
      setIsPayingAtRest(true);
      type CartItem = { _id: string; title?: string; name?: string; price: number; qty?: number; quantity?: number };
      const formattedItems = (cart as CartItem[]).map((item) => ({
        food:     item._id,
        title:    item.title || item.name,
        price:    item.price,
        quantity: item.qty ?? item.quantity ?? 1,
      }));
      const { data } = await api.post('/payments/pay-in-restaurant', {
        fullName:         customer.fullName,
        email:            customer.email,
        phone:            customer.phone,
        shippingAddress:  customer.address || 'Pickup',
        items:            formattedItems,
        subtotal,
        deliveryCharge:   tax,
        total,
        pickupDate:         pickup.date,
        pickupTime:         pickup.time,
        pickupDisplayDate:  pickup.displayDate,
        pickupDisplayTime:  pickup.displayTime,
      });
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        clearCartAndStorage();
        setCustomer(EMPTY_CUSTOMER);
        setSuccessVariant('restaurant');
        setShowSuccessModal(true);
        onOrderSuccess?.();
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsPayingAtRest(false);
    }
  };

  /* ───── render ───── */
  return (
    <>
      {showSuccessModal && (
        <SuccessModal
          variant={successVariant}
          onClose={() => setShowSuccessModal(false)}
          onPrint={handleManualPrint}
        />
      )}

      <div className="flex flex-col h-full text-slate-800">

        {/* ══════════════════ STEP 1 — CART + DETAILS ══════════════════ */}
        {step === 'cart' && (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-40 text-slate-400">
                  <ShoppingCart size={48} strokeWidth={1.5} />
                  <p className="mt-4 text-sm font-serif italic">Your bag is empty</p>
                </div>
              ) : (
                cart.map((item: any) => (
                  <OrderItemMenu
                    key={item._id}
                    item={item}
                    onIncrease={() => increaseQty(item._id)}
                    onDecrease={() => decreaseQty(item._id)}
                    onRemove={()   => removeItem(item._id)}
                  />
                ))
              )}
            </div>

            {/* Customer info */}
            <div className="mt-5 space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Your Details
              </h3>
              <div className="space-y-2.5">
                <TransparentInput
                  icon={<User size={14} />}  placeholder="Full Name *"
                  value={customer.fullName}  onChange={(v: string) => handleField('fullName', v)}
                />
                <TransparentInput
                  icon={<Phone size={14} />} placeholder="Phone *"
                  value={customer.phone}     onChange={(v: string) => handleField('phone', v)}
                  type="tel"
                />
                <TransparentInput
                  icon={<Mail size={14} />}  placeholder="Email (for receipt)"
                  value={customer.email}     onChange={(v: string) => handleField('email', v)}
                  type="email"
                />
                <AddressAutocomplete
                  value={customer.address}
                  onChange={(v) => handleField('address', v)}
                  placeholder="Delivery Address (Australian)"
                  rows={2}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 p-5 rounded-2xl border border-slate-100 bg-white space-y-3 shadow-sm">
              <div className="flex justify-between text-sm text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="text-[#1B3A6B] font-bold">A${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 font-medium">
                <span>Tax (12.5%)</span>
                <span className="text-[#1B3A6B] font-bold">A${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                <span className="text-lg font-serif italic text-[#1B3A6B]">Total</span>
                <span className="text-2xl font-bold text-[#1B3A6B]">A${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 mt-4">

              {/* Primary CTA — Pay with Card */}
              <button
                onClick={handleProceedToPayment}
                disabled={cart.length === 0}
                className="w-full h-14 bg-[#1B3A6B] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#14305a] transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-[#1B3A6B]/10"
              >
                <CreditCard size={16} />
                <span className="text-xs uppercase tracking-widest font-bold">Pay with Card</span>
                <ChevronRight size={16} />
              </button>

              {/* Secondary row — Pay in Restaurant + Clear */}
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={handlePayInRestaurant}
                  disabled={cart.length === 0 || isPayingAtRest}
                  className="h-12 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-sm hover:opacity-90"
                  style={{ background: '#C05428' }}
                >
                  {isPayingAtRest ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      <span className="text-[11px] uppercase tracking-widest font-bold">Pay in Restaurant</span>
                    </>
                  )}
                </button>
                <div className='flex  justify-start'>
                  <button
                  onClick={() => { clearCartAndStorage(); setCustomer(EMPTY_CUSTOMER); }}
                  className="h-12  rounded-2xl  flex items-center justify-center text-rose-400  transition-all cursor-pointer shrink-0"
                >
                <Trash2 size={16} /> Clear
                </button>
                </div>
              </div>

            </div>
          </>
        )}

        {/* ══════════════════ STEP 2 — SQUARE PAYMENT ══════════════════ */}
        {step === 'payment' && (
          <SquarePaymentStep
            total={total}
            tax={tax}
            subtotal={subtotal}
            cart={cart}
            customer={customer}
            containerId={containerId}
            onBack={() => setStep('cart')}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </>
  );
}
