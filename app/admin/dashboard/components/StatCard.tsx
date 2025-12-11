import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  clickable?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  onClick,
  clickable = false 
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`${color} rounded-2xl shadow-2xl p-8 text-white transition-all duration-300 relative overflow-hidden group ${
        clickable 
          ? "cursor-pointer hover:shadow-2xl hover:shadow-black/40 hover:scale-105 hover:translate-y-[-4px] transform" 
          : ""
      } border border-white/10 backdrop-blur-sm`}
    >
      {/* Gradient overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-white/70 text-xs font-bold mb-3 uppercase tracking-wider letter-spacing-1">{title}</p>
          <p className="text-6xl font-black bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{value}</p>
        </div>
        <div className="bg-white/15 rounded-2xl p-5 backdrop-blur-xl shadow-xl border border-white/20 group-hover:bg-white/20 transition-all duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
}
