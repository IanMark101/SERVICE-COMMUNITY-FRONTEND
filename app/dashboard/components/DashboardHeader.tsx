"use client";

import Link from "next/link";
import { Search, Settings, Home, Info, MessageCircle, User, Menu, X, Moon, Sun, Folder, Briefcase, HandHelping, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/app/context/DarkModeContext";

interface SearchResult {
  id: string;
  name: string;
  email?: string;
  description?: string;
  type?: "user" | "category" | "offer" | "request";
  categoryId?: string;
  categoryName?: string;
  userName?: string;
}

interface DashboardHeaderProps {
  onSettingsClick: () => void;
  currentPage?: "home" | "about" | "messages" | "profile";
  onSearch?: (query: string) => void;
  searchResults?: (SearchResult | { id: string; name: string; email?: string })[];
  showSearchResults?: boolean;
  onSelectResult?: (result?: SearchResult) => void;
  searchType?: "services" | "users";
  onSelectUser?: (userId: string, userName: string) => void;
  searchLoading?: boolean;
}

export default function DashboardHeader({ 
  onSettingsClick,
  currentPage = "home",
  onSearch,
  searchResults = [],
  showSearchResults = false,
  onSelectResult,
  searchType = "services",
  onSelectUser,
  searchLoading = false
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
    return "Search services, categories, or users...";
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

  const handleResultClick = (result: SearchResult) => {
    setSearchQuery("");
    setMobileMenuOpen(false);
    
    // For user search type, always navigate to profile
    if (searchType === "users" || !result.type || result.type === "user") {
      router.push(`/dashboard/profile/${result.id}`);
    }
    
    // Call the parent callback for any additional handling
    if (onSelectResult) onSelectResult(result);
  };

  // Helper to get icon and color for result type
  const getResultTypeStyles = (type?: SearchResult["type"]) => {
    switch (type) {
      case "category":
        return {
          icon: <Folder className="w-5 h-5" />,
          bgColor: "from-purple-500 to-indigo-600",
          label: "Category",
          labelColor: isDark ? "text-purple-400" : "text-purple-600"
        };
      case "offer":
        return {
          icon: <Briefcase className="w-5 h-5" />,
          bgColor: "from-emerald-500 to-teal-600",
          label: "Service Offer",
          labelColor: isDark ? "text-emerald-400" : "text-emerald-600"
        };
      case "request":
        return {
          icon: <HandHelping className="w-5 h-5" />,
          bgColor: "from-orange-500 to-amber-600",
          label: "Looking For",
          labelColor: isDark ? "text-orange-400" : "text-orange-600"
        };
      case "user":
      default:
        return {
          icon: <User className="w-5 h-5" />,
          bgColor: "from-[#5AC8FA] to-[#007AFF]",
          label: "User",
          labelColor: isDark ? "text-sky-400" : "text-sky-600"
        };
    }
  };

  // Render a single search result
  const renderSearchResult = (result: SearchResult, isMobile = false) => {
    const styles = getResultTypeStyles(result.type);
    const sizeClasses = isMobile 
      ? "w-10 h-10 text-sm" 
      : "w-12 h-12 text-base";
    const padding = isMobile ? "p-3" : "p-4";
    const nameSize = isMobile ? "text-sm" : "text-base";
    const descSize = isMobile ? "text-xs" : "text-sm";

    return (
      <button
        key={`${result.type || 'user'}-${result.id}`}
        onClick={() => handleResultClick(result as SearchResult)}
        className={`w-full flex items-center gap-3 ${padding} ${isDark ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-gray-50 border-gray-100'} border-b transition-all text-left`}
      >
        <div className={`${sizeClasses} bg-gradient-to-br ${styles.bgColor} rounded-full flex items-center justify-center text-white font-black flex-shrink-0`}>
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-black ${nameSize} truncate ${isDark ? 'text-gray-100' : 'text-[#3d3f56]'}`}>
              {result.name}
            </p>
            {searchType === "services" && (
              <span className={`${descSize} font-semibold ${styles.labelColor} px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                {styles.label}
              </span>
            )}
          </div>
          {(!result.type || result.type === "user") && result.email && (
            <p className={`${descSize} truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{result.email}</p>
          )}
          {result.type === "category" && (
            <p className={`${descSize} truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Click to view services</p>
          )}
          {(result.type === "offer" || result.type === "request") && (
            <p className={`${descSize} truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {result.categoryName && <span className="font-semibold">{result.categoryName}</span>}
              {result.userName && <span> • by {result.userName}</span>}
            </p>
          )}
        </div>
      </button>
    );
  };

  return (
    <nav className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-lg sticky top-0 z-50 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
      <div className="px-4 md:px-6 xl:px-8 py-4 md:py-5 xl:py-6">
        {/* Desktop Layout */}
        <div className="hidden xl:flex flex-row items-center justify-between gap-8 w-full">
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
            {showSearchResults && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border-2 z-50 max-h-96 overflow-y-auto`}>
                {searchLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-sky-400' : 'text-[#5AC8FA]'}`} />
                    <span className={`ml-2 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Searching...</span>
                  </div>
                ) : (
                  searchResults.map((result: SearchResult) => renderSearchResult(result, false))
                )}
              </div>
            )}
            {showSearchResults && searchResults.length === 0 && searchQuery.length > 0 && !searchLoading && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border-2 z-50 p-6`}>
                <p className={`text-center font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No results found for "{searchQuery}"
                </p>
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
        <div className="xl:hidden">
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
            {showSearchResults && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border-2 z-50 max-h-72 overflow-y-auto`}>
                {searchLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-sky-400' : 'text-[#5AC8FA]'}`} />
                    <span className={`ml-2 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Searching...</span>
                  </div>
                ) : (
                  searchResults.map((result: SearchResult) => renderSearchResult(result, true))
                )}
              </div>
            )}
            {showSearchResults && searchResults.length === 0 && searchQuery.length > 0 && !searchLoading && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border-2 z-50 p-4`}>
                <p className={`text-center font-semibold text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No results found
                </p>
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