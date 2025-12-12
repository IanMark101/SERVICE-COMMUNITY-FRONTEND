import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // ← Changed from true to false
});

// REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");
  const pathname = window.location.pathname;
  const isAdminRequest =
    config.url?.startsWith("/admin") || pathname.startsWith("/admin");

  let token: string | null = null;

  if (isAdminRequest) {
    token = adminToken ?? null;
  } else {
    token = userToken ?? null;
  }

  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const path = window.location.pathname;

      // 🔴 handle 401 (unauthorized) - auto redirect
      if (status === 401) {
        if (path.startsWith("/admin")) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          window.location.href = "/admin/login";
        } else if (path.startsWith("/dashboard")) {
          localStorage.removeItem("userToken");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
        }
      }
      
      // 🚫 403 (forbidden/banned) - DON'T auto redirect for dashboard
      // Let the dashboard handle it with the ban modal
      if (status === 403 && path.startsWith("/admin")) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        window.location.href = "/admin/login";
      }
      // For dashboard 403, just reject - let component handle ban modal
    }
    return Promise.reject(error);
  }
);

export default api;