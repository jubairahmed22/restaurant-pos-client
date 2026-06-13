'use client';

import React, { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getShopCategories,
  createShopCategory,
  updateShopCategory,
  deleteShopCategory,
} from '@/services/shop.service';
import ImageDropzone from '@/components/ui/ImageDropzone';

interface ShopCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY: Omit<ShopCategory, '_id' | 'slug'> = {
  name: '', description: '', image: '', seoTitle: '',
  seoDescription: '', seoKeywords: '', isActive: true, sortOrder: 0,
};

function CategoriesInner() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Omit<ShopCategory, '_id' | 'slug'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => getShopCategories(),
    staleTime: 30_000,
  });
  const categories: ShopCategory[] = data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (body: Omit<ShopCategory, '_id' | 'slug'>) =>
      editId ? updateShopCategory(editId, body) : createShopCategory(body),
    onSuccess: () => {
      toast.success(editId ? 'Category updated' : 'Category created');
      qc.invalidateQueries({ queryKey: ['shop-categories'] });
      closeForm();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShopCategory(id),
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['shop-categories'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Delete failed'),
  });

  const openEdit = (cat: ShopCategory) => {
    setForm({ name: cat.name, description: cat.description, image: cat.image, seoTitle: cat.seoTitle, seoDescription: cat.seoDescription, seoKeywords: cat.seoKeywords, isActive: cat.isActive, sortOrder: cat.sortOrder });
    setEditId(cat._id);
    setShowForm(true);
  };
  const closeForm = () => { setForm(EMPTY); setEditId(null); setShowForm(false); };

  const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C05428] mb-1">Shop</p>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B] leading-none">Categories</h1>
          <p className="text-slate-400 text-sm mt-1.5">{categories.length} categories</p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm(EMPTY); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-sm font-semibold hover:bg-[#14305a] transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">{editId ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Name *</label>
              <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Category name" />
            </div>
            <div>
              <ImageDropzone
                mode="single"
                label="Category Image"
                value={form.image}
                onChange={(url) => setForm(f => ({ ...f, image: url }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
              <textarea className={inp} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>

            <div className="md:col-span-2 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">SEO Metadata</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">SEO Title</label>
                  <input className={inp} value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} placeholder="SEO title" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">SEO Description</label>
                  <input className={inp} value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} placeholder="Meta description" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">SEO Keywords</label>
                  <input className={inp} value={form.seoKeywords} onChange={e => setForm(f => ({ ...f, seoKeywords: e.target.value }))} placeholder="keyword1, keyword2" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-500">Active</label>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Sort Order</label>
              <input type="number" className={inp} value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.name || saveMutation.isPending}
              className="px-5 py-2.5 bg-[#1B3A6B] text-white rounded-xl text-sm font-semibold hover:bg-[#14305a] disabled:opacity-50 transition-colors"
            >
              {saveMutation.isPending ? 'Saving…' : editId ? 'Update' : 'Create'}
            </button>
            <button onClick={closeForm} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">SEO Title</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td colSpan={4} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
                </tr>
              ))
            )}
            {!isLoading && categories.map(cat => (
              <tr key={cat._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Tag size={14} className="text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{cat.name}</p>
                      <p className="text-[11px] text-slate-400">{cat.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <p className="text-xs text-slate-600 truncate max-w-[200px]">{cat.seoTitle || '—'}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#1B3A6B] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(cat._id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && categories.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-sm">No categories yet. Create one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-slate-800 mb-2">Delete Category?</h3>
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
    </div>
  );
}

export default function ShopCategoriesPage() {
  return <Suspense><CategoriesInner /></Suspense>;
}
