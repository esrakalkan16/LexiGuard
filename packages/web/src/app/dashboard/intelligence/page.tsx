"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export default function IntelligencePage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchAnalyses = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsGuest(false);
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && !error) {
          const formatted = data.map((d: any) => ({
            name: d.filename,
            type: d.analysis_results?.classification || "Belge",
            status: d.risk_score > 70 ? "High Risk" : d.risk_score > 30 ? "Low Risk" : "Secure",
            date: new Date(d.created_at).toLocaleDateString("tr-TR"),
            score: d.risk_score || 0,
            id: d.id,
          }));
          setAnalyses(formatted);
        }
      } else {
        setIsGuest(true);
        // Guest fallback
        const historyStr = localStorage.getItem("analysis_history");
        if (historyStr) {
          setAnalyses(JSON.parse(historyStr));
        } else {
          setAnalyses([]);
        }
      }
      setLoading(false);
    };

    fetchAnalyses();
  }, []);

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Analyses</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isGuest 
              ? "Misafir modundasınız. Sadece bu cihazdaki son analizler gösteriliyor." 
              : "Geçmişte yüklediğiniz ve analiz edilen tüm sözleşmeleriniz."}
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search library..."
            className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-slate-200 border-t-slate-900 rounded-full"></div>
          </div>
        ) : analyses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Henüz Analiz Yok</h3>
            <p className="text-slate-500 text-sm">İlk sözleşmenizi yükleyerek analize başlayın.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {analyses.map((item: any, i: number) => {
              const score = typeof item.score === "number" ? item.score : parseInt(item.risk) || 0;
              const status = item.status || (score > 70 ? "High Risk" : score > 30 ? "Low Risk" : "Secure");

                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={i}
                      onClick={() => setSelectedAnalysis(item)}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                          <FileText className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-slate-900">{item.name}</h5>
                          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">
                            {item.type} • {item.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="hidden sm:block text-right">
                          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">
                            Risk Score
                          </div>
                          <div
                            className={cn(
                              "text-xs font-black",
                              score > 70 ? "text-rose-500" : score > 30 ? "text-amber-500" : "text-emerald-500"
                            )}
                          >
                            {score}/100
                          </div>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold border w-24 text-center",
                            score > 70
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : score > 30
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}
                        >
                          {status.toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Overlay */}
        {selectedAnalysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedAnalysis.name}</h2>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
                    {selectedAnalysis.type} • {selectedAnalysis.date}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <span className="text-xl leading-none">&times;</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                <div className="mb-6 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Durumu</h3>
                    <div className="text-xl font-black text-slate-900">
                      {selectedAnalysis.status?.toUpperCase() || "BİLİNMİYOR"}
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Skoru</h3>
                    <div className={cn(
                      "text-3xl font-black",
                      (selectedAnalysis.score || parseInt(selectedAnalysis.risk) || 0) > 70 ? "text-rose-500" : (selectedAnalysis.score || parseInt(selectedAnalysis.risk) || 0) > 30 ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {selectedAnalysis.score || parseInt(selectedAnalysis.risk) || 0}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Analiz Özeti</h3>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-sm text-slate-600 leading-relaxed">
                    {selectedAnalysis.raw_analysis?.summary || selectedAnalysis.analysisData?.summary || "Bu sözleşme için detaylı özet bulunamadı. Yapay zeka risk skorunu ve kategorilerini belirledi."}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => router.push(`/dashboard/analysis?id=${selectedAnalysis.id}`)}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors uppercase tracking-widest"
                  >
                    Detaylı Rapora Git
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
}
