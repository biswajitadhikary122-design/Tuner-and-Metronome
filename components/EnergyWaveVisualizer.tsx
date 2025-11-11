import React, { useState, useEffect, useRef } from 'react';
import type { BeatEmphasis } from '../types';

interface EnergyWaveVisualizerProps {
  currentBeat: number;
  isPlaying: boolean;
  emphasisPattern: BeatEmphasis[];
}

interface Wave {
  id: number;
  emphasis: BeatEmphasis;
}

export const EnergyWaveVisualizer: React.FC<EnergyWaveVisualizerProps> = ({ currentBeat, isPlaying, emphasisPattern }) => {
  const [waves, setWaves] = useState<Wave[]>([]);
  const waveIdCounter = useRef(0);
  const lastBeatRef = useRef(0);
  
  // Use a ref to access the latest emphasisPattern without making it a dependency of the effect.
  // This prevents the effect from re-running and clearing timeouts when the pattern changes.
  const emphasisPatternRef = useRef(emphasisPattern);
  emphasisPatternRef.current = emphasisPattern;

  useEffect(() => {
    // Only trigger on a new beat, not on re-renders
    if (isPlaying && currentBeat > 0 && currentBeat !== lastBeatRef.current) {
      lastBeatRef.current = currentBeat;
      const emphasis = emphasisPatternRef.current[currentBeat - 1] || 'regular';
      
      if (emphasis === 'silent') return; // Don't show a wave for silent beats

      const newWave: Wave = {
        id: waveIdCounter.current++,
        emphasis: emphasis,
      };

      setWaves(prev => [...prev, newWave]);

      // Clean up the wave from the DOM after the animation completes.
      // This timeout is now safe because the effect won't re-run unnecessarily.
      const timer = setTimeout(() => {
        setWaves(prev => prev.filter(w => w.id !== newWave.id));
      }, 800); // Must match animation duration

      return () => clearTimeout(timer);
    } else if (!isPlaying) {
      lastBeatRef.current = 0; // Reset on stop
      setWaves([]); // Clear any lingering waves when stopped
    }
  }, [currentBeat, isPlaying]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {waves.map(wave => {
        const isAccent = wave.emphasis === 'accent';
        const waveClass = isAccent
          ? 'border-indigo-500 dark:border-indigo-400 animate-expand-wave-accent'
          : 'border-teal-500 dark:border-teal-400 animate-expand-wave-regular';
        
        const shadowClass = isAccent
            ? 'shadow-indigo-500/75 dark:shadow-indigo-400/75'
            : 'shadow-teal-500/75 dark:shadow-teal-400/75';

        return (
          <div
            key={wave.id}
            className={`absolute w-full h-full aspect-square rounded-full border-[10px] shadow-glow-lg ${waveClass} ${shadowClass}`}
          />
        );
      })}
    </div>
  );
};
