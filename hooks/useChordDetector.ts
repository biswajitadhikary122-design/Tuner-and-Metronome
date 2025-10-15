
import { useState, useCallback, useRef } from 'react';
import type { ChordDetails, TuningSettings } from '../types';

const FFT_SIZE = 8192; 
const CAPTURE_DURATION_MS = 500; // How long to listen for the peak volume
const VOLUME_THRESHOLD = -50; // Min dB to trigger analysis

type ChordDetectorStatus = 'idle' | 'listening' | 'analyzing' | 'success' | 'error';

export const useChordDetector = (settings: TuningSettings) => {
    const [status, setStatus] = useState<ChordDetectorStatus>('idle');
    const [chordDetails, setChordDetails] = useState<ChordDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    
    const stopListening = useCallback(() => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            const stream = (mediaStreamSourceRef.current.mediaStream as MediaStream);
            stream.getTracks().forEach(track => track.stop());
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);

    const processAndAnalyze = async (spectrum: Float32Array, sampleRate: number) => {
        setStatus('analyzing');
        try {
            const { analyzeChordFromSpectrum } = await import('../services/gemini');
            const result = await analyzeChordFromSpectrum(spectrum, sampleRate, settings);
            if (result && result.notes.length > 1) {
                setChordDetails(result);
                setStatus('success');
            } else {
                setError("Couldn't identify a chord. Please try strumming more clearly.");
                setStatus('error');
            }
        } catch (e) {
            console.error("Gemini API Error:", e);
            setError(e instanceof Error ? e.message : "Failed to analyze chord.");
            setStatus('error');
        } finally {
            stopListening();
        }
    }

    const startListening = () => {
        let bestSpectrum: Float32Array | null = null;
        let maxVolume = -Infinity;
        
        const freqDomainData = new Float32Array(analyserRef.current.frequencyBinCount);
        const startTime = performance.now();

        const findPeak = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getFloatFrequencyData(freqDomainData);

            // Simple volume check (average of highest bins)
            let currentVolume = 0;
            for(let i = 0; i < freqDomainData.length; i++) {
                if(isFinite(freqDomainData[i])) {
                    currentVolume += freqDomainData[i];
                }
            }
            currentVolume /= freqDomainData.length;
            
            if (currentVolume > maxVolume && currentVolume > VOLUME_THRESHOLD) {
                maxVolume = currentVolume;
                bestSpectrum = new Float32Array(freqDomainData);
            }
            
            if (performance.now() - startTime < CAPTURE_DURATION_MS) {
                animationFrameIdRef.current = requestAnimationFrame(findPeak);
            } else {
                if (bestSpectrum && audioContextRef.current) {
                    processAndAnalyze(bestSpectrum, audioContextRef.current.sampleRate);
                } else {
                    setError("No clear sound detected. Please try playing louder.");
                    setStatus('error');
                    stopListening();
                }
            }
        };
        animationFrameIdRef.current = requestAnimationFrame(findPeak);
    };

    const analyze = useCallback(async (reset: boolean = false) => {
        if (reset) {
            setStatus('idle');
            setChordDetails(null);
            setError(null);
            return;
        }

        if (status === 'listening' || status === 'analyzing') return;

        setStatus('listening');
        setChordDetails(null);
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: {
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
            }});
            
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) {
                throw new Error("Browser does not support the Web Audio API, which is required to analyze chords.");
            }
            const context = new AudioContext();
            audioContextRef.current = context;

            const source = context.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;

            const analyser = context.createAnalyser();
            analyser.fftSize = FFT_SIZE;
            analyserRef.current = analyser;

            source.connect(analyser);

            startListening();

        } catch (err) {
            console.error('Error starting audio for chord detection:', err);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setError('Microphone permission is required to analyze chords.');
                } else {
                    setError(err.message);
                }
            } else {
                setError('An unknown error occurred while accessing the microphone.');
            }
            setStatus('error');
        }

    }, [status, stopListening, settings]);

    return { status, chordDetails, error, analyze };
};