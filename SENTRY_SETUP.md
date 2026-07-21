# Setup Monitoring (Sentry)

App ini udah disiapin buat kirim error ke Sentry, tapi **gak aktif** sampe
kamu isi DSN-nya. Tanpa DSN, semua wiring Sentry-nya jadi no-op — app tetep
jalan normal, cuma gak ada yang ke-log.

## Langkah setup

1. Bikin akun/project di https://sentry.io (ada free tier, cukup buat app
   sekelas ini).
2. Pilih platform **Next.js**, Sentry bakal kasih kamu DSN
   (`https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`).
3. Tambahin ke `.env.local` (dan juga ke Environment Variables di Vercel
   kalau udah deploy):

```
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=nama-org-kamu
SENTRY_PROJECT=nama-project-kamu
```

4. Deploy ulang / restart dev server. Selesai — error di client, server,
   maupun edge runtime bakal otomatis kekirim ke Sentry, lengkap sama
   session replay pas ada error (biar kamu bisa liat persis apa yang user
   lakuin sebelum crash).

## Yang udah disiapin di kode

- `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts`
  — inisialisasi Sentry per-runtime.
- `instrumentation.ts` — hook yang manggil config server/edge di atas.
- `app/global-error.tsx` — nangkep error yang lolos dari semua boundary lain,
  nampilin halaman fallback yang manusiawi (bukan white screen), sekaligus
  ngirim errornya ke Sentry.
- `app/dashboard/error.tsx` — boundary khusus buat area dashboard, biar kalo
  satu halaman crash, cuma bagian itu yang keganti fallback, bukan seluruh app.

## Kenapa ini penting

Sebelum ini, kalo ada error di production, satu-satunya cara kamu tau adalah
user yang komplain — dan itu pun kalo mereka mau repot-repot bilang. Dengan
Sentry, kamu tau ada error dalam hitungan detik, lengkap sama stack trace dan
konteks user-nya, tanpa nunggu laporan manual.
