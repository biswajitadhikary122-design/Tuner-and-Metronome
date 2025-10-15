
import type { Progression } from "../types";

// A singleton AudioContext for playback to avoid creating multiple contexts.
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
    if (!audioContext || audioContext.state === 'closed') {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                audioContext = new AudioContext();
            } else {
                console.error("Web Audio API is not supported in this browser.");
                return null;
            }
        } catch (e) {
            console.error("Could not create AudioContext:", e);
            return null;
        }
    }
    return audioContext;
};


/**
 * Plays a note of a given frequency with a simple envelope.
 * @param frequency The frequency of the note to play in Hz.
 * @param duration The duration of the note in seconds. Defaults to 0.5.
 */
export const playNote = (frequency: number, duration: number = 0.5): void => {
    const context = getAudioContext();
    if (!context) return;

    // If context is suspended, it needs to be resumed by a user gesture.
    // Our click/tap handler is a valid user gesture.
    if (context.state === 'suspended') {
        context.resume();
    }
    
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.connect(gain);
    gain.connect(context.destination);

    // Set oscillator type and frequency
    osc.type = 'sine'; // A clean tone
    osc.frequency.setValueAtTime(frequency, context.currentTime);

    // Simple ADSR-like envelope to prevent clicking
    const now = context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay and Release

    osc.start(now);
    osc.stop(now + duration);
};

/**
 * Plays a sequence of chords at a specified tempo.
 * @param progression The array of chords to play.
 * @param bpm The tempo in beats per minute.
 * @param onBeatCallback A function called with the index of the currently playing chord.
 * @returns An object with a `stop` function to halt playback.
 */
export const playProgression = (
    progression: Progression,
    bpm: number,
    onBeatCallback: (index: number | null) => void
): { stop: () => void } => {
    const context = getAudioContext();
    if (!context) return { stop: () => {} };

    if (context.state === 'suspended') {
        context.resume();
    }

    let activeSources: OscillatorNode[] = [];
    let animationFrameId: number | null = null;
    const secondsPerBeat = 60.0 / bpm;
    const startTime = context.currentTime + 0.1;

    progression.forEach((chord, chordIndex) => {
        const time = startTime + chordIndex * secondsPerBeat;
        chord.notes.forEach(note => {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.type = 'sine';

            osc.frequency.setValueAtTime(note.frequency, time);
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.2, time + 0.02); // Short attack
            gain.gain.exponentialRampToValueAtTime(0.001, time + secondsPerBeat * 0.9);

            osc.start(time);
            osc.stop(time + secondsPerBeat);
            activeSources.push(osc);
        });
    });

    const updateUI = () => {
        const elapsedTime = context.currentTime - startTime;
        if (elapsedTime >= 0) {
            const currentBeatIndex = Math.floor(elapsedTime / secondsPerBeat);
            if (currentBeatIndex < progression.length) {
                onBeatCallback(currentBeatIndex);
            } else {
                onBeatCallback(null);
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                return;
            }
        }
        animationFrameId = requestAnimationFrame(updateUI);
    };
    updateUI();

    const stop = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        activeSources.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {
                // Ignore errors if the node is already stopped
            }
        });
        activeSources = [];
        onBeatCallback(null);
    };

    return { stop };
};