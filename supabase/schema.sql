-- ============================================================
-- schema.sql
-- GABUNGAN SEMUA MIGRASI (AMAN - IDEMPOTENT)
-- ============================================================

-- 1. EXTENSION
create extension if not exists "pgcrypto";

-- 2. CATEGORIES
create table if not exists categories (
  id text primary key,
  name text not null,
  icon text not null,
  ramp text not null,
  type text not null check (type in ('exp','inc','both')),
  sort_order int not null default 999
);

-- 3. ACCOUNTS (dengan opening_balance)
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'ti-wallet',
  ramp text not null default 'pink',
  type text not null check (type in ('cash','savings','debt')),
  goal numeric not null default 0,
  opening_balance numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table accounts add column if not exists opening_balance numeric not null default 0;

-- 4. TRANSACTIONS
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

-- 5. INDEXES
create index if not exists tx_user_date_idx on transactions (user_id, tx_date desc);

-- 6. CATEGORIES SEED (AMAN)
insert into categories (id, name, icon, ramp, type, sort_order) values
  ('gaji','Gaji','ti-cash','green','inc',1),
  ('freelance','Cuan Sampingan','ti-briefcase','green','inc',2),
  ('uangjajan','Uang Jajan','ti-gift-card','green','inc',3),
  ('investasi','Hasil Investasi','ti-chart-line','green','inc',4),
  ('makan','Makan','ti-basket','coral','exp',10),
  ('jajan','Jajan','ti-cup','coral','exp',11),
  ('bahanmakanan','Bahan Makanan','ti-shopping-cart','coral','exp',12),
  ('ojol','Transportasi & Ojol','ti-bus','amber','exp',13),
  ('bensin','Bensin & Parkir','ti-gas-station','amber','exp',14),
  ('kos','Kos & Sewa','ti-home','pink','exp',15),
  ('tagihan','Listrik & Air','ti-flame','amber','exp',16),
  ('internet','Internet','ti-wifi','amber','exp',17),
  ('langganan','Langganan Apps','ti-device-tv','purple','exp',18),
  ('cicilan','Cicilan & Pinjol','ti-credit-card','green','exp',19),
  ('nongkrong','Nongkrong & Hangout','ti-glass-cocktail','purple','exp',20),
  ('fashion','Fashion & Style','ti-hanger','pink','exp',21),
  ('skincare','Skincare & Glow Up','ti-flower','teal','exp',22),
  ('selfreward','Self Reward','ti-heart','pink','exp',23),
  ('healing','Healing & Liburan','ti-beach','blue','exp',24),
  ('hewan','Peliharaan','ti-dog','amber','exp',25),
  ('orangtua','Kirim ke Ortu','ti-heart-handshake','blue','exp',26),
  ('hadiah','Hadiah & Kado','ti-gift','purple','both',27),
  ('lainnya','Lainnya','ti-dots','pink','both',999)
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  ramp = excluded.ramp,
  type = excluded.type,
  sort_order = excluded.sort_order;

-- 7. VIEW ACCOUNT BALANCES
drop view if exists account_balances;

create view account_balances
with (security_invoker = true) as
select
  a.id as account_id,
  a.user_id,
  a.name,
  a.icon,
  a.ramp,
  a.type,
  a.goal,
  a.opening_balance,
  a.opening_balance + coalesce(sum(case when t.type = 'inc' then t.amount else -t.amount end), 0) as balance
from accounts a
left join transactions t on t.account_id = a.id
group by a.id;

-- 8. RLS POLICIES
alter table accounts enable row level security;
drop policy if exists "accounts_select_own" on accounts;
drop policy if exists "accounts_insert_own" on accounts;
drop policy if exists "accounts_update_own" on accounts;
drop policy if exists "accounts_delete_own" on accounts;

create policy "accounts_select_own" on accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on accounts for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on accounts for delete using (auth.uid() = user_id);

alter table transactions enable row level security;
drop policy if exists "tx_select_own" on transactions;
drop policy if exists "tx_insert_own" on transactions;
drop policy if exists "tx_update_own" on transactions;
drop policy if exists "tx_delete_own" on transactions;

