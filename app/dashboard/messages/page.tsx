"use client";

declare global {
  interface Window {
    Pusher: any;
  }
}

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, MessageCircle, User, Settings, LogOut, Search, Send, Lock, Home, Eye, EyeOff, X, Edit2 } from "lucide-react";
import api from "@/services/api";
import Link from "next/link";
import DashboardHeader from "@/app/dashboard/components/DashboardHeader";
import DashboardModals from "@/app/dashboard/components/DashboardModals";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  sender: User;
  receiver: User;
}

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
}

export default function MessagesPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ ADD THESE NEW STATE VARIABLES
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // ✅ MODAL STATES
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [reportForm, setReportForm] = useState({ reportedName: "", reason: "" });
  const [reportLoading, setReportLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/auth/login");
      return;
    }

    setCurrentUser(JSON.parse(user));
    fetchUser().finally(() => setIsLoading(false));
  }, [router]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setCurrentUser(res.data);
      // ✅ UPDATE localStorage so it stays synced
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err: any) {
      console.error("Error fetching user:", err);
      setError("Failed to load user");
    }
  };

  const fetchConversations = async () => {
    if (!currentUser) return;

    try {
      // 1. real conversations (people you've actually messaged)
      const convRes = await api.get("/messages/conversations");
      const conversationsData = Array.isArray(convRes.data)
        ? convRes.data
        : convRes.data?.conversations || [];

      const conversationMap = new Map<string, Conversation>();

      conversationsData.forEach((conv: any) => {
        conversationMap.set(conv.userId, {
          userId: conv.userId,
          userName: conv.userName,
          lastMessage: conv.lastMessage ?? "No messages yet",
          lastMessageTime: conv.lastMessageTime ?? new Date().toISOString(),
        });
      });

      // 2. potential contacts from service offers
      const categoriesRes = await api.get("/services/categories");
      const categories = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data?.categories || [];

      for (const category of categories) {
        try {
          const offersRes = await api.get(`/services/offers/${category.id}?page=1`);
          const offers = offersRes.data?.offers || [];

          offers.forEach((offer: any) => {
            if (offer.user?.id && offer.user.id !== currentUser.id && !conversationMap.has(offer.user.id)) {
              conversationMap.set(offer.user.id, {
                userId: offer.user.id,
                userName: offer.user.name || "Unknown Provider",
                lastMessage: `Offering: ${offer.title || offer.description || "Service"}`,
                lastMessageTime: offer.createdAt || new Date().toISOString(),
              });
            }
          });
        } catch {
          // ignore categories with no offers
        }
      }

      // 3. potential contacts from service requests
      try {
        const requestsRes = await api.get("/services/requests?page=1");
        const requests = requestsRes.data?.requests || requestsRes.data || [];

        requests.forEach((req: any) => {
          if (req.user?.id && req.user.id !== currentUser.id && !conversationMap.has(req.user.id)) {
            conversationMap.set(req.user.id, {
              userId: req.user.id,
              userName: req.user.name || "Unknown Seeker",
              lastMessage: `Requesting: ${req.description || "Service"}`,
              lastMessageTime: req.createdAt || new Date().toISOString(),
            });
          }
        });
      } catch {
        // ignore if requests endpoint fails
      }

      // sort newest first
      const merged = Array.from(conversationMap.values()).sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setConversations(merged);
    } catch (err: any) {
      console.error("Error fetching conversations:", err.response?.data || err);
      setConversations([]);
    }
  };

  const fetchConversationMessages = async (otherUserId: string) => {
    if (!currentUser) return;
    try {
      const res = await api.get(`/messages/between?user1Id=${currentUser.id}&user2Id=${otherUserId}`);
      setConversationMessages(res.data || []);
      setSelectedConversation(otherUserId);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setConversationMessages([]);
    }
  };

  // ✅ ADD THIS NEW FUNCTION
  const handleSearchUsers = async (query: string) => {
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

  // ✅ ADD THIS NEW FUNCTION
  const handleStartConversation = (userId: string, userName: string) => {
    setSelectedConversation(userId);
    fetchConversationMessages(userId);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || !currentUser) return;

    setSendingMessage(true);
    try {
      const res = await api.post("/messages/send", {
        senderId: currentUser.id,
        receiverId: selectedConversation,
        text: messageText,
      });

      setConversationMessages([...conversationMessages, res.data]);
      setMessageText("");

      // update conversation preview immediately
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.userId === selectedConversation
            ? { ...conv, lastMessage: messageText, lastMessageTime: new Date().toISOString() }
            : conv
        );
        return updated;
      });
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleSubmitReport = async () => {
    if (!reportForm.reportedName || !reportForm.reason.trim()) {
      alert("Please enter a user name and provide a reason");
      return;
    }

    if (reportForm.reason.length < 10) {
      alert("Reason must be at least 10 characters");
      return;
    }

    try {
      setReportLoading(true);
      await api.post("/reports", {
        reportedName: reportForm.reportedName,
        reason: reportForm.reason,
      });
      alert("✅ Report submitted successfully! Thank you for helping keep our community safe.");
      setReportForm({ reportedName: "", reason: "" });
      setShowReportModal(false);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      alert(err.response?.data?.message || "Failed to submit report");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !selectedConversation) return;

    const channel = window.Pusher?.subscribe(`messages-${currentUser.id}`);

    channel?.bind("new-message", async (data: any) => {
      if (data.senderId === selectedConversation) {
        if (!data.sender) {
          try {
            const senderRes = await api.get(`/users/${data.senderId}`);
            data.sender = senderRes.data;
          } catch {
            data.sender = { id: data.senderId, name: "Unknown", email: "" };
          }
        }

        setConversationMessages((prev) => [...prev, data]);

        setConversations((prev) => {
          const updated = prev.map((conv) =>
            conv.userId === data.senderId
              ? { ...conv, lastMessage: data.text, lastMessageTime: data.createdAt }
              : conv
          );
          return updated;
        });
      }
    });

    return () => {
      channel?.unbind_all();
      window.Pusher?.unsubscribe(`messages-${currentUser.id}`);
    };
  }, [currentUser, selectedConversation]);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f6fb] to-white">
        <p className="text-[#3d3f56] text-lg font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f6fb] to-white">
      {/* ✅ UPDATED HEADER WITH USER SEARCH PROPS */}
      <DashboardHeader 
        onSettingsClick={() => setShowSettingsModal(true)}
        currentPage="messages"
        onSearch={handleSearchUsers}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        onSelectResult={() => {
          setShowSearchResults(false);
        }}
        searchType="users"
        onSelectUser={handleStartConversation}
      />

      {/* ✅ MODALS */}
      <DashboardModals
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        showChangePasswordModal={showChangePasswordModal}
        setShowChangePasswordModal={setShowChangePasswordModal}
        showEditProfileModal={showEditProfileModal}
        setShowEditProfileModal={setShowEditProfileModal}
        onLogout={handleLogout}
      />

      {/* MESSAGES CONTENT - REST STAYS THE SAME */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-5xl font-black text-[#3d3f56]">Messages</h2>
          <p className="text-lg text-[#7CA0D8] font-semibold mt-2">
            Connect and communicate with service providers & seekers
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-2xl font-bold mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[700px]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-[2.5rem] shadow-xl border-2 border-gray-200 p-6 flex flex-col">
            <h3 className="text-2xl font-black text-[#3d3f56] mb-6">
              {filteredConversations.length} Conversations
            </h3>

            {filteredConversations.length > 0 ? (
              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => fetchConversationMessages(conv.userId)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${
                      selectedConversation === conv.userId
                        ? "bg-gradient-to-r from-[#6FA3EF] to-[#5C90DD] text-white shadow-lg border-2 border-[#5C90DD]"
                        : "bg-gradient-to-br from-gray-50 to-gray-100 text-[#3d3f56] border-2 border-gray-300 hover:border-[#6FA3EF] hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${
                          selectedConversation === conv.userId
                            ? "bg-white text-[#6FA3EF]"
                            : "bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] text-white"
                        }`}
                      >
                        {conv.userName.charAt(0).toUpperCase()}
                      </div>
                      <p className={`font-black text-base ${selectedConversation === conv.userId ? "text-white" : "text-[#3d3f56]"}`}>
                        {conv.userName}
                      </p>
                    </div>
                    <p
                      className={`text-sm truncate font-bold ${
                        selectedConversation === conv.userId ? "text-white/80" : "text-[#7CA0D8]"
                      }`}
                    >
                      {conv.lastMessage}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[#7CA0D8] font-bold text-center">
                  {searchQuery ? "No conversations found" : "No conversations yet. Start offering or requesting services!"}
                </p>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border-2 border-gray-200 p-6 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="mb-6 pb-6 border-b-3 border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center text-white font-black text-xl">
                      {conversations.find((c) => c.userId === selectedConversation)?.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-[#3d3f56]">
                        {conversations.find((c) => c.userId === selectedConversation)?.userName}
                      </h3>
                      <p className="text-sm text-[#7CA0D8] font-bold">Online</p>
                    </div>
                  </div>
                </div>

                {/* Messages Container - FACEBOOK STYLE */}
                <div className="flex-1 space-y-3 mb-4 overflow-y-auto p-4 bg-gradient-to-b from-[#f0f1f7] to-gray-100 rounded-2xl border-2 border-gray-200">
                  {conversationMessages.length > 0 ? (
                    <>
                      {conversationMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${msg.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                        >
                          {msg.senderId !== currentUser?.id && msg.sender && (
                            <div className="w-7 h-7 bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                              {msg.sender.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                          )}
                          <div
                            className={`max-w-xs px-4 py-3 rounded-2xl shadow-md border-2 ${
                              msg.senderId === currentUser?.id
                                ? "bg-gradient-to-r from-[#6FA3EF] to-[#5C90DD] text-white border-[#5C90DD]"
                                : "bg-white text-[#3d3f56] border-gray-300"
                            }`}
                          >
                            <p className={`font-bold text-xs mb-1 ${msg.senderId === currentUser?.id ? "text-white/80" : "text-[#7CA0D8]"}`}>
                              {msg.sender?.name || "Unknown"}
                            </p>
                            <p className="text-sm font-semibold">
                              {msg.text}
                            </p>
                            <p
                              className={`text-xs mt-2 font-bold ${
                                msg.senderId === currentUser?.id ? "text-white/60" : "text-[#7CA0D8]"
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-[#7CA0D8] font-bold text-center text-sm">
                        No messages yet. Start the conversation! 👋
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#6FA3EF] focus:ring-2 focus:ring-[#6FA3EF]/20 text-base font-semibold text-[#3d3f56] placeholder:text-[#7CA0D8] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !messageText.trim()}
                    className="bg-gradient-to-r from-[#6FA3EF] to-[#5C90DD] hover:from-[#5C90DD] hover:to-[#4A7BC8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {sendingMessage ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageCircle className="w-20 h-20 text-[#7CA0D8] mb-4 opacity-50" />
                <p className="text-[#3d3f56] text-xl font-black text-center">
                  Select a conversation to start messaging
                </p>
                <p className="text-[#7CA0D8] font-semibold mt-2">
                  Choose from the list on the left
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-[#3d3f56] flex items-center gap-3">
                <span>🚩</span>
                Report User
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-black transition-all"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            <p className="text-gray-600 font-semibold mb-6">Help us keep the community safe</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">User Name to Report</label>
                <input
                  type="text"
                  value={reportForm.reportedName}
                  onChange={(e) => setReportForm({ ...reportForm, reportedName: e.target.value })}
                  placeholder="Enter the user name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-orange-500 text-gray-900 placeholder:text-gray-500"
                  disabled={reportLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">Reason for Report</label>
                <textarea
                  value={reportForm.reason}
                  onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                  placeholder="Please provide details about why you're reporting this user..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-orange-500 resize-none text-gray-900 placeholder:text-gray-500"
                  rows={5}
                  maxLength={500}
                  disabled={reportLoading}
                />
                <p className="text-xs text-gray-600 mt-1 font-semibold">
                  {reportForm.reason.length}/500 characters
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-full transition-all"
                disabled={reportLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={reportLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-3 rounded-full transition-all"
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