'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, Ban } from 'lucide-react';

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
  const router = useRouter();
  const image = product.images?.[0] || 'https://placehold.co/400x400?text=Product';
  const finalPrice = product.finalPrice ?? product.price;
  const hasDiscount = product.discountType !== 'none' && product.discountValue > 0;
  const pct = product.discountPercent ?? (hasDiscount && product.price > 0 ? Math.round((1 - finalPrice / product.price) * 100) : 0);
  const isAvailable = product.isAvailable !== false;
  const outOfStock = product.stock === 0;
  const unavailable = !isAvailable || outOfStock;

  const attrs = product.attributes?.filter(a => a.options?.length > 0) ?? [];

  // Track one selected option per attribute
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    attrs.forEach(a => { if (a.options?.[0]) init[a.name] = a.options[0].value; });
    return init;
  });

  const variantLabel = attrs.length > 0
    ? attrs.map(a => {
        const opt = a.options.find(o => o.value === selected[a.name]);
        if (!opt) return null;
        return `${a.name}: ${opt.label}${opt.unit ? ' ' + opt.unit : ''}`;
      }).filter(Boolean).join(' · ')
    : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unavailable) return;
    onAddToCart(product, variantLabel);
  };

  return (
    <div
      className="relative bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1B3A6B]/10 flex flex-col"
      onClick={() => router.push(`/shop/${product.slug}`)}
    >
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wide shadow">
          -{pct}%
        </div>
      )}

      {/* Featured badge */}
      {product.isFeatured && (
        <div className="absolute top-2.5 right-2.5 z-10 bg-amber-400 text-white p-1.5 rounded-full shadow">
          <Star size={10} fill="white" />
        </div>
      )}

      {/* Unavailable overlay */}
      {unavailable && (
        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl pointer-events-none">
          <div className="flex flex-col items-center gap-1">
            <Ban size={28} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500">
              {!isAvailable ? 'Unavailable' : 'Out of Stock'}
            </span>
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 shrink-0">
        <img
          src={image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Hover overlay button */}
        {!unavailable && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 bg-[#1B3A6B] text-white text-[11px] font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-lg"
          >
            <ShoppingCart size={12} />
            Add to Cart
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {product.category && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#C05428] mb-0.5">{product.category.name}</p>
        )}
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight mb-1.5 flex-1">{product.title}</h3>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-2">
          {[1,2,3,4].map(i => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}
          <Star size={10} className="text-amber-400 fill-amber-200" />
          <span className="text-[10px] text-slate-400 ml-1">4.5 (24)</span>
        </div>

        {/* Attribute selectors */}
        {attrs.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {attrs.map(attr => (
              <div key={attr.name}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{attr.name}</p>
                <div className="flex flex-wrap gap-1">
                  {attr.options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={e => { e.stopPropagation(); setSelected(s => ({ ...s, [attr.name]: opt.value })); }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                        selected[attr.name] === opt.value
                          ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#1B3A6B]'
                      }`}
                    >
                      {opt.label}{opt.unit ? ` ${opt.unit}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="font-extrabold text-[#1B3A6B] text-base">AUD {finalPrice.toFixed(2)}</span>
          {hasDiscount && product.price !== finalPrice && (
            <span className="text-xs text-slate-400 line-through">AUD {product.price.toFixed(2)}</span>
          )}
        </div>

        {/* Mobile add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={unavailable}
          className="w-full flex items-center justify-center gap-2 py-2 bg-[#1B3A6B] text-white text-xs font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-[#14305a] active:scale-95"
        >
          <ShoppingCart size={13} />
          {unavailable ? (!isAvailable ? 'Unavailable' : 'Out of Stock') : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
