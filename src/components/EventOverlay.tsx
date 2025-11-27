import { useEffect, useState } from "react";

interface EventOverlayProps {
  event: {
    id: string;
    text: string;
    type: 'success' | 'warning' | 'info';
    timestamp: number;
  } | null;
}

export const EventOverlay: React.FC<EventOverlayProps> = ({ event }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);

  useEffect(() => {
    if (event && event.id !== currentEvent?.id) {
      // New event arrived - show it
      setCurrentEvent(event);
      setIsVisible(true);

      // Hide after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else if (!event) {
      // No event - hide overlay
      setIsVisible(false);
    }
  }, [event, currentEvent]);

  if (!currentEvent || !isVisible) {
    return null;
  }

  const borderColor = 
    currentEvent.type === 'success' ? 'border-hud-success' :
    currentEvent.type === 'warning' ? 'border-hud-warning' :
    'border-hud-primary';

  const textColor = 
    currentEvent.type === 'success' ? 'text-hud-success' :
    currentEvent.type === 'warning' ? 'text-hud-warning' :
    'text-hud-primary';

  return (
    <div 
      className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        transition-all duration-500 ease-in-out`}
    >
      <div className={`
        px-6 py-4 bg-black/80 backdrop-blur-md border-2 ${borderColor}
        shadow-[0_0_20px_currentColor] max-w-2xl
        hud-text
      `}>
        <div className={`text-lg font-bold ${textColor} uppercase tracking-wider`}>
          {currentEvent.text}
        </div>
      </div>
    </div>
  );
};

