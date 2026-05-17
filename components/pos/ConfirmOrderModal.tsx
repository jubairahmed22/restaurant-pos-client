'use client';

import React, { useRef } from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';

interface CartItem {
  _id: string;
  title?: string;
  name?: string;
  price: number;
  quantity: number;
}

interface ConfirmOrderModalProps {
  isOpen: boolean;
  cart: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  shippingAddress: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmOrderModal({
  isOpen,
  cart,
  subtotal,
  deliveryCharge,
  total,
  shippingAddress,
  isSubmitting,
  onConfirm,
  onClose,
}: ConfirmOrderModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; }
            h2 { text-align: center; margin-bottom: 4px; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total-row { font-weight: bold; font-size: 15px; }
            .footer { margin-top: 16px; text-align: center; font-size: 11px; color: #555; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <p className="text-xs font-black text-indigo-500 uppercase tracking-wider">Review Order</p>
            <h2 className="text-xl font-black">Confirm Your Order</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Receipt Preview — this is what gets printed */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div ref={receiptRef}>
            {/* Receipt Top */}
            <h2 className="text-center font-black text-lg">🍽️ Restaurant Name</h2>
            <p className="text-center text-xs text-slate-500 mb-1">{dateStr} · {timeStr}</p>
            <p className="text-center text-xs text-slate-400 mb-3">{shippingAddress}</p>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            {/* Items */}
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item._id} className="row flex justify-between text-sm">
                  <span className="text-slate-700">
                    <span className="font-bold">{item.quantity}×</span>{' '}
                    {item.title || item.name}
                  </span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax / Delivery</span>
                <span>${deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-base mt-1 text-emerald-700">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            <div className="flex justify-between text-sm text-slate-500">
              <span>Payment</span>
              <span className="font-bold uppercase text-slate-700">Cash on Delivery</span>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Thank you for your order! 🙏
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t bg-slate-50 flex gap-3">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors disabled:opacity-50"
          >
            <Printer size={16} />
            Print Receipt
          </button>

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-xl py-3 transition-colors"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Confirm Order
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}