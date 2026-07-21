'use client';
import { useState } from 'react';
import { useDashboard } from '@/components/DashboardShell';
import { RAMP_HEX, fmt } from '@/lib/types';

export default function WawasanPage() {
  const { categories, transactions, loading } = useDashboard();
  const [tab, setTab] = useState<'exp' | 'inc'>('exp');

  const list = transactions.filter((t) => t.type === tab);
  const byCat: Record<string, number> = {};
  list.forEach((t) => { byCat[t.category_id] = (byCat[t.category_id] || 0) + t.amount; });
  const total = Object.values(byCat).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  const circumference = 2 * Math.PI * 70;
  let offset = 0;
  const segs = entries.map(([cid, amt]) => {
    const pct = amt / total;
    const seg = { cid, pct, offset };
    offset += pct * 100;
    return seg;
  });

  function catOf(id: string) { return categories.find((c) => c.id === id) || { name: id, icon: 'ti-dots', ramp: 'pink' }; }

  if (loading) return <p className="px-[18px] py-10 text-center text-sm text-gray-400">Memuat...</p>;

  return (
    <>
      <div className="flex gap-2 px-[18px] pb-4">
        <button
          onClick={() => setTab('exp')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-xs font-medium ${
            tab === 'exp' ? 'bg-coral-50 border-coral-400 text-coral-800' : 'bg-white border-pink-100 text-gray-400'
          }`}
        >
          <i className="ti ti-shopping-cart" /> Pengeluaran
        </button>
        <button
          onClick={() => setTab('inc')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-xs font-medium ${
            tab === 'inc' ? 'bg-green-50 border-green-400 text-green-800' : 'bg-white border-pink-100 text-gray-400'
          }`}
        >
          <i className="ti ti-cash" /> Penghasilan
        </button>
      </div>

      <div className="flex justify-center py-2.5 pb-5">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {segs.length ? segs.map((s) => {
            const c = catOf(s.cid);
            const fg = RAMP_HEX[c.ramp].fg;
            const dash = (s.pct * circumference).toFixed(1);
            const gap = (circumference - Number(dash)).toFixed(1);
            const rotate = s.offset * 3.6 - 90;
            return (
              <circle
                key={s.cid} cx="90" cy="90" r="70" fill="none" stroke={fg} strokeWidth="22"
                strokeDasharray={`${dash} ${gap}`}
                transform={`rotate(${rotate} 90 90)`}
              />
            );
          }) : <circle cx="90" cy="90" r="70" fill="none" stroke="#F0DCE3" strokeWidth="22" />}
        </svg>
      </div>

      <div className="px-[18px]">
        <p className="hand text-2xl mb-2">{tab === 'exp' ? 'Pengeluaran' : 'Penghasilan'}</p>
        {segs.length ? segs.map((s) => {
          const c = catOf(s.cid);
          const colors = RAMP_HEX[c.ramp];
          return (
            <div key={s.cid} className="row-item">
              <div
                className="w-[34px] h-[34px] rounded-xl flex items-center justify-center"
                style={{ background: colors.bg, color: colors.fg }}
              >
                <i className={`ti ${c.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px]">{c.name}</p>
                <p className="text-[11px] text-gray-400">{Math.round(s.pct * 100)}%</p>
              </div>
              <div className="text-[13px] font-semibold">{fmt(byCat[s.cid])}</div>
            </div>
          );
        }) : <p className="text-center text-xs text-gray-400 py-6">Belum ada data</p>}
      </div>
    </>
  );
}