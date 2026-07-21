'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

// Next.js manggil ini kalo ada error yang gak ketangkep di mana pun
// (termasuk di root layout sendiri) — jadi user gak pernah liat
// white screen kosong, dan errornya kekirim ke Sentry.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '40px 20px' }}>
        <h2 style={{ marginBottom: 8 }}>Waduh, ada yang error 🥀</h2>
        <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
          Tim udah otomatis dikasih tau. Coba muat ulang halamannya ya.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ background: '#f472b6', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 14 }}
        >
          Muat ulang
        </button>
      </body>
    </html>
  );
}
