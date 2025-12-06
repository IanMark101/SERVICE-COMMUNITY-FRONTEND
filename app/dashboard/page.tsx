"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Settings
} from "lucide-react";
import api from "@/services/api";
import DashboardHeader from "./components/DashboardHeader";
import RatingModal from "./components/RatingModal";
import RequestModal from "./components/RequestModal";
import OfferModal from "./components/OfferModal";
import ContactModal from "./components/ContactModal";
import SettingsModals from "./components/SettingsModals";

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

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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

  const fetchOffers = async (categoryId: string) => {
    try {
      setOffersLoading(true);
      const res = await api.get(`/services/offers/${categoryId}?page=1`);
      setOffers(res.data.offers || []);
      setSelectedCategory(categoryId);
    } catch (err) {
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

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // Components
  const CategoryCard = ({ cat, onClick, isSeeker = false }: any) => (
    <button
      onClick={onClick}
      className="bg-white rounded-[2rem] p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-start min-h-[180px] border-2 border-gray-100 hover:border-[#6FA3EF] text-left"
    >
      <div className="text-2xl font-black text-black mb-2">{cat.name}</div>
      <p className="text-gray-400 font-medium text-sm mb-6">{isSeeker ? "Users seeking help" : "Trusted services"}</p>
      <div className="mt-auto w-full flex justify-center">
        <span className={`${isSeeker ? "bg-[#1CC4B6]" : "bg-[#6FA3EF]"} text-white font-bold py-2 px-10 rounded-full shadow-md text-sm`}>
          {isSeeker ? "View Requests" : "Lists"}
        </span>
      </div>
    </button>
  );

  const PaginationControls = ({ currentPage, totalPages, onPrevious, onNext, onPageChange }: { currentPage: number; totalPages: number; onPrevious: () => void; onNext: () => void; onPageChange: (page: number) => void }) => (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button onClick={onPrevious} disabled={currentPage === 1} className="flex items-center gap-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-700 font-bold py-2 px-4 rounded-full shadow-md transition-all">
        <ChevronLeft className="w-5 h-5" />
        Previous
      </button>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page: number) => (
          <button key={page} onClick={() => onPageChange(page)} className={`w-10 h-10 rounded-full font-bold transition-all ${currentPage === page ? "bg-[#7CA0D8] text-white shadow-lg" : "bg-white text-slate-700 hover:bg-blue-50"}`}>
            {page}
          </button>
        ))}
      </div>
      <button onClick={onNext} disabled={currentPage === totalPages} className="flex items-center gap-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-700 font-bold py-2 px-4 rounded-full shadow-md transition-all">
        Next
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  const OfferCard = ({ offer }: any) => (
    <div className="bg-white rounded-[2rem] shadow-md hover:shadow-lg transition-all p-6 border-2 border-gray-100">
      <h3 className="text-2xl font-black text-[#3d3f56] mb-2">{offer.title}</h3>
      <p className="text-gray-600 font-semibold mb-4">{offer.description}</p>

      <div className="bg-[#f0f1f7] rounded-2xl p-4 mb-4 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black text-lg">
          {offer.user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-[#3d3f56]">{offer.user.name}</p>
          <p className="text-sm text-gray-600">{offer.user.email}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold">{getAvgRating(offer.ratings)}</span>
          <span className="text-gray-600">({offer.ratings?.length || 0})</span>
        </span>
        <span className="text-gray-600 font-semibold">{formatDate(offer.createdAt)}</span>
      </div>

      <div className="space-y-2">
        <button onClick={() => router.push("/dashboard/messages")} className="w-full bg-[#6FA3EF] hover:bg-[#5C90DD] text-white rounded-full py-3 text-lg font-bold transition-all flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Contact Provider
        </button>
        <button onClick={() => setRatingModal({ isOpen: true, offerId: offer.id, offerTitle: offer.title, offerUserId: offer.user.id })} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-full transition-all flex items-center justify-center gap-2">
          <Star className="w-5 h-5" />
          Rate This
        </button>
      </div>
    </div>
  );

  const SeekerCard = ({ req }: any) => (
    <div className="bg-white rounded-[2rem] shadow-md hover:shadow-lg transition-all p-6 border-2 border-gray-100 flex flex-col justify-between min-h-[220px]">
      <div>
        <h3 className="text-2xl font-black text-black leading-tight mb-3">{req.description.slice(0, 60)}...</h3>
        <p className="text-gray-600 font-semibold mb-4">{req.description}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black text-lg">
            {req.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-black text-gray-500">Posted by</p>
            <p className="text-base font-bold text-black">{req.user.name}</p>
          </div>
        </div>
        <button onClick={() => setContactModal({ show: true, userId: req.user.id, userName: req.user.name })} className="bg-[#1CC4B6] hover:bg-[#19b0a3] text-white text-base font-black py-2 px-8 rounded-full shadow-md transition-all hover:scale-105">
          Talk
        </button>
      </div>
    </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f6fb] to-white"><p className="text-[#3d3f56] text-lg font-bold">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f6fb] to-white">
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
      <div className="w-full bg-[#7CA0D8] rounded-[3rem] shadow-xl p-8 lg:px-12 lg:py-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[250px] max-w-7xl mx-auto">
        <div className="z-10 w-full md:w-3/5 space-y-6">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white drop-shadow-sm">
            Find a Service
          </h2>
          <p className="text-lg text-white/90 font-semibold">
            Connect with trusted helpers in your community
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowOfferModal(true)}
              className="bg-[#2D4A86] hover:bg-[#233a6b] text-white font-black py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-3 text-xl flex-1 sm:flex-initial"
            >
              <Plus className="w-7 h-7" />
              Offer Service
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-[#1CC4B6] hover:bg-[#19b0a3] text-white font-black py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-3 text-xl flex-1 sm:flex-initial"
            >
              <MessageSquare className="w-7 h-7" />
              Request Service
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-lg font-semibold">
            {error}
          </div>
        )}

        {/* SERVICE TYPES */}
        {!selectedCategory && (
          <div className="space-y-6">
            <div className="bg-[#7CA0D8] inline-block px-10 py-3 rounded-full shadow-md">
              <h2 className="text-2xl font-bold text-white drop-shadow-md tracking-wide">
                SERVICE TYPES
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getPaginatedCategories().map((cat) => (
                <CategoryCard key={cat.id} cat={cat} onClick={() => fetchOffers(cat.id)} />
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
              }}
              className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-full font-semibold"
            >
              ← Back to Service Types
            </button>

            <h2 className="text-3xl font-black text-[#3d3f56] mb-4">
              {categories.find((c) => c.id === selectedCategory)?.name} - Available Offers
            </h2>

            {offersLoading ? (
              <p className="text-gray-500 text-lg font-semibold">Loading offers...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.length > 0 ? offers.map((offer) => <OfferCard key={offer.id} offer={offer} />) : <p className="text-gray-500 text-lg font-semibold col-span-full">No offers in this category yet.</p>}
              </div>
            )}
          </div>
        )}

        {/* SEEKERS */}
        {!selectedCategory && !selectedSeekerCategory && (
          <div className="space-y-6">
            <div className="bg-[#7CA0D8] inline-block px-10 py-3 rounded-full shadow-md">
              <h2 className="text-2xl font-bold text-white drop-shadow-md tracking-wide uppercase">
                SEEKERS
              </h2>
            </div>

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
              className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-full font-semibold"
            >
              ← Back to Seeker Categories
            </button>

            <h2 className="text-3xl font-black text-[#3d3f56] mb-4">
              {categories.find((c) => c.id === selectedSeekerCategory)?.name} – Service Requests
            </h2>

            {seekersLoading ? (
              <p className="text-gray-500 text-lg font-semibold">Loading requests...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seekersByCategory.length > 0 ? seekersByCategory.map((req) => <SeekerCard key={req.id} req={req} />) : <p className="text-gray-500 text-lg font-semibold col-span-full">No requests in this category yet</p>}
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
    </div>
  );
}