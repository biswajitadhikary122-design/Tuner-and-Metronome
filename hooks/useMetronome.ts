
import { useState, useRef, useEffect, useCallback } from 'react';
import type { TimeSignature, MetronomeSound, Subdivision, BeatEmphasis, SoundEmphasis, TrainerConfig, SilenceConfig, MetronomePreset, AutoStopConfig } from '../types';

// How far ahead to schedule audio (sec)
const SCHEDULE_AHEAD_TIME = 0.1;
// How often to check for upcoming notes to schedule (ms)
const SCHEDULER_INTERVAL = 25.0;

interface ScheduledNote {
  time: number;
  beat: number;
  isMuted: boolean;
}

export const useMetronome = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(120);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [sound, setSound] = useState<MetronomeSound>('Click');
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [subdivision, setSubdivision] = useState<Subdivision>('1n');
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

  const beatsPerMeasure = parseInt(timeSignature.split('/')[0], 10);

  useEffect(() => {
    currentBpmRef.current = bpm;
  }, [bpm]);
  
  // Any change to settings should mark the current preset as "dirty" (i.e., it's now a custom session)
  useEffect(() => {
    setActivePresetId(null);
  }, [bpm, timeSignature, sound, subdivision, emphasisPattern, volume, isSwingActive, isCountInEnabled, trainerConfig, silenceConfig, autoStopConfig]);

  // Update emphasis pattern when time signature changes
  useEffect(() => {
    const newBeats = parseInt(timeSignature.split('/')[0], 10);
    setEmphasisPattern(currentPattern => {
        const newPattern = new Array(newBeats).fill('regular');
        newPattern[0] = 'accent';
        for (let i = 1; i < Math.min(newBeats, currentPattern.length); i++) {
            newPattern[i] = currentPattern[i];
        }
        return newPattern;
    });
  }, [timeSignature]);
  
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
        case 'Click': {
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
    const soundToPlay = soundEmphasis === 'secondary' ? 'Tick' : sound;
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

            const isMuted = silenceConfig.enabled && (measureNumber % totalSilencePatternBars) >= silenceConfig.barsToPlay;
            const beatInMeasure = (noteCounterRef.current % beatsPerMeasure);
            const currentEmphasis = emphasisPattern[beatInMeasure] || 'regular';

            scheduleNote(nextNoteTimeRef.current, currentEmphasis, currentEmphasis === 'accent' ? 'primary' : 'regular', isMuted);
            scheduledNotesRef.current.push({ time: nextNoteTimeRef.current, beat: beatInMeasure + 1, isMuted });

            // Schedule subdivisions
            if (subdivision !== '1n') {
                const swingOffset = isSwingActive ? secondsPerBeat * (2/3) : secondsPerBeat * 0.5;
                const subBeatDurations: Record<Subdivision, number[]> = {
                    '1n': [],
                    '2n': [swingOffset],
                    '3n': [secondsPerBeat / 3, secondsPerBeat * (2/3)],
                    '4n': [secondsPerBeat * 0.25, secondsPerBeat * 0.5, secondsPerBeat * 0.75]
                };
                subBeatDurations[subdivision].forEach(offset => {
                    const subTime = nextNoteTimeRef.current + offset;
                    scheduleNote(subTime, 'regular', 'secondary', isMuted);
                });
            }

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

    const now = audioContextRef.current.currentTime;
    
    const pruneTime = now - 1.0; 
    const pruneIndex = scheduledNotesRef.current.findIndex(note => note.time >= pruneTime);
    if (pruneIndex > 1) { 
        scheduledNotesRef.current.splice(0, pruneIndex - 1);
    }
    
    let lastPassedNote: ScheduledNote | null = null;
    for (let i = scheduledNotesRef.current.length - 1; i >= 0; i--) {
        if (scheduledNotesRef.current[i].time <= now) {
            lastPassedNote = scheduledNotesRef.current[i];
            break;
        }
    }
    
    if (lastPassedNote) {
        if (currentBeat !== lastPassedNote.beat) {
             setCurrentBeat(lastPassedNote.beat);
        }
    }
    
    animationFrameIdRef.current = requestAnimationFrame(visualUpdater);
  }, [isPlaying, currentBeat]);

  useEffect(() => {
    if (isPlaying) {
        visualUpdater();
    } else {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
    }
    return () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
    };
  }, [isPlaying, visualUpdater]);

  const startScheduler = useCallback(() => {
    const context = initializeAudio();
    if (!context) {
        setIsPlaying(false);
        return;
    }
    if (context.state === 'suspended') context.resume();
    
    currentBpmRef.current = bpm;
    setCurrentBeat(0);
    scheduledNotesRef.current = [];
    noteCounterRef.current = 0;
    nextNoteTimeRef.current = context.currentTime + 0.1;
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
  }, [initializeAudio, bpm, isCountInEnabled, beatsPerMeasure, scheduleNote]);
  
  const stopScheduler = useCallback(() => {
    if (schedulerTimerRef.current) {
        window.clearInterval(schedulerTimerRef.current);
        schedulerTimerRef.current = null;
    }
    setTimeout(() => { if (isMounted.current) setCurrentBeat(0); }, 100);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

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

  useEffect(() => {
    isMounted.current = true;
    return () => {
        isMounted.current = false;
        stopScheduler();
        audioContextRef.current?.close();
    };
  }, [stopScheduler]);

  return {
    isPlaying, bpm, setBpm, timeSignature, setTimeSignature, sound, setSound,
    currentBeat, togglePlay, beatsPerMeasure, playSoundPreview, tapTempo,
    subdivision, setSubdivision, emphasisPattern, setEmphasisPattern, volume, setVolume,
    isSwingActive, setIsSwingActive, isCountInEnabled, setIsCountInEnabled,
    trainerConfig, setTrainerConfig, silenceConfig, setSilenceConfig,
    autoStopConfig, setAutoStopConfig,
    activePresetId, loadPreset,
  };
};