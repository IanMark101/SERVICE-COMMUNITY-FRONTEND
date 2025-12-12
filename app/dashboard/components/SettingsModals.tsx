"use client";

import { X, LogOut, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useDarkMode } from "@/app/context/DarkModeContext";
import api from "@/services/api";
import { useToast } from "./Toast";

interface SettingsModalsProps {
  showSettings: boolean;
  showEditProfile: boolean;
  showChangePassword: boolean;
  onCloseSettings: () => void;
  onCloseEditProfile: () => void;
  onCloseChangePassword: () => void;
  onEditProfileClick: () => void;
  onChangePasswordClick: () => void;
  onLogout: () => void;
}

export default function SettingsModals({
  showSettings,
  showEditProfile,
  showChangePassword,
  onCloseSettings,
  onCloseEditProfile,
  onCloseChangePassword,
  onEditProfileClick,
  onChangePasswordClick,
  onLogout,
}: SettingsModalsProps) {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [editLoading, setEditLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (showEditProfile) {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setEditForm({ name: userData.name, email: userData.email });
      }
    }
  }, [showEditProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      showToast("Please fill all fields", "warning");
      return;
    }

    setEditLoading(true);
    try {
      await api.patch("/users/me", { name: editForm.name, email: editForm.email });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.name = editForm.name;
      user.email = editForm.email;
      localStorage.setItem("user", JSON.stringify(user));
      showToast("Profile updated successfully!", "success");
      onCloseEditProfile();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast("Please fill all fields", "warning");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match", "warning");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "warning");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch("/users/me", {
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword,
      });
      showToast("Password changed successfully!", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      onCloseChangePassword();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Settings Modal
  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-2xl p-8 max-w-sm w-full shadow-2xl border-2 ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-white border-[#e8eaf5]'}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>Settings</h2>
            <button
              onClick={onCloseSettings}
              className={`transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#3d3f56]'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={onEditProfileClick}
              className={`w-full text-white font-black py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
            >
              <span>✏️</span>
              Edit Profile
            </button>

            <button
              onClick={onChangePasswordClick}
              className={`w-full text-white font-black py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${isDark ? 'bg-sky-600 hover:bg-sky-700' : 'bg-[#7CA0D8] hover:bg-[#6a8ec7]'}`}
            >
              <Lock className="w-5 h-5" />
              Change Password
            </button>

            <button
              onClick={onLogout}
              className={`w-full text-white font-black py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${isDark ? 'bg-red-700 hover:bg-red-800' : 'bg-[#FF6B6B] hover:bg-[#ee5a52]'}`}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>

            <button
              onClick={onCloseSettings}
              className={`w-full font-bold py-3 rounded-lg transition-all border-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-sky-400 border-slate-600' : 'bg-[#f5f6fb] hover:bg-[#e8eaf5] text-[#7CA0D8] border-[#e8eaf5]'}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit Profile Modal
  if (showEditProfile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-2xl p-8 max-w-sm w-full shadow-2xl border-2 ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-white border-[#e8eaf5]'}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
              <span>✏️</span>
              Edit Profile
            </h2>
            <button onClick={onCloseEditProfile} className={`transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#3d3f56]'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className={`block text-sm font-black mb-2 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter your name"
                className={`w-full px-4 py-3 border-2 rounded-lg font-semibold focus:outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-[#e8eaf5] focus:border-[#1CC4B6] text-[#3d3f56] bg-[#f5f6fb] placeholder:text-[#9CA3B8]'}`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-black mb-2 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>Email Address</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 border-2 rounded-lg font-semibold focus:outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-[#e8eaf5] focus:border-[#1CC4B6] text-[#3d3f56] bg-[#f5f6fb] placeholder:text-[#9CA3B8]'}`}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCloseEditProfile}
                disabled={editLoading}
                className={`flex-1 font-bold py-3 rounded-lg transition-all border-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-sky-400 border-slate-600' : 'bg-[#f5f6fb] hover:bg-[#e8eaf5] text-[#7CA0D8] border-[#e8eaf5]'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className={`flex-1 disabled:opacity-60 text-white font-black py-3 rounded-lg transition-all shadow-md hover:shadow-lg ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Change Password Modal
  if (showChangePassword) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-2xl p-8 max-w-sm w-full shadow-2xl border-2 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-white border-[#e8eaf5]'}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
              🔐
              Change Password
            </h2>
            <button onClick={onCloseChangePassword} className={`transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#3d3f56]'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            {[
              { key: "currentPassword", label: "Current Password", placeholder: "Enter current password" },
              { key: "newPassword", label: "New Password", placeholder: "Enter new password" },
              { key: "confirmPassword", label: "Confirm New Password", placeholder: "Confirm new password" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={`block text-sm font-black mb-2 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>{label}</label>
                <div className="relative">
                  <input
                    type={showPasswordFields ? "text" : "password"}
                    value={passwordForm[key as keyof typeof passwordForm]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 pr-11 border-2 rounded-lg font-semibold focus:outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-[#e8eaf5] focus:border-[#7CA0D8] text-[#3d3f56] bg-[#f5f6fb] placeholder:text-[#9CA3B8]'}`}
                    disabled={passwordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className={`absolute right-3 top-3 transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#7CA0D8]'}`}
                    tabIndex={-1}
                  >
                    {showPasswordFields ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCloseChangePassword}
                disabled={passwordLoading}
                className={`flex-1 font-bold py-3 rounded-lg transition-all border-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-sky-400 border-slate-600' : 'bg-[#f5f6fb] hover:bg-[#e8eaf5] text-[#7CA0D8] border-[#e8eaf5]'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className={`flex-1 disabled:opacity-60 text-white font-black py-3 rounded-lg transition-all shadow-md hover:shadow-lg ${isDark ? 'bg-sky-600 hover:bg-sky-700' : 'bg-[#7CA0D8] hover:bg-[#6a8ec7]'}`}
              >
                {passwordLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}