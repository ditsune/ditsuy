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
  const { error } = await supabase.from('transactions').insert({ ...tx, user_id: user.id });
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