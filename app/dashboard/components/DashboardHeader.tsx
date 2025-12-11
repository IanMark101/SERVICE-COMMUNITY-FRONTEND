"use client";

import Link from "next/link";
import { Search, Settings, Home, Info, MessageCircle, User, Menu, X, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/app/context/DarkModeContext";

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
  const { isDark, toggleDarkMode } = useDarkMode();
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
    <nav className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-lg sticky top-0 z-50 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
      <div className="px-6 lg:px-8 py-4 lg:py-6">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-row items-center justify-between gap-8 w-full">
          {/* LOGO */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-xl flex items-center justify-center text-white font-black text-3xl shadow-md transform -skew-x-6">
              <span className="transform skew-x-6">S</span>
            </div>
            <div className={`text-3xl font-black tracking-tight`}>
              <span className="text-[#5AC8FA]">Skill</span>
              <span className={isDark ? 'text-gray-300' : 'text-[#204585]'}>-Link</span>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="flex-1 mx-4 max-w-2xl relative">
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-300'} rounded-full px-6 py-3 items-center shadow-md border-2 hover:border-[#5AC8FA] transition-all flex`}>
              <Search className="w-5 h-5 text-[#5AC8FA] mr-2" />
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`flex-1 outline-none text-base ${isDark ? 'bg-slate-800 text-gray-100 placeholder:text-gray-400' : 'text-[#3d3f56] placeholder:text-[#7CA0D8] bg-transparent'} font-semibold`}
              />
            </div>

            {/* ✅ Search Results Dropdown - Desktop */}
            {searchType === "users" && showSearchResults && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border-2 z-50 max-h-80 overflow-y-auto`}>
                {searchResults.map((result: SearchResult) => (
                  <button
                    key={`user-${result.id}`}
                    onClick={() => handleNavigateToProfile(result.id)}
                    className={`w-full flex items-center gap-3 p-4 ${isDark ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-gray-50 border-gray-100'} border-b transition-all text-left`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black flex-shrink-0 text-base">
                      {result.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-black text-base truncate ${isDark ? 'text-gray-100' : 'text-[#3d3f56]'}`}>{result.name}</p>
                      <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{result.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NAVIGATION TABS */}
          <div className={`${isDark ? 'bg-slate-800 shadow-lg' : 'bg-gradient-to-r from-[#A4C2F4] to-[#7CA0D8] shadow-lg'} rounded-full px-10 py-4 flex items-center gap-8 whitespace-nowrap`}>
            <Link
              href="/dashboard"
              className={`text-lg font-bold transition-all flex items-center gap-2 ${
                currentPage === "home"
                  ? isDark ? 'text-sky-300' : "text-[#f0f1f7] drop-shadow-lg"
                  : isDark ? 'text-gray-300 hover:text-sky-300' : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <Home className="w-6 h-6" />
              Home
            </Link>

            <Link
              href="/dashboard/about"
              className={`text-lg font-bold transition-all flex items-center gap-2 ${
                currentPage === "about"
                  ? isDark ? 'text-sky-300' : "text-[#f0f1f7] drop-shadow-lg"
                  : isDark ? 'text-gray-300 hover:text-sky-300' : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <Info className="w-6 h-6" />
              About
            </Link>

            <Link
              href="/dashboard/messages"
              className={`text-lg font-bold transition-all flex items-center gap-2 ${
                currentPage === "messages"
                  ? isDark ? 'text-sky-300' : "text-[#f0f1f7] drop-shadow-lg"
                  : isDark ? 'text-gray-300 hover:text-sky-300' : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              Messages
            </Link>

            <Link
              href="/dashboard/profile"
              className={`text-lg font-bold transition-all flex items-center gap-2 ${
                currentPage === "profile"
                  ? isDark ? 'text-sky-300' : "text-[#f0f1f7] drop-shadow-lg"
                  : isDark ? 'text-gray-300 hover:text-sky-300' : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <User className="w-6 h-6" />
              Profile
            </Link>

            <button
              onClick={onSettingsClick}
              className={`text-lg font-bold transition-all flex items-center gap-2 ${
                isDark ? 'text-gray-300 hover:text-sky-300' : "text-white hover:text-[#f0f1f7]"
              }`}
            >
              <Settings className="w-6 h-6" />
              Settings
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`text-lg font-bold transition-all flex items-center gap-2 ml-4 pl-4 border-l ${
                isDark
                  ? 'border-slate-700 text-yellow-400 hover:text-yellow-300'
                  : "border-white/30 text-white hover:text-[#f0f1f7]"
              }`}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-4">
            {/* LOGO */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-lg flex items-center justify-center text-white font-black text-xl shadow-md transform -skew-x-6">
                <span className="transform skew-x-6">S</span>
              </div>
              <div className={`text-2xl font-black tracking-tight`}>
                <span className="text-[#5AC8FA]">Skill</span>
                <span className={isDark ? 'text-gray-300' : 'text-[#204585]'}>Link</span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`transition-all ${isDark ? 'text-sky-400 hover:text-sky-300' : 'text-[#7CA0D8] hover:text-[#5AC8FA]'}`}
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="relative mb-4">
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-300'} rounded-full px-5 py-3 items-center shadow-md border-2 flex`}>
              <Search className="w-5 h-5 text-[#5AC8FA] mr-3" />
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`flex-1 outline-none text-sm ${isDark ? 'bg-slate-800 text-gray-100 placeholder:text-gray-400' : 'text-[#3d3f56] placeholder:text-[#7CA0D8]'} font-semibold`}
              />
            </div>

            {/* ✅ Search Results Dropdown - Mobile */}
            {searchType === "users" && showSearchResults && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border-2 z-50 max-h-64 overflow-y-auto`}>
                {searchResults.map((result: SearchResult) => (
                  <button
                    key={`user-${result.id}`}
                    onClick={() => handleNavigateToProfile(result.id)}
                    className={`w-full flex items-center gap-3 p-3 ${isDark ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-gray-50 border-gray-100'} border-b transition-all text-left`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black flex-shrink-0 text-sm">
                      {result.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${isDark ? 'text-gray-100' : 'text-[#3d3f56]'}`}>{result.name}</p>
                      <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{result.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`${isDark ? 'bg-slate-800 shadow-lg' : 'bg-gradient-to-r from-[#A4C2F4] to-[#7CA0D8] shadow-lg'} rounded-2xl p-6 space-y-4 text-lg`}>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-6 py-3.5 rounded-xl font-bold transition-all ${
                  currentPage === "home"
                    ? isDark ? 'bg-slate-700 text-sky-300' : "bg-white/30 text-[#f0f1f7]"
                    : isDark ? 'text-gray-300 hover:bg-slate-700' : "text-white hover:bg-white/20"
                }`}
              >
                <Home className="w-6 h-6" />
                <span>Home</span>
              </Link>

              <Link
                href="/dashboard/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-6 py-3.5 rounded-xl font-bold transition-all ${
                  currentPage === "about"
                    ? isDark ? 'bg-slate-700 text-sky-300' : "bg-white/30 text-[#f0f1f7]"
                    : isDark ? 'text-gray-300 hover:bg-slate-700' : "text-white hover:bg-white/20"
                }`}
              >
                <Info className="w-6 h-6" />
                <span>About</span>
              </Link>

              <Link
                href="/dashboard/messages"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-6 py-3.5 rounded-xl font-bold transition-all ${
                  currentPage === "messages"
                    ? isDark ? 'bg-slate-700 text-sky-300' : "bg-white/30 text-[#f0f1f7]"
                    : isDark ? 'text-gray-300 hover:bg-slate-700' : "text-white hover:bg-white/20"
                }`}
              >
                <MessageCircle className="w-6 h-6" />
                <span>Messages</span>
              </Link>

              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-6 py-3.5 rounded-xl font-bold transition-all ${
                  currentPage === "profile"
                    ? isDark ? 'bg-slate-700 text-sky-300' : "bg-white/30 text-[#f0f1f7]"
                    : isDark ? 'text-gray-300 hover:bg-slate-700' : "text-white hover:bg-white/20"
                }`}
              >
                <User className="w-6 h-6" />
                <span>Profile</span>
              </Link>

              <button
                onClick={() => {
                  onSettingsClick();
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-xl font-bold transition-all ${
                  isDark ? 'text-gray-300 hover:bg-slate-700' : "text-white hover:bg-white/20"
                }`}
              >
                <Settings className="w-6 h-6" />
                <span>Settings</span>
              </button>

              {/* Dark Mode Toggle Mobile */}
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-xl font-bold transition-all ${
                  isDark
                    ? "bg-slate-700 text-yellow-400 hover:bg-slate-600"
                    : "bg-white/30 text-[#f0f1f7] hover:bg-white/40"
                }`}
              >
                {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}