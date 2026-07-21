'use client';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import TransactionSheet from '@/components/TransactionSheet';
import { getCategories, getAccounts, getTransactions } from '@/lib/queries';
import type { Category, Account, Transaction } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

type DashboardData = {
  monthDate: Date;
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  loading: boolean;
  loadError: string | null;
  refresh: () => void;
  openEdit: (tx: Transaction) => void;
};

const DashboardCtx = createContext<DashboardData | null>(null);
export function useDashboard() {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error('useDashboard must be used inside dashboard layout');
  return ctx;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [monthOffset, setMonthOffset] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState<null | { id?: string; amount: number; type: 'exp'|'inc'; category_id: string|null; account_id: string; tx_date: string; note: string }>(null);

  // real current date as the base, offset by month navigation — never hardcoded
  const today = new Date();
  const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthStart = `${monthDate.getFullYear()}-${pad(monthDate.getMonth() + 1)}-01`;
  const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const monthEnd = `${monthEndDate.getFullYear()}-${pad(monthEndDate.getMonth() + 1)}-${pad(monthEndDate.getDate())}`;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [cats, accs, txs] = await Promise.all([
        getCategories(),
        getAccounts(),
        getTransactions(monthStart, monthEnd),
      ]);
      setCategories(cats);
      setAccounts(accs);
      setTransactions(txs);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setLoadError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  useEffect(() => { load(); }, [load]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function openAdd() {
    setSheetOpen({
      amount: 0, type: 'exp', category_id: null,
      account_id: accounts[0]?.id || '',
      tx_date: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
      note: '',
    });
  }

  function openEdit(tx: Transaction) {
    setSheetOpen({
      id: tx.id, amount: tx.amount, type: tx.type, category_id: tx.category_id,
      account_id: tx.account_id, tx_date: tx.tx_date, note: tx.note,
    });
  }

  return (
    <DashboardCtx.Provider value={{ monthDate, categories, accounts, transactions, loading, loadError, refresh: load, openEdit }}>
      <TopBar
        monthDate={monthDate}
        onPrev={() => setMonthOffset((m) => m - 1)}
        onNext={() => setMonthOffset((m) => m + 1)}
      />

      {loadError && (
        <div className="mx-[18px] mb-3 px-3 py-2 rounded-lg bg-coral-50 text-coral-800 text-xs">
          Gagal memuat data: {loadError}
        </div>
      )}

      {children}
      <BottomNav onAdd={openAdd} />

      {sheetOpen && (
        <TransactionSheet
          categories={categories}
          accounts={accounts}
          initial={sheetOpen}
          onClose={() => setSheetOpen(null)}
          onSaved={() => { setSheetOpen(null); load(); }}
        />
      )}

      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 text-[10px] text-gray-400 underline z-40"
      >
        Keluar
      </button>
    </DashboardCtx.Provider>
  );
}

export { DashboardCtx };
export type { DashboardData };