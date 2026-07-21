import { redirect } from 'next/navigation';

// Halaman root cuma pintu masuk — konten sebenarnya ada di /dashboard.
// Middleware yang nentuin lo diarahin ke /login atau /dashboard.
export default function RootPage() {
  redirect('/dashboard');
}
