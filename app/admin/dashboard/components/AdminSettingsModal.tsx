"use client";

import { X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import api from "@/services/api";

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSettingsModal({ isOpen, onClose }: AdminSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter an email");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.patch("/admin/me", { email });
      setSuccess("✅ Email updated successfully!");
      setEmail("");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.patch("/admin/me", {
        currentPassword,
        password: newPassword,
      });
      setSuccess("✅ Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/50 border border-slate-800/80 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600/90 via-sky-600/80 to-indigo-700/90 p-6 flex items-center justify-between border-b border-white/15">
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-200 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/70">
          <button
            onClick={() => {
              setActiveTab("email");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-4 px-4 font-semibold transition-all text-sm ${
              activeTab === "email"
                ? "text-sky-200 border-b-2 border-sky-400 bg-slate-800/60 shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            Change Email
          </button>
          <button
            onClick={() => {
              setActiveTab("password");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-4 px-4 font-semibold transition-all text-sm ${
              activeTab === "password"
                ? "text-sky-200 border-b-2 border-sky-400 bg-slate-800/60 shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-slate-100">
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-50 p-3 rounded-xl mb-4 text-sm font-semibold shadow-lg shadow-rose-600/20">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-50 p-3 rounded-xl mb-4 text-sm font-semibold shadow-lg shadow-emerald-600/20">
              {success}
            </div>
          )}

          {/* Change Email Tab */}
          {activeTab === "email" && (
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your new email"
                  className="w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 via-sky-500 to-indigo-500 hover:from-sky-400 hover:via-sky-400 hover:to-indigo-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-sky-600/30 border border-white/10"
              >
                {loading ? "Updating..." : "Update Email"}
              </button>
            </form>
          )}

          {/* Change Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 pr-11 border border-slate-700 rounded-xl bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 hover:from-emerald-400 hover:via-emerald-400 hover:to-emerald-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 border border-white/10"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}