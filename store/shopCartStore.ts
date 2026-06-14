import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShopCartItem {
  cartKey: string;   // _id for no variant, `${_id}:${variant}` for variant items
  _id: string;
  title: string;
  price: number;
  image: string;
  variant?: string;  // human-readable, e.g. "Size: Large"
  qty: number;
}

interface ShopCartState {
  items: ShopCartItem[];
  addItem: (item: Omit<ShopCartItem, 'qty'>) => void;
  increaseQty: (cartKey: string) => void;
  decreaseQty: (cartKey: string) => void;
  removeItem: (cartKey: string) => void;
  clearCart: () => void;
  get itemCount(): number;
  get subtotal(): number;
}

export const useShopCartStore = create<ShopCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.cartKey === item.cartKey);
          if (existing) {
            return { items: s.items.map((i) => i.cartKey === item.cartKey ? { ...i, qty: i.qty + 1 } : i) };
          }
          return { items: [...s.items, { ...item, qty: 1 }] };
        }),

      increaseQty: (cartKey) =>
        set((s) => ({ items: s.items.map((i) => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i) })),

      decreaseQty: (cartKey) =>
        set((s) => ({
          items: s.items
            .map((i) => i.cartKey === cartKey ? { ...i, qty: i.qty - 1 } : i)
            .filter((i) => i.qty > 0),
        })),

      removeItem: (cartKey) =>
        set((s) => ({ items: s.items.filter((i) => i.cartKey !== cartKey) })),

      clearCart: () => set({ items: [] }),

      get itemCount() { return get().items.reduce((s, i) => s + i.qty, 0); },
      get subtotal()  { return get().items.reduce((s, i) => s + i.price * i.qty, 0); },
    }),
    { name: 'shop-item' }
  )
);
