import type { NoteDetails, TuningSettings } from '../types';
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT, NOTATION_MAPS } from './musicConstants';

export const C4_MIDI = 60;
export const A4_MIDI = 69;

/**
 * Applies a Hann window to the buffer. This function modifies the buffer in place.
 * @param buffer The input audio buffer.
 */
export function applyHannWindow(buffer: Float32Array): void {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / (buffer.length - 1)));
  }
}

/**
 * Performs pitch detection using the YIN algorithm for improved accuracy and stability.
 * @param buffer The audio buffer (should be windowed).
 * @param sampleRate The sample rate of the audio.
 * @param minFreq The minimum frequency to detect.
 * @param maxFreq The maximum frequency to detect.
 * @returns The detected fundamental frequency in Hz and a confidence score.
 */
export function findPitchFromAutocorrelation(buffer: Float32Array, sampleRate: number, minFreq: number, maxFreq: number): { frequency: number, confidence: number } {
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.ceil(sampleRate / minFreq);
  const bufferSize = buffer.length;

  // 1. Difference function
  const diffs = new Float32Array(maxPeriod);
  for (let lag = 0; lag < maxPeriod; lag++) {
    let sum = 0;
    for (let i = 0; i < bufferSize - lag; i++) {
      const diff = buffer[i] - buffer[i + lag];
      sum += diff * diff;
    }
    diffs[lag] = sum;
  }

  // 2. Cumulative mean normalized difference
  const yinBuffer = new Float32Array(maxPeriod);
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let lag = 1; lag < maxPeriod; lag++) {
    runningSum += diffs[lag];
    if (runningSum === 0) {
      yinBuffer[lag] = 1;
    } else {
      yinBuffer[lag] = diffs[lag] * lag / runningSum;
    }
  }

  // 3. Absolute thresholding to find the fundamental period
  const threshold = 0.12; // Lowered threshold for more sensitivity to faint/noisy signals
  let bestPeriod = -1;
  let minDiff = 1;

  for (let lag = minPeriod; lag < maxPeriod; lag++) {
    if (yinBuffer[lag] < threshold) {
      // Find the local minimum in this dip
      while (lag < maxPeriod - 1 && yinBuffer[lag + 1] < yinBuffer[lag]) {
        lag++;
      }
      bestPeriod = lag;
      minDiff = yinBuffer[lag];
      break; // Found the first significant dip, assume it's the fundamental
    }
  }

  // Fallback: if no dip below threshold, find the absolute minimum
  if (bestPeriod === -1) {
    for (let lag = minPeriod; lag < maxPeriod; lag++) {
      if (yinBuffer[lag] < minDiff) {
        minDiff = yinBuffer[lag];
        bestPeriod = lag;
      }
    }
  }

  // 4. Parabolic interpolation for sub-sample accuracy
  let finalPeriod = bestPeriod;
  if (bestPeriod > 0 && bestPeriod < yinBuffer.length - 1) {
    const y1 = yinBuffer[bestPeriod - 1];
    const y2 = yinBuffer[bestPeriod];
    const y3 = yinBuffer[bestPeriod + 1];
    const shift = (y1 - y3) / (2 * (y1 - 2 * y2 + y3));
    if (!isNaN(shift)) {
      finalPeriod += shift;
    }
  }

  // 5. Calculate confidence score from the depth of the dip
  const confidence = 1.0 - minDiff;
  
  if (bestPeriod === -1) {
    return { frequency: -1, confidence: 0 };
  }

  return { frequency: sampleRate / finalPeriod, confidence: Math.max(0, confidence) };
}


/**
 * Finds the fundamental frequency from FFT data using the Harmonic Product Spectrum (HPS) method.
 * HPS is effective at finding the fundamental frequency even when overtones are stronger.
 * @param freqData The FFT frequency data (in dB).
 * @param sampleRate The sample rate.
 * @returns The frequency of the fundamental pitch in Hz and a confidence score.
 */
