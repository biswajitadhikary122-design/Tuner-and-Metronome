import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { NOTATION_MAPS } from '../constants';
import { noteToFrequency } from '../services/pitch';
import { startSustainedNote, stopSustainedNote } from '../services/audio';
import type { TuningSettings } from '../types';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

interface ChromaticWheelProps {
  settings: TuningSettings;
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

// This version draws a pie slice (wedge)
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
    
    // Path: Move to start, Arc to end, Line to center, close path
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} L ${x} ${y} Z`;
};

const Segment: React.FC<{
    index: number;
    noteName: string;
    isActive: boolean;
    onPress: () => void;
    onRelease: () => void;
}> = ({ index, noteName, isActive, onPress, onRelease }) => {
    const anglePerSegment = 30; // 360 / 12
    const startAngle = index * anglePerSegment - (anglePerSegment / 2);
    const endAngle = startAngle + anglePerSegment;
    
    const textPos = polarToCartesian(100, 100, 70, index * anglePerSegment); // Position text in the middle of the segment radius

    const { scale } = useSpring({
        scale: isActive ? 1.05 : 1,
        config: { tension: 400, friction: 15 }
    });

    const fillClass = isActive 
        ? 'fill-teal-500/80 dark:fill-teal-400/80'
        : 'fill-slate-100/70 dark:fill-slate-800/60 group-hover:fill-teal-500/20';

    const textColor = isActive
        ? 'fill-white dark:fill-slate-900'
        : 'fill-black dark:fill-white group-hover:fill-black dark:group-hover:fill-white';

    return (
        <animated.g
            onMouseDown={onPress}
            onMouseUp={onRelease}
            onMouseLeave={onRelease}
            onTouchStart={(e) => { e.preventDefault(); onPress(); }}
            onTouchEnd={onRelease}
            className="cursor-pointer group"
            style={{ transformOrigin: '100px 100px', scale }}
        >
            <path
                d={describeArc(100, 100, 95, startAngle, endAngle)}
                className={`transition-colors duration-200 stroke-2 stroke-white/50 dark:stroke-slate-900/50 ${fillClass}`}
            />
            <text
                x={textPos.x}
                y={textPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-xl font-bold pointer-events-none transition-colors ${textColor}`}
            >
                {noteName.split('/')[0]}
            </text>
        </animated.g>
    );
};


export const ChromaticWheel: React.FC<ChromaticWheelProps> = ({ settings }) => {
    const [octave, setOctave] = useState(4);
    const [activeNoteIds, setActiveNoteIds] = useState(new Set<string>());

    const displayNames = NOTATION_MAPS[settings.notationSystem] || NOTATION_MAPS['English'];
    const englishNames = NOTATION_MAPS['English'];

    const handlePress = (noteName: string, englishNoteName: string) => {
        const freq = noteToFrequency(noteName, octave, settings);
        const noteId = `wheel-${englishNoteName}${octave}`;
        if (freq > 0) {
            startSustainedNote(freq, 'sine', noteId);
            setActiveNoteIds(prev => new Set(prev).add(noteId));
        }
    };

    const handleRelease = (englishNoteName: string) => {
        const noteId = `wheel-${englishNoteName}${octave}`;
        stopSustainedNote(noteId);
        setActiveNoteIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(noteId);
            return newSet;
        });
    };
    
    const changeOctave = (amount: number) => {
        stopSustainedNote(); // Stop all notes when changing octave
        setActiveNoteIds(new Set());
        setOctave(prev => Math.max(0, Math.min(8, prev + amount)));
    };

    return (
        <div className="w-full max-w-xs flex flex-col items-center gap-4">
            <div className="w-64 h-64">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    {displayNames.map((noteName, i) => (
                       <Segment
                            key={`${noteName}-${i}`}
                            index={i}
                            noteName={noteName}
                            isActive={activeNoteIds.has(`wheel-${englishNames[i]}${octave}`)}
                            onPress={() => handlePress(noteName, englishNames[i])}
                            onRelease={() => handleRelease(englishNames[i])}
                        />
                    ))}
                    <circle cx="100" cy="100" r="45" className="fill-white/80 dark:fill-slate-800/80 stroke-slate-200 dark:stroke-slate-700" />
                </svg>
            </div>
             <div className="flex items-center gap-4">
                <button onClick={() => changeOctave(-1)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-black dark:bg-slate-900/50 dark:hover:bg-slate-700/50 dark:text-white transition-colors"><ChevronDownIcon className="w-6 h-6" /></button>
                <div className="font-mono text-2xl text-black dark:text-white text-center w-24">
                    Octave: <span className="font-bold">{octave}</span>
                </div>
                <button onClick={() => changeOctave(1)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-black dark:bg-slate-900/50 dark:hover:bg-slate-700/50 dark:text-white transition-colors"><ChevronUpIcon className="w-6 h-6" /></button>
            </div>
        </div>
    );
};
