"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  BarChart3,
  FileText,
  ShieldAlert,
  Settings,
  LayoutDashboard,
  LogOut,
  Library,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  locked?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active, href, onClick, locked }: SidebarItemProps) => {
  const classes = cn(
    "group flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium relative",
    active
      ? "bg-slate-100 text-slate-900"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
    locked && "opacity-60 cursor-not-allowed hover:bg-transparent hover:text-slate-500"
  );

  const iconClasses = cn(
    "w-4 h-4",
    active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600",
    locked && "group-hover:text-slate-400"
  );

  const content = (
    <>
      <Icon className={iconClasses} />
      <span>{label}</span>
      {locked && (
        <Lock className="w-3 h-3 ml-auto text-slate-300" />
      )}
    </>
  );

  if (locked) {
    return (
      <div className={classes} title="Kayıt olarak bu özelliği açın">
        {content}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {content}
    </button>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      
      // Misafir kullanıcı Dashboard'a girmeye çalışırsa Analiz'e yönlendir
      if (!session && pathname === "/dashboard") {
        router.push("/dashboard/analysis");
      }
    };
    checkSession();
  }, [pathname, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const isGuest = !session && !loading;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">LexiGuard</span>
        </Link>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          Contract Intelligence
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <SidebarItem
          icon={LayoutDashboard}
          label="Dashboard"
          active={isActive("/dashboard") && pathname === "/dashboard"}
          href="/dashboard"
          locked={isGuest}
        />
        <SidebarItem
          icon={Library}
          label="Library"
          active={isActive("/dashboard/contracts")}
          href="/dashboard/contracts"
          locked={isGuest}
        />
        <SidebarItem
          icon={BarChart3}
          label="My Analyses"
          active={isActive("/dashboard/intelligence")}
          href="/dashboard/intelligence"
          locked={isGuest}
        />
        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Tools
        </div>
        <SidebarItem
          icon={FileText}
          label="Analyze New"
          active={isActive("/dashboard/analysis")}
          href="/dashboard/analysis"
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        {isGuest ? (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
             <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2">Guest Mode</p>
             <p className="text-[10px] text-blue-600 mb-3">Analizlerinizi kaydetmek için hesap oluşturun.</p>
             <Link 
              href="/auth/register" 
              className="block w-full py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg text-center hover:bg-blue-700 transition-colors"
             >
               SIGN UP FREE
             </Link>
          </div>
        ) : (
          <div className="bg-slate-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">BERT NLP Status</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 w-3/4 transition-all duration-1000"></div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-1">
          <SidebarItem
            icon={Settings}
            label="Settings"
            active={isActive("/dashboard/settings")}
            href="/dashboard/settings"
            locked={isGuest}
          />
          <SidebarItem
            icon={isGuest ? FileText : LogOut}
            label={isGuest ? "Sign In" : "Sign Out"}
            onClick={isGuest ? () => router.push("/auth/login") : handleSignOut}
          />
        </div>
      </div>
    </aside>
  );
}
