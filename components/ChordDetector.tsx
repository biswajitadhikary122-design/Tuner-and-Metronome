
import React, { useState, useEffect } from 'react';
import { useChordDetector } from '../hooks/useChordDetector';
import type { TuningSettings, ChordDetails, ChordNote, InstrumentView, InstrumentPreset, InstrumentTheory } from '../types';
import { SparklesIcon, PianoIcon, GuitarIcon, ChevronDownIcon, MicIcon, SendIcon } from './Icons';
import { PianoKeyboard } from './PianoKeyboard';
import { GuitarFretboard } from './GuitarFretboard';
import { useChordProgression } from '../hooks/useChordProgression';
import { ChordProgressionDisplay } from './ChordProgressionDisplay';
import { THEORY_CONTENT, PRESET_CATEGORIES } from '../constants';
import { getTheoryExplanation } from '../services/gemini';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChordDetectorProps {
  settings: TuningSettings;
}

const ChordNoteDisplay: React.FC<{ note: ChordNote }> = ({ note }) => {
    const inTune = Math.abs(note.cents) <= 8;
  
    const colorClass = inTune ? 'bg-green-400' : 'bg-red-500';
  
    return (
      <div className="flex flex-col items-center gap-1 font-mono">
        <p className={`text-xl ${note.isBassNote ? 'font-bold text-cyan-600 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-200'}`}>
          {note.name}<sub className="text-sm -ml-0.5">{note.octave}</sub>
        </p>
        <div className={`w-10 h-1 rounded-full ${colorClass}`}></div>
        <p className="text-xs text-slate-500">{note.cents.toFixed(0)}</p>
      </div>
    );
};

