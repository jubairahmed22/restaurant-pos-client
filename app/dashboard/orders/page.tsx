'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminOrders } from '@/app/hooks/useAdminOrders';
import DataTable from '@/components/ui/DataTable';

type OrderItem = {
  food: string;
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  orderId: string;
  user?: { name?: string; email?: string };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'placed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: string;
};

const ORDER_STATUSES = ['placed', 'preparing', 'dispatched', 'delivered', 'cancelled'];

export default function AdminOrderManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    orders,
    pagination,
    isLoading,
    setPage,
    page
  } = useAdminOrders();

  // -----------------------------
  // STATE FROM URL (FILTER SYNC)
  // -----------------------------
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const orderStatus = searchParams.get('orderStatus') || '';
  const paymentStatus = searchParams.get('paymentStatus') || '';

  // -----------------------------
  // SYNC URL
  // -----------------------------
  const updateURL = (params: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (!value) newParams.delete(key);
      else newParams.set(key, String(value));
    });

    router.push(`?${newParams.toString()}`);
  };

  useEffect(() => {
    updateURL({ search, page });
  }, [search, page]);

  // -----------------------------
  // FILTERED DATA (CLIENT SIDE)
  // -----------------------------
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderId.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = orderStatus ? o.orderStatus === orderStatus : true;
      const matchPayment = paymentStatus ? o.paymentStatus === paymentStatus : true;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, search, orderStatus, paymentStatus]);

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns = [
    {
      header: 'Order',
      accessorKey: 'orderId',
      cell: (item: Order) => (
        <div>
          <span className="font-mono text-orange-500 font-bold">{item.orderId}</span>
          <span className="text-[11px] text-slate-500">
            {new Date(item.createdAt).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'user',
      cell: (item: Order) => (
        <div>
          <span className="font-semibold text-slate-700">
            {item.user?.name || 'Guest'}
          </span>
          <span className="text-[11px] text-slate-500">
            {item.user?.email || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Items',
      accessorKey: 'items',
      cell: (item: Order) => (
        <div className="max-w-[260px]">
          <span className="text-sm text-slate-600 truncate">
            {item.items.map(i => `${i.quantity}× ${i.title}`).join(', ')}
          </span>
          <span className="text-[11px] text-slate-400">
            {item.items.length} item(s)
          </span>
        </div>
      ),
    },
    {
      header: 'Address',
      accessorKey: 'shippingAddress',
      cell: (item: Order) => (
        <span className="text-xs text-slate-600 max-w-[200px]">
          {item.shippingAddress}
        </span>
      ),
    },
    {
      header: 'Subtotal',
      accessorKey: 'subtotal',
      cell: (item: Order) => (
        <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
      ),
    },
    {
      header: 'Delivery',
      accessorKey: 'deliveryCharge',
      cell: (item: Order) => (
        <span className="text-slate-500">
          ${item.deliveryCharge.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: (item: Order) => (
        <span className="font-bold text-orange-500">
          ${item.total.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Payment',
      accessorKey: 'paymentMethod',
      cell: (item: Order) => (
        <div>
          <p className="uppercase text-xs font-bold text-slate-600">
            {item.paymentMethod}
          </p>
          <p className="text-[11px] text-slate-400">
            {item.paymentStatus}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'orderStatus',
      cell: (item: Order) => (
        <select
          value={item.orderStatus}
          onChange={(e) =>
            console.log('update status:', item._id, e.target.value)
          }
          className="text-xs border rounded px-2 py-1 bg-white"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
  ];

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="space-y-4">

      <DataTable<Order>
        title="Admin Orders"
        data={filteredOrders}
        columns={columns}
        search={search}
        setSearch={setSearch}
        page={page}
        totalPages={pagination?.totalPages || 1}
        setPage={setPage}
      />

    </div>
  );
}