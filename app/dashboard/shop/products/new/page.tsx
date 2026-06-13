'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { createShopProduct, getShopCategories } from '@/services/shop.service';
import ImageDropzone from '@/components/ui/ImageDropzone';

interface AttributeOption { label: string; value: string; unit: string; }
interface Attribute { name: string; options: AttributeOption[]; }

const EMPTY_OPTION = (): AttributeOption => ({ label: '', value: '', unit: '' });
const EMPTY_ATTR   = (): Attribute => ({ name: '', options: [EMPTY_OPTION()] });

const EMPTY = {
  title: '', shortDescription: '', description: '', category: '',
  brand: '', sku: '', price: '', comparePrice: '', stock: '0',
  discountType: 'none', discountValue: '0', discountEndDate: '',
  isFeatured: false, isActive: true, isAvailable: true,
  weight: '', dimensions: '',
  images: [] as string[],
  specifications: [{ key: '', value: '' }],
  attributes: [] as Attribute[],
  tags: '',
  seoTitle: '', seoDescription: '', seoKeywords: '',
};

const inp   = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white';
const label = 'text-xs font-semibold text-slate-500 mb-1 block';
const card  = 'bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4';

export default function NewShopProductPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);

  const { data: catData } = useQuery({ queryKey: ['shop-categories'], queryFn: () => getShopCategories(), staleTime: 60_000 });
  const categories = catData?.data || [];

  const mutation = useMutation({
    mutationFn: () => createShopProduct({
      title: form.title, shortDescription: form.shortDescription, description: form.description,
      category: form.category || undefined,
      brand: form.brand, sku: form.sku,
      price: Number(form.price), comparePrice: Number(form.comparePrice), stock: Number(form.stock),
      discountType: form.discountType, discountValue: Number(form.discountValue),
      discountEndDate: form.discountEndDate || undefined,
      isFeatured: form.isFeatured, isActive: form.isActive, isAvailable: form.isAvailable,
      images: form.images.filter(Boolean),
      specifications: form.specifications.filter(s => s.key && s.value),
      attributes: form.attributes
        .filter(a => a.name)
        .map(a => ({ name: a.name, options: a.options.filter(o => o.label && o.value) })),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      seoTitle: form.seoTitle, seoDescription: form.seoDescription, seoKeywords: form.seoKeywords,
    }),
    onSuccess: () => { toast.success('Product created'); router.push('/dashboard/shop/products'); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed';
      toast.error(msg);
    },
  });

  const set = (key: keyof typeof EMPTY, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const updateSpec = (i: number, field: 'key' | 'value', v: string) =>
    setForm(f => { const specs = [...f.specifications]; specs[i] = { ...specs[i], [field]: v }; return { ...f, specifications: specs }; });
  const addSpec    = () => setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const removeSpec = (i: number) => setForm(f => ({ ...f, specifications: f.specifications.filter((_, j) => j !== i) }));

  const addAttr    = () => setForm(f => ({ ...f, attributes: [...f.attributes, EMPTY_ATTR()] }));
  const removeAttr = (ai: number) => setForm(f => ({ ...f, attributes: f.attributes.filter((_, j) => j !== ai) }));
  const updateAttrName = (ai: number, v: string) =>
    setForm(f => { const attrs = [...f.attributes]; attrs[ai] = { ...attrs[ai], name: v }; return { ...f, attributes: attrs }; });
  const addOpt = (ai: number) =>
    setForm(f => { const attrs = [...f.attributes]; attrs[ai] = { ...attrs[ai], options: [...attrs[ai].options, EMPTY_OPTION()] }; return { ...f, attributes: attrs }; });
  const removeOpt = (ai: number, oi: number) =>
    setForm(f => { const attrs = [...f.attributes]; attrs[ai] = { ...attrs[ai], options: attrs[ai].options.filter((_, j) => j !== oi) }; return { ...f, attributes: attrs }; });
  const updateOpt = (ai: number, oi: number, field: keyof AttributeOption, v: string) =>
    setForm(f => {
      const attrs = [...f.attributes];
      const opts = [...attrs[ai].options];
      opts[oi] = { ...opts[oi], [field]: v };
      attrs[ai] = { ...attrs[ai], options: opts };
      return { ...f, attributes: attrs };
    });

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/shop/products" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C05428] mb-0.5">Shop</p>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B] leading-none">New Product</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Main */}
        <div className="space-y-5">
          {/* Basic Info */}
          <div className={card}>
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Basic Information</h2>
            <div>
              <label className={label}>Title *</label>
              <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Product title" />
            </div>
            <div>
              <label className={label}>Short Description</label>
              <input className={inp} value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="Brief summary" />
            </div>
            <div>
              <label className={label}>Full Description</label>
              <textarea className={inp} rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed product description…" />
            </div>
          </div>

          {/* Pricing */}
          <div className={card}>
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Pricing & Stock</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><label className={label}>Price (AUD) *</label><input type="number" className={inp} value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" min="0" step="0.01" /></div>
              <div><label className={label}>Compare Price</label><input type="number" className={inp} value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} placeholder="0.00" min="0" step="0.01" /></div>
              <div><label className={label}>Stock</label><input type="number" className={inp} value={form.stock} onChange={e => set('stock', e.target.value)} min="0" /></div>
              <div><label className={label}>SKU</label><input className={inp} value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="SKU-001" /></div>
            </div>
          </div>

          {/* Discount */}
          <div className={card}>
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Discount</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={label}>Type</label>
                <select className={inp} value={form.discountType} onChange={e => set('discountType', e.target.value)}>
                  <option value="none">No Discount</option>
                  <option value="fixed">Fixed (AUD off)</option>
                  <option value="percentage">Percentage (% off)</option>
                </select>
              </div>
              {form.discountType !== 'none' && (
                <>
                  <div><label className={label}>Value</label><input type="number" className={inp} value={form.discountValue} onChange={e => set('discountValue', e.target.value)} min="0" placeholder="0" /></div>
                  <div><label className={label}>End Date</label><input type="date" className={inp} value={form.discountEndDate} onChange={e => set('discountEndDate', e.target.value)} /></div>
                </>
              )}
            </div>
          </div>

          {/* Images */}
          <div className={card}>
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Images</h2>
            <ImageDropzone mode="multiple" value={form.images} onChange={(urls) => set('images', urls)} max={5} label="Product Images (first is the main)" />
          </div>

          {/* Attributes */}
          <div className={card}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Product Attributes</h2>
              <button onClick={addAttr} className="flex items-center gap-1.5 text-xs font-bold text-[#1B3A6B] hover:underline">
                <Plus size={13} /> Add Attribute
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Define options like Size, Volume (ml), Weight (g). Customers pick these before adding to cart.</p>
            {form.attributes.length === 0 && (
              <p className="text-xs text-slate-400 italic">No attributes yet.</p>
            )}
            {form.attributes.map((attr, ai) => (
              <div key={ai} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <input
                    className={`${inp} flex-1`}
                    value={attr.name}
                    onChange={e => updateAttrName(ai, e.target.value)}
                    placeholder="Attribute name (e.g. Size, Volume, Weight)"
                  />
                  <button onClick={() => removeAttr(ai)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg shrink-0"><Trash2 size={14} /></button>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Options</p>
                  {attr.options.map((opt, oi) => (
                    <div key={oi} className="flex gap-2 items-center">
                      <input className={`${inp} flex-1`} value={opt.label} onChange={e => updateOpt(ai, oi, 'label', e.target.value)} placeholder="Label (e.g. Large)" />
                      <input className={`${inp} flex-1`} value={opt.value} onChange={e => updateOpt(ai, oi, 'value', e.target.value)} placeholder="Value (e.g. large)" />
                      <input className={`${inp} w-24`} value={opt.unit} onChange={e => updateOpt(ai, oi, 'unit', e.target.value)} placeholder="Unit (ml, g…)" />
                      {attr.options.length > 1 && (
                        <button onClick={() => removeOpt(ai, oi)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg shrink-0"><X size={13} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={() => addOpt(ai)} className="flex items-center gap-1.5 text-xs text-[#1B3A6B] hover:underline font-medium">
                  <Plus size={12} /> Add Option
                </button>
              </div>
            ))}
          </div>

          {/* Specifications */}
          <div className={card}>
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Specifications</h2>
            <div className="space-y-2">
              {form.specifications.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <input className={`${inp} flex-1`} value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} placeholder="e.g. Material" />
                  <input className={`${inp} flex-1`} value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="e.g. Ceramic" />
                  {form.specifications.length > 1 && (
                    <button onClick={() => removeSpec(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addSpec} className="flex items-center gap-2 text-sm text-[#1B3A6B] hover:underline font-medium"><Plus size={14} /> Add Specification</button>
          </div>

          {/* SEO */}
          <div className={card}>
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">SEO Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className={label}>SEO Title</label><input className={inp} value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} /></div>
              <div><label className={label}>SEO Description</label><input className={inp} value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} /></div>
              <div><label className={label}>SEO Keywords</label><input className={inp} value={form.seoKeywords} onChange={e => set('seoKeywords', e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className={card}>
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Organisation</h2>
            <div>
              <label className={label}>Category</label>
              <select className={inp} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">No Category</option>
                {categories.map((c: { _id: string; name: string }) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={label}>Brand</label><input className={inp} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Brand name" /></div>
            <div><label className={label}>Tags (comma-separated)</label><input className={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="tag1, tag2" /></div>
            <div><label className={label}>Weight</label><input className={inp} value={form.weight ?? ''} onChange={e => set('weight', e.target.value)} placeholder="e.g. 500g" /></div>
            <div><label className={label}>Dimensions</label><input className={inp} value={form.dimensions ?? ''} onChange={e => set('dimensions', e.target.value)} placeholder="e.g. 10×5×3 cm" /></div>
          </div>

          <div className={card}>
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Visibility</h2>
            {([
              { key: 'isActive',    label: 'Active',              color: 'bg-emerald-500' },
              { key: 'isFeatured',  label: 'Featured',            color: 'bg-amber-400'  },
              { key: 'isAvailable', label: 'Available to buy',    color: 'bg-blue-500'   },
            ] as const).map(({ key, label: lbl, color }) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-slate-700">{lbl}</label>
                <button
                  type="button"
                  onClick={() => set(key, !form[key])}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form[key] ? color : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => mutation.mutate()}
              disabled={!form.title || !form.price || mutation.isPending}
              className="w-full py-3 bg-[#1B3A6B] text-white rounded-xl font-bold text-sm hover:bg-[#14305a] disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Creating…' : 'Create Product'}
            </button>
            <Link href="/dashboard/shop/products" className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl text-sm text-center hover:bg-slate-50 transition-colors">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
