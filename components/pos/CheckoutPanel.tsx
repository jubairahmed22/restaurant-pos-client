'use client';

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import OrderItem from './OrderItem';
import ConfirmOrderModal from './ConfirmOrderModal';
import { OrderService } from './OrderService';

export default function CheckoutPanel({
  cart,
  subtotal,
  tax,           // treated as deliveryCharge
  total,
  setCart,
  increaseQty,
  decreaseQty,
  removeItem,
}: any) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opens the confirmation modal (validates cart first)
  const handleOpenModal = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setModalOpen(true);
  };

  // Called when user clicks "Confirm Order" inside the modal
  const handleConfirmOrder = async () => {
    setIsSubmitting(true);

    const formattedItems = cart.map((item: any) => ({
      food: item._id,
      title: item.title || item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const orderPayload = {
      items: formattedItems,
      subtotal,
      deliveryCharge: tax,
      total,
      shippingAddress: '123 Main Street, Dine-In Table 4', // Replace with dynamic value as needed
    };

    try {
      const result = await OrderService.createOrder(orderPayload);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      const createdOrder = result.data;

      alert(`✅ Order Placed! ID: ${createdOrder.orderId}\nPay cash on delivery.`);
      setCart([]);
      setModalOpen(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred while placing the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Confirmation Modal ── */}
      <ConfirmOrderModal
        isOpen={modalOpen}
        cart={cart}
        subtotal={subtotal}
        deliveryCharge={tax}
        total={total}
        shippingAddress="123 Main Street, Dine-In Table 4"
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmOrder}
        onClose={() => !isSubmitting && setModalOpen(false)}
      />

      {/* ── Panel ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sticky top-5">

        {/* HEADER */}
        <div className="pb-5 border-b">
          <p className="text-xs font-black text-indigo-500 uppercase">Order Summary</p>
          <h2 className="text-xl font-black">Current Draft</h2>
        </div>

        {/* CART ITEMS */}
        <div className="space-y-4 py-5 max-h-[420px] overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="mx-auto text-slate-200 mb-3" size={40} />
              <p className="text-sm text-slate-400 font-bold">No food added yet</p>
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
            <span>Tax / Delivery</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between p-4 bg-emerald-50">
            <span className="font-black text-emerald-700">Total</span>
            <span className="font-black text-emerald-600 text-lg">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* PAYMENT BADGE — Cash only */}
        <div className="mt-5">
          <h3 className="font-black mb-2">Payment Method</h3>
          <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <span className="text-lg">💵</span>
            <span className="font-bold text-indigo-700">Cash on Delivery</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => setCart([])}
            disabled={isSubmitting}
            className="bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 text-white font-black rounded-xl h-12 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleOpenModal}
            disabled={isSubmitting || cart.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-xl h-12 transition-colors"
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}