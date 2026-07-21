'use client';
import { useState, useMemo, useCallback } from 'react';
import { useDashboard } from '@/components/DashboardShell';
import { RAMP_HEX, fmt, DAYNAMES } from '@/lib/types';
import { exportTransactionsCSV } from '@/lib/export';

export default function TransaksiPage() {
  const { categories, accounts, transactions, monthDate, loading, openEdit } = useDashboard();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('');
  const [filterAcc, setFilterAcc] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);

  const catOf = useCallback(
    (id: string) => categories.find((c) => c.id === id) || { name: id, icon: 'ti-dots', ramp: 'pink' },
    [categories]
  );
  const accOf = useCallback(
    (id: string) => accounts.find((a) => a.id === id)?.name || '',
    [accounts]
  );

  // Filter + grouping per-hari — cuma diitung ulang kalau input yang
  // relevan berubah, bukan tiap render.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (filterCat && t.category_id !== filterCat) return false;
      if (filterAcc && t.account_id !== filterAcc) return false;
      if (q) {
        const catName = catOf(t.category_id).name.toLowerCase();
        const accName = accOf(t.account_id).toLowerCase();
        const note = (t.note || '').toLowerCase();
        if (!catName.includes(q) && !accName.includes(q) && !note.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, search, filterCat, filterAcc, catOf, accOf]);

  const { byDay, days } = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => b.tx_date.localeCompare(a.tx_date));
    const byDay: Record<string, typeof transactions> = {};
    sorted.forEach((t) => { (byDay[t.tx_date] = byDay[t.tx_date] || []).push(t); });
    return { byDay, days: Object.keys(byDay).sort().reverse() };
  }, [filtered]);

  const isFiltering = !!(search.trim() || filterCat || filterAcc);

  const listContent = loading ? (
    <p className="px-[18px] py-10 text-center text-sm text-gray-400">Memuat...</p>
  ) : days.length === 0 ? (
    <p className="px-[18px] py-10 text-center text-sm text-gray-400">{isFiltering ? 'Gak ada transaksi yang cocok' : 'Belum ada transaksi bulan ini'}</p>
  ) : days.map((d) => {
    const dt = new Date(d + 'T00:00:00');
    return (
      <div key={d} className="px-[18px] mb-1.5">
        <div className="flex items-baseline gap-2.5 my-3.5">
          <span className="text-[22px] font-semibold text-pink-400 w-[26px] text-center">{dt.getDate()}</span>
          <span className="hand text-2xl">{DAYNAMES[dt.getDay()]}</span>
        </div>
        {byDay[d].map((t) => {
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
              <div className={`text-[13px] font-semibold ${t.type === 'inc' ? 'text-green-800' : 'text-coral-800'}`}>
                {t.type === 'inc' ? '+' : '-'}{fmt(t.amount)}
              </div>
            </div>
          );
        })}
      </div>
    );
  });

  const year = monthDate.getFullYear(), month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const txDates = new Set(filtered.map((t) => t.tx_date));
  const today = new Date();
  const isCurMonth = today.getFullYear() === year && today.getMonth() === month;
  const DOW = ['M', 'S', 'R', 'K', 'J', 'S', 'M'];

  return (
    <>
      <div className="flex gap-1.5 px-[18px] pb-3">
        <button onClick={() => setView('list')} className={`flex-1 text-center py-2 rounded-xl text-xs border ${view === 'list' ? 'bg-pink-50 text-pink-600 border-pink-400' : 'bg-white text-gray-400 border-pink-100'}`}>
          <i className="ti ti-list mr-1" /> List
        </button>
        <button onClick={() => setView('calendar')} className={`flex-1 text-center py-2 rounded-xl text-xs border ${view === 'calendar' ? 'bg-pink-50 text-pink-600 border-pink-400' : 'bg-white text-gray-400 border-pink-100'}`}>
          <i className="ti ti-calendar mr-1" /> Kalender
        </button>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`px-3 rounded-xl text-xs border ${showFilter || filterCat || filterAcc ? 'bg-pink-50 text-pink-600 border-pink-400' : 'bg-white text-gray-400 border-pink-100'}`}
          title="Filter"
        >
          <i className="ti ti-filter" />
        </button>
        <button
          onClick={() => exportTransactionsCSV(filtered, categories, accounts, monthDate)}
          className="px-3 rounded-xl text-xs border bg-white text-gray-400 border-pink-100"
          title="Export CSV"
        >
          <i className="ti ti-download" />
        </button>
      </div>

      <div className="px-[18px] pb-3">
        <div className="relative">
          <i className="ti ti-search absolute left-3 top-2.5 text-gray-400 text-sm" />
          <input
            placeholder="Cari kategori, akun, atau catatan" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-pink-100 bg-white text-sm outline-none"
          />
        </div>
      </div>

      {showFilter && (
        <div className="flex gap-1.5 px-[18px] pb-3">
          <select
            value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="flex-1 border border-pink-100 rounded-lg px-2 py-1.5 text-xs bg-white outline-none"
          >
            <option value="">Semua kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filterAcc} onChange={(e) => setFilterAcc(e.target.value)}
            className="flex-1 border border-pink-100 rounded-lg px-2 py-1.5 text-xs bg-white outline-none"
          >
            <option value="">Semua akun</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      )}

      {view === 'calendar' && (
        <div className="grid grid-cols-7 gap-1 px-[18px] pb-3.5 text-center">
          {DOW.map((d, i) => <div key={i} className="text-[10px] text-gray-400 py-1">{d}</div>)}
          {Array.from({ length: startDow }).map((_, i) => <div key={'e' + i} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = isCurMonth && today.getDate() === day;
            const hasTx = txDates.has(dateStr);
            return (
              <div key={day} className={`relative text-xs py-2 rounded-lg ${isToday ? 'bg-pink-400 text-white font-semibold' : ''}`}>
                {day}
                {hasTx && <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-pink-400'}`} />}
              </div>
            );
          })}
        </div>
      )}

      {listContent}
    </>
  );
}