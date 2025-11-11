
import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import type { NoteDetails, TuningSettings } from '../types';
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from '../services/musicConstants';

interface StrobeTunerProps {
  note: NoteDetails | null;
  settings: TuningSettings;
}

const A4_MIDI = 69;

const getNoteName = (midiNumber: number, useSharps: boolean): string => {
    const noteNames = useSharps ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;
    return noteNames[Math.round(midiNumber) % 12];
};

const frequencyToMidi = (freq: number, a4: number): number => {
    return A4_MIDI + 12 * Math.log2(freq / a4);
}

export const StrobeTuner: React.FC<StrobeTunerProps> = ({ note, settings }) => {
    const noteActive = note !== null;
    const cents = note?.cents ?? 0;
    
    let centerNoteMidi = A4_MIDI;
    if (note) {
        centerNoteMidi = frequencyToMidi(note.frequency, settings.a4);
    }
    const roundedCenterNoteMidi = Math.round(centerNoteMidi);

    const notesToShow = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map(offset => {
        const midi = roundedCenterNoteMidi + offset;
        return {
            midi: midi,
            name: getNoteName(midi, settings.useSharps)
        }
    });

    const noteWidthPercentage = 20; // Each note takes up 20% of the viewport width.

    // A deviation of 50 cents means the note band shifts by half a note width.
    const centsOffsetPercentage = noteActive ? (cents / 50) * (noteWidthPercentage / 2) : 0;
    
    // The initial position is to center the middle note (index 4).
    // The strip has 9 notes, viewport shows 5. We want to hide the first 2.
    // So we shift left by 2 note widths.
    const initialOffset = -2 * noteWidthPercentage;
    const totalOffset = initialOffset - centsOffsetPercentage;
    
    const { transform } = useSpring({
        transform: `translateX(${totalOffset}%)`,
        config: { mass: 1, tension: 280, friction: 40 }
    });

    // For the top cents meter
    const CENTS_RANGE = 30; // The scale now goes from -30 to +30
    const centsClamped = Math.max(-CENTS_RANGE, Math.min(CENTS_RANGE, cents));
    const centsPositionPercent = 50 + (centsClamped / CENTS_RANGE) * 50;

    const { left: centsIndicatorLeft } = useSpring({
        left: `${noteActive ? centsPositionPercent : 50}%`,
        config: { mass: 1, tension: 280, friction: 40 }
    });


    return (
        <div className="w-full min-h-[300px] py-4 flex items-center justify-center">
            <div 
              className="w-full max-w-lg rounded-lg shadow-2xl overflow-hidden p-2 bg-gradient-to-b from-yellow-700 via-yellow-800 to-yellow-900" 
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
                <div className="bg-black/40 rounded-md p-2 border border-black/50">
                    {/* Cents Meter */}
                    <div className="relative h-6 bg-gray-800/50 rounded-sm mb-2 border border-black/50 shadow-inner">
                        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1 text-gray-300 text-xs">
                            <span className="font-bold">-30</span>
                            <span className="font-bold">+30</span>
                        </div>
                        {/* Green in-tune zone (-10 to +10) */}
                        <div 
                          className="absolute h-full bg-green-500/30"
                          style={{
                              width: '33.33%', // -10 to +10 on a -30 to +30 scale
                              left: '33.33%',
                          }}
                        />
                        {/* Ticks and labels */}
                        {[-20, -10, 10, 20].map(c => {
                             const pos = 50 + (c / CENTS_RANGE) * 50;
                             return <div key={c} className="absolute w-px h-2 top-1/2 -translate-y-1/2 bg-gray-400" style={{ left: `${pos}%` }} />
                        })}
                        <div className="absolute w-px h-4 top-1/2 -translate-y-1/2 bg-gray-400 left-1/2" />
                        
                        <animated.div 
                          className="absolute top-0 h-full w-0.5 bg-red-500 shadow-lg" 
                          style={{ 
                              left: centsIndicatorLeft, 
                              boxShadow: '0 0 5px #ef4444'
                          }} 
                        />
                    </div>

                    {/* Note Display */}
                    <div className="relative h-20 bg-gradient-to-b from-gray-200 to-gray-50 rounded-sm overflow-hidden shadow-inner">
                        {/* Center Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-red-500 z-20 shadow-lg" />
                        
                        <animated.div className="absolute top-0 left-0 h-full flex" style={{ width: `${notesToShow.length * noteWidthPercentage}%`, transform }}>
                           {notesToShow.map(({ name, midi }) => (
                               <div key={midi} className="h-full flex justify-center items-center text-5xl font-extrabold text-black border-r border-gray-300" style={{ flexBasis: `${100 / notesToShow.length}%` }}>
                                   <span className="relative" dangerouslySetInnerHTML={{ __html: name.replace('#', '<sup class="text-3xl">♯</sup>').replace('b', '<sup class="text-3xl">♭</sup>') }} />
                               </div>
                           ))}
                        </animated.div>

                        {/* Ticks */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                             {[-2, -1, 0, 1, 2].map(i => {
                                const pos = 50 + i * 20; // 5 notes visible, 20% width each
                                return (
                                    <React.Fragment key={i}>
                                        <div className="absolute bottom-0 h-4 w-px bg-gray-500" style={{ left: `${pos}%` }} />
                                        {/* smaller ticks */}
                                        <div className="absolute bottom-0 h-2 w-px bg-gray-500" style={{ left: `${pos - 10}%` }} />
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
