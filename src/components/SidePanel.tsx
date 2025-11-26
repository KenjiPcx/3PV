import { ControlPanel } from "./ControlPanel";
import { MessageFeed } from "./HUD";

interface Message {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success';
  timestamp?: number;
}

interface SidePanelProps {
  isStreaming: boolean;
  onStartStream: (url: string, systemPrompt: string, userPrompt: string, hlsUrl: string) => void;
  onStopStream: () => void;
  onSetHlsUrl?: (hlsUrl: string) => void;
  isLoading?: boolean;
  error?: string | null;
  messages: Message[];
}

export function SidePanel({ isStreaming, onStartStream, onStopStream, onSetHlsUrl, isLoading, error, messages }: SidePanelProps) {
  return (
    <aside className="w-96 border-l border-hud-primary/20 bg-drone-panel flex flex-col z-40">
      <div className="p-4 border-b border-hud-primary/10">
        <ControlPanel 
          isStreaming={isStreaming}
          onStartStream={onStartStream}
          onStopStream={onStopStream}
          onSetHlsUrl={onSetHlsUrl}
          isLoading={isLoading}
          error={error}
        />
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <h3 className="text-xs font-hud text-hud-primary/50 mb-2 uppercase tracking-widest">
          Communication Log
        </h3>
        <MessageFeed messages={messages} />
      </div>

      <div className="p-4 border-t border-hud-primary/10 text-[10px] font-hud text-hud-primary/30 text-center">
        3PV-OS v1.0.0-alpha
      </div>
    </aside>
  );
}

