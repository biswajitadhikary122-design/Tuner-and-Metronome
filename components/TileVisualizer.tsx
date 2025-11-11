
import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { BeatEmphasis } from '../types';

interface TileVisualizerProps {
  beatsPerMeasure: number;
  currentBeat: number;
  isPlaying: boolean;
  emphasisPattern: BeatEmphasis[];
  grouping: number[] | null;
  onBeatClick?: (beatIndex: number) => void;
}

const Tile: React.FC<{
  beatNumber: number;
  isActive: boolean;
  emphasis: BeatEmphasis;
  onClick?: () => void;
}> = ({ beatNumber, isActive, emphasis, onClick }) => {
    const { transform, boxShadow } = useSpring({
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isActive 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        config: { tension: 500, friction: 20 },
    });


  let bgColor: string;
  let textColor: string;

  if (isActive) {
    switch (emphasis) {
      case 'accent':
        bgColor = 'bg-indigo-300 dark:bg-indigo-500';
        textColor = 'text-indigo-900 dark:text-white';
        break;
      case 'silent':
        bgColor = 'bg-slate-400/50 dark:bg-slate-800/50 border-4 border-dashed border-slate-600 dark:border-slate-500';
        textColor = 'text-transparent';
        break;
      default: // 'regular'
        bgColor = 'bg-teal-300 dark:bg-teal-500';
        textColor = 'text-teal-900 dark:text-white';
    }
  } else { // Inactive
    switch (emphasis) {
      case 'accent':
        bgColor = 'bg-indigo-500/20 dark:bg-indigo-500/20';
        textColor = 'text-indigo-800 dark:text-indigo-300';
        break;
      case 'silent':
        bgColor = 'bg-transparent border-2 border-dashed border-slate-400 dark:border-slate-700';
        textColor = 'text-transparent';
        break;
      default: // 'regular'
        bgColor = 'bg-slate-200 dark:bg-slate-800';
        textColor = 'text-black/70 dark:text-white/70';
    }
  }


  return (
    <animated.div
      onClick={onClick}
      style={{ transform, boxShadow }}
      className={`relative w-24 h-24 rounded-2xl flex items-center justify-center transition-colors duration-150 ${bgColor} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <span className={`text-6xl font-light select-none transition-colors duration-150 ${textColor}`}>
        {beatNumber}
      </span>
    </animated.div>
  );
};

export const TileVisualizer: React.FC<TileVisualizerProps> = ({ beatsPerMeasure, currentBeat, isPlaying, emphasisPattern, grouping, onBeatClick }) => {
  const groups = grouping || [beatsPerMeasure]; // If no grouping, treat as one group
  let beatCounter = 0;

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      {groups.map((groupSize, groupIndex) => (
        <div key={groupIndex} className="flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: groupSize }).map((_, beatInGroupIndex) => {
            const beatNumber = beatCounter + 1;
            const beatIndex = beatCounter;
            beatCounter++;
            return (
              <Tile
                key={beatNumber}
                beatNumber={beatNumber}
                isActive={isPlaying && currentBeat === beatNumber}
                emphasis={emphasisPattern[beatIndex] || 'regular'}
                onClick={onBeatClick ? () => onBeatClick(beatIndex) : undefined}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};