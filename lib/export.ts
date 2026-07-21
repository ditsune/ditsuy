import type { Category, Account, Transaction } from './types';
import { MONTHS } from './types';

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

// Export dijalanin sepenuhnya di browser dari data yang udah ke-load —
// gak ada request baru ke server, jadi gak nambah beban Supabase.
export function exportTransactionsCSV(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  monthDate: Date
) {
  const catName = (id: string) => categories.find((c) => c.id === id)?.name || id;
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name || id;

  const rows = [
    ['Tanggal', 'Tipe', 'Kategori', 'Akun', 'Jumlah', 'Catatan'],
    ...[...transactions]
      .sort((a, b) => a.tx_date.localeCompare(b.tx_date))
      .map((t) => [
        t.tx_date,
        t.type === 'inc' ? 'Penghasilan' : 'Pengeluaran',
        catName(t.category_id),
        accName(t.account_id),
        String(t.amount),
        t.note || '',
      ]),
  ];

  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const label = `${MONTHS[monthDate.getMonth()]}-${monthDate.getFullYear()}`.toLowerCase();
  a.href = url;
  a.download = `kuncup-transaksi-${label}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
