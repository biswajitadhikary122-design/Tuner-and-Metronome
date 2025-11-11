import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { NoteDetails, TuningSettings } from '../types';

interface LinearTunerProps {
  note: NoteDetails | null;
  settings: TuningSettings;
  volume: number;
}

const CENTS_LABELS = [-50, -40, -30, -20, -10, 10, 20, 30, 40, 50];

export const LinearTuner: React.FC<LinearTunerProps> = ({ note, settings, volume }) => {
  const cents = note?.cents ?? 0;
  const noteActive = note !== null;

  // Function to get color class based on the scale value
  const getDynamicColorClass = (scaleValue: number): { text: string, bg: string } => {
    const idleColor = { text: 'text-black dark:text-white', bg: 'bg-black dark:bg-white' };

    if (!noteActive) {
      return idleColor;
    }

    if (Math.abs(scaleValue) <= 10) {
      return { text: 'text-green-500', bg: 'bg-green-500' };
    } else {
      return { text: 'text-red-500', bg: 'bg-red-500' };
    }
  };

  const clampedCents = Math.max(-55, Math.min(55, cents));
  const positionPercent = noteActive ? 50 + (clampedCents / 55) * 49 : 50; // Use 49 for a 98% span

  const { left } = useSpring({
    left: `${positionPercent}%`,
    config: { mass: 1, tension: 280, friction: 30 },
  });

  let indicatorBgClass = 'bg-black dark:bg-white';
  let glowColor = 'rgba(156, 163, 175, 0)';
  const inTuneNeedle = noteActive && Math.abs(cents) <= settings.tuningTolerance;

  if (noteActive) {
      if (inTuneNeedle) {
          indicatorBgClass = 'bg-green-500';
          glowColor = 'rgba(34, 197, 94, 0.7)';
      } else if (Math.abs(cents) < 25) {
          indicatorBgClass = 'bg-yellow-500';
          glowColor = 'rgba(234, 179, 8, 0.6)';
      } else {
          indicatorBgClass = 'bg-red-500';
          glowColor = 'rgba(239, 68, 68, 0.6)';
      }
  }

  const volumePercent = Math.min(100, (volume / 96) * 100);
  let volumeBarClass = 'bg-green-500';
  if (volumePercent > 75) volumeBarClass = 'bg-yellow-500';
  if (volumePercent > 90) volumeBarClass = 'bg-red-500';

  return (
    <div className="relative w-full p-4 flex flex-col justify-start font-mono overflow-hidden">
        {/* Main horizontal scale */}
        <div className="relative w-full h-16">

            {/* In-tune zone background */}
            <div 
                className="absolute h-[32px] top-1/2 -translate-y-1/2 bg-green-500/10 dark:bg-green-500/20 rounded-md transition-all duration-300"
                style={{
                    width: `${(settings.tuningTolerance / 50) * 98}%`, // Using 98% span to match ticks
                    left: `${50 - (settings.tuningTolerance / 50) * 49}%`,
                }}
            />
            
            {/* Ruler Markings */}
            <div className="absolute w-full h-full">
                {/* Ruler Ticks */}
                {Array.from({ length: 101 }).map((_, i) => {
                    const centsValue = i - 50;
                    if (centsValue === 0) return null;

                    let height = 8;
                    let top = 'calc(50% - 4px)';
                    if (centsValue % 5 === 0) { height = 16; top = 'calc(50% - 8px)'; }
                    if (centsValue % 10 === 0) { height = 24; top = 'calc(50% - 12px)'; }
                    
                    const { bg } = getDynamicColorClass(centsValue);

                    return <div key={centsValue} className={`absolute w-px transition-colors duration-150 ${bg}`} style={{ left: `${50 + (centsValue / 50) * 49}%`, height: `${height}px`, top }}/>;
                })}

                {/* Center line */}
                <div className={`absolute w-px left-1/2 -translate-x-1/2 transition-colors duration-150 ${getDynamicColorClass(0).bg}`} style={{ height: '32px', top: 'calc(50% - 16px)' }} />
            </div>
            
            {/* Moving dot indicator */}
            <animated.div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left }}
            >
                <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${indicatorBgClass}`} 
                     style={{boxShadow: `0 0 8px ${glowColor}`}}/>
            </animated.div>

            {/* Labels */}
            <div className="absolute w-full left-1/2 -translate-x-1/2 top-0 text-xs sm:text-sm">
                 {CENTS_LABELS.map(val => {
                    const pos = 50 + (val / 50) * 49;
                    const { text } = getDynamicColorClass(val);
                    return <span key={val} className={`absolute -translate-x-1/2 w-8 text-center transition-colors duration-150 ${text}`} style={{ left: `${pos}%` }}>{val > 0 ? `+${val}` : val}</span>
                })}
            </div>
        </div>
        
        {/* Bottom Info */}
        <div className="flex justify-end items-center text-sm text-black dark:text-white mt-2">
             <div className="w-16 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mr-2">
                <div 
                    className={`h-full ${volumeBarClass} rounded-full transition-all duration-100`} 
                    style={{ width: `${volumePercent}%` }}
                />
            </div>
            <span>{volume.toFixed(0)} dB</span>
        </div>
    </div>
  );
};