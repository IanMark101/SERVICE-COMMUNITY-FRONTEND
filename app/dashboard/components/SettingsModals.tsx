"use client";

import { X, LogOut, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/services/api";

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
      alert("Please fill all fields");
      return;
    }

    setEditLoading(true);
    try {
      await api.patch("/users/me", { name: editForm.name, email: editForm.email });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.name = editForm.name;
      user.email = editForm.email;
      localStorage.setItem("user", JSON.stringify(user));
      alert("✅ Profile updated successfully!");
      onCloseEditProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch("/users/me", {
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword,
      });
      alert("✅ Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      onCloseChangePassword();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Settings Modal
  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
          <h2 className="text-3xl font-black text-[#3d3f56] mb-6">Settings</h2>

          <button
            onClick={onEditProfileClick}
            className="w-full bg-[#1CC4B6] hover:bg-[#19b0a3] text-white font-black py-3 px-6 rounded-full transition-all text-lg flex items-center gap-3"
          >
            <span>✏️</span>
            Edit Profile
          </button>

          <button
            onClick={onChangePasswordClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 px-6 rounded-full transition-all text-lg flex items-center gap-3"
          >
            <Lock className="w-6 h-6" />
            Change Password
          </button>

          <button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-3 px-6 rounded-full transition-all text-lg flex items-center gap-3"
          >
            <LogOut className="w-6 h-6" />
            Logout
          </button>

          <button
            onClick={onCloseSettings}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-full transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Edit Profile Modal
  if (showEditProfile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-[#3d3f56]">Edit Profile</h2>
            <button onClick={onCloseEditProfile} className="text-gray-500 hover:text-black">
              <X className="w-7 h-7" />
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-lg font-bold text-black mb-2">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#6FA3EF] text-base font-semibold text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-black mb-2">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#6FA3EF] text-base font-semibold text-gray-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={editLoading}
              className="w-full bg-[#1CC4B6] hover:bg-[#19b0a3] disabled:opacity-50 text-white font-black py-3 rounded-full text-lg transition-all"
            >
              {editLoading ? "Updating..." : "Update Profile"}
            </button>
          </form>

          <button
            onClick={onCloseEditProfile}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-full transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Change Password Modal
  if (showChangePassword) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-[#3d3f56]">Change Password</h2>
            <button onClick={onCloseChangePassword} className="text-gray-500 hover:text-black">
              <X className="w-7 h-7" />
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: "currentPassword", label: "Current Password" },
              { key: "newPassword", label: "New Password" },
              { key: "confirmPassword", label: "Confirm Password" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-lg font-bold text-black mb-2">{label}</label>
                <div className="relative">
                  <input
                    type={showPasswordFields ? "text" : "password"}
                    value={passwordForm[key as keyof typeof passwordForm]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                    className="w-full px-4 py-3 pr-11 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#6FA3EF] text-base font-semibold text-gray-900"
                    disabled={passwordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPasswordFields ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-black py-3 rounded-full text-lg transition-all"
            >
              {passwordLoading ? "Updating..." : "Change Password"}
            </button>
          </form>

          <button
            onClick={onCloseChangePassword}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-full transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return null;
}