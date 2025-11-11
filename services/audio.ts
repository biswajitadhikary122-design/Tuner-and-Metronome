

import { NOTE_NAMES_SHARP } from './data';
import type { Scale, TuningSettings, PianoSoundType } from '../types';

/**
 * A comprehensive audio engine for real-time sitar synthesis.
 * Manages AudioContext, master effects chain, and individual string synthesizers.
 */
export class AudioEngine {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private reverb: SimpleReverb | null = null;
    private jawari: JawariEffect | null = null;
    private sympatheticResonator: SympatheticResonator | null = null;
    private drone: Drone | null = null;
    private strings: SitarString[] = [];
    private tuning: number[] = [];

    async init() {
        if (this.audioContext) return;
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        // Create master effects chain
        this.masterGain = this.audioContext.createGain();
        this.reverb = new SimpleReverb(this.audioContext);
        this.jawari = new JawariEffect(this.audioContext);
        this.sympatheticResonator = new SympatheticResonator(this.audioContext);
        this.drone = new Drone(this.audioContext);
        
        // Connect: Jawari -> Sympathetic -> Reverb -> Master Gain
        this.jawari.connect(this.sympatheticResonator.getInput());
        this.sympatheticResonator.connect(this.reverb.getInput());
        this.reverb.connect(this.masterGain);
        this.drone.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
    }

    setTuning(tuningMidi: number[]) {
        if (!this.audioContext) return;
        this.tuning = tuningMidi;
        this.strings.forEach(s => s.stop()); // Stop old strings
        this.strings = tuningMidi.map(midi => {
            const freq = 440 * Math.pow(2, (midi - 69) / 12);
            const str = new SitarString(this.audioContext!, freq);
            str.connect(this.jawari!.getInput());
            return str;
        });
        this.drone?.setTonic(tuningMidi[0]);
    }

    pluck(stringIndex: number, noteOffset: number, scaleInfo: { scale: Scale, tonicMidi: number }) {
        const str = this.strings[stringIndex];
        if (str) {
            const pitch = this.calculatePitch(stringIndex, noteOffset, scaleInfo);
            str.pluck(0.8, pitch);
            this.sympatheticResonator?.setNotes(scaleInfo.scale.intervals.map(i => scaleInfo.tonicMidi + i));
            this.sympatheticResonator?.trigger();
            return { pitch };
        }
        return null;
    }

    updatePitch(stringIndex: number, noteOffset: number, scaleInfo: { scale: Scale, tonicMidi: number }) {
        const str = this.strings[stringIndex];
        if (str) {
            const pitch = this.calculatePitch(stringIndex, noteOffset, scaleInfo);
            str.setFrequency(pitch);
            return pitch;
        }
        return 0;
    }
    
    release(stringIndex: number) {
        this.strings[stringIndex]?.release();
    }
    
    setJawari(amount: number) { this.jawari?.setAmount(amount); }
    setReverb(amount: number) { this.reverb?.setAmount(amount); }
    setBrightness(amount: number) { this.strings.forEach(s => s.setBrightness(amount)); }

    private calculatePitch(stringIndex: number, noteOffset: number, { scale, tonicMidi }: { scale: Scale, tonicMidi: number }): number {
        const baseMidi = this.tuning[stringIndex];
        const semitonesOffset = noteOffset * 12; // One octave range across the screen
        const targetMidi = baseMidi + semitonesOffset;
        
        // Scale snapping
        const octave = Math.floor((targetMidi - tonicMidi) / 12);
        const noteInOctave = (targetMidi - tonicMidi) % 12;
        
        let closestInterval = scale.intervals[0];
        let smallestDist = Infinity;
        
        scale.intervals.forEach(interval => {
            const dist = Math.abs(noteInOctave - interval);
            if (dist < smallestDist) {
                smallestDist = dist;
                closestInterval = interval;
            }
             // Check wrap around
            const wrapDist = Math.abs(noteInOctave - (interval + 12));
             if (wrapDist < smallestDist) {
                smallestDist = wrapDist;
                closestInterval = interval + 12;
            }
        });

        const snappedMidi = tonicMidi + octave * 12 + closestInterval;
        return 440 * Math.pow(2, (snappedMidi - 69) / 12);
    }
}

