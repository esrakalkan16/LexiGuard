'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full text-center"
      >
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <ShieldCheck className="w-12 h-12 text-slate-900" />
        </div>
        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Doğrulama</h2>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium text-lg">
          Kaydınızı tamamlamak için <b className="text-slate-900">{email}</b> adresine gönderdiğimiz bağlantıya tıklayın.
        </p>
        <Link 
          href="/auth/login" 
          className="inline-flex items-center gap-3 bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-black transition-all uppercase tracking-[0.2em] text-[12px] shadow-xl"
        >
          Giriş Yap
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full"
    >
      <div className="mb-12">
        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Hesap Aç</h2>
        <p className="text-slate-500 text-lg font-medium tracking-tight">Ücretsiz katılarak analize başlayın.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold uppercase tracking-widest text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ad Soyad</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium"
              placeholder="Adınız Soyadınız"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">E-posta</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium"
              placeholder="isim@sirket.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Şifre</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200 hover:bg-black hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[12px]"
          >
            {loading ? 'Kaydolunuyor...' : 'Hesap Oluştur'}
            {!loading && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>
      </form>

      <div className="mt-10 pt-10 border-t border-slate-100 text-center lg:text-left">
        <p className="text-slate-500 text-sm font-medium">
          Zaten hesabınız var mı?{' '}
          <Link href="/auth/login" className="text-slate-900 font-bold hover:underline">
            Giriş Yapın
          </Link>
        </p>
      </div>
      
      <p className="mt-10 text-[10px] text-slate-400 text-center lg:text-left uppercase tracking-[0.2em] leading-relaxed font-bold">
        Devam ederek <span className="text-slate-600 underline">Kullanım Koşullarını</span> ve <br /> <span className="text-slate-600 underline">Gizlilik Politikamızı</span> kabul etmiş sayılırsınız.
      </p>
    </motion.div>
  );
}
