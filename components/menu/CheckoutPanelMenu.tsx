'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Mail,
  Trash2,
  ChevronRight,
} from 'lucide-react';

import { useQueryClient } from '@tanstack/react-query';

import OrderItemMenu from './OrderItemMenu';
import { OrderService } from '@/services/order.service';

/* ───────────────── TYPES ───────────────── */

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

const CART_KEY = 'menu-cart';

/* ───────────────── COMPONENT ───────────────── */

export default function CheckoutPanelMenu({
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'invoice'>(
    'cart'
  );

  const [customer, setCustomer] =
    useState<CustomerInfo>(EMPTY_CUSTOMER);

  /* ───────────────── HELPERS ───────────────── */

  const clearCartAndStorage = () => {
    setCart([]);

    try {
      localStorage.removeItem(CART_KEY);
    } catch {}
  };

  const handleField = (
    field: keyof CustomerInfo,
    value: string
  ) =>
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));

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

  /* ───────────────── OPEN CHECKOUT ───────────────── */
asdfad
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;

    if (
      !customer.fullName.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      alert('Please complete customer information.');
      return;
    }

    setCheckoutStep('invoice');
  };

  /* ───────────────── CREATE ORDER ───────────────── */

  const handleConfirmOrder = async () => {
    try {
      setIsSubmitting(true);

      const formattedItems = cart.map((item: any) => ({
        food: item._id,
        title: item.title || item.name,
        price: item.price,
        quantity:
          item.qty ??
          item.quantity ??
          item.count ??
          1,
      }));

      const orderPayload = {
        items: formattedItems,

        subtotal,

        deliveryCharge: tax,

        total,

        fullName: customer.fullName,

        email: customer.email,

        phone: customer.phone,

        shippingAddress: buildShippingAddress(),
      };

      const result =
        await OrderService.createOrder(orderPayload);

      if (!result.success) {
        throw new Error(
          result.error || 'Failed to create order'
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      clearCartAndStorage();

      setCustomer(EMPTY_CUSTOMER);

      setCheckoutStep('cart');

      onOrderSuccess?.();
    } catch (error: any) {
      alert(error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ───────────────── UI ───────────────── */

  return (
    <div className="flex flex-col h-full text-white">

      {/* ───────────────── CART STEP ───────────────── */}

      {checkoutStep === 'cart' && (
        <>
          {/* Cart Items */}

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <ShoppingCart
                  size={48}
                  strokeWidth={1}
                />

                <p className="mt-4 text-sm font-light italic">
                  Your bag is empty
                </p>
              </div>
            ) : (
              cart.map((item: any) => (
                <OrderItemMenu
                  key={item._id}
                  item={item}
                  onIncrease={() =>
                    increaseQty(item._id)
                  }
                  onDecrease={() =>
                    decreaseQty(item._id)
                  }
                  onRemove={() =>
                    removeItem(item._id)
                  }
                />
              ))
            )}
          </div>

          {/* Customer Info */}

          <div className="mt-8 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Delivery Details
            </h3>

            <div className="space-y-2">
              <TransparentInput
                icon={<User size={14} />}
                placeholder="Full Name"
                value={customer.fullName}
                onChange={(v: string) =>
                  handleField('fullName', v)
                }
              />

              <div className="grid grid-cols-2 gap-2">
                <TransparentInput
                  icon={<Phone size={14} />}
                  placeholder="Phone"
                  value={customer.phone}
                  onChange={(v: string) =>
                    handleField('phone', v)
                  }
                />

                <TransparentInput
                  icon={<Mail size={14} />}
                  placeholder="Email"
                  value={customer.email}
                  onChange={(v: string) =>
                    handleField('email', v)
                  }
                />
              </div>

              <TransparentInput
                icon={<MapPin size={14} />}
                placeholder="Shipping Address"
                value={customer.address}
                isTextArea
                onChange={(v: string) =>
                  handleField('address', v)
                }
              />
            </div>
          </div>

          {/* Summary */}

          <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal</span>

              <span className="text-white">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-zinc-400">
              <span>Tax (12.5%)</span>

              <span className="text-white">
                ${tax.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-end pt-2">
              <span className="text-lg italic">
                Total
              </span>

              <span className="text-2xl font-bold">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}

          <div className="grid grid-cols-5 gap-3 mt-8">
            <button
              onClick={() => {
                clearCartAndStorage();

                setCustomer(EMPTY_CUSTOMER);
              }}
              className="col-span-1 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
            >
              <Trash2 size={20} />
            </button>

            <button
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="col-span-4 h-14 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
            >
              Process Checkout

              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}

      {/* ───────────────── INVOICE STEP ───────────────── */}

      {checkoutStep === 'invoice' && (
        <div className="flex flex-col h-full">

          {/* Header */}

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Invoice Preview
              </p>

              <h2 className="text-2xl font-bold mt-1">
                Confirm Order
              </h2>
            </div>

            <button
              onClick={() =>
                setCheckoutStep('cart')
              }
              className="text-sm text-zinc-400 hover:text-white"
            >
              Back
            </button>
          </div>

          {/* Invoice */}

          <div className="flex-1 overflow-y-auto no-scrollbar">

            <div className="bg-white text-black rounded-3xl p-6">

              {/* Restaurant */}

              <div className="text-center pb-5 border-b border-dashed">
                <h2 className="text-2xl font-black uppercase">
                  Restaurant
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  Premium Food Experience
                </p>
              </div>

              {/* Customer */}

              <div className="py-5 border-b border-dashed space-y-2">
                <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                  Customer
                </h3>

                <p>{customer.fullName}</p>

                <p>{customer.phone}</p>

                <p>{customer.address}</p>
              </div>

              {/* Items */}

              <div className="py-5 border-b border-dashed space-y-4">
                {cart.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.title || item.name}
                      </p>

                      <p className="text-sm text-zinc-500">
                        {item.qty} × $
                        {item.price.toFixed(2)}
                      </p>
                    </div>

                    <p className="font-bold">
                      $
                      {(
                        item.qty * item.price
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}

              <div className="py-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>

                  <span>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Tax</span>

                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-3 border-t">
                  <span className="text-lg font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-black">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Actions */}

          <div className="grid grid-cols-2 gap-3 mt-6">

            <button
              onClick={() =>
                setCheckoutStep('cart')
              }
              className="h-14 rounded-2xl border border-white/10 hover:bg-white/5 transition"
            >
              Edit Order
            </button>

            <button
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="h-14 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition"
            >
              {isSubmitting
                ? 'Processing...'
                : 'Confirm Order'}
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── INPUT ───────────────── */

function TransparentInput({
  icon,
  placeholder,
  value,
  onChange,
  isTextArea = false,
}: any) {
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
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-700 text-white resize-none"
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-700 text-white"
        />
      )}
    </div>
  );
}