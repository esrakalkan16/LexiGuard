'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h2>
        <p className="text-gray-400">Hesabınıza giriş yaparak devam edin.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#111]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            placeholder="ornek@eposta.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-medium text-gray-300">Şifre</label>
            <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300">Şifremi Unuttum</Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#111]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-500">
          Hesabınız yok mu?{' '}
          <Link href="/auth/register" className="text-indigo-400 font-semibold hover:text-indigo-300">
            Hemen Kayıt Olun
          </Link>
        </p>
      </div>
      
      <div className="mt-6 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-white/5"></div>
        <span className="text-xs text-gray-600 uppercase tracking-widest">Veya</span>
        <div className="h-[1px] flex-1 bg-white/5"></div>
      </div>
      
      <div className="mt-6">
        <Link 
          href="/dashboard" 
          className="block w-full text-center py-3.5 border border-white/5 rounded-xl text-gray-400 hover:bg-white/5 transition-all"
        >
          Kayıt Olmadan Devam Et
        </Link>
      </div>
    </div>
  );
}
