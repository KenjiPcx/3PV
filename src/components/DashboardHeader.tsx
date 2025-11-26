import { UserButton } from "@clerk/clerk-react";

interface DashboardHeaderProps {
  isStreaming: boolean;
}

export function DashboardHeader({ isStreaming }: DashboardHeaderProps) {
  return (
    <header className="h-14 border-b border-hud-primary/20 bg-drone-panel flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white tracking-wider">
          3PV <span className="text-hud-primary text-sm opacity-70">/// OPERATOR VIEW</span>
        </h1>
        <div className="h-4 w-px bg-hud-primary/30" />
        <div className="flex items-center gap-2 text-xs font-hud text-hud-primary/60">
          <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-hud-success animate-pulse' : 'bg-hud-danger'}`} />
          {isStreaming ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <UserButton />
      </div>
    </header>
  );
}

