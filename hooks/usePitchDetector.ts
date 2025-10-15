
import { useState, useRef, useCallback, useEffect } from 'react';
import type { NoteDetails, TuningSettings } from '../types';
import { findPitchFromAutocorrelation, findPitchFromHPS, frequencyToNoteDetails } from '../services/pitch';
import { PRESET_CONFIGS } from '../constants';

const FFT_SIZE = 8192; // Increased for better frequency resolution
const CONFIDENCE_THRESHOLD = 0.8;
const SILENCE_THRESHOLD = 10;  // Require 10 frames of silence to clear the display
const NOISE_GATE_THRESHOLD = 0.002; // Lowered to pick up quieter sounds

export const usePitchDetector = (settings: TuningSettings) => {
  const [note, setNote] = useState<NoteDetails | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [spectrum, setSpectrum] = useState<Float32Array | null>(null);
  const [waveform, setWaveform] = useState<Float32Array | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const timeDomainDataRef = useRef<Float32Array | null>(null);
  const freqDomainDataRef = useRef<Float32Array | null>(null);

  const smoothedPitchRef = useRef<number>(0);
  const lastNoteIdRef = useRef<string | null>(null);

  // Ref for silence detection
  const framesSinceDetectionRef = useRef<number>(0);

  const processAudio = useCallback(() => {
    if (!analyserRef.current || !timeDomainDataRef.current || !freqDomainDataRef.current || !audioContextRef.current) {
      return;
    }

    analyserRef.current.getFloatTimeDomainData(timeDomainDataRef.current);
    analyserRef.current.getFloatFrequencyData(freqDomainDataRef.current);
    
    // --- Noise Gate based on RMS Volume ---
    let rms = 0;
    for (let i = 0; i < timeDomainDataRef.current.length; i++) {
        rms += timeDomainDataRef.current[i] * timeDomainDataRef.current[i];
    }
    rms = Math.sqrt(rms / timeDomainDataRef.current.length);

    if (rms < NOISE_GATE_THRESHOLD) {
      framesSinceDetectionRef.current++;
      // If we've had silence for a while, clear the display
      if (framesSinceDetectionRef.current >= SILENCE_THRESHOLD) {
          setNote(null);
          setConfidence(0);
          smoothedPitchRef.current = 0;
          lastNoteIdRef.current = null; 
      }
      animationFrameIdRef.current = requestAnimationFrame(processAudio);
      return; // Skip pitch detection for this frame
    }
    // --- End Noise Gate ---

    if (settings.debugMode) {
      setSpectrum(new Float32Array(freqDomainDataRef.current));
    } else {
      setSpectrum(null); // Clear spectrum data if debug mode is off
    }
    
    if (settings.debugWaveform) {
      setWaveform(new Float32Array(timeDomainDataRef.current));
    } else {
      setWaveform(null); // Clear waveform data if debug mode is off
    }

    const { minFreq, maxFreq } = PRESET_CONFIGS[settings.preset];

    // YIN for fundamental frequency
    const { frequency: acFreq, confidence: acConfidence } = findPitchFromAutocorrelation(
      timeDomainDataRef.current, 
      audioContextRef.current.sampleRate,
      minFreq,
      maxFreq
    );
    // HPS for harmonic-aware fundamental frequency
    const { frequency: hpsFreq } = findPitchFromHPS(freqDomainDataRef.current, audioContextRef.current.sampleRate);

    let finalFrequency = -1;
    let currentConfidence = 0;

    // Hybrid logic: Use YIN's confidence but verify with HPS
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

    if (finalFrequency > 0 && currentConfidence > CONFIDENCE_THRESHOLD) {
      framesSinceDetectionRef.current = 0; // Reset silence counter

      // Apply smoothing to the raw detected frequency
      smoothedPitchRef.current = (settings.smoothing * smoothedPitchRef.current) + ((1 - settings.smoothing) * finalFrequency);
      
      const currentNoteDetails = frequencyToNoteDetails(smoothedPitchRef.current, settings);

      if (currentNoteDetails) {
        setNote(currentNoteDetails);
      }
    } else {
      // No clear note detected in this frame
      framesSinceDetectionRef.current++;

      // If we've had silence for a while, clear the display
      if (framesSinceDetectionRef.current >= SILENCE_THRESHOLD) {
          setNote(null);
          smoothedPitchRef.current = 0;
          lastNoteIdRef.current = null; 
      }
    }

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

      const gainNode = context.createGain();
      gainNode.gain.value = 2.5; // Amplify the signal

      const analyser = context.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyserRef.current = analyser;

      // High-pass filter to remove DC offset and rumble
      const hpFilter = context.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.value = 50;

      // Connect nodes: source -> gain -> filter -> analyser
      source.connect(gainNode);
      gainNode.connect(hpFilter);
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

  return { note, confidence, spectrum, waveform, start, stop, isRunning };
};