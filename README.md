# Ditsuy — Catatan Keuangan (Fullstack)

Web app pencatatan pengeluaran/pemasukan pribadi. Next.js (App Router) + Supabase
(Auth + Postgres). Multi-user beneran — tiap orang yang daftar cuma bisa lihat
datanya sendiri (Row Level Security), jadi aman dipakai bareng temen.

## Fitur
- Auth (signup/login/logout) via Supabase — email + password
- CRUD transaksi penuh (create, read, update, delete) tersimpan di database, bukan localStorage
- Data terpisah per user (RLS)
- Saldo akun dihitung real-time dari transaksi (gak bakal drift/nyasar)
- Halaman: Beranda, Wawasan (donut chart), Transaksi (list + kalender), Akun (net worth + target tabungan/utang)
- Tanggal selalu ngikutin tanggal asli device (gak di-hardcode)
- PWA — bisa di-"Add to Home Screen" di HP, buka fullscreen kayak app native

## Setup (sekali doang)

### 1. Bikin project Supabase
1. Buka https://supabase.com → New Project (gratis)
2. Tunggu provisioning selesai (~2 menit)
3. Buka **SQL Editor** → paste seluruh isi file `supabase/schema.sql` → Run
4. Buka **Project Settings > API** → copy `Project URL` dan `anon public key`

### 2. Setup environment variables
```bash
cp .env.example .env.local
```
Isi `.env.local` dengan URL dan anon key dari langkah di atas.

### 3. Install & jalankan lokal
```bash
npm install
npm run dev
```
Buka http://localhost:3000 — bakal auto-redirect ke halaman login/signup.

### 4. (Opsional tapi disarankan) Matikan email confirmation biar signup langsung bisa dipake
Supabase default: user baru harus konfirmasi email dulu sebelum bisa login.
Kalau mau langsung pakai tanpa nunggu email (misal buat testing / temen deket):
Supabase Dashboard → **Authentication > Providers > Email** → matikan
"Confirm email". Kalau mau tetap aman/production-proper, biarkan menyala saja
dan pastikan SMTP/email provider Supabase kamu aktif.

### 5. Deploy ke Vercel
1. Push folder ini ke GitHub repo baru
2. Import repo di https://vercel.com/new
3. Di step **Environment Variables**, masukkan `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang sama kayak `.env.local`
4. Deploy

### 6. Undang temen
Tinggal share link Vercel-nya, mereka signup sendiri pakai email masing-masing.
Data mereka otomatis terpisah dari punya kamu (RLS di database yang mastiin ini,
bukan cuma di level aplikasi).

## Struktur project
```
app/
  login/, signup/       — halaman auth
  dashboard/
    page.tsx             — Beranda
    wawasan/page.tsx      — insight donut chart
    transaksi/page.tsx    — list + kalender
    akun/page.tsx         — net worth + target
  layout.tsx, page.tsx, globals.css
components/
  DashboardShell.tsx      — state management + context buat semua tab
  TransactionSheet.tsx    — modal tambah/edit transaksi
  BottomNav.tsx, TopBar.tsx
lib/
  supabase/client.ts      — Supabase client (browser)
  supabase/server.ts      — Supabase client (server component)
  queries.ts              — semua fungsi CRUD ke database
  types.ts                 — tipe data + helper format
supabase/
  schema.sql              — jalankan ini di Supabase SQL Editor
middleware.ts             — proteksi route /dashboard, redirect kalau belum login
```

## Kalau mau nambah kategori baru
Insert row baru ke tabel `categories` lewat Supabase Table Editor, atau tambahin
di `supabase/schema.sql` bagian `insert into categories`. Kategori bersifat
global (dipakai bersama semua user), bukan per-user.

## Catatan soal skala
Setup ini pakai Supabase tier gratis (500MB database, 50k monthly active users)
dan Vercel hobby tier — lebih dari cukup buat dipakai 1-5 orang. Kalau suatu saat
mau dipakai ratusan/ribuan orang, upgrade tier Supabase aja, kodenya gak perlu
diubah.
