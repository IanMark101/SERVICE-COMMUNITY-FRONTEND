"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ArrowLeft } from "lucide-react";
import api from "@/services/api";
import { usePresence } from "@/app/context/PresenceContext";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { startHeartbeat, setPresence } = usePresence();
  const { isDark } = useDarkMode();

  // Capture token from Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    if (token) {
      console.log("🔐 OAuth token received, storing and initializing...");
      localStorage.setItem("userToken", token);
      
      // 🟢 Wait a moment to ensure token is in localStorage before API calls
      setTimeout(async () => {
        const initializePresence = async () => {
          try {
            console.log("📡 Fetching user data after OAuth login...");
            const response = await api.get("/users/me");
            console.log("📊 /users/me response:", response.data);
            
            if (response.data) {
              // Store user data
              localStorage.setItem("user", JSON.stringify(response.data));
              console.log("💾 User data stored");
              
              // 🔥 SEND INITIAL PRESENCE UPDATE TO BACKEND - MULTIPLE ATTEMPTS WITH LONGER DELAYS
              let presenceSuccess = false;
              for (let attempt = 1; attempt <= 5; attempt++) {
                try {
                  console.log(`📤 Sending presence update (attempt ${attempt}/5)...`);
                  // Try calling with status="online" in case the backend needs it
                  const presenceRes = await api.post("/users/me/presence", { status: "online" });
                  console.log(`✅ Presence update sent successfully`, presenceRes.data);
                  presenceSuccess = true;
                  break; // Success, don't retry
                } catch (err: any) {
                  console.warn(`❌ Attempt ${attempt} failed:`, err.response?.status, err.message);
                  if (attempt < 5) {
                    const waitTime = 300 * attempt; // Exponential backoff
                    console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                  }
                }
              }
              
              if (!presenceSuccess) {
                console.error("🚨 FAILED TO SEND PRESENCE UPDATE AFTER 5 ATTEMPTS");
              }
              
              // 🔥 VERIFY BACKEND WAS UPDATED
              try {
                console.log("🔍 Verifying backend presence update...");
                const verifyRes = await api.get("/users/me");
                console.log("🔍 Verification - Backend user data:", {
                  isOnline: verifyRes.data.isOnline,
                  lastSeenAt: verifyRes.data.lastSeenAt
                });
              } catch (err) {
                console.warn("⚠️ Could not verify backend update:", err);
              }
              
              // Get presence timeout
              const presenceTimeoutMinutes = response.data.presenceTimeoutMinutes || 5;
              console.log(`⏱️ Presence timeout: ${presenceTimeoutMinutes} minutes`);
              
              // 🔥 FORCE USER TO BE ONLINE IMMEDIATELY
              console.log("🟢 Setting user as ONLINE immediately");
              const now = new Date().toISOString();
              setPresence({
                isOnline: true,  // 🟢 ALWAYS true on login
                lastSeenAt: now,
              });
              
              // Start heartbeat to keep presence alive
              console.log("❤️ Starting heartbeat...");
              startHeartbeat(presenceTimeoutMinutes);
              console.log("✅ Presence initialized for OAuth user - ONLINE");
            }
            
            router.push("/dashboard");
          } catch (error: any) {
            console.error("❌ Error initializing presence for OAuth user:", error.message);
            
            // 🟢 EVEN IF ERROR, FORCE ONLINE STATE
            console.log("🟢 Setting user as ONLINE anyway (error recovery)");
            const now = new Date().toISOString();
            setPresence({
              isOnline: true,
              lastSeenAt: now,
            });
            startHeartbeat(5); // Default 5 minutes
            
            // Still redirect to dashboard
            router.push("/dashboard");
          }
        };
        
        await initializePresence();
      }, 100);
    }
  }, [router, startHeartbeat, setPresence]);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      router.push("/dashboard");
      return;
    }
    
    // 🚫 Check if user was redirected due to ban
    const params = new URLSearchParams(window.location.search);
    if (params.get("banned") === "true") {
      setError("🚫 Your account has been suspended. Please contact support.");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ Store based on type
      if (response.data.type === "user") {
        const userData = response.data.user;
        
        // 🚫 CHECK IF USER IS BANNED BEFORE ALLOWING LOGIN
        if (userData.banned || userData.isBanned) {
          console.warn("🚫 BANNED USER ATTEMPTED LOGIN");
          setError("🚫 Your account has been suspended and cannot log in. Please contact support.");
          return;
        }
        
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        console.log("🟢 Email login - Setting user as ONLINE immediately");
        
        // 🟢 Call presence endpoint to mark user online on backend
        try {
          console.log("📤 Sending initial presence update to backend...");
          await api.post("/users/me/presence");
          console.log("✅ Presence update sent to backend");
        } catch (err) {
          console.warn("⚠️ Could not send initial presence update:", err);
        }
        
        // 🟢 Extract presence timeout and force online state
        const presenceTimeoutMinutes = response.data.presenceTimeoutMinutes || 5;
        const now = new Date().toISOString();
        setPresence({
          isOnline: true,  // 🟢 ALWAYS true on login
          lastSeenAt: now,
        });
        
        // 🟢 Start heartbeat with timeout value
        console.log(`❤️ Starting heartbeat (${presenceTimeoutMinutes}m timeout)`);
        startHeartbeat(presenceTimeoutMinutes);
        
        console.log("✅ User logged in - ONLINE status set");
        router.push("/dashboard");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className={`min-h-screen w-full flex justify-center items-start md:items-center relative overflow-x-hidden py-8 sm:py-12 ${
      isDark 
        ? 'bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b]'
        : 'bg-gradient-to-br from-[#EBF4FF] to-[#90CDF4]'
    }`}>
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-20 blur-3xl ${
          isDark ? 'bg-sky-500' : 'bg-[#7CA0D8]'
        }`}></div>
        <div className={`absolute bottom-[-10%] left-[-5%] w-96 h-96 rounded-full opacity-20 blur-3xl ${
          isDark ? 'bg-indigo-600' : 'bg-[#5AC8FA]'
        }`}></div>
      </div>

      <div className="relative w-full max-w-lg px-4 sm:px-6 z-10">
        
        {/* Logo Section - Side by Side */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-lg transform -skew-x-6 flex-shrink-0">
            <span className="transform skew-x-6">S</span>
          </div>
          <div className="text-2xl font-black tracking-tight">
            <span className="text-[#5AC8FA]">Skill</span>
            <span className={isDark ? 'text-sky-300' : 'text-[#204585]'}>-Link</span>
          </div>
        </div>

        {/* Card Container */}
        <div className={`rounded-[2rem] shadow-2xl border-2 px-6 sm:px-8 py-6 sm:py-8 relative ${
          isDark
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-white/50'
        }`}>
          
          <div className="text-center mb-4">
            <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-[#3d3f56]'}`}>Welcome Back</h1>
            <p className={`font-bold text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-[#7CA0D8]'}`}>Sign in to continue</p>
          </div>

          {error && (
            <div className={`border-2 px-3 py-2 rounded-lg font-bold text-center mb-4 text-xs ${
              isDark 
                ? 'bg-red-500/20 border-red-500 text-red-300'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-sm font-black mb-2 ${isDark ? 'text-white' : 'text-[#3d3f56]'}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="name@example.com"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-sm font-bold transition-all ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400'
                    : 'bg-[#f8f9fc] border-gray-200 text-[#3d3f56] placeholder:text-gray-300 focus:border-[#5AC8FA]'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-black mb-2 ${isDark ? 'text-white' : 'text-[#3d3f56]'}`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-sm font-bold transition-all ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400'
                    : 'bg-[#f8f9fc] border-gray-200 text-[#3d3f56] placeholder:text-gray-300 focus:border-[#5AC8FA]'
                }`}
                required
              />
              <div className="mt-2 text-right">
                <a
                  href="/auth/forgot-password"
                  className={`text-xs font-black hover:underline ${isDark ? 'text-sky-400' : 'text-[#007AFF]'}`}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-black text-base py-3 rounded-lg shadow-lg transition-transform transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 ${
                isDark
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  : 'bg-gradient-to-r from-[#5AC8FA] to-[#007AFF] hover:from-[#007AFF] hover:to-[#0062cc] text-white'
              }`}
            >
              {isLoading ? (
                "Signing In..."
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* OAuth Divider */}
          <div className={`mt-4 flex items-center gap-3 ${isDark ? 'border-slate-600' : ''}`}>
            <div className={`flex-1 h-0.5 ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
            <span className={`font-bold text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>OR</span>
            <div className={`flex-1 h-0.5 ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`}></div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={`w-full border-2 font-black text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all mt-4 ${
              isDark
                ? 'border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-sky-400'
                : 'border-gray-200 text-gray-700 hover:bg-[#f8f9fc] hover:border-[#5AC8FA]'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div className={`mt-6 text-center space-y-3`}>
            <p className={`font-bold text-sm ${isDark ? 'text-slate-400' : 'text-[#7CA0D8]'}`}>
              Don't have an account?{" "}
              <a href="/auth/signup" className={`hover:underline font-black ${isDark ? 'text-sky-400' : 'text-[#007AFF]'}`}>
                Sign Up
              </a>
            </p>
            
            <div className={`w-full h-0.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}></div>

            <div className={`flex justify-center gap-4 text-xs font-bold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              <a href="/" className={`transition-colors flex items-center gap-1 ${isDark ? 'hover:text-sky-400' : 'hover:text-[#5AC8FA]'}`}>
                <ArrowLeft className="w-3 h-3" /> Back
              </a>
              <a href="/admin/login" className={`transition-colors ${isDark ? 'hover:text-sky-400' : 'hover:text-[#5AC8FA]'}`}>
                Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}