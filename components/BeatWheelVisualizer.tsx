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
    
    const animatedProps = useSpring({
        transform: isActive && emphasis !== 'silent' ? 'scale(1.05)' : 'scale(1)',
        filter: isActive && emphasis !== 'silent' ? 'drop-shadow(0 0 8px currentColor)' : 'drop-shadow(0 0 0px currentColor)',
        config: { tension: 300, friction: 15 }
    });
    
    let colorClass: string;
    let strokeDasharray = 'none';
    let strokeLinecap: 'round' | 'butt' = 'round';
    let strokeWidth = emphasis === 'accent' ? 22 : 20;
    
    if (isActive) {
        if (emphasis !== 'silent') {
           colorClass = emphasis === 'accent' ? 'stroke-indigo-500 dark:stroke-indigo-400' : 'stroke-teal-600 dark:stroke-teal-500';
        } else {
            colorClass = 'stroke-black/50 dark:stroke-white/50';
            strokeDasharray = '1, 10';
            strokeLinecap = 'butt';
        }
    } else {
        switch(emphasis) {
            case 'accent': colorClass = 'stroke-indigo-500/50 dark:stroke-indigo-400/50'; break;
            case 'regular': colorClass = 'stroke-black/30 dark:stroke-white/30'; break;
            case 'silent': 
                colorClass = 'stroke-black/50 dark:stroke-white/50';
                strokeDasharray = '1, 10';
                strokeLinecap = 'butt';
                break;
            default: colorClass = 'stroke-black/30 dark:stroke-white/30'; break;
        }
    }


    return (
        <animated.path
            d={describeArc(center, center, radius, startAngle, endAngle)}
            className={`${colorClass} transition-colors duration-100`}
            style={{
                transformOrigin: 'center center',
                transform: animatedProps.transform,
                filter: animatedProps.filter,
            }}
            strokeDasharray={strokeDasharray}
            strokeWidth={strokeWidth}
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
                className="stroke-slate-200 dark:stroke-black/20"
                strokeWidth="20"
                fill="none"
            />
            {segments}
        </svg>
    </div>
  );
};