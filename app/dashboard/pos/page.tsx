'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import { FoodService } from '@/services/food.service';
import { CategoryService } from '@/services/category.service';

import FoodGrid from '@/components/pos/FoodGrid';
import CheckoutPanel from '@/components/pos/CheckoutPanel';

export default function FoodTablePage() {
  /* =========================
     ROUTER + URL STATE
  ========================= */
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  /* =========================
     POS STATE
  ========================= */
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  /* =========================
     DATA FETCH
  ========================= */
  const { data: foodRes, isLoading } = useQuery({
    queryKey: ['foods', search, category, page],
    queryFn: () =>
      FoodService.getAllFoods(
        `search=${search}&category=${category}&page=${page}`
      ),
  });

  const { data: categoryRes } = useQuery({
    queryKey: ['categories'],
    queryFn: CategoryService.getAllCategories,
  });

  const foods = foodRes?.data || [];
  const categories = categoryRes?.data || [];

  /* =========================
     UPDATE URL
  ========================= */
  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });

    router.push(`?${newParams.toString()}`);
  };

  /* =========================
     CART ACTIONS
  ========================= */
  const addToCart = (food: any) => {
    setCart((prev) => {
      const exists = prev.find((x) => x._id === food._id);

      if (exists) {
        return prev.map((x) =>
          x._id === food._id
            ? { ...x, qty: x.qty + 1 }
            : x
        );
      }

      return [...prev, { ...food, qty: 1 }];
    });
  };

  const increaseQty = (id: string) => {
    setCart((prev) =>
      prev.map((x) =>
        x._id === id ? { ...x, qty: x.qty + 1 } : x
      )
    );
  };

  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((x) =>
          x._id === id
            ? { ...x, qty: x.qty - 1 }
            : x
        )
        .filter((x) => x.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((x) => x._id !== id));
  };

  const clearCart = () => setCart([]);

  /* =========================
     CALCULATIONS
  ========================= */
  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );
  }, [cart]);

  const tax = subtotal * 0.125;
  const total = subtotal + tax;

  /* =========================
     UI
  ========================= */
  return (
    <div className="grid grid-cols-12 gap-6">

      {/* =========================
          LEFT SIDE - FOOD GRID
      ========================= */}
      <div className="col-span-12 xl:col-span-8">
        <FoodGrid
          foods={foods}
          categories={categories}
          search={search}
          category={category}
          updateURL={updateURL}
          onAdd={addToCart}
          isLoading={isLoading}
        />
      </div>

      {/* =========================
          RIGHT SIDE - CHECKOUT
      ========================= */}
      <div className="col-span-12 xl:col-span-4">
        <CheckoutPanel
          cart={cart}
          subtotal={subtotal}
          tax={tax}
          total={total}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          setCart={setCart}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
          removeItem={removeItem}
          clearCart={clearCart}
        />
      </div>

    </div>
  );
}