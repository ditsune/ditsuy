'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCategories, getAccounts, getTransactions } from '@/lib/queries';
import { monthRange } from '@/lib/date';
import type { Category, Account, Transaction } from '@/lib/types';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import TransactionSheet from './TransactionSheet';

type DashboardContextType = {
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  monthDate: Date;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  openEdit: (tx: Transaction) => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardShell');
  return ctx;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthDate, setMonthDate] = useState<Date>(new Date());

  // Sheet nambah/edit transaksi — dulu state-nya ada tapi gak pernah dirender.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = monthRange(monthDate);
      const [cats, accs, txs] = await Promise.all([
        getCategories(),
        getAccounts(),
        getTransactions(start, end),
      ]);
      setCategories(cats);
      setAccounts(accs);
      setTransactions(txs);
    } catch (e: any) {
      console.error('Error loading data:', e);
      setError(e?.message || 'Gagal memuat data. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [monthDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openEdit(tx: Transaction) {
    setEditingTx(tx);
    setSheetOpen(true);
  }

  function openAdd() {
    setEditingTx(null);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingTx(null);
  }

  function saved() {
    closeSheet();
    loadData();
  }

  function prevMonth() {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  return (
    <DashboardContext.Provider
      value={{
        categories,
        accounts,
        transactions,
        monthDate,
        loading,
        error,
        refresh: loadData,
        openEdit,
      }}
    >
      <TopBar monthDate={monthDate} onPrev={prevMonth} onNext={nextMonth} />

      {error && (
        <div className="mx-[18px] mb-3.5 bg-coral-50 border border-coral-400 text-coral-800 text-xs rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button onClick={loadData} className="font-semibold underline shrink-0">Coba lagi</button>
        </div>
      )}

      {children}

      <BottomNav onAdd={openAdd} />

      {sheetOpen && (
        <TransactionSheet
          categories={categories}
          accounts={accounts}
          initial={
            editingTx
              ? {
                  id: editingTx.id,
                  amount: editingTx.amount,
                  type: editingTx.type,
                  category_id: editingTx.category_id,
                  account_id: editingTx.account_id,
                  tx_date: editingTx.tx_date,
                  note: editingTx.note,
                }
              : {
                  amount: 0,
                  type: 'exp',
                  category_id: null,
                  account_id: accounts[0]?.id || '',
                  tx_date: new Date().toISOString().split('T')[0],
                  note: '',
                }
          }
          onClose={closeSheet}
          onSaved={saved}
        />
      )}
    </DashboardContext.Provider>
  );
}
