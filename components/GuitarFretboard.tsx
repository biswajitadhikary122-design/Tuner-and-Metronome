
import React from 'react';
import { ChordNote, TuningSettings } from '../types';
import { GUITAR_STANDARD_TUNING, NOTE_NAMES_SHARP } from '../constants';
import { playNote } from '../services/audio';
import { noteToFrequency } from '../services/pitch';

interface GuitarFretboardProps {
  highlightNotes: { name: string; octave: number }[];
  settings: TuningSettings;
}

const NUM_FRETS = 12;
const FRET_WIDTH = 45;
const STRING_SPACING = 25;
const NECK_WIDTH = NUM_FRETS * FRET_WIDTH;
const NECK_HEIGHT = (GUITAR_STANDARD_TUNING.length - 1) * STRING_SPACING;
const PADDING = 20;

const INLAY_FRETS = [3, 5, 7, 9, 12];

export const GuitarFretboard: React.FC<GuitarFretboardProps> = ({ highlightNotes, settings }) => {
  const highlightedNoteNames = new Set(highlightNotes.map(n => `${n.name}${n.octave}`));

  const notePositions: { x: number; y: number; noteName: string, octave: number }[] = [];

  GUITAR_STANDARD_TUNING.forEach((openNoteMidi, stringIndex) => {
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
        });
      }
    }
  });

  const handleNoteClick = (noteName: string, octave: number) => {
    const freq = noteToFrequency(noteName, octave, settings);
    if (freq > 0) {
      playNote(freq);
    }
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${NECK_WIDTH + PADDING * 2} ${NECK_HEIGHT + PADDING * 2}`}
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

      {/* Frets */}
      {Array.from({ length: NUM_FRETS + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={i * FRET_WIDTH + PADDING}
          y1={PADDING}
          x2={i * FRET_WIDTH + PADDING}
          y2={NECK_HEIGHT + PADDING}
          className="stroke-stone-400 dark:stroke-slate-600"
          strokeWidth={i === 0 ? 4 : 2} // Nut is thicker
        />
      ))}

      {/* Inlays */}
      {INLAY_FRETS.map(fret => (
        <circle
          key={`inlay-${fret}`}
          cx={(fret - 0.5) * FRET_WIDTH + PADDING}
          cy={NECK_HEIGHT / 2 + PADDING}
          r={fret === 12 ? 4 : 5}
          className="fill-stone-400/50 dark:fill-slate-600/50"
        />
      ))}
       {INLAY_FRETS.includes(12) && <circle
          key={`inlay-12-2`}
          cx={(12 - 0.5) * FRET_WIDTH + PADDING}
          cy={NECK_HEIGHT / 2 + PADDING + 30}
          r={4}
          className="fill-stone-400/50 dark:fill-slate-600/50"
        />}
         {INLAY_FRETS.includes(12) && <circle
          key={`inlay-12-3`}
          cx={(12 - 0.5) * FRET_WIDTH + PADDING}
          cy={NECK_HEIGHT / 2 + PADDING - 30}
          r={4}
          className="fill-stone-400/50 dark:fill-slate-600/50"
        />}

      {/* Strings */}
      {GUITAR_STANDARD_TUNING.map((_, i) => (
        <line
          key={`string-${i}`}
          x1={PADDING}
          y1={i * STRING_SPACING + PADDING}
          x2={NECK_WIDTH + PADDING}
          y2={i * STRING_SPACING + PADDING}
          className="stroke-stone-500 dark:stroke-slate-400"
          strokeWidth={1 + i * 0.2} // Thicker strings at the top
        />
      ))}

      {/* Note Markers */}
      {notePositions.map(({ x, y, noteName, octave }, i) => (
        <g key={`note-${i}`} onClick={() => handleNoteClick(noteName, octave)} className="cursor-pointer group">
          <circle
            cx={x}
            cy={y}
            r="10"
            className="fill-cyan-500/80 group-hover:fill-cyan-400 transition-colors"
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dy=".3em"
            className="text-xs font-bold fill-white pointer-events-none"
          >
            {noteName}
          </text>
        </g>
      ))}
    </svg>
  );
};