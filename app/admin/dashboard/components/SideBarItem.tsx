import React from "react";

export default function SidebarItem({ icon, label, active, onClick }: 
  { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center gap-3 w-full p-3 rounded-xl border transition-all duration-200 group ${active ? 'bg-slate-800/70 border-sky-500/40 text-slate-50 shadow-lg shadow-sky-500/20' : 'text-slate-300 border-transparent hover:bg-slate-800/60 hover:border-slate-700 hover:text-white'}`}
      title={label || undefined}
    >
      <div className={`${active ? 'text-sky-300 drop-shadow' : 'text-slate-400 group-hover:text-white'}`}>{icon}</div>
      {label && <span className="font-semibold text-sm tracking-tight">{label}</span>}
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse" />}
    </button>
  );
}
