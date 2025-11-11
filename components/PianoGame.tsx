import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TuningSettings } from '../types';
import { PianoKeyboard } from './PianoKeyboard';
import { CloseIcon } from './Icons';
import { startSustainedNote, stopSustainedNote } from '../services/audio';
import { noteToFrequency } from '../services/pitch';

interface PianoGameProps {
    settings: TuningSettings;
    onExit: () => void;
}

const SONG_DATA = [
    { noteId: 'C4', time: 1000, duration: 500 },
    { noteId: 'C4', time: 2000, duration: 500 },
    { noteId: 'G4', time: 3000, duration: 500 },
    { noteId: 'G4', time: 4000, duration: 500 },
    { noteId: 'A4', time: 5000, duration: 500 },
    { noteId: 'A4', time: 6000, duration: 500 },
    { noteId: 'G4', time: 7000, duration: 1000 },

    { noteId: 'F4', time: 9000, duration: 500 },
    { noteId: 'F4', time: 10000, duration: 500 },
    { noteId: 'E4', time: 11000, duration: 500 },
    { noteId: 'E4', time: 12000, duration: 500 },
    { noteId: 'D4', time: 13000, duration: 500 },
    { noteId: 'D4', time: 14000, duration: 500 },
    { noteId: 'C4', time: 15000, duration: 1000 },
];

const NOTE_FALL_SPEED = 0.2; // pixels per millisecond
const HIT_ZONE_HEIGHT = 20;

type FallingNote = {
    id: number;
    noteId: string;
    duration: number;
    y: number;
    height: number;
    isHit: boolean;
};

export const PianoGame: React.FC<PianoGameProps> = ({ settings, onExit }) => {
    const [pressedKeys, setPressedKeys] = useState(new Set<string>());
    const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
    const [score, setScore] = useState(0);

    const keyPositionMapRef = useRef(new Map<string, number>());
    const gameTranslateXRef = useRef(0);
    const startTimeRef = useRef(0);
    const animationFrameIdRef = useRef<number | null>(null);

    const onKeyPress = useCallback((noteName: string, octave: number) => {
        const noteId = `${noteName}${octave}`;
        setPressedKeys(prev => new Set(prev).add(noteId));

        const freq = noteToFrequency(noteName, octave, settings);
        if (freq > 0) {
            startSustainedNote(freq, 'Parlor / Living Room Grand', noteId);
        }

        setFallingNotes(prevNotes => {
            const newNotes = [...prevNotes];
            let scoreIncreased = false;
            for (const note of newNotes) {
                if (!note.isHit && note.noteId === noteId) {
                    const keyboardY = window.innerHeight - 220;
                    if (note.y + note.height > keyboardY - HIT_ZONE_HEIGHT && note.y < keyboardY + HIT_ZONE_HEIGHT) {
                        note.isHit = true;
                        if (!scoreIncreased) {
                           setScore(s => s + 10);
                           scoreIncreased = true;
                        }
                    }
                }
            }
            return newNotes;
        });
    }, [settings]);

    const onKeyRelease = useCallback((noteName: string, octave: number) => {
        const noteId = `${noteName}${octave}`;
        setPressedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(noteId);
            return newSet;
        });
        stopSustainedNote(noteId);
    }, []);

    const gameLoop = useCallback((timestamp: number) => {
        if (startTimeRef.current === 0) {
            startTimeRef.current = timestamp;
        }
        const elapsedTime = timestamp - startTimeRef.current;
        
        const newFallingNotes: FallingNote[] = [];
        SONG_DATA.forEach((songNote, index) => {
            if (elapsedTime >= songNote.time) {
                const y = (elapsedTime - songNote.time) * NOTE_FALL_SPEED - (songNote.duration * NOTE_FALL_SPEED);
                if(y < window.innerHeight) {
                    const existingNote = fallingNotes.find(fn => fn.id === index);
                    newFallingNotes.push({
                        id: index,
                        noteId: songNote.noteId,
                        duration: songNote.duration,
                        y: y,
                        height: songNote.duration * NOTE_FALL_SPEED,
                        isHit: existingNote?.isHit || false
                    });
                }
            }
        });
        
        setFallingNotes(newFallingNotes);
        animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    }, [fallingNotes]);
    
    useEffect(() => {
        animationFrameIdRef.current = requestAnimationFrame(gameLoop);
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            stopSustainedNote(); // Stop all sounds on exit
        };
    }, [gameLoop]);

    return (
        <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center animate-fade-in z-[100]">
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm z-30">
                <h2 className="text-2xl font-bold">Piano Game</h2>
                <div className="text-2xl font-mono">Score: {score}</div>
                <button onClick={onExit} className="p-2 rounded-full hover:bg-white/10" aria-label="Exit Game">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                {fallingNotes.map(note => {
                    const x = keyPositionMapRef.current.get(note.noteId);
                    if (x === undefined) return null;

                    const isBlackKey = note.noteId.includes('#');
                    const width = isBlackKey ? 30 : 52;
                    
                    return (
                        <div
                            key={note.id}
                            className={`absolute rounded ${note.isHit ? 'bg-green-500' : 'bg-cyan-400'}`}
                            style={{
                                left: x - (width / 2),
                                top: note.y,
                                width: width,
                                height: note.height,
                                transition: 'background-color 0.2s'
                            }}
                        />
                    )
                })}
            </div>

            <div className="absolute bottom-0 left-0 w-full z-20">
                <PianoKeyboard
                    highlightNotes={[]}
                    settings={settings}
                    pressedKeys={pressedKeys}
                    onKeyPress={onKeyPress}
                    onKeyRelease={onKeyRelease}
                    keyPositionMapRef={keyPositionMapRef}
                    gameTranslateXRef={gameTranslateXRef}
                />
            </div>
        </div>
    );
};
