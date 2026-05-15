"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Zap,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  summary: string;
  risk_score: number;
  risks: {
    clause: string;
    level: "Düşük" | "Orta" | "Yüksek";
    description: string;
    suggestion: string;
  }[];
  strengths: string[];
  classification: string;
}

function AnalyzerContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idParam) {
      loadAnalysis(idParam);
    }
  }, [idParam]);

  const loadAnalysis = async (id: string) => {
    setAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let analysisData = null;

      if (session?.user) {
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .eq("id", id)
          .single();

        if (data && !error) {
          analysisData = data.analysis_results;
        }
      }

      if (!analysisData) {
        const historyStr = localStorage.getItem("analysis_history");
        if (historyStr) {
          const history = JSON.parse(historyStr);
          const found = history.find((item: any) => item.id === id);
          if (found) {
            analysisData = found.analysisData;
          }
        }
      }

      if (analysisData) {
        const riskLevelMap: Record<string, "Yüksek" | "Orta" | "Düşük"> = {
          high: "Yüksek",
          medium: "Orta",
          low: "Düşük",
        };

        const suggestionMap: Record<string, string> = {
          high: "Bu maddeyi hukuk danışmanınızla birlikte gözden geçirmenizi ve olası değişiklikler için müzakere etmenizi öneriyoruz.",
          medium: "Bu maddeyi dikkatlice okuyun ve gerekirse aydınlatıcı bir ek madde eklenmesini talep edin.",
          low: "Standart bir madde olsa da içeriğin sizin durumunuza uygun olduğunu teyit edin.",
        };

        const riskItems: AnalysisResult["risks"] = (analysisData.risk_items || []).map(
          (item: any) => ({
            clause: item.category,
            level: riskLevelMap[item.risk_level] ?? "Düşük",
            description: item.description,
            suggestion: suggestionMap[item.risk_level] ?? suggestionMap.low,
          })
        );

        const strengths: string[] = (analysisData.risk_items || [])
          .filter((item: any) => item.risk_level === "low")
          .slice(0, 4)
          .map((item: any) => `${item.category}: ${item.description}`);

        const classification: string =
          analysisData.risk_items?.[0]?.category ||
          (analysisData.risk_score > 60 ? "Yüksek Riskli Sözleşme" :
            analysisData.risk_score > 30 ? "Orta Riskli Sözleşme" : "Düşük Riskli Sözleşme");

        setResult({
          summary: analysisData.summary || "",
          risk_score: analysisData.risk_score || 0,
          risks: riskItems,
          strengths,
          classification,
        });
      } else {
        setError("Analiz bulunamadı.");
      }
    } catch (err: any) {
      setError("Analiz yüklenirken hata oluştu.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        body: formData,
        headers: headers
      });

      if (!response.ok) {
        throw new Error("Analiz başarısız oldu. Lütfen tekrar deneyin.");
      }

      const data = await response.json();

      const riskLevelMap: Record<string, "Yüksek" | "Orta" | "Düşük"> = {
        high: "Yüksek",
        medium: "Orta",
        low: "Düşük",
      };

      const suggestionMap: Record<string, string> = {
        high: "Bu maddeyi hukuk danışmanınızla birlikte gözden geçirmenizi ve olası değişiklikler için müzakere etmenizi öneriyoruz.",
        medium: "Bu maddeyi dikkatlice okuyun ve gerekirse aydınlatıcı bir ek madde eklenmesini talep edin.",
        low: "Standart bir madde olsa da içeriğin sizin durumunuza uygun olduğunu teyit edin.",
      };

      const riskItems: AnalysisResult["risks"] = (data.risk_items || []).map(
        (item: any) => ({
          clause: item.category,
          level: riskLevelMap[item.risk_level] ?? "Düşük",
          description: item.description,
          suggestion: suggestionMap[item.risk_level] ?? suggestionMap.low,
        })
      );

      const strengths: string[] = (data.risk_items || [])
        .filter((item: any) => item.risk_level === "low")
        .slice(0, 4)
        .map((item: any) => `${item.category}: ${item.description}`);

      const classification: string =
        data.risk_items?.[0]?.category ||
        (data.risk_score > 60 ? "Yüksek Riskli Sözleşme" :
          data.risk_score > 30 ? "Orta Riskli Sözleşme" : "Düşük Riskli Sözleşme");

      const analysisResult: AnalysisResult = {
        summary: data.summary || "",
        risk_score: data.risk_score || 0,
        risks: riskItems,
        strengths,
        classification,
      };

      setResult(analysisResult);

      const existingHistoryStr = localStorage.getItem("analysis_history");
      const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      const score = analysisResult.risk_score;
      const newEntry = {
        name: file.name,
        type: analysisResult.classification || "Belge",
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        icon: file.name.endsWith(".pdf") ? "picture_as_pdf" : "description",
        date: new Date().toLocaleDateString("tr-TR", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        score,
        status: score > 70 ? "High Risk" : score > 30 ? "Low Risk" : "Secure",
        risk: `${score}%`,
        badge:
          score > 70
            ? "bg-red-50 text-error border-red-100"
            : score > 30
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-blue-50 text-primary border-blue-100",
        id: data.db_record?.id || `LX-${Math.floor(Math.random() * 10000)}-2024`,
        analysisData: data,
      };
      localStorage.setItem("analysis_history", JSON.stringify([newEntry, ...existingHistory]));
    } catch (err: any) {
      setError(err.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {!file && !result && !analyzing && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Gateway</h2>
            <p className="text-slate-400 text-sm font-medium">Upload legal documents for instantaneous risk stratification.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => document.getElementById("file-input")?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-[2.5rem] p-16 text-center transition-all duration-500 cursor-pointer group overflow-hidden",
                isDragActive ? "border-slate-900 bg-slate-50 shadow-2xl scale-[1.02]" : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-xl hover:shadow-slate-100"
              )}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.01] pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-2xl",
                  isDragActive ? "bg-slate-900 text-white scale-110" : "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                )}>
                  <Upload className="w-8 h-8" />
                </div>
                <div className="mt-8 space-y-3">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">{isDragActive ? "Drop to Analyze" : "Upload Document"}</h3>
                  <p className="text-slate-400 text-sm font-medium max-w-[240px] mx-auto leading-relaxed uppercase tracking-tighter">
                    Drag and drop your contract or <span className="text-slate-900 font-bold border-b-2 border-slate-900/10">browse files</span>
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-6 pt-6 border-t border-slate-50 w-full justify-center">
                  {["PDF", "DOCX", "TXT"].map((ext) => (
                    <div key={ext} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-300 tracking-widest">{ext}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              <input id="file-input" type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
            </motion.div>
            <div className="mt-8 flex items-center justify-center gap-3 text-slate-400">
               <Shield className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">End-to-End Encrypted Analysis</span>
            </div>
          </div>
        </div>
      )}

      {file && !result && !analyzing && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Analysis</h2>
            <p className="text-slate-400 text-sm font-medium">Verify your document details before starting the AI extraction.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center bg-white shadow-2xl shadow-slate-100 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3 mb-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{file.name}</h3>
                  <div className="flex items-center gap-3 justify-center">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-200">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100">
                      Ready for Extraction
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button onClick={reset} className="flex-1 px-8 py-5 rounded-2xl border border-slate-200 text-slate-400 text-[11px] font-black hover:bg-slate-50 hover:text-slate-900 transition-all uppercase tracking-[0.3em]">Cancel Session</button>
                  <button onClick={handleStartAnalysis} className="flex-[2] px-8 py-5 rounded-2xl bg-slate-900 text-white text-[12px] font-black hover:bg-black transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-blue-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Zap className="w-5 h-5 text-amber-400 group-hover:scale-125 transition-transform relative z-10" />
                    <span className="relative z-10">Initialize Analysis</span>
                  </button>
                </div>
              </div>
            </motion.div>
            {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[11px] font-bold uppercase tracking-widest text-center">{error}</motion.div>}
          </div>
        </div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center justify-center py-32 space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-slate-400/10 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-24 h-24">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-[3px] border-slate-100 rounded-full" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-[3px] border-transparent border-t-slate-900 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-slate-900 animate-bounce" />
              </div>
            </div>
          </div>
          <div className="text-center space-y-4 max-w-xs mx-auto">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] animate-pulse">AI Processing Engine</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping" />
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Legal-BERT Pipeline Active</p>
              </div>
              <p className="text-slate-300 text-[9px] font-medium leading-relaxed italic">Sözleşme maddeleri taranıyor ve risk skorları hesaplanıyor.</p>
            </div>
            <div className="flex gap-1 justify-center pt-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div key={i} animate={{ backgroundColor: ["#e2e8f0", "#0f172a", "#e2e8f0"] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="h-1 w-6 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      )}

      {result && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 h-fit">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Risk Scorecard</h4>
                  <ShieldAlert className={cn("w-5 h-5", result.risk_score > 70 ? "text-rose-500" : result.risk_score > 30 ? "text-amber-500" : "text-emerald-500")} />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-7xl font-black text-slate-900 tracking-tighter">{result.risk_score}</span>
                  <span className="text-slate-300 font-bold text-xl">/ 100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.risk_score}%` }} transition={{ duration: 1, ease: "easeOut" }} className={cn("h-full rounded-full", result.risk_score > 70 ? "bg-rose-500" : result.risk_score > 30 ? "bg-amber-500" : "bg-emerald-500")} />
                </div>
                <div className="space-y-6">
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</span>
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded uppercase tracking-tighter">{result.classification}</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">&ldquo;{result.summary}&rdquo;</p>
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sözleşme Güçlü Yanları</h5>
                    <div className="space-y-3">
                      {result.strengths.map((s, i) => (
                        <div key={i} className="flex gap-3 text-xs font-semibold text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={reset} className="w-full py-4 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group">
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform" />
                New Analysis Session
              </button>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Extraction Report</h3>
                <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded uppercase">{result.risks.length} Anomalies Found</span>
              </div>
              <div className="space-y-4">
                {result.risks.map((risk, i) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{risk.clause}</span>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", risk.level === "Yüksek" ? "bg-rose-100 text-rose-700" : risk.level === "Orta" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700")}>{risk.level}</span>
                    </div>
                    <div className="p-8 space-y-6">
                      <p className="text-slate-700 leading-relaxed text-base font-normal">{risk.description}</p>
                      <div className="flex gap-4 items-start bg-slate-900 text-white p-5 rounded-lg shadow-xl shadow-slate-900/10">
                        <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-50 text-white">Defense Suggestion</div>
                          <p className="text-sm font-medium leading-relaxed">{risk.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default function AnalyzerPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Yükleniyor...</div>}>
      <AnalyzerContent />
    </Suspense>
  );
}
