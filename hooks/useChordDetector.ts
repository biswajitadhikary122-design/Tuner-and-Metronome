import { useState, useRef, useCallback, useEffect } from 'react';

// --- Constants and Helpers ---

const FFT_SIZE = 8192;
const MIN_FREQ = 50; // Ignore low-frequency rumble
const MAX_FREQ = 2500;
const CHROMA_BINS = 12;
const NOISE_GATE_DB = -60; // Silence threshold in dB
const DETECTION_THRESHOLD = 0.75; // Cosine similarity score needed to confirm a chord

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const CHORD_TEMPLATES: Record<string, number[]> = {
    'maj':  [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], // C, E, G
    'min':  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0], // C, Eb, G
    'dim':  [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0], // C, Eb, Gb
    'aug':  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // C, E, G#
    'maj7': [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1], // C, E, G, B
    'min7': [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0], // C, Eb, G, Bb
    '7':    [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], // C, E, G, Bb
};

const freqToMidi = (freq: number) => 69 + 12 * Math.log2(freq / 440);

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
};

// --- The Hook ---

export const useChordDetector = () => {
    const [detectedChord, setDetectedChord] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const freqDataRef = useRef<Float32Array | null>(null);

    const processAudio = useCallback(() => {
        if (!analyserRef.current || !freqDataRef.current || !isRunning) {
            return;
        }

        analyserRef.current.getFloatFrequencyData(freqDataRef.current);
        const freqData = freqDataRef.current;
        const sampleRate = analyserRef.current.context.sampleRate;
        const fftSize = analyserRef.current.fftSize;

        // 1. Build Chromagram
        const chromagram = new Array(CHROMA_BINS).fill(0);
        let maxDb = -Infinity;
        for (let i = 0; i < freqData.length; i++) {
            if (freqData[i] > maxDb) maxDb = freqData[i];

            const freq = i * (sampleRate / fftSize);
            if (freq < MIN_FREQ || freq > MAX_FREQ) continue;
            
            if (freqData[i] < NOISE_GATE_DB) continue;

            const midi = freqToMidi(freq);
            if (midi < 0) continue;

            const chromaIndex = Math.round(midi) % CHROMA_BINS;
            // Convert dB to a linear energy value for summation
            const energy = Math.pow(10, freqData[i] / 10);
            chromagram[chromaIndex] += energy;
        }

        if (maxDb === -Infinity || maxDb < NOISE_GATE_DB + 10) { // Add headroom to noise gate
            setDetectedChord(null);
            animationFrameIdRef.current = requestAnimationFrame(processAudio);
            return;
        }

        // 2. Normalize Chromagram
        const maxEnergy = Math.max(...chromagram);
        if (maxEnergy > 0) {
            for (let i = 0; i < CHROMA_BINS; i++) {
                chromagram[i] /= maxEnergy;
            }
        } else {
             setDetectedChord(null);
             animationFrameIdRef.current = requestAnimationFrame(processAudio);
             return;
        }

        // 3. Match against templates
        let bestMatch = { chord: '...', score: 0 };

        for (let root = 0; root < CHROMA_BINS; root++) {
            for (const [quality, template] of Object.entries(CHORD_TEMPLATES)) {
                // Rotate the chromagram to test for this root by shifting the template
                const rotatedTemplate = [...template.slice(CHROMA_BINS - root), ...template.slice(0, CHROMA_BINS - root)];
                const score = cosineSimilarity(chromagram, rotatedTemplate);

                if (score > bestMatch.score) {
                    bestMatch = {
                        chord: `${NOTE_NAMES[root]}${quality}`,
                        score: score
                    };
                }
            }
        }

        if (bestMatch.score > DETECTION_THRESHOLD) {
            setDetectedChord(bestMatch.chord);
        } else {
            setDetectedChord(null);
        }

        animationFrameIdRef.current = requestAnimationFrame(processAudio);
    }, [isRunning]);

    const stop = useCallback(() => {
        if (!isRunning) return;
        setIsRunning(false);

        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            const stream = (mediaStreamSourceRef.current.mediaStream as MediaStream);
            stream.getTracks().forEach(track => track.stop());
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        setDetectedChord(null);
    }, [isRunning]);

    const start = useCallback(async () => {
        if (isRunning) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false },
            });
            
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;

            const source = context.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;

            const analyser = context.createAnalyser();
            analyser.fftSize = FFT_SIZE;
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.85;
            analyserRef.current = analyser;
            
            source.connect(analyser);
            
            freqDataRef.current = new Float32Array(analyser.frequencyBinCount);

            setIsRunning(true);
        } catch (err) {
            console.error('Error starting audio for chord detector:', err);
            stop();
            throw err;
        }
    }, [isRunning, stop]);

    useEffect(() => {
        if (isRunning) {
            animationFrameIdRef.current = requestAnimationFrame(processAudio);
        }
        // Cleanup on unmount
        return () => {
            stop();
        };
    }, [isRunning, processAudio, stop]);

    return { detectedChord, start, stop, isRunning };
};
