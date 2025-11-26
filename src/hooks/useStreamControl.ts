import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "convex/_generated/api";

export function useStreamControl() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStreamAction = useAction(api.streamActions.startStreamAnalysis);
  const stopStreamAction = useAction(api.streamActions.stopStreamAnalysis);

  const startStream = async (
    rtmpUrl: string,
    systemPrompt: string,
    userPrompt: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useStreamControl] Starting stream via Convex`);
      console.log(`[useStreamControl] RTMP URL: ${rtmpUrl}`);

      const result = await startStreamAction({
        rtmpUrl,
        systemPrompt,
        userPrompt,
      });

      console.log(`[useStreamControl] Stream started successfully:`, result);
      return result.taskId;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to start stream";
      console.error(`[useStreamControl] Error:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async (taskId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useStreamControl] Stopping stream via Convex: ${taskId}`);

      await stopStreamAction({
        taskId,
      });

      console.log(`[useStreamControl] Stream stopped successfully`);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to stop stream";
      console.error(`[useStreamControl] Error:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startStream,
    stopStream,
    isLoading,
    error,
  };
}
