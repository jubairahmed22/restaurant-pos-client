'use client';

import React, { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Search, X } from 'lucide-react';
import api from '@/services/axios';
import DataTable from '@/components/ui/DataTable';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  _id: string;
  orderId: string;
  squarePaymentId: string;
  fullName: string;
  email: string;
  phone: string;
  total: number;
  subtotal: number;
  deliveryCharge: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: string;
  shippingAddress: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
}

// ─── API fetch ────────────────────────────────────────────────────────────────

async function fetchTransactions(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(`/payments/transactions?${qs}`);
  return data;
}

// ─── Inner component (needs useSearchParams) ──────────────────────────────────

function TransactionsInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [nameInput,   setNameInput]   = useState(searchParams.get('name')          || '');
  const [emailInput,  setEmailInput]  = useState(searchParams.get('email')         || '');
  const [txIdInput,   setTxIdInput]   = useState(searchParams.get('transactionId') || '');
  const [page,        setPage]        = useState(Number(searchParams.get('page'))  || 1);

  // committed filter values (applied on Search click / Enter)
  const [filters, setFilters] = useState({
    name:          searchParams.get('name')          || '',
    email:         searchParams.get('email')         || '',
    transactionId: searchParams.get('transactionId') || '',
  });

  // sync URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (filters.name)          p.set('name',          filters.name);
    if (filters.email)         p.set('email',         filters.email);
    if (filters.transactionId) p.set('transactionId', filters.transactionId);
    if (page > 1)              p.set('page',          String(page));
    router.replace(p.toString() ? `?${p}` : window.location.pathname, { scroll: false });
  }, [filters, page, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', filters, page],
    queryFn: () => fetchTransactions({
      ...(filters.name          ? { name:          filters.name }          : {}),
      ...(filters.email         ? { email:         filters.email }         : {}),
      ...(filters.transactionId ? { transactionId: filters.transactionId } : {}),
      page: String(page),
      limit: '20',
    }),
  });

  const transactions: Transaction[] = data?.data        || [];
  const pagination:   Pagination    = data?.pagination  || { total: 0, page: 1, totalPages: 1 };

  const applyFilters = () => {
    setFilters({ name: nameInput, email: emailInput, transactionId: txIdInput });
    setPage(1);
  };

  const clearAll = () => {
    setNameInput(''); setEmailInput(''); setTxIdInput('');
    setFilters({ name: '', email: '', transactionId: '' });
    setPage(1);
  };

  const hasFilters = filters.name || filters.email || filters.transactionId;

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns = [
    {
      header: 'Transaction ID',
      accessorKey: 'squarePaymentId',
      cell: (item: Transaction) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[11px] text-indigo-600 font-bold break-all">
            {item.squarePaymentId || '—'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{item.orderId}</span>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'fullName',
      cell: (item: Transaction) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm text-slate-800">{item.fullName}</span>
          <span className="text-xs text-slate-400">{item.email || '—'}</span>
          <span className="text-xs text-slate-400">{item.phone}</span>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'total',
      cell: (item: Transaction) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-emerald-600 text-sm">
            AUD {item.total.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400">
            Subtotal AUD {item.subtotal.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      header: 'Payment',
      accessorKey: 'paymentStatus',
      cell: (item: Transaction) => {
        const map: Record<string, string> = {
          paid:    'bg-emerald-50 text-emerald-700 border-emerald-200',
          pending: 'bg-amber-50   text-amber-700   border-amber-200',
          failed:  'bg-red-50     text-red-600     border-red-200',
        };
        return (
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold ${map[item.paymentStatus] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${item.paymentStatus === 'paid' ? 'bg-emerald-500' : item.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-amber-400'}`} />
            {item.paymentStatus}
          </span>
        );
      },
    },
    {
      header: 'Order Status',
      accessorKey: 'orderStatus',
      cell: (item: Transaction) => {
        const map: Record<string, string> = {
          placed:     'bg-blue-50   text-blue-700',
          preparing:  'bg-amber-50  text-amber-700',
          dispatched: 'bg-purple-50 text-purple-700',
          delivered:  'bg-green-50  text-green-700',
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
      cell: (item: Transaction) => (
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
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-indigo-400 mb-1">Payments</p>
          <h1 className="text-2xl font-extrabold text-[#1e2661] leading-none">Transactions</h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">
            All Square card payments — {pagination.total} total
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
          <CreditCard size={14} className="text-indigo-400" />
          <span className="text-xs font-semibold text-slate-500">Square AUD</span>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">

          {/* Name */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="Filter by customer name…"
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          {/* Email */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="Filter by email…"
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          {/* Transaction ID */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={txIdInput}
              onChange={e => setTxIdInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="Filter by transaction ID…"
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={applyFilters}
              className="h-9 px-5 bg-[#1B3A6B] hover:bg-[#14305a] text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Search size={14} />
              Search
            </button>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="h-9 px-3 border border-red-200 text-red-500 hover:bg-red-50 text-sm rounded-lg transition-colors flex items-center gap-1.5"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active filter pills */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.name && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Name: &quot;{filters.name}&quot;
                <button onClick={() => { setNameInput(''); setFilters(f => ({ ...f, name: '' })); setPage(1); }} className="ml-1 hover:text-indigo-900">×</button>
              </span>
            )}
            {filters.email && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Email: &quot;{filters.email}&quot;
                <button onClick={() => { setEmailInput(''); setFilters(f => ({ ...f, email: '' })); setPage(1); }} className="ml-1 hover:text-indigo-900">×</button>
              </span>
            )}
            {filters.transactionId && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                TX: &quot;{filters.transactionId}&quot;
                <button onClick={() => { setTxIdInput(''); setFilters(f => ({ ...f, transactionId: '' })); setPage(1); }} className="ml-1 hover:text-indigo-900">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <DataTable<Transaction>
        title={`Transactions (${pagination.total})`}
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
          <div className="hidden md:block md:col-span-2" />
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-center shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
            <div className="pl-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 md:text-right">
                Page Revenue
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight md:text-right flex items-baseline justify-start md:justify-end gap-1">
                <span className="text-xs font-semibold text-emerald-600">AUD</span>
                <span className="text-emerald-600">
                  {transactions.reduce((s, t) => s + (t.paymentStatus === 'paid' ? t.total : 0), 0).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsInner />
    </Suspense>
  );
}
