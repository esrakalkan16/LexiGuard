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

    setIsUploading(true);

    try {
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

      if (!response.ok) throw new Error("Analiz başarısız oldu.");

      const data = await response.json();

      // Analiz sonuçlarını session'a kaydet (Rapor sayfası için)
      sessionStorage.setItem("latest_analysis", JSON.stringify({
        ...data,
        filename: file.name,
        date: new Date().toLocaleDateString('tr-TR')
      }));

      // Dashboard listesini anlık güncellemek için yerel geçmişe de ekle
      const existingHistoryStr = localStorage.getItem("analysis_history");
      const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      const newEntry = {
        name: file.name,
        type: file.name.endsWith('.pdf') ? "PDF Belgesi" : "Word Belgesi",
        date: new Date().toLocaleDateString('tr-TR'),
        risk: `${data.risk_score}%`,
        id: data.db_record?.id || Date.now().toString(),
        analysisData: data
      };
      localStorage.setItem("analysis_history", JSON.stringify([newEntry, ...existingHistory]));

      router.push(`/dashboard/analysis?id=${newEntry.id}`);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full max-w-2xl p-6 rounded-xl bg-slate-50 border-2 border-dashed transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="bg-white rounded-lg p-12 flex flex-col items-center justify-center min-h-[320px] shadow-sm">
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Analiz Ediliyor...</h3>
            <p className="text-slate-500 text-sm">Yapay zeka sözleşmeyi inceliyor.</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sözleşmenizi Yükleyin</h3>
            <p className="text-slate-500 mb-8 text-center text-sm">PDF, DOCX veya TXT belgenizi buraya sürükleyin</p>

            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileSelect} />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900 text-white px-10 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Dosya Seçin
            </button>
            {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
}
