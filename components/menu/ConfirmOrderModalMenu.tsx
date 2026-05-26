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

interface ConfirmOrderModalMenuProps {
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

export default function ConfirmOrderModalMenu({
  isOpen, cart, subtotal, deliveryCharge, total,
  customer, shippingAddress, isSubmitting, onConfirm, onClose,
}: ConfirmOrderModalMenuProps) {
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

    @page {
      size: A5 portrait;
      margin: 10mm 12mm;
    }

    body {
      font-family: 'Courier New', Courier, monospace;
      background: #fff;
      color: #000;
      width: 100%;
      font-size: 13px;
      line-height: 1.6;
    }

    .receipt {
      width: 100%;
      max-width: 148mm; /* A5 width */
    }

    .center { text-align: center; }

    .restaurant-name {
      font-size: 22px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }

    .small {
      font-size: 12px;
      line-height: 1.7;
    }

    .bold { font-weight: bold; }

    .divider {
      border: none;
      border-top: 1px dashed #000;
      margin: 10px 0;
    }

    .meta-table {
      width: 100%;
      font-size: 13px;
    }
    .meta-table td {
      padding: 2px 0;
      vertical-align: top;
    }
    .meta-table td:last-child {
      text-align: right;
      font-weight: bold;
    }

    .section-label {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
      color: #444;
    }

    .info-row {
      font-size: 13px;
      margin-bottom: 3px;
    }

    /* Items table */
    table.items {
      width: 100%;
      border-collapse: collapse;
    }
    table.items td {
      font-size: 13px;
      vertical-align: top;
      padding: 5px 0;
      border-bottom: 1px dotted #ccc;
    }
    table.items tr:last-child td {
      border-bottom: none;
    }
    .item-name {
      width: 75%;
      padding-right: 8px;
      font-weight: bold;
    }
    .item-total {
      width: 25%;
      text-align: right;
      font-weight: bold;
    }
    .qty-line {
      font-size: 11px;
      font-weight: normal;
      color: #555;
      margin-top: 2px;
    }

    /* Summary */
    .summary {
      width: 100%;
      font-size: 13px;
    }
    .summary td {
      padding: 3px 0;
    }
    .summary td:last-child {
      text-align: right;
      font-weight: bold;
    }
    .summary .total-row td {
      font-size: 18px;
      font-weight: bold;
      padding-top: 8px;
    }

    .payment-badge {
      display: inline-block;
      border: 1px solid #000;
      border-radius: 4px;
      padding: 3px 10px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      line-height: 2;
      margin-top: 6px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="receipt">

    <!-- Header -->
    <div class="center">
      <div class="restaurant-name">Restaurant Name</div>
      <div class="small">123 Food Street, City Center</div>
      <div class="small">Phone: +1 234 567 890</div>
    </div>

    <hr class="divider" />

    <!-- Order Meta -->
    <table class="meta-table">
      <tr><td><span class="bold">Order:</span></td><td>${orderId}</td></tr>
      <tr><td><span class="bold">Date:</span></td><td>${dateStr}</td></tr>
      <tr><td><span class="bold">Time:</span></td><td>${timeStr}</td></tr>
      <tr><td><span class="bold">Payment:</span></td><td>Cash On Delivery</td></tr>
    </table>

    ${customerRows ? `
    <hr class="divider" />
    <div class="section-label">Customer Info</div>
    <div>${customerRows}</div>
    ` : ''}

    <hr class="divider" />

    <!-- Items -->
    <div class="section-label">Order Items</div>
    <table class="items">${itemRows}</table>

    <hr class="divider" />

    <!-- Totals -->
    <table class="summary">
      <tr><td>Subtotal</td><td>$${subtotal.toFixed(2)}</td></tr>
      <tr><td>Delivery Charge</td><td>$${deliveryCharge.toFixed(2)}</td></tr>
      <tr class="total-row"><td>TOTAL</td><td>$${total.toFixed(2)}</td></tr>
    </table>

    <hr class="divider" />

    <!-- Payment -->
    <div style="text-align:center; margin: 6px 0;">
      <span class="payment-badge">💵 Cash On Delivery</span>
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded shadow-2xl overflow-hidden border border-slate-200">

        {/* GRADIENT HEADER */}
        <div className="relative overflow-hidden 0 px-5 py-5 text-gray-700">
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
              <p className="text-xs uppercase tracking-[0.25em] text-gray-700 font-semibold">
                Restaurant POS
              </p>
              <h2 className="text-xl font-bold mt-0.5">Confirm Order</h2>
            </div>
          </div>
        </div>

        {/* SCROLLABLE RECEIPT BODY */}
        <div className="p-5  max-h-[70vh] max-w-md mx-auto overflow-y-auto">
          <div className="bg-white rounded border border-dashed border-slate-300 p-5 shadow-sm">

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