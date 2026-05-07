"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  ShieldAlert,
  Settings,
  LayoutDashboard,
  LogOut,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, href, onClick }: SidebarItemProps) => {
  const classes = cn(
    "group flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
    active
      ? "bg-slate-100 text-slate-900"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  );

  const iconClasses = cn(
    "w-4 h-4",
    active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        <Icon className={iconClasses} />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      <Icon className={iconClasses} />
      <span>{label}</span>
    </button>
  );
};

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 mb-1">
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
        />
        <SidebarItem
          icon={Library}
          label="Library"
          active={isActive("/dashboard/contracts")}
          href="/dashboard/contracts"
        />
        <SidebarItem
          icon={BarChart3}
          label="Analytics"
          active={isActive("/dashboard/intelligence")}
          href="/dashboard/intelligence"
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
        <div className="bg-slate-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">BERT NLP Status</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 w-3/4 transition-all duration-1000"></div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <SidebarItem
            icon={Settings}
            label="Settings"
            active={isActive("/dashboard/settings")}
            href="/dashboard/settings"
          />
          <SidebarItem
            icon={LogOut}
            label="Sign Out"
            onClick={() => {}}
          />
        </div>
      </div>
    </aside>
  );
}
