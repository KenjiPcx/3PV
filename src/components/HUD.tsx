import React from "react";

interface HealthBarProps {
  hp: number;
  maxHp?: number;
  label?: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({ hp, maxHp = 100, label = "HP" }) => {
  const percentage = Math.min(100, Math.max(0, (hp / maxHp) * 100));
  const color = percentage > 50 ? "bg-hud-success" : percentage > 20 ? "bg-hud-warning" : "bg-hud-danger";

  return (
    <div className="flex flex-col gap-1 w-full max-w-xs">
      <div className="flex justify-between text-xs hud-text uppercase tracking-widest opacity-80">
        <span>{label}</span>
        <span>{hp}/{maxHp}</span>
      </div>
      <div className="h-4 bg-drone-panel border border-hud-primary/50 skew-x-[-15deg] overflow-hidden relative">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out shadow-[0_0_10px_currentColor]`}
          style={{ width: `${percentage}%` }}
        />
        {/* Grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_90%,rgba(0,0,0,0.8)_100%)] bg-[length:10px_100%]" />
      </div>
    </div>
  );
};

interface StatBoxProps {
  label: string;
  value: string | number;
  unit?: string;
}

export const StatBox: React.FC<StatBoxProps> = ({ label, value, unit }) => {
  return (
    <div className="hud-border hud-corners bg-drone-panel/80 p-3 min-w-[120px] backdrop-blur-sm">
      <div className="text-[10px] hud-text text-hud-primary/70 uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold hud-text text-white drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
        {value}<span className="text-xs ml-1 opacity-60">{unit}</span>
      </div>
    </div>
  );
};

interface MessageFeedProps {
  messages: { id: string; text: string; type: 'info' | 'warning' | 'success'; timestamp?: number }[];
}

export const MessageFeed: React.FC<MessageFeedProps> = ({ messages }) => {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    
    // If less than 1 minute ago, show seconds
    if (diffMins < 1) {
      const diffSecs = Math.floor(diffMs / 1000);
      return `${diffSecs}s ago`;
    }
    
    // If less than 1 hour ago, show minutes
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    
    // Otherwise show full time
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto scrollbar-hide mask-fade-bottom">
      {messages.length === 0 ? (
        <div className="text-xs text-hud-primary/40 px-3 py-2 text-center">
          No events in the last hour
        </div>
      ) : (
        messages.map((msg) => {
          const timeStr = msg.timestamp
            ? formatTimestamp(msg.timestamp)
            : 'now';

          return (
            <div
              key={msg.id}
              className={`text-sm px-3 py-2 border-l-2 ${msg.type === 'warning' ? 'border-hud-warning text-hud-warning' :
                  msg.type === 'success' ? 'border-hud-success text-hud-success' :
                    'border-hud-primary text-hud-primary'
                } bg-black/50 backdrop-blur-md animate-in slide-in-from-left-2 fade-in duration-300`}
            >
              <div className="flex items-start gap-2">
                <span className="hud-text text-xs opacity-80 font-mono whitespace-nowrap">[{timeStr}]</span>
                <span className="flex-1">{msg.text}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

