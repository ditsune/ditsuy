// Semua perhitungan "bulan ini" dihitung dari waktu LOKAL device,
// bukan dari server (Postgres current_date defaultnya UTC → bisa geser
// kalau user di WIB/WITA/WIT). Ini bikin batas bulan selalu sesuai
// zona waktu si user, siapapun dan di manapun dia.
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function monthRange(monthDate: Date): { start: string; end: string } {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}
