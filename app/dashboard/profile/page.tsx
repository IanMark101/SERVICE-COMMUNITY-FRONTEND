"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Star, Briefcase, FileText, Search } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "../components/DashboardHeader";
import DashboardModals from "../components/DashboardModals";

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
  createdAt: string;
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

interface ServiceRequest {
  id: string;
  description: string;
  categoryId: string;
  category?: { name: string };
  active: boolean;
  createdAt: string;
}

interface Rating {
  id: string;
  stars: number;
  offer?: { title: string };
  createdAt: string;
}

type Tab = "info" | "offers" | "requests" | "ratings";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isLoading, setIsLoading] = useState(true);

  // Offers
  const [myOffers, setMyOffers] = useState<ServiceOffer[]>([]);
  const [offersPage, setOffersPage] = useState(1);
  const [offersTotalPages, setOffersTotalPages] = useState(1);
  const [offersLoading, setOffersLoading] = useState(false);

  // Requests
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Ratings
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [userRating, setUserRating] = useState({ avgRating: 0, totalRatings: 0 });

  // Offer and Request editing
  const [editingOffer, setEditingOffer] = useState<ServiceOffer | null>(null);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);
  const [editOfferForm, setEditOfferForm] = useState({ title: "", description: "", categoryId: "" });
  const [editRequestForm, setEditRequestForm] = useState({ description: "", categoryId: "" });

  // Search - KEEP THIS FOR PROFILE PAGE ONLY
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Modal states for DashboardModals component
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchCurrentUser();
  }, [router]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/me");
      const userData = res.data;
      console.log("User data:", userData);  
      setUser(userData);
      setEditForm({ name: userData.name, email: userData.email });
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching user:", err);
      router.push("/auth/login");
    }
  };

  const fetchMyOffers = async (page = 1) => {
    try {
      setOffersLoading(true);
      const res = await api.get("/services/offers/my-offers", {
        params: { page, limit: 6 },
      });
      setMyOffers(res.data.offers || []);
      setOffersPage(res.data.page || page);
      setOffersTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setMyOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchMyRequests = async (page = 1) => {
    try {
      setRequestsLoading(true);
      const res = await api.get("/services/requests/my-requests", {
        params: { page, limit: 6 },
      });
      setMyRequests(res.data.requests || []);
      setRequestsPage(res.data.page || page);
      setRequestsTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setMyRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchMyRatings = async () => {
    if (!user?.id) return;
    try {
      setRatingsLoading(true);
      const res = await api.get(`/services/ratings/${user.id}`);
      setRatings(Array.isArray(res.data) ? res.data : res.data.ratings || []);
    } catch (err) {
      console.error("Error fetching ratings:", err);
      setRatings([]);
    } finally {
      setRatingsLoading(false);
    }
  };

  const fetchUserAverageRating = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/services/ratings/${user.id}`);
      
      const ratingsArray = Array.isArray(res.data) ? res.data : res.data.ratings || [];
      const totalStars = ratingsArray.reduce((sum: number, r: any) => sum + r.stars, 0);
      const avgRating = ratingsArray.length ? parseFloat((totalStars / ratingsArray.length).toFixed(2)) : 0;
      
      setUserRating({ avgRating, totalRatings: ratingsArray.length });
    } catch (err) {
      console.error("Error fetching rating:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "offers") fetchMyOffers();
    if (activeTab === "requests") fetchMyRequests();
    if (activeTab === "ratings") fetchMyRatings();
    if (user?.id) {
      fetchUserAverageRating();
    }
  }, [activeTab, user?.id]);

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await api.delete(`/services/offer/${offerId}`);
      fetchMyOffers(offersPage);
      alert("Offer deleted!");
    } catch (err) {
      console.error("Error deleting offer:", err);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Delete this request?")) return;
    try {
      await api.delete(`/services/request/${requestId}`);
      fetchMyRequests(requestsPage);
      alert("Request deleted!");
    } catch (err) {
      console.error("Error deleting request:", err);
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
      alert("Offer updated!");
      setEditingOffer(null);
      fetchMyOffers(offersPage);
    } catch (err: any) {
      console.error("Error updating offer:", err);
      alert(err.response?.data?.message || "Failed to update offer");
    }
  };

  const handleEditRequest = (request: ServiceRequest) => {
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
      alert("Request updated!");
      setEditingRequest(null);
      fetchMyRequests(requestsPage);
    } catch (err: any) {
      console.error("Error updating request:", err);
      alert(err.response?.data?.message || "Failed to update request");
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

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8 flex items-center justify-center">
        <p className="text-xl lg:text-2xl font-bold text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f6fb] to-white">
      {/* DASHBOARD HEADER - WITH USER SEARCH */}
      <DashboardHeader 
        onSettingsClick={() => setShowSettingsModal(true)}
        currentPage="profile"
        onSearch={handleSearchUsers}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        onSelectResult={() => {
          setSearchQuery("");
          setShowSearchResults(false);
        }}
        searchType="users"
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

      {/* PROFILE CONTENT */}
      <div className="px-4 lg:px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* ✅ MOBILE RESPONSIVE Header Card */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg p-6 lg:p-12 mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
              {/* Avatar */}
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white text-4xl lg:text-6xl font-black flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || "?"}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl lg:text-5xl font-black text-[#3d3f56] mb-2">
                  {user?.name}
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 font-semibold mb-2">
                  {user?.email}
                </p>
                <p className="text-sm lg:text-base text-gray-500 mb-4">
                  Member since {new Date(user?.createdAt || "").toLocaleDateString()}
                </p>

                {/* ✅ MOBILE RESPONSIVE Rating Card */}
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
            </div>
          </div>

          {/* ✅ MOBILE RESPONSIVE Tabs */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg overflow-hidden">
            <div className="flex border-b-4 border-gray-200 overflow-x-auto">
              {(["info", "offers", "requests", "ratings"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-max py-4 lg:py-6 px-4 lg:px-8 font-black text-sm lg:text-xl transition-all flex items-center justify-center gap-2 lg:gap-3 ${
                    activeTab === tab
                      ? "bg-[#7CA0D8] text-white border-b-4 border-[#5a7fb8]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab === "info" && "👤"}
                  {tab === "info" && <span className="hidden sm:inline">Profile</span>}
                  {tab === "offers" && (
                    <>
                      <Briefcase className="w-5 h-5 lg:w-6 lg:h-6" /> 
                      <span className="hidden sm:inline">Offers</span>
                    </>
                  )}
                  {tab === "requests" && (
                    <>
                      <FileText className="w-5 h-5 lg:w-6 lg:h-6" /> 
                      <span className="hidden sm:inline">Requests</span>
                    </>
                  )}
                  {tab === "ratings" && (
                    <>
                      <Star className="w-5 h-5 lg:w-6 lg:h-6" /> 
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
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 lg:p-8 rounded-2xl border-2 border-blue-200">
                      <label className="block text-xs lg:text-sm font-black text-gray-600 mb-2 lg:mb-3">Name</label>
                      <p className="text-xl lg:text-2xl font-black text-[#3d3f56] break-words">{user?.name}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 lg:p-8 rounded-2xl border-2 border-blue-200">
                      <label className="block text-xs lg:text-sm font-black text-gray-600 mb-2 lg:mb-3">Email</label>
                      <p className="text-lg lg:text-2xl font-black text-[#3d3f56] break-words">{user?.email}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 lg:p-8 rounded-2xl border-2 border-purple-200 sm:col-span-2">
                      <label className="block text-xs lg:text-sm font-black text-gray-600 mb-2 lg:mb-3">Member Since</label>
                      <p className="text-xl lg:text-2xl font-black text-[#3d3f56]">
                        {new Date(user?.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Offers Tab */}
              {activeTab === "offers" && (
                <div className="space-y-6 lg:space-y-8">
                  {offersLoading ? (
                    <p className="text-center text-gray-500 text-base lg:text-xl">Loading...</p>
                  ) : myOffers.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                        {myOffers.map((offer) => (
                          <div
                            key={offer.id}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 lg:p-8 border-2 border-blue-200"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 lg:mb-6">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-2xl lg:text-3xl font-black text-[#3d3f56] mb-2 break-words">
                                  {offer.title}
                                </h3>
                                <p className="text-sm lg:text-base text-gray-600 font-black">
                                  {offer.category?.name}
                                </p>
                              </div>
                              <span
                                className={`px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-black flex-shrink-0 ${
                                  offer.active
                                    ? "bg-green-200 text-green-800"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                {offer.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-base lg:text-lg text-gray-700 font-semibold mb-4 lg:mb-6 break-words">
                              {offer.description}
                            </p>
                            <div className="flex items-center justify-between gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400 fill-yellow-400" />
                                <span className="font-black text-base lg:text-lg text-[#3d3f56]">
                                  {offer.avgRating || "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 lg:gap-3">
                              <button
                                onClick={() => handleEditOffer(offer)}
                                className="flex-1 bg-[#1CC4B6] hover:bg-[#19b0a3] text-white font-black py-2 lg:py-3 px-4 rounded-full text-sm lg:text-base transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(offer.id)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-2 lg:py-3 px-4 rounded-full text-sm lg:text-base transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {offersTotalPages > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 lg:gap-4 mt-6 lg:mt-8">
                          <button
                            onClick={() => fetchMyOffers(offersPage - 1)}
                            disabled={offersPage === 1}
                            className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-full font-black text-sm lg:text-lg"
                          >
                            Previous
                          </button>
                          <span className="px-4 lg:px-6 py-2 lg:py-3 font-black text-sm lg:text-lg">
                            {offersPage} / {offersTotalPages}
                          </span>
                          <button
                            onClick={() => fetchMyOffers(offersPage + 1)}
                            disabled={offersPage === offersTotalPages}
                            className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-full font-black text-sm lg:text-lg"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-12 text-base lg:text-xl">No offers yet</p>
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === "requests" && (
                <div className="space-y-6 lg:space-y-8">
                  {requestsLoading ? (
                    <p className="text-center text-gray-500 text-base lg:text-xl">Loading...</p>
                  ) : myRequests.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                        {myRequests.map((request) => (
                          <div
                            key={request.id}
                            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 lg:p-8 border-2 border-purple-200"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 lg:mb-6">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-2xl lg:text-3xl font-black text-[#3d3f56] mb-2 break-words">
                                  {request.description.slice(0, 30)}...
                                </h3>
                                <p className="text-sm lg:text-base text-gray-600 font-black">
                                  {request.category?.name}
                                </p>
                              </div>
                              <span
                                className={`px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-black flex-shrink-0 ${
                                  request.active
                                    ? "bg-green-200 text-green-800"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                {request.active ? "Active" : "Closed"}
                              </span>
                            </div>
                            <p className="text-base lg:text-lg text-gray-700 font-semibold mb-4 lg:mb-6 break-words">
                              {request.description}
                            </p>
                            <div className="flex gap-2 lg:gap-3">
                              <button
                                onClick={() => handleEditRequest(request)}
                                className="flex-1 bg-[#1CC4B6] hover:bg-[#19b0a3] text-white font-black py-2 lg:py-3 px-4 rounded-full text-sm lg:text-base transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRequest(request.id)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-2 lg:py-3 px-4 rounded-full text-sm lg:text-base transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {requestsTotalPages > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 lg:gap-4 mt-6 lg:mt-8">
                          <button
                            onClick={() => fetchMyRequests(requestsPage - 1)}
                            disabled={requestsPage === 1}
                            className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-full font-black text-sm lg:text-lg"
                          >
                            Previous
                          </button>
                          <span className="px-4 lg:px-6 py-2 lg:py-3 font-black text-sm lg:text-lg">
                            {requestsPage} / {requestsTotalPages}
                          </span>
                          <button
                            onClick={() => fetchMyRequests(requestsPage + 1)}
                            disabled={requestsPage === requestsTotalPages}
                            className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-full font-black text-sm lg:text-lg"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-12 text-base lg:text-xl">No requests yet</p>
                  )}
                </div>
              )}

              {/* Ratings Tab */}
              {activeTab === "ratings" && (
                <div className="space-y-4 lg:space-y-6">
                  {ratingsLoading ? (
                    <p className="text-center text-gray-500 text-base lg:text-xl">Loading...</p>
                  ) : ratings.length > 0 ? (
                    <div className="space-y-3 lg:space-y-4">
                      {ratings.map((rating) => (
                        <div
                          key={rating.id}
                          className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 lg:p-8 border-2 border-yellow-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-lg lg:text-xl text-[#3d3f56] mb-1 break-words">
                              {rating.offer?.title || "Service"}
                            </p>
                            <p className="text-sm lg:text-base text-gray-600 font-semibold">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 lg:w-7 lg:h-7 ${
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
                    <p className="text-center text-gray-500 py-12 text-base lg:text-xl">No ratings yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ MOBILE RESPONSIVE Edit Offer Modal */}
        {editingOffer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl lg:text-3xl font-black text-[#3d3f56] mb-4 lg:mb-6">Edit Offer</h2>

              <div className="space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-xs lg:text-sm font-bold text-gray-600 mb-2">Title</label>
                  <input
                    type="text"
                    value={editOfferForm.title}
                    onChange={(e) => setEditOfferForm({ ...editOfferForm, title: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#1CC4B6] text-gray-900 text-sm lg:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs lg:text-sm font-bold text-gray-600 mb-2">Description</label>
                  <textarea
                    value={editOfferForm.description}
                    onChange={(e) => setEditOfferForm({ ...editOfferForm, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#1CC4B6] text-gray-900 text-sm lg:text-base"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6">
                <button
                  onClick={() => setEditingOffer(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOffer}
                  className="flex-1 bg-[#1CC4B6] hover:bg-[#19b0a3] text-white font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base"
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
            <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl lg:text-3xl font-black text-[#3d3f56] mb-4 lg:mb-6">Edit Request</h2>

              <div className="space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-xs lg:text-sm font-bold text-gray-600 mb-2">Description</label>
                  <textarea
                    value={editRequestForm.description}
                    onChange={(e) => setEditRequestForm({ ...editRequestForm, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#1CC4B6] text-gray-900 text-sm lg:text-base"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6">
                <button
                  onClick={() => setEditingRequest(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRequest}
                  className="flex-1 bg-[#1CC4B6] hover:bg-[#19b0a3] text-white font-bold py-2 lg:py-3 rounded-full transition-all text-sm lg:text-base"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}