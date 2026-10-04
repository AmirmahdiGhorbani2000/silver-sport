import type { CartItem, Product, User } from './types';

const BASE = '/api';
const j = (r: Response) => { if (!r.ok) throw new Error(r.statusText); return r.json(); };

export const api = {
  products: (): Promise<Product[]> => fetch(`${BASE}/products`).then(j),
  product: (id: number): Promise<Product> => fetch(`${BASE}/products/${id}`).then(j),
  register: (email: string, password: string, name: string): Promise<User> =>
    fetch(`${BASE}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    }).then(j),
  login: (email: string, password: string): Promise<User> =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(j),
  order: (user_id: number, items: CartItem[]) =>
    fetch(`${BASE}/orders`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id, items,
        total: items.reduce((s, i) => s + i.price * i.quantity, 0),
      }),
    }),
};
