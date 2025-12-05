import { Trash2, AlertTriangle, User, Calendar } from "lucide-react";
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 text-lg">No reports found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md flex items-center justify-between">
          <p className="font-medium text-sm">{error}</p>
          <button 
            onClick={() => setError("")} 
            className="text-red-500 hover:text-red-700 font-bold text-lg"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-8 bg-gradient-to-b from-rose-500 to-rose-600 rounded-full"></div>
        <h3 className="font-bold text-slate-800 text-lg">Reports ({reports.length})</h3>
      </div>

      <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
        {reports.map((r: any) => (
          <div
            key={r.id}
            className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-100/50 p-5 hover:shadow-md hover:border-rose-200/50 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-rose-500" />
                  <p className="text-sm font-bold text-slate-800">
                    Reported: <span className="text-rose-600">{r.reported?.name || "Unknown"}</span>
                  </p>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Reporter: <span className="font-medium text-slate-700">{r.reporter?.name || "Unknown"}</span>
                </p>
              </div>
              <button
                onClick={() => handleDeleteReport(r.id)}
                disabled={deletingId === r.id}
                className="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all duration-200 flex items-center gap-1 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                {deletingId === r.id ? "Deleting..." : "Delete"}
              </button>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-red-50/30 border border-rose-100/50 p-3 rounded-lg mb-3">
              <p className="text-xs text-rose-700 italic">
                "{r.reason || "No reason provided"}"
              </p>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100/50 text-xs text-slate-600">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-slate-700 font-medium">
                {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
