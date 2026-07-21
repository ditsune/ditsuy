'use client';
import { useState } from 'react';
import { useDashboard } from '@/components/DashboardShell';
import { RAMP_HEX, fmt } from '@/lib/types';
import { updateAccountOpeningBalance, updateAccountGoal, createAccount, deleteAccount } from '@/lib/queries';
import { IconRampPicker } from '@/components/IconRampPicker';

export default function AkunPage() {
  const { accounts, loading, refresh } = useDashboard();
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [balanceInput, setBalanceInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const [showNewAcc, setShowNewAcc] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'cash' | 'savings' | 'debt'>('cash');
  const [newAccIcon, setNewAccIcon] = useState('ti-wallet');
  const [newAccRamp, setNewAccRamp] = useState('pink');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [savingAcc, setSavingAcc] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);

  async function saveGoal(accountId: string) {
    setActionError(null);
    try {
      const raw = parseInt(goalInput.replace(/[^\d]/g, '') || '0', 10);
      await updateAccountGoal(accountId, raw);
      setEditingGoal(null);
      refresh();
    } catch (e: any) {
      setActionError(e?.message || 'Gagal simpan target');
    }
  }

  async function saveOpeningBalance(accountId: string) {
    setActionError(null);
    try {
      const raw = parseInt(balanceInput.replace(/[^\d]/g, '') || '0', 10);
      await updateAccountOpeningBalance(accountId, raw);
      setEditingBalance(null);
      refresh();
    } catch (e: any) {
      setActionError(e?.message || 'Gagal simpan saldo awal');
    }
  }

  async function saveNewAccount() {
    if (!newAccName.trim()) { setActionError('Nama akun kosong'); return; }
    setSavingAcc(true);
    setActionError(null);
    try {
      await createAccount({
        name: newAccName.trim(), icon: newAccIcon, ramp: newAccRamp, type: newAccType,
        opening_balance: parseInt(newAccBalance.replace(/[^\d]/g, '') || '0', 10),
        goal: 0,
      });
      setShowNewAcc(false);
      setNewAccName(''); setNewAccBalance('');
      refresh();
    } catch (e: any) {
      setActionError(e?.message || 'Gagal bikin akun');
    } finally {
      setSavingAcc(false);
    }
  }

  async function handleDeleteAccount(accountId: string) {
    if (!confirm('Hapus akun ini? Cuma bisa kalau belum ada transaksinya.')) return;
    setDeletingId(accountId);
    setActionError(null);
    try {
      await deleteAccount(accountId);
      refresh();
    } catch (e: any) {
      setActionError(e?.message || 'Gagal hapus akun');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="px-[18px] py-10 text-center text-sm text-gray-400">Memuat...</p>;

  return (
    <>
      <div className="text-center pt-[22px] px-[18px] pb-2.5">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1.5">Kekayaan bersih</p>
        <p className="hand text-4xl">{netWorth < 0 ? '-' : ''}{fmt(netWorth)}</p>
      </div>

      {actionError && (
        <div className="mx-[18px] mb-3.5 bg-coral-50 border border-coral-400 text-coral-800 text-xs rounded-xl px-3.5 py-2.5">
          {actionError}
        </div>
      )}

      <div className="mx-[18px] mb-3.5">
        {!showNewAcc ? (
          <button
            onClick={() => setShowNewAcc(true)}
            className="w-full border border-dashed border-pink-300 text-pink-600 text-xs font-medium py-2.5 rounded-2xl"
          >
            <i className="ti ti-plus mr-1" /> Tambah akun
          </button>
        ) : (
          <div className="bg-white border border-pink-100 rounded-2xl p-4">
            <input
              autoFocus placeholder="Nama akun (mis. GoPay, Rekening BCA)" value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              className="w-full border border-pink-100 rounded-lg px-3 py-2 text-sm outline-none mb-3"
            />
            <div className="flex gap-1.5 mb-3">
              {(['cash', 'savings', 'debt'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewAccType(t)}
                  className={`flex-1 text-xs py-2 rounded-lg border ${newAccType === t ? 'bg-pink-50 border-pink-400 text-pink-600' : 'border-pink-100 text-gray-400'}`}
                >
                  {t === 'cash' ? 'Dompet' : t === 'savings' ? 'Tabungan' : 'Utang/Cicilan'}
                </button>
              ))}
            </div>
            <input
              inputMode="numeric" placeholder="Saldo awal (Rp, opsional)" value={newAccBalance}
              onChange={(e) => setNewAccBalance(e.target.value.replace(/[^\d]/g, ''))}
              className="w-full border border-pink-100 rounded-lg px-3 py-2 text-sm outline-none mb-3"
            />
            <IconRampPicker icon={newAccIcon} ramp={newAccRamp} onIcon={setNewAccIcon} onRamp={setNewAccRamp} />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewAcc(false)}
                className="flex-1 text-xs py-2 rounded-lg border border-pink-100 text-gray-500"
              >
                Batal
              </button>
              <button
                onClick={saveNewAccount}
                disabled={savingAcc}
                className="flex-1 text-xs py-2 rounded-lg bg-pink-400 text-white font-medium disabled:opacity-50"
              >
                {savingAcc ? 'Menyimpan...' : 'Simpan akun'}
              </button>
            </div>
          </div>
        )}
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
              <span className="text-[13px] font-semibold">{fmt(a.balance)}</span>
              <button
                onClick={() => handleDeleteAccount(a.id)}
                disabled={deletingId === a.id}
                className="text-gray-300 hover:text-coral-800 disabled:opacity-50"
                title="Hapus akun"
              >
                <i className="ti ti-trash text-sm" />
              </button>
            </div>

            {editingBalance === a.id ? (
              <div className="flex gap-1.5 mb-2.5">
                <input
                  autoFocus inputMode="numeric" placeholder="Saldo awal (Rp)"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value.replace(/[^\d]/g, ''))}
                  className="flex-1 border border-pink-100 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                />
                <button onClick={() => saveOpeningBalance(a.id)} className="text-xs bg-pink-400 text-white px-3 rounded-lg">OK</button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingBalance(a.id); setBalanceInput(String(a.opening_balance)); }}
                className="text-[11px] text-pink-600 mb-2.5 block"
              >
                Atur saldo awal
              </button>
            )}

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