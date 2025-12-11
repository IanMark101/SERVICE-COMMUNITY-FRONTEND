"use client";

import { FormEvent, RefObject, LegacyRef } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Message } from "../types";
import { useDarkMode } from "@/app/context/DarkModeContext";

interface ChatAreaProps {
  selectedConversation: string | null;
  conversationDisplayName: string;
  conversationInitial: string;
  conversationMessages: Message[];
  currentUserId?: string;
  messageText: string;
  onMessageTextChange: (value: string) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  sendingMessage: boolean;
  messagesEndRef: LegacyRef<HTMLDivElement>;
}

export default function ChatArea({
  selectedConversation,
  conversationDisplayName,
  conversationInitial,
  conversationMessages,
  currentUserId,
  messageText,
  onMessageTextChange,
  onSendMessage,
  sendingMessage,
  messagesEndRef,
}: ChatAreaProps) {
  const { isDark } = useDarkMode();

  if (!selectedConversation) {
    return (
      <div className={`lg:col-span-2 rounded-3xl shadow-xl border-2 p-6 flex flex-col min-h-[500px] lg:h-[650px] ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-br from-white to-[#f9fafb] border-gray-100'}`}>
        <div className="flex flex-col items-center justify-center h-full">
          <MessageCircle className={`w-20 h-20 mb-4 opacity-40 ${isDark ? 'text-teal-400' : 'text-[#1CC4B6]'}`} />
          <p className={`text-lg lg:text-xl font-black text-center ${isDark ? 'text-slate-200' : 'text-[#3d3f56]'}`}>
            Select a conversation to start messaging
          </p>
          <p className={`text-gray-500 font-semibold mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Choose from the list on the left</p>
        </div>
      </div>
    );
  }

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className={`lg:col-span-2 rounded-3xl shadow-xl border-2 p-5 lg:p-6 flex flex-col min-h-[500px] lg:h-[650px] ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-br from-white to-[#f9fafb] border-gray-100'}`}>
      {/* Chat Header */}
      <div className={`mb-6 pb-4 lg:pb-6 rounded-2xl p-4 lg:p-6 border-0 shadow-md ${isDark ? 'bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500' : 'bg-gradient-to-r from-[#7CA0D8] via-[#6FA3EF] to-[#1CC4B6]'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/25 rounded-full flex items-center justify-center text-white font-black text-lg lg:text-xl shadow-sm border-2 border-white/40">
            {conversationInitial}
          </div>
          <div>
            <h3 className="text-2xl lg:text-3xl font-black text-white">{conversationDisplayName || "Unknown User"}</h3>
            <p className="text-xs lg:text-sm text-white/80 font-bold">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 space-y-4 mb-6 overflow-y-auto p-4 lg:p-5 rounded-2xl border-2 ${isDark ? 'bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-b from-[#fafbfc] via-white to-[#f9f9fb] border-gray-100'}`}>
        {conversationMessages.length > 0 ? (
          <>
            {conversationMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                {message.senderId !== currentUserId && message.sender && (
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs lg:text-sm shadow-md ${isDark ? 'bg-gradient-to-br from-sky-500 to-teal-500' : 'bg-gradient-to-br from-[#7CA0D8] to-[#1CC4B6]'}`}>
                    {message.sender.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 lg:px-5 py-3 lg:py-4 rounded-2xl shadow-sm border-0 ${
                    message.senderId === currentUserId
                      ? isDark ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white ml-8 lg:ml-0' : 'bg-gradient-to-r from-[#7CA0D8] to-[#6FA3EF] text-white ml-8 lg:ml-0'
                      : isDark ? 'bg-gradient-to-br from-slate-700 to-slate-600 text-slate-100 border-2 border-slate-600' : 'bg-gradient-to-br from-[#f0f4f8] to-[#f5f8fc] text-[#3d3f56] border-2 border-[#e5e9f0]'
                  }`}
                >
                  <p
                    className={`font-bold text-xs mb-1.5 ${
                      message.senderId === currentUserId ? "text-white/90" : isDark ? "text-teal-400" : "text-[#1CC4B6]"
                    }`}
                  >
                    {message.sender?.name || "Unknown"}
                  </p>
                  <p className={`text-sm lg:text-base font-semibold leading-relaxed break-words ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{message.text}</p>
                  <p
                    className={`text-xs mt-2 font-semibold ${
                      message.senderId === currentUserId ? "text-white/60" : isDark ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className={`font-semibold text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              No messages yet. Start the conversation! 👋
            </p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={onSendMessage} className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={messageText}
            onChange={(event) => onMessageTextChange(event.target.value)}
            placeholder="Type your message here..."
            className={`w-full px-5 lg:px-6 py-3 lg:py-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-sm lg:text-base font-semibold transition-all ${isDark ? 'bg-gradient-to-r from-slate-700 to-slate-600 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20' : 'bg-gradient-to-r from-[#f5f8fc] to-[#f9fafb] border-gray-200 text-[#3d3f56] placeholder:text-gray-400 focus:border-[#1CC4B6] focus:ring-[#1CC4B6]/20'}`}
          />
        </div>
        <button
          type="submit"
          disabled={sendingMessage || !messageText.trim()}
          className={`disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 lg:py-4 px-6 lg:px-8 rounded-xl transition-all transform hover:scale-105 shadow-md flex items-center gap-2 ${isDark ? 'bg-gradient-to-r from-sky-600 to-teal-500 hover:from-teal-500 hover:to-sky-600' : 'bg-gradient-to-r from-[#7CA0D8] to-[#1CC4B6] hover:from-[#1CC4B6] hover:to-[#7CA0D8]'}`}
        >
          <Send className="w-4 h-4 lg:w-5 lg:h-5" />
          {sendingMessage ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
