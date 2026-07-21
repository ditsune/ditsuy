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

// ✅ FIX: Pake server time via RPC
export async function getTransactions(): Promise<Transaction[]> {
  const supabase = createClient();
  
  // Ambil tanggal bulan ini dari server
  const { data: monthStart } = await supabase
    .rpc('get_month_start');
  
  const { data: monthEnd } = await supabase
    .rpc('get_month_end');
  
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, type, category_id, account_id, tx_date, note')
    .gte('tx_date', monthStart)
    .lte('tx_date', monthEnd)
    .order('tx_date', { ascending: false });
  
  if (error) throw error;
  return (data || []).map((t: any) => ({ ...t, amount: Number(t.amount) }));
}

// ✅ FIX: Juga pake server time buat create transaction
export async function createTransaction(tx: Omit<Transaction, 'id'>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Kalo ga ada tx_date, pake server time
  const txData = {
    ...tx,
    user_id: user.id,
    tx_date: tx.tx_date || new Date().toISOString().split('T')[0]
  };
  
  const { error } = await supabase.from('transactions').insert(txData);
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

// ✅ NEW: Ambil summary bulan ini pake server time
export async function getMonthlySummary() {
  const supabase = createClient();
  
  const { data: monthStart } = await supabase
    .rpc('get_month_start');
  
  const { data: monthEnd } = await supabase
    .rpc('get_month_end');
  
  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('tx_date', monthStart)
    .lte('tx_date', monthEnd);
  
  if (error) throw error;
  
  const inc = (data || []).filter(t => t.type === 'inc').reduce((s, t) => s + Number(t.amount), 0);
  const exp = (data || []).filter(t => t.type === 'exp').reduce((s, t) => s + Number(t.amount), 0);
  
  return { inc, exp, saldo: inc - exp, total: data?.length || 0 };
}