export type Category = {
  id: string;
  name: string;
  icon: string;
  ramp: string;
  type: 'exp' | 'inc' | 'both';
};

export type Account = {
  id: string;
  name: string;
  icon: string;
  ramp: string;
  type: 'cash' | 'savings' | 'debt';
  goal: number;
  opening_balance: number;
  balance: number;
};

export type Transaction = {
  id: string;
  amount: number;
  type: 'exp' | 'inc';
  category_id: string;
  account_id: string;
  tx_date: string;
  note: string;
};

// Hex-based colors — used everywhere instead of Tailwind dynamic classes,
// so icon backgrounds never depend on Tailwind's content-scanning/purge.
export const RAMP_HEX: Record<string, { bg: string; fg: string }> = {
  pink:   { bg: '#FBEAF0', fg: '#72243E' },
  coral:  { bg: '#FAECE7', fg: '#712B13' },
  green:  { bg: '#EAF3DE', fg: '#27500A' },
  blue:   { bg: '#E6F1FB', fg: '#0C447C' },
  amber:  { bg: '#FAEEDA', fg: '#633806' },
  purple: { bg: '#EEEDFE', fg: '#3C3489' },
  teal:   { bg: '#E1F5EE', fg: '#085041' },
};

export function fmt(n: number): string {
  const sign = n < 0 ? '-' : '';
  return sign + 'Rp' + Math.round(Math.abs(n)).toLocaleString('id-ID');
}

export const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
export const DAYNAMES = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];