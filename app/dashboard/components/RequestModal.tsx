"use client";

import { X } from "lucide-react";
import { useState } from "react";
import api from "@/services/api";

interface Category {
  id: string;
  name: string;
}

interface RequestModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestModal({ isOpen, categories, onClose, onSuccess }: RequestModalProps) {
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe your service request");
      return;
    }
    if (!categoryId) {
      setError("Please select a service category");
      return;
    }

    setLoading(true);
    try {
      await api.post("/services/request", { description, categoryId });
      setDescription("");
      setCategoryId("");
      setError("");
      alert("✅ Service request posted successfully!");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-black text-black">Request Service</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="w-7 h-7" />
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-bold text-black mb-2">Service Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#6FA3EF] text-base font-semibold bg-white text-gray-900"
              required
            >
              <option value="">Choose a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-bold text-black mb-2">Describe what you need *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the service you're looking for..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#6FA3EF] text-base font-semibold resize-none text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1CC4B6] hover:bg-[#19b0a3] disabled:opacity-50 text-white font-black py-3 rounded-full text-lg transition-all"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}