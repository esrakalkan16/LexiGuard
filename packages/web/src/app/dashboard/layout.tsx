import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Search, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Misafir Kullanıcı");
  const [isGuest, setIsGuest] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email);
        setIsGuest(false);
      }
    };
    getUser();
  }, []);

  // Derive a readable page title from pathname
  const pageTitle = (() => {
    const segment = pathname.split("/").pop() || "dashboard";
    const map: Record<string, string> = {
      dashboard: "Dashboard",
      contracts: "Library",
      analysis: "Risk Analysis",
      intelligence: "Analytics",
      settings: "Settings",
    };
    return map[segment] || segment;
  })();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <main className="ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-slate-500">
              Kullanıcı: <span className="text-slate-900">{userName}</span>
            </h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
              isGuest ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {isGuest ? 'Misafir' : 'Professional'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
              />
            </div>
            {isGuest && (
               <button 
                 onClick={() => router.push('/auth/login')}
                 className="text-xs text-indigo-600 font-semibold hover:underline"
               >
                 Tüm Özellikler İçin Giriş Yap
               </button>
             )}
            <button
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              onClick={() => router.push("/dashboard/analysis")}
            >
              + New Analysis
            </button>
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8 flex-1">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
