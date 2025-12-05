"use client";

import Link from "next/link";
import { Search, Settings, Home, Info, MessageCircle, User } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  onSettingsClick: () => void;
  currentPage?: "home" | "about" | "messages" | "profile";
  onSearch?: (query: string) => void;
  searchResults?: any[];
  showSearchResults?: boolean;
  onSelectResult?: () => void;
  searchType?: "services" | "users";
  onSelectUser?: (userId: string, userName: string) => void;
}

export default function DashboardHeader({ 
  onSettingsClick,
  currentPage = "home",
  onSearch,
  searchResults = [],
  showSearchResults = false,
  onSelectResult,
  searchType = "services",
  onSelectUser
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const getPlaceholder = () => {
    if (searchType === "users" && currentPage === "messages") return "Search users to message";
    if (searchType === "users") return "🔍 Search users";
    return "Search Any Services";
  };

  // ✅ ADD THIS HANDLER FOR MESSAGES PAGE
  const handleSelectUser = (userId: string, userName: string) => {
    setSearchQuery("");
    if (currentPage === "messages" && onSelectUser) {
      onSelectUser(userId, userName);
    }
    if (onSelectResult) onSelectResult();
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-row items-center justify-between gap-6">
          {/* LOGO */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-xl flex items-center justify-center text-white font-black text-4xl shadow-md transform -skew-x-6">
              <span className="transform skew-x-6">S</span>
            </div>
            <div className="text-4xl font-black tracking-tight">
              <span className="text-[#5AC8FA]">Skill</span>
              <span className="text-[#204585]">-Link</span>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="flex-1 mx-8 max-w-lg relative">
            <div className="bg-gray-50 rounded-full px-8 py-4 items-center shadow-md border-2 border-gray-300 hover:border-[#5AC8FA] transition-all flex">
              <Search className="w-7 h-7 text-[#5AC8FA] mr-4" />
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 outline-none text-lg text-[#3d3f56] placeholder:text-[#7CA0D8] font-semibold bg-transparent"
              />
            </div>

            {/* ✅ MODIFIED: SEARCH RESULTS DROPDOWN - FOR MESSAGES PAGE */}
            {searchType === "users" && currentPage === "messages" && showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-gray-200 z-50 max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectUser(result.id, result.name)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black flex-shrink-0">
                      {result.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-[#3d3f56]">{result.name}</p>
                      <p className="text-sm text-gray-500">{result.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* SEARCH RESULTS DROPDOWN - FOR PROFILE PAGE */}
            {searchType === "users" && currentPage === "profile" && showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-gray-200 z-50 max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/dashboard/profile/${result.id}`}
                    onClick={() => {
                      setSearchQuery("");
                      if (onSelectResult) onSelectResult();
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black flex-shrink-0">
                      {result.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-[#3d3f56]">{result.name}</p>
                      <p className="text-sm text-gray-500">{result.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* NAVIGATION TABS */}
          <div className="bg-gradient-to-r from-[#A4C2F4] to-[#7CA0D8] shadow-lg rounded-full px-8 py-4 flex items-center gap-8 whitespace-nowrap">
            <Link
              href="/dashboard"
              className={`text-lg font-bold transition-all flex items-center gap-2 ${
                currentPage === "home"
                  ? "text-[#f0f1f7] drop-shadow-lg"
                  : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <Home className="w-6 h-6" />
              Home
            </Link>

            <Link
              href="/dashboard/about"
              className={`text-lg font-bold transition-all flex items-center gap-2 ${
                currentPage === "about"
                  ? "text-[#f0f1f7] drop-shadow-lg"
                  : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <Info className="w-6 h-6" />
              About
            </Link>

            <Link
              href="/dashboard/messages"
              className={`text-lg font-bold transition-all flex items-center gap-2 ${
                currentPage === "messages"
                  ? "text-[#f0f1f7] drop-shadow-lg"
                  : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              Messages
            </Link>

            <Link
              href="/dashboard/profile"
              className={`text-lg font-bold transition-all flex items-center gap-2 ${
                currentPage === "profile"
                  ? "text-[#f0f1f7] drop-shadow-lg"
                  : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <User className="w-6 h-6" />
              Profile
            </Link>

            <button
              onClick={onSettingsClick}
              className="text-lg font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
            >
              <Settings className="w-6 h-6" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}