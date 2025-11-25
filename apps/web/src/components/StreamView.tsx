import React from "react";

export const StreamView: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
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

      {/* Video Content Area */}
      <div className="w-full h-full flex items-center justify-center text-hud-primary/20">
        {children || (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="text-6xl">NO SIGNAL</div>
            <div className="text-sm hud-text">WAITING FOR RTMP UPLINK...</div>
          </div>
        )}
      </div>
    </div>
  );
};

