
import React from 'react';
import { ChordNote, TuningSettings } from '../types';
import { playNote } from '../services/audio';
import { noteToFrequency } from '../services/pitch';

interface PianoKeyboardProps {
  highlightNotes: { name: string; octave: number }[];
  settings: TuningSettings;
}

// Constants for SVG rendering
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS: Record<string, string> = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' };
const KEY_WIDTH = 24;
const BLACK_KEY_WIDTH = 14;
const KEY_HEIGHT = 100;
const BLACK_KEY_HEIGHT = 60;

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ highlightNotes, settings }) => {
    // Define the range of octaves to display on the keyboard
    const octaves = [3, 4, 5]; 
    const totalWhiteKeys = octaves.length * 7;

    // Create a Set for efficient lookup of highlighted notes
    const highlightedNotesSet = new Set(highlightNotes.map(n => `${n.name}${n.octave}`));

    // Click handler to play the sound of a key
    const handleKeyClick = (noteName: string, octave: number) => {
        const freq = noteToFrequency(noteName, octave, settings);
        if (freq > 0) {
            playNote(freq);
        }
    };

    return (
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${totalWhiteKeys * KEY_WIDTH} ${KEY_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
        >
            <g>
                {/* Render White Keys */}
                {octaves.flatMap((octave, octaveIndex) =>
                    WHITE_KEYS.map((noteName, noteIndex) => {
                        const x = (octaveIndex * 7 + noteIndex) * KEY_WIDTH;
                        const isHighlighted = highlightedNotesSet.has(`${noteName}${octave}`);
                        return (
                            <rect
                                key={`${noteName}${octave}`}
                                x={x}
                                y={0}
                                width={KEY_WIDTH}
                                height={KEY_HEIGHT}
                                className={`stroke-slate-200 dark:stroke-slate-600 stroke-1 cursor-pointer transition-colors ${
                                    isHighlighted 
                                    ? 'fill-cyan-400/70 dark:fill-cyan-500/70 hover:fill-cyan-400' 
                                    : 'fill-white dark:fill-slate-800 hover:fill-slate-100 dark:hover:fill-slate-700'
                                }`}
                                onClick={() => handleKeyClick(noteName, octave)}
                            />
                        );
                    })
                )}

                {/* Render Black Keys on top of white keys */}
                {octaves.flatMap((octave, octaveIndex) =>
                    WHITE_KEYS.map((noteName, noteIndex) => {
                        // Check if the current white key has a black key after it
                        if (noteName in BLACK_KEYS) {
                            const blackNoteName = BLACK_KEYS[noteName];
                            const x = (octaveIndex * 7 + noteIndex) * KEY_WIDTH + KEY_WIDTH - (BLACK_KEY_WIDTH / 2);
                            const isHighlighted = highlightedNotesSet.has(`${blackNoteName}${octave}`);
                            return (
                                <rect
                                    key={`${blackNoteName}${octave}`}
                                    x={x}
                                    y={0}
                                    width={BLACK_KEY_WIDTH}
                                    height={BLACK_KEY_HEIGHT}
                                    rx="2" // Rounded corners for black keys
                                    className={`stroke-slate-900/50 dark:stroke-black stroke-1 cursor-pointer transition-colors ${
                                        isHighlighted
                                        ? 'fill-cyan-400 hover:fill-cyan-300'
                                        : 'fill-slate-800 dark:fill-slate-900 hover:fill-slate-700'
                                    }`}
                                    onClick={() => handleKeyClick(blackNoteName, octave)}
                                />
                            );
                        }
                        return null;
                    })
                )}
            </g>
        </svg>
    );
};