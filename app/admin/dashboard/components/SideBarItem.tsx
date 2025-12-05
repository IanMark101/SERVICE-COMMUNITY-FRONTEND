import React from "react";

export default function SidebarItem({ icon, label, active, onClick }: 
  { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{icon}</div>
      <span className="font-medium text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
    </button>
  );
}
