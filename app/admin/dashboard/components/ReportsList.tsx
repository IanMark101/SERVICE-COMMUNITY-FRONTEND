import { Trash2, AlertTriangle, Calendar } from "lucide-react";
import React, { useState } from "react";
import api from "@/services/api";

interface ReportsListProps {
  reports: any[];
  isLoading: boolean;
  refreshReports?: () => void;
}

export default function ReportsList({
  reports,
  isLoading,
  refreshReports
}: ReportsListProps) {

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      setDeletingId(reportId);
      await api.delete(`/admin/reports/${reportId}`);
      setDeletingId(null);
      setError("");
      if (refreshReports) refreshReports();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete report");
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400"></div>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="text-center py-12 text-slate-200">
        <AlertTriangle size={48} className="mx-auto text-slate-600 mb-4" />
        <p className="text-slate-300 text-lg">No reports found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-500/20 backdrop-blur-sm border border-rose-500/50 text-rose-50 p-4 rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-between">
          <p className="font-semibold text-sm">{error}</p>
          <button 
            onClick={() => setError("")} 
            className="text-rose-200 hover:text-rose-100 font-bold text-lg"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-8 bg-gradient-to-b from-rose-500 to-red-600 rounded-full shadow-lg shadow-rose-500/30"></div>
        <h3 className="font-bold text-slate-50 text-xl tracking-tight">Reports ({reports.length})</h3>
      </div>

      <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
        {reports.map((r: any) => (
          <div
            key={r.id}
            className="bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-900/60 rounded-xl border border-slate-800/70 p-5 hover:shadow-lg hover:shadow-rose-500/15 hover:border-rose-400/40 transition-all duration-300 backdrop-blur-xl group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-rose-400 group-hover:text-rose-300 transition-colors" />
                  <p className="text-base font-bold text-slate-100 leading-6">
                    Reported: <span className="text-rose-200 group-hover:text-rose-100 transition-colors">{r.reported?.name || "Unknown"}</span>
                  </p>
                </div>
                <p className="text-sm text-slate-300 mb-3 leading-6">
                  Reporter: <span className="font-semibold text-slate-100">{r.reporter?.name || "Unknown"}</span>
                </p>
              </div>
              <button
                onClick={() => handleDeleteReport(r.id)}
                disabled={deletingId === r.id}
                className="px-3 py-2 rounded-lg bg-rose-500/25 hover:bg-rose-500/35 text-rose-100 hover:text-rose-50 transition-all duration-200 flex items-center gap-1 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500/30 hover:border-rose-400/50"
              >
                <Trash2 size={16} />
                {deletingId === r.id ? "Deleting..." : "Delete"}
              </button>
            </div>

            <div className="bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-rose-500/5 border border-rose-500/40 p-6 rounded-lg mb-3 shadow-lg shadow-rose-500/10">
              <p className="text-lg text-rose-50 italic leading-9 font-medium">
                "{r.reason || "No reason provided"}"
              </p>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-800/60 text-sm text-slate-300">
              <Calendar size={14} className="text-sky-400" />
              <span className="text-slate-200 font-semibold">
                {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
