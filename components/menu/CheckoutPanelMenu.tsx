'use client';

import React, { useState, useRef } from 'react';
import {
  ShoppingCart, User, Phone, MapPin, Mail,
  Trash2, ChevronRight, AlertTriangle,
  CheckCircle2, X, Printer,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import OrderItemMenu from './OrderItemMenu';
import { OrderService } from '@/services/order.service';

/* ─────────── TYPES ─────────── */

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

interface ConfirmDialogProps {
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EMPTY_CUSTOMER: CustomerInfo = { fullName: '', email: '', phone: '', address: '' };
const CART_KEY = 'menu-cart';

/* ─────────── RECEIPT HTML (thermal 80 mm POS) ─────────── */

function buildReceiptHTML(
  customer: CustomerInfo, cart: any[],
  subtotal: number, tax: number, total: number, orderId: string,
): string {
  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const rows = cart.map((item: any) => `
    <tr>
      <td class="item-name">${item.title || item.name}</td>
      <td class="item-qty">${item.qty}&nbsp;x&nbsp;$${Number(item.price).toFixed(2)}</td>
      <td class="item-total">$${(item.qty * item.price).toFixed(2)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt #${orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #000;
      background: #fff;
      width: 302px;
      margin: 0 auto;
      padding: 16px 10px 32px;
    }
    .center { text-align: center; }
    .dashed { border-top: 1px dashed #000; margin: 10px 0; }
    .solid  { border-top: 2px solid #000; margin: 10px 0; }
    .restaurant-name {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    .tagline { font-size: 11px; color: #555; margin-top: 3px; }
    .order-id { font-size: 11px; color: #888; margin-top: 4px; }
    .section-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #777;
      margin-bottom: 5px;
    }
    .customer-name { font-size: 13px; font-weight: 700; }
    .customer-detail { font-size: 11px; color: #333; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; }
    .item-name  { padding: 5px 0; font-size: 12px; vertical-align: top; width: 45%; }
    .item-qty   { padding: 5px 4px; font-size: 11px; text-align: center; white-space: nowrap; }
    .item-total { padding: 5px 0; font-size: 12px; text-align: right; font-weight: 700; white-space: nowrap; }
    .summary-label { font-size: 12px; padding: 3px 0; }
    .summary-value { font-size: 12px; text-align: right; }
    .total-label { font-size: 17px; font-weight: 900; padding-top: 6px; }
    .total-value { font-size: 17px; font-weight: 900; text-align: right; padding-top: 6px; }
    .footer { font-size: 11px; color: #555; margin-top: 14px; line-height: 1.8; }
    @media print {
      body { width: 80mm; }
      @page { margin: 0; size: 80mm auto; }
    }
  </style>
</head>
<body>
  <div class="center" style="padding-bottom: 10px;">
    <p class="restaurant-name">Restaurant</p>
    <p class="tagline">Premium Food Experience</p>
    <p class="tagline">Tel: +1 (800) 000-0000</p>
    <p class="order-id">Order #${orderId.toUpperCase()}</p>
    <p class="tagline">${dateStr} &nbsp;&bull;&nbsp; ${timeStr}</p>
  </div>
  <div class="dashed"></div>
  <div style="padding: 4px 0 8px;">
    <p class="section-label">Customer</p>
    <p class="customer-name">${customer.fullName}</p>
    ${customer.phone   ? `<p class="customer-detail">${customer.phone}</p>` : ''}
    ${customer.address ? `<p class="customer-detail">${customer.address}</p>` : ''}
    ${customer.email   ? `<p class="customer-detail">${customer.email}</p>` : ''}
  </div>
  <div class="dashed"></div>
  <div style="padding: 4px 0 8px;">
    <p class="section-label">Items</p>
    <table><tbody>${rows}</tbody></table>
  </div>
  <div class="dashed"></div>
  <table>
    <tbody>
      <tr>
        <td class="summary-label">Subtotal</td>
        <td class="summary-value">$${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="summary-label">Tax (12.5%)</td>
        <td class="summary-value">$${tax.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
  <div class="solid"></div>
  <table>
    <tbody>
      <tr>
        <td class="total-label">TOTAL</td>
        <td class="total-value">$${total.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
  <div class="dashed"></div>
  <div class="center footer">
    <p>&#9829; Thank you for dining with us! &#9829;</p>
    <p>Please come again soon</p>
  </div>
</body>
</html>`;
}

/* ─────────── PRINT RECEIPT ─────────── */

function printReceipt(
  customer: CustomerInfo, cart: any[],
  subtotal: number, tax: number, total: number, orderId: string,
) {
  const html = buildReceiptHTML(customer, cart, subtotal, tax, total, orderId);
  const win  = window.open('', '_blank', 'width=420,height=720,toolbar=0,scrollbars=0,status=0');
  if (!win) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:302px;height:0;border:none;';
    document.body.appendChild(iframe);
    const iDoc = iframe.contentDocument || iframe.contentWindow!.document;
    iDoc.open(); iDoc.write(html); iDoc.close();
    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onafterprint = () => win.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
}

/* ─────────── CONFIRM DIALOG ─────────── */

export function ConfirmDialog({ total, onConfirm, onCancel, isSubmitting }: ConfirmDialogProps) {
  return (
    // Lowered Z-index slightly if needed, but inset-0 is correct for a global modal.
    // The bg-slate-900/40 is what creates that high-end dimmed look from your image.
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      
      {/* 1. Backdrop - Separate div for better control over blur/dimming */}
      <div 
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
        onClick={onCancel} // Close on clicking background
      />

      {/* 2. Dialog Box */}
      <div className="relative bg-white border border-slate-200/60 rounded-[2.5rem] p-8 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Icon Header */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-100 mx-auto mb-6">
          <AlertTriangle className="text-amber-500" size={32} />
        </div>

        {/* Text Content */}
        <div className="space-y-3 mb-8">
          <h2 className="text-2xl font-serif italic text-[#1B3A6B] text-center">
            Confirm Your Order
          </h2>
          <p className="text-slate-500 text-center leading-relaxed px-4">
            You are about to place an order for{' '}
            <span className="text-[#1B3A6B] font-bold text-lg">
              ${total.toFixed(2)}
            </span>. 
            A POS receipt will open for printing automatically.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-14 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all font-bold text-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-14 rounded-2xl bg-[#1B3A6B] text-white font-bold hover:bg-[#1B3A6B]/90 transition-all text-sm shadow-lg shadow-[#1B3A6B]/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              'Yes, Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── SUCCESS MODAL ─────────── */

function SuccessModal({ onClose, onPrint }: {
  onClose: () => void;
  onPrint: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 mx-auto mb-6">
          <CheckCircle2 className="text-emerald-500" size={40} />
        </div>
        <h2 className="text-2xl font-serif italic text-[#1B3A6B]">Order Confirmed!</h2>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          Payment complete. Receipt sent to printer.
          Need another copy?
        </p>
        <button
          onClick={onPrint}
          className="mt-5 w-full h-12 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer size={15} />
          Re-Print Receipt
        </button>
        <button
          onClick={onClose}
          className="mt-3 w-full h-12 rounded-2xl bg-[#1B3A6B] text-white font-bold hover:bg-[#1B3A6B]/90 transition-all text-sm cursor-pointer shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ─────────── PREMIUM TRANSLUCENT INPUT ─────────── */

function TransparentInput({ icon, placeholder, value, onChange, isTextArea = false }: any) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-[#1B3A6B] focus-within:bg-white transition-all group">
      <span className="mt-0.5 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors">
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
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 text-[#1B3A6B] font-medium"
        />
      )}
    </div>
  );
}

/* ─────────── MAIN COMPONENT ─────────── */

export default function CheckoutPanelMenu({
  cart, subtotal, tax, total,
  setCart, increaseQty, decreaseQty, removeItem, onOrderSuccess,
}: any) {
  const queryClient = useQueryClient();

  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [checkoutStep,      setCheckoutStep]      = useState<'cart' | 'invoice'>('cart');
  const [customer,          setCustomer]          = useState<CustomerInfo>(EMPTY_CUSTOMER);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessModal,  setShowSuccessModal]  = useState(false);

  const completedOrderRef = useRef<{
    customer: CustomerInfo; cart: any[];
    subtotal: number; tax: number; total: number; orderId: string;
  } | null>(null);

  /* helpers */
  const clearCartAndStorage = () => {
    setCart([]);
    try { localStorage.removeItem(CART_KEY); } catch {}
  };

  const handleField = (field: keyof CustomerInfo, value: string) =>
    setCustomer((prev) => ({ ...prev, [field]: value }));

  const buildShippingAddress = () => {
    const parts = [customer.fullName, customer.phone, customer.address]
      .map((s) => s.trim()).filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Dine-In / Walk-In';
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    if (!customer.fullName.trim() || !customer.phone.trim() || !customer.address.trim()) {
      alert('Please complete customer information.');
      return;
    }
    setCheckoutStep('invoice');
  };

  const handleConfirmClick = () => setShowConfirmDialog(true);

  const handleConfirmOrder = async () => {
    try {
      setIsSubmitting(true);

      const formattedItems = cart.map((item: any) => ({
        food:     item._id,
        title:    item.title || item.name,
        price:    item.price,
        quantity: item.qty ?? item.quantity ?? item.count ?? 1,
      }));

      const result = await OrderService.createOrder({
        items:           formattedItems,
        subtotal,
        deliveryCharge:  tax,
        total,
        fullName:        customer.fullName,
        email:           customer.email,
        phone:           customer.phone,
        shippingAddress: buildShippingAddress(),
      });

      if (!result.success) throw new Error(result.error || 'Failed to create order');

      await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

      const orderId  = result.data?._id ?? result.data?.id ?? Date.now().toString(36);
      const snapshot = {
        customer: { ...customer },
        cart:     cart.map((i: any) => ({ ...i })),
        subtotal, tax, total, orderId,
      };
      completedOrderRef.current = snapshot;

      clearCartAndStorage();
      setCustomer(EMPTY_CUSTOMER);
      setCheckoutStep('cart');
      setShowConfirmDialog(false);

      printReceipt(
        snapshot.customer, snapshot.cart,
        snapshot.subtotal, snapshot.tax,
        snapshot.total,    snapshot.orderId,
      );

      setShowSuccessModal(true);
      onOrderSuccess?.();
    } catch (error: any) {
      setShowConfirmDialog(false);
      alert(error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualPrint = () => {
    const s = completedOrderRef.current;
    if (!s) return;
    printReceipt(s.customer, s.cart, s.subtotal, s.tax, s.total, s.orderId);
  };

  /* ─────── render ─────── */
  return (
    <>
      {showConfirmDialog && (
        <ConfirmDialog
          total={total}
          onConfirm={handleConfirmOrder}
          onCancel={() => setShowConfirmDialog(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          onPrint={handleManualPrint}
        />
      )}

      <div className="flex flex-col h-full text-slate-800">

        {/* ══ CART STEP ══ */}
        {checkoutStep === 'cart' && (
          <>
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

            {/* Customer Info */}
            <div className="mt-6 space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Delivery Details
              </h3>
              <div className="space-y-2.5">
                <TransparentInput
                  icon={<User size={14} />} placeholder="Full Name"
                  value={customer.fullName} onChange={(v: string) => handleField('fullName', v)}
                />
                <div className="grid grid-cols-1 gap-2.5">
                  <TransparentInput
                    icon={<Phone size={14} />} placeholder="Phone"
                    value={customer.phone} onChange={(v: string) => handleField('phone', v)}
                  />
                  <TransparentInput
                    icon={<Mail size={14} />} placeholder="Email"
                    value={customer.email} onChange={(v: string) => handleField('email', v)}
                  />
                </div>
                <TransparentInput
                  icon={<MapPin size={14} />} placeholder="Shipping Address"
                  value={customer.address} isTextArea
                  onChange={(v: string) => handleField('address', v)}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 p-5 rounded-2xl border border-slate-100 bg-white space-y-3 shadow-sm">
              <div className="flex justify-between text-sm text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="text-[#1B3A6B] font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 font-medium">
                <span>Tax (12.5%)</span>
                <span className="text-[#1B3A6B] font-bold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                <span className="text-lg font-serif italic text-[#1B3A6B]">Total</span>
                <span className="text-2xl font-bold text-[#1B3A6B]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-5 gap-3 mt-4">
              <button
                onClick={() => { clearCartAndStorage(); setCustomer(EMPTY_CUSTOMER); }}
                className="col-span-1 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-all cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleOpenCheckout}
                disabled={cart.length === 0}
                className="col-span-4 h-14 bg-[#1B3A6B] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1B3A6B]/90 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-[#1B3A6B]/10 text-sm uppercase tracking-widest text-xs"
              >
                Process Checkout <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* ══ INVOICE STEP ══ */}
        {checkoutStep === 'invoice' && (
          <div className="flex flex-col h-full">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Invoice Preview</p>
                <h2 className="text-xl font-serif italic text-[#1B3A6B] mt-1">Confirm Order</h2>
              </div>
              <button
                onClick={() => setCheckoutStep('cart')}
                className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-[#1B3A6B] transition-colors cursor-pointer"
              >
                Back
              </button>
            </div>

            {/* Receipt preview card */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="bg-slate-50 border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-inner">

                <div className="text-center pb-5 border-b border-dashed border-slate-300">
                  <h2 className="text-xl font-serif italic text-[#1B3A6B] uppercase tracking-wide">Restaurant</h2>
                  <p className="text-xs text-slate-400 mt-1">Premium Food Experience</p>
                </div>

                <div className="py-5 border-b border-dashed border-slate-300 space-y-1">
                  <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">Customer</h3>
                  <p className="font-bold text-[#1B3A6B]">{customer.fullName}</p>
                  {customer.phone   && <p className="text-xs text-slate-500 font-medium">{customer.phone}</p>}
                  {customer.address && <p className="text-xs text-slate-500 font-medium">{customer.address}</p>}
                  {customer.email   && <p className="text-xs text-slate-500 font-medium">{customer.email}</p>}
                </div>

                <div className="py-5 border-b border-dashed border-slate-300 space-y-4">
                  {cart.map((item: any) => (
                    <div key={item._id} className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{item.title || item.name}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {item.qty} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold text-[#1B3A6B] text-sm">${(item.qty * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="py-5 space-y-3">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Tax (12.5%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200">
                    <span className="text-base font-serif italic text-[#1B3A6B]">Total</span>
                    <span className="text-xl font-bold text-[#1B3A6B]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print notice */}
            <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100">
              <Printer size={14} className="text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                Confirming will open the{' '}
                <span className="font-bold underline">print dialog</span> automatically.
                Payment is complete whether you print or cancel.
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setCheckoutStep('cart')}
                className="h-14 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Edit Order
              </button>
              <button
                onClick={handleConfirmClick}
                disabled={isSubmitting}
                className="h-14 rounded-2xl bg-[#1B3A6B] text-white font-bold hover:bg-[#1B3A6B]/90 transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase tracking-widest cursor-pointer shadow-md shadow-[#1B3A6B]/10"
              >
                <Printer size={15} />
                Confirm &amp; Print
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}