"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { Star, Briefcase, FileText, Flag, MessageCircle, X } from "lucide-react";
import { useDarkMode } from "@/app/context/DarkModeContext";
import { useLogout } from "@/hooks/useLogout";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardModals from "../../components/DashboardModals";
import LoadingScreen from "../../components/LoadingScreen";
import { useToast } from "../../components/Toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
  createdAt: string;
}

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
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const { logout } = useLogout();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState({ avgRating: 0, totalRatings: 0 });
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [requests, setRequests] = useState<ServiceOffer[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [ratingsTotalPages, setRatingsTotalPages] = useState(1);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // Edit/Delete offer/request states
  const [editingOffer, setEditingOffer] = useState<ServiceOffer | null>(null);
  const [editingRequest, setEditingRequest] = useState<ServiceOffer | null>(null);
  const [editOfferForm, setEditOfferForm] = useState({ title: "", description: "", categoryId: "" });
  const [editRequestForm, setEditRequestForm] = useState({ description: "", categoryId: "" });

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    
    // Fetch current user first to check if viewing own profile
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (userId && currentUser) {
      fetchUserProfile();
      fetchUserOffers();
      fetchUserRequests();
      fetchUserRatings();
    }
  }, [userId, currentUser]);

  // ✅ FETCH CURRENT LOGGED-IN USER
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/me");
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Error fetching current user:", err);
      router.push("/auth/login");
    }
  };

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

  const fetchUserRatings = async (page = 1) => {
    try {
      setRatingsLoading(true);
      const res = await api.get(`/services/ratings/${userId}`, {
        params: { page, limit: 2 },
      });
      const ratingsArray = Array.isArray(res.data) ? res.data : res.data.ratings || [];
      setRatings(ratingsArray);
      setRatingsPage(res.data.page || page);
      setRatingsTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching ratings:", err);
      setRatings([]);
    } finally {
      setRatingsLoading(false);
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
      showToast("Please provide a reason for the report.", "warning");
      return;
    }

    if (reportReason.length < 10) {
      showToast("Reason must be at least 10 characters", "warning");
      return;
    }

    try {
      setReportLoading(true);
      await api.post("/reports", {
        reportedId: user.id,
        reason: reportReason.trim(),
      });
      showToast("Report submitted successfully!", "success");
      setReportReason("");
      setShowReportModal(false);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      showToast(err.response?.data?.message || "Failed to submit report", "error");
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
    router.push(`/dashboard/profile/${resultUserId}`);
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await api.delete(`/services/offer/${offerId}`);
      setOffers(offers.filter((o) => o.id !== offerId));
      showToast("Offer deleted!", "success");
    } catch (err) {
      console.error("Error deleting offer:", err);
      showToast("Failed to delete offer", "error");
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Delete this request?")) return;
    try {
      await api.delete(`/services/request/${requestId}`);
      setRequests(requests.filter((r) => r.id !== requestId));
      showToast("Request deleted!", "success");
    } catch (err) {
      console.error("Error deleting request:", err);
      showToast("Failed to delete request", "error");
    }
  };

  const handleEditOffer = (offer: ServiceOffer) => {
    setEditingOffer(offer);
    setEditOfferForm({
      title: offer.title,
      description: offer.description,
      categoryId: offer.categoryId,
    });
  };

  const handleSaveOffer = async () => {
    if (!editingOffer) return;
    try {
      await api.patch(`/services/offer/${editingOffer.id}`, editOfferForm);
      showToast("Offer updated!", "success");
      setEditingOffer(null);
      // Update local state
      setOffers(offers.map((o) => o.id === editingOffer.id ? { ...o, ...editOfferForm } : o));
    } catch (err: any) {
      console.error("Error updating offer:", err);
      showToast(err.response?.data?.message || "Failed to update offer", "error");
    }
  };

  const handleEditRequest = (request: ServiceOffer) => {
    setEditingRequest(request);
    setEditRequestForm({
      description: request.description,
      categoryId: request.categoryId,
    });
  };

  const handleSaveRequest = async () => {
    if (!editingRequest) return;
    try {
      await api.patch(`/services/request/${editingRequest.id}`, {
        description: editRequestForm.description,
      });
      showToast("Request updated!", "success");
      setEditingRequest(null);
      // Update local state
      setRequests(requests.map((r) => r.id === editingRequest.id ? { ...r, ...editRequestForm } : r));
    } catch (err: any) {
      console.error("Error updating request:", err);
      showToast(err.response?.data?.message || "Failed to update request", "error");
    }
  };

  const handleLogout = async () => {
    await logout(false); // false = user logout (not admin)
  };

  // ✅ CHECK IF VIEWING OWN PROFILE
  const isOwnProfile = currentUser && user && currentUser.id === user.id;

  if (isLoading || !user || !currentUser) {
    return <LoadingScreen message="Loading user profile..." />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-[#f0f2f7] via-[#e8eaf0] to-[#f5f0ff]'}`}>
      {/* DASHBOARD HEADER - WITH USER SEARCH */}
      <DashboardHeader 
        onSettingsClick={() => setShowSettingsModal(true)}
        currentPage="profile"
        onSearch={handleSearchUsers}
        searchResults={searchResults.map(u => ({ ...u, type: "user" as const }))}
        showSearchResults={showSearchResults}
        onSelectResult={() => {
          setSearchQuery("");
          setShowSearchResults(false);
        }}
        searchType="users"
        searchLoading={searchLoading}
      />

      {/* DASHBOARD MODALS */}
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
          <div className={`rounded-2xl lg:rounded-3xl shadow-lg p-6 lg:p-12 mb-6 lg:mb-8 ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
              {/* Avatar */}
              <div className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center text-white text-4xl lg:text-6xl font-black flex-shrink-0 ${isDark ? 'bg-gradient-to-br from-sky-500 to-teal-500' : 'bg-gradient-to-br from-[#5AC8FA] to-[#007AFF]'}`}>
                {user?.name?.[0]?.toUpperCase() || "?"}
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className={`text-3xl lg:text-5xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
                  {user?.name}
                </h1>
                <p className={`text-base lg:text-xl font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  {user?.email}
                </p>
                <p className={`text-xs lg:text-base mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Member since {new Date(user?.createdAt || "").toLocaleDateString()}
                </p>

                {/* ✅ RESPONSIVE Rating Card */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl inline-flex mx-auto lg:mx-0 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gradient-to-r from-yellow-50 to-yellow-100'}`}>
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
                    <p className={`font-black text-xl lg:text-2xl ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
                      {userRating.avgRating}
                    </p>
                    <p className={`text-xs lg:text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {userRating.totalRatings} ratings
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ ACTION BUTTONS - ONLY SHOW FOR OTHER USERS */}
              {!isOwnProfile && (
                <div className="flex flex-col flex-shrink-0 w-full sm:w-auto self-stretch">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className={`text-white font-black py-2.5 lg:py-3.5 px-5 lg:px-6 rounded-full transition-all flex items-center justify-center gap-2 text-sm lg:text-base ${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                  >
                    <Flag className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">Report</span>
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => router.push(`/dashboard/messages?userId=${user.id}&userName=${encodeURIComponent(user.name)}`)}
                    className={`text-white font-black py-2.5 lg:py-3.5 px-5 lg:px-6 rounded-full transition-all flex items-center justify-center gap-2 text-sm lg:text-base shadow-lg ${isDark ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-900/40' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200/80'}`}
                  >
                    <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ✅ RESPONSIVE Tabs */}
          <div className={`rounded-2xl lg:rounded-3xl shadow-lg overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className={`flex border-b-4 overflow-x-auto ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
              {(["info", "offers", "requests", "ratings"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-max py-3 lg:py-6 px-3 lg:px-8 font-black text-xs lg:text-xl transition-all flex items-center justify-center gap-1 lg:gap-3 ${
                    activeTab === tab
                      ? isDark ? "bg-sky-600 text-white border-b-4 border-sky-500" : "bg-[#7CA0D8] text-white border-b-4 border-[#5a7fb8]"
                      : isDark ? "text-slate-300 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-50"
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
                <div className="space-y-6 lg:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                    <div className={`p-6 lg:p-8 rounded-2xl border-2 ${isDark ? 'bg-gradient-to-br from-[#e3f2fd] via-[#f3e5f5] to-[#fce4ec] border-[#7CA0D8]' : 'bg-gradient-to-br from-[#e3f2fd] via-[#f3e5f5] to-[#fce4ec] border-[#7CA0D8]'} shadow-md hover:shadow-lg transition-all`}>
                      <label className={`block text-xs lg:text-sm font-black mb-2 lg:mb-3 ${isDark ? 'text-[#7CA0D8]' : 'text-[#7CA0D8]'}`}>Name</label>
                      <p className={`text-xl lg:text-2xl font-black break-words ${isDark ? 'text-[#3d3f56]' : 'text-[#3d3f56]'}`}>{user?.name}</p>
                    </div>
                    <div className={`p-6 lg:p-8 rounded-2xl border-2 ${isDark ? 'bg-gradient-to-br from-[#e8f5e9] via-[#f3e5f5] to-[#e0f2f1] border-[#1CC4B6]' : 'bg-gradient-to-br from-[#e8f5e9] via-[#f3e5f5] to-[#e0f2f1] border-[#1CC4B6]'} shadow-md hover:shadow-lg transition-all`}>
                      <label className={`block text-xs lg:text-sm font-black mb-2 lg:mb-3 ${isDark ? 'text-[#1CC4B6]' : 'text-[#1CC4B6]'}`}>Email</label>
                      <p className={`text-lg lg:text-2xl font-black break-words ${isDark ? 'text-[#3d3f56]' : 'text-[#3d3f56]'}`}>{user?.email}</p>
                    </div>
                    <div className={`p-6 lg:p-8 rounded-2xl border-2 sm:col-span-2 ${isDark ? 'bg-gradient-to-br from-[#fff3e0] via-[#ffe0b2] to-[#ffccbc] border-orange-400' : 'bg-gradient-to-br from-[#fff3e0] via-[#ffe0b2] to-[#ffccbc] border-orange-400'} shadow-md hover:shadow-lg transition-all`}>
                      <label className={`block text-xs lg:text-sm font-black mb-2 lg:mb-3 ${isDark ? 'text-orange-600' : 'text-orange-600'}`}>Member Since</label>
                      <p className={`text-xl lg:text-2xl font-black ${isDark ? 'text-[#3d3f56]' : 'text-[#3d3f56]'}`}>
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
                          className={`rounded-2xl p-4 lg:p-8 border-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gradient-to-br from-[#f5f7fc] via-[#f0f2f7] to-[#eef1f6] border-[#d4dae8]'}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 lg:gap-6 mb-3 lg:mb-6">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-xl lg:text-3xl font-black mb-1 lg:mb-2 break-words ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
                                {offer.title}
                              </h3>
                              <p className={`text-xs lg:text-base font-black ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                                {offer.category?.name}
                              </p>
                            </div>
                            <span
                              className={`px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-black flex-shrink-0 ${
                                offer.active
                                  ? isDark ? "bg-green-900 text-green-200" : "bg-green-200 text-green-800"
                                  : isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {offer.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className={`text-sm lg:text-lg font-semibold mb-3 lg:mb-6 break-words ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            {offer.description}
                          </p>
                          <div className="flex items-center gap-2 mb-4">
                            <Star className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400 fill-yellow-400" />
                            <span className={`font-black text-base lg:text-lg ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
                              {offer.avgRating || "N/A"}
                            </span>
                          </div>
                          {/* ✅ EDIT/DELETE BUTTONS - ONLY FOR OWN PROFILE */}
                          {isOwnProfile && (
                            <div className="flex gap-2 lg:gap-3">
                              <button
                                onClick={() => handleEditOffer(offer)}
                                className={`flex-1 text-white font-black py-2 lg:py-3 px-4 rounded-full text-sm lg:text-base transition-all ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(offer.id)}
                                className={`flex-1 text-white font-black py-2 lg:py-3 px-4 rounded-full text-sm lg:text-base transition-all ${isDark ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'}`}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-center py-8 lg:py-12 text-base lg:text-xl ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No offers available</p>
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
                          className={`rounded-2xl p-4 lg:p-8 border-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gradient-to-br from-[#f5f3f9] via-[#f0eef5] to-[#ede9f2] border-[#dcd3e8]'}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 lg:gap-6 mb-3 lg:mb-6">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-xl lg:text-3xl font-black mb-1 lg:mb-2 break-words ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
                                {request.description.slice(0, 30)}...
                              </h3>
                              <p className={`text-xs lg:text-base font-black ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                                {request.category?.name}
                              </p>
                            </div>
                            <span
                              className={`px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-black flex-shrink-0 ${
                                request.active
                                  ? isDark ? "bg-green-900 text-green-200" : "bg-green-200 text-green-800"
                                  : isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {request.active ? "Active" : "Closed"}
                            </span>
                          </div>
                          <p className={`text-sm lg:text-lg font-semibold mb-3 lg:mb-6 break-words ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            {request.description}
                          </p>
                          {/* ✅ EDIT/DELETE BUTTONS - ONLY FOR OWN PROFILE */}
                          {isOwnProfile && (
                            <div className="flex gap-2 lg:gap-3">
                              <button
                                onClick={() => handleEditRequest(request)}
                                className={`flex-1 text-white font-black py-2 lg:py-3 px-4 rounded-full text-sm lg:text-base transition-all ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRequest(request.id)}
                                className={`flex-1 text-white font-black py-2 lg:py-3 px-4 rounded-full text-sm lg:text-base transition-all ${isDark ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'}`}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-center py-8 lg:py-12 text-base lg:text-xl ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No requests available</p>
                  )}
                </div>
              )}

              {/* Ratings Tab */}
              {activeTab === "ratings" && (
                <div className="space-y-6 lg:space-y-8">
                  {ratingsLoading ? (
                    <p className={`text-center text-base lg:text-xl ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading...</p>
                  ) : ratings.length > 0 ? (
                    <>
                      <div className="space-y-3 lg:space-y-4">
                        {ratings.map((rating) => (
                          <div
                            key={rating.id}
                            className={`rounded-2xl p-4 lg:p-8 border-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gradient-to-br from-[#fffaf5] via-[#fef8f3] to-[#fdf5f0] border-[#e8dcc8]'}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`font-black text-base lg:text-xl mb-1 break-words ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
                                {rating.offer?.title || "Service"}
                              </p>
                              <p className={`text-xs lg:text-base font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
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

                      {ratingsTotalPages > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 lg:gap-4 mt-6 lg:mt-8">
                          <button
                            onClick={() => fetchUserRatings(ratingsPage - 1)}
                            disabled={ratingsPage === 1}
                            className={`px-4 lg:px-6 py-2 lg:py-3 disabled:opacity-50 rounded-full font-black text-sm lg:text-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-gray-200 hover:bg-gray-300 text-[#3d3f56]'}`}
                          >
                            Previous
                          </button>
                          <span className={`px-4 lg:px-6 py-2 lg:py-3 font-black text-sm lg:text-lg ${isDark ? 'text-slate-300' : 'text-[#3d3f56]'}`}>
                            {ratingsPage} / {ratingsTotalPages}
                          </span>
                          <button
                            onClick={() => fetchUserRatings(ratingsPage + 1)}
                            disabled={ratingsPage === ratingsTotalPages}
                            className={`px-4 lg:px-6 py-2 lg:py-3 disabled:opacity-50 rounded-full font-black text-sm lg:text-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-gray-200 hover:bg-gray-300 text-[#3d3f56]'}`}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={`text-center py-8 lg:py-12 text-base lg:text-xl ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No ratings yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ RESPONSIVE Report Modal - ONLY SHOWS FOR OTHER USERS */}
      {showReportModal && !isOwnProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl lg:rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700' : 'bg-white'}`}>
            <h2 className={`text-2xl lg:text-3xl font-black mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
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
                  className={`w-full px-3 lg:px-4 py-2 border-2 rounded-xl font-semibold focus:outline-none resize-none text-sm lg:text-base ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-orange-500' : 'border-gray-300 focus:border-orange-500 text-gray-900'}`}
                  rows={5}
                  maxLength={500}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {reportReason.length}/500 characters
                </p>
              </div>

              <div className={`border-2 rounded-xl p-3 lg:p-4 ${isDark ? 'bg-orange-900/30 border-orange-700 text-orange-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className={`text-xs lg:text-sm font-semibold ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>
                  ⚠️ False reports may result in account suspension.
                </p>
              </div>
            </div>

            <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className={`flex-1 font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={reportLoading}
                className={`flex-1 disabled:opacity-50 font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base ${isDark ? 'bg-orange-700 hover:bg-orange-800 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
              >
                {reportLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MOBILE RESPONSIVE Edit Offer Modal */}
      {editingOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl lg:rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700' : 'bg-white'}`}>
            <h2 className={`text-2xl lg:text-3xl font-black mb-4 lg:mb-6 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>Edit Offer</h2>

            <div className="space-y-3 lg:space-y-4">
              <div>
                <label className={`block text-xs lg:text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Title</label>
                <input
                  type="text"
                  value={editOfferForm.title}
                  onChange={(e) => setEditOfferForm({ ...editOfferForm, title: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-xl font-semibold focus:outline-none text-sm lg:text-base ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-gray-300 focus:border-[#1CC4B6] text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block text-xs lg:text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Description</label>
                <textarea
                  value={editOfferForm.description}
                  onChange={(e) => setEditOfferForm({ ...editOfferForm, description: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-xl font-semibold focus:outline-none text-sm lg:text-base ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-gray-300 focus:border-[#1CC4B6] text-gray-900'}`}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6">
              <button
                onClick={() => setEditingOffer(null)}
                className={`flex-1 font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOffer}
                className={`flex-1 text-white font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MOBILE RESPONSIVE Edit Request Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl lg:rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700' : 'bg-white'}`}>
            <h2 className={`text-2xl lg:text-3xl font-black mb-4 lg:mb-6 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>Edit Request</h2>

            <div className="space-y-3 lg:space-y-4">
              <div>
                <label className={`block text-xs lg:text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Description</label>
                <textarea
                  value={editRequestForm.description}
                  onChange={(e) => setEditRequestForm({ ...editRequestForm, description: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-xl font-semibold focus:outline-none text-sm lg:text-base ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500' : 'border-gray-300 focus:border-[#1CC4B6] text-gray-900'}`}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6">
              <button
                onClick={() => setEditingRequest(null)}
                className={`flex-1 font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRequest}
                className={`flex-1 text-white font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}