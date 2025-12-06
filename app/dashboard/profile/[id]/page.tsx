"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { Star, Briefcase, FileText, Search, Home, Info, MessageCircle, User, Settings, Flag, Menu, X } from "lucide-react";
import Link from "next/link";
import DashboardModals from "../../components/DashboardModals";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
  createdAt: string;
}

// Add this User interface
interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface ServiceOffer {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category?: { name: string };
  active: boolean;
  avgRating?: number;
  createdAt: string;
}

interface Rating {
  id: string;
  stars: number;
  offer?: { title: string };
  createdAt: string;
}

type Tab = "info" | "offers" | "requests" | "ratings";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState({ avgRating: 0, totalRatings: 0 });
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [requests, setRequests] = useState<ServiceOffer[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // ✅ ADD MODAL STATES
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserOffers();
      fetchUserRequests();
      fetchUserRatings();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get(`/users/${userId}`);
      setUser(res.data);
      await fetchUserAverageRating();
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching user:", err);
      setIsLoading(false);
    }
  };

  const fetchUserOffers = async () => {
    try {
      const res = await api.get(`/services/offers/user/${userId}`);
      setOffers(res.data.offers || res.data || []);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setOffers([]);
    }
  };

  const fetchUserRequests = async () => {
    try {
      const res = await api.get(`/services/requests/user/${userId}`);
      setRequests(res.data.requests || res.data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const res = await api.get(`/services/ratings/${userId}`);
      setRatings(Array.isArray(res.data) ? res.data : res.data.ratings || []);
    } catch (err) {
      console.error("Error fetching ratings:", err);
      setRatings([]);
    }
  };

  const fetchUserAverageRating = async () => {
    try {
      const res = await api.get(`/services/ratings/${userId}`);
      const ratingsArray = Array.isArray(res.data) ? res.data : res.data.ratings || [];
      const totalStars = ratingsArray.reduce((sum: number, r: any) => sum + r.stars, 0);
      const avgRating = ratingsArray.length ? parseFloat((totalStars / ratingsArray.length).toFixed(2)) : 0;
      setUserRating({ avgRating, totalRatings: ratingsArray.length });
    } catch (err) {
      console.error("Error fetching rating:", err);
    }
  };

  const handleSubmitReport = async () => {
    if (!user) return;

    if (!reportReason.trim()) {
      alert("Please provide a reason for the report.");
      return;
    }

    if (reportReason.length < 10) {
      alert("Reason must be at least 10 characters");
      return;
    }

    try {
      setReportLoading(true);
      await api.post("/reports", {
        reportedId: user.id,
        reason: reportReason.trim(),
      });
      alert("Report submitted successfully!");
      setReportReason("");
      setShowReportModal(false);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      alert(err.response?.data?.message || "Failed to submit report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const res = await api.get(`/users`, {
        params: {
          search: query,
          page: 1,
          limit: 20
        }
      });
      setSearchResults(res.data.users || res.data || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleNavigateToProfile = (resultUserId: string) => {
    setSearchQuery("");
    setShowSearchResults(false);
    setMobileMenuOpen(false);
    router.push(`/dashboard/profile/${resultUserId}`);
  };

  // ✅ ADD LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8 flex items-center justify-center">
        <p className="text-lg lg:text-2xl font-bold text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f6fb] to-white">
      {/* ✅ RESPONSIVE HEADER */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="px-4 lg:px-6 py-4 lg:py-6">
          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
            {/* LOGO */}
            <Link href="/dashboard" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-md transform -skew-x-6">
                <span className="transform skew-x-6">S</span>
              </div>
              <div className="text-2xl font-black tracking-tight">
                <span className="text-[#5AC8FA]">Skill</span>
                <span className="text-[#204585]">-Link</span>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 mx-8 max-w-lg relative">
              <div className="bg-gray-50 rounded-full px-6 py-3 items-center shadow-md border-2 border-gray-300 hover:border-[#5AC8FA] transition-all flex">
                <Search className="w-6 h-6 text-[#5AC8FA] mr-3" />
                <input
                  type="text"
                  placeholder="Search for any users"
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="flex-1 outline-none text-sm text-[#3d3f56] placeholder:text-[#7CA0D8] font-semibold bg-transparent"
                />
              </div>

              {/* ✅ Search Results Dropdown - Desktop */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-gray-200 z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
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

            {/* Navigation Tabs */}
            <div className="bg-gradient-to-r from-[#A4C2F4] to-[#7CA0D8] shadow-lg rounded-full px-6 py-3 flex items-center gap-6 whitespace-nowrap">
              <Link
                href="/dashboard"
                className="text-sm font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              <Link
                href="/dashboard/about"
                className="text-sm font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
              >
                <Info className="w-5 h-5" />
                About
              </Link>
              <Link
                href="/dashboard/messages"
                className="text-sm font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Messages
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-sm font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                My Profile
              </Link>
              {/* ✅ SETTINGS BUTTON - OPENS MODAL */}
              <button 
                onClick={() => setShowSettingsModal(true)}
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
              <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md transform -skew-x-6">
                  <span className="transform skew-x-6">S</span>
                </div>
                <div className="text-xl font-black tracking-tight">
                  <span className="text-[#5AC8FA]">Skill</span>
                  <span className="text-[#204585]">Link</span>
                </div>
              </Link>

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
                  placeholder="Search users"
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="flex-1 outline-none text-xs text-[#3d3f56] placeholder:text-[#7CA0D8] font-semibold bg-transparent"
                />
              </div>

              {/* ✅ Search Results Dropdown - Mobile */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-gray-200 z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
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
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/dashboard/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
                >
                  <Info className="w-5 h-5" />
                  <span>About</span>
                </Link>

                <Link
                  href="/dashboard/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Messages</span>
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
                >
                  <User className="w-5 h-5" />
                  <span>My Profile</span>
                </Link>

                {/* ✅ SETTINGS BUTTON - MOBILE */}
                <button 
                  onClick={() => {
                    setShowSettingsModal(true);
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

      {/* ✅ DASHBOARD MODALS COMPONENT */}
      <DashboardModals
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        showChangePasswordModal={showChangePasswordModal}
        setShowChangePasswordModal={setShowChangePasswordModal}
        showEditProfileModal={showEditProfileModal}
        setShowEditProfileModal={setShowEditProfileModal}
        onLogout={handleLogout}
      />

      {/* ✅ RESPONSIVE PROFILE CONTENT */}
      <div className="px-4 lg:px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* ✅ RESPONSIVE Header Card */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg p-6 lg:p-12 mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
              {/* Avatar */}
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white text-4xl lg:text-6xl font-black flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || "?"}
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl lg:text-5xl font-black text-[#3d3f56] mb-2">
                  {user?.name}
                </h1>
                <p className="text-base lg:text-xl text-gray-600 font-semibold mb-2">
                  {user?.email}
                </p>
                <p className="text-xs lg:text-base text-gray-500 mb-4">
                  Member since {new Date(user?.createdAt || "").toLocaleDateString()}
                </p>

                {/* ✅ RESPONSIVE Rating Card */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-2xl inline-flex mx-auto lg:mx-0">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 lg:w-7 lg:h-7 ${
                          i < Math.floor(userRating.avgRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="font-black text-xl lg:text-2xl text-[#3d3f56]">
                      {userRating.avgRating}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-600 font-semibold">
                      {userRating.totalRatings} ratings
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black py-2 lg:py-3 px-4 lg:px-6 rounded-full transition-all flex items-center gap-2 flex-shrink-0 text-sm lg:text-base"
              >
                <Flag className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Report</span>
              </button>
            </div>
          </div>

          {/* ✅ RESPONSIVE Tabs */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg overflow-hidden">
            <div className="flex border-b-4 border-gray-200 overflow-x-auto">
              {(["info", "offers", "requests", "ratings"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-max py-3 lg:py-6 px-3 lg:px-8 font-black text-xs lg:text-xl transition-all flex items-center justify-center gap-1 lg:gap-3 ${
                    activeTab === tab
                      ? "bg-[#7CA0D8] text-white border-b-4 border-[#5a7fb8]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab === "info" && <>👤 <span className="hidden sm:inline">Profile</span></>}
                  {tab === "offers" && (
                    <>
                      <Briefcase className="w-4 h-4 lg:w-6 lg:h-6" /> 
                      <span className="hidden sm:inline">Offers</span>
                    </>
                  )}
                  {tab === "requests" && (
                    <>
                      <FileText className="w-4 h-4 lg:w-6 lg:h-6" /> 
                      <span className="hidden sm:inline">Requests</span>
                    </>
                  )}
                  {tab === "ratings" && (
                    <>
                      <Star className="w-4 h-4 lg:w-6 lg:h-6" /> 
                      <span className="hidden sm:inline">Ratings</span>
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 lg:p-12">
              {/* Info Tab */}
              {activeTab === "info" && (
                <div className="space-y-4 lg:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-8 rounded-2xl border-2 border-blue-200">
                      <label className="block text-xs lg:text-sm font-black text-gray-600 mb-2 lg:mb-3">Name</label>
                      <p className="text-lg lg:text-2xl font-black text-[#3d3f56] break-words">{user?.name}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-8 rounded-2xl border-2 border-blue-200">
                      <label className="block text-xs lg:text-sm font-black text-gray-600 mb-2 lg:mb-3">Email</label>
                      <p className="text-lg lg:text-2xl font-black text-[#3d3f56] break-words">{user?.email}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 lg:p-8 rounded-2xl border-2 border-purple-200 sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs lg:text-sm font-black text-gray-600 mb-2 lg:mb-3">Member Since</label>
                      <p className="text-lg lg:text-2xl font-black text-[#3d3f56]">
                        {new Date(user?.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Offers Tab */}
              {activeTab === "offers" && (
                <div className="space-y-4 lg:space-y-8">
                  {offers.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 lg:p-8 border-2 border-blue-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 lg:gap-6 mb-3 lg:mb-6">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl lg:text-3xl font-black text-[#3d3f56] mb-1 lg:mb-2 break-words">
                                {offer.title}
                              </h3>
                              <p className="text-xs lg:text-base text-gray-600 font-black">
                                {offer.category?.name}
                              </p>
                            </div>
                            <span
                              className={`px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-black flex-shrink-0 ${
                                offer.active
                                  ? "bg-green-200 text-green-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {offer.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-sm lg:text-lg text-gray-700 font-semibold mb-3 lg:mb-6 break-words">
                            {offer.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400 fill-yellow-400" />
                            <span className="font-black text-base lg:text-lg text-[#3d3f56]">
                              {offer.avgRating || "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8 lg:py-12 text-base lg:text-xl">No offers available</p>
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === "requests" && (
                <div className="space-y-4 lg:space-y-8">
                  {requests.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                      {requests.map((request) => (
                        <div
                          key={request.id}
                          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 lg:p-8 border-2 border-purple-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 lg:gap-6 mb-3 lg:mb-6">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl lg:text-3xl font-black text-[#3d3f56] mb-1 lg:mb-2 break-words">
                                {request.description.slice(0, 30)}...
                              </h3>
                              <p className="text-xs lg:text-base text-gray-600 font-black">
                                {request.category?.name}
                              </p>
                            </div>
                            <span
                              className={`px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-black flex-shrink-0 ${
                                request.active
                                  ? "bg-green-200 text-green-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {request.active ? "Active" : "Closed"}
                            </span>
                          </div>
                          <p className="text-sm lg:text-lg text-gray-700 font-semibold mb-3 lg:mb-6 break-words">
                            {request.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8 lg:py-12 text-base lg:text-xl">No requests available</p>
                  )}
                </div>
              )}

              {/* Ratings Tab */}
              {activeTab === "ratings" && (
                <div className="space-y-3 lg:space-y-6">
                  {ratings.length > 0 ? (
                    <div className="space-y-3 lg:space-y-4">
                      {ratings.map((rating) => (
                        <div
                          key={rating.id}
                          className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 lg:p-8 border-2 border-yellow-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-base lg:text-xl text-[#3d3f56] mb-1 break-words">
                              {rating.offer?.title || "Service"}
                            </p>
                            <p className="text-xs lg:text-base text-gray-600 font-semibold">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 lg:w-7 lg:h-7 ${
                                  i < rating.stars
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8 lg:py-12 text-base lg:text-xl">No ratings yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ RESPONSIVE Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl lg:text-3xl font-black text-[#3d3f56] mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
              <Flag className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500 flex-shrink-0" />
              <span className="break-words">Report {user.name}</span>
            </h2>

            <div className="space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-bold text-gray-600 mb-2">
                  Reason for Report
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Please provide details..."
                  className="w-full px-3 lg:px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-orange-500 resize-none text-gray-900 text-sm lg:text-base"
                  rows={5}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reportReason.length}/500 characters
                </p>
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 lg:p-4">
                <p className="text-xs lg:text-sm font-semibold text-orange-800">
                  ⚠️ False reports may result in account suspension.
                </p>
              </div>
            </div>

            <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={reportLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base"
              >
                {reportLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}