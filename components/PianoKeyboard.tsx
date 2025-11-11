

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TuningSettings, PianoSoundType, PIANO_SOUND_CATEGORIES } from '../types';
import { startSustainedNote, stopSustainedNote, stopSustainedNoteWithCustomRelease } from '../services/audio';
import { noteToFrequency } from '../services/pitch';
import { NOTATION_MAPS, NOTE_NAMES_SHARP } from '../constants';
import { 
    CloseIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    ExpandIcon, 
    GrandPianoIcon,
    ChevronDownIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    UIPedalIcon,
    UIMetronomeIcon,
    PianoGameSimpleIcon
} from './Icons';

interface PianoKeyboardProps {
  highlightNotes: { name: string; octave: number }[];
  settings: TuningSettings;
  isToneGenerator?: boolean;
  allowFullscreen?: boolean;
  onKeyPress?: (noteName: string, octave: number) => void;
  onKeyRelease?: (noteName: string, octave: number) => void;
  onEnterGame?: () => void;
  pressedKeys?: Set<string>;
  keyPositionMapRef?: React.MutableRefObject<Map<string, number>>;
  gameTranslateXRef?: React.MutableRefObject<number>;
}

// Constants for SVG rendering
const WHITE_KEY_WIDTH = 52;
const WHITE_KEY_HEIGHT = 220;
const BLACK_KEY_WIDTH = 30;
const BLACK_KEY_HEIGHT = 140;

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS: Record<string, string> = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' };
const ALL_WHITE_KEYS = [
    { name: 'A', octave: 0 }, { name: 'B', octave: 0 },
    ...[1, 2, 3, 4, 5, 6, 7].flatMap(octave => WHITE_KEYS.map(name => ({ name, octave }))),
    { name: 'C', octave: 8 }
];
const TOTAL_WHITE_KEYS = ALL_WHITE_KEYS.length;
const TOTAL_WIDTH = TOTAL_WHITE_KEYS * WHITE_KEY_WIDTH;

const Minimap: React.FC<{
    scrollContainer: HTMLDivElement | null;
    onScroll: (position: number) => void;
}> = ({ scrollContainer, onScroll }) => {
    const minimapRef = useRef<HTMLDivElement | null>(null);
    const [viewportStyle, setViewportStyle] = useState({ left: '0%', width: '0%' });

    useEffect(() => {
        const updateViewport = () => {
            if (scrollContainer) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
                const width = (clientWidth / scrollWidth) * 100;
                const left = (scrollLeft / scrollWidth) * 100;
                setViewportStyle({ left: `${left}%`, width: `${width}%` });
            }
        };

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', updateViewport);
            updateViewport(); // Initial update
            const resizeObserver = new ResizeObserver(updateViewport);
            resizeObserver.observe(scrollContainer);
            
            return () => {
                scrollContainer.removeEventListener('scroll', updateViewport);
                resizeObserver.unobserve(scrollContainer);
            };
        }
    }, [scrollContainer]);

    const handleMinimapInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!minimapRef.current || !scrollContainer) return;
        const rect = minimapRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = clickX / rect.width;
        onScroll(ratio);
    };

    return (
        <div 
            ref={minimapRef}
            className="relative w-full h-8 bg-gray-900 rounded-sm cursor-pointer overflow-hidden"
            onMouseDown={handleMinimapInteraction}
        >
            {/* Tiny keys */}
            <div className="w-full h-full bg-white" />
             {ALL_WHITE_KEYS.map(({ name }, index) => {
                    if (name in BLACK_KEYS) {
                        return <div key={`mini-black-${index}`} className="absolute h-1/2 top-0 bg-black" style={{ left: `${((index + 0.7) / TOTAL_WHITE_KEYS) * 100}%`, width: `${(0.6 / TOTAL_WHITE_KEYS) * 100}%` }} />
                    }
                    return null;
                })}
            {/* Viewport */}
            <div className="absolute top-0 h-full bg-blue-500/30 border-x border-blue-400" style={viewportStyle} />
        </div>
    );
};


