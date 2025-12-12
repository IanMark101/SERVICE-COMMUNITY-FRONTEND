"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";
import api from "@/services/api";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isDark } = useDarkMode();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      router.push("/dashboard");
      return;
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/register", { 
        name, 
        email, 
        password 
      });

      if (res.status === 201 || res.status === 200) {
        router.push("/auth/login?registered=true");
      }

    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden py-4 ${
      isDark 
        ? 'bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b]'
        : 'bg-gradient-to-br from-[#EBF4FF] to-[#90CDF4]'
    }`}>
      
      {/* Background Elements */}
      <div className={`absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-20 blur-3xl ${
        isDark ? 'bg-sky-500' : 'bg-[#7CA0D8]'
      }`}></div>
      <div className={`absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full opacity-20 blur-3xl ${
        isDark ? 'bg-indigo-600' : 'bg-[#5AC8FA]'
      }`}></div>

      <div className="relative w-full max-w-lg px-4 z-10">
        
        {/* Logo Section */}
        <div className="flex flex-row items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg transform -skew-x-6">
            <span className="transform skew-x-6">S</span>
          </div>
          <div className="text-3xl font-black tracking-tight">
            <span className="text-[#5AC8FA]">Skill</span>
            <span className={isDark ? 'text-sky-300' : 'text-[#204585]'}>-Link</span>
          </div>
        </div>

        {/* Card Container */}
        <div className={`rounded-[2rem] shadow-2xl border-2 px-8 py-6 relative ${
          isDark 
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-white/50'
        }`}>
          
          <div className="text-center mb-4">
            <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#3d3f56]'}`}>Create Account</h1>
            <p className={`font-bold mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-[#7CA0D8]'}`}>Join our community today</p>
          </div>

          {error && (
            <div className={`border-2 px-4 py-2 rounded-xl font-bold text-center mb-4 text-xs ${
              isDark 
                ? 'bg-red-500/20 border-red-500 text-red-300'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Input */}
            <div>
              <label className={`block text-sm font-black mb-1 ml-2 ${isDark ? 'text-white' : 'text-[#3d3f56]'}`}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="John Doe"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-base font-bold transition-all ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400'
                    : 'border-gray-200 focus:border-[#5AC8FA] text-[#3d3f56] placeholder:text-gray-300 bg-[#f8f9fc]'
                }`}
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label className={`block text-sm font-black mb-1 ml-2 ${isDark ? 'text-white' : 'text-[#3d3f56]'}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="name@example.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-base font-bold transition-all ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400'
                    : 'border-gray-200 focus:border-[#5AC8FA] text-[#3d3f56] placeholder:text-gray-300 bg-[#f8f9fc]'
                }`}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className={`block text-sm font-black mb-1 ml-2 ${isDark ? 'text-white' : 'text-[#3d3f56]'}`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-base font-bold transition-all ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400'
                    : 'border-gray-200 focus:border-[#5AC8FA] text-[#3d3f56] placeholder:text-gray-300 bg-[#f8f9fc]'
                }`}
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className={`block text-sm font-black mb-1 ml-2 ${isDark ? 'text-white' : 'text-[#3d3f56]'}`}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-base font-bold transition-all ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400'
                    : 'border-gray-200 focus:border-[#5AC8FA] text-[#3d3f56] placeholder:text-gray-300 bg-[#f8f9fc]'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-black text-lg py-3 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 ${
                isDark 
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  : 'bg-gradient-to-r from-[#5AC8FA] to-[#007AFF] hover:from-[#007AFF] hover:to-[#0062cc] text-white'
              }`}
            >
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center space-y-3">
            <p className={`font-bold text-sm ${isDark ? 'text-slate-400' : 'text-[#7CA0D8]'}`}>
              Already have an account?{" "}
              <a href="/auth/login" className={`hover:underline font-black ${isDark ? 'text-sky-400' : 'text-[#007AFF]'}`}>
                Sign In
              </a>
            </p>
            
            <div className={`w-full h-0.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}></div>

            <div className={`flex justify-center gap-6 text-xs font-bold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              <a href="/" className={`transition-colors flex items-center gap-1 ${isDark ? 'hover:text-sky-400' : 'hover:text-[#5AC8FA]'}`}>
                <ArrowLeft className="w-3 h-3" /> Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}