import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Search, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeLegalDocument } from '../lib/gemini';
import { cn } from '../lib/utils';

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

export default function Analyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    } as any,
    multiple: false
  } as any);

  const handleStartAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const analysis = await analyzeLegalDocument(text || "Örnek sözleşme metni: Gizlilik kuralları ve fesih maddeleri.");
        setResult(analysis);
        setAnalyzing(false);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {!file && !result && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Gateway</h2>
            <p className="text-slate-400 text-sm font-medium">Upload legal documents for instantaneous risk stratification.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            {...getRootProps()}
            className={cn(
              "group relative overflow-hidden border border-slate-200 border-dashed rounded-xl p-16 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer bg-white",
              isDragActive ? "border-slate-900 bg-slate-50" : "hover:border-slate-400"
            )}
          >
            <div className={cn(
              "p-5 rounded-lg transition-all duration-300",
              isDragActive ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
            )}>
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="mt-6 text-sm font-bold text-slate-900 uppercase tracking-widest">Drop Repository Files</h3>
            <p className="text-slate-400 mt-2 text-xs font-medium uppercase tracking-tighter">PDF, DOCX, TXT • MAX 10MB</p>
            <input {...getInputProps()} />
          </motion.div>
        </div>
      )}

      {file && !result && !analyzing && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center max-w-xl mx-auto"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center mb-6 border border-slate-100">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{file.name}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR EXTRACTION</p>
          
          <div className="flex gap-3 mt-10 w-full">
            <button 
              onClick={reset}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest"
            >
              Abort
            </button>
            <button 
              onClick={handleStartAnalysis}
              className="flex-[2] px-4 py-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Secure Extract
            </button>
          </div>
        </motion.div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-2 border-slate-100 border-t-slate-900 rounded-full"
            />
          </div>
          <div className="text-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Processing Core</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">Running BERT Legal-NLP Pipeline...</p>
          </div>
        </div>
      )}

      {result && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Sidebar Results */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Risk Scorecard</h4>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-6xl font-black text-slate-900 tracking-tighter">{result.risk_score}</span>
                  <span className="text-slate-300 font-bold mb-2">/ 100</span>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</span>
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{result.classification}</span>
                  </div>
                  <p className="text-xs font-serif text-slate-600 italic leading-relaxed">"{result.summary}"</p>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strengths Identified</h5>
                  <div className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex gap-2 text-xs font-medium text-slate-500">
                        <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={reset}
                className="w-full py-3 rounded-lg border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                New Session
              </button>
            </div>

            {/* Main Analysis Results */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Extraction Report</h3>
                <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded uppercase">{result.risks.length} Anomalies Found</span>
              </div>

              <div className="space-y-4">
                {result.risks.map((risk, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{risk.clause}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        risk.level === "Yüksek" ? "bg-rose-100 text-rose-700" : 
                        risk.level === "Orta" ? "bg-amber-100 text-amber-700" : 
                        "bg-slate-100 text-slate-700"
                      )}>
                        {risk.level}
                      </span>
                    </div>
                    
                    <div className="p-8 space-y-6">
                      <p className="font-serif text-slate-700 leading-relaxed text-lg">{risk.description}</p>
                      
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
