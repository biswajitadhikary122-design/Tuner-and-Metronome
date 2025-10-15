import { useEffect, useRef } from 'react';
import type { NoteDetails, TuningSettings } from '../types';

type TuningState = 'sharp' | 'flat' | 'in-tune' | 'idle';

const STATE_PERSISTENCE_MS = 800; // How long a state must be held to trigger voice
const COOLDOWN_MS = 2500; // Cooldown between voice announcements

export const useVoiceFeedback = (note: NoteDetails | null, confidence: number, settings: TuningSettings) => {
    const stateRef = useRef<TuningState>('idle');
    const stateStartTimeRef = useRef<number>(0);
    const lastSpokenTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!settings.voiceFeedback || !window.speechSynthesis) {
            return;
        }

        const now = performance.now();
        let currentState: TuningState = 'idle';

        if (note && confidence > 0.9) {
            if (Math.abs(note.cents) <= 5) {
                currentState = 'in-tune';
            } else if (note.cents > 5) {
                currentState = 'sharp';
            } else {
                currentState = 'flat';
            }
        }
        
        if (currentState !== stateRef.current) {
            // State has changed, reset the timer
            stateRef.current = currentState;
            stateStartTimeRef.current = now;
        } else {
            // State is the same, check if it has persisted long enough
            const duration = now - stateStartTimeRef.current;
            const cooldown = now - lastSpokenTimeRef.current;

            if (duration > STATE_PERSISTENCE_MS && cooldown > COOLDOWN_MS && stateRef.current !== 'idle') {
                const utterance = new SpeechSynthesisUtterance();
                utterance.text = stateRef.current.replace('-', ' '); // "in-tune" -> "in tune"
                utterance.rate = 1.2;
                utterance.pitch = 1;
                window.speechSynthesis.speak(utterance);
                
                lastSpokenTimeRef.current = now;
                // Reset start time to prevent re-triggering immediately
                stateStartTimeRef.current = now; 
            }
        }
    }, [note, confidence, settings.voiceFeedback]);
};