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

  // Filter stream events to only show those from the last hour
  const messages = useMemo(() => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour in milliseconds

    console.log(`[Dashboard] Filtering events. Total events: ${streamEvents?.length || 0}, One hour ago: ${new Date(oneHourAgo).toISOString()}`);

    const eventMessages = (streamEvents || [])
      .map((event) => {
        // Parse timestamp - prioritize event.timestamp (from Memories AI), fallback to _creationTime
        let timestamp: number;
        if (event.timestamp) {
          if (typeof event.timestamp === 'string') {
            const parsed = new Date(event.timestamp).getTime();
            timestamp = isNaN(parsed) ? event._creationTime : parsed;
          } else {
            timestamp = event.timestamp;
          }
        } else {
          timestamp = event._creationTime;
        }
        
        // Ensure timestamp is valid
        if (!timestamp || isNaN(timestamp)) {
          timestamp = Date.now();
        }
        
        // Format text - show status if no text
        let text = event.text?.trim();
        if (!text || text.length === 0) {
          if (event.status === 0) {
            text = '(analysis received)';
          } else if (event.status === 14) {
            text = '(stream ended)';
          } else {
            text = `(status: ${event.status})`;
          }
        }
        
        const eventTime = new Date(timestamp).toISOString();
        const isWithinHour = timestamp >= oneHourAgo;
        
        console.log(`[Dashboard] Event ${event._id}: timestamp=${eventTime}, withinHour=${isWithinHour}, text="${text.substring(0, 50)}"`);
        
        return {
          id: event._id,
          text,
          type: event.status === 0 ? 'success' as const : 'warning' as const,
          timestamp,
        };
      })
      .filter((event) => {
        // Only include events from the last hour
        const isWithinHour = event.timestamp >= oneHourAgo;
        if (!isWithinHour) {
          console.log(`[Dashboard] Filtered out event ${event.id}: timestamp ${new Date(event.timestamp).toISOString()} is before ${new Date(oneHourAgo).toISOString()}`);
        }
        return isWithinHour;
      })
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Newest first

    console.log(`[Dashboard] Final filtered events: ${eventMessages.length}`);
    return eventMessages;
  }, [streamEvents]);

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
            latestEvent={messages.length > 0 ? messages[0] : null}
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

