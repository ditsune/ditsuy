-- ============================================================
-- 002_add_opening_balance.sql
-- TAMBAH KOLOM OPENING_BALANCE + UPDATE VIEW
-- AMAN DIJALANKAN BERKALI-KALI
-- ============================================================

-- 1. TAMBAH KOLOM (AMAN)
alter table accounts add column if not exists opening_balance numeric not null default 0;

-- 2. UPDATE VIEW (AMAN)
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

-- 3. GRANT ULANG (KARENA VIEW DI-DROP)
grant select on account_balances to authenticated, anon, service_role;

-- 4. VERIFIKASI
select '✅ OPENING_BALANCE ADDED!' as status;
select column_name, data_type from information_schema.columns
where table_name = 'accounts' and column_name = 'opening_balance';