import React, { useState } from 'react';
import { playNote } from '../services/audio';
import { noteToFrequency } from '../services/pitch';
import { PianoKeyboard } from './PianoKeyboard';
import { GuitarFretboard } from './GuitarFretboard';
import { TuningSettings, InstrumentPreset } from '../types';
import { PlayIcon, ChevronDownIcon } from './Icons';
import { PRESET_CATEGORIES, THEORY_CONTENT } from '../constants';

const THEORY_SECTIONS = [
    {
        title: "🎵 The Musical Alphabet & Notes",
        content: `Music is built on a simple 7-letter alphabet: **A, B, C, D, E, F, G**. After G, it repeats.\n\n**The Staff:** Music is written on a 5-line staff. Each line and space represents a note.\n\n**Pitch:** How high or low a note sounds. Notes higher on the staff are higher in pitch.\n\n**Sharps (♯) & Flats (♭):** These symbols, called accidentals, alter a note's pitch.\n- A **sharp (♯)** raises a note by a half-step (e.g., C to C♯).\n- A **flat (♭)** lowers a note by a half-step (e.g., B to B♭).\n\nOn a piano, C♯ is the same black key as D♭. This is called an **enharmonic equivalent**.`
    },
    {
        title: "🎹 Scales & Keys",
        content: `A **scale** is a series of notes played in a specific order.\n\n**Major Scales (Happy Sound):** Built with a pattern of whole (W) and half (H) steps: **W-W-H-W-W-W-H**.\nA half step is the smallest interval (e.g., C to C♯). A whole step is two half steps (e.g., C to D).\n\n**Minor Scales (Sad/Dramatic Sound):** The natural minor scale pattern is: **W-H-W-W-H-W-W**.\n\n**Key Signature:** The sharps or flats shown at the beginning of a piece of music. They tell you which notes to play sharp or flat throughout the piece.`
    },
    {
        title: "🎸 Chords & Harmony",
        content: `A **chord** is three or more notes played at the same time. The most basic chords are **triads** (3 notes).\n\n**Building a Triad:** Stack two "thirds" on top of a root note.\n\n**Chord Progressions:** A series of chords played in a sequence. Most pop, rock, and folk music is built on common chord progressions. A very famous one is:\n**I - V - vi - IV**\nIn the key of C Major, this would be: **C Major - G Major - A Minor - F Major**.`
    },
    {
        title: "🕒 Rhythm & Timing",
        content: `Rhythm is the pattern of sounds and silences in time.\n\n**Note Values:** Tell you how long to hold a note (Whole, Half, Quarter, Eighth).\n\n**Time Signature:** The two numbers at the start of the music (e.g., 4/4).\n- **Top Number:** How many beats are in each measure.\n- **Bottom Number:** What kind of note gets one beat.`
    }
];

