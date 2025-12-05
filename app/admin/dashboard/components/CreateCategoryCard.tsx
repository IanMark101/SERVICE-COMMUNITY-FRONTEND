"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Tag } from "lucide-react";
import api from "@/services/api";

type Category = { id: string; name: string };

export default function CreateCategoryCard({
  categories,
  onMutateAction,  // Renamed from onMutate to onMutateAction
}: {
  categories: Category[];
  onMutateAction: () => void;  // Updated prop name
}) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const create = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/admin/category", { name });
      setName("");
      setSuccess("Category created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      onMutateAction();  // Updated function call
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string) => {
    if (!editingName.trim()) {
      setError("Category name is required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/admin/category/${id}`, { name: editingName });
      setEditingId(null);
      setSuccess("Category updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      onMutateAction();  // Updated function call
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/category/${id}`);
      setSuccess("Category deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      onMutateAction();  // Updated function call
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CREATE FORM */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
          <h3 className="font-bold text-slate-800 text-lg">Create Service Category</h3>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center justify-between">
            <p className="text-sm font-medium">{error}</p>
            <button 
              onClick={() => setError("")} 
              className="text-red-500 hover:text-red-700 text-lg"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-50/80 backdrop-blur-sm border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-lg flex items-center justify-between">
            <p className="text-sm font-medium">{success}</p>
            <button 
              onClick={() => setSuccess("")} 
              className="text-emerald-500 hover:text-emerald-700 text-lg"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Category Name</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && create()}
              placeholder="e.g. Electronics, Plumbing, Tutoring..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <button
              onClick={create}
              disabled={loading || !name.trim()}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/30"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORIES LIST */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <h3 className="font-bold text-slate-800 text-lg">Service Categories ({categories.length})</h3>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-base">No categories created yet</p>
            <p className="text-slate-400 text-sm mt-2">Create one above to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="px-4 py-4 text-left font-bold text-slate-700">Category ID</th>
                  <th className="px-4 py-4 text-left font-bold text-slate-700">Category Name</th>
                  <th className="px-4 py-4 text-right font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr 
                    key={cat.id} 
                    className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors duration-200"
                  >
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          autoFocus
                          className="w-full px-3 py-2 bg-slate-100 border-2 border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && update(cat.id)}
                        />
                      ) : (
                        <span className="font-medium text-slate-800">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-end">
                        {editingId === cat.id ? (
                          <>
                            <button 
                              onClick={() => update(cat.id)}
                              disabled={loading}
                              className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600 hover:text-emerald-700 transition-all disabled:opacity-50"
                              title="Save"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => { setEditingId(null); setEditingName(""); }}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-700 transition-all"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                              disabled={loading}
                              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 transition-all disabled:opacity-50"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => remove(cat.id)}
                              disabled={loading}
                              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}