const ChordResultDisplay: React.FC<{ chord: ChordDetails, settings: TuningSettings, onClear: () => void, onAddToProgression: () => void }> = ({ chord, settings, onClear, onAddToProgression }) => {
    const [instrumentView, setInstrumentView] = useState<InstrumentView>('Piano');
    const sortedNotes = [...chord.notes].sort((a, b) => a.frequency - b.frequency);

    return (
        <div className="flex flex-col items-center gap-8 text-center animate-fade-in w-full">
            <div className="px-2">
                <p className="text-5xl sm:text-6xl font-light text-cyan-600 dark:text-cyan-300 break-words">{chord.chordName}</p>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-500">Chord Detected</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 p-4 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50">
                {sortedNotes.map((note, index) => (
                    <ChordNoteDisplay key={`${note.name}${note.octave}-${index}`} note={note} />
                ))}
            </div>

            <div className="w-full max-w-lg p-4 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300">Chord Visualization</h3>
                    <div className="flex gap-2 p-1 rounded-full bg-slate-200 dark:bg-slate-900/70">
                        {(['Piano', 'Guitar'] as InstrumentView[]).map(view => (
                            <button
                                key={view}
                                onClick={() => setInstrumentView(view)}
                                className={`p-2 rounded-full transition-colors duration-200 ${
                                    instrumentView === view
                                        ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-300 shadow'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                                aria-label={`Switch to ${view} view`}
                            >
                                {view === 'Piano' ? <PianoIcon className="w-5 h-5" /> : <GuitarIcon className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative h-48 flex items-center justify-center">
                    {instrumentView === 'Piano' 
                        ? <PianoKeyboard highlightNotes={chord.notes} settings={settings} />
                        : <GuitarFretboard highlightNotes={chord.notes} settings={settings} />
                    }
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onClear}
                    className="bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-300 font-bold py-3 px-6 rounded-full flex items-center gap-2 hover:bg-slate-500/20 transition-colors duration-300"
                >
                    Analyze Another
                </button>
                <button
                    onClick={onAddToProgression}
                    className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 font-bold py-3 px-6 rounded-full flex items-center gap-2 hover:bg-cyan-500/20 transition-colors duration-300"
                >
                    Add to Progression
                </button>
            </div>
        </div>
    );
};

const parseNoteString = (noteStr: string): { name: string; octave: number } => {
    const match = noteStr.match(/([A-G][#b]?)(-?\d+)/);
    if (!match) return { name: 'C', octave: 4 }; // Fallback
    return { name: match[1], octave: parseInt(match[2], 10) };
};

const TheoryDisplay: React.FC<{ theory: InstrumentTheory, instrument: InstrumentPreset, settings: TuningSettings }> = ({ theory, instrument, settings }) => (
    <div className="w-full max-w-lg space-y-4 animate-fade-in">
        {theory.uniqueConcepts.map((concept, i) => (
             <details key={`concept-${i}`} className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50 cursor-pointer" open={i < 1}>
                <summary className="font-bold text-lg text-slate-700 dark:text-slate-300">{concept.title}</summary>
                <p className="mt-2 text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{concept.content}</p>
            </details>
        ))}
        {theory.scales.map((scale, i) => (
            <details key={`scale-${i}`} className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50 cursor-pointer">
                <summary className="font-bold text-lg text-slate-700 dark:text-slate-300">{scale.name}</summary>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{scale.description}</p>
                <div className="relative h-32 mt-4 flex items-center justify-center">
                    {instrument === 'Piano' ? (
                        <PianoKeyboard highlightNotes={scale.notes.map(parseNoteString)} settings={settings} />
                    ) : (
                        <GuitarFretboard highlightNotes={scale.notes.map(parseNoteString)} settings={settings} />
                    )}
                </div>
            </details>
        ))}
         {theory.commonChords.map((chord, i) => (
            <details key={`chord-${i}`} className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50 cursor-pointer">
                <summary className="font-bold text-lg text-slate-700 dark:text-slate-300">{chord.name}</summary>
                 <div className="relative h-32 mt-4 flex items-center justify-center">
                    {instrument === 'Piano' ? (
                        <PianoKeyboard highlightNotes={chord.notes.map(parseNoteString)} settings={settings} />
                    ) : (
                        <GuitarFretboard highlightNotes={chord.notes.map(parseNoteString)} settings={settings} />
                    )}
                </div>
            </details>
        ))}
        {theory.scales.length === 0 && theory.commonChords.length === 0 && theory.uniqueConcepts.length === 0 && (
             <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50">
                <p className="text-center text-slate-500">Theory content for this instrument is coming soon!</p>
            </div>
        )}
    </div>
);

const TheoryAISearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setSearchError(null);
        setAnswer('');
        try {
            const result = await getTheoryExplanation(query);
            setAnswer(result);
        } catch (err) {
            setSearchError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSearching(false);
        }
    };
    
    return (
        <div className="w-full max-w-lg">
            <h2 className="text-lg sm:text-xl font-bold text-center mb-4 text-slate-700 dark:text-slate-300">Ask a Theory Question</h2>
            <form onSubmit={handleSearch} className="flex gap-2 items-center">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., What is the circle of fifths?"
                    className="flex-grow p-3 rounded-lg font-semibold border transition-colors duration-200
                               bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200
                               focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    disabled={isSearching || isListening}
                />
                {hasRecognitionSupport && (
                    <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`p-3 rounded-full transition-colors duration-200 border border-transparent ${
                            isListening
                                ? 'bg-red-500/20 text-red-500 animate-pulse'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                        aria-label={isListening ? 'Stop listening' : 'Start voice typing'}
                        disabled={isSearching}
                    >
                        <MicIcon className="w-6 h-6" />
                    </button>
                )}
                <button
                    type="submit"
                    className="p-3 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition-colors disabled:opacity-50"
                    disabled={isSearching || !query.trim()}
                    aria-label="Search"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </form>
            
            <div className="mt-4 p-4 rounded-xl bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50 min-h-[4rem]">
                {isSearching && (
                    <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
                        <div className="w-6 h-6 border-2 border-t-cyan-500 border-slate-300 dark:border-slate-600 rounded-full animate-spin"></div>
                        <span>Thinking...</span>
                    </div>
                )}
                {searchError && <p className="text-red-500 text-center">{searchError}</p>}
                {answer && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/# (.*?)\n/g, '<h3>$1</h3>').replace(/## (.*?)\n/g, '<h4>$1</h4>')}}></div>}
            </div>
        </div>
    )
}


export const ChordDetector: React.FC<ChordDetectorProps> = ({ settings }) => {
    const { status, chordDetails, error, analyze } = useChordDetector(settings);
    const { progression, addChord, removeChord, clearProgression, isPlaying, togglePlayback, currentChordIndex, bpm, setBpm } = useChordProgression();
    const [selectedInstrument, setSelectedInstrument] = useState<InstrumentPreset>('Guitar');

    const handleAddToProgression = () => {
        if (chordDetails) {
            addChord(chordDetails);
            analyze(true);
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'analyzing':
                return (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-24 h-24 border-4 border-t-cyan-500 dark:border-t-cyan-400 border-slate-300 dark:border-slate-700 rounded-full animate-spin"></div>
                        <p className="text-cyan-600 dark:text-cyan-300 text-lg">Analyzing...</p>
                        <p className="text-slate-600 dark:text-slate-500 max-w-xs">Strum a chord clearly and let it ring. The AI is listening to identify the notes.</p>
                    </div>
                );
            case 'success':
                return chordDetails ? <ChordResultDisplay chord={chordDetails} settings={settings} onClear={() => analyze(true)} onAddToProgression={handleAddToProgression} /> : null;
            case 'error':
                 return (
                    <div className="text-center flex flex-col items-center gap-6">
                        <p className="text-red-600 dark:text-red-400 max-w-xs">
                            {error || "An unknown error occurred."}
                        </p>
                        <button
                            onClick={() => analyze(true)}
                            className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 font-bold py-3 px-6 rounded-full flex items-center gap-2 hover:bg-cyan-500/20 transition-colors duration-300"
                        >
                            Try Again
                        </button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center flex flex-col items-center gap-8 w-full">
                        {/* Section 1: Live Chord Analysis */}
                        <div className="flex flex-col items-center gap-4">
                             <h2 className="text-lg sm:text-xl font-bold text-center text-slate-700 dark:text-slate-300">Live Chord Analyzer</h2>
                            <p className="text-slate-600 dark:text-slate-400 -mt-2 max-w-sm">Play a chord on your instrument, and the AI will identify it and show you how to play it.</p>
                            <button
                                onClick={() => analyze()}
                                className="bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-300 font-bold py-4 px-8 rounded-full flex items-center gap-3 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-fuchsia-500/10"
                            >
                                <SparklesIcon className="w-6 h-6" />
                                Analyze Chord with AI
                            </button>
                        </div>

                        <div className="w-full max-w-lg border-t border-slate-200 dark:border-slate-700/50"></div>

                        {/* Section 2: AI Theory Search */}
                        <TheoryAISearch />

                        <div className="w-full max-w-lg border-t border-slate-200 dark:border-slate-700/50"></div>
                        
                        {/* Section 3: Instrument Theory Library */}
                        <div className="w-full max-w-lg flex flex-col items-center gap-4">
                            <h2 className="text-lg sm:text-xl font-bold text-center text-slate-700 dark:text-slate-300">Instrument Theory Guide</h2>
                            <div className="relative w-full">
                                <select
                                    value={selectedInstrument}
                                    onChange={(e) => setSelectedInstrument(e.target.value as InstrumentPreset)}
                                    className="w-full p-3 rounded-lg font-semibold border transition-colors duration-200 appearance-none
                                            bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200
                                            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    {PRESET_CATEGORIES.map(({ category, instruments }) => (
                                        <optgroup key={category} label={category}>
                                            {instruments.map((preset) => (
                                                <option key={preset} value={preset}>
                                                    {preset}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600 dark:text-slate-400">
                                    <ChevronDownIcon className="w-5 h-5" />
                                </div>
                            </div>
                            
                            <TheoryDisplay theory={THEORY_CONTENT[selectedInstrument]} instrument={selectedInstrument} settings={settings} />
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-start w-full min-h-[400px] py-8">
            {renderContent()}
            {progression.length > 0 && (
                <ChordProgressionDisplay 
                    progression={progression}
                    isPlaying={isPlaying}
                    currentChordIndex={currentChordIndex}
                    bpm={bpm}
                    onBpmChange={setBpm}
                    onTogglePlay={togglePlayback}
                    onRemoveChord={removeChord}
                    onClear={clearProgression}
                />
            )}
        </div>
    );
};