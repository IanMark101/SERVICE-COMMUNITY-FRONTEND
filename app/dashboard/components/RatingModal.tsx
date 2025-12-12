"use client";

import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { useDarkMode } from "@/app/context/DarkModeContext";
import { useToast } from "./Toast";
import api from "@/services/api";

interface RatingModalProps {
  isOpen: boolean;
  offerId: string;
  offerTitle: string;
  offerUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RatingModal({
  isOpen,
  offerId,
  offerTitle,
  offerUserId,
  onClose,
  onSuccess,
}: RatingModalProps) {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnOffer, setIsOwnOffer] = useState(false);

  const currentUserId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!).id
    : null;

  // ✅ Check status when modal opens
  useEffect(() => {
    if (isOpen && offerId) {
      checkStatus();
    }
  }, [isOpen, offerId]);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if own offer
      if (currentUserId === offerUserId) {
        setIsOwnOffer(true);
        return;
      }

      // Check if already rated
      const response = await api.get(`/services/check-rating/${offerId}`);
      setAlreadyRated(response.data.alreadyRated);
    } catch (err) {
      console.error("Error checking rating status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Show nothing while loading
  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-white'}`}>
          <p className={`text-center font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is rating their own offer
  if (isOwnOffer) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700' : 'bg-white'}`}>
          <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
            Cannot Rate
          </h2>
          <p className={`font-semibold mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            You cannot rate your own service offer.
          </p>
          <button
            onClick={onClose}
            className={`w-full text-white font-bold py-3 rounded-full transition-all ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ✅ Check if already rated
  if (alreadyRated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700' : 'bg-white'}`}>
          <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
            Already Rated
          </h2>
          <p className={`font-semibold mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            You have already rated this service. You can only rate it once.
          </p>
          <button
            onClick={onClose}
            className={`w-full text-white font-bold py-3 rounded-full transition-all ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      showToast("Please select a rating", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/services/rate", {
        offerId,
        stars: rating,
      });

      showToast("Rating submitted successfully!", "success");
      setRating(0);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error submitting rating:", err);
      showToast(err.response?.data?.message || "Failed to submit rating", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-3xl font-black ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>Rate Service</h2>
          <button
            onClick={onClose}
            className={`transition-all ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className={`font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Service:</p>
          <p className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>{offerTitle}</p>
        </div>

        <div className="mb-8">
          <p className={`font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Your Rating:</p>
          <div className="flex gap-4 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-all transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : isDark
                      ? "text-slate-600"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className={`text-center mt-4 font-bold ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
              {rating} Star{rating !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 font-bold py-3 rounded-full transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitRating}
            disabled={isSubmitting || rating === 0}
            className={`flex-1 disabled:opacity-50 text-white font-bold py-3 rounded-full transition-all ${isDark ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1CC4B6] hover:bg-[#19b0a3]'}`}
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}