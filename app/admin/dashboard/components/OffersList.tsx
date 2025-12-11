"use client";

import React from "react";
import { Briefcase, Calendar, User } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description: string;
  active: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface OffersListProps {
  offers: Offer[];
  isLoading: boolean;
}

export default function OffersList({ offers, isLoading }: OffersListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (!offers.length) {
    return (
      <div className="text-center py-12 text-slate-200">
        <Briefcase size={48} className="mx-auto text-slate-600 mb-4" />
        <p className="text-slate-300 text-lg">No offers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-500/30"></div>
        <h3 className="font-bold text-slate-50 text-xl tracking-tight">Service Offers ({offers.length})</h3>
      </div>

      <div 
        className="grid gap-4 max-h-[600px] overflow-y-auto pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#0ea5e9 #1e293b'
        }}
      >
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-900/60 rounded-xl border border-slate-800/70 p-5 hover:shadow-lg hover:shadow-sky-500/15 hover:border-sky-400/40 transition-all duration-300 backdrop-blur-xl group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-slate-100 text-lg mb-2 line-clamp-2 leading-6 group-hover:text-slate-50 transition-colors">
                  {offer.title || "Untitled Offer"}
                </h4>
                <p className="text-base text-slate-300 line-clamp-2 mb-3 leading-6 group-hover:text-slate-200 transition-colors">
                  {offer.description || "No description provided"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 transition-all border shadow-sm ${
                  offer.active
                    ? "bg-emerald-500/25 text-emerald-100 border-emerald-500/50 shadow-emerald-500/20"
                    : "bg-slate-800/60 text-slate-300 border-slate-700/50"
                }`}
              >
                {offer.active ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/60">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <User size={14} className="text-sky-400 group-hover:text-sky-300 transition-colors" />
                <div>
                  <p className="font-semibold text-slate-100 leading-5">{offer.user.name}</p>
                  <p className="text-slate-400 text-xs">{offer.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300 justify-end">
                <Calendar size={14} className="text-sky-400 group-hover:text-sky-300 transition-colors" />
                <span className="text-slate-200 font-semibold">
                  {new Date(offer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
