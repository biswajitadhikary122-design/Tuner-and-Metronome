
import React, { useState } from 'react';
import type { TuningSettings, InstrumentView } from '../types';
import { PianoKeyboard } from './PianoKeyboard';
import { GuitarFretboard } from './GuitarFretboard';
import { PlayIcon, ChevronDownIcon, PianoIcon, GuitarIcon } from './Icons';
import { playNote } from '../services/audio';
import { noteToFrequency } from '../services/pitch';
import { NOTE_NAMES_SHARP, NOTATION_MAPS, ALL_SCALES, SCALE_HIERARCHY } from '../constants';
import { ScaleSelectionModal } from './ScaleSelectionModal';


const playSequence = (notes: string[], settings: TuningSettings) => {
    let delay = 0;
    notes.forEach(note => {
        const noteName = note.match(/[A-G]#?/)?.[0] || '';
        const octave = parseInt(note.match(/\d/)?.[0] || '4', 10);
        const freq = noteToFrequency(noteName, octave, settings);
        if (freq > 0) {
            setTimeout(() => playNote(freq, 0.4), delay);
            delay += 250; // ms between notes
        }
    });
};

const ROOT_NOTES = NOTE_NAMES_SHARP;

const getScaleNotes = (rootNote: string, scaleType: string, startOctave: number = 4): { name: string, octave: number }[] => {
    const rootIndex = ROOT_NOTES.indexOf(rootNote);
    if (rootIndex === -1) return [];

    const scale = ALL_SCALES[scaleType];
    if (!scale) return [];

    const notes: { name: string, octave: number }[] = [];
    let lastNoteIndex = -1;

    scale.intervals.forEach(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        let currentOctave = startOctave;
        if (notes.length > 0 && noteIndex < lastNoteIndex) {
            currentOctave++;
        }
        notes.push({ name: ROOT_NOTES[noteIndex], octave: currentOctave });
        lastNoteIndex = noteIndex;
    });

    // Add the octave note at the end for playback
    notes.push({ name: rootNote, octave: startOctave + 1 });

    return notes;
};

export const ScaleFinder: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rootNote, setRootNote] = useState('C');
    const [scaleType, setScaleType] = useState('major');
    const [instrumentView, setInstrumentView] = useState<InstrumentView>('Piano');

    const [settings] = useState<TuningSettings>(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return {
            a4: 440, useSharps: true, smoothing: 0.5, preset: 'Piano',
            debugMode: false,
            darkMode: savedDarkMode !== null ? JSON.parse(savedDarkMode) : false,
            transposition: 0, temperament: 'Equal',
            notationSystem: 'English', tuningTolerance: 5,
            targetFrequency: 440,
        };
    });

    const displayNames = NOTATION_MAPS[settings.notationSystem] || NOTATION_MAPS['English'];

    const handleSelectScale = (newScaleType: string) => {
        setScaleType(newScaleType);
        setIsModalOpen(false);
    };

    const scaleNotesWithOctave = getScaleNotes(rootNote, scaleType);
    const scaleNotesForPlayback = scaleNotesWithOctave.map(n => `${n.name}${n.octave}`);

    const handlePlayScale = () => {
        playSequence(scaleNotesForPlayback, settings);
    };

    const rootNoteIndex = ROOT_NOTES.indexOf(rootNote);
    const displayRootNote = rootNoteIndex !== -1 ? displayNames[rootNoteIndex].split('/')[0] : rootNote;
    const displayedScaleNotes = scaleNotesWithOctave.slice(0, -1).map(n => {
        const index = ROOT_NOTES.indexOf(n.name);
        return index !== -1 ? displayNames[index].split('/')[0] : n.name;
    }).join(' - ');


    return (
        <div className="w-full max-w-5xl flex flex-col items-center gap-4 animate-fade-in-up">
             <ScaleSelectionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelectScale}
            />
            <div className="w-full p-6 card">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="root-note-select" className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Root Note</label>
                        <div className="relative">
                            <select
                                id="root-note-select"
                                value={rootNote}
                                onChange={(e) => setRootNote(e.target.value)}
                                className="w-full p-2.5 rounded-md font-semibold border transition-colors duration-200 appearance-none bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                {ROOT_NOTES.map((englishName, index) => <option key={englishName} value={englishName}>{displayNames[index].split('/')[0]}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><ChevronDownIcon className="w-5 h-5" /></div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="scale-type-button" className="block text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">Scale Type</label>
                        <button
                            id="scale-type-button"
                            onClick={() => setIsModalOpen(true)}
                            className="w-full text-left p-2.5 rounded-md font-semibold border transition-colors duration-200 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/60 flex justify-between items-center"
                        >
                           <span className="truncate">{ALL_SCALES[scaleType]?.name || 'Select Scale'}</span>
                           <ChevronDownIcon className="w-5 h-5 flex-shrink-0 text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <h3 className="text-xl sm:text-2xl font-bold">{displayRootNote} {ALL_SCALES[scaleType]?.name}</h3>
                    <button onClick={handlePlayScale} disabled={!scaleType} className="p-2 rounded-full bg-accent/20 hover:bg-accent/30 text-accent disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlayIcon className="w-6 h-6 pl-0.5" />
                    </button>
                </div>
                <p className="font-mono text-center text-lg mt-2 text-slate-500 dark:text-slate-400 h-7 overflow-x-auto no-scrollbar">
                    {scaleType ? displayedScaleNotes : ''}
                </p>
            </div>

            <div className="w-full p-4 card">
                <div className="w-full max-w-xs mx-auto mb-4">
                    <div className="segmented-control w-full">
                        <button onClick={() => setInstrumentView('Piano')} className={`w-1/2 flex justify-center items-center gap-2 ${instrumentView === 'Piano' ? 'active' : ''}`}><PianoIcon className="w-5 h-5" /> Piano</button>
                        <button onClick={() => setInstrumentView('Guitar')} className={`w-1/2 flex justify-center items-center gap-2 ${instrumentView === 'Guitar' ? 'active' : ''}`}><GuitarIcon className="w-5 h-5" /> Guitar</button>
                    </div>
                </div>
                 {instrumentView === 'Piano' ? (
                    <PianoKeyboard highlightNotes={scaleNotesWithOctave} settings={settings} />
                ) : (
                    <GuitarFretboard highlightNotes={scaleNotesWithOctave} settings={settings} />
                )}
            </div>
        </div>
    );
};
