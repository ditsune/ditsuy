import { createClient } from '@/lib/supabase/client';
import type { Category, Account, Transaction } from '@/lib/types';

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data as Category[];
}

export async function getAccounts(): Promise<Account[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('account_balances')
    .select('account_id, name, icon, ramp, type, goal, opening_balance, balance');
  if (error) throw error;
  return (data || []).map((a: any) => ({
    id: a.account_id, name: a.name, icon: a.icon, ramp: a.ramp,
    type: a.type, goal: Number(a.goal),
    opening_balance: Number(a.opening_balance), balance: Number(a.balance),
  }));
}

export async function updateAccountOpeningBalance(accountId: string, openingBalance: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from('accounts')
    .update({ opening_balance: openingBalance })
    .eq('id', accountId);
  if (error) throw error;
}

export async function updateAccountGoal(accountId: string, goal: number) {
  const supabase = createClient();
  const { error } = await supabase.from('accounts').update({ goal }).eq('id', accountId);
  if (error) throw error;
}

// Range bulan (monthStart/monthEnd, format 'YYYY-MM-DD') dihitung di client
// dari waktu lokal device — lihat lib/date.ts. Query ini gak pernah lagi
// nanya "sekarang bulan berapa" ke server (yang defaultnya UTC).
export async function getTransactions(monthStart: string, monthEnd: string): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, type, category_id, account_id, tx_date, note')
    .gte('tx_date', monthStart)
    .lte('tx_date', monthEnd)
    .order('tx_date', { ascending: false });
  if (error) throw error;
  return (data || []).map((t: any) => ({ ...t, amount: Number(t.amount) }));
}

export async function createTransaction(tx: Omit<Transaction, 'id'>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const txData = {
    ...tx,
    user_id: user.id,
    tx_date: tx.tx_date || new Date().toISOString().split('T')[0],
  };

  const { error } = await supabase.from('transactions').insert(txData);
  if (error) throw error;
}

export async function createAccount(acc: {
  name: string; icon: string; ramp: string; type: 'cash' | 'savings' | 'debt';
  opening_balance: number; goal: number;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('accounts').insert({ ...acc, user_id: user.id });
  if (error) throw error;
}

// Hapus akun itu ngehapus SEMUA transaksinya juga (FK on delete cascade
// di DB) — jadi kita cek dulu di sini biar user gak kehilangan histori
// transaksi tanpa sadar. Gak ada cara "soft delete" tanpa migrasi FK,
// jadi guard ini yang paling aman buat sekarang.
export async function deleteAccount(accountId: string) {
  const supabase = createClient();
  const { count, error: countError } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId);
  if (countError) throw countError;
  if (count && count > 0) {
    throw new Error(
      `Akun ini masih punya ${count} transaksi. Pindahin atau hapus transaksinya dulu sebelum hapus akun.`
    );
  }
  const { error } = await supabase.from('accounts').delete().eq('id', accountId);
  if (error) throw error;
}

export async function updateTransaction(id: string, tx: Partial<Omit<Transaction, 'id'>>) {
  const supabase = createClient();
  const { error } = await supabase.from('transactions').update(tx).eq('id', id);
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}
