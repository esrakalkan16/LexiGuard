'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Automatically redirect after a short delay if email confirmation is disabled
      // setTimeout(() => router.push('/auth/login'), 3000);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl">📧</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">E-posta Doğrulama</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Kaydınızı tamamlamak için <b>{email}</b> adresine gönderdiğimiz doğrulama bağlantısına tıklayın.
        </p>
        <Link 
          href="/auth/login" 
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-all"
        >
          Giriş Sayfasına Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">Hesap Oluşturun</h2>
        <p className="text-gray-400">LexiGuard'ın tüm özelliklerinden faydalanın.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Ad Soyad</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full bg-[#111]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            placeholder="Adınız Soyadınız"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#111]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            placeholder="ornek@eposta.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#111]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            placeholder="En az 6 karakter"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Kaydolunuyor...' : 'Ücretsiz Kayıt Ol'}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-500">
          Zaten hesabınız var mı?{' '}
          <Link href="/auth/login" className="text-indigo-400 font-semibold hover:text-indigo-300">
            Giriş Yapın
          </Link>
        </p>
      </div>
      
      <p className="mt-8 text-[10px] text-gray-600 text-center uppercase tracking-widest leading-relaxed">
        Kayıt olarak Kullanım Koşullarını ve Gizlilik Politikamızı <br /> kabul etmiş sayılırsınız.
      </p>
    </div>
  );
}
