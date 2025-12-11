"use client";

import { useDarkMode } from "@/app/context/DarkModeContext";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  const { isDark } = useDarkMode();

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-[#f5f6fb] to-[#e8eaf5]'}`}>
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-lg flex items-center justify-center text-white font-black text-3xl shadow-lg transform -skew-x-6">
            <span className="transform skew-x-6">S</span>
          </div>
          <div className="text-3xl font-black tracking-tight">
            <span className="text-[#5AC8FA]">Skill</span>
            <span className="text-[#204585]">-Link</span>
          </div>
        </div>

        {/* Spinner */}
        <div className="space-y-4">
          <div className={`w-16 h-16 border-4 rounded-full animate-spin mx-auto ${isDark ? 'border-slate-700 border-t-sky-500' : 'border-[#e8eaf5] border-t-[#7CA0D8]'}`}></div>
          <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
