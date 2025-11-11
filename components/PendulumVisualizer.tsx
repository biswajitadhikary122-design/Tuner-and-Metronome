
import React, { useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { BeatEmphasis } from '../types';

interface PendulumVisualizerProps {
  isPlaying: boolean;
  currentBeat: number;
  emphasisPattern: BeatEmphasis[];
  bpm: number;
}

const MAX_ANGLE = 20; // degrees, matching logo animation

export const PendulumVisualizer: React.FC<PendulumVisualizerProps> = ({ isPlaying, currentBeat, bpm }) => {
  const isFirstBeatRef = useRef(true);
  const lastBeatDirectionRef = useRef(-1);
  const previousBeatRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      isFirstBeatRef.current = true;
      lastBeatDirectionRef.current = -1;
      previousBeatRef.current = 0;
    } else {
        if(currentBeat === 0) return; // Don't run on the reset beat(0) when playing starts
        isFirstBeatRef.current = false;
        if (currentBeat !== previousBeatRef.current) {
            lastBeatDirectionRef.current *= -1;
            previousBeatRef.current = currentBeat;
        }
    }
  }, [isPlaying, currentBeat]);

  const targetAngle = isPlaying ? MAX_ANGLE * lastBeatDirectionRef.current : 0;
  
  const { rotation } = useSpring({
    to: { rotation: targetAngle },
    immediate: isFirstBeatRef.current && isPlaying,
    config: { duration: isFirstBeatRef.current ? 0 : (60 / bpm) * 1000, easing: t => t < 0.5 ? 4*t*t*t : 1-(Math.pow(-2*t+2,3)/2) },
    reset: !isPlaying,
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
            <linearGradient id="metronome-body-3d-viz" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#e07a5f" />
                <stop offset="100%" stopColor="#c95b42" />
            </linearGradient>
            <linearGradient id="metronome-face-3d-viz" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#f8f0de" />
                <stop offset="100%" stopColor="#e6dcc8" />
            </linearGradient>
             <linearGradient id="metronome-dark-parts-viz" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#4a4a4a" />
                <stop offset="100%" stopColor="#2b2b2b" />
            </linearGradient>
            <filter id="metronomeShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.3" />
            </filter>
        </defs>

        <g transform="translate(22, 10) scale(2.4)" filter="url(#metronomeShadow)">
            <g transform="translate(0, 5)">
                <path d="M 0 65 L 12 -5 Q 32.5 -10, 53 -5 L 65 65 A 5 5 0 0 1 60 70 L 5 70 A 5 5 0 0 1 0 65 Z" fill="url(#metronome-body-3d-viz)" stroke="#4a2525" strokeWidth="0.5"/>
                <path d="M 16 0 L 49 0 L 58 60 L 7 60 Z" fill="#2d2d2d"/>
                <path d="M 18 2 L 47 2 L 54 58 L 11 58 Z" fill="url(#metronome-face-3d-viz)"/>
                
                <g stroke="#6b4a3a" strokeWidth="0.8">
                    <line x1="26" y1="10" x2="39" y2="10" />
                    <line x1="27" y1="15" x2="38" y2="15" />
                    <line x1="28" y1="20" x2="37" y2="20" />
                    <line x1="29" y1="25" x2="36" y2="25" />
                    <line x1="25" y1="30" x2="40" y2="30" />
                    <line x1="29" y1="35" x2="36" y2="35" />
                    <line x1="28" y1="40" x2="37" y2="40" />
                    <line x1="27" y1="45" x2="38" y2="45" />
                    <line x1="26" y1="50" x2="39" y2="50" />
                </g>
                
                <circle cx="62" cy="67" r="1.5" fill="url(#metronome-dark-parts-viz)" />
                <circle cx="3" cy="67" r="1.5" fill="url(#metronome-dark-parts-viz)" />
                
                <g transform="translate(32.5 55)">
                    <animated.g style={{
                        transform: rotation.to(r => `rotate(${r}deg)`),
                    }}>
                         <rect x="-1" y="-50" width="2" height="50" fill="url(#metronome-dark-parts-viz)"/>
                         <path d="M -6 -28 L 6 -28 L 4 -23 L -4 -23 Z" fill="url(#metronome-dark-parts-viz)" />
                    </animated.g>
                    <circle cx="0" cy="0" r="6" fill="url(#metronome-dark-parts-viz)" />
                </g>
            </g>
        </g>
    </svg>
  );
};
