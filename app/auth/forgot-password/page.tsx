"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import api from "@/services/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setIsSubmitting(true);
      await api.post("/auth/forgot-password", { email });
      setSuccess("If that email is registered, we sent a reset link to your inbox.");
      setEmail("");
    } catch (err: any) {
      const message = err.response?.data?.message || "Could not send reset email";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EBF4FF] to-[#90CDF4] relative overflow-hidden py-4">
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#7CA0D8] rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#5AC8FA] rounded-full opacity-20 blur-3xl" />

      <div className="relative w-full max-w-lg px-4 z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-lg transform -skew-x-6 flex-shrink-0">
            <span className="transform skew-x-6">S</span>
          </div>
          <div className="text-2xl font-black tracking-tight">
            <span className="text-[#5AC8FA]">Skill</span>
            <span className="text-[#204585]">-Link</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-white/50 px-8 py-6 relative">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-black text-[#3d3f56]">Forgot Password</h1>
            <p className="text-[#7CA0D8] font-bold text-sm mt-1">
              Enter your email to receive a reset link
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-lg font-bold text-center mb-4 text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-3 py-2 rounded-lg font-bold text-center mb-4 text-xs flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-[#3d3f56] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                placeholder="name@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#5AC8FA] text-sm font-bold text-[#3d3f56] placeholder:text-gray-300 transition-all bg-[#f8f9fc]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-gradient-to-r from-[#5AC8FA] to-[#007AFF] hover:from-[#007AFF] hover:to-[#0062cc] text-white font-black text-base py-3 rounded-lg shadow-lg transition-transform transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? "Sending Link..." : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <a
              href="/auth/login"
              className="text-[#007AFF] hover:underline font-black text-sm flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
