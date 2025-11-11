


import React, { useState, useRef, useEffect, useCallback, useMemo, useImperativeHandle } from 'react';
import type { TimeSignature, MetronomeSound, Subdivision, BeatEmphasis, SoundEmphasis, TrainerConfig, SilenceConfig, MetronomePreset, AutoStopConfig, MetronomeControls, MetronomePlanConfig } from '../types';
import { SUBDIVISION_PATTERNS } from '../services/data';
import { parseTimeSignature } from '../services/metronomeUtils';

// How far ahead to schedule audio (sec)
const SCHEDULE_AHEAD_TIME = 0.1;
// How often to check for upcoming notes to schedule (ms)
const SCHEDULER_INTERVAL = 25.0;

interface ScheduledNote {
  time: number;
  beat: number;
  isMuted: boolean;
}

export const useMetronome = (ref: React.Ref<MetronomeControls>) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(120);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [sound, setSound] = useState<MetronomeSound>('Click');
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [subdivision, setSubdivision] = useState<Subdivision>('quarter');
  const [emphasisPattern, setEmphasisPattern] = useState<BeatEmphasis[]>(['accent', 'regular', 'regular', 'regular']);
  const [volume, setVolume] = useState<number>(0.75);
  
  // New features state
  const [isSwingActive, setIsSwingActive] = useState<boolean>(false);
  const [isCountInEnabled, setIsCountInEnabled] = useState<boolean>(false);
  const [trainerConfig, setTrainerConfig] = useState<TrainerConfig>({ enabled: false, bpmIncrease: 2, barInterval: 4 });
  const [silenceConfig, setSilenceConfig] = useState<SilenceConfig>({ enabled: false, barsToPlay: 3, barsToMute: 1 });
  const [autoStopConfig, setAutoStopConfig] = useState<AutoStopConfig>({ enabled: false, bars: 16 });
  const [activePresetId, setActivePresetId] = useState<string | null>(null);


  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nextNoteTimeRef = useRef<number>(0.0);
  const schedulerTimerRef = useRef<number | null>(null);
  const tapTempoTimestampsRef = useRef<number[]>([]);
  
  const scheduledNotesRef = useRef<ScheduledNote[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const noteCounterRef = useRef<number>(0); // Persistent counter for beats
  const isMounted = useRef(true);
  const currentBpmRef = useRef<number>(bpm); // For internal scheduler logic
  const prevIsSwingActiveRef = useRef<boolean>(isSwingActive);

  const { beatsPerMeasure, grouping } = useMemo(() => parseTimeSignature(timeSignature), [timeSignature]);

  const cycleEmphasisForBeat = useCallback((beatIndex: number) => {
    setEmphasisPattern(currentPattern => {
        if (beatIndex < 0 || beatIndex >= currentPattern.length) {
            return currentPattern;
        }

        const newPattern = [...currentPattern];
        const currentEmphasis = newPattern[beatIndex];
        
        switch (currentEmphasis) {
            case 'accent':
                newPattern[beatIndex] = 'regular';
                break;
            case 'regular':
                newPattern[beatIndex] = 'silent';
                break;
            case 'silent':
            default:
                newPattern[beatIndex] = 'accent';
                break;
        }
        return newPattern;
    });
  }, []);

  useEffect(() => {
    currentBpmRef.current = bpm;
  }, [bpm]);
  
  useEffect(() => {
    // If swing was just turned on (i.e., it was false before and is now true)
    if (!prevIsSwingActiveRef.current && isSwingActive) {
        // and if we're on quarter notes, switch to eighths to make the swing audible.
        if (subdivision === 'quarter') {
            setSubdivision('eighth');
        }
    }
    // Update the ref for the next render
    prevIsSwingActiveRef.current = isSwingActive;
  }, [isSwingActive, subdivision]);

  // Any change to settings should mark the current preset as "dirty" (i.e., it's now a custom session)
  useEffect(() => {
    setActivePresetId(null);
  }, [bpm, timeSignature, sound, subdivision, emphasisPattern, volume, isSwingActive, isCountInEnabled, trainerConfig, silenceConfig, autoStopConfig]);

  // Update emphasis pattern when time signature changes
  useEffect(() => {
    if (grouping) {
        const newPattern: BeatEmphasis[] = new Array(beatsPerMeasure).fill('regular');
        let currentBeatIndex = 0;
        grouping.forEach(groupSize => {
            if (currentBeatIndex < beatsPerMeasure) {
                newPattern[currentBeatIndex] = 'accent';
            }
            currentBeatIndex += groupSize;
        });
        setEmphasisPattern(newPattern);
    } else {
        const newPattern = new Array(beatsPerMeasure).fill('regular');
        if (newPattern.length > 0) newPattern[0] = 'accent';
        // Preserve user's emphasis settings for other beats if possible
        setEmphasisPattern(current => {
            for(let i=1; i < Math.min(newPattern.length, current.length); i++) {
                newPattern[i] = current[i];
            }
            return newPattern;
        });
    }
  }, [beatsPerMeasure, grouping]);
  
  // Update volume
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  }, [volume]);

  const initializeAudio = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') return audioContextRef.current;
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.error("Browser does not support the Web Audio API, which is required for the metronome.");
      return null;
    }
    const context = new AudioContext();
    audioContextRef.current = context;

    const masterGain = context.createGain();
    masterGain.gain.setValueAtTime(volume, context.currentTime);
    masterGain.connect(context.destination);
    masterGainRef.current = masterGain;

    return context;
  }, [volume]);
  
  const generateSound = useCallback((context: AudioContext, time: number, soundType: MetronomeSound, emphasis: SoundEmphasis) => {
    if (!masterGainRef.current) return;
    let peakGain = 1.0;
    switch (emphasis) {
      case 'primary': peakGain = 1.0; break;
      case 'regular': peakGain = 0.7; break;
      case 'secondary': peakGain = 0.4; break;
      case 'count-in': peakGain = 0.6; break;
    }

    const destination = masterGainRef.current;

    switch (soundType) {
        case 'Kick': {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(destination);
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
            gain.gain.setValueAtTime(peakGain, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            osc.start(time);
            osc.stop(time + 0.15);
            break;
        }
        case 'Click':
        case 'Tick': { // Tick is a high click
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.connect(gain);
          gain.connect(destination);
          osc.type = 'triangle';
          let freq = 1100;
          if (emphasis === 'primary') freq = 1200;
          if (emphasis === 'secondary') freq = 1000;
          if (emphasis === 'count-in') freq = 1500;
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(peakGain, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
          osc.start(time);
          osc.stop(time + 0.02);
          break;
        }
        case 'Tock': { // Tock is a lower click
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.connect(gain);
          gain.connect(destination);
          osc.type = 'triangle';
          let freq = 800;
          if (emphasis === 'primary') freq = 900;
          if (emphasis === 'secondary') freq = 700;
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(peakGain, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
          osc.start(time);
          osc.stop(time + 0.02);
          break;
        }
        case 'Woodblock':
        case 'Clave': {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(soundType === 'Clave' ? 2500 : 2000, time);
            gain.gain.setValueAtTime(peakGain, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            osc.start(time);
            osc.stop(time + 0.1);
            break;
        }
        case 'Rimshot': {
            const noiseDur = 0.05;
            const noiseBuffer = context.createBuffer(1, context.sampleRate * noiseDur, context.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < output.length; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = context.createBufferSource();
            noise.buffer = noiseBuffer;
            
            const noiseGain = context.createGain();
            noiseGain.gain.setValueAtTime(peakGain * 0.5, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + noiseDur);
            
            const bandpass = context.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 1500;
            bandpass.Q.value = 10;
            
            noise.connect(bandpass);
            bandpass.connect(noiseGain);
            noiseGain.connect(destination);
            noise.start(time);
            
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.type = 'triangle';
            osc.frequency.value = 1000;
            gain.gain.setValueAtTime(peakGain, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
            osc.connect(gain);
            gain.connect(destination);
            osc.start(time);
            osc.stop(time + 0.03);
            break;
        }
        case 'Hi-Hat': {
            const dur = 0.1;
            const noiseBuffer = context.createBuffer(1, context.sampleRate * dur, context.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < output.length; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = context.createBufferSource();
            noise.buffer = noiseBuffer;
            
            const highpass = context.createBiquadFilter();
            highpass.type = 'highpass';
            highpass.frequency.value = 7000;

            const gain = context.createGain();
            gain.gain.setValueAtTime(peakGain * 0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            
            noise.connect(highpass);
            highpass.connect(gain);
            gain.connect(destination);
            noise.start(time);
            break;
        }
        case 'Cowbell': {
            const osc1 = context.createOscillator();
            const osc2 = context.createOscillator();
            const gain = context.createGain();
            osc1.type = 'square';
            osc2.type = 'square';
            osc1.frequency.value = 540;
            osc2.frequency.value = 810; // 3:2 ratio
            
            gain.gain.setValueAtTime(peakGain, time);
            gain.gain.exponentialRampToValueAtTime(0.1, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(destination);
            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + 0.2);
            osc2.stop(time + 0.2);
            break;
        }
        case 'Triangle':
        case 'Bell':
        case 'Ping': {
            const fundamental = soundType === 'Ping' ? 2500 : (soundType === 'Bell' ? 600 : 1200);
            const harmonics = [1, 2.0, 3.0, 4.16, 5.43, 6.79, 8.21];
            const harmonicGains = [0.6, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05];
            const dur = soundType === 'Ping' ? 0.3 : 1.0;
            
            const masterGain = context.createGain();
            masterGain.gain.setValueAtTime(peakGain, time);
            masterGain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            masterGain.connect(destination);

            harmonics.forEach((h, i) => {
                const osc = context.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = fundamental * h;
                const gain = context.createGain();
                gain.gain.value = harmonicGains[i] * 0.5;
                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(time);
                osc.stop(time + dur);
            });
            break;
        }
        case 'Shaker': {
            const dur = 0.08;
            const noiseBuffer = context.createBuffer(1, context.sampleRate * dur, context.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < output.length; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = context.createBufferSource();
            noise.buffer = noiseBuffer;
            
            const bandpass = context.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 4000;
            bandpass.Q.value = 1;

            const gain = context.createGain();
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(peakGain * 0.3, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            
            noise.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(destination);
            noise.start(time);
            break;
        }
        case 'Marimba': {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880; // A5
            if (emphasis === 'primary') osc.frequency.value = 1046.5; // C6
            if (emphasis === 'secondary') osc.frequency.value = 659.25; // E5

            const decay = 0.5;
            gain.gain.setValueAtTime(peakGain, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            osc.connect(gain);
            gain.connect(destination);
            osc.start(time);
            osc.stop(time + decay);
            break;
        }
        case 'Beep':
        default: {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(destination);
            let freq = 660.0;
            if (emphasis === 'primary') freq = 880.0;
            if (emphasis === 'secondary') freq = 440.0;
            if (emphasis === 'count-in') freq = 990.0;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(peakGain, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            osc.start(time);
            osc.stop(time + 0.2);
            break;
        }
    }
  }, []);

  const scheduleNote = useCallback((time: number, emphasis: BeatEmphasis, soundEmphasis: SoundEmphasis, isMuted: boolean) => {
    const context = audioContextRef.current;
    if (!context || emphasis === 'silent' || isMuted) return;
    const soundToPlay = sound;
    generateSound(context, time, soundToPlay, soundEmphasis);
  }, [sound, generateSound]);

  const schedulerRef = useRef<() => void>();
  useEffect(() => {
    schedulerRef.current = () => {
        if (!audioContextRef.current) return;
        
        const secondsPerBeat = 60.0 / currentBpmRef.current;
        const totalSilencePatternBars = silenceConfig.barsToPlay + silenceConfig.barsToMute;

        while (nextNoteTimeRef.current < audioContextRef.current.currentTime + SCHEDULE_AHEAD_TIME) {
            const measureNumber = Math.floor(noteCounterRef.current / beatsPerMeasure);

             // Auto-stop logic
            if (autoStopConfig.enabled && measureNumber >= autoStopConfig.bars) {
                if (isMounted.current) setIsPlaying(false); // This will trigger the stopScheduler
                return;
            }
            
            // Trainer Logic
            if (trainerConfig.enabled && measureNumber > 0 && noteCounterRef.current % (beatsPerMeasure * trainerConfig.barInterval) === 0) {
                const newBpm = Math.min(240, currentBpmRef.current + trainerConfig.bpmIncrease);
                if (newBpm !== currentBpmRef.current) {
                  currentBpmRef.current = newBpm;
                  if (isMounted.current) setBpm(newBpm);
                }
            }

            const isMeasureMuted = silenceConfig.enabled && (measureNumber % totalSilencePatternBars) >= silenceConfig.barsToPlay;
            const beatInMeasure = (noteCounterRef.current % beatsPerMeasure);
            const currentBeatEmphasis = emphasisPattern[beatInMeasure] || 'regular';

            // Determine which timings to use for this beat
            let timingsToUse = SUBDIVISION_PATTERNS[subdivision] || [0];
            // Special handling for swing on simple eighth notes
            if (subdivision === 'eighth' && isSwingActive) {
                timingsToUse = [0, 2 / 3];
            } else if (subdivision === 'shuffle' && isSwingActive) { // Treat dedicated shuffle pattern as swing
                timingsToUse = [0, 2 / 3];
            }

            // Schedule all notes within this beat
            timingsToUse.forEach(offset => {
                const time = nextNoteTimeRef.current + offset * secondsPerBeat;
                const isMainBeatClick = offset === 0;

                const beatEmphasisForNote = isMainBeatClick ? currentBeatEmphasis : 'regular';
                const soundEmphasisForNote: SoundEmphasis = isMainBeatClick 
                    ? (currentBeatEmphasis === 'accent' ? 'primary' : 'regular') 
                    : 'regular';
                
                scheduleNote(time, beatEmphasisForNote, soundEmphasisForNote, isMeasureMuted);
            });
            
            // Only push the main beat to the visualizer schedule
            scheduledNotesRef.current.push({ time: nextNoteTimeRef.current, beat: beatInMeasure + 1, isMuted: isMeasureMuted });

            noteCounterRef.current++;
            nextNoteTimeRef.current += secondsPerBeat;
        }
    }
  }, [beatsPerMeasure, scheduleNote, subdivision, emphasisPattern, trainerConfig, silenceConfig, autoStopConfig, isSwingActive]);

  const visualUpdater = useCallback(() => {
    if (!audioContextRef.current || !isMounted.current || !isPlaying) {
      animationFrameIdRef.current = null;
      return;
    }

    // This is the recursive call for the animation loop
    animationFrameIdRef.current = requestAnimationFrame(visualUpdater);

    if (scheduledNotesRef.current.length === 0) {
        // No notes scheduled yet, just wait for the next frame
        return;
    }

    const now = audioContextRef.current.currentTime;
    
    const pruneTime = now - 2.0; 
    const pruneIndex = scheduledNotesRef.current.findIndex(note => note.time >= pruneTime);
    if (pruneIndex > 1) { 
        scheduledNotesRef.current.splice(0, pruneIndex - 1);
    }
    
    const VISUAL_LOOKAHEAD = 0.020; // 20ms
    let beatToDisplay = 0;

    for (let i = scheduledNotesRef.current.length - 1; i >= 0; i--) {
        const note = scheduledNotesRef.current[i];
        const visualStartTime = note.time - VISUAL_LOOKAHEAD;

        if (now >= visualStartTime) {
            beatToDisplay = note.beat;
            break;
        }
    }
    
    setCurrentBeat(beatToDisplay);
  }, [isPlaying]);

  const startScheduler = useCallback(() => {
    const context = initializeAudio();
    if (!context) {
        setIsPlaying(false);
        return;
    }
    if (context.state === 'suspended') context.resume();
    
    currentBpmRef.current = bpm;
    scheduledNotesRef.current = [];
    noteCounterRef.current = 0;
    nextNoteTimeRef.current = context.currentTime;
    tapTempoTimestampsRef.current = [];
    
    if (isCountInEnabled) {
        const secondsPerBeat = 60.0 / currentBpmRef.current;
        for (let i = 0; i < beatsPerMeasure; i++) {
            const time = nextNoteTimeRef.current + i * secondsPerBeat;
            scheduleNote(time, 'regular', 'count-in', false);
        }
        nextNoteTimeRef.current += beatsPerMeasure * secondsPerBeat;
    }
    
    schedulerRef.current?.();
    const timerId = window.setInterval(() => schedulerRef.current?.(), SCHEDULER_INTERVAL);
    schedulerTimerRef.current = timerId;
    
    // Start visual loop
    visualUpdater();
  }, [initializeAudio, bpm, isCountInEnabled, beatsPerMeasure, scheduleNote, visualUpdater]);
  
  const stopScheduler = useCallback(() => {
    if (schedulerTimerRef.current) {
        window.clearInterval(schedulerTimerRef.current);
        schedulerTimerRef.current = null;
    }
    if (animationFrameIdRef.current) {
      // FIX: Use window.cancelAnimationFrame for consistency and to avoid scope issues.
      window.cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
        audioContextRef.current = null;
    }
    // FIX: Use window.setTimeout for consistency and to avoid scope issues.
    window.setTimeout(() => { if (isMounted.current) setCurrentBeat(0); }, 100);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(p => !p);
  }, []);

  useEffect(() => {
    if (isPlaying) startScheduler();
    else stopScheduler();
  }, [isPlaying, startScheduler, stopScheduler]);

  const playSoundPreview = useCallback((soundType: MetronomeSound) => {
    const context = initializeAudio();
    if (!context) return;
    if (context.state === 'suspended') context.resume();
    generateSound(context, context.currentTime, soundType, 'primary');
  }, [initializeAudio, generateSound]);

  const tapTempo = useCallback(() => {
    const now = performance.now();
    const newTimestamps = [...tapTempoTimestampsRef.current, now];

    if (newTimestamps.length > 1 && (now - newTimestamps[newTimestamps.length - 2]) > 2000) {
        tapTempoTimestampsRef.current = [now];
        return;
    }
    
    tapTempoTimestampsRef.current = newTimestamps;
    if (tapTempoTimestampsRef.current.length < 2) return;

    if (tapTempoTimestampsRef.current.length > 5) {
        tapTempoTimestampsRef.current.shift();
    }
    
    const intervals = [];
    for (let i = 1; i < tapTempoTimestampsRef.current.length; i++) {
        intervals.push(tapTempoTimestampsRef.current[i] - tapTempoTimestampsRef.current[i - 1]);
    }

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    if (averageInterval > 0) {
        const newBpm = Math.round(60000 / averageInterval);
        setBpm(Math.max(40, Math.min(240, newBpm)));
    }
  }, []);

  const loadPreset = useCallback((preset: MetronomePreset) => {
    setIsPlaying(false);
    setBpm(preset.bpm);
    setTimeSignature(preset.timeSignature);
    setSubdivision(preset.subdivision);
    setEmphasisPattern(preset.emphasisPattern);
    setIsSwingActive(preset.isSwingActive);
    setSound(preset.sound);
    setVolume(preset.volume);
    setIsCountInEnabled(preset.isCountInEnabled);
    setTrainerConfig(preset.trainerConfig);
    setSilenceConfig(preset.silenceConfig);
    setAutoStopConfig(preset.autoStopConfig);
    setActivePresetId(preset.id);
  }, []);

  const setConfig = useCallback((config: MetronomePlanConfig) => {
    setIsPlaying(false);
    if(config.bpm) setBpm(config.bpm);
    if(config.timeSignature) setTimeSignature(config.timeSignature);
    if(config.subdivision) setSubdivision(config.subdivision);
    if(config.isSwingActive !== undefined) setIsSwingActive(config.isSwingActive);
    if(config.trainerConfig) setTrainerConfig(config.trainerConfig);
    if(config.silenceConfig) setSilenceConfig(config.silenceConfig);
    if(config.autoStopConfig) setAutoStopConfig(config.autoStopConfig);
  }, []);

  useImperativeHandle(ref, () => ({
    setConfig,
    play: () => setIsPlaying(true),
    stop: () => setIsPlaying(false),
    togglePlay: togglePlay,
  }));

  useEffect(() => {
    isMounted.current = true;
    return () => {
        isMounted.current = false;
        stopScheduler();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
    };
  }, [stopScheduler]);

  return {
    isPlaying, bpm, setBpm, timeSignature, setTimeSignature, sound, setSound,
    currentBeat, togglePlay, beatsPerMeasure, grouping, playSoundPreview, tapTempo,
    subdivision, setSubdivision, emphasisPattern, setEmphasisPattern, volume, setVolume,
    isSwingActive, setIsSwingActive, isCountInEnabled, setIsCountInEnabled,
    trainerConfig, setTrainerConfig, silenceConfig, setSilenceConfig,
    autoStopConfig, setAutoStopConfig,
    activePresetId, loadPreset,
    cycleEmphasisForBeat,
  };
};