create policy "tx_select_own" on transactions for select using (auth.uid() = user_id);
create policy "tx_insert_own" on transactions for insert with check (auth.uid() = user_id);
create policy "tx_update_own" on transactions for update using (auth.uid() = user_id);
create policy "tx_delete_own" on transactions for delete using (auth.uid() = user_id);

alter table categories enable row level security;
drop policy if exists "categories_select_all" on categories;
create policy "categories_select_all" on categories for select using (auth.role() = 'authenticated');

-- 9. AUTO-PROVISION ACCOUNTS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.accounts (user_id, name, icon, ramp, type, goal) values
    (new.id, 'Dompet Digital', 'ti-wallet', 'coral', 'cash', 0),
    (new.id, 'Tabungan', 'ti-building-bank', 'blue', 'savings', 0),
    (new.id, 'Kartu Kredit', 'ti-credit-card', 'green', 'debt', 0);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. GRANT PERMISSIONS
grant usage on schema public to public, authenticated, anon, service_role;
grant all on categories to authenticated, anon, service_role;
grant all on accounts to authenticated, anon, service_role;
grant all on transactions to authenticated, anon, service_role;
grant select on account_balances to authenticated, anon, service_role;

-- 11. BACKFILL
insert into public.accounts (user_id, name, icon, ramp, type, goal)
select u.id, 'Dompet Digital', 'ti-wallet', 'coral', 'cash', 0
from auth.users u
where not exists (select 1 from public.accounts a where a.user_id = u.id)
union all
select u.id, 'Tabungan', 'ti-building-bank', 'blue', 'savings', 0
from auth.users u
where not exists (select 1 from public.accounts a where a.user_id = u.id)
union all
select u.id, 'Kartu Kredit', 'ti-credit-card', 'green', 'debt', 0
from auth.users u
where not exists (select 1 from public.accounts a where a.user_id = u.id);

-- 12. VERIFIKASI
select '✅ DATABASE READY!' as status;
select count(*) as total_categories from categories;
select count(*) as total_accounts from accounts;
select count(*) as total_transactions from transactions;
-- ============================================================
-- 13. CLEANUP — function nganggur, gak dipake app lagi
-- (aman, cuma drop function, GAK nyentuh tabel/data)
-- ============================================================
drop function if exists get_server_time();
drop function if exists get_month_start();
drop function if exists get_month_end();

-- ============================================================
-- 14. PERFORMANCE — index buat account_balances view
-- ============================================================
-- account_balances (dipanggil tiap load Beranda/Akun) nge-JOIN +
-- SUM semua transaksi per akun, dari histori penuh (bukan cuma
-- sebulan). Tanpa index di account_id, ini bakal sequential scan
-- ke seluruh tabel transactions tiap kali halaman dibuka — makin
-- lama makin berat seiring histori numpuk. Index ini bikin Postgres
-- bisa index-only scan buat agregasinya.
create index if not exists tx_account_idx on transactions (account_id);

select '✅ CLEANUP & INDEX READY!' as status;

-- ============================================================
-- 15. REVERT — kategori custom per-user (DIBATALKAN)
-- ============================================================
-- Section ini dulu nambahin fitur kategori custom, tapi dicabut lagi
-- (value rendah, butuh UI manage yang belum digarap). Kalau kamu SUDAH
-- sempet run migration "KATEGORI CUSTOM PER-USER" sebelumnya, jalanin
-- blok di bawah buat balikin ke state semula — aman, cuma mundurin
-- policy & kolom, TIDAK ngapus baris kategori bawaan.
-- Kalau kamu BELUM pernah run migration itu, blok ini no-op (aman
-- dijalanin juga, drop policy/column if-exists semua).
drop policy if exists "categories_insert_own" on categories;
drop policy if exists "categories_delete_own" on categories;

drop policy if exists "categories_select_all" on categories;
create policy "categories_select_all" on categories
  for select using (auth.role() = 'authenticated');

alter table categories drop column if exists user_id;

select '✅ REVERTED — kategori custom dicabut' as status;
