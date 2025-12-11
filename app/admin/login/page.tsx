"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { LogIn, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { usePresence } from "@/app/context/PresenceContext";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setPresenceTimeoutMinutes, setPresence } = usePresence();
  const { isDark } = useDarkMode();

  // Check if already logged in as admin
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/admin/login", { email, password });

      const token =
        res.data.token || res.data.data?.token || res.data.accessToken;
      const admin =
        res.data.admin || res.data.data?.admin || res.data.user || null;

      if (!token) {
        setError("Login failed: No token received from server");
        return;
      }

      if (res.data.type === "admin") {
        localStorage.setItem("adminToken", token);
        if (admin) {
          localStorage.setItem("adminUser", JSON.stringify(admin));
        }
        
        // 🟢 Extract presence timeout for admin
        const presenceTimeoutMinutes = res.data.presenceTimeoutMinutes || 5;
        setPresenceTimeoutMinutes(presenceTimeoutMinutes);
        
        router.push("/admin/dashboard");
      } else {
        setError("Not an admin account");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Admin login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
      isDark
        ? 'bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b]'
        : 'bg-gradient-to-br from-[#EBF4FF] to-[#90CDF4]'
    }`}>
      {/* Background shapes */}
      <div className={`absolute top-[-15%] right-[-10%] w-96 h-96 rounded-full opacity-20 blur-3xl ${
        isDark ? 'bg-indigo-600' : 'bg-[#7CA0D8]'
      }`}></div>
      <div className={`absolute bottom-[-15%] left-[-10%] w-[28rem] h-[28rem] rounded-full opacity-20 blur-3xl ${
        isDark ? 'bg-sky-500' : 'bg-[#5AC8FA]'
      }`}></div>

      <div className="relative w-full max-w-md px-6 z-10">
        {/* Logo / brand */}
        <div className="flex flex-row items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-b from-indigo-500 to-sky-500 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-2xl border border-white/10">
            <span>S</span>
          </div>
          <div className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#3d3f56]'}`}>
            <span className="text-sky-400">Skill</span>
            <span className={isDark ? 'text-indigo-200' : 'text-[#204585]'}>-Link</span>
          </div>
        </div>

        {/* Card */}
        <div className={`backdrop-blur-xl rounded-[2.2rem] shadow-2xl p-9 relative ${
          isDark
            ? 'bg-slate-900/80 border border-slate-700/60'
            : 'bg-white border border-white/50'
        }`}>
          {/* Admin badge */}
          <div className="absolute -top-4 right-8 flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-xs font-semibold text-slate-900 shadow-lg border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMIN ACCESS
          </div>

          <div className="text-center mb-7">
            <h1 className={`text-3xl font-black ${isDark ? 'text-slate-50' : 'text-[#3d3f56]'}`}>Admin Console</h1>
            <p className={`font-semibold mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-[#7CA0D8]'}`}>
              Sign in with administrator credentials
            </p>
          </div>

          {error && (
            <div className={`border px-4 py-3 rounded-xl font-semibold text-center mb-5 text-sm ${
              isDark
                ? 'bg-red-500/10 border-red-500/60 text-red-200'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-bold mb-2 ml-1 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="admin@example.com"
                className={`w-full px-4 py-3.5 border rounded-2xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'border-slate-600/70 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:ring-sky-500/40'
                    : 'border-gray-300 bg-[#f8f9fc] text-[#3d3f56] placeholder:text-gray-400 focus:border-[#5AC8FA] focus:ring-[#5AC8FA]/40'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 ml-1 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3.5 pr-11 border rounded-2xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'border-slate-600/70 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:ring-sky-500/40'
                      : 'border-gray-300 bg-[#f8f9fc] text-[#3d3f56] placeholder:text-gray-400 focus:border-[#5AC8FA] focus:ring-[#5AC8FA]/40'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute inset-y-0 right-3 flex items-center ${
                    isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-black text-base py-3.5 rounded-2xl transition-transform transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3 ${
                isDark
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-lg shadow-sky-900/40'
                  : 'bg-gradient-to-r from-[#5AC8FA] to-[#007AFF] hover:from-[#007AFF] hover:to-[#0062cc] text-white shadow-lg'
              }`}
            >
              {isLoading ? (
                "Signing In..."
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In as Admin
                </>
              )}
            </button>
          </form>

          <div className={`mt-7 text-center space-y-4`}>
            <div className={`w-full h-px rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
            <div className={`flex justify-center gap-6 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              <a
                href="/"
                className={`transition-colors flex items-center gap-1 ${isDark ? 'hover:text-sky-400' : 'hover:text-[#007AFF]'}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back Home
              </a>
              <a
                href="/auth/login"
                className={`transition-colors ${isDark ? 'hover:text-sky-400' : 'hover:text-[#007AFF]'}`}
              >
                User Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
