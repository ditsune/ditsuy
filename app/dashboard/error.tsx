'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

// Boundary khusus area /dashboard — kalo salah satu halaman (Beranda,
// Transaksi, dst) crash, cuma bagian ini yang keganti fallback, bukan
// seluruh app kayak global-error.tsx.
export default function DashboardError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="px-[18px] py-16 text-center">
      <p className="hand text-2xl mb-2">Waduh, error 🥀</p>
      <p className="text-xs text-gray-400 mb-5">Halaman ini gagal dimuat. Tim udah dikasih tau otomatis.</p>
      <button
        onClick={reset}
        className="bg-pink-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl"
      >
        Coba lagi
      </button>
    </div>
  );
}
