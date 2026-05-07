"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileCheck,
  AlertCircle,
  TrendingUp,
  FileSearch,
  Shield,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-300 hover:-translate-y-0.5">
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "p-2.5 rounded-lg",
          color === "blue"
            ? "bg-slate-50 text-slate-900"
            : color === "amber"
            ? "bg-amber-50 text-amber-600"
            : color === "emerald"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-50 text-slate-500"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
          {label}
        </p>
        <h4 className="text-xl font-black text-slate-900 tracking-tight">
          {value}
        </h4>
      </div>
    </div>
  </div>
);

export default function DashboardOverview() {
  const [analyses, setAnalyses] = useState<any[]>([]);

  useEffect(() => {
    const historyStr = localStorage.getItem("analysis_history");
    if (historyStr) {
      setAnalyses(JSON.parse(historyStr));
    } else {
      setAnalyses([
        {
          name: "SaaS_Agreement_Alpha.pdf",
          type: "SaaS",
          status: "High Risk",
          date: "2h ago",
          score: 82,
        },
        {
          name: "Service_Protocol_v2.docx",
          type: "Service",
          status: "Low Risk",
          date: "Yesterday",
          score: 12,
        },
        {
          name: "NDA_Final.txt",
          type: "NDA",
          status: "Secure",
          date: "3d ago",
          score: 4,
        },
      ]);
    }
  }, []);

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FileSearch} label="Total Analysis" value="48" color="blue" />
        <StatCard icon={AlertCircle} label="Active Risks" value="12" color="amber" />
        <StatCard icon={FileCheck} label="Compliant" value="32" color="emerald" />
        <StatCard icon={TrendingUp} label="Risk Avg." value="18%" color="slate" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Investigations Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Recent Investigations
            </span>
            <Link
              href="/dashboard/contracts"
              className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {analyses.map((item: any, i: number) => {
              const score =
                typeof item.score === "number"
                  ? item.score
                  : typeof item.risk === "string"
                  ? parseInt(item.risk)
                  : 0;
              const status =
                item.status ||
                (score > 70 ? "High Risk" : score > 30 ? "Low Risk" : "Secure");
              const date = item.date || "";
              const type = item.type || "";

              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-slate-200">
                      <FileText className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </h5>
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">
                        {type} • {date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden sm:block text-right">
                      <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">
                        Score
                      </div>
                      <div
                        className={cn(
                          "text-xs font-black",
                          score > 70
                            ? "text-rose-500"
                            : score > 30
                            ? "text-amber-500"
                            : "text-emerald-500"
                        )}
                      >
                        {score}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold border",
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
        </div>

        {/* Right Sidebar Cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Risk Scorecard */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Risk Scorecard
            </h4>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">
                74
              </span>
              <span className="text-slate-300 font-bold mb-1">/ 100</span>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">
                    Critical Risks
                  </span>
                  <span className="text-rose-600">3 Topics</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[70%] rounded-full" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">
                    Compliance
                  </span>
                  <span className="text-slate-900">82% Overall</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[82%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* BERT Summary Card */}
          <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative group">
            <Shield className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
              BERT Summary
            </h4>
            <p className="text-sm font-medium text-slate-300 leading-relaxed relative z-10 mb-6">
              Last month's analysis revealed 3 critical liability mismatches
              across 24 documents.
            </p>
            <Link
              href="/dashboard/intelligence"
              className="block w-full py-2.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors relative z-10 text-center"
            >
              Download Full Intelligence
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