const INTERACTIVE_EXAMPLES = [
    { title: 'C Major Scale', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
    { title: 'C Major Triad', notes: ['C4', 'E4', 'G4'] },
    { title: 'C Minor Triad', notes: ['C4', 'D#4', 'G4'] }
];

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

interface InteractiveExampleProps {
    title: string;
    notes: string[];
    settings: TuningSettings;
    instrument?: InstrumentPreset;
    positions?: { string: number; fret: number | 'x' | 'o' }[];
}

const InteractiveExample: React.FC<InteractiveExampleProps> = ({ title, notes, settings, instrument = 'Piano', positions }) => {
    const highlightableNotes = notes.map(n => ({ name: n.match(/[A-G]#?/)?.[0] || '', octave: parseInt(n.match(/\d/)?.[0] || '4', 10) }));

    return (
        <div className="w-full p-4 card">
            <div className="flex justify-between items-center">
                <h4 className="text-xl font-bold">{title}</h4>
                <button onClick={() => playSequence(notes, settings)} className="p-2 rounded-full bg-accent/20 hover:bg-accent/30 text-accent">
                    <PlayIcon className="w-5 h-5 pl-0.5" />
                </button>
            </div>
            <div className="mt-4">
                 {(instrument === 'Guitar') && positions ? (
                    <GuitarFretboard highlightNotes={[]} settings={settings} positions={positions} />
                ) : (
                    <PianoKeyboard highlightNotes={highlightableNotes} settings={settings} />
                )}
            </div>
        </div>
    );
};


export const TheoryGuide: React.FC = () => {
    const [settings] = useState<TuningSettings>(() => {
      const savedDarkMode = localStorage.getItem('darkMode');
      return {
        a4: 440, useSharps: true, smoothing: 0.5, preset: 'Piano',
        debugMode: false, debugWaveform: false, timbreVisualizer: false,
        darkMode: savedDarkMode !== null ? JSON.parse(savedDarkMode) : false,
        voiceFeedback: false, transposition: 0, temperament: 'Equal',
        notationSystem: 'English', tuningTolerance: 5,
        visualizerMode: 'orb',
        targetFrequency: 440,
      };
    });

    const [selectedInstrument, setSelectedInstrument] = useState<InstrumentPreset | 'General'>('General');

    const instrumentOptions = PRESET_CATEGORIES
        .filter(cat => cat.category !== 'General')
        .flatMap(cat => cat.instruments);
    
    return (
        <div className={`w-full space-y-4 animate-fade-in-up transition-all duration-300 ${selectedInstrument !== 'General' ? 'max-w-5xl' : 'max-w-3xl'}`}>
             <h2 className="text-xl sm:text-2xl font-bold text-center">Beginner's Theory Guide</h2>
             
              <div className="w-full max-w-sm mx-auto">
                 <label htmlFor="instrument-guide-select" className="sr-only">Select an Instrument Guide</label>
                 <div className="relative">
                    <select
                        id="instrument-guide-select"
                        value={selectedInstrument}
                        onChange={(e) => setSelectedInstrument(e.target.value as InstrumentPreset | 'General')}
                        className="w-full p-2.5 rounded-md font-semibold border transition-colors duration-200 appearance-none bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-accent text-center"
                    >
                        <option value="General">General Music Theory</option>
                        {instrumentOptions.map(instrument => (
                            <option key={instrument} value={instrument}>{instrument} Guide</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <ChevronDownIcon className="w-5 h-5" />
                    </div>
                </div>
             </div>
             
             {selectedInstrument === 'General' ? (
                <>
                    {THEORY_SECTIONS.map((section, i) => (
                        <details key={i} className="accordion-card" open={i === 0}>
                            <summary className="text-xl group-hover:text-accent transition-colors">
                                {section.title}
                                <ChevronDownIcon className="w-5 h-5 text-slate-400 transform transition-transform duration-200 group-open:rotate-180" />
                            </summary>
                            <div className="accordion-content">
                                <p className="mt-2 text-slate-600 dark:text-slate-300 whitespace-pre-wrap pt-2">{section.content}</p>
                            </div>
                        </details>
                    ))}
                    <h3 className="text-xl sm:text-2xl font-bold text-center pt-4">Interactive Examples</h3>
                    {INTERACTIVE_EXAMPLES.map((example) => (
                        <InteractiveExample key={example.title} title={example.title} notes={example.notes} settings={settings} />
                    ))}
                </>
             ) : (
                 <div className="space-y-4">
                    {THEORY_CONTENT[selectedInstrument]?.uniqueConcepts.map((concept, i) => (
                        <details key={i} className="accordion-card" open={i===0}>
                            <summary className="text-xl group-hover:text-accent transition-colors">
                                {concept.title}
                                 <ChevronDownIcon className="w-5 h-5 text-slate-400 transform transition-transform duration-200 group-open:rotate-180" />
                            </summary>
                            <div className="accordion-content">
                                <p className="mt-2 text-slate-600 dark:text-slate-300 whitespace-pre-wrap pt-2">{concept.content}</p>
                            </div>
                        </details>
                    ))}

                    {THEORY_CONTENT[selectedInstrument]?.scales.length > 0 && (
                        <>
                            <h3 className="text-xl sm:text-2xl font-bold text-center pt-4">Common Scales</h3>
                            {THEORY_CONTENT[selectedInstrument].scales.map(scale => (
                                <InteractiveExample key={scale.name} title={scale.name} notes={scale.notes} settings={settings} instrument={selectedInstrument} />
                            ))}
                        </>
                    )}

                    {THEORY_CONTENT[selectedInstrument]?.commonChords.length > 0 && (
                        <>
                            <h3 className="text-xl sm:text-2xl font-bold text-center pt-4">Common Chords</h3>
                            {THEORY_CONTENT[selectedInstrument].commonChords.map(chord => (
                                <InteractiveExample key={chord.name} title={chord.name} notes={chord.notes} settings={settings} instrument={selectedInstrument} positions={chord.positions} />
                            ))}
                        </>
                    )}
                 </div>
             )}
        </div>
    );
};