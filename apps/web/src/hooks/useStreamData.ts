import { useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";

export function useStreamData() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Get active stream tasks
  const activeTasks = useQuery(api.streamTasks.getActiveTasks) || [];
  const activeTask = activeTasks[0]; // Use the first active task

  // Get stream events for the active task
  const streamEvents = useQuery(
    api.streamEvents.getEventsByTask,
    activeTask ? { taskId: activeTask.taskId, limit: 50 } : "skip"
  ) || [];

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

