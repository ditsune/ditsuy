'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="px-6 pt-20 text-center">
        <p className="hand text-4xl text-pink-600 mb-4">Ditsuy</p>
        <p className="text-sm text-gray-600">
          Akun berhasil dibuat. Cek email <b>{email}</b> buat konfirmasi, lalu{' '}
          <Link href="/login" className="text-pink-600 font-medium">masuk di sini</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-20">
      <p className="hand text-4xl text-pink-600 mb-1">Ditsuy</p>
      <p className="text-sm text-gray-500 mb-8">Bikin akun buat mulai catat keuangan</p>

      <form onSubmit={handleSignup} className="flex flex-col gap-3">
        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-pink-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400"
        />
        <input
          type="password" required minLength={6} placeholder="Password (min 6 karakter)" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-pink-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400"
        />
        {error && <p className="text-xs text-coral-800 bg-coral-50 rounded-lg px-3 py-2">{error}</p>}
        <button
          disabled={loading}
          className="bg-pink-400 text-white rounded-xl py-3 text-sm font-medium mt-2 disabled:opacity-60"
        >
          {loading ? 'Membuat akun...' : 'Daftar'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-6 text-center">
        Udah punya akun? <Link href="/login" className="text-pink-600 font-medium">Masuk</Link>
      </p>
    </div>
  );
}
