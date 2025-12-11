"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldAlert,
  Tag,
  LayoutDashboard,
  RefreshCw,
  LogOut,
  TrendingUp,
  Activity,
  Settings,
  Lightbulb,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import api from "@/services/api";
import SidebarItem from "./components/SideBarItem";
import StatCard from "./components/StatCard";
import UserTable from "./components/userTable";
import CreateCategoryCard from "./components/CreateCategoryCard";
import ReportsList from "./components/ReportsList";
import RequestsList from "./components/RequestsList";
import OffersList from "./components/OffersList";
import SuggestionsList from "./components/SuggestionsList";
import AdminSettingsModal from "./components/AdminSettingsModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "reports" | "categories" | "offers" | "requests" | "suggestions" | "settings"
  >("dashboard");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<number>(0);
  const [userStatusDistribution, setUserStatusDistribution] = useState<any[]>([]);
  const [newUsersTrend, setNewUsersTrend] = useState<any[]>([]);
  const [postStats, setPostStats] = useState<{
    totalOffers: number;
    totalRequests: number;
  }>({ totalOffers: 0, totalRequests: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [allOffers, setAllOffers] = useState<any[]>([]);
  const [pendingSuggestions, setPendingSuggestions] = useState<number>(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIXED: Add authentication check at the top
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      console.log("=== ADMIN DASHBOARD MOUNT ===");
      
      const adminToken = localStorage.getItem("adminToken");
      
      if (!adminToken) {
        console.warn("❌ No admin token found - redirecting to login");
        window.location.href = "/admin/login";
        return;
      }

      console.log("✅ Admin token found");
      await fetchData();
    };

    checkAuthAndFetchData();
    
    // ✅ Auto-refresh every 30 seconds to keep data current
    const refreshInterval = setInterval(async () => {
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) {
        await fetchData();
      }
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []); // ✅ Empty dependency array - runs once on mount

  // ✅ FIXED: Better data fetching with error handling
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // ✅ REMOVED: Don't check token here since useEffect already verified it
      console.log("📡 Fetching admin data...");

      const [usersRes, reportsRes, postsStatsRes, categoriesRes, requestsRes, offersRes, userStatsRes, suggestionsRes] =
        await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/reports"),
          api.get("/admin/stats/posts"),
          api.get("/admin/categories"),
          api.get("/admin/requests"),
          api.get("/admin/offers"),
          api.get("/admin/stats/users"),
          api.get("/suggestions/pending"),
        ]);

      // Extract data
      const usersData = Array.isArray(usersRes.data) 
        ? usersRes.data 
        : (usersRes.data?.users || []);
    
      const reportsData = Array.isArray(reportsRes.data) 
        ? reportsRes.data 
        : (reportsRes.data?.reports || []);
    
      const requestsData = Array.isArray(requestsRes.data) 
        ? requestsRes.data 
        : (requestsRes.data?.requests || []);
    
      const offersData = Array.isArray(offersRes.data) 
        ? offersRes.data 
        : (offersRes.data?.offers || []);
    
      const categoriesData = Array.isArray(categoriesRes.data) 
        ? categoriesRes.data 
        : (categoriesRes.data?.categories || []);

      console.log("📊 Data loaded:", {
        users: usersData.length,
        reports: reportsData.length,
        requests: requestsData.length,
        offers: offersData.length,
      });

      setUsers(usersData);
      setReports(reportsData);
      setAllRequests(requestsData);
      setAllOffers(offersData);
      setCategories(categoriesData);
      setPostStats(postsStatsRes.data || { totalOffers: 0, totalRequests: 0 });
      
      // Count pending suggestions
      const suggestionsData = Array.isArray(suggestionsRes.data) 
        ? suggestionsRes.data 
        : (suggestionsRes.data?.suggestions || []);
      const pendingCount = suggestionsData.filter((s: any) => s.status === "pending").length;
      setPendingSuggestions(pendingCount);

      // Stats handling
      const statsData = userStatsRes.data;
      const totalUsersFromArray = usersData.length;
      const activeUsersFromArray = usersData.filter((u: any) => !u.banned && !u.isBanned).length;
      const bannedUsersFromArray = usersData.filter((u: any) => u.banned || u.isBanned).length;

      let totalUsers = totalUsersFromArray;
      let activeUsers = activeUsersFromArray;
      let bannedUsers = bannedUsersFromArray;
      let newUsersPerDay = [];

      if (statsData && typeof statsData === 'object') {
        totalUsers = Number(statsData.totalUsers || statsData.summary?.totalUsers || statsData.data?.totalUsers) || totalUsersFromArray;
        activeUsers = Number(statsData.activeUsers || statsData.summary?.activeUsers || statsData.data?.activeUsers) || activeUsersFromArray;
        bannedUsers = Number(statsData.bannedUsers || statsData.summary?.bannedUsers || statsData.data?.bannedUsers) || bannedUsersFromArray;
        newUsersPerDay = statsData.newUsersPerDay || statsData.trend || statsData.data?.newUsersPerDay || [];
      }

      // Generate trend data if not provided
      if (!Array.isArray(newUsersPerDay) || newUsersPerDay.length === 0) {
        const last7Days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          // Create date range for that day (00:00 to 23:59)
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          
          const usersOnDate = usersData.filter((u: any) => {
            if (!u.createdAt) return false;
            const userCreatedDate = new Date(u.createdAt);
            return userCreatedDate >= startOfDay && userCreatedDate <= endOfDay;
          }).length;
          
          last7Days.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: usersOnDate
          });
        }
        
        newUsersPerDay = last7Days;
      }

      setUserStats(totalUsers);
      setUserStatusDistribution([
        { name: "Active", value: activeUsers, color: "#10b981" },
        { name: "Banned", value: bannedUsers, color: "#ef4444" },
      ]);
      setNewUsersTrend(newUsersPerDay);

      setError("");
      console.log("✅ All admin data loaded successfully");

    } catch (err: any) {
      console.error("❌ Error fetching admin data:", {
        status: err.response?.status,
        message: err.response?.data?.message,
      });

      setUsers([]);
      setReports([]);
      setAllRequests([]);
      setAllOffers([]);
      setCategories([]);
      setUserStats(0);
      setUserStatusDistribution([]);
      setNewUsersTrend([]);

      if (err.response?.status === 403) {
        setError("❌ Access Denied: You don't have admin privileges");
        localStorage.removeItem("adminToken");
        setTimeout(() => router.push("/admin/login"), 2000);
      } else if (err.response?.status === 401) {
        setError("⏱️ Session Expired: Please log in again");
        localStorage.removeItem("adminToken");
        setTimeout(() => router.push("/admin/login"), 2000);
      } else {
        setError(err.response?.data?.message || "Failed to load admin data");
      }

    } finally {
      setIsLoading(false);
    }
  };

  const toggleBanUser = async (userId: string, banned: boolean) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, banned: !banned } : u))
      );
      if (banned) await api.patch(`/admin/user/${userId}/unban`);
      else await api.patch(`/admin/user/${userId}/ban`);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  // ✅ FIXED: Removed the API call that was causing 404 error
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    console.log("✅ Admin logged out successfully");
    router.push("/admin/login");
  };

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] font-sans text-slate-100 overflow-hidden">
      {/* Ambient shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-28 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl animate-pulse" />
        <div className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside className={`relative bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 text-white flex-shrink-0 hidden md:flex flex-col shadow-2xl z-20 transition-all duration-300 ${
        sidebarExpanded ? 'w-64' : 'w-20'
      }`}>
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={`p-6 flex items-center gap-3 border-b border-slate-700/60 bg-gradient-to-r from-slate-900/80 to-slate-900/40 hover:bg-slate-800/60 transition-all duration-200 ${!sidebarExpanded && 'justify-center'}`}
        >
          <div className="w-11 h-11 bg-gradient-to-br from-sky-500 via-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/50 border border-white/20 backdrop-blur-xl">
            <LayoutDashboard className="w-6 h-6 text-white drop-shadow-lg" />
          </div>
          {sidebarExpanded && (
            <span className="text-xl font-black tracking-tight">
              Admin<span className="text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text">Panel</span>
            </span>
          )}
        </button>

        <nav className={`flex-1 p-4 space-y-2 overflow-y-auto ${!sidebarExpanded && 'flex flex-col items-center'}`}>
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label={sidebarExpanded ? "Dashboard" : ""}
            active={activeTab === "dashboard"}
            onClick={() => {
              setActiveTab("dashboard");
            }}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label={sidebarExpanded ? "Users" : ""}
            active={activeTab === "users"}
            onClick={() => {
              setActiveTab("users");
            }}
          />
          <SidebarItem
            icon={<ShieldAlert size={20} />}
            label={sidebarExpanded ? "Reports" : ""}
            active={activeTab === "reports"}
            onClick={() => {
              setActiveTab("reports");
            }}
          />
          <SidebarItem
            icon={<Tag size={20} />}
            label={sidebarExpanded ? "Service Categories" : ""}
            active={activeTab === "categories"}
            onClick={() => {
              setActiveTab("categories");
            }}
          />
          <SidebarItem
            icon={<Lightbulb size={20} />}
            label={sidebarExpanded ? `Suggestions${pendingSuggestions > 0 ? ` (${pendingSuggestions})` : ""}` : ""}
            active={activeTab === "suggestions"}
            onClick={() => {
              setActiveTab("suggestions");
            }}
          />
          <SidebarItem
            icon={<Settings size={20} />}
            label={sidebarExpanded ? "Settings" : ""}
            active={activeTab === "settings"}
            onClick={() => {
              setActiveTab("settings");
            }}
          />
        </nav>

        <div className={`p-4 border-t border-slate-700/60 bg-gradient-to-t from-slate-900/60 to-transparent ${!sidebarExpanded && 'flex justify-center'}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 p-3 rounded-xl text-slate-300 hover:bg-rose-500/20 hover:text-rose-100 hover:border-rose-400/40 transition-all duration-200 border border-transparent ${sidebarExpanded ? 'w-full' : ''}`}
          >
            <LogOut size={20} />
            {sidebarExpanded && <span className="font-semibold">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative flex-1 flex flex-col h-screen overflow-hidden z-10">
        {/* Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/70 flex items-center justify-between px-6 shadow-lg shadow-black/20 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-2 rounded-lg hover:bg-sky-500/20 text-sky-300 hover:text-sky-100 transition-all border border-slate-800 hover:border-sky-500/40 md:flex hidden"
              title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H6" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-slate-50 capitalize flex items-center gap-2">
              <Activity size={20} className="text-sky-400" />
              <span className="bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-transparent">{activeTab === "categories" ? "Service Categories" : activeTab}</span>
            </h2>
          </div>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className={`p-2 rounded-full hover:bg-sky-500/20 text-sky-300 hover:text-sky-100 transition-all border border-slate-800 hover:border-sky-500/40 ${
              isLoading ? "animate-spin" : ""
            }`}
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-8 bg-gradient-to-b from-white/0 via-white/0 to-white/0">
          {error && (
            <div className="bg-rose-500/15 backdrop-blur-sm border border-rose-500/50 text-rose-50 p-4 rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-between">
              <p className="font-semibold text-sm">{error}</p>
              <button onClick={() => setError("")} className="text-rose-200 hover:text-rose-100 font-bold text-lg">
                ✕
              </button>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={typeof userStats === 'number' ? userStats.toString() : "0"}
                  icon={<Users size={28} className="text-white" />}
                  color="bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600"
                  clickable={false}
                />
                <StatCard
                  title="Total Offers"
                  value={postStats?.totalOffers?.toString() || "0"}
                  icon={<TrendingUp size={28} className="text-white" />}
                  color="bg-gradient-to-br from-purple-500 via-indigo-500 to-indigo-600"
                  onClick={() => setActiveTab("offers")}
                  clickable={true}
                />
                <StatCard
                  title="Total Requests"
                  value={postStats?.totalRequests?.toString() || "0"}
                  icon={<Activity size={28} className="text-white" />}
                  color="bg-gradient-to-br from-violet-500 via-purple-500 to-purple-600"
                  onClick={() => setActiveTab("requests")}
                  clickable={true}
                />
                <StatCard
                  title="Active Reports"
                  value={reports?.length?.toString() || "0"}
                  icon={<ShieldAlert size={28} className="text-white" />}
                  color="bg-gradient-to-br from-rose-500 via-red-500 to-red-600"
                  onClick={() => setActiveTab("reports")}
                  clickable={true}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Status Distribution Pie Chart */}
                <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70 hover:shadow-sky-500/10 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/30"></div>
                    <h3 className="font-bold text-slate-50 text-lg">User Status Distribution</h3>
                  </div>
                  {userStatusDistribution.length > 0 && userStatusDistribution.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={userStatusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "2px solid #0ea5e9",
                            borderRadius: "12px",
                            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                            color: "#0f172a",
                            padding: "12px 16px",
                            fontWeight: "600",
                            fontSize: "14px"
                          }}
                          labelStyle={{ color: "#0f172a", fontWeight: "bold", fontSize: "15px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-400/70 bg-slate-800/40 rounded-xl border border-slate-800">
                      <p className="text-sm">No user data available</p>
                    </div>
                  )}
                </div>

                {/* New Users Trend Bar Chart */}
                <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70 hover:shadow-indigo-500/10 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-sky-500 to-indigo-600 rounded-full shadow-lg shadow-sky-500/30"></div>
                    <h3 className="font-bold text-slate-50 text-lg">New Users Trend (7 Days)</h3>
                  </div>
                  {newUsersTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={newUsersTrend} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" radius={8} />
                        <XAxis dataKey="date" stroke="#cbd5f5" style={{ fontSize: "12px", color: "#cbd5f5" }} />
                        <YAxis stroke="#cbd5f5" style={{ fontSize: "12px", color: "#cbd5f5" }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#ffffff", 
                            border: "2px solid #3b82f6",
                            borderRadius: "12px",
                            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                            color: "#0f172a",
                            padding: "12px 16px",
                            fontWeight: "600",
                            fontSize: "14px"
                          }}
                          labelStyle={{ color: "#0f172a", fontWeight: "bold", fontSize: "15px" }}
                          cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        <Bar 
                          dataKey="count" 
                          fill="#3b82f6" 
                          name="New Users" 
                          radius={[12, 12, 0, 0]}
                          animationDuration={800}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-400/70 bg-slate-800/40 rounded-xl border border-slate-800">
                      <p className="text-sm">No trend data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Users Table */}
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full shadow-lg shadow-purple-500/30"></div>
                  <h3 className="font-bold text-slate-50 text-lg">Recent Users</h3>
                </div>
                {Array.isArray(users) && users.length > 0 ? (
                  <UserTable users={users.slice(0, 10)} isLoading={isLoading} toggleBanUser={toggleBanUser} />
                ) : (
                  <div className="text-center py-8 text-slate-400/70">
                    <p className="text-sm">No users found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70">
              <UserTable users={users} isLoading={isLoading} toggleBanUser={toggleBanUser} />
            </div>
          )}

          {activeTab === "reports" && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70">
              <ReportsList reports={reports} isLoading={isLoading} refreshReports={fetchData} />
            </div>
          )}

          {activeTab === "requests" && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70">
              <RequestsList requests={allRequests} isLoading={isLoading} />
            </div>
          )}

          {activeTab === "offers" && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70">
              <OffersList offers={allOffers} isLoading={isLoading} />
            </div>
          )}

          {activeTab === "categories" && (
            <CreateCategoryCard
              categories={categories}
              onMutateAction={fetchData}
            />
          )}

          {activeTab === "suggestions" && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70">
              <SuggestionsList isLoading={isLoading} refreshSuggestions={fetchData} />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-8 border border-slate-800/70 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-2xl shadow-lg shadow-sky-500/40">
                  <Settings className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-50 mb-2">Admin Settings</h2>
              <p className="text-slate-300 mb-8">Manage your admin account settings and preferences</p>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 hover:from-sky-400 hover:via-sky-300 hover:to-indigo-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-sky-500/40 hover:shadow-indigo-500/40 border border-white/20"
              >
                Open Settings
              </button>
            </div>
          )}
        </div>
      </main>

      <AdminSettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
}