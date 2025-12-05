"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import api from "@/services/api";

interface RatingModalProps {
  isOpen: boolean;
  offerId: string;
  offerTitle: string;
  offerUserId: string; // ✅ ADD THIS
  onClose: () => void;
  onSuccess: () => void;
}

export default function RatingModal({
  isOpen,
  offerId,
  offerTitle,
  offerUserId, // ✅ ADD THIS
  onClose,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!).id
    : null;

  // ✅ ADD THIS CHECK
  if (isOpen && currentUserId === offerUserId) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-3xl font-black text-[#3d3f56] mb-4">
            Cannot Rate
          </h2>
          <p className="text-gray-600 font-semibold mb-6">
            You cannot rate your own service offer.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-[#1CC4B6] hover:bg-[#19b0a3] text-white font-bold py-3 rounded-full transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/services/rate", {
        offerId,
        stars: rating,
      });

      alert("Rating submitted successfully!");
      setRating(0);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error submitting rating:", err);
      alert(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-[#3d3f56]">Rate Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 font-semibold mb-2">Service:</p>
          <p className="text-xl font-bold text-[#3d3f56]">{offerTitle}</p>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 font-semibold mb-4">Your Rating:</p>
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
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center mt-4 font-bold text-[#3d3f56]">
              {rating} Star{rating !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-full transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitRating}
            disabled={isSubmitting || rating === 0}
            className="flex-1 bg-[#1CC4B6] hover:bg-[#19b0a3] disabled:opacity-50 text-white font-bold py-3 rounded-full transition-all"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}