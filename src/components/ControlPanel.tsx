import React, { useState } from "react";

interface ControlPanelProps {
  onStartStream: (url: string, systemPrompt: string, userPrompt: string, hlsUrl: string) => void;
  onStopStream: () => void;
  onSetHlsUrl?: (hlsUrl: string) => void;
  isStreaming: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onStartStream, onStopStream, onSetHlsUrl, isStreaming, isLoading = false, error = null }) => {
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [hlsUrl, setHlsUrl] = useState("http://localhost:8080/hls/livestream.m3u8");
  const [systemPrompt, setSystemPrompt] = useState("You are a hardcore fitness coach inspired by David Goggins.");
  const [userPrompt, setUserPrompt] = useState("Count the number of pushups and yell at me if I stop.");

  const handleHlsUrlChange = (newUrl: string) => {
    setHlsUrl(newUrl);
    if (onSetHlsUrl) {
      onSetHlsUrl(newUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) {
      onStopStream();
    } else {
      onStartStream(rtmpUrl, systemPrompt, userPrompt, hlsUrl);
    }
  };

  return (
    <div className="hud-border bg-drone-panel/90 p-6 w-full max-w-md backdrop-blur-md">
      <h2 className="text-xl hud-text font-bold mb-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-hud-success animate-pulse' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-hud-danger'}`} />
        MISSION CONTROL
        {isLoading && (
          <span className="text-xs text-hud-primary/70 ml-auto animate-pulse">INITIALIZING...</span>
        )}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-xs">
          <strong>ERROR:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1">
          <label className="text-xs hud-text uppercase text-hud-primary/70">RTMP Stream URL (for AI analysis)</label>
          <input
            type="text"
            value={rtmpUrl}
            onChange={(e) => setRtmpUrl(e.target.value)}
            placeholder="rtmp://..."
            className="w-full bg-black/50 border border-hud-primary/30 p-2 text-sm text-white focus:border-hud-primary focus:outline-none focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
            disabled={isStreaming}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs hud-text uppercase text-hud-primary/70">HLS Playback URL (for video display)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hlsUrl}
              onChange={(e) => handleHlsUrlChange(e.target.value)}
              placeholder="http://localhost:8080/hls/livestream.m3u8"
              className="flex-1 bg-black/50 border border-hud-primary/30 p-2 text-sm text-white focus:border-hud-primary focus:outline-none focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
            />
            <button
              type="button"
              onClick={() => handleHlsUrlChange(hlsUrl)}
              className="px-3 py-2 bg-hud-primary/20 border border-hud-primary text-hud-primary hover:bg-hud-primary hover:text-black transition-all text-xs uppercase"
              title="View stream without AI analysis"
            >
              VIEW
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs hud-text uppercase text-hud-primary/70">AI Persona (System Prompt)</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-black/50 border border-hud-primary/30 p-2 text-sm text-white focus:border-hud-primary focus:outline-none h-20 resize-none"
            disabled={isStreaming}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs hud-text uppercase text-hud-primary/70">Mission Objective (User Prompt)</label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="w-full bg-black/50 border border-hud-primary/30 p-2 text-sm text-white focus:border-hud-primary focus:outline-none h-20 resize-none"
            disabled={isStreaming}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`mt-2 py-3 px-6 font-bold uppercase tracking-wider transition-all duration-300 clip-path-button
            ${isStreaming 
              ? 'bg-hud-danger/20 border border-hud-danger text-hud-danger hover:bg-hud-danger hover:text-white' 
              : isLoading
              ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-500 cursor-wait opacity-70'
              : 'bg-hud-primary/20 border border-hud-primary text-hud-primary hover:bg-hud-primary hover:text-black'
            }`}
        >
          {isLoading ? 'INITIALIZING...' : isStreaming ? 'ABORT MISSION' : 'INITIATE LINK'}
        </button>
      </form>
    </div>
  );
};

export default ControlPanel;

