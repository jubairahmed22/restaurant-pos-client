'use client';

import React from 'react';
import { ShoppingCart, CreditCard, Wallet, Landmark } from 'lucide-react';

import OrderItem from './OrderItem';
import PaymentMethodCard from './PaymentMethodCard';

export default function CheckoutPanel({
  cart,
  subtotal,
  tax,
  total,
  paymentMethod,
  setPaymentMethod,
  setCart,
  increaseQty,
  decreaseQty,
  removeItem,
}: any) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 sticky top-5">

      {/* HEADER */}
      <div className="pb-5 border-b">
        <p className="text-xs font-black text-indigo-500 uppercase">
          Order Summary
        </p>

        <h2 className="text-xl font-black">#ORD-2239</h2>
      </div>

      {/* CART ITEMS */}
      <div className="space-y-4 py-5 max-h-[420px] overflow-y-auto">

        {cart.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingCart className="mx-auto text-slate-200 mb-3" size={40} />
            <p className="text-sm text-slate-400 font-bold">
              No food added yet
            </p>
          </div>
        ) : (
          cart.map((item: any) => (
            <OrderItem
              key={item._id}
              item={item}
              onIncrease={increaseQty}
              onDecrease={decreaseQty}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      {/* SUMMARY */}
      <div className="border rounded-xl overflow-hidden mt-4">

        <div className="flex justify-between p-3 border-b">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between p-3 border-b">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between p-4 bg-emerald-50">
          <span className="font-black text-emerald-700">
            Total
          </span>
          <span className="font-black text-emerald-600 text-lg">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* PAYMENT */}
      <div className="mt-5">
        <h3 className="font-black mb-2">Payment Method</h3>

        <div className="grid grid-cols-3 gap-2">

          <PaymentMethodCard
            title="Cash"
            active={paymentMethod === 'cash'}
            onClick={() => setPaymentMethod('cash')}
            icon={<Wallet size={14} />}
          />

          <PaymentMethodCard
            title="Card"
            active={paymentMethod === 'card'}
            onClick={() => setPaymentMethod('card')}
            icon={<CreditCard size={14} />}
          />

          <PaymentMethodCard
            title="UPI"
            active={paymentMethod === 'upi'}
            onClick={() => setPaymentMethod('upi')}
            icon={<Landmark size={14} />}
          />

        </div>
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-3 mt-5">

        <button
          onClick={() => setCart([])}
          className="bg-rose-500 text-white font-black rounded-xl h-12"
        >
          Cancel
        </button>

        <button className="bg-indigo-600 text-white font-black rounded-xl h-12">
          Checkout
        </button>

      </div>
    </div>
  );
}