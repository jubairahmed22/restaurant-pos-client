'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Store, Search, X, CreditCard } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import { getShopOrders } from '@/services/shop.service';

interface ShopTransaction {
  _id: string;
  orderId: string;
  squarePaymentId: string;
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  items: { title: string; quantity: number; price: number; image: string }[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: 'cash' | 'square';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
}

function ShopTransactionsInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [nameInput,   setNameInput]   = useState(searchParams.get('name')          || '');
  const [orderIdInput,setOrderIdInput]= useState(searchParams.get('orderId')       || '');
  const [payFilter,   setPayFilter]   = useState(searchParams.get('paymentStatus') || '');
  const [page,        setPage]        = useState(Number(searchParams.get('page'))  || 1);

  const [filters, setFilters] = useState({
    name:          searchParams.get('name')          || '',
    orderId:       searchParams.get('orderId')       || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
  });

  useEffect(() => {
    const p = new URLSearchParams();
    if (filters.name)          p.set('name',          filters.name);
    if (filters.orderId)       p.set('orderId',       filters.orderId);
    if (filters.paymentStatus) p.set('paymentStatus', filters.paymentStatus);
    if (page > 1)              p.set('page',          String(page));
    router.replace(p.toString() ? `?${p}` : window.location.pathname, { scroll: false });
  }, [filters, page, router]);

  const qs = new URLSearchParams({
    page: String(page), limit: '20',
    ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
  }).toString();

  const { data, isLoading } = useQuery({
    queryKey: ['shop-transactions', filters, page],
    queryFn:  () => getShopOrders(qs),
    staleTime: 30_000,
  });

  const rawOrders: ShopTransaction[] = data?.data || [];
  const pagination: Pagination       = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  // client-side filter by name / orderId
  const transactions = rawOrders.filter(t => {
    if (filters.name    && !t.fullName.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.orderId && !t.orderId.toLowerCase().includes(filters.orderId.toLowerCase())) return false;
    return true;
  });

  const applyFilters = () => {
    setFilters({ name: nameInput, orderId: orderIdInput, paymentStatus: payFilter });
    setPage(1);
  };

  const clearAll = () => {
    setNameInput(''); setOrderIdInput(''); setPayFilter('');
    setFilters({ name: '', orderId: '', paymentStatus: '' });
    setPage(1);
  };

