"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ArrowLeft } from "lucide-react";
import api from "@/services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      router.push("/dashboard");
      return;
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ Store based on type
      if (response.data.type === "user") {
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.push("/dashboard");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Updated background to a visible Blue Gradient
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EBF4FF] to-[#90CDF4] relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#7CA0D8] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#5AC8FA] rounded-full opacity-20 blur-3xl"></div>

      <div className="relative w-full max-w-md px-6 z-10">
        
        {/* Logo Section - Side-by-Side Layout with Original Colors */}
        <div className="flex flex-row items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-xl flex items-center justify-center text-white font-black text-4xl shadow-lg transform -skew-x-6">
            <span className="transform skew-x-6">S</span>
          </div>
          <div className="text-4xl font-black tracking-tight">
            <span className="text-[#5AC8FA]">Skill</span>
            <span className="text-[#204585]">-Link</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-white/50 p-10 relative">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#3d3f56]">Welcome Back</h1>
            <p className="text-[#7CA0D8] font-bold mt-2">Sign in to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl font-bold text-center mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-lg font-black text-[#3d3f56] mb-2 ml-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="name@example.com"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#5AC8FA] text-lg font-bold text-[#3d3f56] placeholder:text-gray-300 transition-all bg-[#f8f9fc]"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-black text-[#3d3f56] mb-2 ml-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#5AC8FA] text-lg font-bold text-[#3d3f56] placeholder:text-gray-300 transition-all bg-[#f8f9fc]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#5AC8FA] to-[#007AFF] hover:from-[#007AFF] hover:to-[#0062cc] text-white font-black text-xl py-4 rounded-2xl shadow-lg transition-transform transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                "Signing In..."
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-[#7CA0D8] font-bold">
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-[#007AFF] hover:underline font-black">
                Sign Up
              </a>
            </p>
            
            <div className="w-full h-0.5 bg-gray-100 rounded-full"></div>

            <div className="flex justify-center gap-6 text-sm font-bold text-gray-400">
              <a href="/" className="hover:text-[#5AC8FA] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back Home
              </a>
              <a href="/admin/login" className="hover:text-[#5AC8FA] transition-colors">
                Admin Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}