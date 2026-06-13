'use client';

import React, { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import { getShopOrders, updateShopOrderStatus } from '@/services/shop.service';

interface ShopOrder {
  _id: string;
  orderId: string;
  fullName: string;
  email: string;
  phone: string;
  items: { title: string; quantity: number; price: number }[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const ORDER_STATUS = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

function ShopOrdersInner() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const qs = new URLSearchParams({ page: String(page), limit: '20', ...(statusFilter ? { orderStatus: statusFilter } : {}) }).toString();
  const { data, isLoading } = useQuery({ queryKey: ['shop-orders', qs], queryFn: () => getShopOrders(qs), staleTime: 30_000 });

  const orders: ShopOrder[] = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  const statusMutation = useMutation({
    mutationFn: ({ id, orderStatus }: { id: string; orderStatus: string }) => updateShopOrderStatus(id, { orderStatus }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['shop-orders'] }); },
    onError: () => toast.error('Update failed'),
  });

  const payStatusMap: Record<string, string> = {
    paid:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    failed:  'bg-red-50 text-red-600 border-red-200',
  };
  const orderStatusMap: Record<string, string> = {
    placed:     'bg-blue-50 text-blue-700',
    processing: 'bg-amber-50 text-amber-700',
    shipped:    'bg-purple-50 text-purple-700',
    delivered:  'bg-emerald-50 text-emerald-700',
    cancelled:  'bg-red-50 text-red-600',
  };

  const columns = [
    {
      header: 'Order',
      accessorKey: 'orderId',
      cell: (item: ShopOrder) => (
        <div>
          <p className="font-mono text-[11px] text-indigo-600 font-bold">{item.orderId}</p>
          <p className="text-[10px] text-slate-400">{item.items.length} item{item.items.length !== 1 ? 's' : ''}</p>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'fullName',
      cell: (item: ShopOrder) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{item.fullName}</p>
          <p className="text-xs text-slate-400">{item.email || item.phone}</p>
        </div>
      ),
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: (item: ShopOrder) => (
        <div>
          <p className="font-bold text-emerald-600 text-sm">AUD {item.total.toFixed(2)}</p>
          <span className="text-[10px] capitalize text-slate-400">{item.paymentMethod}</span>
        </div>
      ),
    },
    {
      header: 'Payment',
      accessorKey: 'paymentStatus',
      cell: (item: ShopOrder) => (
        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-semibold ${payStatusMap[item.paymentStatus] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
          {item.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'orderStatus',
      cell: (item: ShopOrder) => (
        <select
          value={item.orderStatus}
          onChange={e => statusMutation.mutate({ id: item._id, orderStatus: e.target.value })}
          className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 ${orderStatusMap[item.orderStatus] || 'bg-slate-50 text-slate-600'}`}
        >
          {ORDER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: (item: ShopOrder) => (
        <div>
          <p className="text-xs text-slate-700">{new Date(item.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <p className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C05428] mb-1">Shop</p>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B] leading-none">Orders</h1>
          <p className="text-slate-400 text-sm mt-1.5">{pagination.total} orders</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
          <ShoppingCart size={14} className="text-[#1B3A6B]" />
          <span className="text-xs font-semibold text-slate-500">Shop Orders</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex gap-3">
        <select className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {ORDER_STATUS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <DataTable<ShopOrder>
        title={`Shop Orders (${pagination.total})`}
        data={orders}
        columns={columns}
        page={pagination.page}
        totalPages={pagination.totalPages}
        setPage={setPage}
        loading={isLoading}
      />
    </div>
  );
}

export default function ShopOrdersPage() {
  return <Suspense><ShopOrdersInner /></Suspense>;
}
