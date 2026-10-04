import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Cart, Home, Login, ProductPage } from './pages';
import { useStore } from './store';

export default function App() {
  const { cart, user, setUser } = useStore();
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: '1px solid #ccc', display: 'flex', gap: 12 }}>
        <Link to="/">SilverSport</Link>
        <Link to="/cart">سبد ({cart.length})</Link>
        {user
          ? <><span>👤 {user.name}</span><button onClick={() => setUser(null)}>خروج</button></>
          : <Link to="/login">ورود</Link>}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
          }
