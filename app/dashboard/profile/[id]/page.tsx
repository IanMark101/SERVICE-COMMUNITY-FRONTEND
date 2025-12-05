"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { Star, Briefcase, FileText, Search, Home, Info, MessageCircle, User, Settings, Flag } from "lucide-react";
import Link from "next/link";

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

type Tab = "info" | "offers" | "ratings";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState({ avgRating: 0, totalRatings: 0 });
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // New states for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserOffers();
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
        reportedId: user.id,          // 👈 backend expects this
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

  // New search function
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <p className="text-2xl font-bold text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f6fb] to-white">
      {/* HEADER */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-row items-center justify-between gap-6">
            <Link href="/dashboard" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-xl flex items-center justify-center text-white font-black text-4xl shadow-md transform -skew-x-6">
                <span className="transform skew-x-6">S</span>
              </div>
              <div className="text-4xl font-black tracking-tight">
                <span className="text-[#5AC8FA]">Skill</span>
                <span className="text-[#204585]">-Link</span>
              </div>
            </Link>

            {/* Search Bar with Functionality */}
            <div className="flex-1 mx-8 max-w-lg bg-gray-50 rounded-full px-8 py-4 items-center shadow-md border-2 border-gray-300 hover:border-[#5AC8FA] transition-all flex relative">
              <Search className="w-7 h-7 text-[#5AC8FA] mr-4" />
              <input
                type="text"
                placeholder="Search for any users"
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="flex-1 outline-none text-lg text-[#3d3f56] placeholder:text-[#7CA0D8] font-semibold bg-transparent"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-gray-200 z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/dashboard/profile/${result.id}`}
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black">
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

            <div className="bg-gradient-to-r from-[#A4C2F4] to-[#7CA0D8] shadow-lg rounded-full px-8 py-4 flex items-center gap-8 whitespace-nowrap">
              <Link
                href="/dashboard"
                className="text-lg font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
              >
                <Home className="w-6 h-6" />
                Home
              </Link>
              <Link
                href="/dashboard/about"
                className="text-lg font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
              >
                <Info className="w-6 h-6" />
                About
              </Link>
              <Link
                href="/dashboard/messages"
                className="text-lg font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-6 h-6" />
                Messages
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-lg font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2"
              >
                <User className="w-6 h-6" />
                My Profile
              </Link>
              <button className="text-lg font-bold text-white hover:text-[#f0f1f7] transition-all flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* PROFILE CONTENT */}
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-lg p-12 mb-8">
            <div className="flex items-start justify-between gap-8">
              <div className="flex items-center gap-8 flex-1">
                <div className="w-32 h-32 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white text-6xl font-black flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <h1 className="text-5xl font-black text-[#3d3f56] mb-2">
                    {user?.name}
                  </h1>
                  <p className="text-xl text-gray-600 font-semibold mb-2">
                    {user?.email}
                  </p>
                  <p className="text-base text-gray-500 mb-4">
                    Member since {new Date(user?.createdAt || "").toLocaleDateString()}
                  </p>

                  <div className="flex items-center gap-4 mt-6 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-2xl inline-flex">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-7 h-7 ${
                            i < Math.floor(userRating.avgRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="font-black text-2xl text-[#3d3f56]">
                        {userRating.avgRating}
                      </p>
                      <p className="text-sm text-gray-600 font-semibold">
                        {userRating.totalRatings} ratings
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowReportModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black py-3 px-6 rounded-full transition-all flex items-center gap-2 flex-shrink-0"
              >
                <Flag className="w-5 h-5" />
                Report
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="flex border-b-4 border-gray-200">
              {(["info", "offers", "ratings"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-6 px-8 font-black text-xl transition-all flex items-center justify-center gap-3 ${
                    activeTab === tab
                      ? "bg-[#7CA0D8] text-white border-b-4 border-[#5a7fb8]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab === "info" && "👤 Profile"}
                  {tab === "offers" && (
                    <>
                      <Briefcase className="w-6 h-6" /> Offers
                    </>
                  )}
                  {tab === "ratings" && (
                    <>
                      <Star className="w-6 h-6" /> Ratings
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-12">
              {/* Info Tab */}
              {activeTab === "info" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200">
                      <label className="block text-sm font-black text-gray-600 mb-3">Name</label>
                      <p className="text-2xl font-black text-[#3d3f56]">{user?.name}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200">
                      <label className="block text-sm font-black text-gray-600 mb-3">Email</label>
                      <p className="text-2xl font-black text-[#3d3f56]">{user?.email}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-purple-200">
                      <label className="block text-sm font-black text-gray-600 mb-3">Member Since</label>
                      <p className="text-2xl font-black text-[#3d3f56]">
                        {new Date(user?.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Offers Tab */}
              {activeTab === "offers" && (
                <div className="space-y-8">
                  {offers.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200"
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                              <h3 className="text-3xl font-black text-[#3d3f56] mb-2">
                                {offer.title}
                              </h3>
                              <p className="text-base text-gray-600 font-black">
                                {offer.category?.name}
                              </p>
                            </div>
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-black ${
                                offer.active
                                  ? "bg-green-200 text-green-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {offer.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-lg text-gray-700 font-semibold mb-6">
                            {offer.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                            <span className="font-black text-lg text-[#3d3f56]">
                              {offer.avgRating || "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-12 text-xl">No offers available</p>
                  )}
                </div>
              )}

              {/* Ratings Tab */}
              {activeTab === "ratings" && (
                <div className="space-y-6">
                  {ratings.length > 0 ? (
                    <div className="space-y-4">
                      {ratings.map((rating) => (
                        <div
                          key={rating.id}
                          className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-8 border-2 border-yellow-200 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-black text-xl text-[#3d3f56] mb-2">
                              {rating.offer?.title || "Service"}
                            </p>
                            <p className="text-base text-gray-600 font-semibold">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-7 h-7 ${
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
                    <p className="text-center text-gray-500 py-12 text-xl">No ratings yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-black text-[#3d3f56] mb-6 flex items-center gap-3">
              <Flag className="w-8 h-8 text-orange-500" />
              Report {user.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Reason for Report
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Please provide details about why you're reporting this user..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-orange-500 resize-none text-gray-900"
                  rows={5}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reportReason.length}/500 characters
                </p>
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-orange-800">
                  ⚠️ False reports may result in account suspension. Only report genuine violations.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-full transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={reportLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-full transition-all"
              >
                {reportLoading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}