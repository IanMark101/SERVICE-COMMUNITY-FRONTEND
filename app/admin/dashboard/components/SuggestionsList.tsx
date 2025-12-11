"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Check, X, Loader2, Lightbulb, Trash2, User, Calendar } from "lucide-react";
import api from "@/services/api";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface SuggestionsListProps {
  isLoading?: boolean;
  refreshSuggestions?: () => void;
}

export default function SuggestionsList({ isLoading: parentIsLoading = false, refreshSuggestions }: SuggestionsListProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    fetchSuggestions();
  }, [activeFilter]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeFilter === "all" 
        ? "/suggestions/all" 
        : `/suggestions/all?status=${activeFilter}`;
      
      const response = await api.get(endpoint);
      setSuggestions(Array.isArray(response.data) ? response.data : response.data?.suggestions || []);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load suggestions");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/suggestions/${id}/approve`);
      alert("✅ Suggestion approved! Service category created.");
      await fetchSuggestions();
      refreshSuggestions?.();
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.message || "Failed to approve"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/suggestions/${id}/reject`);
      alert("✅ Suggestion rejected.");
      await fetchSuggestions();
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.message || "Failed to reject"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${status} suggestion?${status === "approved" ? " This will also delete the associated service category." : ""}`)) {
      return;
    }

    setProcessingId(id);
    try {
      await api.delete(`/suggestions/${id}`);
      let message = "✅ Suggestion deleted.";
      if (status === "approved") {
        message = "✅ Suggestion and service category deleted.";
      }
      alert(message);
      await fetchSuggestions();
      refreshSuggestions?.();
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.message || "Failed to delete"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSuggestions = activeFilter === "all" 
    ? suggestions 
    : suggestions.filter(s => s.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-amber-100", text: "text-amber-900", badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" };
      case "approved":
        return { bg: "bg-emerald-100", text: "text-emerald-900", badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-900", badge: "bg-red-500/20 text-red-300 border border-red-500/40" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-900", badge: "bg-gray-600/20 text-gray-300 border border-gray-600/40" };
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
              activeFilter === filter
                ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-950/50 border border-rose-800 text-rose-200 px-6 py-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading || parentIsLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-sky-400" />
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700">
          <Lightbulb className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
          <p className="text-slate-400 font-medium">No {activeFilter === "all" ? "" : activeFilter} suggestions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => {
            const colors = getStatusColor(suggestion.status);
            return (
              <div
                key={suggestion.id}
                className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-6 border border-slate-800/70 hover:shadow-sky-500/10 transition-all group"
              >
                {/* Top Row: Title and Status */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-50">{suggestion.title}</h3>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap ${colors.badge}`}>
                    {suggestion.status.toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-base mb-4 leading-relaxed">{suggestion.description}</p>

                {/* User and Date Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 py-4 bg-slate-800/40 rounded-xl px-4 border border-slate-700/30">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Suggested By</p>
                    <p className="text-sm font-bold text-slate-50">{suggestion.user.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{suggestion.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Date Submitted</p>
                    <p className="text-sm font-bold text-slate-50">
                      {new Date(suggestion.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(suggestion.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  {suggestion.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(suggestion.id)}
                        disabled={processingId === suggestion.id}
                        className="flex-1 min-w-[140px] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-emerald-700 disabled:to-emerald-600 disabled:opacity-50 text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        {processingId === suggestion.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(suggestion.id)}
                        disabled={processingId === suggestion.id}
                        className="flex-1 min-w-[140px] bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-100 font-bold text-sm py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        {processingId === suggestion.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleDelete(suggestion.id, suggestion.status)}
                        disabled={processingId === suggestion.id}
                        className="flex-1 min-w-[140px] bg-rose-700/40 hover:bg-rose-700/60 disabled:opacity-50 text-rose-200 font-bold text-sm py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border border-rose-600/40 hover:border-rose-600/60"
                      >
                        {processingId === suggestion.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>Delete</span>
                      </button>
                    </>
                  )}

                  {(suggestion.status === "approved" || suggestion.status === "rejected") && (
                    <button
                      onClick={() => handleDelete(suggestion.id, suggestion.status)}
                      disabled={processingId === suggestion.id}
                      className="bg-rose-700/40 hover:bg-rose-700/60 disabled:opacity-50 text-rose-200 font-bold text-sm py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 border border-rose-600/40 hover:border-rose-600/60"
                    >
                      {processingId === suggestion.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>Delete {suggestion.status === "approved" ? "& Category" : ""}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
