import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CartItem } from '@/shared/schema';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

interface CartState {
  items: (CartItem & { product?: any })[];
  addItem: (item: CartItem & { product?: any }) => void;
  updateItem: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: 'agrisem-auth',
    }
  )
);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId);
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, qty: i.qty + item.qty }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      updateItem: (id, qty) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, qty } : i),
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
      })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
          const price = item.product?.priceCents || 0;
          return sum + (price * item.qty);
        }, 0);
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },
    }),
    {
      name: 'agrisem-cart',
    }
  )
);
