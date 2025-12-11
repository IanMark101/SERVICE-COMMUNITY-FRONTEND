"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LoadingScreen from "./components/LoadingScreen";
import { 
  Search, 
  MessageCircle, 
  Plus, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Star,
  Home,
  Info,
  User,
  Settings,
  Lightbulb
} from "lucide-react";
import api from "@/services/api";
import DashboardHeader from "./components/DashboardHeader";
import RatingModal from "./components/RatingModal";
import RequestModal from "./components/RequestModal";
import OfferModal from "./components/OfferModal";
import ContactModal from "./components/ContactModal";
import SettingsModals from "./components/SettingsModals";
import SuggestionModal from "./components/SuggestionModal";
import { useDarkMode } from "@/app/context/DarkModeContext";
import { useLogout } from "@/hooks/useLogout";

interface Category { id: string; name: string; createdAt: string }
interface User { id: string; name: string; email: string }
interface Offer { id: string; title: string; description: string; user: User; ratings: any[]; active: boolean; createdAt: string }
interface ServiceRequest { id: string; description: string; user: User; active: boolean; createdAt: string }
interface SearchResult {
  id: string;
  name: string;
  email?: string;
  type: "user" | "service";
}

const ITEMS_PER_PAGE = 4;
const SEEKERS_PER_PAGE = 3;
const OFFERS_PER_PAGE = 3;

