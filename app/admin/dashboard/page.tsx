// AdminDashboard.tsx  (dashboard/page.tsx)  –  categories table removed
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
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import api from "@/services/api";
import SidebarItem from "./components/SideBarItem";
import StatCard from "./components/StatCard";
import UserTable from "./components/userTable";
import CreateCategoryCard from "./components/CreateCategoryCard";
import ReportsList from "./components/ReportsList";
import RequestsList from "./components/RequestsList";
import AdminSettingsModal from "./components/AdminSettingsModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "reports" | "categories" | "offers" | "requests" | "settings"
  >("dashboard");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

      const [usersRes, reportsRes, postsStatsRes, categoriesRes, requestsRes, offersRes, userStatsRes] =
        await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/reports"),
          api.get("/admin/stats/posts"),
          api.get("/admin/categories"),
          api.get("/admin/requests"),
          api.get("/admin/offers"),
          api.get("/admin/stats/users"),
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex-shrink-0 hidden md:flex flex-col shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Admin<span className="text-blue-400">Panel</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <SidebarItem
            icon={<ShieldAlert size={20} />}
            label="Reports"
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
          />
          <SidebarItem
            icon={<Tag size={20} />}
            label="Service Categories"
            active={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
          />
          <SidebarItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-6 shadow-sm z-10">
          <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
            <Activity size={20} className="text-blue-500" />
            {activeTab === "categories" ? "Service Categories" : activeTab}
          </h2>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className={`p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-all ${
              isLoading ? "animate-spin" : ""
            }`}
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-8">
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md flex items-center justify-between">
              <p className="font-medium">{error}</p>
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-bold text-xl">
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
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  clickable={false}
                />
                <StatCard
                  title="Total Offers"
                  value={postStats?.totalOffers?.toString() || "0"}
                  icon={<TrendingUp size={28} className="text-white" />}
                  color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                  onClick={() => setActiveTab("offers")}
                  clickable={true}
                />
                <StatCard
                  title="Total Requests"
                  value={postStats?.totalRequests?.toString() || "0"}
                  icon={<Activity size={28} className="text-white" />}
                  color="bg-gradient-to-br from-violet-500 to-violet-600"
                  onClick={() => setActiveTab("requests")}
                  clickable={true}
                />
                <StatCard
                  title="Active Reports"
                  value={reports?.length?.toString() || "0"}
                  icon={<ShieldAlert size={28} className="text-white" />}
                  color="bg-gradient-to-br from-rose-500 to-rose-600"
                  onClick={() => setActiveTab("reports")}
                  clickable={true}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Status Distribution Pie Chart */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full"></div>
                    <h3 className="font-bold text-slate-800 text-lg">User Status Distribution</h3>
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
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                          }}
                          labelStyle={{ color: "#f1f5f9" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                      <p>No user data available</p>
                    </div>
                  )}
                </div>

                {/* New Users Trend Bar Chart */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></div>
                    <h3 className="font-bold text-slate-800 text-lg">New Users Trend (7 Days)</h3>
                  </div>
                  {newUsersTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={newUsersTrend} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" radius={8} />
                        <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "12px" }} />
                        <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#1e293b", 
                            border: "1px solid #475569",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                          }}
                          labelStyle={{ color: "#f1f5f9" }}
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
                    <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                      <p>No trend data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Users Table */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                  <h3 className="font-bold text-slate-800 text-lg">Recent Users</h3>
                </div>
                {Array.isArray(users) && users.length > 0 ? (
                  <UserTable users={users.slice(0, 10)} isLoading={isLoading} toggleBanUser={toggleBanUser} />
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50">
              <UserTable users={users} isLoading={isLoading} toggleBanUser={toggleBanUser} />
            </div>
          )}

          {activeTab === "reports" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50">
              <ReportsList reports={reports} isLoading={isLoading} refreshReports={fetchData} />
            </div>
          )}

          {activeTab === "requests" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50">
              <RequestsList requests={allRequests} isLoading={isLoading} />
            </div>
          )}

          {activeTab === "offers" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50">
              <RequestsList requests={allOffers} isLoading={isLoading} />
            </div>
          )}

          {activeTab === "categories" && (
            <CreateCategoryCard
              categories={categories}
              onMutateAction={fetchData}
            />
          )}

          {activeTab === "settings" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-100/50 text-center">
              <div className="flex items-center justify-center mb-6">
                <Settings className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Settings</h2>
              <p className="text-slate-600 mb-6">Manage your admin account settings</p>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl"
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