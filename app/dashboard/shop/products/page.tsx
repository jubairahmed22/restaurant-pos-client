'use client';

import React, { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Star, Search, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  getShopProductsAdmin,
  getShopCategories,
  deleteShopProduct,
  toggleFeatured,
  bulkDiscount,
} from '@/services/shop.service';

interface ShopProduct {
  _id: string;
  title: string;
  slug: string;
  category?: { _id: string; name: string };
  images: string[];
  price: number;
  comparePrice: number;
  finalPrice: number;
  discountType: string;
  discountValue: number;
  discountPercent: number;
  isFeatured: boolean;
  isActive: boolean;
  stock: number;
}

function ProductsInner() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({ discountType: 'percentage', discountValue: '', discountEndDate: '' });

  const qs = new URLSearchParams({
    ...(search ? { search } : {}),
    ...(categoryFilter ? { category: categoryFilter } : {}),
    page: String(page),
    limit: '20',
  }).toString();

  const { data, isLoading } = useQuery({
    queryKey: ['shop-products-admin', qs],
    queryFn: () => getShopProductsAdmin(qs),
    staleTime: 30_000,
  });
  const { data: catData } = useQuery({ queryKey: ['shop-categories'], queryFn: () => getShopCategories(), staleTime: 60_000 });

  const products: ShopProduct[] = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };
  const categories = catData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShopProduct(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['shop-products-admin'] }); setDeleteId(null); },
    onError: () => toast.error('Delete failed'),
  });

  const featuredMutation = useMutation({
    mutationFn: (id: string) => toggleFeatured(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop-products-admin'] }),
  });

  const bulkMutation = useMutation({
    mutationFn: () => bulkDiscount({ productIds: selectedIds, discountType: bulkForm.discountType, discountValue: Number(bulkForm.discountValue), discountEndDate: bulkForm.discountEndDate || undefined }),
    onSuccess: () => {
      toast.success(`Discount applied to ${selectedIds.length} products`);
      qc.invalidateQueries({ queryKey: ['shop-products-admin'] });
      setShowBulkModal(false);
      setSelectedIds([]);
    },
    onError: () => toast.error('Bulk discount failed'),
  });

  const toggleSelect = (id: string) =>
    setSelectedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const inp = 'border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C05428] mb-1">Shop</p>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B] leading-none">Products</h1>
          <p className="text-slate-400 text-sm mt-1.5">{pagination.total} products</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors">
              Bulk Discount ({selectedIds.length})
            </button>
          )}
          <Link href="/dashboard/shop/products/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-sm font-semibold hover:bg-[#14305a] transition-colors">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Search products…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map((c: { _id: string; name: string }) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {(search || categoryFilter) && (
          <button onClick={() => { setSearch(''); setCategoryFilter(''); setPage(1); }} className="h-9 px-3 border border-red-200 text-red-500 hover:bg-red-50 text-sm rounded-lg flex items-center gap-1.5">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 w-8"><input type="checkbox" checked={selectedIds.length === products.length && products.length > 0} onChange={e => setSelectedIds(e.target.checked ? products.map(p => p._id) : [])} className="rounded" /></th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Price</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Featured</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td colSpan={7} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
                </tr>
              ))}
              {!isLoading && products.map(p => (
                <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => toggleSelect(p._id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{p.title}</p>
                        <p className="text-[11px] text-slate-400">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-slate-600">{p.category?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#1B3A6B]">AUD {(p.finalPrice ?? p.price).toFixed(2)}</span>
                      {p.discountType !== 'none' && (
                        <>
                          <span className="text-[11px] text-slate-400 line-through">AUD {p.price.toFixed(2)}</span>
                          <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full w-fit font-semibold">{p.discountPercent}% off</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-semibold ${p.stock <= 5 ? 'text-red-600' : 'text-slate-600'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => featuredMutation.mutate(p._id)}
                      className={`p-1.5 rounded-lg transition-colors ${p.isFeatured ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400 hover:text-amber-400'}`}
                    >
                      <Star size={14} fill={p.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/shop/products/${p._id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#1B3A6B] transition-colors">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => setDeleteId(p._id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && products.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Prev</button>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-slate-800 mb-2">Delete Product?</h3>
            <p className="text-sm text-slate-500 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk discount modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Bulk Discount ({selectedIds.length} products)</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Discount Type</label>
              <select className={`w-full ${inp}`} value={bulkForm.discountType} onChange={e => setBulkForm(f => ({ ...f, discountType: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (AUD)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Discount Value</label>
              <input type="number" className={`w-full ${inp}`} value={bulkForm.discountValue} onChange={e => setBulkForm(f => ({ ...f, discountValue: e.target.value }))} placeholder="e.g. 10" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">End Date (optional)</label>
              <input type="date" className={`w-full ${inp}`} value={bulkForm.discountEndDate} onChange={e => setBulkForm(f => ({ ...f, discountEndDate: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => bulkMutation.mutate()} disabled={!bulkForm.discountValue || bulkMutation.isPending} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:opacity-50">
                {bulkMutation.isPending ? 'Applying…' : 'Apply Discount'}
              </button>
              <button onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopProductsPage() {
  return <Suspense><ProductsInner /></Suspense>;
}
