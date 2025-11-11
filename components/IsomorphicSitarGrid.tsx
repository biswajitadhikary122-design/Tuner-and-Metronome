
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TuningSettings } from '../types';
import { NOTATION_MAPS, NOTE_NAMES_SHARP } from '../constants';
import { startSustainedNote, stopSustainedNote, updateSustainedNotePitch, updateSustainedNoteExpression, startDrone, stopDrone } from '../services/audio';
import { noteToFrequency } from '../services/pitch';
import { ExpandIcon, CloseIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';

// --- Grid Configuration ---
const GRID_ROWS = 6;
const GRID_COLS = 10;
const BASE_MIDI_NOTE = 48; // C3
const ROW_INTERVAL = 5; // Perfect 4th
const COL_INTERVAL = 2; // Major 2nd

// --- Expression Configuration ---
const MAX_LOCAL_BEND_CENTS = 200; // a whole step for local pad bend

interface IsomorphicSitarGridProps {
  settings: TuningSettings;
  allowFullscreen?: boolean;
}

type ActiveTouchState = {
    pointerId: number;
    originalNoteId: string;
    originalMidi: number;
    currentNoteId: string;
    bendCents: number;
    pressureValue: number;
};

const HeaderControls: React.FC<{
    octave: number;
    setOctave: (fn: (o: number) => number) => void;
    firstActiveTouch: ActiveTouchState | null;
    isMaximized: boolean;
    setIsMaximized: (v: boolean) => void;
    allowFullscreen?: boolean;
    isDroneOn: boolean;
    onToggleDrone: () => void;
}> = ({ octave, setOctave, firstActiveTouch, isMaximized, setIsMaximized, allowFullscreen, isDroneOn, onToggleDrone }) => {

    const expressionY = firstActiveTouch ? firstActiveTouch.pressureValue * 100 : 50;
    const bendX = firstActiveTouch ? 50 + (firstActiveTouch.bendCents / (MAX_LOCAL_BEND_CENTS * 4)) * 50 : 50;

    return (
        <header className="sitar-header pointer-events-auto">
            <div className="control-group">
                <label>Expression</label>
                <div className="expression-pad">
                    {firstActiveTouch && 
                        <div className="expression-pad-indicator" style={{ top: `${100 - expressionY}%`, left: `${bendX}%` }} />
                    }
                </div>
            </div>
            <div className="control-group">
                <label>Octave</label>
                <div className="octave-control">
                     <button onClick={() => setOctave(o => Math.max(-2, o - 1))} className="arrow-button rounded-l-sm">
                        <ChevronDownIcon className="w-6 h-6" />
                    </button>
                    <div className="octave-display">{octave + 3}</div>
                     <button onClick={() => setOctave(o => Math.min(2, o + 1))} className="arrow-button rounded-r-sm">
                        <ChevronUpIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
             <div className="control-group">
                <label>Drone</label>
                <button 
                    onClick={onToggleDrone}
                    className={`w-24 h-[50px] rounded-md border text-lg font-bold transition-colors ${
                        isDroneOn 
                        ? 'bg-blue-500/80 border-blue-400 text-white shadow-inner shadow-black/20' 
                        : 'bg-zinc-800 border-zinc-600 text-zinc-400 hover:border-zinc-500'
                    }`}
                >
                    {isDroneOn ? 'ON' : 'OFF'}
                </button>
            </div>
            <div className="flex-grow"></div> {/* Spacer */}
             {allowFullscreen && (
                <div className="pointer-events-auto">
                    {isMaximized ? 
                        <button onClick={() => setIsMaximized(false)} className="p-2 rounded-full bg-black/30 hover:bg-black/50" aria-label="Minimize"><CloseIcon className="w-6 h-6" /></button> :
                        <button onClick={() => setIsMaximized(true)} className="p-2 rounded-full text-white/60 hover:bg-white/10" aria-label="Maximize"><ExpandIcon className="w-5 h-5" /></button>
                    }
                </div>
            )}
        </header>
    );
};


export const IsomorphicSitarGrid: React.FC<IsomorphicSitarGridProps> = ({ settings, allowFullscreen }) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [octave, setOctave] = useState(0);
    const [activeTouches, setActiveTouches] = useState<Map<number, ActiveTouchState>>(new Map());
    const [isDroneOn, setIsDroneOn] = useState(false);
    
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const firstActiveTouch = useMemo(() => (
        activeTouches.size > 0 ? activeTouches.values().next().value : null
    ), [activeTouches]);
    
    const noteGrid = useMemo(() => {
        const grid: { noteId: string; midi: number; displayName: string }[][] = [];
        const displayNames = NOTATION_MAPS[settings.notationSystem] || NOTATION_MAPS.English;

        for (let r = 0; r < GRID_ROWS; r++) {
            const row: { noteId: string; midi: number; displayName: string }[] = [];
            for (let c = 0; c < GRID_COLS; c++) {
                const midi = BASE_MIDI_NOTE + (octave * 12) - (r * ROW_INTERVAL) + (c * COL_INTERVAL);
                const noteName = NOTE_NAMES_SHARP[midi % 12];
                const noteOctave = Math.floor(midi / 12) - 1;
                const noteId = `${noteName}${noteOctave}`;
                const displayName = displayNames[midi % 12].split('/')[0];
                row.push({ noteId, midi, displayName });
            }
            grid.push(row);
        }
        return grid;
    }, [octave, settings.notationSystem]);
    
    const playNote = useCallback((noteId: string, midi: number) => {
        const freq = noteToFrequency(NOTE_NAMES_SHARP[midi % 12], Math.floor(midi / 12) - 1, settings);
        if (freq > 0) {
            startSustainedNote(freq, 'Sitar', noteId);
        }
    }, [settings]);

    const toggleDrone = useCallback(() => {
        setIsDroneOn(prev => {
            const newState = !prev;
            if (newState) {
                startDrone();
            } else {
                stopDrone();
            }
            return newState;
        });
    }, []);

    const getNoteFromPoint = (clientX: number, clientY: number): { noteId: string; midi: number, element: HTMLElement } | null => {
        const target = document.elementFromPoint(clientX, clientY) as HTMLElement;
        if (target && target.dataset.noteId) {
            const { noteId, midi } = target.dataset;
            if (noteId && midi) {
                return { noteId, midi: parseInt(midi, 10), element: target };
            }
        }
        return null;
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (!target.dataset.noteId) return;

        target.setPointerCapture(e.pointerId);

        if (target.dataset.noteId && target.dataset.midi) {
            const { noteId, midi } = target.dataset;
            const midiNum = parseInt(midi, 10);
            playNote(noteId, midiNum);
            
            setActiveTouches(prev => {
                const newTouches = new Map(prev);
                newTouches.set(e.pointerId, {
                    pointerId: e.pointerId,
                    originalNoteId: noteId,
                    originalMidi: midiNum,
                    currentNoteId: noteId,
                    bendCents: 0,
                    pressureValue: 0.5,
                });
                return newTouches;
            });
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!activeTouches.has(e.pointerId)) return;
        
        const touchState = activeTouches.get(e.pointerId)!;
        const noteUnderPointer = getNoteFromPoint(e.clientX, e.clientY);
        
        // Clear old expression styles
        const previousElement = mainContainerRef.current?.querySelector(`[data-note-id="${touchState.currentNoteId}"]`) as HTMLElement;
        if (previousElement) {
            previousElement.style.removeProperty('--expression-glow-opacity');
            previousElement.style.removeProperty('--expression-glow-y');
            previousElement.style.removeProperty('--transform-x');
        }
        
        if (noteUnderPointer) {
            const rect = noteUnderPointer.element.getBoundingClientRect();
            const padCenterX = rect.left + rect.width / 2;
            const padCenterY = rect.top + rect.height / 2;

            const glideCents = (noteUnderPointer.midi - touchState.originalMidi) * 100;
            const localDeltaX = e.clientX - padCenterX;
            const localBendCents = (localDeltaX / (rect.width / 2)) * MAX_LOCAL_BEND_CENTS;
            const totalBend = glideCents + localBendCents;
            updateSustainedNotePitch(touchState.originalNoteId, totalBend);

            const localDeltaY = padCenterY - e.clientY;
            const pressure = Math.min(1, Math.max(0, 0.5 + (localDeltaY / (rect.height / 2)) * 0.5));
            updateSustainedNoteExpression(touchState.originalNoteId, pressure);
            
            noteUnderPointer.element.style.setProperty('--expression-glow-opacity', `${pressure}`);
            noteUnderPointer.element.style.setProperty('--expression-glow-y', `${(1 - (e.clientY - rect.top) / rect.height) * 100}%`);
            noteUnderPointer.element.style.setProperty('--transform-x', `${localDeltaX * 0.2}px`);

            setActiveTouches(prev => {
                const newTouches = new Map(prev);
                newTouches.set(e.pointerId, {
                    ...touchState,
                    currentNoteId: noteUnderPointer.noteId,
                    bendCents: totalBend,
                    pressureValue: pressure,
                });
                return newTouches;
            });
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        target.releasePointerCapture(e.pointerId);
        const touchState = activeTouches.get(e.pointerId);
        
        if (touchState) {
            stopSustainedNote(touchState.originalNoteId);
             const element = mainContainerRef.current?.querySelector(`[data-note-id="${touchState.currentNoteId}"]`) as HTMLElement;
            if (element) {
                element.style.removeProperty('--expression-glow-opacity');
                element.style.removeProperty('--expression-glow-y');
                element.style.removeProperty('--transform-x');
            }
            setActiveTouches(prev => {
                const newTouches = new Map(prev);
                newTouches.delete(e.pointerId);
                return newTouches;
            });
        }
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            activeTouches.forEach(touch => {
                stopSustainedNote(touch.originalNoteId);
            });
            // Also stop the drone if it's on
            stopDrone();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const activeNoteIds = useMemo(() => {
        const set = new Set<string>();
        for (const touch of activeTouches.values()) {
            set.add(touch.currentNoteId);
        }
        return set;
    }, [activeTouches]);

    const sitarGridComponent = (
        <div 
            ref={mainContainerRef} 
            className={`sitar-container text-white ${isMaximized ? 'fixed inset-0 z-[9999]' : 'relative'}`}
        >
            <HeaderControls
                octave={octave}
                setOctave={setOctave}
                firstActiveTouch={firstActiveTouch}
                isMaximized={isMaximized}
                setIsMaximized={setIsMaximized}
                allowFullscreen={allowFullscreen}
                isDroneOn={isDroneOn}
                onToggleDrone={toggleDrone}
            />

            <div 
                className="isomorphic-grid-bg no-scrollbar"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <div className="isomorphic-grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}>
                    {noteGrid.map((row) => row.map(({ noteId, midi, displayName }) => {
                         const isActive = activeNoteIds.has(noteId);
                         return (
                            <div
                                key={noteId}
                                data-note-id={noteId}
                                data-midi={midi}
                                className={`isomorphic-pad ${isActive ? 'active' : ''}`}
                            >
                                <span className="relative z-10 pointer-events-none">{displayName}</span>
                            </div>
                         )
                    }))}
                </div>
            </div>
        </div>
    );

    if (isMaximized) {
        return createPortal(sitarGridComponent, document.body);
    }

    return sitarGridComponent;
};
