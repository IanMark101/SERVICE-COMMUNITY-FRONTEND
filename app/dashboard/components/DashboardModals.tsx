"use client";

import { useState } from "react";
import { Lock, LogOut, Eye, EyeOff, X, Edit2 } from "lucide-react";
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
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-[#3d3f56]">Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-black transition-all"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Edit Profile Button */}
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowEditProfileModal(true);
                }}
                className="w-full bg-[#1CC4B6] hover:bg-[#19b0a3] text-white font-black py-3 px-6 rounded-full transition-all text-lg flex items-center gap-3"
              >
                <Edit2 className="w-6 h-6" />
                Edit Profile
              </button>

              {/* Change Password Button */}
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowChangePasswordModal(true);
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 px-6 rounded-full transition-all text-lg flex items-center gap-3"
              >
                <Lock className="w-6 h-6" />
                Change Password
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  onLogout();
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-3 px-6 rounded-full transition-all text-lg flex items-center gap-3"
              >
                <LogOut className="w-6 h-6" />
                Logout
              </button>

              {/* Close Button */}
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-full transition-all"
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
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-[#3d3f56] flex items-center gap-2">
                <Edit2 className="w-8 h-8" />
                Edit Profile
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-black transition-all"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#1CC4B6] text-gray-900"
                  disabled={editLoading}
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#1CC4B6] text-gray-900"
                  disabled={editLoading}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseEditModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-full transition-all"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditProfile}
                disabled={editLoading}
                className="flex-1 bg-[#1CC4B6] hover:bg-[#19b0a3] disabled:opacity-60 text-white font-black py-3 rounded-full transition-all"
              >
                {editLoading ? "Saving..." : "Save"}
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
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-[#3d3f56] flex items-center gap-2">
                <Lock className="w-8 h-8" />
                Change Password
              </h2>
              <button
                onClick={handleClosePasswordModal}
                className="text-gray-500 hover:text-black transition-all"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">
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
                    className="w-full px-4 py-3 pr-11 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#6FA3EF] text-gray-900"
                    disabled={changePasswordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
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
                <label className="block text-lg font-bold text-black mb-2">
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
                    className="w-full px-4 py-3 pr-11 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#6FA3EF] text-gray-900"
                    disabled={changePasswordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
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
                <label className="block text-lg font-bold text-black mb-2">
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
                    className="w-full px-4 py-3 pr-11 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#6FA3EF] text-gray-900"
                    disabled={changePasswordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
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
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-black py-3 rounded-full text-lg transition-all"
              >
                {changePasswordLoading ? "Updating..." : "Change Password"}
              </button>
            </form>

            {/* Close Button */}
            <button
              onClick={handleClosePasswordModal}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-full transition-all"
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