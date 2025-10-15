
export interface NoteDetails {
  name: string;
  octave: number | string; // Allow string for 'Hz' unit
  frequency: number;
  cents: number;
}

export type InstrumentPreset = 
  'Guitar' | 
  'Bass (4-String)' | 
  'Ukulele' |
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
export type NotationSystem = 'English' | 'Solfege (Fixed Do)' | 'Northern European';

export interface TuningSettings {
  a4: number;
  useSharps: boolean;
  smoothing: number;
  preset: InstrumentPreset;
  debugMode: boolean;
  debugWaveform: boolean;
  timbreVisualizer: boolean;
  darkMode: boolean;
  voiceFeedback: boolean;
  transposition: number; // In semitones
  temperament: Temperament;
  notationSystem: NotationSystem;
  tuningTolerance: number; // In cents
  targetFrequency?: number; // For Hz (Manual) mode
}

export type MetronomeSound = 'Click' | 'Woodblock' | 'Beep' | 'Kick' | 'Hi-Hat' | 'Cowbell' | 'Tick' | 'Tock' | 'Bell' | 'Ping' | 'Clave' | 'Rimshot' | 'Shaker' | 'Triangle' | 'Marimba';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '5/4' | '6/8' | '7/8' | '9/8' | '12/8';

export type Subdivision = '1n' | '2n' | '3n' | '4n'; // Quarter, Eighth, Triplet, Sixteenth
export type BeatEmphasis = 'accent' | 'regular' | 'silent';
export type SoundEmphasis = 'primary' | 'secondary' | 'regular' | 'count-in';

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
}


export interface ChordNote {
  name: string;
  octave: number;
  frequency: number;
  cents: number;
  isBassNote: boolean;
}

export interface ChordDetails {
  chordName: string;
  notes: ChordNote[];
}

export type Progression = ChordDetails[];

export type InstrumentView = 'Piano' | 'Guitar';

// New types for offline theory content
export interface Scale {
  name: string;
  description: string;
  notes: string[]; // e.g., ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]
}

export interface ChordVoicing {
  name: string;
  notes: string[];
  positions?: { string: number; fret: number | 'x' | 'o' }[];
}

export interface UniqueConcept {
  title: string;
  content: string;
}

export interface InstrumentTheory {
  scales: Scale[];
  commonChords: ChordVoicing[];
  uniqueConcepts: UniqueConcept[];
}