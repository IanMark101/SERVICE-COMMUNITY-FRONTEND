"use client";

import { X, MessageCircle } from "lucide-react";

interface ContactModalProps {
  userName: string;
  show: boolean;
  onClose: () => void;
  onStartConversation: () => void;
}

export default function ContactModal({ userName, show, onClose, onStartConversation }: ContactModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-black text-black">Contact {userName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="w-7 h-7" />
          </button>
        </div>

        <p className="text-gray-700 mb-6">
          You can start a conversation with {userName} by clicking the button below.
        </p>

        <button
          onClick={onStartConversation}
          className="w-full bg-[#1CC4B6] hover:bg-[#19b0a3] text-white font-black py-3 rounded-full text-lg transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Start Conversation
        </button>
      </div>
    </div>
  );
}