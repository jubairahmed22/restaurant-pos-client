'use client';

import React from 'react';
import {
  X, Printer, CircleCheck, Banknote,
  Loader2, MapPin, Clock3, ReceiptText, User, Phone,
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

interface ConfirmOrderModalProps {
  isOpen: boolean;
  cart: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  customer: CustomerInfo;
  shippingAddress: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getQty(item: CartItem): number {
  return item.quantity ?? item.qty ?? item.count ?? 1;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfirmOrderModal({
  isOpen, cart, subtotal, deliveryCharge, total,
  customer, shippingAddress, isSubmitting, onConfirm, onClose,
}: ConfirmOrderModalProps) {
  if (!isOpen) return null;

  const now = new Date();
  const orderId = `#${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ── Print ──────────────────────────────────────────────────────────────────
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

    // Customer rows (only show non-empty fields)
    const customerRows = [
      customer.fullName.trim() ? `<div><span class="bold">Name:</span> ${customer.fullName.trim()}</div>` : '',
      customer.phone.trim() ? `<div><span class="bold">Phone:</span> ${customer.phone.trim()}</div>` : '',
      customer.address.trim() ? `<div><span class="bold">Address:</span> ${customer.address.trim()}</div>` : '',
    ].filter(Boolean).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>POS Receipt</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:monospace;width:80mm;background:#fff;color:#000;padding:10px;}
    .center{text-align:center;}
    .restaurant{font-size:20px;font-weight:bold;margin-bottom:4px;text-transform:uppercase;}
    .small{font-size:11px;line-height:1.7;}
    .bold{font-weight:bold;}
    .divider{border-top:1px dashed #000;margin:10px 0;}
    table{width:100%;border-collapse:collapse;}
    td{font-size:12px;vertical-align:top;padding:4px 0;}
    .item-name{width:75%;padding-right:6px;}
    .item-total{width:25%;text-align:right;font-weight:bold;}
    .qty-line{font-size:11px;margin-top:2px;color:#555;}
    .summary-row{display:flex;justify-content:space-between;font-size:12px;margin:3px 0;}
    .total{font-size:16px;font-weight:bold;margin-top:6px;}
    .footer{margin-top:16px;text-align:center;font-size:11px;line-height:1.7;}
    @media print{body{width:80mm;}@page{margin:0;}}
  </style>
</head>
<body>
  <div class="center">
    <div class="restaurant">Restaurant Name</div>
    <div class="small">123 Food Street, City Center</div>
    <div class="small">Phone: +1 234 567 890</div>
  </div>
  <div class="divider"></div>
  <div class="small">
    <div><span class="bold">Order:</span> ${orderId}</div>
    <div><span class="bold">Date:</span> ${dateStr}</div>
    <div><span class="bold">Time:</span> ${timeStr}</div>
    <div><span class="bold">Payment:</span> Cash On Delivery</div>
  </div>
  ${customerRows ? `<div class="divider"></div><div class="small">${customerRows}</div>` : ''}
  <div class="divider"></div>
  <table>${itemRows}</table>
  <div class="divider"></div>
  <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
  <div class="summary-row"><span>Delivery Charge</span><span>$${deliveryCharge.toFixed(2)}</span></div>
  <div class="summary-row total"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
  <div class="divider"></div>
  <div class="footer">
    <div>Thank You For Your Order</div>
    <div>Please Visit Again ❤️</div>
  </div>
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=420,height=700');
    if (!w) { alert('Please allow popups to print receipt.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">

        {/* GRADIENT HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-5 text-white">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition disabled:opacity-50"
          >
            <X size={15} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
              <ReceiptText size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-indigo-100 font-semibold">
                Restaurant POS
              </p>
              <h2 className="text-xl font-bold mt-0.5">Confirm Order</h2>
            </div>
          </div>
        </div>

        {/* SCROLLABLE RECEIPT BODY */}
        <div className="p-5 bg-slate-50 max-h-[70vh] overflow-y-auto">
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-5 shadow-sm">

            {/* Restaurant name */}
            <div className="text-center">
              <h3 className="text-lg font-black tracking-wide text-slate-900 uppercase">
                Restaurant Name
              </h3>
              <p className="text-xs text-slate-400 mt-1">Premium Food & Fast Delivery</p>
            </div>

            <div className="border-t border-dashed border-slate-300 my-4" />

            {/* Order meta */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Order ID</span>
                <span className="font-bold text-slate-900">{orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock3 size={13} /> Date & Time
                </div>
                <span className="font-medium text-slate-700">{dateStr} · {timeStr}</span>
              </div>
            </div>

            {/* Customer info — only render rows that have data */}
            {(customer.fullName || customer.phone || customer.address) && (
              <>
                <div className="border-t border-dashed border-slate-300 my-4" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Customer
                </p>
                <div className="space-y-2 text-sm">
                  {customer.fullName.trim() && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <User size={13} /> Name
                      </div>
                      <span className="font-medium text-slate-700">{customer.fullName.trim()}</span>
                    </div>
                  )}
                  {customer.phone.trim() && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone size={13} /> Phone
                      </div>
                      <span className="font-medium text-slate-700">{customer.phone.trim()}</span>
                    </div>
                  )}
                  {customer.address.trim() && (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                        <MapPin size={13} /> Address
                      </div>
                      <span className="text-right text-slate-700 text-xs leading-relaxed max-w-[200px]">
                        {customer.address.trim()}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* No customer info — show fallback */}
            {!customer.fullName && !customer.phone && !customer.address && (
              <>
                <div className="border-t border-dashed border-slate-300 my-4" />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={13} /> Location
                  </div>
                  <span className="font-medium text-slate-700">Dine-In / Walk-In</span>
                </div>
              </>
            )}

            <div className="border-t border-dashed border-slate-300 my-4" />

            {/* Items */}
            <div className="space-y-3">
              {cart.map(item => {
                const qty = getQty(item);
                const name = item.title || item.name || 'Item';
                const lineTotal = item.price * qty;
                return (
                  <div key={item._id} className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {qty} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                      ${lineTotal.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-dashed border-slate-300 my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-700">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery Charge</span>
                <span className="font-medium text-slate-700">${deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="pt-3 mt-1 border-t border-dashed border-slate-300 flex justify-between items-center">
                <span className="text-lg font-black text-slate-900">TOTAL</span>
                <span className="text-2xl font-black text-emerald-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 my-4" />

            {/* Payment */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Payment Method</span>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
                <Banknote size={14} />
                <span className="text-xs font-bold uppercase tracking-wide">Cash</span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-5">
              Thank you for your order ❤️
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePrint}
              disabled={isSubmitting}
              className="h-12 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 transition flex items-center justify-center gap-2 text-sm font-bold text-white shadow-lg shadow-indigo-200"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Placing Order...</>
              ) : (
                <><CircleCheck size={16} /> Confirm Order</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}