import React, { useState } from "react";

interface ControlPanelProps {
  onStartStream: (url: string, systemPrompt: string, userPrompt: string) => void;
  onStopStream: () => void;
  isStreaming: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onStartStream, onStopStream, isStreaming }) => {
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("You are a hardcore fitness coach inspired by David Goggins.");
  const [userPrompt, setUserPrompt] = useState("Count the number of pushups and yell at me if I stop.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) {
      onStopStream();
    } else {
      onStartStream(rtmpUrl, systemPrompt, userPrompt);
    }
  };

  return (
    <div className="hud-border bg-drone-panel/90 p-6 w-full max-w-md backdrop-blur-md">
      <h2 className="text-xl hud-text font-bold mb-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-hud-success animate-pulse' : 'bg-hud-danger'}`} />
        MISSION CONTROL
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1">
          <label className="text-xs hud-text uppercase text-hud-primary/70">RTMP Stream URL</label>
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
          className={`mt-2 py-3 px-6 font-bold uppercase tracking-wider transition-all duration-300 clip-path-button
            ${isStreaming 
              ? 'bg-hud-danger/20 border border-hud-danger text-hud-danger hover:bg-hud-danger hover:text-white' 
              : 'bg-hud-primary/20 border border-hud-primary text-hud-primary hover:bg-hud-primary hover:text-black'
            }`}
        >
          {isStreaming ? 'ABORT MISSION' : 'INITIATE LINK'}
        </button>
      </form>
    </div>
  );
};

