import React, { useRef, useEffect, useState } from "react";
import Hls from "hls.js";
import { EventOverlay } from "./EventOverlay";

interface StreamViewProps {
  children?: React.ReactNode;
  hlsUrl?: string;
  isStreaming?: boolean;
  latestEvent?: {
    id: string;
    text: string;
    type: 'success' | 'warning' | 'info';
    timestamp: number;
  } | null;
}

export const StreamView: React.FC<StreamViewProps> = ({
  children,
  hlsUrl,
  isStreaming = false,
  latestEvent = null
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(`[StreamView] ${logMessage}`);
    setDebugInfo((prev) => [...prev.slice(-9), logMessage]);
  };

  useEffect(() => {
    const video = videoRef.current;

    addDebugLog(`State check: video=${!!video}, hlsUrl=${hlsUrl}, isStreaming=${isStreaming}`);

    // Allow playback if hlsUrl is provided, regardless of isStreaming
    // This allows viewing streams independently of Convex task state
    if (!video || !hlsUrl) {
      addDebugLog("Cleaning up - missing video element or HLS URL");
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    setIsLoading(true);
    setVideoError(null);
    addDebugLog(`Initializing HLS player for: ${hlsUrl}`);

    // Test if URL is accessible
    fetch(hlsUrl, { method: 'HEAD', mode: 'no-cors' })
      .then(() => addDebugLog("HLS URL is accessible"))
      .catch(() => addDebugLog("⚠️ Warning: Could not verify HLS URL accessibility"));

    if (Hls.isSupported()) {
      addDebugLog("HLS.js is supported - using HLS.js player");
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        debug: true, // Enable debug logging
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        addDebugLog("Media attached to video element");
        hls.loadSource(hlsUrl);
      });

      hls.on(Hls.Events.MANIFEST_LOADING, () => {
        addDebugLog("Loading HLS manifest...");
      });

      hls.on(Hls.Events.MANIFEST_LOADED, (_, data) => {
        addDebugLog(`Manifest loaded: ${data.levels?.length || 0} quality levels`);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        addDebugLog("Manifest parsed - starting playback");
        setIsLoading(false);
        video.play().catch((e) => {
          addDebugLog(`⚠️ Autoplay blocked: ${e.message}`);
          console.warn("Autoplay blocked:", e);
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        addDebugLog(`Switched to quality level: ${data.level}`);
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        addDebugLog("Fragment loaded");
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        addDebugLog(`❌ HLS Error: ${data.type} - ${data.details} (fatal: ${data.fatal})`);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setVideoError("Network error - retrying...");
              addDebugLog("Attempting to recover from network error");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setVideoError("Media error - recovering...");
              addDebugLog("Attempting to recover from media error");
              hls.recoverMediaError();
              break;
            default:
              setVideoError(`Stream error: ${data.details}`);
              addDebugLog(`Fatal error - destroying player: ${data.details}`);
              hls.destroy();
              break;
          }
        }
      });

      hls.attachMedia(video);

      return () => {
        addDebugLog("Cleaning up HLS player");
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      addDebugLog("Using Safari native HLS support");
      video.src = hlsUrl;
      video.addEventListener("loadedmetadata", () => {
        addDebugLog("Safari: Metadata loaded");
        setIsLoading(false);
        video.play().catch((e) => {
          addDebugLog(`⚠️ Autoplay blocked: ${e.message}`);
          console.warn("Autoplay blocked:", e);
        });
      });
      video.addEventListener("error", (e) => {
        addDebugLog(`❌ Video error: ${e.type}`);
      });
    } else {
      const errorMsg = "HLS not supported in this browser";
      addDebugLog(`❌ ${errorMsg}`);
      setVideoError(errorMsg);
    }
  }, [hlsUrl, isStreaming]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden border-y-2 border-hud-primary/20 group">
      {/* Scanlines and visual noise */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
      <div className="absolute inset-0 pointer-events-none z-10 bg-grid-pattern opacity-20" />
      <div className="scanline" />

      {/* Crosshair Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 opacity-50 group-hover:opacity-80 transition-opacity">
        <div className="w-12 h-12 border border-hud-primary/50 flex items-center justify-center relative">
          <div className="w-1 h-1 bg-hud-primary rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-px h-4 bg-hud-primary/50" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-px h-4 bg-hud-primary/50" />
          <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 h-px w-4 bg-hud-primary/50" />
          <div className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 h-px w-4 bg-hud-primary/50" />
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-hud-primary/50 z-20" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-hud-primary/50 z-20" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-hud-primary/50 z-20" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-hud-primary/50 z-20" />

      {/* Video Player */}
      {hlsUrl && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain z-0"
          playsInline
          muted
          autoPlay
        />
      )}

      {/* Video Content Area / Fallback */}
      <div className="w-full h-full flex items-center justify-center text-hud-primary/20 z-5">
        {isLoading && (
          <div className="flex flex-col items-center gap-4 animate-pulse z-30 absolute">
            <div className="text-2xl">CONNECTING...</div>
            <div className="text-sm hud-text">Establishing HLS uplink</div>
          </div>
        )}

        {videoError && (
          <div className="flex flex-col items-center gap-4 z-30 absolute">
            <div className="text-2xl text-red-500/80">SIGNAL ERROR</div>
            <div className="text-sm hud-text text-red-400/60">{videoError}</div>
          </div>
        )}

        {!isStreaming && !children && (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="text-6xl">NO SIGNAL</div>
            <div className="text-sm hud-text">WAITING FOR RTMP UPLINK...</div>
          </div>
        )}

        {children}
      </div>

      {/* Event Overlay */}
      <EventOverlay event={latestEvent} />

      {/* Debug Panel */}
      <div className="absolute bottom-4 left-4 z-50">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-2 py-1 text-xs bg-black/80 border border-hud-primary/50 text-hud-primary hover:bg-hud-primary hover:text-black transition-all"
        >
          {showDebug ? "HIDE DEBUG" : "SHOW DEBUG"}
        </button>

        {showDebug && (
          <div className="mt-2 w-96 max-h-64 overflow-y-auto bg-black/90 border border-hud-primary/50 p-3 text-xs font-mono text-hud-primary/80">
            <div className="text-hud-primary/50 mb-2 font-bold">DEBUG LOG:</div>
            <div className="space-y-1">
              {debugInfo.length === 0 ? (
                <div className="text-hud-primary/30">No debug info yet...</div>
              ) : (
                debugInfo.map((log, i) => (
                  <div key={i} className="text-hud-primary/60">
                    {log}
                  </div>
                ))
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-hud-primary/20 text-hud-primary/40">
              <div>HLS URL: {hlsUrl || "Not set"}</div>
              <div>Streaming: {isStreaming ? "Yes" : "No"}</div>
              <div>Loading: {isLoading ? "Yes" : "No"}</div>
              <div>Error: {videoError || "None"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
