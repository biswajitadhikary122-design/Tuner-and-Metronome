
import type { InstrumentPreset, Raga, Scale, ScaleCategory, InstrumentDefinition } from "../types";
export { NOTATION_MAPS, NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from './musicConstants';

// --- Data from old application ---
export const PRESET_CONFIGS: Record<InstrumentPreset, { minFreq: number; maxFreq: number }> = {
    'Guitar': { minFreq: 70, maxFreq: 1400 }, 'Bass (4-String)': { minFreq: 35, maxFreq: 450 }, 'Ukulele': { minFreq: 250, maxFreq: 500 }, 'Sitar': { minFreq: 120, maxFreq: 900 }, 'Violin': { minFreq: 180, maxFreq: 4000 }, 'Viola': { minFreq: 125, maxFreq: 1500 }, 'Cello': { minFreq: 60, maxFreq: 950 }, 'Double Bass': { minFreq: 35, maxFreq: 250 }, 'Piano': { minFreq: 25, maxFreq: 4200 }, 'Flute': { minFreq: 250, maxFreq: 2200 }, 'Clarinet (Bb)': { minFreq: 140, maxFreq: 1700 }, 'Saxophone (Alto)': { minFreq: 130, maxFreq: 900 }, 'Trumpet (Bb)': { minFreq: 160, maxFreq: 1000 }, 'Trombone': { minFreq: 75, maxFreq: 750 }, 'Tuba': { minFreq: 35, maxFreq: 400 }, 'Voice (General)': { minFreq: 80, maxFreq: 1100 }, 'Chromatic': { minFreq: 16, maxFreq: 4200 }, 'Hz (Manual)': { minFreq: 20, maxFreq: 5000 },
};

export const GUITAR_STANDARD_TUNING = [64, 59, 55, 50, 45, 40]; // MIDI notes for EADGBe
export const SITAR_STANDARD_TUNING = [43, 48, 40, 31, 26, 60, 62]; // A common 7-string tuning in MIDI

export const PRESET_CATEGORIES = [
    { category: 'Strings (Plucked)', instruments: ['Guitar', 'Bass (4-String)', 'Ukulele', 'Sitar'] },
    { category: 'Strings (Bowed)', instruments: ['Violin', 'Viola', 'Cello', 'Double Bass'] },
    { category: 'Keyboard', instruments: ['Piano'] },
    { category: 'Woodwind', instruments: ['Flute', 'Clarinet (Bb)', 'Saxophone (Alto)'] },
    { category: 'Brass', instruments: ['Trumpet (Bb)', 'Trombone', 'Tuba'] },
    { category: 'Voice', instruments: ['Voice (General)'] },
    { category: 'General', instruments: ['Chromatic', 'Hz (Manual)'] }
];

export const SUBDIVISION_PATTERNS: Record<string, number[]> = {
    'quarter': [0],
    'eighth': [0, 0.5],
    'triplet': [0, 1 / 3, 2 / 3],
    'sixteenth': [0, 0.25, 0.5, 0.75],
    'thirty-second': [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875],
    'quintuplet': [0, 0.2, 0.4, 0.6, 0.8],
    'sextuplet': [0, 1/6, 2/6, 3/6, 4/6, 5/6],
    'septuplet': [0, 1/7, 2/7, 3/7, 4/7, 5/7, 6/7],
    'shuffle': [0, 2 / 3],
    'dotted-eighth-sixteenth': [0, 0.75],
    'eighth-two-sixteenths': [0, 0.5, 0.75],
    'two-sixteenths-eighth': [0, 0.25, 0.5],
    'sixteenth-eighth-sixteenth': [0, 0.25, 0.75],
    'eighth-rest-eighth': [0.5],
};

export const TIME_SIGNATURES_DATA: string[][] = [
  [
    '1/4', '2/4', '3/4', '4/4', '5/4', '6/4', '7/4', '8/4', '9/4', '10/4', 
    '11/4', '12/4', '13/4', '14/4', '15/4', '16/4',
    '1/2', '2/2', '3/2', '4/2',
    '5/2', '6/2', '7/2', '8/2', '9/2', '10/2', '11/2', '12/2', '13/2', '14/2',
    '15/2', '16/2'
  ],
  [
    '1/8', '2/8', '3/8', '4/8', '5/8', '6/8', '7/8', '8/8', '9/8', '10/8', 
    '11/8', '12/8', '13/8', '14/8', '15/8', '16/8'
  ],
  [
    '5/8 (3+2)', '5/8 (2+3)',
    '7/8 (3+2+2)', '7/8 (2+2+3)', '7/8 (2+3+2)',
    '9/8 (2+2+2+3)', '9/8 (2+2+3+2)', '9/8 (2+3+2+2)', '9/8 (3+2+2+2)',
    '1/16', '2/16', '3/16', '4/16', '5/16', '6/16', '7/16', '8/16', 
    '9/16', '10/16', '11/16', '12/16', '13/16', '14/16', '15/16', '16/16'
  ],
];

// --- Instrument Transposition Data ---
// 'offset' is semitones to subtract from Concert Pitch to get Written Pitch.
// e.g. Bb Trumpet: Written C sounds Bb. Concert Pitch = Written - 2. 
// So Offset = -2. 
export const INSTRUMENT_DATA: Record<string, InstrumentDefinition> = {
  // --- C Instruments (Concert Pitch) ---
  "Flute": { name: "Flute", offset: 0, octave: 0 },
  "Oboe": { name: "Oboe", offset: 0, octave: 0 },
  "Bassoon": { name: "Bassoon", offset: 0, octave: 0 },
  "Violin": { name: "Violin", offset: 0, octave: 0 },
  "Viola": { name: "Viola", offset: 0, octave: 0 },
  "Cello": { name: "Cello", offset: 0, octave: 0 },
  "Trombone": { name: "Trombone", offset: 0, octave: 0 },
  "Tuba": { name: "Tuba", offset: 0, octave: 0 },
  "Piano": { name: "Piano", offset: 0, octave: 0 },
  "Harp": { name: "Harp", offset: 0, octave: 0 },

  // --- Higher Octave Transposition ---
  "Glockenspiel": { name: "Glockenspiel", offset: 0, octave: 2 }, // Sounds 2 octaves higher
  "Piccolo": { name: "Piccolo", offset: 0, octave: 1 }, // Sounds 1 octave higher
  "Xylophone": { name: "Xylophone", offset: 0, octave: 1 },
  "Celesta": { name: "Celesta", offset: 0, octave: 1 },
  "Recorder (Soprano)": { name: "Recorder (Sop)", offset: 0, octave: 1 },

  // --- Lower Octave Transposition ---
  "Double Bass": { name: "Double Bass", offset: 0, octave: -1 }, // Sounds 1 octave lower
  "Guitar": { name: "Guitar", offset: 0, octave: -1 },
  "Bass Flute": { name: "Bass Flute", offset: 0, octave: -1 },
  "Contrabassoon": { name: "Contrabassoon", offset: 0, octave: -1 },
  "Bass Guitar": { name: "Bass Guitar", offset: 0, octave: -1 },

  // --- Eb Instruments (Minor 3rd Higher or Major 6th Lower) ---
  "Eb Clarinet": { name: "Eb Clarinet", offset: 3, octave: 0 }, // Sounds m3 higher
  "Eb Cornet": { name: "Eb Cornet", offset: 3, octave: 0 }, // Sounds m3 higher
  "Alto Sax": { name: "Alto Sax", offset: 3, octave: -1 }, // Sounds M6 lower
  "Alto Clarinet": { name: "Alto Clarinet", offset: 3, octave: -1 }, // Sounds M6 lower
  "Eb Alto Horn": { name: "Eb Alto Horn", offset: 3, octave: -1 }, // Sounds M6 lower
  "Baritone Sax": { name: "Baritone Sax", offset: 3, octave: -2 }, // Sounds 8ve + M6 lower
  "Contra-alto Clar": { name: "Contra-alto Clar", offset: 3, octave: -2 }, // Sounds 8ve + M6 lower

  // --- Bb Instruments (Major 2nd Lower or Major 9th Lower) ---
  "Bb Trumpet": { name: "Bb Trumpet", offset: -2, octave: 0 }, // Sounds M2 lower
  "Bb Clarinet": { name: "Bb Clarinet", offset: -2, octave: 0 }, // Sounds M2 lower
  "Soprano Sax": { name: "Soprano Sax", offset: -2, octave: 0 }, // Sounds M2 lower
  "Tenor Sax": { name: "Tenor Sax", offset: -2, octave: -1 }, // Sounds M9 lower
  "Bass Clarinet": { name: "Bass Clarinet", offset: -2, octave: -1 }, // Sounds M9 lower
  "Euphonium TC": { name: "Euphonium TC", offset: -2, octave: -1 }, // Sounds M9 lower
  "Contrabass Clar": { name: "Contrabass Clar", offset: -2, octave: -2 }, // Sounds 2 8ve + M2 lower

  // --- F Instruments (Perfect 5th Lower) ---
  "French Horn": { name: "French Horn", offset: 5, octave: -1 }, // Sounds P5 lower
  "English Horn": { name: "English Horn", offset: 5, octave: -1 }, // Sounds P5 lower
  "Basset Horn": { name: "Basset Horn", offset: 5, octave: -1 }, // Sounds P5 lower

  // --- G Instruments (Perfect 4th Lower) ---
  "Alto Flute": { name: "Alto Flute (G)", offset: -5, octave: 0 }, // Sounds P4 lower

  // --- A Instruments (Minor 3rd Lower) ---
  "A Clarinet": { name: "A Clarinet", offset: -3, octave: 0 }, // Sounds m3 lower
  "Oboe d'Amore": { name: "Oboe d'Amore", offset: -3, octave: 0 }, // Sounds m3 lower
};

// Ordered list for selectors if needed elsewhere
export const INSTRUMENT_GROUPS = [
    { group: "Standard Keys", items: ["C Instruments", "Bb Trumpet", "Alto Sax", "French Horn"] },
    { group: "Extended Range", items: ["Piccolo", "Tenor Sax", "Baritone Sax", "Guitar"] }
];

// --- New Data for Sitar App ---

export const RAGA_SCALES: Record<string, Raga> = {
    'yaman': { name: 'Yaman', intervals: [0, 2, 4, 6, 7, 9, 11], thaat: 'Kalyan', time: 'Evening', mood: 'Peaceful, Devotional' },
    'bilawal': { name: 'Bilawal', intervals: [0, 2, 4, 5, 7, 9, 11], thaat: 'Bilawal', time: 'Morning', mood: 'Joyful, Light' },
    'bhairav': { name: 'Bhairav', intervals: [0, 1, 4, 5, 7, 8, 11], thaat: 'Bhairav', time: 'Early Morning', mood: 'Devotional, Serious' },
    'kafi': { name: 'Kafi', intervals: [0, 2, 3, 5, 7, 9, 10], thaat: 'Kafi', time: 'Late Night', mood: 'Romantic, Sensual' },
    'bhupali': { name: 'Bhupali', intervals: [0, 2, 4, 7, 9], thaat: 'Kalyan', time: 'Evening', mood: 'Peaceful, Meditative' },
};

export const WESTERN_SCALES: Record<string, Scale> = {
    'major': { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
    'natural_minor': { name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
    'harmonic_minor': { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
    'melodic_minor': { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11] },
    'major_pentatonic': { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
    'minor_pentatonic': { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
    'blues': { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
    'dorian': { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
    'phrygian': { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10] },
    'lydian': { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11] },
    'mixolydian': { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
    'locrian': { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10] },
    'whole_tone': { name: 'Whole Tone', intervals: [0, 2, 4, 6, 8, 10] },
};

export const ALL_SCALES: Record<string, Scale> = { ...RAGA_SCALES, ...WESTERN_SCALES };

export const SCALE_HIERARCHY: ScaleCategory[] = [
    {
        name: 'Western Scales',
        subcategories: [
            { name: 'Major & Minor', scales: { major: WESTERN_SCALES.major, natural_minor: WESTERN_SCALES.natural_minor, harmonic_minor: WESTERN_SCALES.harmonic_minor, melodic_minor: WESTERN_SCALES.melodic_minor } },
            { name: 'Pentatonic', scales: { major_pentatonic: WESTERN_SCALES.major_pentatonic, minor_pentatonic: WESTERN_SCALES.minor_pentatonic, blues: WESTERN_SCALES.blues } },
            { name: 'Modes', scales: { dorian: WESTERN_SCALES.dorian, phrygian: WESTERN_SCALES.phrygian, lydian: WESTERN_SCALES.lydian, mixolydian: WESTERN_SCALES.mixolydian, locrian: WESTERN_SCALES.locrian } },
            { name: 'Symmetrical', scales: { whole_tone: WESTERN_SCALES.whole_tone } }
        ]
    },
    {
        name: 'Indian Scales',
        subcategories: [
            { name: 'Common Ragas', scales: RAGA_SCALES }
        ]
    }
];

export const THEORY_CONTENT: Record<string, { uniqueConcepts: { title: string, content: string }[], scales: { name: string, notes: string[] }[], commonChords: { name: string, notes: string[], positions?: any[] }[] }> = {
    'Guitar': {
        uniqueConcepts: [
            { title: "Anatomy of the Guitar", content: "A guitar has a body, neck, fretboard, and headstock. The strings are stretched over the fretboard, and pressing a string against a metal strip called a 'fret' changes its pitch." },
            { title: "Standard Tuning", content: "The most common tuning is E-A-D-G-B-E, from the thickest string (lowest pitch) to the thinnest (highest pitch)." }
        ],
        scales: [
            { name: "A Minor Pentatonic (Position 1)", notes: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'] }
        ],
        commonChords: [
            { name: "G Major (Open)", notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'], positions: [{ string: 6, fret: 3 }, { string: 5, fret: 2 }, { string: 4, fret: 0 }, { string: 3, fret: 0 }, { string: 2, fret: 0 }, { string: 1, fret: 3 }] },
            { name: "C Major (Open)", notes: ['C3', 'E3', 'G3', 'C4', 'E4'], positions: [{ string: 6, fret: 'x' }, { string: 5, fret: 3 }, { string: 4, fret: 2 }, { string: 3, fret: 0 }, { string: 2, fret: 1 }, { string: 1, fret: 0 }] },
            { name: "D Major (Open)", notes: ['D3', 'A3', 'D4', 'F#4'], positions: [{ string: 6, fret: 'x' }, { string: 5, fret: 'x' }, { string: 4, fret: 0 }, { string: 3, fret: 2 }, { string: 2, fret: 3 }, { string: 1, fret: 2 }] }
        ]
    },
    'Piano': {
        uniqueConcepts: [
            { title: "The Keyboard Layout", content: "The piano keyboard is a repeating pattern of 12 keys: 7 white and 5 black. The white keys are the natural notes (C, D, E, F, G, A, B). The black keys are the sharps and flats." },
            { title: "Finding Middle C", content: "Middle C (C4) is the C key closest to the center of the piano. It's often the 'C' just to the left of a group of two black keys." }
        ],
        scales: [
            { name: "C Major Scale", notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] }
        ],
        commonChords: [
            { name: "C Major", notes: ['C4', 'E4', 'G4'] },
            { name: "G Major", notes: ['G4', 'B4', 'D5'] },
            { name: "F Major", notes: ['F4', 'A4', 'C5'] }
        ]
    }
};

export const INSPIRATIONAL_QUOTES = [
  { text: "The woods would be very silent if no birds sang there except those that sang best.", author: "Henry Van Dyke" },
  { text: "Music expresses that which cannot be said and on which it is impossible to be silent.", author: "Victor Hugo" },
  { text: "Where words fail, music speaks.", author: "Hans Christian Andersen" },
  { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche" },
  { text: "Music is the shorthand of emotion.", author: "Leo Tolstoy" },
  { text: "The only truth is music.", author: "Jack Kerouac" },
  { text: "Music is the strongest form of magic.", author: "Marilyn Manson" },
  { text: "After silence, that which comes nearest to expressing the inexpressible is music.", author: "Aldous Huxley" },
  { text: "Music gives a soul to the universe, wings to the mind, flight to the imagination and life to everything.", author: "Plato" },
  { text: "If I were not a physicist, I would probably be a musician. I often think in music. I live my daydreams in music. I see my life in terms of music.", author: "Albert Einstein" },
];
