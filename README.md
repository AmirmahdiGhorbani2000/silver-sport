# SilverSport

فروشگاه لوازم ورزشی. React + TypeScript + Axum + PostgreSQL.

## تکنولوژی ها
- **Frontend:** React 18, Vite, React Router, Zustand
- **Backend:** Rust, Axum 0.7, Tokio, SQLx
- **DB:** PostgreSQL

## ساختار
```

backend/   → src/main.rs, schema.sql, Cargo.toml
frontend/  → src/{main,App,api,store,types,pages}.tsx

```

## دیتابیس
```sql
users    (id, email UNIQUE, password, name)
products (id, name, description, price, stock, category, image_url)
orders   (id, user_id, items JSONB, total, created_at)
```

## API

| Method | Path | Body |
|---|---|---|
| GET | /products | — |
| GET | /products/:id | — |
| POST | /products | {name, price, stock, ...} |
| DELETE | /products/:id | — |
| POST | /auth/register | {email, password, name?} |
| POST | /auth/login | {email, password} |
| POST | /orders | {user_id, items[], total} |

## استفاده

```bash
createdb silversport
psql silversport -f backend/schema.sql

cd backend && DATABASE_URL=postgres://postgres:postgres@localhost/silversport cargo run
cd frontend && npm install && npm run dev
```
Backend روی :3000، frontend روی :5173 (proxy /api).

## لایسنس
GNU General Public License v3.0 

## حمایت
اگه این پروژه رو دوست داشتید لطفا ستاره بدید!
