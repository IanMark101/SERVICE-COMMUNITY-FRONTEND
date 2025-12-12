"use client";

declare global {
  interface Window {
    Pusher: any;
  }
}

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import api from "@/services/api";
import DashboardHeader from "@/app/dashboard/components/DashboardHeader";
import DashboardModals from "@/app/dashboard/components/DashboardModals";
import LoadingScreen from "@/app/dashboard/components/LoadingScreen";
import ConversationsList from "./components/ConversationsList";
import ChatArea from "./components/ChatArea";
import { useDarkMode } from "@/app/context/DarkModeContext";
import { useLogout } from "@/hooks/useLogout";
import { Conversation, ConversationUserDetails, Message, User } from "./types";
import { useToast } from "../components/Toast";

export default function MessagesPage() {
  const router = useRouter();
  const { isDark } = useDarkMode();
  const { logout } = useLogout();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Header search state
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Conversation list search state
  const [conversationSearchResults, setConversationSearchResults] = useState<User[]>([]);
  const [conversationSearchLoading, setConversationSearchLoading] = useState(false);
  const [showConversationSearchResults, setShowConversationSearchResults] = useState(false);

  const [activeConversationUser, setActiveConversationUser] = useState<ConversationUserDetails | null>(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [reportForm, setReportForm] = useState({ reportedName: "", reason: "" });
  const [reportLoading, setReportLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Try to get user from localStorage first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsLoading(false);
    } else {
      // If no stored user, fetch from API (handles OAuth users)
      fetchUser();
    }
  }, [router]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setCurrentUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching user:", err);
      setError("Failed to load user");
      setIsLoading(false);
      router.push("/auth/login");
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

      // 2. fetch all users (not limited by service offerings)
      try {
        const usersRes = await api.get("/users?page=1&limit=100");
        const allUsers = usersRes.data?.users || usersRes.data || [];

        allUsers.forEach((user: any) => {
          if (user.id && user.id !== currentUser.id && !conversationMap.has(user.id)) {
            conversationMap.set(user.id, {
              userId: user.id,
              userName: user.name || "Unknown User",
              lastMessage: "Start a conversation",
              lastMessageTime: new Date().toISOString(),
            });
          }
        });
      } catch {
        // if all users endpoint fails, fallback to service-based users
        // 2a. potential contacts from service offers
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

        // 2b. potential contacts from service requests
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
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setConversationMessages([]);
    }
  };

  const fetchUsersByQuery = async (query: string) => {
    if (!query.trim()) return [];
    try {
      const res = await api.get("/users", {
        params: { search: query, page: 1, limit: 20 },
      });
      return res.data.users || res.data || [];
    } catch (err) {
      console.error("Error searching users:", err);
      return [];
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchLoading(true);
    const results = await fetchUsersByQuery(query);
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
    setSearchLoading(false);
  };

  const handleConversationSearch = async (query: string) => {
    setSearchQuery(query);
    setConversationSearchLoading(true);
    const results = await fetchUsersByQuery(query);
    setConversationSearchResults(results);
    setShowConversationSearchResults(results.length > 0);
    setConversationSearchLoading(false);
  };

  const handleConversationResultSelect = (user: User) => {
    setConversationSearchResults([]);
    setShowConversationSearchResults(false);
    setSearchQuery("");
    handleStartConversation(user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
    });
  };

  const handleStartConversation = async (userId: string, userDetails?: ConversationUserDetails) => {
    setSelectedConversation(userId);
    setShowSearchResults(false);
    setSearchResults([]);

    if (userDetails) {
      setActiveConversationUser(userDetails);
    } else if (currentUser && currentUser.id === userId) {
      setActiveConversationUser({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      });
    } else {
      const existing = conversations.find((conv) => conv.userId === userId);
      if (existing) {
        setActiveConversationUser({
          id: existing.userId,
          name: existing.userName,
        });
      } else {
        try {
          const res = await api.get(`/users/${userId}`);
          const data = res.data;
          setActiveConversationUser({
            id: data.id,
            name: data.name,
            email: data.email,
          });
        } catch (err) {
          console.error("Error fetching conversation user:", err);
          setActiveConversationUser(null);
        }
      }
    }

    await fetchConversationMessages(userId);
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

      // update conversation preview immediately and move to top
      setConversations((prev) => {
        const now = new Date().toISOString();
        const updated = prev.map((conv) =>
          conv.userId === selectedConversation
            ? { ...conv, lastMessage: messageText, lastMessageTime: now }
            : conv
        );
        return updated
          .map((conv) =>
            conv.userId === selectedConversation
              ? { ...conv, lastMessageTime: now }
              : conv
          )
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      });
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = async () => {
    await logout(false); // false = user logout (not admin)
  };

  const handleSubmitReport = async () => {
    if (!reportForm.reportedName || !reportForm.reason.trim()) {
      showToast("Please enter a user name and provide a reason", "warning");
      return;
    }

    if (reportForm.reason.length < 10) {
      showToast("Reason must be at least 10 characters", "warning");
      return;
    }

    try {
      setReportLoading(true);
      await api.post("/reports", {
        reportedName: reportForm.reportedName,
        reason: reportForm.reason,
      });
      showToast("Report submitted successfully! Thank you for helping keep our community safe.", "success");
      setReportForm({ reportedName: "", reason: "" });
      setShowReportModal(false);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      showToast(err.response?.data?.message || "Failed to submit report", "error");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollableParent = messagesEndRef.current.parentElement;
      if (scrollableParent) {
        setTimeout(() => {
          scrollableParent.scrollTop = scrollableParent.scrollHeight;
        }, 0);
      }
    }
  }, [conversationMessages]);

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!window.Pusher || !currentUser?.id) return;

    const channel = window.Pusher.subscribe(`messages-${currentUser.id}`);

    const handleNewMessage = async (data: any) => {
      const messageTime = data?.createdAt || new Date().toISOString();
      const isActiveConversation = data.senderId === selectedConversation;

      let senderDetails = data.sender;

      if (!senderDetails || !senderDetails.name) {
        if (currentUser && data.senderId === currentUser.id) {
          senderDetails = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          };
        } else if (activeConversationUser && activeConversationUser.id === data.senderId) {
          senderDetails = {
            id: activeConversationUser.id,
            name: activeConversationUser.name,
            email: activeConversationUser.email ?? "",
          };
        } else {
          try {
            const senderRes = await api.get(`/users/${data.senderId}`);
            senderDetails = senderRes.data;
          } catch (err) {
            console.error("Error fetching sender details:", err);
            senderDetails = {
              id: data.senderId,
              name: "Unknown",
              email: "",
            };
          }
        }
      }

      const messageWithSender = {
        ...data,
        createdAt: messageTime,
        sender: senderDetails,
      };

      if (isActiveConversation) {
        setConversationMessages((prev) => [...prev, messageWithSender]);
      }

      setConversations((prev) => {
        const existing = prev.find((conv) => conv.userId === data.senderId);
        const updatedConversation = existing
          ? { ...existing, lastMessage: data.text, lastMessageTime: messageTime }
          : {
              userId: data.senderId,
              userName: senderDetails?.name || "Unknown",
              lastMessage: data.text,
              lastMessageTime: messageTime,
            };

        const others = prev.filter((conv) => conv.userId !== data.senderId);
        const merged = [updatedConversation, ...others];

        return merged.sort(
          (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
      });
    };

    channel.bind("new-message", handleNewMessage);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      window.Pusher.unsubscribe(`messages-${currentUser.id}`);
    };
  }, [
    currentUser?.id,
    currentUser?.name,
    currentUser?.email,
    selectedConversation,
    activeConversationUser?.id,
    activeConversationUser?.name,
    activeConversationUser?.email,
  ]);

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fallbackConversation = selectedConversation
    ? conversations.find((conv) => conv.userId === selectedConversation)
    : undefined;

  const conversationDisplayName =
    activeConversationUser?.name ||
    fallbackConversation?.userName ||
    (currentUser && currentUser.id === selectedConversation ? currentUser.name : "");

  const conversationInitial = conversationDisplayName
    ? conversationDisplayName.charAt(0).toUpperCase()
    : "?";

  if (isLoading) {
    return <LoadingScreen message="Loading your messages..." />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-[#f5f8fc] via-[#faf9f7] to-[#f0f4f8]'}`}>
      <DashboardHeader 
        onSettingsClick={() => setShowSettingsModal(true)}
        currentPage="messages"
        onSearch={handleSearchUsers}
        searchResults={searchResults.map(u => ({ ...u, type: "user" as const }))}
        showSearchResults={showSearchResults}
        onSelectResult={() => {
          setShowSearchResults(false);
        }}
        searchType="users"
        searchLoading={searchLoading}
        onSelectUser={(userId, userName) => handleStartConversation(userId, { id: userId, name: userName })}
      />

      <DashboardModals
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        showChangePasswordModal={showChangePasswordModal}
        setShowChangePasswordModal={setShowChangePasswordModal}
        showEditProfileModal={showEditProfileModal}
        setShowEditProfileModal={setShowEditProfileModal}
        onLogout={handleLogout}
      />

      <div className="px-6 lg:px-8 py-8 lg:py-12 w-full">
        <div className="mb-8">
          <h2 className={`text-4xl lg:text-5xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>💬 Messages</h2>
          <p className={`text-base lg:text-lg font-semibold ${isDark ? 'text-sky-400' : 'text-[#1CC4B6]'}`}>
            Connect and collaborate with the community
          </p>
        </div>

        {error && (
          <div className={`border-2 px-6 py-4 rounded-xl font-bold mb-6 shadow-sm ${
            isDark
              ? 'bg-red-950/50 border-red-800 text-red-200'
              : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ConversationsList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            searchQuery={searchQuery}
            onSearch={handleConversationSearch}
            searchResults={conversationSearchResults}
            showSearchResults={showConversationSearchResults}
            searchLoading={conversationSearchLoading}
            onSelectSearchResult={handleConversationResultSelect}
            onSelectConversation={(userId, userName) =>
              handleStartConversation(userId, {
                id: userId,
                name: userName,
              })
            }
          />

          <ChatArea
            selectedConversation={selectedConversation}
            conversationDisplayName={conversationDisplayName}
            conversationInitial={conversationInitial}
            conversationMessages={conversationMessages}
            currentUserId={currentUser?.id}
            messageText={messageText}
            onMessageTextChange={(value) => setMessageText(value)}
            onSendMessage={handleSendMessage}
            sendingMessage={sendingMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

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