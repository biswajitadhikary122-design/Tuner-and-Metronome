import { useState, useEffect, useRef } from 'react';
import type { NoteDetails } from '../types';

const HISTORY_DURATION_MS = 3000; // Analyze the last 3 seconds of data
const FEEDBACK_UPDATE_INTERVAL_MS = 1500; // How often to update the feedback text

export const usePitchStability = (note: NoteDetails | null, confidence: number) => {
    const [stabilityScore, setStabilityScore] = useState<number>(100);
    const [feedback, setFeedback] = useState<string>('Play a note to begin analysis.');
    
    const centsHistoryRef = useRef<{ value: number; timestamp: number }[]>([]);
    const feedbackTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const now = performance.now();
        
        // Add current cents to history if confidence is high
        if (note && confidence > 0.85) {
            centsHistoryRef.current.push({ value: note.cents, timestamp: now });
        }

        // Prune old history entries
        centsHistoryRef.current = centsHistoryRef.current.filter(
            entry => now - entry.timestamp < HISTORY_DURATION_MS
        );

        // If timer is not set, set one to update feedback
        if (!feedbackTimerRef.current) {
            feedbackTimerRef.current = window.setTimeout(() => {
                const history = centsHistoryRef.current;
                
                if (history.length < 20) { // Require a minimum number of samples
                    setFeedback(note ? "Hold the note..." : "Play a note to begin analysis.");
                    setStabilityScore(history.length > 0 ? 50 : 0);
                } else {
                    const values = history.map(h => h.value);
                    const mean = values.reduce((a, b) => a + b, 0) / values.length;
                    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
                    const stdDev = Math.sqrt(variance);

                    // Calculate stability score (lower std dev is better)
                    // A std dev of 10 cents or more results in a score of 0.
                    const score = Math.max(0, 100 - (stdDev * 10));
                    setStabilityScore(score);

                    // Generate feedback message
                    if (stdDev < 2.0) { // Very stable
                        if (Math.abs(mean) <= 2.5) {
                            setFeedback("Excellent pitch stability!");
                        } else {
                            setFeedback(`Consistently ${Math.abs(mean).toFixed(0)} cents ${mean > 0 ? 'sharp' : 'flat'}.`);
                        }
                    } else if (stdDev < 5.0) { // Moderately stable
                         setFeedback("Slight vibrato detected.");
                    } else { // Unstable
                        setFeedback("Pitch is unsteady. Try holding the note longer.");
                    }
                }
                
                feedbackTimerRef.current = null; // Clear timer to allow a new one to be set
            }, FEEDBACK_UPDATE_INTERVAL_MS);
        }

        return () => {
            if (feedbackTimerRef.current) {
                clearTimeout(feedbackTimerRef.current);
                feedbackTimerRef.current = null;
            }
        };

    }, [note, confidence]);

    return { stabilityScore, feedback };
};