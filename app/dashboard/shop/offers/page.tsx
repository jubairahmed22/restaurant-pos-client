'use client';

import React, { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { getShopOffers, createShopOffer, updateShopOffer, deleteShopOffer, getShopProductsAdmin } from '@/services/shop.service';

interface ShopOffer {
  _id: string;
  title: string;
  description: string;
  bannerImage: string;
  products: { _id: string; title: string; price: number }[];
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

const EMPTY = { title: '', description: '', bannerImage: '', products: [] as string[], discountType: 'percentage', discountValue: '', startDate: '', endDate: '', isActive: true };
const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white';

function OffersInner() {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['shop-offers'], queryFn: () => getShopOffers(), staleTime: 30_000 });
  const { data: prodData } = useQuery({ queryKey: ['shop-products-admin', ''], queryFn: () => getShopProductsAdmin('limit=100'), staleTime: 60_000 });

  const offers: ShopOffer[] = data?.data || [];
  const allProducts = prodData?.data || [];

  const saveMutation = useMutation({
    mutationFn: (body: typeof EMPTY) =>
      editId ? updateShopOffer(editId, { ...body, discountValue: Number(body.discountValue) }) : createShopOffer({ ...body, discountValue: Number(body.discountValue) }),
    onSuccess: () => {
      toast.success(editId ? 'Offer updated' : 'Offer created');
      qc.invalidateQueries({ queryKey: ['shop-offers'] });
      closeForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShopOffer(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['shop-offers'] }); setDeleteId(null); },
  });

  const openEdit = (offer: ShopOffer) => {
    setForm({
      title: offer.title, description: offer.description, bannerImage: offer.bannerImage,
      products: offer.products.map(p => p._id),
      discountType: offer.discountType, discountValue: String(offer.discountValue),
      startDate: offer.startDate ? offer.startDate.substring(0, 10) : '',
      endDate: offer.endDate ? offer.endDate.substring(0, 10) : '',
      isActive: offer.isActive,
    });
    setEditId(offer._id);
    setShowForm(true);
  };

  const closeForm = () => { setForm(EMPTY); setEditId(null); setShowForm(false); };

  const toggleProduct = (id: string) =>
    setForm(f => ({ ...f, products: f.products.includes(id) ? f.products.filter(x => x !== id) : [...f.products, id] }));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C05428] mb-1">Shop</p>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B] leading-none">Offers</h1>
          <p className="text-slate-400 text-sm mt-1.5">{offers.length} offers</p>
        </div>
        <button onClick={() => { setEditId(null); setForm(EMPTY); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-sm font-semibold hover:bg-[#14305a] transition-colors">
          <Plus size={16} /> Add Offer
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">{editId ? 'Edit Offer' : 'New Offer'}</h2>
            <button onClick={closeForm}><X size={18} className="text-slate-400" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Title *</label>
              <input className={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Offer title" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Banner Image URL</label>
              <input className={inp} value={form.bannerImage} onChange={e => setForm(f => ({ ...f, bannerImage: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
              <textarea className={inp} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Discount Type *</label>
              <select className={inp} value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (AUD)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Discount Value *</label>
              <input type="number" className={inp} value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} min="0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Start Date</label>
              <input type="date" className={inp} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">End Date</label>
              <input type="date" className={inp} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>

            {/* Product multi-select */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Products ({form.products.length} selected)</label>
              <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-50">
                {allProducts.map((p: { _id: string; title: string; price: number }) => (
                  <label key={p._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={form.products.includes(p._id)} onChange={() => toggleProduct(p._id)} className="rounded" />
                    <span className="text-sm text-slate-700 flex-1 line-clamp-1">{p.title}</span>
                    <span className="text-xs text-slate-400">AUD {p.price.toFixed(2)}</span>
                  </label>
                ))}
                {allProducts.length === 0 && <p className="px-4 py-3 text-sm text-slate-400">No products available</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-500">Active</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => saveMutation.mutate(form)} disabled={!form.title || !form.discountValue || saveMutation.isPending} className="px-5 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-sm font-semibold hover:bg-[#14305a] disabled:opacity-50 transition-colors">
              {saveMutation.isPending ? 'Saving…' : editId ? 'Update' : 'Create'}
            </button>
            <button onClick={closeForm} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Offer</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Discount</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Products</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Period</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50"><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td></tr>
            ))}
            {!isLoading && offers.map(offer => (
              <tr key={offer._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {offer.bannerImage ? (
                      <img src={offer.bannerImage} alt={offer.title} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Tag size={16} className="text-amber-400" /></div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{offer.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{offer.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className="text-xs font-bold text-[#C05428]">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `AUD ${offer.discountValue}`} off
                  </span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-xs text-slate-600">{offer.products.length} products</span>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                    {offer.startDate && <span>From {new Date(offer.startDate).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })}</span>}
                    {offer.endDate && <span>Until {new Date(offer.endDate).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })}</span>}
                    {!offer.startDate && !offer.endDate && <span>—</span>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${offer.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(offer)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#1B3A6B]"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(offer._id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && offers.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">No offers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-slate-800 mb-2">Delete Offer?</h3>
            <div className="flex gap-3 mt-5">
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopOffersPage() {
  return <Suspense><OffersInner /></Suspense>;
}
