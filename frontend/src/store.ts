import { create } from 'zustand';
import type { CartItem, Product, User } from './types';

type Store = {
  cart: CartItem[];
  user: User | null;
  add: (p: Product) => void;
  remove: (id: number) => void;
  clear: () => void;
  setUser: (u: User | null) => void;
};

export const useStore = create<Store>((set) => ({
  cart: [],
  user: null,
  add: (p) => set((s) => {
    const found = s.cart.find((i) => i.id === p.id);
    return {
      cart: found
        ? s.cart.map((i) => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...s.cart, { ...p, quantity: 1 }],
    };
  }),
  remove: (id) => set((s) => ({ cart: s.cart.filter((i) => i.id !== id) })),
  clear: () => set({ cart: [] }),
  setUser: (u) => set({ user: u }),
}));
