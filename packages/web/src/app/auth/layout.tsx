"use client";

import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side: Form Area (Pure White & Clean) */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 lg:px-24 z-20 bg-white relative">
        <div className="w-full max-w-[420px]">
          <Link href="/dashboard" className="flex items-center gap-2.5 mb-16 group inline-flex">
            <div className="w-11 h-11 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-all duration-500">
              <ShieldAlert className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter block leading-none">LexiGuard</span>
              <span className="text-[9px] uppercase tracking-[0.4em] text-slate-400 font-bold">Intelligence</span>
            </div>
          </Link>
          
          {children}
        </div>
        
        {/* Subtle branding at the bottom */}
        <div className="absolute bottom-8 left-12 hidden lg:block">
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2026 LexiGuard AI Systems</p>
        </div>
      </div>

      {/* Right Side: Visual Branding (High-Tech & Immersive) */}
      <div className="hidden lg:flex flex-[1.3] relative bg-slate-950 items-center justify-center overflow-hidden">
        {/* The AI Generated Visual */}
        <img 
          src="/Users/esrakalkan/.gemini/antigravity/brain/a287d782-9893-43a5-a594-905c3bc683b6/legal_ai_premium_visual_1778275252955.png" 
          alt="Legal AI Visual"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110"
        />
        
        {/* Overlays for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent" />

        {/* Floating Cam Cards (Glassmorphism) */}
        <div className="relative z-10 w-full max-w-2xl px-12">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl inline-flex flex-col gap-4 max-w-sm ml-auto"
            >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">AI Processing</div>
                    <div className="text-sm font-bold text-white">Analyzing Contract #8824</div>
                 </div>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  className="h-full bg-blue-500" 
                 />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 150 }}
              transition={{ delay: 0.8 }}
              className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-2xl flex items-center gap-4 max-w-[280px] -mt-4"
            >
               <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
               </div>
               <div className="text-[11px] font-bold text-white uppercase tracking-widest">Compliance Passed</div>
            </motion.div>
          </div>

          <div className="mt-24 max-w-lg">
             <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-6">
               Hukukta <br />
               <span className="text-slate-500">Yapay Zeka</span> Devrimi.
             </h2>
             <p className="text-slate-400 text-lg font-medium leading-relaxed">
               LexiGuard, karmaşık sözleşmeleri saniyeler içinde analiz ederek riskleri minimize eder ve operasyonel verimliliğinizi artırır.
             </p>
          </div>
        </div>

        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20 pointer-events-none" />
      </div>
    </div>
  );
}
