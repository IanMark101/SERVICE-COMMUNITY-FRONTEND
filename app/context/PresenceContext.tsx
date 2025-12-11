"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api from "@/services/api";

interface PresenceData {
  isOnline: boolean;
  lastSeenAt: string;
}

interface PresenceContextType {
  presenceTimeoutMinutes: number;
  presence: PresenceData | null;
  setPresenceTimeoutMinutes: (timeout: number) => void;
  setPresence: (presence: PresenceData | null) => void;
  startHeartbeat: (timeoutMinutes: number) => void;
  stopHeartbeat: () => void;
  markOnline: () => Promise<void>;
  markOffline: () => Promise<void>;
  refreshPresence: () => Promise<void>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [presenceTimeoutMinutes, setPresenceTimeoutMinutes] = useState(5); // Default 5 minutes
  const [presence, setPresence] = useState<PresenceData | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<number>(0);

  // Start heartbeat interval
  const startHeartbeat = useCallback((timeoutMinutes: number) => {
    // Clean up existing heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    setPresenceTimeoutMinutes(timeoutMinutes);

    // Set interval to at most 80% of timeout to ensure we don't miss it
    const heartbeatInterval = Math.min(timeoutMinutes * 60 * 1000 * 0.8, 60000); // Cap at 1 minute

    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        // Check if token still exists - if not, stop heartbeat (logout occurred)
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.log("⏹️ Token expired/cleared - stopping heartbeat automatically");
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
          return;
        }

        // Send heartbeat (empty body to /api/users/me/presence)
        const response = await api.post("/users/me/presence");
        
        if (response.data.presence) {
          setPresence(response.data.presence);
        }
      } catch (error: any) {
        // If 401 or 403, token is invalid - stop heartbeat
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("⏹️ Unauthorized - stopping heartbeat (token invalid)");
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
          return;
        }
        console.warn("Heartbeat failed:", error.message);
      }
    }, heartbeatInterval);

    console.log(`✅ Heartbeat started with interval: ${heartbeatInterval}ms (${timeoutMinutes} min timeout)`);
  }, []);

  // Stop heartbeat interval
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
      console.log("❌ Heartbeat stopped");
    }
  }, []);

  // Mark user as online
  const markOnline = useCallback(async () => {
    try {
      const response = await api.post("/users/me/presence", {
        status: "online",
      });

      if (response.data.presence) {
        setPresence(response.data.presence);
      }

      console.log("✅ User marked online");
    } catch (error) {
      console.error("Failed to mark user online:", error);
    }
  }, []);

  // Mark user as offline
  const markOffline = useCallback(async () => {
    try {
      stopHeartbeat();
      
      const response = await api.post("/users/me/presence", {
        status: "offline",
      });

      if (response.data.presence) {
        setPresence(response.data.presence);
      }

      console.log("✅ User marked offline");
    } catch (error) {
      console.error("Failed to mark user offline:", error);
    }
  }, [stopHeartbeat]);

  // Refresh presence from server
  const refreshPresence = useCallback(async () => {
    try {
      const response = await api.get("/users/me");

      if (response.data.isOnline !== undefined) {
        setPresence({
          isOnline: response.data.isOnline,
          lastSeenAt: response.data.lastSeenAt,
        });

        if (response.data.presenceTimeoutMinutes) {
          setPresenceTimeoutMinutes(response.data.presenceTimeoutMinutes);
        }
      }

      console.log("✅ Presence refreshed from server");
    } catch (error) {
      console.error("Failed to refresh presence:", error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return (
    <PresenceContext.Provider
      value={{
        presenceTimeoutMinutes,
        presence,
        setPresenceTimeoutMinutes,
        setPresence,
        startHeartbeat,
        stopHeartbeat,
        markOnline,
        markOffline,
        refreshPresence,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
}