export function findPitchFromHPS(freqData: Float32Array, sampleRate: number): { frequency: number, confidence: number } {
  const fftSize = freqData.length * 2;
  const maxHarmonics = 5; // How many harmonics to check. 5 is a good number.
  const searchRange = Math.floor(freqData.length / maxHarmonics);

  // Convert dB to linear amplitude for processing, as HPS works with magnitudes.
  const spectrum = new Float32Array(freqData.length);
  for (let i = 0; i < freqData.length; i++) {
    spectrum[i] = Math.pow(10, freqData[i] / 20);
  }

  const productSpectrum = new Float32Array(searchRange);

  // Calculate the product spectrum
  for (let i = 1; i < searchRange; i++) { // Start at 1 to ignore DC offset
    let product = spectrum[i];
    for (let j = 2; j <= maxHarmonics; j++) {
      if (i * j < spectrum.length) {
        product *= spectrum[i * j];
      }
    }
    productSpectrum[i] = product;
  }

  let maxVal = -Infinity;
  let maxIdx = -1;

  // Find the peak in the product spectrum
  for (let i = 1; i < searchRange; i++) {
    if (productSpectrum[i] > maxVal) {
      maxVal = productSpectrum[i];
      maxIdx = i;
    }
  }

  // A heuristic for confidence based on the dB level of the detected fundamental peak.
  const originalPeakDb = freqData[maxIdx] || -100; // Use -100 as silence
  const normalizedMaxVal = (originalPeakDb + 100) / 100;
  const confidence = Math.max(0, Math.min(1, normalizedMaxVal));

  const frequency = maxIdx * (sampleRate / fftSize);
  return { frequency, confidence };
}


/**
 * Converts a frequency in Hz to note details.
 * @param frequency The frequency to convert.
 * @param settings The current tuning settings.
 * @returns A NoteDetails object or null if frequency is invalid.
 */
export function frequencyToNoteDetails(frequency: number, settings: TuningSettings): NoteDetails | null {
  if (frequency <= 0) return null;

  // Handle manual Hz tuning mode
  if (settings.preset === 'Hz (Manual)') {
    const targetFrequency = settings.targetFrequency || 440;
    // The formula for cents difference between two frequencies is 1200 * log2(f2/f1)
    const cents = 1200 * Math.log2(frequency / targetFrequency);
    return {
      name: targetFrequency.toFixed(1),
      octave: 'Hz',
      frequency,
      cents: isNaN(cents) ? 0 : cents,
    };
  }

  const { a4, useSharps, transposition, notationSystem } = settings;
  const noteNames = useSharps ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;
  const displayNames = NOTATION_MAPS[notationSystem] || noteNames;

  const noteFloat = A4_MIDI + 12 * Math.log2(frequency / a4);
  const noteNumber = Math.round(noteFloat);
  const cents = 100 * (noteFloat - noteNumber);

  if (isNaN(noteNumber) || !isFinite(noteNumber)) return null;

  // Apply transposition to the MIDI note number for display
  // e.g., for a B♭ instrument (+2), if we hear a B♭ (MIDI 70), we display a C (MIDI 72)
  const transposedNoteNumber = noteNumber + transposition;

  const octave = Math.floor(transposedNoteNumber / 12) - 1;
  const noteIndex = (transposedNoteNumber % 12 + 12) % 12;
  
  if (noteIndex < 0 || noteIndex >= displayNames.length) return null;
  const name = displayNames[noteIndex];
  
  return { name, octave, frequency, cents };
}

/**
 * Converts a note name and octave to its frequency in Hz.
 * @param noteName The name of the note (e.g., "A", "C#", "Do").
 * @param octave The octave of the note.
 * @param settings The current tuning settings.
 * @returns The frequency in Hz, or -1 if the note is invalid.
 */
export function noteToFrequency(noteName: string, octave: number, settings: TuningSettings): number {
  const { a4, transposition = 0, notationSystem = 'English' } = settings;
  const displayNames = NOTATION_MAPS[notationSystem];
  
  let noteIndex = -1;

  // Primary lookup in the current notation system
  noteIndex = displayNames.indexOf(noteName);

  // Fallback 1: if not found, check if an English name was passed.
  // This makes components like the Piano keyboard work regardless of current notation.
  if (noteIndex === -1) {
    noteIndex = NOTE_NAMES_SHARP.indexOf(noteName);
  }
  if (noteIndex === -1) {
    noteIndex = NOTE_NAMES_FLAT.indexOf(noteName);
  }
  
  // Fallback 2: The original `.includes` check, as a last resort for complex names like "Di/Ra" if "Di" was passed.
  if (noteIndex === -1) {
    for (let i = 0; i < displayNames.length; i++) {
        if (displayNames[i].includes(noteName)) {
            noteIndex = i;
            break;
        }
    }
  }

  if (noteIndex === -1) {
    return -1; // Note not found in any system
  }

  // Calculate the MIDI number of the *displayed* note.
  const displayedMidiNumber = (octave + 1) * 12 + noteIndex;

  // To get the target frequency, we need the *actual* sounding MIDI number.
  // We subtract the transposition to find the concert pitch.
  const actualMidiNumber = displayedMidiNumber - transposition;
  
  const frequency = a4 * Math.pow(2, (actualMidiNumber - A4_MIDI) / 12);
  
  return frequency;
}