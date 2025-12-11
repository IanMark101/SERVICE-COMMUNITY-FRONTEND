"use client";

import { useState } from "react";
import { X, Lightbulb } from "lucide-react";
import { useDarkMode } from "@/app/context/DarkModeContext";
import api from "@/services/api";

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SuggestionModal({
  isOpen,
  onClose,
  onSuccess,
}: SuggestionModalProps) {
  const { isDark } = useDarkMode();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/suggestions", {
        title: title.trim(),
        description: description.trim(),
      });

      alert("✅ Suggestion submitted successfully! Thank you for your feedback.");
      setTitle("");
      setDescription("");
      setErrors({});
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to submit suggestion";
      alert(`❌ ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
            : "bg-white border-[#e8eaf5]"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lightbulb
              className={`w-6 h-6 ${
                isDark ? "text-yellow-400" : "text-yellow-500"
              }`}
            />
            <h2
              className={`text-2xl font-black ${
                isDark ? "text-slate-100" : "text-[#3d3f56]"
              }`}
            >
              Suggest Service
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`transition-all ${
              isDark
                ? "text-slate-400 hover:text-slate-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p
          className={`mb-6 font-semibold ${
            isDark ? "text-slate-300" : "text-gray-600"
          }`}
        >
          What service type would you like to see on our platform?
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <label
              className={`block text-sm font-black mb-2 ${
                isDark ? "text-slate-200" : "text-[#3d3f56]"
              }`}
            >
              Service Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Photography Services"
              className={`w-full px-4 py-3 border-2 rounded-lg font-semibold focus:outline-none transition-all ${
                errors.title
                  ? isDark
                    ? "border-red-600 bg-red-950/20"
                    : "border-red-400 bg-red-50"
                  : isDark
                  ? "bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-yellow-500"
                  : "border-[#e8eaf5] focus:border-yellow-500 text-[#3d3f56] bg-[#f5f6fb]"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 font-semibold">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label
              className={`block text-sm font-black mb-2 ${
                isDark ? "text-slate-200" : "text-[#3d3f56]"
              }`}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this service is about and why it would be useful..."
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-lg font-semibold focus:outline-none transition-all resize-none ${
                errors.description
                  ? isDark
                    ? "border-red-600 bg-red-950/20"
                    : "border-red-400 bg-red-50"
                  : isDark
                  ? "bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-yellow-500"
                  : "border-[#e8eaf5] focus:border-yellow-500 text-[#3d3f56] bg-[#f5f6fb]"
              }`}
            />
            <p
              className={`text-xs mt-1 font-semibold ${
                isDark ? "text-slate-400" : "text-[#9CA3B8]"
              }`}
            >
              {description.length}/10 characters minimum
            </p>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 font-semibold">
                {errors.description}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 font-bold py-3 rounded-full transition-all border-2 ${
                isDark
                  ? "bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 disabled:opacity-60 text-white font-black py-3 rounded-full transition-all ${
                isDark
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Suggestion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
