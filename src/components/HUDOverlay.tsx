import { HealthBar, StatBox } from "./HUD";

interface HUDOverlayProps {
  hp: number;
  exerciseCount: number;
  bpm: number;
  activeTime: string;
  score: number;
}

export function HUDOverlay({ hp, exerciseCount, bpm, activeTime, score }: HUDOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
      {/* Top Row */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <StatBox label="KICKS" value={exerciseCount} />
          <StatBox label="BPM" value={bpm} unit="bpm" />
        </div>
        
        <div className="flex-1 flex justify-center pt-2">
          <HealthBar hp={hp} label="ENERGY" />
        </div>

        <div className="flex flex-col gap-2 items-end pointer-events-auto">
          <StatBox label="TIME" value={activeTime} />
          <StatBox label="SCORE" value={score} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex justify-center pb-4 opacity-50">
        <div className="text-xs font-hud tracking-[0.5em] text-hud-primary">
          SYSTEM NORMAL /// VISUAL SCANNING ACTIVE
        </div>
      </div>
    </div>
  );
}