/**
 * Implements a single Sitar string using Karplus-Strong physical modeling.
 */
class SitarString {
    private readonly ctx: AudioContext;
    private readonly noise: AudioBufferSourceNode;
    private readonly delay: DelayNode;
    private readonly filter: BiquadFilterNode;
    private readonly gain: GainNode;
    private readonly panner: StereoPannerNode;
    public baseFrequency: number;

    constructor(ctx: AudioContext, frequency: number) {
        this.ctx = ctx;
        this.baseFrequency = frequency;
        
        // Create noise burst for pluck
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        this.noise = ctx.createBufferSource();
        this.noise.buffer = noiseBuffer;
        this.noise.loop = true;

        this.delay = ctx.createDelay(1.0);
        this.delay.delayTime.value = 1 / frequency;

        this.filter = ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.Q.value = 0;
        this.setBrightness(0.6); // Default brightness
        
        this.gain = ctx.createGain();
        this.gain.gain.value = 0.98; // Feedback gain
        
        this.panner = ctx.createStereoPanner();
        this.panner.pan.value = Math.random() * 0.6 - 0.3;

        // Feedback loop for Karplus-Strong
        this.noise.connect(this.delay);
        this.delay.connect(this.filter);
        this.filter.connect(this.gain);
        this.gain.connect(this.delay); // feedback
        
        this.delay.connect(this.panner);
    }
    
    connect(destination: AudioNode) {
        this.panner.connect(destination);
    }

    pluck(velocity: number, frequency: number) {
        const now = this.ctx.currentTime;
        this.setFrequency(frequency);
        
        const pluckGain = this.ctx.createGain();
        pluckGain.gain.setValueAtTime(velocity, now);
        pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        this.noise.disconnect();
        this.noise.connect(pluckGain);
        pluckGain.connect(this.delay);
    }

    setFrequency(freq: number) {
        this.delay.delayTime.setTargetAtTime(1 / freq, this.ctx.currentTime, 0.01);
    }

    setBrightness(amount: number) { // 0 to 1
        const freq = 500 + amount * 8000;
        this.filter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.02);
    }

    release() {
        // This would be implemented for long releases, but not needed for this model
    }

    stop() {
        this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
}

// --- Effects Components ---

class JawariEffect {
    private readonly ctx: AudioContext;
    private readonly input: GainNode;
    private readonly shaper: WaveShaperNode;
    private readonly filter: BiquadFilterNode;
    private readonly mix: GainNode;
    
    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.shaper = ctx.createWaveShaper();
        this.filter = ctx.createBiquadFilter();
        this.mix = ctx.createGain();
        
        const curve = new Float32Array(256);
        for(let i=0; i<256; i++) {
            const x = (i / 128) - 1;
            curve[i] = Math.tanh(x * 2.5);
        }
        this.shaper.curve = curve;
        
        this.filter.type = 'highshelf';
        this.filter.frequency.value = 3000;
        this.filter.gain.value = 15;

        this.input.connect(this.shaper);
        this.shaper.connect(this.filter);
        this.filter.connect(this.mix);
    }
    
    getInput() { return this.input; }
    connect(dest: AudioNode) { this.mix.connect(dest); }
    setAmount(amount: number) { this.mix.gain.setTargetAtTime(amount * 0.3, this.ctx.currentTime, 0.05); }
}

class SympatheticResonator {
    private readonly ctx: AudioContext;
    private readonly input: GainNode;
    private readonly output: GainNode;
    private readonly filters: BiquadFilterNode[] = [];
    
    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();
        this.input.gain.value = 0.4;
        
