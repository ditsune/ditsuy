'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getCategories, getAccounts, getTransactions } from '@/lib/queries';
import type { Category, Account, Transaction } from '@/lib/types';

type DashboardContextType = {
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  loading: boolean;
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
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      // ✅ PAKE getTransactions() TANPA PARAMETER
      const [cats, accs, txs] = await Promise.all([
        getCategories(),
        getAccounts(),
        getTransactions(),
      ]);
      setCategories(cats);
      setAccounts(accs);
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openEdit(tx: Transaction) {
    setEditingTx(tx);
  }

  return (
    <DashboardContext.Provider
      value={{
        categories,
        accounts,
        transactions,
        loading,
        refresh: loadData,
        openEdit,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}