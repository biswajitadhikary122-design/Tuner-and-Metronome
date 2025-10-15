import React from 'react';
import type { Progression } from '../types';
import { PlayIcon, StopIcon, TrashIcon, CloseIcon } from './Icons';

interface ChordProgressionDisplayProps {
    progression: Progression;
    isPlaying: boolean;
    currentChordIndex: number | null;
    bpm: number;
    onBpmChange: (bpm: number) => void;
    onTogglePlay: () => void;
    onRemoveChord: (index: number) => void;
    onClear: () => void;
}

export const ChordProgressionDisplay: React.FC<ChordProgressionDisplayProps> = ({
    progression,
    isPlaying,
    currentChordIndex,
    bpm,
    onBpmChange,
    onTogglePlay,
    onRemoveChord,
    onClear,
}) => {
    return (
        <div className="w-full max-w-lg mt-8 p-4 rounded-xl bg-black/5 dark:bg-white/5 animate-fade-in border border-black/10 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Chord Progression</h3>
                <button
                    onClick={onClear}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded"
                    aria-label="Clear progression"
                >
                    <TrashIcon className="w-4 h-4" />
                    Clear
                </button>
            </div>

            {/* Progression List */}
            <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 min-h-[4rem]">
                {progression.map((chord, index) => (
                    <div
                        key={`${chord.chordName}-${index}`}
                        className={`relative px-4 py-2 rounded-md transition-all duration-200 ${
                            currentChordIndex === index
                                ? 'bg-cyan-500/30 text-cyan-800 dark:text-cyan-200 ring-2 ring-cyan-500'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <span className="font-semibold">{chord.chordName}</span>
                        <button
                            onClick={() => onRemoveChord(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-red-500 dark:hover:bg-red-500 transition-colors"
                            aria-label={`Remove ${chord.chordName}`}
                        >
                            <CloseIcon className="w-3 h-3" strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-4">
                <button
                    onClick={onTogglePlay}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 bg-gray-200 dark:bg-gray-800 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/10"
                    aria-label={isPlaying ? 'Stop playback' : 'Play progression'}
                >
                    {isPlaying ? <StopIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 pl-1" />}
                </button>
                <div className="flex-grow">
                    <label htmlFor="bpm-slider" className="block text-sm text-center text-gray-500 dark:text-gray-400">
                        Playback Speed: {bpm} BPM
                    </label>
                    <input
                        id="bpm-slider"
                        type="range"
                        min="60"
                        max="200"
                        step="1"
                        value={bpm}
                        onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
            </div>
        </div>
    );
};