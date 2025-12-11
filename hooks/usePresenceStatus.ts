import { usePresence } from "@/app/context/PresenceContext";

/**
 * Hook to manage user presence status
 * Provides helpers for checking if user is online and formatting last seen time
 */
export function usePresenceStatus() {
  const { presence, presenceTimeoutMinutes } = usePresence();

  const isOnline = presence?.isOnline ?? false;
  
  const getLastSeenText = (lastSeenAt?: string) => {
    if (!lastSeenAt) return "Never";

    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return lastSeen.toLocaleDateString();
  };

  const getPresenceBadge = () => {
    if (isOnline) {
      return { status: "online", label: "Online", color: "bg-green-500" };
    }
    return { status: "offline", label: "Offline", color: "bg-gray-500" };
  };

  return {
    isOnline,
    lastSeenAt: presence?.lastSeenAt,
    presenceTimeoutMinutes,
    getLastSeenText: () => getLastSeenText(presence?.lastSeenAt),
    getPresenceBadge,
  };
}
