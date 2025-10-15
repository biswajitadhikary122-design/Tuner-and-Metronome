import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { NOTATION_MAPS } from '../constants';
import { noteToFrequency } from '../services/pitch';
import { playNote } from '../services/audio';
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

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
    const sweepFlag = endAngle > startAngle ? '1' : '0';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
};

export const ChromaticWheel: React.FC<ChromaticWheelProps> = ({ settings }) => {
    const [octave, setOctave] = useState(4);
    const [activeNote, setActiveNote] = useState<string | null>(null);

    const displayNames = NOTATION_MAPS[settings.notationSystem] || NOTATION_MAPS['English'];
    const englishNames = NOTATION_MAPS['English'];

    const handlePlayNote = (noteName: string, englishNoteName: string) => {
        const freq = noteToFrequency(noteName, octave, settings);
        if (freq > 0) {
            playNote(freq, 0.75);
            setActiveNote(englishNoteName);
            setTimeout(() => setActiveNote(null), 300);
        }
    };
    
    const changeOctave = (amount: number) => {
        setOctave(prev => Math.max(0, Math.min(8, prev + amount)));
    };

    const segments = displayNames.map((noteName, i) => {
        const anglePerSegment = 360 / 12;
        const startAngle = i * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;
        const isSharp = englishNames[i].includes('#');

        const springProps = useSpring({
            scale: activeNote === englishNames[i] ? 1.05 : 1,
            config: { tension: 400, friction: 15 }
        });

        const textPos = polarToCartesian(100, 100, isSharp ? 60 : 75, startAngle + anglePerSegment / 2);

        return (
            <animated.g 
                key={noteName} 
                onClick={() => handlePlayNote(noteName, englishNames[i])}
                className="cursor-pointer group"
                style={{
                    transformOrigin: '100px 100px',
                    scale: springProps.scale,
                }}
            >
                <path
                    d={describeArc(100, 100, 90, startAngle, endAngle)}
                    className={`stroke-2 stroke-slate-200 dark:stroke-slate-700
                                ${isSharp ? 'fill-white dark:fill-slate-800/80' : 'fill-slate-100/70 dark:fill-slate-700/50'}
                                group-hover:fill-cyan-500/20 transition-colors`}
                />
                 <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`text-base font-semibold pointer-events-none transition-colors 
                                ${activeNote === englishNames[i] ? 'fill-cyan-600 dark:fill-cyan-300' : 'fill-slate-700 dark:fill-slate-300'}
                                group-hover:fill-slate-900 dark:group-hover:fill-white`}
                >
                    {noteName.split('/')[0]}
                </text>
            </animated.g>
        );
    });

    return (
        <div className="w-full max-w-xs flex flex-col items-center gap-4 p-4 mt-2 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50 animate-fade-in">
            <div className="w-64 h-64">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    {segments}
                    <circle cx="100" cy="100" r="45" className="fill-slate-50 stroke-2 stroke-slate-200 dark:fill-slate-800 dark:stroke-slate-700" />
                </svg>
            </div>
             <div className="flex items-center gap-4">
                <button onClick={() => changeOctave(-1)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 dark:text-slate-300 transition-colors"><ChevronDownIcon className="w-6 h-6" /></button>
                <div className="font-mono text-2xl text-slate-800 dark:text-slate-200 text-center w-24">
                    Octave: <span className="font-bold">{octave}</span>
                </div>
                <button onClick={() => changeOctave(1)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 dark:text-slate-300 transition-colors"><ChevronUpIcon className="w-6 h-6" /></button>
            </div>
        </div>
    );
};