export default function Dashboard() {
  const router = useRouter();
  const { isDark } = useDarkMode();
  const { logout } = useLogout();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersPage, setOffersPage] = useState(1);
  const [offersTotalPages, setOffersTotalPages] = useState(1);

  const [selectedSeekerCategory, setSelectedSeekerCategory] = useState<string | null>(null);
  const [seekersByCategory, setSeekersByCategory] = useState<ServiceRequest[]>([]);
  const [seekersLoading, setSeekersLoading] = useState(false);
  const [seekerCategoryPage, setSeekerCategoryPage] = useState(1);
  const [seekerCategoryTotalPages, setSeekerCategoryTotalPages] = useState(1);

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [contactModal, setContactModal] = useState<{ show: boolean; userId: string; userName: string }>({ show: false, userId: "", userName: "" });
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; offerId: string; offerTitle: string; offerUserId: string } | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (!userToken) {
      router.push("/auth/login");
      return;
    }
    loadInitialData();
  }, [router]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch current user
      const userRes = await api.get("/users/me");
      setCurrentUserId(userRes.data?.id);
      
      await fetchCategories();
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/services/categories");
      setCategories(res.data || []);
      setFilteredCategories(res.data || []);
    } catch (err: any) {
      setError("Failed to load categories");
    }
  };

  const fetchOffers = async (categoryId: string, page: number = 1) => {
    try {
      setOffersLoading(true);
      const res = await api.get(`/services/offers/${categoryId}`, { params: { page, limit: OFFERS_PER_PAGE } });
      setOffers(res.data.offers || []);
      setSelectedCategory(categoryId);
      setOffersPage(res.data.page || page);
      setOffersTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchSeekersByCategory = async (categoryId: string, page: number = 1) => {
    try {
      setSeekersLoading(true);
      const res = await api.get(`/services/requests/category/${categoryId}`, { params: { page, limit: SEEKERS_PER_PAGE } });
      const payload = res.data || {};
      setSeekersByCategory(Array.isArray(payload.requests) ? payload.requests : []);
      setSeekerCategoryPage(payload.page || page);
      setSeekerCategoryTotalPages(payload.totalPages || 1);
      setSelectedSeekerCategory(categoryId);
    } catch (err) {
      setSeekersByCategory([]);
    } finally {
      setSeekersLoading(false);
    }
  };

  // ✅ FIXED SEARCH - Only searches USERS and hides dropdown when cleared
  const handleUnifiedSearch = async (query: string) => {
    setSearchQuery(query);
    
    // ✅ Clear results immediately when input is empty
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      
      // Search for users ONLY
      const usersRes = await api.get(`/users`, {
        params: { search: query, page: 1, limit: 10 }
      }).catch(() => ({ data: { users: [] } }));

      const users = (usersRes.data.users || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        type: "user" as const
      }));

      setSearchResults(users);
      // ✅ Only show dropdown if there are actual results
      setShowSearchResults(users.length > 0);
    } catch (err) {
      console.error("Error searching:", err);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCategoryPage(1);
    setFilteredCategories(query.trim() === "" ? categories : categories.filter(cat => cat.name.toLowerCase().includes(query.toLowerCase())));
  };

  const getPaginatedCategories = () => {
    const start = (categoryPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  };

  const getTotalCategoryPages = () => Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const getAvgRating = (ratings: any[]) => {
    if (!ratings || ratings.length === 0) return 0;
    return (ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length).toFixed(1);
  };
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const isOwnOffer = (offerUserId: string) => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return false;
      const userData = JSON.parse(user);
      const currentUserId = userData?.id?.toString();
      const compareUserId = offerUserId?.toString();
      return currentUserId === compareUserId;
    } catch (err) {
      console.error("Error comparing user IDs:", err);
      return false;
    }
  };

  const handleLogout = async () => {
    console.log("🚪 User logout initiated");
    await logout(false); // false = user logout (not admin)
  };

  // Components
  const CategoryCard = ({ cat, onClick, isSeeker = false }: any) => (
    <button
      onClick={onClick}
      className={`rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-start min-h-[180px] border-2 text-left ${
        isDark
          ? 'bg-slate-800 border-slate-700 hover:border-sky-500'
          : 'bg-white border-[#e8eaf5] hover:border-[#7CA0D8]'
      }`}
    >
      <div className={`text-2xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>{cat.name}</div>
      <p className={`font-semibold text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-[#9CA3B8]'}`}>{isSeeker ? "Users seeking help" : "Trusted services"}</p>
      <div className="mt-auto w-full flex justify-center">
        <span className={`text-white font-bold py-2.5 px-10 rounded-full shadow-md text-sm hover:shadow-lg transition-all ${
          isSeeker ? 'bg-[#1CC4B6] hover:bg-[#19b0a3]' : 'bg-[#7CA0D8] hover:bg-[#6a8ec7]'
        }`}>
          {isSeeker ? "View Requests" : "View Offers"}
        </span>
      </div>
    </button>
  );

  const PaginationControls = ({ currentPage, totalPages, onPrevious, onNext, onPageChange }: { currentPage: number; totalPages: number; onPrevious: () => void; onNext: () => void; onPageChange: (page: number) => void }) => (
    <div className="flex items-center justify-center gap-3 mt-10">
      <button onClick={onPrevious} disabled={currentPage === 1} className={`flex items-center gap-2 border-2 font-bold py-2.5 px-4 rounded-full shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${
        isDark
          ? 'bg-slate-800 border-slate-700 hover:border-sky-500 text-slate-100'
          : 'bg-white border-[#e8eaf5] hover:border-[#7CA0D8] text-[#3d3f56]'
      }`}>
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Previous</span>
      </button>
      <div className={`flex items-center gap-1.5 rounded-full p-2 shadow-sm border-2 ${
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-[#e8eaf5]'
      }`}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page: number) => (
          <button key={page} onClick={() => onPageChange(page)} className={`w-9 h-9 rounded-full font-bold transition-all duration-300 text-sm ${
            currentPage === page
              ? 'bg-[#7CA0D8] text-white shadow-md'
              : isDark
              ? 'text-slate-300 hover:bg-slate-700'
              : 'text-[#3d3f56] hover:bg-[#f5f6fb]'
          }`}>
            {page}
          </button>
        ))}
      </div>
      <button onClick={onNext} disabled={currentPage === totalPages} className={`flex items-center gap-2 border-2 font-bold py-2.5 px-4 rounded-full shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${
        isDark
          ? 'bg-slate-800 border-slate-700 hover:border-sky-500 text-slate-100'
          : 'bg-white border-[#e8eaf5] hover:border-[#7CA0D8] text-[#3d3f56]'
      }`}>
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  const OfferCard = ({ offer }: any) => {
    const ownOffer = currentUserId === offer.user?.id;
    console.log("🔄 Comparing IDs:", { currentUserId, offerUserId: offer.user?.id, match: ownOffer });
    
    return (
    <div className={`rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-2 ${
      isDark
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-[#e8eaf5]'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className={`text-xl font-black flex-1 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>{offer.title}</h3>
        <div className="flex gap-2 ml-2">
          {ownOffer && (
            <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-full">
              Your Offer
            </span>
          )}
          <span className="inline-block px-3 py-1 bg-[#7CA0D8] text-white text-xs font-black rounded-full">
            {offer.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <p className={`font-semibold mb-4 line-clamp-2 ${isDark ? 'text-slate-300' : 'text-[#3d3f56]'}`}>{offer.description}</p>

      <div className={`rounded-xl p-3 mb-4 flex items-center gap-3 border-2 ${
        isDark
          ? 'bg-slate-700 border-slate-600'
          : 'bg-[#f5f6fb] border-[#e8eaf5]'
      }`}>
        <div className="w-12 h-12 bg-[#7CA0D8] rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
          {offer.user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold truncate ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>{offer.user.name}</p>
          <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-[#9CA3B8]'}`}>{offer.user.email}</p>
        </div>
      </div>

      <div className={`flex items-center justify-between mb-4 text-sm rounded-lg p-3 border ${
        isDark
          ? 'bg-slate-700/50 border-slate-600 text-slate-200'
          : 'bg-[#fffbf0] border-[#ffe8c4] text-[#3d3f56]'
      }`}>
        <span className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-bold">{getAvgRating(offer.ratings)}</span>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#9CA3B8]'}`}>({offer.ratings?.length || 0})</span>
        </span>
        <span className={`font-semibold text-xs ${isDark ? 'text-slate-400' : 'text-[#9CA3B8]'}`}>{formatDate(offer.createdAt)}</span>
      </div>

      <div className="space-y-2">
        <button onClick={() => router.push("/dashboard/messages")} className="w-full bg-[#7CA0D8] hover:bg-[#6a8ec7] text-white rounded-full py-3 text-base font-bold transition-all duration-300 flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Contact
        </button>
        <button 
          onClick={() => setRatingModal({ isOpen: true, offerId: offer.id, offerTitle: offer.title, offerUserId: offer.user.id })} 
          disabled={ownOffer}
          className={`w-full font-bold py-2.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 border-2 ${
            ownOffer
              ? isDark
                ? 'bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed opacity-50'
                : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
              : isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-sky-400 border-sky-500/50'
              : 'bg-white hover:bg-[#f5f6fb] text-[#7CA0D8] border-[#7CA0D8]'
          }`}
          title={ownOffer ? "You cannot rate your own offer" : "Rate this service"}
        >
          <Star className="w-5 h-5" />
          {ownOffer ? "Your Offer - Cannot Rate" : "Rate"}
        </button>
      </div>
    </div>
    );
  };

  const SeekerCard = ({ req }: any) => (
    <div className={`rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-2 flex flex-col justify-between min-h-[220px] ${
      isDark
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-[#e8eaf5]'
    }`}>
      <div className="space-y-3">
        <div className="inline-block px-3 py-1 bg-[#1CC4B6] text-white text-xs font-black rounded-full w-fit">
          {req.active ? "Open" : "Closed"}
        </div>
        <h3 className={`text-lg font-black leading-tight ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>{req.description.slice(0, 60)}...</h3>
        <p className={`font-semibold text-sm line-clamp-2 ${isDark ? 'text-slate-300' : 'text-[#3d3f56]'}`}>{req.description}</p>
      </div>

      <div className={`flex items-center justify-between pt-4 mt-4 border-t-2 ${
        isDark ? 'border-slate-700' : 'border-[#e8eaf5]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1CC4B6] rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
            {req.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-black ${isDark ? 'text-slate-400' : 'text-[#9CA3B8]'}`}>Posted by</p>
            <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>{req.user.name}</p>
          </div>
        </div>
        <button onClick={() => setContactModal({ show: true, userId: req.user.id, userName: req.user.name })} className="bg-[#1CC4B6] hover:bg-[#19b0a3] text-white text-sm font-black py-2.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0">
          Talk
        </button>
      </div>
    </div>
  );

  if (isLoading) return <LoadingScreen message="Loading your dashboard..." />;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-[#e8eaf0]'}`}>
      {/* HEADER */}
      <DashboardHeader 
        onSettingsClick={() => setShowSettingsModal(true)}
        currentPage="home"
        onSearch={handleUnifiedSearch}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        searchType="users"
      />

      <div className="h-6"></div>

      {/* HERO */}
      <div 
        className="w-full rounded-3xl shadow-lg p-8 lg:px-12 lg:py-12 flex flex-col md:flex-row items-center justify-between min-h-[300px] max-w-7xl mx-auto gap-8 relative overflow-hidden"
        style={{
          background: isDark 
            ? "linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)"
            : "linear-gradient(135deg, #7CA0D8 0%, #6a8ec7 100%)",
          backgroundImage: isDark
            ? `
              radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 50%),
              linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)
            `
            : `
              radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%),
              linear-gradient(135deg, #7CA0D8 0%, #6a8ec7 100%)
            `
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl -ml-40 -mb-40"></div>

        <div className="w-full md:w-3/5 space-y-6 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white">
            Find a Service
          </h2>
          <p className="text-lg text-white font-semibold">
            Connect with trusted helpers in your community
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowOfferModal(true)}
              className={`hover:scale-105 active:scale-95 font-black py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg flex-1 sm:flex-initial ${
                isDark
                  ? 'bg-slate-100 hover:bg-blue-400 text-blue-600 hover:text-white'
                  : 'bg-white hover:bg-[#7CA0D8] text-[#7CA0D8] hover:text-white'
              }`}
            >
              <Plus className="w-6 h-6" />
              Offer Service
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className={`hover:scale-105 active:scale-95 font-black py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg flex-1 sm:flex-initial ${
                isDark
                  ? 'bg-slate-100 hover:bg-teal-400 text-teal-600 hover:text-white'
                  : 'bg-white hover:bg-[#1CC4B6] text-[#1CC4B6] hover:text-white'
              }`}
            >
              <MessageSquare className="w-6 h-6" />
              Request Service
            </button>
            <button
              onClick={() => setShowSuggestionModal(true)}
              className={`hover:scale-105 active:scale-95 font-black py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg flex-1 sm:flex-initial ${
                isDark
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-white'
              }`}
            >
              <Lightbulb className="w-6 h-6" />
              Suggest Service Type
            </button>
          </div>
        </div>

        {/* Community Illustration */}
        <div className="w-full md:w-2/5 flex items-center justify-center relative z-20">
          <Image
            src="/heroimg.jpg"
            alt="Community working together"
            width={500}
            height={340}
            className="w-full max-w-lg h-auto rounded-2xl"
            priority
          />
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-6 py-12 space-y-12`}>
        {error && (
          <div className={`border-2 px-6 py-4 rounded-lg font-semibold ${
            isDark
              ? 'bg-red-950/50 border-red-800 text-red-200'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* SERVICE TYPES */}
        {!selectedCategory && (
          <div className="space-y-6">
            <h2 className={`text-3xl font-black ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
              Available Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getPaginatedCategories().map((cat) => (
                <CategoryCard key={cat.id} cat={cat} onClick={() => fetchOffers(cat.id, 1)} />
              ))}
            </div>

            {getTotalCategoryPages() > 1 && (
              <PaginationControls
                currentPage={categoryPage}
                totalPages={getTotalCategoryPages()}
                onPrevious={() => setCategoryPage((p) => Math.max(p - 1, 1))}
                onNext={() => setCategoryPage((p) => Math.min(p + 1, getTotalCategoryPages()))}
                onPageChange={setCategoryPage}
              />
            )}
          </div>
        )}

        {/* OFFERS BY CATEGORY */}
        {selectedCategory && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setOffers([]);
                setOffersPage(1);
                setOffersTotalPages(1);
              }}
              className={`mb-4 px-4 py-2 rounded-full font-semibold transition-all ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-sky-300'
                  : 'bg-[#e8eaf5] hover:bg-[#d8dce8] text-[#7CA0D8]'
              }`}
            >
              ← Back to Service Types
            </button>

            <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
              {categories.find((c) => c.id === selectedCategory)?.name} - Available Offers
            </h2>

            {offersLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className={`w-12 h-12 border-4 rounded-full animate-spin ${
                  isDark
                    ? 'border-slate-700 border-t-sky-400'
                    : 'border-[#e8eaf5] border-t-[#7CA0D8]'
                }`}></div>
                <p className={`text-lg font-semibold ${isDark ? 'text-slate-400' : 'text-[#9CA3B8]'}`}>Loading amazing offers...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.length > 0 ? offers.map((offer) => <OfferCard key={offer.id} offer={offer} />) : (
                  <div className={`col-span-full flex flex-col items-center justify-center py-12 space-y-4 rounded-2xl border-2 border-dashed ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-gradient-to-br from-[#f5f6fb] to-[#e8eaf5] border-[#d8dce8]'
                  }`}>
                    <Star className={`w-12 h-12 opacity-40 ${isDark ? 'text-sky-400' : 'text-[#7CA0D8]'}`} />
                    <p className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-[#9CA3B8]'}`}>No offers in this category yet</p>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-[#d8dce8]'}`}>Be the first to offer a service!</p>
                  </div>
                )}
              </div>
            )}

            {offersTotalPages > 1 && (
              <PaginationControls
                currentPage={offersPage}
                totalPages={offersTotalPages}
                onPrevious={() => fetchOffers(selectedCategory!, offersPage - 1)}
                onNext={() => fetchOffers(selectedCategory!, offersPage + 1)}
                onPageChange={(page) => fetchOffers(selectedCategory!, page)}
              />
            )}
          </div>
        )}

        {/* SEEKERS */}
        {!selectedCategory && !selectedSeekerCategory && (
          <div className="space-y-6">
            <h2 className={`text-3xl font-black ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
              Service Requests
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getPaginatedCategories().map((cat) => (
                <CategoryCard key={cat.id} cat={cat} onClick={() => fetchSeekersByCategory(cat.id)} isSeeker />
              ))}
            </div>

            {getTotalCategoryPages() > 1 && (
              <PaginationControls
                currentPage={categoryPage}
                totalPages={getTotalCategoryPages()}
                onPrevious={() => setCategoryPage((p) => Math.max(p - 1, 1))}
                onNext={() => setCategoryPage((p) => Math.min(p + 1, getTotalCategoryPages()))}
                onPageChange={setCategoryPage}
              />
            )}
          </div>
        )}

        {/* SEEKERS BY CATEGORY */}
        {selectedSeekerCategory && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedSeekerCategory(null);
                setSeekersByCategory([]);
                setSeekerCategoryPage(1);
              }}
              className={`mb-4 px-4 py-2 rounded-full font-semibold transition-all ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-sky-300'
                  : 'bg-[#e8eaf5] hover:bg-[#d8dce8] text-[#7CA0D8]'
              }`}
            >
              ← Back to Seeker Categories
            </button>

            <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
              {categories.find((c) => c.id === selectedSeekerCategory)?.name} – Service Requests
            </h2>

            {seekersLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className={`w-12 h-12 border-4 rounded-full animate-spin ${
                  isDark
                    ? 'border-slate-700 border-t-teal-400'
                    : 'border-[#e8eaf5] border-t-[#1CC4B6]'
                }`}></div>
                <p className={`text-lg font-semibold ${isDark ? 'text-slate-400' : 'text-[#9CA3B8]'}`}>Loading service requests...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seekersByCategory.length > 0 ? seekersByCategory.map((req) => <SeekerCard key={req.id} req={req} />) : (
                  <div className={`col-span-full flex flex-col items-center justify-center py-12 space-y-4 rounded-2xl border-2 border-dashed ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-gradient-to-br from-[#f5f6fb] to-[#e8eaf5] border-[#d8dce8]'
                  }`}>
                    <MessageSquare className={`w-12 h-12 opacity-40 ${isDark ? 'text-teal-400' : 'text-[#1CC4B6]'}`} />
                    <p className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-[#9CA3B8]'}`}>No requests in this category yet</p>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-[#d8dce8]'}`}>Help someone by fulfilling their request!</p>
                  </div>
                )}
              </div>
            )}

            {seekerCategoryTotalPages > 1 && (
              <PaginationControls
                currentPage={seekerCategoryPage}
                totalPages={seekerCategoryTotalPages}
                onPrevious={() => fetchSeekersByCategory(selectedSeekerCategory, seekerCategoryPage - 1)}
                onNext={() => fetchSeekersByCategory(selectedSeekerCategory, seekerCategoryPage + 1)}
                onPageChange={(page) => fetchSeekersByCategory(selectedSeekerCategory, page)}
              />
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <RequestModal isOpen={showRequestModal} categories={categories} onClose={() => setShowRequestModal(false)} onSuccess={fetchCategories} />
      <OfferModal isOpen={showOfferModal} categories={categories} onClose={() => setShowOfferModal(false)} />
      <ContactModal userName={contactModal.userName} show={contactModal.show} onClose={() => setContactModal({ show: false, userId: "", userName: "" })} onStartConversation={() => { setContactModal({ show: false, userId: "", userName: "" }); router.push("/dashboard/messages"); }} />
      <SettingsModals showSettings={showSettingsModal} showEditProfile={showEditProfileModal} showChangePassword={showChangePasswordModal} onCloseSettings={() => setShowSettingsModal(false)} onCloseEditProfile={() => setShowEditProfileModal(false)} onCloseChangePassword={() => setShowChangePasswordModal(false)} onEditProfileClick={() => { setShowSettingsModal(false); setShowEditProfileModal(true); }} onChangePasswordClick={() => { setShowSettingsModal(false); setShowChangePasswordModal(true); }} onLogout={handleLogout} />
      {ratingModal && <RatingModal isOpen={ratingModal.isOpen} offerId={ratingModal.offerId} offerTitle={ratingModal.offerTitle} offerUserId={ratingModal.offerUserId} onClose={() => setRatingModal(null)} onSuccess={() => setRatingModal(null)} />}
      <SuggestionModal isOpen={showSuggestionModal} onClose={() => setShowSuggestionModal(false)} onSuccess={fetchCategories} />
    </div>
  );
}