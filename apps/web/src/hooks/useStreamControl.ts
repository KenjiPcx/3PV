import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useStreamControl() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = async (
    rtmpUrl: string,
    systemPrompt: string,
    userPrompt: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/stream/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rtmpUrl,
          systemPrompt,
          userPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start stream");
      }

      const data = await response.json();
      return data.taskId;
    } catch (err: any) {
      setError(err.message || "Failed to start stream");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async (taskId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/stream/stop/${taskId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to stop stream");
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Failed to stop stream");
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

