"use client";

import { useState } from "react";
import { Lock, LogOut, Eye, EyeOff, X, Edit2 } from "lucide-react";
import { useDarkMode } from "@/app/context/DarkModeContext";
import api from "@/services/api";

interface DashboardModalsProps {
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  showChangePasswordModal: boolean;
  setShowChangePasswordModal: (show: boolean) => void;
  showEditProfileModal: boolean;
  setShowEditProfileModal: (show: boolean) => void;
  onLogout: () => void;
}

export default function DashboardModals({
  showSettingsModal,
  setShowSettingsModal,
  showChangePasswordModal,
  setShowChangePasswordModal,
  showEditProfileModal,
  setShowEditProfileModal,
  onLogout,
}: DashboardModalsProps) {
  const { isDark } = useDarkMode();
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // ============================================
  // EDIT PROFILE HANDLER
  // ============================================
  const handleEditProfile = async () => {
    if (!editForm.name || !editForm.email) {
      alert("Please fill all fields");
      return;
    }

    setEditLoading(true);
    try {
      const response = await api.patch("/users/me", editForm);

      // Update localStorage with new user data
      const updatedUser = response.data.user || response.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("✅ Profile updated successfully!");
      setShowEditProfileModal(false);
      setEditForm({ name: "", email: "" });

      // Reload page to reflect changes
      window.location.reload();
    } catch (err: any) {
      console.error("Edit profile error:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================
  // CHANGE PASSWORD HANDLER
  // ============================================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !changePasswordForm.currentPassword ||
      !changePasswordForm.newPassword ||
      !changePasswordForm.confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (changePasswordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setChangePasswordLoading(true);
    try {
      await api.patch("/users/me", {
        currentPassword: changePasswordForm.currentPassword,
        password: changePasswordForm.newPassword,
      });

      alert("✅ Password changed successfully!");
      setChangePasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePasswordModal(false);
      setShowPasswordFields(false);
    } catch (err: any) {
      console.error("Change password error:", err);
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // ============================================
  // CLOSE HANDLERS (RESET FORM DATA)
  // ============================================
  const handleCloseEditModal = () => {
    setShowEditProfileModal(false);
    setEditForm({ name: "", email: "" });
  };

  const handleClosePasswordModal = () => {
    setShowChangePasswordModal(false);
    setChangePasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordFields(false);
  };

  return (
    <>
      {/* ============================================
          SETTINGS MODAL
          ============================================ */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-8 max-w-sm w-full shadow-2xl border-2 ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-white border-[#e8eaf5]'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className={`transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#3d3f56]'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Edit Profile Button */}
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowEditProfileModal(true);
                }}
                className={`w-full text-white font-black py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
              >
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </button>

              {/* Change Password Button */}
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowChangePasswordModal(true);
                }}
                className={`w-full text-white font-black py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${isDark ? 'bg-sky-600 hover:bg-sky-700' : 'bg-[#7CA0D8] hover:bg-[#6a8ec7]'}`}
              >
                <Lock className="w-5 h-5" />
                Change Password
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  onLogout();
                }}
                className={`w-full text-white font-black py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${isDark ? 'bg-red-700 hover:bg-red-800' : 'bg-[#FF6B6B] hover:bg-[#ee5a52]'}`}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>

              {/* Close Button */}
              <button
                onClick={() => setShowSettingsModal(false)}
                className={`w-full font-bold py-3 rounded-lg transition-all border-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-sky-400 border-slate-600' : 'bg-[#f5f6fb] hover:bg-[#e8eaf5] text-[#7CA0D8] border-[#e8eaf5]'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          EDIT PROFILE MODAL
          ============================================ */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-8 max-w-sm w-full shadow-2xl border-2 ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-white border-[#e8eaf5]'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
                <Edit2 className={`w-6 h-6 ${isDark ? 'text-teal-500' : 'text-[#1CC4B6]'}`} />
                Edit Profile
              </h2>
              <button
                onClick={handleCloseEditModal}
                className={`transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#3d3f56]'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Name Input */}
              <div>
                <label className={`block text-sm font-black mb-2 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 border-2 rounded-lg font-semibold focus:outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-[#e8eaf5] focus:border-[#1CC4B6] text-[#3d3f56] bg-[#f5f6fb] placeholder:text-[#9CA3B8]'}`}
                  disabled={editLoading}
                />
              </div>

              {/* Email Input */}
              <div>
                <label className={`block text-sm font-black mb-2 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 border-2 rounded-lg font-semibold focus:outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-[#e8eaf5] focus:border-[#1CC4B6] text-[#3d3f56] bg-[#f5f6fb] placeholder:text-[#9CA3B8]'}`}
                  disabled={editLoading}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCloseEditModal}
                className={`flex-1 font-bold py-3 rounded-lg transition-all border-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-sky-400 border-slate-600' : 'bg-[#f5f6fb] hover:bg-[#e8eaf5] text-[#7CA0D8] border-[#e8eaf5]'}`}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditProfile}
                disabled={editLoading}
                className={`flex-1 disabled:opacity-60 text-white font-black py-3 rounded-lg transition-all shadow-md hover:shadow-lg ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          CHANGE PASSWORD MODAL
          ============================================ */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-8 max-w-sm w-full shadow-2xl border-2 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-white border-[#e8eaf5]'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
                <Lock className={`w-6 h-6 ${isDark ? 'text-sky-500' : 'text-[#7CA0D8]'}`} />
                Change Password
              </h2>
              <button
                onClick={handleClosePasswordModal}
                className={`transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#3d3f56]'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className={`block text-sm font-black mb-2 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordFields ? "text" : "password"}
                    value={changePasswordForm.currentPassword}
                    onChange={(e) =>
                      setChangePasswordForm({
                        ...changePasswordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                    className={`w-full px-4 py-3 pr-11 border-2 rounded-lg font-semibold focus:outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-[#e8eaf5] focus:border-[#7CA0D8] text-[#3d3f56] bg-[#f5f6fb] placeholder:text-[#9CA3B8]'}`}
                    disabled={changePasswordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className={`absolute right-3 top-3 transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#7CA0D8]'}`}
                    tabIndex={-1}
                  >
                    {showPasswordFields ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className={`block text-sm font-black mb-2 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordFields ? "text" : "password"}
                    value={changePasswordForm.newPassword}
                    onChange={(e) =>
                      setChangePasswordForm({
                        ...changePasswordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    className={`w-full px-4 py-3 pr-11 border-2 rounded-lg font-semibold focus:outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-[#e8eaf5] focus:border-[#7CA0D8] text-[#3d3f56] bg-[#f5f6fb] placeholder:text-[#9CA3B8]'}`}
                    disabled={changePasswordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className={`absolute right-3 top-3 transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#7CA0D8]'}`}
                    tabIndex={-1}
                  >
                    {showPasswordFields ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className={`block text-sm font-black mb-2 ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordFields ? "text" : "password"}
                    value={changePasswordForm.confirmPassword}
                    onChange={(e) =>
                      setChangePasswordForm({
                        ...changePasswordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-3 pr-11 border-2 rounded-lg font-semibold focus:outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-[#e8eaf5] focus:border-[#7CA0D8] text-[#3d3f56] bg-[#f5f6fb] placeholder:text-[#9CA3B8]'}`}
                    disabled={changePasswordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className={`absolute right-3 top-3 transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#9CA3B8] hover:text-[#7CA0D8]'}`}
                    tabIndex={-1}
                  >
                    {showPasswordFields ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={changePasswordLoading}
                className={`w-full disabled:opacity-60 text-white font-black py-3 rounded-lg transition-all shadow-md hover:shadow-lg ${isDark ? 'bg-sky-600 hover:bg-sky-700' : 'bg-[#7CA0D8] hover:bg-[#6a8ec7]'}`}
              >
                {changePasswordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>

            {/* Close Button */}
            <button
              onClick={handleClosePasswordModal}
              className={`w-full mt-3 font-bold py-3 rounded-lg transition-all border-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600' : 'bg-[#f5f6fb] hover:bg-[#e8eaf5] text-[#7CA0D8] border-[#e8eaf5]'}`}
              disabled={changePasswordLoading}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}