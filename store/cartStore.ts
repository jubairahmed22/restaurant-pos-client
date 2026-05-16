import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  foodId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotals: () => { subtotal: number; delivery: number; total: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(i => i.foodId === newItem.foodId);
        if (existingItem) {
          set({
            items: currentItems.map(i =>
              i.foodId === newItem.foodId ? { ...i, quantity: i.quantity + newItem.quantity } : i
            )
          });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },
      removeItem: (foodId) => set({ items: get().items.filter(i => i.foodId !== foodId) }),
      updateQuantity: (foodId, quantity) => {
        if (quantity <= 0) return;
        set({ items: get().items.map(i => i.foodId === foodId ? { ...i, quantity } : i) });
      },
      clearCart: () => set({ items: [] }),
      getCartTotals: () => {
        const subtotal = get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const delivery = subtotal > 0 ? 5 : 0;
        return { subtotal, delivery, total: subtotal + delivery };
      }
    }),
    { name: 'restaurant-cart-storage' }
  )
);