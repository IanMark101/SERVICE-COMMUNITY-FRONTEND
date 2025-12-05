"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";
import api from "@/services/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EBF4FF] to-[#90CDF4] relative overflow-hidden py-4">
      
      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#7CA0D8] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#5AC8FA] rounded-full opacity-20 blur-3xl"></div>

      <div className="relative w-full max-w-lg px-4 z-10">
        
        {/* Logo Section - Reduced Margin */}
        <div className="flex flex-row items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg transform -skew-x-6">
            <span className="transform skew-x-6">S</span>
          </div>
          <div className="text-3xl font-black tracking-tight">
            <span className="text-[#5AC8FA]">Skill</span>
            <span className="text-[#204585]">-Link</span>
          </div>
        </div>

        {/* Card Container - Compact Padding */}
        <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-white/50 px-8 py-6 relative">
          
          <div className="text-center mb-4">
            <h1 className="text-2xl font-black text-[#3d3f56]">Create Account</h1>
            <p className="text-[#7CA0D8] font-bold mt-1 text-sm">Join our community today</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-2 rounded-xl font-bold text-center mb-4 text-xs">
              {error}
            </div>
          )}

          {/* Form - Tighter Spacing */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-black text-[#3d3f56] mb-1 ml-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="John Doe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5AC8FA] text-base font-bold text-[#3d3f56] placeholder:text-gray-300 transition-all bg-[#f8f9fc]"
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-black text-[#3d3f56] mb-1 ml-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="name@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5AC8FA] text-base font-bold text-[#3d3f56] placeholder:text-gray-300 transition-all bg-[#f8f9fc]"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-black text-[#3d3f56] mb-1 ml-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5AC8FA] text-base font-bold text-[#3d3f56] placeholder:text-gray-300 transition-all bg-[#f8f9fc]"
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-black text-[#3d3f56] mb-1 ml-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5AC8FA] text-base font-bold text-[#3d3f56] placeholder:text-gray-300 transition-all bg-[#f8f9fc]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#5AC8FA] to-[#007AFF] hover:from-[#007AFF] hover:to-[#0062cc] text-white font-black text-lg py-3 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
            <p className="text-[#7CA0D8] font-bold text-sm">
              Already have an account?{" "}
              <a href="/auth/login" className="text-[#007AFF] hover:underline font-black">
                Sign In
              </a>
            </p>
            
            <div className="w-full h-0.5 bg-gray-100 rounded-full"></div>

            <div className="flex justify-center gap-6 text-xs font-bold text-gray-400">
              <a href="/" className="hover:text-[#5AC8FA] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}