        for (let i = 0; i < 12; i++) {
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.Q.value = 50;
            this.input.connect(filter);
            filter.connect(this.output);
            this.filters.push(filter);
        }
    }
    
    getInput() { return this.input; }
    connect(dest: AudioNode) { this.output.connect(dest); }
    
    setNotes(midiNotes: number[]) {
        this.filters.forEach((filter, i) => {
            if (i < midiNotes.length) {
                const freq = 440 * Math.pow(2, (midiNotes[i] - 69) / 12);
                filter.frequency.value = freq;
            }
        });
    }

    trigger() {
        const now = this.ctx.currentTime;
        this.output.gain.cancelScheduledValues(now);
        this.output.gain.setValueAtTime(0.5, now);
        this.output.gain.setTargetAtTime(0, now, 2.5);
    }
}

class SimpleReverb {
     private readonly ctx: AudioContext;
    private readonly input: GainNode;
    private readonly output: GainNode;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // Create a simple reverb network
        const delay1 = ctx.createDelay(0.47);
        const delay2 = ctx.createDelay(0.31);
        const feedback1 = ctx.createGain();
        const feedback2 = ctx.createGain();

        feedback1.gain.value = 0.4;
        feedback2.gain.value = 0.5;

        this.input.connect(delay1);
        this.input.connect(delay2);
        delay1.connect(feedback1);
        delay2.connect(feedback2);
        feedback1.connect(delay2);
        feedback2.connect(delay1);
        
        delay1.connect(this.output);
        delay2.connect(this.output);
    }

    getInput() { return this.input; }
    connect(dest: AudioNode) { this.output.connect(dest); }
    setAmount(amount: number) { this.output.gain.setTargetAtTime(amount * 0.6, this.ctx.currentTime, 0.1); }
}


class Drone {
    private readonly ctx: AudioContext;
    private readonly masterGain: GainNode;
    private osc1: OscillatorNode | null = null;
    private osc2: OscillatorNode | null = null;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = 0;
    }
    
    connect(dest: AudioNode) { this.masterGain.connect(dest); }

    setTonic(tonicMidi: number) {
        this.stop();
        const tonicFreq = 440 * Math.pow(2, ((tonicMidi - 12) - 69) / 12); // One octave down
        const fifthFreq = tonicFreq * 1.5;
        
        this.osc1 = this.ctx.createOscillator();
        this.osc1.type = 'sawtooth';
        this.osc1.frequency.value = tonicFreq;
        const gain1 = this.ctx.createGain();
        gain1.gain.value = 0.08;
        this.osc1.connect(gain1).connect(this.masterGain);
        
        this.osc2 = this.ctx.createOscillator();
        this.osc2.type = 'sawtooth';
        this.osc2.frequency.value = fifthFreq;
        const gain2 = this.ctx.createGain();
        gain2.gain.value = 0.05;
        this.osc2.connect(gain2).connect(this.masterGain);
        
        this.osc1.start();
        this.osc2.start();
        this.masterGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 2.0);
    }

    stop() {
        if(this.osc1) this.osc1.stop();
        if(this.osc2) this.osc2.stop();
    }
}


// --- Generic Audio Functions ---
let audioContext: AudioContext;

// --- New Advanced Synthesis Engine ---

type OscillatorPatch = {
    type: OscillatorType;
    harmonic: number; // 1 for fundamental, 2 for octave up, etc.
    detune?: number; // in cents
    gain: number;
};

type ADSRPatch = {
    attack: number; // seconds
    decay: number; // seconds
    sustain: number; // level 0-1
    release: number; // seconds
};

type SoundPatch = {
    oscillators: OscillatorPatch[];
    adsr: ADSRPatch;
};

