import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { BeatEmphasis } from '../types';

interface BeatWheelVisualizerProps {
  beatsPerMeasure: number;
  currentBeat: number;
  isPlaying: boolean;
  emphasisPattern: BeatEmphasis[];
  onBeatClick?: (beatIndex: number) => void;
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
    const sweepFlag = endAngle > startAngle ? '1' : '0';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
};


const BeatSegment: React.FC<{
    index: number;
    beatsPerMeasure: number;
    isActive: boolean;
    emphasis: BeatEmphasis;
}> = ({ index, beatsPerMeasure, isActive, emphasis }) => {
    const radius = 85;
    const center = 100;
    const anglePerBeat = 360 / beatsPerMeasure;
    const gap = beatsPerMeasure > 1 ? (beatsPerMeasure > 8 ? 6 : 8) : 0;

    const startAngle = index * anglePerBeat;
    const endAngle = startAngle + anglePerBeat - gap;

    const springProps = useSpring({
        opacity: isActive ? 1 : (emphasis === 'silent' ? 0.4 : 0.8),
        scale: isActive ? 1.1 : 1,
        config: { tension: 400, friction: 20 }
    });
    
    let colorClass = 'stroke-slate-500 dark:stroke-gray-600';
    let strokeDasharray = 'none';
    let strokeLinecap: 'round' | 'butt' = 'round';

    if (isActive) {
        if (emphasis !== 'silent') {
           colorClass = emphasis === 'accent' ? 'stroke-cyan-500 dark:stroke-cyan-400' : 'stroke-cyan-600 dark:stroke-cyan-500';
        }
    } else {
        switch(emphasis) {
            case 'accent': colorClass = 'stroke-cyan-500 dark:stroke-cyan-400'; break;
            case 'regular': colorClass = 'stroke-slate-400 dark:stroke-gray-500'; break;
            case 'silent': 
                colorClass = 'stroke-slate-400/50 dark:stroke-gray-700';
                strokeDasharray = '1, 10';
                strokeLinecap = 'butt';
                break;
        }
    }

    return (
        <animated.path
            d={describeArc(center, center, radius, startAngle, endAngle)}
            className={`${colorClass} transition-colors duration-200`}
            style={{
                opacity: springProps.opacity,
                transformOrigin: 'center center',
                transform: springProps.scale.to(s => `scale(${s})`),
                filter: isActive && emphasis !== 'silent' ? 'drop-shadow(0 0 8px currentColor)' : 'none',
            }}
            strokeDasharray={strokeDasharray}
            strokeWidth="16"
            strokeLinecap={strokeLinecap}
            fill="none"
        />
    )
}

export const BeatWheelVisualizer: React.FC<BeatWheelVisualizerProps> = ({ beatsPerMeasure, currentBeat, isPlaying, emphasisPattern, onBeatClick }) => {
  const segments = Array.from({ length: beatsPerMeasure }).map((_, i) => {
    const isActive = isPlaying && currentBeat === (i + 1);
    const emphasis = emphasisPattern[i] || 'regular';

    return (
        <g key={i} onClick={() => onBeatClick?.(i)} className={onBeatClick ? "cursor-pointer" : ""}>
            <BeatSegment 
                index={i}
                beatsPerMeasure={beatsPerMeasure}
                isActive={isActive}
                emphasis={emphasis}
            />
        </g>
    );
  });

  return (
    <div className="w-full h-full">
        <svg viewBox="0 0 200 200" className="w-full h-full" style={{ overflow: 'visible' }}>
             {/* Background Track */}
            <circle
                cx="100"
                cy="100"
                r="85"
                className="stroke-slate-400/30 dark:stroke-black/20"
                strokeWidth="16"
                fill="none"
            />
            {segments}
        </svg>
    </div>
  );
};