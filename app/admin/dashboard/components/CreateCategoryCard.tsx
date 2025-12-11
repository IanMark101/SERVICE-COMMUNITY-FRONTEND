"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Tag } from "lucide-react";
import api from "@/services/api";

type Category = { id: string; name: string };

export default function CreateCategoryCard({
  categories,
  onMutateAction,  
}: {
  categories: Category[];
  onMutateAction: () => void; 
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

    // Check for duplicate categories (case-insensitive)
    const isDuplicate = categories.some(cat => cat.name.toLowerCase() === name.trim().toLowerCase());
    if (isDuplicate) {
      setError(`"${name.trim()}" category already exists`);
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
    <div className="space-y-8 text-slate-100">
      {/* CREATE FORM */}
      <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70 hover:shadow-emerald-500/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-10 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/40"></div>
          <div>
            <h2 className="font-bold text-slate-50 text-3xl">Create Service Category</h2>
            <p className="text-slate-400 text-base mt-1">Add new service types for your platform</p>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-rose-500/20 backdrop-blur-sm border border-rose-500/50 text-rose-50 p-4 rounded-xl flex items-center justify-between shadow-lg shadow-rose-600/25">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-semibold">{error}</p>
            </div>
            <button 
              onClick={() => setError("")} 
              className="text-rose-200 hover:text-rose-100 text-lg hover:bg-rose-500/20 rounded-lg p-1 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/50 text-emerald-50 p-4 rounded-xl flex items-center justify-between shadow-lg shadow-emerald-600/25">
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <p className="text-sm font-semibold">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess("")} 
              className="text-emerald-200 hover:text-emerald-100 text-lg hover:bg-emerald-500/20 rounded-lg p-1 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-base font-bold text-slate-200 uppercase tracking-wider">Category Name</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && create()}
              placeholder="e.g. Electronics, Plumbing, Tutoring..."
              className="flex-1 px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-400 transition-all shadow-sm hover:border-slate-600"
            />
            <button
              onClick={create}
              disabled={loading || !name.trim()}
              className="bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 hover:from-emerald-400 hover:via-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/40 hover:shadow-emerald-500/60 border border-white/20 hover:border-white/30"
            >
              <Plus size={22} />
              <span className="hidden sm:inline">Add Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORIES LIST */}
      <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70 hover:shadow-sky-500/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-10 bg-gradient-to-b from-sky-500 to-indigo-600 rounded-full shadow-lg shadow-sky-500/40"></div>
          <div>
            <h2 className="font-bold text-slate-50 text-3xl">Service Categories</h2>
            <p className="text-slate-400 text-base mt-1">{categories.length} total categories</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl mb-4 shadow-lg">
              <Tag size={32} className="text-slate-500" />
            </div>
            <p className="text-slate-300 text-2xl font-semibold">No categories created yet</p>
            <p className="text-slate-500 text-lg mt-2">Create one above to get started</p>
          </div>
        ) : (
          <div 
            className="overflow-x-auto max-h-[600px] overflow-y-auto pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#10b981 #1e293b'
            }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-800/80 bg-slate-800/30">
                  <th className="px-6 py-4 text-left font-bold text-slate-200 uppercase text-sm tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-200 uppercase text-sm tracking-wider">Category Name</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-200 uppercase text-sm tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr 
                    key={cat.id} 
                    className="border-b border-slate-800/50 hover:bg-slate-800/60 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-sky-500/40 to-indigo-500/40 text-sky-200 rounded-lg text-base font-bold border border-sky-500/50 shadow-lg shadow-sky-500/20">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          autoFocus
                          className="w-full px-4 py-2 bg-slate-900/70 border-2 border-sky-500/60 rounded-xl text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-semibold"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && update(cat.id)}
                        />
                      ) : (
                        <span className="font-semibold text-slate-100 text-lg group-hover:text-slate-50 transition-colors">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        {editingId === cat.id ? (
                          <>
                            <button 
                              onClick={() => update(cat.id)}
                              disabled={loading}
                              className="p-2 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/45 text-emerald-100 hover:text-emerald-50 transition-all disabled:opacity-50 border border-emerald-500/50 hover:border-emerald-400/60 shadow-sm hover:shadow-emerald-500/30"
                              title="Save"
                            >
                              <Check size={20} />
                            </button>
                            <button 
                              onClick={() => { setEditingId(null); setEditingName(""); }}
                              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 hover:text-white transition-all border border-slate-700/50 shadow-sm"
                              title="Cancel"
                            >
                              <X size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                              disabled={loading}
                              className="p-2 rounded-lg bg-sky-500/30 hover:bg-sky-500/45 text-sky-200 hover:text-sky-50 transition-all disabled:opacity-50 border border-sky-500/50 hover:border-sky-400/60 shadow-sm hover:shadow-sky-500/30"
                              title="Edit"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button 
                              onClick={() => remove(cat.id)}
                              disabled={loading}
                              className="p-2 rounded-lg bg-rose-500/30 hover:bg-rose-500/45 text-rose-200 hover:text-rose-50 transition-all disabled:opacity-50 border border-rose-500/50 hover:border-rose-400/60 shadow-sm hover:shadow-rose-500/30"
                              title="Delete"
                            >
                              <Trash2 size={20} />
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