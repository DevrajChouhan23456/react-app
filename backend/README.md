# Python FastAPI Backend Setup

This backend powers the **Dal Bafla React Native app**.

## Features
- Menu API (Supabase or in-memory)
- Orders API (Supabase or in-memory)
- Razorpay payment create/verify
- Supabase JWT verify
- Sales analytics (from Supabase or memory)
- MSG91 owner notifications
- Auto API docs via FastAPI

## 1. Create Python environment

```bash
cd backend
python -m venv .venv
```

### Windows
```bash
.venv\Scripts\activate
```

### macOS / Linux
```bash
source .venv/bin/activate
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Add environment variables

```bash
cp .env.example .env
```

Fill these values in `.env`:
- `SUPABASE_URL` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (keep secret)
- `SUPABASE_JWT_SECRET` — from Supabase JWT settings
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
- `MSG91_AUTH_KEY` / `OWNER_PHONE`

## 4. Create Supabase tables

Run this SQL inside **Supabase SQL editor**:

```sql
-- Menu items
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  image text,
  category text default 'General',
  available boolean default true,
  sort_order integer default 100,
  inserted_at timestamptz default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_order_id text unique,
  user_id text not null,
  address text not null,
  payment_method text not null,
  notes text,
  status text not null default 'placed',
  total_amount numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  item_id text,
  name text,
  quantity integer not null,
  price numeric(10,2) not null
);

alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Simple RLS policies for testing (you can tighten later)
create policy "Public read menu" on public.menu_items
  for select using (true);

create policy "Insert orders" on public.orders
  for insert with check (true);

create policy "Read own orders" on public.orders
  for select using (true);

create policy "Insert order_items" on public.order_items
  for insert with check (true);

create policy "Read order_items" on public.order_items
  for select using (true);
```

## 5. Run the server

```bash
uvicorn main:app --reload --port 3001
```

## 6. Open API docs

```bash
http://localhost:3001/docs
```

## Main routes
- `GET /api/menu/`
- `POST /api/menu/`
- `POST /api/orders/`
- `GET /api/orders/`
- `GET /api/orders/{order_id}`
- `POST /api/payments/create`
- `POST /api/payments/verify`
- `GET /api/auth/verify?token=...`
- `GET /api/analytics/sales-summary`

## Notes
- If Supabase is **not** configured, menu and orders use in-memory mock storage.
- As soon as Supabase env vars + tables are set, APIs automatically use real database.
- Razorpay returns mock response until keys are configured.
- MSG91 notification only sends after auth key + owner phone are set.
