'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="px-6 pt-20">
      <p className="hand text-4xl text-pink-600 mb-1">Ditsuy</p>
      <p className="text-sm text-gray-500 mb-8">Masuk buat lanjut catat keuanganmu</p>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-pink-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400"
        />
        <input
          type="password" required placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-pink-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400"
        />
        {error && <p className="text-xs text-coral-800 bg-coral-50 rounded-lg px-3 py-2">{error}</p>}
        <button
          disabled={loading}
          className="bg-pink-400 text-white rounded-xl py-3 text-sm font-medium mt-2 disabled:opacity-60"
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-6 text-center">
        Belum punya akun? <Link href="/signup" className="text-pink-600 font-medium">Daftar</Link>
      </p>
    </div>
  );
}
