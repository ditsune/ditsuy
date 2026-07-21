'use client';
import { useState } from 'react';
import { useDashboard } from '@/components/DashboardShell';
import { RAMP_HEX, fmt, DAYNAMES } from '@/lib/types';

export default function TransaksiPage() {
  const { categories, accounts, transactions, monthDate, loading, openEdit } = useDashboard();
  const [view, setView] = useState<'list' | 'calendar'>('list');

  function catOf(id: string) { return categories.find((c) => c.id === id) || { name: id, icon: 'ti-dots', ramp: 'pink' }; }
  function accOf(id: string) { return accounts.find((a) => a.id === id)?.name || ''; }

  const sorted = [...transactions].sort((a, b) => b.tx_date.localeCompare(a.tx_date));
  const byDay: Record<string, typeof transactions> = {};
  sorted.forEach((t) => { (byDay[t.tx_date] = byDay[t.tx_date] || []).push(t); });
  const days = Object.keys(byDay).sort().reverse();

  const listContent = loading ? (
    <p className="px-[18px] py-10 text-center text-sm text-gray-400">Memuat...</p>
  ) : days.length === 0 ? (
    <p className="px-[18px] py-10 text-center text-sm text-gray-400">Belum ada transaksi bulan ini</p>
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
  const txDates = new Set(transactions.map((t) => t.tx_date));
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
      </div>

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