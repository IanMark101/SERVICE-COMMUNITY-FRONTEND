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
      className={`${color} rounded-2xl shadow-lg p-8 text-white transition-all duration-300 ${
        clickable 
          ? "cursor-pointer hover:shadow-2xl hover:scale-105 hover:translate-y-[-4px] transform" 
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wide">{title}</p>
          <p className="text-5xl font-bold">{value}</p>
        </div>
        <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm shadow-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}
