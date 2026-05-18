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

// =========================================
// TYPES
// =========================================

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

const EMPTY_CUSTOMER: CustomerInfo = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
};

// =========================================
// COMPONENT
// =========================================

export default function CheckoutPanel({
  cart,
  subtotal,
  tax,
  total,
  setCart,
  increaseQty,
  decreaseQty,
  removeItem,
}: any) {

  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [customer, setCustomer] =
    useState<CustomerInfo>(EMPTY_CUSTOMER);

  // =========================================
  // HANDLE INPUT
  // =========================================
  const handleField = (
    field: keyof CustomerInfo,
    value: string
  ) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================================
  // BUILD SHIPPING ADDRESS
  // =========================================
  const buildShippingAddress = (): string => {

    const parts = [
      customer.fullName.trim(),
      customer.phone.trim(),
      customer.address.trim(),
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(' · ')
      : 'Dine-In / Walk-In';
  };

  // =========================================
  // OPEN MODAL
  // =========================================
  const handleOpenModal = () => {

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // OPTIONAL VALIDATION
    if (
      !customer.fullName.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      alert('Please fill customer information.');
      return;
    }

    setModalOpen(true);
  };

  // =========================================
  // CONFIRM ORDER
  // =========================================
  const handleConfirmOrder = async () => {

    try {

      setIsSubmitting(true);

      const formattedItems = cart.map((item: any) => ({
        food: item._id,

        title:
          item.title ||
          item.name,

        price: item.price,

        quantity:
          item.quantity ??
          item.qty ??
          item.count ??
          1,
      }));

      // =========================================
      // PAYLOAD
      // =========================================
      const orderPayload = {

        items: formattedItems,

        subtotal,

        deliveryCharge: tax,

        total,

        fullName: customer.fullName,

        email: customer.email,

        phone: customer.phone,

        shippingAddress:
          buildShippingAddress(),
      };

      // =========================================
      // API CALL
      // =========================================
      const result =
        await OrderService.createOrder(
          orderPayload
        );

      if (!result.success) {
        throw new Error(
          result.error ||
          'Failed to create order'
        );
      }

      // =========================================
      // REFRESH ADMIN ORDER LIST
      // =========================================
      await queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      // =========================================
      // SUCCESS
      // =========================================
      alert(
        `✅ Order Placed Successfully!\n\nOrder ID: ${result.data.orderId}`
      );

      setCart([]);

      setCustomer(EMPTY_CUSTOMER);

      setModalOpen(false);

    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        'Something went wrong while placing order.'
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  // =========================================
  // UI
  // =========================================
  return (
    <>

      {/* ========================================= */}
      {/* CONFIRM MODAL */}
      {/* ========================================= */}

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
        onClose={() =>
          !isSubmitting && setModalOpen(false)
        }
      />

      {/* ========================================= */}
      {/* MAIN PANEL */}
      {/* ========================================= */}

      <div className="bg-white border border-slate-100 rounded-3xl p-5 sticky top-5">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="pb-4 border-b border-slate-100">
          <p className="text-xs font-black text-indigo-500 uppercase">
            Order Summary
          </p>

          <h2 className="text-xl font-black text-slate-800">
            Current Draft
          </h2>
        </div>

        {/* ========================================= */}
        {/* CART ITEMS */}
        {/* ========================================= */}

        <div className="space-y-4 py-4 max-h-[320px] overflow-y-auto">

          {cart.length === 0 ? (

            <div className="text-center py-8">
              <ShoppingCart
                className="mx-auto text-slate-200 mb-3"
                size={40}
              />

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

        {/* ========================================= */}
        {/* SUMMARY */}
        {/* ========================================= */}

        <div className="border border-slate-200 rounded-xl overflow-hidden">

          <div className="flex justify-between p-3 border-b text-sm">
            <span className="text-slate-500">
              Subtotal
            </span>

            <span className="font-semibold text-slate-700">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between p-3 border-b text-sm">
            <span className="text-slate-500">
              Delivery Charge
            </span>

            <span className="font-semibold text-slate-700">
              ${tax.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between p-3 bg-emerald-50">
            <span className="font-black text-emerald-700">
              Total
            </span>

            <span className="font-black text-emerald-600 text-lg">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ========================================= */}
        {/* CUSTOMER INFO */}
        {/* ========================================= */}

        <div className="mt-5 space-y-3">

          <h3 className="font-black text-sm text-slate-700">
            Customer Information
          </h3>

          {/* FULL NAME */}

          <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 transition-colors">

            <User
              size={14}
              className="text-slate-400 shrink-0"
            />

            <input
              type="text"
              placeholder="Full Name"
              value={customer.fullName}
              onChange={(e) =>
                handleField(
                  'fullName',
                  e.target.value
                )
              }
              className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800"
            />
          </div>

          {/* EMAIL */}

          <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 transition-colors">

            <Mail
              size={14}
              className="text-slate-400 shrink-0"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={customer.email}
              onChange={(e) =>
                handleField(
                  'email',
                  e.target.value
                )
              }
              className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800"
            />
          </div>

          {/* PHONE */}

          <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 transition-colors">

            <Phone
              size={14}
              className="text-slate-400 shrink-0"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={(e) =>
                handleField(
                  'phone',
                  e.target.value
                )
              }
              className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800"
            />
          </div>

          {/* ADDRESS */}

          <div className="flex items-start gap-2.5 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 transition-colors">

            <MapPin
              size={14}
              className="text-slate-400 shrink-0 mt-0.5"
            />

            <textarea
              rows={2}
              placeholder="Delivery Address"
              value={customer.address}
              onChange={(e) =>
                handleField(
                  'address',
                  e.target.value
                )
              }
              className="flex-1 text-sm outline-none placeholder-slate-400 text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* ========================================= */}
        {/* PAYMENT */}
        {/* ========================================= */}

        <div className="mt-4">

          <h3 className="font-black text-sm mb-2 text-slate-700">
            Payment Method
          </h3>

          <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">

            <span className="text-lg">
              💵
            </span>

            <span className="font-bold text-indigo-700 text-sm">
              Cash on Delivery
            </span>
          </div>
        </div>

        {/* ========================================= */}
        {/* ACTION BUTTONS */}
        {/* ========================================= */}

        <div className="grid grid-cols-2 gap-3 mt-5">

          <button
            onClick={() => {
              setCart([]);
              setCustomer(EMPTY_CUSTOMER);
            }}
            disabled={isSubmitting}
            className="bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 text-white font-black rounded-xl h-12 transition-colors text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleOpenModal}
            disabled={
              isSubmitting ||
              cart.length === 0
            }
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-xl h-12 transition-colors text-sm"
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}