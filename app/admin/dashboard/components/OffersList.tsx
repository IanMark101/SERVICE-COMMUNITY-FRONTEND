"use client";

import React from "react";
import { Briefcase, Calendar, User, CheckCircle } from "lucide-react";

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!offers.length) {
    return (
      <div className="text-center py-12">
        <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 text-lg">No offers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
        <h3 className="font-bold text-slate-800 text-lg">
          Service Offers ({offers.length})
        </h3>
      </div>

      <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-100/50 p-5 hover:shadow-md hover:border-purple-200/50 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-base mb-1 line-clamp-2">
                  {offer.title || "Untitled Offer"}
                </h4>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                  {offer.description || "No description provided"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                  offer.active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {offer.active ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100/50">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <User size={14} className="text-blue-500" />
                <div>
                  <p className="font-medium text-slate-700">{offer.user.name}</p>
                  <p className="text-slate-500">{offer.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 justify-end">
                <Calendar size={14} className="text-purple-500" />
                <span className="text-slate-700 font-medium">
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
