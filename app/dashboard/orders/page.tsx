'use client';

import React from 'react';
import {
  ShoppingBag, ChevronLeft, ChevronRight,
  Search, Loader2, RefreshCw,asdf
} from 'lucide-react';
import { useAdminOrders } from '@/app/hooks/useAdminOrders';

const ORDER_STATUSES   = ['placed', 'preparing', 'dispatched', 'delivered', 'cancelled'] as const;
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'] as const;

const ORDER_STATUS_STYLES: Record<string, string> = {
  placed:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  preparing:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  dispatched: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  delivered:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400',
  paid:    'bg-emerald-500/10 text-emerald-400',
  failed:  'bg-red-500/10 text-red-400',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AdminOrderManagement() {
  const {
    orders, pagination, isLoading, isFetching, dataUpdatedAt,
    filters, searchInput, setSearchInput, hasActiveFilters,
    setPage, applySearch, applyFilter, clearFilters, refetch, updateStatus,
  } = useAdminOrders();

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <ShoppingBag className="text-orange-500" size={24} />
            Live Order Flow
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Monitor and manage all customer orders.
            {lastUpdated && <span className="ml-2 text-slate-600">Last synced: {lastUpdated}</span>}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 flex-1 min-w-[220px] max-w-xs">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search order ID or customer..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applySearch()}
            className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-full"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); applyFilter('search', ''); }} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
          )}
        </div>

        <button onClick={applySearch} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          Search
        </button>

        <select value={filters.orderStatus} onChange={e => applyFilter('orderStatus', e.target.value)} className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{cap(s)}</option>)}
        </select>

        <select value={filters.paymentStatus} onChange={e => applyFilter('paymentStatus', e.target.value)} className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none">
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{cap(s)}</option>)}
        </select>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-slate-400 hover:text-slate-200 text-sm underline transition-colors">Clear filters</button>
        )}

        {isFetching && !isLoading && <Loader2 size={15} className="text-slate-500 animate-spin ml-auto" />}
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-5 py-3.5">Order</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500 text-sm">
                    <Loader2 size={20} className="animate-spin mx-auto mb-2 text-slate-600" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500 text-sm">
                    No orders found.{hasActiveFilters && ' Try adjusting your filters.'}
                  </td>
                </tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-orange-400 font-bold">{order.orderId}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-200">{order.user?.name || 'Guest'}</p>
                    <p className="text-[10px] text-slate-500">{order.user?.email || '—'}</p>
                  </td>
                  <td className="px-5 py-4 max-w-[180px]">
                    <p className="text-xs text-slate-400 truncate">
                      {order.items.map(i => `${i.quantity}× ${i.title}`).join(', ')}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-orange-400">${order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500">+${order.deliveryCharge.toFixed(2)} delivery</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${ORDER_STATUS_STYLES[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <select
                      value={order.orderStatus}
                      disabled={updateStatus.isPending}
                      onChange={e => updateStatus.mutate({ id: order._id, orderStatus: e.target.value })}
                      className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5 outline-none disabled:opacity-50 cursor-pointer"
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Showing{' '}
              <span className="text-slate-300 font-semibold">
                {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>
              {' '}of{' '}
              <span className="text-slate-300 font-semibold">{pagination.total}</span> orders
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`e-${idx}`} className="w-8 text-center text-slate-600 text-xs">…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${pagination.page === p ? 'bg-orange-500 text-white border border-orange-400' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}>
                      {p}
                    </button>
                  )
                )}
              <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}