import React from 'react';
import { 
  BarChart3, 
  FileText, 
  ShieldAlert, 
  Settings, 
  History,
  LayoutDashboard,
  LogOut,
  Library
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
      active 
        ? "bg-slate-100 text-slate-900" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-4 h-4", active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600")} />
    <span>{label}</span>
  </button>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <ShieldAlert className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">LexiGuard</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Contract Intelligence</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
        />
        <SidebarItem 
          icon={Library} 
          label="Library" 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        />
        <SidebarItem 
          icon={BarChart3} 
          label="Analytics" 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')}
        />
        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tools</div>
        <SidebarItem 
          icon={FileText} 
          label="Analyze New" 
          active={activeTab === 'analyzer'} 
          onClick={() => setActiveTab('analyzer')}
        />
      </nav>

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
            onClick={() => {}}
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