const SOUND_PATCHES: Record<PianoSoundType, SoundPatch> = {
    'Parlor / Living Room Grand': {
        oscillators: [{ type: 'triangle', harmonic: 1, gain: 0.7 }, { type: 'sine', harmonic: 2, gain: 0.3 }],
        adsr: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.3 },
    },
    'Concert Grand': {
        oscillators: [{ type: 'triangle', harmonic: 1, gain: 0.7 }, { type: 'sine', harmonic: 2, gain: 0.35 }, { type: 'sine', harmonic: 3, gain: 0.2 }],
        adsr: { attack: 0.015, decay: 0.4, sustain: 0.65, release: 0.5 },
    },
    'Honky Tonk / Bar Room Piano': {
        oscillators: [{ type: 'square', harmonic: 1, gain: 0.5, detune: -5 }, { type: 'square', harmonic: 1, gain: 0.5, detune: 5 }],
        adsr: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.2 },
    },
    'Classic Electric Piano': {
        oscillators: [{ type: 'sine', harmonic: 1, gain: 1 }, { type: 'sine', harmonic: 2, gain: 0.2 }],
        adsr: { attack: 0.02, decay: 0.5, sustain: 0.5, release: 0.4 },
    },
    'Wurly': {
        oscillators: [{ type: 'sawtooth', harmonic: 1, gain: 0.6 }, { type: 'sine', harmonic: 1, gain: 0.4 }],
        adsr: { attack: 0.01, decay: 0.4, sustain: 0.6, release: 0.3 },
    },
    'FM Electric Piano': {
        oscillators: [{ type: 'sine', harmonic: 1, gain: 1 }, { type: 'sine', harmonic: 1.414, gain: 0.5 }, { type: 'sine', harmonic: 2, gain: 0.3 }],
        adsr: { attack: 0.01, decay: 0.8, sustain: 0.3, release: 0.5 },
    },
    'Synth Pad': {
        oscillators: [{ type: 'sawtooth', harmonic: 1, detune: -7, gain: 0.5 }, { type: 'sawtooth', harmonic: 1, detune: 7, gain: 0.5 }],
        adsr: { attack: 0.5, decay: 1.0, sustain: 0.8, release: 2.0 },
    },
    'Harpsichord': {
        oscillators: [{ type: 'sawtooth', harmonic: 1, gain: 0.8 }, { type: 'square', harmonic: 2, gain: 0.2 }],
        adsr: { attack: 0.005, decay: 0.3, sustain: 0.0, release: 0.2 },
    },
    'Celesta': {
        oscillators: [{ type: 'triangle', harmonic: 1, gain: 0.7 }, { type: 'sine', harmonic: 2, gain: 0.3 }],
        adsr: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
    },
    'Sitar': {
        oscillators: [{ type: 'sawtooth', harmonic: 1, gain: 1 }],
        adsr: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 1.0 },
    },
    'sine': {
        oscillators: [{ type: 'sine', harmonic: 1, gain: 1 }],
        adsr: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 },
    }
};

interface ActiveNote {
    oscillators: OscillatorNode[];
    masterGain: GainNode;
    patch: SoundPatch;
    cleanupTimer?: number;
}
const activeNotes = new Map<string, ActiveNote>();


const getAudioContext = () => {
    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

export const playNote = (frequency: number, duration: number = 0.2) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = frequency;
    osc.type = 'sine';

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.1);
};

export const startSustainedNote = (frequency: number, soundType: PianoSoundType, noteId: string) => {
    // If note is already playing, stop it cleanly before re-triggering attack
    if (activeNotes.has(noteId)) {
        const existingNote = activeNotes.get(noteId)!;
        const now = getAudioContext().currentTime;

        // Clean up old note
        if (existingNote.cleanupTimer) {
            clearTimeout(existingNote.cleanupTimer);
        }
        existingNote.masterGain.gain.cancelScheduledValues(now);
        existingNote.masterGain.gain.setValueAtTime(0, now); // Stop sound immediately
        existingNote.oscillators.forEach(osc => {
            try { osc.stop(now); } catch(e) { /* might already be stopped */ }
            osc.disconnect();
        });
        existingNote.masterGain.disconnect();
    }

    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const patch = SOUND_PATCHES[soundType] || SOUND_PATCHES['sine'];

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    
    const oscillators = patch.oscillators.map(oscPatch => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = oscPatch.type;
        osc.frequency.value = frequency * oscPatch.harmonic;
        if (oscPatch.detune) osc.detune.value = oscPatch.detune;
        gain.gain.value = oscPatch.gain;

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        return osc;
    });

    // Apply ADSR envelope
    const { attack, decay, sustain } = patch.adsr;
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.5, now + attack); // Peak volume of 0.5
    masterGain.gain.setTargetAtTime(0.5 * sustain, now + attack, decay / 4); // Exponential decay

    activeNotes.set(noteId, { oscillators, masterGain, patch });
};

