import { useRouter } from "next/navigation";
import { usePresence } from "@/app/context/PresenceContext";
import api from "@/services/api";

export function useLogout() {
  const router = useRouter();
  const { stopHeartbeat, setPresence } = usePresence();

  const logout = async (isAdmin: boolean = false, onLogoutComplete?: () => void | Promise<void>) => {
    let logoutResponse = null;

    try {
      // 🟢 Call logout endpoint to mark user offline on backend
      console.log("📤 Sending POST /auth/logout request...");
      const response = await api.post("/auth/logout");
      logoutResponse = response.data;
      console.log("✅ Logout successful on backend:", response.data);
      console.log("✅ STATUS CODE:", response.status);
    } catch (error: any) {
      // Log the error but continue with logout
      const errorMsg = error.response?.data?.message || error.message;
      console.warn("❌ Logout API call failed:", errorMsg);
      console.warn("❌ STATUS CODE:", error.response?.status);
      // Continue with local logout even if API fails
    }

    // 🟢 Stop heartbeat immediately
    console.log("⏹️ Stopping heartbeat");
    stopHeartbeat();

    // 🟢 Clear presence data immediately
    console.log("🧹 Clearing presence state");
    setPresence(null);

    // 🟢 Wait for backend to process
    console.log("⏳ Waiting 200ms for backend processing...");
    await new Promise(resolve => setTimeout(resolve, 200));

    // 🟢 Execute completion callback (e.g., refresh data)
    if (onLogoutComplete) {
      try {
        console.log("🔄 Running logout completion callback");
        const result = onLogoutComplete();
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        console.warn("⚠️ Logout completion callback failed:", error);
      }
    }

    // 🟢 Clear storage based on account type
    if (isAdmin) {
      console.log("🚪 Admin logout - clearing admin tokens and user data");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("user"); // Also clear user data to be safe
    } else {
      console.log("🚪 User logout - clearing user tokens and data");
      localStorage.removeItem("userToken");
      localStorage.removeItem("user");
    }

    // 🟢 Wait a moment then do hard redirect
    console.log("🚀 Redirecting to login...");
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (isAdmin) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/auth/login";
    }
  };

  return { logout };
}
