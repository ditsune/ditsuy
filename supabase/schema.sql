-- ============================================================
-- DITSUY — schema.sql
-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- Extension buat generate UUID
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- CATEGORIES (global, dipakai bersama semua user)
-- ------------------------------------------------------------
create table if not exists categories (
  id text primary key,
  name text not null,
  icon text not null,
  ramp text not null,
  type text not null check (type in ('exp','inc','both'))
);

alter table categories add column if not exists sort_order int not null default 999;

insert into categories (id, name, icon, ramp, type, sort_order) values
  ('gaji','Gaji','ti-cash','green','inc',1),
  ('freelance','Cuan Sampingan','ti-briefcase','green','inc',2),
  ('uangjajan','Uang Jajan','ti-gift-card','green','inc',3),
  ('makan','Makan & Jajan','ti-basket','coral','exp',4),
  ('ngopi','Ngopi & Boba','ti-bubble-tea','coral','exp',5),
  ('ojol','Transportasi & Ojol','ti-bus','amber','exp',6),
  ('kos','Kos & Sewa','ti-home','pink','exp',7),
  ('tagihan','Tagihan','ti-flame','amber','exp',8),
  ('cicilan','Cicilan','ti-credit-card','green','exp',9),
  ('nongkrong','Nongkrong','ti-glass-cocktail','purple','exp',10),
  ('streaming','Streaming','ti-device-tv','purple','exp',11),
  ('musik','Musik & Langganan','ti-brand-spotify','green','exp',12),
  ('fashion','Fashion','ti-hanger','pink','exp',13),
  ('skincare','Skincare & Glow Up','ti-flower','teal','exp',14),
  ('selfreward','Self Reward','ti-heart','pink','exp',15),
  ('healing','Healing & Liburan','ti-beach','blue','exp',16),
  ('hewan','Peliharaan','ti-dog','amber','exp',17),
  ('hadiah','Hadiah','ti-gift','purple','both',18),
  ('nabung','Nabung & Investasi','ti-chart-line','green','both',19),
  ('lainnya','Lainnya','ti-dots','pink','both',20)
on conflict (id) do update set
  name = excluded.name, icon = excluded.icon, ramp = excluded.ramp,
  type = excluded.type, sort_order = excluded.sort_order;
-- ------------------------------------------------------------
-- ACCOUNTS (per user — dompet/rekening/tabungan/utang)
-- ------------------------------------------------------------
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'ti-wallet',
  ramp text not null default 'pink',
  type text not null check (type in ('cash','savings','debt')),
  goal numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table accounts enable row level security;

create policy "accounts_select_own" on accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on accounts for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on accounts for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- TRANSACTIONS (per user)
-- ------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0),
  type text not null check (type in ('exp','inc')),
  category_id text not null references categories(id),
  account_id uuid not null references accounts(id) on delete cascade,
  tx_date date not null,
  note text default '',
  created_at timestamptz not null default now()
);

alter table transactions enable row level security;

create policy "tx_select_own" on transactions for select using (auth.uid() = user_id);
create policy "tx_insert_own" on transactions for insert with check (auth.uid() = user_id);
create policy "tx_update_own" on transactions for update using (auth.uid() = user_id);
create policy "tx_delete_own" on transactions for delete using (auth.uid() = user_id);

create index if not exists tx_user_date_idx on transactions (user_id, tx_date desc);

-- categories readable by any authenticated user (shared reference data)
alter table categories enable row level security;
create policy "categories_select_all" on categories for select using (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- Auto-provision default accounts saat user baru signup
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.accounts (user_id, name, icon, ramp, type, goal) values
    (new.id, 'Uang tunai', 'ti-wallet', 'coral', 'cash', 0),
    (new.id, 'Tabungan', 'ti-building-bank', 'blue', 'savings', 0),
    (new.id, 'Kartu kredit', 'ti-credit-card', 'green', 'debt', 0);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- View: saldo per akun dihitung real-time dari transaksi
-- ------------------------------------------------------------
create or replace view account_balances
with (security_invoker = true) as
select
  a.id as account_id,
  a.user_id,
  a.name,
  a.icon,
  a.ramp,
  a.type,
  a.goal,
  coalesce(sum(case when t.type = 'inc' then t.amount else -t.amount end), 0) as balance
from accounts a
left join transactions t on t.account_id = a.id
group by a.id;
