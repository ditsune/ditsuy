import { describe, it, expect } from 'vitest';
import { toISODate, monthRange } from './date';

describe('toISODate', () => {
  it('format tanggal ke YYYY-MM-DD pake angka lokal, bukan UTC', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toISODate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('padding nol buat bulan dan tanggal satu digit', () => {
    expect(toISODate(new Date(2026, 2, 4))).toBe('2026-03-04');
  });
});

describe('monthRange', () => {
  it('bulan Januari (31 hari)', () => {
    const { start, end } = monthRange(new Date(2026, 0, 15));
    expect(start).toBe('2026-01-01');
    expect(end).toBe('2026-01-31');
  });

  it('Februari tahun kabisat (29 hari)', () => {
    const { start, end } = monthRange(new Date(2028, 1, 10));
    expect(start).toBe('2028-02-01');
    expect(end).toBe('2028-02-29');
  });

  it('Februari tahun biasa (28 hari)', () => {
    const { start, end } = monthRange(new Date(2026, 1, 10));
    expect(end).toBe('2026-02-28');
  });

  it('Desember tetep di tahun yang sama, gak kebawa ke Januari tahun depan', () => {
    const { start, end } = monthRange(new Date(2026, 11, 1));
    expect(start).toBe('2026-12-01');
    expect(end).toBe('2026-12-31');
  });
});
