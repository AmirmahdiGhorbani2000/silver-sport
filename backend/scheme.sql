CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO products (name, description, price, stock, category, image_url) VALUES
('دمبل ۱۰ کیلویی', 'دمبل روکش لاستیکی', 850000, 20, 'بدنسازی', ''),
('توپ فوتبال', 'توپ سایز ۵', 450000, 15, 'فوتبال', ''),
('طناب ورزشی', 'طناب حرفه‌ای', 120000, 50, 'فیتنس', '');
