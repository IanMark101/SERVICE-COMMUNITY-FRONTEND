"use client";

import { X } from "lucide-react";
import { useState } from "react";
import api from "@/services/api";

interface Category {
  id: string;
  name: string;
}

interface OfferModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
}

export default function OfferModal({ isOpen, categories, onClose }: OfferModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/services/offer", { title, description, categoryId });
      setTitle("");
      setDescription("");
      setCategoryId("");
      setError("");
      alert("✅ Service offer created successfully!");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-black text-black">Offer Service</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="w-7 h-7" />
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-bold text-black mb-2">Select Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#6FA3EF] text-base font-semibold bg-white text-gray-900"
            >
              <option value="">Choose a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-bold text-black mb-2">Service Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What service do you offer?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#6FA3EF] text-base font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-black mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your service in detail..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#6FA3EF] text-base font-semibold resize-none text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D4A86] hover:bg-[#233a6b] disabled:opacity-50 text-white font-black py-3 rounded-full text-lg transition-all"
          >
            {loading ? "Creating..." : "Create Offer"}
          </button>
        </form>
      </div>
    </div>
  );
}