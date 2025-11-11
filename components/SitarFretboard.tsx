import React from 'react';
import { TuningSettings } from '../types';
import { SITAR_STANDARD_TUNING, NOTE_NAMES_SHARP, NOTATION_MAPS } from '../constants';
import { playNote } from '../services/audio';
import { noteToFrequency } from '../services/pitch';

interface SitarFretboardProps {
  highlightNotes: { name: string; octave: number }[];
  settings: TuningSettings;
}

const NUM_FRETS = 16;
const FRET_WIDTH = 50;
const STRING_SPACING = 25;
const NECK_WIDTH = NUM_FRETS * FRET_WIDTH;
const NECK_HEIGHT = (SITAR_STANDARD_TUNING.length - 1) * STRING_SPACING;
const PADDING = 20;

const INLAY_FRETS = [3, 5, 7, 10, 12, 15];

export const SitarFretboard: React.FC<SitarFretboardProps> = ({ highlightNotes, settings }) => {
    const notePositions: { x: number; y: number; noteName?: string; octave?: number; isOpen?: boolean; }[] = [];
    const displayNames = NOTATION_MAPS[settings.notationSystem] || NOTATION_MAPS['English'];

    const highlightedNoteNames = new Set(highlightNotes.map(n => `${n.name}${n.octave}`));
    
    // Main strings
    SITAR_STANDARD_TUNING.forEach((openNoteMidi, stringIndex) => {
        for (let fret = 0; fret <= NUM_FRETS; fret++) {
            const currentMidi = openNoteMidi + fret;
            const octave = Math.floor(currentMidi / 12) - 1;
            const noteName = NOTE_NAMES_SHARP[currentMidi % 12];
            
            if (highlightedNoteNames.has(`${noteName}${octave}`)) {
                notePositions.push({
                    x: fret === 0 ? PADDING / 2 : (fret - 0.5) * FRET_WIDTH + PADDING,
                    y: stringIndex * STRING_SPACING + PADDING,
                    noteName,
                    octave,
                    isOpen: fret === 0,
                });
            }
        }
    });

    const handleNoteClick = (noteName: string, octave: number) => {
        const freq = noteToFrequency(noteName, octave, settings);
        if (freq > 0) {
            playNote(freq, 0.8); // Longer note for sitar sound
        }
    };

    return (
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${NECK_WIDTH + PADDING * 2} ${NECK_HEIGHT + PADDING * 2 + 30}`} // Extra height for sympathetic strings
            preserveAspectRatio="xMidYMid meet"
        >
            {/* Neck */}
            <rect
                x={PADDING}
                y={PADDING}
                width={NECK_WIDTH}
                height={NECK_HEIGHT}
                className="fill-amber-200 dark:fill-slate-800"
            />

            {/* Frets (Pardas) - represented as curved */}
            {Array.from({ length: NUM_FRETS }).map((_, i) => (
                <path
                    key={`fret-${i+1}`}
                    d={`M ${ (i + 1) * FRET_WIDTH + PADDING} ${PADDING} C ${ (i + 1) * FRET_WIDTH + PADDING - 5} ${PADDING + NECK_HEIGHT / 2}, ${ (i + 1) * FRET_WIDTH + PADDING - 5} ${PADDING + NECK_HEIGHT / 2}, ${ (i + 1) * FRET_WIDTH + PADDING} ${PADDING + NECK_HEIGHT}`}
                    className="stroke-stone-400 dark:stroke-slate-600"
                    strokeWidth={2.5}
                    fill="none"
                />
            ))}
            <line x1={PADDING} y1={PADDING} x2={PADDING} y2={PADDING + NECK_HEIGHT} className="stroke-stone-500 dark:stroke-slate-500" strokeWidth={5} />


            {/* Inlays */}
            {INLAY_FRETS.map(fret => (
                <circle
                    key={`inlay-${fret}`}
                    cx={(fret - 0.5) * FRET_WIDTH + PADDING}
                    cy={PADDING - 10}
                    r={4}
                    className="fill-stone-400/50 dark:fill-slate-600/50"
                />
            ))}
            
            {/* Main Strings */}
            {SITAR_STANDARD_TUNING.map((_, i) => (
                <line
                    key={`string-${i}`}
                    x1={PADDING}
                    y1={i * STRING_SPACING + PADDING}
                    x2={NECK_WIDTH + PADDING}
                    y2={i * STRING_SPACING + PADDING}
                    className="stroke-stone-500 dark:stroke-slate-400"
                    strokeWidth={1 + (SITAR_STANDARD_TUNING.length - 1 - i) * 0.15} // Thicker strings at top (lower pitch)
                />
            ))}

            {/* Sympathetic Strings (Taraf) visualization */}
            <rect 
                x={PADDING}
                y={NECK_HEIGHT + PADDING + 5}
                width={NECK_WIDTH}
                height={20}
                className="fill-amber-100/50 dark:fill-slate-700/50"
            />
             {Array.from({ length: 11 }).map((_, i) => (
                <line
                    key={`taraf-${i}`}
                    x1={PADDING}
                    y1={NECK_HEIGHT + PADDING + 7 + (i * 1.5)}
                    x2={NECK_WIDTH + PADDING}
                    y2={NECK_HEIGHT + PADDING + 7 + (i * 1.5)}
                    className="stroke-stone-400/70 dark:stroke-slate-500/70"
                    strokeWidth={0.5}
                />
            ))}

            {/* Note Markers */}
            {notePositions.map(({ x, y, noteName, octave, isOpen }, i) => {
                const clickHandler = (noteName && typeof octave === 'number') ? { onClick: () => handleNoteClick(noteName, octave) } : {};

                let displayNoteName = noteName;
                if(noteName) {
                    const noteIndex = NOTE_NAMES_SHARP.indexOf(noteName);
                    if(noteIndex !== -1) {
                        displayNoteName = displayNames[noteIndex].split('/')[0];
                    }
                }

                return (
                    <g key={`note-${i}`} {...clickHandler} className="cursor-pointer group">
                        <circle
                            cx={x}
                            cy={y}
                            r="10"
                            className="fill-teal-500/80 group-hover:fill-teal-400 transition-colors"
                        />
                        <text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dy=".3em"
                            className="text-xs font-bold fill-white pointer-events-none"
                        >
                            {displayNoteName}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};
