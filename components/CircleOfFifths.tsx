
import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { startSustainedNote, stopSustainedNote } from '../services/audio';
import { TuningSettings } from '../types';
import { noteToFrequency } from '../services/pitch';
import { NOTATION_MAPS, NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from '../constants';

interface CircleOfFifthsProps {
  settings: TuningSettings;
}

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

const KEY_DATA = [
    // C Major
    { name: 'C', sharps: 0, flats: 0, chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'], progressions: ['I-V-vi-IV (C-G-Am-F)', 'ii-V-I (Dm-G-C)'] },
    // G Major
    { name: 'G', sharps: 1, flats: 0, chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'], progressions: ['I-V-vi-IV (G-D-Em-C)', 'ii-V-I (Am-D-G)'] },
    // D Major
    { name: 'D', sharps: 2, flats: 0, chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'], progressions: ['I-V-vi-IV (D-A-Bm-G)', 'ii-V-I (Em-A-D)'] },
    // A Major
    { name: 'A', sharps: 3, flats: 0, chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'], progressions: ['I-V-vi-IV (A-E-F#m-D)', 'ii-V-I (Bm-E-A)'] },
    // E Major
    { name: 'E', sharps: 4, flats: 0, chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'], progressions: ['I-V-vi-IV (E-B-C#m-A)', 'ii-V-I (F#m-B-E)'] },
    // B Major
    { name: 'B', sharps: 5, flats: 0, chords: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'], progressions: ['I-V-vi-IV (B-F#-G#m-E)', 'ii-V-I (C#m-F#-B)'] },
    // F# Major / Gb Major
    { name: 'F#', sharps: 6, flats: 0, chords: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'], progressions: ['I-V-vi-IV (F#-C#-D#m-B)', 'ii-V-I (G#m-C#-F#)'] },
    // Db Major / C# Major
    { name: 'Db', sharps: 0, flats: 5, chords: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'], progressions: ['I-V-vi-IV (Db-Ab-Bbm-Gb)', 'ii-V-I (Ebm-Ab-Db)'] },
    // Ab Major
    { name: 'Ab', sharps: 0, flats: 4, chords: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'], progressions: ['I-V-vi-IV (Ab-Eb-Fm-Db)', 'ii-V-I (Bbm-Eb-Ab)'] },
    // Eb Major
    { name: 'Eb', sharps: 0, flats: 3, chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'], progressions: ['I-V-vi-IV (Eb-Bb-Cm-Ab)', 'ii-V-I (Fm-Bb-Eb)'] },
    // Bb Major
    { name: 'Bb', sharps: 0, flats: 2, chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'], progressions: ['I-V-vi-IV (Bb-F-Gm-Eb)', 'ii-V-I (Cm-F-Bb)'] },
    // F Major
    { name: 'F', sharps: 0, flats: 1, chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'], progressions: ['I-V-vi-IV (F-C-Dm-Bb)', 'ii-V-I (Gm-C-F)'] },
];

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
    const largeArcFlag = '0';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} L ${x} ${y} Z`;
};

const Segment: React.FC<{
    index: number;
    majorKeyName: string;
    minorKeyName: string;
    isSelected: boolean;
    isDominant: boolean;
    isSubdominant: boolean;
    onPress: () => void;
    onRelease: () => void;
}> = ({ index, majorKeyName, minorKeyName, isSelected, isDominant, isSubdominant, onPress, onRelease }) => {
    const anglePerSegment = 30;
    const startAngle = index * anglePerSegment - (anglePerSegment / 2);
    const endAngle = startAngle + anglePerSegment;
    
    const majorKeyTextPos = polarToCartesian(100, 100, 80, index * anglePerSegment);
    const minorKeyTextPos = polarToCartesian(100, 100, 58, index * anglePerSegment);

    const { scale } = useSpring({
        scale: isSelected || isDominant || isSubdominant ? 1.03 : 1,
        config: { tension: 400, friction: 15 }
    });

    let fillClass = 'fill-slate-100 dark:fill-slate-800 group-hover:fill-accent/20';
    
    if (isSelected) {
        fillClass = 'fill-accent';
    } else if (isDominant) {
        fillClass = 'fill-accent/60';
    } else if (isSubdominant) {
        fillClass = 'fill-accent/40';
    }

    let majorKeyTextColor = 'text-slate-800 dark:text-slate-200';
    let minorKeyTextColor = 'text-slate-500 dark:text-slate-400';

    if (isSelected) {
        majorKeyTextColor = 'text-white';
        minorKeyTextColor = 'text-white/80';
    }
    
    return (
        <animated.g
            onMouseDown={onPress}
            onMouseUp={onRelease}
            onMouseLeave={onRelease}
            onTouchStart={onPress}
            onTouchEnd={onRelease}
            className="cursor-pointer group"
            style={{ transformOrigin: '100px 100px', scale }}
        >
            <path
                d={describeArc(100, 100, 95, startAngle, endAngle)}
                className={`transition-colors duration-200 stroke-2 stroke-white dark:stroke-slate-900 ${fillClass}`}
            />
            <text
                x={majorKeyTextPos.x}
                y={majorKeyTextPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-lg font-bold pointer-events-none transition-colors ${majorKeyTextColor}`}
            >
                {majorKeyName}
            </text>
            <text
                x={minorKeyTextPos.x}
                y={minorKeyTextPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-base font-medium pointer-events-none transition-colors ${minorKeyTextColor}`}
            >
                {minorKeyName}
            </text>
        </animated.g>
    );
}

const KeyInfoPanel: React.FC<{ selectedKeyIndex: number | null, displayMinorKey: string | null }> = ({ selectedKeyIndex, displayMinorKey }) => {
    const data = selectedKeyIndex !== null ? KEY_DATA[selectedKeyIndex] : null;

    const springProps = useSpring({
        opacity: data ? 1 : 0,
        transform: data ? 'translateY(0px)' : 'translateY(10px)',
        config: { tension: 300, friction: 30 },
    });
    
    if (!data) {
        return <div className="text-sm text-center text-slate-500 dark:text-slate-400 h-8 flex items-center justify-center">Click a key to explore relationships.</div>;
    }

    const keySignature = data.sharps > 0 
        ? `${data.sharps} Sharp${data.sharps > 1 ? 's' : ''}`
        : `${data.flats} Flat${data.flats > 1 ? 's' : ''}`;

    return (
        <animated.div style={springProps} className="w-full text-sm text-left space-y-3 text-slate-700 dark:text-slate-200">
            <div className="flex justify-between items-baseline border-b border-slate-200 dark:border-slate-600 pb-1">
                <span className="font-bold">Key Signature:</span>
                <span className="font-mono">{keySignature}</span>
            </div>
            <div className="flex justify-between items-baseline">
                 <span className="font-bold">Relative Minor:</span>
                <span className="font-mono text-accent">{displayMinorKey}</span>
            </div>
            <div>
                <p className="font-bold mb-1">Primary Chords:</p>
                <p className="font-mono text-center leading-relaxed text-sm">{data.chords.join(' - ')}</p>
            </div>
            <div>
                 <p className="font-bold mb-1">Common Progressions:</p>
                 <ul className="list-disc list-inside font-mono text-left text-sm space-y-1">
                     {data.progressions.map(p => <li key={p}>{p}</li>)}
                 </ul>
            </div>
        </animated.div>
    );
};

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ settings }) => {
    const [selectedKeyIndex, setSelectedKeyIndex] = useState<number | null>(0);
    const activeNoteIdsRef = useRef<Set<string>>(new Set());

    const displayNames = NOTATION_MAPS[settings.notationSystem] || NOTATION_MAPS['English'];
    
    const translateNote = (note: string) => {
        const index = NOTE_NAMES_SHARP.indexOf(note) !== -1 
            ? NOTE_NAMES_SHARP.indexOf(note) 
            : NOTE_NAMES_FLAT.indexOf(note);
        return index !== -1 ? displayNames[index].split('/')[0] : note;
    };

    const displayMajorKeys = MAJOR_KEYS.map(translateNote);
    const displayMinorKeys = MINOR_KEYS.map(key => `${translateNote(key.replace('m', ''))}m`);


    const handlePress = (index: number) => {
        setSelectedKeyIndex(index);
        const keyName = MAJOR_KEYS[index];
        const freq = noteToFrequency(keyName, 4, settings);
        const noteId = `cof-${keyName}`;
        
        if (activeNoteIdsRef.current.has(noteId)) {
            stopSustainedNote(noteId);
            activeNoteIdsRef.current.delete(noteId);
        } else if (freq > 0) {
            startSustainedNote(freq, 'Parlor / Living Room Grand', noteId);
            activeNoteIdsRef.current.add(noteId);
        }
    };

    const handleRelease = () => {
        // Do nothing on release, let notes sustain until toggled off or component unmounts
    };

    useEffect(() => {
        return () => {
            activeNoteIdsRef.current.forEach(noteId => stopSustainedNote(noteId));
            activeNoteIdsRef.current.clear();
        }
    }, []);


    return (
        <div className="w-full h-full flex flex-col lg:flex-row items-center justify-start lg:justify-center gap-4 lg:gap-8 p-4 card animate-fade-in-up">
            <svg viewBox="0 0 200 200" className="w-full max-w-[256px] lg:max-w-xs h-auto flex-shrink-0">
                <circle cx="100" cy="100" r="95" className="fill-transparent" />
                {MAJOR_KEYS.map((_, index) => {
                    const isSelected = selectedKeyIndex === index;
                    const isSubdominant = selectedKeyIndex !== null && index === (selectedKeyIndex + 11) % 12;
                    const isDominant = selectedKeyIndex !== null && index === (selectedKeyIndex + 1) % 12;
                    
                    return (
                       <Segment
                            key={index}
                            index={index}
                            majorKeyName={displayMajorKeys[index]}
                            minorKeyName={displayMinorKeys[index]}
                            isSelected={isSelected}
                            isDominant={isDominant}
                            isSubdominant={isSubdominant}
                            onPress={() => handlePress(index)}
                            onRelease={handleRelease}
                        />
                    );
                })}
                 <circle cx="100" cy="100" r="45" className="fill-white dark:fill-slate-800/80 stroke-slate-200 dark:stroke-slate-700" />
            </svg>
             <div className="w-full lg:w-96 flex-grow flex flex-col items-center">
                <KeyInfoPanel selectedKeyIndex={selectedKeyIndex} displayMinorKey={selectedKeyIndex !== null ? displayMinorKeys[selectedKeyIndex] : null}/>
            </div>
        </div>
    );
};
