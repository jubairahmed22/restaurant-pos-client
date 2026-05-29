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
asdfasdf
export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
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

function ConfirmDialog({ total, onConfirm, onCancel, isSubmitting }: {
  total: number; onConfirm: () => void; onCancel: () => void; isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#161813]/70 backdrop-blur-sm px-4">
      <div className="bg-[#161813] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto mb-5">
          <AlertTriangle className="text-amber-400" size={28} />
        </div>
        <h2 className="text-xl font-bold text-white text-center">Confirm Your Order</h2>
        <p className="text-sm text-zinc-400 text-center mt-2 leading-relaxed">
          You are about to place an order for{' '}
          <span className="text-white font-semibold">${total.toFixed(2)}</span>.
          A POS receipt will open for printing automatically.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-12 rounded-2xl border border-white/10 text-zinc-300 hover:bg-white/5 transition-all text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-12 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all text-sm"
          >
            {isSubmitting ? 'Processing...' : 'Yes, Confirm'}
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#161813]/70 backdrop-blur-sm px-4">
      <div className="bg-[#161813] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-6">
          <CheckCircle2 className="text-emerald-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white">Order Confirmed!</h2>
        <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
          Payment complete. Receipt sent to printer.
          Need another copy?
        </p>
        <button
          onClick={onPrint}
          className="mt-5 w-full h-12 rounded-2xl border border-white/10 text-zinc-200 hover:bg-white/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
        >
          <Printer size={15} />
          Re-Print Receipt
        </button>
        <button
          onClick={onClose}
          className="mt-3 w-full h-12 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ─────────── TRANSPARENT INPUT ─────────── */

function TransparentInput({ icon, placeholder, value, onChange, isTextArea = false }: any) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl focus-within:border-white/20 focus-within:bg-white/[0.06] transition-all group">
      <span className="mt-0.5 text-zinc-600 group-focus-within:text-white transition-colors">
        {icon}
      </span>
      {isTextArea ? (
        <textarea
          rows={2}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-700 text-white resize-none"
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-700 text-white"
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

      <div className="flex flex-col h-full text-white">

        {/* ══ CART STEP ══ */}
        {checkoutStep === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <ShoppingCart size={48} strokeWidth={1} />
                  <p className="mt-4 text-sm font-light italic">Your bag is empty</p>
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
            <div className="mt-8 space-y-4 bg-[#161813] p-5 rounded-2xl">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Delivery Details
              </h3>
              <div className="space-y-2">
                <TransparentInput
                  icon={<User size={14} />} placeholder="Full Name"
                  value={customer.fullName} onChange={(v: string) => handleField('fullName', v)}
                />
                <div className="grid grid-cols-1 gap-2">
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
            <div className="mt-8 p-5 rounded-2xl border-t border-white/5 bg-[#161813] space-y-3">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Tax (12.5%)</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-lg italic">Total</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-5 gap-3 mt-8">
              <button
                onClick={() => { clearCartAndStorage(); setCustomer(EMPTY_CUSTOMER); }}
                className="col-span-1 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={handleOpenCheckout}
                disabled={cart.length === 0}
                className="col-span-4 h-14 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-40"
              >
                Process Checkout <ChevronRight size={18} />
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
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Invoice Preview</p>
                <h2 className="text-2xl font-bold mt-1">Confirm Order</h2>
              </div>
              <button
                onClick={() => setCheckoutStep('cart')}
                className="text-sm text-zinc-400 hover:text-white"
              >
                Back
              </button>
            </div>

            {/* Receipt preview card */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="bg-white text-black rounded-3xl p-6">

                <div className="text-center pb-5 border-b border-dashed">
                  <h2 className="text-2xl font-black uppercase">Restaurant</h2>
                  <p className="text-sm text-zinc-500 mt-1">Premium Food Experience</p>
                </div>

                <div className="py-5 border-b border-dashed space-y-1">
                  <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-2">Customer</h3>
                  <p className="font-semibold">{customer.fullName}</p>
                  {customer.phone   && <p className="text-sm text-zinc-600">{customer.phone}</p>}
                  {customer.address && <p className="text-sm text-zinc-600">{customer.address}</p>}
                  {customer.email   && <p className="text-sm text-zinc-600">{customer.email}</p>}
                </div>

                <div className="py-5 border-b border-dashed space-y-4">
                  {cart.map((item: any) => (
                    <div key={item._id} className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{item.title || item.name}</p>
                        <p className="text-sm text-zinc-500">
                          {item.qty} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold">${(item.qty * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="py-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (12.5%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-black">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print notice */}
            <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <Printer size={14} className="text-zinc-500 shrink-0" />
              <p className="text-xs text-zinc-500 leading-relaxed">
                Confirming will open the{' '}
                <span className="text-zinc-300 font-medium">print dialog</span> automatically.
                Payment is complete whether you print or cancel.
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setCheckoutStep('cart')}
                className="h-14 rounded-2xl border border-white/10 hover:bg-white/5 transition text-sm"
              >
                Edit Order
              </button>
              <button
                onClick={handleConfirmClick}
                disabled={isSubmitting}
                className="h-14 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                <Printer size={16} />
                Confirm &amp; Print
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}