
import { GoogleGenAI, Type } from "@google/genai";
import type { TuningSettings, ChordDetails, ChordNote } from '../types';
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from '../constants';
import { A4_MIDI } from './pitch';

const PEAK_THRESHOLD_DB = -60; // dB level to consider a frequency peak significant
const MIN_PEAK_DISTANCE_HZ = 15; // Minimum separation between peaks

/**
 * Processes raw FFT spectrum data to find significant frequency peaks.
 * @param spectrum The raw Float32Array from the AnalyserNode.
 * @param sampleRate The sample rate of the audio context.
 * @returns An array of objects with frequency and amplitude for each significant peak.
 */
function findSignificantPeaks(spectrum: Float32Array, sampleRate: number): { freq: number; amp: number }[] {
    const fftSize = spectrum.length * 2;
    const peaks: { freq: number; amp: number, index: number }[] = [];

    // Find all local maxima above the threshold
    for (let i = 1; i < spectrum.length - 1; i++) {
        const amp = spectrum[i];
        if (amp > PEAK_THRESHOLD_DB && amp > spectrum[i - 1] && amp > spectrum[i + 1]) {
            peaks.push({
                freq: i * (sampleRate / fftSize),
                amp: amp,
                index: i
            });
        }
    }

    // Sort by amplitude (loudest first)
    peaks.sort((a, b) => b.amp - a.amp);

    // Filter out peaks that are too close to a louder peak (harmonics/noise)
    const significantPeaks: { freq: number; amp: number }[] = [];
    for (const peak of peaks) {
        if (significantPeaks.every(p => Math.abs(p.freq - peak.freq) > MIN_PEAK_DISTANCE_HZ)) {
            significantPeaks.push({ freq: peak.freq, amp: peak.amp });
        }
    }
    
    // Return top 15 most significant peaks, sorted by frequency
    return significantPeaks.slice(0, 15).sort((a,b) => a.freq - b.freq);
}


export const analyzeChordFromSpectrum = async (
    spectrum: Float32Array, 
    sampleRate: number, 
    settings: TuningSettings
): Promise<ChordDetails | null> => {
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const peaks = findSignificantPeaks(spectrum, sampleRate);

    if (peaks.length < 2) {
        return null;
    }

    const peakData = peaks.map(p => ({ freq: Math.round(p.freq), amp: Math.round(p.amp) }));
    
    const prompt = `You are a music theory expert. Based on the following prominent musical frequencies and their relative amplitudes (in dB), identify the musical chord being played. The reference tuning is A4=${settings.a4} Hz. Determine the most likely chord name (e.g., "G Major", "Am7"). List the individual notes found, including their octave, and identify the bass note (the lowest frequency note). Respond only with the JSON object.

Frequency Peaks:
${JSON.stringify(peakData)}
`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            chordName: {
                type: Type.STRING,
                description: 'The common name of the chord, e.g., "C Major" or "Am7".',
            },
            notes: {
                type: Type.ARRAY,
                description: 'An array of the individual notes detected in the chord.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: {
                            type: Type.STRING,
                            description: 'The note name (e.g., "C", "F#").',
                        },
                        octave: {
                            type: Type.INTEGER,
                            description: 'The octave number of the note.',
                        },
                        frequency: {
                            type: Type.NUMBER,
                            description: 'The detected frequency of the note in Hz.',
                        },
                        isBassNote: {
                             type: Type.BOOLEAN,
                             description: 'True if this is the lowest note in the chord.'
                        }
                    },
                    required: ["name", "octave", "frequency", "isBassNote"]
                },
            },
        },
        required: ["chordName", "notes"],
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { chordName: string, notes: Omit<ChordNote, 'cents'>[] };
        
        // Post-process to add cents calculation
        const processedResult: ChordDetails = {
            ...result,
            notes: result.notes.map(note => {
                const noteFloat = A4_MIDI + 12 * Math.log2(note.frequency / settings.a4);
                const noteNumber = Math.round(noteFloat);
                const cents = 100 * (noteFloat - noteNumber);

                return {
                    ...note,
                    cents,
                };
            }),
        };

        return processedResult;
    } catch (e) {
        console.error("Error parsing Gemini response:", e);
        throw new Error("The AI could not identify a valid chord from the audio.");
    }
};

/**
 * Gets a music theory explanation from the AI.
 * @param query The user's question about music theory.
 * @returns A string containing the formatted explanation.
 */
export const getTheoryExplanation = async (query: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `You are an expert music theory teacher. Your tone is encouraging, clear, and concise.
Explain the following concept. Use Markdown for formatting:
- Use headings (#, ##) for structure.
- Use bold (**term**) for key terms.
- Use lists (-) for examples or steps.
- Keep the explanation focused and easy to understand for a musician.

Concept: "${query}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text.trim();
    } catch (e) {
        console.error("Error getting theory explanation:", e);
        throw new Error("The AI failed to provide an explanation. Please try again.");
    }
};