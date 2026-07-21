'use client';
import { useState } from 'react';
import { useDashboard } from '@/components/DashboardShell';
import { RAMP_HEX, fmt } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function AkunPage() {
  const { accounts, loading, refresh } = useDashboard();
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState('');

  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);

  async function saveGoal(accountId: string) {
    const supabase = createClient();
    const raw = parseInt(goalInput.replace(/[^\d]/g, '') || '0', 10);
    await supabase.from('accounts').update({ goal: raw }).eq('id', accountId);
    setEditingGoal(null);
    refresh();
  }

  if (loading) return <p className="px-[18px] py-10 text-center text-sm text-gray-400">Memuat...</p>;

  return (
    <>
      <div className="text-center pt-[22px] px-[18px] pb-2.5">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1.5">Kekayaan bersih</p>
        <p className="hand text-4xl">{netWorth < 0 ? '-' : ''}{fmt(netWorth)}</p>
      </div>

      {accounts.map((a) => {
        const colors = RAMP_HEX[a.ramp];
        let pct = 0, minLbl = '', maxLbl = '';
        if (a.type === 'savings') { pct = a.goal ? Math.min(a.balance / a.goal, 1) : 0; minLbl = 'Rp0,00'; maxLbl = fmt(a.goal); }
        if (a.type === 'debt') { pct = a.goal ? Math.min(Math.abs(a.balance) / a.goal, 1) : 0; minLbl = (a.balance < 0 ? '-' : '') + fmt(a.goal); maxLbl = 'Rp0,00'; }

        return (
          <div key={a.id} className="mx-[18px] mb-3.5 bg-white border border-pink-100 rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="w-[30px] h-[30px] rounded-xl flex items-center justify-center"
                style={{ background: colors.bg, color: colors.fg }}
              >
                <i className={`ti ${a.icon}`} />
              </div>
              <p className="text-[13px] font-semibold flex-1">{a.name}</p>
              <span className="text-[13px] font-semibold">{a.balance < 0 ? '-' : ''}{fmt(a.balance)}</span>
            </div>

            {a.type !== 'cash' && (
              <>
                <div className="h-2 rounded-md bg-pink-50 overflow-hidden mb-1.5">
                  <div className="h-full rounded-md" style={{ width: `${pct * 100}%`, background: colors.fg }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-2">
                  <span>{minLbl}</span><span>{Math.round(pct * 100)}%</span><span>{maxLbl}</span>
                </div>

                {editingGoal === a.id ? (
                  <div className="flex gap-1.5">
                    <input
                      autoFocus inputMode="numeric" placeholder="Target (Rp)"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value.replace(/[^\d]/g, ''))}
                      className="flex-1 border border-pink-100 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                    <button onClick={() => saveGoal(a.id)} className="text-xs bg-pink-400 text-white px-3 rounded-lg">OK</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingGoal(a.id); setGoalInput(String(a.goal)); }}
                    className="text-[11px] text-pink-600"
                  >
                    Atur target
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </>
  );
}