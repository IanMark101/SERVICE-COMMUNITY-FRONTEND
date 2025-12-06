"use client";

import Link from "next/link";
import { Search, Settings, Home, Info, MessageCircle, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  name: string;
  email?: string;
  type: "user";
}

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const getPlaceholder = () => {
    if (searchType === "users" && currentPage === "messages") return "Search users";
    if (searchType === "users") return "Search Users";
    return "Search Services";
  };

  const handleSelectUser = (userId: string, userName: string) => {
    setSearchQuery("");
    setMobileMenuOpen(false);
    if (currentPage === "messages" && onSelectUser) {
      onSelectUser(userId, userName);
    }
    if (onSelectResult) onSelectResult();
  };

  const handleNavigateToProfile = (userId: string) => {
    setSearchQuery("");
    setMobileMenuOpen(false);
    if (onSelectResult) onSelectResult();
    router.push(`/dashboard/profile/${userId}`);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="px-4 lg:px-6 py-4 lg:py-6">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
          {/* LOGO */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-md transform -skew-x-6">
              <span className="transform skew-x-6">S</span>
            </div>
            <div className="text-2xl font-black tracking-tight">
              <span className="text-[#5AC8FA]">Skill</span>
              <span className="text-[#204585]">-Link</span>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="flex-1 mx-8 max-w-lg relative">
            <div className="bg-gray-50 rounded-full px-6 py-3 items-center shadow-md border-2 border-gray-300 hover:border-[#5AC8FA] transition-all flex">
              <Search className="w-6 h-6 text-[#5AC8FA] mr-3" />
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 outline-none text-sm text-[#3d3f56] placeholder:text-[#7CA0D8] font-semibold bg-transparent"
              />
            </div>

            {/* ✅ Search Results Dropdown - Desktop */}
            {searchType === "users" && showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-gray-200 z-50 max-h-80 overflow-y-auto">
                {searchResults.map((result: SearchResult) => (
                  <button
                    key={`user-${result.id}`}
                    onClick={() => handleNavigateToProfile(result.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black flex-shrink-0 text-sm">
                      {result.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#3d3f56] text-sm truncate">{result.name}</p>
                      <p className="text-xs text-gray-500 truncate">{result.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NAVIGATION TABS */}
          <div className="bg-gradient-to-r from-[#A4C2F4] to-[#7CA0D8] shadow-lg rounded-full px-6 py-3 flex items-center gap-6 whitespace-nowrap">
            <Link
              href="/dashboard"
              className={`text-sm font-bold transition-all flex items-center gap-2 ${
                currentPage === "home"
                  ? "text-[#f0f1f7] drop-shadow-lg"
                  : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <Home className="w-5 h-5" />
              Home
            </Link>

            <Link
              href="/dashboard/about"
              className={`text-sm font-bold transition-all flex items-center gap-2 ${
                currentPage === "about"
                  ? "text-[#f0f1f7] drop-shadow-lg"
                  : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <Info className="w-5 h-5" />
              About
            </Link>

            <Link
              href="/dashboard/messages"
              className={`text-sm font-bold transition-all flex items-center gap-2 ${
                currentPage === "messages"
                  ? "text-[#f0f1f7] drop-shadow-lg"
                  : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Messages
            </Link>

            <Link
              href="/dashboard/profile"
              className={`text-sm font-bold transition-all flex items-center gap-2 ${
                currentPage === "profile"
                  ? "text-[#f0f1f7] drop-shadow-lg"
                  : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <User className="w-5 h-5" />
              Profile
            </Link>

            <button
              onClick={onSettingsClick}
              className="text-sm font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-4">
            {/* LOGO */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md transform -skew-x-6">
                <span className="transform skew-x-6">S</span>
              </div>
              <div className="text-xl font-black tracking-tight">
                <span className="text-[#5AC8FA]">Skill</span>
                <span className="text-[#204585]">Link</span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#7CA0D8] hover:text-[#5AC8FA] transition-all"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="relative mb-4">
            <div className="bg-gray-50 rounded-full px-4 py-2 items-center shadow-md border-2 border-gray-300 flex">
              <Search className="w-5 h-5 text-[#5AC8FA] mr-2" />
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 outline-none text-xs text-[#3d3f56] placeholder:text-[#7CA0D8] font-semibold bg-transparent"
              />
            </div>

            {/* ✅ Search Results Dropdown - Mobile */}
            {searchType === "users" && showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-gray-200 z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result: SearchResult) => (
                  <button
                    key={`user-${result.id}`}
                    onClick={() => handleNavigateToProfile(result.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 transition-all text-left"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black flex-shrink-0 text-xs">
                      {result.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#3d3f56] text-xs truncate">{result.name}</p>
                      <p className="text-xs text-gray-500 truncate">{result.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="bg-gradient-to-r from-[#A4C2F4] to-[#7CA0D8] shadow-lg rounded-2xl p-4 space-y-3">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  currentPage === "home"
                    ? "bg-white/30 text-[#f0f1f7]"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                href="/dashboard/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  currentPage === "about"
                    ? "bg-white/30 text-[#f0f1f7]"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <Info className="w-5 h-5" />
                <span>About</span>
              </Link>

              <Link
                href="/dashboard/messages"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  currentPage === "messages"
                    ? "bg-white/30 text-[#f0f1f7]"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </Link>

              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  currentPage === "profile"
                    ? "bg-white/30 text-[#f0f1f7]"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>

              <button
                onClick={() => {
                  onSettingsClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}