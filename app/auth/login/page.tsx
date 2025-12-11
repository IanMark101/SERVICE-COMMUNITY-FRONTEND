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

  // Capture token from Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    if (token) {
      localStorage.setItem("userToken", token);
      router.push("/dashboard");
    }
  }, [router]);

  // Check if already logged in
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

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EBF4FF] to-[#90CDF4] relative overflow-hidden py-4">
      
      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#7CA0D8] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#5AC8FA] rounded-full opacity-20 blur-3xl"></div>

      <div className="relative w-full max-w-lg px-4 z-10">
        
        {/* Logo Section - Side by Side */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-lg transform -skew-x-6 flex-shrink-0">
            <span className="transform skew-x-6">S</span>
          </div>
          <div className="text-2xl font-black tracking-tight">
            <span className="text-[#5AC8FA]">Skill</span>
            <span className="text-[#204585]">-Link</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-white/50 px-8 py-6 relative">
          
          <div className="text-center mb-4">
            <h1 className="text-2xl font-black text-[#3d3f56]">Welcome Back</h1>
            <p className="text-[#7CA0D8] font-bold text-sm mt-1">Sign in to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-lg font-bold text-center mb-4 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-[#3d3f56] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="name@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#5AC8FA] text-sm font-bold text-[#3d3f56] placeholder:text-gray-300 transition-all bg-[#f8f9fc]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-[#3d3f56] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#5AC8FA] text-sm font-bold text-[#3d3f56] placeholder:text-gray-300 transition-all bg-[#f8f9fc]"
                required
              />
              <div className="mt-2 text-right">
                <a
                  href="/auth/forgot-password"
                  className="text-xs font-black text-[#007AFF] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#5AC8FA] to-[#007AFF] hover:from-[#007AFF] hover:to-[#0062cc] text-white font-black text-base py-3 rounded-lg shadow-lg transition-transform transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                "Signing In..."
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* OAuth Divider */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <span className="text-gray-400 font-bold text-xs">OR</span>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border-2 border-gray-200 hover:border-[#5AC8FA] text-gray-700 font-black text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-[#f8f9fc] mt-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div className="mt-6 text-center space-y-3">
            <p className="text-[#7CA0D8] font-bold text-sm">
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-[#007AFF] hover:underline font-black">
                Sign Up
              </a>
            </p>
            
            <div className="w-full h-0.5 bg-gray-100 rounded-full"></div>

            <div className="flex justify-center gap-4 text-xs font-bold text-gray-400">
              <a href="/" className="hover:text-[#5AC8FA] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back
              </a>
              <a href="/admin/login" className="hover:text-[#5AC8FA] transition-colors">
                Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}