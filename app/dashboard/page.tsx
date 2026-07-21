'use client';
import { useDashboard } from '@/components/DashboardShell';
import { RAMP_HEX, fmt } from '@/lib/types';

export default function BerandaPage() {
  const { categories, accounts, transactions, loading, openEdit } = useDashboard();

  const inc = transactions.filter((t) => t.type === 'inc').reduce((s, t) => s + t.amount, 0);
  const exp = transactions.filter((t) => t.type === 'exp').reduce((s, t) => s + t.amount, 0);
  const saldo = inc - exp;
  const incomes = transactions.filter((t) => t.type === 'inc');
  const expenses = transactions.filter((t) => t.type === 'exp');

  function catOf(id: string) { return categories.find((c) => c.id === id) || { name: id, icon: 'ti-dots', ramp: 'pink' }; }
  function accOf(id: string) { return accounts.find((a) => a.id === id)?.name || ''; }

  if (loading) return <p className="px-[18px] py-10 text-center text-sm text-gray-400">Memuat...</p>;

  return (
    <>
      <div className="flex gap-2.5 px-[18px] mb-3.5">
        <div className="flex-1 bg-white rounded-2xl px-3 py-2.5 border border-pink-100">
          <p className="text-[10px] uppercase text-gray-400 mb-1">Saldo</p>
          <p className="text-[13px] font-semibold text-pink-600">{fmt(saldo)}</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl px-3 py-2.5 border border-pink-100">
          <p className="text-[10px] uppercase text-gray-400 mb-1">Penghasilan</p>
          <p className="text-[13px] font-semibold text-green-800">{fmt(inc)}</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl px-3 py-2.5 border border-pink-100">
          <p className="text-[10px] uppercase text-gray-400 mb-1">Pengeluaran</p>
          <p className="text-[13px] font-semibold text-coral-800">{fmt(exp)}</p>
        </div>
      </div>

      <div className="px-[18px] mb-5 text-center">
        <p className="text-xs text-gray-400">
          {transactions.length ? `${transactions.length} transaksi bulan ini` : 'Belum ada transaksi bulan ini'}
        </p>
      </div>

      <div className="px-[18px] mb-[18px]">
        <p className="hand text-2xl mb-2">Penghasilan</p>
        {incomes.length ? incomes.map((t) => {
          const c = catOf(t.category_id);
          const colors = RAMP_HEX[c.ramp];
          return (
            <div key={t.id} className="row-item cursor-pointer" onClick={() => openEdit(t)}>
              <div
                className="w-[34px] h-[34px] rounded-xl flex items-center justify-center"
                style={{ background: colors.bg, color: colors.fg }}
              >
                <i className={`ti ${c.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px]">{c.name}</p>
                <p className="text-[11px] text-gray-400">{accOf(t.account_id)}</p>
              </div>
              <div className="text-[13px] font-semibold text-green-800">+{fmt(t.amount)}</div>
            </div>
          );
        }) : <p className="text-center text-xs text-gray-400 py-6">Belum ada penghasilan bulan ini</p>}
      </div>

      <div className="px-[18px] mb-[18px]">
        <div className="flex justify-between items-center mb-2">
          <p className="hand text-2xl">Pengeluaran</p>
          <span className="text-[10px] uppercase text-gray-400">Digunakan</span>
        </div>
        {expenses.length ? expenses.map((t) => {
          const c = catOf(t.category_id);
          const colors = RAMP_HEX[c.ramp];
          return (
            <div key={t.id} className="row-item cursor-pointer" onClick={() => openEdit(t)}>
              <div
                className="w-[34px] h-[34px] rounded-xl flex items-center justify-center"
                style={{ background: colors.bg, color: colors.fg }}
              >
                <i className={`ti ${c.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px]">{c.name}</p>
                <p className="text-[11px] text-gray-400">{accOf(t.account_id)}</p>
              </div>
              <div className="text-[13px] font-semibold text-coral-800">-{fmt(t.amount)}</div>
            </div>
          );
        }) : <p className="text-center text-xs text-gray-400 py-6">Belum ada pengeluaran bulan ini</p>}
      </div>
    </>
  );
}