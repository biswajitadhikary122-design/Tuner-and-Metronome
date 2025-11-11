import React from 'react';

interface ChordDetectorProps {
    chord: string | null;
}

export const ChordDetector: React.FC<ChordDetectorProps> = ({ chord }) => {
    // Parse the chord name, e.g., "C#maj7" -> root: "C#", quality: "maj7"
    const match = chord ? chord.match(/([A-G]#?b?)(.*)/) : null;
    const root = match ? match[1] : null;
    const quality = match ? match[2] : null;

    return (
        <div className="w-full card p-4 text-center transition-all duration-300 h-28 flex flex-col justify-center">
            {root ? (
                <div className="animate-fade-in">
                    <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-slate-800 dark:text-slate-100">{root}</span>
                        <span className="text-2xl font-semibold text-slate-600 dark:text-slate-300">{quality}</span>
                    </div>
                    <p className="text-xs font-semibold text-accent tracking-wider uppercase">Detected Chord</p>
                </div>
            ) : (
                <p className="text-lg text-slate-500 dark:text-slate-400">Play a chord...</p>
            )}
        </div>
    );
};
