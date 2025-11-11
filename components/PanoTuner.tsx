
import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { NoteDetails, TuningSettings } from '../types';
import { NOTATION_MAPS, NOTE_NAMES_SHARP } from '../constants';

const A4_MIDI = 69;

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

export const PanoTuner: React.FC<{ note: NoteDetails | null, settings: TuningSettings }> = ({ note, settings }) => {
    const noteActive = note !== null;
    const cents = note?.cents ?? 0;
    const inTune = Math.abs(cents) <= settings.tuningTolerance;

    let targetRotationAngle = 0;
    if (noteActive) {
        // Calculate a continuous MIDI-like number based on frequency
        const noteFloat = A4_MIDI + 12 * Math.log2(note.frequency / settings.a4);
        // Apply transposition for display key
        const transposedNoteFloat = noteFloat + settings.transposition;
        // Calculate the continuous index (0-11) for rotation
        const continuousNoteIndex = (transposedNoteFloat % 12 + 12) % 12;
        // Each note segment is 30 degrees. The rotation is negative to move clockwise.
        targetRotationAngle = -continuousNoteIndex * 30;
    }
    
    const { rotation } = useSpring({
        rotation: targetRotationAngle,
        config: { mass: 1, tension: 170, friction: 26 },
    });

    const displayNames = NOTATION_MAPS[settings.notationSystem];

    let indicatorColor = settings.darkMode ? '#475569' : '#94a3b8'; // Default color
    let glowFilter = '';
    if (noteActive) {
        if (inTune) {
            indicatorColor = '#22c55e'; // green-500
            glowFilter = 'url(#pano-glow-green)';
        } else {
            indicatorColor = '#ef4444'; // red-500
            glowFilter = 'url(#pano-glow-red)';
        }
    }
    const indicatorSpring = useSpring({ color: indicatorColor, config: { duration: 200 } });

    return (
        <div className="w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center py-4" aria-label="Pano Tuner">
            <svg viewBox="0 0 200 200" className="w-full h-full aspect-square overflow-visible">
                <defs>
                    <filter id="pano-glow-green">
                        <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#22c55e" />
                    </filter>
                    <filter id="pano-glow-red">
                        <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ef4444" />
                    </filter>
                </defs>

                {/* Main rotating wheel */}
                <animated.g transform={rotation.to(r => `rotate(${r} 100 100)`)}>
                    <circle cx="100" cy="100" r="99" className="fill-slate-100 dark:fill-slate-800/50 stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" />
                    {displayNames.map((noteName, i) => {
                        const angle = i * 30;
                        const p1 = polarToCartesian(100, 100, 99, angle);
                        const p2 = polarToCartesian(100, 100, 89, angle);
                        const textPos = polarToCartesian(100, 100, 78, angle);
                        const noteIsSharp = NOTE_NAMES_SHARP[i].includes('#');

                        return (
                            <g key={i}>
                                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />
                                <text
                                    x={textPos.x}
                                    y={textPos.y}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className={`font-semibold pointer-events-none ${
                                        noteIsSharp ? 'text-sm fill-slate-500 dark:fill-slate-400' : 'text-base fill-black dark:fill-white'
                                    }`}
                                >
                                    {noteName.split('/')[0]}
                                </text>
                            </g>
                        );
                    })}
                </animated.g>
                
                {/* Static indicator and cents marks */}
                <g>
                    <animated.path d="M 100 2 L 96 12 L 104 12 Z" style={{fill: indicatorSpring.color}} filter={glowFilter} />
                    {[-40, -30, -20, -10, 10, 20, 30, 40].map(c => {
                        const angle = (c / 50) * 15; // Map +/- 50 cents to +/- 15 deg
                        const p1 = polarToCartesian(100, 100, 99, angle);
                        const p2 = polarToCartesian(100, 100, 94, angle);
                        return <line key={c} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="stroke-slate-400/70 dark:stroke-slate-500/70" strokeWidth="1" />
                    })}
                </g>
            </svg>
        </div>
    );
};