export const stopSustainedNoteWithCustomRelease = (noteId: string, sustainDuration: number, releaseDuration: number) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const note = activeNotes.get(noteId);

    if (note) {
        // Cancel any pending gain changes and previous cleanup timers
        note.masterGain.gain.cancelScheduledValues(now);
        if (note.cleanupTimer) {
            clearTimeout(note.cleanupTimer);
        }

        const currentGain = note.masterGain.gain.value;

        // Schedule the new release envelope
        note.masterGain.gain.setValueAtTime(currentGain, now); // Pin current gain
        note.masterGain.gain.setTargetAtTime(0, now + sustainDuration, releaseDuration > 0 ? releaseDuration / 5 : 0.01); // Exponential release

        // Schedule cleanup
        const totalDurationMs = (sustainDuration + releaseDuration) * 1000;
        note.cleanupTimer = window.setTimeout(() => {
            if (activeNotes.get(noteId) === note) { // Check if it hasn't been re-triggered
                note.oscillators.forEach(osc => {
                    try { osc.stop(); } catch (e) { /* already stopped */ }
                    osc.disconnect();
                });
                note.masterGain.disconnect();
                activeNotes.delete(noteId);
            }
        }, totalDurationMs + 200); // Add a small buffer
    }
};

export const stopSustainedNote = (noteId?: string, options?: { exclude?: Set<string> }) => {
    if (noteId) {
        const note = activeNotes.get(noteId);
        if (note) {
            stopSustainedNoteWithCustomRelease(noteId, 0, note.patch.adsr.release);
        }
    } else { // stop all
        activeNotes.forEach((note, id) => {
            if (options?.exclude?.has(id)) return;
            stopSustainedNoteWithCustomRelease(id, 0, note.patch.adsr.release);
        });
    }
};

export const updateSustainedNotePitch = (noteId: string, bendCents: number) => {
    const note = activeNotes.get(noteId);
    if (note) {
        const ctx = getAudioContext();
        note.oscillators.forEach(osc => {
            const originalFreq = osc.frequency.defaultValue;
            const newFreq = originalFreq * Math.pow(2, bendCents / 1200);
            osc.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.01);
        });
    }
};

export const updateSustainedNoteExpression = (noteId: string, pressure: number) => {
    const note = activeNotes.get(noteId);
    if (note) {
        const ctx = getAudioContext();
        const { sustain } = note.patch.adsr;
        const targetGain = pressure * 0.5 * sustain; // Scale pressure relative to sustain level
        note.masterGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.02);
    }
};

let appDrone: { osc1: OscillatorNode, osc2: OscillatorNode, masterGain: GainNode } | null = null;
export const startDrone = () => {
    stopDrone();
    const ctx = getAudioContext();
    const tonicFreq = 261.63; // C4
    const fifthFreq = tonicFreq * 1.5;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = tonicFreq / 2;
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.05;
    osc1.connect(gain1).connect(masterGain);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.value = fifthFreq / 2;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.03;
    osc2.connect(gain2).connect(masterGain);

    osc1.start();
    osc2.start();
    masterGain.gain.setTargetAtTime(1.0, ctx.currentTime, 2.0);
    appDrone = { osc1, osc2, masterGain };
};

export const stopDrone = () => {
    if (appDrone) {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        appDrone.masterGain.gain.setTargetAtTime(0, now, 1.0);
        appDrone.osc1.stop(now + 1.1);
        appDrone.osc2.stop(now + 1.1);
        appDrone = null;
    }
};