'use client';

import React from 'react';
import {
  Printer, CircleCheck, Banknote, Loader2,
  MapPin, Clock3, ReceiptText, User, Phone, ArrowLeft,
} from 'lucide-react';
import type { CustomerInfo } from './CheckoutPanel';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  _id: string;
  title?: string;
  name?: string;
  price: number;
  quantity?: number;
  qty?: number;
  count?: number;
}

interface OrderReviewTabProps {
  cart: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  customer: CustomerInfo;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getQty(item: CartItem): number {
  return item.quantity ?? item.qty ?? item.count ?? 1;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderReviewTab({
  cart, subtotal, deliveryCharge, total,
  customer, isSubmitting, onConfirm, onBack,
}: OrderReviewTabProps) {
  const now = new Date();
  const orderId = `#${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const itemRows = cart.map(item => {
      const qty = getQty(item);
      const name = item.title || item.name || 'Item';
      const lineTotal = item.price * qty;
      return `
        <tr>
          <td class="item-name">
            ${name}
            <div class="qty-line">${qty} × $${item.price.toFixed(2)}</div>
          </td>
          <td class="item-total">$${lineTotal.toFixed(2)}</td>
        </tr>`;
    }).join('');

    const customerRows = [
      customer.fullName.trim() ? `<div class="info-row"><span class="bold">Name:</span> ${customer.fullName.trim()}</div>` : '',
      customer.phone.trim()    ? `<div class="info-row"><span class="bold">Phone:</span> ${customer.phone.trim()}</div>` : '',
      customer.address.trim()  ? `<div class="info-row"><span class="bold">Address:</span> ${customer.address.trim()}</div>` : '',
    ].filter(Boolean).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>POS Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A5 portrait; margin: 10mm 12mm; }
    body {
      font-family: 'Courier New', Courier, monospace;
      background: #fff; color: #000;
      width: 100%; font-size: 13px; line-height: 1.6;
    }
    .receipt { width: 100%; max-width: 148mm; }
    .center { text-align: center; }
    .restaurant-name { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .small { font-size: 12px; line-height: 1.7; }
    .bold { font-weight: bold; }
    .divider { border: none; border-top: 1px dashed #000; margin: 10px 0; }
    .meta-table { width: 100%; font-size: 13px; }
    .meta-table td { padding: 2px 0; vertical-align: top; }
    .meta-table td:last-child { text-align: right; font-weight: bold; }
    .section-label { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; color: #444; }
    .info-row { font-size: 13px; margin-bottom: 3px; }
    table.items { width: 100%; border-collapse: collapse; }
    table.items td { font-size: 13px; vertical-align: top; padding: 5px 0; border-bottom: 1px dotted #ccc; }
    table.items tr:last-child td { border-bottom: none; }
    .item-name { width: 75%; padding-right: 8px; font-weight: bold; }
    .item-total { width: 25%; text-align: right; font-weight: bold; }
    .qty-line { font-size: 11px; font-weight: normal; color: #555; margin-top: 2px; }
    .summary { width: 100%; font-size: 13px; }
    .summary td { padding: 3px 0; }
    .summary td:last-child { text-align: right; font-weight: bold; }
    .summary .total-row td { font-size: 18px; font-weight: bold; padding-top: 8px; }
    .payment-badge { display: inline-block; border: 1px solid #000; border-radius: 4px; padding: 3px 10px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="center">
      <div class="restaurant-name">Restaurant Name</div>
      <div class="small">123 Food Street, City Center</div>
      <div class="small">Phone: +1 234 567 890</div>
    </div>
    <hr class="divider" />
    <table class="meta-table">
      <tr><td><span class="bold">Order:</span></td><td>${orderId}</td></tr>
      <tr><td><span class="bold">Date:</span></td><td>${dateStr}</td></tr>
      <tr><td><span class="bold">Time:</span></td><td>${timeStr}</td></tr>
      <tr><td><span class="bold">Payment:</span></td><td>Cash On Delivery</td></tr>
    </table>
    ${customerRows ? `<hr class="divider" /><div class="section-label">Customer Info</div><div>${customerRows}</div>` : ''}
    <hr class="divider" />
    <div class="section-label">Order Items</div>
    <table class="items">${itemRows}</table>
    <hr class="divider" />
    <table class="summary">
      <tr><td>Subtotal</td><td>$${subtotal.toFixed(2)}</td></tr>
      <tr><td>Delivery Charge</td><td>$${deliveryCharge.toFixed(2)}</td></tr>
      <tr class="total-row"><td>TOTAL</td><td>$${total.toFixed(2)}</td></tr>
    </table>
    <hr class="divider" />
    <div style="text-align:center; margin: 6px 0;">
      <span class="payment-badge">Cash On Delivery</span>
    </div>
  </div>
  <script>
    window.onload = function () {
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) { alert('Please allow popups to print receipt.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">

      {/* ── Tab Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition disabled:opacity-40"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="flex items-center gap-2">
          <ReceiptText size={16} className="text-white/50" />
          <span className="text-white font-semibold text-sm tracking-wide">Order Review</span>
        </div>
        <div className="ml-auto text-xs text-white/30 font-mono">{orderId}</div>
      </div>

      {/* ── Scrollable Receipt ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">

        {/* Receipt Card — white bg, black text (POS style) */}
        <div className="bg-white rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40">

          {/* Receipt inner padding */}
          <div className="p-5 font-mono">

            {/* Store header */}
            <div className="text-center border-b border-dashed border-black/20 pb-4 mb-4">
              <p className="text-[11px] text-black/40 uppercase tracking-[0.3em] mb-1">Restaurant POS</p>
              <h3 className="text-base font-black tracking-widest text-black uppercase">
                Restaurant Name
              </h3>
              <p className="text-[11px] text-black/50 mt-1">123 Food Street · +1 234 567 890</p>
            </div>

            {/* Order meta */}
            <div className="space-y-1.5 text-[12px] border-b border-dashed border-black/20 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-black/50">Order</span>
                <span className="font-bold text-black">{orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-black/50">
                  <Clock3 size={11} /> Date & Time
                </div>
                <span className="text-black font-medium">{dateStr} · {timeStr}</span>
              </div>
            </div>

            {/* Customer info */}
            {(customer.fullName || customer.phone || customer.address) ? (
              <div className="border-b border-dashed border-black/20 pb-4 mb-4">
                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-2">Customer</p>
                <div className="space-y-1.5 text-[12px]">
                  {customer.fullName.trim() && (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1 text-black/50"><User size={11} /> Name</div>
                      <span className="text-black font-medium">{customer.fullName.trim()}</span>
                    </div>
                  )}
                  {customer.phone.trim() && (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1 text-black/50"><Phone size={11} /> Phone</div>
                      <span className="text-black font-medium">{customer.phone.trim()}</span>
                    </div>
                  )}
                  {customer.address.trim() && (
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-1 text-black/50 shrink-0"><MapPin size={11} /> Address</div>
                      <span className="text-black text-right text-[11px] leading-relaxed max-w-[180px]">{customer.address.trim()}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-b border-dashed border-black/20 pb-4 mb-4">
                <div className="flex justify-between text-[12px]">
                  <div className="flex items-center gap-1 text-black/50"><MapPin size={11} /> Location</div>
                  <span className="text-black font-medium">Dine-In / Walk-In</span>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="border-b border-dashed border-black/20 pb-4 mb-4">
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-3">Items</p>
              <div className="space-y-3">
                {cart.map(item => {
                  const qty = getQty(item);
                  const name = item.title || item.name || 'Item';
                  const lineTotal = item.price * qty;
                  return (
                    <div key={item._id} className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="text-[12px] font-bold text-black leading-tight">{name}</p>
                        <p className="text-[11px] text-black/40 mt-0.5">{qty} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="text-[12px] font-black text-black whitespace-nowrap">
                        ${lineTotal.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-black/50">Subtotal</span>
                <span className="text-black font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/50">Delivery</span>
                <span className="text-black font-medium">${deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-dashed border-black/20">
                <span className="text-base font-black text-black tracking-wide">TOTAL</span>
                <span className="text-xl font-black text-black">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="mt-4 pt-4 border-t border-dashed border-black/20 flex justify-between items-center text-[12px]">
              <span className="text-black/50">Payment</span>
              <div className="flex items-center gap-1.5 border border-black rounded px-2.5 py-1">
                <Banknote size={12} className="text-black" />
                <span className="font-bold text-black uppercase tracking-wide text-[10px]">Cash On Delivery</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="px-5 py-4 border-t border-white/10 flex gap-3">
        <button
          onClick={handlePrint}
          disabled={isSubmitting}
          className="h-12 px-5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm font-semibold text-white/70 hover:text-white disabled:opacity-40"
        >
          <Printer size={15} />
          Print
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-2xl bg-white hover:bg-white/90 disabled:bg-white/20 transition flex items-center justify-center gap-2 text-sm font-bold text-black shadow-lg shadow-black/30"
        >
          {isSubmitting ? (
            <><Loader2 size={15} className="animate-spin" /> Placing Order...</>
          ) : (
            <><CircleCheck size={15} /> Confirm Order</>
          )}
        </button>
      </div>

    </div>
  );
}