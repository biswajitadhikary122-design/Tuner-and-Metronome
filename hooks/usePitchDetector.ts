import { useState, useRef, useCallback, useEffect } from 'react';
import type { NoteDetails, TuningSettings } from '../types';
import { applyHannWindow, findPitchFromAutocorrelation, findPitchFromHPS, frequencyToNoteDetails } from '../services/pitch';
import { PRESET_CONFIGS } from '../services/data';

const FFT_SIZE = 8192; // Increased for better frequency resolution
const CONFIDENCE_THRESHOLD = 0.7; // Lowered for more sensitivity
const SILENCE_THRESHOLD = 10;  // Require 10 frames of silence to clear the display
const NOISE_GATE_THRESHOLD = 0.0005; // Lowered to pick up fainter sounds

export const usePitchDetector = (settings: TuningSettings) => {
  const [note, setNote] = useState<NoteDetails | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);
  const [spectrum, setSpectrum] = useState<Float32Array | null>(null);
  const [waveform, setWaveform] = useState<Float32Array | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // --- Refs for stabilization and state management ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const timeDomainDataRef = useRef<Float32Array | null>(null);
  const freqDomainDataRef = useRef<Float32Array | null>(null);
  
  const smoothedPitchRef = useRef<number>(0); // For Step 3: Smoothing
  const framesSinceDetectionRef = useRef<number>(0); // For Step 1: Noise Gate

  const processAudio = useCallback(() => {
    if (!analyserRef.current || !timeDomainDataRef.current || !freqDomainDataRef.current || !audioContextRef.current) {
      return;
    }
    
    // --- STEP 1: CAPTURING AND PREPARING AUDIO ---
    // Capture waveform (time-domain) and spectrum (frequency-domain) data.
    analyserRef.current.getFloatTimeDomainData(timeDomainDataRef.current);
    analyserRef.current.getFloatFrequencyData(freqDomainDataRef.current);
    
    // Noise Gate: Calculate Root Mean Square (RMS) volume to determine if sound is present.
    // If volume is below the threshold, treat it as silence and skip pitch detection.
    let rms = 0;
    for (let i = 0; i < timeDomainDataRef.current.length; i++) {
        rms += timeDomainDataRef.current[i] * timeDomainDataRef.current[i];
    }
    rms = Math.sqrt(rms / timeDomainDataRef.current.length);

    if (rms < NOISE_GATE_THRESHOLD) {
      framesSinceDetectionRef.current++;
      setVolume(0);
      // If we've had silence for a while, clear the display and reset state
      if (framesSinceDetectionRef.current >= SILENCE_THRESHOLD) {
          setNote(null);
          smoothedPitchRef.current = 0;
          setSpectrum(new Float32Array(freqDomainDataRef.current.length)); // Send silent spectrum
      }
      animationFrameIdRef.current = requestAnimationFrame(processAudio);
      return; // Skip pitch detection for this frame
    } else {
        // Convert RMS to a dB-like level. 96 is a common offset for dBFS to dBSPL.
        const db = 20 * Math.log10(rms || 1e-9) + 96;
        setVolume(Math.max(0, db));
    }
    // --- End Step 1 Part A ---

    // Always provide spectrum for TimbreVisualizer
    setSpectrum(new Float32Array(freqDomainDataRef.current));
    
    if (settings.debugWaveform) {
      setWaveform(new Float32Array(timeDomainDataRef.current));
    } else {
      setWaveform(null); // Clear waveform data if debug mode is off
    }

    const { minFreq, maxFreq } = PRESET_CONFIGS[settings.preset];
    
    // --- STEP 2: CORE PITCH DETECTION (HYBRID APPROACH) ---
    // Windowing: Apply a Hann window to the audio snippet to improve FFT accuracy (Part of Step 1).
    const windowedBuffer = new Float32Array(timeDomainDataRef.current);
    applyHannWindow(windowedBuffer);

    // Method 1: YIN Algorithm on the time-domain data (waveform).
    const { frequency: acFreq, confidence: acConfidence } = findPitchFromAutocorrelation(
      windowedBuffer, 
      audioContextRef.current.sampleRate,
      minFreq,
      maxFreq
    );
    // Method 2: Harmonic Product Spectrum (HPS) on the frequency-domain data.
    const { frequency: hpsFreq } = findPitchFromHPS(freqDomainDataRef.current, audioContextRef.current.sampleRate);

    let finalFrequency = -1;
    let currentConfidence = 0;

    // Combining Results: Use YIN's confidence but verify with HPS.
    // If YIN is confident and agrees with HPS, the result is very reliable.
    // If they disagree, we trust the YIN result as it's generally more stable for fundamentals.
    if (acConfidence > CONFIDENCE_THRESHOLD) {
        const diff = Math.abs(acFreq - hpsFreq);
        // If YIN and HPS agree, we are very confident. Average them, favoring YIN.
        if (diff / acFreq < 0.05) { // <5% difference
            finalFrequency = (acFreq * 0.7) + (hpsFreq * 0.3);
        } else {
            // If they disagree, trust YIN as it's generally better at fundamentals
            finalFrequency = acFreq;
        }
        currentConfidence = acConfidence;
    } else {
        // Fallback or low confidence scenario
        finalFrequency = -1;
        currentConfidence = acConfidence;
    }
    
    setConfidence(currentConfidence);

    // --- STEP 3: STABILIZING THE TUNER ---
    // Smoothing: Apply exponential smoothing to the raw detected frequency to prevent jitter.
    if (finalFrequency > 0) {
        smoothedPitchRef.current = (settings.smoothing * smoothedPitchRef.current) + ((1 - settings.smoothing) * finalFrequency);
    }
    
    // --- STEP 4: TRANSLATING FREQUENCY TO MUSIC ---
    // Identify the note name, octave, and cents deviation from the smoothed frequency.
    const detectedNoteDetails = frequencyToNoteDetails(smoothedPitchRef.current, settings);

    // --- Simplified Note Display Logic ---
    if (settings.preset === 'Hz (Manual)') {
        if (finalFrequency > 0 && detectedNoteDetails) {
            setNote(detectedNoteDetails);
        } else {
            framesSinceDetectionRef.current++;
            if (framesSinceDetectionRef.current >= SILENCE_THRESHOLD) {
                setNote(null);
            }
        }
    } else {
        // Standard note detection
        if (detectedNoteDetails && finalFrequency > 0 && currentConfidence > CONFIDENCE_THRESHOLD) {
            framesSinceDetectionRef.current = 0; // Sound is detected, reset silence counter
            setNote(detectedNoteDetails);
        } else { // No clear note detected or confidence is too low
            framesSinceDetectionRef.current++;
            
            // If silence has persisted, clear the note from the display
            if (framesSinceDetectionRef.current >= SILENCE_THRESHOLD) {
                setNote(null);
                smoothedPitchRef.current = 0;
            }
        }
    }


    // The final `note` state is what gets sent to the display component (Step 5).
    animationFrameIdRef.current = requestAnimationFrame(processAudio);
  }, [settings]);

  const stop = useCallback(() => {
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
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(async () => {
    if (audioContextRef.current) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        throw new Error("Your browser does not support the Web Audio API.");
      }
      const context = new AudioContext();
      audioContextRef.current = context;

      const source = context.createMediaStreamSource(stream);
      mediaStreamSourceRef.current = source;

      const analyser = context.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyserRef.current = analyser;

      // High-pass filter to remove DC offset and rumble
      const hpFilter = context.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.value = 50;

      // Connect nodes: source -> filter -> analyser
      source.connect(hpFilter);
      hpFilter.connect(analyser);

      timeDomainDataRef.current = new Float32Array(analyser.fftSize);
      freqDomainDataRef.current = new Float32Array(analyser.frequencyBinCount);

      smoothedPitchRef.current = 0;
      setIsRunning(true);
      processAudio();
    } catch (err) {
      console.error('Error starting audio:', err);
      stop();
      throw err; // Re-throw to be caught by caller
    }
  }, [processAudio, stop]);
  
  // Ensure the audio processing loop is aware of settings changes
  useEffect(() => {
    // This effect doesn't need to do anything with the processAudio callback itself,
    // but its dependency array ensures that when settings change, the callback used
    // by requestAnimationFrame is the newest one with the correct settings closure.
  }, [settings, processAudio]);

  return { note, confidence, volume, spectrum, waveform, start, stop, isRunning };
};
