"use client";

import { useState, useEffect, ElementType } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileCheck,
  AlertCircle,
  TrendingUp,
  FileSearch,
  Shield,
  FileText,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: ElementType;
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

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function DashboardOverview() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    activeRisks: 0,
    compliant: 0,
    avgRisk: 0
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchAnalyses = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsGuest(!session);

      let allAnalyses = [];

      if (session?.user) {
        const { data, error } = await supabase
          .from("contracts")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && !error) {
          allAnalyses = data;
          const formatted = data.slice(0, 5).map((d: any) => ({
            name: d.filename,
            type: d.analysis_results?.classification || "Belge",
            status: d.risk_score > 70 ? "High Risk" : d.risk_score > 30 ? "Low Risk" : "Secure",
            date: new Date(d.created_at).toLocaleDateString("tr-TR"),
            score: d.risk_score || 0,
            id: d.id,
            analysisData: d.analysis_results
          }));
          setAnalyses(formatted);
        }
      } else {
        // Guest fallback
        const historyStr = localStorage.getItem("analysis_history");
        if (historyStr) {
          allAnalyses = JSON.parse(historyStr);
          setAnalyses(allAnalyses.slice(0, 5));
        }
      }

      // Calculate stats
      const total = allAnalyses.length;
      const scores = allAnalyses.map((a: any) =>
        typeof a.risk_score === 'number' ? a.risk_score :
          (typeof a.score === 'number' ? a.score : 0)
      );

      const activeRisks = scores.filter((s: number) => s > 70).length;
      const compliant = scores.filter((s: number) => s < 30).length;
      const avgRisk = total > 0
        ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / total)
        : 0;

      setStats({ total, activeRisks, compliant, avgRisk });

      // Prepare Chart Data (last 7 analyses)
      const chartPoints = [...allAnalyses]
        .reverse()
        .slice(-7)
        .map((a: any) => ({
          name: new Date(a.created_at || Date.now()).toLocaleDateString("tr-TR", { day: 'numeric', month: 'short' }),
          risk: typeof a.risk_score === 'number' ? a.risk_score : (typeof a.score === 'number' ? a.score : 0)
        }));
      setChartData(chartPoints);
    };

    fetchAnalyses();
  }, []);


  return (
    <div className="w-full">
      <div className="space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={FileSearch} label="Total Analysis" value={stats.total.toString()} color="slate" />
          <StatCard icon={AlertCircle} label="Active Risks" value={stats.activeRisks.toString()} color="amber" />
          <StatCard icon={FileCheck} label="Compliant" value={stats.compliant.toString()} color="emerald" />
          <StatCard icon={TrendingUp} label="Risk Avg." value={`${stats.avgRisk}%`} color="slate" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Section: Table + Chart */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Recent Investigations Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Recent Investigations
                </span>
                <Link
                  href="/dashboard/contracts"
                  className="text-[10px] font-bold text-slate-900 hover:underline uppercase tracking-widest"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {analyses.length > 0 ? analyses.map((item: any, i: number) => {
                  const score = item.score || 0;
                  const status = item.status || "Secure";
                  const date = item.date || "";
                  const type = item.type || "";

                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      onClick={() => setSelectedAnalysis(item)}
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
                              score > 70 ? "text-rose-500" : score > 30 ? "text-amber-500" : "text-emerald-500"
                            )}
                          >
                            {score}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold border min-w-[75px] text-center",
                            score > 70
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : score > 30
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                          )}
                        >
                          {status.toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="p-12 text-center text-slate-400 text-sm italic">
                    Henüz bir analiz bulunmuyor. Yeni bir analiz yaparak başlayın!
                  </div>
                )}
              </div>
            </div>

            {/* Risk Trend Chart */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[350px]">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Risk Evolution Trend
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Analysis Score</span>
                </div>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.05} />
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke="#0f172a"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRisk)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Sidebar Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {isGuest && (
              <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-colors" />
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 relative z-10">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2 relative z-10">Guest Access</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 relative z-10">
                  Analiz geçmişinizi kaydetmek ve akıllı kütüphane özelliklerine erişmek için hemen ücretsiz kayıt olun.
                </p>
                <Link
                  href="/auth/register"
                  className="block w-full py-3.5 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-center hover:bg-slate-100 transition-all relative z-10"
                >
                  Register Now
                </Link>
              </div>
            )}

            {/* Risk Scorecard */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Intelligence Summary
              </h4>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  {stats.avgRisk}
                </span>
                <span className="text-slate-300 font-bold mb-1">/ 100</span>
              </div>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">
                      High Risk Contracts
                    </span>
                    <span className="text-rose-600">{stats.activeRisks} Files</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.activeRisks / (stats.total || 1)) * 100}%` }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">
                      Secure Compliance
                    </span>
                    <span className="text-slate-900">{stats.compliant} Documents</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.compliant / (stats.total || 1)) * 100}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
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
                    {selectedAnalysis.type || "Belge"} • {selectedAnalysis.date}
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
    </div>
  );
}
