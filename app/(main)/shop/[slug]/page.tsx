'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  Star, ShoppingCart, Minus, Plus, ChevronRight,
  Package, Tag, Ruler, Weight, ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useShopCartStore } from '@/store/shopCartStore';
import ShopProductCard, { ShopProduct } from '@/components/shop/ShopProductCard';
import { getShopProduct, getShopProducts } from '@/services/shop.service';
import toast from 'react-hot-toast';

type Tab = 'description' | 'specifications' | 'details';

export default function ShopProductDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const slug    = params.slug as string;

  const [qty, setQty]       = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab]       = useState<Tab>('description');

  const { addItem } = useShopCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['shop-product', slug],
    queryFn: () => getShopProduct(slug),
    staleTime: 60_000,
  });

  const product: ShopProduct | undefined = data?.data;

  const { data: relData } = useQuery({
    queryKey: ['shop-related', product?.category?._id],
    queryFn: () => getShopProducts(`category=${product!.category!._id}&limit=4`),
    enabled: !!product?.category?._id,
    staleTime: 120_000,
  });
  const related: ShopProduct[] = relData?.data?.filter((p: ShopProduct) => p._id !== product?._id).slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <Package size={48} className="text-slate-300" />
        <p className="text-slate-500">Product not found.</p>
        <button onClick={() => router.push('/shop')} className="px-4 py-2 bg-[#1B3A6B] text-white rounded-xl text-sm font-semibold">Back to Shop</button>
      </div>
    );
  }

  const images     = product.images?.length ? product.images : ['https://placehold.co/600x600?text=Product'];
  const finalPrice = product.finalPrice ?? product.price;
  const hasDiscount = product.discountType !== 'none' && product.discountValue > 0;
  const pct = product.discountPercent ?? (hasDiscount && product.price > 0 ? Math.round((1 - finalPrice / product.price) * 100) : 0);
  const inStock = product.stock > 0;

  const handleAddToCart = (p: ShopProduct = product) => {
    const price = p.finalPrice ?? p.price;
    addItem({ _id: p._id, title: p.title, price, image: p.images?.[0] || '' });
    toast.success(`${p.title} added to cart`);
  };

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${tab === t ? 'border-[#1B3A6B] text-[#1B3A6B]' : 'border-transparent text-slate-500 hover:text-slate-700'}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <button onClick={() => router.push('/shop')} className="hover:text-[#1B3A6B] flex items-center gap-1">
            <ArrowLeft size={12} /> Shop
          </button>
          {product.category && (
            <>
              <ChevronRight size={12} />
              <span>{product.category.name}</span>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-slate-600 font-medium line-clamp-1">{product.title}</span>
        </nav>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* ── Image gallery ──────────────────────────────────────────── */}
          <div className="space-y-3">
            <motion.div
              key={imgIdx}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
            >
              <img src={images[imgIdx]} alt={product.title} className="w-full h-full object-contain p-4" />
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${i === imgIdx ? 'border-[#1B3A6B]' : 'border-slate-200 hover:border-slate-400'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ───────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Category */}
            {product.category && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C05428] uppercase tracking-wider">
                <Tag size={11} /> {product.category.name}
              </span>
            )}

            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1B3A6B] leading-tight">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                <Star size={14} className="text-amber-400 fill-amber-200" />
              </div>
              <span className="text-sm text-slate-400">4.5 · 24 reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-[#1B3A6B]">AUD {finalPrice.toFixed(2)}</span>
              {hasDiscount && product.price !== finalPrice && (
                <>
                  <span className="text-lg text-slate-400 line-through">AUD {product.price.toFixed(2)}</span>
                  <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">Save {pct}%</span>
                </>
              )}
            </div>

            {/* Stock badge */}
            <div>
              {product.stock > 10
                ? <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">In Stock</span>
                : product.stock > 0
                ? <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">Only {product.stock} left</span>
                : <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-semibold">Out of Stock</span>
              }
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-slate-600 text-sm leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-slate-50 transition-colors">
                  <Minus size={14} className="text-slate-600" />
                </button>
                <span className="px-4 py-2.5 text-sm font-bold text-slate-800 border-x border-slate-200 min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2.5 hover:bg-slate-50 transition-colors">
                  <Plus size={14} className="text-slate-600" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { handleAddToCart(); }}
                disabled={!inStock}
                className="flex-1 h-12 bg-[#1B3A6B] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#14305a] disabled:opacity-40 transition-colors"
              >
                <ShoppingCart size={16} /> Add to Cart
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { handleAddToCart(); router.push('/shop'); }}
                disabled={!inStock}
                className="h-12 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
                style={{ background: '#C05428' }}
              >
                Buy Now
              </motion.button>
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              {product.brand && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Package size={13} className="text-slate-400" />
                  <span>Brand: <strong className="text-slate-700">{product.brand}</strong></span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>SKU: <strong className="text-slate-700">{product.sku}</strong></span>
                </div>
              )}
              {product.weight && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Weight size={13} className="text-slate-400" />
                  <span>Weight: <strong className="text-slate-700">{product.weight}</strong></span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Ruler size={13} className="text-slate-400" />
                  <span>Dims: <strong className="text-slate-700">{product.dimensions}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-10">
          <div className="flex border-b border-slate-200 px-4">
            <button className={tabClass('description')} onClick={() => setTab('description')}>Description</button>
            {product.specifications?.length ? (
              <button className={tabClass('specifications')} onClick={() => setTab('specifications')}>Specifications</button>
            ) : null}
            <button className={tabClass('details')} onClick={() => setTab('details')}>Details</button>
          </div>
          <div className="p-6">
            {tab === 'description' && (
              <div className="prose prose-sm max-w-none text-slate-600">
                {product.description ? (
                  <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-slate-400 italic">No description provided.</p>
                )}
              </div>
            )}
            {tab === 'specifications' && (
              <div className="divide-y divide-slate-100">
                {product.specifications?.map((s, i) => (
                  <div key={i} className="flex py-2.5 text-sm">
                    <span className="w-40 shrink-0 text-slate-500 font-medium">{s.key}</span>
                    <span className="text-slate-800">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'details' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {product.brand     && <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Brand</p><p className="text-slate-800 font-medium">{product.brand}</p></div>}
                {product.sku       && <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">SKU</p><p className="text-slate-800 font-medium">{product.sku}</p></div>}
                {product.weight    && <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Weight</p><p className="text-slate-800 font-medium">{product.weight}</p></div>}
                {product.dimensions && <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Dimensions</p><p className="text-slate-800 font-medium">{product.dimensions}</p></div>}
                {product.tags?.length ? <div className="col-span-2"><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Tags</p><p className="text-slate-800 font-medium">{product.tags.join(', ')}</p></div> : null}
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ─────────────────────────────────────────── */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#1B3A6B] mb-5">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map(p => (
                <ShopProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
