"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import UploadZone from "@/components/UploadZone";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* TopNavBar */}
      <header className="bg-white/90 backdrop-blur-md tracking-tight docked full-width top-0 border-b z-50 border-slate-200 shadow-sm sticky">
        <div className="flex justify-between items-center h-16 px-8 max-w-[1440px] mx-auto">
          <div className="text-xl font-bold text-slate-900">LexiGuard</div>
          <nav className="hidden md:flex gap-8 items-center">
            <Link className="text-primary font-semibold border-b-2 border-primary py-1 transition-colors duration-200" href="/dashboard">
              Panel
            </Link>
            <a className="text-slate-600 font-medium hover:text-blue-700 transition-colors duration-200" href="#">
              Sözleşmeler
            </a>
            <a className="text-slate-600 font-medium hover:text-blue-700 transition-colors duration-200" href="#">
              Raporlar
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="bg-primary-container text-on-primary font-label-md px-md py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all">
              Ücretsiz Analiz Et
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-xl pb-24 px-8 overflow-hidden">
          <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant mb-lg"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <span className="text-label-sm text-on-surface-variant">Kurumsal Düzeyde Hukuki Zeka</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-display text-slate-900 mb-md max-w-3xl"
            >
              Neye İmza Attığınızı Bilin
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-xl"
            >
              LexiGuard, karmaşık hukuki belgeleri saniyeler içinde analiz etmek, gizli riskleri ve standart dışı maddeleri siz taahhüt vermeden önce işaretlemek için gelişmiş yapay zeka kullanır.
            </motion.p>

            {/* Professional Upload Zone */}
            <UploadZone />

            {/* Security Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-lg flex items-center gap-3 py-3 px-6 bg-slate-900 rounded-full text-white shadow-lg"
            >
              <span className="material-symbols-outlined text-blue-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span className="text-label-md font-medium">Belgeleriniz şifrelenir ve asla saklanmaz.</span>
            </motion.div>
          </div>

          {/* Background Decorative Element */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl -z-10"></div>
        </section>

        {/* Trust Section */}
        <section className="py-xl bg-surface-container-low px-8 border-y border-slate-200">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-xl">
              <h2 className="font-h2 text-h2 text-slate-900">Kurumsal Güven İçin Tasarlandı</h2>
              <div className="w-20 h-1 bg-primary mx-auto mt-md rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {[
                { icon: "lock", title: "Banka düzeyinde şifreleme", desc: "Hassas verilerinizin üçüncü taraflarca erişilemez olmasını sağlamak için AES-256 ve TLS 1.3 şifreleme kullanıyoruz." },
                { icon: "gavel", title: "GDPR Uyumlu", desc: "Platformumuz, katı veri egemenliğini ve şeffaflığı koruyarak küresel gizlilik standartlarıyla tamamen uyumludur." },
                { icon: "delete_sweep", title: "Veri tutma yok", desc: "Dosyalar analizden hemen sonra sistemlerimizden silinir. Özel verilerinizi yapay zeka modellerimizi eğitmek için kullanmıyoruz." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white p-lg rounded-xl border border-slate-200 shadow-sm hover:translate-y-[-4px] hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-md">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  </div>
                  <h3 className="font-h3 text-h3 text-slate-900 mb-sm">{item.title}</h3>
                  <p className="font-body-md text-on-surface-variant">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-xl px-8">
          <div className="max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center">
              <div className="lg:col-span-4">
                <h2 className="font-h2 text-h2 text-slate-900 mb-md leading-tight">Lider Hukuk Müşavirlerinin Tercihi</h2>
                <p className="font-body-lg text-on-surface-variant">Binlerce hukuk profesyonelinin sözleşme incelemeleri için neden LexiGuard'a güvendiğini görün.</p>
                <div className="mt-lg flex gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
                      <img className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="Avatar" />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
                      <img className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=Jane+Smith&background=random" alt="Avatar" />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
                      <img className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=Mike+Johnson&background=random" alt="Avatar" />
                    </div>
                  </div>
                  <div className="text-label-md">
                    <span className="block text-slate-900">500+ Hukuk Bürosu</span>
                    <span className="text-slate-500">Dünya çapında aktif kullanıcı</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-md">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-lg bg-slate-50 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-1 text-yellow-500 mb-sm">
                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                  </div>
                  <p className="font-body-md text-slate-700 italic mb-lg">"LexiGuard ilk inceleme süremizi neredeyse %70 kısalttı. Uzmanların bile gözünden kaçabilecek ince sorumluluk kaymalarını anında yakalıyor."</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                      <img className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random" alt="Avatar" />
                    </div>
                    <div>
                      <h4 className="font-label-md text-slate-900">Sarah Jenkins</h4>
                      <p className="text-[12px] text-slate-500 font-medium">Kıdemli Ortak, Global Hukuk</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="p-lg bg-slate-50 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-1 text-yellow-500 mb-sm">
                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                  </div>
                  <p className="font-body-md text-slate-700 italic mb-lg">"Zeka akışı özelliği, tüm sözleşme portföyümüzdeki standart dışı maddeleri izlemek için oyunun kurallarını değiştiriyor."</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                      <img className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=David+Ross&background=random" alt="Avatar" />
                    </div>
                    <div>
                      <h4 className="font-label-md text-slate-900">David Ross</h4>
                      <p className="text-[12px] text-slate-500 font-medium">Baş Hukuk Müşaviri</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8">
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="font-h2 text-h2 text-white mb-md">Daha akıllı yasal analize hazır mısınız?</h2>
              <p className="font-body-lg text-slate-400 mb-xl">Bugün LexiGuard kullanan seçkin hukuk büroları ve hukuk ekiplerinin arasına katılın.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard" className="bg-primary-container text-on-primary font-label-md px-xl py-4 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                  Ücretsiz Başlayın
                </Link>
                <button className="bg-transparent border border-slate-700 text-white font-label-md px-xl py-4 rounded-lg hover:bg-slate-800 transition-all">
                  Demo Talep Et
                </button>
              </div>
              <p className="mt-lg text-slate-500 text-sm">Kredi kartı gerekmez • SOC 2 Sertifikalı</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-8 max-w-[1440px] mx-auto">
          <div className="font-bold text-slate-400 mb-4 md:mb-0">LexiGuard</div>
          <div className="flex flex-wrap justify-center gap-8 mb-8 md:mb-0">
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all" href="#">Gizlilik Politikası</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all" href="#">Kullanım Koşulları</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all" href="#">Güvenlik Merkezi</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all" href="#">Uyumluluk</a>
          </div>
          <p className="font-sans text-xs uppercase tracking-widest text-slate-500">© 2024 LexiGuard. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
