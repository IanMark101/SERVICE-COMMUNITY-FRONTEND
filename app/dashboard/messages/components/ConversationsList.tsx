"use client";

import { Search } from "lucide-react";
import { Conversation, User } from "../types";
import { useDarkMode } from "@/app/context/DarkModeContext";

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  searchQuery: string;
  onSearch: (value: string) => void | Promise<void>;
  searchResults: User[];
  showSearchResults: boolean;
  searchLoading: boolean;
  onSelectSearchResult: (user: User) => void;
  onSelectConversation: (userId: string, userName: string) => void;
}

export default function ConversationsList({
  conversations,
  selectedConversation,
  searchQuery,
  onSearch,
  searchResults,
  showSearchResults,
  searchLoading,
  onSelectSearchResult,
  onSelectConversation,
}: ConversationsListProps) {
  const { isDark } = useDarkMode();

  return (
    <div className={`lg:col-span-1 rounded-3xl shadow-xl border-2 p-6 flex flex-col min-h-[500px] lg:h-[650px] ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-br from-white to-[#f9fafb] border-gray-100'}`}>
      <div className="mb-6">
        <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>
          💬 {conversations.length} Conversation{conversations.length !== 1 ? "s" : ""}
        </h3>
        <div className="relative">
          <Search className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-teal-400' : 'text-[#1CC4B6]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search people or conversations"
            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-sm font-semibold transition-all ${isDark ? 'bg-gradient-to-r from-slate-700 to-slate-600 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20' : 'bg-gradient-to-r from-[#f0f4f8] to-[#f9fafb] border-[#e5e9f0] text-[#3d3f56] placeholder:text-gray-400 focus:outline-none focus:border-[#1CC4B6] focus:ring-2 focus:ring-[#1CC4B6]/20'}`}
          />
          {showSearchResults && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border-2 shadow-xl max-h-64 overflow-y-auto z-10 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
              {searchLoading ? (
                <p className={`text-center text-sm py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Searching...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((userResult) => (
                  <button
                    key={userResult.id}
                    onClick={() => onSelectSearchResult(userResult)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left border-b last:border-b-0 ${isDark ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-[#f0f4f8] border-gray-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-md ${isDark ? 'bg-gradient-to-br from-sky-500 to-teal-500' : 'bg-gradient-to-br from-[#7CA0D8] to-[#1CC4B6]'}`}>
                      {userResult.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>{userResult.name}</p>
                      <p className={`text-xs truncate ${isDark ? 'text-sky-400/70' : 'text-[#7CA0D8]/70'}`}>{userResult.email}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className={`text-center text-sm py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No users found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {conversations.length > 0 ? (
        <div className="space-y-2 overflow-y-auto flex-1 pr-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.userId}
              onClick={() => onSelectConversation(conversation.userId, conversation.userName)}
              className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border-2 ${
                selectedConversation === conversation.userId
                  ? isDark ? "bg-gradient-to-br from-sky-600 to-teal-500 text-white shadow-lg border-teal-500" : "bg-gradient-to-br from-[#7CA0D8] to-[#1CC4B6] text-white shadow-lg border-[#1CC4B6]"
                  : isDark ? "bg-gradient-to-br from-slate-800 to-slate-700 text-slate-100 border-slate-700 hover:border-teal-500/40 hover:shadow-md" : "bg-gradient-to-br from-[#f9fafb] to-[#f5f8fc] text-[#3d3f56] border-gray-100 hover:border-[#1CC4B6]/40 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${
                    selectedConversation === conversation.userId
                      ? "bg-white/20 text-white"
                      : isDark ? "bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-md" : "bg-gradient-to-br from-[#7CA0D8] to-[#1CC4B6] text-white shadow-md"
                  }`}
                >
                  {conversation.userName.charAt(0).toUpperCase()}
                </div>
                <p
                  className={`font-black text-base ${
                    selectedConversation === conversation.userId ? "text-white" : isDark ? "text-slate-100" : "text-[#3d3f56]"
                  }`}
                >
                  {conversation.userName}
                </p>
              </div>
              <p
                className={`text-sm truncate font-semibold ${
                  selectedConversation === conversation.userId ? "text-white/90" : isDark ? "text-slate-300" : "text-gray-600"
                }`}
              >
                {conversation.lastMessage}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className={`font-semibold text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {searchQuery
              ? "No conversations found"
              : "No conversations yet. Start offering or requesting services!"}
          </p>
        </div>
      )}
    </div>
  );
}
