-- ============================================================
-- 001_initial_schema.sql
-- JALANKAN 1X SAJA SAAT PERTAMA KALI SETUP
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

-- 3. ACCOUNTS
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

-- 6. VIEW ACCOUNT BALANCES
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

-- 7. RLS POLICIES
-- ACCOUNTS
alter table accounts enable row level security;
drop policy if exists "accounts_select_own" on accounts;
drop policy if exists "accounts_insert_own" on accounts;
drop policy if exists "accounts_update_own" on accounts;
drop policy if exists "accounts_delete_own" on accounts;

create policy "accounts_select_own" on accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on accounts for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on accounts for delete using (auth.uid() = user_id);

-- TRANSACTIONS
alter table transactions enable row level security;
drop policy if exists "tx_select_own" on transactions;
drop policy if exists "tx_insert_own" on transactions;
drop policy if exists "tx_update_own" on transactions;
drop policy if exists "tx_delete_own" on transactions;

create policy "tx_select_own" on transactions for select using (auth.uid() = user_id);
create policy "tx_insert_own" on transactions for insert with check (auth.uid() = user_id);
create policy "tx_update_own" on transactions for update using (auth.uid() = user_id);
create policy "tx_delete_own" on transactions for delete using (auth.uid() = user_id);

-- CATEGORIES
alter table categories enable row level security;
drop policy if exists "categories_select_all" on categories;
create policy "categories_select_all" on categories for select using (auth.role() = 'authenticated');

-- 8. AUTO-PROVISION ACCOUNTS
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

-- 9. GRANT PERMISSIONS
grant usage on schema public to public, authenticated, anon, service_role;
grant all on categories to authenticated, anon, service_role;
grant all on accounts to authenticated, anon, service_role;
grant all on transactions to authenticated, anon, service_role;
grant select on account_balances to authenticated, anon, service_role;

-- 10. BACKFILL (buat user lama)
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

-- 11. VERIFIKASI
select '✅ INITIAL SCHEMA READY!' as status;