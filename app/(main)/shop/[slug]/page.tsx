'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  Star, ShoppingCart, Minus, Plus, ChevronRight,
  Package, Tag, Ruler, Weight, ArrowLeft, Ban,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useShopCartStore } from '@/store/shopCartStore';
import ShopProductCard, { ShopProduct, ProductAttribute } from '@/components/shop/ShopProductCard';
import { getShopProduct, getShopProducts } from '@/services/shop.service';
import toast from 'react-hot-toast';

type Tab = 'description' | 'specifications' | 'details';

export default function ShopProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.slug as string;

  const [qty,    setQty]    = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [tab,    setTab]    = useState<Tab>('description');
  const [selected, setSelected] = useState<Record<string, string>>({});

  const { addItem } = useShopCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['shop-product', slug],
    queryFn: () => getShopProduct(slug),
    staleTime: 60_000,
  });

  const product: (ShopProduct & { specifications?: { key: string; value: string }[]; tags?: string[]; sku?: string; brand?: string; weight?: string; dimensions?: string }) | undefined = data?.data;

  // Init selected attributes once product loads
  const attrs: ProductAttribute[] = product?.attributes?.filter(a => a.options?.length > 0) ?? [];

  const { data: relData } = useQuery({
    queryKey: ['shop-related', product?.category?._id],
    queryFn: () => getShopProducts(`category=${product!.category!._id}&limit=5`),
    enabled: !!product?.category?._id,
    staleTime: 120_000,
  });
  const related: ShopProduct[] = relData?.data?.filter((p: ShopProduct) => p._id !== product?._id).slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Package size={48} className="text-slate-300" />
        <p className="text-slate-500">Product not found.</p>
        <button onClick={() => router.push('/shop')} className="px-4 py-2 bg-[#1B3A6B] text-white rounded-xl text-sm font-semibold">
          Back to Shop
        </button>
      </div>
    );
  }

  const images      = product.images?.length ? product.images : ['https://placehold.co/600x600?text=Product'];
  const finalPrice  = product.finalPrice ?? product.price;
  const hasDiscount = product.discountType !== 'none' && product.discountValue > 0;
  const pct         = product.discountPercent ?? (hasDiscount && product.price > 0 ? Math.round((1 - finalPrice / product.price) * 100) : 0);
  const inStock     = product.stock > 0;
  const isAvailable = product.isAvailable !== false;
  const canBuy      = inStock && isAvailable;

  const variantLabel = attrs.length > 0
    ? attrs.map(a => {
        const val = selected[a.name] ?? a.options[0]?.value;
        const opt = a.options.find(o => o.value === val);
        if (!opt) return null;
        return `${a.name}: ${opt.label}${opt.unit ? ' ' + opt.unit : ''}`;
      }).filter(Boolean).join(' · ')
    : undefined;

  const handleAddToCart = () => {
    if (!canBuy) return;
    const cartKey = variantLabel ? `${product._id}:${variantLabel}` : product._id;
    for (let i = 0; i < qty; i++) {
      addItem({
        cartKey,
        _id: product._id,
        title: product.title,
        price: finalPrice,
        image: images[0],
        ...(variantLabel ? { variant: variantLabel } : {}),
      });
    }
    toast.success(`${product.title}${variantLabel ? ` (${variantLabel})` : ''} added to cart`);
  };

  const handleAddRelatedToCart = (p: ShopProduct, sv?: string) => {
    const price   = p.finalPrice ?? p.price;
    const cartKey = sv ? `${p._id}:${sv}` : p._id;
    addItem({ cartKey, _id: p._id, title: p.title, price, image: p.images?.[0] || '', ...(sv ? { variant: sv } : {}) });
    toast.success(`${p.title} added to cart`);
  };

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${tab === t ? 'border-[#1B3A6B] text-[#1B3A6B]' : 'border-transparent text-slate-500 hover:text-slate-700'}`;

  return (
    <div className="px-5 py-5 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-5">
        <button onClick={() => router.push('/shop')} className="hover:text-[#1B3A6B] flex items-center gap-1 font-medium">
          <ArrowLeft size={12} /> Shop
        </button>
        {product.category && (
          <>
            <ChevronRight size={11} />
            <button
              onClick={() => router.push(`/shop?category=${product.category!._id}`)}
              className="hover:text-[#1B3A6B] font-medium"
            >
              {product.category.name}
            </button>
          </>
        )}
        <ChevronRight size={11} />
        <span className="text-slate-600 font-medium line-clamp-1">{product.title}</span>
      </nav>

      {/* Main product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* Image gallery */}
        <div className="space-y-3">
          <motion.div
            key={imgIdx}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className="aspect-square bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative"
          >
            {!isAvailable && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-2">
                  <Ban size={32} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-500">Currently Unavailable</span>
                </div>
              </div>
            )}
            <img src={images[imgIdx]} alt={product.title} className="w-full h-full object-contain p-4" />
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${i === imgIdx ? 'border-[#1B3A6B]' : 'border-slate-200 hover:border-slate-400'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-4">
          {product.category && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C05428] uppercase tracking-wider">
              <Tag size={11} /> {product.category.name}
            </span>
          )}

          <h1 className="text-2xl font-extrabold text-[#1B3A6B] leading-tight">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1,2,3,4].map(i => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}
              <Star size={13} className="text-amber-400 fill-amber-200" />
            </div>
            <span className="text-xs text-slate-400">4.5 · 24 reviews</span>
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

          {/* Stock / availability badge */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isAvailable ? (
              <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full font-semibold">Currently Unavailable</span>
            ) : product.stock > 10 ? (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">In Stock</span>
            ) : product.stock > 0 ? (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">Only {product.stock} left</span>
            ) : (
              <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-semibold">Out of Stock</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-slate-600 text-sm leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Attribute selectors */}
          {attrs.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 pt-3">
              {attrs.map(attr => {
                const currentVal = selected[attr.name] ?? attr.options[0]?.value;
                return (
                  <div key={attr.name}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {attr.name}
                      {currentVal && (
                        <span className="ml-2 text-[#1B3A6B] normal-case font-semibold">
                          — {attr.options.find(o => o.value === currentVal)?.label}
                          {attr.options.find(o => o.value === currentVal)?.unit ? ' ' + attr.options.find(o => o.value === currentVal)?.unit : ''}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setSelected(s => ({ ...s, [attr.name]: opt.value }))}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                            currentVal === opt.value
                              ? 'bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-sm'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
                          }`}
                        >
                          {opt.label}{opt.unit ? ` ${opt.unit}` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Qty + CTA */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-slate-50 transition-colors">
                <Minus size={14} className="text-slate-600" />
              </button>
              <span className="px-4 py-2.5 text-sm font-bold text-slate-800 border-x border-slate-200 min-w-12 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} className="px-3 py-2.5 hover:bg-slate-50 transition-colors">
                <Plus size={14} className="text-slate-600" />
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={!canBuy}
              className="flex-1 h-12 bg-[#1B3A6B] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#14305a] disabled:opacity-40 transition-colors"
            >
              <ShoppingCart size={16} />
              {canBuy ? 'Add to Cart' : (!isAvailable ? 'Unavailable' : 'Out of Stock')}
            </motion.button>

          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {product.brand      && <div className="flex items-center gap-1.5"><Package size={12} className="text-slate-400" /><span>Brand: <strong className="text-slate-700">{product.brand}</strong></span></div>}
            {product.sku        && <div><span>SKU: <strong className="text-slate-700">{product.sku}</strong></span></div>}
            {product.weight     && <div className="flex items-center gap-1.5"><Weight size={12} className="text-slate-400" /><span>Weight: <strong className="text-slate-700">{product.weight}</strong></span></div>}
            {product.dimensions && <div className="flex items-center gap-1.5"><Ruler size={12} className="text-slate-400" /><span>Dims: <strong className="text-slate-700">{product.dimensions}</strong></span></div>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex border-b border-slate-200 px-4 overflow-x-auto">
          <button className={tabCls('description')} onClick={() => setTab('description')}>Description</button>
          {(product as any).specifications?.length ? (
            <button className={tabCls('specifications')} onClick={() => setTab('specifications')}>Specifications</button>
          ) : null}
          <button className={tabCls('details')} onClick={() => setTab('details')}>Details</button>
        </div>
        <div className="p-5">
          {tab === 'description' && (
            <div className="prose prose-sm max-w-none text-slate-600">
              {(product as any).description
                ? <p className="whitespace-pre-line leading-relaxed">{(product as any).description}</p>
                : <p className="text-slate-400 italic">No description provided.</p>
              }
            </div>
          )}
          {tab === 'specifications' && (
            <div className="divide-y divide-slate-100">
              {(product as any).specifications?.map((s: { key: string; value: string }, i: number) => (
                <div key={i} className="flex py-2.5 text-sm">
                  <span className="w-36 shrink-0 text-slate-500 font-medium">{s.key}</span>
                  <span className="text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'details' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {(product as any).brand      && <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Brand</p><p className="text-slate-800 font-medium">{(product as any).brand}</p></div>}
              {(product as any).sku        && <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">SKU</p><p className="text-slate-800 font-medium">{(product as any).sku}</p></div>}
              {(product as any).weight     && <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Weight</p><p className="text-slate-800 font-medium">{(product as any).weight}</p></div>}
              {(product as any).dimensions && <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Dimensions</p><p className="text-slate-800 font-medium">{(product as any).dimensions}</p></div>}
              {(product as any).tags?.length ? <div className="col-span-2"><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Tags</p><p className="text-slate-800 font-medium">{(product as any).tags.join(', ')}</p></div> : null}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="pb-6">
          <h2 className="text-lg font-bold text-[#1B3A6B] mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map(p => (
              <ShopProductCard key={p._id} product={p} onAddToCart={handleAddRelatedToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