export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ 
    highlightNotes, settings, isToneGenerator = false, allowFullscreen = false,
    onKeyPress, onKeyRelease, onEnterGame, pressedKeys: controlledPressedKeys,
    keyPositionMapRef, gameTranslateXRef,
}) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [internalPressedKeys, setInternalPressedKeys] = useState(new Set<string>());
    const isMouseDownRef = useRef(false);
    
    // --- Piano Sound Menu State ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [pianoSound, setPianoSound] = useState<PianoSoundType>('Parlor / Living Room Grand');
    const menuRef = useRef<HTMLDivElement>(null);

    // --- Sustain Pedal State ---
    const [isSustainOn, setIsSustainOn] = useState(false);
    const [sustainedNotes, setSustainedNotes] = useState(new Set<string>());
    
    // --- Metronome State ---
    const [isMetronomeOn, setIsMetronomeOn] = useState(false);
    const [metronomeBpm, setMetronomeBpm] = useState(120);
    const metronomeTimerRef = useRef<number | null>(null);
    const metronomeAudioContextRef = useRef<AudioContext | null>(null);

    const pressedKeys = controlledPressedKeys || internalPressedKeys;

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            isMouseDownRef.current = false;
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    // --- Metronome Logic ---
    const stopMetronome = useCallback(() => {
        if (metronomeTimerRef.current) {
            window.clearInterval(metronomeTimerRef.current);
            metronomeTimerRef.current = null;
        }
        if (metronomeAudioContextRef.current && metronomeAudioContextRef.current.state !== 'closed') {
            metronomeAudioContextRef.current.close();
            metronomeAudioContextRef.current = null;
        }
    }, []);

    const playMetronomeClick = useCallback(() => {
        if (!metronomeAudioContextRef.current || metronomeAudioContextRef.current.state === 'closed') {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                metronomeAudioContextRef.current = new AudioContext();
            } else {
                return; 
            }
        }
        const context = metronomeAudioContextRef.current;
        if (context.state === 'suspended') context.resume();
        
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        
        osc.type = 'triangle';
        osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.5, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);
        
        osc.start(context.currentTime);
        osc.stop(context.currentTime + 0.05);
    }, []);

    useEffect(() => {
        if (isMetronomeOn) {
            stopMetronome();
            const interval = 60000 / metronomeBpm;
            metronomeTimerRef.current = window.setInterval(playMetronomeClick, interval);
        } else {
            stopMetronome();
        }
        return stopMetronome;
    }, [isMetronomeOn, metronomeBpm, playMetronomeClick, stopMetronome]);

    // Used for game mode to map notes to pixel positions on screen
    const calculateLayout = useCallback(() => {
        if (!keyPositionMapRef || !gameTranslateXRef) return;

        const centerNoteIndex = 25; // C4
        const translateX = (window.innerWidth / 2) - (centerNoteIndex * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH / 2);
        gameTranslateXRef.current = translateX;

        const newMap = new Map<string, number>();
        ALL_WHITE_KEYS.forEach(({ name: noteName, octave }, index) => {
            const noteId = `${noteName}${octave}`;
            const x = index * WHITE_KEY_WIDTH + (WHITE_KEY_WIDTH / 2) + translateX;
            newMap.set(noteId, x);

            if (noteName in BLACK_KEYS) {
                const blackNoteName = BLACK_KEYS[noteName];
                const blackNoteId = `${blackNoteName}${octave}`;
                const blackX = index * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - 1.5 + translateX;
                newMap.set(blackNoteId, blackX);
            }
        });
        keyPositionMapRef.current = newMap;
    }, [keyPositionMapRef, gameTranslateXRef]);

    useEffect(() => {
        calculateLayout();
        window.addEventListener('resize', calculateLayout);
        return () => window.removeEventListener('resize', calculateLayout);
    }, [calculateLayout]);


    const handleScroll = (direction: '<<' | '<' | '>' | '>>' | number) => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            if (typeof direction === 'number') {
                scrollContainerRef.current.scrollLeft = (direction * scrollWidth) - (clientWidth / 2);
            } else if (direction === '<<') {
                scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (direction === '>>') {
                scrollContainerRef.current.scrollTo({ left: scrollWidth - clientWidth, behavior: 'smooth' });
            } else {
                 const scrollAmount = clientWidth * 0.7;
                 scrollContainerRef.current.scrollBy({ left: direction === '<' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const handlePress = useCallback((noteName: string, octave: number) => {
        if (onKeyPress) {
            onKeyPress(noteName, octave);
            return;
        }

        const noteId = `${noteName}${octave}`;
        const freq = noteToFrequency(noteName, octave, settings);
        if (freq > 0) {
            const sound = isToneGenerator ? pianoSound : 'Parlor / Living Room Grand';
            startSustainedNote(freq, sound, noteId);
            
            if (isToneGenerator) {
                setInternalPressedKeys(prev => new Set(prev).add(noteId));
                // If we re-press a sustained note, it's no longer just sustained.
                setSustainedNotes(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(noteId);
                    return newSet;
                });
            }
        }
    }, [onKeyPress, settings, isToneGenerator, pianoSound]);

    const handleRelease = useCallback((noteName: string, octave: number) => {
        if (onKeyRelease) {
            onKeyRelease(noteName, octave);
            return;
        }

        const noteId = `${noteName}${octave}`;
        if (isToneGenerator) {
            if (isSustainOn) {
                // Add to sustain set; note will start its long release.
                setSustainedNotes(prev => new Set(prev).add(noteId));
                stopSustainedNoteWithCustomRelease(noteId, 2, 1); // 2s hold, 1s fade out
            } else {
                // No sustain, so stop the note now with its default release.
                stopSustainedNote(noteId);
            }
            // Always remove from the set of physically pressed keys.
            setInternalPressedKeys(prev => {
                const newSet = new Set(prev);
                newSet.delete(noteId);
                return newSet;
            });
        } else {
            // For non-tone-generator pianos (e.g., in scale finder), just stop the note.
            stopSustainedNote(noteId);
        }
    }, [onKeyRelease, isToneGenerator, isSustainOn]);

    const toggleSustain = () => {
        const newSustainState = !isSustainOn;
        setIsSustainOn(newSustainState);
        if (!newSustainState) {
            // If sustain was just turned OFF, stop all notes that were being sustained
            // but are no longer being physically held down.
            sustainedNotes.forEach(noteId => {
                if (!internalPressedKeys.has(noteId)) {
                    stopSustainedNote(noteId);
                }
            });
            setSustainedNotes(new Set());
        }
    };
    
    useEffect(() => {
        return () => {
            if(isToneGenerator) {
                stopSustainedNote();
            }
        }
    }, [isToneGenerator, isMaximized]);

    const getHandlers = (noteName: string, octave: number) => ({
        onMouseDown: (e: React.MouseEvent) => {
            e.stopPropagation();
            isMouseDownRef.current = true;
            handlePress(noteName, octave);
        },
        onMouseUp: () => {
            isMouseDownRef.current = false;
            handleRelease(noteName, octave);
        },
        onMouseLeave: () => {
            if (isMouseDownRef.current) {
                handleRelease(noteName, octave);
            }
        },
        onMouseEnter: () => {
            if (isMouseDownRef.current) {
                handlePress(noteName, octave);
            }
        },
        onTouchStart: (e: React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handlePress(noteName, octave);
        },
        onTouchEnd: () => handleRelease(noteName, octave),
    });

    const highlightedNotesSet = new Set(highlightNotes.map(n => `${n.name}${n.octave}`));
    
    const displayNames = NOTATION_MAPS[settings.notationSystem] || NOTATION_MAPS.English;
    
    const keyboardSVG = (
         <svg
            width={TOTAL_WIDTH}
            height={WHITE_KEY_HEIGHT}
            viewBox={`0 0 ${TOTAL_WIDTH} ${WHITE_KEY_HEIGHT}`}
            className="align-top"
        >
            <defs>
                 <linearGradient id="newWhiteKeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="90%" stopColor="#E8E8E8" />
                    <stop offset="100%" stopColor="#D0D0D0" />
                </linearGradient>
                <linearGradient id="newBlackKeyGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#282828" />
                    <stop offset="100%" stopColor="#000000" />
                </linearGradient>
                <linearGradient id="blackKeyHighlight" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#555" />
                    <stop offset="100%" stopColor="#333" />
                </linearGradient>
                <filter id="keyShadow" x="-20%" y="-10%" width="140%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>
            <g style={gameTranslateXRef ? { transform: `translateX(${gameTranslateXRef.current}px)` } : {}}>
                {ALL_WHITE_KEYS.map(({ name: noteName, octave }, index) => {
                    const noteId = `${noteName}${octave}`;
                    const isHighlighted = highlightedNotesSet.has(noteId);
                    const isPressed = pressedKeys.has(noteId);
                    
                    const englishNoteIndex = NOTE_NAMES_SHARP.indexOf(noteName);
                    const displayName = englishNoteIndex !== -1 ? displayNames[englishNoteIndex].split('/')[0] : noteName;

                    return (
                        <g key={noteId} {...getHandlers(noteName, octave)} 
                           className="cursor-pointer group"
                           style={{ transform: isPressed ? 'translateY(1px)' : 'translateY(0px)', transition: 'transform 50ms ease-out' }}
                        >
                            <rect
                                x={index * WHITE_KEY_WIDTH} y={0} width={WHITE_KEY_WIDTH} height={WHITE_KEY_HEIGHT} rx="2" ry="2"
                                fill={isHighlighted || isPressed ? '#2dd4bf' : "url(#newWhiteKeyGradient)"}
                                className="stroke-gray-400 dark:stroke-gray-600"
                                strokeWidth="0.5"
                            />
                            {/* Key top highlight */}
                            <path d={`M ${index * WHITE_KEY_WIDTH+3} 3 H ${index * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - 3} L ${index * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - 5} 5 H ${index * WHITE_KEY_WIDTH+5} Z`} fill="white" opacity="0.3" />
                            <text
                                x={index * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH / 2} y={WHITE_KEY_HEIGHT - 20} textAnchor="middle"
                                className="text-lg font-sans font-semibold pointer-events-none select-none fill-gray-400 dark:fill-gray-500"
                            >
                                {displayName}{noteName === 'C' ? octave : ''}
                            </text>
                        </g>
                    );
                })}
                {ALL_WHITE_KEYS.map(({ name: noteName, octave }, index) => {
                    if (noteName in BLACK_KEYS) {
                        const blackNoteName = BLACK_KEYS[noteName];
                        const noteId = `${blackNoteName}${octave}`;
                        const x = index * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - (BLACK_KEY_WIDTH / 2) - 1.5;
                        const isHighlighted = highlightedNotesSet.has(noteId);
                        const isPressed = pressedKeys.has(noteId);
                        return (
                            <g key={noteId} {...getHandlers(blackNoteName, octave)} 
                                className="cursor-pointer group" 
                                filter={'url(#keyShadow)'}
                                style={{ transform: isPressed ? 'translateY(1px)' : 'translateY(0px)', transition: 'transform 50ms ease-out' }}
                            >
                                 <rect
                                    x={x} y={1} width={BLACK_KEY_WIDTH} height={BLACK_KEY_HEIGHT} rx="2" ry="2"
                                    fill={isHighlighted || isPressed ? '#2dd4bf' : "url(#newBlackKeyGradient)"}
                                    className="stroke-black/50"
                                 />
                                 <rect 
                                    x={x+2} y={3} width={BLACK_KEY_WIDTH - 4} height={BLACK_KEY_HEIGHT - 12} rx="1" ry="1"
                                    fill="url(#blackKeyHighlight)"
                                    className="pointer-events-none"
                                 />
                            </g>
                        );
                    }
                    return null;
                })}
            </g>
        </svg>
    );

    // If this component is being used for the game, it just renders the SVG
    if (keyPositionMapRef) {
        return <div className="absolute bottom-0 left-0 w-full">{keyboardSVG}</div>;
    }
    
    // Default rendering for Tone Generator
    const keyboardContent = (
      <div className="relative w-full h-full bg-gray-800 dark:bg-black flex flex-col">
        <header className="bg-zinc-900/80 text-white flex justify-between items-center px-2 py-1 flex-shrink-0 border-b border-black/50">
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(prev => !prev)} 
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors" 
                    aria-label="Change piano sound" 
                    aria-haspopup="true" 
                    aria-expanded={isMenuOpen}
                >
                    <span className="font-semibold truncate max-w-48 text-sm">{pianoSound}</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMenuOpen && (
                    <div ref={menuRef} className="absolute bottom-full mb-2 left-0 z-20 w-80 max-h-96 overflow-y-auto bg-zinc-900 border border-zinc-700/50 rounded-lg shadow-2xl animate-fade-in-fast no-scrollbar">
                        <div className="p-2">
                            {PIANO_SOUND_CATEGORIES.map(category => (
                                <div key={category.category}>
                                    <h3 className="px-2 py-1 text-sm font-semibold text-zinc-400">{category.category}</h3>
                                    {category.types.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setPianoSound(type);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-2 py-1.5 rounded text-zinc-200 hover:bg-zinc-700 transition-colors ${pianoSound === type ? 'bg-blue-600 font-semibold' : ''}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
             <div className="flex items-center gap-2">
                <div className="flex items-stretch rounded-md overflow-hidden bg-zinc-950 border border-zinc-700/50 shadow-inner">
                    <button 
                        onClick={toggleSustain} 
                        className={`px-4 py-2 transition-colors ${isSustainOn ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`} 
                        aria-label="Toggle Sustain"
                        aria-pressed={isSustainOn}
                    >
                        <UIPedalIcon className="w-6 h-6" />
                    </button>
                    <div className="w-px bg-zinc-700/50"></div>
                     <button 
                        onClick={() => setIsMetronomeOn(on => !on)} 
                        className={`px-4 py-2 transition-colors ${isMetronomeOn ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`} 
                        aria-label="Toggle Metronome"
                        aria-pressed={isMetronomeOn}
                    >
                        <UIMetronomeIcon className="w-6 h-6" />
                    </button>
                </div>
                 {isMetronomeOn && (
                    <div className="flex items-center gap-1 text-white pr-2 animate-fade-in-fast bg-zinc-800 rounded-md border border-zinc-700/50">
                        <input 
                            type="number"
                            value={metronomeBpm}
                            onChange={e => setMetronomeBpm(Math.max(40, Math.min(240, parseInt(e.target.value) || 40)))}
                            className="bg-transparent w-16 text-center font-mono focus:outline-none"
                        />
                        <span className="text-sm text-zinc-400">BPM</span>
                    </div>
                )}

                {onEnterGame && (
                    <button onClick={onEnterGame} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors" aria-label="Play Piano Game">
                        <PianoGameSimpleIcon className="w-6 h-6" />
                    </button>
                )}
                 
                 {allowFullscreen && (
                    <button onClick={() => setIsMaximized(prev => !prev)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label={isMaximized ? 'Minimize Keyboard' : 'Maximize Keyboard'}>
                        {isMaximized ? <CloseIcon className="w-6 h-6" /> : <ExpandIcon className="w-6 h-6" />}
                    </button>
                 )}
            </div>
        </header>

        <div className="relative flex-grow">
            <div ref={scrollContainerRef} className="absolute inset-0 overflow-x-auto no-scrollbar">
                {keyboardSVG}
            </div>
        </div>

         <div className="w-full flex-shrink-0 bg-black/30 p-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
                 <button onClick={() => handleScroll('<<')} className="p-2 rounded hover:bg-white/10"><ChevronDoubleLeftIcon className="w-5 h-5" /></button>
                 <button onClick={() => handleScroll('<')} className="p-2 rounded hover:bg-white/10"><ChevronLeftIcon className="w-5 h-5" /></button>
            </div>
             <div className="flex-grow">
                <Minimap scrollContainer={scrollContainerRef.current} onScroll={ratio => handleScroll(ratio)} />
            </div>
             <div className="flex items-center gap-2">
                 <button onClick={() => handleScroll('>')} className="p-2 rounded hover:bg-white/10"><ChevronRightIcon className="w-5 h-5" /></button>
                 <button onClick={() => handleScroll('>>')} className="p-2 rounded hover:bg-white/10"><ChevronDoubleRightIcon className="w-5 h-5" /></button>
            </div>
        </div>
      </div>
    );

    if (isMaximized) {
        return createPortal(
            <div className="fixed inset-0 z-[1000] bg-gray-800 dark:bg-black">
                {keyboardContent}
            </div>,
            document.body
        );
    }
    
    return (
        <div className="fixed bottom-0 left-0 right-0 h-80 z-20 animate-fade-in-up">
            {keyboardContent}
        </div>
    );
};
