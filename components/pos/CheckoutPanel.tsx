'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Mail,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import OrderItem from './OrderItem';
import ConfirmOrderModal from './ConfirmOrderModal';
import { OrderService } from './OrderService';

/* ─── types ──────────────────────────────────────────────────── */
export interface CustomerInfo {
  fullName: string;
  email:    string;
  phone:    string;
  address:  string;
}

const EMPTY_CUSTOMER: CustomerInfo = {
  fullName: '',
  email:    '',
  phone:    '',
  address:  '',
};

const CART_KEY = 'pos-cart-data';

/* ─── component ──────────────────────────────────────────────── */
export default function CheckoutPanel({
  cart,
  subtotal,
  tax,
  total,
  setCart,
  increaseQty,
  decreaseQty,
  removeItem,
  onOrderSuccess,
}: any) {
  const queryClient = useQueryClient();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer,     setCustomer]     = useState<CustomerInfo>(EMPTY_CUSTOMER);

  /* helpers */
  const clearCartAndStorage = () => {
    setCart([]);
    try { localStorage.removeItem(CART_KEY); } catch {}
  };

  const handleField = (field: keyof CustomerInfo, value: string) =>
    setCustomer((prev) => ({ ...prev, [field]: value }));

  const buildShippingAddress = (): string => {
    const parts = [
      customer.fullName.trim(),
      customer.phone.trim(),
      customer.address.trim(),
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : 'Dine-In / Walk-In';
  };

  /* open confirm modal */
  const handleOpenModal = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    if (
      !customer.fullName.trim() ||
      !customer.phone.trim()    ||
      !customer.address.trim()
    ) {
      alert('Please fill in customer information.');
      return;
    }
    setModalOpen(true);
  };

  /* confirm + submit */
  const handleConfirmOrder = async () => {
    try {
      setIsSubmitting(true);

      const formattedItems = cart.map((item: any) => ({
        food:     item._id,
        title:    item.title || item.name,
        price:    item.price,
        quantity: item.quantity ?? item.qty ?? item.count ?? 1,
      }));

      const orderPayload = {
        items:           formattedItems,
        subtotal,
        deliveryCharge:  tax,
        total,
        fullName:        customer.fullName,
        email:           customer.email,
        phone:           customer.phone,
        shippingAddress: buildShippingAddress(),
      };

      const result = await OrderService.createOrder(orderPayload);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

      alert(`✅ Order Placed!\n\nOrder ID: ${result.data.orderId}`);

      clearCartAndStorage();
      setCustomer(EMPTY_CUSTOMER);
      setModalOpen(false);
      onOrderSuccess?.();           // close mobile drawer if present

    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Something went wrong while placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── UI ─────────────────────────────────────────────────── */
  return (
    <>
      {/* CONFIRM MODAL */}
      <ConfirmOrderModal
        isOpen={modalOpen}
        cart={cart}
        subtotal={subtotal}
        deliveryCharge={tax}
        total={total}
        customer={customer}
        shippingAddress={buildShippingAddress()}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmOrder}
        onClose={() => !isSubmitting && setModalOpen(false)}
      />

      {/* PANEL */}
      <div className="bg-white border border-slate-100 rounded p-4 sm:p-5 xl:sticky xl:top-5">

        {/* ── header ── */}
        <div className="pb-4 border-b border-slate-100">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">
            Order Summary
          </p>
          <h2 className="text-md sm:text-md font-black text-slate-800 mt-0.5">
            Current Draft
          </h2>
        </div>

        {/* ── cart items ── */}
        <div className="space-y-3 py-4 max-h-[260px] sm:max-h-[300px] xl:max-h-[320px] overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="text-center py-8">
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

        {/* ── price summary ── */}
        <div className="border  border-slate-400 rounded overflow-hidden text-[12px]">
          <div className="flex justify-between p-3 border-b border-slate-400">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold text-slate-700">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-400">
            <span className="text-slate-500">Delivery Charge</span>
            <span className="font-semibold text-slate-700">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between p-3 bg-emerald-50 text-[12px]">
            <span className="font-black text-emerald-700">Total</span>
            <span className="font-black text-emerald-600 text-base text-[12px]">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── customer info ── */}
        <div className="mt-5 space-y-3">
          <h3 className="font-black text-sm text-slate-700">
            Customer Information
          </h3>

          {/* grid layout on wider panels / tablets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">

            {/* Full Name */}
            <InputRow icon={<User size={14} />} className="sm:col-span-2 xl:col-span-1">
              <input
                type="text"
                placeholder="Full Name"
                value={customer.fullName}
                onChange={(e) => handleField('fullName', e.target.value)}
                className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800 min-w-0"
              />
            </InputRow>

            {/* Email */}
            <InputRow icon={<Mail size={14} />}>
              <input
                type="email"
                placeholder="Email Address"
                value={customer.email}
                onChange={(e) => handleField('email', e.target.value)}
                className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800 min-w-0"
              />
            </InputRow>

            {/* Phone */}
            <InputRow icon={<Phone size={14} />}>
              <input
                type="tel"
                placeholder="Phone Number"
                value={customer.phone}
                onChange={(e) => handleField('phone', e.target.value)}
                className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800 min-w-0"
              />
            </InputRow>

            {/* Address */}
            <InputRow
              icon={<MapPin size={14} className="mt-0.5" />}
              alignItems="items-start"
              className="sm:col-span-2 xl:col-span-1"
            >
              <textarea
                rows={2}
                placeholder="Delivery Address"
                value={customer.address}
                onChange={(e) => handleField('address', e.target.value)}
                className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800 resize-none min-w-0"
              />
            </InputRow>
          </div>
        </div>

        {/* ── payment ── */}
        {/* <div className="mt-4">
          <h3 className="font-black text-sm mb-2 text-slate-700">
            Payment Method
          </h3>
          <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded">
            <span className="text-lg">💵</span>
            <span className="font-bold text-indigo-700 text-sm">
              Cash on Delivery
            </span>
          </div>
        </div> */}

        {/* ── actions ── */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => {
              clearCartAndStorage();
              setCustomer(EMPTY_CUSTOMER);
            }}
            disabled={isSubmitting}
            className="
              bg-rose-500 hover:bg-rose-600
              disabled:bg-slate-200 disabled:cursor-not-allowed
              text-white font-black rounded h-12
              transition-colors text-sm
              active:scale-95
            "
          >
            Cancel
          </button>

          <button
            onClick={handleOpenModal}
            disabled={isSubmitting || cart.length === 0}
            className="
              bg-indigo-600 hover:bg-indigo-700
              disabled:bg-slate-300 disabled:cursor-not-allowed
              text-white font-black rounded h-12
              transition-colors text-sm
              active:scale-95
            "
          >
            {isSubmitting ? 'Placing…' : 'Checkout'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── tiny shared input wrapper ─────────────────────────────── */
function InputRow({
  icon,
  children,
  alignItems = 'items-center',
  className = '',
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  alignItems?: string;
  className?: string;
}) {
  return (
    <div
      className={`
        flex ${alignItems} gap-2.5
        border border-slate-200 rounded px-3 py-2.5
        focus-within:border-indigo-400
        transition-colors
        ${className}
      `}
    >
      <span className="text-slate-400 shrink-0">{icon}</span>
      {children}
    </div>
  );
}