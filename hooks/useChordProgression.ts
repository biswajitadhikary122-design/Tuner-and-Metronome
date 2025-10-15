import { useState, useCallback, useRef, useEffect } from 'react';
import type { Progression, ChordDetails } from '../types';
import { playProgression } from '../services/audio';

const STORAGE_KEY = 'chord-progression';

export const useChordProgression = () => {
    const [progression, setProgression] = useState<Progression>(() => {
        try {
            const savedProgression = window.localStorage.getItem(STORAGE_KEY);
            return savedProgression ? JSON.parse(savedProgression) : [];
        } catch (error) {
            console.error("Error reading progression from localStorage:", error);
            return [];
        }
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentChordIndex, setCurrentChordIndex] = useState<number | null>(null);
    const [bpm, setBpm] = useState(120);

    const stopPlaybackRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progression));
        } catch (error) {
            console.error("Error saving progression to localStorage:", error);
        }
    }, [progression]);

    const addChord = useCallback((chord: ChordDetails) => {
        setProgression(prev => [...prev, chord]);
    }, []);

    const removeChord = useCallback((index: number) => {
        setProgression(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearProgression = useCallback(() => {
        if (isPlaying) {
            stopPlaybackRef.current?.();
            setIsPlaying(false);
        }
        setProgression([]);
        setCurrentChordIndex(null);
    }, [isPlaying]);

    const handleBeatCallback = useCallback((index: number | null) => {
        setCurrentChordIndex(index);
        // Fix: Completed the function which was cut off in the original file. This hook was implicitly returning void.
        if (index === null) {
            setIsPlaying(false);
        }
    }, []);

    const togglePlayback = useCallback(() => {
        if (isPlaying) {
            stopPlaybackRef.current?.();
            stopPlaybackRef.current = null;
            setIsPlaying(false);
            setCurrentChordIndex(null);
        } else if (progression.length > 0) {
            const { stop } = playProgression(progression, bpm, handleBeatCallback);
            stopPlaybackRef.current = stop;
            setIsPlaying(true);
        }
    }, [isPlaying, progression, bpm, handleBeatCallback]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPlaybackRef.current?.();
        };
    }, []);

    return {
        progression,
        addChord,
        removeChord,
        clearProgression,
        isPlaying,
        togglePlayback,
        currentChordIndex,
        bpm,
        setBpm,
    };
};
