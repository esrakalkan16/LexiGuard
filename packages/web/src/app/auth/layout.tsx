import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-[#0a0a0a]/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Branding Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600/20 to-transparent">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">LexiGuard</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-6">
              Yapay Zeka ile <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                Sözleşme Analizinin 
              </span> <br />
              Geleceği.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Hukuki belgelerinizi saniyeler içinde analiz edin, riskleri belirleyin ve zamandan tasarruf edin.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
              <span>Legal-BERT Destekli Hassas Analiz</span>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
              <span>Risk Puanlaması ve Kritik Madde Tespiti</span>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
              <span>Bulut Tabanlı Arşivleme</span>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-black/20">
          {children}
        </div>
      </div>
    </div>
  );
}