  const hasFilters = filters.name || filters.orderId || filters.paymentStatus;

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns = [
    {
      header: 'Order ID',
      accessorKey: 'orderId',
      cell: (item: ShopTransaction) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[11px] text-[#C05428] font-bold">{item.orderId}</span>
          {item.squarePaymentId && (
            <span className="font-mono text-[10px] text-slate-400 break-all">{item.squarePaymentId}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'fullName',
      cell: (item: ShopTransaction) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm text-slate-800">{item.fullName}</span>
          {item.email && <span className="text-xs text-slate-400">{item.email}</span>}
          {item.phone && <span className="text-xs text-slate-400">{item.phone}</span>}
        </div>
      ),
    },
    {
      header: 'Items',
      accessorKey: 'items',
      cell: (item: ShopTransaction) => (
        <div className="flex flex-col gap-0.5 max-w-[160px]">
          {item.items.slice(0, 2).map((i, idx) => (
            <span key={idx} className="text-xs text-slate-600 truncate">
              {i.quantity}× {i.title}
            </span>
          ))}
          {item.items.length > 2 && (
            <span className="text-[10px] text-slate-400">+{item.items.length - 2} more</span>
          )}
        </div>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'total',
      cell: (item: ShopTransaction) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-emerald-600 text-sm">AUD {item.total.toFixed(2)}</span>
          <span className="text-[11px] text-slate-400">Sub: AUD {item.subtotal.toFixed(2)}</span>
          {item.deliveryCharge > 0 && (
            <span className="text-[11px] text-slate-400">Delivery: AUD {item.deliveryCharge.toFixed(2)}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Payment',
      accessorKey: 'paymentStatus',
      cell: (item: ShopTransaction) => {
        const map: Record<string, string> = {
          paid:    'bg-emerald-50 text-emerald-700 border-emerald-200',
          pending: 'bg-amber-50   text-amber-700   border-amber-200',
          failed:  'bg-red-50     text-red-600     border-red-200',
        };
        const dot: Record<string, string> = { paid: 'bg-emerald-500', pending: 'bg-amber-400', failed: 'bg-red-500' };
        return (
          <div className="flex flex-col gap-1.5">
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold w-fit ${map[item.paymentStatus] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot[item.paymentStatus] || 'bg-slate-400'}`} />
              {item.paymentStatus}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold w-fit ${
              item.paymentMethod === 'square' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
            }`}>
              {item.paymentMethod === 'square' ? '💳 Square' : '💵 Cash'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Order Status',
      accessorKey: 'orderStatus',
      cell: (item: ShopTransaction) => {
        const map: Record<string, string> = {
          placed:     'bg-blue-50   text-blue-700',
          processing: 'bg-amber-50  text-amber-700',
          shipped:    'bg-purple-50 text-purple-700',
          delivered:  'bg-emerald-50 text-emerald-700',
          cancelled:  'bg-red-50    text-red-600',
        };
        return (
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${map[item.orderStatus] || 'bg-slate-50 text-slate-500'}`}>
            {item.orderStatus}
          </span>
        );
      },
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: (item: ShopTransaction) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-slate-700">
            {new Date(item.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-[11px] text-slate-400">
            {new Date(item.createdAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C05428] mb-1">Shop · Payments</p>
          <h1 className="text-2xl font-extrabold text-[#1e2661] leading-none">Shop Transactions</h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">
            All shop order payments — {pagination.total} total
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
          <Store size={14} className="text-[#C05428]" />
          <span className="text-xs font-semibold text-slate-500">Shop Orders</span>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">

          {/* Customer name */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="Customer name…"
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#C05428]"
            />
          </div>

          {/* Order ID */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={orderIdInput}
              onChange={e => setOrderIdInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="Order ID…"
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#C05428]"
            />
          </div>

          {/* Payment status */}
          <select
            value={payFilter}
            onChange={e => setPayFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#C05428] min-w-[140px]"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={applyFilters}
              className="h-9 px-5 bg-[#C05428] hover:bg-[#a8481f] text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Search size={14} />
              Search
            </button>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="h-9 px-3 border border-red-200 text-red-500 hover:bg-red-50 text-sm rounded-lg transition-colors flex items-center gap-1.5"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.name && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-orange-50 text-[#C05428] border border-orange-200">
                Name: &quot;{filters.name}&quot;
                <button onClick={() => { setNameInput(''); setFilters(f => ({ ...f, name: '' })); setPage(1); }}>×</button>
              </span>
            )}
            {filters.orderId && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-orange-50 text-[#C05428] border border-orange-200">
                ID: &quot;{filters.orderId}&quot;
                <button onClick={() => { setOrderIdInput(''); setFilters(f => ({ ...f, orderId: '' })); setPage(1); }}>×</button>
              </span>
            )}
            {filters.paymentStatus && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-orange-50 text-[#C05428] border border-orange-200">
                Payment: {filters.paymentStatus}
                <button onClick={() => { setPayFilter(''); setFilters(f => ({ ...f, paymentStatus: '' })); setPage(1); }}>×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <DataTable<ShopTransaction>
        title={`Shop Transactions (${pagination.total})`}
        data={transactions}
        columns={columns}
        page={pagination.page}
        totalPages={pagination.totalPages}
        setPage={setPage}
        loading={isLoading}
      />

      {/* ── Summary ─────────────────────────────────────────────────── */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
            <div className="pl-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Page Revenue (Paid)</p>
              <p className="text-2xl font-bold text-emerald-600">
                AUD {transactions.filter(t => t.paymentStatus === 'paid').reduce((s, t) => s + t.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
            <div className="pl-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Pending Amount</p>
              <p className="text-2xl font-bold text-amber-600">
                AUD {transactions.filter(t => t.paymentStatus === 'pending').reduce((s, t) => s + t.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C05428]" />
            <div className="pl-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Total Orders</p>
              <p className="text-2xl font-bold text-[#C05428]">{pagination.total}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopTransactionsPage() {
  return (
    <Suspense>
      <ShopTransactionsInner />
    </Suspense>
  );
}
