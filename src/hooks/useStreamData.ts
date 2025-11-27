import { useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "convex/_generated/api";

export function useStreamData() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Get active stream tasks
  const activeTasks = useQuery(api.streamTasks.getActiveTasks) || [];
  const activeTask = activeTasks[0]; // Use the first active task

  // Get all recent events from the past hour (regardless of task)
  const recentEvents = useQuery(api.streamEvents.getRecentEvents, {}) || [];

  // Deduplicate by _id in case there's overlap
  const eventMap = new Map();
  recentEvents.forEach(event => {
    eventMap.set(event._id, event);
  });

  const streamEvents = Array.from(eventMap.values());

  // Get game stats for the user
  const gameStats = useQuery(
    api.streamEvents.getGameStats,
    userId ? { userId } : "skip"
  );

  // Get coach messages
  const coachMessages = useQuery(
    api.streamEvents.getCoachMessages,
    userId ? { userId, limit: 20 } : "skip"
  ) || [];

  return {
    userId,
    activeTask,
    streamEvents,
    gameStats,
    coachMessages,
    isStreaming: !!activeTask,
  };
}

