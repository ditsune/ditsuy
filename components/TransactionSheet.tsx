'use client';
import { useState } from 'react';
import type { Category, Account, Transaction } from '@/lib/types';
import { RAMP_HEX, fmt } from '@/lib/types';
import { createTransaction, updateTransaction, deleteTransaction } from '@/lib/queries';

type Draft = {
  id?: string;
  amount: number;
  type: 'exp' | 'inc';
  category_id: string | null;
  account_id: string;
  tx_date: string;
  note: string;
};

export default function TransactionSheet({
  categories, accounts, initial, onClose, onSaved,
}: {
  categories: Category[];
  accounts: Account[];
  initial: Draft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCat = categories.find((c) => c.id === draft.category_id);

  async function handleSave() {
    if (!draft.amount || !draft.category_id) {
      setError('Isi jumlah dan kategori dulu ya');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (draft.id) {
        await updateTransaction(draft.id, {
          amount: draft.amount, type: draft.type, category_id: draft.category_id,
          account_id: draft.account_id, tx_date: draft.tx_date, note: draft.note,
        });
      } else {
        await createTransaction({
          amount: draft.amount, type: draft.type, category_id: draft.category_id,
          account_id: draft.account_id, tx_date: draft.tx_date, note: draft.note,
        });
      }
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!draft.id) return;
    if (!confirm('Hapus transaksi ini?')) return;
    setSaving(true);
    try {
      await deleteTransaction(draft.id);
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus');
    } finally {
      setSaving(false);
    }
  }

  const filteredCats = categories.filter(
    (c) => (c.type === draft.type || c.type === 'both') &&
           c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/30 z-[100] flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[480px] bg-bg rounded-t-3xl max-h-[88vh] overflow-y-auto pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-[18px] py-4 sticky top-0 bg-bg">
          <i className="ti ti-x text-xl text-gray-400 cursor-pointer" onClick={onClose} />
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {draft.id ? 'Edit transaksi' : 'Transaksi baru'}
          </span>
          <button onClick={handleSave} disabled={saving} className="text-pink-600 font-semibold text-sm px-2 py-1 disabled:opacity-50">
            Simpan
          </button>
        </div>

        {draft.id && (
          <div className="px-[18px] pb-3.5">
            <button
              onClick={handleDelete}
              className="w-full bg-coral-50 text-coral-800 border border-coral-400 rounded-xl py-2.5 text-sm font-medium"
            >
              <i className="ti ti-trash mr-1.5" /> Hapus transaksi
            </button>
          </div>
        )}

        <div className="flex justify-center gap-2 px-[18px] pb-[18px]">
          {(['exp', 'inc'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDraft({ ...draft, type: t, category_id: null })}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs ${
                draft.type === t
                  ? t === 'exp' ? 'bg-coral-50 border-coral-400 text-coral-800' : 'bg-green-50 border-green-400 text-green-800'
                  : 'bg-white border-pink-100 text-gray-400'
              }`}
            >
              <i className={`ti ${t === 'exp' ? 'ti-shopping-cart' : 'ti-cash'}`} />
              {t === 'exp' ? 'Pengeluaran' : 'Penghasilan'}
            </button>
          ))}
        </div>

        <div className="text-center px-[18px] pb-6">
          <input
            inputMode="numeric"
            placeholder="Rp0,00"
            value={draft.amount ? draft.amount.toLocaleString('id-ID') : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, '');
              setDraft({ ...draft, amount: parseInt(raw || '0', 10) });
            }}
            className="bg-transparent text-center text-4xl font-semibold w-full outline-none"
          />
        </div>

        <div className="mx-[18px] bg-white rounded-2xl border border-pink-100">
          <div
            className="flex items-center justify-between px-4 py-3.5 border-b border-pink-100 text-sm cursor-pointer"
            onClick={() => setShowCatPicker(!showCatPicker)}
          >
            <span className="text-gray-600">Kategori</span>
            <span className={selectedCat ? 'text-gray-900 font-medium' : 'text-gray-400'}>
              {selectedCat ? selectedCat.name : 'Pilih'} <i className="ti ti-chevron-right ml-1" />
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-pink-100 text-sm">
            <span className="text-gray-600">Tanggal</span>
            <input
              type="date" value={draft.tx_date}
              onChange={(e) => setDraft({ ...draft, tx_date: e.target.value })}
              className="bg-transparent text-right outline-none"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-pink-100 text-sm">
            <span className="text-gray-600">Akun</span>
            <select
              value={draft.account_id}
              onChange={(e) => setDraft({ ...draft, account_id: e.target.value })}
              className="bg-transparent text-right outline-none"
            >
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 text-sm">
            <span className="text-gray-600">Catatan</span>
            <input
              type="text" placeholder="Opsional" value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              className="bg-transparent text-right outline-none w-3/5"
            />
          </div>
        </div>

        {error && <p className="text-xs text-coral-800 bg-coral-50 rounded-lg mx-[18px] mt-3 px-3 py-2">{error}</p>}

        {showCatPicker && (
          <div className="mt-[18px]">
            <div className="relative mx-[18px] mb-3.5">
              <i className="ti ti-search absolute left-3 top-2.5 text-gray-400 text-sm" />
              <input
                placeholder="Cari kategori" value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-pink-100 bg-white text-sm outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-2.5 px-[18px]">
              {filteredCats.map((c) => {
                const colors = RAMP_HEX[c.ramp];
                return (
                  <div
                    key={c.id}
                    onClick={() => { setDraft({ ...draft, category_id: c.id }); setShowCatPicker(false); }}
                    className="flex flex-col items-center gap-1.5 bg-white border border-pink-100 rounded-2xl py-3.5 px-1.5 cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: colors.bg, color: colors.fg }}
                    >
                      <i className={`ti ${c.icon}`} />
                    </div>
                    <span className="text-[11px] text-gray-600 text-center">{c.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}