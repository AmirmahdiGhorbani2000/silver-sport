export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
};

export type CartItem = Product & { quantity: number };
export type User = { user_id: number; name?: string };
