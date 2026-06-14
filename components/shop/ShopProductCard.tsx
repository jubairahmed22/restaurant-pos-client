'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star } from 'lucide-react';

export interface AttributeOption {
  label: string;
  value: string;
  unit?: string;
}

export interface ProductAttribute {
  name: string;
  options: AttributeOption[];
}

export interface ShopProduct {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  category?: { _id: string; name: string };
  images: string[];
  price: number;
  comparePrice?: number;
  finalPrice: number;
  discountType: 'none' | 'fixed' | 'percentage';
  discountValue: number;
  discountPercent?: number;
  isFeatured: boolean;
  isActive: boolean;
  isAvailable?: boolean;
  stock: number;
  attributes?: ProductAttribute[];
}

interface Props {
  product: ShopProduct;
  onAddToCart: (product: ShopProduct, selectedVariant?: string) => void;
}

export default function ShopProductCard({ product, onAddToCart }: Props) {
  const router      = useRouter();
  const image       = product.images?.[0] || 'https://placehold.co/600x600?text=Product';
  const finalPrice  = product.finalPrice ?? product.price;
  const hasDiscount = product.discountType !== 'none' && product.discountValue > 0;
  const pct         = product.discountPercent ?? (hasDiscount && product.price > 0 ? Math.round((1 - finalPrice / product.price) * 100) : 0);
  const isAvailable = product.isAvailable !== false;
  const outOfStock  = product.stock === 0;
  const unavailable = !isAvailable || outOfStock;

  const attrs = product.attributes?.filter(a => a.options?.length > 0) ?? [];
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    attrs.forEach(a => { if (a.options?.[0]) init[a.name] = a.options[0].value; });
    return init;
  });

  const variantLabel = attrs.length > 0
    ? attrs.map(a => {
        const opt = a.options.find(o => o.value === (selected[a.name] ?? a.options[0]?.value));
        return opt ? `${a.name}: ${opt.label}${opt.unit ? ' ' + opt.unit : ''}` : null;
      }).filter(Boolean).join(' · ')
    : undefined;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unavailable) return;
    onAddToCart(product, variantLabel);
  };

  return (
    <div
      className="group cursor-pointer bg-white"
      onClick={() => router.push(`/shop/${product.slug}`)}
    >
      {/* ── Image block ──────────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${unavailable ? 'opacity-50' : ''}`}
        />

        {/* Top-left stacked badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.category && (
            <span className="bg-[#1B3A6B] text-white text-[9px] font-black px-2.5 py-1 uppercase tracking-[0.12em]">
              {product.category.name}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-[#C05428] text-white text-[9px] font-black px-2.5 py-1 uppercase tracking-[0.12em]">
              ★ Featured
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-1 uppercase tracking-[0.12em]">
              -{pct}% Off
            </span>
          )}
        </div>

        {/* Unavailable overlay label */}
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider">
              {!isAvailable ? 'Unavailable' : 'Out of Stock'}
            </span>
          </div>
        )}

        {/* Attribute selector chips (if product has attrs) */}
        {attrs.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
            {attrs[0].options.map(opt => (
              <button
                key={opt.value}
                onClick={e => { e.stopPropagation(); setSelected(s => ({ ...s, [attrs[0].name]: opt.value })); }}
                className={`text-[9px] font-black px-2 py-0.5 uppercase tracking-wide transition-all ${
                  (selected[attrs[0].name] ?? attrs[0].options[0]?.value) === opt.value
                    ? 'bg-[#1B3A6B] text-white'
                    : 'bg-white/90 text-slate-800 hover:bg-white'
                }`}
              >
                {opt.label}{opt.unit ? ` ${opt.unit}` : ''}
              </button>
            ))}
          </div>
        )}

        {/* Hover: Add to cart bar */}
        {!unavailable && (
          <button
            onClick={handleAdd}
            className="absolute bottom-0 left-0 right-0 py-2.5 bg-[#1B3A6B] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200"
          >
            <ShoppingCart size={12} />
            Add to Cart
          </button>
        )}
      </div>

      {/* ── Text block ───────────────────────────────────────────────────── */}
      <div className="pt-3 pb-2 px-0.5">
        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {[1,2,3,4].map(i => <Star key={i} size={9} className="text-amber-400 fill-amber-400" />)}
          <Star size={9} className="text-amber-400 fill-amber-200" />
          <span className="text-[9px] text-slate-400 ml-1">4.5</span>
        </div>

        <h3 className="text-[11px] font-black uppercase tracking-wide text-slate-900 line-clamp-2 leading-tight mb-1">
          {product.title}
        </h3>

        {product.shortDescription && (
          <p className="text-[11px] text-slate-500 line-clamp-1 mb-1.5">{product.shortDescription}</p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-slate-900">AUD {finalPrice.toFixed(2)}</span>
          {hasDiscount && product.price !== finalPrice && (
            <span className="text-[11px] text-slate-400 line-through">AUD {product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
