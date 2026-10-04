import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from './api';
import { useStore } from './store';
import type { Product } from './types';

const fmt = (n: number) => n.toLocaleString('fa-IR') + ' تومان';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const add = useStore((s) => s.add);

  useEffect(() => { api.products().then(setProducts).catch(console.error); }, []);

  const filtered = products.filter((p) => p.name.includes(q) || p.category?.includes(q));

  return (
    <div style={{ padding: 20 }}>
      <h1>SilverSport</h1>
      <input placeholder="جستجو..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginTop: 20 }}>
        {filtered.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
            <Link to={`/product/${p.id}`}><h3>{p.name}</h3></Link>
            <p>{fmt(p.price)}</p>
            <button onClick={() => add(p)}>افزودن به سبد</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const add = useStore((s) => s.add);

  useEffect(() => { if (id) api.product(+id).then(setP); }, [id]);
  if (!p) return <p>در حال بارگذاری...</p>;

  return (
    <div style={{ padding: 20 }}>
      <Link to="/">← بازگشت</Link>
      <h1>{p.name}</h1>
      <p>{p.description}</p>
      <p>{fmt(p.price)}</p>
      <button onClick={() => add(p)}>افزودن به سبد</button>
    </div>
  );
}

export function Cart() {
  const { cart, remove, clear, user } = useStore();
  const nav = useNavigate();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const checkout = async () => {
    if (!user) return nav('/login');
    await api.order(user.user_id, cart);
    clear();
    alert('سفارش ثبت شد ✅');
    nav('/');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>سبد خرید</h1>
      {cart.length === 0 && <p>سبد خالیه</p>}
      {cart.map((i) => (
        <div key={i.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>{i.name} × {i.quantity}</span>
          <span>{fmt(i.price * i.quantity)}</span>
          <button onClick={() => remove(i.id)}>حذف</button>
        </div>
      ))}
      {cart.length > 0 && <>
        <h3>جمع: {fmt(total)}</h3>
        <button onClick={checkout}>تسویه حساب</button>
      </>}
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const setUser = useStore((s) => s.setUser);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const u = mode === 'login'
        ? await api.login(email, password)
        : await api.register(email, password, name);
      setUser(u);
      nav('/');
    } catch { alert('خطا در ورود/ثبت‌نام'); }
  };

  return (
    <form onSubmit={submit} style={{ padding: 20, maxWidth: 300 }}>
      <h1>{mode === 'login' ? 'ورود' : 'ثبت‌نام'}</h1>
      {mode === 'register' && (
        <input placeholder="نام" value={name} onChange={(e) => setName(e.target.value)} />
      )}
      <input placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="رمز" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">{mode === 'login' ? 'ورود' : 'ثبت‌نام'}</button>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'حساب نداری؟ ثبت‌نام' : 'حساب داری؟ ورود'}
      </button>
    </form>
  );
        }
