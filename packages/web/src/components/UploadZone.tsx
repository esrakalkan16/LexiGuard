"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadContract(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadContract(e.target.files[0]);
    }
  };

  const uploadContract = async (file: File) => {
    setError(null);
    const validTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
      "text/plain"
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
      setError("Lütfen geçerli bir .pdf, .docx veya .txt dosyası yükleyin.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("Dosya boyutu 25MB sınırını aşıyor.");
      return;
    }

    setIsUploading(true);

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const formData = new FormData();
      formData.append("file", file);
      
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        body: formData,
        headers: headers
      });

      if (!response.ok) {
        throw new Error("Analiz başarısız oldu. Lütfen tekrar deneyin.");
      }

      const data = await response.json();
      
      // Save result to session storage to display on the analysis report page
      sessionStorage.setItem("latest_analysis", JSON.stringify({
        ...data,
        filename: file.name,
        date: new Date().toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })
      }));

      // Get existing analyses from local storage to update the Dashboard table
      const existingHistoryStr = localStorage.getItem("analysis_history");
      const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      const newEntry = {
        name: file.name,
        type: file.name.endsWith('.pdf') ? "PDF Belgesi" : file.name.endsWith('.docx') ? "Word Belgesi" : "Metin Belgesi",
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        icon: file.name.endsWith('.pdf') ? "picture_as_pdf" : "description",
        date: new Date().toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', year: 'numeric' }),
        risk: `${data.risk_score}% ${data.risk_level_label.toUpperCase()}`,
        badge: data.risk_level === 'high' ? "bg-red-50 text-error border-red-100" : data.risk_level === 'medium' ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-blue-50 text-primary border-blue-100",
        id: data.db_record?.id || `LX-${Math.floor(Math.random() * 10000)}-2024`,
        analysisData: data
      };
      localStorage.setItem("analysis_history", JSON.stringify([newEntry, ...existingHistory]));

      router.push(`/dashboard/analysis?id=${newEntry.id}`);
    } catch (err: any) {
      setError(err.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`w-full max-w-2xl p-sm rounded-xl bg-slate-50 border-2 border-dashed transition-all duration-300 group ${
        isDragging ? 'border-primary bg-primary/5' : 'border-blue-200 hover:border-primary-container'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="bg-white rounded-lg p-xl flex flex-col items-center justify-center min-h-[320px] shadow-sm relative">
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="font-h3 text-h3 text-slate-900 mb-xs">Analiz ediliyor...</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Yapay zeka sözleşmeyi inceliyor, lütfen bekleyin.</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-md group-hover:bg-blue-100 transition-colors">
              <span className="material-symbols-outlined text-primary text-[32px]">upload_file</span>
            </div>
            <h3 className="font-h3 text-h3 text-slate-900 mb-xs">Sözleşmenizi Yükleyin</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">PDF veya Word belgenizi buraya sürükleyip bırakın</p>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-container text-on-primary font-label-md px-xl py-3 rounded-lg flex items-center gap-2 hover:opacity-95 transition-all shadow-md hover:shadow-lg"
            >
              Dosya Seçin
            </button>
            <p className="mt-lg text-[11px] font-label-sm text-slate-400 uppercase tracking-widest">25MB'a kadar PDF, DOCX, TXT desteklenir</p>
            {error && <p className="mt-2 text-error text-sm font-medium">{error}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
}
