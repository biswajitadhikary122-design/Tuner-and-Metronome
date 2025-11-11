

export type InstrumentPreset = 
  'Guitar' | 
  'Bass (4-String)' | 
  'Ukulele' |
  'Sitar' |
  'Violin' | 
  'Viola' | 
  'Cello' | 
  'Double Bass' |
  'Piano' |
  'Flute' | 
  'Clarinet (Bb)' | 
  'Saxophone (Alto)' |
  'Trumpet (Bb)' | 
  'Trombone' | 
  'Tuba' |
  'Voice (General)' |
  'Chromatic' |
  'Hz (Manual)';

export type Temperament = 'Equal' | 'Just';
export type NotationSystem = 'English' | 'Solfege (Fixed Do)' | 'Northern European' | 'Indian (Sargam)';
export type VisualizerMode = 'orb' | 'linear' | 'pano' | 'strobe';

export interface TuningSettings {
  a4: number;
  useSharps: boolean;
  smoothing: number;
  preset: InstrumentPreset;
  debugMode: boolean;
  darkMode: boolean;
  transposition: number; // Calculated semitone offset
  selectedInstrumentKey: string; // Key for the instrument map (e.g., "Bb Instruments")
  temperament: Temperament;
  notationSystem: NotationSystem;
  tuningTolerance: number;
  visualizerMode: VisualizerMode;
  targetFrequency?: number;
  debugWaveform?: boolean;
  voiceFeedback?: boolean;
  timbreVisualizer?: boolean;
}

// --- New Types for Sitar App ---

export interface Scale {
  name: string;
  intervals: number[]; // in semitones from the root
}

export interface Raga extends Scale {
  thaat: string; // Parent scale
  time: string; // Time of day
  mood: string; // Emotional characteristic
}

// --- Added missing type exports ---

export interface NoteDetails {
  name: string;
  octave: number | string;
  frequency: number;
  cents: number;
}

// --- Metronome Types ---
export type TimeSignature = string;
export type MetronomeSound = 'Click' | 'Woodblock' | 'Beep' | 'Kick' | 'Hi-Hat' | 'Cowbell' | 'Tick' | 'Tock' | 'Bell' | 'Ping' | 'Clave' | 'Rimshot' | 'Shaker' | 'Triangle' | 'Marimba';
export type Subdivision = string;
export type BeatEmphasis = 'accent' | 'regular' | 'silent';
export type SoundEmphasis = 'primary' | 'regular' | 'secondary' | 'count-in';

export interface TrainerConfig {
    enabled: boolean;
    bpmIncrease: number;
    barInterval: number;
}

export interface SilenceConfig {
    enabled: boolean;
    barsToPlay: number;
    barsToMute: number;
}

export interface AutoStopConfig {
    enabled: boolean;
    bars: number;
}

export interface MetronomePreset {
    id: string;
    name: string;
    bpm: number;
    timeSignature: TimeSignature;
    subdivision: Subdivision;
    emphasisPattern: BeatEmphasis[];
    isSwingActive: boolean;
    sound: MetronomeSound;
    volume: number;
    isCountInEnabled: boolean;
    trainerConfig: TrainerConfig;
    silenceConfig: SilenceConfig;
    autoStopConfig: AutoStopConfig;
    isDefault?: boolean;
}

export interface MetronomePlanConfig {
    bpm?: number;
    timeSignature?: TimeSignature;
    subdivision?: Subdivision;
    isSwingActive?: boolean;
    trainerConfig?: TrainerConfig;
    silenceConfig?: SilenceConfig;
    autoStopConfig?: AutoStopConfig;
}

export interface MetronomeControls {
    setConfig: (config: MetronomePlanConfig) => void;
    play: () => void;
    stop: () => void;
    togglePlay: () => void;
}


// --- Practice Plan Types ---
export interface PlanStep {
    module: 'Tuner' | 'Metronome' | 'Message';
    task: string;
    duration_seconds: number;
    config?: MetronomePlanConfig;
}


// --- Piano Sound Types ---
export const PIANO_SOUND_CATEGORIES = [
    {
        category: 'Acoustic Grand Pianos',
        types: ['Parlor / Living Room Grand', 'Concert Grand', 'Honky Tonk / Bar Room Piano'] as const,
    },
    {
        category: 'Electric Pianos',
        types: ['Classic Electric Piano', 'Wurly', 'FM Electric Piano'] as const,
    },
    {
        category: 'Synth & Other',
        types: ['Synth Pad', 'Harpsichord', 'Celesta'] as const,
    }
];

type PianoSoundTuple = typeof PIANO_SOUND_CATEGORIES;
type AcousticSounds = PianoSoundTuple[0]['types'][number];
type ElectricSounds = PianoSoundTuple[1]['types'][number];
type SynthSounds = PianoSoundTuple[2]['types'][number];
export type PianoSoundType = AcousticSounds | ElectricSounds | SynthSounds | 'sine' | 'Sitar';

// --- Other UI Types ---
export type InstrumentView = 'Piano' | 'Guitar';
export type ScaleData = Scale;

export interface ScaleSubcategory {
    name: string;
    scales: Record<string, ScaleData>;
}
export interface ScaleCategory {
    name: string;
    subcategories: ScaleSubcategory[];
}

// --- Transposition Data Type ---
export interface InstrumentDefinition {
  name: string;
  offset: number; // Semitones to subtract from Concert Pitch to get Written Pitch
  octave: number; // Octave shift
}
