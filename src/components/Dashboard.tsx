import { useMemo, useEffect, useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { HUDOverlay } from "./HUDOverlay";
import { SidePanel } from "./SidePanel";
import { StreamView } from "./StreamView";
import { useStreamData } from "../hooks/useStreamData";
import { useStreamControl } from "../hooks/useStreamControl";

export function Dashboard() {
  const { activeTask, streamEvents, gameStats, coachMessages, isStreaming } = useStreamData();
  const { startStream, stopStream, isLoading, error } = useStreamControl();
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);

  // Calculate active time from task start
  const activeTime = useMemo(() => {
    if (!activeTask) return "00:00";
    const elapsed = Date.now() - activeTask.startedAt;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [activeTask]);

  // Combine stream events and coach messages into a unified message feed
  const messages = useMemo(() => {
    const eventMessages = (streamEvents || []).map((event) => {
      // Parse timestamp - it can be ISO string or number
      let timestamp: number;
      if (typeof event.timestamp === 'string') {
        timestamp = new Date(event.timestamp).getTime();
      } else {
        timestamp = event.timestamp;
      }
      
      return {
        id: event._id,
        text: event.text,
        type: event.status === 0 ? 'success' as const : 'warning' as const,
        timestamp: timestamp || Date.now(),
      };
    });

    const coachMsg = (coachMessages || []).map((msg) => ({
      id: msg._id,
      text: msg.message,
      type: msg.type === 'motivational' || msg.type === 'celebration' 
        ? 'success' as const 
        : msg.type === 'warning' 
        ? 'warning' as const 
        : 'info' as const,
      timestamp: msg.timestamp,
    }));

    // Combine and sort by timestamp (newest first)
    const combined = [...eventMessages, ...coachMsg].sort((a, b) => 
      (b.timestamp || 0) - (a.timestamp || 0)
    );

    return combined.slice(0, 50); // Limit to 50 most recent
  }, [streamEvents, coachMessages]);

  // Stats from gameStats or defaults
  const hp = gameStats?.hp ?? 100;
  const exerciseCount = gameStats?.exerciseCount ?? 0;
  const bpm = 75; // TODO: Add BPM tracking to gameStats
  const score = exerciseCount * 100;

  const handleStartStream = async (url: string, systemPrompt: string, userPrompt: string, playerHlsUrl: string) => {
    try {
      setHlsUrl(playerHlsUrl);
      const taskId = await startStream(url, systemPrompt, userPrompt);
      console.log("Stream started successfully, taskId:", taskId);
      // Note: The UI will update automatically when activeTask appears in useStreamData
    } catch (err: any) {
      console.error("Failed to start stream:", err);
      // Error is already set by useStreamControl hook
    }
  };

  const handleStopStream = async () => {
    if (!activeTask) return;
    try {
      await stopStream(activeTask.taskId);
      setHlsUrl(null);
    } catch (err) {
      console.error("Failed to stop stream:", err);
    }
  };

  // Show error if any
  useEffect(() => {
    if (error) {
      console.error("Stream control error:", error);
    }
  }, [error]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-drone-bg">
      <DashboardHeader isStreaming={isStreaming} />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Viewport */}
        <main className="flex-1 relative bg-black">
          <StreamView 
            hlsUrl={hlsUrl || undefined} 
            isStreaming={isStreaming}
          />
          
          {/* HUD Overlays */}
          <HUDOverlay
            hp={hp}
            exerciseCount={exerciseCount}
            bpm={bpm}
            activeTime={activeTime}
            score={score}
          />
        </main>

        {/* Side Panel */}
        <SidePanel
          isStreaming={isStreaming}
          onStartStream={handleStartStream}
          onStopStream={handleStopStream}
          onSetHlsUrl={setHlsUrl}
          isLoading={isLoading}
          error={error}
          messages={messages}
        />
      </div>
    </div>
  );
}

